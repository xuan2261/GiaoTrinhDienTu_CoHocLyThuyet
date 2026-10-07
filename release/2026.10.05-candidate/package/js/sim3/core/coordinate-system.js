(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim3Coordinates = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  const PLANES = Object.freeze({ HORIZONTAL: 'horizontal', VERTICAL: 'vertical' });
  const CONVENTION = Object.freeze({
    handedness: 'right',
    worldAxes: Object.freeze({ x: 'right', y: 'up', z: 'toward-viewer' }),
    horizontal: Object.freeze({ source: '(x,y)', world: '(x,elevation,-y)', axis: '+Y' }),
    vertical: Object.freeze({ source: '(x,y)', world: '(x,y,depth)', axis: '+Z' })
  });

  function planeOf(value) {
    if (value == null || value === '') throw new TypeError('Sim3Coordinates plane is required');
    if (value !== PLANES.HORIZONTAL && value !== PLANES.VERTICAL) {
      throw new RangeError('Sim3Coordinates plane must be "horizontal" or "vertical"');
    }
    return value;
  }

  function finite(value, label) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(`Sim3Coordinates ${label} must be finite`);
    }
    return value === 0 ? 0 : value;
  }

  function source2D(value, label) {
    if (!value || typeof value !== 'object') throw new TypeError(`Sim3Coordinates ${label} is required`);
    return { x: finite(value.x, `${label}.x`), y: finite(value.y, `${label}.y`) };
  }

  function world3D(value, label) {
    if (!value || typeof value !== 'object') throw new TypeError(`Sim3Coordinates ${label} is required`);
    return {
      x: finite(value.x, `${label}.x`),
      y: finite(value.y, `${label}.y`),
      z: finite(value.z, `${label}.z`)
    };
  }

  function point2D(point, options) {
    const p = source2D(point, 'point');
    const plane = planeOf(options && options.plane);
    if (plane === PLANES.HORIZONTAL) {
      const elevation = options.elevation == null ? 0 : finite(options.elevation, 'elevation');
      return { x: p.x, y: elevation, z: p.y === 0 ? 0 : -p.y };
    }
    const depth = options.depth == null ? 0 : finite(options.depth, 'depth');
    return { x: p.x, y: p.y, z: depth };
  }

  function vector2D(vector, options) {
    const v = source2D(vector, 'vector');
    const plane = planeOf(options && options.plane);
    return plane === PLANES.HORIZONTAL
      ? { x: v.x, y: 0, z: v.y === 0 ? 0 : -v.y }
      : { x: v.x, y: v.y, z: 0 };
  }

  function axisVector(scalar, plane) {
    const value = finite(scalar, 'axis scalar');
    return planeOf(plane) === PLANES.HORIZONTAL
      ? { x: 0, y: value, z: 0 }
      : { x: 0, y: 0, z: value };
  }
  function finiteResult(value, label) {
    if (!Number.isFinite(value)) throw new RangeError(`Sim3Coordinates ${label} must have a finite result`);
    return value === 0 ? 0 : value;
  }


  function cross(a, b) {
    const left = world3D(a, 'left vector');
    const right = world3D(b, 'right vector');
    const x = finiteResult(left.y * right.z - left.z * right.y, 'cross.x');
    const y = finiteResult(left.z * right.x - left.x * right.z, 'cross.y');
    const z = finiteResult(left.x * right.y - left.y * right.x, 'cross.z');
    return { x, y, z };
  }

  function dot(a, b) {
    const left = world3D(a, 'left vector');
    const right = world3D(b, 'right vector');
    return finiteResult(left.x * right.x + left.y * right.y + left.z * right.z, 'dot');
  }

  return { PLANES, CONVENTION, point2D, vector2D, axisVector, cross, dot };
});
