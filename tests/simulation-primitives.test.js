const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Mock browser environment for node testing of the primitive logic
global.window = {};
global.document = {
  documentElement: {
    getAttribute: () => 'dark'
  },
  createElement: () => ({
    setAttribute: () => {},
    style: {},
    appendChild: () => {}
  })
};

// Load the file
const primitivesPath = path.join(__dirname, '..', 'js', 'sim-route-renderer-primitives.js');
const code = fs.readFileSync(primitivesPath, 'utf8');
eval(code);

const P = window.SimRouteRendererPrimitives;

console.log('Testing SimRouteRendererPrimitives...');

// Test sceneColors
const darkColors = P.tone ? P.tone(0) : null; // Checking if P is loaded
assert.ok(P, 'Primitives should be loaded');

// Test resetMarks and marks
P.resetMarks('test-route');
P.mark('test-kind', 10, 20);
const m = P.marks();
assert.strictEqual(m.length, 1, 'Should have 1 mark');
assert.strictEqual(m[0], 'test-kind:10:20', 'Mark format should match');

// Test tone
assert.strictEqual(typeof P.tone(1), 'string', 'Tone should return a color string');

// Test supportTriangle
P.resetMarks('test-support');
P.supportTriangle({ beginPath:()=>{}, moveTo:()=>{}, lineTo:()=>{}, closePath:()=>{}, fill:()=>{}, stroke:()=>{}, save:()=>{}, restore:()=>{} }, 100, 200, 10, '#f00');
assert.ok(P.marks().includes('supportTriangle:100:200:10'), 'supportTriangle should be marked');

// Test vectorTriangle
P.resetMarks('test-vector');
P.vectorTriangle({ beginPath:()=>{}, moveTo:()=>{}, lineTo:()=>{}, closePath:()=>{}, fill:()=>{}, stroke:()=>{}, save:()=>{}, restore:()=>{} }, 0, 0, 10, 10, 0, 10, '#0f0');
assert.ok(P.marks().includes('vectorTriangle:0:0:10:10:0:10'), 'vectorTriangle should be marked');

// Test barGraph
P.resetMarks('test-bar');
P.barGraph({ fillRect:()=>{}, strokeRect:()=>{}, fillStyle:'', strokeStyle:'', fillText:()=>{} }, 10, 10, 100, 20, 50, 100, '#00f', 'Test');
assert.ok(P.marks().includes('barGraph:10:10:100:20'), 'barGraph should be marked');

console.log('Primitives logic tests: PASS');
