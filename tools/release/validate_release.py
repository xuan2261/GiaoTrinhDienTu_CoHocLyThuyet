"""Validate staged or ZIP release artifacts, hashes, inventory and ZIP metadata."""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import stat
import sys
import tempfile
import zipfile
from pathlib import Path

from release_common import GENERATED_FILES, SHA256_RE, epoch_zip_datetime, load_json, logical_path, sha256_bytes, sha256_file

ROOT = Path(__file__).resolve().parents[2]
TOP_KEYS = {"schemaVersion", "releaseVersion", "buildEpoch", "launchPath", "builder", "policy", "provenance", "exclusions", "files", "payloadSha256"}


def fail(message: str):
    raise ValueError(message)


def parse_checksums(path: Path) -> dict[str, str]:
    records = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.fullmatch(r"([a-f0-9]{64})  (.+)", line)
        if not match:
            fail("invalid SHA256SUMS format")
        relative = logical_path(match.group(2))
        if relative in records:
            fail(f"duplicate checksum path: {relative}")
        records[relative] = match.group(1)
    return records


def validate_manifest(manifest: dict) -> None:
    if set(manifest) != TOP_KEYS or manifest.get("schemaVersion") != 2:
        fail("invalid release manifest shape or schemaVersion")
    if not isinstance(manifest["releaseVersion"], str) or not manifest["releaseVersion"]:
        fail("invalid release version")
    if not isinstance(manifest["buildEpoch"], int):
        fail("invalid build epoch")
    logical_path(manifest["launchPath"])
    if manifest["builder"] != {"name": "tools/release/release.py", "version": 1}:
        fail("invalid release builder identity")
    if not SHA256_RE.fullmatch(str(manifest["policy"].get("sha256", ""))):
        fail("invalid release policy hash")
    records = manifest["files"]
    if not isinstance(records, list) or not records:
        fail("release manifest files must be non-empty")
    paths = []
    for record in records:
        if set(record) != {"path", "sizeBytes", "sha256"}:
            fail("invalid release file record")
        paths.append(logical_path(record["path"]))
        if not isinstance(record["sizeBytes"], int) or record["sizeBytes"] < 0 or not SHA256_RE.fullmatch(str(record["sha256"])):
            fail(f"invalid release file metadata: {record['path']}")
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        fail("release manifest file paths must be unique and sorted")
    expected_payload_hash = sha256_bytes(json.dumps(records, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))
    if manifest["payloadSha256"] != expected_payload_hash:
        fail("release payload manifest hash mismatch")


def validate_policy(manifest: dict, policy: dict, actual_paths: set[str], package_size: int | None = None) -> None:
    if manifest["launchPath"] != policy["launchPath"]:
        fail("release launch path violates policy")
    if not re.fullmatch(policy["versionPolicy"]["pattern"], manifest["releaseVersion"]):
        fail("release version violates policy")
    if manifest["buildEpoch"] < policy["epochPolicy"]["minimum"]:
        fail("release epoch violates policy")
    for required in policy["requiredPaths"]:
        if logical_path(required) not in actual_paths:
            fail(f"missing required release path: {required}")
    for exclusion in policy["exclusions"]:
        excluded = logical_path(exclusion["path"])
        if any(path == excluded or path.startswith(excluded + "/") for path in actual_paths):
            fail(f"excluded path present in release: {excluded}")
    if package_size is not None and package_size > policy["maximumPackageBytes"]:
        fail("release package exceeds maximumPackageBytes")


def validate_staging(staging: Path, policy: dict | None = None) -> dict:
    manifest_path = staging / "release-manifest.json"
    checksum_path = staging / "SHA256SUMS"
    notice_path = staging / "THIRD_PARTY_NOTICES.txt"
    if not (manifest_path.is_file() and checksum_path.is_file() and notice_path.is_file()):
        fail("release metadata files are incomplete")
    manifest = load_json(manifest_path)
    validate_manifest(manifest)
    records = {record["path"]: record for record in manifest["files"]}
    actual = {path.relative_to(staging).as_posix() for path in staging.rglob("*") if path.is_file()}
    if set(records) != actual - GENERATED_FILES:
        fail("release manifest inventory mismatch")
    for relative, record in records.items():
        target = staging / relative
        if target.stat().st_size != record["sizeBytes"] or sha256_file(target) != record["sha256"]:
            fail(f"checksum mismatch: {relative}")
    checksums = parse_checksums(checksum_path)
    expected_checksum_paths = actual - {"SHA256SUMS"}
    if set(checksums) != expected_checksum_paths:
        fail("SHA256SUMS inventory mismatch")
    for relative, expected in checksums.items():
        if sha256_file(staging / relative) != expected:
            fail(f"checksum mismatch: {relative}")
    if policy:
        validate_policy(manifest, policy, actual)
    return manifest


def validate_package(package: Path, policy: dict | None = None) -> tuple[dict, list[str]]:
    with zipfile.ZipFile(package) as archive:
        infos = archive.infolist()
        names = [logical_path(info.filename) for info in infos]
        if names != sorted(names) or len(names) != len(set(names)):
            fail("ZIP entries must be unique and sorted")
        if any(info.is_dir() for info in infos):
            fail("ZIP must contain files only")
        for info in infos:
            mode = info.external_attr >> 16
            if mode and not stat.S_ISREG(mode):
                fail(f"non-regular ZIP entry: {info.filename}")
        temp = Path(tempfile.mkdtemp(prefix="release-validate-"))
        try:
            archive.extractall(temp)
            manifest = validate_staging(temp, policy)
            expected_timestamp = epoch_zip_datetime(manifest["buildEpoch"])
            if any(info.date_time != expected_timestamp for info in infos):
                fail("ZIP timestamp differs from release epoch")
        finally:
            shutil.rmtree(temp, ignore_errors=True)
    if policy:
        validate_policy(manifest, policy, set(names), package.stat().st_size)
    return manifest, names


def main() -> None:
    parser = argparse.ArgumentParser()
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--package")
    target.add_argument("--staging")
    parser.add_argument("--policy")
    parser.add_argument("--list-json", action="store_true")
    args = parser.parse_args()
    policy = load_json(Path(args.policy).resolve()) if args.policy else None
    if args.package:
        manifest, names = validate_package(Path(args.package).resolve(), policy)
    else:
        manifest = validate_staging(Path(args.staging).resolve(), policy)
        names = sorted(path.relative_to(Path(args.staging).resolve()).as_posix() for path in Path(args.staging).resolve().rglob("*") if path.is_file())
    if args.list_json:
        print(json.dumps(names, ensure_ascii=False))
    else:
        print(f"release validation: PASS ({manifest['releaseVersion']}, {len(names)} files)")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError, zipfile.BadZipFile) as error:
        print(f"release validation failed: {error}", file=sys.stderr)
        raise SystemExit(1)
