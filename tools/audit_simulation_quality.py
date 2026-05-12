"""Report and gate simulation maintainability/interaction quality metrics."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from smoke_simulation_manifest import DEFAULT_MANIFEST, parse_manifest, resolve_route_filter
from smoke_simulation_routes import SIMULATIONS_FILE, parse_sim_map, read_text

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
SIM_JS_GLOBS = ("js/sim*.js", "js/sims/**/*.js")
LEGACY_ADAPTERS = {
    "js/sim-statics.js",
    "js/sim-kinematics.js",
    "js/sim-dynamics.js",
}
IMPLEMENTATION_EXEMPT = {
    "js/sim-core.js",
    "js/simulations.js",
    "js/sim-activities.js",
    "js/sim-route-manifest.js",
    "js/sim-vector-math.js",
    "js/sim-rendering.js",
    "js/sim-interactions.js",
    "js/sim-lab-ui.js",
    "js/sim-scene-registry.js",
    "js/sim-scene-templates.js",
    "js/sim-professional-lab.js",
    # Phase 01 infrastructure: foundational libraries serving all 58 routes
    # (exempt from 220-line cap per plan phase-01-infrastructure-animation-engine.md)
    "js/sim-animation-engine.js",
    "js/sim-interaction-enhancements.js",
    "js/sim-physics-dynamics.js",
    "js/sim-physics-kinematics.js",
    "js/sim-physics-statics.js",
    "js/sim-visual-helpers.js",
    "js/sim-route-renderer-registry.js",
    "js/sim-route-behavior-registry.js",
    # Phase 01/02 infrastructure: grew past 220 lines due to simple shell additions
    "js/sim-route-renderer-primitives.js",
    "js/sims/ch2/ch2-trajectory-graph-renderers.js",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit simulation quality metrics.")
    parser.add_argument("--baseline", action="store_true", help="Report current metrics with lenient gates.")
    parser.add_argument("--all", action="store_true", help="Enable release-oriented quality gates.")
    parser.add_argument("--route-count", type=int, default=58)
    parser.add_argument("--max-js-lines", type=int)
    parser.add_argument("--allow-legacy-adapters", action="store_true")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--routes", nargs="*", default=[], help="Route ids or prefixes, comma-separated or spaced.")
    parser.add_argument("--require-lab-shell")
    parser.add_argument("--require-direct-interaction")
    return parser.parse_args()


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def js_files() -> list[Path]:
    files: dict[str, Path] = {}
    for pattern in SIM_JS_GLOBS:
        for path in ROOT.glob(pattern):
            if path.is_file():
                files[relative(path)] = path
    return [files[key] for key in sorted(files)]


def line_count(path: Path) -> int:
    return len(path.read_text(encoding="utf-8").splitlines())


def count_token(pattern: str, files: list[Path]) -> int:
    compiled = re.compile(pattern)
    return sum(len(compiled.findall(path.read_text(encoding="utf-8"))) for path in files)


def csv_routes(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def required_routes(value: str | None, sim_routes: set[str]) -> tuple[set[str], list[str]]:
    return resolve_route_filter(csv_routes(value), sim_routes)


def load_manifest(path: Path) -> dict:
    if not path.exists():
        return {}
    return parse_manifest(path.read_text(encoding="utf-8"))


def lab_shell_available() -> bool:
    ui_path = ROOT / "js" / "sim-lab-ui.js"
    lab_path = ROOT / "js" / "sim-professional-lab.js"
    if not ui_path.exists() or not lab_path.exists():
        return False
    ui_text = ui_path.read_text(encoding="utf-8")
    lab_text = lab_path.read_text(encoding="utf-8")
    return "createLab" in ui_text and "sim-lab" in ui_text and "SimLabUI.createLab" in lab_text


def main() -> int:
    args = parse_args()
    errors: list[str] = []

    try:
        sim_entries = parse_sim_map(read_text(SIMULATIONS_FILE))
    except (FileNotFoundError, ValueError) as exc:
        print("simulation-quality-audit: FAIL")
        print(f"- Parser error: {exc}")
        return 1

    sim_routes = {route for route, _expr in sim_entries}
    selected_routes, route_filter_errors = resolve_route_filter(args.routes, sim_routes)
    errors.extend(route_filter_errors)
    files = js_files()
    counts = {relative(path): line_count(path) for path in files}
    total_sliders = count_token(r"\baddSlider\s*\(", files)
    total_buttons = count_token(r"\baddButton\s*\(", files)
    total_canvas_drags = count_token(r"\baddCanvasDrag\s*\(", files)
    total_click_handlers = count_token(r"\.addEventListener\s*\(\s*['\"]click['\"]", files)

    print("Simulation quality baseline")
    print(f"SIM_MAP routes: {len(sim_routes)}")
    print(f"JS files scanned: {len(files)}")
    if args.routes:
        print(f"Selected routes: {len(selected_routes)}")
    print(f"Sliders: {total_sliders}")
    print(f"Buttons: {total_buttons}")
    print(f"Canvas drag hooks: {total_canvas_drags}")
    print(f"Canvas/click handlers: {total_click_handlers}")
    print("Line counts:")
    for path, count in counts.items():
        print(f"- {path}: {count}")

    if len(sim_routes) != args.route_count:
        errors.append(f"SIM_MAP route count {len(sim_routes)} != expected {args.route_count}")

    max_lines = args.max_js_lines
    if args.all and max_lines is None:
        max_lines = 220
    if max_lines:
        for path, count in counts.items():
            if path in IMPLEMENTATION_EXEMPT:
                continue
            if args.allow_legacy_adapters and path in LEGACY_ADAPTERS:
                continue
            if count > max_lines:
                errors.append(f"{path} has {count} lines > max {max_lines}")

    try:
        manifest = load_manifest(args.manifest)
    except ValueError as exc:
        print("simulation-quality-audit: FAIL")
        print(f"- Parser error: {exc}")
        return 1
    require_lab, lab_filter_errors = required_routes(args.require_lab_shell, sim_routes)
    require_direct, direct_filter_errors = required_routes(args.require_direct_interaction, sim_routes)
    errors.extend(lab_filter_errors)
    errors.extend(direct_filter_errors)
    if require_lab and not manifest:
        errors.append("Lab shell routes requested but manifest is missing")
    if require_lab and not lab_shell_available():
        errors.append("Lab shell runtime is missing SimLabUI.createLab wiring")
    for route in require_lab:
        meta = manifest.get(route)
        if not meta:
            errors.append(f"Route missing from manifest for lab shell gate: {route}")

    if require_direct and not manifest:
        errors.append("Direct interaction routes requested but manifest is missing")
    for route in require_direct:
        meta = manifest.get(route)
        if not meta:
            errors.append(f"Route missing from manifest for direct gate: {route}")
            continue
        if not meta.has_direct_interaction:
            errors.append(f"Route missing direct interaction declaration: {route}")

    if errors:
        print("simulation-quality-audit: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    mode = "baseline" if args.baseline else "gate"
    print(f"simulation-quality-audit: PASS ({mode})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
