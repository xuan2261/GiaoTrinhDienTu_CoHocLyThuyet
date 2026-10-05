'use strict';

// Real production source + vendored Three r160 CPU math/geometry. Only the
// browser/DOM/canvas backend and GPU renderer are synthetic. Rectangles below
// are deterministic inputs to projection calculations, never measured layout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const REPO = process.env.SIM2_TEST_REPO || path.resolve(__dirname, '../..');
const ROUTES = Object.freeze(['ch1-1-5', 'ch1-5-3', 'ch2-1-3', 'ch2-2-2',
  'ch2-3-2', 'ch2-4-4', 'ch2-5-3', 'ch3-1-3', 'ch3-5-3', 'ch3-6-2']);
const copy = value => JSON.parse(JSON.stringify(value));
const walk = node => [node, ...node.children.flatMap(walk)];

function mountProductionThree(route, options = {}) {
  assert.ok(ROUTES.includes(route), `Unknown production adapter route ${route}`);
  const all = [], frames = new Map(), timers = new Map(), sources = [];
  const scenes = [], resources = new Map(), clocks = [], renderers = [];
  let serial = 0, state, received, shell, sceneShell, adapter;
  const document = { activeElement: null };

  function element(tag) {
    let text = '';
    const classes = new Set(), attrs = {}, listeners = {};
    const node = {
      tag, tagName: tag.toUpperCase(), attrs, children: [], dataset: {}, style: {}, listeners,
      clientWidth: 640, clientHeight: 440, value: '', min: '', max: '', step: '', type: '', hidden: false,
      classList: {
        add(...values) { values.forEach(value => classes.add(value)); },
        remove(...values) { values.forEach(value => classes.delete(value)); },
        toggle(value, force) { const on = force == null ? !classes.has(value) : force; if (on) classes.add(value); else classes.delete(value); return on; },
        contains(value) { return classes.has(value); }
      },
      setAttribute(key, value) {
        attrs[key] = String(value);
        if (key === 'class') this.className = value;
        if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = String(value);
      },
      getAttribute(key) { return attrs[key] ?? null; },
      removeAttribute(key) { delete attrs[key]; },
      appendChild(child) { return this.insertBefore(child, null); },
      insertBefore(child, before) {
        if (child.parentNode) child.parentNode.removeChild(child);
        const index = this.children.indexOf(before);
        this.children.splice(index < 0 ? this.children.length : index, 0, child);
        child.parentNode = this;
        return child;
      },
      removeChild(child) { this.children = this.children.filter(value => value !== child); child.parentNode = null; return child; },
      remove() { if (this.parentNode) this.parentNode.removeChild(this); },
      addEventListener(type, listener) { (listeners[type] ||= []).push(listener); },
      removeEventListener(type, listener) { listeners[type] = (listeners[type] || []).filter(value => value !== listener); },
      emit(type, event = {}) {
        for (const listener of [...listeners[type] || []]) listener({ target: this, currentTarget: this, preventDefault() {}, stopPropagation() {}, ...event });
      },
      click() { this.emit('click'); },
      focus() { document.activeElement = this; },
      getBoundingClientRect() {
        const width = this.rectWidth ?? 640, height = this.rectHeight ?? 440;
        return { left: 0, top: 0, right: width, bottom: height, width, height };
      },
      getClientRects() { return [this.getBoundingClientRect()]; },
      setPointerCapture(id) { this.captured = id; },
      hasPointerCapture(id) { return this.captured === id; },
      releasePointerCapture(id) { if (this.captured === id) this.captured = null; },
      querySelectorAll(selector) { return walk(this).slice(1).filter(value => selector.startsWith('.') ? value.classList.contains(selector.slice(1)) : value.tag === selector); },
      querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
      getContext(type) {
        if (type === 'webgl' || type === 'webgl2') return { getExtension() { return null; } };
        if (type !== '2d') return null;
        if (!this.context2d) {
          const calls = [];
          this.context2d = { calls, globalAlpha: 1 };
          for (const method of ['setTransform', 'clearRect', 'beginPath', 'moveTo', 'lineTo', 'stroke', 'arc', 'fill', 'save', 'restore', 'closePath', 'drawImage']) {
            this.context2d[method] = (...args) => { calls.push({ method, args }); };
          }
        }
        return this.context2d;
      }
    };
    Object.defineProperties(node, {
      className: { get() { return [...classes].join(' '); }, set(value) { classes.clear(); String(value).split(/\s+/).filter(Boolean).forEach(item => classes.add(item)); attrs.class = String(value); } },
      firstChild: { get() { return this.children[0] || null; } },
      nextSibling: { get() { const siblings = this.parentNode?.children || []; return siblings[siblings.indexOf(this) + 1] || null; } },
      textContent: { get() { return text + this.children.map(child => child.textContent).join(''); }, set(value) { text = String(value); this.children.forEach(child => { child.parentNode = null; }); this.children = []; } },
      innerHTML: { get() { return text; }, set(value) { this.textContent = String(value).replace(/<[^>]*>/g, ''); } }
    });
    all.push(node);
    return node;
  }
  document.createElement = element;
  document.createElementNS = (_, tag) => element(tag);
  const root = element('window');
  Object.assign(root, { document, devicePixelRatio: 1, matchMedia: () => ({ matches: true }),
    getComputedStyle: node => ({ display: node.style.display || 'block' }),
    requestAnimationFrame: fn => { frames.set(++serial, fn); return serial; },
    cancelAnimationFrame: id => frames.delete(id) });
  const context = vm.createContext({ window: root, document, console,
    setTimeout: fn => { timers.set(++serial, fn); return serial; }, clearTimeout: id => timers.delete(id) });
  function run(file) {
    const original = fs.readFileSync(path.join(REPO, file), 'utf8');
    const source = options.transformSource ? options.transformSource(file, original) : original;
    vm.runInContext(source, context, { filename: file });
    sources.push(file);
  }

  run('lib/three/three.umd.min.js');
  const THREE = root.THREE = { ...context.THREE };
  assert.equal(THREE.REVISION, '160');
  function observeScene(scene) {
    scene.traverse(node => {
      const owned = [node.geometry, ...(Array.isArray(node.material) ? node.material : [node.material])];
      for (const resource of owned) {
        if (!resource || resources.has(resource)) continue;
        const record = { resource, scene, disposeCount: 0 };
        resources.set(resource, record);
        resource.addEventListener('dispose', () => { record.disposeCount++; });
      }
    });
  }
  THREE.WebGLRenderer = class CpuRenderer {
    constructor() {
      this.domElement = element('canvas'); this.info = { render: { frame: 0 } };
      this.disposeCount = 0; this.contextLossCount = 0;
      this.renderLists = { disposeCount: 0, dispose() { this.disposeCount++; } };
      renderers.push(this);
    }
    setPixelRatio(value) { this.pixelRatio = value; }
    setSize(width, height) { this.domElement.rectWidth = width; this.domElement.rectHeight = height; }
    render(scene, camera) {
      scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
      observeScene(scene); this.info.render.frame++;
    }
    dispose() { this.disposeCount++; }
    forceContextLoss() { this.contextLossCount++; }
  };
  for (const name of ['coordinate-system', 'three-primitives', 'visual-kit', 'three-label-layer', 'three-dispose', 'three-shell', 'mode-toggle']) run(`js/sim3/core/${name}.js`);
  const actual3dCreate = root.Sim3Shell.create;
  root.Sim3Shell.create = config => {
    const result = actual3dCreate(config);
    if (result) { sceneShell = result; scenes.push(result); }
    return result;
  };
  const actualAttach = root.Sim3Mode.attach;
  root.Sim3Mode.attach = config => {
    const result = actualAttach(config), setState = result.setState;
    result.setState = value => { state = copy(value); return setState(value); };
    return result;
  };
  run(`js/sim3/sims/${route}-3d.js`);
  const name = 'Sim3Ch' + route.replace(/\D/g, '');
  const actualAdapter = root[name].create;
  root[name].create = config => {
    const result = actualAdapter(config);
    if (result) {
      adapter = result;
      const setState = result.setState;
      result.setState = value => { received = value; return setState(value); };
    }
    return result;
  };
  for (const file of ['registry', 'physics/statics', 'physics/kinematics', 'physics/dynamics', 'core/palette', 'core/transform', 'core/svg-render', 'core/overlay', 'core/canvas-underlay', 'core/animation-clock', 'core/controls', 'core/panel', 'core/sim-shell']) run(`js/sim2/${file}.js`);
  const actualClock = root.Sim2AnimationClock.createClock;
  root.Sim2AnimationClock.createClock = config => { const clock = actualClock(config); clocks.push(clock); return clock; };
  const actual2dCreate = root.Sim2Shell.createSimShell;
  root.Sim2Shell.createSimShell = config => (shell = actual2dCreate(config));
  run(`js/sim2/sims/${route.slice(0, 3)}/${route}.js`);
  const host = element('div');
  const instance = root.Sim2Registry.get(route)(host);
  const nodes = () => walk(host);
  const input = (id, type = 'number') => nodes().find(node => node.type === type && (node.attrs['data-id'] === id || node.attrs['data-number-for'] === id));
  function edit(id, value) { const node = input(id); assert.ok(node, `Missing number ${id}`); node.value = String(value); node.emit('change'); }
  function action(id) { const node = nodes().find(node => node.attrs['data-action'] === id); assert.ok(node, `Missing action ${id}`); node.click(); }
  function playback(action) { const node = nodes().find(node => node.classList.contains(`sim2-${action}`)); assert.ok(node, `Missing playback ${action}`); node.click(); }
  function mode(value) { const node = nodes().find(node => node.dataset.mode === value); assert.ok(node, `Missing mode ${value}`); node.click(); }
  const rows = () => Object.fromEntries(nodes().filter(node => node.attrs['data-readout-key']).map(node => [node.attrs['data-readout-key'], node.children.find(child => child.classList.contains('sim2-readout-value')).textContent]));
  function frame(timestamp) {
    const pending = [...frames]; frames.clear();
    for (const [, fn] of pending) fn(timestamp);
    return pending.length;
  }
  return { route, root, document, host, all, nodes, input, edit, action, playback, mode, rows, frame,
    THREE, frames, timers, sources, scenes, resources, renderers, clocks,
    get state() { return state; }, get received() { return received; }, get shell() { return shell; },
    get sceneShell() { return sceneShell; }, get adapter() { return adapter; },
    get debug() { return root.__SIM3_DEBUG__?.[route]; }, dispose: () => instance.dispose() };
}

module.exports = { mountProductionThree, ROUTES, copy, walk };
