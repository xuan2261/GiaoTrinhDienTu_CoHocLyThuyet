'use strict';

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const manifest = require('../../js/sim2/sim2-route-manifest.js');
const { SIM2: probeTargets } = require('../sim-probe/probe-targets.js');
const dragRoutes = new Set(['ch1-1-5', 'ch1-2-3', 'ch1-6-3', 'ch2-1-3', 'ch2-5-2']);

function fail(message) { throw new Error(`invalid visual capture: ${message}`); }
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
function expectedShots(record) {
  const labels = record.kind === 'dynamic' ? ['t0', 'mid', 'end'] : ['init', 'live'];
  if (probeTargets[record.route]) labels.push('slider-far');
  if (dragRoutes.has(record.route)) labels.push('drag-far');
  return labels;
}
function validateCapture(payload, now = Date.now(), outputDir) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) fail('artifact envelope required');
  if (!/^[0-9a-f-]{36}$/i.test(payload.runId || '')) fail('runId must be a UUID');
  if (payload.artifactDir !== `runs/${payload.runId}`) fail('artifactDir must bind to runId');
  const generatedAt = Date.parse(payload.generatedAt);
  if (!Number.isFinite(generatedAt) || generatedAt > now + 60000 || now - generatedAt > 24 * 60 * 60 * 1000) fail('generatedAt must be fresh');
  exact(payload.routes && payload.routes.map(record => record && record.route), manifest.map(route => route.id), 'route');
  const expectedFiles = [];
  for (const record of payload.routes) {
    const route = manifest.find(candidate => candidate.id === record.route);
    const section = record.route.replace(new RegExp(`^ch${record.chapter}-`), '').replace(/-/g, '.');
    if (record.runId !== payload.runId || record.chapter !== route.chapter || record.name !== route.name || record.section !== section) fail(`manifest metadata mismatch: ${record.route}`);
    if (!['static', 'dynamic'].includes(record.kind) || !Array.isArray(record.images) || !record.images.length || (record.pageErrors && record.pageErrors.length)) fail(`invalid capture record: ${record.route}`);
    const labels = record.images.map(image => image && image.label);
    exact(labels, expectedShots(record), `required shot for ${record.route}`);
    exact(labels, record.expectedShots, `recorded shot for ${record.route}`);
    for (const image of record.images) {
      const file = `${record.route}__${image.label}.png`;
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
  }
  if (outputDir) {
    const actualFiles = fs.readdirSync(path.join(outputDir, payload.artifactDir)).filter(name => name.endsWith('.png'));
    exact(actualFiles, expectedFiles, 'artifact file');
  }
  return true;
}
function main() {
  const input = process.argv[2] || path.resolve(__dirname, '../../plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/capture-manifest.json');
  const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
  validateCapture(payload, Date.now(), path.dirname(input));
  process.stdout.write(`sim2 visual capture valid: ${payload.routes.length} routes\n`);
}
if (require.main === module) main();
module.exports = { validateCapture };
