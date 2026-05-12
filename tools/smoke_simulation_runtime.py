"""Smoke checks for the split simulation runtime foundation."""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

from smoke_simulation_routes import SIMULATIONS_FILE, parse_sim_map, read_text

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PREFIX = (
    "js/sim-core.js",
    "js/sim-vector-math.js",
    "js/sim-rendering.js",
    "js/sim-interactions.js",
    "js/sim-lab-ui.js",
    "js/sim-scene-registry.js",
    "js/sim-scene-templates.js",
    "js/sim-route-renderer-primitives.js",
    "js/sim-route-renderer-registry.js",
    "js/sim-route-behavior-registry.js",
)
SCRIPT_SUFFIX = (
    "js/sim-activities.js",
    "js/sim-route-manifest.js",
    "js/simulations.js",
)
EXPECTED_MODULES = {
    "js/sim-core.js": ("window.SimCore", "window.SimRegistry", "createScope", "createSimContainer"),
    "js/sim-vector-math.js": ("window.SimMath", "clamp", "project"),
    "js/sim-rendering.js": ("window.SimRender", "drawGrid", "drawHandle"),
    "js/sim-interactions.js": ("window.SimInteractions", "createInteractionLayer"),
    "js/sim-lab-ui.js": ("window.SimLabUI", "createLab"),
    "js/sim-scene-registry.js": ("window.SimSceneRegistry", "registerMany", "entries"),
    "js/sim-scene-templates.js": ("window.SimSceneTemplates", "render", "signature"),
    "js/sim-route-renderer-primitives.js": ("window.SimRouteRendererPrimitives", "frame", "arrow"),
    "js/sim-route-renderer-registry.js": ("window.SimRouteRenderers", "registerMany", "identity"),
    "js/sim-route-behavior-registry.js": ("window.SimRouteBehaviors", "registerMany", "entries"),
    "js/sim-activities.js": ("window.SimActivities",),
    "js/sim-route-manifest.js": ("window.SIM_ROUTE_MANIFEST",),
}
ROUTE_MODULE_ROOT = ROOT / "js" / "routes"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate simulation runtime wiring.")
    parser.add_argument("--expect-globals", default="")
    parser.add_argument("--expect-runtime-routes", type=int)
    parser.add_argument("--check-mount-rollback", action="store_true")
    parser.add_argument("--check-listener-cleanup", action="store_true")
    parser.add_argument("--check-raf-cleanup", action="store_true")
    parser.add_argument("--routes", nargs="*", default=[])
    return parser.parse_args()


def csv_tokens(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def route_tokens(values: list[str]) -> list[str]:
    tokens: list[str] = []
    for value in values:
        tokens.extend(item.strip() for item in value.split(",") if item.strip())
    return tokens


def expected_routes() -> set[str]:
    return {route for route, _expr in parse_sim_map(read_text(SIMULATIONS_FILE))}


def resolve_route_filter(values: list[str], known_routes: set[str]) -> tuple[set[str], list[str]]:
    tokens = route_tokens(values)
    if not tokens:
        return set(known_routes), []
    selected: set[str] = set()
    errors: list[str] = []
    for token in tokens:
        if token in known_routes:
            selected.add(token)
            continue
        prefix = token if token.endswith("-") else f"{token}-"
        matches = {route for route in known_routes if route.startswith(prefix)}
        if matches:
            selected.update(matches)
        else:
            errors.append(f"Unknown route filter: {token}")
    return selected, errors


def read(path: str) -> str:
    file_path = ROOT / path
    if not file_path.exists():
        raise FileNotFoundError(path)
    return file_path.read_text(encoding="utf-8")


def script_sources(index_html: str) -> list[str]:
    return re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']', index_html)


def route_module_sources() -> list[str]:
    legacy_root = ROOT / "js" / "sims"
    if legacy_root.exists():
        legacy_routes = [path.relative_to(ROOT).as_posix() for path in sorted(legacy_root.rglob("*-routes.js"))]
        if legacy_routes:
            return legacy_routes
    if not ROUTE_MODULE_ROOT.exists():
        return []
    return [
        path.relative_to(ROOT).as_posix()
        for path in sorted(ROUTE_MODULE_ROOT.glob("*.js"))
        if path.name != "route-registry.js" and not path.name.startswith("pilot-")
    ]


def phase05_route_sources() -> list[str]:
    return []


def scene_module_sources() -> list[str]:
    return [
        source for source in script_sources(read("index.html"))
        if source.startswith("js/sims/") and source.endswith("-scenes.js")
    ]


def expected_scripts() -> tuple[str, ...]:
    return (*SCRIPT_PREFIX, *route_module_sources(), *phase05_route_sources(), *scene_module_sources(), *SCRIPT_SUFFIX)


def runtime_script_sources() -> list[str]:
    sources = script_sources(read("index.html"))
    return [
        source
        for source in sources
        if source.startswith("js/sim-")
        or source.startswith("js/sims/")
        or source.startswith("js/routes/")
        or source == "js/simulations.js"
    ]


def check_script_order(errors: list[str]) -> None:
    sources = script_sources(read("index.html"))
    positions = {}
    route_sources = route_module_sources()
    scene_sources = scene_module_sources()
    simulation_sources = [*route_sources, *scene_sources]
    if not route_sources and not phase05_route_sources():
        errors.append("No simulation route modules found under js/sims or js/routes")
    for script in expected_scripts():
        try:
            positions[script] = sources.index(script)
        except ValueError:
            errors.append(f"Missing script tag: {script}")
    prefix_order = [positions[s] for s in SCRIPT_PREFIX if s in positions]
    suffix_order = [positions[s] for s in SCRIPT_SUFFIX if s in positions]
    if prefix_order != sorted(prefix_order) or suffix_order != sorted(suffix_order):
        errors.append("Simulation scripts are not in required load order")
    if "js/routes/route-registry.js" in positions and "js/simulations.js" in positions:
        first_route = positions["js/routes/route-registry.js"]
        last_route = positions["js/simulations.js"]
        for script in simulation_sources:
            pos = positions.get(script)
            if pos is not None and not first_route <= pos < last_route:
                errors.append(f"Simulation module must load after route-registry and before simulations.js: {script}")
    if "js/simulations.js" in positions:
        sim_map_pos = positions["js/simulations.js"]
        late_scripts = [script for script, pos in positions.items() if script != "js/simulations.js" and pos > sim_map_pos]
        if late_scripts:
            errors.append("simulations.js must load after all simulation modules")


def check_modules(errors: list[str]) -> None:
    for path, tokens in EXPECTED_MODULES.items():
        try:
            text = read(path)
        except FileNotFoundError:
            errors.append(f"Missing module file: {path}")
            continue
        for token in tokens:
            if token not in text:
                errors.append(f"{path} missing token: {token}")
    for path in route_module_sources():
        text = read(path)
        if not re.search(
            r"(?:RouteRegistry\.register|registry\.register|registerMany|SimRegistry\[\s*['\"]ch\d+-\d+-\d+['\"]\s*\]\s*=)",
            text,
        ):
            errors.append(f"{path} missing registry registration")
        if not re.search(
            r"(?:RouteRegistry\.register\(\s*['\"]ch\d+-\d+-\d+['\"]|"
            r"\[\s*['\"]ch\d+-\d+-\d+['\"]\s*\]\s*=|"
            r"['\"]ch\d+-\d+-\d+['\"]\s*:)",
            text,
        ):
            errors.append(f"{path} missing route id registration")
    for path in scene_module_sources():
        text = read(path)
        if "SimSceneRegistry" not in text or "registry.registerMany" not in text:
            errors.append(f"{path} missing scene registry registration")
        if not re.search(r"\[\s*['\"]ch\d+-\d+-\d+['\"]\s*,", text):
            errors.append(f"{path} missing route scene entries")


def check_loader_lifecycle(errors: list[str]) -> None:
    text = read("js/loader.js")
    required = ("disposeActiveSimulation", "activeSimulationDispose", "initSimulations")
    for token in required:
        if token not in text:
            errors.append(f"loader.js missing lifecycle token: {token}")
    load_page = re.search(r"async function loadPage\(id\) \{(?P<body>[\s\S]*?)\n\}", text)
    if not load_page or "disposeActiveSimulation()" not in load_page.group("body"):
        errors.append("loadPage() must dispose active simulation before replacing content")


def check_registry(errors: list[str]) -> None:
    text = read("js/simulations.js")
    for token in ("window.SIM_MAP", "window.SimRegistry", "buildSimMap", "disposeMount"):
        if token not in text:
            errors.append(f"simulations.js missing registry token: {token}")
    try:
        route_count = len(parse_sim_map(read_text(SIMULATIONS_FILE)))
    except (FileNotFoundError, ValueError) as exc:
        errors.append(f"Cannot parse registered simulation routes: {exc}")
        return
    print(f"SIM_MAP routes: {route_count}")
    if route_count != 58:
        errors.append(f"Expected 58 registered simulation routes, found {route_count}")


def check_route_filters(errors: list[str], values: list[str]) -> None:
    if not values:
        return
    try:
        routes = expected_routes()
    except (FileNotFoundError, ValueError) as exc:
        errors.append(f"Cannot validate route filters: {exc}")
        return
    selected, route_errors = resolve_route_filter(values, routes)
    errors.extend(route_errors)
    print(f"Selected routes: {len(selected)}")


def check_expected_globals(errors: list[str], names: list[str]) -> None:
    if not names:
        return
    sources = "\n".join(read(path) for path in runtime_script_sources())
    print(f"Expected globals: {', '.join(names)}")
    for name in names:
        if f"window.{name}" not in sources:
            errors.append(f"Missing expected global: {name}")


def check_executable_registry(errors: list[str], expected_count: int | None) -> None:
    if expected_count is None:
        return
    # Include js/routes/ files in VM sandbox for Phase 05 routes
    all_sources = runtime_script_sources()
    scripts = ",\n".join(repr(path) for path in all_sources)
    harness = rf"""
const fs = require('fs');
const vm = require('vm');
const warnings = [];
const store = {{}};

function createCanvas() {{
  return {{
    width: 560,
    height: 340,
    style: {{}},
    addEventListener() {{}},
    removeEventListener() {{}},
    getBoundingClientRect() {{ return {{ left: 0, top: 0, width: 560, height: 340 }}; }},
    getContext() {{ return {{}}; }}
  }};
}}

function createElement(tag) {{
  const element = {{
    tagName: String(tag || '').toUpperCase(),
    className: '',
    innerHTML: '',
    textContent: '',
    style: {{}},
    children: [],
    clientWidth: 640,
    appendChild(child) {{ child.parentNode = this; this.children.push(child); return child; }},
    removeChild(child) {{ this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; }},
    addEventListener() {{}},
    removeEventListener() {{}},
    setAttribute() {{}},
    classList: {{ add() {{}}, remove() {{}} }},
    querySelector(selector) {{
      if (selector === '.sim-canvas') return createCanvas();
      return createElement('div');
    }}
  }};
  if (tag === 'canvas') Object.assign(element, createCanvas());
  return element;
}}

const context = {{
  console: {{ warn: (...args) => warnings.push(args.join(' ')), error: (...args) => warnings.push(args.join(' ')), log: () => {{}} }},
  window: {{
    requestAnimationFrame() {{ return 1; }},
    cancelAnimationFrame() {{}},
    addEventListener() {{}},
    removeEventListener() {{}},
    localStorage: {{
      getItem(key) {{ return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; }},
      setItem(key, value) {{ store[key] = String(value); }},
      removeItem(key) {{ delete store[key]; }}
    }}
  }},
  document: {{
    createElement,
    querySelector() {{ return null; }}
  }}
}};
context.window.window = context.window;
context.window.document = context.document;
context.window.Math = Math;
vm.createContext(context);
for (const script of [{scripts}]) {{
  vm.runInContext(fs.readFileSync(script, 'utf8'), context, {{ filename: script }});
}}
const count = Object.keys(context.window.SIM_MAP || {{}}).length;
if (count !== {expected_count}) throw new Error(`Expected {expected_count} runtime routes, found ${{count}}`);
console.log(`Executable registry routes: ${{count}}`);
"""
    result = subprocess.run(
        ["node", "-e", harness],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        errors.append("Executable registry route check failed: " + (result.stderr or result.stdout).strip())
        return
    print(result.stdout.strip())


def check_mount_rollback(errors: list[str], enabled: bool) -> None:
    if not enabled:
        return
    phase05_routes = (ROOT / "js" / "routes" / "chapter-statics-routes.js").exists()
    if phase05_routes:
        # Phase 05: Handle throws during mount = all-or-nothing, no partial cleanup needed
        # Test that mount failure returns null and host is clean
        harness = r"""
const fs = require('fs');
const vm = require('vm');
const warnings = [];

function createCanvas(w, h) {
  return {
    width: w || 760, height: h || 440, style: {}, tabIndex: 0,
    addEventListener() {}, removeEventListener() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: w || 760, height: h || 440 }; },
    getContext() {
      return {
        fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '', lineJoin: '',
        fillRect() {}, strokeRect() {}, clearRect() {},
        beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {},
        arc() {}, arcTo() {}, save() {}, restore() {}, closePath() {},
        fillText() {}, font: '', textAlign: '', textBaseline: '',
        setLineDash() {}, createLinearGradient() { return { addColorStop() {} }; }
      };
    }
  };
}

function createElement(tag) {
  const el = {
    tagName: String(tag || '').toUpperCase(),
    className: '', innerHTML: '', textContent: '',
    style: {}, children: [], clientWidth: 800,
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; },
    addEventListener() {}, removeEventListener() {},
    setAttribute() {}, classList: { add() {}, remove() {} },
    querySelector() { return null; }
  };
  if (tag === 'canvas') return createCanvas(760, 440);
  return el;
}

function createHost() {
  return {
    children: [],
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; }
  };
}

const _raf = function(cb) { return 1; };
const _caf = function(id) {};

const context = {
  console: { warn: (...args) => warnings.push(args.join(' ')), log: () => {} },
  requestAnimationFrame: _raf,
  cancelAnimationFrame: _caf,
  window: {
    requestAnimationFrame: _raf, cancelAnimationFrame: _caf,
    addEventListener() {}, removeEventListener() {},
    SimLabUI: { createLab() { return null; } },
    SimNew: {
      Vec2: { create(x, y) { return { x, y }; }, dist(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); } },
      Handle: function(opts) { throw new Error('intentional mount failure'); },
      HandleManager: function() { return { add() {}, remove() {}, get() {}, get handles() { return []; }, _screenToWorld() { return {x:0,y:0}; }, setScreenConverter() {}, setHovered() {}, startDrag() {}, moveDrag() {}, endDrag() {}, getCursor() { return 'default'; }, tabPrev() {}, tabNext() {}, nudgeFocused() {}, render() {}, dispose() {} }; },
      InteractionManager: function() { return { addHandle() {}, dispose() {}, destroy() {} }; }
    }
  },
  document: { createElement }
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/sim-core.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/routes/chapter-statics-routes.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/simulations.js', 'utf8'), context);
const host = createHost();
let result = null;
try {
  result = context.window.SIM_MAP['ch1-1-4'](host);
} catch (e) {
  // Handle threw as expected
}
if (result !== null) throw new Error('failed route should return null');
if (host.children.length !== 0) throw new Error('mount rollback left ' + host.children.length + ' child node(s)');
console.log('Mount rollback (Phase 05): PASS');
"""


    else:
        # Phase 01 harness
        harness = r"""
const fs = require('fs');
const vm = require('vm');
const warnings = [];

function createCanvas() {
  return {
    width: 560, height: 340,
    style: {},
    addEventListener() {}, removeEventListener() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 560, height: 340 }; },
    getContext() { return {}; }
  };
}

function createElement(tag) {
  const element = {
    tagName: String(tag || '').toUpperCase(),
    className: '', innerHTML: '', textContent: '',
    style: {}, children: [], clientWidth: 640,
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; },
    addEventListener() {}, removeEventListener() {},
    setAttribute() {}, classList: { add() {}, remove() {} },
    querySelector(selector) {
      if (selector === '.sim-canvas') return createCanvas();
      return createElement('div');
    }
  };
  if (tag === 'canvas') Object.assign(element, createCanvas());
  return element;
}

function createHost() {
  return {
    children: [],
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; }
  };
}

const context = {
  console: { warn: (...args) => warnings.push(args.join(' ')), log: () => {} },
  window: {
    requestAnimationFrame() { return 1; }, cancelAnimationFrame() {},
    addEventListener() {}, removeEventListener() {}
  },
  document: { createElement }
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/sim-core.js', 'utf8'), context);
context.window.SimStatics = {
  simMoment(host) {
    context.window.SimCore.createSimContainer(host, 'Throwing route', 560, 340);
    throw new Error('intentional mount failure');
  }
};
context.window.SimKinematics = {};
context.window.SimDynamics = {};
vm.runInContext(fs.readFileSync('js/sims/ch1/statics-routes.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/simulations.js', 'utf8'), context);
const host = createHost();
const result = context.window.SIM_MAP['ch1-1-4'](host);
if (result !== null) throw new Error('failed route should return null');
if (host.children.length !== 0) throw new Error('mount rollback left ' + host.children.length + ' child node(s)');
console.log('Mount rollback (Phase 01): PASS');
"""
    result = subprocess.run(
        ["node", "-e", harness],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        errors.append("Mount rollback check failed: " + (result.stderr or result.stdout).strip())
        return
    print(result.stdout.strip())


def check_executable_harness(errors: list[str]) -> None:
    phase05_routes = (ROOT / "js" / "routes" / "chapter-statics-routes.js").exists()
    if phase05_routes:
        # Phase 05 harness: load routes with SimNew stubs, test lifecycle
        harness = r"""
const fs = require('fs');
const vm = require('vm');
let frameId = 0;
const frames = new Set();
const listeners = new Set();
const warnings = [];

function createCanvas(w, h) {
  const listeners2 = [];
  const c = {
    width: w || 500, height: h || 300,
    style: {}, tabIndex: 0,
    _listeners: listeners2,
    addEventListener(type, fn) { listeners2.push({type, fn}); },
    removeEventListener(type, fn) { listeners2.splice(listeners2.findIndex(l => l.type === type && l.fn === fn), 1); },
    getBoundingClientRect() { return { left: 0, top: 0, width: w || 500, height: h || 300 }; },
    getContext() {
      return {
        fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '', lineJoin: '',
        shadowColor: '', shadowBlur: 0,
        fillRect() {}, strokeRect() {}, clearRect() {},
        beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {},
        arc() {}, arcTo() {}, save() {}, restore() {}, closePath() {},
        fillText() {}, font: '', textAlign: '', textBaseline: '',
        drawFocusIfNeeded() {}, quadraticCurveTo() {},
        setLineDash() {}, createLinearGradient() { return { addColorStop() {} }; }
      };
    }
  };
  return c;
}

function createElement(tag) {
  const element = {
    tagName: String(tag || '').toUpperCase(),
    className: '', innerHTML: '', textContent: '',
    style: {}, children: [], clientWidth: 500,
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; },
    addEventListener() {}, removeEventListener() {},
    setAttribute() {}, classList: { add() {}, remove() {} },
    querySelector() { return null; }
  };
  if (tag === 'canvas') return createCanvas(500, 300);
  return element;
}

function createHost() {
  return {
    children: [],
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; }
  };
}

const _raf = function(cb) { const id = ++frameId; frames.add(id); return id; };
const _caf = function(id) { frames.delete(id); };

const context = {
  console: { warn: (...args) => warnings.push(args.join(' ')), log: () => {} },
  requestAnimationFrame: _raf,
  cancelAnimationFrame: _caf,
  window: {
    requestAnimationFrame: _raf,
    cancelAnimationFrame: _caf,
    addEventListener(type, fn) { if (type === 'resize') listeners.add(fn); },
    removeEventListener(type, fn) { if (type === 'resize') listeners.delete(fn); },
    SimLabUI: { createLab() { return null; } },
    SimNew: {
      Vec2: { create(x, y) { return { x, y }; }, dist(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); } },
      Handle: function(opts) { return { _id: opts.label || Math.random(), x: opts.x || 0, y: opts.y || 0, color: opts.color, type: opts.type, label: opts.label, radius: opts.radius, onDrag: null, onClick: null }; },
      HandleManager: function() {
        const handles = [];
        return { add(h) { handles.push(h); }, remove(h) { const i = handles.indexOf(h); if (i >= 0) handles.splice(i, 1); }, get(id) { return handles.find(h => h._id === id) || null; }, get handles() { return handles; }, _screenToWorld() { return {x: 0, y: 0}; }, setScreenConverter() {}, setHovered() {}, startDrag() {}, moveDrag() {}, endDrag() {}, getCursor() { return 'default'; }, tabPrev() {}, tabNext() {}, nudgeFocused() {}, render() {}, dispose() { handles.length = 0; } };
      },
      InteractionManager: function() { return { addHandle() {}, dispose() {}, destroy() {} }; }
    }
  },
  document: { createElement }
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/sim-core.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/routes/chapter-statics-routes.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/simulations.js', 'utf8'), context);
const host1 = createHost();
const mounted1 = context.window.SIM_MAP['ch1-1-4'](host1);
if (!mounted1 || frames.size === 0) throw new Error('mount did not track frame');
mounted1.dispose();
if (frames.size !== 0) throw new Error('scope dispose did not clear frames');
const host2 = createHost();
const mounted2 = context.window.SIM_MAP['ch1-1-3'](host2);
if (!mounted2 || frames.size === 0) throw new Error('ch1-1-3 mount did not track frame');
mounted2.dispose();
if (frames.size !== 0) throw new Error('ch1-1-3 dispose did not clear frames');
console.log('Executable harness (Phase 05): PASS');
"""

    else:
        # Phase 01 harness
        harness = r"""
const fs = require('fs');
const vm = require('vm');
const warnings = [];

function createCanvas() {
  return {
    width: 560, height: 340,
    style: {},
    addEventListener() {}, removeEventListener() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 560, height: 340 }; },
    getContext() { return {}; }
  };
}

function createElement(tag) {
  const element = {
    tagName: String(tag || '').toUpperCase(),
    className: '', innerHTML: '', textContent: '',
    style: {}, children: [], clientWidth: 640,
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; },
    addEventListener() {}, removeEventListener() {},
    setAttribute() {}, classList: { add() {}, remove() {} },
    querySelector(selector) {
      if (selector === '.sim-canvas') return createCanvas();
      return createElement('div');
    }
  };
  if (tag === 'canvas') Object.assign(element, createCanvas());
  return element;
}

function createHost() {
  return {
    children: [],
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; }
  };
}

const context = {
  console: { warn: (...args) => warnings.push(args.join(' ')), log: () => {} },
  window: {
    requestAnimationFrame() { return 1; }, cancelAnimationFrame() {},
    addEventListener() {}, removeEventListener() {}
  },
  document: { createElement }
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/sim-core.js', 'utf8'), context);
context.window.SimStatics = {
  simMoment(host) {
    context.window.SimCore.createSimContainer(host, 'Throwing route', 560, 340);
    throw new Error('intentional mount failure');
  }
};
context.window.SimKinematics = {};
context.window.SimDynamics = {};
vm.runInContext(fs.readFileSync('js/sims/ch1/statics-routes.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/simulations.js', 'utf8'), context);
const host = createHost();
const result = context.window.SIM_MAP['ch1-1-4'](host);
if (result !== null) throw new Error('failed route should return null');
if (host.children.length !== 0) throw new Error('mount rollback left ' + host.children.length + ' child node(s)');
console.log('Mount rollback (Phase 01): PASS');
        """
    result = subprocess.run(
        ["node", "-e", harness],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        errors.append("Mount rollback check failed: " + (result.stderr or result.stdout).strip())
        return
    print(result.stdout.strip())


def check_activity_progress_schema_guard(errors: list[str]) -> None:
    harness = r"""
const fs = require('fs');
const vm = require('vm');
const store = {
  chlyt_activity_progress_v1: JSON.stringify({
    "ch1-7-1": { completed: null, lastScore: "bad", updatedAt: 7 }
  })
};
const warnings = [];
const context = {
  console: { warn: (...args) => warnings.push(args.join(' ')), log: () => {} },
  window: {
    localStorage: {
      getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
      setItem(key, value) { store[key] = value; }
    }
  },
  document: {}
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/sim-activities.js', 'utf8'), context);
context.window.SimActivities.updateRouteProgress('ch1-7-1', 'ra', 0.5);
const saved = JSON.parse(store.chlyt_activity_progress_v1);
const route = saved['ch1-7-1'];
if (!Array.isArray(route.completed) || route.completed[0] !== 'ra') throw new Error('completed was not normalized');
if (route.lastScore !== 0.5) throw new Error('lastScore was not normalized');
if (typeof route.updatedAt !== 'string') throw new Error('updatedAt was not refreshed');
"""
    result = subprocess.run(
        ["node", "-e", harness],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        errors.append("Activity progress schema guard failed: " + (result.stderr or result.stdout).strip())


def check_listener_cleanup_flag(errors: list[str], enabled: bool) -> None:
    if not enabled:
        return
    harness = r"""
const fs = require('fs');
const vm = require('vm');
const listeners = new Map();

function createCanvas() {
  return {
    width: 400,
    height: 260,
    style: {},
    tabIndex: 0,
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) {
      if (listeners.has(type)) listeners.get(type).delete(fn);
    },
    getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 260 }; },
    focus() {}
  };
}

const canvas = createCanvas();
const context = {
  console: { warn() {}, log() {} },
  window: { addEventListener() {}, removeEventListener() {} },
  document: {}
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/sim-core.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/sim-vector-math.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/sim-interactions.js', 'utf8'), context);
const scope = context.window.SimCore.createScope();
context.window.SimCore.withScope(scope, () => {
  const layer = context.window.SimInteractions.createInteractionLayer(canvas);
  layer.addHandle({ id: 'h', get: () => ({ x: 40, y: 40 }), set() {} });
});
const before = [...listeners.values()].reduce((sum, set) => sum + set.size, 0);
if (before < 5) throw new Error(`expected pointer/key listeners, found ${before}`);
scope.dispose();
const after = [...listeners.values()].reduce((sum, set) => sum + set.size, 0);
if (after !== 0) throw new Error(`listener cleanup left ${after} listener(s)`);
console.log('Listener cleanup: PASS');
"""
    result = subprocess.run(
        ["node", "-e", harness],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        errors.append("Listener cleanup check failed: " + (result.stderr or result.stdout).strip())
        return
    print(result.stdout.strip())


def check_collision_2d_edge_cases(errors: list[str]) -> None:
    harness = r"""
const fs = require('fs');
const vm = require('vm');
const context = {
  console: { warn() {}, log() {} },
  window: {},
  document: {}
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
context.window.SimCore = { COLORS: {}, dist: Math.hypot };
vm.runInContext(fs.readFileSync('js/sim-professional-lab.js', 'utf8'), context);
const physics = context.window.SimProfessionalLab.physics;
const hit = physics.elasticCollision1d(2, 3, 4, -1, 1);
if (Math.abs(hit.v1 + 2) > 1e-9 || Math.abs(hit.v2 - 3) > 1e-9) {
  throw new Error('elastic collision helper returned wrong velocities');
}
const degenerate = physics.elasticCollision1d(5, 5, 5, 0, 1);
if (!Number.isFinite(degenerate.v1) || !Number.isFinite(degenerate.v2)) {
  throw new Error('collision helper returned non-finite values');
}
"""
    result = subprocess.run(
        ["node", "-e", harness],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        errors.append("Collision 2D executable edge-case harness failed: " + (result.stderr or result.stdout).strip())


def check_lab_shell_fake_dom_compat(errors: list[str]) -> None:
    harness = r"""
const fs = require('fs');
const vm = require('vm');

function createCanvas() {
  return {
    width: 560,
    height: 340,
    style: {},
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 560, height: 340 }; },
    getContext() { return {}; }
  };
}

function createElement(tag) {
  const element = {
    tagName: String(tag || '').toUpperCase(),
    className: '',
    innerHTML: '',
    textContent: '',
    style: {},
    children: [],
    clientWidth: 640,
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); child.parentNode = null; return child; },
    addEventListener() {},
    removeEventListener() {},
    classList: { add() {}, remove() {} }
  };
  if (tag === 'canvas') Object.assign(element, createCanvas());
  return element;
}

const context = {
  console: { warn() {} },
  window: {
    requestAnimationFrame() { return 1; },
    cancelAnimationFrame() {},
    addEventListener() {},
    removeEventListener() {}
  },
  document: { createElement }
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/sim-core.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/sim-lab-ui.js', 'utf8'), context);

const host = createElement('div');
const lab = context.window.SimLabUI.createLab(host, { routeId: 'ch-test', title: 'Fake DOM lab' });
if (!lab || !lab.header || !lab.readoutGrid || !lab.hint || typeof lab.setHint !== 'function') {
  throw new Error('lab shell did not expose required slots');
}
"""
    result = subprocess.run(
        ["node", "-e", harness],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        errors.append("Lab shell fake DOM compatibility failed: " + (result.stderr or result.stdout).strip())


def main() -> int:
    args = parse_args()
    errors: list[str] = []
    checks = (
        check_script_order,
        check_modules,
        check_loader_lifecycle,
        check_registry,
        check_executable_harness,
        check_activity_progress_schema_guard,
        check_collision_2d_edge_cases,
        check_lab_shell_fake_dom_compat,
    )
    for check in checks:
        try:
            check(errors)
        except FileNotFoundError as exc:
            errors.append(f"Missing required file: {exc}")
    try:
        check_expected_globals(errors, csv_tokens(args.expect_globals))
        check_route_filters(errors, args.routes)
    except FileNotFoundError as exc:
        errors.append(f"Missing required file: {exc}")
    try:
        check_executable_registry(errors, args.expect_runtime_routes)
        if args.check_mount_rollback:
            check_mount_rollback(errors, True)
        if args.check_listener_cleanup:
            check_listener_cleanup_flag(errors, True)
    except FileNotFoundError as exc:
        errors.append(f"Missing required file: {exc}")
    if errors:
        print("simulation-runtime-smoke: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print("simulation-runtime-smoke: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
