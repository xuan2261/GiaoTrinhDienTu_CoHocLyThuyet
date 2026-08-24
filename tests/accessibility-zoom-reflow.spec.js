const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

async function openRoute(page, route, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(`${INDEX}#${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(expected => location.hash === `#${expected}`, route);
}

async function expectNoPageOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(metrics.scrollWidth, `${label}: document overflow`).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.bodyScrollWidth, `${label}: body overflow`).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function expectOwnedRegionsInsideViewport(page, selectors, label) {
  const clipped = await page.locator(selectors.join(',')).evaluateAll((nodes) => {
    const width = document.documentElement.clientWidth;
    return nodes.filter(node => {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = node.getBoundingClientRect();
      return rect.left < -1 || rect.right > width + 1;
    }).map(node => `${node.tagName}.${node.className}`);
  });
  expect(clipped, `${label}: owned regions clipped`).toEqual([]);
}

async function expectMinimumTargets(page, selector, label) {
  const small = await page.locator(selector).evaluateAll(nodes => nodes.filter(node => {
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = node.getBoundingClientRect();
    return rect.width < 24 || rect.height < 24;
  }).map(node => ({ name: node.getAttribute('aria-label') || node.textContent.trim(), box: node.getBoundingClientRect().toJSON() })));
  expect(small, `${label}: WCAG 2.5.8 minimum target`).toEqual([]);
}

test.describe('Phase 8 200% and 400% equivalent reflow contracts', () => {
  test('shell and search reflow at 200% desktop equivalent', async ({ page }) => {
    await openRoute(page, 'home', { width: 640, height: 720 });
    await page.getByRole('combobox', { name: 'Tìm kiếm trong giáo trình' }).fill('chuyển động');
    await expectNoPageOverflow(page, 'shell at 200%');
    await expectOwnedRegionsInsideViewport(page, ['.topbar', '.search', '#main-content', '#sr'], 'shell at 200%');
    await expectMinimumTargets(page, '.topbar button:visible', 'shell at 200%');
  });

  test('shell, quiz, and simulation reflow at 400% narrow equivalent', async ({ page }) => {
    await openRoute(page, 'ch3-quiz', { width: 320, height: 640 });
    await page.waitForSelector('#quiz-ch3 .q-card');
    await expectNoPageOverflow(page, 'quiz at 400%');
    await expectOwnedRegionsInsideViewport(page, ['.topbar', '#main-content', '.quiz-header', '.q-card'], 'quiz at 400%');

    await openRoute(page, 'ch1-1-3', { width: 320, height: 640 });
    await page.waitForSelector('.sim2-controls input[type="range"]');
    await expectNoPageOverflow(page, 'Sim2 at 400%');
    await expectOwnedRegionsInsideViewport(page, ['.topbar', '#main-content', '.sim-mount', '.sim2-controls'], 'Sim2 at 400%');
    await expectMinimumTargets(page, '.sim2-controls button:visible, .sim2-controls input[type="range"]:visible', 'Sim2 at 400%');
  });

  test('PDF chrome wraps at 400% narrow equivalent while the page viewport remains independently scrollable', async ({ page }) => {
    await openRoute(page, 'home', { width: 320, height: 640 });
    await page.getByRole('button', { name: 'Xem bản PDF' }).click();
    await expect(page.getByRole('dialog', { name: /Bản PDF/i })).toBeVisible();
    await expectNoPageOverflow(page, 'PDF at 400%');
    await expectOwnedRegionsInsideViewport(page, ['.pdf-viewer-header', '.pdf-viewer-toolbar', '.pdf-viewer-control-group'], 'PDF at 400%');
    await expectMinimumTargets(page, '.pdf-viewer-button:visible, .pdf-viewer-dialog input:visible', 'PDF at 400%');
  });

  test('mobile landscape keeps the menu operable without horizontal clipping', async ({ page }) => {
    await openRoute(page, 'home', { width: 667, height: 375 });
    const menu = page.getByRole('button', { name: 'Mở mục lục' });
    await menu.click();
    await expect(page.getByRole('navigation', { name: 'Mục lục giáo trình' })).toBeVisible();
    await expectNoPageOverflow(page, 'mobile landscape');
    await expectOwnedRegionsInsideViewport(page, ['.topbar', '#sb', '#main-content'], 'mobile landscape');
  });

  test('reduced-motion preference removes nonessential shell and simulation motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openRoute(page, 'ch1-1-3', { width: 1280, height: 720 });
    await page.waitForSelector('.sim2-handle');
    const motion = await page.evaluate(() => {
      const topbar = getComputedStyle(document.querySelector('.topbar'));
      const handle = getComputedStyle(document.querySelector('.sim2-handle'));
      return {
        topbarTransition: topbar.transitionDuration,
        handleTransition: handle.transitionDuration,
        handleAnimation: handle.animationName,
      };
    });
    expect(motion.topbarTransition).toBe('0s');
    expect(motion.handleTransition).toBe('0s');
    expect(motion.handleAnimation).toBe('none');
  });
});
