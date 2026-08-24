'use strict';

const assert = require('assert');
const manifest = require('../js/sim2/sim2-route-manifest.js');
const { SIM2: probeTargets } = require('../tools/sim-probe/probe-targets.js');
const { validateCapture } = require('../tools/sim2-visual/validate-capture.js');

const NOW = Date.now();
const RUN_ID = '123e4567-e89b-12d3-a456-426614174000';
const dragRoutes = new Set(['ch1-1-5', 'ch1-2-3', 'ch1-6-3', 'ch2-1-3', 'ch2-5-2']);
function shots(route) {
  const labels = ['init', 'live'];
  if (probeTargets[route.id]) labels.push('slider-far');
  if (dragRoutes.has(route.id)) labels.push('drag-far');
  return labels;
}
function artifact() {
  return {
    runId: RUN_ID, generatedAt: new Date(NOW).toISOString(), artifactDir: `runs/${RUN_ID}`,
    routes: manifest.map(route => {
      const labels = shots(route);
      return {
        runId: RUN_ID, route: route.id, chapter: route.chapter,
        section: route.id.replace(new RegExp(`^ch${route.chapter}-`), '').replace(/-/g, '.'),
        name: route.name, kind: 'static', expectedShots: labels,
        images: labels.map(label => {
          const file = `${route.id}__${label}.png`;
          return { label, file, src: `runs/${RUN_ID}/${file}`, bytes: 128, sha256: 'a'.repeat(64) };
        }),
        pageErrors: []
      };
    })
  };
}
function rejects(mutate, message) {
  const payload = artifact(); mutate(payload);
  assert.throws(() => validateCapture(payload, NOW), message);
}

assert.strictEqual(validateCapture(artifact(), NOW), true);
rejects(payload => payload.routes.pop(), 'reject missing route');
rejects(payload => payload.routes.push(payload.routes[0]), 'reject duplicate route');
rejects(payload => { payload.routes[0].route = 'unknown'; }, 'reject unknown route');
rejects(payload => { payload.routes[0].images.pop(); }, 'reject missing shot');
rejects(payload => { payload.routes[0].images[1].label = 'init'; }, 'reject duplicate shot');
rejects(payload => { payload.routes[0].images[0].bytes = 0; }, 'reject empty PNG');
rejects(payload => { payload.routes[0].images[0].sha256 = 'invalid'; }, 'reject invalid PNG digest');
rejects(payload => { payload.routes[0].pageErrors.push('warning'); }, 'reject browser warning');
rejects(payload => { payload.routes[0].runId = 'other'; }, 'reject mixed run');
rejects(payload => { payload.generatedAt = new Date(NOW - 86400001).toISOString(); }, 'reject stale artifact');
console.log(`sim2-visual-capture-validation: PASS (${manifest.length} routes)`);
