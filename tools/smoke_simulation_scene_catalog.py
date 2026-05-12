"""Gate route-specific simulation scene catalog identity."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from smoke_simulation_runtime import resolve_route_filter
from smoke_simulation_routes import SIMULATIONS_FILE, parse_sim_map, read_text

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
SCENE_REGISTRY = ROOT / "js" / "sim-scene-registry.js"
SCENE_TEMPLATES = ROOT / "js" / "sim-scene-templates.js"
SCENE_ROOT = ROOT / "js" / "sims"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate route scene catalog identity.")
    parser.add_argument("--report-current", action="store_true")
    parser.add_argument("--expect-duplicates", action="store_true")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--require-routes", type=int)
    parser.add_argument("--routes", nargs="*", default=[])
    return parser.parse_args()


def known_routes() -> set[str]:
    return {route for route, _expr in parse_sim_map(read_text(SIMULATIONS_FILE))}


def scene_files() -> list[Path]:
    if not SCENE_ROOT.exists():
        return []
    return sorted(SCENE_ROOT.rglob("*-scenes.js"))


def fallback_signatures(routes: set[str]) -> dict[str, str]:
    signatures: dict[str, str] = {}
    for route in routes:
        if route.startswith("ch1-"):
            signatures[route] = "legacy-statics"
        elif route.startswith("ch2-1-1"):
            signatures[route] = "legacy-kinematics-preset"
        elif route.startswith("ch2-5-2"):
            signatures[route] = "legacy-kinematics-instant-center"
        elif route.startswith("ch2-"):
            signatures[route] = "legacy-kinematics"
        else:
            signatures[route] = "legacy-dynamics"
    return signatures


def load_scene_signatures() -> dict[str, str]:
    files = [SCENE_REGISTRY, SCENE_TEMPLATES, *scene_files()]
    if not SCENE_REGISTRY.exists() or not SCENE_TEMPLATES.exists() or not scene_files():
        return {}
    scripts = ",\n".join(repr(str(path.relative_to(ROOT)).replace("\\", "/")) for path in files)
    harness = rf"""
const fs = require('fs');
const vm = require('vm');
const warnings = [];
const context = {{
  console: {{ warn: (...args) => warnings.push(args.join(' ')) }},
  window: {{}}
}};
context.window.window = context.window;
vm.createContext(context);
for (const script of [{scripts}]) {{
  vm.runInContext(fs.readFileSync(script, 'utf8'), context, {{ filename: script }});
}}
const registry = context.window.SimSceneRegistry;
const templates = context.window.SimSceneTemplates;
const entries = registry && registry.entries ? registry.entries() : {{}};
const signatures = {{}};
Object.keys(entries).forEach(routeId => {{
  const scene = entries[routeId];
  signatures[routeId] = templates && templates.signature
    ? templates.signature(scene)
    : JSON.stringify(scene);
}});
console.log(JSON.stringify(signatures));
"""
    result = subprocess.run(
        ["node", "-e", harness],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
        capture_output=True,
    )
    if result.returncode != 0:
        raise RuntimeError((result.stderr or result.stdout).strip())
    return json.loads(result.stdout or "{}")


def duplicate_groups(signatures: dict[str, str], selected: set[str]) -> dict[str, list[str]]:
    groups: dict[str, list[str]] = {}
    for route in sorted(selected):
        groups.setdefault(signatures.get(route, "missing"), []).append(route)
    return {key: routes for key, routes in groups.items() if len(routes) > 1}


def main() -> int:
    args = parse_args()
    errors: list[str] = []
    routes = known_routes()
    selected, filter_errors = resolve_route_filter(args.routes, routes)
    errors.extend(filter_errors)
    route_count_target = selected if args.routes else routes
    if args.require_routes is not None and len(route_count_target) != args.require_routes:
        errors.append(f"Expected {args.require_routes} SIM_MAP routes, found {len(route_count_target)}")
    try:
        signatures = load_scene_signatures()
    except RuntimeError as exc:
        print("simulation-scene-catalog: FAIL")
        print(f"- Scene catalog execution failed: {exc}")
        return 1
    if not signatures:
        signatures = fallback_signatures(routes)
    missing = sorted(route for route in selected if route not in signatures)
    duplicates = duplicate_groups(signatures, selected)

    print(f"SIM_MAP routes: {len(routes)}")
    print(f"Selected routes: {len(selected)}")
    print(f"Scene signatures: {len(signatures)}")
    if missing:
        print(f"Missing scene routes: {', '.join(missing)}")
    if duplicates:
        print("Duplicate scene signatures:")
        for signature, group in sorted(duplicates.items()):
            print(f"- {signature}: {', '.join(group)}")
    else:
        print("Duplicate scene signatures: none")

    if args.strict:
        if missing:
            errors.append(f"Routes missing scene signatures: {', '.join(missing)}")
        if duplicates:
            errors.append(f"Duplicate scene signatures: {len(duplicates)} group(s)")
    if args.expect_duplicates and not duplicates:
        errors.append("Expected duplicate scene signatures, found none")

    if errors:
        print("simulation-scene-catalog: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print("simulation-scene-catalog: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
