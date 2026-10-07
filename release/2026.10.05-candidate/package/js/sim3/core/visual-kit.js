(function(root) {
  'use strict';

  const colors = {
    moment: 0x7c3aed,
    v: 0x159c3a,
    a: 0xd97706,
    coriolis: 0xf97316,
    force: 0xd81b60,
    mass1: 0xd81b60,
    mass2: 0x1565c0,
    axis: 0x64748b,
    ghost: 0x94a3b8,
    guide: 0xc4b5fd,
    surface: 0xe2e8f0
  };

  const materials = {
    primarySurface: { roughness: 0.46, metalness: 0.06 },
    secondarySurface: { roughness: 0.72, metalness: 0.02, transparent: true, opacity: 0.58 },
    support: { roughness: 0.82, metalness: 0, transparent: true, opacity: 0.48 },
    construction: { roughness: 0.76, metalness: 0, transparent: true, opacity: 0.42 },
    dimension: { roughness: 0.55, metalness: 0, transparent: true, opacity: 0.72 },
    ghost: { roughness: 0.7, metalness: 0, transparent: true, opacity: 0.28 }
  };

  const labelOffsets = {
    point: { dx: 0, dy: -10 },
    vector: { dx: 28, dy: -14 },
    guide: { dx: -26, dy: 18 },
    axis: { dx: 0, dy: -18 },
    dimension: { dx: 0, dy: 18 },
    phase: { dx: 0, dy: -18 }
  };

  function material(THREE, key, opts) {
    opts = opts || {};
    const color = typeof key === 'number' ? key : (colors[key] || colors.surface);
    return new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness == null ? 0.52 : opts.roughness,
      metalness: opts.metalness || 0,
      transparent: !!opts.transparent,
      opacity: opts.opacity == null ? 1 : opts.opacity,
      emissive: opts.emissive || 0x000000
    });
  }

  function roleMaterial(THREE, colorKey, role, opts) {
    return material(THREE, colorKey, Object.assign({}, materials[role] || {}, opts || {}));
  }

  function vectorScale(value, opts) {
    opts = opts || {};
    const min = opts.min == null ? 0.2 : opts.min;
    const max = opts.max == null ? 1.8 : opts.max;
    const factor = opts.factor == null ? 1 : opts.factor;
    return Math.max(min, Math.min(max, Math.abs(value || 0) * factor));
  }

  function labelOffset(kind, extra) {
    const base = labelOffsets[kind] || { dx: 0, dy: 0 };
    extra = extra || {};
    return { dx: base.dx + (extra.dx || 0), dy: base.dy + (extra.dy || 0), kind };
  }

  function visualMetrics(metrics) {
    return Object.assign({ labelOverlapTarget: 0, minSafeMarginPx: 24 }, metrics || {});
  }

  function ghostMaterial(THREE, key, opacity) {
    return material(THREE, key || 'ghost', {
      transparent: true,
      opacity: opacity == null ? 0.32 : opacity,
      roughness: 0.7,
      emissive: 0x111827
    });
  }

  function guideLine(THREE, a, b, key, radius) {
    return root.Sim3Primitives.cylinderBetween(
      THREE,
      a,
      b,
      radius || 0.018,
      colors[key] || colors.guide
    );
  }

  function shadowPlane(THREE, size) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size || 8, size || 8),
      material(THREE, 'surface', { roughness: 0.9 })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return mesh;
  }

  function applyShadows(obj) {
    obj.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return obj;
  }

  function setCamera(camera, position, target) {
    camera.position.set(position.x, position.y, position.z);
    camera.lookAt(target.x || 0, target.y || 0, target.z || 0);
    camera.updateProjectionMatrix();
  }

  // Fit actual object bounds without changing physical geometry. Preserve the
  // viewing direction and reserve a symmetric NDC margin on both viewport axes.
  function fitCameraToObjects(THREE, camera, objects, padding) {
    const margin = padding == null ? 0.1 : padding;
    const bounds = new THREE.Box3();
    objects.filter(object => object.visible).forEach(object => {
      object.updateWorldMatrix(true, true);
      bounds.expandByObject(object);
    });
    if (bounds.isEmpty()) return;
    const center = bounds.getCenter(new THREE.Vector3());
    const inverse = camera.quaternion.clone().invert();
    const tanY = Math.tan(camera.fov * Math.PI / 360) * (1 - margin);
    const tanX = tanY * camera.aspect;
    let distance = 0, depth = 0;
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          const local = new THREE.Vector3(x, y, z).sub(center).applyQuaternion(inverse);
          distance = Math.max(distance, local.z + Math.abs(local.x) / tanX, local.z + Math.abs(local.y) / tanY, local.z + camera.near * 2);
          depth = Math.max(depth, Math.abs(local.z));
        }
    camera.position.copy(center).add(new THREE.Vector3(0, 0, distance).applyQuaternion(camera.quaternion));
    camera.far = Math.max(100, distance + depth + 1);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  }

  root.Sim3VisualKit = {
    colors,
    materials,
    material,
    roleMaterial,
    ghostMaterial,
    guideLine,
    shadowPlane,
    applyShadows,
    setCamera,
    fitCameraToObjects,
    vectorScale,
    labelOffset,
    visualMetrics
  };
})(typeof window !== 'undefined' ? window : this);
