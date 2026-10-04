'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function fixture(value) {
  const htmlWrites = [];
  class Node {
    constructor(tag) { this.tagName=tag; this.children=[]; this.dataset={}; this.listeners={}; this.style={}; this.className=''; this._text=''; }
    appendChild(node) { this.children.push(node); node.parentElement=this; return node; }
    insertBefore(node) { return this.appendChild(node); }
    remove() { if(this.parentElement) this.parentElement.children=this.parentElement.children.filter(n=>n!==this); }
    addEventListener(name, fn) { this.listeners[name]=fn; }
    setAttribute(name,value) { this[name]=value; }
    set textContent(value) { this._text=String(value); this.children=[]; }
    get textContent() { return this._text+this.children.map(n=>n.textContent).join(''); }
    set innerHTML(value) { htmlWrites.push(String(value)); this._html=value; }
    get innerHTML() { return this._html||''; }
    querySelectorAll(sel) { const out=[]; for(const n of this.children){ if(sel==='.'+n.className) out.push(n); out.push(...n.querySelectorAll(sel)); } return out; }
    querySelector(sel) { return this.querySelectorAll(sel)[0]||null; }
  }
  const body = new Node('body'), bc=new Node('div'); bc.className='bc'; body.appendChild(bc);
  const document={body,readyState:'complete',createElement:t=>new Node(t),querySelector:s=>body.querySelector(s),getElementById:()=>null,addEventListener:()=>{}};
  const store=new Map([['chlyt_notes',JSON.stringify(value)]]);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/notes.js'),'utf8'),{
    document,location:{hash:'#test'},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},
    MutationObserver:class{observe(){}},setTimeout:()=>{},window:{},Date
  });
  return {body,htmlWrites,store};
}
const payload='<img src=x onerror="globalThis.compromised=true">';
const f=fixture({test:[{text:payload,note:payload,ts:1}]});
f.body.querySelector('.notes-indicator').listeners.click();
assert(!f.htmlWrites.some(s=>s.includes(payload)), 'note/quote text must never reach an HTML parsing sink');
assert(f.body.querySelector('.np-comment').textContent.includes(payload), 'literal markup must remain readable');
assert(f.body.querySelector('.np-text').textContent.includes(payload));
f.body.querySelector('.np-del').listeners.click();
assert.equal(JSON.parse(f.store.get('chlyt_notes')).test.length,0);
assert.equal(f.body.querySelector('.notes-indicator'),null,'empty note badge must disappear');
for(const invalid of [null,[],{test:'bad'},{test:[null,1,{}, {text:42,note:[]}] }]) assert.doesNotThrow(()=>fixture(invalid));
console.log('SEC-01: literal rendering, deletion, empty state and malformed storage PASS');
