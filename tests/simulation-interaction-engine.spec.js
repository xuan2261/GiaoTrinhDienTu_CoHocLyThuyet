const { test, expect } = require('@playwright/test');

const {
  ALL_ROUTES,
  canvasStats,
  openRoute,
  labState,
  readoutSnapshot,
  firstHandlePoint,
  dragTarget,
  dragCanvasPoint,
} = require('./simulation-test-utils');

const SEMANTIC_CASES = [
  { route: 'ch1-2-3', label: '|R|', reason: 'resultant force' },
  { route: 'ch1-3-1', label: 'N', reason: 'support reaction' },
  { route: 'ch2-1-1', label: 'α', reason: 'trajectory position' },
  { route: 'ch2-5-2', label: 'IC_x', reason: 'instant center' },
  { route: 'ch3-3-1', label: 'V', reason: 'spring energy' },
  { route: 'ch3-6-2', label: 'p trước', reason: 'collision momentum' },
];
const CH1_ROUTES = ALL_ROUTES.filter(route => route.startsWith('ch1-'));

async function canvasClientPoint(page, point) {
  const canvas = page.locator('.sim-container.sim-lab canvas').first();
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const scale = await canvas.evaluate(node => ({
    x: node.getBoundingClientRect().width / node.width,
    y: node.getBoundingClientRect().height / node.height,
  }));
  return { x: box.x + point.x * scale.x, y: box.y + point.y * scale.y };
}

async function readoutValue(page, label) {
  const state = await labState(page);
  const card = state.readoutCards.find(item => item.label === label);
  return card ? card.value : '';
}

function firstNumber(text) {
  const match = String(text || '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

async function routeSnapshot(page) {
  const stats = await canvasStats(page);
  return `${await readoutSnapshot(page)}##${stats.hash}:${stats.ink}:${stats.variants}`;
}

async function transientParticlePixels(page) {
  return page.locator('.sim-container.sim-lab canvas').first().evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a > 80 && r > 170 && g > 70 && g < 190 && b < 110) pixels += 1;
    }
    return pixels;
  });
}

async function labControls(page) {
  return page.locator('.sim-container.sim-lab').first().evaluate(lab => ({
    sliders: [...lab.querySelectorAll('input[type="range"]')].map((input, index) => ({
      index,
      key: input.dataset.controlKey || input.getAttribute('aria-label') || '',
      label: input.getAttribute('aria-label') || '',
      value: input.value,
      min: input.min,
      max: input.max,
      display: input.closest('.sim-slider-group')?.querySelector('.sim-inline-slider-value, .sv')?.textContent.trim() || '',
    })),
    buttons: [...lab.querySelectorAll('.sim-controls .sim-btn')].map((button, index) => ({
      index,
      text: button.textContent.trim(),
      pressed: button.getAttribute('aria-pressed') || '',
    })),
    handles: lab.querySelector('canvas')?.__simInteractionLayer?.handles?.().map((handle, index) => ({
      index,
      id: handle.id,
      label: handle.label,
      point: handle.point,
    })) || [],
    status: lab.querySelector('.sim-lab-status')?.textContent.trim() || '',
  }));
}

async function setSlider(page, index, value) {
  await page.locator('.sim-container.sim-lab input[type="range"]').nth(index).evaluate((input, next) => {
    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  await page.waitForTimeout(100);
}

async function overlayText(page) {
  return page.locator('.sim-container.sim-lab .sim-lab-overlay').first().textContent();
}

async function resetRoute(page) {
  await page.getByRole('button', { name: /Đặt lại/ }).first().click();
  await page.waitForTimeout(120);
}

async function touchDragCanvasPoint(page, from, to) {
  const start = await canvasClientPoint(page, from);
  const end = await canvasClientPoint(page, to);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: start.x, y: start.y, id: 1 }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: end.x, y: end.y, id: 1 }],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

test('all controls, handles, and animation play states respond across 58 routes @control-audit', async ({ page }) => {
  test.setTimeout(240000);
  const failures = [];
  for (const route of ALL_ROUTES) {
    await openRoute(page, route);
    let controls = await labControls(page);
    for (const slider of controls.sliders) {
      const min = Number(slider.min), max = Number(slider.max), value = Number(slider.value);
      if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
        failures.push(`${route}: slider ${slider.label || slider.index} invalid range`);
        continue;
      }
      const before = await routeSnapshot(page);
      await setSlider(page, slider.index, value === max ? min : max);
      if (await routeSnapshot(page) === before) {
        failures.push(`${route}: slider ${slider.label || slider.key || slider.index} no visible/readout change`);
      }
      await resetRoute(page);
    }

    controls = await labControls(page);
    for (const button of controls.buttons) {
      if (/Đặt lại|Chạy|Dừng/i.test(button.text)) continue;
      const before = await routeSnapshot(page);
      await page.locator('.sim-container.sim-lab .sim-controls .sim-btn').nth(button.index).click();
      await page.waitForTimeout(120);
      const current = (await labControls(page)).buttons.find(item => item.index === button.index);
      if (await routeSnapshot(page) === before && (!current || current.pressed !== 'true')) {
        failures.push(`${route}: button ${button.text || button.index} no visible/readout/pressed change`);
      }
    }

    await resetRoute(page);
    controls = await labControls(page);
    for (const handle of controls.handles) {
      const before = await routeSnapshot(page);
      await dragCanvasPoint(page, handle.point, dragTarget(handle.point));
      await page.waitForTimeout(130);
      if (await routeSnapshot(page) === before) {
        failures.push(`${route}: handle ${handle.id || handle.label || handle.index} no visible/readout change`);
      }
      await resetRoute(page);
    }

    const play = page.getByRole('button', { name: /Chạy/ }).first();
    if (await play.count()) {
      const before = await routeSnapshot(page);
      await play.click();
      await page.waitForTimeout(420);
      const status = (await labControls(page)).status;
      if (await routeSnapshot(page) === before) failures.push(`${route}: animation play no visible/readout change`);
      if (!/đang chạy/i.test(status)) failures.push(`${route}: animation status not running after play`);
      const pause = page.getByRole('button', { name: /Dừng/ }).first();
      if (await pause.count()) await pause.click();
    }
  }
  expect(failures).toEqual([]);
});

test('interaction layer exposes active handle metadata lifecycle @direct-drag', async ({ page }) => {
  await openRoute(page, 'ch2-5-2');
  const state = await labState(page);
  expect(state.handleIds.length).toBeGreaterThan(0);
  const start = await firstHandlePoint(page);
  expect(start).not.toBeNull();
  const end = dragTarget(start);
  const clientStart = await canvasClientPoint(page, start);
  const clientEnd = await canvasClientPoint(page, end);

  await page.mouse.move(clientStart.x, clientStart.y);
  await page.mouse.down();
  await expect(page.locator('.sim-container.sim-lab')).toHaveAttribute('data-active-handle-id', state.handleIds[0]);
  await page.mouse.move(clientEnd.x, clientEnd.y, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator('.sim-container.sim-lab')).not.toHaveAttribute('data-active-handle-id', /.+/);
});

test('all 58 routes expose route-owned handles and stable readout drag @direct-drag-audit', async ({ page }) => {
  test.setTimeout(180000);
  const failures = [];
  for (const route of ALL_ROUTES) {
    await openRoute(page, route);
    const state = await labState(page);
    if (!state.handleIds.length) {
      failures.push(`${route}: missing handle ids`);
      continue;
    }
    if (state.handleIds.includes('legacy-primary')) failures.push(`${route}: legacy fallback handle`);
    const start = await firstHandlePoint(page);
    if (!start) {
      failures.push(`${route}: missing interaction handle point`);
      continue;
    }
    const before = await readoutSnapshot(page);
    await dragCanvasPoint(page, start, dragTarget(start));
    await page.waitForTimeout(90);
    const after = await readoutSnapshot(page);
    if (after === before) failures.push(`${route}: readout unchanged after drag`);
    await page.waitForTimeout(260);
    const later = await readoutSnapshot(page);
    if (later !== after) failures.push(`${route}: readout drifted while paused`);
  }
  expect(failures).toEqual([]);
});

test('Phase 04 friction and centroid handles update semantic readouts @direct-drag', async ({ page }) => {
  for (const item of [{ route: 'ch1-5-1', label: 'Fms' }, { route: 'ch1-6-2', label: 'xG' }]) {
    await openRoute(page, item.route);
    const before = await readoutValue(page, item.label);
    const start = await firstHandlePoint(page);
    expect(start).not.toBeNull();
    await dragCanvasPoint(page, start, dragTarget(start));
    await expect.poll(() => readoutValue(page, item.label)).not.toBe(before);
  }
});

test('ch1-5-4 self-locking readout and wedge geometry stay synchronized @direct-drag', async ({ page }) => {
  await openRoute(page, 'ch1-5-4');
  const readout = await readoutValue(page, 'Trạng thái');
  expect(readout).toMatch(/tự hãm|trượt|bám/i);
  await setSlider(page, 0, 42);
  const handle = await firstHandlePoint(page);
  expect(handle.x).toBeCloseTo(176 + 210 * Math.cos(42 * Math.PI / 180), 0);
  expect(handle.y).toBeCloseTo(300 - 210 * Math.sin(42 * Math.PI / 180), 0);
  const afterReadout = await readoutValue(page, 'Trạng thái');
  expect(afterReadout).toMatch(/tự hãm|trượt|bám/i);
});

test('all Ch1 handles use physical DeCuong-style labels @direct-drag', async ({ page }) => {
  const failures = [];
  for (const route of CH1_ROUTES) {
    await openRoute(page, route);
    const controls = await labControls(page);
    for (const handle of controls.handles) {
      if (/legacy|construction/i.test(handle.id || '')) failures.push(`${route}: generic handle id ${handle.id}`);
      if (/^(điểm|kéo)$/i.test(handle.label || '')) failures.push(`${route}: generic handle label ${handle.label}`);
    }
  }
  expect(failures).toEqual([]);
});

test('ch1-1-3 tail drag keeps force vector controls and readouts synchronized @direct-drag', async ({ page }) => {
  await openRoute(page, 'ch1-1-3');
  async function expectForceAngleSync() {
    const controls = await labControls(page);
    const forceSlider = controls.sliders.find(item => item.key === 'force');
    const angleSlider = controls.sliders.find(item => item.key === 'angle');
    expect(Math.abs(firstNumber(await readoutValue(page, '|F|')) - Number(forceSlider.value))).toBeLessThan(0.2);
    expect(Math.abs(firstNumber(forceSlider.display) - Number(forceSlider.value))).toBeLessThan(0.2);
    expect(Math.abs(firstNumber(await readoutValue(page, 'α')) - Number(angleSlider.value))).toBeLessThan(0.7);
    expect(Math.abs(firstNumber(angleSlider.display) - Number(angleSlider.value))).toBeLessThan(0.7);
    return controls;
  }
  let controls = await labControls(page);
  await setSlider(page, controls.sliders.find(item => item.key === 'angle').index, -45);
  await expectForceAngleSync();
  await resetRoute(page);
  for (const target of [{ x: 732, y: 412 }, { x: 732, y: 28 }]) {
    controls = await labControls(page);
    const tail = controls.handles.find(item => item.id === 'force-tail-a');
    expect(tail).toBeTruthy();
    await dragCanvasPoint(page, tail.point, target);
    await page.waitForTimeout(120);
    controls = await expectForceAngleSync();
    await setSlider(page, controls.sliders.find(item => item.key === 'angle').index, target.y < 100 ? 75 : -45);
    await expectForceAngleSync();
    await resetRoute(page);
  }
});

test('ch1-2-3 resultant readout updates after F2 drag @direct-drag', async ({ page }) => {
  await openRoute(page, 'ch1-2-3');
  await expect.poll(async () => firstNumber(await readoutValue(page, '|R|'))).toBeGreaterThan(0);

  const controls = await labControls(page);
  const handle = controls.handles.find(item => item.id === 'parallelogram-f2');
  expect(handle).toBeTruthy();
  const before = firstNumber(await readoutValue(page, '|R|'));
  await dragCanvasPoint(page, handle.point, { x: handle.point.x, y: handle.point.y + 32 });
  await expect.poll(async () => firstNumber(await readoutValue(page, '|R|'))).not.toBe(before);
});

test('ch1-2-3 F1 drag keeps force slider and resultant synchronized @direct-drag', async ({ page }) => {
  await openRoute(page, 'ch1-2-3');
  let controls = await labControls(page);
  const handle = controls.handles.find(item => item.id === 'parallelogram-f1');
  expect(handle).toBeTruthy();
  const beforeF1 = firstNumber(await readoutValue(page, '|F₁|'));
  const beforeR = firstNumber(await readoutValue(page, '|R|'));
  await dragCanvasPoint(page, handle.point, { x: handle.point.x + 34, y: handle.point.y - 22 });
  await expect.poll(async () => firstNumber(await readoutValue(page, '|F₁|'))).not.toBe(beforeF1);
  await expect.poll(async () => firstNumber(await readoutValue(page, '|R|'))).not.toBe(beforeR);
  controls = await labControls(page);
  const forceSlider = controls.sliders.find(item => item.key === 'force');
  expect(Math.abs(firstNumber(forceSlider.display) - firstNumber(await readoutValue(page, '|F₁|')))).toBeLessThan(0.6);
});

for (const route of ['ch1-3-1', 'ch1-3-2']) {
  test(`${route} alpha slider changes support geometry @control-audit`, async ({ page }) => {
    await openRoute(page, route);
    const controls = await labControls(page);
    const alpha = controls.sliders.find(item => item.key === 'alpha');
    expect(alpha).toBeTruthy();
    const before = (await canvasStats(page)).hash;
    await setSlider(page, alpha.index, 45);
    await expect.poll(async () => (await canvasStats(page)).hash).not.toBe(before);
  });
}

for (const route of ['ch1-3-3', 'ch1-3-4', 'ch1-3-6', 'ch1-3-7', 'ch1-4-1', 'ch1-4-2', 'ch1-4-4']) {
  test(`${route} direct drag updates Phase 03 support/spatial state @direct-drag`, async ({ page }) => {
    await openRoute(page, route);
    const before = await routeSnapshot(page);
    const start = await firstHandlePoint(page);
    expect(start).not.toBeNull();
    await dragCanvasPoint(page, start, dragTarget(start));
    await expect.poll(() => routeSnapshot(page)).not.toBe(before);
  });
}

for (const item of SEMANTIC_CASES) {
  test(`representative drag changes semantic ${item.reason} readout ${item.route} @direct-drag`, async ({ page }) => {
    await openRoute(page, item.route);
    const before = await readoutValue(page, item.label);
    const start = await firstHandlePoint(page);
    expect(start).not.toBeNull();
    await dragCanvasPoint(page, start, dragTarget(start));
    await expect.poll(() => readoutValue(page, item.label)).not.toBe(before);
  });
}

test('keyboard nudge updates focused handle without pointer drag @keyboard', async ({ page }) => {
  await openRoute(page, 'ch2-5-2');
  const before = await readoutSnapshot(page);
  const canvas = page.locator('.sim-container.sim-lab canvas').first();
  await canvas.focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => readoutSnapshot(page)).not.toBe(before);
});

for (const route of ['ch2-5-2']) {
  test(`reset restores initial readout after direct manipulation ${route} @reset`, async ({ page }) => {
    await openRoute(page, route);
    const initial = await readoutSnapshot(page);
    const start = await firstHandlePoint(page);
    expect(start).not.toBeNull();
    await dragCanvasPoint(page, start, dragTarget(start));
    await expect.poll(() => readoutSnapshot(page)).not.toBe(initial);
    await page.getByRole('button', { name: /Đặt lại/ }).click();
    await expect.poll(() => readoutSnapshot(page)).toBe(initial);
  });
}

test('touch viewport direct drag updates readout and keeps canvas touch-safe @touch', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openRoute(page, 'ch1-5-3');
  const touchAction = await page.locator('.sim-container.sim-lab canvas').evaluate(canvas =>
    getComputedStyle(canvas).touchAction
  );
  expect(touchAction).toBe('none');
  const before = await readoutSnapshot(page);
  const start = await firstHandlePoint(page);
  expect(start).not.toBeNull();
  await touchDragCanvasPoint(page, start, dragTarget(start));
  await expect.poll(() => readoutSnapshot(page)).not.toBe(before);
});

test('animated route opens running and drag pauses running animation @animation', async ({ page }) => {
  await openRoute(page, 'ch3-3-1');
  // Phase 08 RC2: ch3-3-1 declares scene.autoplay = true so the spring-mass
  // oscillation is the visible default — the learning content, not decoration.
  await expect(page.getByRole('button', { name: /Dừng/ }).first()).toBeVisible();
  await expect(page.locator('.sim-lab-status')).toContainText('đang chạy');
  const start = await firstHandlePoint(page);
  expect(start).not.toBeNull();
  await dragCanvasPoint(page, start, dragTarget(start));
  await expect(page.getByRole('button', { name: /Chạy/ }).first()).toBeVisible();
  await expect(page.locator('.sim-lab-status')).toContainText('đã tạm dừng');
  // Re-arm the loop: clicking Play after pause should resume animation
  // (regression guard for the engine.resume() rAF fix).
  await page.getByRole('button', { name: /Chạy/ }).first().click();
  await expect(page.getByRole('button', { name: /Dừng/ }).first()).toBeVisible();
  await expect(page.locator('.sim-lab-status')).toContainText('đang chạy');
});

test('paused direct drag does not leave transient particle dots after settling @direct-drag', async ({ page }) => {
  await openRoute(page, 'ch3-3-1');
  await expect.poll(() => transientParticlePixels(page)).toBe(0);
  const start = await firstHandlePoint(page);
  expect(start).not.toBeNull();

  await dragCanvasPoint(page, start, dragTarget(start));
  await page.waitForTimeout(900);

  const beforeClear = await transientParticlePixels(page);
  await page.evaluate(() => {
    window.SimAnimationEngine.clearParticles();
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(80);
  await expect.poll(() => transientParticlePixels(page)).toBe(beforeClear);
});

test('numeric checker residual scale stays consistent in readouts @control-audit', async ({ page }) => {
  await openRoute(page, 'ch3-7-2');
  let controls = await labControls(page);
  const residual = controls.sliders.find(item => item.key === 'residualScale');
  expect(residual).toBeTruthy();
  await setSlider(page, residual.index, 0);
  await expect.poll(() => readoutValue(page, 'r1')).toBe('0');
  await expect.poll(() => readoutValue(page, 'điểm')).toBe('100');

  controls = await labControls(page);
  await setSlider(page, controls.sliders.find(item => item.key === 'residualScale').index, 2);
  await page.getByRole('button', { name: /Chạy/ }).first().click();
  await expect.poll(async () => Number(await readoutValue(page, 'r1'))).toBeGreaterThan(0);
  await expect.poll(async () => Number(await readoutValue(page, 'điểm'))).toBeLessThan(100);

  await page.getByRole('button', { name: /Dừng/ }).first().click();
  controls = await labControls(page);
  await setSlider(page, controls.sliders.find(item => item.key === 'residualScale').index, 0);
  await expect.poll(() => readoutValue(page, 'r1')).toBe('0');
  await expect.poll(() => readoutValue(page, 'điểm')).toBe('100');
});
