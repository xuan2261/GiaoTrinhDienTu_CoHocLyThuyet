'use strict';
const assert = require('node:assert/strict');
const { mount } = require('./helpers/sim2-route-harness.cjs');
const manifest = require('../js/sim2/sim2-route-manifest.js');
// Broad finite-value/mount guard, not an oracle for every route's physics.
const results=[];
for (const { id } of manifest) {
  const initial=mount(id);let finiteBoundaryChecks=0;
  for (const slider of initial.controls?.sliders || []) {
    for (const bound of ['min','max']) {
      const h=mount(id);h.slider(slider.id,slider[bound]);
      if(h.update) for(let i=0;i<120;i++) h.stepOnce();
      assert.ok(!Object.values(h.rows).some(v=>/NaN|Infinity/.test(v)),`${id}/${slider.id}/${bound}`);
      h.dispose();finiteBoundaryChecks++;
    }
  }
  initial.dispose();results.push({id,mounted:true,finiteBoundaryChecks,disposed:true});
}
console.log(JSON.stringify(results,null,2));
