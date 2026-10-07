(function(root) {
  'use strict';

  function create(opts) {
    let THREERef, plane, block, cone, betaArrow, normalArrow, contactShadow, stateBand, slipArrow, circleNormal, contactNormal, requiredArrow, frictionArrow, weightArrow, cachedMu = null, tick = 0;
    const C = root.Sim3Coordinates;
    const shell = root.Sim3Shell.create({
      host: opts.host, referenceEl: opts.referenceEl, label: 'Nón ma sát 3D', onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE; circleNormal = new THREE.Vector3(0, 0, 1); contactNormal = new THREE.Vector3(); root.Sim3VisualKit.setCamera(camera, { x: 3.8, y: 3.0, z: 5.6 }, { x: 0.35, y: 0.35, z: 0 });
        scene.add(root.Sim3VisualKit.shadowPlane(THREE, 7));
        plane = new THREE.Mesh(new THREE.BoxGeometry(5, 0.22, 2.55), root.Sim3VisualKit.material(THREE, 0xdbeafe, { transparent: true, opacity: 0.72, roughness: 0.78 }));
        block = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.58, 0.78), root.Sim3VisualKit.roleMaterial(THREE, 'a', 'primarySurface'));
        contactShadow = new THREE.Mesh(new THREE.CircleGeometry(0.58, 36), root.Sim3VisualKit.material(THREE, 0x334155, { transparent: true, opacity: 0.36, roughness: 0.9 }));
        stateBand = new THREE.Mesh(new THREE.RingGeometry(0.48, 0.7, 48), root.Sim3VisualKit.material(THREE, 0x159c3a, { transparent: true, opacity: 0.24, roughness: 0.8 }));
        cone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1, 48, 1, true), root.Sim3VisualKit.material(THREE, 'moment', { transparent: true, opacity: 0.22, roughness: 0.65 }));
        betaArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.moment, { radius: 0.025, headRadius: 0.08 });
        normalArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.03, headRadius: 0.09 });
        slipArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.035, headRadius: 0.12, headLength: 0.32 });
        requiredArrow = root.Sim3Primitives.arrow(THREE, 0x159c3a, {radius:0.025,headRadius:0.08});
        frictionArrow = root.Sim3Primitives.arrow(THREE, 0xd81b60, {radius:0.025,headRadius:0.08});
        weightArrow = root.Sim3Primitives.arrow(THREE, 0xe03030, {radius:0.025,headRadius:0.08});
        normalArrow.name = 'N-required'; frictionArrow.name = 'Ft-required'; requiredArrow.name = 'R-required'; weightArrow.name = 'weight';
        scene.add(plane, block, contactShadow, stateBand, cone, betaArrow, normalArrow, slipArrow, requiredArrow, frictionArrow, weightArrow);
        labels.add('required', 'R cần / P', () => requiredArrow.position, {dx:48,dy:-52});
        labels.add('normal', 'N / P', () => normalArrow.position, {dx:-42,dy:-26});
        labels.add('friction', 'Fₜ cần / P', () => frictionArrow.position, {dx:52,dy:20});
        labels.add('weight', 'P = mg', () => weightArrow.position, {dx:-44,dy:40});
        labels.add('slip', 'Xu hướng xuống dốc', () => slipArrow.visible ? slipArrow.position : null, {dx:36,dy:45});
        labels.add('beta', 'β', () => betaArrow.position, root.Sim3VisualKit.labelOffset('guide', { dx: 20, dy: -8 }));
        labels.add('phi', 'φ', () => cone.position, root.Sim3VisualKit.labelOffset('axis', { dx: -46, dy: 24 }));
        labels.add('cone', 'Nón ma sát', () => cone.position, root.Sim3VisualKit.labelOffset('phase', { dx: 34, dy: -26 }));
      }
    });
    if (!shell) return null;
    function world(vector) { return C.vector2D(vector, { plane: C.PLANES.VERTICAL }); }
    function point(value) { return C.point2D(value, { plane: C.PLANES.VERTICAL, depth: 0 }); }
    function serial(v) { return { x: v.x, y: v.y, z: v.z }; }
    function setCone(contact, normal, mu) {
      const height = 1.15, radius = Math.max(0, mu) * height;
      if (cachedMu !== mu) {
        const replacement = new THREERef.ConeGeometry(radius, height, 48, 1, true);
        cone.geometry.dispose(); cone.geometry = replacement; cachedMu = mu;
      }
      cone.position.set(contact.x + normal.x * height / 2, contact.y + normal.y * height / 2, contact.z + normal.z * height / 2);
      // ConeGeometry apex is local +Y; direct it back towards contact.
      cone.quaternion.setFromUnitVectors(new THREERef.Vector3(0, 1, 0), new THREERef.Vector3(-normal.x, -normal.y, -normal.z));
    }
    function setState(state) {
      tick += 1;
      const beta = (Number.isFinite(state.betaDeg) ? state.betaDeg : 0) * Math.PI / 180;
      const mu = Math.max(0, Number.isFinite(state.mu) ? state.mu : 0);
      const phi = Math.atan(mu), phiDeg = phi * 180 / Math.PI;
      const tangent = world({ x: Math.cos(beta), y: Math.sin(beta) });
      const normal = world({ x: -Math.sin(beta), y: Math.cos(beta) });
      const midplanePoint = point({ x: 0.35 * Math.cos(beta), y: 0.35 * Math.sin(beta) });
      // Contact lies on the top surface, not the centre of the thick incline.
      const contact = { x: midplanePoint.x + normal.x * 0.11, y: midplanePoint.y + normal.y * 0.11, z: midplanePoint.z };
      const blockCenter = { x: contact.x + normal.x * 0.29, y: contact.y + normal.y * 0.29, z: contact.z };
      const margin = mu*Math.cos(beta)-Math.sin(beta);
      const equilibriumState = Math.abs(margin) <= 1e-9 ? 'limiting' : (margin > 0 ? 'static' : 'impossible');
      const slips = equilibriumState === 'impossible';
      plane.rotation.z = beta; block.position.set(blockCenter.x, blockCenter.y, blockCenter.z); block.rotation.z = beta;
      contactNormal.set(normal.x, normal.y, normal.z);
      contactShadow.position.set(contact.x + normal.x * 0.006, contact.y + normal.y * 0.006, contact.z); contactShadow.quaternion.setFromUnitVectors(circleNormal, contactNormal);
      stateBand.position.set(contact.x + normal.x * 0.012, contact.y + normal.y * 0.012, contact.z); stateBand.quaternion.copy(contactShadow.quaternion);
      stateBand.material.color.set(slips ? 0xd81b60 : 0x159c3a); stateBand.material.opacity = slips ? 0.3 : 0.24;
      setCone(contact, normal, mu);
      root.Sim3Primitives.updateArrow(THREERef, betaArrow, tangent, { base: world({ x: -2.1, y: 0.16 }), factor: 0.95, minLength: 0 });
      const forceBase = { x: contact.x, y: contact.y, z: 0.48 };
      root.Sim3Primitives.updateArrow(THREERef, normalArrow, {x:normal.x*Math.cos(beta),y:normal.y*Math.cos(beta),z:normal.z*Math.cos(beta)}, { base: forceBase, factor: 0.8, minLength: 0 });
      root.Sim3Primitives.updateArrow(THREERef, frictionArrow, {x:tangent.x*Math.sin(beta),y:tangent.y*Math.sin(beta),z:tangent.z*Math.sin(beta)}, { base: forceBase, factor: 0.8, minLength: 0 });
      root.Sim3Primitives.updateArrow(THREERef, requiredArrow, {x:0,y:1,z:0}, { base: forceBase, factor: 0.8, minLength: 0 });
      root.Sim3Primitives.updateArrow(THREERef, weightArrow, {x:0,y:-1,z:0}, { base: {x:blockCenter.x,y:blockCenter.y,z:-0.48}, factor: 0.8, minLength: 0 });
      root.Sim3Primitives.updateArrow(THREERef, slipArrow, { x: -tangent.x, y: -tangent.y, z: -tangent.z }, { base: { x: blockCenter.x, y: blockCenter.y, z: -0.45 }, factor: slips ? 0.78 : 0.42, minLength: 0 });
      slipArrow.visible = slips; shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch1-5-3'] = Object.assign({}, state, {
        updatedAt: tick, phiDeg, slips, equilibriumState,
        displayScales: { normalizedForces: 0.8, units: 'force/P, P=mg>0', slipArrow: 'direction cue, not velocity' },
        physics: { plane: C.PLANES.VERTICAL, required: { role: 'required-for-static-equilibrium', normalOverWeight: Math.cos(beta), frictionOverWeight: Math.sin(beta), marginOverWeight: margin, actualSlidingContact: false }, tangent: serial(tangent), normal: serial(normal), contact: serial(contact), blockCenter: serial(blockCenter), cone: { halfAngle: phi, halfAngleDeg: phiDeg, radius: cone.geometry.parameters.radius, height: cone.geometry.parameters.height, axis: serial(normal) }, transforms: { block: serial(block.position), planeRotationZ: plane.rotation.z, blockRotationZ: block.rotation.z, contactNormal: serial(contactNormal), cone: serial(cone.position), normalMagnitude: normalArrow.userData.sim3PhysicalMagnitude, slipVisible: slipArrow.visible, slipDirection: slipArrow.userData.sim3DirectionVector ? serial(slipArrow.userData.sim3DirectionVector) : { x: 0, y: 0, z: 0 } } },
        visualMetrics: root.Sim3VisualKit.visualMetrics({ coneRole: 'primary-spatial-concept', blockRole: 'slip-state-carrier', contactShadowOpacityMin: 0.32, blockGrounding: 'contact-shadow-on-incline', inclineThicknessMin: 0.22, equilibriumCue: 'inside-friction-cone-band', slipCue: 'downslope-arrow-and-block-state', coneOpacityMax: 0.28 })
      });
    }
    return { host: opts.host, setState, resize: shell.resize, dispose: shell.dispose };
  }
  root.Sim3Ch153 = { create };
})(typeof window !== 'undefined' ? window : this);
