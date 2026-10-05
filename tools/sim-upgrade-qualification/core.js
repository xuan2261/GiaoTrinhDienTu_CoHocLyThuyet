'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {actionPlans,validateReceipt,PRODUCER_VERSION} = require('./actions.js');
const ROOT = path.resolve(__dirname, '../..');
const METHODS = Object.freeze({
  readouts: 'browser-dom-text', controls: 'browser-dom-controls', layout: 'browser-dom-client-rects',
  renderer: 'browser-webgl-context-and-three-renderer-info', consistency: 'paused-state-screenshot-bracket'
});
const SOURCE_ROOTS = ['index.html','CoHocLyThuyet.pdf','package.json','package-lock.json','js','css','lib','chapters','data','assets','images','media'];
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
function canonical(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && Object.getPrototypeOf(value) === Object.prototype) return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  throw new TypeError('Evidence must contain only finite JSON values');
}
const hashJSON = value => sha256(canonical(value));
function safePath(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(p => p === '..' || p === '.')) throw new Error('Unsafe artifact/source path');
  const full = path.resolve(root, relative);
  if (!full.startsWith(path.resolve(root) + path.sep)) throw new Error('Path escapes evidence root');
  let current = path.resolve(root);
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try { if (fs.lstatSync(current).isSymbolicLink()) throw new Error('Symlink path component is not allowed'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return full;
}
function sourceSnapshot(root = ROOT, inputs = SOURCE_ROOTS) {
  const entries = [];
  function add(relative) {
    const full = safePath(root, relative), stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) throw new Error('Symlink source is not allowed: ' + relative);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full).sort()) add(relative + '/' + name);
    } else if (stat.isFile()) {
      const bytes = fs.readFileSync(full);
      entries.push({ path: relative, bytes: bytes.length, sha256: sha256(bytes) });
    } else throw new Error('Non-regular source: ' + relative);
  }
  inputs.forEach(add);
  entries.sort((a,b) => a.path.localeCompare(b.path, 'en'));
  if (new Set(entries.map(e => e.path)).size !== entries.length) throw new Error('Duplicate source input');
  return { algorithm: 'sha256', sourceHash: hashJSON(entries), files: entries };
}
function verifySource(root, snapshot) {
  const errors = [];
  for (const entry of snapshot.files) {
    try {
      const file = safePath(root, entry.path);
      if (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) throw new Error('Not a regular source file');
      const data = fs.readFileSync(file);
      if (data.length !== entry.bytes || sha256(data) !== entry.sha256) errors.push('Source changed: ' + entry.path);
    } catch (error) { errors.push(entry.path + ': ' + error.message); }
  }
  return errors;
}
function routes() {
  const sim2 = require('../../js/sim2/sim2-route-manifest.js');
  const sim3 = require('../../js/sim3/sim3-route-manifest.js');
  return [...sim2.map(r => ({ ...r, engine:'sim2', integration:'production-loader' })), ...sim3.map(r => ({ ...r, engine:'sim3', integration:'production-loader' }))];
}
function profiles(kind = 'desktop') {
  if (kind === 'smoke') return [{ id:'1280-light-dpr1', width:1280,height:900,dpr:1,theme:'light',reducedMotion:'no-preference' }];
  if (kind !== 'desktop') throw new Error('Profile must be smoke or desktop');
  return [320,768,1280].flatMap(width => [1,2].flatMap(dpr => ['light','dark'].map(theme => ({ id:`${width}-${theme}-dpr${dpr}`,width,height:900,dpr,theme,reducedMotion:'no-preference' }))));
}
function scenarios(route, controls, engine) {
  const cases = [{id:'default',type:'default'}];
  for (const [kind,list] of [['range',controls.ranges || []],['number',controls.numbers || []]]) {
    for (const c of list) for (const bound of ['min','max']) if (Number.isFinite(c[bound])) cases.push({id:`${kind==='number' ? 'number':'control'}-${c.id}-${bound}`,type:'control',kind,control:c.id,bound,value:c[bound],nativeStep:c.step || null,physicalStep:c.physicalStep || null});
  }
  for (let i=0;i<(controls.handles || 0);i++) for (const key of ['ArrowRight','ArrowUp','Home','End']) cases.push({id:`handle-${i}-${key}`,type:'handle',index:i,key});
  if (controls.playback) cases.push({id:'step',type:'steps',steps:1},{id:'reset',type:'reset'},{id:'play-pause',type:'play-pause'},{id:'running-control',type:'running-control'});
  if (engine === 'sim3') cases.push({id:'toggle-20',type:'toggle',cycles:20},{id:'resize-paused',type:'resize'},...(controls.playback ? [{id:'toggle-running',type:'toggle-running'}] : []));
  if (route === 'ch3-6-2') cases.push(...[['before',104],['contact',105],['after',108]].map(([phase,steps])=>({id:`collision-${phase}`,type:'steps',steps})),{id:'collision-late-toggle',type:'late-toggle',steps:108});
  if (route === 'ch2-2-2') cases.push({id:'rotation-t1',type:'steps',steps:60},{id:'rotation-t10',type:'steps',steps:600});
  if (['ch2-3-2','ch2-4-4','ch3-5-3'].includes(route)) cases.push({id:'motion-sequence',type:'sequence',steps:[0,15,30,45,60]});
  cases.push(...actionPlans(route,controls));
  return cases;
}
function captureStatus(engine, renderer) {
  if (engine === 'sim3') {
    if (renderer.contextLost) return 'error';
    if (!renderer.webgl || renderer.canvasCount !== 1 || renderer.fallbackVisible) return 'unsupported';
  }
  return 'evidence-captured';
}
function validateMeasurement(m, sourceHash, stateHash) {
  const errors = [];
  if (!m || !Object.hasOwn(METHODS,m.name) || m.method !== METHODS[m.name]) errors.push('Measurement method/name is not collector-owned');
  for (const [key,value] of [['sourceHash',sourceHash],['stateHash',stateHash]]) if (!m || m[key] !== value || !/^[a-f0-9]{64}$/.test(m[key] || '')) errors.push('Measurement ' + key + ' mismatch');
  if (!m || typeof m.scope !== 'string' || !m.scope.trim()) errors.push('Measurement scope is required');
  if (!m || typeof m.measuredAt !== 'string' || !Number.isFinite(Date.parse(m.measuredAt))) errors.push('Measurement timestamp is required');
  try { hashJSON(m); } catch(error) { errors.push(error.message); }
  return errors;
}
function layoutMetrics(labels, frame) {
  if (!['left','right','top','bottom'].every(k=>Number.isFinite(frame[k]))) throw new Error('Invalid frame rectangle');
  const visible = labels.filter(l=>l.visible);
  for (const l of visible) if (!l.rect || !['left','right','top','bottom','width','height'].every(k=>Number.isFinite(l.rect[k]))) throw new Error('Invalid label rectangle');
  const overlaps = [];
  for (let i=0;i<visible.length;i++) for (let j=i+1;j<visible.length;j++) {
    const a=visible[i],b=visible[j],x=Math.min(a.rect.right,b.rect.right)-Math.max(a.rect.left,b.rect.left),y=Math.min(a.rect.bottom,b.rect.bottom)-Math.max(a.rect.top,b.rect.top);
    if (x>0 && y>0) overlaps.push({a:a.id,b:b.id,areaCssPx2:x*y});
  }
  const margins=visible.map(l=>Math.min(l.rect.left-frame.left,frame.right-l.rect.right,l.rect.top-frame.top,frame.bottom-l.rect.bottom));
  return {visibleCount:visible.length,overlaps,outside:visible.filter((_,i)=>margins[i]<0).map(l=>l.id),minimumMarginCssPx:margins.length ? Math.min(...margins) : null};
}
function validateArtifact(dir, artifact) {
  try {
    const file = safePath(dir,artifact.file);
    if (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) throw new Error('Artifact is not a regular file');
    const bytes = fs.readFileSync(file), errors=[];
    if (bytes.length !== artifact.bytes || sha256(bytes) !== artifact.sha256) errors.push('Artifact hash/size mismatch');
    if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) errors.push('Screenshot must contain PNG bytes');
    return errors;
  } catch(error) { return [error.message]; }
}
function validateRecord(record, run, dir) {
  const errors = [];
  if(record.schemaVersion!==2)errors.push('Record schema version unsupported');
  if (record.runId !== run.runId || record.sourceHash !== run.sourceHash) errors.push('Record run/source mismatch');
  if (record.formalAcceptance !== 'pending') errors.push('Capture cannot grant formal acceptance');
  if (!['evidence-captured','unsupported','error','not-run'].includes(record.status)) errors.push('Invalid capture status');
  if (!/^[a-f0-9]{64}$/.test(record.collectorHash || '') || record.collectorHash !== run.collectorHash || record.producerVersion !== PRODUCER_VERSION || record.producerVersion !== run.producerVersion) errors.push('Record collector/version mismatch');
  if (record.status === 'not-run') return errors;
  for(const action of record.actions || []) if(action.receipt) {
    errors.push(...validateReceipt(action.receipt,run,hashJSON));
    if(action.receipt.route!==record.route)errors.push('Action receipt route mismatch');
    if(record.status==='evidence-captured' && action.receipt.oracle.status==='fail')errors.push('Failed action oracle cannot be captured success');
  }
  if(record.scenario?.type==='action-sequence') {
    const actions=record.actions || [],operations=record.scenario.operations || [];
    if(!actions.length || actions.length>operations.length || actions.some(a=>!a.receipt))errors.push('Action sequence capture requires nonempty ordered receipts');
    for(let i=0;i<actions.length;i++) {
      try {if(hashJSON(actions[i].receipt.requested)!==hashJSON(operations[i]))errors.push('Action receipt differs from planned operation');}
      catch(e){errors.push('Invalid planned operation receipt');}
      if(i && actions[i].receipt?.beforeStateHash!==actions[i-1].receipt?.afterStateHash)errors.push('Action receipt state chain is broken');
    }
    if(actions.at(-1)?.receipt?.afterStateHash!==record.stateHash)errors.push('Capture does not match final action state');
  }
  let stateHash;
  try {stateHash=hashJSON(record.state);} catch(error) {errors.push(error.message);}
  if (stateHash !== record.stateHash) errors.push('Record state hash mismatch');
  if (!record.environment || !record.environment.browserVersion || !record.environment.browserEngine || !Number.isFinite(record.environment.actualDpr)) errors.push('Browser environment is incomplete');
  const ms=record.measurements || [];
  for (const name of Object.keys(METHODS)) if (!ms.some(m=>m.name===name)) errors.push('Missing measurement: '+name);
  for (const m of ms) errors.push(...validateMeasurement(m,run.sourceHash,stateHash));
  if (record.status === 'evidence-captured' && captureStatus(record.engine,record.renderer) !== 'evidence-captured') errors.push('Unsupported WebGL cannot be captured success');
  if (record.status === 'evidence-captured' && record.consistency?.stable !== true) errors.push('Screenshot is not bound to a stable state');
  if (!record.screenshot) errors.push('Missing screenshot'); else errors.push(...validateArtifact(dir,record.screenshot));
  return errors;
}
module.exports={ROOT,SOURCE_ROOTS,METHODS,sha256,hashJSON,safePath,sourceSnapshot,verifySource,routes,profiles,scenarios,captureStatus,validateMeasurement,layoutMetrics,validateArtifact,validateRecord};
