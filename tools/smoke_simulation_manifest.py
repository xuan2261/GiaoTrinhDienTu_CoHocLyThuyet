"""Smoke checks for simulation route metadata manifest."""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

from smoke_simulation_routes import SIMULATIONS_FILE, parse_sim_map, read_text

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "js" / "sim-route-manifest.js"
DIRECT_INTERACTION_RE = re.compile(
    r"\b(drag|direct|pointer|handle|touch|placement|manipulation)\b",
    flags=re.I,
)


@dataclass
class RouteMetadata:
    route_id: str
    body: str

    @property
    def objective(self) -> str:
        match = re.search(r"\bobjective\s*:\s*(['\"])(?P<value>.*?)\1", self.body, flags=re.S)
        return match.group("value").strip() if match else ""

    @property
    def interaction(self) -> str:
        match = re.search(r"\binteraction\s*:\s*(?P<value>\[[\s\S]*?\]|['\"].*?['\"]|\w+)", self.body)
        return match.group("value") if match else ""

    @property
    def checkpoint_count(self) -> int:
        return 0  # checkpoints removed — simple shell refactor

    @property
    def has_direct_interaction(self) -> bool:
        return bool(DIRECT_INTERACTION_RE.search(self.interaction))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate simulation route manifest metadata.")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--allow-missing-manifest", action="store_true", help="Deprecated bootstrap flag; missing manifest now fails after Phase 05.")
    parser.add_argument("--routes", nargs="*", default=[], help="Route ids or prefixes, comma-separated or spaced.")
    parser.add_argument("--require-routes", type=int)
    parser.add_argument("--require-objectives", action="store_true")
    parser.add_argument("--require-direct", action="store_true")
    parser.add_argument("--require-checkpoints-min", type=int)
    return parser.parse_args()


def route_tokens(values: list[str]) -> list[str]:
    tokens: list[str] = []
    for value in values:
        tokens.extend(item.strip() for item in value.split(",") if item.strip())
    return tokens


def resolve_route_filter(values: list[str], expected_routes: set[str]) -> tuple[set[str], list[str]]:
    tokens = route_tokens(values)
    if not tokens:
        return set(expected_routes), []
    selected: set[str] = set()
    errors: list[str] = []
    for token in tokens:
        if token in expected_routes:
            selected.add(token)
            continue
        prefix = token if token.endswith("-") else f"{token}-"
        matches = {route for route in expected_routes if route.startswith(prefix)}
        if matches:
            selected.update(matches)
        else:
            errors.append(f"Unknown route filter: {token}")
    return selected, errors


def find_matching(text: str, start: int, open_char: str, close_char: str) -> int:
    depth = 0
    quote: str | None = None
    escaped = False
    for index in range(start, len(text)):
        char = text[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in ("'", '"', "`"):
            quote = char
        elif char == open_char:
            depth += 1
        elif char == close_char:
            depth -= 1
            if depth == 0:
                return index
    return -1


def assignment_body(text: str) -> str:
    markers = (
        "window.SIM_ROUTE_MANIFEST",
        "const SIM_ROUTE_MANIFEST",
        "let SIM_ROUTE_MANIFEST",
        "var SIM_ROUTE_MANIFEST",
    )
    marker_index = -1
    for marker in markers:
        marker_index = text.find(marker)
        if marker_index >= 0:
            break
    if marker_index < 0:
        raise ValueError("Cannot find SIM_ROUTE_MANIFEST assignment")
    start = text.find("{", marker_index)
    if start < 0:
        raise ValueError("Cannot find SIM_ROUTE_MANIFEST object body")
    end = find_matching(text, start, "{", "}")
    if end < 0:
        raise ValueError("SIM_ROUTE_MANIFEST object braces are not balanced")
    return text[start + 1 : end]


def parse_manifest(text: str) -> dict[str, RouteMetadata]:
    body = assignment_body(text)
    routes: dict[str, RouteMetadata] = {}
    key_re = re.compile(r"['\"](?P<route>ch\d+-\d+-\d+)['\"]\s*:\s*\{")
    for match in key_re.finditer(body):
        start = body.find("{", match.end() - 1)
        end = find_matching(body, start, "{", "}")
        if end < 0:
            raise ValueError(f"Metadata block braces are not balanced: {match.group('route')}")
        route_id = match.group("route")
        routes[route_id] = RouteMetadata(route_id, body[start + 1 : end])
    return routes


def expected_routes() -> set[str]:
    return {route for route, _expr in parse_sim_map(read_text(SIMULATIONS_FILE))}


def main() -> int:
    args = parse_args()
    errors: list[str] = []
    try:
        sim_routes = expected_routes()
    except (FileNotFoundError, ValueError) as exc:
        print(f"simulation-manifest-smoke: FAIL")
        print(f"- Parser error: {exc}")
        return 1

    selected_routes, route_filter_errors = resolve_route_filter(args.routes, sim_routes)
    errors.extend(route_filter_errors)
    strict_mode = any(
        (
            args.require_routes is not None,
            args.require_objectives,
            args.require_direct,
            args.require_checkpoints_min is not None,
            args.routes,
        )
    )

    if not args.manifest.exists():
        print(f"Manifest: missing ({args.manifest.relative_to(ROOT) if args.manifest.is_relative_to(ROOT) else args.manifest})")
        errors.append("Manifest missing")
        if args.allow_missing_manifest:
            errors.append("--allow-missing-manifest is deprecated after Phase 05")
        print("simulation-manifest-smoke: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    try:
        manifest = parse_manifest(args.manifest.read_text(encoding="utf-8"))
    except (FileNotFoundError, ValueError) as exc:
        print(f"simulation-manifest-smoke: FAIL")
        print(f"- Parser error: {exc}")
        return 1

    manifest_routes = set(manifest)
    missing_from_sim_map = sorted(manifest_routes - sim_routes)
    missing_from_manifest = sorted(sim_routes - manifest_routes)

    print(f"Manifest routes: {len(manifest_routes)}")
    print(f"SIM_MAP routes: {len(sim_routes)}")
    if args.routes:
        print(f"Selected routes: {len(selected_routes)}")

    if args.require_routes is not None and len(manifest_routes) != args.require_routes:
        errors.append(f"Manifest route count {len(manifest_routes)} != required {args.require_routes}")
    if missing_from_sim_map:
        errors.append(f"Manifest routes not in SIM_MAP: {', '.join(missing_from_sim_map)}")
    missing_selected = sorted(selected_routes - manifest_routes)
    if strict_mode and missing_selected:
        errors.append(f"Selected SIM_MAP routes missing from manifest: {', '.join(missing_selected)}")

    target_routes = selected_routes if strict_mode else manifest_routes
    objective_missing = sorted(
        route for route in target_routes
        if route in manifest and not manifest[route].objective
    )
    direct_missing = sorted(
        route for route in target_routes
        if route in manifest and not manifest[route].has_direct_interaction
    )
    checkpoint_min = args.require_checkpoints_min or 0
    checkpoint_missing = sorted(
        route for route in target_routes
        if route in manifest and manifest[route].checkpoint_count < checkpoint_min
    )

    if args.require_objectives and objective_missing:
        errors.append(f"Routes missing objective: {', '.join(objective_missing)}")
    if args.require_direct and direct_missing:
        errors.append(f"Routes missing direct interaction declaration: {', '.join(direct_missing)}")
    if checkpoint_min and checkpoint_missing:
        errors.append(
            f"Routes below checkpoint minimum {checkpoint_min}: {', '.join(checkpoint_missing)}"
        )

    print(f"Objectives declared: {len(manifest_routes - set(objective_missing))}/{len(manifest_routes)}")
    print(f"Direct interactions declared: {len(manifest_routes - set(direct_missing))}/{len(manifest_routes)}")
    print(f"Checkpoints: removed (simple shell refactor)")

    if errors:
        print("simulation-manifest-smoke: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print("simulation-manifest-smoke: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
