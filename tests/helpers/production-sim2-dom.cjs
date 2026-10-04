'use strict';
// Minimal event/DOM recording host for the complete production Sim2 source stack.
// It intentionally does not emulate layout, native input sanitization, AT or GPU.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const repo=path.resolve(__dirname,'../..');
function mountProduction(route) {
 const all=[],timers=new Map(),frames=new Map();let serial=0,physical=null,shell;
 const document={activeElement:null};
 function node(tag){
  let text='';const attrs={},classes=new Set();const n={tag,tagName:tag.toUpperCase(),attrs,children:[],dataset:{},style:{},listeners:{},clientWidth:640,clientHeight:440,value:'',min:'',max:'',step:'',type:'',hidden:false,
   classList:{add(...values){values.forEach(x=>classes.add(x));},remove(...values){values.forEach(x=>classes.delete(x));},toggle(x,on){if(on)classes.add(x);else classes.delete(x);},contains(x){return classes.has(x);}},
   setAttribute(k,v){attrs[k]=String(v);if(k==='class'){classes.clear();String(v).split(/\s+/).filter(Boolean).forEach(x=>classes.add(x));}if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,s)=>s.toUpperCase())]=String(v);},
   getAttribute(k){return attrs[k]??null;},removeAttribute(k){delete attrs[k];},
   appendChild(c){if(c.parentNode)c.parentNode.removeChild(c);this.children.push(c);c.parentNode=this;return c;},
   insertBefore(c,b){if(c.parentNode)c.parentNode.removeChild(c);const i=this.children.indexOf(b);this.children.splice(i<0?this.children.length:i,0,c);c.parentNode=this;return c;},
   removeChild(c){this.children=this.children.filter(x=>x!==c);c.parentNode=null;},
   addEventListener(k,f){(this.listeners[k]??=[]).push(f);},removeEventListener(k,f){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==f);},
   emit(k,v={}){for(const f of [...this.listeners[k]||[]])f({preventDefault(){},stopPropagation(){},...v});},
   focus(){document.activeElement=this;},click(){this.emit('click');},
   getBoundingClientRect(){return {left:0,top:0,right:640,bottom:440,width:640,height:440};},getClientRects(){return [this.getBoundingClientRect()];},
   setPointerCapture(id){this.captured=id;},hasPointerCapture(id){return this.captured===id;},releasePointerCapture(id){if(this.captured===id)this.captured=null;},
   querySelectorAll(selector){return walk(this).slice(1).filter(e=>selector.startsWith('.')?e.classList.contains(selector.slice(1)):e.tag===selector);},querySelector(selector){return this.querySelectorAll(selector)[0]||null;},
   getContext(){return new Proxy({globalAlpha:1},{get(o,k){return k in o?o[k]:(()=>{});}});}};
  Object.defineProperties(n,{className:{get(){return [...classes].join(' ');},set(v){classes.clear();String(v).split(/\s+/).filter(Boolean).forEach(x=>classes.add(x));attrs.class=v;}},firstChild:{get(){return this.children[0]||null;}},nextSibling:{get(){const siblings=this.parentNode?.children||[];return siblings[siblings.indexOf(this)+1]||null;}},textContent:{get(){return text+this.children.map(c=>c.textContent).join('');},set(v){text=String(v);this.children.forEach(x=>x.parentNode=null);this.children=[];}},innerHTML:{get(){return text;},set(v){this.textContent=String(v).replace(/<[^>]*>/g,'');}}});all.push(n);return n;
 }
 const walk=n=>[n,...n.children.flatMap(walk)];document.createElement=node;document.createElementNS=(_,tag)=>node(tag);
 const root=node('window');root.matchMedia=()=>({matches:true});root.devicePixelRatio=1;root.requestAnimationFrame=f=>{frames.set(++serial,f);return serial;};root.cancelAnimationFrame=id=>frames.delete(id);
 const context=vm.createContext({window:root,document,console,Promise,Math,setTimeout:f=>{timers.set(++serial,f);return serial;},clearTimeout:id=>timers.delete(id)});
 const run=file=>vm.runInContext(fs.readFileSync(path.join(repo,file),'utf8'),context,{filename:file});
 for(const file of ['registry','physics/statics','physics/kinematics','physics/dynamics','core/palette','core/transform','core/svg-render','core/overlay','core/canvas-underlay','core/animation-clock','core/controls','core/panel','core/sim-shell'])run('js/sim2/'+file+'.js');
 run('js/sim3/core/mode-toggle.js');
 for(const name of ['115','153','213','222','232','244','253','313','353','362'])root['Sim3Ch'+name]={create(){return {setState(state){physical=JSON.parse(JSON.stringify(state));},resize(){},dispose(){}};}};
 const actual=root.Sim2Shell.createSimShell;root.Sim2Shell.createSimShell=config=>(shell=actual(config));
 run('js/sim2/sims/'+route.slice(0,3)+'/'+route+'.js');
 const host=node('div');const instance=root.Sim2Registry.get(route)(host);
 function rows(){return Object.fromEntries(walk(host).filter(n=>n.getAttribute('data-readout-key')!==null).map(n=>[n.getAttribute('data-readout-key'),n.children.find(c=>c.classList.contains('sim2-readout-value')).textContent]));}
 return {host,root,document,all,shell,rows,walk,nodes:()=>walk(host),physical:()=>physical,frames,timers,dispose:()=>instance.dispose()};
}
module.exports={mountProduction};
