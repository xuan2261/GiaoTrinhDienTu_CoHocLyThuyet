const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const fixtureUrl = name => `file:///${path.join(ROOT, `tests/fixtures/${name}`).replace(/\\/g, '/')}`;

async function mount(page, route) {
  await page.evaluate(r => {
    window.__sim = window.SIM_MAP[r](document.getElementById('host'));
  }, route);
}

test.describe('sim3 pilot contract', () => {
  test('ch2-2-2 exposes 2D/3D mode, syncs sliders, and disposes Sim3 DOM', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch2-2-2');

    await expect(page.locator('#host svg.sim2-svg')).toHaveCount(1);
    await expect(page.locator('#host .sim3-mode-toggle')).toHaveCount(1);
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toBeVisible();

    const before = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-2-2']);
    await page.evaluate(() => {
      const alpha = document.querySelector('#host input[data-id=alphaAcc]');
      alpha.value = '0.35';
      alpha.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const after = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-2-2']);
    expect(after.alphaAcc).toBeCloseTo(0.35, 3);
    expect(after.updatedAt).toBeGreaterThan(before.updatedAt);

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host .sim3-mode-toggle')).toHaveCount(0);
    await expect(page.locator('#host .sim3-fallback')).toHaveCount(0);
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
    await expect(page.locator('#host .sim2-root')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('ch3-6-2 3D mode follows collision phase readout and reset clears impact', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch3.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch3-6-2');

    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toBeVisible();
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: 'Pha:' })).toContainText('Trước va chạm');

    await page.locator('#host .sim2-step').click();
    await page.locator('#host .sim2-step').click();
    const debugAfterSteps = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-6-2']);
    expect(debugAfterSteps.p1.x).toBeGreaterThan(-4);

    await page.locator('#host .sim2-reset').click();
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: 'Pha:' })).toContainText('Trước va chạm');
    const debugAfterReset = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-6-2']);
    expect(debugAfterReset.collided).toBe(false);

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
  });

  test('ch2-3-2 3D mode follows transmission radii and playback', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch2-3-2');

    await expect(page.locator('#host .sim3-mode-toggle')).toHaveCount(1);
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    let debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-3-2']);
    expect(debug.r1).toBeCloseTo(1.4, 3);
    expect(debug.r2).toBeCloseTo(2.0, 3);
    expect(debug.gearOmega2).toBeLessThan(0);
    expect(debug.beltOmega2).toBeGreaterThan(0);

    await page.evaluate(() => {
      const r1 = document.querySelector('#host input[data-id=r1]');
      r1.value = '2.2';
      r1.dispatchEvent(new Event('input', { bubbles: true }));
    });
    debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-3-2']);
    expect(debug.r1).toBeCloseTo(2.2, 3);

    const beforePhi = debug.gearPhi1;
    await page.locator('#host .sim2-step').click();
    debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-3-2']);
    expect(debug.gearPhi1).toBeGreaterThan(beforePhi);

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host .sim3-mode-toggle')).toHaveCount(0);
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
  });

  test('ch2-4-4 3D mode follows Coriolis vectors and repeated toggles', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch2-4-4');

    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    let debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-4-4']);
    expect(debug.omega).toBeCloseTo(1.2, 3);
    expect(debug.vRel).toBeDefined();
    expect(debug.aCor.mag).toBeGreaterThanOrEqual(0);

    await page.evaluate(() => {
      const omega = document.querySelector('#host input[data-id=omega]');
      omega.value = '2.1';
      omega.dispatchEvent(new Event('input', { bubbles: true }));
    });
    debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-4-4']);
    expect(debug.omega).toBeCloseTo(2.1, 3);

    await page.locator('#host .sim3-mode-toggle [data-mode="2d"]').click();
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host .sim3-host')).toHaveCount(0);
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
  });

  test('ch3-5-3 3D mode follows radius and angular momentum state', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch3.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch3-5-3');

    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    let debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-5-3']);
    expect(debug.r).toBeCloseTo(3, 3);
    expect(debug.omega).toBeGreaterThan(0);
    expect(debug.inertia).toBeGreaterThan(0);
    expect(debug.angularMomentum).toBeGreaterThan(0);

    await page.evaluate(() => {
      const r = document.querySelector('#host input[data-id=r]');
      r.value = '1.4';
      r.dispatchEvent(new Event('input', { bubbles: true }));
    });
    debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-5-3']);
    expect(debug.r).toBeCloseTo(1.4, 3);
    expect(Math.abs(debug.mass1.x)).toBeLessThan(2);

    const beforePhi = debug.phi;
    await page.locator('#host .sim2-step').click();
    debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-5-3']);
    expect(debug.phi).toBeGreaterThan(beforePhi);

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host .sim3-mode-toggle')).toHaveCount(0);
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
  });

  test('mode toggle can switch repeatedly without duplicating 3D canvas', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch2-2-2');

    for (let i = 0; i < 3; i++) {
      await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
      await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
      await page.locator('#host .sim3-mode-toggle [data-mode="2d"]').click();
      await expect(page.locator('#host svg.sim2-svg')).toBeVisible();
    }

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
  });

  test('forced WebGL failure falls back to 2D without page errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__SIM3_FORCE_WEBGL_FAIL = true; });
    await mount(page, 'ch2-2-2');
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();

    await expect(page.locator('#host .sim3-fallback')).toBeVisible();
    await expect(page.locator('#host .sim3-fallback')).toContainText('3D không khả dụng');
    await expect(page.locator('#host svg.sim2-svg')).toBeVisible();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('forced WebGL failure also falls back for ch3-6-2', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(fixtureUrl('sim2-ch3.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__SIM3_FORCE_WEBGL_FAIL = true; });
    await mount(page, 'ch3-6-2');
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();

    await expect(page.locator('#host .sim3-fallback')).toBeVisible();
    await expect(page.locator('#host svg.sim2-svg')).toBeVisible();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('renderer constructor failure falls back without page errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const Original = window.THREE.WebGLRenderer;
      window.THREE.WebGLRenderer = function ThrowingRenderer() {
        throw new Error('test renderer allocation failure');
      };
      window.__restoreRenderer = () => { window.THREE.WebGLRenderer = Original; };
    });
    await mount(page, 'ch2-2-2');
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();

    await expect(page.locator('#host .sim3-fallback')).toBeVisible();
    await expect(page.locator('#host svg.sim2-svg')).toBeVisible();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
    await page.evaluate(() => { window.__restoreRenderer(); window.__sim.dispose(); });
    expect(errors).toEqual([]);
  });
});
