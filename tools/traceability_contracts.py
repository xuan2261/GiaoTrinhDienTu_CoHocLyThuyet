"""Shared exact-shape contracts for traceability registries."""
import hashlib
import json
import re

ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
HASH = re.compile(r"^[a-f0-9]{64}$")
STATUSES = {"draft", "provisional", "confirmed", "blocked", "not-applicable"}


def fail(message):
    raise ValueError(message)


def load(root, name):
    try:
        with (root / "data" / name).open(encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError) as error:
        fail(f"{name}: {error}")


def exact(obj, keys, label, optional=()):
    required = set(keys)
    if not isinstance(obj, dict) or required - set(obj) or set(obj) - required - set(optional):
        fail(f"{label}: unexpected or missing fields")


def identifier(value, label):
    if not isinstance(value, str) or not ID.fullmatch(value):
        fail(f"{label}: invalid ID")


def unique(items, key, label):
    values = []
    for item in items:
        value = item.get(key) if isinstance(item, dict) else None
        identifier(value, f"{label}.{key}")
        values.append(value)
    duplicates = sorted({value for value in values if values.count(value) > 1})
    if duplicates:
        fail(f"{label}: duplicate IDs: {', '.join(duplicates)}")
    return set(values)


def root_shape(data, collection, label):
    exact(data, ["version", "status", collection], label)
    if not isinstance(data["version"], str) or not data["version"]:
        fail(f"{label}.version: invalid")
    if data["status"] not in STATUSES:
        fail(f"{label}.status: invalid status")
    if not isinstance(data[collection], list) or not data[collection]:
        fail(f"{label}.{collection}: must be a non-empty array")


def content_routes(root):
    manifest = load(root, "content-manifest.json")
    routes = manifest.get("routes")
    if not isinstance(routes, list):
        fail("content-manifest: routes missing")
    result = {route.get("routeId") for route in routes if isinstance(route, dict)}
    if not result or None in result:
        fail("content-manifest: invalid route IDs")
    return result - {"home"}


def question_hash(question):
    encoded = json.dumps(question, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(encoded).hexdigest()


def validate_legal(data):
    root_shape(data, "records", "legal register")
    records = data["records"]
    ids = unique(records, "id", "legal register")
    keys = ["id", "title", "authority", "officialSource", "accessedOn", "effectiveOn", "reviewStatus", "ownerRole", "reviewRole"]
    text = ("title", "authority", "officialSource", "accessedOn", "ownerRole", "reviewRole")
    for record in records:
        exact(record, keys, "legal record", optional=("approvalRef",))
        if not all(isinstance(record[key], str) and record[key] for key in text):
            fail("legal record: invalid required text")
        if not record["officialSource"].startswith("https://vanban.chinhphu.vn/"):
            fail("legal record: official source required")
        if record["reviewStatus"] not in STATUSES:
            fail("legal record: invalid review status")
        if record["effectiveOn"] is not None and not isinstance(record["effectiveOn"], str):
            fail("legal record: invalid effective date")
        if "approvalRef" in record and (not isinstance(record["approvalRef"], str) or not record["approvalRef"].strip()):
            fail("legal record: invalid approval reference")
    return ids, {record["id"]: record for record in records}


def validate_los(data):
    root_shape(data, "learningOutcomes", "learning outcomes")
    records = data["learningOutcomes"]
    ids = unique(records, "id", "learning outcomes")
    keys = ["id", "title", "status", "authorityStatus", "source", "verb", "condition", "criterion", "assessmentException", "ownerRole", "reviewRole"]
    text = ("title", "source", "verb", "condition", "criterion", "ownerRole", "reviewRole")
    for record in records:
        exact(record, keys, "learning outcome", optional=("approvalRef",))
        if record["status"] not in STATUSES or record["authorityStatus"] not in STATUSES:
            fail("learning outcome: invalid shape or status")
        if not all(isinstance(record[key], str) and record[key] for key in text):
            fail("learning outcome: invalid shape or status")
        exception = record["assessmentException"]
        if exception is not None and (not isinstance(exception, str) or not exception.strip()):
            fail("learning outcome: invalid assessment exception")
        if "approvalRef" in record and (not isinstance(record["approvalRef"], str) or not record["approvalRef"].strip()):
            fail("learning outcome: invalid approval reference")
    return ids, {record["id"]: record for record in records}


def validate_content(data, routes, lo_ids):
    root_shape(data, "mappings", "content map")
    mappings = data["mappings"]
    content_ids = unique(mappings, "contentId", "content map")
    if content_ids != routes:
        fail(f"content route coverage: missing={sorted(routes - content_ids)} extra={sorted(content_ids - routes)}")
    for item in mappings:
        exact(item, ["contentId", "learningOutcomeId"], "content mapping")
        if item["learningOutcomeId"] not in lo_ids:
            fail("content mapping: dangling learning outcome")
    return {item["contentId"]: item["learningOutcomeId"] for item in mappings}
