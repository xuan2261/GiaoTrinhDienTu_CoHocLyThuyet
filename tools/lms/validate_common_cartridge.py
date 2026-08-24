"""Validate a deterministic IMS Common Cartridge 1.4 static webcontent package."""
from __future__ import annotations

import argparse
import json
import stat
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RELEASE_TOOLS = ROOT / "tools" / "release"
if str(RELEASE_TOOLS) not in sys.path:
    sys.path.insert(0, str(RELEASE_TOOLS))

from release_common import GENERATED_FILES, SHA256_RE, epoch_zip_datetime, logical_path, sha256_bytes, sha256_file
from validate_release import parse_checksums, validate_manifest as validate_release_manifest, validate_package as validate_release_package

ADAPTER = {"name": "tools/lms/build_common_cartridge.py", "version": 1}
SCHEMA_VERSION = 1
DEFAULT_MAXIMUM_PACKAGE_BYTES = 128 * 1024 * 1024
CC_NAMESPACE = "http://www.imsglobal.org/xsd/imsccv1p4/imscp_v1p1"
CC_SCHEMA_LOCATION = (
    "http://www.imsglobal.org/xsd/imsccv1p4/imscp_v1p1 "
    "https://purl.imsglobal.org/spec/cc/v1p4/schema/xsd/ccv1p4_imscp_v1p2_v1p0.xsd"
)
LAUNCH_PATH = "webcontent/index.html"
ROOT_FILES = {"imsmanifest.xml", "adapter-metadata.json", "provenance.json"}


def fail(message: str) -> None:
    raise ValueError(message)


def read_json(archive: zipfile.ZipFile, name: str) -> dict:
    try:
        value = json.loads(archive.read(name).decode("utf-8"))
    except (KeyError, UnicodeDecodeError, json.JSONDecodeError) as error:
        fail(f"invalid {name}: {error}")
    if not isinstance(value, dict):
        fail(f"invalid {name} shape")
    return value


def validate_source_metadata(value: object) -> dict:
    if not isinstance(value, dict):
        fail("invalid source release metadata")
    expected = {"sourceReleaseZipSha256", "releaseManifestSha256", "releaseVersion", "releaseBuildEpoch", "releaseLaunchPath"}
    if set(value) != expected:
        fail("invalid source release metadata shape")
    if not SHA256_RE.fullmatch(str(value["sourceReleaseZipSha256"])):
        fail("invalid source release ZIP hash")
    if not SHA256_RE.fullmatch(str(value["releaseManifestSha256"])):
        fail("invalid source release manifest hash")
    if not isinstance(value["releaseVersion"], str) or not value["releaseVersion"]:
        fail("invalid source release version")
    if not isinstance(value["releaseBuildEpoch"], int):
        fail("invalid source release build epoch")
    if value["releaseLaunchPath"] != "index.html":
        fail("invalid source release launch path")
    return value


def validate_metadata(metadata: dict, provenance: dict) -> dict:
    expected_metadata = {"schemaVersion", "adapter", "buildEpoch", "launchPath", "sourceRelease"}
    expected_provenance = {"schemaVersion", "adapter", "launchPath", "sourceRelease"}
    if set(metadata) != expected_metadata or metadata.get("schemaVersion") != SCHEMA_VERSION:
        fail("invalid adapter metadata shape or schemaVersion")
    if set(provenance) != expected_provenance or provenance.get("schemaVersion") != SCHEMA_VERSION:
        fail("invalid provenance shape or schemaVersion")
    if metadata["adapter"] != ADAPTER or provenance["adapter"] != ADAPTER:
        fail("invalid adapter identity")
    if not isinstance(metadata["buildEpoch"], int):
        fail("invalid adapter build epoch")
    if metadata["launchPath"] != LAUNCH_PATH or provenance["launchPath"] != LAUNCH_PATH:
        fail("launch path mismatch")
    source = validate_source_metadata(metadata["sourceRelease"])
    if provenance["sourceRelease"] != source:
        fail("provenance source release mismatch")
    return source


def validate_manifest_xml(raw: bytes, embedded_paths: list[str]) -> None:
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as error:
        fail(f"invalid imsmanifest.xml: {error}")
    tag = lambda local: f"{{{CC_NAMESPACE}}}{local}"
    if root.tag != tag("manifest") or root.attrib.get("identifier") != "com.giaotrinhdientu.cohoclythuyet.cc14":
        fail("wrong Common Cartridge manifest namespace or identifier")
    if root.attrib.get("{http://www.w3.org/2001/XMLSchema-instance}schemaLocation") != CC_SCHEMA_LOCATION:
        fail("wrong Common Cartridge schema location")
    if len(root) != 3:
        fail("invalid Common Cartridge manifest structure")
    metadata = root.find(tag("metadata"))
    if metadata is None or [child.tag for child in metadata] != [tag("schema"), tag("schemaversion")]:
        fail("invalid Common Cartridge schema metadata")
    if metadata.findtext(tag("schema")) != "1EdTech Common Cartridge" or metadata.findtext(tag("schemaversion")) != "1.4.0":
        fail("wrong Common Cartridge schema version")
    organizations = root.find(tag("organizations"))
    if organizations is None or organizations.attrib.get("default") != "course-organization":
        fail("invalid Common Cartridge organization")
    organizations_children = list(organizations)
    if len(organizations_children) != 1 or organizations_children[0].tag != tag("organization"):
        fail("Common Cartridge must have one organization")
    organization = organizations_children[0]
    if organization.attrib != {"identifier": "course-organization", "structure": "rooted-hierarchy"}:
        fail("invalid Common Cartridge organization identifier")
    items = [child for child in organization if child.tag == tag("item")]
    if len(items) != 1 or items[0].attrib != {"identifier": "course-item", "identifierref": "webcontent-resource"}:
        fail("Common Cartridge must have one launch item")
    resources = root.find(tag("resources"))
    if resources is None:
        fail("missing Common Cartridge resources")
    resource_nodes = list(resources)
    if len(resource_nodes) != 1 or resource_nodes[0].tag != tag("resource"):
        fail("Common Cartridge must have one resource")
    resource = resource_nodes[0]
    if resource.attrib != {"identifier": "webcontent-resource", "type": "webcontent", "href": LAUNCH_PATH}:
        fail("wrong Common Cartridge resource type or launch href")
    declared = []
    for node in resource:
        if node.tag != tag("file") or set(node.attrib) != {"href"}:
            fail("invalid Common Cartridge file declaration")
        try:
            declared.append(logical_path(node.attrib["href"]))
        except ValueError as error:
            fail(f"unsafe Common Cartridge file declaration: {error}")
    if declared != embedded_paths or len(declared) != len(set(declared)):
        fail("Common Cartridge file declarations must be complete, unique and sorted")


def validate_embedded_release(archive: zipfile.ZipFile, source: dict, names: list[str]) -> list[str]:
    webcontent = sorted(name for name in names if name.startswith("webcontent/"))
    relative_paths = [logical_path(name[len("webcontent/"):]) for name in webcontent]
    if not relative_paths or relative_paths != sorted(relative_paths) or len(relative_paths) != len(set(relative_paths)):
        fail("invalid embedded release paths")
    if "index.html" not in relative_paths:
        fail("embedded release launch file is missing")
    if "release-manifest.json" not in relative_paths:
        fail("embedded release manifest is missing")
    release_manifest_bytes = archive.read("webcontent/release-manifest.json")
    if sha256_bytes(release_manifest_bytes) != source["releaseManifestSha256"]:
        fail("source release manifest hash mismatch")
    try:
        release_manifest = json.loads(release_manifest_bytes.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        fail(f"invalid embedded release manifest: {error}")
    validate_release_manifest(release_manifest)
    if (release_manifest["releaseVersion"] != source["releaseVersion"]
            or release_manifest["buildEpoch"] != source["releaseBuildEpoch"]
            or release_manifest["launchPath"] != source["releaseLaunchPath"]):
        fail("source release metadata mismatch")
    records = {record["path"]: record for record in release_manifest["files"]}
    expected = set(records) | GENERATED_FILES
    if set(relative_paths) != expected:
        fail("embedded release inventory mismatch")
    for relative, record in records.items():
        content = archive.read(f"webcontent/{relative}")
        if len(content) != record["sizeBytes"] or sha256_bytes(content) != record["sha256"]:
            fail(f"embedded release checksum mismatch: {relative}")
    try:
        checksum_text = archive.read("webcontent/SHA256SUMS").decode("utf-8")
    except (KeyError, UnicodeDecodeError) as error:
        fail(f"invalid embedded SHA256SUMS: {error}")
    import tempfile
    with tempfile.TemporaryDirectory(prefix="cc-checksums-") as temporary:
        checksum_path = Path(temporary) / "SHA256SUMS"
        checksum_path.write_text(checksum_text, encoding="utf-8", newline="\n")
        checksums = parse_checksums(checksum_path)
    if set(checksums) != expected - {"SHA256SUMS"}:
        fail("embedded SHA256SUMS inventory mismatch")
    for relative, digest in checksums.items():
        if sha256_bytes(archive.read(f"webcontent/{relative}")) != digest:
            fail(f"embedded SHA256SUMS checksum mismatch: {relative}")
    return webcontent


def validate_package(package: Path, maximum_package_bytes: int = DEFAULT_MAXIMUM_PACKAGE_BYTES, source_release: Path | None = None) -> dict:
    if maximum_package_bytes <= 0:
        fail("maximum package bytes must be positive")
    if package.stat().st_size > maximum_package_bytes:
        fail("Common Cartridge package exceeds maximumPackageBytes")
    with zipfile.ZipFile(package) as archive:
        infos = archive.infolist()
        names = []
        for info in infos:
            if info.is_dir():
                fail("Common Cartridge ZIP must contain files only")
            try:
                names.append(logical_path(info.filename))
            except ValueError as error:
                fail(f"unsafe Common Cartridge ZIP path: {error}")
            mode = info.external_attr >> 16
            if mode != (stat.S_IFREG | 0o644):
                fail(f"Common Cartridge ZIP entry must be a regular 0644 file: {info.filename}")
        if names != sorted(names) or len(names) != len(set(names)):
            fail("Common Cartridge ZIP entries must be unique and sorted")
        if set(names) - ROOT_FILES and not all(name.startswith("webcontent/") for name in set(names) - ROOT_FILES):
            fail("unexpected Common Cartridge package path")
        if not ROOT_FILES.issubset(names):
            fail("Common Cartridge root files are incomplete")
        metadata = read_json(archive, "adapter-metadata.json")
        provenance = read_json(archive, "provenance.json")
        source = validate_metadata(metadata, provenance)
        if any(info.date_time != epoch_zip_datetime(metadata["buildEpoch"]) for info in infos):
            fail("Common Cartridge ZIP timestamp differs from adapter epoch")
        webcontent = validate_embedded_release(archive, source, names)
        validate_manifest_xml(archive.read("imsmanifest.xml"), webcontent)
    if source_release is not None:
        source_release = source_release.resolve()
        if sha256_file(source_release) != source["sourceReleaseZipSha256"]:
            fail("source release ZIP hash mismatch")
        source_manifest, source_names = validate_release_package(source_release)
        if source_names != [name[len("webcontent/"):] for name in webcontent]:
            fail("source release ZIP inventory mismatch")
        if (source_manifest["releaseVersion"] != source["releaseVersion"]
                or source_manifest["buildEpoch"] != source["releaseBuildEpoch"]):
            fail("source release ZIP metadata mismatch")
    return {"fileCount": len(names), "embeddedFileCount": len(webcontent), "releaseVersion": source["releaseVersion"]}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", required=True)
    parser.add_argument("--source-release")
    parser.add_argument("--maximum-package-bytes", type=int, default=DEFAULT_MAXIMUM_PACKAGE_BYTES)
    parser.add_argument("--list-json", action="store_true")
    args = parser.parse_args()
    report = validate_package(Path(args.package).resolve(), args.maximum_package_bytes, Path(args.source_release) if args.source_release else None)
    if args.list_json:
        print(json.dumps(report, ensure_ascii=False, sort_keys=True))
    else:
        print(f"common cartridge validation: PASS ({report['releaseVersion']}, {report['embeddedFileCount']} embedded files)")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError, zipfile.BadZipFile, ET.ParseError) as error:
        print(f"common cartridge validation failed: {error}", file=sys.stderr)
        raise SystemExit(1)
