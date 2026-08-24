"""Build the offline full-text search index from authoritative route fragments."""
from __future__ import annotations

import argparse
import json
import re
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

BLOCK_TAGS = {"p", "li", "dt", "dd", "td", "th", "figcaption", "button", "label", "option", "h1", "h2", "h3", "h4", "h5", "h6"}
HEADING_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6", "l3-title"}
SKIP_TAGS = {"script", "style", "template", "noscript"}


def normalize_text(value: str, fold: bool = False) -> str:
    value = " ".join(value.split()).lower()
    if fold:
        value = "".join(char for char in unicodedata.normalize("NFD", value) if unicodedata.category(char) != "Mn")
        value = value.replace("đ", "d")
    return value


def fnv1a(value: str) -> str:
    hash_value = 0x811C9DC5
    for byte in value.encode("utf-8"):
        hash_value ^= byte
        hash_value = (hash_value * 0x01000193) & 0xFFFFFFFF
    return f"{hash_value:08x}"


class VisibleBlocks(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[list[str]] = []
        self.active: list[tuple[str, int]] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in SKIP_TAGS:
            self.skip_depth += 1
            return
        classes = dict(attrs).get("class", "").split()
        block_tag = "l3-title" if tag == "div" and "l3-title" in classes else tag
        if self.skip_depth or block_tag not in BLOCK_TAGS | {"l3-title"}:
            return
        index = len(self.blocks)
        self.blocks.append([block_tag, ""])
        self.active.append((tag, index))

    def handle_startendtag(self, tag: str, attrs) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        if self.skip_depth:
            if tag in SKIP_TAGS:
                self.skip_depth -= 1
            return
        for index in range(len(self.active) - 1, -1, -1):
            if self.active[index][0] == tag:
                self.active.pop(index)
                break

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        for _, index in self.active:
            self.blocks[index][1] += data


def visible_blocks(html: str) -> list[tuple[str, str]]:
    parser = VisibleBlocks()
    parser.feed(html)
    parser.close()
    result = []
    for tag, content in parser.blocks:
        text = " ".join(content.split())
        if text:
            result.append((tag, text))
    return result


def glossary_terms(root: Path) -> dict[str, str]:
    source = (root / "js" / "glossary.js").read_text(encoding="utf-8")
    match = re.search(r"const TERMS = \{(.*?)\n  \};", source, re.S)
    if not match:
        return {}
    return {term: definition.replace("\\'", "'") for term, definition in re.findall(r"'([^']+)':\s*'((?:\\'|[^'])*)'", match.group(1))}


def bundle_pages(root: Path) -> dict[str, str]:
    source = (root / "js" / "pages.js").read_text(encoding="utf-8")
    return {route_id: json.loads(payload) for route_id, payload in re.findall(r'PAGES\["([^"]+)"\] = ("(?:[^"\\]|\\.)*");', source)}

def entry(identifier: str, anchor: str, route_id: str, block_index: int, field: str, text: str, heading: str | None = None) -> dict:
    result = {"id": identifier, "anchor": anchor, "routeId": route_id, "blockIndex": block_index, "field": field, "text": text,
              "normalized": normalize_text(text), "folded": normalize_text(text, True)}
    if heading:
        result["heading"] = heading
    return result


def build_index(root: Path) -> dict:
    root = Path(root)
    terms = glossary_terms(root)
    manifest = json.loads((root / "data" / "content-manifest.json").read_text(encoding="utf-8"))
    bundle = bundle_pages(root)
    entries: list[dict] = []
    routes: list[dict] = []
    term_locations: dict[str, tuple[str, int, str | None]] = {}
    for route in manifest["routes"]:
        html = (root / route["chapterFile"]).read_text(encoding="utf-8")
        route_id = route["routeId"]
        bundled = bundle.get(route_id)
        if bundled != html:
            raise ValueError(f"bundle route mismatch: {route_id}")
        routes.append({"routeId": route_id, "title": route["title"], "chapterFile": route["chapterFile"],
                       "contentHash": route["contentHash"], "runtimeDigest": fnv1a(bundled)})

        title_anchor = f"search-{route_id}-title"
        entries.append(entry(title_anchor, title_anchor, route_id, -1, "title", route["title"]))
        heading = None
        for block_index, (tag, text) in enumerate(visible_blocks(html)):
            field = "heading" if tag in HEADING_TAGS else ("metadata" if tag in {"figcaption", "button", "label", "option"} else "body")
            if field == "heading":
                heading = text
            anchor = f"search-{route_id}-{block_index:04d}"
            entries.append(entry(anchor, anchor, route_id, block_index, field, text, heading if field == "body" else None))
            folded_text = normalize_text(text, True)
            for term in terms:
                if term not in term_locations and normalize_text(term, True) in folded_text:
                    term_locations[term] = (route_id, block_index, heading)
    for term, definition in terms.items():
        if term in term_locations:
            route_id, block_index, heading = term_locations[term]
            slug = re.sub(r"[^a-z0-9]+", "-", normalize_text(term, True)).strip("-")
            anchor = f"search-{route_id}-glossary-{slug}"
            entries.append(entry(anchor, anchor, route_id, block_index, "metadata", f"{term}: {definition}", heading))
    glossary_digest = fnv1a(json.dumps(terms, ensure_ascii=False, separators=(",", ":")))
    return {"schemaVersion": 1, "contentManifestHash": manifest["contentHash"], "glossaryDigest": glossary_digest, "routes": routes, "entries": entries}


def validate_index(index: dict, manifest: dict) -> list[str]:
    errors: list[str] = []
    if index.get("schemaVersion") != 1:
        errors.append("unsupported schema version")
    if index.get("contentManifestHash") != manifest.get("contentHash"):
        errors.append("content manifest hash mismatch")
    expected = [route["routeId"] for route in manifest.get("routes", [])]
    actual = [route.get("routeId") for route in index.get("routes", [])]
    if actual != expected:
        errors.append("route coverage mismatch")
    for field, message in (("id", "duplicate entry id"), ("anchor", "duplicate entry anchor")):
        values = [entry.get(field) for entry in index.get("entries", [])]
        if len(values) != len(set(values)):
            errors.append(message)
    return errors


def write_outputs(root: Path, index: dict) -> None:
    payload = json.dumps(index, ensure_ascii=False, separators=(",", ":")) + "\n"
    (root / "data" / "search-index.json").write_text(payload, encoding="utf-8")
    (root / "js" / "search-index.js").write_text("window.SEARCH_INDEX = " + payload, encoding="utf-8")




def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    index = build_index(args.root)
    manifest = json.loads((args.root / "data" / "content-manifest.json").read_text(encoding="utf-8"))
    errors = validate_index(index, manifest)
    if errors:
        raise SystemExit("; ".join(errors))
    write_outputs(args.root, index)


if __name__ == "__main__":
    main()
