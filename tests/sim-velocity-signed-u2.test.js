'use strict';
// Production route, controls, shell, mode bridge and vendored Three r160 execute
// on CPU. DOM events, canvas drawing and WebGLRenderer are stand-ins: not Q0.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repo = process.env.SIM2_TEST_REPO || path.resolve(__dirname, '..');
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance, `${actual} != ${expected} (tolerance ${tolerance})`);
const copy = value => JSON.parse(JSON.stringify(value));
const walk = node => [node, ...node.children.flatMap(walk)];

function mount() {
  const document = { activeElement: null };
  class Element {
    constructor(tag) {
      this.tag = tag; this.children = []; this.attrs = {}; this.dataset = {};
      this.style = {}; this.events = {}; this.hidden = false;
      this.clientWidth = 640; this.clientHeight = 440; this.value = ''; this.textContent = '';
      this.classList = { add() {}, remove() {}, toggle() {} };
    }
    appendChild(node) { return this.insertBefore(node, null); }
    insertBefore(node, before) {
      if (node.parentNode) node.parentNode.removeChild(node);
      const i = this.children.indexOf(before);
      this.children.splice(i < 0 ? this.children.length : i, 0, node); node.parentNode = this;
      return node;
    }
    removeChild(node) { this.children = this.children.filter(child => child !== node); node.parentNode = null; return node; }
    remove() { this.parentNode?.removeChild(this); }
    setAttribute(key, value) { this.attrs[key] = String(value); }
    getAttribute(key) { return this.attrs[key]; }
    removeAttribute(key) { delete this.attrs[key]; }
    addEventListener(key, fn) { (this.events[key] ||= []).push(fn); }
    removeEventListener(key, fn) { this.events[key] = (this.events[key] || []).filter(f => f !== fn); }
    emit(key, event = {}) { for (const fn of this.events[key] || []) fn({ preventDefault() {}, stopPropagation() {}, ...event }); }
    click() { this.emit('click'); }
    focus() { document.activeElement = this; }
    querySelectorAll(selector) { return walk(this).slice(1).filter(node => selector.startsWith('.') ? (node.className || node.attrs.class || '').split(' ').includes(selector.slice(1)) : node.tag === selector); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    getBoundingClientRect() { return { left: 0, top: 0, right: 640, bottom: 440, width: 640, height: 440 }; }
    getClientRects() { return [this.getBoundingClientRect()]; }
    getContext() { return { getExtension() { return null; } }; }
    get firstChild() { return this.children[0] || null; }
    get nextSibling() { const nodes = this.parentNode?.children || []; return nodes[nodes.indexOf(this) + 1] || null; }
    set innerHTML(value) { this.children.forEach(node => { node.parentNode = null; }); this.children = []; this.textContent = String(value); }
  }
  document.createElement = tag => new Element(tag);
  document.createElementNS = (_, tag) => new Element(tag);
  const window = new Element('window');
  Object.assign(window, { document, devicePixelRatio: 1, matchMedia: () => ({ matches: true }),
    requestAnimationFrame() { throw Error('Static velocity field must remain demand-rendered'); }, cancelAnimationFrame() {} });
  const context = vm.createContext({ window, document, console, setTimeout, clearTimeout });
  const run = file => vm.runInContext(fs.readFileSync(path.join(repo, file), 'utf8'), context, { filename: file });
  run('lib/three/three.umd.min.js');
  const THREE = window.THREE = { ...context.THREE };
  assert.equal(THREE.REVISION, '160');
  THREE.WebGLRenderer = class {
    constructor() { this.domElement = new Element('canvas'); this.info = { render: { frame: 0 } }; }
    setPixelRatio() {} setSize() {}
    render(scene, camera) { scene.updateMatrixWorld(true); camera.updateMatrixWorld(true); this.info.render.frame++; }
    dispose() { this.disposed = true; } forceContextLoss() { this.lost = true; }
  };
  window.Sim3LabelLayer = { create() {
    const labels = new Map();
    return { add(id, text) { const node = labels.get(id) || new Element('label'); node.textContent = text; labels.set(id, node); return node; },
      update() {}, dispose() {}, margin() { return 0; }, bounds() { return { fillRatio: 0 }; },
      distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); }, countVisible() { return labels.size; }, labels };
  } };
  for (const file of ['coordinate-system', 'three-primitives', 'visual-kit', 'three-dispose', 'three-shell', 'mode-toggle']) run(`js/sim3/core/${file}.js`);
  let sceneShell, routeShell, state, received;
  const actual3dCreate = window.Sim3Shell.create;
  window.Sim3Shell.create = config => (sceneShell = actual3dCreate(config));
  const actualAttach = window.Sim3Mode.attach;
  window.Sim3Mode.attach = config => {
    const mode = actualAttach(config), setState = mode.setState;
    mode.setState = value => { state = copy(value); setState(value); };
    return mode;
  };
  run('js/sim3/sims/ch2-5-3-3d.js');
  const createAdapter = window.Sim3Ch253.create;
  window.Sim3Ch253.create = config => {
    const adapter = createAdapter(config), setState = adapter.setState;
    adapter.setState = value => { received = value; setState(value); };
    return adapter;
  };
  run('js/sim2/physics/kinematics.js');
  for (const file of ['palette', 'transform', 'svg-render', 'overlay', 'controls', 'panel', 'sim-shell']) run(`js/sim2/core/${file}.js`);
  const field = { segments: [], dots: [] };
  window.Sim2CanvasUnderlay = { createCanvasUnderlay() { return {
    clear() { field.segments = []; field.dots = []; },
    segment(base, tip) { field.segments.push({ base: copy(base), tip: copy(tip) }); },
    dot(point) { field.dots.push(copy(point)); }, resize() {}, dispose() {}
  }; } };
  const actual2dCreate = window.Sim2Shell.createSimShell;
  window.Sim2Shell.createSimShell = config => (routeShell = actual2dCreate(config));
  let factory;
  window.Sim2Registry = { register(id, value) { assert.equal(id, 'ch2-5-3'); factory = value; } };
  run('js/sim2/sims/ch2/ch2-5-3.js');
  const container = new Element('container'), route = factory(container);
  const input = (id, type = 'number') => walk(container).find(node => node.type === type && (node.attrs['data-id'] === id || node.attrs['data-number-for'] === id));
  const action = id => { const node = walk(container).find(node => node.attrs['data-action'] === id); assert.ok(node, `Missing action ${id}`); node.click(); };
  const edit = (id, value) => { const node = input(id); assert.ok(node, `Missing numeric control ${id}`); node.value = String(value); node.emit('change'); };
  const mode = value => walk(container).find(node => node.dataset.mode === value).click();
  const rows = () => Object.fromEntries(walk(container).filter(node => node.attrs['data-readout-key']).map(node => [node.attrs['data-readout-key'], node.children[1].textContent]));
  return { window, THREE, container, field, input, edit, action, mode, rows, get state() { return state; }, get received() { return received; },
    get shell() { return routeShell; }, get sceneShell() { return sceneShell; },
    get debug() { return window.__SIM3_DEBUG__['ch2-5-3']; }, dispose: route.dispose };
}

function checkPhysical(state) {
  const omega = state.omega, rx = state.sample.x - state.ic.x, ry = state.sample.y - state.ic.y;
  near(state.vM.vx, -omega * ry); near(state.vM.vy, omega * rx);
  near(state.vM.vx * rx + state.vM.vy * ry, 0);
  near(state.vM.mag, Math.abs(omega) * Math.hypot(rx, ry));
  assert.ok(state.vM.mag >= 0);
  for (const m of state.measurements) {
    const x = m.point.x - state.ic.x, y = m.point.y - state.ic.y;
    near(m.velocity.x, -omega * y); near(m.velocity.y, omega * x);
    near(m.velocity.x * x + m.velocity.y * y, 0);
    near(Math.hypot(m.velocity.x, m.velocity.y), Math.abs(omega) * m.radius);
  }
}
function arrows(h) { const result = []; h.sceneShell.scene.traverse(node => { if (Object.hasOwn(node.userData, 'sim3PhysicalMagnitude')) result.push(node); }); return result; }
function checkArrow(h, arrow, vector, factor, cap) {
  const magnitude = Math.hypot(vector.x, vector.y, vector.z);
  near(arrow.userData.sim3PhysicalMagnitude, magnitude);
  near(arrow.scale.y, Math.min(cap, magnitude * factor));
  assert.equal(arrow.visible, magnitude !== 0);
  if (magnitude !== 0) {
    const direction = new h.THREE.Vector3(0, 1, 0).applyQuaternion(arrow.quaternion);
    near(direction.x, vector.x / magnitude); near(direction.y, vector.y / magnitude); near(direction.z, vector.z / magnitude);
  }
}

test('U2 signed/zero omega domain, formula and unchanged initial field', () => {
  const h = mount(), range = h.input('omega', 'range'), number = h.input('omega');
  assert.equal(+range.min, -2.5); assert.equal(+range.max, 2.5); assert.equal(range.attrs['data-physical-step'], '0.1');
  assert.equal(+number.min, -2.5); assert.equal(+number.max, 2.5);
  assert.deepEqual(h.state.ic, { x: -1, y: -1 }); assert.deepEqual(h.state.sample, { x: 2, y: 1.5 });
  assert.equal(h.state.omega, 1); near(h.state.vM.vx, -2.5); near(h.state.vM.vy, 3);
  assert.deepEqual(h.state.measurements.map(m => m.point), [{ x: -2, y: -1 }, { x: 0, y: 0 }, { x: 2, y: 1.5 }]);
  const formulas = walk(h.container).filter(node => node.className === 'sim2-formula').map(node => node.textContent);
  assert.ok(formulas.some(formula => formula.includes('|\\omega|')), 'speed formula must use absolute omega');
  assert.match(h.rows().direction, /CCW/);
  const lesson = walk(h.container).find(node => node.className === 'sim2-observe').textContent;
  assert.match(lesson, /x sang phải, y lên trên/); assert.match(lesson, /mặt phẳng XY/); assert.match(lesson, /phía \+Z/);
  checkPhysical(h.state); h.dispose();
});

test('U2 production numeric controls preserve continuous signed field invariants and sign symmetry', () => {
  const h = mount();
  for (const ic of [{ x: -4, y: -3 }, { x: -4, y: 3 }, { x: 4, y: -3 }, { x: 4, y: 3 }, { x: 2, y: 1.5 }, { x: -1, y: -1 }, { x: -.731, y: 2.143 }]) {
    h.edit('icx', ic.x); h.edit('icy', ic.y);
    for (let i = 0; i <= 400; i++) {
      const omega = 2.5 * i / 400;
      h.edit('omega', omega); const positive = h.state; checkPhysical(positive);
      h.edit('omega', -omega); const negative = h.state; checkPhysical(negative);
      near(negative.omega, -omega); near(negative.vM.vx, -positive.vM.vx); near(negative.vM.vy, -positive.vM.vy); near(negative.vM.mag, positive.vM.mag);
      assert.ok(parseFloat(h.rows().vM) >= 0);
      near(parseFloat(h.rows().vx), negative.vM.vx, .0005001); near(parseFloat(h.rows().vy), negative.vM.vy, .0005001);
      for (let k = 0; k < 3; k++) {
        const a = positive.measurements[k], b = negative.measurements[k];
        near(b.velocity.x, -a.velocity.x); near(b.velocity.y, -a.velocity.y);
      }
    }
  }
  h.dispose();
});

test('U2 all 63 2D field segments retain signed directions, scales and cap counts', () => {
  const h = mount();
  for (const ic of [{ x: -4, y: -3 }, { x: 4, y: 3 }, { x: 2, y: 1.5 }, { x: -1, y: -1 }]) {
    h.edit('icx', ic.x); h.edit('icy', ic.y);
    for (const omega of [-2.5, -1, -.1, 0, .1, 1, 2.5]) {
      h.edit('omega', omega); let capped = 0;
      assert.equal(h.field.dots.length, 63); assert.equal(h.field.segments.length, 63);
      for (const { base, tip } of h.field.segments) {
        const vx = -omega * (base.y - ic.y), vy = omega * (base.x - ic.x), magnitude = Math.hypot(vx, vy);
        const factor = magnitude ? Math.min(.18, .9 / magnitude) : 0;
        near(tip.x - base.x, vx * factor); near(tip.y - base.y, vy * factor);
      }
      for (let x = -4; x <= 4; x++) for (let y = -3; y <= 3; y++) if (Math.abs(omega) * Math.hypot(x - ic.x, y - ic.y) * .18 > .9) capped++;
      assert.equal(parseInt(h.rows().fieldCap, 10), capped);
      const main = walk(h.container).find(node => node.attrs.class === 'sim2-vector-vrel');
      const base = h.shell.tf.toWorld({ x: +main.attrs.x1, y: +main.attrs.y1 }), tip = h.shell.tf.toWorld({ x: +main.attrs.x2, y: +main.attrs.y2 });
      const { vx, vy, mag } = h.state.vM, factor = mag ? Math.min(.4, 1.8 / mag) : 0;
      near(base.x, 2); near(base.y, 1.5); near(tip.x - base.x, vx * factor); near(tip.y - base.y, vy * factor);
      assert.equal(main.attrs.visibility, mag === 0 ? 'hidden' : 'visible');
    }
  }
  h.dispose();
});

test('U2 explicit direction, rest and IC=M distinguish zero velocity from rotation sense', () => {
  const h = mount();
  for (const [omega, direction] of [[-1, /^Cùng kim đồng hồ \(CW\)$/], [0, /^Đứng yên \(ω = 0\)$/], [1, /^Ngược kim đồng hồ \(CCW\)$/]]) {
    h.edit('omega', omega); assert.match(h.rows().direction, direction);
    h.action('zero-sample'); checkPhysical(h.state); near(h.state.vM.mag, 0);
    assert.match(h.rows().sampleDirection, /không xác định/i);
    if (omega === 0) {
      assert.match(h.rows().ICStatus, /không duy nhất/i);
      assert.ok(h.field.segments.every(segment => segment.base.x === segment.tip.x && segment.base.y === segment.tip.y));
      assert.ok(h.state.measurements.every(m => m.velocity.x === 0 && m.velocity.y === 0));
    }
  }
  // Finite near-zero values remain signed: only exact zero is the rest state.
  h.action('reset-field');
  for (const omega of [-1e-13, 1e-13]) {
    h.edit('omega', omega); checkPhysical(h.state);
    const main = walk(h.container).find(node => node.attrs.class === 'sim2-vector-vrel');
    assert.equal(main.attrs.visibility, 'visible'); assert.ok(h.state.vM.mag > 0);
    assert.equal(h.state.rotationDirection, omega < 0 ? 'cw' : 'ccw');
  }
  h.dispose();
});

test('U2 compare/rest actions and keyboard changes use the same physical controls', () => {
  const h = mount(); h.edit('icx', -3.7); h.edit('icy', 2.6); h.edit('omega', 1.37);
  const before = h.state; h.action('reverse-omega'); near(h.state.omega, -1.37);
  assert.deepEqual(h.state.ic, before.ic); near(h.state.vM.mag, before.vM.mag);
  near(+h.input('omega', 'range').value, -1.37); near(+h.input('omega').value, -1.37);
  h.action('rest-field'); near(h.state.omega, 0); h.action('reverse-omega'); near(h.state.omega, 0);
  h.input('omega', 'range').emit('keydown', { key: 'Home' }); near(h.state.omega, -2.5);
  h.input('omega', 'range').emit('keydown', { key: 'End' }); near(h.state.omega, 2.5);
  h.edit('omega', -.1); h.input('omega').emit('keydown', { key: 'ArrowUp' }); near(h.state.omega, 0);
  h.input('omega').emit('keydown', { key: 'ArrowUp' }); near(h.state.omega, .1);
  h.action('reset-field'); assert.deepEqual(h.state.ic, { x: -1, y: -1 }); near(h.state.omega, 1);
  near(+h.input('icx').value, -1); near(+h.input('icy').value, -1); near(+h.input('omega').value, 1);
  h.dispose();
});

test('U2 vendored Three CPU arrows reverse without negative speeds, changing geometry or zero ghosts', () => {
  const h = mount(); h.mode('3d'); const scene = h.sceneShell.scene;
  const geometry = []; scene.traverse(node => { if (node.geometry) geometry.push(node.geometry); });
  const camera = h.sceneShell.camera.position.clone();
  for (const ic of [{ x: -4, y: -3 }, { x: -4, y: 3 }, { x: 4, y: -3 }, { x: 4, y: 3 }, { x: 2, y: 1.5 }, { x: -1, y: -1 }]) {
    h.edit('icx', ic.x); h.edit('icy', ic.y);
    for (let i = -50; i <= 50; i++) {
      const omega = i / 20; h.edit('omega', omega); const state = h.state, debug = h.debug, objects = arrows(h);
      assert.equal(objects.length, 9); assert.equal(debug.fieldArrowCount, 7);
      checkArrow(h, objects[0], { x: -omega * (1.5 - ic.y), y: omega * (2 - ic.x), z: 0 }, .24, 2.2);
      checkArrow(h, objects[1], { x: 0, y: 0, z: omega }, .55, 2.2);
      for (let k = 0; k < 7; k++) {
        const f = debug.physics.field[k], x = f.point.x / .55 - ic.x, y = f.point.y / .55 - ic.y;
        const expected = { x: -omega * y, y: omega * x, z: 0 };
        near(f.vector.x, expected.x); near(f.vector.y, expected.y); near(f.vector.z, 0);
        near(f.vector.x * x + f.vector.y * y, 0); near(f.magnitude, Math.abs(omega) * Math.hypot(x, y));
        checkArrow(h, objects[k + 2], expected, .14, 2.2);
      }
      for (const key of Object.keys(state)) assert.deepEqual(copy(debug[key]), state[key]);
      if (state.vM.mag === 0) assert.equal(h.sceneShell.labels.labels.get('velocity-m').textContent, 'v_M = 0');
      if (omega === 0) {
        assert.ok(objects.every(arrow => !arrow.visible && arrow.scale.y === 0));
        assert.equal(h.sceneShell.labels.labels.get('omega').textContent, 'ω = 0');
      }
    }
  }
  const after = []; scene.traverse(node => { if (node.geometry) after.push(node.geometry); });
  assert.deepEqual(after, geometry, 'parameter changes reuse existing geometry');
  assert.ok(h.sceneShell.camera.position.equals(camera)); h.dispose();
});

test('U2 20 full production 2D/3D cycles preserve exact signed/rest state and accessible controls', () => {
  const h = mount(); h.edit('icx', -3.713); h.edit('icy', 2.613);
  for (let cycle = 0; cycle < 20; cycle++) {
    const omega = [-2.5, -.731, 0, .731, 2.5][cycle % 5]; h.edit('omega', omega);
    const before = copy(h.state), rows = h.rows(); h.mode('3d');
    assert.equal(h.shell.root.style.display, 'none');
    assert.ok(Object.isFrozen(h.received)); assert.ok(Object.isFrozen(h.received.ic));
    assert.ok(Object.isFrozen(h.received.measurements)); assert.ok(Object.isFrozen(h.received.measurements[0].velocity));
    assert.deepEqual(copy(h.received), before);
    for (const id of ['icx', 'icy', 'omega']) {
      let node = h.input(id);
      while (node) { assert.notEqual(node, h.shell.root, `${id} must stay outside hidden viewport`); node = node.parentNode; }
    }
    for (const key of Object.keys(before)) assert.deepEqual(copy(h.debug[key]), before[key]);
    h.input('omega').emit('keydown', { key: 'ArrowUp' });
    near(h.state.omega, Math.min(2.5, omega + .1)); near(h.debug.omega, h.state.omega);
    h.edit('omega', omega); assert.deepEqual(h.state, before);
    h.mode('2d'); assert.notEqual(h.shell.root.style.display, 'none');
    assert.deepEqual(h.state, before); assert.deepEqual(h.rows(), rows);
    assert.equal(walk(h.container).filter(node => node.className === 'sim3-host').length, 0);
  }
  h.dispose(); assert.equal(h.container.children.length, 0);
});
