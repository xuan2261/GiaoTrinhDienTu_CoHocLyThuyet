'use strict';

const assert = require('assert');
const sim2 = require('../js/sim2/sim2-route-manifest.js');
const sim3 = require('../js/sim3/sim3-route-manifest.js');
const { targetsFor } = require('../tools/sim-probe/probe-targets.js');
const { validateSim3Capture } = require('../tools/sim3-visual/validate-capture.js');

const NOW = Date.now();
const RUN_ID = '123e4567-e89b-12d3-a456-426614174000';
function section(route) { return route.id.replace(new RegExp(`^ch${route.chapter}-`), '').replace(/-/g, '.'); }
function artifact() {
  return {
    runId: RUN_ID, generatedAt: new Date(NOW).toISOString(), artifactDir: `runs/${RUN_ID}`,
    routes: sim3.map(route => {
      const base = sim2.find(candidate => candidate.id === route.baseRouteId);
      const labels = targetsFor(`${route.id}#sim3`) ? ['final audit', 'slider-far'] : ['final audit'];
      return {
        runId: RUN_ID, route: route.id, chapter: route.chapter, section: section(route), name: base.name,
        expectedShots: labels, pageErrors: [],
        images: labels.map((label, index) => {
          const file = label === 'final audit' ? `${route.id}-sim3.png` : `${route.id}-sim3__slider-far.png`;
          return { label, file, src: `runs/${RUN_ID}/${file}`, bytes: 128 + index, sha256: String(index + 1).repeat(64) };
        })
      };
    })
  };
}
function rejects(mutate, message) {
  const payload = artifact(); mutate(payload);
  assert.throws(() => validateSim3Capture(payload, NOW), message);
}

assert.strictEqual(validateSim3Capture(artifact(), NOW), true);
rejects(payload => payload.routes.pop(), 'reject missing route');
rejects(payload => { payload.routes[0].flags = [{ severity: 'high' }]; }, 'reject visual error state');
rejects(payload => payload.routes.push(payload.routes[0]), 'reject duplicate route');
rejects(payload => { payload.routes[0].route = 'unknown'; }, 'reject unknown route');
rejects(payload => { payload.routes[0].images.pop(); }, 'reject missing image');
rejects(payload => { payload.routes[0].pageErrors.push('error'); }, 'reject error state');
rejects(payload => { const route = payload.routes.find(record => record.images.length === 2); route.images[1].sha256 = route.images[0].sha256; }, 'reject no-op image');
rejects(payload => { payload.routes[0].images[0].sha256 = 'invalid'; }, 'reject invalid image digest');
rejects(payload => { payload.routes[0].runId = 'other'; }, 'reject mixed run');
rejects(payload => { payload.generatedAt = new Date(NOW - 86400001).toISOString(); }, 'reject stale artifact');
console.log(`sim3-visual-capture-validation: PASS (${sim3.length} routes)`);
