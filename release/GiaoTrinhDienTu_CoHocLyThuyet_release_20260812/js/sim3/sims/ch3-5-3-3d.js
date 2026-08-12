(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, pivot, mass1, mass2, arm1, arm2, lArrow, orbit, hub, tick = 0;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Mô men động lượng 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        if (root.Sim3VisualKit) root.Sim3VisualKit.setCamera(camera, { x: 4.15, y: 3.1, z: 5.95 }, { x: -0.05, y: 0.15, z: 0 });
        pivot = new THREE.Group();
        mass1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), P.material(THREE, 0xd81b60));
        mass2 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), P.material(THREE, 0xd81b60));
        arm1 = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.035, 0x7c3aed);
        arm2 = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, 0.035, 0x7c3aed);
        hub = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 12), P.material(THREE, 0x334155));
        orbit = new THREE.Mesh(
          new THREE.TorusGeometry(1, 0.024, 8, 96),
          P.material(THREE, 0xc4b5fd, { roughness: 0.62, transparent: true, opacity: 0.68 })
        );
        orbit.rotation.x = Math.PI / 2;
        pivot.add(mass1, mass2, arm1, arm2, hub, orbit);
        scene.add(pivot);
        const axis = P.cylinderBetween(THREE, { x: 0, y: -1.4, z: 0 }, { x: 0, y: 1.6, z: 0 }, 0.018, 0x64748b);
        axis.material.transparent = true;
        axis.material.opacity = 0.46;
        lArrow = P.arrow(THREE, 0x7c3aed, { radius: 0.045, headRadius: 0.14 });
        lArrow.position.set(-2.2, -0.6, 0);
        scene.add(axis, lArrow);
        const grid = new THREE.GridHelper(6, 10, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -0.35;
        scene.add(grid);
        labels.add('mass-1', 'm₁', () => mass1.position, { dx: 22, dy: -12 });
        labels.add('mass-2', 'm₂', () => mass2.position, { dx: -46, dy: -28 });
        labels.add('angular-momentum', 'L', () => lArrow.position, { dx: -34, dy: -20 });
        labels.add('radius', 'r', () => arm1.position, { dx: 24, dy: 34 });
      }
    });
    if (!shell) return null;

    function setState(state) {
      tick += 1;
      const r = state.r * 0.62;
      const p1 = { x: r * Math.cos(state.phi), y: 0, z: r * Math.sin(state.phi) };
      const p2 = { x: -p1.x, y: 0, z: -p1.z };
      orbit.scale.set(r, r, r);
      mass1.position.set(p1.x, p1.y, p1.z);
      mass2.position.set(p2.x, p2.y, p2.z);
      mass1.scale.setScalar(Math.max(0.8, Math.min(1.45, 3.2 / Math.max(1, state.r || 3))));
      mass2.scale.copy(mass1.scale);
      P.setCylinderBetween(THREERef, arm1, { x: 0, y: 0, z: 0 }, p1);
      P.setCylinderBetween(THREERef, arm2, { x: 0, y: 0, z: 0 }, p2);
      lArrow.scale.y = Math.max(0.7, Math.min(1.8, Math.abs(state.angularMomentum || 0) * 0.06));
      P.orientArrow(THREERef, lArrow, new THREERef.Vector3(0, 1, 0));
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch3-5-3'] = Object.assign({
        updatedAt: tick,
        mass1: p1,
        mass2: p2,
        cueLabels: ['m1', 'm2', 'L', 'r'],
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({
          radiusCue: 'dimension',
          orbitRole: 'secondary',
          orbitOpacity: 0.68,
          lLabelAttachmentPx: 24,
          axisRole: 'subdued'
        })
      }, state);
    }

    return { host: opts.host, setState, dispose: shell.dispose };
  }

  root.Sim3Ch353 = { create };
})(typeof window !== 'undefined' ? window : this);
