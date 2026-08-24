"""Validate the manual/independent portion of the accessibility baseline."""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    raise ValueError(message)


def valid_evidence(root: Path, references) -> bool:
    if not isinstance(references, list) or not references:
        return False
    for reference in references:
        if not isinstance(reference, str) or not reference:
            return False
        candidate = (root / reference).resolve()
        if root not in candidate.parents or not candidate.is_file():
            return False
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=str(ROOT))
    parser.add_argument("--require-complete", action="store_true")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    baseline = json.loads((root / "data" / "accessibility-baseline.json").read_text(encoding="utf-8"))
    if baseline.get("schemaVersion") != 1:
        fail("unsupported accessibility baseline version")
    review = baseline.get("manualReview")
    if not isinstance(review, dict) or not isinstance(review.get("required"), list) or not review["required"]:
        fail("invalid manual accessibility review contract")
    statuses = [item.get("manualStatus") for item in baseline.get("criteria", []) + baseline.get("additionalContracts", [])]
    if not statuses or not all(isinstance(status, str) and status for status in statuses):
        fail("missing manual accessibility criterion status")
    complete = (
        review.get("status") == "completed-independent-review"
        and bool(review.get("reviewer"))
        and bool(review.get("environment"))
        and valid_evidence(root, review.get("evidenceRefs"))
        and all(not status.startswith("pending") for status in statuses)
    )
    if args.require_complete and not complete:
        fail("independent accessibility review incomplete")
    print(f"accessibility independent review: {'PASS' if complete else 'PENDING'}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"accessibility independent review: FAIL: {error}", file=sys.stderr)
        sys.exit(1)
