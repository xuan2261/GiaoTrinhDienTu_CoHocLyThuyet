/**
 * Theory-fidelity browser guards (Phase 01 TDD harness).
 *
 * Two RED gates that mount every learner route through index.html and inspect
 * the live DOM the way a student sees it:
 *
 *  1. unit-label guard — every readout card must carry the correct DIMENSION.
 *     Dimension errors are keyed by quantity, never by a blanket "m" regex, so
 *     legitimate m/s and m/s² readouts never trip a false positive.
 *
 *  2. empty-panel guard — a canvas panel border whose only intended content was
 *     suppressed (formula overlay disabled 2026-05-14) leaves an orphan frame.
 *     Detected from structural marks: a `panel` rect with a `dom*Suppressed`
 *     mark inside it and no real canvas content (barGraph) inside.
 *
 * These start RED and turn GREEN as Phases 02-09 land. The overlay flag stays
 * off — the fix is to remove orphan panels, not to re-enable suppressed text.
 */
const { test, expect } = require('@playwright/test');
const { ALL_ROUTES, openRoute, labState } = require('./simulation-test-utils');

// ─── Unit-label guard ─────────────────────────────────────────────────────────

// A readout is a MOMENT/TORQUE if its key or label names a moment. These must
// read in N·m (or N·mm), never in degrees.
const MOMENT_KEY = /(?:^|[^a-z])(?:m_?o|mo|moment|mô\s*men|momen|ngàm|torque|σm|\bm\b)/i;
// A readout that is an angle TANGENT or a pure ratio must be dimensionless.
const TANGENT_KEY = /tan\s*[αa]|tan_alpha|tanalpha/i;
// Area readouts must read in squared length units.
const AREA_KEY = /(?:diện\s*tích|\barea\b|^s$|s\s*lỗ|s_hole|^s_|\bsx\b|\bsy\b)/i;
// Initial angular velocity ω₀ is rad/s, not rad/s².
const OMEGA0_KEY = /(?:ω0|ω₀|omega0|omega_0|vận\s*tốc\s*góc)/i;

const DEGREE_SUFFIX = /(?:°|\bdeg\b|độ)\s*$/i;
const BARE_METRE_SUFFIX = /(?:^|[^²\w])m\s*$/i; // ends in "m" but NOT "m²" / "mm" handled below
const SQUARED_SUFFIX = /(?:m²|mm²|cm²|m\^2|\bm2\b)\s*$/i;
const RAD_PER_S2_SUFFIX = /rad\s*\/\s*s\s*²|rad\/s\^2|rad\/s2/i;

function dimensionViolation(card) {
  const label = `${card.label} ${card.key}`.trim();
  const value = `${card.value}`.trim();
  if (!value) return null;

  // ° on a moment or tangent readout → wrong dimension.
  if ((MOMENT_KEY.test(label) || TANGENT_KEY.test(label)) && DEGREE_SUFFIX.test(value)) {
    return `degree on moment/tangent: "${label}" = "${value}"`;
  }
  // Area readout that ends in bare "m" instead of m².
  if (AREA_KEY.test(label) && BARE_METRE_SUFFIX.test(value) && !SQUARED_SUFFIX.test(value)) {
    return `bare metre on area: "${label}" = "${value}"`;
  }
  // ω₀ tagged as rad/s² (acceleration) instead of rad/s (velocity).
  if (OMEGA0_KEY.test(label) && RAD_PER_S2_SUFFIX.test(value)) {
    return `rad/s² on angular velocity: "${label}" = "${value}"`;
  }
  return null;
}

test('readout cards carry correct physical dimensions (no °/m/rad·s⁻² mislabels)', async ({ page }) => {
  test.setTimeout(240000);
  const failures = [];
  for (const route of ALL_ROUTES) {
    await openRoute(page, route);
    const state = await labState(page);
    for (const card of state.readoutCards) {
      const violation = dimensionViolation(card);
      if (violation) failures.push(`${route}: ${violation}`);
    }
  }
  // RED until Phases 02/04/07 relabel; must stay free of m/s false positives.
  expect(failures, failures.join('\n')).toEqual([]);
});

// ─── Empty-panel guard ──────────────────────────────────────────────────────

function parseMarks(marks) {
  const panels = [];
  const suppressed = [];
  const content = [];
  const ctxDraws = [];
  // Any primitive that draws real diagram content (a body, vector, point, bar,
  // or graph node) counts — a panel framing one of these is NOT an empty box.
  const CONTENT_KINDS = /^(barGraph|body|realisticBody|realisticBeam|realisticPoint|realisticWheel|point|arrow|neonArrow|magnitudeArrow|vectorTriangle|supportTriangle|spring|cable)$/;
  // Raw canvas strokes (curves, plotted lines) are also content; the panel's own
  // border is a single roundRect at its corner, so interior strokes mean a diagram.
  const CTX_DRAW_KINDS = /^ctx-(lineTo|arc|ellipse|bezierCurveTo|quadraticCurveTo)$/;
  for (const raw of marks) {
    const parts = String(raw).split(':');
    const kind = parts[0];
    const nums = parts.slice(1).map(Number);
    if (kind === 'panel' && nums.length >= 4) {
      panels.push({ x: nums[0], y: nums[1], w: nums[2], h: nums[3] });
    } else if (/Suppressed$/.test(kind)) {
      // domMathSuppressed:key:x:y → x,y are last two numeric parts
      const xy = parts.slice(1).map(Number).filter(Number.isFinite);
      if (xy.length >= 2) suppressed.push({ x: xy[xy.length - 2], y: xy[xy.length - 1] });
    } else if (CONTENT_KINDS.test(kind)) {
      const xy = nums.filter(Number.isFinite);
      if (xy.length >= 2) content.push({ x: xy[0], y: xy[1] });
    } else if (CTX_DRAW_KINDS.test(kind)) {
      const xy = nums.filter(Number.isFinite);
      if (xy.length >= 2) ctxDraws.push({ x: xy[0], y: xy[1] });
    }
  }
  return { panels, suppressed, content, ctxDraws };
}

function inside(pt, rect, pad = 6) {
  return pt.x >= rect.x - pad && pt.x <= rect.x + rect.w + pad &&
         pt.y >= rect.y - pad && pt.y <= rect.y + rect.h + pad;
}

// Strict interior: well inside all edges, so the panel's own border strokes
// (drawn by glassPanel at the rect edges/corners) never count as content — only
// a real plotted curve or diagram drawn deep inside the box does.
function insideStrict(pt, rect, inset = 16) {
  return pt.x >= rect.x + inset && pt.x <= rect.x + rect.w - inset &&
         pt.y >= rect.y + inset && pt.y <= rect.y + rect.h - inset;
}

function orphanPanels(marks) {
  const { panels, suppressed, content, ctxDraws } = parseMarks(marks);
  return panels.filter(rect => {
    const hasSuppressed = suppressed.some(pt => inside(pt, rect));
    const hasContent = content.some(pt => inside(pt, rect)) ||
      ctxDraws.some(pt => insideStrict(pt, rect));
    return hasSuppressed && !hasContent;
  });
}

test('no orphan canvas panels (border with only suppressed content)', async ({ page }) => {
  test.setTimeout(240000);
  const failures = [];
  for (const route of ALL_ROUTES) {
    await openRoute(page, route);
    const state = await labState(page);
    const orphans = orphanPanels(state.structuralMarks);
    if (orphans.length) {
      failures.push(`${route}: ${orphans.length} orphan panel(s) ${JSON.stringify(orphans)}`);
    }
  }
  // RED until Phase 08 removes orphan P.panel() calls; flag stays off.
  expect(failures, failures.join('\n')).toEqual([]);
});
