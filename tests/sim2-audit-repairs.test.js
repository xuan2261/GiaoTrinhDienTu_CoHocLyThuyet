'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { mount, repo } = require('./helpers/sim2-route-harness.cjs');
const K = require(path.join(repo, 'js/sim2/physics/kinematics.js'));
function near(actual, expected, tol = 1e-9, message = '') {
  assert.ok(Number.isFinite(actual) && Number.isFinite(expected) && Math.abs(actual - expected) <= tol,
    `${message}: actual=${actual}, expected=${expected}, tolerance=${tol}`);
}
const arrows = h => h.svg.children.filter(n => n.tag === 'arrow');
const vector = n => ({ x: +n.attrs.x2 - +n.attrs.x1, y: +n.attrs.y2 - +n.attrs.y1 });
const steps = (h, n) => { for (let i=0; i<n; i++) h.stepOnce(); };
const reset = h => h.controls.playback.onReset();
function pointInside(h, x, y, padding = .1) {
  const b = h.cfg.worldBox;
  assert.ok(x >= b.minX + padding && x <= b.maxX - padding && y >= b.minY + padding && y <= b.maxY - padding,
    `(${x},${y}) must fit ${JSON.stringify(b)} with ${padding} padding`);
}

test('K-01: finite IC for parallel velocities and stationary endpoint; rigid-body oracle and invalid inputs', () => {
  // Generate velocities directly from v = omega * (-ry, rx), not the kernel helper.
  for (const center of [{x:0,y:0}, {x:3.2,y:-7}, {x:-1e3,y:2e3}]) {
    for (const omega of [-3, -.25, 1e-10, .4, 2]) {
      for (const offsets of [[{x:1,y:0},{x:2,y:0}], [{x:0,y:0},{x:2,y:0}], [{x:1,y:3},{x:-2,y:-4}]]) {
        const [a,b] = offsets.map(r => ({x:center.x+r.x,y:center.y+r.y}));
        const [va,vb] = offsets.map(r => ({vx:-omega*r.y,vy:omega*r.x}));
        const ic = K.locateInstantCenter(a,b,va,vb);
        assert.ok(ic, 'finite rotation must have a finite center, including IC=A');
        near(ic.x, center.x, 1e-7); near(ic.y, center.y, 1e-7);
      }
    }
  }
  const a={x:0,y:0},b={x:2,y:0};
  assert.equal(K.locateInstantCenter(a,b,{vx:1,vy:2},{vx:1,vy:2}),null,'translation: no finite center');
  assert.equal(K.locateInstantCenter(a,b,{vx:0,vy:0},{vx:0,vy:0}),null,'rest: no unique center');
  assert.equal(K.locateInstantCenter(a,a,{vx:0,vy:1},{vx:0,vy:2}),null,'coincident points do not determine rotation');
  assert.equal(K.locateInstantCenter(a,b,{vx:1,vy:0},{vx:2,vy:1}),null,'stretching is not rigid-body motion');
  assert.equal(K.locateInstantCenter(a,b,{vx:NaN,vy:1},{vx:0,vy:2}),null,'nonfinite input rejected');
});

test('R2D-01: Newton physical x/v/work-energy and continuous time through graph wrap', () => {
  for (const [F,m] of [[6,2],[20,1],[2,6]]) {
    const h=mount('ch3-2-2'); h.slider('F',F); h.slider('m',m);
    for (const count of [60,169,240,600]) {
      reset(h); steps(h,count); const t=count/60,a=F/m;
      near(parseFloat(h.rows.x), .5*a*t*t,.051, 'physical x');
      near(parseFloat(h.rows.v), a*t,.051,'physical v');
      near(h.clock.getSimulationTime(),t,1e-10,'clock time');
      near(parseFloat(h.rows.t),t,.0051,'physical time readout');
      const graph = h.svg.children.find(n => n.attrs.class === 'sim2-graph');
      const points = graph.attrs.points.trim().split(' ').map(p => p.split(',').map(Number));
      assert.ok(points.length <= 170, 'scrolling graph keeps a bounded history');
      for (const [x,y] of points) { assert.ok(x >= -1e-9 && x <= 9+1e-9); assert.ok(y >= -2.5-1e-9 && y <= -.5+1e-9); }
      // Independent work/energy check uses readout rounding tolerance.
      near(F*parseFloat(h.rows.x),.5*m*Math.pow(a*t,2),F*.051,'F*x = delta kinetic energy');
    }
    const before={...h.rows}; h.draw(); h.frame(1e9); assert.deepEqual(h.rows,before,'paused render never advances physics');
    h.controls.playback.onPlay(); h.frame(100); h.frame(200);
    near(h.clock.getSimulationTime(),10.1,1e-10); h.controls.playback.onPause();
    h.frame(200000); near(h.clock.getSimulationTime(),10.1,1e-10,'paused time excluded');
    reset(h); near(parseFloat(h.rows.x),0); near(parseFloat(h.rows.v),0); near(h.clock.getSimulationTime(),0);
    h.dispose(); h.stepOnce(); near(h.clock.getSimulationTime(),0,1e-12,'disposed route remains stopped');
  }
});

test('R2D-02: support reaction moment cancels load moment and SVG sweep agrees', () => {
  const h=mount('ch1-3-6');
  for(const P of [20,80,150]) for(const a of [.5,5,8]) {
    h.slider('P',P);h.slider('a',a);
    near(parseFloat(h.rows.R)-P,0); near(parseFloat(h.rows.M)-P*a,0);
    const arc=h.svg.children.find(n=>n.attrs.class==='sim2-moment-arc');
    const sign=arc.attrs['data-dir']==='ccw'?1:-1;
    near(sign*parseFloat(h.rows.M)-P*a,0,1e-9,'signed moment equilibrium');
    assert.match(arc.attrs.d,/ A \S+ \S+ 0 1 0 /,'CCW reaction must use SVG sweep 0');
  }
});

test('R2D-03: IC velocity magnitudes obey one angular speed, including IC=A endpoint', () => {
  const h=mount('ch2-5-2');
  for(let i=0;i<=90;i++) {
    const ax=-3+i*.05, bx=2,by=Math.sqrt(25-(bx-ax)**2);
    h.handles[0].opts.onDrag({x:ax,y:0},'move');
    const [a,b]=arrows(h),va=vector(a),vb=vector(b);
    near((vb.x-va.x)*(bx-ax)+(vb.y-va.y)*by,0,1e-9,'(vB-vA) dot AB = 0');
    const omega=vb.y/(bx-ax); assert.ok(omega>0 && Number.isFinite(omega));
    near(va.x,omega*by);near(va.y,0);near(vb.x,0);
    if(i===0) { near(Math.hypot(va.x,va.y),0); assert.equal(a.attrs.visibility,'hidden','zero velocity has no marker head'); }
    else assert.notEqual(a.attrs.visibility,'hidden');
    const mark=h.svg.children.find(n=>n.attrs.class==='sim2-current-marker');
    near(+mark.attrs.cx,ax);near(+mark.attrs.cy,by);
  }
});

test('R2D-04: rope slider/geometry/drag/ARIA round trips without pointer movement', () => {
  const h=mount('ch1-3-2'),handle=h.handles[0];let previousX=-Infinity;
  for (const alpha of [5,30,49,60,75]) {
    h.slider('alpha',alpha);const point={...handle.point};assert.ok(point.x>previousX);previousX=point.x;
    near(handle.opts.a11y.valueFromPoint(point),alpha,1e-9,'ARIA equals physical alpha');
    for(const phase of ['start','end','move','start','end']) handle.opts.onDrag({...handle.point},phase);
    near(parseFloat(h.rows.alpha),alpha);near(parseFloat(h.rows.T),Number((50/Math.cos(alpha*Math.PI/180)).toFixed(1)),.051);
    near(handle.point.x,point.x);near(handle.point.y,point.y);
  }
  for(const alpha of [5,30,49,60,75]) {
    h.slider('alpha',alpha);const p={...handle.point};h.slider('alpha',30);handle.opts.onDrag(p,'move');
    near(parseFloat(h.rows.alpha),alpha);near(handle.opts.a11y.valueFromPoint(handle.point),alpha,1e-9);
  }
});

function collisionOracle(m1,m2,e,t) {
  const hit=(7-1.4)/3.2, v1=(m1*2.2-m2-3.2*m2*e)/(m1+m2), v2=(m1*2.2-m2+3.2*m1*e)/(m1+m2);
  return {hit,v1,v2,p1:-4+2.2*Math.min(t,hit)+(t>hit?v1*(t-hit):0),p2:3-Math.min(t,hit)+(t>hit?v2*(t-hit):0)};
}
test('R2D-05: impact consumes full dt; independent piecewise trajectory, contact snapshot and invariants', () => {
  for(const [m1,m2] of [[2,3],[1,5],[5,1]]) for(const e of [0,.7,1]) for(const dt of [1/60,.04,.07,.25]) {
    const h=mount('ch3-6-2');h.slider('m1',m1);h.slider('m2',m2);h.slider('e',e);
    let elapsed=0;for(let n=0;n<Math.ceil(2/dt);n++) {h.step(dt);elapsed+=dt;}
    const s=h.sim3State,o=collisionOracle(m1,m2,e,elapsed);
    near(s.p1.x,o.p1,1e-10,'p1 at end of full dt');near(s.p2.x,o.p2,1e-10,'p2 at end of full dt');
    near(s.v1.x,o.v1);near(s.v2.x,o.v2);
    near(m1*s.v1.x+m2*s.v2.x,m1*2.2-m2);near(s.v2.x-s.v1.x,e*3.2);
    const loss=.5*m1*2.2**2+.5*m2-.5*m1*s.v1.x**2-.5*m2*s.v2.x**2;
    near(loss,.5*m1*m2/(m1+m2)*(1-e*e)*3.2**2);
    assert.ok(s.impactContact,'impact contact is distinct from current end-step position');
    near(s.impactContact.p2.x-s.impactContact.p1.x,1.4);
    near(s.impactPoint.x-s.impactContact.p1.x,.6);near(s.impactContact.p2.x-s.impactPoint.x,.8);
    const before=JSON.stringify(s);h.draw();assert.equal(JSON.stringify(h.sim3State),before,'draw does not advance');
    reset(h);near(h.sim3State.p1.x,-4);near(h.sim3State.p2.x,3);assert.equal(h.sim3State.collided,false);
    assert.equal(h.sim3State.impactContact,null);
  }
});

test('R2D-06: 1000 collision/reset cycles retain only active overlay labels; dispose releases them', () => {
  const h=mount('ch3-6-2');h.resetLayoutReads();h.overlay.reflow();const initialReads=h.layoutReads();
  assert.equal(initialReads,4);
  for(let i=0;i<1000;i++) {h.step(1.8);reset(h);}
  h.resetLayoutReads();h.overlay.resize(100,100);
  assert.equal(h.layoutReads(),initialReads,'layout work is bounded independently of reset count');
  assert.equal(h.overlay.layer.children.length,2,'only mass labels remain attached');
  const temporary = h.overlay.label('temporary', {x:1,y:1});
  h.overlay.removeLabel(temporary);h.overlay.removeLabel(temporary);
  h.resetLayoutReads();h.overlay.reflow();assert.equal(h.layoutReads(),initialReads,'removeLabel is idempotent');
  h.dispose();h.resetLayoutReads();h.overlay.reflow();assert.equal(h.layoutReads(),0);assert.equal(h.root.children.length,0);
});

test('R2D-07/projectile: all vector endpoints fit including immediately before touchdown', () => {
  for(const v0 of [8,14,20]) for(const alpha of [20,45,55,80]) {
    const h=mount('ch2-1-1');h.slider('v0',v0);h.slider('alpha',alpha);
    const flight=2*v0*Math.sin(alpha*Math.PI/180)/9.81;
    for(let i=0;i<=100;i++) {
      reset(h);h.step(flight*i/100*(1-1e-8));
      for(const a of arrows(h)) {pointInside(h,+a.attrs.x1,+a.attrs.y1,.15);pointInside(h,+a.attrs.x2,+a.attrs.y2,.15);}
    }
  }
});

test('R2D-07/gears: every circle fits at all radius boundaries with stroke padding', () => {
  const h=mount('ch2-3-2');
  for(const r1 of [.8,1.4,2.5]) for(const r2 of [.8,2,2.5]) {
    h.slider('r1',r1);h.slider('r2',r2);
    for(const c of h.svg.children.filter(n=>n.attrs.class==='sim2-transmission-gear'||n.attrs.class==='sim2-transmission-pulley')) {
      for(const [x,y] of [[+c.attrs.cx-+c.attrs.r,+c.attrs.cy],[+c.attrs.cx+ +c.attrs.r,+c.attrs.cy],[+c.attrs.cx,+c.attrs.cy-+c.attrs.r],[+c.attrs.cx,+c.attrs.cy+ +c.attrs.r]]) pointInside(h,x,y,.2);
    }
  }
});

test('R2D-07/IC: whole rigid bar, velocity arrows and center fit through handle domain', () => {
  const h=mount('ch2-5-2');
  for(let i=0;i<=90;i++) {
    h.handles[0].opts.onDrag({x:-3+.05*i,y:0},'move');
    for(const n of [h.svg.children[0],...arrows(h)]) {pointInside(h,+n.attrs.x1,+n.attrs.y1,.2);pointInside(h,+n.attrs.x2,+n.attrs.y2,.2);}
  }
});


test('R2D-05: collision with real fixed-step clock preserves pause/reset and 2-second position', () => {
  const h=mount('ch3-6-2');steps(h,120);const o=collisionOracle(2,3,.7,2);
  near(h.clock.getSimulationTime(),2);near(h.sim3State.p1.x,o.p1);near(h.sim3State.p2.x,o.p2);
  const paused=JSON.stringify(h.sim3State);h.frame(1e9);h.draw();assert.equal(JSON.stringify(h.sim3State),paused);
  h.controls.playback.onPlay();h.frame(100);h.frame(200);h.controls.playback.onPause();
  near(h.clock.getSimulationTime(),2.1);near(h.sim3State.p1.x,collisionOracle(2,3,.7,2.1).p1);
  h.slider('e',1);assert.equal(h.playing,false);near(h.clock.getSimulationTime(),0);
  near(h.sim3State.p1.x,-4);assert.equal(h.sim3State.impactPoint,null);
});
