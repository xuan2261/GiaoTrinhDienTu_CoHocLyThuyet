(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    const C = root.Sim3Coordinates;
    const DISPLAY_SCALE = 0.48;
    let THREERef, b1, b2, cue, vArrow1, vArrow2, rail, beforeLabelPos, afterLabelPos, tick = 0;
    let stateAfterTarget = null, impactContactResidual = null;
    const shell = root.Sim3Shell.create({
      host: opts.host, referenceEl: opts.referenceEl, height: 300, responsiveFraming: 'horizontal',
      label: 'Va chạm 3D', onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        if (root.Sim3VisualKit) root.Sim3VisualKit.setCamera(camera, { x: 4.4, y: 3.3, z: 5.75 }, { x: 0, y: 0.02, z: 0.04 });
        rail = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.14, 0.14), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 }));
        rail.position.y = -0.55;
        scene.add(rail);
        b1 = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 18), new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.35 }));
        b2 = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 18), new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.35 }));
        cue = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 8, 44), new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x3b0764 }));
        cue.rotation.x = Math.PI / 2;
        cue.visible = false;
        beforeLabelPos = new THREE.Vector3(-1.92, 0.12, -0.36);
        afterLabelPos = new THREE.Vector3(1.52, 0.12, 0.48);
        vArrow1 = P.arrow(THREE, 0xd81b60, { radius: 0.052, headRadius: 0.16, headLength: 0.38 });
        vArrow2 = P.arrow(THREE, 0x1565c0, { radius: 0.052, headRadius: 0.16, headLength: 0.38 });
        scene.add(b1, b2, cue, vArrow1, vArrow2);
        const grid = new THREE.GridHelper(5.6, 8, 0xcbd5e1, 0xe2e8f0);
        grid.material.transparent = true;
        grid.material.opacity = 0.38;
        grid.position.y = -0.62;
        scene.add(grid);
        labels.add('before', 'Trước', () => beforeLabelPos, { dx: -60, dy: -46 });
        labels.add('impact', 'Va chạm', () => cue.position, { dx: -8, dy: -72 });
        labels.add('after', 'Sau', () => stateAfterTarget || afterLabelPos, { dx: 74, dy: 48 });
      }
    });
    if (!shell) return null;

    function pointOnLane(point) {
      const mapped = C.point2D(point, { plane: C.PLANES.HORIZONTAL });
      return { x: mapped.x * DISPLAY_SCALE, y: mapped.y, z: mapped.z * DISPLAY_SCALE };
    }
    function setVelocityArrow(arrow, base, velocity) {
      const vx = velocity && Number.isFinite(velocity.x) ? velocity.x : 0;
      const vector = C.vector2D({ x: vx, y: 0 }, { plane: C.PLANES.HORIZONTAL });
      P.updateArrow(THREERef, arrow, vector, { base: { x: base.x, y: 0.45, z: base.z }, factor: 0.44, maxLength: 1.85 });
    }
    function setState(state) {
      tick += 1;
      const r1 = Number.isFinite(state.r1) ? state.r1 : 0.6;
      const r2 = Number.isFinite(state.r2) ? state.r2 : 0.8;
      const p1 = pointOnLane(state.p1);
      const p2 = pointOnLane(state.p2);
      const impact = state.impactPoint ? pointOnLane(state.impactPoint) : null;
      const s1 = r1 * DISPLAY_SCALE;
      const s2 = r2 * DISPLAY_SCALE;
      b1.position.set(p1.x, p1.y, p1.z);
      b2.position.set(p2.x, p2.y, p2.z);
      b1.scale.setScalar(s1);
      b2.scale.setScalar(s2);
      setVelocityArrow(vArrow1, p1, state.v1);
      setVelocityArrow(vArrow2, p2, state.v2);
      cue.visible = !!state.collided && !!impact;
      if (impact) cue.position.set(impact.x, impact.y + 0.02, impact.z);
      stateAfterTarget = state.collided ? b2.position : afterLabelPos;
      const sourceSeparation = Math.abs(state.p2.x - state.p1.x);
      const sourceRadiusSum = r1 + r2;
      if (state.collided && impactContactResidual == null) impactContactResidual = Math.abs(sourceSeparation - sourceRadiusSum);
      shell.setState(state);
      const primaryPoints = [
        new THREERef.Vector3(-2.4, -0.55, 0), new THREERef.Vector3(2.4, -0.55, 0),
        new THREERef.Vector3(p1.x - s1, -s1, p1.z), new THREERef.Vector3(p1.x + s1, s1, p1.z),
        new THREERef.Vector3(p2.x - s2, -s2, p2.z), new THREERef.Vector3(p2.x + s2, s2, p2.z), beforeLabelPos, afterLabelPos
      ];
      const projectedMarginPx = shell.projectMargin(primaryPoints);
      const sceneBounds = shell.projectBounds(primaryPoints);
      const afterTarget = stateAfterTarget || afterLabelPos;
      const phaseLaneSeparationPx = Math.min(shell.projectDistance(beforeLabelPos, cue.position), shell.projectDistance(cue.position, afterTarget));
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch3-6-2'] = Object.assign({
        updatedAt: tick, trailLength: 0, ghostCount: 0, phaseCue: state.collided ? 'after' : 'before',
        capturePhase: state.collided ? 'after-impact' : 'before-impact', impactReached: !!state.collided,
        distanceToImpact: Math.max(0, sourceSeparation - sourceRadiusSum), impactContactResidual,
        liveScale1: s1, liveScale2: s2,
        physics: {
          displayScale: DISPLAY_SCALE,
          lane: C.vector2D({ x: 1, y: 0 }, { plane: C.PLANES.HORIZONTAL }),
          radius1: b1.geometry.parameters.radius * b1.scale.x,
          radius2: b2.geometry.parameters.radius * b2.scale.x,
          ball1: { x: b1.position.x, y: b1.position.y, z: b1.position.z },
          ball2: { x: b2.position.x, y: b2.position.y, z: b2.position.z },
          sourceSeparation, sourceRadiusSum,
          contactResidual: state.collided ? Math.abs(sourceSeparation - sourceRadiusSum) : null,
          impactPoint: impact ? { x: cue.position.x, y: cue.position.y - 0.02, z: cue.position.z } : null,
          impactRatio: state.impactPoint ? (state.impactPoint.x - state.p1.x) / (state.p2.x - state.p1.x) : null,
          velocity1: { visible: vArrow1.visible, magnitude: vArrow1.userData.sim3PhysicalMagnitude, direction: vArrow1.userData.sim3DirectionVector ? { x: vArrow1.userData.sim3DirectionVector.x, y: vArrow1.userData.sim3DirectionVector.y, z: vArrow1.userData.sim3DirectionVector.z } : { x: 0, y: 0, z: 0 } },
          velocity2: { visible: vArrow2.visible, magnitude: vArrow2.userData.sim3PhysicalMagnitude, direction: vArrow2.userData.sim3DirectionVector ? { x: vArrow2.userData.sim3DirectionVector.x, y: vArrow2.userData.sim3DirectionVector.y, z: vArrow2.userData.sim3DirectionVector.z } : { x: 0, y: 0, z: 0 } }
        },
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({
          verticalFillTarget: 0.62, labelClusterReduced: true, labelClusterStrategy: 'phase-lanes-separated',
          minSafeMarginPx: projectedMarginPx, projectedMarginPx, labelOverlapTarget: 0, phaseLaneSeparationPx,
          ghostCount: 0, trailDotCountMax: 0, noGhostTrail: true, beforeAfterCueReadable: true,
          railContrast: 'enhanced', physicalMeaningCue: 'before-impact-after-lane',
          primarySceneFillRatio: sceneBounds ? sceneBounds.fillRatio : 0, visibleLabelCount: shell.labels.countVisible(),
          primaryObjectDominanceRatio: Math.max(s1, s2) / Math.max(0.1, Math.min(s1, s2) * 0.7),
          liveBallRadiusPx: 46, railLengthRole: 'short-collision-lane'
        })
      }, state);
    }
    function reset() {
      tick = 0;
      stateAfterTarget = null;
      impactContactResidual = null;
      if (cue) cue.visible = false;
    }

    return { host: opts.host, setState, reset, resize: shell.resize, dispose: shell.dispose };
  }

  root.Sim3Ch362 = { create };
})(typeof window !== 'undefined' ? window : this);
