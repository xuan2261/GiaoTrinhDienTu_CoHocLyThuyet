const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const fixtureFor = ch => `file:///${path.join(ROOT, `tests/fixtures/sim2-ch${ch}.html`).replace(/\\/g, '/')}`;

async function gotoFixture(page, ch, reducedMotion = false) {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  if (reducedMotion) {
    await page.addInitScript(() => {
      window.matchMedia = q => ({
        matches: q.includes('prefers-reduced-motion') && q.includes('reduce'),
        media: q,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() { return false; }
      });
    });
  }
  await page.goto(fixtureFor(ch), { waitUntil: 'domcontentloaded' });
  return errors;
}

test.describe('sim2 visual motion polish — shared primitives', () => {
  test('controls mark changed output on input and setValue without dispatching input', async ({ page }) => {
    const errors = await gotoFixture(page, 1);
    await page.evaluate(() => {
      window.__calls = 0;
      window.__c = window.Sim2Controls.createControls(document.getElementById('host'), {
        sliders: [{ id: 'F', label: 'F', min: 0, max: 100, value: 10, unit: 'N', onInput: () => window.__calls++ }]
      });
    });

    await page.locator('#host input[data-id=F]').evaluate(el => {
      el.value = '42';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('#host .sim2-output')).toHaveClass(/sim2-output-changed/);

    const before = await page.evaluate(() => window.__calls);
    await page.evaluate(() => window.__c.setValue('F', 55));
    expect(await page.evaluate(() => window.__calls)).toBe(before);
    await expect(page.locator('#host .sim2-output')).toHaveClass(/sim2-output-changed/);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('panel setReadout marks keyed value changes and dispose clears timers safely', async ({ page }) => {
    const errors = await gotoFixture(page, 1);
    await page.evaluate(() => {
      window.__timerStats = { set: 0, clear: 0 };
      window.__setTimeout = window.setTimeout;
      window.__clearTimeout = window.clearTimeout;
      window.setTimeout = (fn, ms) => { window.__timerStats.set++; return window.__setTimeout(fn, ms); };
      window.clearTimeout = id => { window.__timerStats.clear++; return window.__clearTimeout(id); };
      window.__p = window.Sim2Panel.createPanel(document.getElementById('host'), {
        formulas: ['F = ma'],
        legend: [{ color: '#e03030', label: 'F' }]
      });
      window.__p.setReadout([{ key: 'F', label: 'F:', value: '10 N' }]);
      window.__p.setReadout([{ key: 'F', label: 'F:', value: '20 N' }]);
      window.__p.setReadout([{ key: 'F', label: 'F:', value: '30 N' }]);
    });

    await expect(page.locator('#host .sim2-readout-row')).toHaveClass(/sim2-readout-changed/);
    expect(await page.evaluate(() => window.__timerStats.clear)).toBeGreaterThanOrEqual(1);
    await page.evaluate(() => {
      window.__p.dispose();
      window.setTimeout = window.__setTimeout;
      window.clearTimeout = window.__clearTimeout;
    });
    await expect(page.locator('#host .sim2-theory')).toHaveCount(0);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('panel supports formula highlight hooks without rerendering formulas', async ({ page }) => {
    const errors = await gotoFixture(page, 1);
    await page.evaluate(() => {
      window.__p = window.Sim2Panel.createPanel(document.getElementById('host'), {
        formulas: [
          { key: 'force', latex: 'F = ma' },
          { key: 'energy', latex: 'T = mv^2/2' }
        ],
        legend: [{ color: '#e03030', label: 'F' }]
      });
      window.__formulaNode = document.querySelector('#host .sim2-formula[data-key=force]');
      window.__p.setFormulaHighlight(['force']);
    });

    await expect(page.locator('#host .sim2-formula[data-key=force]')).toHaveClass(/sim2-formula-highlight/);
    await expect(page.locator('#host .sim2-formula[data-key=energy]')).not.toHaveClass(/sim2-formula-highlight/);
    expect(await page.evaluate(() => document.querySelector('#host .sim2-formula[data-key=force]') === window.__formulaNode)).toBe(true);
    await page.evaluate(() => window.__p.dispose());
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('shell handles support hintPulse, active drag state, and reduced-motion opt-out', async ({ page }) => {
    const errors = await gotoFixture(page, 1);
    await page.evaluate(() => {
      const host = document.getElementById('host');
      window.__s = window.Sim2Shell.createSimShell({
        container: host,
        worldBox: { minX: 0, minY: 0, maxX: 2, maxY: 2 }
      });
      window.__h = window.__s.addHandle({ x: 1, y: 1 }, { hintPulse: true });
    });

    await expect(page.locator('#host .sim2-handle')).toHaveClass(/sim2-handle-pulse/);
    const box = await page.locator('#host .sim2-handle').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(page.locator('#host .sim2-handle')).toHaveClass(/is-active/);
    await page.mouse.up();
    await expect(page.locator('#host .sim2-handle')).not.toHaveClass(/is-active/);
    await page.evaluate(() => window.__s.dispose());
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('reduced-motion disables non-essential pulse and flash classes', async ({ page }) => {
    const errors = await gotoFixture(page, 1, true);
    await page.evaluate(() => {
      const host = document.getElementById('host');
      window.__s = window.Sim2Shell.createSimShell({
        container: host,
        worldBox: { minX: 0, minY: 0, maxX: 2, maxY: 2 }
      });
      window.__s.addHandle({ x: 1, y: 1 }, { hintPulse: true });
      window.__p = window.Sim2Panel.createPanel(host, { formulas: ['F = ma'] });
      window.__p.setReadout([{ key: 'F', label: 'F:', value: '10 N' }]);
      window.__p.setReadout([{ key: 'F', label: 'F:', value: '20 N' }]);
      window.__c = window.Sim2Controls.createControls(host, {
        sliders: [{ id: 'F', label: 'F', min: 0, max: 100, value: 10, onInput: () => {} }]
      });
      window.__c.setValue('F', 20);
    });

    await expect(page.locator('#host .sim2-handle')).not.toHaveClass(/sim2-handle-pulse/);
    await expect(page.locator('#host .sim2-readout-row')).not.toHaveClass(/sim2-readout-changed/);
    await expect(page.locator('#host .sim2-output')).not.toHaveClass(/sim2-output-changed/);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('canvas drawTrail supports age fade without breaking old signature', async ({ page }) => {
    const errors = await gotoFixture(page, 2);
    const result = await page.evaluate(() => {
      const host = document.getElementById('host');
      const tf = window.Sim2Transform.makeTransform({
        worldBox: { minX: 0, minY: 0, maxX: 3, maxY: 3 },
        screenBox: { x: 0, y: 0, width: 300, height: 300 }
      });
      const underlay = window.Sim2CanvasUnderlay.createCanvasUnderlay(host, tf, 300, 300);
      const calls = [];
      const originalStroke = underlay.ctx.stroke.bind(underlay.ctx);
      underlay.ctx.stroke = () => {
        calls.push({ alpha: underlay.ctx.globalAlpha, strokeStyle: String(underlay.ctx.strokeStyle) });
        originalStroke();
      };
      underlay.drawTrail([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 2 }], {
        fade: true,
        stroke: 'rgba(124,58,237,0.8)',
        minAlpha: 0.2,
        maxAlpha: 0.8
      });
      const fadedCalls = calls.slice();
      calls.length = 0;
      underlay.drawTrail([{ x: 0, y: 0 }, { x: 1, y: 1 }]);
      const oldSignatureCalls = calls.slice();
      underlay.dispose();
      return { fadedCalls, oldSignatureCalls };
    });

    expect(result.fadedCalls.length).toBeGreaterThanOrEqual(3);
    expect(result.fadedCalls[0].alpha).toBeLessThan(result.fadedCalls[result.fadedCalls.length - 1].alpha);
    expect(result.oldSignatureCalls).toHaveLength(1);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('sim2 visual motion polish — pilot routes', () => {
  test('ch1-1-3 exposes pulsing handle and slider/readout feedback', async ({ page }) => {
    const errors = await gotoFixture(page, 1);
    await page.evaluate(() => { window.__sim = window.SIM_MAP['ch1-1-3'](document.getElementById('host')); });
    await expect(page.locator('#host .sim2-handle')).toHaveClass(/sim2-handle-pulse/);

    await page.locator('#host input[data-id=F]').evaluate(el => {
      el.value = '88';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('#host .sim2-output').first()).toHaveClass(/sim2-output-changed/);
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: 'F' }).first()).toHaveClass(/sim2-readout-changed/);
    await expect(page.locator('#host .sim2-formula[data-key=components]').first()).toHaveClass(/sim2-formula-highlight/);
    await page.evaluate(() => window.__sim.dispose());
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('ch2-4-4 uses fade trail and stable Coriolis emphasis hooks', async ({ page }) => {
    const errors = await gotoFixture(page, 2);
    const fadeCalls = await page.evaluate(async () => {
      const original = window.Sim2CanvasUnderlay.createCanvasUnderlay;
      const calls = [];
      window.Sim2CanvasUnderlay.createCanvasUnderlay = function(...args) {
        const underlay = original.apply(this, args);
        const drawTrail = underlay.drawTrail;
        underlay.drawTrail = function(points, opts) {
          calls.push({ fade: !!(opts && opts.fade), len: points ? points.length : 0 });
          return drawTrail.call(this, points, opts);
        };
        return underlay;
      };
      window.__sim = window.SIM_MAP['ch2-4-4'](document.getElementById('host'));
      document.querySelector('#host .sim2-step').click();
      await new Promise(r => setTimeout(r, 50));
      return {
        calls,
        rel: document.querySelectorAll('#host .sim2-vector-vrel').length,
        cor: document.querySelectorAll('#host .sim2-vector-coriolis').length
      };
    });

    expect(fadeCalls.calls.some(c => c.fade && c.len >= 2)).toBe(true);
    expect(fadeCalls.rel).toBeGreaterThanOrEqual(1);
    expect(fadeCalls.cor).toBeGreaterThanOrEqual(1);
    await page.evaluate(() => window.__sim.dispose());
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('ch2-4-4 separates Coriolis teaching callout from dense vector cluster', async ({ page }) => {
    const errors = await gotoFixture(page, 2);
    await page.evaluate(() => {
      window.__sim = window.SIM_MAP['ch2-4-4'](document.getElementById('host'));
      const step = document.querySelector('#host .sim2-step');
      for (let i = 0; i < 120; i++) step.click();
    });

    await expect(page.locator('#host .sim2-coriolis-callout')).toHaveCount(1);
    await expect(page.locator('#host .sim2-vrel-callout')).toHaveCount(1);
    const gap = await page.evaluate(() => {
      const a = document.querySelector('#host .sim2-coriolis-callout').getBoundingClientRect();
      const v = document.querySelector('#host .sim2-vrel-callout').getBoundingClientRect();
      const ax = a.left + a.width / 2, ay = a.top + a.height / 2;
      const vx = v.left + v.width / 2, vy = v.top + v.height / 2;
      return Math.hypot(ax - vx, ay - vy);
    });
    expect(gap).toBeGreaterThanOrEqual(34);

    await page.evaluate(() => window.__sim.dispose());
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('ch3-6-2 shows impact cue, split trails, and energy-loss feedback after collision', async ({ page }) => {
    const errors = await gotoFixture(page, 3);
    await page.evaluate(() => {
      const original = window.Sim2CanvasUnderlay.createCanvasUnderlay;
      window.__trailKinds = [];
      window.Sim2CanvasUnderlay.createCanvasUnderlay = function(...args) {
        const underlay = original.apply(this, args);
        const drawTrail = underlay.drawTrail;
        underlay.drawTrail = function(points, opts) {
          if (opts && opts.kind && points && points.length > 1) window.__trailKinds.push(opts.kind);
          return drawTrail.call(this, points, opts);
        };
        return underlay;
      };
      window.__sim = window.SIM_MAP['ch3-6-2'](document.getElementById('host'));
    });
    await expect(page.locator('#host .sim2-playpause')).toHaveText(/▶/);

    await page.evaluate(() => {
      const step = document.querySelector('#host .sim2-step');
      for (let i = 0; i < 125; i++) step.click();
    });
    await expect(page.locator('#host .sim2-impact-cue')).toHaveCount(1);
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: 'T mất' })).toHaveClass(/sim2-readout-changed/);
    const trailKinds = await page.evaluate(() => window.__trailKinds || []);
    expect(trailKinds).toContain('before');
    expect(trailKinds).toContain('after');

    await page.locator('#host .sim2-reset').click();
    await expect(page.locator('#host .sim2-impact-cue')).toHaveCount(0);
    await page.evaluate(() => window.__sim.dispose());
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('ch3-6-2 exposes explicit before-after collision teaching state', async ({ page }) => {
    const errors = await gotoFixture(page, 3);
    await page.evaluate(() => {
      window.__sim = window.SIM_MAP['ch3-6-2'](document.getElementById('host'));
    });
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: 'Pha:' })).toContainText('Trước va chạm');

    await page.evaluate(() => {
      const step = document.querySelector('#host .sim2-step');
      for (let i = 0; i < 125; i++) step.click();
    });
    await expect(page.locator('#host .sim2-impact-state')).toHaveCount(1);
    await expect(page.locator('#host .sim2-impact-state')).toContainText('Sau va chạm');
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: 'Pha:' })).toContainText('Sau va chạm');

    await page.locator('#host .sim2-reset').click();
    await expect(page.locator('#host .sim2-impact-state')).toHaveCount(0);
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: 'Pha:' })).toContainText('Trước va chạm');
    await page.evaluate(() => window.__sim.dispose());
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('ch1-6-3 makes removed area explicit as a negative contribution', async ({ page }) => {
    const errors = await gotoFixture(page, 1);
    await page.evaluate(() => {
      window.__sim = window.SIM_MAP['ch1-6-3'](document.getElementById('host'));
    });

    await expect(page.locator('#host .sim2-negative-area-guide')).toHaveCount(1);
    await expect(page.locator('#host .sim2-readout-row').filter({ hasText: '-A lỗ' })).toHaveCount(1);
    await expect(page.locator('#host .sim2-observe')).toContainText('diện tích âm');

    await page.evaluate(() => window.__sim.dispose());
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('sim2 visual motion polish — approved rollout', () => {
  test('Ch1 rollout exposes handle affordance and semantic guide lines', async ({ page }) => {
    const errors = await gotoFixture(page, 1);
    const routes = ['ch1-1-4', 'ch1-1-5', 'ch1-1-6', 'ch1-1-8', 'ch1-2-3', 'ch1-3-2', 'ch1-3-6', 'ch1-5-3', 'ch1-6-3'];
    for (const route of routes) {
      await page.evaluate(r => {
        document.getElementById('host').innerHTML = '';
        window.__sim = window.SIM_MAP[r](document.getElementById('host'));
      }, route);
      await expect(page.locator('#host .sim2-handle').first(), `${route} pulsing handle`).toHaveClass(/sim2-handle-pulse/);
      await page.evaluate(() => window.__sim.dispose());
    }

    const guideRoutes = [
      ['ch1-1-4', '.sim2-moment-arm'],
      ['ch1-1-6', '.sim2-couple-distance'],
      ['ch1-1-8', '.sim2-support-reaction'],
      ['ch1-5-3', '.sim2-friction-cone'],
      ['ch1-6-3', '.sim2-centroid-guide']
    ];
    for (const [route, selector] of guideRoutes) {
      await page.evaluate(r => { window.__sim = window.SIM_MAP[r](document.getElementById('host')); }, route);
      await expect(page.locator(`#host ${selector}`).first(), `${route} ${selector}`).toHaveCount(1);
      await page.evaluate(() => {
        window.__sim.dispose();
        document.getElementById('host').innerHTML = '';
      });
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('Ch2 rollout exposes fade/current/IC clarity hooks without breaking transmission hooks', async ({ page }) => {
    const errors = await gotoFixture(page, 2);
    const evidence = await page.evaluate(() => {
      const result = {};
      function mount(route) {
        document.getElementById('host').innerHTML = '';
        window.__fadeCalls = [];
        const original = window.Sim2CanvasUnderlay.createCanvasUnderlay;
        window.Sim2CanvasUnderlay.createCanvasUnderlay = function(...args) {
          const underlay = original.apply(this, args);
          const drawTrail = underlay.drawTrail;
          underlay.drawTrail = function(points, opts) {
            window.__fadeCalls.push({ fade: !!(opts && opts.fade), len: points ? points.length : 0 });
            return drawTrail.call(this, points, opts);
          };
          return underlay;
        };
        const sim = window.SIM_MAP[route](document.getElementById('host'));
        window.Sim2CanvasUnderlay.createCanvasUnderlay = original;
        return sim;
      }
      let sim = mount('ch2-1-1');
      document.querySelector('#host .sim2-step').click();
      document.querySelector('#host .sim2-step').click();
      result.projectileFade = window.__fadeCalls.some(c => c.fade && c.len >= 2);
      result.projectileMarker = document.querySelectorAll('#host .sim2-current-marker').length;
      sim.dispose();

      sim = window.SIM_MAP['ch2-2-2'](document.getElementById('host'));
      result.angleMarker = document.querySelectorAll('#host .sim2-angle-marker').length;
      sim.dispose(); document.getElementById('host').innerHTML = '';

      sim = window.SIM_MAP['ch2-3-2'](document.getElementById('host'));
      result.transmission = {
        gear: document.querySelectorAll('#host .sim2-transmission-gear').length,
        belt: document.querySelectorAll('#host .sim2-transmission-belt').length,
        pulley: document.querySelectorAll('#host .sim2-transmission-pulley').length
      };
      sim.dispose(); document.getElementById('host').innerHTML = '';

      sim = window.SIM_MAP['ch2-5-2'](document.getElementById('host'));
      result.icGuideA = document.querySelectorAll('#host .sim2-ic-radius-guide').length;
      sim.dispose(); document.getElementById('host').innerHTML = '';

      sim = window.SIM_MAP['ch2-5-3'](document.getElementById('host'));
      result.icGuideB = document.querySelectorAll('#host .sim2-ic-radius-guide').length;
      result.icMarker = document.querySelectorAll('#host .sim2-current-marker').length;
      sim.dispose();
      return result;
    });

    expect(evidence.projectileFade).toBe(true);
    expect(evidence.projectileMarker).toBeGreaterThanOrEqual(1);
    expect(evidence.angleMarker).toBeGreaterThanOrEqual(1);
    expect(evidence.transmission.gear).toBe(2);
    expect(evidence.transmission.belt).toBe(2);
    expect(evidence.transmission.pulley).toBe(2);
    expect(evidence.icGuideA).toBeGreaterThanOrEqual(2);
    expect(evidence.icGuideB).toBeGreaterThanOrEqual(1);
    expect(evidence.icMarker).toBeGreaterThanOrEqual(1);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('Ch3 rollout exposes graph/cause-effect cues and reset-clean pilot artifacts', async ({ page }) => {
    const errors = await gotoFixture(page, 3);
    const checks = await page.evaluate(() => {
      const out = {};
      function mount(route) {
        document.getElementById('host').innerHTML = '';
        return window.SIM_MAP[route](document.getElementById('host'));
      }
      let sim = mount('ch3-2-2');
      out.newtonCursor = document.querySelectorAll('#host .sim2-graph-cursor').length;
      sim.dispose();

      sim = mount('ch3-2-3');
      out.actionReaction = document.querySelectorAll('#host .sim2-action-reaction-pair').length;
      out.actionFormula = document.querySelectorAll('#host .sim2-formula-highlight').length;
      sim.dispose();

      sim = mount('ch3-3-1');
      out.springCursor = document.querySelectorAll('#host .sim2-graph-cursor').length;
      out.equilibrium = document.querySelectorAll('#host .sim2-equilibrium-line').length;
      sim.dispose();

      sim = mount('ch3-5-2');
      out.impulse = document.querySelectorAll('#host .sim2-impulse-highlight').length;
      sim.dispose();

      sim = mount('ch3-5-3');
      out.angularRadius = document.querySelectorAll('#host .sim2-angular-momentum-radius').length;
      sim.dispose();

      sim = mount('ch3-5-4');
      out.workDistance = document.querySelectorAll('#host .sim2-work-distance').length;
      sim.dispose();

      sim = mount('ch3-6-2');
      const step = document.querySelector('#host .sim2-step');
      for (let i = 0; i < 125; i++) step.click();
      out.impactBeforeReset = document.querySelectorAll('#host .sim2-impact-cue').length;
      document.querySelector('#host .sim2-reset').click();
      out.impactAfterReset = document.querySelectorAll('#host .sim2-impact-cue').length;
      sim.dispose();
      return out;
    });

    expect(checks.newtonCursor).toBeGreaterThanOrEqual(1);
    expect(checks.actionReaction).toBe(2);
    expect(checks.actionFormula).toBeGreaterThanOrEqual(1);
    expect(checks.springCursor).toBeGreaterThanOrEqual(1);
    expect(checks.equilibrium).toBeGreaterThanOrEqual(1);
    expect(checks.impulse).toBeGreaterThanOrEqual(1);
    expect(checks.angularRadius).toBeGreaterThanOrEqual(2);
    expect(checks.workDistance).toBeGreaterThanOrEqual(1);
    expect(checks.impactBeforeReset).toBe(1);
    expect(checks.impactAfterReset).toBe(0);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
