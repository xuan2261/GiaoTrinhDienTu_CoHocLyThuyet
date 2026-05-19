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

test('@a11y-source readout smoothing honors prefersReducedMotion (Phase 08b)', () => {
  const hasSmoothingGate = /lab\.prefersReducedMotion\s*\?\s*1\s*:\s*0\.15|prefersReducedMotion[^?]*\?[^:]*1[^:]*:[^,]*0\.15/.test(labSource);
  assert.equal(hasSmoothingGate, true, 'state-readout lerp must snap to target when reduced-motion is set');
});

test('@a11y-source aria-live announcement carries coordinates (Phase 08b)', () => {
  const carriesCoords = /tới\s+x=\$\{[^}]+\},\s*y=\$\{/.test(labSource);
  assert.equal(carriesCoords, true, 'aria-live announcement must include current x/y on keyboard nudge');
});

test('@a11y-source aria-live announcement is debounced (Phase 08b)', () => {
  const debounced = /setTimeout\([\s\S]{0,200}live\.textContent/.test(labSource)
    || /clearTimeout\([\s\S]{0,200}liveTimer/.test(labSource);
  assert.equal(debounced, true, 'aria-live writes must be debounced (≥1 setTimeout/clearTimeout pair around live.textContent)');
});

// ---------- @rc2-impulse-flash: Phase 08 ------------------------------------
const path = require('node:path');
const ch3CollisionBehaviors = fs.readFileSync(
  path.join(fx.ROOT, 'js', 'sims', 'ch3', 'ch3-dynamics-theorem-collision-behaviors.js'), 'utf8');
const ch3CollisionRenderers = fs.readFileSync(
  path.join(fx.ROOT, 'js', 'sims', 'ch3', 'ch3-collision-exercises-renderers.js'), 'utf8');

test('@rc2-impulse-flash ch3-6-2 behavior writes impulseFlash on collision (Phase 08)', () => {
  const writesFlash = /state\.impulseFlash\s*=/.test(ch3CollisionBehaviors);
  assert.equal(writesFlash, true, 'onTick_ch362 must stash impulseFlash for renderer to consume');
});

test('@rc2-impulse-flash ch3-6-2 renderer emits two impulseArrow marks (Phase 08)', () => {
  const matches = ch3CollisionRenderers.match(/P\.mark\(['"]impulseArrow['"]/g) || [];
  assert.ok(matches.length >= 2,
    `renderCh362Collision2D must emit at least 2 impulseArrow marks (Newton-3); got ${matches.length}`);
});

test('@rc2-impulse-flash ch3-6-2 behavior drops emitCollisionSparks (Phase 08 plan)', () => {
  const stillEmitsSparks = /emitCollisionSparks\s*\(/.test(ch3CollisionBehaviors);
  assert.equal(stillEmitsSparks, false,
    'spark/particle decoration misleads Newton-3 pedagogy — must be removed from ch3-6-2');
});

// ---------- @rc2-preset-gallery: Phase 08 -----------------------------------
const ch1ForceLawScenes = fs.readFileSync(
  path.join(fx.ROOT, 'js', 'sims', 'ch1', 'ch1-force-law-scenes.js'), 'utf8');

for (const route of fx.RC2_PRESET_ROUTES) {
  test(`@rc2-preset-gallery scene declares presets for ${route} (Phase 08)`, () => {
    const re = new RegExp(`routeId:\\s*['"]${route}['"][\\s\\S]{0,1200}?presets:\\s*\\[`);
    assert.match(ch1ForceLawScenes, re,
      `scene for ${route} must declare a presets:[…] array following routeId`);
  });
}

test('@rc2-preset-gallery lab wires sim-preset-button gallery (Phase 08)', () => {
  const wires = /sim-preset-button/.test(labSource)
    && /data-preset/.test(labSource);
  assert.equal(wires, true,
    'lab must render preset buttons with class sim-preset-button and data-preset attribute');
});

// ---------- @rc6-palette: theme-aware palette unification (Phase 08) -------
const coreSource = fs.readFileSync(
  path.join(fx.ROOT, 'js', 'sim-core.js'), 'utf8');
const ch1ForceLawRenderers = fs.readFileSync(
  path.join(fx.ROOT, 'js', 'sims', 'ch1', 'ch1-force-law-renderers.js'), 'utf8');

test('@rc6-palette SimCore exposes color(key) theme-aware helper (Phase 08)', () => {
  const definesHelper = /function\s+color\s*\(/.test(coreSource);
  const exportsHelper = /window\.SimCore\s*=\s*\{[\s\S]*?\bcolor\b/.test(coreSource);
  assert.equal(definesHelper && exportsHelper, true,
    'SimCore must define and export color(key) helper for theme-aware palette lookup');
});

test('@rc6-palette SimCore palette includes impulse key with theme variants (Phase 08)', () => {
  const hasImpulse = /\bimpulse\s*:/.test(coreSource);
  const hasThemeVariants = /\bdark\s*:\s*['"]#[0-9a-fA-F]{3,6}['"]\s*,\s*light\s*:/.test(coreSource);
  assert.equal(hasImpulse, true, 'SimCore palette must include impulse key for ch3-6-2 collision flash');
  assert.equal(hasThemeVariants, true, 'SimCore palette must declare per-key dark/light variants');
});

test('@rc6-palette primitives.palette no longer holds hardcoded hex array (Phase 08)', () => {
  // RED: const palette = ['#dc3545', '#0d6efd', ...]
  // GREEN: palette resolves through SimCore.color (function form, getter, or runtime build).
  const stillHasHardcodedPalette = /const\s+palette\s*=\s*\[\s*['"]#[0-9a-fA-F]{6}/.test(primitivesSource);
  assert.equal(stillHasHardcodedPalette, false,
    'primitives.palette must resolve through SimCore.color(), not a hardcoded hex array');
});

test('@rc6-palette ch1 PARA_COLORS no longer hardcodes hex literals (Phase 08)', () => {
  // RED: const PARA_COLORS = { f1: '#e74c3c', f2: '#2980b9', r: '#27ae60' };
  // GREEN: PARA_COLORS uses getters that delegate to SimCore.color().
  const stillHasHardcodedPara = /PARA_COLORS\s*=\s*\{\s*f1\s*:\s*['"]#[0-9a-fA-F]{6}/.test(ch1ForceLawRenderers);
  assert.equal(stillHasHardcodedPara, false,
    'PARA_COLORS must reference SimCore.color() instead of hardcoded hex literals');
});

// ---------- @rc2-trail: trajectory ring buffer for ch2-1-1 (Phase 08) ------
const ch2KinematicsBehaviorsA = fs.readFileSync(
  path.join(fx.ROOT, 'js', 'sims', 'ch2', 'ch2-kinematics-behaviors-a.js'), 'utf8');
const ch2TrajectoryRenderers = fs.readFileSync(
  path.join(fx.ROOT, 'js', 'sims', 'ch2', 'ch2-trajectory-graph-renderers.js'), 'utf8');

test('@rc2-trail ch2-1-1 behavior pushes points into trailBuffer ring (Phase 08)', () => {
  // GREEN: onTick (or trajectory updater) pushes {x, y} into state.trailBuffer with shift cap.
  const pushesBuffer = /state\.trailBuffer/.test(ch2KinematicsBehaviorsA)
    && /trailBuffer\.push\s*\(/.test(ch2KinematicsBehaviorsA);
  const capsBuffer = /trailBuffer\.shift\s*\(\)|trailBuffer\.length\s*[<>]=?\s*\d+/.test(ch2KinematicsBehaviorsA);
  assert.equal(pushesBuffer, true, 'ch2-1-1 onTick must push to state.trailBuffer');
  assert.equal(capsBuffer, true, 'state.trailBuffer must be capped (shift or length guard)');
});

test('@rc2-trail ch2-1-1 renderer draws fading trail from buffer (Phase 08)', () => {
  // GREEN: renderer iterates state.trailBuffer with alpha decay.
  const readsBuffer = /state\.trailBuffer/.test(ch2TrajectoryRenderers);
  const fadesAlpha = /globalAlpha|rgba\s*\(/.test(ch2TrajectoryRenderers);
  assert.equal(readsBuffer, true, 'ch2-1-1 renderer must read state.trailBuffer');
  assert.equal(fadesAlpha, true, 'trail render must use alpha decay (rgba or globalAlpha)');
});

// ---------- @rc2-autoplay: ch3-3-1 spring oscillation default-on (Phase 08) -
const ch3DynamicsScenes = fs.readFileSync(
  path.join(fx.ROOT, 'js', 'sims', 'ch3', 'ch3-dynamics-all-18-scenes.js'), 'utf8');

test('@rc2-autoplay ch3-3-1 scene declares autoplay flag (Phase 08)', () => {
  // GREEN: scene factory sets autoplay: true on ch3-3-1.
  const declaresAutoplay = /['"]ch3-3-1['"][\s\S]{0,2400}?autoplay\s*:\s*true/.test(ch3DynamicsScenes)
    || /autoplay\s*:\s*\(?routeId\s*===\s*['"]ch3-3-1['"]/.test(ch3DynamicsScenes)
    || /routeId\s*===\s*['"]ch3-3-1['"][\s\S]{0,400}?autoplay\s*=\s*true/.test(ch3DynamicsScenes);
  assert.equal(declaresAutoplay, true,
    'ch3-3-1 scene must declare autoplay: true so spring oscillation runs by default');
});

test('@rc2-autoplay lab mount honors scene.autoplay gated by reduced-motion (Phase 08)', () => {
  // GREEN: mount path reads scene.autoplay and calls lab.resume() when not reduced-motion.
  const honors = /scene\.autoplay[\s\S]{0,200}?prefersReducedMotion[\s\S]{0,200}?lab\.resume/.test(labSource)
    || /scene\.autoplay[\s\S]{0,200}?lab\.resume\s*\(\)[\s\S]{0,400}?prefersReducedMotion/.test(labSource);
  assert.equal(honors, true,
    'lab mount must call lab.resume() for scene.autoplay routes when prefers-reduced-motion is off');
});

test('@rc2-autoplay anim engine resume re-arms requestAnimationFrame (Phase 08)', () => {
  // RED: function resume() flips paused but never re-schedules rAF;
  // play after lab.reset() leaves the loop dormant.
  // GREEN: resume() schedules a frame so the loop continues after pause.
  const resumeBlock = animationSource.slice(
    animationSource.indexOf('function resume('),
    animationSource.indexOf('function reset(')
  );
  const armsRaf = /requestAnimationFrame\s*\(\s*loop\s*\)/.test(resumeBlock);
  assert.equal(armsRaf, true,
    'animation engine resume() must re-arm requestAnimationFrame(loop) after un-pausing');
});
