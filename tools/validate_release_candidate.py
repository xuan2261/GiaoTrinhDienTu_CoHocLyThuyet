"""Validate the frozen standalone candidate and its derivative inventory."""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "release"))
from release_common import load_json  # noqa: E402
from validate_release import validate_package, validate_staging  # noqa: E402

CONTRACT = ROOT / "data" / "release-candidate.json"
POLICY = ROOT / "data" / "release-policy.json"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def resolve_root(relative: str) -> Path:
    if not isinstance(relative, str) or not relative or "\\" in relative:
        raise ValueError("candidate path must be a non-empty logical path")
    path = (ROOT / relative).resolve()
    if ROOT not in path.parents:
        raise ValueError("candidate path escapes repository root")
    return path


def validate(contract_path: Path = CONTRACT, expected_summary: Path | None = None) -> dict:
    contract = load_json(contract_path)
    required = {"schemaVersion", "status", "summaryPath", "releaseVersion", "buildEpoch", "packageSha256", "derivatives"}
    if set(contract) != required or contract["schemaVersion"] != 1 or contract["status"] != "candidate":
        raise ValueError("invalid release candidate contract")
    summary_path = resolve_root(contract["summaryPath"])
    if expected_summary is not None and summary_path != expected_summary.resolve():
        raise ValueError("release summary differs from candidate contract")
    summary = load_json(summary_path)
    if set(summary) != {"schemaVersion", "releaseVersion", "buildEpoch", "staging", "manifest", "package"} or summary["schemaVersion"] != 1:
        raise ValueError("invalid release summary")
    if summary["releaseVersion"] != contract["releaseVersion"] or summary["buildEpoch"] != contract["buildEpoch"]:
        raise ValueError("candidate version or epoch mismatch")
    base = summary_path.parent
    staging = (base / summary["staging"]["path"]).resolve()
    package = (base / summary["package"]["path"]).resolve()
    manifest_path = (base / summary["manifest"]["path"]).resolve()
    if any(base not in path.parents for path in (staging, package, manifest_path)):
        raise ValueError("release summary child path escapes candidate directory")
    policy = load_json(POLICY)
    staging_manifest = validate_staging(staging, policy)
    package_manifest, _ = validate_package(package, policy)
    if staging_manifest != package_manifest:
        raise ValueError("staging and ZIP manifests differ")
    if sha256(manifest_path) != summary["manifest"]["sha256"]:
        raise ValueError("release summary manifest hash mismatch")
    if package.stat().st_size != summary["package"]["sizeBytes"] or sha256(package) != summary["package"]["sha256"]:
        raise ValueError("release summary package metadata mismatch")
    if summary["package"]["sha256"] != contract["packageSha256"]:
        raise ValueError("candidate package hash mismatch")
    derivatives = []
    for item in contract["derivatives"]:
        if set(item) != {"path", "sha256"}:
            raise ValueError("invalid derivative record")
        path = resolve_root(item["path"])
        if not path.is_file() or sha256(path) != item["sha256"]:
            raise ValueError("derivative artifact hash mismatch")
        derivatives.append({"path": item["path"], "sha256": item["sha256"], "sizeBytes": path.stat().st_size})
    return {"schemaVersion": 1, "status": "verified", "summaryPath": contract["summaryPath"], "summary": summary, "verified": True, "derivatives": derivatives}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--contract", default=str(CONTRACT))
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    inventory = validate(Path(args.contract).resolve())
    print(json.dumps(inventory, ensure_ascii=False, sort_keys=True) if args.json else f"release candidate: PASS ({inventory['summary']['releaseVersion']})")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError, zipfile.BadZipFile) as error:
        print(f"release candidate: FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
