'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const core = require('../tools/sim-upgrade-qualification/core.js');

const H = 'a'.repeat(64), S = 'b'.repeat(64);
function measurement(name = 'layout') {
  return { name, method: core.METHODS[name], sourceHash: H, stateHash: S, measuredAt: '2026-10-03T00:00:00.000Z', scope: 'visible DOM boxes only; does not establish occlusion', value: {} };
}
test('35 source-derived routes contain 25 Sim2 defaults and 10 paired Sim3 defaults', () => {
  const routes = core.routes();
  assert.equal(routes.filter(r => r.engine === 'sim2').length, 25);
  assert.equal(routes.filter(r => r.engine === 'sim3').length, 10);
  assert.equal(new Set(routes.map(r => `${r.engine}:${r.id}`)).size, 35);
  assert.ok(routes.every(r => r.integration === 'production-loader'));
});
test('desktop matrix has 320/768/1280 x DPR1/2 x light/dark', () => {
  const profiles = core.profiles('desktop');
  assert.equal(profiles.length, 12);
  assert.deepEqual([...new Set(profiles.map(p => p.width))], [320, 768, 1280]);
  assert.throws(() => core.profiles('invented'));
});
test('hash is canonical, rejects non-finite or non-JSON state instead of silently serializing', () => {
  assert.equal(core.hashJSON({ b: 2, a: 1 }), core.hashJSON({ a: 1, b: 2 }));
  assert.notEqual(core.hashJSON({ a: 1 }), core.hashJSON({ a: 2 }));
  for (const invalid of [NaN, Infinity, undefined, () => {}, { a: NaN }]) assert.throws(() => core.hashJSON(invalid));
});
test('source snapshot binds contents and detects a same-name byte change', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'q0-source-'));
  try {
    fs.writeFileSync(path.join(dir, 'index.html'), 'candidate A');
    const a = core.sourceSnapshot(dir, ['index.html']);
    assert.match(a.sourceHash, /^[a-f0-9]{64}$/);
    assert.equal(core.verifySource(dir, a).length, 0);
    fs.writeFileSync(path.join(dir, 'index.html'), 'candidate B');
    assert.equal(core.verifySource(dir, a).length, 1);
    assert.notEqual(core.sourceSnapshot(dir, ['index.html']).sourceHash, a.sourceHash);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
test('source snapshot rejects escaping paths and symlink assets', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'q0-path-'));
  try {
    fs.symlinkSync('/etc/passwd', path.join(dir, 'asset'));
    assert.throws(() => core.sourceSnapshot(dir, ['../escape']));
    assert.throws(() => core.sourceSnapshot(dir, ['asset']));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
test('measurement guard rejects implementation targets/debug declarations as observations', () => {
  assert.deepEqual(core.validateMeasurement(measurement(), H, S), []);
  assert.ok(core.validateMeasurement({ ...measurement(), method: 'visualMetrics.labelOverlapTarget' }, H, S).length);
  assert.ok(core.validateMeasurement({ ...measurement(), name: 'beforeAfterCueReadable' }, H, S).length);
});
test('measurement requires source, state, method, scope and timestamp provenance', () => {
  for (const field of ['sourceHash','stateHash','method','scope','measuredAt']) {
    const m = measurement(); delete m[field];
    assert.ok(core.validateMeasurement(m, H, S).length, field);
  }
  assert.ok(core.validateMeasurement(measurement(), 'c'.repeat(64), S).length);
  assert.ok(core.validateMeasurement(measurement(), H, 'c'.repeat(64)).length);
});
test('unsupported canvas and fallback are never a captured WebGL success', () => {
  assert.equal(core.captureStatus('sim3', { webgl: false, canvasCount: 0, fallbackVisible: true }), 'unsupported');
  assert.equal(core.captureStatus('sim3', { webgl: false, canvasCount: 1, fallbackVisible: false }), 'unsupported');
  assert.equal(core.captureStatus('sim3', { webgl: true, contextLost: true, canvasCount: 1 }), 'error');
  assert.equal(core.captureStatus('sim3', { webgl: true, contextLost: false, canvasCount: 1 }), 'evidence-captured');
  assert.equal(core.captureStatus('sim2', {}), 'evidence-captured');
});
test('DOM overlap measures actual rectangles including border contact policy, not declared metrics', () => {
  const result = core.layoutMetrics([
    { id: 'a', visible: true, rect: {left:1,top:1,right:11,bottom:11,width:10,height:10} },
    { id: 'b', visible: true, rect: {left:10,top:10,right:20,bottom:20,width:10,height:10} },
    { id: 'hidden', visible: false, rect: {left:1,top:1,right:11,bottom:11,width:10,height:10} }
  ], {left:0,top:0,right:15,bottom:15});
  assert.deepEqual(result.overlaps, [{ a:'a', b:'b', areaCssPx2:1 }]);
  assert.deepEqual(result.outside, ['b']);
  assert.equal(result.visibleCount, 2);
  assert.equal(result.minimumMarginCssPx, -5);
});
test('empty or malformed bounds do not imply zero-overlap qualification', () => {
  assert.equal(core.layoutMetrics([], {left:0,top:0,right:20,bottom:20}).minimumMarginCssPx, null);
  assert.throws(() => core.layoutMetrics([{visible:true,id:'bad',rect:{left:NaN}}], {left:0,top:0,right:20,bottom:20}));
});
test('case plan includes explicit collision event boundaries and 20 toggle pairs', () => {
  const plan = core.scenarios('ch3-6-2', { ranges: [{ id:'e',min:0,max:1 }], numbers:[], handles:0, playback:true }, 'sim3');
  for (const id of ['default','control-e-min','control-e-max','step','reset','running-control','toggle-20','collision-before','collision-contact','collision-after','collision-late-toggle']) assert.ok(plan.some(p => p.id === id), id);
  assert.equal(plan.find(p => p.id === 'collision-contact').steps, 105);
  assert.equal(plan.find(p => p.id === 'toggle-20').cycles, 20);
});
test('artifact validation checks PNG bytes and rejects traversal', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'q0-artifact-'));
  try {
    const data = Buffer.from([137,80,78,71,13,10,26,10,0]); fs.writeFileSync(path.join(dir,'case.png'),data);
    const a = {file:'case.png',sha256:core.sha256(data),bytes:data.length};
    assert.deepEqual(core.validateArtifact(dir,a),[]);
    assert.ok(core.validateArtifact(dir,{...a,file:'../case.png'}).length);
    assert.ok(core.validateArtifact(dir,{...a,sha256:H}).length);
    fs.writeFileSync(path.join(dir,'case.png'),'fake PNG');
    assert.ok(core.validateArtifact(dir,a).length);
  } finally { fs.rmSync(dir, {recursive:true,force:true}); }
});

test('runner rejects unsafe custom flags and unknown profiles before browser launch', () => {
  const {options}=require('../tools/sim-upgrade-qualification/run.js');
  assert.throws(()=>options(['--no-sandbox']));
  assert.throws(()=>options(['--args','--disable-web-security']));
  assert.throws(()=>options(['--engine','invented']));
  assert.throws(()=>options(['--route','unknown']));
  assert.equal(options(['--plan','--profile','smoke']).plan,true);
});
test('record guards reject unstable screenshots, missing environment, wrong hash and acceptance claims', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'q0-record-'));
  try {
    const png=Buffer.from([137,80,78,71,13,10,26,10,0]);fs.writeFileSync(path.join(dir,'case.png'),png);
    const state={clockSeconds:0,readoutValues:[]},stateHash=core.hashJSON(state);
    const run={runId:'test-run',sourceHash:H,collectorHash:S,producerVersion:'1.2.0'};
    const record={schemaVersion:2,...run,engine:'sim3',status:'evidence-captured',formalAcceptance:'pending',state,stateHash,environment:{browserVersion:'test',browserEngine:'chromium',actualDpr:1},measurements:Object.keys(core.METHODS).map(name=>({...measurement(name),stateHash})),renderer:{webgl:true,canvasCount:1,contextLost:false},consistency:{stable:true},screenshot:{file:'case.png',sha256:core.sha256(png),bytes:png.length}};
    assert.deepEqual(core.validateRecord(record,run,dir),[]);
    assert.ok(core.validateRecord({...record,schemaVersion:999},run,dir).length);
    assert.ok(core.validateRecord({...record,formalAcceptance:'accepted'},run,dir).length);
    assert.ok(core.validateRecord({...record,stateHash:S},run,dir).length);
    assert.ok(core.validateRecord({...record,environment:null},run,dir).length);
    assert.ok(core.validateRecord({...record,renderer:{webgl:false,canvasCount:1}},run,dir).length);
    assert.ok(core.validateRecord({...record,consistency:{stable:false}},run,dir).length);
    assert.ok(core.validateRecord({...record,measurements:[]},run,dir).length);
    assert.ok(core.validateRecord({...record,collectorHash:undefined},run,dir).length);
    assert.ok(core.validateRecord({...record,producerVersion:undefined},run,dir).length);
    const requested={type:'action',action:'future'},observation={state,measuredAt:'2026-10-03T02:00:00Z'};
    const receipt=require('../tools/sim-upgrade-qualification/actions.js').makeReceipt({run,route:'unknown',requested,actual:{button:{id:'future'},dispatch:'locator.click',trustedClickCount:1},before:observation,immediate:observation,after:observation,hashJSON:core.hashJSON});
    const actionRecord={...record,route:'unknown',scenario:{type:'action-sequence',operations:[requested]},actions:[{receipt}]};
    assert.deepEqual(core.validateRecord(actionRecord,run,dir),[]);
    assert.ok(core.validateRecord({...actionRecord,actions:[]},run,dir).length);
    assert.ok(core.validateRecord({...actionRecord,state:{clockSeconds:2},stateHash:core.hashJSON({clockSeconds:2})},run,dir).some(e=>e.includes('final action')));
    assert.ok(core.validateRecord({...actionRecord,scenario:{type:'action-sequence',operations:[{type:'action',action:'wrong'}]}},run,dir).some(e=>e.includes('planned operation')));
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('paired range/numeric controls have stable distinct case artifact keys', () => {
  const cases=core.scenarios('ch3-6-2',{ranges:[{id:'e',min:0,max:1}],numbers:[{id:'e',min:0,max:1}],handles:0,playback:false},'sim3');
  assert.equal(new Set(cases.map(c=>c.id)).size,cases.length);
  assert.ok(cases.some(c=>c.id==='number-e-min'));
});
test('bound HTTP handler serves hashed source bytes and fails closed after mutation', () => {
  const {createBoundHandler}=require('../tools/sim-upgrade-qualification/server.js');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'q0-server-'));
  try {
    fs.writeFileSync(path.join(dir,'index.html'),'source A');
    const snapshot=core.sourceSnapshot(dir,['index.html']),requests=[];
    const handle=createBoundHandler(dir,snapshot,requests);
    function request(url,method='GET') {const reply={};handle({url,method},{writeHead(code,headers){reply.code=code;reply.headers=headers;},end(bytes){reply.bytes=bytes;}});return reply;}
    const good=request('/index.html');assert.equal(good.code,200);assert.equal(good.bytes.toString(),'source A');assert.equal(good.headers['X-Q0-Source-SHA256'],snapshot.files[0].sha256);
    assert.equal(request('/not-bound.js').code,409);
    assert.equal(request('/index.html','POST').code,409);
    fs.writeFileSync(path.join(dir,'index.html'),'source B');assert.equal(request('/index.html').code,409);
    assert.equal(requests.filter(r=>r.status===200).length,1);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('artifact/source safe paths reject symlinks in ancestor directories', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'q0-ancestor-'));
  try {
    fs.symlinkSync('/tmp',path.join(dir,'redirect'));
    assert.throws(()=>core.safePath(dir,'redirect/out.png'));
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('collector preserves coupled-bound clamp as requested/actual evidence rather than dropping screenshot case', async () => {
  const {execute}=require('../tools/sim-upgrade-qualification/run.js');
  let current='80';const pressed=[];
  const input={evaluate:async()=> 'F1x',inputValue:async()=>current,fill:async value=>{current=value;},press:async key=>{pressed.push(key);if(key==='Enter' || key==='Tab')current='112.5';},focus:async()=>{}};
  const page={evaluate:async()=>{},locator:selector=>selector.includes('input[type="number"]') ? {count:async()=>1,nth:()=>input} : {count:async()=>0}};
  const result=await execute(page,{id:'ch1-2-3',engine:'sim2'},{type:'control',kind:'number',control:'F1x',bound:'max',value:137.5},{width:1280,height:900});
  assert.equal(result.actions[0].result.target,137.5);
  assert.equal(result.actions[0].result.after,'112.5');
  assert.equal(result.actions[0].result.targetReached,false);
  assert.equal(result.actions[0].result.constraintReview,'required');
  assert.ok(pressed.includes('Enter') && pressed.includes('Tab'));
});
test('browser observer forwards original arguments/returns and snapshots mutable bridge state', () => {
  const vm=require('node:vm'),{installObserver}=require('../tools/sim-upgrade-qualification/browser.js');
  const calls=[],original={parameters:1};
  const window={Sim2Shell:{createSimShell(arg){calls.push(arg);return {getSimulationTime:()=>0};}},Sim3Mode:{attach(){return {setState(arg){calls.push(arg);return 7;}};}},Sim3Shell:{create(){return null;}}};
  const context=vm.createContext({window});vm.runInContext(`(${installObserver.toString()})()`,context);
  const shell=window.Sim2Shell.createSimShell(original),mode=window.Sim3Mode.attach(),state={x:1};
  assert.equal(mode.setState(state),7);state.x=2;
  assert.equal(calls[0],original);assert.equal(calls[1],state);
  assert.equal(window.__Q0_OBSERVER__.shell,shell);
  assert.equal(window.__Q0_OBSERVER__.bridgeState.x,1);
});
test('control inventory preserves native step=any and declared physical step separately', () => {
  const vm=require('node:vm'),{inspectControls}=require('../tools/sim-upgrade-qualification/browser.js');
  const input={dataset:{id:'F1x',physicalStep:'1'},id:'generated-id',min:'-100',max:'100',step:'any',value:'12.345'};
  const host={querySelectorAll:selector=>selector==='input[type="range"]' ? [input]:[],querySelector:()=>null};
  const context=vm.createContext({document:{querySelector:()=>host}});
  const inventory=vm.runInContext(`(${inspectControls.toString()})()`,context);
  assert.equal(inventory.ranges[0].step,'any');assert.equal(inventory.ranges[0].physicalStep,'1');
  assert.equal(inventory.ranges[0].value,'12.345');
  assert.ok(core.SOURCE_ROOTS.includes('CoHocLyThuyet.pdf'));
});

test('U2 discovered action buttons get individual cases and stateful experiments never disappear silently',()=>{
  const controls={actions:[{id:'capture-reference'},{id:'clear-reference'},{id:'future-action'}],numbers:[{id:'F',min:2,max:20,value:'6'}],playback:true};
  const cases=core.scenarios('ch3-2-2',controls,'sim2');
  for(const id of controls.actions.map(a=>a.id))assert.ok(cases.some(c=>c.type==='action-sequence'&&c.operations.some(o=>o.type==='action'&&o.action===id)),id);
  const sequence=cases.find(c=>c.id==='experiment-newton-ab');assert.ok(sequence);
  assert.deepEqual(sequence.operations.map(o=>o.type),['steps','action','control-value','steps','action']);
  const missing=core.scenarios('ch3-2-2',{actions:[],numbers:[],playback:false},'sim2').find(c=>c.id==='experiment-newton-ab');
  assert.ok(missing.unavailableReason,'a missing intended action must remain explicitly not-run');
});
test('U2 button inventory retains stable source IDs, current labels and disabled/hidden observations',()=>{
  const vm=require('node:vm'),{inspectControls}=require('../tools/sim-upgrade-qualification/browser.js');
  const button={dataset:{action:'threshold'},textContent:'Đến ngưỡng',disabled:false,getAttribute:k=>k==='aria-label'?'Đến ngưỡng':null,getBoundingClientRect:()=>({width:80,height:30}),getClientRects:()=>[{}]};
  const host={querySelectorAll:s=>s==='button[data-action],button.sim2-action'?[button]:[],querySelector:()=>null};
  const context=vm.createContext({document:{querySelector:()=>host},getComputedStyle:()=>({visibility:'visible',display:'block',opacity:'1'})});
  const inventory=vm.runInContext(`(${inspectControls.toString()})()`,context);
  assert.equal(inventory.actions[0].id,'threshold');assert.equal(inventory.actions[0].label,'Đến ngưỡng');assert.equal(inventory.actions[0].visible,true);
});
test('U2 independently calculated projectile oracle rejects wrong actual state despite matching debug predictions',()=>{
  const {evaluateAction}=require('../tools/sim-upgrade-qualification/actions.js');
  const state={clockSeconds:0,controlValues:[{id:'v0',type:'number',value:'14'},{id:'alpha',type:'number',value:'55'}],readoutValues:[],actionValues:[],geometry:[]};
  const T=28*Math.sin(55*Math.PI/180)/9.81,t=T/2,x=14*Math.cos(55*Math.PI/180)*t,y=14*Math.sin(55*Math.PI/180)*t-4.905*t*t;
  const actual={...state,clockSeconds:t,readoutValues:Object.entries({t:t.toFixed(3),x:x.toFixed(3),y:y.toFixed(3),vx:(14*Math.cos(55*Math.PI/180)).toFixed(3),vy:'0.000',ay:'-9.810'}).map(([key,value])=>({key,value}))};
  assert.equal(evaluateAction('ch2-1-1',{type:'action',action:'apex'},state,actual,{baseline:state}).status,'pass');
  const wrong={...actual,readoutValues:actual.readoutValues.map(r=>r.key==='y'?{...r,value:'999.000'}:r),implementationDeclarations:{apexCorrect:true}};
  assert.equal(evaluateAction('ch2-1-1',{type:'action',action:'apex'},state,wrong,{baseline:state}).status,'fail');
  assert.equal(evaluateAction('unknown',{type:'action',action:'future'},state,state).status,'not-evaluated');
});
test('U2 receipt schema requires producer/source/run binding and actual observed hashes',()=>{
  const {makeReceipt,validateReceipt}=require('../tools/sim-upgrade-qualification/actions.js');
  const run={runId:'r',sourceHash:H,collectorHash:S,producerVersion:'1.2.0'},state={clockSeconds:0,readoutValues:[],controlValues:[]};
  const observation={state,measuredAt:'2026-10-03T02:00:00Z'};
  const receipt=makeReceipt({run,route:'unknown',requested:{type:'action',action:'x'},actual:{button:{id:'x'},dispatch:'locator.click',trustedClickCount:1},before:observation,immediate:observation,after:observation,hashJSON:core.hashJSON});
  assert.deepEqual(validateReceipt(receipt,run,core.hashJSON),[]);
  assert.ok(validateReceipt({...receipt,schemaVersion:999},run,core.hashJSON).length);
  for(const field of ['sourceHash','collectorHash','producerVersion','beforeStateHash','afterStateHash'])assert.ok(validateReceipt({...receipt,[field]:'wrong'},run,core.hashJSON).length,field);
  assert.ok(validateReceipt({...receipt,after:{...observation,state:{clockSeconds:9}}},run,core.hashJSON).length);
});

// This adapter reads production CPU route-handler results. It does NOT run the
// browser collector or prove trusted browser input, layout, pixels, or WebGL.
function cpuActionSurface(h) {
  const controls=[...(h.controls?.sliders||[]).map(c=>({...c,type:'number'})),...h.numberControls.map(c=>({...c,type:'number'}))];
  const selectors=['.sim2-ic-radius-guide','.sim2-action-reaction-pair','.sim2-graph-reference','.sim2-graph'];
  return {clockSeconds:h.getSimulationTime(),readoutValues:Object.entries(h.rows).map(([key,value])=>({key,value:String(value).trim()})),controlValues:controls.map(c=>({id:c.id,type:c.type,value:String(c.value)})),actionValues:h.actions.map(a=>({id:a.id,label:a.label})),geometry:selectors.flatMap(selector=>h.svg.children.filter(n=>(n.attrs.class||'').split(' ').includes(selector.slice(1))).map((n,index)=>({selector,index,visibility:n.attrs.visibility||'visible',points:n.attrs.points??null}))),playbackLabel:h.controls?.playback?(h.playing?'Tạm dừng':'Chạy'):null};
}
function cpuInventory(h) {
  return {actions:h.actions.map(a=>({id:a.id,label:a.label})),numbers:[...(h.controls?.sliders||[]),...h.numberControls].map(c=>({id:c.id,min:c.min,max:c.max,value:String(c.value)})),playback:!!h.controls?.playback};
}
test('U2 action plans/oracles execute every production action handler and stateful experiment on CPU only',()=>{
  const {mount}=require('./helpers/sim2-route-harness.cjs');
  const {actionPlans,evaluateAction}=require('../tools/sim-upgrade-qualification/actions.js');
  const seen=new Set();let operations=0;
  for(const route of core.routes().filter(r=>r.engine==='sim2')) {
    const initial=mount(route.id),inventory=cpuInventory(initial),plans=actionPlans(route.id,inventory);initial.dispose();
    for(const action of inventory.actions)assert.ok(plans.some(p=>p.operations.some(o=>o.action===action.id)),route.id+':'+action.id);
    for(const plan of plans) {
      assert.equal(plan.unavailableReason,null,route.id+':'+plan.id);
      const h=mount(route.id),baseline=cpuActionSurface(h);
      for(const op of plan.operations) {
        const before=cpuActionSurface(h);
        if(op.type==='action') {h.action(op.action);seen.add(route.id+':'+op.action);}
        else if(op.type==='control-value')h.number(op.control,op.value);
        else if(op.type==='steps')for(let i=0;i<op.steps;i++)h.controls.playback.onStep();
        else if(op.type==='playback-reset')h.controls.playback.onReset();
        else if(op.type==='play-until-paused'){h.controls.playback.onPlay();for(let ms=0;ms<=op.maxWaitMs&&h.playing;ms+=20)h.frame(ms);}
        else throw Error('Unhandled operation '+op.type);
        const immediate=cpuActionSurface(h);h.stop();const after=cpuActionSurface(h);
        const result=evaluateAction(route.id,op,before,after,{baseline,immediate});
        assert.notEqual(result.status,'fail',`${route.id} ${plan.id} ${JSON.stringify(op)}: ${JSON.stringify(result.checks.filter(c=>!c.pass))}`);
        operations++;
      }
      h.dispose();
    }
  }
  assert.ok(seen.size>=39,`covered ${seen.size} production CPU action handlers`);assert.ok(operations>100);
});

test('U2 action dispatch uses real locator click contract and retains immediate versus paused observations (CPU transport test only)',async()=>{
  const {executeExperiment}=require('../tools/sim-upgrade-qualification/run.js');
  const run={runId:'r',sourceHash:H,collectorHash:S,producerVersion:'1.2.0'},events=[],captures=[];
  let value='before',playing=false;
  const button={evaluate:async()=>({id:'future',label:'Future',text:'Future',disabled:false}),isVisible:async()=>true,isEnabled:async()=>true,click:async()=>{events.push('click');value='after';playing=true;}};
  const play={count:async()=>1,getAttribute:async()=>playing?'Tạm dừng':'Chạy',click:async()=>{playing=false;events.push('pause');}};
  const page={locator:selector=>selector.endsWith('.sim2-playpause')?play:{count:async()=>1,nth:()=>button},evaluate:async(fn)=>fn.name==='collectBrowser'?{measuredAt:'2026-10-03T02:00:00Z',state:{clockSeconds:0,readoutValues:[{key:'result',value}],controlValues:[],playbackLabel:playing?'Tạm dừng':'Chạy'}}:undefined};
  const result=await executeExperiment(page,{id:'unknown',engine:'sim2'},{type:'action-sequence',operations:[{type:'action',action:'future'}]},run,async(actions,index)=>captures.push({actions:JSON.parse(JSON.stringify(actions)),index}));
  assert.equal(result.actions.length,1);assert.deepEqual(events,['click','pause']);
  const receipt=result.actions[0].receipt;
  assert.equal(receipt.actual.button.id,'future');assert.equal(receipt.before.state.readoutValues[0].value,'before');assert.equal(receipt.immediate.state.playbackLabel,'Tạm dừng');assert.equal(receipt.after.state.playbackLabel,'Chạy');
  assert.equal(receipt.oracle.status,'not-evaluated');assert.equal(captures.length,1);
  assert.deepEqual(require('../tools/sim-upgrade-qualification/actions.js').validateReceipt(receipt,run,core.hashJSON),[]);
});
test('U2 action dispatch cannot report a hidden, disabled or ambiguous button as executed (CPU transport test only)',async()=>{
  const {executeExperiment}=require('../tools/sim-upgrade-qualification/run.js');
  for(const flags of [{visible:false,enabled:true,count:1},{visible:true,enabled:false,count:1},{visible:true,enabled:true,count:2}]) {
    let clicks=0;
    const button={evaluate:async()=>({id:'x',label:'x'}),isVisible:async()=>flags.visible,isEnabled:async()=>flags.enabled,click:async()=>{clicks++;}};
    const page={locator:()=>({count:async()=>flags.count,nth:()=>button}),evaluate:async()=>({state:{},measuredAt:'2026-10-03T02:00:00Z'})};
    await assert.rejects(()=>executeExperiment(page,{id:'unknown'},{operations:[{type:'action',action:'x'}]},{},async()=>{}));
    assert.equal(clicks,0);
  }
});

test('U2 receipt validator recomputes bounded oracles and rejects rewritten pass flags or requested/actual target drift',()=>{
  const {makeReceipt,validateReceipt}=require('../tools/sim-upgrade-qualification/actions.js');
  const run={runId:'r',sourceHash:H,collectorHash:S,producerVersion:'1.2.0'};
  const state={clockSeconds:0,controlValues:[{id:'F',type:'number',value:'12'},{id:'t',type:'number',value:'1'}],readoutValues:[{key:'J',value:'99'},{key:'dp',value:'12'},{key:'v2',value:'7'},{key:'p2',value:'14'}]},obs={state,measuredAt:'2026-10-03T02:00:00Z'};
  const receipt=makeReceipt({run,route:'ch3-5-2',requested:{type:'action',action:'equal-short'},actual:{button:{id:'equal-short'},dispatch:'locator.click',trustedClickCount:1},before:obs,immediate:obs,after:obs,hashJSON:core.hashJSON});
  assert.equal(receipt.oracle.status,'fail');
  const forged={...receipt,oracle:{...receipt.oracle,status:'pass',checks:receipt.oracle.checks.map(c=>({...c,pass:true}))}};
  assert.ok(validateReceipt(forged,run,core.hashJSON).some(e=>e.includes('oracle')));
  assert.ok(validateReceipt({...receipt,actual:{...receipt.actual,button:{id:'equal-long'}}},run,core.hashJSON).length);
});
test('U2 collision auto-pause plan crosses contact while running rather than stopping exactly by click count',()=>{
  const {actionPlans}=require('../tools/sim-upgrade-qualification/actions.js');
  const plan=actionPlans('ch3-6-2',{actions:[{id:'toggle-impact-pause'}],numbers:[],playback:true}).find(p=>p.id==='experiment-collision-pause');
  assert.ok(plan.operations.some(op=>op.type==='play-until-paused'));
  assert.ok(plan.operations.some(op=>op.type==='steps'&&op.steps<105));
});

test('U2 real plan-only entrypoint binds all five producer files and leaves actions and pixels explicitly not-run',async()=>{
  const {main}=require('../tools/sim-upgrade-qualification/run.js');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'q0-action-plan-'));
  const Module=require('node:module'),http=require('node:http'),load=Module._load,server=http.createServer;
  Module._load=function(id,...args){if(id==='playwright')throw Error('Plan must not import Playwright');return load.call(this,id,...args);};
  http.createServer=()=>{throw Error('Plan must not create a network listener');};
  try {
    assert.equal(await main(['--plan','--profile','desktop','--out',dir]),0);
    const runPath=path.join(dir,'runs',fs.readdirSync(path.join(dir,'runs'))[0]);
    const run=JSON.parse(fs.readFileSync(path.join(runPath,'run.json'),'utf8')),collector=JSON.parse(fs.readFileSync(path.join(runPath,'collector-manifest.json'),'utf8'));
    assert.equal(run.status,'not-run');assert.equal(run.producerVersion,'1.2.0');assert.equal(run.formalAcceptance,'pending');
    assert.equal(run.expectedDefaults.length,420);assert.equal(run.records.length,0);assert.equal(run.actionDiscovery.status,'not-run');assert.deepEqual(run.actionDiscovery.observations,[]);
    assert.ok(run.plannedExperiments.flatMap(r=>r.experiments).length>0);assert.ok(run.plannedExperiments.flatMap(r=>r.experiments).every(e=>e.status==='not-run'));
    assert.equal(collector.files.length,5);assert.ok(collector.files.some(f=>f.path.endsWith('/actions.js')));assert.equal(run.collectorHash,collector.sourceHash);
    assert.deepEqual(core.verifySource(core.ROOT,collector),[]);assert.ok(!fs.readdirSync(runPath).some(f=>f.endsWith('.png')));
  }finally{Module._load=load;http.createServer=server;fs.rmSync(dir,{recursive:true,force:true});}
});

test('U2 signed-field action plans include sign reversal, rest and zero-sample sequences',()=>{
  const {actionPlans}=require('../tools/sim-upgrade-qualification/actions.js');
  const {mount}=require('./helpers/sim2-route-harness.cjs'),h=mount('ch2-5-3');
  const plan=actionPlans('ch2-5-3',cpuInventory(h)).find(p=>p.id==='experiment-signed-field');
  assert.ok(plan);assert.equal(plan.unavailableReason,null);
  for(const id of ['reverse-omega','rest-field','zero-sample','reset-field'])assert.ok(plan.operations.some(o=>o.action===id));
  assert.ok(plan.operations.some(o=>o.type==='control-value'&&o.control==='omega'&&o.value<0));h.dispose();
});
test('U2 signed-field collector formula checks actual readouts and rejects inverted components or nonzero rest',()=>{
  const {evaluateAction}=require('../tools/sim-upgrade-qualification/actions.js'),{mount}=require('./helpers/sim2-route-harness.cjs');
  const h=mount('ch2-5-3');h.number('icx',-.731);h.number('icy',2.143);h.number('omega',1.25);
  const before=cpuActionSurface(h);h.action('reverse-omega');const after=cpuActionSurface(h);
  const verdict=evaluateAction('ch2-5-3',{type:'action',action:'reverse-omega'},before,after);
  assert.equal(verdict.status,'pass');assert.ok(verdict.checks.some(c=>c.key==='readout:vx'));
  const bad={...after,readoutValues:after.readoutValues.map(r=>r.key==='vx'?{...r,value:String(-parseFloat(r.value))}:r)};
  assert.equal(evaluateAction('ch2-5-3',{type:'action',action:'reverse-omega'},before,bad).status,'fail');
  h.action('rest-field');const rest=cpuActionSurface(h);
  assert.equal(evaluateAction('ch2-5-3',{type:'action',action:'rest-field'},after,rest).status,'pass');
  const badRest={...rest,readoutValues:rest.readoutValues.map(r=>r.key==='vM'?{...r,value:'1.000 m/s'}:r)};
  assert.equal(evaluateAction('ch2-5-3',{type:'action',action:'rest-field'},after,badRest).status,'fail');h.dispose();
});

test('U2 all legitimate not-run envelopes validate without screenshot evidence and retain protected v2 provenance',()=>{
  const {notRunRecord}=require('../tools/sim-upgrade-qualification/run.js');
  const run={runId:'not-run-test',sourceHash:H,collectorHash:S,producerVersion:'1.2.0'};
  const common={route:'ch3-6-2',engine:'sim3',profile:'1280-light-dpr1'};
  const cases=[
    [{...common,key:'hidden-action',scenario:{type:'action-sequence',operations:[]}},{reason:'Action is hidden in this mode'}],
    [{...common,key:'scenario-error',scenario:{type:'action-sequence',operations:[]}},{attempted:true,error:'Action locator unavailable',actions:[],failedOperation:{type:'action',action:'at-impact'},console:[]}],
    [common,{attempted:true,error:'Production route unavailable',actions:[],failedOperation:null,console:[]}]
  ];
  for(const [context,details] of cases) {
    const record=notRunRecord(run,context,details);
    assert.equal(record.schemaVersion,2);assert.equal(record.status,'not-run');assert.equal(record.formalAcceptance,'pending');
    assert.deepEqual(core.validateRecord(record,run,'/unused-no-artifact-read'),[]);
    assert.ok(core.validateRecord({...record,schemaVersion:undefined},run,'/unused-no-artifact-read').length);
  }
  const protectedRecord=notRunRecord(run,{...common,schemaVersion:9,sourceHash:'unbound'},{status:'evidence-captured',formalAcceptance:'accepted'});
  assert.deepEqual(core.validateRecord(protectedRecord,run,'/unused-no-artifact-read'),[]);
  const source=fs.readFileSync(path.join(core.ROOT,'tools/sim-upgrade-qualification/run.js'),'utf8');
  assert.equal((source.match(/run\.records\.push\(notRunRecord\(/g)||[]).length,3,'all three runtime skip/error paths share the tested constructor');
});
