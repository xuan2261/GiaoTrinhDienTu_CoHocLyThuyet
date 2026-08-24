"""Build a deterministic IMS Common Cartridge 1.4 static webcontent package."""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import tempfile
import zipfile
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RELEASE_TOOLS = ROOT / "tools" / "release"
if str(RELEASE_TOOLS) not in sys.path:
    sys.path.insert(0, str(RELEASE_TOOLS))

from release_common import SHA256_RE, logical_path, sha256_file, write_json, write_zip
from validate_release import validate_package as validate_release_package

ADAPTER = {"name": "tools/lms/build_common_cartridge.py", "version": 1}
SCHEMA_VERSION = 1
DEFAULT_MAXIMUM_PACKAGE_BYTES = 128 * 1024 * 1024
CC_NAMESPACE = "http://www.imsglobal.org/xsd/imsccv1p4/imscp_v1p1"
CC_SCHEMA_LOCATION = (
    "http://www.imsglobal.org/xsd/imsccv1p4/imscp_v1p1 "
    "https://purl.imsglobal.org/spec/cc/v1p4/schema/xsd/ccv1p4_imscp_v1p2_v1p0.xsd"
)
LAUNCH_PATH = "webcontent/index.html"


def fail(message: str) -> None:
    raise ValueError(message)


def write_manifest(path: Path, embedded_paths: list[str]) -> None:
    files = "".join(f'      <file href="{escape(item, quote=True)}"/>\n' for item in embedded_paths)
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com.giaotrinhdientu.cohoclythuyet.cc14" xmlns="{CC_NAMESPACE}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="{CC_SCHEMA_LOCATION}">
  <metadata>
    <schema>1EdTech Common Cartridge</schema>
    <schemaversion>1.4.0</schemaversion>
  </metadata>
  <organizations default="course-organization">
    <organization identifier="course-organization" structure="rooted-hierarchy">
      <title>Giao Trinh Dien Tu Co Hoc Ly Thuyet</title>
      <item identifier="course-item" identifierref="webcontent-resource">
        <title>Giao Trinh Dien Tu Co Hoc Ly Thuyet</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="webcontent-resource" type="webcontent" href="{LAUNCH_PATH}">
{files}    </resource>
  </resources>
</manifest>
'''
    path.write_text(xml, encoding="utf-8", newline="\n")


def source_details(source_release: Path) -> tuple[dict, list[str], str]:
    manifest, names = validate_release_package(source_release)
    if manifest["launchPath"] != "index.html":
        fail("source release launchPath must be index.html")
    if not isinstance(manifest["buildEpoch"], int) or not isinstance(manifest["releaseVersion"], str):
        fail("source release metadata is invalid")
    with zipfile.ZipFile(source_release) as archive:
        release_manifest_bytes = archive.read("release-manifest.json")
    return manifest, names, hashlib.sha256(release_manifest_bytes).hexdigest()


def build(source_release: Path, output: Path, epoch: int, maximum_package_bytes: int = DEFAULT_MAXIMUM_PACKAGE_BYTES) -> dict:
    if epoch < 315532800:
        fail("--epoch predates ZIP timestamp support")
    if maximum_package_bytes <= 0:
        fail("maximum package bytes must be positive")
    source_release = source_release.resolve()
    output = output.resolve()
    if not source_release.is_file():
        fail("source release ZIP is missing")
    if source_release == output:
        fail("output cannot replace source release ZIP")

    release_manifest, source_names, release_manifest_hash = source_details(source_release)
    source_zip_hash = sha256_file(source_release)
    if not SHA256_RE.fullmatch(source_zip_hash):
        fail("source release ZIP hash is invalid")
    source_metadata = {
        "sourceReleaseZipSha256": source_zip_hash,
        "releaseManifestSha256": release_manifest_hash,
        "releaseVersion": release_manifest["releaseVersion"],
        "releaseBuildEpoch": release_manifest["buildEpoch"],
        "releaseLaunchPath": release_manifest["launchPath"],
    }
    metadata = {
        "schemaVersion": SCHEMA_VERSION,
        "adapter": ADAPTER,
        "buildEpoch": epoch,
        "launchPath": LAUNCH_PATH,
        "sourceRelease": source_metadata,
    }
    provenance = {
        "schemaVersion": SCHEMA_VERSION,
        "adapter": ADAPTER,
        "launchPath": LAUNCH_PATH,
        "sourceRelease": source_metadata,
    }

    staging = Path(tempfile.mkdtemp(prefix="common-cartridge-"))
    try:
        webcontent = staging / "webcontent"
        with zipfile.ZipFile(source_release) as archive:
            for name in source_names:
                relative = logical_path(name)
                destination = webcontent.joinpath(*relative.split("/"))
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(archive.read(name))
        embedded_paths = [f"webcontent/{name}" for name in source_names]
        write_manifest(staging / "imsmanifest.xml", embedded_paths)
        write_json(staging / "adapter-metadata.json", metadata)
        write_json(staging / "provenance.json", provenance)
        output.parent.mkdir(parents=True, exist_ok=True)
        write_zip(staging, output, epoch)
    finally:
        shutil.rmtree(staging, ignore_errors=True)

    if output.stat().st_size > maximum_package_bytes:
        output.unlink(missing_ok=True)
        fail("Common Cartridge package exceeds maximumPackageBytes")

    from validate_common_cartridge import validate_package

    report = validate_package(output, maximum_package_bytes, source_release)
    return {
        "schemaVersion": SCHEMA_VERSION,
        "adapter": ADAPTER,
        "package": {"path": str(output), "sha256": sha256_file(output), "sizeBytes": output.stat().st_size},
        "sourceRelease": source_metadata,
        "fileCount": report["fileCount"],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-release", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--epoch", required=True, type=int)
    parser.add_argument("--maximum-package-bytes", type=int, default=DEFAULT_MAXIMUM_PACKAGE_BYTES)
    args = parser.parse_args()
    print(json.dumps(build(Path(args.source_release), Path(args.output), args.epoch, args.maximum_package_bytes), ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError, zipfile.BadZipFile) as error:
        print(f"common cartridge build failed: {error}", file=sys.stderr)
        raise SystemExit(1)
