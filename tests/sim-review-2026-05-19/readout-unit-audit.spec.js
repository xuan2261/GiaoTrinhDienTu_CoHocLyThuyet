const { test, expect } = require('@playwright/test');
const { ALL_ROUTES, openRoute, labState } = require('../simulation-test-utils');
const { READOUT_UNIT_PATTERN } = require('../sim-review-2026-05-19-fixtures');

const SEMANTIC_VALUE_PATTERN = /^(?:[\p{L}\p{M}\s_]+|v_a = v_e \+ v_r|—|1\/4)$/u;
const MISSING_UNIT_KEY_PATTERN = /(?:time|thời gian|sai số|điểm|score|omega|phi|epsilon|xg|yg|ic|x_c|moment|force|load|mass|speed|velocity|accel|delta|p trước|p sau|Δp|lệch|dịch|hình chiếu|đường trục|rx\/ry|ΣM|S lỗ|r1|x1|x2)/i;
const RAW_NUMERIC_PATTERN = /^-?\d+(?:[.,]\d+)?$/;
const DIMENSIONLESS_LABEL_PATTERN = /^(?:μ|mu|tan α|tan alpha|e)$/i;

test('sim review readout cards declare learner-facing units or semantic labels', async ({ page }) => {
  test.setTimeout(180000);
  const failures = [];
  for (const route of ALL_ROUTES) {
    await openRoute(page, route);
    const state = await labState(page);
    for (const card of state.readoutCards) {
      const text = `${card.value}`.trim();
      const label = `${card.label} ${card.key}`.trim();
      if (DIMENSIONLESS_LABEL_PATTERN.test(`${card.label}`.trim())) continue;
      const semantic = SEMANTIC_VALUE_PATTERN.test(text) && !RAW_NUMERIC_PATTERN.test(text);
      const bareCoordinate = /^\(?-?\d+(?:\.\d+)?\s*;\s*-?\d+(?:\.\d+)?\)?$/.test(text);
      const rawNumberNeedsUnit = RAW_NUMERIC_PATTERN.test(text) && MISSING_UNIT_KEY_PATTERN.test(label);
      const rawDiscreteNumber = RAW_NUMERIC_PATTERN.test(text) && /loại liên kết|bài toán|bước giải|problem|type/i.test(label);
      const pixelValue = /\bpx\b/i.test(text);
      if (pixelValue || bareCoordinate || rawNumberNeedsUnit || rawDiscreteNumber || (!semantic && !READOUT_UNIT_PATTERN.test(text))) {
        // RED until P05: all numeric readouts need units; discrete controls need mapped labels.
        failures.push(`${route} ${card.label || card.key}: "${text}"`);
      }
    }
  }
  expect(failures).toEqual([]);
});
