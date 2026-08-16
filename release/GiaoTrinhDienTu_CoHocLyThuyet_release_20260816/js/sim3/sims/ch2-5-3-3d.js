(function(root) {
  'use strict';

  function to3(v) {
    return { x: v.x * 0.55, y: 0.08, z: v.y * 0.55 };
  }

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, plate, icPost, icMarker, sampleMarker, radiusGuide, velocityArrow, omegaArrow, tick = 0;
    const fieldArrows = [];
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Phan bo van toc 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        if (root.Sim3VisualKit) root.Sim3VisualKit.setCamera(camera, { x: 4.45, y: 3.55, z: 6.2 }, { x: 0.28, y: 0.1, z: 0.06 });

        plate = new THREE.Mesh(
          new THREE.CylinderGeometry(2.7, 2.7, 0.1, 72),
          P.material(THREE, 0xe2e8f0, { roughness: 0.82, metalness: 0.04 })
        );
        plate.position.y = -0.05;
        scene.add(plate);

        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(2.71, 0.025, 8, 72),
          P.material(THREE, 0x94a3b8, { roughness: 0.48 })
        );
        rim.rotation.x = Math.PI / 2;
        scene.add(rim);

        const grid = new THREE.GridHelper(6.2, 12, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -0.12;
        scene.add(grid);

        icPost = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, 0.035, 0xd81b60);
        icMarker = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), P.material(THREE, 0xd81b60));
        sampleMarker = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), P.material(THREE, 0x1565c0));
        radiusGuide = P.cylinderBetween(THREE, { x: 0, y: 0.08, z: 0 }, { x: 1, y: 0.08, z: 0 }, 0.026, 0x6d28d9);
        velocityArrow = P.arrow(THREE, 0x159c3a, { radius: 0.045, headRadius: 0.14, headLength: 0.34 });
        omegaArrow = P.arrow(THREE, 0x7c3aed, { radius: 0.04, headRadius: 0.13 });
        omegaArrow.position.set(-2.9, 0.05, -2.7);
        for (let i = 0; i < 7; i++) {
          fieldArrows.push(P.arrow(THREE, 0x94a3b8, { radius: 0.026, headRadius: 0.085, headLength: 0.22 }));
        }
        fieldArrows.forEach(arrow => {
          arrow.traverse(child => {
            if (child.material) {
              child.material.transparent = true;
              child.material.opacity = 0.62;
            }
          });
        });
        scene.add(icPost, icMarker, sampleMarker, radiusGuide, velocityArrow, omegaArrow, ...fieldArrows);
        labels.add('instant-center', 'P (IC)', () => icMarker.position, { dx: -34, dy: -32 });
        labels.add('sample-m', 'M', () => sampleMarker.position, { dx: 34, dy: 34 });
        labels.add('velocity-m', 'v_M', () => velocityArrow.position, { dx: 74, dy: -42 });
        labels.add('omega', 'ω', () => omegaArrow.position, { dx: -34, dy: -32 });
      }
    });
    if (!shell) return null;

    function setArrow(obj, base, vec, scale) {
      obj.position.set(base.x, base.y, base.z);
      obj.scale.y = Math.max(0.25, Math.min(2.2, vec.length() * scale));
      P.orientArrow(THREERef, obj, vec);
    }

    function setState(state) {
      tick += 1;
      const ic = to3(state.ic);
      const sample = to3(state.sample);
      icMarker.position.set(ic.x, 0.16, ic.z);
      sampleMarker.position.set(sample.x, 0.2, sample.z);
      P.setCylinderBetween(THREERef, icPost, { x: ic.x, y: 0.02, z: ic.z }, { x: ic.x, y: 0.82, z: ic.z });
      P.setCylinderBetween(THREERef, radiusGuide, ic, sample);
      const v = new THREERef.Vector3(state.vM.vx, 0, state.vM.vy);
      setArrow(velocityArrow, new THREERef.Vector3(sample.x, 0.32, sample.z), v, 0.24);
      setArrow(omegaArrow, new THREERef.Vector3(-2.9, 0.05, -2.7), new THREERef.Vector3(0, state.omega || 0, 0), 0.55);
      const samples = [
        { x: sample.x * 0.65, z: sample.z * 0.65 },
        { x: sample.x * 0.4 - 0.9, z: sample.z * 0.35 },
        { x: sample.x * 0.35, z: sample.z * 0.45 + 0.9 },
        { x: sample.x * 0.55 + 0.6, z: sample.z * 0.25 - 0.7 },
        { x: ic.x * 0.45 + sample.x * 0.2 + 0.55, z: ic.z * 0.45 + sample.z * 0.2 + 0.55 },
        { x: ic.x * 0.35 + sample.x * 0.25 - 0.65, z: ic.z * 0.35 + sample.z * 0.25 + 0.15 },
        { x: ic.x * 0.25 + sample.x * 0.35 + 0.15, z: ic.z * 0.25 + sample.z * 0.35 - 0.85 }
      ];
      fieldArrows.forEach((arrow, i) => {
        const p = samples[i];
        const dx = p.x - ic.x;
        const dz = p.z - ic.z;
        const vec = new THREERef.Vector3(-(state.omega || 0) * dz, 0, (state.omega || 0) * dx);
        setArrow(arrow, new THREERef.Vector3(p.x, 0.2, p.z), vec, 0.14);
      });
      plate.rotation.y = 0;
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-5-3'] = Object.assign({
        updatedAt: tick,
        fieldArrowCount: fieldArrows.length,
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({
          velocityScaleFactor: 0.24,
          constructionArrowScaleFactor: 0.14,
          constructionOpacity: 0.62,
          fieldDistributionCue: 'dense-scaled-tangential',
          radiusGuide: 'P-to-M',
          velocityLeftMarginTargetPx: 20,
          radiusGuideContrast: 'enhanced'
        })
      }, state);
    }

    shell.stop();
    return { host: opts.host, setState, dispose: shell.dispose };
  }

  root.Sim3Ch253 = { create };
})(typeof window !== 'undefined' ? window : this);
