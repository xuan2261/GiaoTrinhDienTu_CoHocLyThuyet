(function(root) {
  'use strict';

  function create(opts) {
    let THREERef, point, tangentArrow, normalArrow, radiusLine, centerDot, circle, tick = 0;
    const pathScale = 0.54, C = root.Sim3Coordinates;
    const shell = root.Sim3Shell.create({
      host: opts.host, referenceEl: opts.referenceEl, label: 'Tiếp pháp tuyến và bán kính cong 3D', onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE; root.Sim3VisualKit.setCamera(camera, { x: 3.6, y: 3.0, z: 5.2 }, { x: 0.15, y: 0.15, z: 0 });
        scene.add(root.Sim3VisualKit.shadowPlane(THREE, 7));
        const curve = new THREE.EllipseCurve(0, 0, 4 * pathScale, 2.5 * pathScale, 0, Math.PI * 2);
        const pts = curve.getPoints(96).map(p => new THREE.Vector3(p.x, 0.04, -p.y));
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: root.Sim3VisualKit.colors.axis })));
        point = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), root.Sim3VisualKit.roleMaterial(THREE, 'force', 'primarySurface'));
        tangentArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.v, { radius: 0.035, headRadius: 0.11 });
        normalArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.a, { radius: 0.035, headRadius: 0.11 });
        radiusLine = root.Sim3Primitives.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, 0.022, root.Sim3VisualKit.colors.moment);
        centerDot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), root.Sim3VisualKit.material(THREE, 'moment'));
        circle = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 10, 112), root.Sim3VisualKit.material(THREE, 'moment', { transparent: true, opacity: 0.78, emissive: 0x120020 }));
        circle.rotation.x = Math.PI / 2; scene.add(point, tangentArrow, normalArrow, radiusLine, centerDot, circle);
        labels.add('tau', 'τ', () => tangentArrow.position, root.Sim3VisualKit.labelOffset('vector', { dx: 28, dy: -18 }));
        labels.add('normal', 'n', () => normalArrow.position, root.Sim3VisualKit.labelOffset('vector', { dx: -34, dy: 22 }));
        labels.add('radius', 'R', () => centerDot.position, root.Sim3VisualKit.labelOffset('guide', { dx: 26, dy: -18 }));
      }
    });
    if (!shell) return null;
    function worldPoint(value, elevation) {
      const p = C.point2D(value, { plane: C.PLANES.HORIZONTAL, elevation });
      return { x: p.x * pathScale, y: p.y, z: p.z * pathScale };
    }
    function worldVector(value) { return C.vector2D(value, { plane: C.PLANES.HORIZONTAL }); }
    function serial(v) { return { x: v.x, y: v.y, z: v.z }; }
    function setState(state) {
      tick += 1;
      const p = state.point || { x: 0, y: 0 }, t = state.tangent || { x: 1, y: 0 }, n = state.normal || { x: 0, y: 1 };
      const radius = Math.max(0.1, Math.min(12, Number.isFinite(state.radius) ? state.radius : 1));
      const pos = worldPoint(p, 0.14), tangent = worldVector(t), normal = worldVector(n);
      const center = worldPoint({ x: p.x + n.x * radius, y: p.y + n.y * radius }, 0.14);
      point.position.set(pos.x, pos.y, pos.z);
      root.Sim3Primitives.updateArrow(THREERef, tangentArrow, tangent, { base: pos, factor: 0.9, minLength: 0 });
      root.Sim3Primitives.updateArrow(THREERef, normalArrow, normal, { base: pos, factor: 0.82, minLength: 0 });
      circle.position.set(center.x, center.y, center.z); centerDot.position.set(center.x, center.y + 0.03, center.z); circle.scale.setScalar(Math.max(0.2, radius * pathScale));
      root.Sim3Primitives.setCylinderBetween(THREERef, radiusLine, pos, center); shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-1-3'] = Object.assign({}, state, {
        updatedAt: tick, point: { x: p.x, y: p.y }, tangent: { x: t.x, y: t.y }, normal: { x: n.x, y: n.y }, radius,
        physics: { plane: C.PLANES.HORIZONTAL, point: serial(pos), tangent: serial(tangent), normal: serial(normal), center: serial(center), radius, transforms: { point: serial(point.position), circleCenter: serial(circle.position), circleRadius: circle.geometry.parameters.radius * circle.scale.x, radiusLineLength: radiusLine.userData.sim3BaseLength * radiusLine.scale.y, tangentMagnitude: tangentArrow.userData.sim3PhysicalMagnitude, normalMagnitude: normalArrow.userData.sim3PhysicalMagnitude } },
        visualMetrics: root.Sim3VisualKit.visualMetrics({ frenetFrame: 'tangent-normal-radius', osculatingCircleRole: 'secondary-guide', labelClusterReduced: true, labelClusterStrategy: 'frenet-lanes-separated', labelSeparationTargetPx: 18, osculatingCircleContrast: 'enhanced', osculatingCircleOpacityMin: 0.78, radiusGuideStrokeMin: 0.022, radiusLabelAttachmentPxMax: 24 })
      });
    }
    return { host: opts.host, setState, resize: shell.resize, dispose: shell.dispose };
  }
  root.Sim3Ch213 = { create };
})(typeof window !== 'undefined' ? window : this);
