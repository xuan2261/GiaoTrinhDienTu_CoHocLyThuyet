'use strict';
// Source-integration tests: production route logic/Three math, lightweight DOM.
// These assertions do not constitute browser, WebGL, or assistive-technology QA.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { mount, repo } = require('./helpers/sim2-route-harness.cjs');
const near = (a,b,t=1e-8) => assert.ok(Number.isFinite(a) && Math.abs(a-b)<=t, `${a} != ${b}`);
const num = (h,k) => parseFloat(h.rows[k]);
const routeIds = ['ch1-1-3','ch1-1-4','ch1-1-5','ch1-1-6','ch1-1-8','ch1-2-3','ch1-3-2','ch1-3-6','ch1-5-3','ch1-6-3'];
const vector = n => ({x:+n.attrs.x2-+n.attrs.x1,y:+n.attrs.y2-+n.attrs.y1});
const arcs = h => h.svg.children.filter(n => (n.attrs.class || '').includes('sim2-moment-arc'));

// Exercise the actual production shell keyboard implementation with the route's
// own options and callback. This is DOM-source integration, not a real key event.
function keyboardHarness(routeHandle) {
  const nodes=[];
  function el(tag,attrs={}) { const n={tag,attrs:{...attrs},children:[],style:{},listeners:{},classList:{add(){},remove(){},toggle(){}},
    setAttribute(k,v){this.attrs[k]=String(v);},getAttribute(k){return this.attrs[k];},appendChild(c){this.children.push(c);c.parentNode=this;return c;},insertBefore(c){return this.appendChild(c);},removeChild(c){this.children=this.children.filter(v=>v!==c);},addEventListener(k,f){this.listeners[k]=f;},removeEventListener(k){delete this.listeners[k];}};nodes.push(n);return n; }
  const win={addEventListener(){},removeEventListener(){},matchMedia(){return {matches:true};},Sim2Transform:{makeTransform(){return {toScreen:p=>p,toWorld:p=>p};}},Sim2SvgRender:{el,createSvg(){return el('svg');}},Sim2Overlay:{createOverlay(){return {resize(){},dispose(){}};}}};
  const ctx=vm.createContext({window:win,document:{createElement:el},Promise,console});
  vm.runInContext(fs.readFileSync(path.join(repo,'js/sim2/core/sim-shell.js'),'utf8'),ctx);
  const shell=win.Sim2Shell.createSimShell({container:el('root'),worldBox:{minX:-3.8,maxX:3.8,minY:-2.6,maxY:2.6}});
  let handle;
  handle=shell.addHandle(routeHandle.point,{...routeHandle.opts,onDrag(p,phase,e){routeHandle.opts.onDrag(p,phase,e);handle.move(routeHandle.point);}});
  return {key(key,shiftKey=false){handle.node.listeners.keydown({key,shiftKey,preventDefault(){}});},node:handle.node,dispose:shell.dispose};
}

function threeHarness() {
  // Reuse the repository's real-Three source harness without registering its tests.
  const file=path.join(repo,'tests/sim3-audit-regression.test.js');
  const code=fs.readFileSync(file,'utf8').split("test('Collision impact")[0];
  const ctx=vm.createContext({require,__dirname:path.dirname(file),process,console});
  vm.runInContext(code+'\nglobalThis.makeHarness=harness;',ctx,{filename:file});
  return ctx.makeHarness();
}

test('U1 Ch1: every static route provides numeric controls and reset without an animation loop',()=>{
  for(const id of routeIds){const h=mount(id);assert.ok((h.numberControls?.length || 0) + (h.controls?.sliders?.length || 0), id+' numeric controls');assert.ok(h.actions?.some(a=>a.id==='reset'),id+' reset');assert.equal(h.update,undefined,id+' remains static');h.dispose();}
});
test('U1 vector: F naming, fixed O, drag quantization and orthogonal components agree',()=>{
  const h=mount('ch1-1-3'),handle=h.handles[0];assert.match(handle.opts.a11y.label,/lực F/);assert.match(h.theory.observe,/O cố định/);
  handle.opts.onDrag({x:2.315,y:1.174},'move');const p=handle.point;
  near(Math.hypot(p.x,p.y)/.04,num(h,'F'));near(Math.atan2(p.y,p.x)*180/Math.PI,num(h,'alpha'));
  assert.match(handle.opts.a11y.valueText(p),/N.*độ/);h.dispose();
});
test('U1 moment: perpendicular arm, CCW convention, signed value and numeric d',()=>{
  const h=mount('ch1-1-4');assert.match(h.theory.observe,/vuông góc/);assert.match(h.theory.observe,/CCW/);
  h.number('d',6.5);near(num(h,'M'),num(h,'F')*6.5);assert.match(h.rows.M,/^\+/);assert.match(h.rows.direction,/ngược/);h.action('reset');near(num(h,'d'),4);h.dispose();
});
test('U1 reduction: signed M0 at O, independent force components and SI parity into 3D',()=>{
  const h=mount('ch1-1-5');assert.ok(arcs(h).length);assert.equal(arcs(h)[0].attrs['data-dir'],'cw');
  for(const [key,v] of [['F1x',0],['F1y',40],['F2x',0],['F2y',-40]])h.number(key,v);
  near(num(h,'R'),0);near(num(h,'Mo'),-160);assert.match(h.rows.system,/ngẫu lực/);
  const s=h.sim3State;near(s.resultant.Mo,s.forces.reduce((v,f)=>v+f.r.x*f.F.fy-f.r.y*f.F.fx,0));
  assert.equal(h.svg.children.find(n=>n.attrs.class==='sim2-resultant-line').attrs.visibility,'hidden');
  for(const key of ['F1x','F1y','F2x','F2y'])h.number(key,0);
  assert.equal(arcs(h)[0].attrs.visibility,'hidden');assert.match(h.rows.system,/cân bằng/);h.action('reset');near(num(h,'Mo'),-20);h.dispose();
});
test('U1 couple: true Home/End parameter bounds, meaningful ARIA and clockwise signed moment',()=>{
  const h=mount('ch1-1-6');near(num(h,'M'),-150);assert.match(h.theory.observe,/CCW/);assert.equal(arcs(h)[0].attrs['data-dir'],'cw');
  const k=keyboardHarness(h.handles[0]);
  for(const [key,d] of [['Home',1],['End',6],['Home',1],['ArrowRight',1.5]]){k.key(key);near(num(h,'d'),d);near(num(h,'M'),-50*d);near(+k.node.attrs['aria-valuenow'],d);assert.match(k.node.attrs['aria-valuetext'],/d.*m/);}
  k.key('ArrowRight',true);near(num(h,'d'),4);k.dispose();h.dispose();
});
test('U1 beam: support interpretation and independent force/moment residuals',()=>{
  const h=mount('ch1-1-8');assert.match(h.theory.observe,/khớp A/);assert.match(h.theory.observe,/gối lăn B/);
  for(const P of [20,100,200])for(const a of [.3,4,9.7]){h.slider('P',P);h.number('a',a);near(num(h,'Ra')+num(h,'Rb'),P,.11);near(num(h,'sumFy'),0);near(num(h,'sumMA'),0);near(num(h,'Ax'),0);}
  h.dispose();
});
test('U1 parallelogram: a zero vector has no angle or arrowhead, finite R components',()=>{
  const h=mount('ch1-2-3');h.handles[0].opts.onDrag({x:0,y:0},'move');assert.match(h.rows.angle,/không xác định/);assert.match(h.rows.zero,/F₁ = 0/);
  assert.equal(h.svg.children.find(n=>n.tag==='arrow').attrs.visibility,'hidden');near(num(h,'Rx'),25);near(num(h,'Ry'),70);
  h.handles[1].opts.onDrag({x:0,y:0},'move');assert.match(h.rows.resultantAngle,/không xác định/);near(num(h,'R'),0);h.dispose();
});
test('U1 ropes: fixed-length assumptions, vertical/angle cues and force balance for all 71 degrees',()=>{
  const h=mount('ch1-3-2');assert.match(h.theory.observe,/không dãn/);assert.match(h.theory.observe,/3 m/);
  assert.ok(h.svg.children.some(n=>(n.attrs.class||'').includes('sim2-angle-arc')));
  for(let a=5;a<=75;a++){h.slider('alpha',a);near(num(h,'sumFy'),0);near(num(h,'sumFx'),0);near(num(h,'ropeLength'),3);const p={...h.handles[0].point};h.handles[0].opts.onDrag(p,'start');h.handles[0].opts.onDrag(p,'end');near(num(h,'alpha'),a);}
  h.dispose();
});
test('U1 cantilever: load and support moment explicitly cancel; display arc is not rotation',()=>{
  const h=mount('ch1-3-6');assert.match(h.theory.observe,/không phải.*góc quay/);
  for(const P of [20,80,150])for(const a of [.5,5,8]){h.slider('P',P);h.slider('a',a);near(num(h,'loadMoment'),-P*a);near(num(h,'sumM'),0);near(num(h,'sumFy'),0);assert.equal(arcs(h)[0].attrs['data-dir'],'ccw');}h.dispose();
});
test('U1 friction: required reaction, normalized force components and all three static regimes',()=>{
  const h=mount('ch1-5-3');assert.match(h.theory.observe,/R cần để cân bằng/);
  for(const beta of [3,18,30,60])for(const mu of [.1,.45,1]){h.slider('beta',beta);h.slider('mu',mu);near(num(h,'Nratio'),Math.cos(beta*Math.PI/180),.00051);near(num(h,'Fratio'),Math.sin(beta*Math.PI/180),.00051);near(num(h,'ratio'),Math.tan(beta*Math.PI/180),.00051);}
  h.slider('beta',60);h.slider('mu',.1);assert.match(h.rows.state,/không tồn tại cân bằng tĩnh/);assert.match(h.rows.reactionRole,/không phải.*thực/);
  h.action('threshold');assert.match(h.rows.state,/cân bằng giới hạn/);near(h.sim3State.betaDeg,Math.atan(.1)*180/Math.PI);h.dispose();
});
test('U1 centroid: SI assumptions, x/y formulas and signed first-area contributions',()=>{
  const h=mount('ch1-6-3');assert.match(h.theory.observe,/đồng chất/);assert.match(h.theory.observe,/chiều dày đều/);assert.match(h.rows.plateArea,/m²/);assert.match(h.rows.Cx,/m/);assert.ok(h.theory.formulas.some(x=>x.includes('y_C')));
  for(const [x,y] of [[1,1],[1,3],[5,1],[5,3],[3,2]]){h.number('holeX',x);h.number('holeY',y);const a=24-Math.PI;near(num(h,'Cx'),(72-Math.PI*x)/a,.0051);near(num(h,'Cy'),(48-Math.PI*y)/a,.0051);near(num(h,'sumAx'),72-Math.PI*x,.0051);near(num(h,'sumAy'),48-Math.PI*y,.0051);near(num(h,'netArea'),a,.0051);}h.dispose();
});
test('U1 reduction 3D: separate labels, equal F/R scales and zero moment cue hidden',()=>{
  const h=threeHarness(),m=h.mount('Sim3Ch115',{forces:[{r:{x:-2,y:1},F:{fx:0,fy:0}},{r:{x:2,y:-1},F:{fx:0,fy:0}}]});
  const d=h.ctx.__SIM3_DEBUG__['ch1-1-5'];assert.equal(d.displayScales.force,d.displayScales.resultant);assert.equal(d.physics.transforms.momentCueVisible,false);assert.ok(m.shell.labels.countVisible()>=5);m.adapter.dispose();
});
test('U1 friction 3D: required-reaction components and limit classification preserve repaired cone',()=>{
  const h=threeHarness(),m=h.mount('Sim3Ch153',{betaDeg:30,mu:Math.tan(Math.PI/6)});
  const d=h.ctx.__SIM3_DEBUG__['ch1-5-3'];assert.equal(d.equilibriumState,'limiting');near(d.physics.required.normalOverWeight,Math.cos(Math.PI/6));near(d.physics.required.frictionOverWeight,.5);assert.equal(d.physics.required.role,'required-for-static-equilibrium');
  m.adapter.setState({betaDeg:60,mu:.1});assert.equal(h.ctx.__SIM3_DEBUG__['ch1-5-3'].equilibriumState,'impossible');m.adapter.dispose();
});

// Newly paired numeric inputs must use the route's declared drag quantization.
test('U1 numeric/drag round trips use one resolution, including rope click with no drag',()=>{
  const cases=[['ch1-1-3','F',67.4,'F',67],['ch1-1-3','alpha',36.4,'alpha',36],['ch1-1-4','d',2.34,'d',2.3],['ch1-1-6','d',2.3,'d',2.5],['ch1-1-8','a',4.34,'a',4.3],['ch1-3-2','alpha',30.4,'alpha',30],['ch1-3-6','a',5.2,'a',5],['ch1-6-3','holeX',3.44,null,3.4]];
  for(const [id,input,v,key,expected] of cases){const h=mount(id);h.number(input,v);if(key)near(num(h,key),expected,.00001);else near(h.handles[0].point.x,expected);const rows={...h.rows};for(const handle of h.handles){handle.opts.onDrag({...handle.point},'start');handle.opts.onDrag({...handle.point},'end');}assert.deepEqual(h.rows,rows,id+' down/up without moving is stable');h.dispose();}
});

test('U1 friction vectors: transformed N plus required friction equals required R; reuse cone for beta-only updates',()=>{
  const h=threeHarness(),mu=.45,m=h.mount('Sim3Ch153',{betaDeg:18,mu});
  let cone; m.scene.traverse(o=>{if(o.geometry?.type==='ConeGeometry' && o.geometry.parameters.openEnded)cone=o;});
  assert.ok(cone);const geometry=cone.geometry;
  const renderedVector=name=>{const o=m.scene.getObjectByName(name);assert.ok(o);return o.localToWorld(new h.T.Vector3(0,1,0)).sub(o.localToWorld(new h.T.Vector3(0,0,0)));};
  for(const betaDeg of [3,18,30,60]){m.adapter.setState({betaDeg,mu});assert.equal(cone.geometry,geometry,'beta-only update reuses cone geometry');const n=renderedVector('N-required'),f=renderedVector('Ft-required'),r=renderedVector('R-required'),p=renderedVector('weight');near(n.clone().add(f).distanceTo(r),0,1e-7);near(r.clone().add(p).length(),0,1e-7);near(n.length()/.8,Math.cos(betaDeg*Math.PI/180),1e-7);near(f.length()/.8,Math.sin(betaDeg*Math.PI/180),1e-7);}
  const phi=Math.atan(mu)*180/Math.PI;
  for(const [offset,status] of [[-.0001,'static'],[0,'limiting'],[.0001,'impossible']]){m.adapter.setState({betaDeg:phi+offset,mu});assert.equal(h.ctx.__SIM3_DEBUG__['ch1-5-3'].equilibriumState,status);}
  m.adapter.dispose();
});

test('U1 friction announces only meaningful equilibrium transitions after mount', () => {
  const h=mount('ch1-5-3');
  assert.equal((h.announcements||[]).length,0);
  h.slider('beta',19); assert.equal((h.announcements||[]).length,0);
  h.slider('beta',60); assert.match(h.announcements.at(-1),/không tồn tại cân bằng tĩnh/);
  const count=h.announcements.length;h.slider('beta',59);assert.equal(h.announcements.length,count);
  h.action('threshold');assert.match(h.announcements.at(-1),/cân bằng giới hạn/);
  h.dispose();
});
