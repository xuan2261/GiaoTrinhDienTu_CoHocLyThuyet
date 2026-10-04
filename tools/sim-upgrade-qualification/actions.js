'use strict';
// Collector-owned experiments and analytic checks. No product physics helpers or
// __SIM3_DEBUG__ declarations are inputs to these verdicts. DOM readouts remain
// reported physical values: passing checks never establish rendered geometry.
const PRODUCER_VERSION='1.2.0';
const METHOD='trusted-browser-input-with-dom-before-after';
const A=action=>({type:'action',action});
const N=(control,value)=>({type:'control-value',kind:'number',control,value});
const S=steps=>({type:'steps',steps});
const RESET={type:'playback-reset'};
function actionPlans(route,controls) {
  const buttons=controls.actions || [],numbers=controls.numbers || [],plans=[];
  const ids=buttons.map(b=>b.id);
  if(ids.some(id=>typeof id!=='string'||!id) || new Set(ids).size!==ids.length) throw new Error('Action inventory needs unique nonempty data-action IDs');
  const changed=numbers.find(n=>Number.isFinite(n.max)&&Number(n.value)!==n.max)||numbers.find(n=>Number.isFinite(n.min)&&Number(n.value)!==n.min);
  function add(id,operations) {
    const missing=[];
    for(const op of operations) {
      if(op.type==='action'&&!ids.includes(op.action))missing.push('action:'+op.action);
      if(op.type==='control-value'&&!numbers.some(n=>n.id===op.control))missing.push('number:'+op.control);
      if(['steps','playback-reset','play-until-paused'].includes(op.type)&&!controls.playback)missing.push('playback');
    }
    plans.push({id,type:'action-sequence',operations,unavailableReason:missing.length?'Required mounted controls missing: '+[...new Set(missing)].join(', '):null});
  }
  buttons.forEach((b,i)=>{
    let setup=[];
    if(['reset','reset-geometry','reset-field','reset-phase'].includes(b.id)&&changed)setup=[{...N(changed.id,Number(changed.value)!==changed.max?changed.max:changed.min),allowConstraintClamp:true}];
    if(b.id==='clear-reference')setup=[S(60),A('capture-reference')];
    if(b.id==='capture-reference')setup=[S(60)];
    if(b.id==='replay')setup=[A('touchdown')];
    if(b.id==='capture-state')setup=[A('radius-half')];
    add(`action-${i}-${encodeURIComponent(b.id)}`,[...setup,A(b.id)]);
  });
  const experiments={
    'ch1-5-3':[['friction-threshold',[N('mu',.6),A('threshold'),A('reset')]]],
    'ch2-1-1':[['projectile-events',[A('apex'),A('touchdown'),A('replay')]]],
    'ch2-1-3':[['fixed-scale',[A('toggle-scale'),N('phase',90),N('phase',270),A('toggle-scale'),A('reset-phase')]]],
    'ch2-2-2':[['rotation-components',[A('toggle-tangential'),A('toggle-normal'),A('toggle-tangential'),A('toggle-normal')]]],
    'ch2-5-2':[['ic-construction',[A('construction-step'),A('construction-step'),A('construction-step'),N('ax',-3),A('reset-geometry')]]],
    'ch2-5-3':[['zero-field',[A('zero-sample'),N('omega',2.5),A('reset-field')]],['signed-field',[N('icx',-.731),N('icy',2.143),N('omega',2.5),A('reverse-omega'),A('rest-field'),A('reverse-omega'),N('omega',-1.25),A('zero-sample'),A('reset-field')]]],
    'ch3-2-2':[['newton-ab',[S(60),A('capture-reference'),N('F',12),S(60),A('clear-reference')]]],
    'ch3-2-3':[['fbd-selection',[A('fbd-a'),A('fbd-b'),A('fbd-system')]]],
    'ch3-1-3':[['reference-frames',[A('frame-ground'),A('frame-car')]]],
    'ch3-3-1':[['oscillator-periods',[A('one-cycle'),N('k',12),N('m',.5),A('one-cycle')]]],
    'ch3-5-2':[['equal-impulse',[A('equal-short'),A('equal-long')]]],
    'ch3-5-3':[['angular-reference',[S(30),A('radius-full'),A('capture-state'),A('radius-half'),A('capture-state'),A('radius-full')]]],
    'ch3-6-2':[['collision-events',[A('before-impact'),A('at-impact'),A('after-impact')]],['collision-pause',[A('toggle-impact-pause'),S(104),{type:'play-until-paused',maxWaitMs:3000},A('toggle-impact-pause')]],['collision-elasticities',[N('e',0),A('at-impact'),N('e',1),A('after-impact'),RESET]]]
  };
  for(const [id,ops] of experiments[route]||[])add('experiment-'+id,ops);
  return plans;
}
const read=(s,key)=>(s.readoutValues||[]).find(r=>r.key===key)?.value??null;
const numeric=(s,key)=>{const raw=read(s,key);return raw===null?NaN:parseFloat(raw);};
function control(s,id) {
  const entries=(s.controlValues||[]).filter(c=>c.id===id&&['range','number'].includes(c.type));
  return entries.length&&entries.every(c=>c.value!==''&&Number.isFinite(Number(c.value))&&Number(c.value)===Number(entries[0].value))?Number(entries[0].value):NaN;
}
const actionLabel=(s,id)=>(s.actionValues||[]).find(a=>a.id===id)?.label??null;
// These are bounded reset-preparation contracts, not a complete physics suite.
// Bounds/quantization describe the intended input domain; expected values never
// come from the post-operation controls, readouts, or production physics helpers.
const PREPARATION_CONTROLS={
  'ch1-1-3':['F',10,120,1,'F',.50000001],
  'ch1-1-4':['F',10,100,5,'F',.50000001],
  'ch1-1-5':['F1x',-50,183.3,.1],
  'ch1-1-6':['d',1,6,.5,'d',.00500001],
  'ch1-2-3':['F1x',0,137.5,.1],
  'ch1-1-8':['P',20,200,10,'P',.50000001],
  'ch1-3-2':['alpha',5,75,1,'alpha',.50000001],
  'ch1-3-6':['P',20,150,10,'P',.50000001],
  'ch1-5-3':['beta',3,60,null,'beta',.05000001],
  'ch1-6-3':['holeX',1,5,.1],
  'ch2-1-3':['phase',0,360,null,'phase',.00500001],
  'ch2-5-2':['ax',-3,1.5,null],
  'ch3-2-3':['F',20,80,null,'pairMag',.50000001],
  'ch3-1-3':['a',0,8,null,'aFrame',1e-10],
  'ch3-5-2':['F',2,20,null,'F',1e-10],
  'ch3-5-4':['F',1,15,null,'F',1e-10]
};
const controlTopology=s=>(s.controlValues||[]).filter(c=>['range','number'].includes(c.type)).map(c=>c.id+':'+c.type).sort();
function evaluateAction(route,op,before,after,context={}) {
  const checks=[],id=op.action;let criteria='bounded-action-or-state';
  function check(key,actual,expected,tolerance=0,scope='DOM reported physical value') {
    const finite=typeof expected==='number';
    const pass=finite?Number.isFinite(actual)&&Number.isFinite(expected)&&Math.abs(actual-expected)<=tolerance:actual===expected;
    checks.push({key,actual:typeof actual==='number'&&!Number.isFinite(actual)?null:actual,expected:finite&&!Number.isFinite(expected)?null:expected,tolerance,pass,scope});
  }
  const r=(key,expected,tolerance)=>check('readout:'+key,numeric(after,key),expected,tolerance);
  const c=(key,expected,tolerance=1e-10)=>check('control:'+key,control(after,key),expected,tolerance,'DOM committed numeric value; companion controls must agree');
  const text=(key,expected)=>check('readout:'+key,read(after,key),expected,0,'DOM text contract, not rendered geometry');
  const time=(expected,tolerance=1e-9)=>check('clockSeconds',after.clockSeconds,expected,tolerance,'observed production physical clock; independent expected time');
  const unchanged=keys=>keys.forEach(key=>text(key,read(before,key)));
  const geometry=(selector,expected)=>{
    const nodes=(after.geometry||[]).filter(n=>n.selector===selector);
    check('svg-visibility:'+selector,JSON.stringify(nodes.map(n=>n.visibility)),JSON.stringify(expected),0,'Actual SVG visibility attributes, not pixels or occlusion');
  };
  if(op.type==='control-value'&&!op.allowConstraintClamp)c(op.control,op.value);
  const preparation=op.type==='control-value'&&op.allowConstraintClamp&&PREPARATION_CONTROLS[route];
  if(preparation&&op.control===preparation[0]) {
    criteria='preparation-control-and-state-consistency';
    const [key,min,max,quantum,readout,tolerance]=preparation;
    const scope='Preparation criterion: requested/committed control and displayed setup consistency; not complete quantitative physics verification';
    const setup=(key,actual,expected,tolerance=0)=>check('preparation:'+key,actual,expected,tolerance,scope);
    let expected=Math.max(min,Math.min(max,op.value));
    if(quantum)expected=quantum<1?Math.round(expected*(1/quantum))/(1/quantum):Math.round(expected/quantum)*quantum;
    if(route==='ch1-1-5') {
      // F1 is based at x=-2; both its tip and the resultant tip must be
      // inside [-3.5,3.5], at .03 scene units/N, on the 0.1 N lattice.
      const other=control(before,'F2x');
      const lowerTick=Math.ceil(Math.max(-1.5/.03,-3.5/.03-other)*10);
      const upperTick=Math.floor(Math.min(5.5/.03,3.5/.03-other)*10);
      expected=Math.max(lowerTick,Math.min(upperTick,Math.round(op.value*10)))/10;
    }
    if(route==='ch1-2-3') {
      // Nonnegative components; the parallelogram's resultant x tip is
      // confined to 5.5 scene units at .04 units/N (137.5 N total).
      const availableTicks=Math.floor((5.5/.04-control(before,'F2x'))*10);
      expected=Math.max(0,Math.min(availableTicks,Math.round(op.value*10)))/10;
    }
    setup('requested-finite-number',op.kind==='number'&&Number.isFinite(op.value),true);
    setup('control-topology',JSON.stringify(controlTopology(after)),JSON.stringify(controlTopology(before)));
    setup('required-number-control',(after.controlValues||[]).filter(c=>c.id===key&&c.type==='number').length,1);
    setup('committed:'+key,control(after,key),expected,1e-10);
    for(const other of new Set((before.controlValues||[]).filter(c=>['range','number'].includes(c.type)&&c.id!==key).map(c=>c.id)))setup('unchanged:'+other,control(after,other),control(before,other),1e-10);
    setup('clock-finite',Number.isFinite(before.clockSeconds)&&Number.isFinite(after.clockSeconds),true);
    setup('clock-preserved',after.clockSeconds,before.clockSeconds,1e-9);
    if(readout)setup('readout:'+readout,numeric(after,readout),expected,tolerance);
    if(route==='ch1-1-5') {
      setup('readout:force1',read(after,'force1'),`(${expected.toFixed(1)}; ${control(before,'F1y').toFixed(1)}) N`);
      setup('readout:Rx',numeric(after,'Rx'),expected+control(before,'F2x'),.05000001);
    }
    if(route==='ch1-2-3')setup('readout:Rx',numeric(after,'Rx'),expected+control(before,'F2x'),.05000001);
    if(route==='ch1-6-3')setup('readout:holeContribution',read(after,'holeContribution'),`(${(-Math.PI*expected).toFixed(2)}; ${(-Math.PI*control(before,'holeY')).toFixed(2)}) m³`);
    if(route==='ch2-5-2')setup('readout:A',read(after,'A'),`(${expected.toFixed(1)}, 0) m`);
  }
  if(route==='ch3-5-3'&&op.type==='steps') {
    criteria='quantitative-angular-state-and-clock';
    check('angular-step-count',Number.isInteger(op.steps)&&op.steps>=0,true);
    check('angular-start-time',Number.isFinite(before.clockSeconds)&&before.clockSeconds>=0,true);
    time(before.clockSeconds+op.steps/60);
    const radius=control(before,'r');
    c('r',radius);check('angular-radius-domain',radius>=.8&&radius<=3.5,true);
    // Two 2 kg masses; initial r=3 m, omega=1 rad/s gives L=36.
    // These formulas are independent of the product's dynamics helpers.
    r('r',radius,1e-10);r('I',4*radius*radius,.00500001);
    r('omega',9/(radius*radius),.00500001);r('L',36,.00500001);
    r('energy',162/(radius*radius),.00000501);r('work',162/(radius*radius)-18,.00000501);
    // Stepping must preserve the captured reference. Its radius readout has
    // only 2 decimals, so it is not an exact input to independent I/omega/E
    // formulas. These checks establish preservation, not reference physics.
    const referenceScope='Captured reference readout preservation across steps; rounded reference radius is not exact model state';
    for(const key of ['referenceRadius','referenceInertia','referenceOmega','referenceEnergy']) {
      const prior=read(before,key);
      check('reference-present:'+key,typeof prior==='string'&&prior.length>0,true,0,referenceScope);
      check('reference-preserved:'+key,read(after,key),prior,0,referenceScope);
    }
    // Both referenceEnergy and deltaEnergy display 5 decimals. Their combined
    // rounding uncertainty is at most 1e-5 J; current energy uses exact radius.
    check('readout:deltaEnergy',numeric(after,'deltaEnergy'),162/(radius*radius)-numeric(before,'referenceEnergy'),.0000100001,'Independent current rotational energy minus observed prior reference energy; combined display-rounding tolerance');
  }
  if(['reset','reset-geometry','reset-field','reset-phase'].includes(id)&&context.baseline) {
    for(const row of context.baseline.controlValues||[])if(['number','range'].includes(row.type)&&row.id)c(row.id,Number(row.value));
    for(const row of context.baseline.readoutValues||[])text(row.key,row.value);
  }
  if(route==='ch1-5-3'&&id==='threshold') {
    const mu=control(before,'mu'),beta=Math.atan(mu)*180/Math.PI;
    c('beta',beta);r('beta',beta,.05000001);r('margin',0,.00005001);text('state','cân bằng giới hạn');
  }
  if(route==='ch2-1-1'&&['apex','touchdown','replay'].includes(id)) {
    const v0=control(before,'v0'),angle=control(before,'alpha')*Math.PI/180,vx=v0*Math.cos(angle),vy0=v0*Math.sin(angle),T=2*vy0/9.81;
    // Replay intentionally runs. Its post-click observation may occur after a
    // frame: test its reset/running observation and analytic state at actual t,
    // not an invented exact-zero browser timestamp.
    const t=id==='apex'?T/2:id==='touchdown'?T:after.clockSeconds;
    if(id==='replay') {
      const immediate=context.immediate||after;
      check('replay-started',immediate.playbackLabel,'Tạm dừng',0,'DOM playback state immediately after real click, before collector pause');
      check('replay-returned-before-touchdown',Number.isFinite(t)&&t>=0&&t<T,true);
    } else time(t);
    r('t',t,.00050001);r('x',vx*t,.00050001);r('y',id==='touchdown'?0:vy0*t-.5*9.81*t*t,.00050001);
    r('vx',vx,.00050001);r('vy',vy0-9.81*t,.00050001);r('ay',-9.81,.00050001);
  }
  if(route==='ch2-1-3'&&id==='toggle-scale') {
    const wasFixed=(read(before,'scale')||'').includes('cố định'),scale=read(after,'scale')||'';
    check('scale-mode',scale.includes(wasFixed?'tự vừa cảnh':'cố định'),true,0,'DOM scale mode; fixed-scale geometry requires pixel review');
    if(!wasFixed)r('scale',.3,.00050001);
    unchanged(['phase','point','v','aTangential','aNormal','R']);
  }
  if(route==='ch2-1-3'&&op.type==='control-value'&&(read(before,'scale')||'').includes('cố định'))text('scale',read(before,'scale'));
  if(route==='ch2-2-2'&&['toggle-tangential','toggle-normal'].includes(id)) {
    const tokens=read(before,'components')||'',t=tokens.includes('aτ'),n=tokens.includes('aₙ');
    text('components',(((id==='toggle-tangential'?!t:t)?'aτ ':'')+((id==='toggle-normal'?!n:n)?'aₙ':'')).trim()||'ẩn cả hai');
    unchanged(['omega','phi','v','aTangential','aNormal']);
  }
  if(route==='ch2-5-2'&&id==='construction-step') {
    const stage=(parseInt(read(before,'construction'),10)+1)%3;
    r('construction',stage,0);geometry('.sim2-ic-radius-guide',stage===0?['hidden','hidden']:stage===1?['visible','hidden']:['visible','visible']);
    unchanged(['A','B','IC','vA','vB']);
  }
  if(route==='ch2-5-3') {
    const w=control(after,'omega'),x=control(after,'icx'),y=control(after,'icy'),dx=2-x,dy=1.5-y,speed=Math.abs(w)*Math.hypot(dx,dy);
    r('omega',w,.00500001);r('r',Math.hypot(dx,dy),.00050001);r('vx',-w*dy,.00050001);r('vy',w*dx,.00050001);r('vM',speed,.00050001);
    text('IC',`(${x.toFixed(2)}, ${y.toFixed(2)}) m`);
    text('direction',w>0?'Ngược kim đồng hồ (CCW)':w<0?'Cùng kim đồng hồ (CW)':'Đứng yên (ω = 0)');
    text('sampleDirection',speed>0?'Tiếp tuyến, vuông góc PM':'vM = 0; hướng không xác định');
    text('ICStatus',w===0?'IC không duy nhất: mọi điểm có v = 0; P là mốc chọn':'IC hữu hạn, duy nhất trong trường này');
    [[-2,-1],[0,0],[2,1.5]].forEach(([px,py],i)=>text('measurement'+i,`r=${Math.hypot(px-x,py-y).toFixed(3)} m; v=(${(-w*(py-y)).toFixed(3)}, ${(w*(px-x)).toFixed(3)}) m/s`));
    if(id==='zero-sample') {c('icx',2);c('icy',1.5);c('omega',control(before,'omega'));}
    if(id==='reverse-omega') {c('omega',-control(before,'omega'));c('icx',control(before,'icx'));c('icy',control(before,'icy'));}
    if(id==='rest-field') {c('omega',0);c('icx',control(before,'icx'));c('icy',control(before,'icy'));}
  }
  if(route==='ch3-2-2') {
    const F=control(after,'F'),m=control(after,'m'),t=after.clockSeconds;
    r('a',F/m,.05000001);r('t',t,.00500001);r('x',.5*F/m*t*t,.00005001);r('v',F/m*t,.00005001);
    if(id==='capture-reference') {
      text('reference',`F=${control(before,'F')} N, m=${control(before,'m')} kg; t≤${Math.min(before.clockSeconds,2.8).toFixed(2)} s`);
      const current=(before.geometry||[]).find(n=>n.selector==='.sim2-graph'),reference=(after.geometry||[]).find(n=>n.selector==='.sim2-graph-reference');
      check('reference-copies-observed-graph',reference?.points??null,current?.points??null,0,'Actual SVG point sequence; no browser pixels inferred');
      check('captured-graph-not-empty',typeof reference?.points==='string'&&reference.points.length>0,true);
    }
    if(id==='clear-reference') {text('reference','Chưa lưu; lần B là nét liền');const node=(after.geometry||[]).find(n=>n.selector==='.sim2-graph-reference');check('reference-graph-cleared',node?.points??null,'',0,'Actual SVG points attribute; no pixels claimed');}
    if(op.type==='control-value'||op.type==='steps') {
      text('reference',read(before,'reference'));
      const prior=(before.geometry||[]).find(n=>n.selector==='.sim2-graph-reference'),actual=(after.geometry||[]).find(n=>n.selector==='.sim2-graph-reference');
      check('reference-graph-preserved',actual?.points??null,prior?.points??null,0,'Actual SVG point sequence on the same viewport');
    }
  }
  if(route==='ch3-2-3'&&['fbd-a','fbd-b','fbd-system'].includes(id)) {
    const expected={'fbd-a':'Vật A: nhận F_BA; chưa biết lực ngoài','fbd-b':'Vật B: nhận F_AB; chưa biết lực ngoài','fbd-system':'Hệ A+B: hai nội lực triệt tiêu'};
    text('system',expected[id]);geometry('.sim2-action-reaction-pair',id==='fbd-a'?['hidden','visible']:id==='fbd-b'?['visible','hidden']:['visible','visible']);
    const F=control(after,'F');r('FAB',F,1e-10);r('FBA',-F,1e-10);
  }
  if(route==='ch3-1-3'&&['frame-car','frame-ground'].includes(id)) {
    text('frame',id==='frame-car'?'Toa gia tốc (phi quán tính)':'Mặt đất (quán tính)');
    text('balance',id==='frame-car'?'T + P + F* = 0; bob đứng yên tương đối':'T + P = ma; bob gia tốc cùng toa');
    const a=control(after,'a');r('tension',Math.hypot(9.81,a),.00005001);r('tx',a,.00005001);r('ty',9.81,.00005001);unchanged(['aFrame','theta','tension','tx','ty']);
  }
  if(route==='ch3-3-1'&&id==='one-cycle') {
    const k=control(before,'k'),m=control(before,'m'),T=2*Math.PI*Math.sqrt(m/k);
    time(T);r('t',T,.00000051);r('x',2,.00001);r('v',0,.00005);r('energy',2*k,.0001);
  }
  if(route==='ch3-5-2'&&['equal-short','equal-long'].includes(id)) {
    c('F',id==='equal-short'?12:3);c('t',id==='equal-short'?1:4);r('J',12,.05000001);r('dp',12,.00050001);r('v2',7,.00050001);r('p2',14,.00050001);
  }
  if(route==='ch3-5-3'&&['capture-state','radius-full','radius-half'].includes(id)) {
    const radius=id==='radius-full'?3:id==='radius-half'?1.5:control(before,'r');c('r',radius);
    const reference=id==='capture-state'?control(before,'r'):numeric(before,'referenceRadius');
    r('referenceRadius',reference,.00500001);r('I',4*radius*radius,.00500001);r('omega',9/(radius*radius),.00500001);r('energy',162/(radius*radius),.00000501);
    r('referenceEnergy',162/(reference*reference),.00000501);r('deltaEnergy',162/(radius*radius)-162/(reference*reference),.00000501);time(before.clockSeconds);
  }
  if(route==='ch3-6-2') {
    const eventTimes={'before-impact':1.7,'at-impact':1.75,'after-impact':1.8};
    const t=Object.hasOwn(eventTimes,id)?eventTimes[id]:after.clockSeconds;
    const m1=control(after,'m1'),m2=control(after,'m2'),e=control(after,'e'),p=m1*2.2-m2;
    const v1=t>=1.75-1e-10?(p-m2*e*3.2)/(m1+m2):2.2,v2=t>=1.75-1e-10?(p+m1*e*3.2)/(m1+m2):-1;
    time(t);r('t',t,.00000051);r('v1',v1,.00000051);r('v2',v2,.00000051);r('momentum',p,.00500001);
    r('energy',.5*m1*v1*v1+.5*m2*v2*v2,.00500001);
    if(Object.hasOwn(eventTimes,id))text('phase',id==='before-impact'?'Trước va chạm':id==='at-impact'?'Đúng va chạm: vận tốc ngay sau xung':'Sau va chạm');
    if(id==='toggle-impact-pause') {
      const enabled=read(before,'pauseImpact')!=='Bật';text('pauseImpact',enabled?'Bật':'Tắt');
      check('pause-button-label',actionLabel(after,id),enabled?'Tắt dừng lúc tiếp xúc':'Bật dừng lúc tiếp xúc');
    }
    if(op.type==='steps'&&read(before,'pauseImpact')==='Bật'&&before.clockSeconds<1.75&&before.clockSeconds+op.steps/60>=1.75) {time(1.75);text('phase','Đúng va chạm: vận tốc ngay sau xung');}
    if(op.type==='play-until-paused') {time(1.75);text('phase','Đúng va chạm: vận tốc ngay sau xung');check('self-paused-before-collector',context.immediate?.playbackLabel??null,'Chạy',0,'DOM native playback state before collector pause');}
    if(op.type==='playback-reset') {time(0);text('phase','Trước va chạm');}
  }
  return {method:'collector-independent-formula-or-dom-transition',criteria,status:checks.length?(checks.every(c=>c.pass)?'pass':'fail'):'not-evaluated',checks,scope:'Bounded action/state checks only; DOM text/SVG attributes are observations, never proof of pixel correctness, complete physics, WebGL, accessibility or formal acceptance'};
}
function makeReceipt({run,route,requested,actual,before,immediate,after,baseline,hashJSON}) {
  const pick=o=>({state:o.state,measuredAt:o.measuredAt});
  return {schemaVersion:1,method:METHOD,runId:run.runId,sourceHash:run.sourceHash,collectorHash:run.collectorHash,producerVersion:run.producerVersion,route,requested,actual,baselineState:baseline || null,baselineStateHash:baseline?hashJSON(baseline):null,before:pick(before),immediate:pick(immediate),after:pick(after),beforeStateHash:hashJSON(before.state),immediateStateHash:hashJSON(immediate.state),afterStateHash:hashJSON(after.state),oracle:evaluateAction(route,requested,before.state,after.state,{baseline,immediate:immediate.state}),formalAcceptance:'pending'};
}
function validateReceipt(receipt,run,hashJSON) {
  const errors=[];
  if(receipt?.schemaVersion!==1)errors.push('Action receipt schema version unsupported');
  for(const key of ['runId','sourceHash','collectorHash','producerVersion'])if(!receipt||receipt[key]!==run[key]||typeof receipt[key]!=='string'||!receipt[key])errors.push('Action receipt '+key+' mismatch');
  for(const key of ['sourceHash','collectorHash'])if(!/^[a-f0-9]{64}$/.test(receipt?.[key]||''))errors.push('Action receipt '+key+' invalid');
  if(receipt?.producerVersion!==PRODUCER_VERSION)errors.push('Action receipt producer version unsupported');
  if(receipt?.method!==METHOD||receipt?.formalAcceptance!=='pending')errors.push('Action receipt method/acceptance invalid');
  if(!receipt?.requested||!receipt?.actual||!receipt?.route)errors.push('Action requested/actual/route missing');
  const op=receipt?.requested,actual=receipt?.actual;
  if(!['action','control-value','steps','playback-reset','play-until-paused'].includes(op?.type))errors.push('Action operation type invalid');
  if(op?.type==='action'&&(typeof op.action!=='string'||!op.action||actual?.button?.id!==op.action||actual?.dispatch!=='locator.click'||actual?.trustedClickCount!==1))errors.push('Action requested/actual button mismatch');
  if(op?.type==='control-value'&&(op.kind!=='number'||!op.control||!Number.isFinite(op.value)||actual?.control!==op.control||actual?.dispatch!=='locator.fill + Enter + Tab'))errors.push('Action requested/actual control mismatch');
  if(op?.type==='steps'&&(!Number.isInteger(op.steps)||op.steps<0||actual?.trustedClickCount!==op.steps||actual?.dispatch!=='locator.click'))errors.push('Action requested/actual step count mismatch');
  if(op?.type==='playback-reset'&&(actual?.dispatch!=='locator.click'||actual?.trustedClickCount!==1))errors.push('Action requested/actual reset mismatch');
  if(op?.type==='play-until-paused'&&(!Number.isFinite(op.maxWaitMs)||op.maxWaitMs<=0||actual?.dispatch!=='locator.click + DOM terminal observation'))errors.push('Action requested/actual playback mismatch');
  try {
    if((receipt.baselineState?hashJSON(receipt.baselineState):null)!==receipt.baselineStateHash)errors.push('Action baseline state hash mismatch');
    const recalculated=evaluateAction(receipt.route,receipt.requested,receipt.before.state,receipt.after.state,{baseline:receipt.baselineState,immediate:receipt.immediate.state});
    if(hashJSON(recalculated)!==hashJSON(receipt.oracle))errors.push('Action oracle differs from independent recomputation');
  }catch(e){errors.push('Action oracle/baseline invalid: '+e.message);}

  for(const key of ['before','immediate','after']) {
    try {if(hashJSON(receipt[key].state)!==receipt[key+'StateHash'])errors.push('Action '+key+' state hash mismatch');}
    catch(e){errors.push('Action '+key+' state invalid: '+e.message);}
    if(!Number.isFinite(Date.parse(receipt?.[key]?.measuredAt)))errors.push('Action '+key+' timestamp missing');
  }
  if(!['pass','fail','not-evaluated'].includes(receipt?.oracle?.status))errors.push('Action oracle status invalid');
  if(receipt?.oracle?.status==='pass'&&(!receipt.oracle.checks?.length||receipt.oracle.checks.some(c=>c.pass!==true)))errors.push('Empty/failing action oracle cannot pass');
  return errors;
}
module.exports={PRODUCER_VERSION,METHOD,actionPlans,evaluateAction,makeReceipt,validateReceipt};
