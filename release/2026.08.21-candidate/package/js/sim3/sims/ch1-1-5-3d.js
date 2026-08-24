(function(root) {
  'use strict';

  function create(opts) {
    let THREERef, cameraRef, f1Arrow, f2Arrow, rArrow, moArrow, momentRing, p1, p2, forceLabelTarget, grid, tick = 0;
    const scale = 0.78, forceScale = 0.03, resultantScale = 0.024;
    const C = root.Sim3Coordinates;
    const shell = root.Sim3Shell.create({
      host: opts.host, referenceEl: opts.referenceEl, label: 'Thu gọn hệ lực 3D', onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE; cameraRef = camera;
        root.Sim3VisualKit.setCamera(camera, { x: 4.18, y: 3.08, z: 5.45 }, { x: 0.02, y: 0.12, z: 0.02 });
        const base = root.Sim3VisualKit.shadowPlane(THREE, 5.2); base.material.opacity = 0.28; base.material.transparent = true;
        grid = new THREE.GridHelper(3.8, 6, 0xdbe4ee, 0xedf2f7); grid.material.transparent = true; grid.material.opacity = 0.22;
        const origin = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), root.Sim3VisualKit.material(THREE, 0x102a4d));
        p1 = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), root.Sim3VisualKit.material(THREE, 0xd81b60));
        p2 = p1.clone();
        f1Arrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.048, headRadius: 0.15, headLength: 0.36 });
        f2Arrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.048, headRadius: 0.15, headLength: 0.36 });
        rArrow = root.Sim3Primitives.arrow(THREE, 0xe06a00, { radius: 0.052, headRadius: 0.15, headLength: 0.32 });
        moArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.moment, { radius: 0.065, headRadius: 0.2, headLength: 0.42 });
        momentRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.026, 10, 64), root.Sim3VisualKit.material(THREE, 'moment', { transparent: true, opacity: 0.78, emissive: 0x120020 }));
        momentRing.rotation.x = Math.PI / 2; momentRing.position.set(0, 0.16, 0); forceLabelTarget = new THREE.Vector3();
        scene.add(base, grid, origin, p1, p2, f1Arrow, f2Arrow, rArrow, moArrow, momentRing);
        labels.add('f', 'F', () => forceLabelTarget, { dx: -70, dy: -26 });
        labels.add('r', 'R', () => rArrow.position, { dx: 62, dy: -28 });
        labels.add('mo', 'Mo', () => momentRing.position, { dx: -38, dy: 40 });
      }
    });
    if (!shell) return null;

    function worldPoint(point, elevation) {
      const p = C.point2D(point, { plane: C.PLANES.HORIZONTAL, elevation });
      return { x: p.x * scale, y: p.y, z: p.z * scale };
    }
    function worldVector(vector) {
      const v = C.vector2D(vector, { plane: C.PLANES.HORIZONTAL });
      return { x: v.x, y: v.y, z: v.z };
    }
    function serial(v) { return { x: v.x, y: v.y, z: v.z }; }

    function setState(state) {
      cameraRef.fov = cameraRef.aspect > 1.5 ? 27 : 40; cameraRef.updateProjectionMatrix(); tick += 1;
      const forces = state.forces || [];
      const input = [0, 1].map(i => forces[i] || { r: { x: 0, y: 0 }, F: { fx: 0, fy: 0 } });
      const mapped = input.map(f => ({ point: worldPoint(f.r, 0.12), r: worldVector(f.r), force: worldVector({ x: f.F.fx, y: f.F.fy }) }));
      const resultant = mapped.reduce((sum, f) => ({ x: sum.x + f.force.x, y: sum.y + f.force.y, z: sum.z + f.force.z }), { x: 0, y: 0, z: 0 });
      const moment = mapped.reduce((sum, f) => sum + C.cross(f.r, f.force).y, 0);
      p1.position.set(mapped[0].point.x, mapped[0].point.y, mapped[0].point.z); p2.position.set(mapped[1].point.x, mapped[1].point.y, mapped[1].point.z);
      forceLabelTarget.set((p1.position.x + p2.position.x) / 2, 0.34, (p1.position.z + p2.position.z) / 2);
      root.Sim3Primitives.updateArrow(THREERef, f1Arrow, mapped[0].force, { base: mapped[0].point, factor: forceScale, minLength: 0 });
      root.Sim3Primitives.updateArrow(THREERef, f2Arrow, mapped[1].force, { base: mapped[1].point, factor: forceScale, minLength: 0 });
      const resultantBase = { x: 0, y: 0.22, z: 0 }, momentBase = { x: 0, y: 0.16, z: 0 };
      root.Sim3Primitives.updateArrow(THREERef, rArrow, resultant, { base: resultantBase, factor: resultantScale, minLength: 0 });
      root.Sim3Primitives.updateArrow(THREERef, moArrow, C.axisVector(moment, C.PLANES.HORIZONTAL), { base: momentBase, factor: 0.026, minLength: 0 });
      momentRing.position.set(0, 0.16, 0); shell.setState(state);
      const ends = mapped.map(f => ({ x: f.point.x + f.force.x * forceScale, y: f.point.y, z: f.point.z + f.force.z * forceScale }));
      const rEnd = { x: resultant.x * resultantScale, y: 0.22, z: resultant.z * resultantScale };
      const primaryPoints = [p1.position, p2.position, rEnd].concat(ends);
      const projectedMarginPx = shell.projectMargin(primaryPoints), sceneBounds = shell.projectBounds(primaryPoints);
      const f1Projected = shell.projectDistance(mapped[0].point, ends[0]), f2Projected = shell.projectDistance(mapped[1].point, ends[1]);
      const rProjected = shell.projectDistance(resultantBase, rEnd), componentForceReadablePxMin = Math.min(f1Projected, f2Projected);
      const resultantDominanceRatio = rProjected / Math.max(1, f1Projected, f2Projected);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch1-1-5'] = {
        updatedAt: tick, forces: input.map(f => ({ r: { x: f.r.x, y: f.r.y }, F: { fx: f.F.fx, fy: f.F.fy } })),
        resultant: { Rx: resultant.x, Ry: -resultant.z, Mo: moment },
        physics: { plane: C.PLANES.HORIZONTAL, mappedForces: mapped.map(f => ({ point: serial(f.point), r: serial(f.r), force: serial(f.force) })), resultant: serial(resultant), moment: { axis: serial(C.axisVector(moment, C.PLANES.HORIZONTAL)), value: moment }, transforms: { points: [serial(p1.position), serial(p2.position)], forceMagnitudes: [f1Arrow.userData.sim3PhysicalMagnitude, f2Arrow.userData.sim3PhysicalMagnitude], resultantMagnitude: rArrow.userData.sim3PhysicalMagnitude, momentMagnitude: moArrow.userData.sim3PhysicalMagnitude } },
        visualMetrics: root.Sim3VisualKit.visualMetrics({ forceVectorScaleMin: 0.28, resultantVectorRole: 'functional', resultantCueRole: 'functional-resultant-not-decoration', resultantDecorativeRisk: resultantDominanceRatio <= 1.25 ? 'low' : 'medium', componentForceReadablePxMin, momentCueDistanceMax: 0.5, momentCueRole: 'near-origin-torque-ring', labelSeparationTargetPx: 16, constructionOpacityMax: 0.22, minSafeMarginPx: projectedMarginPx, projectedMarginPx, labelOverlapTarget: 0, resultantClearancePx: 28, cameraFit: 'large-center-safe-crop', physicalMeaningCue: 'force-system-resultant-moment', primarySceneFillRatio: sceneBounds ? sceneBounds.fillRatio : 0, visibleLabelCount: shell.labels.countVisible(), primaryObjectDominanceRatio: resultantDominanceRatio, resultantDominanceRatio })
      };
    }
    return { host: opts.host, setState, resize: shell.resize, dispose: shell.dispose };
  }
  root.Sim3Ch115 = { create };
})(typeof window !== 'undefined' ? window : this);
