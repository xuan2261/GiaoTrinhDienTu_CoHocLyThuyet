"""Validate independent manual smoke review evidence for the frozen candidate."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
try:
    from tools.validate_release_candidate import validate as validate_candidate
except ModuleNotFoundError:
    from validate_release_candidate import validate as validate_candidate

ROOT = Path(__file__).resolve().parents[1]
DEFAULT = ROOT / "data" / "release-smoke-review.json"


def fail(message: str) -> None:
    raise ValueError(message)


def validate(path: Path, require_complete: bool) -> dict:
    review = json.loads(path.read_text(encoding="utf-8"))
    keys = {"schemaVersion", "status", "reviewerRole", "reviewerUnit", "environment", "releaseVersion", "releaseSha256", "evidenceRefs", "decision", "limitations"}
    if set(review) != keys or review["schemaVersion"] != 1 or review["status"] not in {"pending", "complete"}:
        fail("invalid release smoke review contract")
    if not isinstance(review["evidenceRefs"], list) or not review["evidenceRefs"]:
        fail("release smoke review requires evidence references")
    for reference in review["evidenceRefs"]:
        candidate = (ROOT / reference).resolve()
        if ROOT not in candidate.parents or not candidate.is_file():
            fail("release smoke review evidence is missing or outside repository")
    if not isinstance(review["releaseSha256"], str) or len(review["releaseSha256"]) != 64:
        fail("invalid release smoke review package hash")
    inventory = validate_candidate()
    summary = inventory["summary"]
    if review["releaseVersion"] != summary["releaseVersion"] or review["releaseSha256"] != summary["package"]["sha256"]:
        fail("release smoke review candidate hash mismatch")
    if not isinstance(review["limitations"], list) or not all(isinstance(item, str) and item for item in review["limitations"]):
        fail("invalid release smoke review limitations")
    if review["status"] == "complete":
        if not all(isinstance(review[key], str) and review[key] for key in ("reviewerRole", "reviewerUnit", "environment")):
            fail("complete release smoke review requires reviewer role, unit and environment")
        if review["decision"] not in {"accept", "reject"}:
            fail("complete release smoke review requires a disposition")
    if require_complete and (review["status"] != "complete" or review["decision"] != "accept"):
        fail("independent release smoke review is incomplete")
    return review


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default=str(DEFAULT))
    parser.add_argument("--require-complete", action="store_true")
    args = parser.parse_args()
    review = validate(Path(args.input).resolve(), args.require_complete)
    print(f"release smoke review: {review['status']}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"release smoke review: FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
