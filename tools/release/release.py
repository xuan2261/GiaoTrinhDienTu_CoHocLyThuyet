"""Build a clean, deterministic standalone textbook release."""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

from build_release_manifest import build_manifest, third_party_notices
from release_common import copy_payload, enumerate_ship_list, load_json, payload_records, sha256_file, write_json, write_zip
from validate_release import validate_package, validate_staging

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_POLICY = ROOT / "data" / "release-policy.json"


def validate_policy_shape(policy: dict) -> None:
    required = {"schemaVersion", "packageSlug", "launchPath", "maximumPackageBytes", "versionPolicy", "epochPolicy", "shipList", "requiredPaths", "exclusions", "thirdParty"}
    if set(policy) != required or policy["schemaVersion"] != 1:
        raise ValueError("invalid release policy shape or schemaVersion")
    if not isinstance(policy["shipList"], list) or not policy["shipList"]:
        raise ValueError("release shipList must be non-empty")
    for item in policy["shipList"]:
        if set(item) != {"path", "kind"} or item["kind"] not in {"file", "directory"}:
            raise ValueError("invalid release shipList entry")
    if not isinstance(policy["maximumPackageBytes"], int) or policy["maximumPackageBytes"] <= 0:
        raise ValueError("invalid maximumPackageBytes")


def run_preflight() -> None:
    command = [sys.executable, str(ROOT / "tools" / "validate_content_manifest.py")]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    if result.returncode:
        raise ValueError("content manifest preflight failed: " + (result.stderr or result.stdout).strip())


def write_checksums(staging: Path) -> None:
    paths = sorted(path for path in staging.rglob("*") if path.is_file() and path.name != "SHA256SUMS")
    lines = [f"{sha256_file(path)}  {path.relative_to(staging).as_posix()}" for path in paths]
    (staging / "SHA256SUMS").write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")


def build(output_dir: Path, policy_path: Path, version: str, epoch: int) -> dict:
    policy = load_json(policy_path)
    validate_policy_shape(policy)
    if not re.fullmatch(policy["versionPolicy"]["pattern"], version):
        raise ValueError("release version violates versionPolicy")
    if epoch < policy["epochPolicy"]["minimum"]:
        raise ValueError("release epoch violates epochPolicy")
    if output_dir.resolve() == ROOT.resolve():
        raise ValueError("output directory cannot be repository root")
    run_preflight()
    entries = enumerate_ship_list(ROOT, policy)
    output_dir = output_dir.resolve()
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)
    staging = output_dir / "package"
    copy_payload(entries, staging)
    files = payload_records(staging, entries)
    manifest = build_manifest(ROOT, policy_path, policy, staging, files, version, epoch)
    write_json(staging / "release-manifest.json", manifest)
    (staging / "THIRD_PARTY_NOTICES.txt").write_text(third_party_notices(policy), encoding="utf-8", newline="\n")
    write_checksums(staging)
    validate_staging(staging, policy)
    package_name = f"{policy['packageSlug']}-{version}.zip"
    package_path = output_dir / package_name
    write_zip(staging, package_path, epoch)
    validate_package(package_path, policy)
    summary = {
        "schemaVersion": 1,
        "releaseVersion": version,
        "buildEpoch": epoch,
        "staging": {"path": "package", "fileCount": len([path for path in staging.rglob('*') if path.is_file()])},
        "manifest": {"path": "package/release-manifest.json", "sha256": sha256_file(staging / "release-manifest.json")},
        "package": {"path": package_name, "sha256": sha256_file(package_path), "sizeBytes": package_path.stat().st_size},
    }
    write_json(output_dir / "release-summary.json", summary)
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--policy", default=str(DEFAULT_POLICY))
    parser.add_argument("--version", required=True)
    parser.add_argument("--epoch", type=int, default=os.environ.get("SOURCE_DATE_EPOCH"))
    args = parser.parse_args()
    if args.epoch is None:
        raise ValueError("--epoch or SOURCE_DATE_EPOCH is required for reproducible builds")
    summary = build(Path(args.output_dir), Path(args.policy).resolve(), args.version, args.epoch)
    print(json.dumps(summary, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"release build failed: {error}", file=sys.stderr)
        raise SystemExit(1)
