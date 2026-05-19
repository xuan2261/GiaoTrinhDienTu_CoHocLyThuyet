// Shared fixtures for sim-correctness-realism TDD harness.
// RED on master HEAD; expected GREEN after referenced phases.

const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const SRC = {
  professionalLab: path.join(ROOT, 'js', 'sim-professional-lab.js'),
  primitives: path.join(ROOT, 'js', 'sim-route-renderer-primitives.js'),
  visualHelpers: path.join(ROOT, 'js', 'sim-visual-helpers.js'),
  animationEngine: path.join(ROOT, 'js', 'sim-animation-engine.js'),
};

// Routes that use the legacy fallback handle on master (RC1 / Phase 02).
const RC1_ROUTES = ['ch1-2-3', 'ch1-1-3', 'ch1-2-1', 'ch1-2-6', 'ch1-1-8'];

// Routes whose mass body and spring/cable share an anchor (RC4 / Phase 03).
const RC4_ROUTES = ['ch3-3-1', 'ch3-3-2', 'ch1-1-8', 'ch1-2-1'];

// Routes that emit physics labels currently failing whitelist (RC5 / Phase 04).
const RC5_LABEL_SAMPLES = [
  'M_O', 'F_x', 'F_y', 'F_1', 'F_2',
  'v_a', 'v_e', 'v_r', 'a_n', 'a_t',
  'r_1', 'r_2', 'ω', 'φ', 'tĩnh', 'cân', 'phương', 'vận', 'lực'
];

// RC2 routes (animation density / Phase 08).
const RC2_PRESET_ROUTES = ['ch1-2-3', 'ch1-1-3', 'ch1-2-1'];
const RC2_TRAIL_ROUTES = ['ch2-1-1'];
const RC2_IMPULSE_ROUTES = ['ch3-6-2'];
const RC2_AUTOPLAY_SPRING = ['ch3-3-1'];

// Accessibility (Phase 08b).
const A11Y_ARIA_ROUTES = ['ch1-2-3', 'ch3-3-1', 'ch3-6-2'];

// Expected RED counts on master HEAD (recorded 2026-05-18).
const EXPECTED_RED_BASELINE = {
  legacyHandlesPresent: true,           // js/sim-professional-lab.js:1086
  whitelistRejectsPhysicsLabels: true,  // isShortOverlayLabel regex too narrow
  springUsesZigzag: true,                // i % 4 === 1 in spring()
  realisticBodyMissingRim: true,         // no 'rim' or 'ao' marks
  realisticWheelMissingShine: true,      // no specular arc
  arrowFixedShadowBlur: false,           // shadowBlur not present in arrow path
  noSimAriaLive: true,                   // no .sim-aria-live element
  noHandleA11yOverlay: true,             // no .sim-handle-a11y class
};

module.exports = {
  ROOT,
  SRC,
  RC1_ROUTES,
  RC4_ROUTES,
  RC5_LABEL_SAMPLES,
  RC2_PRESET_ROUTES,
  RC2_TRAIL_ROUTES,
  RC2_IMPULSE_ROUTES,
  RC2_AUTOPLAY_SPRING,
  A11Y_ARIA_ROUTES,
  EXPECTED_RED_BASELINE,
};
