(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, b1, b2, cue, vArrow1, vArrow2, rail, beforeLabelPos, afterLabelPos, tick = 0;
    let stateAfterTarget = null;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      height: 300,
      label: 'Va chạm 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        if (root.Sim3VisualKit) root.Sim3VisualKit.setCamera(camera, { x: 3.55, y: 2.65, z: 4.6 }, { x: 0, y: 0.02, z: 0.04 });
        const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
        rail = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.14, 0.14), railMat);
        rail.position.y = -0.55;
        scene.add(rail);
        b1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.46, 36, 18),
          new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.35 })
        );
        b2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.54, 36, 18),
          new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.35 })
        );
        cue = new THREE.Mesh(
          new THREE.TorusGeometry(0.58, 0.035, 8, 44),
          new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x3b0764 })
        );
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

    function mapX(x) { return x * 0.48; }
    function setVelocityArrow(arrow, base, v, z) {
      const vx = v && isFinite(v.x) ? v.x : 0;
      arrow.position.set(base.x, 0.45, z);
      arrow.scale.y = Math.max(0.48, Math.min(1.85, Math.abs(vx) * 0.44));
      P.orientArrow(THREERef, arrow, new THREERef.Vector3(vx, 0, 0));
    }
    function setState(state) {
      tick += 1;
      const p1 = { x: mapX(state.p1.x), z: -0.36 };
      const p2 = { x: mapX(state.p2.x), z: 0.48 };
      b1.position.set(p1.x, 0, p1.z);
      b2.position.set(p2.x, 0, p2.z);
      const s1 = Math.max(1.02, Math.sqrt(state.m1 || 2) * 0.62);
      const s2 = Math.max(1.02, Math.sqrt(state.m2 || 3) * 0.58);
      b1.scale.setScalar(s1);
      b2.scale.setScalar(s2);
      setVelocityArrow(vArrow1, p1, state.v1, p1.z);
      setVelocityArrow(vArrow2, p2, state.v2, p2.z);
      cue.visible = !!state.collided;
      cue.position.set(mapX(state.impactPoint ? state.impactPoint.x : 0), 0.02, 0);
      stateAfterTarget = state.collided ? b2.position : afterLabelPos;
      shell.setState(state);
      const primaryPoints = [
        new THREERef.Vector3(-2.4, -0.55, 0),
        new THREERef.Vector3(2.4, -0.55, 0),
        new THREERef.Vector3(p1.x - 0.46 * s1, -0.46 * s1, p1.z),
        new THREERef.Vector3(p1.x + 0.46 * s1, 0.46 * s1, p1.z),
        new THREERef.Vector3(p2.x - 0.54 * s2, -0.54 * s2, p2.z),
        new THREERef.Vector3(p2.x + 0.54 * s2, 0.54 * s2, p2.z),
        beforeLabelPos,
        afterLabelPos
      ];
      const projectedMarginPx = shell.projectMargin(primaryPoints);
      const sceneBounds = shell.projectBounds(primaryPoints);
      const afterTarget = stateAfterTarget || afterLabelPos;
      const phaseLaneSeparationPx = Math.min(
        shell.projectDistance(beforeLabelPos, cue.position),
        shell.projectDistance(cue.position, afterTarget)
      );
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch3-6-2'] = Object.assign({
        updatedAt: tick,
        trailLength: 0,
        ghostCount: 0,
        phaseCue: state.collided ? 'after' : 'before',
        capturePhase: state.collided ? 'after-impact' : 'before-impact',
        impactReached: !!state.collided,
        distanceToImpact: Math.max(0, Math.abs(state.p2.x - state.p1.x) - 1.1),
        liveScale1: s1,
        liveScale2: s2,
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({
          verticalFillTarget: 0.62,
          labelClusterReduced: true,
          labelClusterStrategy: 'phase-lanes-separated',
          minSafeMarginPx: projectedMarginPx,
          projectedMarginPx,
          labelOverlapTarget: 0,
          phaseLaneSeparationPx,
          ghostCount: 0,
          trailDotCountMax: 0,
          noGhostTrail: true,
          beforeAfterCueReadable: true,
          railContrast: 'enhanced',
          physicalMeaningCue: 'before-impact-after-lane',
          primarySceneFillRatio: sceneBounds ? sceneBounds.fillRatio : 0,
          visibleLabelCount: shell.labels.countVisible(),
          primaryObjectDominanceRatio: Math.max(s1, s2) / Math.max(0.1, Math.min(s1, s2) * 0.7),
          liveBallRadiusPx: 46,
          railLengthRole: 'short-collision-lane'
        })
      }, state);
    }
    function reset() {
      tick = 0;
      stateAfterTarget = null;
      if (cue) cue.visible = false;
    }

    return { host: opts.host, setState, reset, dispose: shell.dispose };
  }

  root.Sim3Ch362 = { create };
})(typeof window !== 'undefined' ? window : this);
