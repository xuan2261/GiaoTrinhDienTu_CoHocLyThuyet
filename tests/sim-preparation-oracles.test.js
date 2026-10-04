'use strict';
// Production controls/shell/clock on recording nodes. These tests do not prove
// browser sanitization, trusted input, rendered geometry, WebGL, or acceptance.
const test=require('node:test'),assert=require('node:assert/strict');
const {mountProduction}=require('./helpers/production-sim2-dom.cjs');
const {actionPlans,evaluateAction}=require('../tools/sim-upgrade-qualification/actions.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const cases=[
 ['ch1-1-3','F','F'],['ch1-1-4','F','F'],['ch1-1-5','F1x','force1'],
 ['ch1-1-6','d','d'],['ch1-2-3','F1x','Rx'],['ch1-1-8','P','P'],
 ['ch1-3-2','alpha','alpha'],['ch1-3-6','P','P'],['ch1-5-3','beta','beta'],
 ['ch1-6-3','holeX','holeContribution'],['ch2-1-3','phase','phase'],['ch2-5-2','ax','A'],
 ['ch3-2-3','F','pairMag'],['ch3-1-3','a','aFrame'],['ch3-5-2','F','F'],['ch3-5-4','F','F']
];
const inputId=n=>n.dataset.id||n.dataset.numberFor||n.dataset.controlId||n.id;
function inputs(h){return h.nodes().filter(n=>n.tag==='input'&&['number','range'].includes(n.type));}
function surface(h){return {clockSeconds:h.shell.getSimulationTime(),controlValues:inputs(h).map(n=>({id:inputId(n),type:n.type,value:String(n.value)})),readoutValues:Object.entries(h.rows()).map(([key,value])=>({key,value:String(value).trim()})),playbackLabel:h.nodes().find(n=>n.classList.contains('sim2-playpause'))?.getAttribute('aria-label')||null};}
function inventory(h){return {actions:h.nodes().filter(n=>n.tag==='button'&&n.dataset.action).map(n=>({id:n.dataset.action})),numbers:inputs(h).filter(n=>n.type==='number').map(n=>({id:inputId(n),min:Number(n.min),max:Number(n.max),value:String(n.value)})),playback:h.nodes().some(n=>n.classList.contains('sim2-step'))};}
function number(h,id,value){const n=inputs(h).find(n=>n.type==='number'&&inputId(n)===id);assert.ok(n,id);n.value=String(value);n.emit('input');n.emit('keydown',{key:'Enter'});n.emit('change');}
function corruptControl(state,id,value){for(const c of state.controlValues)if(c.id===id)c.value=String(value);}
function assertDisposed(h){h.dispose();assert.equal(h.host.children.length,0);assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);assert.equal(h.all.reduce((n,x)=>n+Object.values(x.listeners).reduce((s,l)=>s+l.length,0),0),0);}
for(const [route,id,readout]of cases)test(route+' reset preparation has bounded control/state criteria and rejects corrupted observations',()=>{
 const h=mountProduction(route);
 try{
  const plan=actionPlans(route,inventory(h)).find(p=>p.operations[0]?.allowConstraintClamp&&p.operations[0].control===id);
  assert.ok(plan);const op=clone(plan.operations[0]),before=surface(h);number(h,id,op.value);const after=surface(h);
  const verdict=evaluateAction(route,op,before,after);
  assert.equal(verdict.status,'pass',JSON.stringify(verdict.checks.filter(c=>!c.pass)));
  assert.equal(verdict.criteria,'preparation-control-and-state-consistency');
  assert.ok(verdict.checks.length>=3);assert.deepEqual(op,plan.operations[0],'requested target stays distinct from committed value');
  const bad=clone(after);corruptControl(bad,id,op.value+1);
  assert.equal(evaluateAction(route,op,before,bad).status,'fail','consistent but incorrect companions must fail');
  const stale=clone(after);stale.readoutValues.find(r=>r.key===readout).value=before.readoutValues.find(r=>r.key===readout).value;
  assert.equal(evaluateAction(route,op,before,stale).status,'fail','stale displayed setup must fail');
  const missing=clone(after);missing.controlValues=missing.controlValues.filter(c=>!(c.id===id&&c.type==='number'));
  assert.equal(evaluateAction(route,op,before,missing).status,'fail','missing committed input must fail');
  const clock=clone(after);clock.clockSeconds=1;
  assert.equal(evaluateAction(route,op,before,clock).status,'fail','preparation must not silently advance clock');
  for(const t of [null,undefined,NaN,Infinity])assert.equal(evaluateAction(route,op,{...before,clockSeconds:t},{...after,clockSeconds:t}).status,'fail','missing/nonfinite clocks cannot establish preparation');
  const other=before.controlValues.find(c=>c.id!==id);
  if(other){const drift=clone(after);corruptControl(drift,other.id,Number(other.value)+.1);assert.equal(evaluateAction(route,op,before,drift).status,'fail','untouched controls must stay unchanged');}
 }finally{assertDisposed(h);}
});
test('coupled force setup checks nearest feasible lattice value, not just finiteness or a loose bound',()=>{
 for(const route of ['ch1-1-5','ch1-2-3']){
  const h=mountProduction(route);
  try{
   const op=actionPlans(route,inventory(h)).find(p=>p.operations[0]?.allowConstraintClamp).operations[0],before=surface(h);number(h,'F1x',op.value);const after=surface(h);
   const expected=route==='ch1-1-5'?136.6:112.5;
   assert.equal(Number(after.controlValues.find(c=>c.id==='F1x').value),expected);
   assert.notEqual(expected,op.value);
   for(const badValue of [op.value,expected-.1,expected+.1,Number(before.controlValues.find(c=>c.id==='F1x').value)]){
    const bad=clone(after);corruptControl(bad,'F1x',badValue);assert.equal(evaluateAction(route,op,before,bad).status,'fail',route+' rejects '+badValue);
   }
  }finally{assertDisposed(h);}
 }
});
test('coupled clamps depend on the untouched force and signed endpoint geometry',()=>{
 for(const [route,other,requested,expected]of [
  ['ch1-1-5',15.3,183.3,101.3],['ch1-1-5',-40,183.3,156.6],
  ['ch1-1-5',-40,-999,-50],['ch1-2-3',40,137.5,97.5],['ch1-2-3',40,-999,0]
 ]){
  const h=mountProduction(route);
  try{
   number(h,'F2x',other);const before=surface(h),op={type:'control-value',kind:'number',control:'F1x',value:requested,allowConstraintClamp:true};
   number(h,'F1x',requested);const after=surface(h);
   assert.equal(Number(after.controlValues.find(c=>c.id==='F1x').value),expected);
   assert.equal(evaluateAction(route,op,before,after).status,'pass',route+' '+other+' '+requested);
  }finally{assertDisposed(h);}
 }
});
test('angular preparation checks elapsed physical clock and independent inertia, momentum and energy',()=>{
 const h=mountProduction('ch3-5-3');
 try{
  const before=surface(h),op={type:'steps',steps:30},step=h.nodes().find(n=>n.classList.contains('sim2-step'));
  for(let i=0;i<op.steps;i++)step.click();const after=surface(h),verdict=evaluateAction('ch3-5-3',op,before,after);
  assert.equal(verdict.status,'pass',JSON.stringify(verdict.checks.filter(c=>!c.pass)));
  assert.equal(verdict.criteria,'quantitative-angular-state-and-clock');
  for(const t of [0,.49,.51,NaN,Infinity])assert.equal(evaluateAction('ch3-5-3',op,before,{...after,clockSeconds:t}).status,'fail');
  for(const key of ['r','I','omega','L','energy','work','referenceRadius','referenceInertia','referenceOmega','referenceEnergy','deltaEnergy']){
   const bad=clone(after);bad.readoutValues.find(r=>r.key===key).value='999';assert.equal(evaluateAction('ch3-5-3',op,before,bad).status,'fail',key);
  }
  const drift=clone(after);corruptControl(drift,'r',1.5);assert.equal(evaluateAction('ch3-5-3',op,before,drift).status,'fail');
  for(const steps of [-1,1.5,NaN])assert.equal(evaluateAction('ch3-5-3',{type:'steps',steps},before,after).status,'fail');
  // A captured radius is displayed to 2 decimals, so it cannot be treated as
  // exact model input when stepping. Reference readouts must be preserved.
  number(h,'r',1.713);h.nodes().find(n=>n.dataset.action==='capture-state').click();
  number(h,'r',2.127);const fractionalBefore=surface(h);
  for(let i=0;i<op.steps;i++)step.click();const fractionalAfter=surface(h);
  const fractional=evaluateAction('ch3-5-3',op,fractionalBefore,fractionalAfter);
  assert.equal(fractional.status,'pass',JSON.stringify(fractional.checks.filter(c=>!c.pass)));
  for(const key of ['referenceRadius','referenceInertia','referenceOmega','referenceEnergy']){
   const bad=clone(fractionalAfter);bad.readoutValues.find(r=>r.key===key).value='999';
   assert.equal(evaluateAction('ch3-5-3',op,fractionalBefore,bad).status,'fail','fractional '+key+' must stay captured');
  }
  const wrongDelta=clone(fractionalAfter);wrongDelta.readoutValues.find(r=>r.key==='deltaEnergy').value='0';
  assert.equal(evaluateAction('ch3-5-3',op,fractionalBefore,wrongDelta).status,'fail','fractional delta energy still needs a quantitative check');
 }finally{assertDisposed(h);}
});
test('unrecognized future preparations and actions remain explicitly not evaluated',()=>{
 const s={clockSeconds:0,controlValues:[],readoutValues:[]};
 for(const [route,op]of [['future-route',{type:'control-value',kind:'number',control:'F',value:120,allowConstraintClamp:true}],['ch1-1-3',{type:'control-value',kind:'number',control:'future-control',value:1,allowConstraintClamp:true}],['future-route',{type:'action',action:'future-action'}]])assert.equal(evaluateAction(route,op,s,s).status,'not-evaluated');
});
