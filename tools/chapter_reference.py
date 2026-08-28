"""Validate and render curated chapter reference data for generated indexes."""
import html
import json
import re
from pathlib import Path

CHAPTER_IDS = ("ch1", "ch2", "ch3")
KINDS = ("symbol", "abbreviation", "unit")
KIND_LABELS = {
    "symbol": "Ký hiệu",
    "abbreviation": "Chữ viết tắt",
    "unit": "Đơn vị",
}
ENTRY_ID = re.compile(r"^ch[123]-[a-z0-9-]+$")


def load_chapter_reference(path):
    path = Path(path)
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"chapter reference {path}: {error}") from error


def _exact_keys(value, allowed, label):
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be an object")
    unexpected = sorted(set(value) - set(allowed))
    if unexpected:
        raise ValueError(f"{label} contains unexpected fields: {', '.join(unexpected)}")


def _text(value, label):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{label} must be non-empty text")


def validate_chapter_reference(data, route_catalog):
    _exact_keys(data, ("schemaVersion", "chapters"), "chapter reference")
    if data.get("schemaVersion") != 1:
        raise ValueError("chapter reference schemaVersion must be 1")
    chapters = data.get("chapters")
    if not isinstance(chapters, dict) or tuple(chapters) != CHAPTER_IDS:
        raise ValueError("chapter reference must contain exactly ch1, ch2, ch3 in order")
    identifiers = set()
    for chapter_id in CHAPTER_IDS:
        chapter = chapters[chapter_id]
        _exact_keys(chapter, ("entries",), chapter_id)
        entries = chapter.get("entries")
        if not isinstance(entries, list) or not entries:
            raise ValueError(f"{chapter_id}.entries must be a non-empty array")
        kinds = set()
        allowed_routes = set(route_catalog.get(chapter_id, ()))
        for entry in entries:
            identifier = entry.get("id") if isinstance(entry, dict) else None
            label = identifier or f"{chapter_id} entry"
            _exact_keys(entry, ("id", "kind", "tex", "label", "meaning", "unit", "sourceRoutes"), label)
            if not isinstance(identifier, str) or not ENTRY_ID.fullmatch(identifier) or not identifier.startswith(f"{chapter_id}-"):
                raise ValueError(f"{label} has an invalid ID")
            if identifier in identifiers:
                raise ValueError(f"duplicate chapter reference ID: {identifier}")
            identifiers.add(identifier)
            if entry.get("kind") not in KINDS:
                raise ValueError(f"{identifier} has an unsupported kind")
            kinds.add(entry["kind"])
            has_tex = isinstance(entry.get("tex"), str) and entry["tex"].strip()
            has_label = isinstance(entry.get("label"), str) and entry["label"].strip()
            if has_tex == has_label:
                raise ValueError(f"{identifier} must contain exactly one of tex or label")
            _text(entry.get("meaning"), f"{identifier}.meaning")
            if "unit" in entry:
                _text(entry["unit"], f"{identifier}.unit")
            routes = entry.get("sourceRoutes")
            if not isinstance(routes, list) or not routes or not all(isinstance(route, str) and route for route in routes):
                raise ValueError(f"{identifier}.sourceRoutes must be a non-empty string array")
            if len(routes) != len(set(routes)):
                raise ValueError(f"{identifier}.sourceRoutes contains duplicate routes")
            for route in routes:
                if route not in allowed_routes:
                    raise ValueError(f"{identifier} has invalid same-chapter source route: {route}")
        if kinds != set(KINDS):
            raise ValueError(f"{chapter_id} must contain symbol, abbreviation, and unit entries")
    return data


def _display(entry):
    if "tex" in entry:
        return f'<span class="math-tex">\\({html.escape(entry["tex"])}\\)</span>'
    return html.escape(entry["label"])


def render_chapter_reference(chapter_id, entries):
    rows = []
    for kind in KINDS:
        grouped = [entry for entry in entries if entry["kind"] == kind]
        if not grouped:
            continue
        rows.append(f'        <tr class="chapter-reference-group"><th scope="rowgroup" colspan="4">{KIND_LABELS[kind]}</th></tr>')
        for entry in grouped:
            links = ", ".join(
                f'<a href="#{html.escape(route, quote=True)}">Xem lần đầu</a>'
                for route in entry["sourceRoutes"]
            )
            unit = html.escape(entry.get("unit", "—"))
            rows.append(
                "        <tr>"
                f'<th scope="row">{_display(entry)}</th>'
                f'<td>{html.escape(entry["meaning"])}</td>'
                f'<td>{unit}</td>'
                f'<td>{links}</td>'
                "</tr>"
            )
    heading_id = f"{chapter_id}-reference-heading"
    return "\n".join([
        f'<section class="chapter-reference" aria-labelledby="{heading_id}">',
        f'  <h3 id="{heading_id}">Tra cứu ký hiệu, chữ viết tắt và đơn vị</h3>',
        f'  <p class="chapter-reference-summary">{len(entries)} mục tra cứu của chương.</p>',
        "  <details open>",
        "    <summary>Mở bảng tra cứu</summary>",
        '    <div class="chapter-reference-scroll">',
        "      <table>",
        "        <caption>Tra cứu ký hiệu, chữ viết tắt và đơn vị</caption>",
        "        <thead><tr><th scope=\"col\">Ký hiệu</th><th scope=\"col\">Ý nghĩa</th><th scope=\"col\">Đơn vị</th><th scope=\"col\">Lần dùng đầu</th></tr></thead>",
        "        <tbody>",
        *rows,
        "        </tbody>",
        "      </table>",
        "    </div>",
        "  </details>",
        "</section>",
    ])
