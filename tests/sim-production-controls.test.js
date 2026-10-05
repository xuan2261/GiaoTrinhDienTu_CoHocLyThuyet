'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {mountProduction}=require('./helpers/production-sim2-dom.cjs');
const routes=require('../js/sim2/sim2-route-manifest');
for(const {id} of routes)test(`production core/route controls: ${id}`,()=>{
 const h=mountProduction(id);assert.ok(Object.keys(h.rows()).length>0);
 const numbers=h.nodes().filter(n=>n.type==='number');assert.ok(numbers.length>0,`${id}: numeric equivalent exists`);
 for(const n of numbers){
  const before=h.rows(),initial=String(n.value);n.value='';n.emit('input');assert.deepEqual(h.rows(),before,'incomplete draft cannot mutate state');n.emit('change');assert.equal(String(n.value),initial,'empty commit reverts current value');
  const value=(Number(n.min)+Number(n.max))/2;n.value=String(value);n.emit('keydown',{key:'Enter'});
  assert.ok(Number.isFinite(Number(n.value)),'committed value finite');
  assert.ok(Number(n.value)>=Number(n.min)-1e-8&&Number(n.value)<=Number(n.max)+1e-8,'committed value stays in stated domain');
  for(const [key,text] of Object.entries(h.rows()))assert.doesNotMatch(text,/NaN|Infinity/,`${id}: ${key}`);
  const range=h.nodes().find(e=>e.type==='range'&&e.getAttribute('data-id')===n.getAttribute('data-number-for'));
  if(range)assert.equal(Number(range.value),Number(n.value),'native controls share committed parameter');
 }
 const before=h.rows(),mode=h.nodes().find(n=>n.dataset.mode==='3d');
 if(mode){mode.click();assert.equal(h.shell.root.style.display,'none');assert.deepEqual(h.rows(),before);for(const n of numbers){let p=n;while(p){assert.notEqual(p,h.shell.root,'numeric controls must not be hidden with2D root');p=p.parentNode;}}h.nodes().find(n=>n.dataset.mode==='2d').click();assert.deepEqual(h.rows(),before);}
 const read=h.nodes().find(n=>n.classList.contains('sim2-read-current'));assert.ok(read);read.click();assert.ok(h.nodes().some(n=>n.getAttribute('role')==='status'&&n.textContent.length>0));
 h.dispose();assert.equal(h.host.children.length,0,'dispose clears all owned host nodes');assert.equal(h.frames.size,0,'dispose clears queued RAF');assert.equal(h.timers.size,0,'dispose clears owned timers');
 for(const node of h.all)assert.equal(Object.values(node.listeners).reduce((n,list)=>n+list.length,0),0,'all owned node/window listeners removed');
 const after=h.rows();for(const n of numbers){n.value='2';n.emit('change');}assert.deepEqual(h.rows(),after,'orphan controls no longer call model');
});

for(const {id} of routes)test(`production U1 action handlers and no-motion handles: ${id}`,()=>{
 const h=mountProduction(id);
 // Actual production button callbacks and controls, with no browser-layout claim.
 const step=h.nodes().find(n=>n.classList.contains('sim2-step'));if(step)for(let i=0;i<60;i++)step.click();
 const actions=h.nodes().filter(n=>n.getAttribute('data-action')!==null);
 for(const action of actions){action.click();for(const [key,text] of Object.entries(h.rows()))assert.doesNotMatch(text,/NaN|Infinity/,`${id}/${action.getAttribute('data-action')}/${key}`);}
 const handles=h.nodes().filter(n=>n.classList.contains('sim2-handle'));
 for(const handle of handles){const before=h.rows();handle.emit('pointerdown',{pointerId:7,button:0});h.root.emit('pointerup',{pointerId:7});assert.deepEqual(h.rows(),before,'selecting a handle without movement must not alter physical readouts');}
 h.dispose();assert.equal(h.host.children.length,0);assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);
});

for(const {id} of routes)test(`production fractional controls preserve no-motion state: ${id}`,()=>{
 const h=mountProduction(id);const mode=h.nodes().find(n=>n.dataset.mode==='3d');if(mode)mode.click();
 for(const n of h.nodes().filter(n=>n.type==='number')){n.value=String(Number(n.min)+(Number(n.max)-Number(n.min))*.37193);n.emit('keydown',{key:'Enter'});}
 for(const handle of h.nodes().filter(n=>n.classList.contains('sim2-handle'))){const before=h.rows();handle.emit('pointerdown',{pointerId:31,button:0});h.root.emit('pointercancel',{pointerId:31});assert.deepEqual(h.rows(),before,'click/cancel at fractional state must not silently snap');}
 h.dispose();
});

for(const id of ['ch3-1-3','ch3-2-3','ch3-5-2','ch3-5-4'])test(`static reset restores all physical and display choices: ${id}`,()=>{
 const h=mountProduction(id),baseline=h.rows();const inputs=h.nodes().filter(n=>n.type==='number'),values=inputs.map(n=>Number(n.value));
 for(const n of inputs){n.value=String(n.max);n.emit('keydown',{key:'Enter'});}
 const change=h.nodes().find(n=>['frame-ground','fbd-a','equal-long'].includes(n.getAttribute('data-action')));if(change)change.click();
 assert.notDeepEqual(h.rows(),baseline,'setup must change the experiment');
 const reset=h.nodes().find(n=>n.getAttribute('data-action')==='reset');assert.ok(reset,'explicit static reset must exist');reset.click();
 assert.deepEqual(h.rows(),baseline);assert.deepEqual(inputs.map(n=>Number(n.value)),values);
 reset.click();assert.deepEqual(h.rows(),baseline,'reset is repeatable');h.dispose();
});
