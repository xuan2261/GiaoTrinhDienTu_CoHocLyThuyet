"""Build the deterministic content manifest from generated and curated inputs."""
import argparse
import os
import re

from content_manifest_utils import (
    canonical_json, normalize_logical_path, parse_bundle_pages, parse_page_map,
    parse_page_order, parse_quoted_map, parse_sim2_route_ids, read_text,
    repo_path, sha256_bytes, sha256_file,
)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = 1
CHAPTER_REFERENCE_PATH = "data/chapter-reference.json"


def local_refs(html, pattern):
    refs = []
    for value in re.findall(pattern, html, re.IGNORECASE):
        try:
            logical = normalize_logical_path(value)
        except ValueError:
            continue
        if logical not in refs:
            refs.append(logical)
    return sorted(refs)


def equation_refs(route_id, html):
    count = len(re.findall(r"<math\b|class=\"(?:mathml-inline|math-tex)\b", html, re.IGNORECASE))
    return [f"{route_id}#eq-{index}" for index in range(1, count + 1)]


def simulation_routes():
    source = read_text(os.path.join(ROOT, "js", "sim2", "sim2-route-manifest.js"))
    return set(parse_sim2_route_ids(source))


def build():
    docx_manifest_path = os.path.join(ROOT, "tools", "docx_site_manifest.json")
    import json
    with open(docx_manifest_path, encoding="utf-8") as fh:
        docx_manifest = json.load(fh)
    source = docx_manifest.get("source", {})
    source_path = normalize_logical_path(source.get("logicalPath"))
    if source.get("sha256") != sha256_file(repo_path(ROOT, source_path)):
        raise ValueError("DOCX source hash mismatch")
    chapter_reference_path = repo_path(ROOT, CHAPTER_REFERENCE_PATH)
    chapter_reference = {
        "logicalPath": CHAPTER_REFERENCE_PATH,
        "sha256": sha256_file(chapter_reference_path),
    }
    loader = read_text(os.path.join(ROOT, "js", "loader.js"))
    app = read_text(os.path.join(ROOT, "js", "app.js"))
    bundle = read_text(os.path.join(ROOT, "js", "pages.js"))
    page_map = parse_page_map(loader)
    breadcrumbs = parse_quoted_map(app, "BC")
    page_order = parse_page_order(app)
    bundled_routes = parse_bundle_pages(bundle)
    required_routes = {route for route, fragment in page_map.items() if fragment is not None}
    if set(bundled_routes) != required_routes:
        raise ValueError("bundle/PAGE_MAP mismatch")
    if set(page_order) != set(page_map):
        raise ValueError("PAGE_ORDER/PAGE_MAP mismatch")
    if set(breadcrumbs) != set(page_map):
        raise ValueError("BC/PAGE_MAP mismatch")
    sims = simulation_routes()
    routes = []
    for route_id in page_order:
        fragment = page_map[route_id]
        if fragment is None:
            continue
        logical_path = normalize_logical_path(fragment)
        html = read_text(repo_path(ROOT, logical_path))
        if not html.strip():
            raise ValueError(f"blank required fragment: {route_id} ({logical_path})")
        title = breadcrumbs[route_id]
        routes.append({
            "routeId": route_id,
            "title": title.split(" › ")[-1],
            "sourceHeadingPath": title.split(" › "),
            "chapterFile": logical_path,
            "bundleKey": route_id,
            "contentHash": sha256_bytes(html.encode("utf-8")),
            "figureRefs": local_refs(html, r'<img[^>]+src="([^"]+)"'),
            "equationRefs": equation_refs(route_id, html),
            "hasQuiz": route_id.endswith("-quiz"),
            "hasSimulation": route_id in sims,
        })
    manifest_source = {
        "logicalPath": source_path,
        "sha256": source["sha256"],
        "docxManifestSha256": sha256_file(docx_manifest_path),
        "chapterReference": chapter_reference,
    }
    pdf_path = os.path.join(ROOT, "CoHocLyThuyet.pdf")
    if os.path.isfile(pdf_path):
        manifest_source["pdf"] = {"logicalPath": "CoHocLyThuyet.pdf", "sha256": sha256_file(pdf_path)}
    manifest = {
        "schemaVersion": VERSION,
        "source": manifest_source,
        "generator": {"name": "tools/build_content_manifest.py", "version": VERSION},
        "routes": routes,
    }
    manifest["contentHash"] = sha256_bytes(canonical_json(manifest).encode("utf-8"))
    return manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="data/content-manifest.json")
    args = parser.parse_args()
    output = repo_path(ROOT, normalize_logical_path(args.output))
    manifest = build()
    with open(output, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(__import__("json").dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(f"Content manifest: {args.output} ({len(manifest['routes'])} routes, {manifest['contentHash']})")


if __name__ == "__main__":
    main()
