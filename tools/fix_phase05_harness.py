"""Fix Phase 05 harness in smoke_simulation_runtime.py"""
import re

with open('tools/smoke_simulation_runtime.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find Phase 05 harness block
phase05_start = content.find('    if phase05_routes:')
phase05_else = content.find('\n    else:')
phase05_result = content.find('    result = subprocess.run', phase05_else)

# The fixed Phase 05 harness
fixed_harness = '''    if phase05_routes:
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

// Build context BEFORE loading scripts
// NOTE: Node.js VM does not expose context.window.X as global 'X'.
// Scripts must use 'window.X' or we must set X directly on the context.
const _raf = function(cb) { const id = ++frameId; frames.add(id); return id; };
const _caf = function(id) { frames.delete(id); };

const context = {
  console: { warn: (...args) => warnings.push(args.join(' ')), log: () => {} },
  // Expose RAF directly on context so scripts can call requestAnimationFrame() globally
  requestAnimationFrame: _raf,
  cancelAnimationFrame: _caf,
  window: {
    requestAnimationFrame: _raf,
    cancelAnimationFrame: _caf,
    addEventListener(type, fn) { if (type === 'resize') listeners.add(fn); },
    removeEventListener(type, fn) { if (type === 'resize') listeners.delete(fn); },
    SimLabUI: { createLab() { return null; } },
    // Stub all SimNew dependencies that Phase 05 routes need
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

// Load sim-core first to populate window.SimRegistry
vm.runInContext(fs.readFileSync('js/sim-core.js', 'utf8'), context);

// Load Phase 05 routes (they declare local makeSim, createCanvas, makeHM, makeIM)
// The routes' local makeSim calls requestAnimationFrame() directly, which is available
// globally because we set context.requestAnimationFrame above.
vm.runInContext(fs.readFileSync('js/routes/chapter-statics-routes.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/simulations.js', 'utf8'), context);

// Test: mount ch1-1-4, then dispose
const host1 = createHost();
const mounted1 = context.window.SIM_MAP['ch1-1-4'](host1);
if (!mounted1 || frames.size === 0) throw new Error('mount did not track frame');
mounted1.dispose();
if (frames.size !== 0) throw new Error('scope dispose did not clear frames');

// Test: mount ch1-1-3, then dispose
const host2 = createHost();
const mounted2 = context.window.SIM_MAP['ch1-1-3'](host2);
if (!mounted2 || frames.size === 0) throw new Error('ch1-1-3 mount did not track frame');
mounted2.dispose();
if (frames.size !== 0) throw new Error('ch1-1-3 dispose did not clear frames');

console.log('Executable harness (Phase 05): PASS');
"""
'''

new_content = content[:phase05_start] + fixed_harness + content[phase05_else:]
with open('tools/smoke_simulation_runtime.py', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Done! File updated.")
