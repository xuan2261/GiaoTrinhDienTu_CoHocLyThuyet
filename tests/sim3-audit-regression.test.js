'use strict';
// S3-01..08: real vendored Three r160 math, geometry and scene graphs.
// Only GPU renderer, labels and DOM surfaces are stand-ins: no WebGL/render claim.
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = process.env.SIM3_SOURCE_ROOT || path.resolve(__dirname, '..');
const near = (a, b, tolerance = 1e-7, label = '') => assert.ok(Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance, `${label}: ${a} != ${b}`);

function harness() {
  const document = { activeElement: null };
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.style = {}; this.attrs = {}; this.events = {}; this.hidden = false; this.width = 520; this.height = 300; }
    appendChild(e) { if (e.parentNode) e.parentNode.removeChild(e); this.children.push(e); e.parentNode = this; return e; }
    insertBefore(e, ref) { if (e.parentNode) e.parentNode.removeChild(e); const i = this.children.indexOf(ref); if (i < 0) this.children.push(e); else this.children.splice(i, 0, e); e.parentNode = this; return e; }
    removeChild(e) { const i = this.children.indexOf(e); if (i >= 0) this.children.splice(i, 1); e.parentNode = null; return e; }
    setAttribute(k, v) { this.attrs[k] = v; }
    getAttribute(k) { return this.attrs[k]; }
    addEventListener(k, f) { this.events[k] = f; }
    removeEventListener(k) { delete this.events[k]; }
    focus() { document.activeElement = this; }
    click() { if (this.events.click) this.events.click(); }
    getBoundingClientRect() { return { width: this.width, height: this.height }; }
    getClientRects() { return [this.getBoundingClientRect()]; }
    getContext() { return { getExtension() { return null; } }; }
    get firstChild() { return this.children[0] || null; }
    get nextSibling() { const siblings = this.parentNode ? this.parentNode.children : []; return siblings[siblings.indexOf(this) + 1] || null; }
  }
  document.createElement = tag => new Element(tag);
  const observers = [];
  const ctx = vm.createContext({ console, document, devicePixelRatio: 1, addEventListener() {}, removeEventListener() {}, requestAnimationFrame() { throw Error('Adapters must remain demand-rendered'); }, cancelAnimationFrame() {}, ResizeObserver: class { constructor(cb) { this.cb = cb; observers.push(this); } observe(el) { this.el = el; } disconnect() { this.disconnected = true; } } });
  const run = f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  run('lib/three/three.umd.min.js');
  const T = ctx.THREE = { ...ctx.THREE };
  assert.equal(T.REVISION, '160');
  T.WebGLRenderer = class {
    constructor() { this.domElement = new Element('canvas'); this.info = { render: { frame: 0 } }; }
    setPixelRatio() {}
    setSize() {}
    render(scene, camera) { scene.updateMatrixWorld(true); camera.updateMatrixWorld(true); this.info.render.frame++; }
    dispose() { this.disposed = true; }
    forceContextLoss() { this.lost = true; }
  };
  ctx.Sim3LabelLayer = { create() { const labels = []; return { add(...args) { labels.push(args); }, update() {}, dispose() {}, margin() { return 0; }, bounds() { return { fillRatio: 0 }; }, distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); }, countVisible() { return labels.length; } }; } };
  for (const f of ['coordinate-system', 'three-primitives', 'visual-kit', 'three-dispose', 'three-shell', 'mode-toggle']) run(`js/sim3/core/${f}.js`);
  let capture;
  const actualCreate = ctx.Sim3Shell.create;
  ctx.Sim3Shell.create = cfg => { capture = actualCreate(cfg); return capture; };
  for (const f of fs.readdirSync(path.join(ROOT, 'js/sim3/sims'))) run('js/sim3/sims/' + f);
  function mount(name, state) { const parent = new Element('div'), host = new Element('div'); parent.appendChild(host); const adapter = ctx[name].create({ host }); assert.ok(adapter, 'CPU shell creates adapter'); const shell = capture; adapter.setState(state); return { adapter, shell, scene: shell.scene, camera: shell.camera, host }; }
  return { ctx, T, mount, Element, document, observers };
}
function mesh(scene, type, predicate = () => true) { let result; scene.traverse(o => { if (!result && o.geometry && o.geometry.type === type && predicate(o)) result = o; }); assert.ok(result, `Missing ${type}`); return result; }
function worldVertices(T, object) { const p = object.geometry.attributes.position; return Array.from({ length: p.count }, (_, i) => object.localToWorld(new T.Vector3().fromBufferAttribute(p, i))); }
function topCapNormal(T, object) { const g = object.geometry, top = g.groups.find(x => x.materialIndex === 1), index = g.index.getX(top.start); return new T.Vector3().fromBufferAttribute(g.attributes.normal, index).transformDirection(object.matrixWorld); }

test('Collision impact diagnostic uses the contact snapshot after the full step advances', () => {
  const { mount: mountSim2 } = require('./helpers/sim2-route-harness.cjs');
  for (const elapsed of [1.75, 1.8]) {
    const sim2 = mountSim2('ch3-6-2'); sim2.step(elapsed);
    const state = sim2.sim3State;
    assert.ok(state.collided && state.impactContact);
    if (elapsed > 1.75) assert.ok(Math.abs(state.p2.x - state.p1.x) - state.r1 - state.r2 > 0.1, 'end-step positions are already separated');
    const contact = state.impactContact;
    const expected = Math.abs(Math.hypot(contact.p2.x - contact.p1.x, contact.p2.y - contact.p1.y) - state.r1 - state.r2);
    near(expected, 0, 1e-12, 'independent contact sample');
    const { ctx, mount } = harness(), m = mount('Sim3Ch362', state);
    function verify(current) {
      const debug = ctx.__SIM3_DEBUG__['ch3-6-2'];
      near(debug.impactContactResidual, expected, 1e-12);
      near(debug.physics.contactResidual, expected, 1e-12);
      near(debug.physics.impactRatio, state.r1 / (state.r1 + state.r2), 1e-12);
      near(debug.physics.sourceSeparation, Math.abs(current.p2.x - current.p1.x), 1e-12, 'source separation stays live');
      near(debug.distanceToImpact, Math.max(0, Math.abs(current.p2.x - current.p1.x) - state.r1 - state.r2), 1e-12, 'live gap stays live');
    }
    verify(state);
    sim2.step(0.15); m.adapter.setState(sim2.sim3State); verify(sim2.sim3State);
    m.adapter.reset(); m.adapter.setState({ ...sim2.sim3State, impactContact: null });
    assert.equal(ctx.__SIM3_DEBUG__['ch3-6-2'].impactContactResidual, null, 'post-impact state without a sample cannot prove contact');
    assert.equal(ctx.__SIM3_DEBUG__['ch3-6-2'].physics.contactResidual, null);
    assert.equal(ctx.__SIM3_DEBUG__['ch3-6-2'].physics.impactRatio, null);
    m.adapter.reset(); sim2.controls.playback.onReset(); m.adapter.setState(sim2.sim3State);
    assert.equal(ctx.__SIM3_DEBUG__['ch3-6-2'].impactContactResidual, null, 'reset clears the contact diagnostic');
    m.adapter.dispose(); sim2.dispose();
  }
});

// Geometry invariants are independent of debug strings/readouts.
test('S3-01: Coriolis disk, rim, sector and bead share XY plane at every phase', () => {
  const { T, mount } = harness();
  const m = mount('Sim3Ch244', { point: { x: 2, y: 0 }, omega: 1.2, vRelVec: { x: 1.5, y: 0 }, phi: 0 });
  const disk = mesh(m.scene, 'CylinderGeometry', o => o.geometry.parameters.radiusTop === 2.4), bead = mesh(m.scene, 'SphereGeometry'), sector = mesh(m.scene, 'RingGeometry'), rim = mesh(m.scene, 'TorusGeometry');
  for (const phi of [0, Math.PI / 4, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    m.adapter.setState({ point: { x: 2 * Math.cos(phi), y: 2 * Math.sin(phi) }, omega: 1.2, vRelVec: { x: 1.5 * Math.cos(phi), y: 1.5 * Math.sin(phi) }, phi });
    near(Math.abs(topCapNormal(T, disk).z), 1, 1e-7, 'disk normal parallel to omega');
    near(Math.abs(new T.Vector3(0, 0, 1).transformDirection(rim.matrixWorld).z), 1);
    near(Math.abs(new T.Vector3(0, 0, 1).transformDirection(sector.matrixWorld).z), 1);
    const front = Math.max(...worldVertices(T, disk).map(v => v.z));
    near(bead.position.z - front, bead.geometry.parameters.radius, 1e-7, 'bead rests on front face');
    assert.ok(sector.position.z > front, 'sector stays in front of the disk');
    near(bead.position.x, 1.1 * Math.cos(phi)); near(bead.position.y, 1.1 * Math.sin(phi));
  }
  m.adapter.dispose();
});

test('S3-02: friction-cone apex starts at contact and every section opens along normal', () => {
  const { T, mount } = harness();
  const m = mount('Sim3Ch153', { betaDeg: 18, mu: 0.45 });
  const cone = mesh(m.scene, 'ConeGeometry');
  for (const betaDeg of [0, 3, 18, 45, 60]) for (const mu of [0, 0.1, 0.45, 1]) {
    m.adapter.setState({ betaDeg, mu });
    const beta = betaDeg * Math.PI / 180, n = new T.Vector3(-Math.sin(beta), Math.cos(beta), 0);
    const contact = new T.Vector3(0.35 * Math.cos(beta), 0.35 * Math.sin(beta), 0).addScaledVector(n, 0.11);
    const h = cone.geometry.parameters.height;
    near(cone.localToWorld(new T.Vector3(0, h / 2, 0)).distanceTo(contact), 0, 1e-7, 'apex/contact');
    const base = cone.localToWorld(new T.Vector3(0, -h / 2, 0)).sub(contact);
    near(base.dot(n), h); near(base.clone().cross(n).length(), 0);
    for (const v of worldVertices(T, cone)) {
      const rel = v.sub(contact), elevation = rel.dot(n), radial = rel.clone().addScaledVector(n, -elevation).length();
      assert.ok(elevation > -1e-7 && elevation < h + 1e-7);
      near(radial, mu * elevation, 2e-7, 'cone cross-section');
    }
  }
  m.adapter.dispose();
});

function beltState(r1, r2, phi = 0, omega = 1) { return { r1, r2, omega1: omega, gearOmega2: -omega * r1 / r2, beltOmega2: omega * r1 / r2, gearPhi1: phi, gearPhi2: -phi * r1 / r2, beltPhi2: phi * r1 / r2 }; }
test('S3-03: belt dots follow tangent spans and wraps at signed no-slip arc speed', () => {
  const { T, mount } = harness(), m = mount('Sim3Ch232', beltState(1.4, 2));
  const dots = m.scene.children.filter(o => o.geometry && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 0.055);
  for (const [sourceR1, sourceR2] of [[1.4, 2], [1, 1], [0.8, 2.5], [2.5, 0.8]]) {
    const r1 = sourceR1 / 2, r2 = sourceR2 / 2, dx = 3.44, nx = (r1 - r2) / dx, ny = Math.sqrt(1 - nx * nx), a = Math.acos(nx);
    const c1 = new T.Vector3(-1.62, -0.22, 1.28), c2 = new T.Vector3(1.82, -0.22, 1.28);
    const ta = c1.clone().add(new T.Vector3(r1 * nx, r1 * ny, 0)), tb = c2.clone().add(new T.Vector3(r2 * nx, r2 * ny, 0));
    const ba = c1.clone().add(new T.Vector3(r1 * nx, -r1 * ny, 0)), bb = c2.clone().add(new T.Vector3(r2 * nx, -r2 * ny, 0));
    const span = ta.distanceTo(tb), left = r1 * (2 * Math.PI - 2 * a), right = r2 * 2 * a, total = left + 2 * span + right;
    function onPath(p) {
      if (p.x <= ta.x + 1e-7) return { error: Math.abs(p.distanceTo(c1) - r1), tangent: new T.Vector3(0, 0, 1).cross(p.clone().sub(c1)).normalize() };
      if (p.x >= tb.x - 1e-7) return { error: Math.abs(p.distanceTo(c2) - r2), tangent: new T.Vector3(0, 0, 1).cross(p.clone().sub(c2)).normalize() };
      const upper = p.y > -0.22, start = upper ? tb : ba, end = upper ? ta : bb, tangent = end.clone().sub(start).normalize();
      return { error: p.clone().sub(start).cross(tangent).length(), tangent };
    }
    const phases = [0, 0.7, 9, 31, -17, -0.2, ...[left, left + span, left + span + right, total].flatMap(s => [(s - 1e-6) / r1, s / r1, (s + 1e-6) / r1])];
    for (const phi of phases) for (const omega of [1.7, 0, -2]) {
      m.adapter.setState(beltState(sourceR1, sourceR2, phi, omega));
      const before = dots.map(d => d.position.clone()), dt = 1e-6;
      m.adapter.setState(beltState(sourceR1, sourceR2, phi + omega * dt, omega));
      before.forEach((p, i) => {
        const expected = onPath(p), velocity = dots[i].position.clone().sub(p).divideScalar(dt);
        near(expected.error, 0, 2e-7, 'dot on belt');
        near(velocity.length(), Math.abs(omega) * r1, 3e-6, 'no-slip speed');
        near(velocity.dot(expected.tangent), omega * r1, 3e-6, 'signed tangent speed');
        near(p.z, 1.28);
      });
    }
  }
  m.adapter.dispose();
});

test('S3-04: theta arc is centered at pivot, coplanar and bounded by cord/vertical', () => {
  const { T, mount } = harness(), m = mount('Sim3Ch313', { aFrame: 0 });
  const arc = mesh(m.scene, 'TorusGeometry'), pivot = new T.Vector3(0, 1.95, 0);
  for (const acceleration of [0, 1, 3, 8, -3, -8]) {
    const theta = Math.atan2(acceleration, 9.81);
    m.adapter.setState({ aFrame: acceleration });
    if (!theta) { assert.equal(arc.visible, false, 'zero theta hides degenerate arc'); continue; }
    assert.equal(arc.visible, true); near(arc.geometry.parameters.arc, Math.abs(theta));
    near(arc.position.x, pivot.x); near(arc.position.y, pivot.y);
    near(Math.abs(new T.Vector3(0, 0, 1).transformDirection(arc.matrixWorld).z), 1);
    const { radius, arc: sweep } = arc.geometry.parameters;
    const endpoints = [new T.Vector3(radius, 0, 0), new T.Vector3(radius * Math.cos(sweep), radius * Math.sin(sweep), 0)].map(p => arc.localToWorld(p).sub(arc.position).normalize());
    const down = new T.Vector3(0, -1, 0), cord = new T.Vector3(-Math.sin(theta), -Math.cos(theta), 0);
    near(Math.min(...endpoints.map(p => p.distanceTo(down))), 0); near(Math.min(...endpoints.map(p => p.distanceTo(cord))), 0);
  }
  m.adapter.dispose();
});

function ellipseState(t) { const speed = Math.hypot(4 * Math.sin(t), 2.5 * Math.cos(t)); return { point: { x: 4 * Math.cos(t), y: 2.5 * Math.sin(t) }, tangent: { x: -4 * Math.sin(t) / speed, y: 2.5 * Math.cos(t) / speed }, normal: { x: -2.5 * Math.cos(t) / speed, y: -4 * Math.sin(t) / speed }, radius: speed ** 3 / 10 }; }
test('S3-05: full ellipse/circle/marker/vector geometry fits frustum across states and resize', () => {
  const { T, mount, observers } = harness(), m = mount('Sim3Ch213', ellipseState(0));
  const circle = mesh(m.scene, 'TorusGeometry');
  let maxNdc = 0;
  function verify() {
    m.scene.traverse(o => {
      if (!o.geometry || !o.visible || o.geometry.type === 'PlaneGeometry') return;
      for (const v of worldVertices(T, o)) {
        v.project(m.camera); maxNdc = Math.max(maxNdc, Math.abs(v.x), Math.abs(v.y));
        assert.ok(Number.isFinite(v.x) && Math.abs(v.x) <= 0.92 && Math.abs(v.y) <= 0.92 && v.z >= -1 && v.z <= 1, `geometry clipped: ${v.toArray()}`);
      }
    });
  }
  for (let i = 0; i < 72; i++) {
    const state = ellipseState(Math.PI / 2 + i * Math.PI / 36); m.adapter.setState(state);
    near(circle.scale.x * circle.geometry.parameters.radius, state.radius * 0.54, 1e-10, 'physical radius stays intact');
    for (const width of [360, 520, 900, 1024]) { m.host.width = width; m.host.height = 420; observers[0].cb(); verify(); }
  }
  assert.ok(maxNdc > 0.25, 'fit must not shrink scene into irrelevance');
  m.adapter.dispose();
});

test('S3-06: block bottom and contact cues sit on the inclined top surface', () => {
  const { T, mount } = harness(), m = mount('Sim3Ch153', { betaDeg: 18, mu: 0.45 });
  const plane = mesh(m.scene, 'BoxGeometry', o => o.geometry.parameters.width === 5), block = mesh(m.scene, 'BoxGeometry', o => o.geometry.parameters.width === 0.9), shadow = mesh(m.scene, 'CircleGeometry'), band = mesh(m.scene, 'RingGeometry');
  for (const betaDeg of [0, 3, 18, 45, 60]) {
    m.adapter.setState({ betaDeg, mu: 0.45 });
    const beta = betaDeg * Math.PI / 180, n = new T.Vector3(-Math.sin(beta), Math.cos(beta), 0);
    const top = Math.max(...worldVertices(T, plane).map(p => p.dot(n))), bottom = Math.min(...worldVertices(T, block).map(p => p.dot(n)));
    near(top, 0.11); near(bottom, top, 1e-7, 'no plane penetration/gap');
    for (const cue of [shadow, band]) { assert.ok(cue.position.dot(n) > top && cue.position.dot(n) < top + 0.025); near(Math.abs(new T.Vector3(0, 0, 1).transformDirection(cue.matrixWorld).dot(n)), 1); }
  }
  m.adapter.dispose();
});

test('S3-07: null, thrown and synchronous-fallback factories leave no host or canvas', () => {
  for (const failure of ['three-missing', 'webgl-unavailable', 'null', 'throw', 'callback-with-object']) {
    const { ctx, Element, document } = harness(), container = new Element('div'), two = new Element('div'); container.appendChild(two);
    const reasons = []; let cleanupCount = 0;
    if (failure === 'three-missing') ctx.THREE = null;
    if (failure === 'webgl-unavailable') ctx.__SIM3_FORCE_WEBGL_FAIL = true;
    const mode = ctx.Sim3Mode.attach({ container, shell2dRoot: two, onFallback(reason) { reasons.push(reason); }, create3d({ host, onFallback }) {
      if (failure === 'null') return null;
      if (failure === 'throw') throw Error('create sentinel');
      if (failure === 'callback-with-object') { onFallback('synchronous'); return { host, dispose() { cleanupCount++; } }; }
      return ctx.Sim3Shell.create({ host, onFallback });
    } });
    const toggle = container.children.find(e => e.className === 'sim3-mode-toggle'), status = container.children.find(e => e.className === 'sim3-fallback');
    for (let attempt = 0; attempt < 3; attempt++) {
      toggle.children[1].click();
      assert.equal(container.children.filter(e => e.className === 'sim3-host').length, 0, failure + ': orphan host');
      const descendants = e => [e, ...e.children.flatMap(descendants)];
      assert.equal(descendants(container).filter(e => e.tag === 'canvas').length, 0, 'no residual canvas');
      assert.notEqual(two.style.display, 'none'); assert.equal(status.hidden, false); assert.equal(toggle.children[0].attrs['aria-pressed'], 'true'); assert.equal(document.activeElement, toggle.children[0]);
    }
    assert.equal(reasons.length, 3); if (failure === 'callback-with-object') assert.equal(cleanupCount, 3);
    mode.dispose(); mode.dispose(); assert.equal(container.children.length, 1);
  }
});

test('S3-08: arrow display length includes actual cone tip for zero/min/max/signed cases', () => {
  const { ctx, T } = harness(), P = ctx.Sim3Primitives;
  for (const headLength of [0.28, 0.32, 0.36, 0.42]) for (const [vector, opts, expected] of [
    [{ x: 2, y: 0, z: 0 }, { factor: 0.5, maxLength: 1 }, 1],
    [{ x: -4, y: 1, z: -2 }, { factor: 5, maxLength: 0.8 }, 0.8],
    [{ x: 0, y: -0.01, z: 0 }, { factor: 1, minLength: 0.2 }, 0.2],
    [{ x: 0, y: 0, z: 0 }, { factor: 1, minLength: 0.2 }, 0]
  ]) {
    const arrow = P.arrow(T, 0xff0000, { headLength }), base = { x: 1, y: 2, z: -3 };
    P.updateArrow(T, arrow, vector, { ...opts, base }); arrow.updateMatrixWorld(true);
    const head = mesh(arrow, 'ConeGeometry'), tip = head.localToWorld(new T.Vector3(0, head.geometry.parameters.height / 2, 0));
    near(tip.distanceTo(arrow.position), expected, 1e-7, 'actual tip length'); near(arrow.userData.sim3DisplayLength, expected);
    if (expected) { const direction = new T.Vector3(vector.x, vector.y, vector.z).normalize(); near(tip.sub(arrow.position).normalize().dot(direction), 1); }
    else assert.equal(arrow.visible, false);
  }
});

// Compatibility and resource checks intentionally execute the real shell, adapters
// and disposal module. They do not emulate shader compilation or rasterization.
test('All ten adapters remain demand-rendered and dispose each owned resource once', () => {
  const { T, mount } = harness();
  const cases = [
    ['Sim3Ch115', { forces: [{ r: { x: -2, y: 1 }, F: { fx: 40, fy: 20 } }, { r: { x: 2, y: -1 }, F: { fx: -20, fy: 40 } }] }],
    ['Sim3Ch153', { betaDeg: 18, mu: 0.45 }],
    ['Sim3Ch213', ellipseState(Math.PI / 2)],
    ['Sim3Ch222', { phi: 1.2, omega: -2, radius: 3 }],
    ['Sim3Ch232', beltState(1.4, 2, 1)],
    ['Sim3Ch244', { point: { x: 1, y: 2 }, omega: -2, vRelVec: { x: -1, y: 3 }, phi: 1.2 }],
    ['Sim3Ch253', { ic: { x: -1, y: -1 }, sample: { x: 2, y: 1.5 }, omega: -2 }],
    ['Sim3Ch313', { aFrame: 8 }],
    ['Sim3Ch353', { r: 3, phi: 0.4, inertia: 36, omega: 1, angularMomentum: 36 }],
    ['Sim3Ch362', { p1: { x: -0.6, y: 0 }, p2: { x: 0.8, y: 0 }, v1: { x: -0.76, y: 0 }, v2: { x: 1.24, y: 0 }, r1: 0.6, r2: 0.8, collided: true, impactPoint: { x: 0, y: 0 } }]
  ];
  for (const [name, state] of cases) {
    const m = mount(name, state), counts = new Map();
    m.adapter.setState(state);
    m.scene.traverse(o => {
      if (o.geometry) for (const v of worldVertices(T, o)) assert.ok(v.toArray().every(Number.isFinite), name + ' finite geometry');
      for (const resource of [o.geometry, ...(Array.isArray(o.material) ? o.material : [o.material])]) {
        if (!resource || counts.has(resource)) continue;
        counts.set(resource, 0); resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource) + 1));
      }
    });
    assert.ok(m.shell.renderer.info.render.frame >= 3);
    m.adapter.dispose(); m.adapter.dispose();
    for (const count of counts.values()) assert.equal(count, 1, name + ' resource disposal');
    assert.equal(m.host.parentNode, null); assert.equal(m.shell.renderer.disposed, true);
  }
});

test('Changed cone/angle geometry is disposed and unchanged angle geometry is reused', () => {
  const { mount } = harness();
  for (const [name, initial, next, geometryType] of [
    ['Sim3Ch153', { betaDeg: 18, mu: 0.45 }, { betaDeg: 60, mu: 1 }, 'ConeGeometry'],
    ['Sim3Ch313', { aFrame: 1 }, { aFrame: -8 }, 'TorusGeometry']
  ]) {
    const m = mount(name, initial), object = mesh(m.scene, geometryType), previous = object.geometry; let disposed = 0;
    previous.addEventListener('dispose', () => disposed++); m.adapter.setState(next);
    assert.notEqual(object.geometry, previous); assert.equal(disposed, 1);
    const current = object.geometry; if (name === 'Sim3Ch313') { m.adapter.setState(next); assert.equal(object.geometry, current); }
    m.adapter.dispose(); assert.equal(disposed, 1);
  }
});

test('Mode owns its host through normal toggles, update failure and throwing disposal', () => {
  const { ctx, Element } = harness();
  const container = new Element('div'), two = new Element('div'); container.appendChild(two);
  let calls = 0, disposals = 0, failUpdate = false;
  const mode = ctx.Sim3Mode.attach({ container, shell2dRoot: two, create3d({ host }) { calls++; host.appendChild(new Element('canvas')); return { host, resize() {}, setState() { if (failUpdate) throw Error('update sentinel'); }, dispose() { disposals++; throw Error('dispose sentinel'); } }; } });
  const toggle = container.children.find(e => e.className === 'sim3-mode-toggle');
  mode.setState({ value: 1 }); toggle.children[1].click(); assert.equal(two.style.display, 'none');
  toggle.children[0].click(); assert.notEqual(two.style.display, 'none'); assert.equal(disposals, 1);
  toggle.children[1].click(); failUpdate = true; mode.setState({ value: 2 });
  assert.notEqual(two.style.display, 'none'); assert.equal(disposals, 2);
  assert.equal(container.children.filter(e => e.className === 'sim3-host').length, 0);
  mode.dispose(); mode.dispose(); assert.equal(calls, 2); assert.equal(container.children.length, 1);
});

test('S3-08 review: force and moment geometry stays framed over expanded synthetic endpoints and resize', () => {
  const { T, mount, observers } = harness();
  const positions = [{x:-2.5,y:1.5},{x:2.5,y:.5}];
  const stateFor = (a,b) => ({forces:[a,b].map((tip,i)=>({r:positions[i],F:{fx:(tip.x-positions[i].x)*50,fy:(tip.y-positions[i].y)*50}}))});
  const values=[-3.5,0,3.5];
  const m=mount('Sim3Ch115',stateFor({x:-3.5,y:-3.5},{x:3.5,y:3.5}));
  let checked=0;
  for(const width of [360,520,900]) {
    m.host.width=width;m.host.height=420;
    observers.find(o=>o.el===m.host).cb();
    for(const x1 of values)for(const y1 of values)for(const x2 of values)for(const y2 of values){
      m.adapter.setState(stateFor({x:x1,y:y1},{x:x2,y:y2}));
      for(const object of m.scene.children){
        if(!object.visible || ['GridHelper','PlaneGeometry'].includes(object.type) || object.geometry?.type==='PlaneGeometry')continue;
        object.traverse(child=>{
          if(!child.geometry || !child.geometry.attributes.position)return;
          for(const p of worldVertices(T,child)){
            const n=p.project(m.camera);
            assert.ok(Math.abs(n.x)<=.92 && Math.abs(n.y)<=.92 && n.z>=-1 && n.z<=1,`force scene outside frustum: ${width} ${n.toArray()}`);
          }
        });
      }
      checked++;
    }
  }
  assert.equal(checked,243);m.adapter.dispose();
});
