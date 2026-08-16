(function(root) {
  'use strict';

  function setArrow(THREE, arrow, base, dir, scale) {
    const v = new THREE.Vector3(dir.x || 0, dir.y || 0, dir.z || 0);
    arrow.position.set(base.x || 0, base.y || 0, base.z || 0);
    root.Sim3Primitives.orientArrow(THREE, arrow, v);
    arrow.scale.y = Math.max(0.08, v.length() * (scale || 1));
  }

  function create(opts) {
    let THREERef, f1Arrow, f2Arrow, rArrow, moArrow, momentRing, p1, p2, forceLabelTarget, grid, tick = 0;
    const scale = 0.78;
    const forceScale = 0.03;
    const resultantScale = 0.034;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Thu gọn hệ lực 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        root.Sim3VisualKit.setCamera(camera, { x: 4.18, y: 3.08, z: 5.45 }, { x: 0.02, y: 0.12, z: 0.02 });
        const base = root.Sim3VisualKit.shadowPlane(THREE, 5.2);
        base.material.opacity = 0.28;
        base.material.transparent = true;
        scene.add(base);
        grid = new THREE.GridHelper(3.8, 6, 0xdbe4ee, 0xedf2f7);
        grid.material.transparent = true;
        grid.material.opacity = 0.22;
        scene.add(grid);

        const origin = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 16, 12),
          root.Sim3VisualKit.material(THREE, 0x102a4d)
        );
        scene.add(origin);
        p1 = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), root.Sim3VisualKit.material(THREE, 0xd81b60));
        p2 = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), root.Sim3VisualKit.material(THREE, 0xd81b60));
        f1Arrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.048, headRadius: 0.15, headLength: 0.36 });
        f2Arrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.048, headRadius: 0.15, headLength: 0.36 });
        rArrow = root.Sim3Primitives.arrow(THREE, 0xe06a00, { radius: 0.052, headRadius: 0.15, headLength: 0.32 });
        moArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.moment, { radius: 0.065, headRadius: 0.2, headLength: 0.42 });
        momentRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.58, 0.026, 10, 64),
          root.Sim3VisualKit.material(THREE, 'moment', { transparent: true, opacity: 0.78, emissive: 0x120020 })
        );
        momentRing.rotation.x = Math.PI / 2;
        momentRing.position.set(0, 0.16, 0);
        forceLabelTarget = new THREE.Vector3();
        scene.add(p1, p2, f1Arrow, f2Arrow, rArrow, moArrow, momentRing);

        labels.add('f', 'F', () => forceLabelTarget, { dx: -70, dy: -26 });
        labels.add('r', 'R', () => rArrow.position, { dx: 62, dy: -28 });
        labels.add('mo', 'Mo', () => momentRing.position, { dx: -38, dy: 40 });
      }
    });
    if (!shell) return null;

    function to3(p) {
      return { x: (p.x || 0) * scale, y: 0.12, z: (p.y || 0) * scale };
    }

    function setState(state) {
      tick += 1;
      const forces = state.forces || [];
      const red = state.resultant || { Rx: 0, Ry: 0, Mo: 0 };
      const a = forces[0] || { r: { x: 0, y: 0 }, F: { fx: 0, fy: 0 } };
      const b = forces[1] || { r: { x: 0, y: 0 }, F: { fx: 0, fy: 0 } };
      const p1v = to3(a.r), p2v = to3(b.r);
      p1.position.set(p1v.x, p1v.y, p1v.z);
      p2.position.set(p2v.x, p2v.y, p2v.z);
      forceLabelTarget.set((p1v.x + p2v.x) / 2, 0.34, (p1v.z + p2v.z) / 2);
      setArrow(THREERef, f1Arrow, p1v, { x: a.F.fx || 0, y: 0, z: a.F.fy || 0 }, forceScale);
      setArrow(THREERef, f2Arrow, p2v, { x: b.F.fx || 0, y: 0, z: b.F.fy || 0 }, forceScale);
      setArrow(THREERef, rArrow, { x: 0, y: 0.22, z: 0 }, { x: red.Rx || 0, y: 0, z: red.Ry || 0 }, resultantScale);
      const moBase = { x: 0, y: 0.16, z: 0 };
      setArrow(THREERef, moArrow, moBase, { x: 0, y: red.Mo || 0, z: 0 }, 0.026);
      momentRing.position.set(moBase.x, moBase.y, moBase.z);
      shell.setState(state);
      const rEnd = { x: (red.Rx || 0) * resultantScale, y: 0.22, z: (red.Ry || 0) * resultantScale };
      const f1End = { x: p1v.x + (a.F.fx || 0) * forceScale, y: p1v.y, z: p1v.z + (a.F.fy || 0) * forceScale };
      const f2End = { x: p2v.x + (b.F.fx || 0) * forceScale, y: p2v.y, z: p2v.z + (b.F.fy || 0) * forceScale };
      const primaryPoints = [
        p1.position, p2.position, p1v, p2v, rEnd, f1End, f2End,
        new THREERef.Vector3(rEnd.x - 0.46, rEnd.y, rEnd.z - 0.46),
        new THREERef.Vector3(rEnd.x + 0.46, rEnd.y, rEnd.z + 0.46),
        new THREERef.Vector3(f1End.x - 0.18, f1End.y, f1End.z - 0.18),
        new THREERef.Vector3(f1End.x + 0.18, f1End.y, f1End.z + 0.18),
        new THREERef.Vector3(f2End.x - 0.18, f2End.y, f2End.z - 0.18),
        new THREERef.Vector3(f2End.x + 0.18, f2End.y, f2End.z + 0.18),
        new THREERef.Vector3(moBase.x - 0.42, moBase.y, moBase.z - 0.42),
        new THREERef.Vector3(moBase.x + 0.42, moBase.y, moBase.z + 0.42)
      ];
      const projectedMarginPx = shell.projectMargin(primaryPoints);
      const sceneBounds = shell.projectBounds(primaryPoints);
      const f1Projected = shell.projectDistance(p1v, f1End);
      const f2Projected = shell.projectDistance(p2v, f2End);
      const rProjected = shell.projectDistance({ x: 0, y: 0.22, z: 0 }, rEnd);
      const componentForceReadablePxMin = Math.min(f1Projected, f2Projected);
      const resultantDominanceRatio = rProjected / Math.max(1, f1Projected, f2Projected);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch1-1-5'] = {
        updatedAt: tick,
        forces: forces.map(f => ({ r: { x: f.r.x, y: f.r.y }, F: { fx: f.F.fx, fy: f.F.fy } })),
        resultant: { Rx: red.Rx || 0, Ry: red.Ry || 0, Mo: red.Mo || 0 },
        visualMetrics: root.Sim3VisualKit.visualMetrics({
          forceVectorScaleMin: 0.28,
          resultantVectorRole: 'functional',
          resultantCueRole: 'functional-resultant-not-decoration',
          resultantDecorativeRisk: resultantDominanceRatio <= 1.25 ? 'low' : 'medium',
          componentForceReadablePxMin,
          momentCueDistanceMax: 0.5,
          momentCueRole: 'near-origin-torque-ring',
          labelSeparationTargetPx: 16,
          constructionOpacityMax: 0.22,
          minSafeMarginPx: projectedMarginPx,
          projectedMarginPx,
          labelOverlapTarget: 0,
          resultantClearancePx: 28,
          cameraFit: 'large-center-safe-crop',
          physicalMeaningCue: 'force-system-resultant-moment',
          primarySceneFillRatio: sceneBounds ? sceneBounds.fillRatio : 0,
          visibleLabelCount: shell.labels.countVisible(),
          primaryObjectDominanceRatio: resultantDominanceRatio,
          resultantDominanceRatio
        })
      };
    }

    return { host: opts.host, setState, dispose: shell.dispose };
  }

  root.Sim3Ch115 = { create };
})(typeof window !== 'undefined' ? window : this);
