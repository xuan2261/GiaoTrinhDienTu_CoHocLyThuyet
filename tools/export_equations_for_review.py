"""
Export reviewed-mapping template for legacy equation images.

Usage:
  python tools/export_equations_for_review.py --input tools/equation_report.json --output data/equation_mapping.template.json
"""
import argparse
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")


def load_report(path):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return data.get("items", data if isinstance(data, list) else [])


def export_template(input_path, output_path):
    items = load_report(input_path)
    grouped = {}
    for item in items:
        media_hash = item.get("hash")
        prog_id = item.get("prog_id") or ""
        kind = item.get("kind")
        if not media_hash or not prog_id.startswith("Equation.") or kind not in ("math-inline", "math-display"):
            continue
        current = grouped.setdefault(media_hash, {
            "hash": media_hash,
            "latex": "",
            "mathml": "",
            "source": "manual-review",
            "reviewed": False,
            "notes": "",
            "examples": [],
        })
        if len(current["examples"]) < 5:
            current["examples"].append({
                "media": item.get("media"),
                "output": item.get("output"),
                "kind": kind,
                "chapter": item.get("chapter"),
                "paragraph_index": item.get("paragraph_index"),
                "text_context": item.get("text_context"),
            })

    result = sorted(grouped.values(), key=lambda row: row["hash"])
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=2)
    print(f"Exported {len(result)} unique equation mapping rows to {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="tools/equation_report.json")
    parser.add_argument("--output", default="data/equation_mapping.template.json")
    args = parser.parse_args()
    export_template(args.input, args.output)


if __name__ == "__main__":
    main()
