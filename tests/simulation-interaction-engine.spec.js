const { test, expect } = require('@playwright/test');

const {
  ALL_ROUTES,
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

for (const route of ['ch2-5-2', 'ch3-3-1']) {
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

test('animated route opens paused and drag pauses running animation @animation', async ({ page }) => {
  await openRoute(page, 'ch3-3-1');
  const playButton = page.getByRole('button', { name: /Chạy/ }).first();
  await expect(playButton).toBeVisible();
  await expect(page.locator('.sim-lab-status')).toContainText('tương tác trực tiếp');
  await playButton.click();
  await expect(page.getByRole('button', { name: /Dừng/ }).first()).toBeVisible();
  await expect(page.locator('.sim-lab-status')).toContainText('đang chạy');
  const start = await firstHandlePoint(page);
  expect(start).not.toBeNull();
  await dragCanvasPoint(page, start, dragTarget(start));
  await expect(page.getByRole('button', { name: /Chạy/ }).first()).toBeVisible();
  await expect(page.locator('.sim-lab-status')).toContainText('đã tạm dừng');
});
