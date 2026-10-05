'use strict';
// Executes production route, physics, clock and overlay code. The small DOM/render
// adapter records geometry; this is deterministic source integration, not visual QA.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const repo = process.env.SIM2_TEST_REPO || path.resolve(__dirname, '../..');
const Clock = require(path.join(repo, 'js/sim2/core/animation-clock.js'));
function mount(id) {
  let h, layoutReads = 0;
  function node(tag, attrs = {}) {
    return { tag, attrs: { ...attrs }, children: [], style: {}, classList: { add() {}, remove() {}, toggle() {} },
      setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k]; },
      appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
      removeChild(c) { this.children = this.children.filter(n => n !== c); c.parentNode = null; },
      getBoundingClientRect() { layoutReads++; return { left: 0, top: 0, right: 100, bottom: 100 }; }
    };
  }
  const root = {
    SimPhysicsStatics: require(path.join(repo, 'js/sim2/physics/statics.js')),
    SimPhysicsKinematics: require(path.join(repo, 'js/sim2/physics/kinematics.js')),
    SimPhysicsDynamics: require(path.join(repo, 'js/sim2/physics/dynamics.js')),
    Sim2Palette: require(path.join(repo, 'js/sim2/core/palette.js')),
    Sim2Registry: { register(route, f) { this.factory = f; } }
  };
  const context = vm.createContext({ window: root, document: { createElement: node }, console, Math });
  vm.runInContext(fs.readFileSync(path.join(repo, 'js/sim2/core/overlay.js'), 'utf8'), context);
  root.Sim3Mode = { attach() { return { setState(s) { h.sim3State = JSON.parse(JSON.stringify(s)); }, reset() {}, dispose() {} }; } };
  for (const name of ['Sim3Ch115','Sim3Ch153','Sim3Ch213','Sim3Ch222','Sim3Ch232','Sim3Ch244','Sim3Ch253','Sim3Ch313','Sim3Ch353','Sim3Ch362']) root[name] = { create() {} };
  root.Sim2Shell = { createSimShell(cfg) {
    const svg = node('svg'); svg.__markerId = 'test-marker';
    const tf = { toScreen: p => ({ ...p }), toWorld: p => ({ ...p }), scale: 1 };
    const render = { el: node,
      line: (_, a, b, o = {}) => node('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, ...o }),
      arrow: (_, s, a, b, o = {}) => node('arrow', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, ...o }),
      circle: (_, p, r, o = {}) => node('circle', { cx: p.x, cy: p.y, r, ...o }),
      poly: (_, points, o = {}) => node('polygon', { points, ...o }), path: (_, points, o = {}) => node('path', { points, ...o }) };
    const parent = node('root'), overlay = root.Sim2Overlay.createOverlay(parent, tf, 100, 100);
    const cleanups = [];
    h = { cfg, svg, tf, render, root: parent, overlay, handles: [], numberControls: [], actions: [], playing: false, disposed: false,
      canvas: { clear() {}, drawTrail() {}, segment() {}, dot() {} },
      addCleanup(f) { cleanups.push(f); }, addListener() {},
      dispose() { h.disposed = true; h.playing = false; cleanups.forEach(f => f()); overlay.dispose(); },
      setTheory(o) { h.theory = o; return { announce(text) { (h.announcements ||= []).push(text); }, setReadout(rows) { h.rows = Object.fromEntries(rows.map(r => [r.key, r.value])); }, setFormulaHighlight() {} }; },
      addNumberControl(o) { h.numberControls.push(o); return { setValue(value) { o.value = value; } }; },
      addAction(o) { h.actions.push(o); return node('button'); },
      number(id, value) { const c = h.numberControls.find(s => s.id === id) || h.controls?.sliders?.find(s => s.id === id); if (!c) throw new Error(`No number control ${id}`); c.value = value; c.onInput(value); },
      action(id) { const a = h.actions.find(a => a.id === id); if (!a) throw new Error(`No action ${id}`); a.onClick(); },
      seekTime(time) { h.clock.seekTime(time); }, getSimulationTime() { return h.clock.getSimulationTime(); },
      addControls(o) { h.controls = o; h.actions.push(...(o.actions || [])); return { setActionLabel(id, label) { h.actions.find(a => a.id === id).label = label; }, setValue(id, v) { h.controls.sliders.find(s => s.id === id).value = v; }, setPlaying(v) { h.playing = v; } }; },
      addHandle(p, opts) { const handle = { node: node('handle'), point: { ...p }, opts, move(q) { this.point = { ...q }; } }; h.handles.push(handle); return handle; },
      onFrame(update, draw) { h.update = update; h.draw = draw; },
      stop() { h.playing = false; h.clock.resetTimestamp(); }, start() { h.playing = true; h.clock.resetTimestamp(); },
      resetClock() { h.clock.resetTimestamp(); h.clock.resetSimulationTime(); },
      stepOnce() { if (!h.disposed) { h.clock.stepOnce(); h.draw(); } },
      frame(ms) { if (h.playing && !h.disposed) { h.clock.advance(ms); h.draw(); } },
      step(dt) { h.update(dt); h.draw(); },
      slider(id, value) { h.controls.sliders.find(s => s.id === id).onInput(value); },
      layoutReads() { return layoutReads; }, resetLayoutReads() { layoutReads = 0; }
    };
    h.clock = Clock.createClock({ stepSeconds: 1 / 60, maxFrameSeconds: .25, maxSubSteps: 15, update(dt) { h.update(dt); } });
    return h;
  } };
  vm.runInContext(fs.readFileSync(path.join(repo, 'js/sim2/sims', id.slice(0,3), id + '.js'), 'utf8'), context);
  root.Sim2Registry.factory(node('container'));
  return h;
}
module.exports = { mount, repo };
