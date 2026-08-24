"""Validate a deterministic QTI 3 package against canonical quiz sources."""
from __future__ import annotations

import argparse
import json
import shutil
import stat
import sys
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

RELEASE_TOOLS = Path(__file__).resolve().parents[1] / "release"
if str(RELEASE_TOOLS) not in sys.path:
    sys.path.insert(0, str(RELEASE_TOOLS))
from release_common import SHA256_RE, epoch_zip_datetime, load_json, logical_path, sha256_file  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
QTI_NAMESPACE = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
QTI_CP_NAMESPACE = "http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"
RESOURCE_TYPE = "imsqti_qtiitem_xmlv3p0"
CHOICE_IDS = ("CHOICE_A", "CHOICE_B", "CHOICE_C", "CHOICE_D")
SOURCE_PATHS = {
    "data/quiz-ch1.json": "quiz",
    "data/quiz-learning-map.json": "quizLearningMap",
    "data/learning-outcomes.json": "learningOutcomes",
}


def fail(message: str) -> None:
    raise ValueError(message)


def qti(name: str) -> str:
    return f"{{{QTI_NAMESPACE}}}{name}"


def cp(name: str) -> str:
    return f"{{{QTI_CP_NAMESPACE}}}{name}"


def question_hash(item: dict) -> str:
    import hashlib

    authored = {key: item[key] for key in ("question", "options", "correct", "section", "feedbackCorrect", "feedbackWrong")}
    encoded = json.dumps(authored, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def read_json(path: Path, label: str) -> dict:
    try:
        value = load_json(path)
    except (OSError, json.JSONDecodeError) as error:
        fail(f"invalid {label}: {error}")
    if not isinstance(value, dict):
        fail(f"invalid {label}")
    return value


def validate_zip(package: Path) -> tuple[Path, list[zipfile.ZipInfo]]:
    try:
        archive = zipfile.ZipFile(package)
    except (OSError, zipfile.BadZipFile) as error:
        fail(f"invalid ZIP package: {error}")
    with archive:
        infos = archive.infolist()
        if not infos:
            fail("ZIP package is empty")
        names = []
        for info in infos:
            try:
                name = logical_path(info.filename)
            except ValueError as error:
                fail(f"unsafe ZIP path: {error}")
            if info.is_dir():
                fail("ZIP must contain regular files only")
            mode = info.external_attr >> 16
            if mode and not stat.S_ISREG(mode):
                fail(f"non-regular ZIP entry: {info.filename}")
            names.append(name)
        if names != sorted(names) or len(names) != len(set(names)):
            fail("ZIP entries must be unique and sorted")
        staging = Path(tempfile.mkdtemp(prefix="qti3-validate-"))
        try:
            for info, name in zip(infos, names):
                target = staging.joinpath(*name.split("/"))
                target.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(info) as source, target.open("wb") as destination:
                    shutil.copyfileobj(source, destination)
        except Exception:
            shutil.rmtree(staging, ignore_errors=True)
            raise
    return staging, infos


def validate_metadata(staging: Path, quiz_path: Path, map_path: Path, outcomes_path: Path) -> tuple[dict, dict]:
    metadata = read_json(staging / "adapter-metadata.json", "adapter metadata")
    expected_keys = {"schemaVersion", "adapter", "buildEpoch", "chapter", "itemCount", "canonicalSources", "files"}
    if set(metadata) != expected_keys or metadata.get("schemaVersion") != 1:
        fail("invalid adapter metadata shape")
    if metadata.get("adapter") != {"name": "tools/lms/build_qti3_package.py", "version": 1}:
        fail("invalid adapter identity")
    if not isinstance(metadata.get("buildEpoch"), int) or not isinstance(metadata.get("chapter"), str):
        fail("invalid adapter metadata build fields")
    if not isinstance(metadata.get("itemCount"), int) or not 1 <= metadata["itemCount"] <= 10:
        fail("item count must be between 1 and 10")
    source_paths = {"quiz": quiz_path, "quizLearningMap": map_path, "learningOutcomes": outcomes_path}
    sources = metadata.get("canonicalSources")
    if not isinstance(sources, list) or len(sources) != len(SOURCE_PATHS):
        fail("invalid canonical source metadata")
    seen_keys = set()
    for record in sources:
        if not isinstance(record, dict) or set(record) != {"key", "path", "sha256"}:
            fail("invalid canonical source metadata")
        key, path, digest = record.get("key"), record.get("path"), record.get("sha256")
        if key not in source_paths or SOURCE_PATHS.get(path) != key or key in seen_keys:
            fail("invalid canonical source metadata")
        if not isinstance(digest, str) or not SHA256_RE.fullmatch(digest):
            fail("invalid canonical source hash")
        if sha256_file(source_paths[key]) != digest:
            fail(f"stale canonical source hash: {path}")
        seen_keys.add(key)
    files = metadata.get("files")
    if not isinstance(files, list) or len(files) != metadata["itemCount"] + 1:
        fail("invalid metadata file hashes")
    paths = []
    for record in files:
        if not isinstance(record, dict) or set(record) != {"path", "sha256"}:
            fail("invalid metadata file hashes")
        try:
            path = logical_path(record.get("path"))
        except ValueError as error:
            fail(f"invalid metadata file path: {error}")
        digest = record.get("sha256")
        if not isinstance(digest, str) or not SHA256_RE.fullmatch(digest) or not (staging / path).is_file():
            fail("invalid metadata file hashes")
        if sha256_file(staging / path) != digest:
            fail(f"metadata hash mismatch: {path}")
        paths.append(path)
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        fail("metadata file paths must be unique and sorted")
    if paths[-1:] != ["traceability.json"] or any(not path.startswith("items/") for path in paths[:-1]):
        fail("invalid metadata file inventory")
    traceability = read_json(staging / "traceability.json", "traceability")
    if set(traceability) != {"schemaVersion", "items"} or traceability.get("schemaVersion") != 1 or not isinstance(traceability.get("items"), list):
        fail("invalid traceability shape")
    return metadata, traceability


def canonical_records(quiz_path: Path, map_path: Path, outcomes_path: Path) -> tuple[dict, set[str]]:
    quiz = read_json(quiz_path, "canonical quiz")
    learning_map = read_json(map_path, "canonical learning map")
    outcomes = read_json(outcomes_path, "learning outcomes")
    items = quiz.get("items")
    mappings = learning_map.get("items")
    outcome_ids = {value.get("id") for value in outcomes.get("learningOutcomes", []) if isinstance(value, dict)}
    if not isinstance(items, list) or not isinstance(mappings, list):
        fail("canonical quiz sources are malformed")
    map_by_id = {value.get("id"): value for value in mappings if isinstance(value, dict)}
    records = {}
    for index, item in enumerate(items):
        if not isinstance(item, dict) or not isinstance(item.get("id"), str):
            continue
        mapping = map_by_id.get(item["id"])
        if not isinstance(mapping, dict):
            continue
        records[item["id"]] = {"item": item, "index": index, "mapping": mapping}
    return records, outcome_ids


def validate_item_xml(path: Path, record: dict, canonical: dict, outcome_ids: set[str]) -> None:
    item = canonical["item"]
    mapping = canonical["mapping"]
    try:
        root = ET.parse(path).getroot()
    except (OSError, ET.ParseError) as error:
        fail(f"invalid QTI item XML: {path.name}: {error}")
    if root.tag != qti("qti-assessment-item"):
        fail(f"invalid QTI item namespace: {path.name}")
    expected_attributes = {
        "identifier": item["id"],
        "data-source-file": mapping.get("sourceFile"),
        "data-source-index": str(canonical["index"]),
        "data-source-hash": mapping.get("questionHash"),
        "data-learning-outcome-id": mapping.get("learningOutcomeId"),
        "data-content-ids": ",".join(mapping.get("contentIds", [])),
    }
    if any(root.get(key) != value for key, value in expected_attributes.items()):
        fail(f"QTI provenance mismatch: {item['id']}")
    if mapping.get("sourceFile") != "data/quiz-ch1.json" or mapping.get("sourceIndex") != canonical["index"]:
        fail(f"stale canonical mapping: {item['id']}")
    if mapping.get("questionHash") != question_hash(item):
        fail(f"stale canonical question hash: {item['id']}")
    if mapping.get("learningOutcomeId") not in outcome_ids:
        fail(f"dangling learning outcome: {item['id']}")
    if record != {
        "id": item["id"], "itemPath": f"items/{item['id']}.xml", "itemSha256": sha256_file(path),
        "sourceFile": mapping["sourceFile"], "sourceIndex": canonical["index"], "questionHash": mapping["questionHash"],
        "learningOutcomeId": mapping["learningOutcomeId"], "contentIds": mapping["contentIds"],
    }:
        fail(f"traceability mismatch: {item['id']}")
    declaration = root.find(qti("qti-response-declaration"))
    correct = declaration.find(qti("qti-correct-response")) if declaration is not None else None
    correct_value = correct.find(qti("qti-value")) if correct is not None else None
    if declaration is None or declaration.get("identifier") != "RESPONSE" or declaration.get("cardinality") != "single" or declaration.get("base-type") != "identifier" or correct_value is None:
        fail(f"invalid QTI response declaration: {item['id']}")
    if correct_value.text != CHOICE_IDS[item.get("correct")]:
        fail(f"correct response semantic mismatch: {item['id']}")
    body = root.find(qti("qti-item-body"))
    interaction = body.find(qti("qti-choice-interaction")) if body is not None else None
    prompt = interaction.find(qti("qti-prompt")) if interaction is not None else None
    if prompt is None or prompt.text != item.get("question"):
        fail(f"question semantic mismatch: {item['id']}")
    if interaction is None or interaction.get("response-identifier") != "RESPONSE" or interaction.get("max-choices") != "1":
        fail(f"invalid choice interaction: {item['id']}")
    choices = interaction.findall(qti("qti-simple-choice"))
    if [choice.get("identifier") for choice in choices] != list(CHOICE_IDS):
        fail(f"duplicate or invalid choice identifiers: {item['id']}")
    if [choice.text for choice in choices] != item.get("options"):
        fail(f"choice semantic mismatch: {item['id']}")
    processing = root.find(qti("qti-response-processing"))
    if processing is None or not str(processing.get("template", "")).endswith("/match_correct"):
        fail(f"invalid match_correct response processing: {item['id']}")


def validate_manifest(staging: Path, records: list[dict]) -> None:
    try:
        root = ET.parse(staging / "imsmanifest.xml").getroot()
    except (OSError, ET.ParseError) as error:
        fail(f"invalid imsmanifest.xml: {error}")
    if root.tag != cp("manifest"):
        fail("invalid QTI content-packaging namespace")
    schema_location = root.get("{http://www.w3.org/2001/XMLSchema-instance}schemaLocation", "")
    if "imsqtiv3p0_imscpv1p2_v1p0.xsd" not in schema_location:
        fail("invalid QTI content-packaging schema location")
    resources = root.find(cp("resources"))
    if resources is None:
        fail("missing QTI manifest resources")
    actual = resources.findall(cp("resource"))
    identifiers = [resource.get("identifier") for resource in actual]
    hrefs = [resource.get("href") for resource in actual]
    if len(identifiers) != len(set(identifiers)) or any(not identifier for identifier in identifiers):
        fail("duplicate manifest resource identifier")
    expected_paths = [record["itemPath"] for record in records]
    expected_identifiers = [f"qti3-{record['id']}" for record in records]
    if identifiers != expected_identifiers:
        fail("dangling or reordered manifest resource identifier")
    if hrefs != expected_paths:
        fail("dangling or reordered manifest resource")
    for resource, expected_path in zip(actual, expected_paths):
        if resource.get("type") != RESOURCE_TYPE:
            fail("invalid QTI manifest resource type")
        files = resource.findall(cp("file"))
        if len(files) != 1 or files[0].get("href") != expected_path:
            fail("dangling QTI manifest file")


def validate(package: Path, quiz_path: Path, map_path: Path, outcomes_path: Path) -> tuple[dict, list[str]]:
    staging, infos = validate_zip(package)
    try:
        metadata, traceability = validate_metadata(staging, quiz_path, map_path, outcomes_path)
        records = traceability["items"]
        if len(records) != metadata["itemCount"] or not 1 <= len(records) <= 10:
            fail("item count must be between 1 and 10")
        canonical, outcome_ids = canonical_records(quiz_path, map_path, outcomes_path)
        ids = []
        paths = []
        for record in records:
            if not isinstance(record, dict):
                fail("invalid traceability record")
            ids.append(record.get("id"))
            paths.append(record.get("itemPath"))
        if len(ids) != len(set(ids)) or any(not isinstance(value, str) for value in ids):
            fail("duplicate traceability identifier")
        if paths != sorted(paths) or len(paths) != len(set(paths)):
            fail("duplicate or unordered traceability item path")
        for record in records:
            item_id = record["id"]
            if item_id not in canonical:
                fail(f"dangling canonical item: {item_id}")
            try:
                item_path = logical_path(record.get("itemPath"))
            except ValueError as error:
                fail(f"unsafe traceability item path: {error}")
            if not (staging / item_path).is_file():
                fail(f"dangling item file: {item_id}")
            validate_item_xml(staging / item_path, record, canonical[item_id], outcome_ids)
        expected_files = {"imsmanifest.xml", "adapter-metadata.json", "traceability.json", *paths}
        actual_files = {path.relative_to(staging).as_posix() for path in staging.rglob("*") if path.is_file()}
        if actual_files != expected_files:
            fail("unexpected or missing package file")
        validate_manifest(staging, records)
        expected_timestamp = epoch_zip_datetime(metadata["buildEpoch"])
        if any(info.date_time != expected_timestamp for info in infos):
            fail("ZIP timestamp differs from build epoch")
        return metadata, sorted(actual_files)
    finally:
        shutil.rmtree(staging, ignore_errors=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", required=True, type=Path)
    parser.add_argument("--quiz", default=ROOT / "data/quiz-ch1.json", type=Path)
    parser.add_argument("--quiz-learning-map", default=ROOT / "data/quiz-learning-map.json", type=Path)
    parser.add_argument("--learning-outcomes", default=ROOT / "data/learning-outcomes.json", type=Path)
    parser.add_argument("--list-json", action="store_true")
    args = parser.parse_args()
    metadata, paths = validate(args.package, args.quiz, args.quiz_learning_map, args.learning_outcomes)
    if args.list_json:
        print(json.dumps(paths, ensure_ascii=False))
    else:
        print(f"qti3 validation: PASS ({metadata['chapter']}, {metadata['itemCount']} items)")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError, zipfile.BadZipFile) as error:
        print(f"qti3 validation: {error}", file=sys.stderr)
        raise SystemExit(1)
