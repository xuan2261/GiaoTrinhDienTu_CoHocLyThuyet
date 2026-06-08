(function(root) {
  'use strict';

  function makeWheel(THREE, P, color, opts) {
    opts = opts || {};
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, opts.thickness || 0.22, 56),
      P.material(THREE, color, { roughness: 0.48, metalness: 0.08 })
    );
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.03, opts.rim || 0.035, 10, 56),
      P.material(THREE, opts.rimColor || color, { roughness: 0.36 })
    );
    group.add(rim);

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, (opts.thickness || 0.22) + 0.08, 24),
      P.material(THREE, 0x334155, { roughness: 0.4 })
    );
    hub.rotation.x = Math.PI / 2;
    group.add(hub);

    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.055, 0.05),
      P.material(THREE, opts.markerColor || 0xffffff, { roughness: 0.35 })
    );
    marker.position.x = 0.46;
    marker.position.z = 0.16;
    group.add(marker);

    if (opts.teeth) {
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const tooth = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.09, 0.12),
          P.material(THREE, color, { roughness: 0.5 })
        );
        tooth.position.set(1.08 * Math.cos(a), 1.08 * Math.sin(a), 0);
        tooth.rotation.z = a;
        group.add(tooth);
      }
    }

    return group;
  }

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, gear1, gear2, pulley1, pulley2, beltTop, beltBottom, axis1, axis2, axis3, axis4, gearLabelTarget, beltLabelTarget;
    let gearArrow1, gearArrow2, pulleyArrow1, pulleyArrow2, beltDots = [], tick = 0;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Truyền động bánh răng và đai 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        if (root.Sim3VisualKit) root.Sim3VisualKit.setCamera(camera, { x: 5.05, y: 3.8, z: 7.25 }, { x: 0.04, y: 0.42, z: 0.08 });
        gear1 = makeWheel(THREE, P, 0x159c3a, { teeth: true, markerColor: 0xb7f7c8 });
        gear2 = makeWheel(THREE, P, 0x1565c0, { teeth: true, markerColor: 0xbfdbfe });
        pulley1 = makeWheel(THREE, P, 0x159c3a, { rim: 0.055, markerColor: 0xb7f7c8, thickness: 0.18 });
        pulley2 = makeWheel(THREE, P, 0x1565c0, { rim: 0.055, markerColor: 0xbfdbfe, thickness: 0.18 });
        scene.add(gear1, gear2, pulley1, pulley2);

        beltTop = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.055, 0x7c3aed);
        beltBottom = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.055, 0x7c3aed);
        axis1 = P.cylinderBetween(THREE, { x: 0, y: -0.9, z: 0 }, { x: 0, y: 0.9, z: 0 }, 0.02, 0x64748b);
        axis2 = P.cylinderBetween(THREE, { x: 0, y: -0.9, z: 0 }, { x: 0, y: 0.9, z: 0 }, 0.02, 0x64748b);
        axis3 = P.cylinderBetween(THREE, { x: 0, y: -0.9, z: 0 }, { x: 0, y: 0.9, z: 0 }, 0.02, 0x64748b);
        axis4 = P.cylinderBetween(THREE, { x: 0, y: -0.9, z: 0 }, { x: 0, y: 0.9, z: 0 }, 0.02, 0x64748b);
        [axis1, axis2, axis3, axis4].forEach(axis => {
          axis.material.transparent = true;
          axis.material.opacity = 0.32;
        });
        gearArrow1 = P.arrow(THREE, 0x159c3a, { radius: 0.028, headRadius: 0.1 });
        gearArrow2 = P.arrow(THREE, 0x1565c0, { radius: 0.028, headRadius: 0.1 });
        pulleyArrow1 = P.arrow(THREE, 0x159c3a, { radius: 0.028, headRadius: 0.1 });
        pulleyArrow2 = P.arrow(THREE, 0x1565c0, { radius: 0.028, headRadius: 0.1 });
        for (let i = 0; i < 10; i++) {
          beltDots.push(new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 14, 10),
            P.material(THREE, 0xd97706, { roughness: 0.32 })
          ));
        }
        scene.add(
          beltTop, beltBottom, axis1, axis2, axis3, axis4,
          gearArrow1, gearArrow2, pulleyArrow1, pulleyArrow2, ...beltDots
        );
        const grid = new THREE.GridHelper(7.2, 9, 0xdbe3ee, 0xedf2f7);
        grid.material.transparent = true;
        grid.material.opacity = 0.55;
        grid.position.y = -1.35;
        scene.add(grid);
        gearLabelTarget = new THREE.Vector3();
        beltLabelTarget = new THREE.Vector3();
        labels.add('gear-system', 'Bánh răng', () => gearLabelTarget, { dx: -16, dy: -46 });
        labels.add('belt-system', 'Đai', () => beltLabelTarget, { dx: 42, dy: 14 });
      }
    });
    if (!shell) return null;

    function positionGroup(group, x, y, z, r, phi) {
      group.position.set(x, y, z);
      group.scale.set(r, r, 1);
      group.rotation.z = phi || 0;
    }
    function setAxis(axis, x, y, z, r) {
      P.setCylinderBetween(THREERef, axis, { x, y: y - r - 0.28, z }, { x, y: y + r + 0.28, z });
    }
    function setArrow(arrow, x, y, z, sign) {
      arrow.position.set(x, y, z);
      arrow.scale.y = 0.42;
      P.orientArrow(THREERef, arrow, new THREERef.Vector3(sign < 0 ? 1 : -1, 0, 0));
    }
    function placeBeltDots(a, b, c, d, phase) {
      const loop = [a, b, d, c];
      for (let i = 0; i < beltDots.length; i++) {
        const u = (i / beltDots.length + phase) % 1;
        const edge = Math.floor(u * 4);
        const local = u * 4 - edge;
        const p0 = loop[edge], p1 = loop[(edge + 1) % 4];
        beltDots[i].position.set(
          p0.x + (p1.x - p0.x) * local,
          p0.y + (p1.y - p0.y) * local,
          p0.z + (p1.z - p0.z) * local
        );
      }
    }
    function setState(state) {
      tick += 1;
      const r1 = state.r1 * 0.5, r2 = state.r2 * 0.5;
      const gearY = 1.12, pulleyY = -0.22, gz = -1.22, pz = 1.28, gx1 = -1.48, px1 = -1.62, px2 = 1.82;
      const gx2 = gx1 + r1 + r2 + 0.08;
      positionGroup(gear1, gx1, gearY, gz, r1, state.gearPhi1);
      positionGroup(gear2, gx2, gearY, gz, r2, state.gearPhi2);
      positionGroup(pulley1, px1, pulleyY, pz, r1, state.gearPhi1);
      positionGroup(pulley2, px2, pulleyY, pz, r2, state.beltPhi2);
      gearLabelTarget.set((gx1 + gx2) / 2, gearY + Math.max(r1, r2) + 0.48, gz + 0.08);
      setAxis(axis1, gx1, gearY, gz, r1);
      setAxis(axis2, gx2, gearY, gz, r2);
      setAxis(axis3, px1, pulleyY, pz, r1);
      setAxis(axis4, px2, pulleyY, pz, r2);
      setArrow(gearArrow1, gx1, gearY + r1 + 0.35, gz + 0.22, 1);
      setArrow(gearArrow2, gx2, gearY + r2 + 0.35, gz + 0.22, -1);
      setArrow(pulleyArrow1, px1, pulleyY + r1 + 0.35, pz + 0.22, 1);
      setArrow(pulleyArrow2, px2, pulleyY + r2 + 0.35, pz + 0.22, 1);
      const topA = { x: px1, y: pulleyY + r1, z: pz + 0.02 };
      const topB = { x: px2, y: pulleyY + r2, z: pz + 0.02 };
      const bottomA = { x: px1, y: pulleyY - r1, z: pz + 0.02 };
      const bottomB = { x: px2, y: pulleyY - r2, z: pz + 0.02 };
      beltLabelTarget.set((topA.x + topB.x) / 2, (topA.y + topB.y) / 2 + 0.08, topA.z);
      P.setCylinderBetween(THREERef, beltTop, topA, topB);
      P.setCylinderBetween(THREERef, beltBottom, bottomA, bottomB);
      placeBeltDots(topA, topB, bottomA, bottomB, ((state.gearPhi1 || 0) / (Math.PI * 2)) % 1);
      shell.setState(state);
      const primaryPoints = [
        new THREERef.Vector3(gx1 - r1, gearY - r1, gz),
        new THREERef.Vector3(gx1 + r1, gearY + r1, gz),
        new THREERef.Vector3(gx2 - r2, gearY - r2, gz),
        new THREERef.Vector3(gx2 + r2, gearY + r2, gz),
        new THREERef.Vector3(px1 - r1, pulleyY - r1, pz),
        new THREERef.Vector3(px1 + r1, pulleyY + r1, pz),
        new THREERef.Vector3(px2 - r2, pulleyY - r2, pz),
        new THREERef.Vector3(px2 + r2, pulleyY + r2, pz),
        topA, topB, bottomA, bottomB
      ];
      const projectedMarginPx = shell.projectMargin(primaryPoints);
      const sceneBounds = shell.projectBounds(primaryPoints);
      const gearBeltSeparationPx = shell.projectDistance(gearLabelTarget, beltLabelTarget);
      const beltLabelPulleyFaceDistancePx = Math.min(
        shell.projectDistance(beltLabelTarget, new THREERef.Vector3(px1, pulleyY, pz)),
        shell.projectDistance(beltLabelTarget, new THREERef.Vector3(px2, pulleyY, pz))
      );
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-3-2'] = Object.assign({
        updatedAt: tick,
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({
          hierarchy: 'belt-gears-primary-supports-muted',
          supportOpacity: 0.32,
          secondaryArrowScale: 0.42,
          cropMarginTargetPx: 24,
          minSafeMarginPx: projectedMarginPx,
          projectedMarginPx,
          labelOverlapTarget: 0,
          labelFaceCoverageMax: 0.04,
          beltLabelSemanticTarget: 'belt-span',
          beltLabelAnchorRole: 'top-belt-span-midpoint',
          beltLabelSpanCoverage: 0.72,
          beltLabelPulleyFaceDistancePx,
          clutterReduced: true,
          beltNodeScale: 'reduced',
          cameraFit: 'wide-safe-crop',
          gearBeltSeparation: 'front-back-separated',
          physicalMeaningCue: 'gear-contact-belt-transfer',
          primarySceneFillRatio: sceneBounds ? sceneBounds.fillRatio : 0,
          visibleLabelCount: shell.labels.countVisible(),
          primaryObjectDominanceRatio: gearBeltSeparationPx / 60,
          gearBeltSeparationPx,
          hierarchy2: 'gears-and-belt-separated-primary'
        })
      }, state);
    }

    return { host: opts.host, setState, dispose: shell.dispose };
  }

  root.Sim3Ch232 = { create };
})(typeof window !== 'undefined' ? window : this);
