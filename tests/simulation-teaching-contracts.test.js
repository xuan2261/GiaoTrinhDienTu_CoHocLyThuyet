'use strict';
// Independent technical checks, not human academic certification or empirical
// measurement. The production routes/kernels are the system under test. Expected
// values below use closed-form mechanics, finite differences, force balance or
// decoded rendered geometry, never production physics helpers or debug pass flags.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { mount, repo } = require('./helpers/sim2-route-harness.cjs');
const document = JSON.parse(fs.readFileSync(process.env.SIM2_TEACHING_SPEC_PATH || path.join(repo, 'data/simulation-specifications.json'), 'utf8'));
const byId = new Map(document.specifications.map(s => [s.id, s]));
const near = (a, b, tolerance = 1e-9) => assert.ok(Number.isFinite(a) && Math.abs(a - b) <= tolerance, `${a} != ${b} within ${tolerance}`);
const number = (h, key) => { assert.ok(Object.hasOwn(h.rows, key), `missing readout ${key}`); return Number.parseFloat(h.rows[key]); };
const read = (h, key, expected, digits) => near(number(h, key), expected, 0.5 * 10 ** -digits + 1e-9);
const xy = n => ({ x: Number(n.attrs.x2) - Number(n.attrs.x1), y: Number(n.attrs.y2) - Number(n.attrs.y1) });
const points = n => n.attrs.points.split(' ').filter(Boolean).map(p => p.split(',').map(Number));
const element = (h, cls) => { const n = h.svg.children.find(n => (n.attrs.class || '').split(' ').includes(cls)); assert.ok(n, cls); return n; };
const using = (id, run) => { const h = mount(id); try { run(h); } finally { h.dispose(); } };
const parameter = (id, min, max, step, unit, initial) => ({ id, min, max, step, unit, initial });
const p = parameter;
// These are the declared product domains, including nominal slider steps. Numeric
// input precision/quantization is separately documented, not inferred from step.
const controls = {
  'ch1-1-3': [p('F',10,120,1,'N',100),p('alpha',0,90,1,'°',35)],
  'ch1-1-4': [p('F',10,100,5,'N',50),p('d',.5,6.5,.1,'m',4)],
  'ch1-1-5': [p('F1x',-50,183.3,.1,'N',40),p('F1y',-150,83.3,.1,'N',20),p('F2x',-183.3,50,.1,'N',-20),p('F2y',-83.3,150,.1,'N',40)],
  'ch1-1-6': [p('d',1,6,.5,'m',3)],
  'ch1-2-3': [p('F1x',0,137.5,.1,'N',80),p('F1y',0,137.5,.1,'N',20),p('F2x',0,137.5,.1,'N',25),p('F2y',0,137.5,.1,'N',70)],
  'ch1-1-8': [p('P',20,200,10,'N',100),p('a',.3,9.7,.1,'m',4)],
  'ch1-3-2': [p('alpha',5,75,1,'°',30)],
  'ch1-3-6': [p('P',20,150,10,'N',80),p('a',.5,8,.5,'m',5)],
  'ch1-5-3': [p('beta',3,60,'any','°',18),p('mu',.1,1,'any','',.45)],
  'ch1-6-3': [p('holeX',1,5,.1,'m',4.5),p('holeY',1,3,.1,'m',2.5)],
  'ch2-1-1': [p('v0',8,20,1,'m/s',14),p('alpha',20,80,5,'°',55)],
  'ch2-1-3': [p('phase',0,360,.1,'°',.7*180/Math.PI)],
  'ch2-2-2': [p('omega0',0,2,.1,'rad/s',.5),p('alphaAcc',0,.5,.05,'rad/s²',.15)],
  'ch2-3-2': [p('r1',.8,2.5,.1,'m',1.4),p('r2',.8,2.5,.1,'m',2)],
  'ch2-4-4': [p('omega',.4,2.5,.1,'rad/s',1.2),p('vRel',.5,3,.1,'m/s',1.5)],
  'ch2-5-2': [p('ax',-3,1.5,.1,'m',-2),p('omega',.1,.4,.01,'rad/s',.4)],
  'ch2-5-3': [p('omega',-2.5,2.5,.1,'rad/s',1),p('icx',-4,4,.1,'m',-1),p('icy',-3,3,.1,'m',-1)],
  'ch3-2-2': [p('F',2,20,1,'N',6),p('m',1,6,.5,'kg',2)],
  'ch3-2-3': [p('F',20,80,5,'N',60)],
  'ch3-1-3': [p('a',0,8,.5,'m/s²',3)],
  'ch3-3-1': [p('k',1,12,1,'N/m',4),p('m',.5,4,.5,'kg',1)],
  'ch3-5-2': [p('F',2,20,1,'N',6),p('t',.5,4,.5,'s',2)],
  'ch3-5-3': [p('r',.8,3.5,.1,'m',3)],
  'ch3-5-4': [p('F',1,15,1,'N',4)],
  'ch3-6-2': [p('e',0,1,.05,'',.7),p('m1',1,5,.5,'kg',2),p('m2',1,5,.5,'kg',3)]
};
const noReset = new Set(); // All 25 routes now have an explicit reset or playback reset.
for (const [id, expected] of Object.entries(controls)) {
  test(`contract ${id}: explicit SI, actual controls/reset, and honest calculation provenance`, () => using(id, h => {
    const s = byId.get(id);
    assert.ok(s, `${id}: specification`);
    assert.equal(s.status, 'draft'); assert.equal(s.evidence.verified, false);
    assert.deepEqual(s.controls.parameters, expected, `${id}: explicit control domain and initial state`);
    const actual = [...(h.controls?.sliders || []), ...h.numberControls].map(c => p(c.id,c.min,c.max,c.step,c.unit,c.value));
    assert.deepEqual(actual, expected, `${id}: production controls match the independent domain`);
    assert.ok(Object.keys(s.formula.quantityUnits || {}).length >= 2, `${id}: dimensional quantity map, not generic SI placeholder`);
    assert.ok(!/SI units where|SI-style scalar/.test(JSON.stringify([s.formula,s.assumptions])), `${id}: actual units and assumptions`);
    assert.ok(s.assumptions.length >= 2 && s.assumptions.every(a => a.length > 15));
    assert.equal(s.readoutSemantics.experimentalMeasurement, false, `${id}: computed readout is not experimental measurement`);
    assert.ok(s.readoutSemantics.derivation.length > 30 && s.readoutSemantics.comparisonLimit.length > 30);
    assert.equal(s.oracle.independentTest, 'tests/simulation-teaching-contracts.test.js');
    assert.ok(s.boundaryChecks.length >= 3);
    assert.ok(s.controls.numericPolicy.length > 30);
    assert.ok(!/as described by the route/.test(s.controls.reset));
    if (noReset.has(id)) { assert.equal(s.controls.resetMode, 'none'); assert.ok(!h.controls?.playback); assert.ok(!h.actions.some(a=>/reset/.test(a.id))); }
    else { assert.notEqual(s.controls.resetMode,'none'); assert.ok(h.controls?.playback || h.actions.some(a=>/reset/.test(a.id))); }
  }));
}

test('math ch1-1-3: displayed force components and arrow encode the prescribed input', () => using('ch1-1-3', h => {
  for (const F of [10,73,120]) for (const deg of [0,35,90]) {
    h.number('F',F);h.number('alpha',deg); const q=deg*Math.PI/180;
    read(h,'Fx',F*Math.cos(q),1);read(h,'Fy',F*Math.sin(q),1);
    const v=xy(h.svg.children.find(n=>n.tag==='arrow'));
    near(v.x/.04,F*Math.cos(q));near(v.y/.04,F*Math.sin(q));near(Math.hypot(v.x,v.y)/.04,F);
  }
}));

test('math ch1-1-4: perpendicular arm gives signed CCW moment, not an arbitrary input angle', () => using('ch1-1-4', h => {
  for (const F of [10,55,100]) for (const d of [.5,4.2,6.5]) {
    h.number('F',F);h.number('d',d); const ar=h.svg.children.find(n=>n.tag==='arrow'), f=xy(ar);
    const moment=Number(ar.attrs.x1)*(f.y/.03)-Number(ar.attrs.y1)*(f.x/.03);
    read(h,'M',F*d,1);near(moment,F*d);assert.equal(element(h,'sim2-moment-arc').attrs['data-dir'],'ccw');
  }
}));

test('math ch1-1-5: force and moment reduction uses fixed application points, including a pure couple', () => using('ch1-1-5', h => {
  for (const values of [[40,20,-20,40],[0,40,0,-40],[0,0,0,0],[20,-20,-10,30]]) {
    ['F1x','F1y','F2x','F2y'].forEach((id,i)=>h.number(id,values[i]));
    const [fx1,fy1,fx2,fy2]=values;
    read(h,'Rx',fx1+fx2,1);read(h,'Ry',fy1+fy2,1);read(h,'Mo',-2*fy1-fx1+2*fy2+fx2,1);
    if(values.every(v=>v===0))assert.match(h.rows.system,/cân bằng/);
    if(fx1===0&&fy1===40)assert.match(h.rows.system,/ngẫu lực thuần/);
  }
}));

test('math ch1-1-6: signed couple is independent of the chosen moment origin', () => using('ch1-1-6', h => {
  for(const d of [1,3,6]) {
    h.number('d',d);const arrows=h.svg.children.filter(n=>n.tag==='arrow');
    for(const origin of [{x:0,y:0},{x:13,y:-7},{x:-8,y:3}]) {
      const M=arrows.reduce((sum,a)=>{const f=xy(a);return sum+(Number(a.attrs.x1)-origin.x)*f.y/.04-(Number(a.attrs.y1)-origin.y)*f.x/.04;},0);
      near(M,-50*d);read(h,'M',M,1);
    }
    read(h,'sumF',0,0);
  }
}));

test('math ch1-2-3: zero vectors have no angle; nonzero parallelogram obeys cosine law', () => using('ch1-2-3', h => {
  for(const f of [[20,10,30,40],[0,0,30,40],[0,0,0,0],[100,0,0,100]]) {
    ['F1x','F1y','F2x','F2y'].forEach((id,i)=>h.number(id,f[i]));
    const [x1,y1,x2,y2]=f, square=x1*x1+y1*y1+x2*x2+y2*y2+2*(x1*x2+y1*y2);
    read(h,'R',Math.sqrt(square),1);read(h,'Rx',x1+x2,1);read(h,'Ry',y1+y2,1);
    if(!Math.hypot(x1,y1)||!Math.hypot(x2,y2))assert.match(h.rows.angle,/không xác định/);
  }
}));

test('math ch1-1-8: actual reaction arrows balance the load and moment over the allowed beam', () => using('ch1-1-8', h => {
  for(const P of [20,110,200])for(const a of [.3,5,9.7]){
    h.number('P',P);h.number('a',a);
    const reactions=h.svg.children.filter(n=>(n.attrs.class||'').includes('sim2-support-reaction'));
    const [A,B]=reactions.map(n=>xy(n).y/.02);near(A+B,P);near(B*10-P*a,0);
    read(h,'Ra',P*(10-a)/10,1);read(h,'Rb',P*a/10,1);read(h,'sumFy',0,6);read(h,'sumMA',0,6);
  }
}));

test('math ch1-3-2: tension follows geometry-derived direction cosines for all 71 rope angles', () => using('ch1-3-2', h => {
  for(let deg=5;deg<=75;deg++){
    h.number('alpha',deg);const rope=h.svg.children.filter(n=>n.tag==='line')[2], d=xy(rope), L=Math.hypot(d.x,d.y);
    near(L,3);near(d.y/L,Math.cos(deg*Math.PI/180));read(h,'T',100*L/(2*d.y),1);read(h,'ropeLength',L,3);read(h,'sumFy',0,6);
  }
}));

test('math ch1-3-6: support moment cancels the signed load moment', () => using('ch1-3-6', h => {
  for(const P of [20,80,150])for(const a of [.5,5,8]){
    h.number('P',P);h.number('a',a);read(h,'R',P,1);read(h,'loadMoment',-P*a,1);read(h,'M',P*a,1);
    read(h,'sumM',0,6);read(h,'sumFy',0,6);assert.equal(element(h,'sim2-moment-arc').attrs['data-dir'],'ccw');
  }
}));

test('math ch1-5-3: normalized required forces balance, but infeasible static reaction is not sliding dynamics', () => using('ch1-5-3', h => {
  for(const mu of [.1,.45,1])for(const deg of [3,18,60]){
    h.number('mu',mu);h.number('beta',deg);const q=deg*Math.PI/180;
    read(h,'Nratio',Math.cos(q),3);read(h,'Fratio',Math.sin(q),3);read(h,'ratio',Math.tan(q),3);
    const n=xy(element(h,'sim2-normal-required')),f=xy(element(h,'sim2-friction-required')),w=xy(element(h,'sim2-weight-line'));
    near(n.x+f.x+w.x,0);near(n.y+f.y+w.y,0);near(Math.hypot(n.x,n.y)/2.2,Math.cos(q));
    if(Math.tan(q)>mu)assert.match(h.rows.reactionRole,/không phải/);
  }
  for(const mu of [.1,.45,1]){
    h.number('mu',mu);h.action('threshold');near(h.sim3State.betaDeg,Math.atan(mu)*180/Math.PI);assert.equal(h.sim3State.equilibriumState,'limiting');
    for(const offset of [-1e-5,1e-5]){h.number('beta',Math.atan(mu)*180/Math.PI+offset);assert.equal(h.sim3State.equilibriumState,offset<0?'static':'impossible');}
  }
}));

test('math ch1-6-3: negative-area centroid and first moments use m, m² and m³ correctly', () => using('ch1-6-3', h => {
  for(const [x,y] of [[1,1],[5,1],[1,3],[5,3],[3,2]]){
    h.number('holeX',x);h.number('holeY',y);const area=24-Math.PI,cx=(72-Math.PI*x)/area,cy=(48-Math.PI*y)/area;
    read(h,'Cx',cx,2);read(h,'Cy',cy,2);read(h,'sumAx',area*cx,2);read(h,'sumAy',area*cy,2);read(h,'netArea',area,2);
    assert.match(h.rows.sumAx,/m³$/);assert.match(h.rows.netArea,/m²$/);assert.match(h.rows.Cx,/ m$/);
  }
}));

test('math ch2-1-1: complementary launch angles, exact apex and touchdown use physical SI state', () => using('ch2-1-1', h => {
  for(const v of [8,14,20])for(const deg of [20,45,70,80]){
    h.number('v0',v);h.number('alpha',deg);const q=deg*Math.PI/180,T=2*v*Math.sin(q)/9.81;
    h.action('apex');read(h,'x',v*Math.cos(q)*T/2,3);read(h,'y',v*v*Math.sin(q)**2/(2*9.81),3);read(h,'vy',0,3);read(h,'ay',-9.81,3);
    h.action('touchdown');read(h,'t',T,3);read(h,'x',v*v*Math.sin(2*q)/9.81,3);read(h,'y',0,3);assert.equal(h.playing,false);
    const end={...h.rows};h.step(10);assert.deepEqual(h.rows,end);
  }
  h.number('alpha',20);const range20=number(h,'range');h.number('alpha',70);near(number(h,'range'),range20,.001);
}));

test('math ch2-1-3: Frenet frame comes from independent derivatives, not a unit acceleration arrow', () => using('ch2-1-3', h => {
  for(const deg of [0,40,90,140,180,270,359,360]){
    h.number('phase',deg);const s=h.sim3State,q=deg*Math.PI/180,vx=-4*Math.sin(q),vy=2.5*Math.cos(q),ax=-4*Math.cos(q),ay=-2.5*Math.sin(q),v=Math.hypot(vx,vy);
    const at=(vx*ax+vy*ay)/v,an=10/v,R=v**3/10;
    near(s.aTangential,at);near(s.aNormal,an);near(s.radius,R);near(s.tangent.x*s.normal.x+s.tangent.y*s.normal.y,0);
    near(s.tangent.x*at+s.normal.x*an,ax);near(s.tangent.y*at+s.normal.y*an,ay);read(h,'curvature',1/R,4);
  }
}));

test('math ch2-2-2: constant angular acceleration has tangential and nonzero centripetal terms', () => using('ch2-2-2', h => {
  for(const w0 of [0,.5,2])for(const alpha of [0,.15,.5])for(const t of [0,1,10]){
    h.number('omega0',w0);h.number('alphaAcc',alpha);h.step(t);const s=h.sim3State,w=w0+alpha*t,q=w0*t+alpha*t*t/2;
    near(s.phi,q);near(s.omega,w);near(s.velocity.x,-3*w*Math.sin(q));near(s.velocity.y,3*w*Math.cos(q));
    near(s.accelerationNormal.x,-3*w*w*Math.cos(q));near(s.accelerationNormal.y,-3*w*w*Math.sin(q));
    near(s.aTangential,3*alpha);read(h,'acceleration',Math.hypot(3*alpha,3*w*w),3);
  }
}));

test('math ch2-3-2: signed no-slip ratios and observed marker speed agree across unequal/equal radii', () => using('ch2-3-2', h => {
  for(const [r1,r2] of [[.8,2.5],[2.5,.8],[1.4,2],[1,1]]){
    h.number('r1',r1);h.number('r2',r2);
    read(h,'gearRatio12',-r2/r1,3);read(h,'beltRatio12',r2/r1,3);read(h,'gearRatio21',-r1/r2,3);read(h,'beltRatio21',r1/r2,3);
    for(const time of [.3,2,5,10,20]){
      h.controls.playback.onReset();h.step(time);const before={...h.sim3State.beltMarker};h.step(1e-5);const after=h.sim3State.beltMarker;
      near(Math.hypot(after.x-before.x,after.y-before.y)/1e-5,r1,1e-5);
    }
  }
}));

test('math ch2-4-4: position differentiation independently checks full acceleration including inward radial motion', () => using('ch2-4-4', h => {
  for(const w of [.4,1.2,2.5])for(const vmax of [.5,1.5,3])for(const phase of [0,.7,Math.PI/2,Math.PI,3*Math.PI/2]){
    const t=phase*1.5/vmax;h.number('omega',w);h.number('vRel',vmax);h.step(t);const s=h.sim3State;
    const pos=u=>{const r=2+1.5*Math.sin(vmax*u/1.5);return {x:r*Math.cos(w*u),y:r*Math.sin(w*u)};};
    const e=1e-4,lo=pos(t-e),at=pos(t),hi=pos(t+e);
    near(s.vAbsolute.x,(hi.x-lo.x)/(2*e),3e-7);near(s.vAbsolute.y,(hi.y-lo.y)/(2*e),3e-7);
    near(s.aAbsolute.x,(hi.x-2*at.x+lo.x)/e**2,3e-6);near(s.aAbsolute.y,(hi.y-2*at.y+lo.y)/e**2,3e-6);
    near(s.aCor.x*s.vRelVec.x+s.aCor.y*s.vRelVec.y,0,1e-8);
  }
}));

test('math ch2-5-2: independently decoded endpoint velocities obey rigid-rod compatibility and finite IC', () => using('ch2-5-2', h => {
  for(const ax of [-3,-2,0,1.5])for(const w of [.1,.4]){
    h.number('ax',ax);h.number('omega',w);const dy=Math.sqrt(25-(2-ax)**2),arrows=h.svg.children.filter(n=>n.tag==='arrow');
    const va=xy(arrows[0]),vb=xy(arrows[1]);near(va.x,w*dy);near(va.y,0);near(vb.x,0);near(vb.y,w*(2-ax));
    near((vb.x-va.x)*(2-ax)+(vb.y-va.y)*dy,0);read(h,'PA',dy,3);read(h,'PB',2-ax,3);read(h,'ratio',dy/(2-ax),3);
    near(Number(element(h,'sim2-current-marker').attrs.cx),ax);near(Number(element(h,'sim2-current-marker').attrs.cy),dy);
  }
}));

test('math ch2-5-3: sample table is calculated from physical coordinates, not capped arrows or empirical measurements', () => using('ch2-5-3', h => {
  for(const [x,y] of [[-4,-3],[-4,3],[4,-3],[4,3],[2,1.5],[-1,-1]])for(const w of [-2.5,-.3,0,.3,2.5]){
    h.number('icx',x);h.number('icy',y);h.number('omega',w);const s=h.sim3State,rx=2-x,ry=1.5-y;
    near(s.vM.vx,-w*ry);near(s.vM.vy,w*rx);read(h,'r',Math.hypot(rx,ry),3);read(h,'vM',Math.abs(w)*Math.hypot(rx,ry),3);
    for(const m of s.measurements){near(m.velocity.x,-w*(m.point.y-y));near(m.velocity.y,w*(m.point.x-x));near(m.radius,Math.hypot(m.point.x-x,m.point.y-y));}
  }
  h.action('rest-field');assert.equal(h.sim3State.omega,0);assert.match(h.rows.ICStatus,/không duy nhất/);
  h.action('reset-field');h.action('reverse-omega');near(h.sim3State.omega,-1);read(h,'vM',Math.hypot(3,2.5),3);
}));

test('math ch3-1-3: frame changes do not change relative equilibrium; force triangle has actual SI values', () => using('ch3-1-3', h => {
  for(const a of [0,3.25,8]){
    h.number('a',a);const s=h.sim3State;near(s.tension,Math.hypot(a,9.81));near(Math.tan(s.theta),a/9.81);
    near(s.tensionForce.x,a);near(s.tensionForce.y,9.81);near(Math.hypot(s.bob.x-s.pivot.x,s.bob.y-s.pivot.y),3);
    const before=JSON.stringify(s.bob);h.action('frame-ground');assert.equal(JSON.stringify(h.sim3State.bob),before);h.action('frame-car');
    near(s.gravity.y+s.tensionForce.y,0);near(s.fIner.fx+s.tensionForce.x,0);
  }
  h.action('reset');near(h.sim3State.aFrame,3);assert.equal(h.sim3State.referenceFrame,'car');
}));

test('math ch3-2-2: Newton solution and A/B graph scale remain physical after wrapping', () => using('ch3-2-2', h => {
  for(const [F,m] of [[2,6],[6,2],[20,1],[6.25,2.5]])for(const time of [1,2.8,8]){
    h.number('F',F);h.number('m',m);h.step(time);const a=F/m;
    read(h,'x',a*time*time/2,4);read(h,'v',a*time,4);read(h,'a',a,1);
    const last=points(element(h,'sim2-graph')).at(-1),tg=Math.min(time,2.8);near(last[0],tg/2.8*9);near(last[1],-2.5+a*tg/56*2);
  }
  h.action('capture-reference');const saved=element(h,'sim2-graph-reference').attrs.points;h.number('F',2);assert.equal(element(h,'sim2-graph-reference').attrs.points,saved);
}));

test('math ch3-2-3: forces are attached to distinct recipients and their internal sum is zero', () => using('ch3-2-3', h => {
  for(const F of [20,62.5,80]){
    h.number('F',F);const [onB,onA]=h.svg.children.filter(n=>n.tag==='arrow');near(Number(onB.attrs.x1),1.5);near(Number(onA.attrs.x1),-1.5);
    near(xy(onB).x/.03,F);near(xy(onA).x/.03,-F);read(h,'FAB',F,8);read(h,'FBA',-F,8);
    h.action('fbd-a');assert.equal(onB.attrs.visibility,'hidden');h.action('fbd-b');assert.equal(onA.attrs.visibility,'hidden');h.action('fbd-system');
  }
  assert.match(h.theory.observe,/không suy ra từng vật cân bằng/);
  h.action('reset');read(h,'FAB',60,8);assert.match(h.rows.system,/Hệ A\+B/);
}));

test('math ch3-3-1: RK4 numerical solution is compared with a separate analytic solution at non-periodic times', () => using('ch3-3-1', h => {
  for(const [k,m] of [[1,4],[4,1],[12,.5]]){
    h.number('k',k);h.number('m',m);const w=Math.sqrt(k/m),end=13.375*2*Math.PI/w;let t=0;
    while(t<end-1e-12){const dt=Math.min(1/60,end-t);h.update(dt);t+=dt;}h.draw();
    near(number(h,'x'),2*Math.cos(w*end),.0004);near(number(h,'v'),-2*w*Math.sin(w*end),.0004);near(number(h,'energy'),2*k,.00011);
    read(h,'exact',2*Math.cos(w*end),6);read(h,'period',2*Math.PI/w,6);
    assert.match(h.rows.energy,/ J$/);assert.match(h.theory.observe,/không cản\/ngoại lực/);
  }
}));

test('math ch3-5-2: momentum slope and force-time area are predictions of the same constant-force model', () => using('ch3-5-2', h => {
  for(const [F,t] of [[2,.5],[12,1],[3,4],[20,4],[6.25,1.75]]){
    h.number('F',F);h.number('t',t);read(h,'v2',1+F*t/2,3);read(h,'J',F*t,1);read(h,'dp',F*t,3);
    const graph=points(element(h,'sim2-graph')),start=graph[0],end=graph.at(-1),area=points(element(h,'sim2-force-area'));
    const slope=(end[1]-start[1])*82/1.5/((end[0]-start[0])*4/4);near(slope,F);
    const integral=(area[2][0]-area[0][0])*4/4*(area[1][1]-area[0][1])*20/1.5;near(integral,F*t);
  }
  h.action('equal-short');const short=number(h,'v2');h.action('equal-long');near(number(h,'v2'),short);
  h.action('reset');read(h,'F',6,8);read(h,'t',2,8);
}));

test('math ch3-5-3: radial edit preserves phase and L, while required work equals the rotational energy difference', () => using('ch3-5-3', h => {
  h.step(.73);const phase=h.sim3State.phi;
  for(const r of [.8,1.5,3,3.5,1.55]){
    h.number('r',r);near(h.sim3State.phi,phase);near(h.sim3State.inertia,4*r*r);near(h.sim3State.omega,9/(r*r));near(h.sim3State.angularMomentum,36);
    read(h,'energy',162/(r*r),5);read(h,'work',162/(r*r)-18,5);
  }
  h.number('r',3);h.action('capture-state');h.number('r',1.5);read(h,'deltaEnergy',54,5);
}));

test('math ch3-5-4: work predicts final speed; recalculated kinetic energy is an identity, not independent measurement', () => using('ch3-5-4', h => {
  for(const F of [1,4,15,4.25]){
    h.number('F',F);const speed=Math.sqrt(1+6*F);read(h,'v2',speed,6);read(h,'W',6*F,1);read(h,'T2',1+6*F,3);read(h,'dT',6*F,3);
    const a=points(element(h,'sim2-work-area'));near((a[2][0]-a[0][0])*(a[1][1]-a[0][1])*10,6*F);
  }
  assert.match(h.theory.observe,/v₂ là dự đoán/);
  h.action('reset');read(h,'F',4,8);
}));

test('math ch3-6-2: independent center-of-mass collision oracle checks before/contact/after and unequal masses', () => using('ch3-6-2', h => {
  for(const [m1,m2] of [[1,5],[2,3],[5,1]])for(const e of [0,.7,1]){
    h.number('m1',m1);h.number('m2',m2);h.number('e',e);
    const total=m1+m2,u=(2.2*m1-m2)/total,v1=u-e*m2/total*3.2,v2=u+e*m1/total*3.2,loss=.5*m1*m2/total*(1-e*e)*3.2**2;
    h.action('before-impact');near(h.sim3State.v1.x,2.2);near(h.sim3State.v2.x,-1);read(h,'energyLoss',0,2);
    h.action('at-impact');const s=h.sim3State;near(s.time,1.75);near(s.p1.x,-.15);near(s.p2.x,1.25);near(s.v1.x,v1);near(s.v2.x,v2);
    read(h,'lossPredict',loss,6);read(h,'deltaEnergy',-loss,6);read(h,'J1',m1*(v1-2.2),6);read(h,'J2',m2*(v2+1),6);
    h.action('after-impact');near(h.sim3State.p1.x,-.15+.05*v1);near(h.sim3State.p2.x,1.25+.05*v2);read(h,'energyLoss',loss,2);
    near(h.sim3State.impactContact.p2.x-h.sim3State.impactContact.p1.x,1.4);
  }
}));
