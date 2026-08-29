(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives, C = root.Sim3Coordinates, plane = C.PLANES.VERTICAL;
    let THREERef, sceneRef, platform, bead, omegaArrow, vArrow, aArrow, radiusGuide, rim, vectorPlane, tick = 0;
    const serial = value => ({ x: value.x, y: value.y, z: value.z });
    const point = value => C.point2D(value, { plane, depth: 0 });
    const vector = value => C.vector2D(value, { plane });
    const shell = root.Sim3Shell.create({
      host: opts.host, referenceEl: opts.referenceEl, label: 'Coriolis 3D', onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE; sceneRef = scene;
        if (root.Sim3VisualKit) root.Sim3VisualKit.setCamera(camera, { x: 3.85, y: 3.0, z: 5.35 }, { x: 0.22, y: 0.08, z: 0.12 });
        platform = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.08, 64), P.material(THREE, 0xe2e8f0, { roughness: 0.85 }));
        platform.position.y = -0.08;
        rim = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.028, 8, 72), P.material(THREE, 0x94a3b8)); rim.rotation.x = Math.PI / 2; platform.add(rim); scene.add(platform);
        bead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), P.material(THREE, 0xd81b60));
        radiusGuide = P.cylinderBetween(THREE, { x: 0, y: 0.04, z: 0 }, { x: 1, y: 0.04, z: 0 }, 0.022, 0x64748b);
        omegaArrow = P.arrow(THREE, 0x7c3aed, { radius: 0.045, headRadius: 0.14 });
        vArrow = P.arrow(THREE, 0x159c3a, { radius: 0.04, headRadius: 0.13 });
        aArrow = P.arrow(THREE, 0xd97706, { radius: 0.04, headRadius: 0.13 });
        vectorPlane = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.86, 48, 1, 0, Math.PI * 0.54), root.Sim3VisualKit ? root.Sim3VisualKit.ghostMaterial(THREE, 'coriolis', 0.28) : P.material(THREE, 0xf97316, { transparent: true, opacity: 0.28 }));
        vectorPlane.rotation.x = -Math.PI / 2;
        scene.add(bead, radiusGuide, omegaArrow, vArrow, aArrow, vectorPlane);
        const grid = new THREE.GridHelper(6, 12, 0xcbd5e1, 0xe2e8f0); grid.position.y = -0.14; scene.add(grid);
        labels.add('omega', 'ω', () => omegaArrow.position); labels.add('v-rel', 'v_rel', () => vArrow.position, { dx: 68, dy: 28 }); labels.add('a-cor', 'a_cor', () => aArrow.position, { dx: -70, dy: -34 }); labels.add('bead', 'M', () => bead.position, { dx: -34, dy: 34 });
      }
    });
    if (!shell) return null;

    function setState(state) {
      tick += 1;
      const sourcePoint = { x: state.point.x * 0.55, y: state.point.y * 0.55 };
      const p = point(sourcePoint), omega = Number(state.omega) || 0;
      const vRel = vector(state.vRelVec);
      const axis = C.axisVector(omega, plane);
      const cross = C.cross(axis, vRel);
      const aCor = { x: 2 * cross.x, y: 2 * cross.y, z: 2 * cross.z };
      bead.position.set(p.x, p.y, p.z);
      platform.rotation.z = state.phi || 0;
      P.setCylinderBetween(THREERef, radiusGuide, point({ x: 0, y: 0 }), p);
      P.updateArrow(THREERef, omegaArrow, axis, { base: point({ x: -2.8, y: -0.4 }), factor: 0.55, minLength: 0.08, maxLength: 1.8 });
      const vBase = { x: p.x + 0.12, y: p.y + 0.02, z: p.z + 0.08 };
      const aBase = { x: p.x - 0.16, y: p.y + 0.05, z: p.z - 0.12 };
      P.updateArrow(THREERef, vArrow, vRel, { base: vBase, factor: 0.6, minLength: 0.08, maxLength: 1.8 });
      P.updateArrow(THREERef, aArrow, aCor, { base: aBase, factor: 0.13, minLength: 0.08, maxLength: 1.8 });
      vectorPlane.position.set(p.x, p.y - 0.065, p.z); vectorPlane.rotation.z = state.phi || 0;
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-4-4'] = Object.assign({
        updatedAt: tick, trailLength: 0, cueLabels: ['omega', 'v_rel', 'a_cor'],
        physics: { objectCount: sceneRef.children.length, point: serial(bead.position), omegaAxis: axis, vRel: { vector: vRel, base: serial(vArrow.position), magnitude: vArrow.userData.sim3PhysicalMagnitude }, aCor: { vector: aCor, base: serial(aArrow.position), magnitude: aArrow.userData.sim3PhysicalMagnitude, dotWithVRel: C.dot(aCor, vRel) } },
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({ vectorSeparation: Math.hypot(vBase.x - aBase.x, vBase.y - aBase.y, vBase.z - aBase.z), hasRotatingFrameCue: true, perpendicularCue: true, centralCluster: 'centered', planeCueOpacity: 0.28, planeCueOuterRadius: 0.86, planeCueRole: 'subtle-contained-sector', noTrailDots: true, trailDotCountMax: 0, perpendicularCueStrength: 'subtle-contained-sector' })
      }, state);
    }
    function reset() { tick = 0; }
    return { host: opts.host, setState, reset, resize: shell.resize, dispose: shell.dispose };
  }
  root.Sim3Ch244 = { create };
})(typeof window !== 'undefined' ? window : this);
