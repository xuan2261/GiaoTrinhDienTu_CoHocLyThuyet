"""Gate strict route renderer identity contracts."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

from smoke_simulation_runtime import resolve_route_filter
from smoke_simulation_routes import SIMULATIONS_FILE, parse_sim_map, read_text

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
INDEX_FILE = ROOT / "index.html"
SCENE_TEMPLATES = ROOT / "js" / "sim-scene-templates.js"
SCENE_ROOT = ROOT / "js" / "sims"
LEGACY_RENDER_FUNCTIONS = (
    "drawStatics",
    "drawSupport",
    "drawSpatial",
    "drawFriction",
    "drawCentroid",
    "drawKinematics",
    "drawRotation",
    "drawRelative",
    "drawPlane",
    "drawDynamics",
    "drawOde",
    "drawTheorem",
    "drawCollision",
    "drawChecker",
)


class ScriptSrcParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.sources: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "script":
            return
        attrs_map = {name.lower(): value for name, value in attrs}
        src = attrs_map.get("src")
        if src:
            self.sources.append(src.replace("\\", "/"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate route renderer contracts.")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--report-current", action="store_true")
    parser.add_argument("--expect-fail", action="store_true")
    parser.add_argument("--require-routes", type=int)
    parser.add_argument("--allow-legacy-family-dispatch", action="store_true")
    parser.add_argument("--routes", nargs="*", default=[])
    return parser.parse_args()


def known_routes() -> set[str]:
    return {route for route, _expr in parse_sim_map(read_text(SIMULATIONS_FILE))}


def source_paths() -> list[str]:
    parser = ScriptSrcParser()
    parser.feed(INDEX_FILE.read_text(encoding="utf-8") if INDEX_FILE.exists() else "")
    ordered = []
    for src in parser.sources:
        if not (src.startswith("js/sim-") or src.startswith("js/sims/")):
            continue
        if src in {"js/sim-professional-lab.js", "js/sim-statics.js", "js/sim-kinematics.js", "js/sim-dynamics.js", "js/simulations.js"}:
            continue
        if (ROOT / src).exists():
            ordered.append(src)
    if ordered:
        return ordered
    fallback = [
        "js/sim-core.js",
        "js/sim-vector-math.js",
        "js/sim-rendering.js",
        "js/sim-scene-registry.js",
        "js/sim-scene-templates.js",
        "js/sim-route-renderer-primitives.js",
        "js/sim-route-renderer-registry.js",
        "js/sim-route-behavior-registry.js",
    ]
    existing = [path for path in fallback if (ROOT / path).exists()]
    if SCENE_ROOT.exists():
        for pattern in ("*-scenes*.js", "*-renderers*.js", "*-behaviors*.js"):
            existing.extend(path.relative_to(ROOT).as_posix() for path in sorted(SCENE_ROOT.rglob(pattern)))
    if (ROOT / "js" / "sim-route-manifest.js").exists():
        existing.append("js/sim-route-manifest.js")
    return existing


def load_contracts(selected: set[str]) -> dict[str, object]:
    scripts = ",\n".join(repr(path) for path in source_paths())
    routes = json.dumps(sorted(selected))
    harness = rf"""
const crypto = require('crypto');
const fs = require('fs');
const vm = require('vm');
const warnings = [];
const context = {{
  console: {{ warn: (...args) => warnings.push(args.join(' ')), error: (...args) => warnings.push(args.join(' ')) }},
  window: {{}},
  document: {{}}
}};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
for (const script of [{scripts}]) {{
  vm.runInContext(fs.readFileSync(script, 'utf8'), context, {{ filename: script }});
}}

function bodyHash(fn) {{
  if (typeof fn !== 'function') return '';
  const normalized = Function.prototype.toString.call(fn)
    .replace(/ch\d+-\d+-\d+/g, 'ROUTE')
    .replace(/`(?:\\\\.|[^`])*`/g, '`STR`')
    .replace(/'(?:\\\\.|[^'\\\\])*'/g, "'STR'")
    .replace(/"(?:\\\\.|[^"\\\\])*"/g, '"STR"')
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha1').update(normalized).digest('hex').slice(0, 12);
}}

const requested = new Set({routes});
const sceneEntries = context.window.SimSceneRegistry && context.window.SimSceneRegistry.entries
  ? context.window.SimSceneRegistry.entries()
  : {{}};
const rendererRegistry = context.window.SimRouteRenderers || null;
const behaviorRegistry = context.window.SimRouteBehaviors || null;
const rendererEntries = rendererRegistry && rendererRegistry.entries ? rendererRegistry.entries() : {{}};
const behaviorEntries = behaviorRegistry && behaviorRegistry.entries ? behaviorRegistry.entries() : {{}};
const manifest = context.window.SIM_ROUTE_MANIFEST || {{}};
const rendererRoutes = Object.keys(rendererEntries || {{}}).sort();
const identities = {{}};
const refMap = new Map();
let refCount = 0;
for (const routeId of requested) {{
  const entry = rendererEntries && rendererEntries[routeId]
    ? rendererEntries[routeId]
    : (rendererRegistry && rendererRegistry.get ? rendererRegistry.get(routeId) : null);
  const renderFn = entry && (entry.render || entry.renderFn || entry.fn);
  if (typeof renderFn === 'function' && !refMap.has(renderFn)) refMap.set(renderFn, `ref-${{++refCount}}`);
  identities[routeId] = {{
    routeId,
    sceneFamily: sceneEntries[routeId] ? sceneEntries[routeId].family || '' : '',
    rendererId: entry && (entry.rendererId || entry.id || '') || '',
    behaviorId: behaviorEntries[routeId] && (behaviorEntries[routeId].behaviorId || behaviorEntries[routeId].id || '') || '',
    explicitBehaviorId: Boolean(behaviorEntries[routeId] && behaviorEntries[routeId].explicitBehaviorId),
    functionName: typeof renderFn === 'function' ? renderFn.name || '' : '',
    functionRef: typeof renderFn === 'function' ? refMap.get(renderFn) : '',
    bodyHash: bodyHash(renderFn),
    manifestRendererId: manifest[routeId] && manifest[routeId].rendererId || '',
    manifestBehaviorId: manifest[routeId] && manifest[routeId].behaviorId || '',
  }};
}}

console.log(JSON.stringify({{
  hasRendererRegistry: Boolean(rendererRegistry),
  hasBehaviorRegistry: Boolean(behaviorRegistry),
  sceneRoutes: Object.keys(sceneEntries).sort(),
  rendererRoutes,
  behaviorRoutes: Object.keys(behaviorEntries || {{}}).sort(),
  identities,
  warnings,
}}));
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


def render_scene_body() -> str:
    if not SCENE_TEMPLATES.exists():
        return ""
    text = SCENE_TEMPLATES.read_text(encoding="utf-8")
    match = re.search(r"function\s+renderScene\s*\([^)]*\)\s*\{(?P<body>[\s\S]*?)\n\}", text)
    return match.group("body") if match else ""


def uses_family_dispatch() -> bool:
    body = render_scene_body()
    if re.search(r"\bscene\s*\.\s*family\b", body):
        return True
    return any(re.search(rf"\b{name}\s*\(", body) for name in LEGACY_RENDER_FUNCTIONS)


def duplicate_groups(values: dict[str, str]) -> dict[str, list[str]]:
    groups: dict[str, list[str]] = {}
    for route, value in sorted(values.items()):
        if value:
            groups.setdefault(value, []).append(route)
    return {key: routes for key, routes in groups.items() if len(routes) > 1}


def collect_errors(
    selected: set[str],
    contracts: dict[str, object],
    require_routes: int | None,
    allow_legacy_family_dispatch: bool,
) -> list[str]:
    errors: list[str] = []
    identities = contracts.get("identities", {})
    renderer_routes = set(contracts.get("rendererRoutes", []))
    behavior_routes = set(contracts.get("behaviorRoutes", []))
    scene_routes = set(contracts.get("sceneRoutes", []))
    if require_routes is not None and len(selected) != require_routes:
        errors.append(f"Expected {require_routes} SIM_MAP routes, found {len(selected)}")
    missing_scenes = sorted(selected - scene_routes)
    if missing_scenes:
        errors.append(f"Routes missing scene catalog entries: {', '.join(missing_scenes)}")
    if not contracts.get("hasRendererRegistry"):
        errors.append("Missing renderer registry: window.SimRouteRenderers is not defined")
    if not contracts.get("hasBehaviorRegistry"):
        errors.append("Missing behavior registry: window.SimRouteBehaviors is not defined")
    missing_renderers = sorted(selected - renderer_routes)
    missing_behaviors = sorted(selected - behavior_routes)
    if missing_renderers:
        errors.append(f"Routes missing dedicated renderer registrations: {', '.join(missing_renderers)}")
    if missing_behaviors:
        errors.append(f"Routes missing behavior registrations: {', '.join(missing_behaviors)}")
    if uses_family_dispatch() and not allow_legacy_family_dispatch:
        errors.append("Family dispatch detected: SimSceneTemplates.renderScene selects final renderer by scene.family")

    renderer_ids = {route: item.get("rendererId", "") for route, item in identities.items()}
    behavior_ids = {route: item.get("behaviorId", "") for route, item in identities.items()}
    function_names = {route: item.get("functionName", "") for route, item in identities.items()}
    function_refs = {route: item.get("functionRef", "") for route, item in identities.items()}
    body_hashes = {route: item.get("bodyHash", "") for route, item in identities.items()}

    blank_ids = sorted(route for route, value in renderer_ids.items() if not value)
    blank_behavior_ids = sorted(route for route, value in behavior_ids.items() if not value)
    implicit_behavior_ids = sorted(
        route for route, item in identities.items()
        if item.get("behaviorId") and not item.get("explicitBehaviorId")
    )
    blank_names = sorted(route for route, value in function_names.items() if not value)
    blank_hashes = sorted(route for route, value in body_hashes.items() if not value)
    if blank_ids:
        errors.append(f"Routes missing rendererId: {', '.join(blank_ids)}")
    if blank_behavior_ids:
        errors.append(f"Routes missing behaviorId: {', '.join(blank_behavior_ids)}")
    if implicit_behavior_ids:
        errors.append(f"Routes missing explicit behaviorId contracts: {', '.join(implicit_behavior_ids)}")
    if blank_names:
        errors.append(f"Routes missing named renderer functions: {', '.join(blank_names)}")
    if blank_hashes:
        errors.append(f"Routes missing renderer body hash: {', '.join(blank_hashes)}")
    for label, values in (
        ("Duplicate rendererId", renderer_ids),
        ("Duplicate behaviorId", behavior_ids),
        ("Duplicate renderer function name", function_names),
        ("Duplicate renderer function reference", function_refs),
        ("Duplicate normalized renderer body hash", body_hashes),
    ):
        duplicates = duplicate_groups(values)
        if duplicates:
            preview = "; ".join(f"{key}: {', '.join(group)}" for key, group in sorted(duplicates.items())[:5])
            errors.append(f"{label}: {preview}")
    return errors


def print_report(selected: set[str], contracts: dict[str, object], errors: list[str]) -> None:
    identities = contracts.get("identities", {})
    families = {
        route: item.get("sceneFamily", "")
        for route, item in identities.items()
        if item.get("sceneFamily")
    }
    family_groups = duplicate_groups(families)
    renderer_ids = {
        route: item.get("rendererId", "")
        for route, item in identities.items()
        if item.get("rendererId")
    }
    behavior_ids = {
        route: item.get("behaviorId", "")
        for route, item in identities.items()
        if item.get("behaviorId")
    }
    print(f"SIM_MAP routes: {len(selected)}")
    print(f"Scene catalog routes: {len(contracts.get('sceneRoutes', []))}")
    print(f"Renderer registry: {'present' if contracts.get('hasRendererRegistry') else 'missing'}")
    print(f"Behavior registry: {'present' if contracts.get('hasBehaviorRegistry') else 'missing'}")
    print(f"Renderer registrations: {len(contracts.get('rendererRoutes', []))}")
    print(f"Behavior registrations: {len(contracts.get('behaviorRoutes', []))}")
    print(f"Unique rendererId values: {len(set(renderer_ids.values()))}")
    print(f"Unique behaviorId values: {len(set(behavior_ids.values()))}")
    print(f"Family dispatch: {'yes' if uses_family_dispatch() else 'no'}")
    print(f"Family renderer groups: {len(family_groups)}")
    for family, routes in sorted(family_groups.items())[:8]:
        print(f"- family {family}: {len(routes)} routes")
    if errors:
        print("Renderer contract errors:")
        for error in errors:
            print(f"- {error}")


def main() -> int:
    args = parse_args()
    routes = known_routes()
    selected, route_errors = resolve_route_filter(args.routes, routes)
    try:
        contracts = load_contracts(selected)
    except RuntimeError as exc:
        print("simulation-renderer-contract: FAIL")
        print(f"- Renderer contract execution failed: {exc}")
        return 0 if args.expect_fail else 1
    errors = route_errors
    if args.strict or args.expect_fail:
        errors.extend(collect_errors(
            selected,
            contracts,
            args.require_routes,
            args.allow_legacy_family_dispatch,
        ))
    if args.report_current or args.strict or args.expect_fail:
        print_report(selected, contracts, errors)
    if args.expect_fail:
        if errors:
            print("simulation-renderer-contract: EXPECTED FAIL")
            return 0
        print("simulation-renderer-contract: UNEXPECTED PASS")
        return 1
    if errors:
        print("simulation-renderer-contract: FAIL")
        return 1
    print("simulation-renderer-contract: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
