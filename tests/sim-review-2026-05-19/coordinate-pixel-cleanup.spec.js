const { test, expect } = require('@playwright/test');
const { openRoute, labState } = require('../simulation-test-utils');
const { COORDINATE_CLEANUP_ROUTES } = require('../sim-review-2026-05-19-fixtures');

const COORD_KEYS = /(xG|yG|IC|x_C|Điểm đặt|diem dat|tọa độ|toa do)/i;

test('sim review coordinate readouts avoid raw pixel-space values', async ({ page }) => {
  const failures = [];
  for (const route of COORDINATE_CLEANUP_ROUTES) {
    await openRoute(page, route);
    const state = await labState(page);
    for (const card of state.readoutCards) {
      const label = `${card.label} ${card.key}`;
      if (!COORD_KEYS.test(label)) continue;
      const value = `${card.value}`;
      // RED until P08: meaningful coordinates use metres; auxiliary pixel points are removed.
      if (/Điểm đặt|diem dat/i.test(label)) {
        failures.push(`${route} ${card.label}: auxiliary point readout must be removed`);
      } else if (!/\bm\b$/.test(value) || /\bpx\b/i.test(value) || /^\(?\d{2,3}\s*;\s*\d{2,3}\)?$/.test(value)) {
        failures.push(`${route} ${card.label}: "${value}"`);
      }
    }
  }
  expect(failures).toEqual([]);
});
