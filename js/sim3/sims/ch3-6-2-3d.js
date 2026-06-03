(function(root) {
  'use strict';

  function create(opts) {
    let b1, b2, cue, tick = 0;
    const trail = [];
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Va chạm 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene }) {
        const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
        const rail = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.06, 0.08), railMat);
        rail.position.y = -0.55;
        scene.add(rail);
        b1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.34, 32, 16),
          new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.35 })
        );
        b2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.44, 32, 16),
          new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.35 })
        );
        cue = new THREE.Mesh(
          new THREE.TorusGeometry(0.45, 0.025, 8, 36),
          new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x3b0764 })
        );
        cue.rotation.x = Math.PI / 2;
        cue.visible = false;
        scene.add(b1, b2, cue);
        const grid = new THREE.GridHelper(8, 12, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -0.62;
        scene.add(grid);
      }
    });
    if (!shell) return null;

    function mapX(x) { return x * 0.45; }
    function setState(state) {
      tick += 1;
      b1.position.set(mapX(state.p1.x), 0, -0.22);
      b2.position.set(mapX(state.p2.x), 0, 0.22);
      b1.scale.setScalar(Math.max(0.85, Math.sqrt(state.m1 || 2) * 0.55));
      b2.scale.setScalar(Math.max(0.85, Math.sqrt(state.m2 || 3) * 0.5));
      cue.visible = !!state.collided;
      cue.position.set(mapX(state.impactPoint ? state.impactPoint.x : 0), 0.02, 0);
      trail.push({ x1: state.p1.x, x2: state.p2.x, collided: !!state.collided });
      if (trail.length > 80) trail.shift();
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch3-6-2'] = Object.assign({ updatedAt: tick, trailLength: trail.length }, state);
    }
    function reset() {
      trail.length = 0;
      if (cue) cue.visible = false;
    }

    return { host: opts.host, setState, reset, dispose: shell.dispose };
  }

  root.Sim3Ch362 = { create };
})(typeof window !== 'undefined' ? window : this);
