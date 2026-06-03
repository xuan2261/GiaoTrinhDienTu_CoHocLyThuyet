(function(root) {
  'use strict';

  function material(THREE, color, opts) {
    opts = opts || {};
    return new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness == null ? 0.55 : opts.roughness,
      metalness: opts.metalness || 0,
      emissive: opts.emissive || 0x000000
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
    return mesh;
  }

  function setCylinderBetween(THREE, mesh, a, b) {
    const from = new THREE.Vector3(a.x, a.y, a.z);
    const to = new THREE.Vector3(b.x, b.y, b.z);
    const len = Math.max(0.001, from.distanceTo(to));
    mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
    mesh.scale.y = len;
    orientArrow(THREE, mesh, to.sub(from));
  }

  root.Sim3Primitives = { material, arrow, orientArrow, cylinderBetween, setCylinderBetween };
})(typeof window !== 'undefined' ? window : this);
