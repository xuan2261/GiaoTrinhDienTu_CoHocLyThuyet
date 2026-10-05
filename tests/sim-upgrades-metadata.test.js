'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const specs=JSON.parse(fs.readFileSync(path.join(root,'data/simulation-specifications.json'),'utf8'));
const byId=id=>specs.specifications.find(s=>s.id===id);
test('draft statics specifications state the actual supported force/moment/rope models',()=>{
 assert.equal(byId('ch1-1-6').formula.expression,'ΣF=0; M_O=-Fd=-50d for every moment origin O');
 assert.equal(byId('ch1-3-2').formula.expression,'T=W/(2cosα); x_anchor=3sinα; y_node=4-3cosα');
 assert.equal(byId('ch1-3-6').formula.expression,'R=P; M_load=-Pa; M_support=+Pa; R-P=0; M_support+M_load=0');
});
test('current upgrade tests are associated but do not grant draft specifications acceptance',()=>{
 for(const s of specs.specifications){assert.ok(s.sources.tests.includes(`tests/sim-upgrades-ch${s.chapter}.test.js`));assert.equal(s.status,'draft');assert.equal(s.evidence.verified,false);}
});
