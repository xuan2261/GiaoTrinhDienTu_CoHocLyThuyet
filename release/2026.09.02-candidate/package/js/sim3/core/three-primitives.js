(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim3Primitives = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';
  function material(THREE, color, opts) {
    opts = opts || {};
    return new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness == null ? 0.55 : opts.roughness,
      metalness: opts.metalness || 0,
      emissive: opts.emissive || 0x000000,
      transparent: !!opts.transparent,
      opacity: opts.opacity == null ? 1 : opts.opacity
    });
  }

  function arrow(THREE, color, opts) {
    opts = opts || {};
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(opts.radius || 0.035, opts.radius || 0.035, 1, 16),
      material(THREE, color)
    );
    const headLength = opts.headLength || 0.28;
    const head = new THREE.Mesh(
      new THREE.ConeGeometry(opts.headRadius || 0.11, headLength, 20),
      material(THREE, color)
    );
    shaft.position.y = 0.5;
    head.position.y = 1 + headLength / 2;
    group.add(shaft, head);
    return group;
  }

  function orientArrow(THREE, obj, dir) {
    const v = dir.clone ? dir.clone() : new THREE.Vector3(dir.x || 0, dir.y || 0, dir.z || 0);
    if (v.lengthSq() < 1e-8) v.set(0, 1, 0);
    v.normalize();
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
  }
  function updateArrow(THREE, obj, vector, opts) {
    opts = opts || {};
    if (!obj || !obj.position || !obj.scale || !obj.quaternion) throw new TypeError('Sim3 arrow object is required');
    const x = vector && vector.x, y = vector && vector.y, z = vector && vector.z;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      throw new TypeError('Sim3 arrow vector components must be finite');
    }
    const factor = opts.factor == null ? 1 : opts.factor;
    const minLength = opts.minLength == null ? 0 : opts.minLength;
    const maxLength = opts.maxLength == null ? Infinity : opts.maxLength;
    if (!Number.isFinite(factor) || !Number.isFinite(minLength) ||
        !(Number.isFinite(maxLength) || maxLength === Infinity) ||
        factor < 0 || minLength < 0 || maxLength < minLength) {
      throw new RangeError('Sim3 arrow display lengths must satisfy 0 <= minLength <= maxLength and factor >= 0');
    }
    if (opts.base) {
      const base = opts.base;
      if (!Number.isFinite(base.x) || !Number.isFinite(base.y) || !Number.isFinite(base.z)) {
        throw new TypeError('Sim3 arrow base components must be finite');
      }
      obj.position.set(base.x, base.y, base.z);
    }
    obj.userData = obj.userData || {};
    const state = obj.userData.sim3ArrowState || (obj.userData.sim3ArrowState = {});
    const magnitude = Math.hypot(x, y, z);
    if (!Number.isFinite(magnitude)) throw new RangeError('Sim3 arrow magnitude must remain finite');
    state.magnitude = magnitude;
    obj.userData.sim3PhysicalMagnitude = magnitude;
    if (magnitude === 0) {
      obj.visible = false;
      obj.scale.y = 0;
      obj.userData.sim3DisplayLength = 0;
      state.displayLength = 0;
      state.visible = false;
      return state;
    }
    const direction = obj.userData.sim3DirectionVector ||
      (obj.userData.sim3DirectionVector = new THREE.Vector3());
    const up = obj.userData.sim3ArrowUp ||
      (obj.userData.sim3ArrowUp = new THREE.Vector3(0, 1, 0));
    direction.set(x / magnitude, y / magnitude, z / magnitude);
    obj.quaternion.setFromUnitVectors(up, direction);
    const displayLength = Math.max(minLength, Math.min(maxLength, magnitude * factor));
    obj.visible = true;
    obj.scale.y = displayLength;
    obj.userData.sim3DisplayLength = displayLength;
    state.displayLength = displayLength;
    state.visible = true;
    return state;
  }


  function cylinderBetween(THREE, a, b, radius, color) {
    const from = new THREE.Vector3(a.x, a.y, a.z);
    const to = new THREE.Vector3(b.x, b.y, b.z);
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const len = Math.max(0.001, from.distanceTo(to));
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius || 0.035, radius || 0.035, len, 16),
      material(THREE, color)
    );
    mesh.position.copy(mid);
    orientArrow(THREE, mesh, to.sub(from));
    mesh.userData.sim3BaseLength = len;
    return mesh;
  }

  function setCylinderBetween(THREE, mesh, a, b) {
    const from = new THREE.Vector3(a.x, a.y, a.z);
    const to = new THREE.Vector3(b.x, b.y, b.z);
    const len = Math.max(0.001, from.distanceTo(to));
    mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
    mesh.scale.y = len / (mesh.userData.sim3BaseLength || 1);
    orientArrow(THREE, mesh, to.sub(from));
  }

  return { material, arrow, orientArrow, updateArrow, cylinderBetween, setCylinderBetween };
});
