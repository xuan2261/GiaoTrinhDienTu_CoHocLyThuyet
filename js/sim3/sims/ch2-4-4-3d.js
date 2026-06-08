(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, platform, bead, omegaArrow, vArrow, aArrow, radiusGuide, rim, vectorPlane, tick = 0;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Coriolis 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        if (root.Sim3VisualKit) root.Sim3VisualKit.setCamera(camera, { x: 3.85, y: 3.0, z: 5.35 }, { x: 0.22, y: 0.08, z: 0.12 });
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
        vectorPlane = new THREE.Mesh(
          new THREE.RingGeometry(0.25, 1.15, 48, 1, 0, Math.PI * 0.62),
          (root.Sim3VisualKit ? root.Sim3VisualKit.ghostMaterial(THREE, 'coriolis', 0.44) : P.material(THREE, 0xf97316, { transparent: true, opacity: 0.44 }))
        );
        vectorPlane.rotation.x = -Math.PI / 2;
        scene.add(radiusGuide, omegaArrow, vArrow, aArrow, vectorPlane);
        const grid = new THREE.GridHelper(6, 12, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -0.14;
        scene.add(grid);
        labels.add('omega', 'ω', () => omegaArrow.position);
        labels.add('v-rel', 'v_rel', () => vArrow.position, { dx: 68, dy: 28 });
        labels.add('a-cor', 'a_cor', () => aArrow.position, { dx: -70, dy: -34 });
        labels.add('bead', 'M', () => bead.position, { dx: -34, dy: 34 });
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
      P.setCylinderBetween(THREERef, radiusGuide, { x: 0, y: 0.04, z: 0 }, { x: p.x, y: 0.04, z: p.z });
      setArrow(omegaArrow, new THREERef.Vector3(-2.8, -0.4, 0), new THREERef.Vector3(0, state.omega || 0, 0), 0.55);
      const vVec = new THREERef.Vector3(state.vRelVec.x, 0, state.vRelVec.y);
      const aVec = new THREERef.Vector3(state.aCor.x, 0, state.aCor.y);
      const vBase = p.clone().add(new THREERef.Vector3(0.12, 0.02, 0.08));
      const aBase = p.clone().add(new THREERef.Vector3(-0.16, 0.05, -0.12));
      setArrow(vArrow, vBase, vVec, 0.6);
      setArrow(aArrow, aBase, aVec, 0.13);
      vectorPlane.position.set(p.x, 0.035, p.z);
      vectorPlane.rotation.y = state.phi || 0;
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-4-4'] = Object.assign({
        updatedAt: tick,
        trailLength: 0,
        cueLabels: ['omega', 'v_rel', 'a_cor'],
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({
          vectorSeparation: vBase.distanceTo(aBase),
          hasRotatingFrameCue: true,
          perpendicularCue: true,
          centralCluster: 'centered',
          planeCueOpacity: 0.44,
          noTrailDots: true,
          trailDotCountMax: 0,
          perpendicularCueStrength: 'high-contrast-sector'
        })
      }, state);
    }
    function reset() {
      tick = 0;
    }

    return { host: opts.host, setState, reset, dispose: shell.dispose };
  }

  root.Sim3Ch244 = { create };
})(typeof window !== 'undefined' ? window : this);
