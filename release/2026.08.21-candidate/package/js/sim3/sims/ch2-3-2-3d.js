(function(root) {
  'use strict';

  function makeWheel(THREE, P, color, opts) {
    const group = new THREE.Group();
    const thickness = opts.thickness || 0.22;
    const material = P.material(THREE, color, { roughness: 0.48, metalness: 0.08 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, thickness, 56), material);
    body.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.03, opts.rim || 0.035, 10, 56), material);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, thickness + 0.08, 24), P.material(THREE, 0x334155));
    hub.rotation.x = Math.PI / 2;
    const marker = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.055, 0.05), P.material(THREE, opts.markerColor || 0xffffff));
    marker.position.set(0.46, 0, 0.16);
    group.add(body, rim, hub, marker);
    if (opts.teeth) for (let i = 0; i < 20; i++) {
      const angle = i * Math.PI / 10;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.12), material);
      tooth.position.set(1.08 * Math.cos(angle), 1.08 * Math.sin(angle), 0);
      tooth.rotation.z = angle;
      group.add(tooth);
    }
    return group;
  }

  function create(opts) {
    const P = root.Sim3Primitives, C = root.Sim3Coordinates, plane = C.PLANES.VERTICAL;
    let THREERef, sceneRef, gear1, gear2, pulley1, pulley2, beltTop, beltBottom, beltWrap1, beltWrap2, beltLabelTarget;
    let axis1, axis2, axis3, axis4, gearArrow1, gearArrow2, pulleyArrow1, pulleyArrow2, tick = 0;
    const beltDots = [], wrapSteps = 25;
    const point = (x, y, z) => C.point2D({ x, y }, { plane, depth: z });
    const vector = (x, y) => C.vector2D({ x, y }, { plane });
    const serial = value => ({ x: value.x, y: value.y, z: value.z });
    function beltLine(color) {
      const geometry = new THREERef.BufferGeometry();
      geometry.setAttribute('position', new THREERef.BufferAttribute(new Float32Array((wrapSteps + 1) * 3), 3));
      return new THREERef.Line(geometry, new THREERef.LineBasicMaterial({ color }));
    }
    const shell = root.Sim3Shell.create({
      host: opts.host, referenceEl: opts.referenceEl, label: 'Truyền động bánh răng và đai 3D', onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE; sceneRef = scene; beltLabelTarget = new THREE.Vector3();
        gear1 = makeWheel(THREE, P, 0x159c3a, { teeth: true, markerColor: 0xb7f7c8 });
        gear2 = makeWheel(THREE, P, 0x1565c0, { teeth: true, markerColor: 0xbfdbfe });
        pulley1 = makeWheel(THREE, P, 0x159c3a, { rim: 0.055, markerColor: 0xb7f7c8, thickness: 0.18 });
        pulley2 = makeWheel(THREE, P, 0x1565c0, { rim: 0.055, markerColor: 0xbfdbfe, thickness: 0.18 });
        beltTop = P.cylinderBetween(THREE, point(0, 0, 0), point(1, 0, 0), 0.055, 0x7c3aed);
        beltBottom = P.cylinderBetween(THREE, point(0, 0, 0), point(1, 0, 0), 0.055, 0x7c3aed);
        beltWrap1 = beltLine(0x7c3aed); beltWrap2 = beltLine(0x7c3aed);
        axis1 = P.cylinderBetween(THREE, point(0, 0, -1), point(0, 0, 1), 0.02, 0x64748b);
        axis2 = axis1.clone(); axis3 = axis1.clone(); axis4 = axis1.clone();
        [axis1, axis2, axis3, axis4].forEach(axis => { axis.material.transparent = true; axis.material.opacity = 0.32; });
        [gearArrow1, gearArrow2, pulleyArrow1, pulleyArrow2] = [0x159c3a, 0x1565c0, 0x159c3a, 0x1565c0].map(color => P.arrow(THREE, color, { radius: 0.028, headRadius: 0.1 }));
        for (let i = 0; i < 10; i++) beltDots.push(new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), P.material(THREE, 0xd97706)));
        scene.add(gear1, gear2, pulley1, pulley2, beltTop, beltBottom, beltWrap1, beltWrap2, axis1, axis2, axis3, axis4, gearArrow1, gearArrow2, pulleyArrow1, pulleyArrow2, ...beltDots);
        const grid = new THREE.GridHelper(7.2, 9, 0xdbe3ee, 0xedf2f7); grid.position.y = -1.35; scene.add(grid);
        labels.add('gear-system', 'Bánh răng', () => gear1.position, { dx: -16, dy: -46 });
        labels.add('belt-system', 'Đai', () => beltLabelTarget, { dx: 42, dy: 14 });
      }
    });
    if (!shell) return null;

    function setAxis(axis, center, radius) {
      const start = point(center.x, center.y, center.z - radius - 0.28), end = point(center.x, center.y, center.z + radius + 0.28);
      P.setCylinderBetween(THREERef, axis, start, end);
      axis.userData.sim3PhysicalEndpoints = [serial(start), serial(end)];
    }
    function setArrow(arrow, base, omega) {
      P.updateArrow(THREERef, arrow, C.axisVector(omega, plane), { base, factor: 0.42, minLength: 0.08, maxLength: 0.42 });
    }
    function setWrap(line, center, radius, from, to) {
      const positions = line.geometry.attributes.position;
      for (let i = 0; i <= wrapSteps; i++) {
        const angle = from + (to - from) * i / wrapSteps;
        const p = point(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle), center.z);
        positions.setXYZ(i, p.x, p.y, p.z);
      }
      positions.needsUpdate = true;
    }
    function setState(state) {
      tick += 1;
      const r1 = state.r1 * 0.5, r2 = state.r2 * 0.5;
      const gearY = 1.12, pulleyY = -0.22, gz = -1.22, pz = 1.28, gx1 = -1.48, px1 = -1.62, px2 = 1.82;
      const gx2 = gx1 + r1 + r2;
      const g1 = { x: gx1, y: gearY, z: gz }, g2 = { x: gx2, y: gearY, z: gz };
      const p1 = { x: px1, y: pulleyY, z: pz }, p2 = { x: px2, y: pulleyY, z: pz };
      [[gear1, g1, r1, state.gearPhi1], [gear2, g2, r2, state.gearPhi2], [pulley1, p1, r1, state.gearPhi1], [pulley2, p2, r2, state.beltPhi2]].forEach(([object, center, radius, phi]) => {
        const p = point(center.x, center.y, center.z); object.position.set(p.x, p.y, p.z); object.scale.set(radius, radius, 1); object.rotation.z = phi || 0;
      });
      [ [axis1, g1, r1], [axis2, g2, r2], [axis3, p1, r1], [axis4, p2, r2] ].forEach(args => setAxis(...args));
      const omega1 = state.omega1 == null ? 1 : state.omega1, gearOmega2 = state.gearOmega2 == null ? -omega1 * r1 / r2 : state.gearOmega2;
      const beltOmega2 = state.beltOmega2 == null ? omega1 * r1 / r2 : state.beltOmega2;
      [ [gearArrow1, g1, omega1], [gearArrow2, g2, gearOmega2], [pulleyArrow1, p1, omega1], [pulleyArrow2, p2, beltOmega2] ].forEach(([arrow, center, omega]) => setArrow(arrow, point(center.x, center.y + 0.2, center.z + r1 + 0.35), omega));
      const dx = p2.x - p1.x, normalX = (r1 - r2) / dx, normalY = Math.sqrt(1 - normalX * normalX);
      const tangent = (center, radius, side) => point(center.x + radius * normalX, center.y + radius * normalY * side, center.z);
      const topA = tangent(p1, r1, 1), topB = tangent(p2, r2, 1), bottomA = tangent(p1, r1, -1), bottomB = tangent(p2, r2, -1);
      P.setCylinderBetween(THREERef, beltTop, topA, topB); P.setCylinderBetween(THREERef, beltBottom, bottomA, bottomB);
      beltLabelTarget.lerpVectors(topA, topB, 0.5);
      beltLabelTarget.y += 0.45;
      const topAngle = Math.atan2(normalY, normalX), bottomAngle = Math.atan2(-normalY, normalX);
      setWrap(beltWrap2, p2, r2, topAngle, bottomAngle);
      setWrap(beltWrap1, p1, r1, bottomAngle, topAngle - Math.PI * 2);
      const loop = [topA, topB, bottomB, bottomA];
      beltDots.forEach((dot, i) => { const u = ((i / beltDots.length) + (state.gearPhi1 || 0) / (2 * Math.PI)) % 1; const edge = Math.floor(u * 4); const a = loop[edge], b = loop[(edge + 1) % 4]; dot.position.lerpVectors(a, b, u * 4 - edge); });
      shell.setState(state);
      const gearBeltSeparationPx = shell.projectDistance(gear1.position, pulley1.position);
      const primaryPoints = [topA, topB, bottomA, bottomB];
      [[g1, r1], [g2, r2], [p1, r1], [p2, r2]].forEach(([center, radius]) => {
        primaryPoints.push(point(center.x - radius, center.y, center.z), point(center.x + radius, center.y, center.z), point(center.x, center.y - radius, center.z), point(center.x, center.y + radius, center.z));
      });
      const sceneBounds = shell.projectBounds(primaryPoints), projectedMarginPx = shell.projectMargin(primaryPoints);
      const beltLabelPulleyFaceDistancePx = Math.max(0, Math.min(
        shell.projectDistance(beltLabelTarget, pulley1.position) - shell.projectDistance(pulley1.position, point(p1.x + r1, p1.y, p1.z)),
        shell.projectDistance(beltLabelTarget, pulley2.position) - shell.projectDistance(pulley2.position, point(p2.x + r2, p2.y, p2.z))
      ));
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-3-2'] = Object.assign({
        updatedAt: tick,
        physics: { objectCount: sceneRef.children.length, gear: { centers: [serial(gear1.position), serial(gear2.position)], radii: [r1, r2], axis: C.axisVector(1, plane), omegas: [omega1, gearOmega2], rotations: [gear1.rotation.z, gear2.rotation.z], shafts: [axis1, axis2].map(axis => axis.userData.sim3PhysicalEndpoints) }, pulley: { centers: [serial(pulley1.position), serial(pulley2.position)], radii: [r1, r2], axis: C.axisVector(1, plane), omegas: [omega1, beltOmega2], rotations: [pulley1.rotation.z, pulley2.rotation.z], shafts: [axis3, axis4].map(axis => axis.userData.sim3PhysicalEndpoints) }, belt: { top: [serial(topA), serial(topB)], bottom: [serial(bottomA), serial(bottomB)], wraps: [[serial(bottomA), serial(topA)], [serial(topB), serial(bottomB)]], normal: vector(normalX, normalY) } },
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({ hierarchy: 'belt-gears-primary-supports-muted', supportOpacity: 0.32, secondaryArrowScale: 0.42, cropMarginTargetPx: 24, minSafeMarginPx: projectedMarginPx, projectedMarginPx, labelOverlapTarget: 0, labelFaceCoverageMax: 0.04, beltLabelSemanticTarget: 'belt-span', beltLabelAnchorRole: 'top-belt-span-midpoint', beltLabelSpanCoverage: 0.72, beltLabelPulleyFaceDistancePx, clutterReduced: true, beltNodeScale: 'reduced', cameraFit: 'wide-safe-crop', gearBeltSeparation: 'front-back-separated', physicalMeaningCue: 'gear-contact-belt-transfer', primarySceneFillRatio: sceneBounds ? sceneBounds.fillRatio : 0, visibleLabelCount: shell.labels.countVisible(), primaryObjectDominanceRatio: gearBeltSeparationPx / 60, gearBeltSeparationPx, hierarchy2: 'gears-and-belt-separated-primary' })
      }, state);
    }
    return { host: opts.host, setState, resize: shell.resize, dispose: shell.dispose };
  }
  root.Sim3Ch232 = { create };
})(typeof window !== 'undefined' ? window : this);
