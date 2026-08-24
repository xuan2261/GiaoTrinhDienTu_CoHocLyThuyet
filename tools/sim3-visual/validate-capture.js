'use strict';

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const sim2 = require('../../js/sim2/sim2-route-manifest.js');
const sim3 = require('../../js/sim3/sim3-route-manifest.js');
const { targetsFor } = require('../sim-probe/probe-targets.js');

function fail(message) { throw new Error(`invalid Sim3 visual capture: ${message}`); }
function exact(actual, expected, label) {
  if (!Array.isArray(actual)) fail(`${label} must be an array`);
  const seen = new Set();
  for (const value of actual) {
    if (seen.has(value)) fail(`duplicate ${label}: ${value}`);
    seen.add(value);
  }
  const missing = expected.filter(value => !seen.has(value));
  const unknown = actual.filter(value => !expected.includes(value));
  if (missing.length || unknown.length) fail(`${label} mismatch; missing=${missing.join(',') || '-'} unknown=${unknown.join(',') || '-'}`);
}
function section(route) { return route.id.replace(new RegExp(`^ch${route.chapter}-`), '').replace(/-/g, '.'); }
function labels(route) { return targetsFor(`${route.id}#sim3`) ? ['final audit', 'slider-far'] : ['final audit']; }
function validateSim3Capture(payload, now = Date.now(), outputDir) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) fail('artifact envelope required');
  if (!/^[0-9a-f-]{36}$/i.test(payload.runId || '')) fail('runId must be a UUID');
  if (payload.artifactDir !== `runs/${payload.runId}`) fail('artifactDir must bind to runId');
  const generatedAt = Date.parse(payload.generatedAt);
  if (!Number.isFinite(generatedAt) || generatedAt > now + 60000 || now - generatedAt > 86400000) fail('generatedAt must be fresh');
  exact(payload.routes && payload.routes.map(record => record && record.route), sim3.map(route => route.id), 'route');
  const expectedFiles = [];
  for (const record of payload.routes) {
    const route = sim3.find(candidate => candidate.id === record.route);
    const base = sim2.find(candidate => candidate.id === route.baseRouteId);
    if (record.runId !== payload.runId || record.chapter !== route.chapter || record.section !== section(route) || record.name !== base.name || (record.pageErrors && record.pageErrors.length)) fail(`invalid route evidence: ${record.route}`);
    if (Array.isArray(record.flags) && record.flags.some(flag => flag && flag.severity === 'high')) fail(`visual error state: ${record.route}`);
    const imageLabels = record.images && record.images.map(image => image && image.label);
    exact(imageLabels, labels(route), `image for ${record.route}`);
    exact(imageLabels, record.expectedShots, `recorded image for ${record.route}`);
    for (const image of record.images) {
      const file = image.label === 'final audit' ? `${route.id}-sim3.png` : `${route.id}-sim3__slider-far.png`;
      if (image.file !== file || image.src !== `${payload.artifactDir}/${file}` || !Number.isInteger(image.bytes) || image.bytes < 64 || !/^[0-9a-f]{64}$/i.test(image.sha256 || '')) fail(`invalid artifact: ${record.route}/${image.label}`);
      expectedFiles.push(file);
      if (outputDir) {
        const artifact = path.join(outputDir, payload.artifactDir, file);
        let stat;
        try { stat = fs.statSync(artifact); } catch (error) { fail(`missing artifact: ${image.src}`); }
        if (!stat.isFile() || stat.size !== image.bytes) fail(`artifact size mismatch: ${image.src}`);
        const digest = crypto.createHash('sha256').update(fs.readFileSync(artifact)).digest('hex');
        if (digest !== image.sha256) fail(`artifact digest mismatch: ${image.src}`);
      }
    }
    if (record.images.length === 2 && record.images[0].sha256 === record.images[1].sha256) fail(`no-op slider capture: ${record.route}`);
  }
  if (outputDir) exact(fs.readdirSync(path.join(outputDir, payload.artifactDir)).filter(name => name.endsWith('.png')), expectedFiles, 'artifact file');
  return true;
}
function main() {
  const input = process.argv[2] || path.resolve(__dirname, '../../plans/260605-sim3-visual-quality-upgrade-tdd/visuals/final/capture-manifest.json');
  const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
  validateSim3Capture(payload, Date.now(), path.dirname(input));
  process.stdout.write(`Sim3 visual capture valid: ${payload.routes.length} routes\n`);
}
if (require.main === module) main();
module.exports = { validateSim3Capture };
