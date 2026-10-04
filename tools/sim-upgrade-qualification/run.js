#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const core=require('./core.js');
const {PRODUCER_VERSION,actionPlans,makeReceipt,validateReceipt}=require('./actions.js');
const {installObserver,inspectControls,collectBrowser}=require('./browser.js');
const {startBoundServer}=require('./server.js');
const ROOT=core.ROOT;
const HOST='#content-area [data-sim-mount-route]';
const PENDING=[
  'Human pixel review: full arrowheads, phase/direction, geometry occlusion, readability and captions',
  'Independent numerical oracles for every physical state and route; debug metadata is not an oracle',
  'Second supported browser engine and real mobile/touch device matrix',
  'Screen reader task flows, 200/400 percent browser zoom, reduced-motion device coverage',
  'Actual post-mount WebGL context loss/restore, forced null/throw/missing-THREE branches',
  'GPU/resource ownership plateau, 20 route remounts, collision 100 browser cycles/1000 numeric cycles',
  'Warm-up then 60-second per-scene performance benchmark, input-to-render latency, hidden-tab clock and 60/120Hz comparisons',
  'All domain corner combinations and specialized 72-position ellipse / belt-junction / zero-IC / friction-boundary states from roadmap section 8.3',
  'Academic, accessibility, integrity and WebGL formal acceptance decisions'
];
function options(argv) {
  const o={profile:'desktop',engine:'chromium',out:path.join(__dirname,'evidence'),defaultsOnly:false,plan:false,headed:false};
  for(let i=0;i<argv.length;i++) {
    const a=argv[i];
    if(a==='--plan') o.plan=true;
    else if(a==='--defaults-only') o.defaultsOnly=true;
    else if(a==='--headed') o.headed=true;
    else if(['--out','--profile','--engine','--route','--executable'].includes(a)) { if(!argv[i+1] || argv[i+1].startsWith('--')) throw new Error('Missing value for '+a); o[a.slice(2)]=argv[++i]; }
    else throw new Error('Unknown option: '+a);
  }
  core.profiles(o.profile);
  if(!['chromium','firefox','webkit'].includes(o.engine)) throw new Error('Unsupported browser engine');
  if(o.route && !core.routes().some(r=>r.id===o.route)) throw new Error('Unknown production route');
  return o;
}
function json(file,value) { fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n'); }
function notRunRecord(run,context,details) {
  return {...context,...details,schemaVersion:2,runId:run.runId,sourceHash:run.sourceHash,collectorHash:run.collectorHash,producerVersion:run.producerVersion,status:'not-run',formalAcceptance:'pending'};
}
function gitInfo() { try {return {head:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),status:execFileSync('git',['status','--porcelain'],{cwd:ROOT,encoding:'utf8'}).trim()};}catch(error){return {unavailable:error.message};} }
async function settle(page) {await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function pause(page) {
  const play=page.locator(HOST+' .sim2-playpause');
  if(await play.count() && (await play.getAttribute('aria-label'))==='Tạm dừng') await play.click();
  await settle(page);
}
async function mount(page,route,profile,mode=route.engine) {
  await page.evaluate(async({id,theme})=>{
    await window.loadPage('home');
    const q=window.__Q0_OBSERVER__; q.shell=null;q.sim3=null;q.bridgeState=null;q.serializationWarnings=[];
    document.documentElement.dataset.theme=theme;
    await window.loadPage(id);
  },{id:route.id,theme:profile.theme});
  await page.locator(HOST+`[data-sim-mount-route="${route.id}"] .sim2-root`).waitFor();
  if(mode==='sim3') await page.locator(HOST+' [data-mode="3d"]').click();
  await pause(page);
  await page.locator(HOST).scrollIntoViewIfNeeded();
  await settle(page);
}
async function controlLocator(page,kind,id) {
  const inputs=page.locator(HOST+` input[type="${kind}"]`);
  for(let i=0;i<await inputs.count();i++) {
    const el=inputs.nth(i),key=await el.evaluate((e,{kind,i})=>e.dataset.id || e.dataset.numberFor || e.dataset.controlId || e.id || `${kind}-${i}`,{kind,i});
    if(key===id) return el;
  }
  throw new Error('Control not found: '+id);
}
async function execute(page,route,scenario,profile) {
  const actions=[];
  const log=(action,result)=>actions.push({action,result,at:new Date().toISOString()});
  async function steps(count) { const button=page.locator(HOST+' .sim2-step'); for(let i=0;i<count;i++) await button.click(); log('trusted-step-button-clicks',{count}); }
  if(scenario.type==='control') {
    const input=await controlLocator(page,scenario.kind,scenario.control);
    const before=await input.inputValue();
    if(scenario.kind==='range') {await input.focus();await input.press(scenario.bound==='min' ? 'Home':'End');}
    else {await input.fill(String(scenario.value));await input.press('Enter');await input.press('Tab');}
    const after=await input.inputValue();
    log('native-control-edge',{control:scenario.control,kind:scenario.kind,bound:scenario.bound,target:scenario.value,before,after,targetReached:Number(after)===scenario.value,constraintReview:Number(after)===scenario.value ? 'not-required-by-this-observation':'required',note:'Requested scalar bound and actual committed value are separate; coupled constraints require an independent oracle.'});
  } else if(scenario.type==='handle') {
    const handle=page.locator(HOST+' .sim2-handle').nth(scenario.index);
    if(!await handle.isVisible()) return {actions,notRun:'2D handle is hidden in this mode; use accessible numeric control evidence when present'};
    const before=await handle.getAttribute('aria-valuenow');await handle.focus();await handle.press(scenario.key);
    log('trusted-handle-key',{index:scenario.index,key:scenario.key,before,after:await handle.getAttribute('aria-valuenow')});
  } else if(scenario.type==='steps') await steps(scenario.steps);
  else if(scenario.type==='late-toggle') {
    await steps(scenario.steps);
    if(route.engine==='sim3') await page.locator(HOST+' [data-mode="3d"]').click();
    else log('late-toggle-not-applicable',{reason:'Sim2 row; paired Sim3 row exercises actual late mount'});
  } else if(scenario.type==='reset') {await steps(5);await page.locator(HOST+' .sim2-reset').click();log('trusted-reset-click',{});}
  else if(scenario.type==='play-pause' || scenario.type==='running-control') {
    await page.locator(HOST+' .sim2-playpause').click();await page.waitForTimeout(250);
    if(scenario.type==='running-control') {
      const first=page.locator(HOST+' input[type="range"]').first();
      if(!await first.count()) {await pause(page);return {actions,notRun:'No range control exists for this running-control case'};}
      await first.focus();await first.press('End');log('trusted-range-end-while-running',{value:await first.inputValue()});
    }
    await pause(page);log('play-then-pause',{observationWindowMs:250,notAPerformanceBenchmark:true});
  } else if(scenario.type==='toggle' || scenario.type==='toggle-running') {
    if(scenario.type==='toggle-running') await page.locator(HOST+' .sim2-playpause').click();
    for(let i=0;i<(scenario.cycles || 1);i++) {
      for(const mode of ['2d','3d']) {
        await page.locator(HOST+` [data-mode="${mode}"]`).click();await settle(page);
        const observation=await page.evaluate(collectBrowser,route.id);
        log('trusted-mode-click',{cycle:i+1,mode,state:observation.state,focus:observation.focus,domCounts:observation.domCounts,renderer:observation.renderer});
        // Retain all retry/fallback observations; an unavailable context remains unsupported.
        if(mode==='3d' && observation.renderer.contextLost) throw new Error('Context lost during toggle');
      }
    }
    await pause(page);
  } else if(scenario.type==='resize') {
    await page.setViewportSize({width:profile.width===320 ? 768:320,height:profile.height});await settle(page);
    log('real-viewport-resize',{before:{width:profile.width,height:profile.height},after:page.viewportSize(),paused:true});
  }
  await pause(page);
  return {actions};
}
async function actionLocator(page,id) {
  const all=page.locator(HOST+' button[data-action],'+HOST+' button.sim2-action'),matches=[];
  for(let i=0;i<await all.count();i++) {
    const el=all.nth(i),descriptor=await el.evaluate(e=>({id:e.dataset.action || null,label:e.getAttribute('aria-label') || e.textContent.trim(),text:e.textContent.trim(),disabled:!!e.disabled}));
    if(descriptor.id===id)matches.push({el,descriptor});
  }
  if(matches.length!==1)throw new Error('Expected exactly one mounted action '+id+'; found '+matches.length);
  const target=matches[0];
  if(!await target.el.isVisible() || !await target.el.isEnabled())throw new Error('Action is hidden or disabled: '+id);
  return target;
}
async function executeExperiment(page,route,scenario,run,onCheckpoint) {
  const actions=[];
  if(scenario.unavailableReason)return {actions,notRun:scenario.unavailableReason};
  const baseline=(await page.evaluate(collectBrowser,route.id)).state;
  for(const [index,op] of scenario.operations.entries()) {
    try {
      const before=await page.evaluate(collectBrowser,route.id);
      let actual;
      if(op.type==='action') {
        const {el,descriptor}=await actionLocator(page,op.action);
        await el.click();actual={button:descriptor,dispatch:'locator.click',trustedClickCount:1};
      } else if(op.type==='control-value') {
        const input=await controlLocator(page,op.kind,op.control);
        if(!await input.isVisible() || !await input.isEnabled())throw new Error('Numeric experiment control is hidden or disabled: '+op.control);
        const valueBefore=await input.inputValue();
        await input.fill(String(op.value));await input.press('Enter');await input.press('Tab');
        const valueAfter=await input.inputValue();
        actual={dispatch:'locator.fill + Enter + Tab',control:op.control,valueBefore,valueAfter,targetReached:Number(valueAfter)===op.value,constraintReview:Number(valueAfter)===op.value?'not-required-by-this-observation':'required'};
      } else if(op.type==='steps') {
        if(!Number.isInteger(op.steps)||op.steps<0)throw new Error('Invalid experiment step count');
        const button=page.locator(HOST+' .sim2-step');
        for(let i=0;i<op.steps;i++)await button.click();
        actual={dispatch:'locator.click',trustedClickCount:op.steps,note:'Click count is observed; physical time/event outcome is independently checked where an oracle exists'};
      } else if(op.type==='play-until-paused') {
        if(!Number.isFinite(op.maxWaitMs)||op.maxWaitMs<=0)throw new Error('Invalid terminal observation timeout');
        await page.locator(HOST+' .sim2-playpause').click();
        let terminalObserved=false,terminalError=null;
        try {await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('aria-label')==='Chạy',HOST+' .sim2-playpause',{timeout:op.maxWaitMs});terminalObserved=true;}
        catch(error) {if(error.name!=='TimeoutError')throw error;terminalError=String(error);}
        actual={dispatch:'locator.click + DOM terminal observation',trustedClickCount:1,terminalObserved,terminalError,maxWaitMs:op.maxWaitMs,note:'Bounded event observation window, not a performance benchmark; immediate snapshot precedes collector pause'};
      } else if(op.type==='playback-reset') {
        await page.locator(HOST+' .sim2-reset').click();actual={dispatch:'locator.click',trustedClickCount:1};
      } else throw new Error('Unknown experiment operation '+op.type);
      const immediate=await page.evaluate(collectBrowser,route.id);
      await pause(page);
      const after=await page.evaluate(collectBrowser,route.id);
      const receipt=makeReceipt({run,route:route.id,requested:op,actual,before,immediate,after,baseline,hashJSON:core.hashJSON});
      const errors=validateReceipt(receipt,run,core.hashJSON);
      if(errors.length)throw new Error(errors.join('; '));
      actions.push({action:'experiment-operation',at:after.measuredAt,receipt});
      // Keep each checkpoint, including failed bounded oracles, for inspection.
      // The screenshot's own stable-state bracket remains the acceptance guard.
      await onCheckpoint(actions.slice(),index);
    } catch(error) {error.actionReceipts=actions.slice();error.failedOperation=op;throw error;}
  }
  return {actions};
}
async function capture(page,route,scenario,profile,run,dir,logs,actions,suffix='') {
  await pause(page);
  const before=await page.evaluate(collectBrowser,route.id),stateHash=core.hashJSON(before.state);
  const key=`${profile.id}-${route.engine}-${route.id}-${scenario.id}${suffix}`;
  const file=key+'.png';
  // Full page preserves the production layout, plus scene, controls and readout.
  const png=await page.screenshot({path:path.join(dir,file),fullPage:true,type:'png'});
  const after=await page.evaluate(collectBrowser,route.id);
  const consistency={stable:stateHash===core.hashJSON(after.state),beforeStateHash:stateHash,afterStateHash:core.hashJSON(after.state),beforePerformanceMs:before.performanceNowMs,afterPerformanceMs:after.performanceNowMs};
  const layout={...before.layout,labelBoxAnalysis:core.layoutMetrics(before.labels,before.sceneRect),scope:'Visible HTML label boxes against active scene CSS rectangle. No mesh visibility, SVG marker extent, text contrast, depth/occlusion or human readability claim.'};
  let status=core.captureStatus(route.engine,before.renderer);
  const consoleErrors=logs.filter(l=>['error','pageerror','requestfailed','external-blocked'].includes(l.type));
  if(!consistency.stable || before.state.serializationWarnings.length || consoleErrors.length || before.environment.theme!==profile.theme || before.environment.actualDpr!==profile.dpr) status='error';
  const values={readouts:before.readouts,controls:before.controls,layout,renderer:before.renderer,consistency};
  const record={schemaVersion:2,runId:run.runId,sourceHash:run.sourceHash,collectorHash:run.collectorHash,producerVersion:run.producerVersion,stateHash,key,route:route.id,engine:route.engine,scenario,profile:profile.id,integration:'production-loader',status,formalAcceptance:'pending',state:before.state,environment:{...before.environment,browserEngine:run.browser.engine,browserVersion:run.browser.version,os:run.os},renderer:before.renderer,consistency,focus:before.focus,domCounts:before.domCounts,actions,console:logs.slice(),targets:{status:'proposed-not-measured',labelOverlapCount:0,minimumLabelMarginCssPx:8,desktopFrameP95Ms:16.7,mobileFrameP95Ms:33.3},measurements:Object.entries(values).map(([name,value])=>({name,method:core.METHODS[name],sourceHash:run.sourceHash,stateHash,measuredAt:before.measuredAt,scope:name==='layout' ? layout.scope:name==='renderer' ? 'Actual canvas WebGL capabilities and Three.js counters; not GPU-memory usage':name==='consistency' ? 'Physical reported-state/readout/control stability bracketing screenshot; not proof of every animated pixel':'Browser DOM observation; physical correctness still requires an independent oracle',value})),implementationDeclarations:{classification:'unverified-product-reported-state-and-targets',value:before.implementationDeclarations},screenshot:{file,sha256:core.sha256(png),bytes:png.length},review:{status:'pending',reviewer:null,notes:null}};
  const errors=core.validateRecord(record,run,dir);
  if(errors.length) {record.status='error';record.validationErrors=errors;}
  json(path.join(dir,key+'.json'),record);
  return record;
}
async function main(argv=process.argv.slice(2)) {
  const o=options(argv),runId=crypto.randomUUID(),dir=path.resolve(o.out,'runs',runId);
  fs.mkdirSync(dir,{recursive:true});
  const snapshot=core.sourceSnapshot();
  const collector=core.sourceSnapshot(ROOT,['tools/sim-upgrade-qualification/core.js','tools/sim-upgrade-qualification/actions.js','tools/sim-upgrade-qualification/browser.js','tools/sim-upgrade-qualification/server.js','tools/sim-upgrade-qualification/run.js']);
  const selected=core.routes().filter(r=>!o.route || r.id===o.route),profiles=core.profiles(o.profile);
  const run={schemaVersion:2,producerVersion:PRODUCER_VERSION,runId,sourceHash:snapshot.sourceHash,collectorHash:collector.sourceHash,startedAt:new Date().toISOString(),completedAt:null,git:gitInfo(),os:{type:os.type(),release:os.release(),arch:os.arch()},browser:{engine:o.engine,version:null,launchPolicy:'normal browser defaults; chromiumSandbox=true; no custom flags, profiles, security bypass, downloaded browsers or software-forcing flags'},selection:{profile:o.profile,defaultsOnly:o.defaultsOnly,routes:selected.map(r=>({id:r.id,engine:r.engine})),profiles},status:o.plan ? 'not-run':'running',formalAcceptance:'pending',records:[],actionDiscovery:{status:'not-run',method:'mounted-production-button-inventory',observations:[]},plannedExperiments:selected.map(r=>({route:r.id,engine:r.engine,status:'not-run',reason:'Action/control inventory requires a permitted production browser mount',experiments:actionPlans(r.id,{actions:[],numbers:[],playback:false}).map(p=>({id:p.id,operations:p.operations,status:'not-run'}))})),expectedDefaults:selected.flatMap(r=>profiles.map(p=>({route:r.id,engine:r.engine,profile:p.id,status:'not-run'}))),pending:PENDING,sourceIntegrity:{status:'not-checked'},collectorIntegrity:{status:'not-checked'},externalRequests:[]};
  json(path.join(dir,'source-manifest.json'),snapshot);json(path.join(dir,'collector-manifest.json'),collector);
  const flush=()=>json(path.join(dir,'run.json'),run);flush();
  if(o.plan) {run.reason='Plan/source binding only. No browser was launched, no screenshots or interactions were executed.';run.completedAt=new Date().toISOString();flush();console.log(JSON.stringify({runId,status:run.status,sourceHash:run.sourceHash,directory:dir,plannedDefaults:run.expectedDefaults.length}));return 0;}
  let browser,server;
  try {
    // Runtime must already provide Playwright and its supported browser; never install.
    const pw=require('playwright');
    browser=await pw[o.engine].launch({headless:!o.headed,...(o.engine==='chromium' ? {chromiumSandbox:true}:{}),...(o.executable ? {executablePath:path.resolve(o.executable)}:{})});
    run.browser.version=browser.version();
    server=await startBoundServer(ROOT,snapshot);
    for(const profile of profiles) for(const route of selected) {
      const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:profile.dpr,colorScheme:profile.theme,reducedMotion:profile.reducedMotion,serviceWorkers:'block'});
      const page=await context.newPage();page.setDefaultTimeout(10000);
      let logs=[];
      const add=(type,text,extra={})=>logs.push({type,text,at:new Date().toISOString(),...extra});
      page.on('console',m=>add(m.type(),m.text(),{location:m.location()}));page.on('pageerror',e=>add('pageerror',String(e)));page.on('requestfailed',r=>add('requestfailed',r.url(),{failure:r.failure()}));
      await context.route('**/*',async intercepted=>{
        const url=intercepted.request().url();
        if(new URL(url).origin===server.origin || url.startsWith('data:')) await intercepted.continue();
        else {const value={url,at:new Date().toISOString()};run.externalRequests.push(value);add('external-blocked',url);await intercepted.abort('blockedbyclient');}
      });
      try {
        await page.goto(server.origin+'/index.html',{waitUntil:'load'});
        await page.waitForFunction(()=>typeof window.loadPage==='function' && !!window.Sim2Shell && !!window.Sim3Shell && !!window.Sim3Mode);
        await page.evaluate(installObserver);
        await mount(page,route,profile,'sim2');
        const controls=await page.evaluate(inspectControls),cases=o.defaultsOnly ? [{id:'default',type:'default'}]:core.scenarios(route.id,controls,route.engine);
        run.actionDiscovery.status='observed';run.actionDiscovery.observations.push({route:route.id,engine:route.engine,profile:profile.id,measuredAt:new Date().toISOString(),sourceHash:run.sourceHash,collectorHash:run.collectorHash,producerVersion:run.producerVersion,controls,cases:cases.map(c=>({id:c.id,type:c.type,operations:c.operations || null,unavailableReason:c.unavailableReason || null}))});
        const bootstrapLogs=logs.slice();
        for(const scenario of cases) {
          logs=bootstrapLogs.slice();
          const key=`${profile.id}-${route.engine}-${route.id}-${scenario.id}`;
          try {
            await page.setViewportSize({width:profile.width,height:profile.height});
            await mount(page,route,profile,scenario.type==='late-toggle' ? 'sim2':route.engine);
            let action={actions:[]};
            if(!['sequence','action-sequence'].includes(scenario.type)) action=await execute(page,route,scenario,profile);
            if(scenario.type==='action-sequence') {
              action=await executeExperiment(page,route,scenario,run,async(receipts,index)=>{
                const record=await capture(page,route,scenario,profile,run,dir,logs,receipts,`-operation${index+1}`);run.records.push(record);flush();
              });
              if(!action.notRun)continue;
            }
            if(action.notRun) {run.records.push(notRunRecord(run,{key,route:route.id,engine:route.engine,profile:profile.id,scenario},{reason:action.notRun}));continue;}
            let record;
            if(scenario.type==='sequence') {
              let previous=0;
              for(const n of scenario.steps) {
                const delta=await execute(page,route,{type:'steps',steps:n-previous},profile);previous=n;
                action.actions.push(...delta.actions);
                record=await capture(page,route,scenario,profile,run,dir,logs,action.actions,`-step${n}`);run.records.push(record);
              }
            } else {record=await capture(page,route,scenario,profile,run,dir,logs,action.actions);run.records.push(record);}
            if(scenario.id==='default') run.expectedDefaults.find(e=>e.route===route.id && e.engine===route.engine && e.profile===profile.id).status=record.status;
          } catch(error) {
            run.records.push(notRunRecord(run,{key,route:route.id,engine:route.engine,profile:profile.id,scenario},{attempted:true,error:String(error),actions:error.actionReceipts || [],failedOperation:error.failedOperation || null,console:logs.slice()}));
          }
          flush();
        }
      } catch(error) {run.records.push(notRunRecord(run,{route:route.id,engine:route.engine,profile:profile.id},{attempted:true,error:String(error),actions:error.actionReceipts || [],failedOperation:error.failedOperation || null,console:logs.slice()}));}
      finally {await context.close();flush();}
    }
    const errors=core.verifySource(ROOT,snapshot);
    const collectorErrors=core.verifySource(ROOT,collector);errors.push(...collectorErrors.map(e=>'Collector '+e));
    run.collectorIntegrity={status:collectorErrors.length?'failed':'verified',errors:collectorErrors};
    const servedErrors=server.requests.filter(r=>r.status!==200);
    run.sourceIntegrity={status:errors.length || servedErrors.length ? 'failed':'verified',errors,servedErrors};
    run.requests=server.requests;
    run.status=run.expectedDefaults.every(r=>r.status==='evidence-captured') && run.records.every(r=>r.status==='evidence-captured') && !errors.length && !servedErrors.length ? 'capture-complete-review-pending':'incomplete';
  } catch(error) {run.status='blocked';run.runtimeError=String(error);}
  finally {
    if(browser) await browser.close().catch(e=>{run.teardownError=String(e);});
    if(server) await server.close().catch(e=>{run.serverCloseError=String(e);});
    run.completedAt=new Date().toISOString();flush();
  }
  console.log(JSON.stringify({runId,status:run.status,sourceHash:run.sourceHash,directory:dir,formalAcceptance:'pending',records:run.records.length}));
  return run.status==='capture-complete-review-pending' ? 0:2;
}
if(require.main===module) main().then(code=>{process.exitCode=code;}).catch(error=>{console.error(error.stack);process.exitCode=2;});
module.exports={options,main,PENDING,execute,executeExperiment,actionLocator,notRunRecord};
