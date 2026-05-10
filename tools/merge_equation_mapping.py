"""
Merge reviewed equation mappings into the publish mapping file.

Only rows with reviewed=true are accepted from the reviewed input.
"""
import argparse
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")


def load_rows(path, missing_ok=False):
    if missing_ok and not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        return data.get("equations", data.get("items", []))
    return data


def write_rows(path, rows):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2)


def merge(base_path, reviewed_path, output_path, dry_run=False):
    base_rows = load_rows(base_path, missing_ok=True)
    reviewed_rows = load_rows(reviewed_path)
    merged = {row.get("hash"): row for row in base_rows if row.get("hash")}
    accepted = 0
    skipped = 0

    for row in reviewed_rows:
        media_hash = row.get("hash")
        if not media_hash:
            skipped += 1
            continue
        current = merged.get(media_hash)
        if not row.get("reviewed"):
            skipped += 1
            continue
        if current and current.get("reviewed") and not row.get("reviewed"):
            skipped += 1
            continue
        if not (row.get("latex") or row.get("mathml") or row.get("artifact")):
            skipped += 1
            continue
        merged[media_hash] = row
        accepted += 1

    result = sorted(merged.values(), key=lambda item: item.get("hash", ""))
    print("=== EQUATION MAPPING MERGE ===")
    print(f"Base rows: {len(base_rows)}")
    print(f"Reviewed input rows: {len(reviewed_rows)}")
    print(f"Accepted reviewed rows: {accepted}")
    print(f"Skipped rows: {skipped}")
    print(f"Output rows: {len(result)}")
    print(f"Dry-run: {'yes' if dry_run else 'no'}")

    if not dry_run:
        write_rows(output_path, result)
        print(f"Wrote {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="data/equation_mapping.json")
    parser.add_argument("--reviewed", required=True)
    parser.add_argument("--output", default="data/equation_mapping.json")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    merge(args.base, args.reviewed, args.output, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
