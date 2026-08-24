"""Build release metadata from the canonical content manifest and staged payload."""
from __future__ import annotations

from pathlib import Path

from release_common import canonical_json, load_json, sha256_bytes, sha256_file

SCHEMA_VERSION = 2
BUILDER = {"name": "tools/release/release.py", "version": 1}


def build_manifest(root: Path, policy_path: Path, policy: dict, staging: Path, files: list[dict], version: str, epoch: int) -> dict:
    content_path = root / "data" / "content-manifest.json"
    content = load_json(content_path)
    source = content["source"]
    docx_path = root / source["logicalPath"]
    if not docx_path.is_file() or sha256_file(docx_path) != source["sha256"]:
        raise ValueError("canonical DOCX provenance hash mismatch")
    provenance = {
        "contentManifest": {
            "path": "data/content-manifest.json",
            "sha256": sha256_file(content_path),
            "contentHash": content["contentHash"],
        },
        "sourceDocx": {"path": source["logicalPath"], "sha256": source["sha256"]},
        "thirdParty": policy["thirdParty"],
    }
    if "pdf" in source:
        pdf_path = root / source["pdf"]["logicalPath"]
        if not pdf_path.is_file() or sha256_file(pdf_path) != source["pdf"]["sha256"]:
            raise ValueError("canonical PDF provenance hash mismatch")
        provenance["sourcePdf"] = {"path": source["pdf"]["logicalPath"], "sha256": source["pdf"]["sha256"]}
    manifest = {
        "schemaVersion": SCHEMA_VERSION,
        "releaseVersion": version,
        "buildEpoch": epoch,
        "launchPath": policy["launchPath"],
        "builder": BUILDER,
        "policy": {"path": policy_path.relative_to(root).as_posix() if policy_path.is_relative_to(root) else policy_path.name, "sha256": sha256_file(policy_path)},
        "provenance": provenance,
        "exclusions": policy["exclusions"],
        "files": files,
    }
    manifest["payloadSha256"] = sha256_bytes(canonical_json(files).encode("utf-8"))
    return manifest


def third_party_notices(policy: dict) -> str:
    lines = ["THIRD-PARTY SOFTWARE NOTICES", ""]
    for item in policy["thirdParty"]:
        lines.extend([
            f"{item['name']} {item['version']}",
            f"License: {item['license']}",
            f"Source: {item['source']}",
            "",
        ])
    lines.extend([
        "Full Apache-2.0 text for PDF.js is included at lib/pdfjs/LICENSE.",
        "Vendored MIT components retain their upstream license headers.",
        "",
    ])
    return "\n".join(lines)
