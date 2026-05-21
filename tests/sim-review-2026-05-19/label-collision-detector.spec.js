const { test, expect } = require('@playwright/test');
const { openRoute } = require('../simulation-test-utils');
const { LABEL_COLLISION_ROUTES } = require('../sim-review-2026-05-19-fixtures');

function overlaps(a, b) {
  return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
}

test('sim review target routes have no overlapping overlay labels', async ({ page }) => {
  const failures = [];
  for (const route of LABEL_COLLISION_ROUTES) {
    await openRoute(page, route);
    const snapshot = await page.locator('.sim-container.sim-lab').first().evaluate(lab => ({
      marks: String(lab.getAttribute('data-structural-marks') || '').split('|').filter(Boolean),
    }));
    const labelMarks = snapshot.marks.filter(mark => mark.startsWith('label:'));
    if (!labelMarks.length) {
      failures.push(`${route}: missing label structural marks`);
      continue;
    }
    const boxes = await page.locator('.sim-lab-overlay .sim-overlay-label, .sim-lab-overlay .sim-overlay-panel')
      .evaluateAll(nodes => nodes.map(node => {
        const box = node.getBoundingClientRect();
        return {
          text: (node.textContent || '').trim(),
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
        };
      }).filter(item => item.text));
    for (const mark of labelMarks) {
      const parts = mark.split(':');
      if (parts.length < 4 || !Number.isFinite(Number(parts.at(-2))) || !Number.isFinite(Number(parts.at(-1)))) {
        failures.push(`${route}: malformed label mark ${mark}`);
      }
    }
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        if (overlaps(boxes[i], boxes[j])) failures.push(`${route}: "${boxes[i].text}" overlaps "${boxes[j].text}"`);
      }
    }
  }
  // RED until P07: leader-line/collision strategy removes label overlaps.
  expect(failures).toEqual([]);
});
