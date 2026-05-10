"""Apply curated manual reviews to an equation mapping file."""
import argparse
import json
import os
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_ARTIFACTS = {"figure", "blank"}


def load_rows(path):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        return data.get("equations", data.get("items", []))
    return data if isinstance(data, list) else []


def write_rows(path, rows):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2)


def append_note(current, addition):
    addition = (addition or "").strip()
    if not addition:
        return current or ""
    current = (current or "").strip()
    return f"{current} | {addition}" if current else addition


def apply_reviews(args):
    rows = load_rows(args.input)
    reviews = load_rows(args.reviews)
    row_by_hash = {row.get("hash"): row for row in rows if isinstance(row, dict)}
    applied = 0
    artifact_count = 0

    for review in reviews:
        media_hash = review.get("hash")
        if media_hash not in row_by_hash:
            raise SystemExit(f"Review hash not found in input mapping: {media_hash}")

        latex = (review.get("latex") or "").strip()
        mathml = (review.get("mathml") or "").strip()
        artifact = (review.get("artifact") or "").strip()
        if artifact and artifact not in ALLOWED_ARTIFACTS:
            raise SystemExit(f"Invalid artifact type for {media_hash}: {artifact}")
        if not (latex or mathml or artifact):
            raise SystemExit(f"Manual review must contain latex, mathml, or artifact: {media_hash}")

        row = row_by_hash[media_hash]
        row["latex"] = latex
        row["mathml"] = mathml
        if artifact:
            row["artifact"] = artifact
            artifact_count += 1
            alt = (review.get("alt") or "").strip()
            if alt:
                row["alt"] = alt
        else:
            row.pop("artifact", None)
            row.pop("alt", None)
        row["source"] = review.get("source") or ("manual-review:artifact" if artifact else "manual-review")
        row["reviewed"] = True
        row["notes"] = append_note(row.get("notes"), review.get("notes") or "Manual review applied")
        applied += 1

    if not args.dry_run:
        write_rows(args.output, rows)

    reviewed = sum(1 for row in rows if isinstance(row, dict) and row.get("reviewed"))
    print("=== MANUAL EQUATION REVIEWS ===")
    print(f"Input rows: {len(rows)}")
    print(f"Manual reviews: {len(reviews)}")
    print(f"Applied: {applied}")
    print(f"Artifacts: {artifact_count}")
    print(f"Reviewed total: {reviewed}")
    print(f"Dry-run: {'yes' if args.dry_run else 'no'}")
    if not args.dry_run:
        print(f"Output: {os.path.abspath(args.output)}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data/equation_mapping.reviewed.json")
    parser.add_argument("--reviews", default="data/equation_manual_reviews.json")
    parser.add_argument("--output", default="data/equation_mapping.reviewed.json")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    apply_reviews(args)


if __name__ == "__main__":
    main()
