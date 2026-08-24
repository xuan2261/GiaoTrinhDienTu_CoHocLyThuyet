"""Deterministic inventory and contracts for academic review certification."""
import hashlib
import json
import re
from pathlib import Path

HASH = re.compile(r"^[a-f0-9]{64}$")
ITEM_TYPES = {"equation", "figure", "content-route"}
TECHNICAL = {"passed", "failed", "pending", "stale-source-artifact"}
ACADEMIC = {"pending", "accepted", "blocked"}
DECISIONS = {"accept", "block"}
OUTPUT_RESOLUTIONS = {"canonical-route", "logical-path", "exact-sha256-match", "missing-logical-output"}


def fail(message):
    raise ValueError(message)


def digest(value):
    return hashlib.sha256(value).hexdigest()


def bytes_hash(path):
    try:
        return digest(path.read_bytes())
    except OSError as error:
        fail(f"missing required path {path}: {error}")


def load_json(root, relative):
    try:
        return json.loads((root / relative).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        fail(f"{relative}: {error}")


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def confined(root, relative):
    if not isinstance(relative, str) or not relative or Path(relative).is_absolute():
        fail("path must be a non-empty root-relative path")
    path = (root / relative).resolve()
    if root != path and root not in path.parents:
        fail(f"path escapes root: {relative}")
    return path


def item_id(kind, chapter, paragraph, media, source_hash, duplicate_number):
    media_id = re.sub(r"[^a-z0-9]+", "-", media.lower()).strip("-")
    return f"{kind}-ch{chapter}-p{paragraph}-m{media_id}-h{source_hash[:12]}-n{duplicate_number}"


def indexed_sources(mappings, saved):
    mapping_index, image_index = {}, {}
    for mapping in mappings:
        for example in mapping.get("examples", []):
            key = tuple(example.get(name) for name in ("chapter", "media", "output", "kind"))
            mapping_index.setdefault(key, []).append(mapping)
    for entry in saved:
        key = tuple(entry.get(name) for name in ("chapter", "media", "output"))
        image_index.setdefault(key, []).append(entry)
    for values in mapping_index.values():
        values.sort(key=lambda entry: entry.get("hash", ""))
    return mapping_index, image_index


def current_images(root):
    by_hash = {}
    directory = root / "images"
    for path in sorted(directory.rglob("*")) if directory.is_dir() else []:
        if path.is_file():
            by_hash.setdefault(bytes_hash(path), []).append(path.relative_to(root).as_posix())
    return by_hash


def chapter_fragments(root):
    result = {}
    for chapter in (1, 2, 3):
        rows = []
        for path in sorted((root / f"chapters/ch{chapter}").glob("*.html")):
            rows.append((path.relative_to(root).as_posix(), path.read_text(encoding="utf-8"), bytes_hash(path)))
        if not rows:
            fail(f"missing chapter fragments for chapter {chapter}")
        result[chapter] = rows
    return result


def resolve_output(root, item, images_by_hash):
    logical = item["output"]
    if confined(root, logical).is_file():
        return logical, "logical-path", "passed"
    matches = images_by_hash.get(item["hash"], [])
    if len(matches) == 1:
        return matches[0], "exact-sha256-match", "passed"
    return logical, "missing-logical-output", "stale-source-artifact"


def build_inventory(root):
    manifest = load_json(root, "data/content-manifest.json")
    report = load_json(root, "tools/equation_report.json")
    mappings = load_json(root, "data/equation_mapping.json")
    manuals = load_json(root, "data/equation_manual_reviews.json")
    image_map = load_json(root, "tools/image_mapping.json")
    overrides = load_json(root, "data/image_alt_overrides.json")
    manual_by_hash = {item.get("hash"): item for item in manuals if item.get("hash")}
    mapping_index, image_index = indexed_sources(mappings, image_map.get("saved", []))
    images_by_hash, fragments = current_images(root), chapter_fragments(root)
    records = []
    for route in manifest.get("routes", []):
        output = route["chapterFile"]
        output_hash = bytes_hash(confined(root, output))
        record = {
            "id": f"content-route-{route['routeId']}", "itemType": "content-route", "routeRef": route["routeId"],
            "sourceRef": "data/content-manifest.json#/routes/" + route["routeId"], "outputRef": output,
            "outputResolution": "canonical-route", "context": route["title"],
            "sourceHash": digest(canonical(route)), "outputHash": output_hash, "technicalStatus": "passed",
        }
        record["scopeHash"] = digest(canonical({"route": route, "fragmentHash": output_hash}))
        records.append(record)
    duplicate_numbers = {}
    for item in sorted(report.get("items", []), key=canonical):
        source_hash = digest(canonical(item))
        duplicate_numbers[source_hash] = duplicate_numbers.get(source_hash, 0) + 1
        kind = "figure" if item["kind"] == "figure" else "equation"
        output_ref, resolution, technical_status = resolve_output(root, item, images_by_hash)
        output_hash = bytes_hash(confined(root, output_ref)) if technical_status == "passed" else item["hash"]
        mapping_key = tuple(item.get(name) for name in ("chapter", "media", "output", "kind"))
        image_key = tuple(item.get(name) for name in ("chapter", "media", "output"))
        references = [(path, path_hash) for path, text, path_hash in fragments[item["chapter"]] if output_ref in text]
        scope = {
            "reportItem": item, "mapping": mapping_index.get(mapping_key, []),
            "manualReview": manual_by_hash.get(item["hash"]), "imageMapping": image_index.get(image_key, []),
            "altOverrides": [entry for entry in overrides if item["hash"].startswith(entry.get("hash", ""))],
            "outputResolution": resolution, "resolvedOutput": output_ref, "referencingFragments": references,
        }
        records.append({
            "id": item_id(kind, item["chapter"], item["paragraph_index"], item["media"], source_hash, duplicate_numbers[source_hash]),
            "itemType": kind, "routeRef": f"ch{item['chapter']}",
            "sourceRef": f"tools/equation_report.json#sha256={source_hash};occurrence={duplicate_numbers[source_hash]}",
            "outputRef": output_ref, "outputResolution": resolution, "context": item.get("text_context", ""),
            "sourceHash": source_hash, "outputHash": output_hash, "scopeHash": digest(canonical(scope)),
            "technicalStatus": technical_status,
        })
    identifiers = [record["id"] for record in records]
    if len(identifiers) != len(set(identifiers)):
        fail("inventory has duplicate stable IDs")
    return sorted(records, key=lambda record: record["id"])


def ledger_record(record):
    return {**record, "academicStatus": "pending"}


def write_ledger(root):
    payload = {
        "version": 1,
        "occurrencePolicy": "one report item occurrence plus one canonical manifest route; repeated identical report rows use a canonical-hash duplicate ordinal; no cross-item deduplication; output relocation resolves only by unique exact SHA-256",
        "records": [ledger_record(record) for record in build_inventory(root)],
    }
    (root / "data/academic_review_ledger.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return payload
