const { test, expect } = require('@playwright/test');

function fixtureUrl(chapter) {
  return `file://${require('path').resolve(__dirname, `fixtures/sim2-ch${chapter}.html`).replace(/\\/g, '/')}`;
}
async function mount(page, routeId) {
  await page.goto(fixtureUrl(routeId[2]), { waitUntil: 'domcontentloaded' });
  await page.evaluate(id => { window.__sim = window.SIM_MAP[id](document.getElementById('host')); }, routeId);
}
async function setSlider(page, id, value) {
  await page.locator(`#host input[data-id="${id}"]`).evaluate((el, next) => {
    el.value = String(next);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}
async function step(page, count) {
  await page.locator('#host .sim2-step').evaluate((el, n) => { for (let i = 0; i < n; i += 1) el.click(); }, count);
}
async function elementInsideRoot(page, selector) {
  return page.locator(selector).first().evaluate(el => {
    const root = el.closest('.sim2-root').getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return box.left >= root.left - 1 && box.right <= root.right + 1 && box.top >= root.top - 1 && box.bottom <= root.bottom + 1;
  });
}
async function allSvgGeometryInsideRoot(page) {
  return page.locator('#host .sim2-svg').evaluate(svg => {
    const root = svg.closest('.sim2-root').getBoundingClientRect();
    return [...svg.querySelectorAll('line, path, polygon, polyline, circle')].every(el => {
      if (el.closest('defs')) return true;
      const box = el.getBoundingClientRect();
      return box.left >= root.left - 3 && box.right <= root.right + 3 && box.top >= root.top - 3 && box.bottom <= root.bottom + 3;
    });
  });
}
async function dragFar(page, routeId) {
  await mount(page, routeId);
  const handle = page.locator('#host .sim2-handle').first();
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 1800, box.y - 1400, { steps: 4 });
  await page.mouse.up();
  return handle.evaluate(el => ({ x: Number(el.dataset.worldX), y: Number(el.dataset.worldY) }));
}

test('unbounded force drags clamp to legal route geometry', async ({ page }) => {
  const reduced = await dragFar(page, 'ch1-1-5');
  expect(Math.abs(reduced.x)).toBeLessThanOrEqual(3.75);
  expect(Math.abs(reduced.y)).toBeLessThanOrEqual(3.75);
  const composed = await dragFar(page, 'ch1-2-3');
  expect(composed.x).toBeLessThanOrEqual(5.75);
  expect(composed.y).toBeGreaterThanOrEqual(-0.75);
  expect(await elementInsideRoot(page, '#host .sim2-handle:first-of-type')).toBe(true);
});

test('chapter 1 legal extrema keep primary geometry visible', async ({ page }) => {
  const cases = [
    ['ch1-1-3', [['F', 120], ['alpha', 90]]],
    ['ch1-1-8', [['P', 200]]],
    ['ch1-3-2', [['alpha', 75]]],
    ['ch1-5-3', [['beta', 60], ['mu', 0.8]]]
  ];
  for (const [id, inputs] of cases) {
    await mount(page, id);
    for (const [key, value] of inputs) await setSlider(page, key, value);
    expect(await allSvgGeometryInsideRoot(page), id).toBe(true);
    const finite = await page.locator('#host .sim2-readout-value').evaluateAll(nodes => nodes.every(n => !/NaN|Infinity/.test(n.textContent)));
    expect(finite, id).toBe(true);
    await page.evaluate(() => window.__sim.dispose());
  }
});

test('maximum-range projectile stays visible through late flight', async ({ page }) => {
  await mount(page, 'ch2-1-1');
  await setSlider(page, 'v0', 20);
  await setSlider(page, 'alpha', 45);
  await step(page, 150);
  expect(await elementInsideRoot(page, '#host .sim2-current-marker')).toBe(true);
});

test('osculating circle remains complete at high-curvature endpoint', async ({ page }) => {
  await mount(page, 'ch2-1-3');
  const handle = page.locator('#host .sim2-handle');
  await handle.focus();
  for (let i = 0; i < 80; i += 1) await page.keyboard.press('ArrowUp');
  const complete = await page.locator('#host .sim2-svg circle').evaluateAll(circles => {
    const circle = circles.reduce((best, item) => +item.getAttribute('r') > +best.getAttribute('r') ? item : best);
    const root = circle.closest('.sim2-root').getBoundingClientRect();
    const box = circle.getBoundingClientRect();
    return +circle.getAttribute('r') > 0 && box.left >= root.left - 1 && box.right <= root.right + 1 && box.top >= root.top - 1 && box.bottom <= root.bottom + 1;
  });
  expect(complete).toBe(true);
});

test('long-run rotating velocity keeps canonical readout and clamped display', async ({ page }) => {
  await mount(page, 'ch2-2-2');
  await setSlider(page, 'omega0', 2);
  await setSlider(page, 'alphaAcc', 0.5);
  await step(page, 600);
  const omega = parseFloat(await page.locator('#host .sim2-readout-row[data-readout-key="omega"] .sim2-readout-value').textContent());
  expect(omega).toBeGreaterThan(6);
  expect(await elementInsideRoot(page, '#host line[marker-end]')).toBe(true);
});

test('open belt segments are tangent for unequal pulley radii', async ({ page }) => {
  await mount(page, 'ch2-3-2');
  await setSlider(page, 'r1', 0.8);
  await setSlider(page, 'r2', 2.5);
  const errors = await page.locator('#host .sim2-transmission-belt').evaluateAll((lines) => {
    const pulleys = [...document.querySelectorAll('#host .sim2-transmission-pulley')];
    return lines.map(line => {
      const x1 = +line.getAttribute('x1'), y1 = +line.getAttribute('y1');
      const x2 = +line.getAttribute('x2'), y2 = +line.getAttribute('y2');
      const den = Math.hypot(y2 - y1, x2 - x1);
      return pulleys.map(c => Math.abs(Math.abs((y2-y1)*(+c.getAttribute('cx'))-(x2-x1)*(+c.getAttribute('cy'))+x2*y1-y2*x1)/den-(+c.getAttribute('r'))));
    });
  });
  expect(Math.max(...errors.flat())).toBeLessThan(0.5);
});

test('Coriolis control names its source quantity and reports instantaneous speed', async ({ page }) => {
  await mount(page, 'ch2-4-4');
  await setSlider(page, 'vRel', 3);
  const label = await page.locator('#host input[data-id="vRel"]').evaluate(el => el.closest('.sim2-slider').textContent);
  expect(label).toContain('max');
  const speed = parseFloat(await page.locator('#host .sim2-readout-row[data-readout-key="vRel"] .sim2-readout-value').textContent());
  expect(speed).toBeCloseTo(3, 1);
  expect(await elementInsideRoot(page, '#host .sim2-vector-vrel')).toBe(true);
  expect(await elementInsideRoot(page, '#host .sim2-vector-coriolis')).toBe(true);
  await step(page, 60);
  const reverseSpeed = parseFloat(await page.locator('#host .sim2-readout-row[data-readout-key="vRel"] .sim2-readout-value').textContent());
  expect(reverseSpeed).toBeLessThan(0);
  expect(await elementInsideRoot(page, '#host .sim2-vector-vrel')).toBe(true);
  expect(await elementInsideRoot(page, '#host .sim2-vector-coriolis')).toBe(true);
});

test('velocity field preserves canonical magnitude while display arrows stay visible', async ({ page }) => {
  await mount(page, 'ch2-5-3');
  await setSlider(page, 'omega', 2.5);
  const handle = page.locator('#host .sim2-handle');
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x - 500, box.y + 500); await page.mouse.up();
  const v = parseFloat(await page.locator('#host .sim2-readout-row[data-readout-key="vM"] .sim2-readout-value').textContent());
  expect(v).toBeGreaterThan(10);
  expect(await elementInsideRoot(page, '#host .sim2-vector-vrel')).toBe(true);
});

test('Newton body keeps moving while velocity state changes', async ({ page }) => {
  await mount(page, 'ch3-2-2');
  await setSlider(page, 'F', 20);
  await setSlider(page, 'm', 1);
  await step(page, 90);
  const before = await page.locator('#host polygon').first().getAttribute('points');
  const vBefore = parseFloat(await page.locator('#host .sim2-readout-row[data-readout-key="v"] .sim2-readout-value').textContent());
  await step(page, 10);
  const after = await page.locator('#host polygon').first().getAttribute('points');
  const vAfter = parseFloat(await page.locator('#host .sim2-readout-row[data-readout-key="v"] .sim2-readout-value').textContent());
  expect(vAfter).toBeGreaterThan(vBefore);
  expect(after).not.toBe(before);
});

test('collision reaches tangent contact once and resets after complete exit', async ({ page }) => {
  await page.goto(fixtureUrl(3), { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    window.__states = []; const original = window.Sim3Mode.attach;
    window.Sim3Mode.attach = () => ({ setState: s => window.__states.push(JSON.parse(JSON.stringify(s))), reset() {}, dispose() {} });
    window.__sim = window.SIM_MAP['ch3-6-2'](document.getElementById('host'));
    window.Sim3Mode.attach = original;
  });
  await step(page, 440);
  const states = await page.evaluate(() => window.__states);
  const impacts = states.filter(s => s.collided && s.impactPoint);
  expect(impacts.length).toBeGreaterThan(0);
  expect(Math.abs(Math.hypot(impacts[0].p2.x-impacts[0].p1.x, impacts[0].p2.y-impacts[0].p1.y)-(impacts[0].r1+impacts[0].r2))).toBeLessThan(1e-6);
  expect(Math.hypot(impacts[0].impactPoint.x-impacts[0].p1.x, impacts[0].impactPoint.y-impacts[0].p1.y)).toBeCloseTo(impacts[0].r1, 6);
  expect(Math.hypot(impacts[0].impactPoint.x-impacts[0].p2.x, impacts[0].impactPoint.y-impacts[0].p2.y)).toBeCloseTo(impacts[0].r2, 6);
  expect(new Set(impacts.map(s => `${s.impactPoint.x},${s.impactPoint.y}`)).size).toBe(1);
  expect(states.at(-1).collided).toBe(false);
});
