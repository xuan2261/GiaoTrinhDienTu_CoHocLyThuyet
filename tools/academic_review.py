#!/usr/bin/env python3
"""Read-only currentness and signoff validator for academic review records."""
import argparse
import sys
from datetime import datetime
from pathlib import Path
from academic_review_contracts import (
    ACADEMIC, DECISIONS, HASH, ITEM_TYPES, OUTPUT_RESOLUTIONS, TECHNICAL,
    build_inventory, confined, fail, load_json,
)

RECORD_KEYS = {
    "id", "itemType", "routeRef", "sourceRef", "outputRef", "outputResolution", "context", "sourceHash", "outputHash",
    "scopeHash", "technicalStatus", "academicStatus",
}
SIGNOFF_KEYS = {"reviewId", "itemId", "reviewer", "independent", "decision", "scopeHash", "evidenceRefs", "reviewedAt"}
REVIEWER_KEYS = {"role", "affiliation"}


def exact(value, keys, label, optional=()):
    if not isinstance(value, dict) or set(value) - set(keys) - set(optional) or set(keys) - set(value):
        fail(f"{label}: unexpected or missing fields")


def valid_hash(value, label):
    if not isinstance(value, str) or not HASH.fullmatch(value):
        fail(f"{label}: invalid SHA-256")


def validate_ledger(data):
    exact(data, {"version", "occurrencePolicy", "records"}, "ledger")
    if data["version"] != 1 or not isinstance(data["occurrencePolicy"], str) or not isinstance(data["records"], list):
        fail("ledger: invalid version, occurrence policy, or records")
    records = {}
    for record in data["records"]:
        exact(record, RECORD_KEYS, "ledger record")
        identifier = record["id"]
        if not isinstance(identifier, str) or identifier in records:
            fail("ledger: duplicate or invalid item ID")
        if record["itemType"] not in ITEM_TYPES or record["technicalStatus"] not in TECHNICAL or record["academicStatus"] not in ACADEMIC:
            fail("ledger: invalid item or status vocabulary")
        if record["outputResolution"] not in OUTPUT_RESOLUTIONS:
            fail("ledger: invalid output resolution vocabulary")
        if not all(isinstance(record[key], str) for key in ("routeRef", "sourceRef", "outputRef", "outputResolution", "context")):
            fail("ledger: invalid reference, resolution, or context")
        for key in ("sourceHash", "outputHash", "scopeHash"):
            valid_hash(record[key], f"ledger {key}")
        records[identifier] = record
    return records


def validate_signoffs(root, data, records):
    exact(data, {"version", "records"}, "signoffs")
    if data["version"] != 1 or not isinstance(data["records"], list):
        fail("signoffs: invalid version or records")
    signoffs, superseded = {}, set()
    for signoff in data["records"]:
        exact(signoff, SIGNOFF_KEYS, "signoff", optional=("approvalRef", "supersedes"))
        review_id = signoff["reviewId"]
        if not isinstance(review_id, str) or not review_id or review_id in signoffs:
            fail("signoffs: duplicate or invalid review ID")
        if signoff["itemId"] not in records or signoff["decision"] not in DECISIONS or signoff["independent"] is not True:
            fail("signoffs: unknown item, decision, or independent reviewer")
        valid_hash(signoff["scopeHash"], "signoff scopeHash")
        reviewer = signoff["reviewer"]
        if not isinstance(reviewer, dict) or set(reviewer) - (REVIEWER_KEYS | {"identity"}):
            fail("signoff reviewer: unexpected fields")
        if not all(isinstance(reviewer.get(key), str) and reviewer[key].strip() for key in REVIEWER_KEYS):
            fail("signoffs: reviewer role and affiliation are required")
        if "identity" in reviewer and (not isinstance(reviewer["identity"], str) or not reviewer["identity"].strip()):
            fail("signoffs: invalid optional reviewer identity")
        if "approvalRef" in signoff and (not isinstance(signoff["approvalRef"], str) or not signoff["approvalRef"].strip()):
            fail("signoffs: invalid optional approval reference")
        try:
            datetime.fromisoformat(signoff["reviewedAt"].replace("Z", "+00:00"))
        except (AttributeError, ValueError):
            fail("signoffs: reviewedAt must be ISO-8601")
        if not isinstance(signoff["evidenceRefs"], list) or not signoff["evidenceRefs"]:
            fail("signoffs: evidenceRefs is required")
        for evidence in signoff["evidenceRefs"]:
            if not confined(root, evidence).is_file():
                fail(f"signoffs: missing evidence {evidence}")
        signoffs[review_id] = signoff
    for review_id, signoff in signoffs.items():
        parent = signoff.get("supersedes")
        if parent is not None:
            if parent not in signoffs or parent == review_id or signoffs[parent]["itemId"] != signoff["itemId"]:
                fail("signoffs: invalid supersedes chain")
            if parent in superseded:
                fail("signoffs: superseded review has multiple replacements")
            superseded.add(parent)
        seen, cursor = set(), review_id
        while signoffs[cursor].get("supersedes") is not None:
            cursor = signoffs[cursor]["supersedes"]
            if cursor in seen:
                fail("signoffs: invalid cyclic supersedes chain")
            seen.add(cursor)
    active = {}
    for review_id, signoff in signoffs.items():
        if review_id not in superseded:
            active.setdefault(signoff["itemId"], []).append(signoff)
    if any(len(items) != 1 for items in active.values()):
        fail("signoffs: duplicate or conflicting active decisions")
    return active


def validate_current(root, records, active):
    expected = {record["id"]: record for record in build_inventory(root)}
    if set(records) != set(expected):
        fail(f"ledger: inventory parity mismatch expected={len(expected)} actual={len(records)}")
    for item_id, current in expected.items():
        actual = records[item_id]
        for field in ("itemType", "routeRef", "sourceRef", "outputRef", "outputResolution", "context", "sourceHash", "outputHash", "scopeHash", "technicalStatus"):
            if actual[field] != current[field]:
                fail(f"ledger: stale {field} for {item_id}")
        signoff = active.get(item_id)
        if signoff and signoff[0]["scopeHash"] != actual["scopeHash"]:
            fail(f"signoffs: stale scopeHash for {item_id}")
        decision = signoff[0]["decision"] if signoff else None
        if actual["academicStatus"] == "accepted" and decision != "accept":
            fail(f"ledger: accepted item lacks current independent signoff: {item_id}")
        if actual["academicStatus"] == "blocked" and decision != "block":
            fail(f"ledger: blocked item lacks current blocking signoff: {item_id}")
        if actual["academicStatus"] == "pending" and decision is not None:
            fail(f"ledger: academic status does not reflect active signoff: {item_id}")
    return expected


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="repository or isolated fixture root")
    parser.add_argument("--strict-current", action="store_true", help="recompute inventory and current hashes")
    parser.add_argument("--require-accepted", action="store_true", help="fail unless every current item has an independent acceptance signoff")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    records = validate_ledger(load_json(root, "data/academic_review_ledger.json"))
    active = validate_signoffs(root, load_json(root, "data/academic_signoffs.json"), records)
    if args.strict_current:
        validate_current(root, records, active)
    accepted = sum(item["academicStatus"] == "accepted" for item in records.values())
    pending = sum(item["academicStatus"] == "pending" for item in records.values())
    technical = sum(item["technicalStatus"] == "passed" for item in records.values())
    stale = sum(item["technicalStatus"] == "stale-source-artifact" for item in records.values())
    claim = "certified" if accepted == len(records) and not stale else "provisional"
    if args.require_accepted and claim != "certified":
        fail(f"academic acceptance incomplete: accepted={accepted}/{len(records)} stale={stale} pending={pending}")
    print(f"academic-review: items={len(records)} technical-passed={technical} stale-source-artifact={stale} accepted={accepted} pending={pending} academic-claim:{claim}; technical PASS is not academic certification")


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        print(f"academic-review: FAIL: {error}", file=sys.stderr)
        sys.exit(1)
