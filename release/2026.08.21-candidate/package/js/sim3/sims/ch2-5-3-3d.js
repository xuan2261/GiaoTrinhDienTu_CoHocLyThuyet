(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives, C = root.Sim3Coordinates, plane = C.PLANES.VERTICAL;
    let THREERef, sceneRef, plate, icPost, icMarker, sampleMarker, radiusGuide, velocityArrow, omegaArrow, tick = 0;
    const fieldArrows = [], serial = value => ({ x: value.x, y: value.y, z: value.z });
    const point = value => C.point2D(value, { plane, depth: 0 });
    const shell = root.Sim3Shell.create({
      host: opts.host, referenceEl: opts.referenceEl, label: 'Phan bo van toc 3D', onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE; sceneRef = scene;
        if (root.Sim3VisualKit) root.Sim3VisualKit.setCamera(camera, { x: 4.45, y: 3.55, z: 6.2 }, { x: 0.28, y: 0.1, z: 0.06 });
        plate = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.1, 72), P.material(THREE, 0xe2e8f0, { roughness: 0.82, metalness: 0.04 })); plate.rotation.x = Math.PI / 2; plate.position.z = -0.05; scene.add(plate);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(2.71, 0.025, 8, 72), P.material(THREE, 0x94a3b8)); scene.add(rim);
        const grid = new THREE.GridHelper(6.2, 12, 0xcbd5e1, 0xe2e8f0); grid.position.z = -0.12; grid.rotation.x = Math.PI / 2; scene.add(grid);
        icPost = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 0.035, 0xd81b60);
        icMarker = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), P.material(THREE, 0xd81b60)); sampleMarker = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), P.material(THREE, 0x1565c0));
        radiusGuide = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.026, 0x6d28d9);
        velocityArrow = P.arrow(THREE, 0x159c3a, { radius: 0.045, headRadius: 0.14, headLength: 0.34 }); omegaArrow = P.arrow(THREE, 0x7c3aed, { radius: 0.04, headRadius: 0.13 });
        for (let i = 0; i < 7; i++) {
          const arrow = P.arrow(THREE, 0x94a3b8, { radius: 0.026, headRadius: 0.085, headLength: 0.22 });
          arrow.traverse(child => { if (child.material) { child.material.transparent = true; child.material.opacity = 0.62; } }); fieldArrows.push(arrow);
        }
        scene.add(icPost, icMarker, sampleMarker, radiusGuide, velocityArrow, omegaArrow, ...fieldArrows);
        labels.add('instant-center', 'P (IC)', () => icMarker.position, { dx: -34, dy: -32 }); labels.add('sample-m', 'M', () => sampleMarker.position, { dx: 34, dy: 34 }); labels.add('velocity-m', 'v_M', () => velocityArrow.position, { dx: 74, dy: -42 }); labels.add('omega', 'ω', () => omegaArrow.position, { dx: -34, dy: -32 });
      }
    });
    if (!shell) return null;

    function velocity(omega, sourcePoint, sourceIC) {
      const r = C.vector2D({ x: sourcePoint.x - sourceIC.x, y: sourcePoint.y - sourceIC.y }, { plane });
      return { r, vector: C.cross(C.axisVector(omega, plane), r) };
    }
    function setState(state) {
      tick += 1;
      const icInput = state.ic, sampleInput = state.sample;
      const icSource = { x: icInput.x * 0.55, y: icInput.y * 0.55 };
      const sampleSource = { x: sampleInput.x * 0.55, y: sampleInput.y * 0.55 };
      const ic = point(icSource), sample = point(sampleSource), omega = Number(state.omega) || 0;
      const sampleVelocity = velocity(omega, sampleInput, icInput);
      icMarker.position.set(ic.x, ic.y, ic.z); sampleMarker.position.set(sample.x, sample.y, sample.z);
      P.setCylinderBetween(THREERef, icPost, ic, { x: ic.x, y: ic.y, z: ic.z + 0.8 }); P.setCylinderBetween(THREERef, radiusGuide, ic, sample);
      P.updateArrow(THREERef, velocityArrow, sampleVelocity.vector, { base: { x: sample.x, y: sample.y, z: sample.z + 0.12 }, factor: 0.24, minLength: 0.08, maxLength: 2.2 });
      P.updateArrow(THREERef, omegaArrow, C.axisVector(omega, plane), { base: point({ x: -2.9, y: -2.7 }), factor: 0.55, minLength: 0.08, maxLength: 2.2 });
      const samples = [icInput, { x: sampleInput.x * 0.65, y: sampleInput.y * 0.65 }, { x: sampleInput.x * 0.4 - 0.9, y: sampleInput.y * 0.35 }, { x: sampleInput.x * 0.35, y: sampleInput.y * 0.45 + 0.9 }, { x: sampleInput.x * 0.55 + 0.6, y: sampleInput.y * 0.25 - 0.7 }, { x: icInput.x * 0.45 + sampleInput.x * 0.2 + 0.55, y: icInput.y * 0.45 + sampleInput.y * 0.2 + 0.55 }, { x: icInput.x * 0.35 + sampleInput.x * 0.25 - 0.65, y: icInput.y * 0.35 + sampleInput.y * 0.25 + 0.15 }];
      const field = samples.map((source, i) => {
        const displaySource = { x: source.x * 0.55, y: source.y * 0.55 };
        const p = point(displaySource), result = velocity(omega, source, icInput), arrow = fieldArrows[i];
        P.updateArrow(THREERef, arrow, result.vector, { base: { x: p.x, y: p.y, z: p.z + 0.08 }, factor: 0.14, minLength: 0, maxLength: 2.2 });
        return { point: serial(p), radius: result.r, vector: result.vector, magnitude: arrow.userData.sim3PhysicalMagnitude };
      });
      plate.rotation.z = 0; shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-5-3'] = Object.assign({
        updatedAt: tick, fieldArrowCount: fieldArrows.length,
        physics: { objectCount: sceneRef.children.length, ic: serial(icMarker.position), sample: serial(sampleMarker.position), omegaAxis: C.axisVector(omega, plane), sampleVelocity: { radius: sampleVelocity.r, vector: sampleVelocity.vector, magnitude: velocityArrow.userData.sim3PhysicalMagnitude }, field },
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({ velocityScaleFactor: 0.24, constructionArrowScaleFactor: 0.14, constructionOpacity: 0.62, fieldDistributionCue: 'dense-scaled-tangential', radiusGuide: 'P-to-M', velocityLeftMarginTargetPx: 20, radiusGuideContrast: 'enhanced' })
      }, state);
    }
    return { host: opts.host, setState, resize: shell.resize, dispose: shell.dispose };
  }
  root.Sim3Ch253 = { create };
})(typeof window !== 'undefined' ? window : this);
