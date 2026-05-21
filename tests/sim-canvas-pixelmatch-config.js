/**
 * Phase 09 backlog visual evolution baseline config.
 *
 * This is the no-dependency fallback for the pixelmatch plan: compare
 * downsampled RGBA canvas samples from engine-time frames instead of PNG files.
 */
'use strict';

const {
  ANIMATED_ROUTES_EVOLVING,
} = require('./sim-canvas-evolution-fixtures');

const VISUAL_EVOLUTION_ROUTES = Object.freeze([...ANIMATED_ROUTES_EVOLVING]);

const DEFAULT_TOLERANCE = Object.freeze({
  lowerPct: 0.005,
  upperPct: 0.75,
  baselineDriftPct: 0.08,
  colorThreshold: 18,
  sampleStep: 10,
});

const ROUTE_OVERRIDES = Object.freeze({
  // These routes intentionally animate subtle force/body deltas; the
  // downsampled no-dependency diff sees less than the default 0.5%.
  'ch3-1-2': { lowerPct: 0.003 },
  'ch3-2-2': { lowerPct: 0.0025 },
  'ch3-5-2': { lowerPct: 0.002 },
  // Particle/trail-heavy routes can legitimately move more sampled pixels.
  'ch3-3-1': { upperPct: 0.9, baselineDriftPct: 0.12 },
  'ch3-3-2': { upperPct: 0.9, baselineDriftPct: 0.12 },
});

function toleranceFor(routeId) {
  return Object.assign({}, DEFAULT_TOLERANCE, ROUTE_OVERRIDES[routeId] || {});
}

module.exports = {
  DEFAULT_TOLERANCE,
  ROUTE_OVERRIDES,
  VISUAL_EVOLUTION_ROUTES,
  toleranceFor,
};
