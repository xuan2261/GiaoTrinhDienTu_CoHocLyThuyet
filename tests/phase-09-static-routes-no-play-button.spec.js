/**
 * Phase 09 → Phase 03 — concept-only routes have no Play affordance.
 *
 * Mounts each of the 7 static-concept routes via the index.html shell and
 * asserts:
 *   - `[data-sim-play]` attribute returns null;
 *   - no button renders text containing "▶ Chạy" or "⏸ Dừng";
 *   - reset button is still present and clickable;
 *   - no orphan `aria-pressed` attributes remain on static controls;
 *   - canvas aria-label opens with "Sơ đồ tĩnh của …".
 *
 * Positive control (`ch3-2-2`) ensures the selector still matches on routes
 * that *do* render Play.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const { firstHandlePoint, dragCanvasPoint, dragTarget } = require('./simulation-test-utils');

const STATIC_ROUTES = ['ch3-1-3', 'ch3-2-3', 'ch3-2-5', 'ch3-4-1', 'ch3-6-3', 'ch3-7-1', 'ch2-7-2'];
const ANIMATED_CONTROL = 'ch3-2-2';

const ROOT = path.resolve(__dirname, '..');
const FILE_INDEX_URL = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

async function sceneTitle(page) {
  const text = await page.locator('#content-area .sim-title').first().textContent();
  return String(text || '')
    .replace(/^Mô phỏng\s+/i, '')
    .replace(/^ch\d+-\d+-\d+\s*-\s*/i, '')
    .trim();
}

async function canvasLabel(page) {
  return page.$eval('#content-area canvas', canvas => canvas.getAttribute('aria-label') || '');
}

async function engineTime(page) {
  return page.locator('#content-area .sim-container.sim-lab').first().evaluate(lab => {
    const value = Number(lab.dataset.engineTime);
    return Number.isFinite(value) ? value : null;
  });
}

test.describe('Phase 09 — static concept routes have no Play button', () => {
  test('positive control ch3-2-2 still renders Play', async ({ page }) => {
    await page.goto(`${FILE_INDEX_URL}#${ANIMATED_CONTROL}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      expected => window.location.hash.replace('#', '') === expected,
      ANIMATED_CONTROL,
      { timeout: 8000 }
    );
    await page.waitForSelector('#content-area canvas', { timeout: 8000 });
    const playAttr = await page.$('#content-area [data-sim-play]');
    expect(playAttr).not.toBeNull();
    const playByText = await page
      .locator('#content-area button', { hasText: '▶ Chạy' })
      .count();
    expect(playByText).toBeGreaterThanOrEqual(1);
    await expect.poll(() => canvasLabel(page)).toBe(`Khu vực mô phỏng động: ${await sceneTitle(page)}`);
  });

  for (const routeId of STATIC_ROUTES) {
    test(`${routeId} suppresses the Play button`, async ({ page }) => {
      await page.goto(`${FILE_INDEX_URL}#${routeId}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        expected => window.location.hash.replace('#', '') === expected,
        routeId,
        { timeout: 8000 }
      );
      await page.waitForSelector('#content-area canvas', { timeout: 8000 });

      const playAttr = await page.$('#content-area [data-sim-play]');
      expect(playAttr, `${routeId}: data-sim-play must NOT exist`).toBeNull();

      const playByText = await page
        .locator('#content-area button', { hasText: /^[▶⏸]\s*(Chạy|Dừng)/ })
        .count();
      expect(playByText, `${routeId}: must not render a Play/Pause button`).toBe(0);

      const orphanPressed = await page
        .locator('#content-area .sim-controls [aria-pressed]')
        .count();
      expect(orphanPressed, `${routeId}: static controls must not keep orphan aria-pressed`).toBe(0);

      const resetByText = await page
        .locator('#content-area button', { hasText: /Đặt lại/ })
        .count();
      expect(resetByText, `${routeId}: Reset button must still be present`).toBe(1);

      const expectedLabel = `Sơ đồ tĩnh của ${await sceneTitle(page)}`;
      await expect.poll(() => canvasLabel(page)).toBe(expectedLabel);
    });
  }

  test('static tickWithoutButton route keeps silent ticks after drag', async ({ page }) => {
    await page.goto(`${FILE_INDEX_URL}#ch3-1-3`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#content-area canvas', { timeout: 8000 });
    await expect.poll(() => engineTime(page)).not.toBeNull();
    const before = await engineTime(page);
    const start = await firstHandlePoint(page);
    expect(start).not.toBeNull();

    await dragCanvasPoint(page, start, dragTarget(start));
    await page.waitForTimeout(350);

    await expect.poll(() => engineTime(page)).toBeGreaterThan(before);
    await expect(page.locator('#content-area [data-sim-play]')).toHaveCount(0);
    await expect(page.locator('#content-area .sim-lab-status')).not.toContainText('đã tạm dừng');
  });
});
