'use strict';

const { test, expect } = require('@playwright/test');
const manifest = require('../js/sim2/sim2-route-manifest.js');
const {
  fixtureUrl, mountRoute, readouts, numberFrom: n, numbersFrom, transitionRoute
} = require('./support/simulation-test-utils.js');

const keys = {
  'ch1-1-3': ['F', 'Fx', 'Fy', 'alpha'],
  'ch1-1-4': ['F', 'd', 'M'],
  'ch1-1-5': ['Rx', 'Ry', 'R', 'Mo'],
  'ch1-1-6': ['F', 'd', 'M', 'sumF'],
  'ch1-2-3': ['F1', 'F2', 'angle', 'R'],
  'ch1-1-8': ['P', 'a', 'Ra', 'Rb'],
  'ch1-3-2': ['W', 'alpha', 'T'],
  'ch1-3-6': ['P', 'a', 'R', 'M'],
  'ch1-5-3': ['mu', 'phi', 'beta', 'state'],
  'ch1-6-3': ['plateArea', 'holeArea', 'Cx', 'Cy'],
  'ch2-1-1': ['t', 'v', 'a'],
  'ch2-1-3': ['v', 'a', 'R'],
  'ch2-2-2': ['omega0', 'alpha', 'omega', 'phi'],
  'ch2-3-2': ['r1', 'r2', 'gearOmega', 'beltOmega', 'beltV'],
  'ch2-4-4': ['omega', 'vRelMax', 'vRel', 'aCor'],
  'ch2-5-2': ['A', 'B', 'IC'],
  'ch2-5-3': ['omega', 'r', 'vM'],
  'ch3-2-2': ['F', 'm', 'a', 'x', 'v'],
  'ch3-2-3': ['FAB', 'FBA', 'pairMag', 'sum'],
  'ch3-1-3': ['aFrame', 'inertiaForce', 'theta', 'tan'],
  'ch3-3-1': ['k', 'm', 'omega', 'x'],
  'ch3-5-2': ['F', 't', 'J', 'dp'],
  'ch3-5-3': ['r', 'I', 'omega', 'L'],
  'ch3-5-4': ['F', 'd', 'W', 'dT'],
  'ch3-6-2': ['phase', 'momentum', 'energy', 'energyLoss', 'lossPredict']
};

const near = (actual, expected, tolerance) => Math.abs(actual - expected) <= tolerance;

function verifyOracle(route, value, before) {
  switch (route) {
    case 'ch1-1-3': return near(n(value.Fx), n(value.F) * Math.cos(n(value.alpha) * Math.PI / 180), 0.15) && near(n(value.Fy), n(value.F) * Math.sin(n(value.alpha) * Math.PI / 180), 0.15);
    case 'ch1-1-4': return near(n(value.M), n(value.F) * n(value.d), 0.11);
    case 'ch1-1-5': return near(n(value.R), Math.hypot(n(value.Rx), n(value.Ry)), 0.2);
    case 'ch1-1-6': return near(n(value.M), n(value.F) * n(value.d), 0.11) && n(value.sumF) === 0;
    case 'ch1-2-3': {
      const expectedR2 = n(value.F1) ** 2 + n(value.F2) ** 2 + 2 * n(value.F1) * n(value.F2) * Math.cos(n(value.angle) * Math.PI / 180);
      return near(n(value.R) ** 2, expectedR2, Math.max(150, expectedR2 * 0.01));
    }
    case 'ch1-1-8': return near(n(value.Ra) + n(value.Rb), n(value.P), 0.11);
    case 'ch1-3-2': return near(n(value.T), n(value.W) / (2 * Math.cos(n(value.alpha) * Math.PI / 180)), 0.11);
    case 'ch1-3-6': return near(n(value.R), n(value.P), 0.11) && near(n(value.M), n(value.P) * n(value.a), 0.11);
    case 'ch1-5-3': return near(n(value.phi), Math.atan(n(value.mu)) * 180 / Math.PI, 0.11) && value.state.includes(n(value.beta) > n(value.phi) ? 'trượt' : 'cân bằng');
    case 'ch1-6-3': return near(n(value.plateArea), 24, 0.01) && near(Math.abs(n(value.holeArea)), Math.PI, 0.01) && n(value.Cx) < n(before.Cx) && n(value.Cy) < n(before.Cy);
    case 'ch2-1-1': return near(n(value.a), 9.81, 0.11);
    case 'ch2-1-3': return near(n(value.R), n(value.v) ** 3 / 10, 0.12);
    case 'ch2-2-2': return near(n(value.omega), n(value.omega0), 0.01) && near(n(value.phi), 0, 0.01);
    case 'ch2-3-2': return near(n(value.gearOmega), -n(value.r1) / n(value.r2), 0.011) && near(n(value.beltOmega), n(value.r1) / n(value.r2), 0.011) && near(n(value.beltV), n(value.r1), 0.011);
    case 'ch2-4-4': return near(n(value.aCor), 2 * n(value.omega) * n(value.vRel), 0.031);
    case 'ch2-5-2': { const A = numbersFrom(value.A), B = numbersFrom(value.B), ic = numbersFrom(value.IC); return ic.length === 2 && near(ic[0], A[0], 0.11) && near(ic[1], B[1], 0.11); }
    case 'ch2-5-3': return near(n(value.vM), n(value.omega) * n(value.r), 0.021);
    case 'ch3-2-2': return near(n(value.a), n(value.F) / n(value.m), 0.11);
    case 'ch3-2-3': return near(n(value.FAB), -n(value.FBA), 0.01) && near(n(value.pairMag), Math.abs(n(value.FAB)), 0.01) && n(value.sum) === 0;
    case 'ch3-1-3': return near(n(value.inertiaForce), -n(value.aFrame), 0.01) && near(n(value.tan), n(value.aFrame) / 9.81, 0.001);
    case 'ch3-3-1': return near(n(value.omega), Math.sqrt(n(value.k) / n(value.m)), 0.011);
    case 'ch3-5-2': return near(n(value.J), n(value.F) * n(value.t), 0.11) && near(n(value.dp), n(value.J), 0.01);
    case 'ch3-5-3': return near(n(value.L), n(value.I) * n(value.omega), 0.26);
    case 'ch3-5-4': return near(n(value.W), n(value.F) * n(value.d), 0.11) && near(n(value.dT), n(value.W), 0.01);
    case 'ch3-6-2': return value.phase === 'Sau va chạm' && near(n(value.momentum), 1.4, 0.01) && near(n(value.energyLoss), n(value.lossPredict), 0.01);
    default: return false;
  }
}

const scenarioIds = Object.keys(keys).sort();
const manifestIds = manifest.map(item => item.id).sort();
expect(scenarioIds).toEqual(manifestIds);

test.describe('Sim2 mounted physics contracts — 25 routes', () => {
  for (const descriptor of manifest) {
    test(`${descriptor.id}: transition + semantic readouts + independent oracle`, async ({ page }) => {
      await mountRoute(page, descriptor.id, descriptor.chapter);
      expect(await page.evaluate(() => window.__SIM2_EXECUTED_ROUTE__)).toBe(descriptor.id);
      const before = await readouts(page);
      expect(Object.keys(before).sort()).toEqual(keys[descriptor.id].slice().sort());
      await transitionRoute(page, descriptor.id);
      const after = await readouts(page);
      expect(after).not.toEqual(before);
      expect(verifyOracle(descriptor.id, after, before), `${descriptor.id} independent oracle`).toBe(true);
      await page.evaluate(() => window.__sim.dispose());
    });
  }
});

test('dynamic route state is identical after one second at 30 Hz and 120 Hz', async ({ page }) => {
  async function runAt(hz) {
    await page.goto(fixtureUrl(2), { waitUntil: 'domcontentloaded' });
    return page.evaluate(rate => {
      const savedRaf = window.requestAnimationFrame;
      const savedCancel = window.cancelAnimationFrame;
      const callbacks = new Map();
      let nextId = 1;
      window.requestAnimationFrame = cb => { const id = nextId++; callbacks.set(id, cb); return id; };
      window.cancelAnimationFrame = id => callbacks.delete(id);
      const sim = window.SIM_MAP['ch2-2-2'](document.getElementById('host'));
      document.querySelector('#host .sim2-playpause').click();
      for (let i = 0; i <= rate; i += 1) {
        const entry = callbacks.entries().next().value;
        if (!entry) throw new Error(`missing RAF callback at ${rate} Hz frame ${i}`);
        callbacks.delete(entry[0]);
        entry[1](i * 1000 / rate);
      }
      const values = {};
      document.querySelectorAll('#host .sim2-readout-row').forEach(row => {
        values[row.getAttribute('data-readout-key')] = row.querySelector('.sim2-readout-value').textContent.trim();
      });
      sim.dispose();
      window.requestAnimationFrame = savedRaf;
      window.cancelAnimationFrame = savedCancel;
      return values;
    }, hz);
  }

  const at30 = await runAt(30);
  const at120 = await runAt(120);
  expect(at30).toEqual(at120);
  expect(n(at30.phi)).toBeGreaterThan(0);
});
