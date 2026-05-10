"""
Prefill equation mapping rows with LaTeX from local math OCR or a Vision LLM.

Dry-run writes a structurally valid output without calling any provider.
Local OCR supports optional pix2tex/Pix2Text installs and keeps reviewed=false.
Cloud OCR remains an optional fallback via GEMINI_API_KEY/GOOGLE_API_KEY or OPENAI_API_KEY.
"""
import argparse
import base64
import importlib.util
import json
import os
import sys
import time
import urllib.error
import urllib.request

try:
    from validate_equation_mapping import katex_parse_errors, latex_balanced
except ImportError:
    from .validate_equation_mapping import katex_parse_errors, latex_balanced

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IMAGE_ROOT = os.path.join(ROOT, "images")
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def load_rows(path):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        return data.get("equations", data.get("items", []))
    return data


def write_rows(path, rows):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2)


def image_path_for(row):
    for example in row.get("examples", []):
        output = example.get("output")
        path = safe_image_path(output)
        if path:
            return path
    return None


def safe_image_path(output):
    if not output:
        return None
    path = output if os.path.isabs(output) else os.path.join(ROOT, output)
    path = os.path.abspath(path)
    image_root = os.path.abspath(IMAGE_ROOT)
    try:
        if os.path.commonpath([image_root, path]) != image_root:
            return None
    except ValueError:
        return None
    if os.path.splitext(path)[1].lower() not in IMAGE_EXTENSIONS:
        return None
    if not os.path.isfile(path):
        return None
    return path


def post_json(url, payload, headers, timeout=90):
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def extract_json(text):
    text = (text or "").strip()
    if text.startswith("```"):
        lines = [line for line in text.splitlines() if not line.strip().startswith("```")]
        text = "\n".join(lines).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]
    return json.loads(text)


def prompt_for(row):
    examples = row.get("examples", [])
    context = examples[0].get("text_context", "") if examples else ""
    kind = examples[0].get("kind", "") if examples else ""
    return (
        "Convert this mathematical formula image to LaTeX only. "
        "Return strict JSON with keys: latex, notes. "
        "Do not include markdown fences. Do not invent surrounding prose. "
        f"Formula kind: {kind}. Nearby Vietnamese textbook context: {context}"
    )


def module_available(name):
    return importlib.util.find_spec(name) is not None


def install_hint(provider):
    if provider == "pix2text":
        return "Install Pix2Text in the Python environment first: python -m pip install pix2text"
    return "Install pix2tex in the Python environment first: python -m pip install pix2tex"


def build_local_model(provider_name):
    if provider_name == "pix2tex":
        try:
            from PIL import Image
            from pix2tex.cli import LatexOCR
        except ImportError as exc:
            raise RuntimeError(install_hint("pix2tex")) from exc
        return {"image": Image, "model": LatexOCR()}
    if provider_name == "pix2text":
        try:
            from pix2text import Pix2Text
        except ImportError as exc:
            raise RuntimeError(install_hint("pix2text")) from exc
        return Pix2Text.from_config(enable_table=False)
    return None


def pix2tex_ocr(local_model, image_path):
    image = local_model["image"].open(image_path)
    try:
        latex = local_model["model"](image)
    finally:
        image.close()
    return {
        "latex": latex,
        "notes": "Local pix2tex prefill; manual review required.",
    }


def pix2text_ocr(local_model, image_path):
    latex = local_model.recognize_formula(image_path)
    if isinstance(latex, list):
        latex = latex[0] if latex else ""
    if isinstance(latex, dict):
        latex = latex.get("latex") or latex.get("text") or latex.get("formula") or ""
    return {
        "latex": latex,
        "notes": "Local Pix2Text prefill; manual review required.",
    }


def gemini_ocr(row, image_path, api_key, model):
    with open(image_path, "rb") as fh:
        image_b64 = base64.b64encode(fh.read()).decode("ascii")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt_for(row)},
                {"inline_data": {"mime_type": "image/png", "data": image_b64}},
            ]
        }],
        "generationConfig": {"temperature": 0, "response_mime_type": "application/json"},
    }
    response = post_json(url, payload, {"Content-Type": "application/json"})
    text = response["candidates"][0]["content"]["parts"][0].get("text", "")
    return extract_json(text)


def openai_ocr(row, image_path, api_key, model):
    with open(image_path, "rb") as fh:
        image_b64 = base64.b64encode(fh.read()).decode("ascii")
    payload = {
        "model": model,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt_for(row)},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
            ],
        }],
    }
    response = post_json(
        "https://api.openai.com/v1/chat/completions",
        payload,
        {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
    )
    text = response["choices"][0]["message"].get("content", "")
    return extract_json(text)


def provider_candidates(provider):
    requested = (provider or "auto").lower()
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    candidates = []

    if requested == "pix2tex":
        if not module_available("pix2tex"):
            raise SystemExit(install_hint("pix2tex"))
        return [("pix2tex", None, "local")]
    if requested == "pix2text":
        if not module_available("pix2text"):
            raise SystemExit(install_hint("pix2text"))
        return [("pix2text", None, "local")]

    if requested in ("auto", "local") and module_available("pix2tex"):
        candidates.append(("pix2tex", None, "local"))
    if requested in ("auto", "local") and module_available("pix2text"):
        candidates.append(("pix2text", None, "local"))
    if requested == "local" and not candidates:
        raise SystemExit(
            "No local math OCR provider is installed. "
            f"{install_hint('pix2tex')} or {install_hint('pix2text')}"
        )

    if requested == "gemini":
        if not gemini_key:
            raise SystemExit("Set GEMINI_API_KEY or GOOGLE_API_KEY before using --provider gemini.")
        return [("gemini", gemini_key, os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))]
    if requested == "openai":
        if not openai_key:
            raise SystemExit("Set OPENAI_API_KEY before using --provider openai.")
        return [("openai", openai_key, os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini"))]

    if requested == "auto" and gemini_key:
        candidates.append(("gemini", gemini_key, os.getenv("GEMINI_MODEL", "gemini-1.5-flash")))
    if requested == "auto" and openai_key:
        candidates.append(("openai", openai_key, os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini")))
    if candidates:
        return candidates

    raise SystemExit(
        "No local math OCR provider or Vision LLM API key configured. "
        f"{install_hint('pix2tex')}; or set GEMINI_API_KEY/GOOGLE_API_KEY or OPENAI_API_KEY; "
        "or run with --dry-run to create a queue without OCR."
    )


def provider_contexts(provider):
    requested = (provider or "auto").lower()
    contexts = []
    init_errors = []
    for name, api_key, model in provider_candidates(requested):
        local_model = None
        if name in ("pix2tex", "pix2text"):
            try:
                local_model = build_local_model(name)
            except (RuntimeError, OSError, ValueError) as exc:
                if requested in ("pix2tex", "pix2text"):
                    raise SystemExit(str(exc)) from exc
                init_errors.append(f"{name}: {exc}")
                continue
        contexts.append({"name": name, "api_key": api_key, "model": model, "local_model": local_model})
    if contexts:
        return contexts, init_errors
    detail = f" Init errors: {'; '.join(init_errors)}" if init_errors else ""
    raise SystemExit(f"No usable OCR provider could be initialized.{detail}")


def run_provider(context, row, image_path):
    name = context["name"]
    if name == "pix2tex":
        return pix2tex_ocr(context["local_model"], image_path)
    if name == "pix2text":
        return pix2text_ocr(context["local_model"], image_path)
    if name == "gemini":
        return gemini_ocr(row, image_path, context["api_key"], context["model"])
    return openai_ocr(row, image_path, context["api_key"], context["model"])


def run_ocr(args):
    rows = load_rows(args.input)
    if args.katex_filter_only:
        output_rows = [dict(row) for row in rows]
        rejected = reject_unrenderable_latex(output_rows)
        processed, failed, skipped, provider_counts = summarize_output(output_rows)
        write_rows(args.output, output_rows)
        print("=== EQUATION OCR PREFILL ===")
        print(f"Input rows: {len(rows)}")
        print(f"Output: {args.output}")
        print("Provider chain: existing output")
        print(f"KaTeX rejected: {rejected}")
        if provider_counts:
            print_provider_counts(provider_counts)
        print(f"Processed: {processed}")
        print(f"Skipped: {skipped}")
        print(f"Failed: {failed}")
        return

    if args.limit is not None:
        rows_to_process = rows[:args.limit]
    else:
        rows_to_process = rows

    providers = []
    provider_init_errors = []
    if not args.dry_run:
        providers, provider_init_errors = provider_contexts(args.provider)

    output_rows = []
    processed = failed = skipped = 0
    provider_counts = {}
    for index, row in enumerate(rows):
        updated = dict(row)
        if index >= len(rows_to_process):
            output_rows.append(updated)
            continue
        if updated.get("reviewed"):
            skipped += 1
            output_rows.append(updated)
            continue
        image_path = image_path_for(updated)
        if not image_path:
            updated["notes"] = append_note(updated.get("notes"), "OCR skipped: no readable example image")
            failed += 1
            output_rows.append(updated)
            continue
        if args.dry_run:
            updated["source"] = "ocr-dry-run"
            updated["reviewed"] = False
            updated["notes"] = append_note(updated.get("notes"), "Dry-run only; no Vision LLM call was made.")
            processed += 1
            output_rows.append(updated)
            continue

        last_error = None
        for provider in providers:
            provider_name = provider["name"]
            for attempt in range(args.retries + 1):
                try:
                    result = run_provider(provider, updated, image_path)
                    latex = (result.get("latex") or "").strip()
                    if not latex:
                        raise ValueError("empty latex result")
                    if not latex_balanced(latex):
                        raise ValueError("latex delimiters/braces are not balanced")
                    updated["latex"] = latex
                    updated["source"] = f"{provider_name}:{provider['model']}"
                    updated["reviewed"] = False
                    updated["notes"] = append_note(updated.get("notes"), result.get("notes", ""))
                    provider_counts[provider_name] = provider_counts.get(provider_name, 0) + 1
                    processed += 1
                    last_error = None
                    break
                except Exception as exc:
                    last_error = f"{provider_name}: {exc}"
                    if attempt < args.retries:
                        time.sleep(args.sleep)
            if last_error is None:
                break
        if last_error is not None:
            updated["notes"] = append_note(updated.get("notes"), f"OCR failed: {last_error}")
            failed += 1
        output_rows.append(updated)
        if args.sleep and not args.dry_run:
            time.sleep(args.sleep)

    katex_rejected = 0
    if not args.dry_run and not args.no_katex_check:
        katex_rejected = reject_unrenderable_latex(output_rows)
        if katex_rejected:
            processed, failed, skipped, provider_counts = summarize_output(output_rows)

    write_rows(args.output, output_rows)
    print("=== EQUATION OCR PREFILL ===")
    print(f"Input rows: {len(rows)}")
    print(f"Output: {args.output}")
    if args.dry_run:
        print("Provider: dry-run")
    else:
        chain = ", ".join(f"{p['name']}:{p['model']}" for p in providers)
        print(f"Provider chain: {chain}")
        if provider_init_errors:
            print(f"Provider init warnings: {len(provider_init_errors)}")
            for warning in provider_init_errors[:5]:
                print(f"  WARN {warning}")
        if provider_counts:
            print_provider_counts(provider_counts)
        print(f"KaTeX check: {'disabled' if args.no_katex_check else 'enabled'}")
        print(f"KaTeX rejected: {katex_rejected}")
    print(f"Processed: {processed}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")


def append_note(current, addition):
    addition = (addition or "").strip()
    if not addition:
        return current or ""
    current = (current or "").strip()
    return f"{current} | {addition}" if current else addition


def reject_unrenderable_latex(rows):
    check_rows = []
    index_map = []
    for index, row in enumerate(rows):
        if row.get("reviewed"):
            continue
        source = row.get("source") or ""
        if not source or source in ("manual-review", "ocr-dry-run"):
            continue
        if (row.get("latex") or "").strip():
            check_rows.append(row)
            index_map.append(index)

    rejected = 0
    for error in katex_parse_errors(check_rows):
        row = rows[index_map[error["index"]]]
        source = row.get("source") or "ocr"
        row["latex"] = ""
        row["source"] = ""
        row["reviewed"] = False
        row["notes"] = append_note(
            row.get("notes"),
            f"OCR failed: KaTeX parse error from {source}: {error['message']}",
        )
        rejected += 1
    return rejected


def summarize_output(rows):
    processed = failed = skipped = 0
    provider_counts = {}
    for row in rows:
        notes = row.get("notes") or ""
        source = row.get("source") or ""
        if row.get("reviewed") and (row.get("latex") or row.get("mathml")):
            skipped += 1
        elif "OCR failed:" in notes or "OCR skipped:" in notes:
            failed += 1
        elif source and (row.get("latex") or row.get("mathml")):
            processed += 1
            provider = source.split(":", 1)[0]
            provider_counts[provider] = provider_counts.get(provider, 0) + 1
    return processed, failed, skipped, provider_counts


def print_provider_counts(provider_counts):
    used = ", ".join(f"{name}={count}" for name, count in sorted(provider_counts.items()))
    print(f"Provider successes: {used}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data/equation_mapping.template.json")
    parser.add_argument("--output", default="data/equation_mapping.ocr.json")
    parser.add_argument(
        "--provider",
        default="auto",
        choices=["auto", "local", "pix2tex", "pix2text", "gemini", "openai"],
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--sleep", type=float, default=0.0)
    parser.add_argument(
        "--no-katex-check",
        action="store_true",
        help="Do not reject OCR LaTeX that fails local KaTeX parsing.",
    )
    parser.add_argument(
        "--katex-filter-only",
        action="store_true",
        help="Only reject existing OCR LaTeX that fails local KaTeX parsing; do not call OCR providers.",
    )
    args = parser.parse_args()
    if args.limit is not None and args.limit <= 0:
        parser.error("--limit must be a positive integer")
    run_ocr(args)


if __name__ == "__main__":
    main()
