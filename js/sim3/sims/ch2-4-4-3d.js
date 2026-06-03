(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, platform, bead, omegaArrow, vArrow, aArrow, tick = 0;
    const trail = [];
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Coriolis 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene }) {
        THREERef = THREE;
        platform = new THREE.Mesh(
          new THREE.CylinderGeometry(2.4, 2.4, 0.08, 64),
          P.material(THREE, 0xe2e8f0, { roughness: 0.85 })
        );
        platform.position.y = -0.08;
        scene.add(platform);
        bead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), P.material(THREE, 0xd81b60));
        scene.add(bead);
        omegaArrow = P.arrow(THREE, 0x7c3aed, { radius: 0.045, headRadius: 0.14 });
        vArrow = P.arrow(THREE, 0x159c3a, { radius: 0.04, headRadius: 0.13 });
        aArrow = P.arrow(THREE, 0xd97706, { radius: 0.04, headRadius: 0.13 });
        omegaArrow.position.set(-2.8, -0.4, 0);
        scene.add(omegaArrow, vArrow, aArrow);
        const grid = new THREE.GridHelper(6, 12, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -0.14;
        scene.add(grid);
      }
    });
    if (!shell) return null;

    function setArrow(obj, base, vec, scale) {
      obj.position.set(base.x, base.y, base.z);
      obj.scale.y = Math.max(0.2, Math.min(1.8, vec.length() * scale));
      P.orientArrow(THREERef, obj, vec);
    }
    function setState(state) {
      tick += 1;
      const p = new THREERef.Vector3(state.point.x * 0.55, 0.1, state.point.y * 0.55);
      bead.position.copy(p);
      platform.rotation.y = state.phi || 0;
      setArrow(omegaArrow, new THREERef.Vector3(-2.8, -0.4, 0), new THREERef.Vector3(0, state.omega || 0, 0), 0.55);
      setArrow(vArrow, p, new THREERef.Vector3(state.vRelVec.x, 0, state.vRelVec.y), 0.7);
      setArrow(aArrow, p, new THREERef.Vector3(state.aCor.x, 0, state.aCor.y), 0.12);
      trail.push({ x: p.x, z: p.z });
      if (trail.length > 80) trail.shift();
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-4-4'] = Object.assign({ updatedAt: tick, trailLength: trail.length }, state);
    }
    function reset() { trail.length = 0; }

    return { host: opts.host, setState, reset, dispose: shell.dispose };
  }

  root.Sim3Ch244 = { create };
})(typeof window !== 'undefined' ? window : this);
