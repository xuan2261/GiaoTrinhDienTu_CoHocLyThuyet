(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, platform, bead, omegaArrow, vArrow, aArrow, radiusGuide, rim, tick = 0;
    const trail = [];
    const trailDots = [];
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Coriolis 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera }) {
        THREERef = THREE;
        camera.position.set(4.6, 3.4, 6.4);
        camera.lookAt(0, 0.05, 0);
        platform = new THREE.Mesh(
          new THREE.CylinderGeometry(2.4, 2.4, 0.08, 64),
          P.material(THREE, 0xe2e8f0, { roughness: 0.85 })
        );
        platform.position.y = -0.08;
        rim = new THREE.Mesh(
          new THREE.TorusGeometry(2.4, 0.028, 8, 72),
          P.material(THREE, 0x94a3b8, { roughness: 0.5 })
        );
        rim.rotation.x = Math.PI / 2;
        platform.add(rim);
        scene.add(platform);
        bead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), P.material(THREE, 0xd81b60));
        scene.add(bead);
        radiusGuide = P.cylinderBetween(THREE, { x: 0, y: 0.04, z: 0 }, { x: 1, y: 0.04, z: 0 }, 0.022, 0x64748b);
        omegaArrow = P.arrow(THREE, 0x7c3aed, { radius: 0.045, headRadius: 0.14 });
        vArrow = P.arrow(THREE, 0x159c3a, { radius: 0.04, headRadius: 0.13 });
        aArrow = P.arrow(THREE, 0xd97706, { radius: 0.04, headRadius: 0.13 });
        omegaArrow.position.set(-2.8, -0.4, 0);
        for (let i = 0; i < 28; i++) {
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 10, 8),
            P.material(THREE, 0xd81b60, { roughness: 0.4 })
          );
          dot.visible = false;
          trailDots.push(dot);
        }
        scene.add(radiusGuide, omegaArrow, vArrow, aArrow, ...trailDots);
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
    function updateTrailDots() {
      const start = Math.max(0, trail.length - trailDots.length);
      for (let i = 0; i < trailDots.length; i++) {
        const item = trail[start + i];
        trailDots[i].visible = !!item;
        if (item) {
          const s = 0.45 + i / trailDots.length * 0.75;
          trailDots[i].scale.setScalar(s);
          trailDots[i].position.set(item.x, 0.12, item.z);
        }
      }
    }
    function setState(state) {
      tick += 1;
      const p = new THREERef.Vector3(state.point.x * 0.55, 0.1, state.point.y * 0.55);
      bead.position.copy(p);
      platform.rotation.y = state.phi || 0;
      P.setCylinderBetween(THREERef, radiusGuide, { x: 0, y: 0.04, z: 0 }, { x: p.x, y: 0.04, z: p.z });
      setArrow(omegaArrow, new THREERef.Vector3(-2.8, -0.4, 0), new THREERef.Vector3(0, state.omega || 0, 0), 0.55);
      setArrow(vArrow, p, new THREERef.Vector3(state.vRelVec.x, 0, state.vRelVec.y), 0.7);
      setArrow(aArrow, p, new THREERef.Vector3(state.aCor.x, 0, state.aCor.y), 0.12);
      trail.push({ x: p.x, z: p.z });
      if (trail.length > 80) trail.shift();
      updateTrailDots();
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-4-4'] = Object.assign({ updatedAt: tick, trailLength: trail.length }, state);
    }
    function reset() {
      trail.length = 0;
      trailDots.forEach(dot => { dot.visible = false; });
    }

    return { host: opts.host, setState, reset, dispose: shell.dispose };
  }

  root.Sim3Ch244 = { create };
})(typeof window !== 'undefined' ? window : this);
