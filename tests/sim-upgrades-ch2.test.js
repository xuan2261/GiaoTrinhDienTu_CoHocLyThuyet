'use strict';
// Production-route integration and analytical oracles. CPU surfaces do not prove browser/GPU/AT acceptance.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mount, repo } = require('./helpers/sim2-route-harness.cjs');
const near = (a,b,tol=1e-9) => assert.ok(Number.isFinite(a) && Math.abs(a-b)<=tol, `${a} != ${b} within ${tol}`);
const num = (h,k) => parseFloat(h.rows[k]);
const action = (h,id) => { const a = (h.controls?.actions || []).find(a=>a.id===id); if(a) a.onClick(); else h.action(id); };
const reset = h => h.controls.playback.onReset();

test('U1 projectile reaches exact touchdown, pauses, retains result, and seeks apex/replay', () => {
  for(const v0 of [8,14,20]) for(const alpha of [20,45,80]) {
    const h=mount('ch2-1-1');h.slider('v0',v0);h.slider('alpha',alpha);
    const T=2*v0*Math.sin(alpha*Math.PI/180)/9.81, R=v0*v0*Math.sin(2*alpha*Math.PI/180)/9.81;
    h.controls.playback.onPlay(); h.step(T+1);
    near(num(h,'t'),T,.00051);near(num(h,'x'),R,.00051);near(num(h,'y'),0,.00051);
    assert.equal(h.playing,false); assert.match(h.rows.phase,/chạm đất/i); near(h.clock.getSimulationTime(),T);
    const done={...h.rows};h.step(10);assert.deepEqual(h.rows,done,'touchdown must remain until explicit replay');
    action(h,'apex');near(num(h,'t'),T/2,.00051);near(num(h,'vy'),0,.00051);near(num(h,'ay'),-9.81,.00051);
    action(h,'touchdown');near(num(h,'x'),R,.00051);action(h,'replay');near(num(h,'t'),0);assert.equal(h.playing,true);
    h.slider('v0',8);assert.equal(h.playing,false,'parameter change is a new paused experiment');h.dispose();
  }
});

test('U1 ellipse phase controls preserve SI differential geometry at all quadrants and seam', () => {
  const h=mount('ch2-1-3');
  for(const deg of [0,90,180,270,359,360,0]) {
    h.slider('phase',deg);const s=h.sim3State,q=deg*Math.PI/180;
    const vx=-4*Math.sin(q),vy=2.5*Math.cos(q),ax=-4*Math.cos(q),ay=-2.5*Math.sin(q),speed=Math.hypot(vx,vy);
    near(s.point.x,4*Math.cos(q));near(s.point.y,2.5*Math.sin(q));near(s.radius,speed**3/10,1e-8);
    near(s.tangent.x*s.normal.x+s.tangent.y*s.normal.y,0);near(s.aTangential,(vx*ax+vy*ay)/speed);
    near(s.aNormal,10/speed);near(Math.hypot(s.center.x-s.point.x,s.center.y-s.point.y),s.radius);
    assert.match(h.rows.v,/m\/s/);assert.match(h.rows.R,/ m$/);assert.match(h.theory.observe,/1 rad\/s/);
    const before=JSON.stringify(s);h.draw?.();assert.equal(JSON.stringify(h.sim3State),before);
  }
  h.dispose();
});

test('U1 rotation exposes independent SI v/a components and caps, including uniform rotation', () => {
  const h=mount('ch2-2-2');
  for(const w0 of [0,.5,2]) for(const alpha of [0,.15,.5]) for(const t of [0,1,10]) {
    h.slider('omega0',w0);h.slider('alphaAcc',alpha);h.step(t);const s=h.sim3State,w=w0+alpha*t,q=w0*t+.5*alpha*t*t;
    near(s.time,t);near(s.speed,3*w);near(s.aTangential,3*alpha);near(s.aNormal,3*w*w);
    near(s.velocity.x*3*Math.cos(q)+s.velocity.y*3*Math.sin(q),0,1e-8);
    near(s.accelerationTangential.x*s.accelerationNormal.x+s.accelerationTangential.y*s.accelerationNormal.y,0,1e-8);
    assert.equal(s.displayCaps.velocity,3*w*.2>1.8);assert.match(h.rows.aNormal,/m\/s²/);
  }
  action(h,'toggle-tangential');assert.equal(h.sim3State.showTangential,false);action(h,'toggle-normal');assert.equal(h.sim3State.showNormal,false);
  h.controls.playback.onPlay();h.slider('omega0',1);assert.equal(h.playing,false);near(h.sim3State.time,0);h.dispose();
});

test('U1 transmission has explicit signed reciprocal ratios and SI no-slip readouts', () => {
  const h=mount('ch2-3-2');
  for(const r1 of [.8,1.4,2.5]) for(const r2 of [.8,2,2.5]) {
    h.slider('r1',r1);h.slider('r2',r2);const s=h.sim3State;
    near(s.gearOmega2,-r1/r2);near(s.beltOmega2,r1/r2);near(s.gearRatio12,-r2/r1);near(s.beltRatio12,r2/r1);
    near(s.beltSpeed,r1);near(s.omega1*r1,s.beltOmega2*r2);assert.match(h.rows.r1,/ m$/);assert.match(h.rows.beltV,/m\/s/);
    assert.match(h.theory.observe,/răng.*minh họa/i);
  }
  h.controls.playback.onPlay();h.slider('r1',1);assert.equal(h.playing,false);h.dispose();
});

test('U1 Coriolis component sum equals independent second derivative and reset semantics match', () => {
  const h=mount('ch2-4-4');
  for(const w of [.4,1.2,2.5]) for(const vm of [.5,1.5,3]) for(const t of [0,.7,1.5*Math.PI/(2*vm),2.4]) {
    h.slider('omega',w);h.slider('vRel',vm);h.step(t);const s=h.sim3State;
    const pos=u=>{const r=2+1.5*Math.sin(vm*u/1.5);return {x:r*Math.cos(w*u),y:r*Math.sin(w*u)};};
    const eps=1e-4,p=pos(t),lo=pos(t-eps),hi=pos(t+eps);
    near(s.aAbsolute.x,(hi.x-2*p.x+lo.x)/eps**2,2e-6);near(s.aAbsolute.y,(hi.y-2*p.y+lo.y)/eps**2,2e-6);
    near(s.aCor.x*s.vRelVec.x+s.aCor.y*s.vRelVec.y,0,1e-9);
    near(s.aRelative.x+s.aTransport.x+s.aCor.x,s.aAbsolute.x);near(s.aRelative.y+s.aTransport.y+s.aCor.y,s.aAbsolute.y);
    assert.match(h.rows.aAbs,/m\/s²/);assert.match(h.theory.observe,/cưỡng bức/);
    h.controls.playback.onPlay();h.slider('omega',w);near(h.sim3State.time,0);assert.equal(h.playing,false);
  }
  h.dispose();
});

test('U1 constrained rod numeric A/omega controls preserve rigid motion, geometry and zero endpoint', () => {
  const h=mount('ch2-5-2');
  for(const ax of [-3,-2,1.5]) for(const w of [.1,.4]) {
    h.number('ax',ax);h.number('omega',w);const arrows=h.svg.children.filter(n=>n.tag==='arrow');
    const va={x:+arrows[0].attrs.x2-+arrows[0].attrs.x1,y:+arrows[0].attrs.y2-+arrows[0].attrs.y1};
    const vb={x:+arrows[1].attrs.x2-+arrows[1].attrs.x1,y:+arrows[1].attrs.y2-+arrows[1].attrs.y1};
    const dx=2-ax,dy=Math.sqrt(25-dx*dx);near(va.x,w*dy);near(vb.y,w*dx);near((vb.x-va.x)*dx+(vb.y-va.y)*dy,0);
    near(num(h,'PA'),dy,.00051);near(num(h,'PB'),dx,.00051);near(num(h,'ratio'),dy/dx,.00051);
    if(ax===-3)assert.equal(arrows[0].attrs.visibility,'hidden');assert.match(h.rows.ICStatus,/hữu hạn/);
  }
  const guides=h.svg.children.filter(n=>n.attrs.class==='sim2-guide-line sim2-ic-radius-guide');
  action(h,'construction-step');assert.deepEqual(guides.map(n=>n.attrs.visibility),['hidden','hidden']);
  action(h,'construction-step');assert.deepEqual(guides.map(n=>n.attrs.visibility),['visible','hidden']);
  action(h,'construction-step');assert.deepEqual(guides.map(n=>n.attrs.visibility),['visible','visible']);
  action(h,'reset-geometry');near(h.handles[0].point.x,-2);near(num(h,'omega'),.4);h.dispose();
});

test('U1 velocity field numeric IC, uncapped sample data and fixed sparse measurements', () => {
  const h=mount('ch2-5-3');
  for(const ic of [{x:-4,y:-3},{x:4,y:3},{x:2,y:1.5},{x:-1,y:-1}]) for(const w of [.3,2.5]) {
    h.number('icx',ic.x);h.number('icy',ic.y);h.slider('omega',w);const s=h.sim3State;
    near(s.vM.vx,-w*(1.5-ic.y));near(s.vM.vy,w*(2-ic.x));near(s.vM.mag,w*s.radius);
    near(s.vM.vx*(2-ic.x)+s.vM.vy*(1.5-ic.y),0);assert.match(h.rows.r,/ m$/);assert.match(h.rows.vM,/m\/s/);
    assert.ok(s.measurements.length>=3);for(const m of s.measurements){near(m.velocity.x,-w*(m.point.y-ic.y));near(m.velocity.y,w*(m.point.x-ic.x));}
    if(ic.x===2 && ic.y===1.5)assert.equal(h.svg.children.find(n=>n.tag==='arrow').attrs.visibility,'hidden');
  }
  action(h,'reset-field');near(h.sim3State.ic.x,-1);near(h.sim3State.omega,1);h.dispose();
});

// Same real-Three CPU fixture contract as the repair suite; only renderer/DOM are stand-ins.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
function cpu3d() {
  const document = { activeElement: null };
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.style = {}; this.attrs = {}; this.events = {}; this.hidden = false; this.width = 520; this.height = 300; }
    appendChild(e) { if (e.parentNode) e.parentNode.removeChild(e); this.children.push(e); e.parentNode = this; return e; }
    insertBefore(e, ref) { if (e.parentNode) e.parentNode.removeChild(e); const i = this.children.indexOf(ref); if (i < 0) this.children.push(e); else this.children.splice(i, 0, e); e.parentNode = this; return e; }
    removeChild(e) { const i = this.children.indexOf(e); if (i >= 0) this.children.splice(i, 1); e.parentNode = null; return e; }
    setAttribute(k, v) { this.attrs[k] = v; }
    getAttribute(k) { return this.attrs[k]; }
    addEventListener(k, f) { this.events[k] = f; }
    removeEventListener(k) { delete this.events[k]; }
    focus() { document.activeElement = this; }
    click() { if (this.events.click) this.events.click(); }
    getBoundingClientRect() { return { width: this.width, height: this.height }; }
    getClientRects() { return [this.getBoundingClientRect()]; }
    getContext() { return { getExtension() { return null; } }; }
    get firstChild() { return this.children[0] || null; }
    get nextSibling() { const siblings = this.parentNode ? this.parentNode.children : []; return siblings[siblings.indexOf(this) + 1] || null; }
  }
  document.createElement = tag => new Element(tag);
  const observers = [];
  const ctx = vm.createContext({ console, document, devicePixelRatio: 1, addEventListener() {}, removeEventListener() {}, requestAnimationFrame() { throw Error('Adapters must remain demand-rendered'); }, cancelAnimationFrame() {}, ResizeObserver: class { constructor(cb) { this.cb = cb; observers.push(this); } observe(el) { this.el = el; } disconnect() { this.disconnected = true; } } });
  const run = f => vm.runInContext(fs.readFileSync(path.join(repo, f), 'utf8'), ctx, { filename: f });
  run('lib/three/three.umd.min.js');
  const T = ctx.THREE = { ...ctx.THREE };
  assert.equal(T.REVISION, '160');
  T.WebGLRenderer = class {
    constructor() { this.domElement = new Element('canvas'); this.info = { render: { frame: 0 } }; }
    setPixelRatio() {}
    setSize() {}
    render(scene, camera) { scene.updateMatrixWorld(true); camera.updateMatrixWorld(true); this.info.render.frame++; }
    dispose() { this.disposed = true; }
    forceContextLoss() { this.lost = true; }
  };
  ctx.Sim3LabelLayer = { create() { const labels = []; return { add(...args) { labels.push(args); }, update() {}, dispose() {}, margin() { return 0; }, bounds() { return { fillRatio: 0 }; }, distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z); }, countVisible() { return labels.length; } }; } };
  for (const f of ['coordinate-system', 'three-primitives', 'visual-kit', 'three-dispose', 'three-shell', 'mode-toggle']) run(`js/sim3/core/${f}.js`);
  let capture;
  const actualCreate = ctx.Sim3Shell.create;
  ctx.Sim3Shell.create = cfg => { capture = actualCreate(cfg); return capture; };
  for (const f of fs.readdirSync(path.join(repo, 'js/sim3/sims'))) run('js/sim3/sims/' + f);
  function mount(name, state) { const parent = new Element('div'), host = new Element('div'); parent.appendChild(host); const adapter = ctx[name].create({ host }); assert.ok(adapter, 'CPU shell creates adapter'); const shell = capture; adapter.setState(state); return { adapter, shell, scene: shell.scene, camera: shell.camera, host }; }
  return { ctx, T, mount, Element, document, observers };
}

test('U1 3D rotation renders physical acceleration components, uniform rotation and display toggles', () => {
  const h=mount('ch2-2-2'), c=cpu3d();h.slider('omega0',2);h.slider('alphaAcc',.5);h.step(3);
  const m=c.mount('Sim3Ch222',h.sim3State);
  for(const [w0,alpha,t] of [[2,.5,3],[2,0,1],[0,.5,0],[0,0,0]]) {
    h.slider('omega0',w0);h.slider('alphaAcc',alpha);h.step(t);m.adapter.setState(h.sim3State);
    const s=c.ctx.__SIM3_DEBUG__['ch2-2-2'], q=w0*t+.5*alpha*t*t, w=w0+alpha*t;
    near(s.physics.accelerationTangential.x,-3*alpha*Math.sin(q));near(s.physics.accelerationTangential.z,-3*alpha*Math.cos(q));
    near(s.physics.accelerationNormal.x,-3*w*w*Math.cos(q));near(s.physics.accelerationNormal.z,3*w*w*Math.sin(q));
    const vectors=[];m.scene.traverse(o=>{if(o.userData.sim3Role) vectors.push(o);});
    assert.ok(vectors.some(o=>o.userData.sim3Role==='acceleration-normal'));
    assert.equal(vectors.find(o=>o.userData.sim3Role==='acceleration-normal').visible,w!==0);
  }
  h.slider('omega0',2);action(h,'toggle-normal');m.adapter.setState(h.sim3State);
  let normal;m.scene.traverse(o=>{if(o.userData.sim3Role==='acceleration-normal')normal=o;});assert.equal(normal.visible,false);
  m.adapter.dispose();h.dispose();
});

test('U1 3D Coriolis right-angle sector follows actual vector directions and hides at zero', () => {
  const c=cpu3d(), m=c.mount('Sim3Ch244',{point:{x:2,y:0},omega:1.2,vRelVec:{x:1.5,y:0},phi:0});
  let sector;m.scene.traverse(o=>{if(o.geometry?.type==='RingGeometry')sector=o;});
  for(const phi of [0,Math.PI/2,Math.PI,3*Math.PI/2])for(const speed of [-1.5,0,1.5])for(const omega of [-1.2,1.2]) {
    const velocity={x:speed*Math.cos(phi),y:speed*Math.sin(phi)};
    m.adapter.setState({point:{x:2*Math.cos(phi),y:2*Math.sin(phi)},omega,vRelVec:velocity,phi});
    assert.equal(sector.visible,speed!==0);
    if(speed!==0) {
      near(sector.geometry.parameters.thetaLength,Math.PI/2);
      const start=c.T.Vector3 ? new c.T.Vector3(1,0,0).transformDirection(sector.matrixWorld) : null;
      const end=new c.T.Vector3(0,1,0).transformDirection(sector.matrixWorld);
      const vr=new c.T.Vector3(velocity.x,velocity.y,0).normalize();
      const ac=new c.T.Vector3(-omega*velocity.y,omega*velocity.x,0).normalize();
      near(start.dot(omega>0?vr:ac),1,1e-7);near(end.dot(omega>0?ac:vr),1,1e-7);
    }
  }
  m.adapter.dispose();
});

test('U1 all five Chapter 2 adapters retain exact immutable SI snapshots across 20 2D/3D toggles', () => {
  const cases=[['ch2-1-3','Sim3Ch213'],['ch2-2-2','Sim3Ch222'],['ch2-3-2','Sim3Ch232'],['ch2-4-4','Sim3Ch244'],['ch2-5-3','Sim3Ch253']];
  for(const [route,name] of cases) {
    const h=mount(route);if(h.update)h.step(.731);else if(route==='ch2-1-3')h.slider('phase',359.1);else{h.number('icx',-3.7);h.number('icy',2.6);}
    const c=cpu3d(),container=new c.Element('div'),two=new c.Element('div');container.appendChild(two);
    const state=JSON.parse(JSON.stringify(h.sim3State)),before=JSON.stringify(state);
    const mode=c.ctx.Sim3Mode.attach({container,shell2dRoot:two,create3d:({host,onFallback})=>c.ctx[name].create({host,onFallback})});mode.setState(state);
    const toggle=container.children.find(n=>n.className==='sim3-mode-toggle');
    for(let i=0;i<20;i++) {toggle.children[1].click();assert.equal(two.style.display,'none');const debug=c.ctx.__SIM3_DEBUG__[route];for(const key of Object.keys(state))assert.deepEqual(JSON.parse(JSON.stringify(debug[key])),state[key],`${route}: ${key}`);toggle.children[0].click();assert.notEqual(two.style.display,'none');}
    assert.equal(JSON.stringify(state),before);assert.equal(JSON.stringify(h.sim3State),before);mode.dispose();h.dispose();
  }
});

test('U1 numerical handle valueText uses the actual core API and physical SI/phase semantics', () => {
  const rod=mount('ch2-5-2');rod.number('ax',-1.8);assert.match(rod.handles[0].opts.a11y.valueText(rod.handles[0].point),/A.x -1.80 mét/);
  const field=mount('ch2-5-3');field.number('icx',3.2);field.number('icy',-2.1);assert.match(field.handles[0].opts.a11y.valueText(field.handles[0].point),/x 3.20 mét, y -2.10 mét/);
  const ellipse=mount('ch2-1-3');ellipse.slider('phase',270);assert.match(ellipse.handles[0].opts.a11y.valueText(ellipse.handles[0].point),/270.00 độ/);
  for(const h of [rod,field,ellipse])h.dispose();
});

test('U1 projectile fixed clock stops at exact event and announces once, including repeated endpoint steps', () => {
  const h=mount('ch2-1-1'),T=28*Math.sin(55*Math.PI/180)/9.81;h.controls.playback.onPlay();
  for(let i=0;i<Math.ceil(T*60)+12;i++)h.stepOnce();
  near(h.clock.getSimulationTime(),T);assert.equal(h.playing,false);near(num(h,'y'),0);
  assert.equal(h.announcements.length,1);assert.match(h.announcements[0],/chạm đất/);
  const previous={...h.rows};h.stepOnce();h.draw();assert.deepEqual(h.rows,previous);assert.equal(h.announcements.length,1);
  action(h,'apex');assert.equal(h.announcements.length,2);near(h.clock.getSimulationTime(),T/2);h.dispose();
});

test('U1 2D belt marker has no-slip arc speed for equal and unequal pulley radii', () => {
  const h=mount('ch2-3-2');
  for(const [r1,r2] of [[.8,2.5],[2.5,.8],[1.4,2],[1,1]]) {
    const d=7.5,nx=(r1-r2)/d,ny=Math.sqrt(1-nx*nx),a=Math.acos(nx),span=Math.sqrt(d*d-(r1-r2)**2),left=r1*(2*Math.PI-2*a),right=r2*2*a,total=left+right+2*span;
    const sampleTimes=[0,.31,3,11,...[left,left+span,left+span+right,total].flatMap(s=>[(s-1e-4)/r1,s/r1,(s+1e-4)/r1])];
    for(const t of sampleTimes) {
      h.slider('r1',r1);h.slider('r2',r2);h.step(t);const p=h.sim3State.beltMarker;h.step(1e-6);const q=h.sim3State.beltMarker;
      near(Math.hypot(q.x-p.x,q.y-p.y)/1e-6,r1,1e-5);
      const distances=[Math.abs(Math.hypot(p.x+2.6,p.y+2.7)-r1),Math.abs(Math.hypot(p.x-4.9,p.y+2.7)-r2)];
      // A tangent's normal n dotted with its radius is exactly r1.
      if(p.x>=-2.6+r1*nx-1e-8 && p.x<=4.9+r2*nx+1e-8)distances.push(Math.abs(nx*(p.x+2.6)+ny*(p.y+2.7)-r1),Math.abs(nx*(p.x+2.6)-ny*(p.y+2.7)-r1));
      near(Math.min(...distances),0,1e-8);
    }
  }
  h.dispose();
});

test('integration: all 10 paired adapters receive unchanged frozen physical state through 20 toggles',()=>{
  const cases=[['ch1-1-5','Sim3Ch115'],['ch1-5-3','Sim3Ch153'],['ch2-1-3','Sim3Ch213'],['ch2-2-2','Sim3Ch222'],['ch2-3-2','Sim3Ch232'],['ch2-4-4','Sim3Ch244'],['ch2-5-3','Sim3Ch253'],['ch3-1-3','Sim3Ch313'],['ch3-5-3','Sim3Ch353'],['ch3-6-2','Sim3Ch362']];
  for(const [route,name] of cases){
    const h=mount(route);
    if(h.update)h.step(route==='ch3-6-2'?1.8:.731);
    else if(route==='ch1-1-5')h.number('F1x',35.4);
    else if(route==='ch1-5-3')h.slider('beta',35);
    else if(route==='ch2-1-3')h.slider('phase',359.1);
    else if(route==='ch2-5-3'){h.number('icx',-3.7);h.number('icy',2.6);}
    else if(route==='ch3-1-3')h.slider('a',3.25);
    const c=cpu3d(),container=new c.Element('div'),two=new c.Element('div');container.appendChild(two);
    const state=JSON.parse(JSON.stringify(h.sim3State)),before=JSON.stringify(state),readout=JSON.stringify(h.rows);let received,calls=0;
    const mode=c.ctx.Sim3Mode.attach({container,shell2dRoot:two,create3d:({host,onFallback})=>{
      const adapter=c.ctx[name].create({host,onFallback}),original=adapter.setState;
      adapter.setState=value=>{received=value;calls++;return original(value);};return adapter;
    }});mode.setState(state);
    const toggle=container.children.find(n=>n.className==='sim3-mode-toggle');
    for(let i=0;i<20;i++){
      toggle.children[1].click();assert.equal(two.style.display,'none',route);assert.equal(JSON.stringify(received),before,route);assert.ok(Object.isFrozen(received),route);
      toggle.children[0].click();assert.notEqual(two.style.display,'none',route);
    }
    assert.equal(calls,20,route);assert.equal(JSON.stringify(h.sim3State),before,route);assert.equal(JSON.stringify(h.rows),readout,route);assert.equal(JSON.stringify(state),before,route);
    mode.dispose();h.dispose();
  }
});
