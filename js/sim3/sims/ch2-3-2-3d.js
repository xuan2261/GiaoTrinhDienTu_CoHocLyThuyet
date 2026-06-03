(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, gear1, gear2, pulley1, pulley2, gearM1, gearM2, pulleyM1, pulleyM2;
    let beltTop, beltBottom, tick = 0;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Truyền động bánh răng và đai 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene }) {
        THREERef = THREE;
        gear1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.35, 48), P.material(THREE, 0x159c3a));
        gear2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.35, 48), P.material(THREE, 0x1565c0));
        pulley1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.25, 48), P.material(THREE, 0x159c3a));
        pulley2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.25, 48), P.material(THREE, 0x1565c0));
        [gear1, gear2, pulley1, pulley2].forEach(m => { m.rotation.x = Math.PI / 2; scene.add(m); });
        gearM1 = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.045, 0x0f7a2c);
        gearM2 = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.045, 0x0f4f99);
        pulleyM1 = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.045, 0x0f7a2c);
        pulleyM2 = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.045, 0x0f4f99);
        beltTop = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.045, 0x7c3aed);
        beltBottom = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.045, 0x7c3aed);
        scene.add(gearM1, gearM2, pulleyM1, pulleyM2, beltTop, beltBottom);
        const grid = new THREE.GridHelper(8, 10, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -1.25;
        scene.add(grid);
      }
    });
    if (!shell) return null;

    function radial(cx, z, r, phi) {
      return { x: cx + r * Math.cos(phi), y: 0, z: z + r * Math.sin(phi) };
    }
    function setState(state) {
      tick += 1;
      const r1 = state.r1 * 0.62, r2 = state.r2 * 0.62, gx1 = -1.7, gz = 1.05, px1 = -1.7, pz = -1.25;
      const gx2 = gx1 + r1 + r2 + 0.28, px2 = 1.7;
      gear1.position.set(gx1, 0, gz); gear2.position.set(gx2, 0, gz);
      pulley1.position.set(px1, 0, pz); pulley2.position.set(px2, 0, pz);
      gear1.scale.set(r1, r1, 1); gear2.scale.set(r2, r2, 1);
      pulley1.scale.set(r1, r1, 1); pulley2.scale.set(r2, r2, 1);
      P.setCylinderBetween(THREERef, gearM1, { x: gx1, y: 0, z: gz }, radial(gx1, gz, r1, state.gearPhi1));
      P.setCylinderBetween(THREERef, gearM2, { x: gx2, y: 0, z: gz }, radial(gx2, gz, r2, state.gearPhi2));
      P.setCylinderBetween(THREERef, pulleyM1, { x: px1, y: 0, z: pz }, radial(px1, pz, r1, state.gearPhi1));
      P.setCylinderBetween(THREERef, pulleyM2, { x: px2, y: 0, z: pz }, radial(px2, pz, r2, state.beltPhi2));
      P.setCylinderBetween(THREERef, beltTop, { x: px1, y: 0.08, z: pz + r1 }, { x: px2, y: 0.08, z: pz + r2 });
      P.setCylinderBetween(THREERef, beltBottom, { x: px1, y: 0.08, z: pz - r1 }, { x: px2, y: 0.08, z: pz - r2 });
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-3-2'] = Object.assign({ updatedAt: tick }, state);
    }

    return { host: opts.host, setState, dispose: shell.dispose };
  }

  root.Sim3Ch232 = { create };
})(typeof window !== 'undefined' ? window : this);
