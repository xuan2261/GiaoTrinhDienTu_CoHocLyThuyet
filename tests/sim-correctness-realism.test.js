// Node-level static/source-shape assertions for the simulation correctness/realism overhaul.
// RED on master HEAD; each suite turns GREEN after its referenced phase.
//
// Run: node --test tests/sim-correctness-realism.test.js
// Tags (in test names): @rc1-source @rc4-source @rc5-source @rc3-spring @rc3-rim
//                        @rc3-arrow @rc3-wheel @a11y-source

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const fx = require('./sim-correctness-realism-fixtures');

const labSource = fs.readFileSync(fx.SRC.professionalLab, 'utf8');
const primitivesSource = fs.readFileSync(fx.SRC.primitives, 'utf8');
const animationSource = fs.existsSync(fx.SRC.animationEngine)
  ? fs.readFileSync(fx.SRC.animationEngine, 'utf8')
  : '';

// Extract isShortOverlayLabel regex source from primitives file.
function extractWhitelistRegex(source) {
  const match = source.match(/function\s+isShortOverlayLabel\s*\([^)]*\)\s*\{[\s\S]*?return\s+(\/[^/]+\/[a-z]*)\s*\.test/);
  if (!match) return null;
  // eslint-disable-next-line no-new-func
  return new RegExp(match[1].slice(1, match[1].lastIndexOf('/')), match[1].split('/').pop());
}

// ---------- @rc1-source: legacy handle fallback presence -----------------
test('@rc1-source legacyHandles fallback removed (Phase 02)', () => {
  // RED: legacyHandles function present and called from resolveHandles.
  // GREEN after Phase 02: function body either removed or throws fail-loud.
  const hasLegacyDecl = /function\s+legacyHandles\s*\(/.test(labSource);
  const callsLegacyFallback = /handles\.length\s*\?\s*handles\s*:\s*legacyHandles\s*\(/.test(labSource);
  assert.equal(
    hasLegacyDecl && callsLegacyFallback, false,
    'legacyHandles fallback must be removed; routes must own handles or throw'
  );
});

test('@rc1-source ch1Handles covers RC1 routes with explicit handle id (Phase 02)', () => {
  // RED: ch1-2-3 handle id is "parallelogram-f2", but ch1-1-3 / ch1-2-1 fall through
  //     to a generic `${routeId}-construction` handle that ignores the body anchor.
  //     We assert that EVERY RC1 route has its own conditional branch in ch1Handles().
  const ch1HandlesBlock = labSource.slice(
    labSource.indexOf('function ch1Handles'),
    labSource.indexOf('function ch2Handles')
  );
  for (const route of fx.RC1_ROUTES.filter(r => r.startsWith('ch1-'))) {
    const hasOwnBranch = new RegExp(`routeId\\s*===\\s*['"]${route}['"]`).test(ch1HandlesBlock);
    assert.equal(hasOwnBranch, true, `${route} must have explicit handle branch (no generic fallback)`);
  }
});

// ---------- @rc4-source: spring/cable share body anchor ------------------
test('@rc4-source spring/cable renderer accepts explicit anchor (Phase 03)', () => {
  // RED: spring(ctx, x1, y1, x2, y2, options) takes raw coords. Phase 03 adds
  //      either a getAnchor() coupling or an `options.anchor` parameter so that
  //      the base point is computed from the same source as the body.
  // We allow either: (a) an explicit `getAnchor` API exported from primitives,
  // or (b) options object documents `anchor`/`anchorRef`.
  const exportsGetAnchor = /window\.SimRouteRendererPrimitives\s*=\s*\{[\s\S]*?\bgetAnchor\b/.test(primitivesSource);
  const springAcceptsAnchor = /function\s+spring\s*\([\s\S]*?options\)[\s\S]*?(anchor|anchorRef)/.test(primitivesSource);
  assert.equal(
    exportsGetAnchor || springAcceptsAnchor, true,
    'Phase 03 must expose getAnchor() or accept anchor option in spring()/cable()'
  );
});

// ---------- @rc5-source: overlay-label whitelist breadth ------------------
test('@rc5-source whitelist accepts physics labels and short Vietnamese terms (Phase 04)', () => {
  const whitelist = extractWhitelistRegex(primitivesSource);
  assert.ok(whitelist, 'isShortOverlayLabel regex must be parseable');
  const rejected = fx.RC5_LABEL_SAMPLES.filter(label => !whitelist.test(label));
  // RED: rejected.length > 0 (M_O, F_x, v_a, tĩnh, cân, ... all fail).
  // GREEN after Phase 04: rejected.length === 0.
  assert.equal(
    rejected.length, 0,
    `whitelist rejects physics labels; failing samples: ${rejected.join(', ')}`
  );
});

// ---------- @rc3-spring: sinusoidal helix replaces zigzag ----------------
test('@rc3-spring primitive renders sinusoidal helix not zigzag (Phase 05)', () => {
  const springBody = primitivesSource.slice(
    primitivesSource.indexOf('function spring'),
    primitivesSource.indexOf('function cable')
  );
  // RED: contains zigzag pattern `i % 4 === 1` and lacks Math.sin().
  // GREEN: contains Math.sin() / Math.cos() driving the offset.
  const usesZigzag = /i\s*%\s*4\s*===\s*1/.test(springBody);
  const usesSinusoidal = /Math\.(sin|cos)\s*\(/.test(springBody);
  assert.equal(usesZigzag, false, 'spring() must not use zigzag (i % 4 === 1) anymore');
  assert.equal(usesSinusoidal, true, 'spring() must use Math.sin/cos for sinusoidal helix');
});

// ---------- @rc3-rim: realisticBody emits rim + AO marks -----------------
test('@rc3-rim realisticBody adds rim highlight and ambient occlusion (Phase 06)', () => {
  const bodyBlock = primitivesSource.slice(
    primitivesSource.indexOf('function realisticBody'),
    primitivesSource.indexOf('function realisticBeam')
  );
  // RED: realisticBody just delegates to body() with shadow=true; no rim/AO marks.
  // GREEN after Phase 06: explicit `mark('rim', ...)` and `mark('ao', ...)`
  const hasRimMark = /mark\(\s*['"]rim['"]/.test(bodyBlock);
  const hasAoMark = /mark\(\s*['"]ao['"]/.test(bodyBlock);
  assert.equal(hasRimMark, true, 'realisticBody must emit rim mark');
  assert.equal(hasAoMark, true, 'realisticBody must emit ao mark');
});

// ---------- @rc3-arrow: length-only magnitude scaling --------------------
test('@rc3-arrow magnitude arrow scales length only, no shadowBlur (Phase 06)', () => {
  // arrow() in primitives delegates to SimCore.drawArrow with fixed lineWidth=2.4.
  // Phase 06 introduces a `magnitudeArrow(ctx, ...)` (or arrow with `magnitude`)
  // that scales **length only** (lineWidth fixed 2.5px, no shadowBlur).
  const hasMagnitudeFn = /\bmagnitudeArrow\b|magnitude\s*:\s*[^,)]+/.test(primitivesSource);
  // shadowBlur must NOT appear inside the magnitudeArrow / arrow body.
  const arrowSlice = primitivesSource.slice(
    primitivesSource.indexOf('function arrow('),
    primitivesSource.indexOf('function supportTriangle')
  );
  const arrowHasShadowBlur = /shadowBlur/.test(arrowSlice);
  assert.equal(hasMagnitudeFn, true, 'Phase 06 must add magnitudeArrow or magnitude option');
  assert.equal(arrowHasShadowBlur, false, 'arrow path must not set shadowBlur (perf + clarity)');
});

// ---------- @rc3-wheel: rim shine + pattern cache ------------------------
test('@rc3-wheel realisticWheel emits specular shine arc (Phase 07)', () => {
  const wheelBlock = primitivesSource.slice(
    primitivesSource.indexOf('function realisticWheel'),
    primitivesSource.indexOf('function point(')
  );
  // RED: no `shine` or `specular` mark in realisticWheel.
  const hasShineMark = /mark\(\s*['"](shine|specular)['"]/.test(wheelBlock);
  assert.equal(hasShineMark, true, 'realisticWheel must emit shine/specular mark');
});

test('@rc3-wheel pattern cache exposes hit/miss tracker (Phase 07)', () => {
  const helpersSource = fs.readFileSync(fx.SRC.visualHelpers, 'utf8');
  // RED: SimVisualHelpers.patternCache or .__patternCacheStats not exported.
  const hasCache = /patternCache|__patternCacheStats|patternCacheStats/.test(helpersSource);
  assert.equal(hasCache, true, 'sim-visual-helpers must export pattern cache stats hook');
});

// ---------- @a11y-source: ARIA + reduced-motion source markers -----------
test('@a11y-source matchMedia(prefers-reduced-motion) consulted (Phase 08b)', () => {
  // RED: animation engine never reads prefers-reduced-motion.
  const consultsReducedMotion = /prefers-reduced-motion/.test(animationSource)
    || /prefers-reduced-motion/.test(labSource);
  assert.equal(consultsReducedMotion, true, 'engine must honor prefers-reduced-motion');
});

test('@a11y-source sim-handle-a11y overlay class declared (Phase 08b)', () => {
  // RED: lab source has no `sim-handle-a11y` overlay creation.
  const hasA11yOverlay = /sim-handle-a11y/.test(labSource);
  assert.equal(hasA11yOverlay, true, 'lab must create sim-handle-a11y ARIA button overlay');
});

test('@a11y-source aria-live region declared (Phase 08b)', () => {
  const hasLive = /sim-aria-live|aria-live\s*=\s*["']polite["']/.test(labSource);
  assert.equal(hasLive, true, 'lab must declare aria-live region for announcements');
});
