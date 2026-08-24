const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const fixtureUrl = name => `file:///${path.join(ROOT, `tests/fixtures/${name}`).replace(/\\/g, '/')}`;

async function mount(page, route) {
  await page.evaluate(r => { window.__sim = window.SIM_MAP[r](document.getElementById('host')); }, route);
}

test.describe('simulation lifecycle', () => {
  test('twenty 2D/3D cycles leave one active surface and no residue', async ({ page }) => {
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch2-2-2');

    for (let i = 0; i < 20; i++) {
      await page.locator('#host [data-mode="3d"]').click();
      await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
      await expect(page.locator('#host .sim3-label-layer')).toHaveCount(1);
      await page.locator('#host [data-mode="2d"]').click();
      await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
      await expect(page.locator('#host .sim3-label-layer')).toHaveCount(0);
    }

    await page.locator('#host [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host .sim3-host, #host .sim3-label-layer, #host canvas.sim3-canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('disposing one route before mounting another leaves no stale Sim3 DOM', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch2-2-2');
    await page.locator('#host [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    await page.evaluate(() => window.__sim.dispose());

    await mount(page, 'ch2-5-3');
    await page.locator('#host [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    await expect(page.locator('#host .sim3-label-layer')).toHaveCount(1);
    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host .sim3-host, #host .sim3-label-layer, #host canvas.sim3-canvas')).toHaveCount(0);
  });

  test('render and resize failures dispose once with stable original errors', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => {
      const makeHost = () => {
        const parent = document.createElement('div'); parent.style.width = '360px';
        const host = document.createElement('div'); parent.appendChild(host); document.body.appendChild(parent);
        return { parent, host };
      };
      const renderNode = makeHost(), renderFailures = [];
      const renderShell = Sim3Shell.create({
        host: renderNode.host,
        onFallback(reason, error) { renderFailures.push([reason, error && error.message]); }
      });
      renderShell.renderer.render = () => { throw new Error('render sentinel'); };
      renderShell.render(); renderShell.render();

      const resizeNode = makeHost(), resizeFailures = [];
      const resizeShell = Sim3Shell.create({
        host: resizeNode.host,
        onFallback(reason, error) { resizeFailures.push([reason, error && error.message]); }
      });
      resizeShell.renderer.setSize = () => { throw new Error('resize sentinel'); };
      resizeNode.parent.style.width = '480px';
      resizeShell.resize(); resizeShell.resize();
      renderNode.parent.remove(); resizeNode.parent.remove();
      return { renderFailures, resizeFailures };
    });
    expect(result.renderFailures).toEqual([['scene-render-failed', 'render sentinel']]);
    expect(result.resizeFailures).toEqual([['scene-resize-failed', 'resize sentinel']]);
  });

  test('mode catches setState and reset failures without disabling 2D', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => {
      function exercise(method) {
        const container = document.createElement('div');
        const shell2dRoot = document.createElement('div');
        container.appendChild(shell2dRoot); document.body.appendChild(container);
        const reasons = [];
        const controller = Sim3Mode.attach({
          container, shell2dRoot,
          create3d({ host }) {
            return {
              host,
              setState() { if (method === 'setState') throw new Error('state sentinel'); },
              reset() { if (method === 'reset') throw new Error('reset sentinel'); },
              dispose() { host.remove(); }
            };
          },
          onFallback(reason, error) { reasons.push([reason, error && error.message]); }
        });
        if (method === 'setState') controller.setState({ value: 1 });
        container.querySelector('[data-mode="3d"]').click();
        if (method === 'reset') controller.reset();
        const statusVisible = !container.querySelector('.sim3-fallback').hidden;
        const twoDVisible = shell2dRoot.style.display !== 'none';
        const focused = document.activeElement === container.querySelector('[data-mode="2d"]');
        controller.dispose(); container.remove();
        return { reasons, statusVisible, twoDVisible, focused };
      }
      return { state: exercise('setState'), reset: exercise('reset') };
    });
    expect(result.state).toEqual({
      reasons: [['scene-update-failed', 'state sentinel']], statusVisible: true, twoDVisible: true, focused: true
    });
    expect(result.reset).toEqual({
      reasons: [['scene-reset-failed', 'reset sentinel']], statusVisible: true, twoDVisible: true, focused: true
    });
  });

  test('window resize fallback is removable and canvas semantics stay named', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => {
      ResizeObserver = undefined;
      let added = 0, removed = 0;
      const add = window.addEventListener.bind(window), remove = window.removeEventListener.bind(window);
      window.addEventListener = (type, listener, options) => { if (type === 'resize') added += 1; add(type, listener, options); };
      window.removeEventListener = (type, listener, options) => { if (type === 'resize') removed += 1; remove(type, listener, options); };
      const host = document.createElement('div'); document.body.appendChild(host);
      const shell = Sim3Shell.create({ host, label: 'Kiểm tra cơ học 3D' });
      const semantics = {
        role: shell.renderer.domElement.getAttribute('role'),
        label: shell.renderer.domElement.getAttribute('aria-label'),
        labelsHidden: shell.labels.element.getAttribute('aria-hidden')
      };
      shell.dispose();
      window.addEventListener = add; window.removeEventListener = remove;
      return { added, removed, semantics };
    });
    expect(result).toEqual({
      added: 1, removed: 1,
      semantics: { role: 'img', label: 'Kiểm tra cơ học 3D', labelsHidden: 'true' }
    });
  });

  test('dispose during owned frame and resize callbacks does not reschedule or throw', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => {
      let frame, requested = 0;
      requestAnimationFrame = callback => { frame = callback; requested += 1; return requested; };
      cancelAnimationFrame = () => {};
      const host = document.createElement('div'); document.body.appendChild(host);
      const continuous = Sim3Shell.create({
        host, continuous: true,
        update(state, api) { api.dispose(); }
      });
      frame();

      const parent = document.createElement('div'); parent.style.width = '360px';
      const resizeHost = document.createElement('div'); parent.appendChild(resizeHost); document.body.appendChild(parent);
      const resizing = Sim3Shell.create({ host: resizeHost, height: 240 });
      const originalProjection = resizing.camera.updateProjectionMatrix.bind(resizing.camera);
      resizing.camera.updateProjectionMatrix = () => { resizing.dispose(); originalProjection(); };
      parent.style.width = '480px';
      let resizeThrew = false;
      try { resizing.resize(); } catch (error) { resizeThrew = true; }
      parent.remove();
      return {
        requested,
        continuousRemoved: !host.isConnected,
        resizeRemoved: !resizeHost.isConnected,
        resizeThrew
      };
    });
    expect(result).toEqual({ requested: 1, continuousRemoved: true, resizeRemoved: true, resizeThrew: false });
  });

  test('continuous shell releases RAF, observer, renderer, and WebGL context once', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => {
      const original = {
        ResizeObserver, requestAnimationFrame, cancelAnimationFrame
      };
      let observerDisconnects = 0, requested = 0, rendererDisposals = 0, contextLosses = 0;
      const cancelledIds = [];
      ResizeObserver = class { observe() {} disconnect() { observerDisconnects += 1; } };
      requestAnimationFrame = () => ++requested;
      cancelAnimationFrame = id => { cancelledIds.push(id); };
      const host = document.createElement('div'); document.body.appendChild(host);
      const shell = Sim3Shell.create({ host, continuous: true });
      const disposeRenderer = shell.renderer.dispose.bind(shell.renderer);
      shell.renderer.dispose = () => { rendererDisposals += 1; disposeRenderer(); };
      const loseContext = shell.renderer.forceContextLoss && shell.renderer.forceContextLoss.bind(shell.renderer);
      shell.renderer.forceContextLoss = () => { contextLosses += 1; if (loseContext) loseContext(); };
      shell.dispose(); shell.dispose();
      ResizeObserver = original.ResizeObserver;
      requestAnimationFrame = original.requestAnimationFrame;
      cancelAnimationFrame = original.cancelAnimationFrame;
      return { observerDisconnects, cancelledIds, requested, rendererDisposals, contextLosses, removed: !host.isConnected };
    });
    expect(result.requested).toBe(1);
    expect(result.cancelledIds.filter(id => id === 1)).toHaveLength(1);
    expect(result.observerDisconnects).toBe(1);
    expect(result.rendererDisposals).toBe(1);
    expect(result.contextLosses).toBe(1);
    expect(result.removed).toBe(true);
  });

  test('changed framing adapters preserve safe projections across width cycles', async ({ page }) => {
    async function cycle(fixture, route, width, stimulate) {
      await page.goto(fixtureUrl(fixture), { waitUntil: 'domcontentloaded' });
      await mount(page, route);
      await page.locator('#host [data-mode="3d"]').click();
      const wide = await page.evaluate(r => window.__SIM3_DEBUG__[r].visualMetrics, route);
      await page.evaluate(w => { document.getElementById('host').style.width = `${w}px`; }, width);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await stimulate();
      const narrow = await page.evaluate(r => window.__SIM3_DEBUG__[r].visualMetrics, route);
      await page.evaluate(() => window.__sim.dispose());
      return { wide, narrow };
    }
    const ch1 = await cycle('sim2-ch1.html', 'ch1-1-5', 320, () => page.locator('#host [role="slider"]').first().press('ArrowRight'));
    const ch3 = await cycle('sim2-ch3.html', 'ch3-6-2', 320, () => page.locator('#host .sim2-step').click());
    expect(ch1.wide.primarySceneFillRatio).toBeGreaterThanOrEqual(0.35);
    expect(ch1.narrow.projectedMarginPx).toBeGreaterThanOrEqual(24);
    expect(ch1.narrow.resultantDominanceRatio).toBeGreaterThanOrEqual(1.05);
    expect(ch3.narrow.projectedMarginPx).toBeGreaterThanOrEqual(24);
    expect(Math.abs(ch3.narrow.primarySceneFillRatio - ch3.wide.primarySceneFillRatio)).toBeLessThan(0.03);
  });
});
