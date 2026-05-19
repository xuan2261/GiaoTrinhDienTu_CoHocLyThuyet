const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const { assertStableHeap } = require('../tools/audit_v2_disposal');

function runScript(context, file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
}

function walkJsFiles(dir) {
  const files = [];
  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) files.push(...walkJsFiles(fullPath));
    else if (name.endsWith('.js')) files.push(fullPath);
  }
  return files;
}

function makeElement() {
  return {
    classList: { add() {} },
    setAttribute(name, value) { this[name] = value; },
    appendChild() {},
    addEventListener() {},
    removeEventListener() {},
    style: {},
    textContent: '',
  };
}

{
  assert.strictEqual(
    assertStableHeap(10 * 1024 * 1024, 12 * 1024 * 1024),
    2,
    'disposal audit should allow deltas within threshold'
  );
  assert.throws(
    () => assertStableHeap(10 * 1024 * 1024, 16 * 1024 * 1024),
    /Potential memory leak detected/,
    'disposal audit must fail release gate when heap grows past threshold'
  );
  assert.throws(
    () => assertStableHeap(0, 16 * 1024 * 1024),
    /Heap metric unavailable/,
    'disposal audit must fail clearly when heap metrics are unavailable'
  );
}

{
  const sharedSources = [
    'js/sim-rendering.js',
    'js/sim-animation-engine.js',
  ].map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');
  assert.ok(!/\bdrawTrail\b/.test(sharedSources), 'shared simulation engines must not expose trail drawing');

  const routeTrailDrawers = walkJsFiles(path.join(ROOT, 'js', 'sims'))
    .filter(file => /\bdrawTrail\s*\(/.test(fs.readFileSync(file, 'utf8')))
    .map(file => path.relative(ROOT, file).replace(/\\/g, '/'));
  assert.deepStrictEqual(routeTrailDrawers, [], 'active simulation routes must not draw motion trails');

  const routeTrailState = walkJsFiles(path.join(ROOT, 'js', 'sims'))
    .filter(file => /\btrail[12]?\b|state\.trail/.test(fs.readFileSync(file, 'utf8')))
    .map(file => path.relative(ROOT, file).replace(/\\/g, '/'));
  assert.deepStrictEqual(routeTrailState, [], 'active simulation routes must not keep motion trail state');
}

{
  const calls = [];
  const context = {
    window: { SimCore: { drawArrow: (...args) => calls.push(args) } },
    document: {},
  };
  context.window.window = context.window;
  vm.createContext(context);
  runScript(context, 'js/sim-route-renderer-primitives.js');
  context.window.SimRouteRendererPrimitives.arrow({}, 10, 20, 100, 120, '#123456', 'F');
  assert.strictEqual(calls.length, 1, 'P.arrow must draw through SimCore.drawArrow');
  assert.deepStrictEqual(calls[0].slice(1), [10, 20, 100, 120, '#123456', 2.4, 'F']);
}

{
  let frameCallback = null;
  let started = false;
  const buttons = [];
  const listeners = { resize: new Set(), katex: new Set() };
  let ticks = 0;
  let renders = 0;
  let disposed = false;
  let activeScope = null;
  const scope = {
    cleanups: [],
    onDispose(fn) { this.cleanups.push(fn); },
    dispose() {
      disposed = true;
      while (this.cleanups.length) this.cleanups.pop()();
    },
  };
  const lab = {
    wrap: makeElement(),
    canvas: { width: 560, height: 340 },
    ctx: {},
    overlay: makeElement(),
    controls: makeElement(),
    info: makeElement(),
  };
  const context = {
    console,
    window: {
      SIM_ROUTE_MANIFEST: {},
      SimCore: {
        COLORS: {},
        createScope: () => scope,
        withScope(nextScope, fn) {
          activeScope = nextScope;
          try { return fn(); } finally { activeScope = null; }
        },
        getActiveScope: () => activeScope,
        addButton(_container, text, onClick) {
          const button = makeElement();
          button.textContent = text;
          button.onClick = onClick;
          buttons.push(button);
          return button;
        },
        addSlider() {},
      },
      SimLabUI: { createLab: () => lab },
      SimSceneRegistry: {
        get: () => ({
          routeId: 'ch-test',
          title: 'Test scene',
          controls: [],
          readouts: [],
        }),
      },
      SimRouteRenderers: {
        get: () => ({
          rendererId: 'test-renderer',
          render(_ctx, _scene, state) { if (state.__ticked) renders += 1; },
        }),
      },
      SimRouteBehaviors: {
        get: () => ({
          behaviorId: 'test-behavior',
          onTick(_scene, state, dt) {
            ticks += 1;
            state.__ticked = dt > 0;
          },
          handles() {
            return [{
              id: 'test-handle',
              label: 'test',
              get: () => ({ x: 100, y: 100 }),
              set() {},
            }];
          },
        }),
      },
      SimAnimationEngine: {
        bindToLab: () => ({
          onFrame(cb) { frameCallback = cb; },
          start() { started = true; },
          stop() {},
          pause() {},
          resume() {},
          isRunning: () => started,
        }),
      },
      addEventListener(type, fn) {
        if (type === 'resize') listeners.resize.add(fn);
        if (type === 'sim:katex-ready') listeners.katex.add(fn);
      },
      removeEventListener(type, fn) {
        if (type === 'resize') listeners.resize.delete(fn);
        if (type === 'sim:katex-ready') listeners.katex.delete(fn);
      },
    },
    document: {},
  };
  context.window.window = context.window;
  context.window.document = context.document;
  vm.createContext(context);
  runScript(context, 'js/sim-professional-lab.js');
  const mounted = context.window.SimProfessionalLab.mount('ch-test')(makeElement());
  assert.ok(mounted && typeof mounted.dispose === 'function', 'professional lab mount must return a disposer');
  assert.strictEqual(listeners.resize.size, 1, 'mount must register resize listener in scoped cleanup');
  assert.strictEqual(listeners.katex.size, 1, 'mount must register KaTeX listener in scoped cleanup');
  assert.strictEqual(started, false, 'behavior.onTick routes must open paused for direct manipulation');
  assert.strictEqual(typeof frameCallback, 'function', 'behavior.onTick must be registered with lab.anim.onFrame');
  const playButton = buttons.find(button => /Chạy/.test(button.textContent));
  assert.ok(playButton, 'behavior.onTick routes must expose a play button');
  playButton.onClick();
  assert.strictEqual(started, true, 'play button must start the animation engine');
  frameCallback(1, 0.1);
  assert.strictEqual(ticks, 1, 'registered animation frame must call behavior.onTick');
  assert.strictEqual(renders, 1, 'animation tick must redraw after state update');
  mounted.dispose();
  assert.strictEqual(disposed, true, 'disposer must dispose the scoped lab lifecycle');
  assert.strictEqual(listeners.resize.size, 0, 'dispose must remove resize listener');
  assert.strictEqual(listeners.katex.size, 0, 'dispose must remove KaTeX listener');
}

console.log('simulation-runtime-regressions: PASS');
