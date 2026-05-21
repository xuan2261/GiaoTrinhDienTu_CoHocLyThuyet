const { test, expect } = require('@playwright/test');
const { openRoute, labState } = require('../simulation-test-utils');
const { REDESIGN_ROUTES, REDESIGN_EXPECTED_MARKS } = require('../sim-review-2026-05-19-fixtures');

test('sim review redesign target routes expose route-specific structural marks', async ({ page }) => {
  const failures = [];
  for (const route of REDESIGN_ROUTES) {
    await openRoute(page, route);
    const state = await labState(page);
    const surface = `${state.structuralMarks.join('|')}|${state.visibleText}`;
    for (const pattern of REDESIGN_EXPECTED_MARKS[route] || []) {
      if (!pattern.test(surface)) failures.push(`${route}: missing ${pattern}`);
    }
  }
  // RED until P09/P10/P11 redesign the listed routes.
  expect(failures).toEqual([]);
});
