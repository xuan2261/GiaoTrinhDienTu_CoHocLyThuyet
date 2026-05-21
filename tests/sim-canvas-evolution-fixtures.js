/**
 * Phase 09 — canvas-evolution sweep fixtures.
 *
 * Three buckets cover every route we mount in the sim shell:
 *   - STATIC_ROUTES_INTENT_KH1: 25 Ch1 statics routes (no temporal dimension by spec).
 *   - STATIC_ROUTES_CONCEPT_DIAGRAM: Ch2/Ch3 concept-diagram routes (Phase 03 strips
 *     misleading Play affordance). Post-F3 reclassification: ch3-7-2 leaves this
 *     bucket via Phase 05 (its onTick already produces time-oscillating residuals).
 *   - ANIMATED_ROUTES_EVOLVING: every other dynamic route — must show ≥3 unique
 *     canvas hashes between t=0 and t=3 engine seconds.
 *
 * Total must equal SimRouteManifest count (58). routeBucket() returns the bucket
 * label or null for unknown routes.
 */
'use strict';

const STATIC_ROUTES_INTENT_KH1 = Object.freeze([
  'ch1-1-3', 'ch1-1-4', 'ch1-1-5', 'ch1-1-6', 'ch1-1-8',
  'ch1-2-1', 'ch1-2-3', 'ch1-2-6',
  'ch1-3-1', 'ch1-3-2', 'ch1-3-3', 'ch1-3-4', 'ch1-3-6', 'ch1-3-7',
  'ch1-4-1', 'ch1-4-2', 'ch1-4-4',
  'ch1-5-1', 'ch1-5-2', 'ch1-5-3', 'ch1-5-4',
  'ch1-6-2', 'ch1-6-3',
  'ch1-7-1', 'ch1-7-2',
]);

const STATIC_ROUTES_CONCEPT_DIAGRAM = Object.freeze([
  'ch2-5-2', 'ch2-5-3', 'ch2-7-2',
  'ch3-1-3', 'ch3-2-3', 'ch3-2-5',
  'ch3-4-1', 'ch3-6-3', 'ch3-7-1',
]);

const ANIMATED_ROUTES_EVOLVING = Object.freeze([
  'ch2-1-1', 'ch2-1-2', 'ch2-1-3', 'ch2-1-4',
  'ch2-2-2', 'ch2-3-2',
  'ch2-4-1', 'ch2-4-2', 'ch2-4-3', 'ch2-4-4',
  'ch2-5-1',
  'ch2-7-1',
  'ch3-1-2',
  'ch3-2-1', 'ch3-2-2',
  'ch3-3-1', 'ch3-3-2',
  'ch3-4-2',
  'ch3-5-1', 'ch3-5-2', 'ch3-5-3', 'ch3-5-4',
  'ch3-6-2',
  'ch3-7-2',
]);

const TOTAL_EXPECTED = 58;

function selfCheck() {
  const total = STATIC_ROUTES_INTENT_KH1.length
              + STATIC_ROUTES_CONCEPT_DIAGRAM.length
              + ANIMATED_ROUTES_EVOLVING.length;
  if (total !== TOTAL_EXPECTED) {
    throw new Error(
      `[sim-canvas-evolution-fixtures] bucket totals do not sum to ${TOTAL_EXPECTED}; got ${total} `
      + `(static-ch1=${STATIC_ROUTES_INTENT_KH1.length}, `
      + `static-concept=${STATIC_ROUTES_CONCEPT_DIAGRAM.length}, `
      + `animated=${ANIMATED_ROUTES_EVOLVING.length}).`
    );
  }
  const seen = new Set();
  const dupes = [];
  for (const r of [...STATIC_ROUTES_INTENT_KH1, ...STATIC_ROUTES_CONCEPT_DIAGRAM, ...ANIMATED_ROUTES_EVOLVING]) {
    if (seen.has(r)) dupes.push(r);
    seen.add(r);
  }
  if (dupes.length) {
    throw new Error(`[sim-canvas-evolution-fixtures] duplicate route ids across buckets: ${dupes.join(', ')}`);
  }
}

selfCheck();

function routeBucket(routeId) {
  if (STATIC_ROUTES_INTENT_KH1.includes(routeId)) return 'static-ch1';
  if (STATIC_ROUTES_CONCEPT_DIAGRAM.includes(routeId)) return 'static-concept';
  if (ANIMATED_ROUTES_EVOLVING.includes(routeId)) return 'animated';
  return null;
}

function expectedWindowFor(bucket) {
  if (bucket === 'static-ch1' || bucket === 'static-concept') return [1, 2];
  if (bucket === 'animated') return [3, 4];
  return null;
}

const ALL_ROUTES = Object.freeze([
  ...STATIC_ROUTES_INTENT_KH1,
  ...STATIC_ROUTES_CONCEPT_DIAGRAM,
  ...ANIMATED_ROUTES_EVOLVING,
].sort());

// Phase 02/03/05/07 cleared the original RED routes; keep this explicit so
// future in-flight fixes must opt into a visible defect tag.
const KNOWN_DEFECTS = Object.freeze({});

module.exports = {
  STATIC_ROUTES_INTENT_KH1,
  STATIC_ROUTES_CONCEPT_DIAGRAM,
  ANIMATED_ROUTES_EVOLVING,
  ALL_ROUTES,
  KNOWN_DEFECTS,
  routeBucket,
  expectedWindowFor,
  TOTAL_EXPECTED,
};
