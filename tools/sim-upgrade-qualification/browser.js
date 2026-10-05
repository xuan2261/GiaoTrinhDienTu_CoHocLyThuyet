'use strict';
// These functions execute in the real browser. They do not import product debug
// metrics as measured values. Wrappers observe calls and return original results.
function installObserver() {
  if (window.__Q0_OBSERVER__) return;
  const q = window.__Q0_OBSERVER__ = { shell:null, sim3:null, bridgeState:null, serializationWarnings:[] };
  q.clone = value => {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(value, (key,v) => {
      if (typeof v === 'number' && !Number.isFinite(v)) { q.serializationWarnings.push('nonfinite:'+key); return { invalidNumber:String(v) }; }
      if (typeof v === 'function' || typeof v === 'undefined' || typeof v === 'symbol') { q.serializationWarnings.push('nonJSON:'+key); return { unavailable:typeof v }; }
      if (v && typeof v === 'object') { if (seen.has(v)) { q.serializationWarnings.push('circular:'+key); return { unavailable:'circular-or-shared-reference' }; } seen.add(v); }
      return v;
    }));
  };
  const create2 = window.Sim2Shell.createSimShell;
  window.Sim2Shell.createSimShell = function(...args) { const value=create2.apply(this,args); q.shell=value; return value; };
  const attach = window.Sim3Mode.attach;
  window.Sim3Mode.attach = function(...args) {
    const value=attach.apply(this,args), set=value.setState;
    value.setState=function(state) { q.bridgeState=q.clone(state); return set.apply(this,arguments); };
    return value;
  };
  const create3 = window.Sim3Shell.create;
  window.Sim3Shell.create = function(...args) { const value=create3.apply(this,args); q.sim3=value; return value; };
}
function inspectControls() {
  const host=document.querySelector('#content-area [data-sim-mount-route]');
  if (!host) throw new Error('Production route has no marked mount');
  const entries=type=>Array.from(host.querySelectorAll(`input[type="${type}"]`)).map((el,i)=>({id:el.dataset.id || el.dataset.numberFor || el.dataset.controlId || el.id || `${type}-${i}`,index:i,min:el.min === '' ? null : Number(el.min),max:el.max === '' ? null : Number(el.max),step:el.step,physicalStep:el.dataset.physicalStep || null,value:el.value}));
  const actions=Array.from(host.querySelectorAll('button[data-action],button.sim2-action')).map((el,index)=>{const style=getComputedStyle(el),rect=el.getBoundingClientRect();return {id:el.dataset.action || null,index,label:el.getAttribute('aria-label') || el.textContent.trim(),text:el.textContent.trim(),disabled:!!el.disabled,visible:!!el.getClientRects().length&&rect.width>0&&rect.height>0&&style.visibility!=='hidden'&&style.display!=='none'&&style.opacity!=='0'};});
  return {ranges:entries('range'),numbers:entries('number'),actions,handles:host.querySelectorAll('.sim2-handle').length,playback:!!host.querySelector('.sim2-step')};
}
function collectBrowser(route) {
  const host=document.querySelector('#content-area [data-sim-mount-route]');
  if (!host || host.dataset.simMountRoute !== route) throw new Error('Wrong production route mounted');
  const q=window.__Q0_OBSERVER__;
  if (!q || !q.shell) throw new Error('Source-state observer is not attached');
  const rect=el=>{ const r=el.getBoundingClientRect(); return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}; };
  const visible=el=>{ const s=getComputedStyle(el),r=el.getBoundingClientRect(); return !!el.getClientRects().length && r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none' && s.opacity!=='0'; };
  const describe=(el,i)=>({id:el.id || `${el.tagName.toLowerCase()}-${i}`,tag:el.tagName.toLowerCase(),classes:typeof el.className==='string' ? el.className : el.getAttribute('class'),text:(el.textContent || '').trim(),visible:visible(el),rect:rect(el)});
  const readouts=Array.from(host.querySelectorAll('.sim2-readout-row')).map((el,i)=>({...describe(el,i),key:el.dataset.readoutKey || null,value:el.querySelector('.sim2-readout-value')?.textContent.trim() || ''}));
  const controls=Array.from(host.querySelectorAll('input,button,[role="slider"]')).map((el,i)=>({...describe(el,i),controlId:el.dataset.id || el.dataset.numberFor || el.dataset.controlId || el.id || null,type:el.type || el.getAttribute('role'),value:el.value ?? null,min:el.min ?? el.getAttribute('aria-valuemin'),max:el.max ?? el.getAttribute('aria-valuemax'),step:el.step ?? null,physicalStep:el.dataset.physicalStep || null,ariaLabel:el.getAttribute('aria-label'),ariaValueText:el.getAttribute('aria-valuetext'),ariaValueNow:el.getAttribute('aria-valuenow'),ariaPressed:el.getAttribute('aria-pressed'),disabled:!!el.disabled,validity:el.validity ? {valid:el.validity.valid,rangeUnderflow:el.validity.rangeUnderflow,rangeOverflow:el.validity.rangeOverflow,stepMismatch:el.validity.stepMismatch} : null,focused:el===document.activeElement}));
  const labels=Array.from(host.querySelectorAll('.sim2-label,.sim3-label')).map(describe);
  const canvas=host.querySelector('canvas.sim3-canvas'), fallback=host.querySelector('.sim3-fallback');
  const renderer={canvasCount:host.querySelectorAll('canvas.sim3-canvas').length,webgl:false,contextLost:false,fallbackVisible:!!fallback && visible(fallback),fallbackText:fallback?.textContent.trim() || null,threeRevision:window.THREE?.REVISION || null};
  if (canvas) {
    const gl=q.sim3?.renderer?.getContext() || canvas.getContext('webgl2') || canvas.getContext('webgl');
    renderer.canvasRect=rect(canvas); renderer.canvasVisible=visible(canvas); renderer.drawingBuffer={width:canvas.width,height:canvas.height};
    if (gl) {
      const debug=gl.getExtension('WEBGL_debug_renderer_info');
      Object.assign(renderer,{webgl:true,contextLost:gl.isContextLost(),api:typeof WebGL2RenderingContext!=='undefined' && gl instanceof WebGL2RenderingContext ? 'WebGL2':'WebGL1',version:gl.getParameter(gl.VERSION),vendor:gl.getParameter(gl.VENDOR),renderer:gl.getParameter(gl.RENDERER),unmaskedVendor:debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL):null,unmaskedRenderer:debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null,contextAttributes:gl.getContextAttributes(),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE),maxViewportDims:Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS)),extensions:gl.getSupportedExtensions()});
    }
  }
  if (q.sim3?.renderer?.info) {
    const info=q.sim3.renderer.info;
    renderer.libraryInfo={render:q.clone(info.render),memory:q.clone(info.memory),programCount:info.programs?.length ?? null,scope:'Three.js renderer counters; NOT GPU byte allocation or browser memory'};
  }
  const activeScene=canvas && visible(canvas) ? canvas : host.querySelector('.sim2-root');
  const actionValues=Array.from(host.querySelectorAll('button[data-action],button.sim2-action')).map(el=>({id:el.dataset.action || null,label:el.getAttribute('aria-label') || el.textContent.trim(),disabled:!!el.disabled,visible:visible(el)}));
  const geometry=['.sim2-ic-radius-guide','.sim2-action-reaction-pair','.sim2-graph-reference','.sim2-graph'].flatMap(selector=>Array.from(host.querySelectorAll(selector)).map((el,index)=>({selector,index,visibility:el.getAttribute('visibility') || 'visible',points:el.getAttribute('points'),visible:visible(el)})));
  const state={actionValues,geometry,playbackLabel:host.querySelector('.sim2-playpause')?.getAttribute('aria-label') || null,clockSeconds:typeof q.shell.getSimulationTime==='function' ? q.shell.getSimulationTime():null,bridgeState:q.bridgeState,readoutValues:readouts.map(r=>({key:r.key,value:r.value})),controlValues:controls.map(c=>({id:c.controlId,type:c.type,value:c.value,ariaValueNow:c.ariaValueNow})),eventPhase:readouts.find(r=>r.key==='phase')?.value || null,stateAvailability:q.bridgeState ? 'observed-Sim2-to-Sim3-state-plus-DOM':'DOM-readouts-controls-and-clock; internal-physical-state-not-exposed',serializationWarnings:q.serializationWarnings.slice()};
  return {route,measuredAt:new Date().toISOString(),performanceNowMs:performance.now(),state,readouts,controls,labels,hostRect:rect(host),sceneRect:rect(activeScene),renderer,layout:{scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,hostRect:rect(host),sceneRect:rect(activeScene),labels,readouts,controls},environment:{actualDpr:devicePixelRatio,viewport:{width:innerWidth,height:innerHeight},scroll:{x:scrollX,y:scrollY},theme:document.documentElement.dataset.theme || null,colorScheme:matchMedia('(prefers-color-scheme:dark)').matches ? 'dark':'light',reducedMotion:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'reduce':'no-preference',userAgent:navigator.userAgent,platform:navigator.platform,language:navigator.language,documentUrl:location.href},implementationDeclarations:q.clone(window.__SIM3_DEBUG__?.[route] || null),focus:{tag:document.activeElement?.tagName || null,id:document.activeElement?.id || null,label:document.activeElement?.getAttribute('aria-label') || null},domCounts:{hosts:host.querySelectorAll('.sim3-host').length,canvases:host.querySelectorAll('canvas').length,labels:labels.length,total:host.querySelectorAll('*').length}};
}
module.exports={installObserver,inspectControls,collectBrowser};
