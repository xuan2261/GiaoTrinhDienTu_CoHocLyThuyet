const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const fixtureUrl = name => `file:///${path.join(ROOT, `tests/fixtures/${name}`).replace(/\\/g, '/')}`;

async function mount(page, route) {
  await page.evaluate(r => {
    window.__sim = window.SIM_MAP[r](document.getElementById('host'));
  }, route);
}

async function expectNoSim3LabelOverlap(page) {
  const overlaps = await page.locator('#host .sim3-label').evaluateAll(labels => {
    const boxes = labels
      .filter(el => getComputedStyle(el).display !== 'none')
      .map(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      });
    let count = 0;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) count++;
      }
    }
    return count;
  });
  expect(overlaps).toBe(0);
}

test.describe('sim3 pilot contract', () => {
  test('shared primitives preserve material opacity and reusable cylinder length', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => {
      const THREE = window.THREE;
      const P = window.Sim3Primitives;
      const mat = P.material(THREE, 0xffffff, { transparent: true, opacity: 0.42 });
      const mesh = P.cylinderBetween(
        THREE,
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 2, z: 0 },
        0.05,
        0xffffff
      );
      P.setCylinderBetween(THREE, mesh, { x: 0, y: 0, z: 0 }, { x: 0, y: 3, z: 0 });
      return {
        materialTransparent: mat.transparent,
        materialOpacity: mat.opacity,
        cylinderBaseLength: mesh.userData.sim3BaseLength,
        cylinderRenderedLength: mesh.geometry.parameters.height * mesh.scale.y
      };
    });

    expect(result.materialTransparent).toBe(true);
    expect(result.materialOpacity).toBeCloseTo(0.42, 3);
    expect(result.cylinderBaseLength).toBeCloseTo(2, 3);
    expect(result.cylinderRenderedLength).toBeCloseTo(3, 3);
  });

  test('shared visual kit and label layer are available in fixtures', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#host')).toHaveCount(1);
    const kit = await page.evaluate(() => ({
      hasKit: !!window.Sim3VisualKit,
      tokens: window.Sim3VisualKit && Object.keys(window.Sim3VisualKit.colors),
      hasGuide: !!(window.Sim3VisualKit && window.Sim3VisualKit.guideLine),
      hasGhost: !!(window.Sim3VisualKit && window.Sim3VisualKit.ghostMaterial),
      hasVectorScale: !!(window.Sim3VisualKit && window.Sim3VisualKit.vectorScale),
      hasLabelOffset: !!(window.Sim3VisualKit && window.Sim3VisualKit.labelOffset),
      hasVisualMetrics: !!(window.Sim3VisualKit && window.Sim3VisualKit.visualMetrics)
    }));
    expect(kit.hasKit).toBe(true);
    expect(kit.hasGuide).toBe(true);
    expect(kit.hasGhost).toBe(true);
    expect(kit.hasVectorScale).toBe(true);
    expect(kit.hasLabelOffset).toBe(true);
    expect(kit.hasVisualMetrics).toBe(true);
    expect(kit.tokens).toEqual(expect.arrayContaining([
      'moment', 'v', 'a', 'coriolis', 'force', 'mass1', 'mass2', 'axis', 'ghost'
    ]));
  });

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
    await expect(page.locator('#host .sim3-label-layer')).toHaveCount(1);
    await expect(page.locator('#host .sim3-label')).toContainText(['M', 'ω', 'v']);
    await expectNoSim3LabelOverlap(page);

    const before = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-2-2']);
    expect(before.visualMetrics.diskRadius).toBeLessThanOrEqual(1.6);
    expect(before.visualMetrics.tangentMarginTargetPx).toBeGreaterThanOrEqual(32);
    expect(before.visualMetrics.labelSeparationTargetPx).toBeGreaterThanOrEqual(12);
    expect(before.visualMetrics.axisRole).toBe('visible-secondary');
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
    await expect(page.locator('#host .sim3-label-layer')).toHaveCount(0);
    await expect(page.locator('#host .sim2-root')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('ch3-6-2 3D mode follows collision phase readout and reset clears impact', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch3.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch3-6-2');

    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toBeVisible();
    await expect(page.locator('#host .sim3-label')).toContainText(['Trước', 'Va chạm', 'Sau']);
    await expectNoSim3LabelOverlap(page);
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: 'Pha:' })).toContainText('Trước va chạm');

    await page.locator('#host .sim2-step').click();
    await page.locator('#host .sim2-step').click();
    const debugAfterSteps = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-6-2']);
    expect(debugAfterSteps.p1.x).toBeGreaterThan(-4);
    expect(debugAfterSteps.capturePhase).toMatch(/before|after/);

    await page.locator('#host .sim2-reset').click();
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: 'Pha:' })).toContainText('Trước va chạm');
    const debugAfterReset = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-6-2']);
    expect(debugAfterReset.collided).toBe(false);
    expect(debugAfterReset.trailLength).toBe(0);
    expect(debugAfterReset.ghostCount).toBeGreaterThanOrEqual(2);
    expect(debugAfterReset.phaseCue).toBe('before');
    expect(debugAfterReset.ghostScale1).toBeCloseTo(debugAfterReset.liveScale1, 3);
    expect(debugAfterReset.ghostScale2).toBeCloseTo(debugAfterReset.liveScale2, 3);
    expect(debugAfterReset.visualMetrics.verticalFillTarget).toBeGreaterThanOrEqual(0.45);
    expect(debugAfterReset.visualMetrics.labelClusterReduced).toBe(true);
    expect(debugAfterReset.visualMetrics.labelClusterStrategy).toBe('phase-lanes-separated');
    expect(debugAfterReset.visualMetrics.postImpactGhostOffset).toBeGreaterThanOrEqual(0.9);
    expect(debugAfterReset.visualMetrics.ghostOpacity).toBeLessThanOrEqual(0.14);

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
  });

  test('ch2-3-2 3D mode follows transmission radii and playback', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch2-3-2');

    await expect(page.locator('#host .sim3-mode-toggle')).toHaveCount(1);
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    await expect(page.locator('#host .sim3-label')).toContainText(['Bánh 1', 'Bánh 2', 'Đai']);
    await expectNoSim3LabelOverlap(page);
    let debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-3-2']);
    expect(debug.visualMetrics.hierarchy).toBe('belt-gears-primary-supports-muted');
    expect(debug.visualMetrics.supportOpacity).toBeLessThan(0.6);
    expect(debug.visualMetrics.cropMarginTargetPx).toBeGreaterThanOrEqual(16);
    expect(debug.visualMetrics.labelFaceCoverageMax).toBeLessThanOrEqual(0.15);
    expect(debug.visualMetrics.clutterReduced).toBe(true);
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
    await expect(page.locator('#host .sim3-label')).toContainText(['ω', 'v_rel', 'a_cor']);
    await expectNoSim3LabelOverlap(page);
    let debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-4-4']);
    expect(debug.visualMetrics.hasRotatingFrameCue).toBe(true);
    expect(debug.visualMetrics.vectorSeparation).toBeGreaterThan(0.1);
    expect(debug.visualMetrics.centralCluster).toBe('centered');
    expect(debug.visualMetrics.planeCueOpacity).toBeGreaterThanOrEqual(0.42);
    expect(debug.visualMetrics.perpendicularCueStrength).toBe('high-contrast-sector');
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
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
    await expect(page.locator('#host .sim3-label-layer')).toHaveCount(0);
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    await expect(page.locator('#host .sim3-label')).toContainText(['ω', 'v_rel', 'a_cor']);
    await expectNoSim3LabelOverlap(page);

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host .sim3-host')).toHaveCount(0);
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
  });

  test('ch2-5-3 3D mode follows instant-center field state and lifecycle', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch2-5-3');

    await expect(page.locator('#host .sim3-mode-toggle')).toHaveCount(1);
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    await expect(page.locator('#host .sim3-label')).toContainText(['P', 'M', 'v_M']);
    await expectNoSim3LabelOverlap(page);

    let debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-5-3']);
    expect(debug.visualMetrics.velocityScaleFactor).toBeLessThan(0.3);
    expect(debug.fieldArrowCount).toBeGreaterThanOrEqual(6);
    expect(debug.visualMetrics.constructionOpacity).toBeGreaterThanOrEqual(0.58);
    expect(debug.visualMetrics.fieldDistributionCue).toBe('dense-scaled-tangential');
    expect(debug.visualMetrics.velocityLeftMarginTargetPx).toBeGreaterThanOrEqual(20);
    expect(debug.visualMetrics.radiusGuideContrast).toBe('enhanced');
    expect(debug.omega).toBeCloseTo(1, 3);
    expect(debug.ic).toEqual(expect.objectContaining({ x: -1, y: -1 }));
    expect(debug.sample).toEqual(expect.objectContaining({ x: 2, y: 1.5 }));
    expect(debug.radius).toBeCloseTo(Math.hypot(3, 2.5), 3);
    expect(debug.vM.mag).toBeCloseTo(Math.hypot(-2.5, 3), 3);

    await page.evaluate(() => {
      const omega = document.querySelector('#host input[data-id=omega]');
      omega.value = '2.2';
      omega.dispatchEvent(new Event('input', { bubbles: true }));
    });
    debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-5-3']);
    expect(debug.omega).toBeCloseTo(2.2, 3);
    expect(debug.vM.mag).toBeCloseTo(2.2 * debug.radius, 3);

    await page.locator('#host .sim3-mode-toggle [data-mode="2d"]').click();
    const handle = page.locator('#host .sim2-handle').first();
    const box = await handle.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 30);
    await page.mouse.up();
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    const moved = await page.evaluate(() => window.__SIM3_DEBUG__['ch2-5-3']);
    expect(moved.ic.x).toBeGreaterThan(debug.ic.x);
    expect(moved.updatedAt).toBeGreaterThanOrEqual(1);

    await page.locator('#host .sim3-mode-toggle [data-mode="2d"]').click();
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host .sim3-mode-toggle')).toHaveCount(0);
    await expect(page.locator('#host .sim3-host')).toHaveCount(0);
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('ch3-5-3 3D mode follows radius and angular momentum state', async ({ page }) => {
    await page.goto(fixtureUrl('sim2-ch3.html'), { waitUntil: 'domcontentloaded' });
    await mount(page, 'ch3-5-3');

    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    await expect(page.locator('#host canvas.sim3-canvas')).toHaveCount(1);
    await expect(page.locator('#host .sim3-label')).toContainText(['m₁', 'm₂', 'L']);
    await expectNoSim3LabelOverlap(page);
    let debug = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-5-3']);
    expect(debug.visualMetrics.radiusCue).toBe('dimension');
    expect(debug.visualMetrics.orbitRole).toBe('secondary');
    expect(debug.visualMetrics.lLabelAttachmentPx).toBeLessThanOrEqual(24);
    expect(debug.visualMetrics.axisRole).toBe('subdued');
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

  test('forced WebGL failure falls back for ch2-5-3 without page errors', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(fixtureUrl('sim2-ch2.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__SIM3_FORCE_WEBGL_FAIL = true; });
    await mount(page, 'ch2-5-3');
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
