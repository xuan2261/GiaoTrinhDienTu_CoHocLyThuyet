(function(root) {
  'use strict';

  function setArrow(THREE, arrow, base, dir, scale) {
    const v = new THREE.Vector3(dir.x || 0, dir.y || 0, dir.z || 0);
    arrow.position.set(base.x || 0, base.y || 0, base.z || 0);
    root.Sim3Primitives.orientArrow(THREE, arrow, v);
    arrow.scale.y = Math.max(0.08, v.length() * (scale || 1));
  }

  function create(opts) {
    let THREERef, f1Arrow, f2Arrow, rArrow, moArrow, momentRing, p1, p2, grid, tick = 0;
    const scale = 0.5;
    const forceScale = 0.024;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Thu gọn hệ lực 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        root.Sim3VisualKit.setCamera(camera, { x: 3.8, y: 3.1, z: 5.2 }, { x: 0, y: 0.1, z: 0 });
        scene.add(root.Sim3VisualKit.shadowPlane(THREE, 7));
        grid = new THREE.GridHelper(4.4, 8, 0xdbe4ee, 0xedf2f7);
        grid.material.transparent = true;
        grid.material.opacity = 0.38;
        scene.add(grid);

        const origin = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 16, 12),
          root.Sim3VisualKit.material(THREE, 0x102a4d)
        );
        scene.add(origin);
        p1 = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 14), root.Sim3VisualKit.material(THREE, 0xd81b60));
        p2 = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 14), root.Sim3VisualKit.material(THREE, 0xd81b60));
        f1Arrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.045, headRadius: 0.14, headLength: 0.34 });
        f2Arrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.045, headRadius: 0.14, headLength: 0.34 });
        rArrow = root.Sim3Primitives.arrow(THREE, 0xe06a00, { radius: 0.06, headRadius: 0.18, headLength: 0.4 });
        moArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.moment, { radius: 0.052, headRadius: 0.16, headLength: 0.36 });
        momentRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.018, 10, 56),
          root.Sim3VisualKit.material(THREE, 'moment', { transparent: true, opacity: 0.78, emissive: 0x120020 })
        );
        momentRing.rotation.x = Math.PI / 2;
        momentRing.position.set(-0.42, 0.16, 0.42);
        scene.add(p1, p2, f1Arrow, f2Arrow, rArrow, moArrow, momentRing);

        labels.add('f1', 'F1', () => p1.position, root.Sim3VisualKit.labelOffset('point', { dx: -34, dy: -10 }));
        labels.add('f2', 'F2', () => p2.position, root.Sim3VisualKit.labelOffset('point', { dx: 22, dy: -8 }));
        labels.add('r', 'R', () => rArrow.position, root.Sim3VisualKit.labelOffset('vector', { dx: 20, dy: -10 }));
        labels.add('mo', 'Mo', () => momentRing.position, root.Sim3VisualKit.labelOffset('axis', { dx: -16, dy: -4 }));
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
      setArrow(THREERef, f1Arrow, p1v, { x: a.F.fx || 0, y: 0, z: a.F.fy || 0 }, forceScale);
      setArrow(THREERef, f2Arrow, p2v, { x: b.F.fx || 0, y: 0, z: b.F.fy || 0 }, forceScale);
      setArrow(THREERef, rArrow, { x: 0, y: 0.18, z: 0 }, { x: red.Rx || 0, y: 0, z: red.Ry || 0 }, forceScale);
      const moBase = { x: -0.42, y: 0.16, z: 0.42 };
      setArrow(THREERef, moArrow, moBase, { x: 0, y: red.Mo || 0, z: 0 }, 0.018);
      momentRing.position.set(moBase.x, moBase.y, moBase.z);
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch1-1-5'] = {
        updatedAt: tick,
        forces: forces.map(f => ({ r: { x: f.r.x, y: f.r.y }, F: { fx: f.F.fx, fy: f.F.fy } })),
        resultant: { Rx: red.Rx || 0, Ry: red.Ry || 0, Mo: red.Mo || 0 },
        visualMetrics: root.Sim3VisualKit.visualMetrics({
          forceVectorScaleMin: 0.28,
          resultantVectorRole: 'dominant',
          momentCueDistanceMax: 0.62,
          momentCueRole: 'near-origin-torque-ring',
          labelSeparationTargetPx: 16,
          constructionOpacityMax: 0.45
        })
      };
    }

    return { host: opts.host, setState, dispose: shell.dispose };
  }

  root.Sim3Ch115 = { create };
})(typeof window !== 'undefined' ? window : this);
