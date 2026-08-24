'use strict';
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');
const manifest = require('../js/sim2/sim2-route-manifest.js');
const { fixtureUrl } = require('./support/simulation-test-utils.js');
const fixture = pathToFileURL(path.join(__dirname, 'fixtures', 'sim2-ch1.html')).href;
test.use({ deviceScaleFactor: 2 });
async function gotoFixture(page, width = 1100) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(fixture, { waitUntil: 'domcontentloaded' });
}
async function mount(page, routeId) {
  await page.evaluate(id => {
    const host = document.getElementById('host');
    host.style.width = '900px';
    window.__sim = window.SIM_MAP[id](host);
  }, routeId);
}
test('dynamic route resizes paused and playing without overflow or state reset', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(fixtureUrl(2), { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const host = document.getElementById('host'); host.style.width = '900px';
    window.__sim = window.SIM_MAP['ch2-2-2'](host);
  });
  await page.locator('#host input[data-id=omega0]').evaluate(el => {
    el.value = '1.4'; el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const before = await page.locator('#host input[data-id=omega0]').inputValue();
  for (const [width, playing] of [[360, false], [900, true], [360, false]]) {
    if (playing) await page.locator('#host .sim2-playpause').click();
    else if (await page.locator('#host .sim2-playpause').getAttribute('aria-label') === 'Tạm dừng') await page.locator('#host .sim2-playpause').click();
    await page.locator('#host').evaluate((host, value) => { host.style.width = `${value}px`; }, width);
    await page.waitForTimeout(50);
    const fit = await page.evaluate(() => {
      const host = document.getElementById('host').getBoundingClientRect();
      const root = document.querySelector('#host .sim2-root').getBoundingClientRect();
      return { rootWidth: root.width, hostWidth: host.width, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(fit.rootWidth).toBeLessThanOrEqual(fit.hostWidth + 0.5);
    expect(fit.overflow).toBe(false);
  }
  expect(await page.locator('#host input[data-id=omega0]').inputValue()).toBe(before);
  expect(parseFloat(await page.locator('#host .sim2-readout-row[data-readout-key=phi] .sim2-readout-value').textContent())).toBeGreaterThan(0);
});
test('pointer mapping remains in logical coordinates after CSS scaling', async ({ page }) => {
  await gotoFixture(page);
  await page.evaluate(() => {
    const host = document.getElementById('host');
    host.style.width = '250px';
    let dragged = null;
    const shell = window.Sim2Shell.createSimShell({
      container: host, width: 500, height: 500,
      worldBox: { minX: 0, minY: 0, maxX: 10, maxY: 10 }
    });
    shell.addHandle({ x: 2, y: 2 }, {
      a11y: { label: 'Điểm thử', axis: 'both' },
      keyboardStep: { x: 0.5, y: 0.5 },
      onDrag(wp, phase) { if (phase === 'move') dragged = wp; }
    });
    window.__pointerResult = () => dragged;
  });
  const box = await page.locator('#host .sim2-root').boundingBox();
  const handleBox = await page.locator('#host .sim2-handle').boundingBox();
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2);
  await page.mouse.up();
  const point = await page.evaluate(() => window.__pointerResult ? window.__pointerResult() : null).catch(() => null);
  const actual = point || await page.evaluate(() => {
    const node = document.querySelector('#host .sim2-handle');
    return { x: Number(node.getAttribute('data-world-x')), y: Number(node.getAttribute('data-world-y')) };
  });
  expect(actual.x).toBeCloseTo(8, 1);
  expect(actual.y).toBeCloseTo(8, 1);
  await page.evaluate(() => document.querySelector('#host .sim2-root').__sim2Dispose());
});
test('handles expose route names, values, keyboard steps, and focus state', async ({ page }) => {
  await gotoFixture(page);
  await mount(page, 'ch1-1-3');
  const handle = page.locator('#host .sim2-handle').first();
  await expect(handle).toHaveAttribute('tabindex', '0');
  await expect(handle).toHaveAttribute('role', 'slider');
  await expect(handle).toHaveAttribute('aria-label', /lực|điểm|đầu/i);
  await expect(handle).toHaveAttribute('aria-valuenow', /.+/);
  const before = await page.locator('#host input[data-id=F]').inputValue();
  await handle.focus();
  await handle.press('ArrowRight');
  const after = await page.locator('#host input[data-id=F]').inputValue();
  expect(Number(after)).toBeGreaterThan(Number(before));
  await expect(handle).toBeFocused();
});
test('canvas backing store follows CSS size and capped DPR', async ({ page }) => {
  await gotoFixture(page);
  const metrics = await page.evaluate(async () => {
    const host = document.getElementById('host');
    host.style.width = '320px';
    const shell = window.Sim2Shell.createSimShell({
      container: host, width: 640, height: 320, canvas: true,
      worldBox: { minX: 0, minY: 0, maxX: 2, maxY: 1 }
    });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const rect = shell.canvas.canvas.getBoundingClientRect();
    return { cssW: rect.width, cssH: rect.height, backingW: shell.canvas.canvas.width, backingH: shell.canvas.canvas.height, dpr: Math.min(devicePixelRatio || 1, 2) };
  });
  expect(metrics.backingW).toBe(Math.round(metrics.cssW * metrics.dpr));
  expect(metrics.backingH).toBe(Math.round(metrics.cssH * metrics.dpr));
});

test('same-size simulations own unique SVG resource identifiers', async ({ page }) => {
  await gotoFixture(page);
  const ids = await page.evaluate(() => {
    const host = document.getElementById('host');
    const a = window.Sim2Shell.createSimShell({ container: host, width: 300, height: 200, worldBox: { minX: 0, minY: 0, maxX: 3, maxY: 2 } });
    const secondHost = document.createElement('div'); host.after(secondHost);
    const b = window.Sim2Shell.createSimShell({ container: secondHost, width: 300, height: 200, worldBox: { minX: 0, minY: 0, maxX: 3, maxY: 2 } });
    return [a.svg, b.svg].map(svg => Array.from(svg.querySelectorAll('defs [id]'), el => el.id));
  });
  expect(ids[0].length).toBeGreaterThan(1);
  expect(ids[0].filter(id => ids[1].includes(id))).toEqual([]);
});

test('resize observer and playback controls clean up with meaningful names', async ({ page }) => {
  await gotoFixture(page);
  const result = await page.evaluate(() => {
    const Native = window.ResizeObserver;
    const calls = { observe: 0, disconnect: 0 };
    window.ResizeObserver = class {
      constructor(cb) { this.cb = cb; }
      observe() { calls.observe += 1; }
      disconnect() { calls.disconnect += 1; }
    };
    const host = document.getElementById('host');
    const shell = window.Sim2Shell.createSimShell({ container: host, width: 400, height: 300, worldBox: { minX: 0, minY: 0, maxX: 4, maxY: 3 } });
    shell.addControls({ playback: { playing: false, onStep() {}, onReset() {} } });
    const names = Array.from(host.querySelectorAll('.sim2-playback button'), button => button.getAttribute('aria-label'));
    shell.dispose();
    window.ResizeObserver = Native;
    return { calls, names };
  });
  expect(result.calls).toEqual({ observe: 1, disconnect: 1 });
  expect(result.names).toContain('Tiến một bước');
  expect(result.names).toContain('Đặt lại mô phỏng');
});

test('all 25 routes fit supported widths', async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 900 });
  for (const descriptor of manifest) {
    await page.goto(fixtureUrl(descriptor.chapter), { waitUntil: 'domcontentloaded' });
    await page.evaluate(id => {
      const host = document.getElementById('host');
      host.style.width = '1024px';
      window.__sim = window.SIM_MAP[id](host);
    }, descriptor.id);
    for (const width of [360, 520, 900, 1024]) {
      const metrics = await page.evaluate(async value => {
        const host = document.getElementById('host');
        host.style.width = `${value}px`;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const hostRect = host.getBoundingClientRect();
        const rootRect = host.querySelector('.sim2-root').getBoundingClientRect();
        return { hostWidth: hostRect.width, rootWidth: rootRect.width };
      }, width);
      expect(metrics.rootWidth, `${descriptor.id} at ${width}px`).toBeLessThanOrEqual(metrics.hostWidth + 0.5);
    }
    await page.evaluate(() => window.__sim.dispose());
  }
});
test('every mounted handle is named, valued, focusable, and keyboard-responsive', async ({ page }) => {
  for (const descriptor of manifest) {
    await page.goto(fixtureUrl(descriptor.chapter), { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(id => {
      const sim = window.SIM_MAP[id](document.getElementById('host'));
      const handles = Array.from(document.querySelectorAll('#host .sim2-handle'));
      const states = handles.map(node => {
        const before = `${node.getAttribute('data-world-x')},${node.getAttribute('data-world-y')}`;
        node.focus();
        node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        const after = `${node.getAttribute('data-world-x')},${node.getAttribute('data-world-y')}`;
        return {
          role: node.getAttribute('role'), label: node.getAttribute('aria-label'), tabIndex: node.tabIndex,
          value: Number(node.getAttribute('aria-valuenow')), min: Number(node.getAttribute('aria-valuemin')), max: Number(node.getAttribute('aria-valuemax')),
          responsive: before !== after
        };
      });
      sim.dispose();
      return states;
    }, descriptor.id);
    for (const state of result) {
      expect(state.role, descriptor.id).toBe('slider');
      expect(state.label, descriptor.id).toBeTruthy();
      expect(Number.isFinite(state.value) && state.value >= state.min && state.value <= state.max, descriptor.id).toBe(true);
      expect(state.tabIndex, descriptor.id).toBe(0);
      expect(state.responsive, descriptor.id).toBe(true);
    }
  }
});
