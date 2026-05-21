#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PLAN_REPORT_DIR = path.join(
  ROOT,
  'plans',
  '260519-2142-simulation-review-2026-05-19-priority-fixes',
  'reports'
);

function argValue(name) {
  const direct = process.argv.find(item => item.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : '';
}

function routeFilter() {
  const raw = argValue('--routes');
  return raw ? raw.split(',').map(item => item.trim()).filter(Boolean) : [];
}

function latestManifest() {
  const root = path.join(ROOT, 'screenshots');
  if (!fs.existsSync(root)) return null;
  return fs.readdirSync(root)
    .filter(name => name.startsWith('sim-review-'))
    .map(name => path.join(root, name, 'capture-manifest.json'))
    .filter(file => fs.existsSync(file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0] || null;
}

function readManifest(file) {
  if (!file || !fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function byRoute(manifest) {
  const map = new Map();
  for (const item of manifest?.results || []) map.set(item.route, item);
  return map;
}

function capture(outDir) {
  const script = path.join(ROOT, 'tools', 'capture-all-58-simulations-screenshots.js');
  const args = [script, outDir];
  const routes = routeFilter();
  if (routes.length) args.push('--routes', routes.join(','));
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status || 1);
  return path.join(outDir, 'capture-manifest.json');
}

function report(beforeFile, afterFile, routes) {
  const before = byRoute(readManifest(beforeFile));
  const afterManifest = readManifest(afterFile);
  const after = byRoute(afterManifest);
  const selected = routes.length ? routes : [...after.keys()].sort();
  fs.mkdirSync(PLAN_REPORT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const out = path.join(PLAN_REPORT_DIR, `visual-baseline-diff-${stamp}.md`);
  const lines = [
    '# Visual Baseline Diff',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Before: ${beforeFile || 'none'}`,
    `After: ${afterFile}`,
    `Routes: ${selected.join(', ')}`,
    '',
    '| Route | Before | After | Delta |',
    '|---|---|---|---|',
  ];
  for (const route of selected) {
    const oldItem = before.get(route);
    const newItem = after.get(route);
    const deltas = [];
    if (!oldItem) deltas.push('new route baseline');
    else {
      if (oldItem.status !== newItem?.status) deltas.push(`status ${oldItem.status} -> ${newItem?.status}`);
      if (oldItem.errors?.length !== newItem?.errors?.length) deltas.push(`errors ${oldItem.errors?.length || 0} -> ${newItem?.errors?.length || 0}`);
      if (oldItem.canvasInfo?.hasContent !== newItem?.canvasInfo?.hasContent) deltas.push('canvas content flag changed');
    }
    const tag = newItem ? `${newItem.idx}-${route}.png` : '';
    const oldTag = oldItem ? `${oldItem.idx}-${route}.png` : '';
    const beforeLink = oldTag && beforeFile
      ? path.relative(path.dirname(out), path.join(path.dirname(beforeFile), 'sim-only', oldTag)).replace(/\\/g, '/')
      : '';
    const afterLink = tag ? path.relative(path.dirname(out), path.join(path.dirname(afterFile), 'sim-only', tag)).replace(/\\/g, '/') : '';
    lines.push(`| ${route} | ${oldItem ? oldItem.status : 'missing'} ${beforeLink ? `<br><img src="${beforeLink}" width="260">` : ''} | ${newItem ? newItem.status : 'missing'} ${afterLink ? `<br><img src="${afterLink}" width="260">` : ''} | ${deltas.join('; ') || 'metadata unchanged'} |`);
  }
  fs.writeFileSync(out, `${lines.join('\n')}\n`, 'utf8');
  console.log(`visual baseline report: ${path.relative(ROOT, out)}`);
}

function main() {
  const routes = routeFilter();
  const before = argValue('--before') || latestManifest();
  const outDir = path.resolve(ROOT, argValue('--out') || path.join('screenshots', `sim-review-update-${Date.now()}`));
  const after = capture(outDir);
  report(before, after, routes);
}

main();
