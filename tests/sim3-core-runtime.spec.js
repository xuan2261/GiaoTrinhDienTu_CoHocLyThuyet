const { test, expect } = require('@playwright/test');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const fixtureUrl = name => `file:///${path.join(ROOT, `tests/fixtures/${name}`).replace(/\\/g, '/')}`;
async function openFixture(page) {
  await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
}
test.describe('Sim3 core runtime', () => {
  test('defaults to demand rendering and only continuous scenes own RAF', async ({ page }) => {
    await openFixture(page);
    const result = await page.evaluate(() => {
      let requested = 0;
      const cancelled = [];
      requestAnimationFrame = () => ++requested;
      cancelAnimationFrame = id => { cancelled.push(id); };
      const parent = document.createElement('div');
      parent.style.width = '420px';
      const host = document.createElement('div');
      parent.appendChild(host); document.body.appendChild(parent);
      const shell = Sim3Shell.create({ host });
      const afterCreate = { requested, rendered: shell.renderer.info.render.frame };
      shell.start();
      shell.setState({ value: 1 });
      const afterState = { requested, rendered: shell.renderer.info.render.frame };
      shell.dispose();
      const host2 = document.createElement('div');
      parent.appendChild(host2);
      const continuous = Sim3Shell.create({ host: host2, continuous: true });
      const afterContinuous = requested;
      continuous.start();
      const afterDuplicateStart = requested;
      continuous.stop();
      continuous.dispose();
      parent.remove();
      return { afterCreate, afterState, afterContinuous, afterDuplicateStart, cancelledOwned: cancelled.filter(id => id === 1).length };
    });
    expect(result.afterCreate).toEqual({ requested: 0, rendered: 1 });
    expect(result.afterState).toEqual({ requested: 0, rendered: 2 });
    expect(result.afterContinuous).toBe(1);
    expect(result.afterDuplicateStart).toBe(1);
    expect(result.cancelledOwned).toBe(1);
  });

  test('observes responsive host size and caps DPR at two', async ({ page }) => {
    await openFixture(page);
    const result = await page.evaluate(() => {
      let observer;
      class FakeObserver {
        constructor(cb) { this.cb = cb; observer = this; }
        observe(el) { this.el = el; }
        disconnect() { this.disconnected = true; }
        fire() { this.cb([{ target: this.el }]); }
      }
      ResizeObserver = FakeObserver;
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 });
      const parent = document.createElement('div'); parent.style.width = '360px';
      const host = document.createElement('div'); parent.appendChild(host); document.body.appendChild(parent);
      const shell = Sim3Shell.create({ host, height: 240 });
      const initial = {
        width: host.getBoundingClientRect().width,
        aspect: shell.camera.aspect,
        renders: shell.renderer.info.render.frame,
        ratio: shell.renderer.getPixelRatio(),
        backing: [shell.renderer.domElement.width, shell.renderer.domElement.height]
      };
      parent.style.width = '1024px';
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1.5 });
      observer.fire();
      const resized = {
        width: host.getBoundingClientRect().width,
        aspect: shell.camera.aspect,
        renders: shell.renderer.info.render.frame,
        ratio: shell.renderer.getPixelRatio(),
        backing: [shell.renderer.domElement.width, shell.renderer.domElement.height]
      };
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
      observer.fire();
      const dpr1 = {
        ratio: shell.renderer.getPixelRatio(),
        renders: shell.renderer.info.render.frame,
        backing: [shell.renderer.domElement.width, shell.renderer.domElement.height]
      };
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
      observer.fire();
      const dpr2 = {
        ratio: shell.renderer.getPixelRatio(),
        renders: shell.renderer.info.render.frame,
        backing: [shell.renderer.domElement.width, shell.renderer.domElement.height]
      };
      shell.dispose();
      const disconnected = observer.disconnected;
      parent.remove();
      return { initial, resized, dpr1, dpr2, disconnected };
    });
    expect(result.initial.ratio).toBe(2);
    expect(result.resized.ratio).toBe(1.5);
    expect(result.resized.width).toBe(1024);
    expect(result.resized.aspect).toBeCloseTo(1024 / 240, 4);
    expect(result.initial.backing).toEqual([720, 480]);
    expect(result.resized.backing).toEqual([1536, 360]);
    expect(result.resized.renders).toBe(result.initial.renders + 1);
    expect(result.dpr1).toEqual({ ratio: 1, renders: result.resized.renders + 1, backing: [1024, 240] });
    expect(result.dpr2).toEqual({ ratio: 2, renders: result.resized.renders + 2, backing: [2048, 480] });
    expect(result.disconnected).toBe(true);
  });

  test('classifies setup and update failures once with original errors', async ({ page }) => {
    await openFixture(page);
    const result = await page.evaluate(() => {
      const makeHost = () => { const host = document.createElement('div'); document.body.appendChild(host); return host; };
      const setupCalls = [];
      const setup = Sim3Shell.create({
        host: makeHost(),
        setup() { throw new Error('setup sentinel'); },
        onFallback(reason, error) { setupCalls.push([reason, error && error.message]); }
      });
      const updateCalls = [];
      const shell = Sim3Shell.create({
        host: makeHost(),
        update() { throw new Error('update sentinel'); },
        onFallback(reason, error) { updateCalls.push([reason, error && error.message]); }
      });
      let updateThrew = false;
      try { shell.setState({}); } catch (error) { updateThrew = true; }
      shell.setState({});
      return { setup, setupCalls, updateCalls, updateThrew };
    });
    expect(result.setup).toBeNull();
    expect(result.setupCalls).toEqual([['scene-setup-failed', 'setup sentinel']]);
    expect(result.updateThrew).toBe(false);
    expect(result.updateCalls).toEqual([['scene-update-failed', 'update sentinel']]);
  });

  test('mode failures restore usable 2D state and focus', async ({ page }) => {
    await openFixture(page);
    const result = await page.evaluate(() => {
      const container = document.createElement('div');
      const shell2dRoot = document.createElement('div');
      container.appendChild(shell2dRoot); document.body.appendChild(container);
      const reasons = [];
      const mode = Sim3Mode.attach({
        container, shell2dRoot,
        create3d() { throw new Error('create sentinel'); },
        onFallback(reason, error) { reasons.push([reason, error && error.message]); }
      });
      container.querySelector('[data-mode="3d"]').click();
      const status = container.querySelector('.sim3-fallback');
      const button2d = container.querySelector('[data-mode="2d"]');
      const state = {
        hidden: status.hidden,
        statusRole: status.getAttribute('role'),
        live: status.getAttribute('aria-live'),
        pressed: button2d.getAttribute('aria-pressed'),
        focused: document.activeElement === button2d,
        visible2d: shell2dRoot.style.display !== 'none',
        reasons
      };
      mode.dispose(); container.remove();
      return state;
    });
    expect(result).toEqual({
      hidden: false,
      statusRole: 'status',
      live: 'polite',
      pressed: 'true',
      focused: true,
      visible2d: true,
      reasons: [['create-3d-failed', 'create sentinel']]
    });
  });

  test('label module and disposal own every resource exactly once', async ({ page }) => {
    await openFixture(page);
    const result = await page.evaluate(() => {
      const calls = { geometry: 0, material: 0, texture: 0, controls: 0, lists: 0, renderer: 0, context: 0 };
      const texture = { isTexture: true, dispose() { calls.texture += 1; } };
      const material = { customTexture: texture, uniforms: { map: { value: texture } }, dispose() { calls.material += 1; } };
      const geometry = { dispose() { calls.geometry += 1; } };
      const scene = { traverse(cb) { cb({ geometry, material }); cb({ geometry, material }); } };
      const canvas = document.createElement('canvas'); document.body.appendChild(canvas);
      const ctx = {
        scene,
        controls: { dispose() { calls.controls += 1; } },
        renderer: {
          domElement: canvas,
          setAnimationLoop() {},
          renderLists: { dispose() { calls.lists += 1; } },
          dispose() { calls.renderer += 1; },
          forceContextLoss() { calls.context += 1; }
        }
      };
      Sim3Dispose.disposeAll(ctx); Sim3Dispose.disposeAll(ctx);
      return { hasLabelLayer: !!window.Sim3LabelLayer, calls, canvasConnected: canvas.isConnected };
    });
    expect(result.hasLabelLayer).toBe(true);
    expect(result.calls).toEqual({ geometry: 1, material: 1, texture: 1, controls: 1, lists: 1, renderer: 1, context: 1 });
    expect(result.canvasConnected).toBe(false);
  });
});
