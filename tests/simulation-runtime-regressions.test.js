const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function runScript(context, file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
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
  let ticks = 0;
  let renders = 0;
  const scope = { onDispose() {} };
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
        getActiveScope: () => scope,
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
      addEventListener() {},
      removeEventListener() {},
    },
    document: {},
  };
  context.window.window = context.window;
  context.window.document = context.document;
  vm.createContext(context);
  runScript(context, 'js/sim-professional-lab.js');
  context.window.SimProfessionalLab.mount('ch-test')(makeElement());
  assert.strictEqual(started, false, 'behavior.onTick routes must open paused for direct manipulation');
  assert.strictEqual(typeof frameCallback, 'function', 'behavior.onTick must be registered with lab.anim.onFrame');
  const playButton = buttons.find(button => /Chạy/.test(button.textContent));
  assert.ok(playButton, 'behavior.onTick routes must expose a play button');
  playButton.onClick();
  assert.strictEqual(started, true, 'play button must start the animation engine');
  frameCallback(1, 0.1);
  assert.strictEqual(ticks, 1, 'registered animation frame must call behavior.onTick');
  assert.strictEqual(renders, 1, 'animation tick must redraw after state update');
}

console.log('simulation-runtime-regressions: PASS');
