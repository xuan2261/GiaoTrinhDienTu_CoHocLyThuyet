'use strict';
// Production route integration with independent closed-form SI oracles.
// The recording DOM is not browser/WebGL or assistive-technology acceptance.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mount } = require('./helpers/sim2-route-harness.cjs');
const near = (a,b,t=1e-7) => assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=t,`${a} != ${b} (±${t})`);
const value=(h,k)=>parseFloat(h.rows[k]);
function action(h,id) { const a=(h.controls.actions||[]).find(a=>a.id===id); assert.ok(a,`missing action ${id}`); a.onClick(); }
function poly(h,cls) { return h.svg.children.find(n=>n.attrs.class===cls); }
function points(n) { return n.attrs.points.split(' ').filter(Boolean).map(s=>s.split(',').map(Number)); }

test('U1/Newton: A/B shares fixed SI axes, independent acceleration, and retains both parameter sets',()=>{
 const h=mount('ch3-2-2'); h.step(1); near(value(h,'x'),1.5,.0001); near(value(h,'v'),3,.0001);
 action(h,'capture-reference'); h.slider('F',20); h.slider('m',1); h.step(1);
 near(value(h,'x'),10,.0001); near(value(h,'v'),20,.0001);
 assert.match(h.rows.reference,/6 N.*2 kg/); assert.match(h.rows.graphScale,/56.*2[.,]8/);
 const a=points(poly(h,'sim2-graph-reference')),b=points(poly(h,'sim2-graph'));
 near(a[a.length-1][1]+2.5,3/56*2); near(b[b.length-1][1]+2.5,20/56*2);
 h.step(20); assert.ok(points(poly(h,'sim2-graph')).length<=170); assert.match(h.rows.graphScale,/56/);
});

test('U1/oscillator: continuous physical time, exact overlay, energy and 100-cycle independent oracle',()=>{
 for(const [k,m] of [[1,4],[4,1],[12,.5]]) {
  const h=mount('ch3-3-1'); h.slider('k',k);h.slider('m',m);
  const w=Math.sqrt(k/m),T=2*Math.PI/w,end=100*T,dt=1/60;
  let elapsed=0; while(elapsed<end-1e-12){ const d=Math.min(dt,end-elapsed);h.update(d);elapsed+=d;}h.draw();
  near(value(h,'t'),end,.00001);near(value(h,'period'),T,.00001);
  near(value(h,'x'),2*Math.cos(w*end),.0002); near(value(h,'v'),-2*w*Math.sin(w*end),.003);
  near(value(h,'energy'),2*k,.001); assert.ok(value(h,'error')<.0002);
  assert.ok(points(poly(h,'sim2-graph')).length<=400); assert.ok(points(poly(h,'sim2-graph-exact')).length>20);
  action(h,'one-cycle'); near(value(h,'t'),T,.00001); near(value(h,'x'),2,.00001); assert.equal(h.playing,false);
 }
});

test('U1/impulse: physical fixed axes and independent momentum/velocity; equal impulse experiment',()=>{
 const h=mount('ch3-5-2');
 for(const [F,t] of [[12,1],[6,2],[3,4],[20,4]]){h.slider('F',F);h.slider('t',t);
 near(value(h,'m'),2);near(value(h,'v1'),1);near(value(h,'v2'),1+F*t/2);
 near(value(h,'p1'),2);near(value(h,'p2'),2+F*t);near(value(h,'J'),F*t);near(value(h,'dp'),F*t);
 const p=points(poly(h,'sim2-graph')); near(p[p.length-1][0],t/4*4); near(p[p.length-1][1],-2+(2+F*t)/82*1.5);
 assert.ok(poly(h,'sim2-force-area'));
 } action(h,'equal-short'); near(value(h,'J'),12); action(h,'equal-long');near(value(h,'J'),12);
});

test('U1/work: independent displayed kinetic energies and physically dimensioned force-distance area',()=>{
 const h=mount('ch3-5-4');for(const F of [1,4,15]){h.slider('F',F);
 near(value(h,'m'),2);near(value(h,'v1'),1); near(value(h,'v2'),Math.sqrt(1+6*F),.00001);
 near(value(h,'T1'),1);near(value(h,'T2'),1+6*F);near(value(h,'W'),6*F);near(value(h,'dT'),6*F);
 const p=points(poly(h,'sim2-work-area'));near(p[2][0],7);near(p[2][1],-2.5+F/15*1.5);
 }assert.match(h.theory.observe,/cùng hướng/);
});

test('U1/frame equilibrium: tension components and inertial/ground FBD share one state',()=>{
 const h=mount('ch3-1-3');for(const a of [0,3,8]){h.slider('a',a);const s=h.sim3State;
 near(s.tension,Math.hypot(9.81,a));near(s.tension*Math.cos(s.theta),9.81);near(s.tension*Math.sin(s.theta),a);
 near(s.gravity.y,-9.81);near(s.tensionForce.x,a);near(s.tensionForce.y,9.81);
 } action(h,'frame-ground');assert.equal(h.sim3State.referenceFrame,'ground');assert.match(h.rows.balance,/ma/);
 action(h,'frame-car');assert.equal(h.sim3State.referenceFrame,'car');assert.match(h.rows.model,/cân bằng tương đối/);
});

test('U1/action reaction: names identify receiving objects and subsystem selectors never claim equilibrium',()=>{
 const h=mount('ch3-2-3');assert.match(h.handles[0].opts.a11y.label,/A tác dụng lên B/);
 for(const F of [20,60,80]){h.slider('F',F);near(value(h,'FAB'),F);near(value(h,'FBA'),-F);assert.match(h.rows.sum,/nội lực/);}
 action(h,'fbd-a');assert.match(h.rows.system,/Vật A/); action(h,'fbd-b');assert.match(h.rows.system,/Vật B/);action(h,'fbd-system');assert.match(h.theory.observe,/không.*cân bằng/);
});

test('U1/angular momentum: radial keyboard semantics, continuous angle, work is change in rotational energy',()=>{
 const h=mount('ch3-5-3');h.step(.7);const phi=h.sim3State.phi;action(h,'capture-state');h.slider('r',1.5);
 near(h.sim3State.phi,phi);near(value(h,'I'),9);near(value(h,'omega'),4);near(value(h,'energy'),72);near(value(h,'work'),54);
 assert.match(h.rows.L,/kg·m²\/s/);const a=h.handles[0].opts.a11y,p=a.pointFromValue(2.2);near(Math.hypot(p.x,p.y),2.2);near(Math.atan2(p.y,p.x),phi);
 near(value(h,'referenceEnergy'),18);assert.match(h.theory.observe,/xuyên tâm/);
});

test('U1/collision: before/contact/after event steps, independent impulses/loss, pause exact and retained result',()=>{
 for(const e of [0,.7,1]){const h=mount('ch3-6-2');h.slider('e',e);
 action(h,'before-impact');assert.equal(h.sim3State.collided,false);assert.ok(h.sim3State.time<1.75);
 action(h,'at-impact');near(h.sim3State.time,1.75);assert.equal(h.sim3State.eventPhase,'impact');near(h.sim3State.p2.x-h.sim3State.p1.x,1.4);
 const v1=(2*2.2-3-3*3.2*e)/5,v2=(2*2.2-3+2*3.2*e)/5;
 near(value(h,'v1After'),v1,.00001);near(value(h,'v2After'),v2,.00001);near(value(h,'J1'),2*(v1-2.2),.00001);near(value(h,'J2'),3*(v2+1),.00001);
 near(value(h,'lossPredict'),.5*6/5*(1-e*e)*3.2**2,.00001);
 action(h,'after-impact');assert.equal(h.sim3State.eventPhase,'after');near(h.sim3State.time,1.8);
 const contact=JSON.stringify(h.sim3State.impactContact);h.step(100);assert.equal(h.sim3State.collided,true);assert.equal(JSON.stringify(h.sim3State.impactContact),contact);assert.match(h.rows.phase,/kết quả/);
 h.controls.playback.onReset(); action(h,'toggle-impact-pause');h.controls.playback.onPlay();h.step(2);assert.equal(h.playing,false);near(h.sim3State.time,1.75);near(h.clock.getSimulationTime(),1.75);
 }
});

// Real vendored r160 geometry and production adapters. Only shell/DOM/GPU are
// stand-ins; these tests deliberately make no pixels, WebGL, or FPS claims.
function adapterHarness(name,file) {
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const {repo}=require('./helpers/sim2-route-harness.cjs');
 const root=vm.createContext({console,Math});
 const run=f=>vm.runInContext(fs.readFileSync(path.join(repo,f),'utf8'),root,{filename:f});
 run('lib/three/three.umd.min.js'); const T=root.THREE;assert.equal(T.REVISION,'160');
 for(const f of ['coordinate-system','three-primitives','visual-kit'])run(`js/sim3/core/${f}.js`);
 let scene,labels;
 root.Sim3Shell={create(opts){scene=new T.Scene();labels=new Map();const layer={add(id,text,target){const el={textContent:text,target};labels.set(id,el);return el;},countVisible(){return labels.size;}};
 const shell={scene,labels:layer,setState(){scene.updateMatrixWorld(true);},projectMargin(){return 0;},projectBounds(){return {fillRatio:0};},projectDistance(a,b){return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);},resize(){},dispose(){}};
 opts.setup({THREE:T,scene,camera:new T.PerspectiveCamera(45,1.5,.1,100),labels:layer});return shell;}};
 run('js/sim3/sims/'+file);const adapter=root[name].create({host:{}});
 return {root,adapter,scene,labels,geometryIds(){const ids=[];scene.traverse(o=>{if(o.geometry)ids.push(o.geometry.uuid);});return ids;}};
}

test('U1/paired frame 3D: actual force arrows share uncapped scale and ground view hides only fictitious force',()=>{
 const m=adapterHarness('Sim3Ch313','ch3-1-3-3d.js');const s=mount('ch3-1-3');
 for(const a of [0,3,8]){s.slider('a',a);m.adapter.setState(s.sim3State);const d=m.root.__SIM3_DEBUG__['ch3-1-3'].physics;
 near(d.gravityArrow.magnitude,9.81);near(d.tensionArrow.magnitude,Math.hypot(a,9.81));near(d.tensionArrow.displayLength,.05*Math.hypot(a,9.81));near(d.gravityArrow.displayLength,.05*9.81);
 near(d.groundForceSum.x,a);near(d.groundForceSum.y,0);near(d.forceArrow.magnitude,a);
 const before=m.geometryIds();m.adapter.setState(s.sim3State);assert.deepEqual(m.geometryIds(),before,'unchanged state reuses force/cord/arc geometry');
 }action(s,'frame-ground');m.adapter.setState(s.sim3State);const d=m.root.__SIM3_DEBUG__['ch3-1-3'].physics;assert.equal(d.forceArrow.visible,false);assert.equal(d.gravityArrow.visible,true);assert.equal(d.tensionArrow.visible,true);
});

test('U1/paired angular 3D: geometry reused, visible energy is SI and independent of display radius',()=>{
 const m=adapterHarness('Sim3Ch353','ch3-5-3-3d.js'),s=mount('ch3-5-3');m.adapter.setState(s.sim3State);const ids=m.geometryIds();
 for(const r of [.8,1.5,3,3.5]){s.slider('r',r);m.adapter.setState(s.sim3State);const d=m.root.__SIM3_DEBUG__['ch3-5-3'].physics;near(d.rotationalEnergy,162/(r*r));near(d.angularMomentum,36);near(d.radius,r*.62);assert.match(m.labels.get('energy').textContent,/J$/);assert.deepEqual(m.geometryIds(),ids);}
});

test('U1/paired collision 3D: phase and contact snapshot survive impact-step remainder and late mount',()=>{
 const s=mount('ch3-6-2');action(s,'after-impact');const m=adapterHarness('Sim3Ch362','ch3-6-2-3d.js');m.adapter.setState(s.sim3State);
 let d=m.root.__SIM3_DEBUG__['ch3-6-2'];near(d.impactContactResidual,0);assert.equal(d.phaseCue,'after');assert.ok(d.physics.sourceSeparation>1.4);
 action(s,'at-impact');m.adapter.reset();m.adapter.setState(s.sim3State);d=m.root.__SIM3_DEBUG__['ch3-6-2'];assert.equal(d.phaseCue,'impact');assert.equal(d.capturePhase,'at-impact');assert.equal(m.labels.get('impact').textContent,'Đúng tiếp xúc');near(d.physics.time,1.75);near(d.impactContactResidual,0);
 s.step(100);m.adapter.setState(s.sim3State);d=m.root.__SIM3_DEBUG__['ch3-6-2'];assert.equal(d.phaseCue,'retained');near(d.impactContactResidual,0);assert.equal(m.labels.get('impact').textContent,'Giữ kết quả');
});

test('U1/collision: real fixed-step event pause keeps physical clock aligned and retained step is inert',()=>{
 const h=mount('ch3-6-2');action(h,'toggle-impact-pause');h.controls.playback.onPlay();
 for(let ms=0;ms<=2000;ms+=100)h.frame(ms);
 near(h.sim3State.time,1.75);near(h.clock.getSimulationTime(),1.75);assert.equal(h.playing,false);assert.equal(h.sim3State.eventPhase,'impact');
 h.controls.playback.onStep();near(h.sim3State.time,1.75+1/60);near(h.clock.getSimulationTime(),1.75+1/60);
 h.step(100);const time=h.sim3State.time;h.controls.playback.onStep();near(h.sim3State.time,time);near(h.clock.getSimulationTime(),time);
});

test('U1/handle controls: physical drag snapping matches scalar slider resolution and ARIA values',()=>{
 for(const [route,min,max,step]of [['ch3-1-3',0,8,.5],['ch3-2-3',20,80,5],['ch3-5-2',2,20,1],['ch3-5-3',.8,3.5,.1],['ch3-5-4',1,15,1]]){
  const h=mount(route),handle=h.handles[0],a=handle.opts.a11y;
  for(const target of [min,min+step*.2,min+step*.8,max]){const p=a.pointFromValue(target);handle.opts.onDrag(p,'move');const v=a.valueFromPoint(handle.point);near(v/step,Math.round(v/step));assert.ok(v>=min-1e-9&&v<=max+1e-9);assert.match(a.valueText(handle.point),route==='ch3-1-3'?/m\/s²/:route==='ch3-5-3'?/m; L/:/N/);}
 }
});

test('U1/collision: meaningful event announcements occur once, never on redraw frames',()=>{
 const h=mount('ch3-6-2');assert.equal((h.announcements||[]).length,0);
 h.step(1.8);assert.equal(h.announcements.length,1);assert.match(h.announcements[0],/Va chạm tại 1.75/);
 for(let i=0;i<20;i++)h.draw();h.step(.1);assert.equal(h.announcements.length,1);
 h.step(100);assert.equal(h.announcements.length,2);assert.match(h.announcements[1],/giữ kết quả/);
 h.controls.playback.onReset();assert.equal(h.announcements.length,3);assert.match(h.announcements[2],/Đã đặt lại/);
 action(h,'at-impact');assert.equal(h.announcements.length,4);assert.match(h.announcements[3],/đúng tiếp xúc/);
});

test('U1/numeric-to-handle: decimal parameters survive pointer start/end and identical move replay',()=>{
 for(const [route,id,key,value]of [['ch3-1-3','a','aFrame',3.25],['ch3-2-3','F','FAB',61],['ch3-5-2','F','F',6.25],['ch3-5-3','r','r',1.55],['ch3-5-4','F','F',4.25]]){
  const h=mount(route);h.slider(id,value);near(parseFloat(h.rows[key]),value,1e-12);
  const handle=h.handles[0],p={...handle.point};
  for(const phase of ['start','end','move','move','start','end']){
   handle.opts.onDrag({...p},phase);near(parseFloat(h.rows[key]),value,1e-12);near(handle.opts.a11y.valueFromPoint(handle.point),value,1e-12);
  }
  const next=value+handle.opts.a11y.step;handle.opts.onDrag(handle.opts.a11y.pointFromValue(next),'keyboard');near(parseFloat(h.rows[key]),next,1e-12);
 }
});
