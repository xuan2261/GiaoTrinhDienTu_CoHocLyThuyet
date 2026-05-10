"""Smoke checks for simulation route wiring."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
INDEX_FILE = ROOT / "index.html"
SIMULATIONS_FILE = ROOT / "js" / "simulations.js"
SIM_ROUTE_MODULES_DIR = ROOT / "js" / "routes"
LEGACY_SIM_ROUTE_MODULES_DIR = ROOT / "js" / "sims"
MANIFEST_FILE = ROOT / "js" / "sim-route-manifest.js"
LOADER_FILE = ROOT / "js" / "loader.js"
PAGES_FILE = ROOT / "js" / "pages.js"
PLAN_DIR = ROOT / "plans" / "20260506-1045-interactive-mechanics-simulation-expansion"
DEFAULT_MATRIX_FILE = PLAN_DIR / "research" / "simulation-coverage-matrix.md"
DEFAULT_REPRESENTATIVE_ROUTES = ("ch1-1-4", "ch1-5-3", "ch2-4-4", "ch3-3-1", "ch3-6-2")
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate simulation route wiring.")
    parser.add_argument("--matrix", type=Path, default=DEFAULT_MATRIX_FILE)
    parser.add_argument("--representative-routes", nargs="*", default=DEFAULT_REPRESENTATIVE_ROUTES)
    parser.add_argument("--allow-missing-matrix", action="store_true")
    parser.add_argument("--require-fragments", action="store_true")
    parser.add_argument("--require-p1", action="store_true")
    return parser.parse_args()

def read_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(path)
    return path.read_text(encoding="utf-8")

def extract_object_body(text: str, marker: str) -> str:
    match = re.search(rf"{re.escape(marker)}\s*=\s*\{{(?P<body>[\s\S]*?)\}};", text)
    if not match:
        raise ValueError(f"Cannot find object body for {marker}")
    return match.group("body")


def parse_manifest_routes(text: str) -> list[str]:
    return [m.group("route") for m in re.finditer(r"""['"](?P<route>ch\d+-\d+-\d+)['"]\s*:\s*\{""", text)]


def index_script_sources() -> list[str]:
    if not INDEX_FILE.exists():
        return []
    return re.findall(r"""<script\b[^>]*\bsrc=["']([^"']+)["']""", read_text(INDEX_FILE))


def runtime_route_module_paths() -> list[Path]:
    paths = set()
    for source in index_script_sources():
        normalized = source.replace("\\", "/")
        if normalized == "js/routes/route-registry.js":
            continue
        is_route_source = normalized.startswith("js/routes/") or (
            normalized.startswith("js/sims/") and normalized.endswith("-routes.js")
        )
        path = ROOT / normalized
        if is_route_source and path.exists():
            paths.add(path)
    
    if SIM_ROUTE_MODULES_DIR.exists():
        for path in SIM_ROUTE_MODULES_DIR.rglob("*.js"):
            if path.name != "route-registry.js":
                paths.add(path)
                
    if LEGACY_SIM_ROUTE_MODULES_DIR.exists():
        for path in LEGACY_SIM_ROUTE_MODULES_DIR.rglob("*-routes.js"):
            paths.add(path)
            
    return sorted(list(paths))

def parse_sim_map(text: str) -> list[tuple[str, str]]:
    try:
        body = extract_object_body(text, "window.SIM_MAP")
    except ValueError:
        entries_map: dict[str, str] = {}
        module_parts = [path.read_text(encoding="utf-8") for path in runtime_route_module_paths()]
        body = "\n".join(module_parts)
        patterns = (
            re.compile(
                r"""\[\s*["'](?P<route>[\w-]+)["']\s*\]\s*=\s*(?P<expr>[^;\n]+)""",
                flags=re.MULTILINE,
            ),
            re.compile(
                r"""^\s*["'](?P<route>[\w-]+)["']\s*:\s*(?P<expr>[^,\n]+)""",
                flags=re.MULTILINE,
            ),
        )
        for pattern in patterns:
            for match in pattern.finditer(body):
                route = match.group("route")
                expr = match.group("expr").split("//", 1)[0].rstrip(",").strip()
                if route not in entries_map:
                    entries_map[route] = expr
        if not entries_map:
            raise ValueError("Cannot parse SIM_MAP fallback entries from route modules")
        if MANIFEST_FILE.exists():
            manifest_routes = parse_manifest_routes(read_text(MANIFEST_FILE))
            ordered = []
            for route in manifest_routes:
                ordered.append((route, entries_map.get(route, "")))
            return ordered
        return sorted(entries_map.items())

    key_pattern = re.compile(r"""["'](?P<route>ch\d+-\d+-\d+)["']\s*:""")
    entry_pattern = re.compile(
        r"""^\s*["'](?P<route>ch\d+-\d+-\d+)["']\s*(?::|=\s*(?:function|\{))\s*(?P<expr>.*?)"""
        r"""(?:,?\s*(?://.*)?$)""",
        flags=re.MULTILINE,
    )
    keys = [m.group("route") for m in key_pattern.finditer(body)]
    entries = [
        (m.group("route"), m.group("expr").split("//", 1)[0].rstrip(",").strip())
        for m in entry_pattern.finditer(body)
    ]
    if len(entries) != len(keys):
        parsed = {route for route, _expr in entries}
        missing = sorted(set(keys) - parsed)
        raise ValueError(f"Cannot parse SIM_MAP entries: {', '.join(missing)}")
    return entries

def parse_page_map(text: str) -> dict[str, str | None]:
    body = extract_object_body(text, "const PAGE_MAP")
    pattern = re.compile(
        r"""^\s*["'](?P<route>[^"']+)["']\s*:\s*(?:null|["'](?P<path>[^"']+)["'])""",
        flags=re.MULTILINE,
    )
    return {m.group("route"): m.group("path") for m in pattern.finditer(body)}

def parse_pages_bundle(text: str) -> set[str]:
    pattern = re.compile(r"""PAGES\[['"](?P<route>[^'"]+)['"]\]\s*=""")
    return {m.group("route") for m in pattern.finditer(text)}

def parse_matrix_rows(text: str) -> list[dict[str, str]]:
    pattern = re.compile(
        r"^\| (?P<route>ch\d+-\d+-\d+) \| (?P<topic>[^|]+) \| "
        r"(?P<interaction>[^|]+) \| (?P<priority>P\d) \|$",
        flags=re.MULTILINE,
    )
    return [
        {"route": m.group("route"), "priority": m.group("priority")}
        for m in pattern.finditer(text)
    ]

def find_duplicates(values: list[str]) -> list[str]:
    seen: set[str] = set()
    duplicates: set[str] = set()
    for value in values:
        duplicates.add(value) if value in seen else seen.add(value)
    return sorted(duplicates)

def route_source(route: str, fragment: str | None, bundled_routes: set[str]) -> str:
    if fragment and (ROOT / fragment).exists():
        return "fragment"
    if route in bundled_routes:
        return "bundle"
    return "missing"

def validate_routes(
    sim_entries: list[tuple[str, str]],
    page_map: dict[str, str | None],
    bundled_routes: set[str],
    sim_text: str,
    require_fragments: bool,
) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    if not sim_entries:
        errors.append("No SIM_MAP routes parsed")
    if not page_map:
        errors.append("No PAGE_MAP routes parsed")
    duplicates = find_duplicates([route for route, _expr in sim_entries])
    if duplicates:
        errors.append(f"Duplicate SIM_MAP routes: {', '.join(duplicates)}")

    for route, expr in sim_entries:
        fragment = page_map.get(route)
        if route not in page_map:
            errors.append(f"SIM_MAP route missing from PAGE_MAP: {route}")
            continue
        source = route_source(route, fragment, bundled_routes)
        if source == "missing":
            errors.append(f"No fragment or PAGES bundle entry for SIM_MAP route: {route}")
        elif source == "bundle" and require_fragments:
            errors.append(f"PAGE_MAP fragment missing for {route}: {fragment}")
        elif source == "bundle":
            warnings.append(f"Fragment missing but PAGES bundle exists for {route}: {fragment}")
        if re.match(r"^[A-Za-z_$][\w$]*$", expr):
            pattern = rf"\bfunction\s+{re.escape(expr)}\s*\(|\b(?:const|let|var)\s+{re.escape(expr)}\s*="
            if not re.search(pattern, sim_text):
                errors.append(f"SIM_MAP function missing for {route}: {expr}")
        elif not expr:
            errors.append(f"SIM_MAP expression missing for {route}")
    return errors, warnings

def print_coverage(sim_routes: set[str], matrix_rows: list[dict[str, str]]) -> list[str]:
    if not matrix_rows:
        print("Coverage matrix: not found or no route rows")
        return []
    matrix_routes = {row["route"] for row in matrix_rows}
    p1_routes = {row["route"] for row in matrix_rows if row["priority"] == "P1"}
    p1_missing = sorted(p1_routes - sim_routes)
    print(f"Coverage matrix routes: {len(matrix_routes)}")
    print(f"Covered by SIM_MAP: {len(matrix_routes & sim_routes)}/{len(matrix_routes)}")
    print(f"P1 covered: {len(p1_routes & sim_routes)}/{len(p1_routes)}")
    if p1_missing:
        print(f"P1 missing: {', '.join(p1_missing)}")
    return p1_missing

def main() -> int:
    args = parse_args()
    errors: list[str] = []
    try:
        sim_text = read_text(SIMULATIONS_FILE)
        page_map = parse_page_map(read_text(LOADER_FILE))
        sim_entries = parse_sim_map(sim_text)
        bundled_routes = parse_pages_bundle(read_text(PAGES_FILE)) if PAGES_FILE.exists() else set()
    except (FileNotFoundError, ValueError) as exc:
        print(f"Parser error: {exc}")
        return 1

    matrix_rows: list[dict[str, str]] = []
    if args.matrix.exists():
        matrix_rows = parse_matrix_rows(read_text(args.matrix))
        if not matrix_rows and not args.allow_missing_matrix:
            errors.append(f"Coverage matrix has no route rows: {args.matrix}")
    elif not args.allow_missing_matrix:
        errors.append(f"Coverage matrix missing: {args.matrix}")

    sim_routes = {route for route, _expr in sim_entries}
    route_errors, warnings = validate_routes(
        sim_entries, page_map, bundled_routes, sim_text, args.require_fragments
    )
    errors.extend(route_errors)

    print(f"SIM_MAP routes: {len(sim_entries)}")
    print(", ".join(sorted(sim_routes)))
    p1_missing = print_coverage(sim_routes, matrix_rows)
    if args.require_p1 and p1_missing:
        errors.append(f"P1 simulation routes missing: {', '.join(p1_missing)}")
    print("Representative route smoke:")
    for route in args.representative_routes:
        source = route_source(route, page_map.get(route), bundled_routes)
        has_sim = "yes" if route in sim_routes else "no"
        print(f"- {route}: source={source}, current_sim={has_sim}")

    if warnings:
        print("Warnings:")
        for warning in warnings:
            print(f"- {warning}")
    if errors:
        print("Errors:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("simulation-route-smoke: PASS")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
