'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { upstreamState } = require('../tools/sim-validation/validate-simulation-drift.js');

const ROOT = path.resolve(__dirname, '..');

test('historical completed artifacts cannot approve the repaired current source', () => {
  const state = upstreamState(ROOT);
  assert.equal(state.ready, false, 'new runtime changes need a separate current-source revalidation');
  assert.match(state.pending.join('\n'), /current.source revalidation/i);
});

test('font, image, GIF and source-PDF byte changes invalidate the captured source fingerprint', () => {
  const fs=require('node:fs'),os=require('node:os');
  const {sourceSnapshot,SOURCE_DIRECTORIES,SOURCE_FILES}=require('../tools/sim-validation/source-snapshot.js');
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'runtime-asset-snapshot-'));
  try{
    for(const dir of SOURCE_DIRECTORIES)fs.mkdirSync(path.join(root,dir),{recursive:true});
    for(const file of SOURCE_FILES){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),'fixture');}
    for(const rel of ['lib/katex/fonts/math.woff2','images/figure.png','assets/gifs/figure.gif','CoHocLyThuyet.pdf']){
      const target=path.join(root,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'before');
      const before=sourceSnapshot(root).sha256;fs.writeFileSync(target,'after');
      assert.notEqual(sourceSnapshot(root).sha256,before,`${rel} must belong to runtime review scope`);
    }
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
