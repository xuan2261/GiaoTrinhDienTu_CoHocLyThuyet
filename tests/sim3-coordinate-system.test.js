'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const C = require('../js/sim3/core/coordinate-system.js');
const P = require('../js/sim3/core/three-primitives.js');

assert.deepStrictEqual(C.CONVENTION.worldAxes, {
  x: 'right', y: 'up', z: 'toward-viewer'
});
assert.strictEqual(C.CONVENTION.handedness, 'right');

const X = { x: 1, y: 0, z: 0 };
const Y = { x: 0, y: 1, z: 0 };
const Z = { x: 0, y: 0, z: 1 };
assert.deepStrictEqual(C.cross(X, Y), Z);
assert.deepStrictEqual(C.cross(Y, Z), X);
assert.deepStrictEqual(C.cross(Z, X), Y);
assert.strictEqual(C.dot(X, Y), 0);
assert.strictEqual(C.dot({ x: 1, y: -2, z: 3 }, { x: 4, y: 5, z: -6 }), -24);

const frozenPoint = Object.freeze({ x: 2, y: 3 });
const frozenVector = Object.freeze({ x: -4, y: 5 });
assert.deepStrictEqual(C.point2D(frozenPoint, { plane: 'horizontal', elevation: 7 }), { x: 2, y: 7, z: -3 });
assert.deepStrictEqual(C.vector2D(frozenVector, { plane: 'horizontal' }), { x: -4, y: 0, z: -5 });
assert.deepStrictEqual(C.point2D(frozenPoint, { plane: 'vertical', depth: -2 }), { x: 2, y: 3, z: -2 });
assert.deepStrictEqual(C.vector2D(frozenVector, { plane: 'vertical' }), { x: -4, y: 5, z: 0 });
assert.deepStrictEqual(frozenPoint, { x: 2, y: 3 });
assert.deepStrictEqual(frozenVector, { x: -4, y: 5 });

const horizontalX = C.vector2D({ x: 1, y: 0 }, { plane: 'horizontal' });
const horizontalY = C.vector2D({ x: 0, y: 1 }, { plane: 'horizontal' });
assert.deepStrictEqual(C.cross(horizontalX, horizontalY), C.axisVector(1, 'horizontal'));
const verticalX = C.vector2D({ x: 1, y: 0 }, { plane: 'vertical' });
const verticalY = C.vector2D({ x: 0, y: 1 }, { plane: 'vertical' });
assert.deepStrictEqual(C.cross(verticalX, verticalY), C.axisVector(1, 'vertical'));
assert.deepStrictEqual(C.axisVector(-2, 'horizontal'), { x: 0, y: -2, z: 0 });
assert.deepStrictEqual(C.axisVector(-2, 'vertical'), { x: 0, y: 0, z: -2 });
assert.deepStrictEqual(C.point2D({ x: 0, y: 0 }, { plane: 'horizontal' }), { x: 0, y: 0, z: 0 });
assert.deepStrictEqual(C.vector2D({ x: 0, y: 0 }, { plane: 'horizontal' }), { x: 0, y: 0, z: 0 });
assert.deepStrictEqual(C.axisVector(0, 'vertical'), { x: 0, y: 0, z: 0 });

for (const invalid of [
  () => C.point2D({ x: 0, y: 0 }, {}),
  () => C.vector2D({ x: 0, y: 0 }, { plane: 'floor' }),
  () => C.axisVector(1),
  () => C.cross({ x: NaN, y: 0, z: 0 }, Y)
]) assert.throws(invalid, /plane|finite/i);
assert.throws(
  () => C.cross({ x: Number.MAX_VALUE, y: Number.MAX_VALUE, z: 0 }, { x: Number.MAX_VALUE, y: Number.MAX_VALUE, z: 0 }),
  /finite result/i
);
assert.throws(
  () => C.dot({ x: Number.MAX_VALUE, y: Number.MAX_VALUE, z: 0 }, { x: Number.MAX_VALUE, y: -Number.MAX_VALUE, z: 0 }),
  /finite result/i
);

class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.set(x, y, z); }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  lengthSq() { return this.x * this.x + this.y * this.y + this.z * this.z; }
  length() { return Math.sqrt(this.lengthSq()); }
  normalize() { const n = this.length() || 1; this.x /= n; this.y /= n; this.z /= n; return this; }
}
const THREE = { Vector3 };
function fakeArrow() {
  return {
    visible: true,
    position: new Vector3(),
    scale: { y: 1 },
    quaternion: {
      calls: [],
      setFromUnitVectors(from, to) { this.calls.push({ from: from.clone(), to: to.clone() }); }
    },
    userData: {}
  };
}

const zeroArrow = fakeArrow();
const zeroResult = P.updateArrow(THREE, zeroArrow, { x: 0, y: 0, z: 0 }, { base: { x: 1, y: 2, z: 3 } });
assert.deepStrictEqual(zeroResult, { magnitude: 0, displayLength: 0, visible: false });
assert.strictEqual(zeroArrow.visible, false);
assert.strictEqual(zeroArrow.scale.y, 0);
assert.strictEqual(zeroArrow.quaternion.calls.length, 0);
assert.deepStrictEqual({ x: zeroArrow.position.x, y: zeroArrow.position.y, z: zeroArrow.position.z }, { x: 1, y: 2, z: 3 });

const signedArrow = fakeArrow();
const signedVector = Object.freeze(C.axisVector(-2, 'horizontal'));
const signedResult = P.updateArrow(THREE, signedArrow, signedVector, { factor: 0.5, minLength: 0.2, maxLength: 0.75 });
assert.deepStrictEqual(signedResult, { magnitude: 2, displayLength: 0.75, visible: true });
assert.strictEqual(signedArrow.userData.sim3PhysicalMagnitude, 2);
assert.strictEqual(signedArrow.userData.sim3DisplayLength, 0.75);
assert.deepStrictEqual(signedVector, { x: 0, y: -2, z: 0 });
assert.deepStrictEqual(signedArrow.quaternion.calls[0].to, new Vector3(0, -1, 0));
for (const options of [
  { factor: Infinity },
  { minLength: Infinity, maxLength: Infinity },
  { minLength: 2, maxLength: 1 }
]) {
  assert.throws(() => P.updateArrow(THREE, fakeArrow(), { x: 1, y: 0, z: 0 }, options), /display lengths/i);
}
assert.throws(
  () => P.updateArrow(THREE, fakeArrow(), { x: Number.MAX_VALUE, y: Number.MAX_VALUE, z: 0 }),
  /magnitude.*finite/i
);

function scriptSources(relative) {
  const source = fs.readFileSync(path.join(ROOT, relative), 'utf8');
  return [...source.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)]
    .map(match => match[1].replace(/^(?:\.\.\/)+/, ''));
}

for (const relative of ['index.html', 'tests/fixtures/sim2-ch1.html', 'tests/fixtures/sim2-ch2.html', 'tests/fixtures/sim2-ch3.html']) {
  const sources = scriptSources(relative);
  const labelLayer = sources.findIndex(src => src === 'js/sim3/core/three-label-layer.js');
  const shell = sources.findIndex(src => src === 'js/sim3/core/three-shell.js');
  const coordinates = sources.findIndex(src => src === 'js/sim3/core/coordinate-system.js');
  const primitives = sources.findIndex(src => src === 'js/sim3/core/three-primitives.js');
  const firstAdapter = sources.findIndex(src => src.startsWith('js/sim3/sims/'));
  assert.ok(labelLayer >= 0, `${relative} must load three-label-layer.js`);
  assert.ok(labelLayer < shell, `${relative} must load labels before shell`);
  assert.ok(coordinates >= 0, `${relative} must load coordinate-system.js`);
  assert.ok(coordinates < primitives, `${relative} must load coordinates before primitives`);
  assert.ok(primitives < firstAdapter, `${relative} must load primitives before adapters`);
}

console.log('sim3-coordinate-system: PASS');
