const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const fileUrl = name => `file:///${path.join(ROOT, `prototypes/media/${name}`).replace(/\\/g, '/')}`;

async function openOffline(page, name) {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(fileUrl(name), { waitUntil: 'domcontentloaded' });
  expect(requests.filter(url => !url.startsWith('file:') && !url.startsWith('data:'))).toEqual([]);
}

test.describe('Chapter 1 media pilot over file protocol', () => {
  test('force animation is opt-in and preserves a usable static switch', async ({ page }) => {
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(fileUrl('force-sliding.html'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveAttribute('data-media-mode', 'static');
    expect(requests.some(url => url.endsWith('/assets/gifs/ch1/hinh-1-06.gif'))).toBe(false);
    await page.locator('[data-force-retry]').click();
    await expect(page.locator('body')).toHaveAttribute('data-media-mode', 'interactive');
    await expect(page.locator('[data-animated-image]')).toBeVisible();
    await expect.poll(() => page.locator('[data-animated-image]').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    await page.locator('[data-force-static]').click();
    await expect(page.locator('[data-static-fallback]')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-media-mode', 'static');
    await expect(page.getByText('Bản mô tả theo thời gian')).toBeVisible();
  });

  test('force animation uses poster for reduced motion before requesting GIF', async ({ page }) => {
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fileUrl('force-sliding.html'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-static-fallback]')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-media-mode', 'static');
    expect(requests.some(url => url.endsWith('/assets/gifs/ch1/hinh-1-06.gif'))).toBe(false);
  });

  test('failed animated load keeps the poster and accessible error status', async ({ page }) => {
    await page.route('**/hinh-1-06.gif', route => route.abort());
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(fileUrl('force-sliding.html'), { waitUntil: 'domcontentloaded' });
    await page.locator('[data-force-retry]').click();
    await expect(page.locator('[data-static-fallback]')).toBeVisible();
    await expect(page.locator('[data-media-status]')).toHaveAttribute('data-tone', 'error');
    await expect(page.locator('[data-media-status]')).toContainText('poster tĩnh');
  });

  test('resultant chart responds to keyboard and exposes equivalent table values', async ({ page }) => {
    await openOffline(page, 'resultant-angle-chart.html');
    await expect(page.locator('[data-resultant-chart]')).toBeVisible();
    await expect(page.locator('#bang-gia-tri')).toBeVisible();
    const slider = page.locator('[data-angle-control]');
    await slider.focus();
    await slider.press('End');
    await expect(page.locator('#angle-output')).toHaveText('180°');
    await expect(page.locator('#resultant-output')).toHaveText('R = 20.0 N');
    await expect(slider).toHaveAttribute('aria-valuetext', /180 độ, hợp lực 20\.0 newton/);
    await slider.press('Home');
    await expect(page.locator('#resultant-output')).toHaveText('R = 140.0 N');
  });

  test('friction prototype mounts canonical Sim2 and crosses the slip boundary', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openOffline(page, 'friction-cone-sim2.html');
    await expect(page.locator('#friction-sim .sim2-root')).toHaveCount(1);
    await expect(page.locator('#friction-sim input[type="range"]')).toHaveCount(2);
    await expect(page.locator('#friction-sim .sim2-handle')).toHaveAttribute('tabindex', '0');
    const beta = page.locator('#friction-sim input[data-id="beta"]');
    await beta.focus();
    await beta.press('End');
    await expect(page.locator('#friction-sim .sim2-readout-row').filter({ hasText: 'Trạng thái:' })).toContainText('trượt');
    await expect(page.locator('#phuong-an-tinh')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('centroid reasoning supports step buttons and arrow, Home, and End keys', async ({ page }) => {
    await openOffline(page, 'centroid-reasoning.html');
    const region = page.locator('[data-centroid-keyboard]');
    await region.focus();
    await region.press('End');
    await expect(page.locator('[data-centroid-formula]')).toContainText('C = (2.77; 1.92) cm');
    await expect(page.locator('[data-centroid-mark]')).toBeVisible();
    await expect(page.locator('[data-step-next]')).toBeDisabled();
    await region.press('Home');
    await expect(page.locator('[data-centroid-formula]')).toContainText('A₁ = 6 × 4');
    await expect(page.locator('[data-centroid-mark]')).toBeHidden();
    await page.locator('[data-step-next]').click();
    await expect(page.locator('[data-step="1"]')).toHaveAttribute('aria-current', 'step');
  });

  for (const name of ['force-sliding.html', 'resultant-angle-chart.html', 'friction-cone-sim2.html', 'centroid-reasoning.html']) {
    test(`${name} reflows at 375 CSS pixels without horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 760 });
      await openOffline(page, name);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const shortButton = await page.locator('button:visible').evaluateAll(buttons => buttons.some(button => button.getBoundingClientRect().height < 44));
      expect(shortButton).toBe(false);
    });
  }
});
