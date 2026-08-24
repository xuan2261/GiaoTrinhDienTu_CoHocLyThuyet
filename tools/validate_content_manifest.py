"""Validate content-manifest joins, provenance and deterministic hashes without dependencies."""
import json
import os
import re
import sys

from content_manifest_utils import (
    SHA256_RE, canonical_json, normalize_logical_path, parse_bundle_pages,
    parse_page_map, parse_page_order, parse_quoted_map, read_text, repo_path,
    sha256_bytes, sha256_file,
)
from build_content_manifest import equation_refs, local_refs, simulation_routes

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA_PATH = os.path.join(ROOT, "data", "schemas", "content-manifest.schema.json")


def schema_required_fields():
    with open(SCHEMA_PATH, encoding="utf-8") as fh:
        schema = json.load(fh)
    return schema["required"], schema["properties"]["routes"]["items"]["required"]


def fail(message):
    raise ValueError(message)

def exact_keys(value, required, optional, label):
    if not isinstance(value, dict):
        fail(f"{label} must be an object")
    required = set(required)
    allowed = required | set(optional)
    missing = sorted(required - set(value))
    extra = sorted(set(value) - allowed)
    if missing:
        fail(f"{label} missing required fields: {', '.join(missing)}")
    if extra:
        fail(f"{label} contains unexpected fields: {', '.join(extra)}")


def validate_schema_shape(manifest, top_required, route_required):
    exact_keys(manifest, top_required, (), "content manifest")
    if manifest["schemaVersion"] != 1:
        fail("unsupported content manifest schemaVersion")
    exact_keys(manifest["source"], ("logicalPath", "sha256", "docxManifestSha256"), ("pdf",), "content manifest source")
    for field in ("sha256", "docxManifestSha256"):
        if not isinstance(manifest["source"][field], str) or not SHA256_RE.fullmatch(manifest["source"][field]):
            fail(f"content manifest source {field} must be a SHA-256 hex digest")
    if "pdf" in manifest["source"]:
        exact_keys(manifest["source"]["pdf"], ("logicalPath", "sha256"), (), "PDF provenance")
        if not SHA256_RE.fullmatch(str(manifest["source"]["pdf"]["sha256"])):
            fail("PDF provenance sha256 must be a SHA-256 hex digest")
    exact_keys(manifest["generator"], ("name", "version"), (), "content manifest generator")
    if not isinstance(manifest["routes"], list) or not manifest["routes"]:
        fail("content manifest routes must be a non-empty array")
    if not SHA256_RE.fullmatch(str(manifest["contentHash"])):
        fail("content manifest contentHash must be a SHA-256 hex digest")
    route_id_re = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    for index, route in enumerate(manifest["routes"]):
        label = f"route[{index}]"
        exact_keys(route, route_required, (), label)
        for field in ("routeId", "bundleKey"):
            if not isinstance(route[field], str) or not route_id_re.fullmatch(route[field]):
                fail(f"{label} {field} has invalid format")
        if not isinstance(route["title"], str) or not route["title"].strip():
            fail(f"{label} title must be a non-empty string")
        if not isinstance(route["sourceHeadingPath"], list) or not route["sourceHeadingPath"] or not all(isinstance(value, str) and value.strip() for value in route["sourceHeadingPath"]):
            fail(f"{label} sourceHeadingPath must contain non-empty strings")
        if not isinstance(route["chapterFile"], str) or not route["chapterFile"].startswith("chapters/") or not route["chapterFile"].endswith(".html"):
            fail(f"{label} chapterFile must be a chapter HTML path")
        if not SHA256_RE.fullmatch(str(route["contentHash"])):
            fail(f"{label} contentHash must be a SHA-256 hex digest")
        for field in ("figureRefs", "equationRefs"):
            if not isinstance(route[field], list) or not all(isinstance(value, str) for value in route[field]):
                fail(f"{label} {field} must be an array of strings")
        if any(not value.startswith("images/") for value in route["figureRefs"]):
            fail(f"{label} figureRefs must use images/ logical paths")
        for field in ("hasQuiz", "hasSimulation"):
            if not isinstance(route[field], bool):
                fail(f"{label} {field} must be boolean")


def expected_tree_routes(docx_manifest):
    routes = set()
    for chapter in docx_manifest["chapters"]:
        chapter_id = f"ch{chapter['chapter']}"
        routes.add(chapter_id)
        for section in chapter["sections"]:
            routes.add(f"{chapter_id}-{section['section']}")
            for sub in section["subsections"]:
                if section["section"] == 7 and "Câu hỏi ôn tập" in sub["title"]:
                    routes.add(f"{chapter_id}-rev")
                else:
                    routes.add(f"{chapter_id}-{section['section']}-{sub['subsection']}")
    return routes


def validate():
    top_required, route_required = schema_required_fields()
    manifest_path = os.path.join(ROOT, "data", "content-manifest.json")
    with open(manifest_path, encoding="utf-8") as fh:
        manifest = json.load(fh)
    validate_schema_shape(manifest, top_required, route_required)
    source = manifest["source"]
    source_path = normalize_logical_path(source["logicalPath"])
    if source["sha256"] != sha256_file(repo_path(ROOT, source_path)):
        fail("DOCX source hash mismatch")
    docx_manifest_path = os.path.join(ROOT, "tools", "docx_site_manifest.json")
    with open(docx_manifest_path, encoding="utf-8") as fh:
        docx_manifest = json.load(fh)
    if docx_manifest.get("schemaVersion") != 1:
        fail("invalid DOCX manifest schemaVersion")
    docx_source = docx_manifest.get("source", {})
    docx_logical_path = normalize_logical_path(docx_source.get("logicalPath"))
    if docx_source.get("sha256") != sha256_file(repo_path(ROOT, docx_logical_path)):
        fail("DOCX manifest source hash mismatch")
    if docx_manifest.get("generator") != {"name": "tools/extract_docx.py", "version": 1}:
        fail("invalid DOCX manifest generator")
    if source["docxManifestSha256"] != sha256_file(docx_manifest_path):
        fail("DOCX manifest hash mismatch")
    if "pdf" in source:
        pdf = source["pdf"]
        if set(pdf) != {"logicalPath", "sha256"}:
            fail("PDF provenance must contain only logicalPath and sha256")
        pdf_path = normalize_logical_path(pdf["logicalPath"])
        if pdf["sha256"] != sha256_file(repo_path(ROOT, pdf_path)):
            fail("PDF provenance hash mismatch")
    if manifest["generator"] != {"name": "tools/build_content_manifest.py", "version": 1}:
        fail("invalid content manifest generator")
    loader = read_text(os.path.join(ROOT, "js", "loader.js"))
    app = read_text(os.path.join(ROOT, "js", "app.js"))
    page_map = parse_page_map(loader)
    page_order = parse_page_order(app)
    breadcrumbs = parse_quoted_map(app, "BC")
    bundle_routes = parse_bundle_pages(read_text(os.path.join(ROOT, "js", "pages.js")))
    required = {route for route, fragment in page_map.items() if fragment is not None}
    if set(bundle_routes) != required:
        fail("bundle/PAGE_MAP mismatch or orphan bundle route")
    if set(page_order) != set(page_map):
        fail("PAGE_ORDER/PAGE_MAP mismatch")
    if set(breadcrumbs) != set(page_map):
        fail("BC/PAGE_MAP mismatch")
    routes = manifest["routes"]
    ids = [route.get("routeId") for route in routes]
    if len(ids) != len(set(ids)):
        fail("duplicate route id in content manifest")
    if ids != [route for route in page_order if page_map[route] is not None]:
        fail("content manifest route ordering/parity mismatch")
    if set(ids) != required:
        fail("content manifest/PAGE_MAP mismatch or orphan route")
    sim_routes = simulation_routes()
    for route in routes:
        route_id = route["routeId"]
        logical_path = normalize_logical_path(route["chapterFile"])
        if logical_path != page_map[route_id] or route["bundleKey"] != route_id:
            fail(f"route {route_id} fragment/bundle mismatch")
        html = read_text(repo_path(ROOT, logical_path))
        if not html.strip():
            fail(f"route {route_id} has blank fragment")
        if route["contentHash"] != sha256_bytes(html.encode("utf-8")):
            fail(f"route {route_id} content hash mismatch")
        if route["title"] != breadcrumbs[route_id].split(" › ")[-1]:
            fail(f"route {route_id} title mismatch")
        if route["figureRefs"] != local_refs(html, r'<img[^>]+src="([^"]+)"'):
            fail(f"route {route_id} figure refs mismatch")
        if route["equationRefs"] != equation_refs(route_id, html):
            fail(f"route {route_id} equation refs mismatch")
        if route["hasQuiz"] != route_id.endswith("-quiz") or route["hasSimulation"] != (route_id in sim_routes):
            fail(f"route {route_id} quiz/simulation flags mismatch")
    copy = dict(manifest)
    actual_hash = copy.pop("contentHash")
    if actual_hash != sha256_bytes(canonical_json(copy).encode("utf-8")):
        fail("content manifest hash mismatch")
    with open(os.path.join(ROOT, "tools", "docx_site_manifest.json"), encoding="utf-8") as fh:
        docx_manifest = json.load(fh)
    if not expected_tree_routes(docx_manifest).issubset(required):
        fail("DOCX manifest route tree mismatch")


if __name__ == "__main__":
    try:
        validate()
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"content manifest validation failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
    print("content manifest validation: PASS")
