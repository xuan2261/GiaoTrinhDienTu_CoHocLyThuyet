(function(root) {
  'use strict';

  function create(opts) {
    let THREERef, disk, marker, omegaArrow, vArrow, rim, orbit, tickGroup, tick = 0;
    const diskRadius = 1.22, C = root.Sim3Coordinates;
    const shell = root.Sim3Shell.create({
      host: opts.host, referenceEl: opts.referenceEl, label: 'Quay quanh trục cố định 3D', onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE; root.Sim3VisualKit.setCamera(camera, { x: 4.55, y: 3.45, z: 6.95 }, { x: -0.18, y: 0.08, z: 0.03 });
        disk = new THREE.Mesh(new THREE.CylinderGeometry(diskRadius, diskRadius, 0.22, 64), new THREE.MeshStandardMaterial({ color: 0x6d28d9, roughness: 0.46, metalness: 0.08 }));
        rim = new THREE.Mesh(new THREE.TorusGeometry(diskRadius + 0.02, 0.03, 10, 72), new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.4 }));
        orbit = new THREE.Mesh(new THREE.TorusGeometry(diskRadius, 0.012, 8, 72), new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.45, emissive: 0x220014 }));
        rim.rotation.x = orbit.rotation.x = Math.PI / 2; tickGroup = new THREE.Group();
        for (let i = 0; i < 16; i += 1) {
          const source = C.point2D({ x: 0.98 * Math.cos(i * Math.PI / 8), y: 0.98 * Math.sin(i * Math.PI / 8) }, { plane: C.PLANES.HORIZONTAL, elevation: 0.14 });
          const mark = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.018, 0.035), new THREE.MeshStandardMaterial({ color: i % 4 === 0 ? 0xffffff : 0xc4b5fd }));
          mark.position.set(source.x, source.y, source.z); mark.rotation.y = i * Math.PI / 8; tickGroup.add(mark);
        }
        disk.add(rim, orbit, tickGroup); scene.add(disk);
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -2.4, 0), new THREE.Vector3(0, 2.4, 0)]), new THREE.LineBasicMaterial({ color: 0x475569 })));
        marker = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd81b60 })); scene.add(marker);
        omegaArrow = root.Sim3Primitives.arrow(THREE, 0x7c3aed); omegaArrow.position.set(-2.3, -0.8, 0);
        vArrow = root.Sim3Primitives.arrow(THREE, 0x159c3a, { radius: 0.055, headRadius: 0.16, headLength: 0.36 }); scene.add(omegaArrow, vArrow);
        const grid = new THREE.GridHelper(5, 10, 0xcbd5e1, 0xe2e8f0); grid.position.y = -1.45; scene.add(grid);
        labels.add('point-m', 'M', () => marker.position, root.Sim3VisualKit.labelOffset('point', { dx: 18, dy: -8 }));
        labels.add('omega', 'ω', () => omegaArrow.position); labels.add('velocity', 'v', () => vArrow.position, root.Sim3VisualKit.labelOffset('vector', { dx: 26, dy: -10 }));
      }
    });
    if (!shell) return null;
    function serial(v) { return { x: v.x, y: v.y, z: v.z }; }
    function setState(state) {
      tick += 1;
      const phi = Number.isFinite(state.phi) ? state.phi : 0, omega = Number.isFinite(state.omega) ? state.omega : 0;
      const sourceRadius = Number.isFinite(state.radius) ? state.radius : diskRadius;
      const physicalRadius = C.point2D({ x: sourceRadius * Math.cos(phi), y: sourceRadius * Math.sin(phi) }, { plane: C.PLANES.HORIZONTAL, elevation: 0 });
      const markerPosition = C.point2D({ x: diskRadius * Math.cos(phi), y: diskRadius * Math.sin(phi) }, { plane: C.PLANES.HORIZONTAL, elevation: 0.16 });
      const omegaVector = C.axisVector(omega, C.PLANES.HORIZONTAL), velocity = C.cross(omegaVector, physicalRadius);
      disk.rotation.y = phi; marker.position.set(markerPosition.x, markerPosition.y, markerPosition.z);
      root.Sim3Primitives.updateArrow(THREERef, omegaArrow, omegaVector, { base: { x: -2.3, y: -0.8, z: 0 }, factor: 0.6, minLength: 0, maxLength: 1.6 });
      root.Sim3Primitives.updateArrow(THREERef, vArrow, velocity, { base: { x: markerPosition.x, y: 0.42, z: markerPosition.z }, factor: 0.46, minLength: 0, maxLength: 1.05 });
      shell.setState(state); root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-2-2'] = Object.assign({}, state, {
        updatedAt: tick,
        physics: { plane: C.PLANES.HORIZONTAL, axis: serial(C.axisVector(1, C.PLANES.HORIZONTAL)), radius: serial(physicalRadius), marker: serial(marker.position), omega: serial(omegaVector), velocity: serial(velocity), transforms: { diskRotationY: disk.rotation.y, marker: serial(marker.position), orbitPlaneNormal: { x: 0, y: 1, z: 0 }, tickCount: tickGroup.children.length, omegaMagnitude: omegaArrow.userData.sim3PhysicalMagnitude, velocityMagnitude: vArrow.userData.sim3PhysicalMagnitude } },
        visualMetrics: root.Sim3VisualKit.visualMetrics({ diskRadius, diskScaleRole: 'reduced', tangentMarginTargetPx: 32, vectorScaleMax: 1.05, labelSeparationTargetPx: 12, axisRole: 'visible-secondary' })
      });
    }
    return { host: opts.host, setState, resize: shell.resize, dispose: shell.dispose };
  }
  root.Sim3Ch222 = { create };
})(typeof window !== 'undefined' ? window : this);
