(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, b1, b2, cue, vArrow1, vArrow2, rail, ghostBefore1, ghostBefore2, ghostAfter1, ghostAfter2, tick = 0;
    const trail = [];
    const trailDots1 = [], trailDots2 = [];
    let pendingReset = false;
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
        const ghostMat1 = root.Sim3VisualKit ? root.Sim3VisualKit.ghostMaterial(THREE, 'mass1', 0.22) : new THREE.MeshStandardMaterial({ color: 0xd81b60, transparent: true, opacity: 0.22 });
        const ghostMat2 = root.Sim3VisualKit ? root.Sim3VisualKit.ghostMaterial(THREE, 'mass2', 0.22) : new THREE.MeshStandardMaterial({ color: 0x1565c0, transparent: true, opacity: 0.22 });
        ghostBefore1 = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 12), ghostMat1);
        ghostBefore2 = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 12), ghostMat2);
        ghostAfter1 = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 12), ghostMat1.clone());
        ghostAfter2 = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 12), ghostMat2.clone());
        ghostAfter1.visible = ghostAfter2.visible = false;
        vArrow1 = P.arrow(THREE, 0xd81b60, { radius: 0.052, headRadius: 0.16, headLength: 0.38 });
        vArrow2 = P.arrow(THREE, 0x1565c0, { radius: 0.052, headRadius: 0.16, headLength: 0.38 });
        for (let i = 0; i < 8; i++) {
          trailDots1.push(new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.45 })
          ));
          trailDots2.push(new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.45 })
          ));
        }
        scene.add(ghostBefore1, ghostBefore2, ghostAfter1, ghostAfter2, b1, b2, cue, vArrow1, vArrow2, ...trailDots1, ...trailDots2);
        const grid = new THREE.GridHelper(5.6, 8, 0xcbd5e1, 0xe2e8f0);
        grid.material.transparent = true;
        grid.material.opacity = 0.38;
        grid.position.y = -0.62;
        scene.add(grid);
        labels.add('before', 'Trước', () => ghostBefore1.position, { dx: -60, dy: -46 });
        labels.add('impact', 'Va chạm', () => cue.position, { dx: -8, dy: -72 });
        labels.add('after', 'Sau', () => ghostAfter2.visible ? ghostAfter2.position : b2.position, { dx: 74, dy: 48 });
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
    function updateTrailDots(list, dots, z) {
      const start = Math.max(0, list.length - dots.length);
      for (let i = 0; i < dots.length; i++) {
        const item = list[start + i];
        dots[i].visible = !!item;
        if (item) {
          dots[i].scale.setScalar(0.45 + i / dots.length * 0.65);
          dots[i].position.set(mapX(item.x), -0.04, z);
        }
      }
    }
    function setState(state) {
      tick += 1;
      const p1 = { x: mapX(state.p1.x), z: -0.36 };
      const p2 = { x: mapX(state.p2.x), z: 0.48 };
      b1.position.set(p1.x, 0, p1.z);
      b2.position.set(p2.x, 0, p2.z);
      ghostBefore1.position.set(mapX(-4), 0, p1.z);
      ghostBefore2.position.set(mapX(3), 0, p2.z);
      const s1 = Math.max(1.02, Math.sqrt(state.m1 || 2) * 0.62);
      const s2 = Math.max(1.02, Math.sqrt(state.m2 || 3) * 0.58);
      b1.scale.setScalar(s1);
      b2.scale.setScalar(s2);
      ghostBefore1.scale.setScalar(s1);
      ghostBefore2.scale.setScalar(s2);
      ghostAfter1.scale.setScalar(s1);
      ghostAfter2.scale.setScalar(s2);
      setVelocityArrow(vArrow1, p1, state.v1, p1.z);
      setVelocityArrow(vArrow2, p2, state.v2, p2.z);
      cue.visible = !!state.collided;
      cue.position.set(mapX(state.impactPoint ? state.impactPoint.x : 0), 0.02, 0);
      if (!pendingReset) trail.push({ x1: state.p1.x, x2: state.p2.x, collided: !!state.collided });
      pendingReset = false;
      if (trail.length > 80) trail.shift();
      ghostAfter1.visible = ghostAfter2.visible = !!state.collided;
      if (state.collided) {
        ghostAfter1.position.set(p1.x - Math.sign((state.v1 && state.v1.x) || 1) * 0.92, 0, p1.z);
        ghostAfter2.position.set(p2.x - Math.sign((state.v2 && state.v2.x) || 1) * 0.92, 0, p2.z);
      }
      updateTrailDots(trail.map(p => ({ x: p.x1 })), trailDots1, p1.z);
      updateTrailDots(trail.map(p => ({ x: p.x2 })), trailDots2, p2.z);
      shell.setState(state);
      const primaryPoints = [
        new THREERef.Vector3(-2.4, -0.55, 0),
        new THREERef.Vector3(2.4, -0.55, 0),
        new THREERef.Vector3(p1.x - 0.46 * s1, -0.46 * s1, p1.z),
        new THREERef.Vector3(p1.x + 0.46 * s1, 0.46 * s1, p1.z),
        new THREERef.Vector3(p2.x - 0.54 * s2, -0.54 * s2, p2.z),
        new THREERef.Vector3(p2.x + 0.54 * s2, 0.54 * s2, p2.z),
        ghostBefore1.position,
        ghostBefore2.position,
        ghostAfter1.visible ? ghostAfter1.position : null,
        ghostAfter2.visible ? ghostAfter2.position : null
      ];
      const projectedMarginPx = shell.projectMargin(primaryPoints);
      const sceneBounds = shell.projectBounds(primaryPoints);
      const afterTarget = ghostAfter2.visible ? ghostAfter2.position : b2.position;
      const phaseLaneSeparationPx = Math.min(
        shell.projectDistance(ghostBefore1.position, cue.position),
        shell.projectDistance(cue.position, afterTarget)
      );
      const ghostLiveSeparationPx = state.collided ? Math.min(
        shell.projectDistance(ghostAfter1.position, b1.position),
        shell.projectDistance(ghostAfter2.position, b2.position)
      ) : Math.min(
        shell.projectDistance(ghostBefore1.position, b1.position),
        shell.projectDistance(ghostBefore2.position, b2.position)
      );
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch3-6-2'] = Object.assign({
        updatedAt: tick,
        trailLength: trail.length,
        ghostCount: 4,
        phaseCue: state.collided ? 'after' : 'before',
        capturePhase: state.collided ? 'after-impact' : 'before-impact',
        impactReached: !!state.collided,
        distanceToImpact: Math.max(0, Math.abs(state.p2.x - state.p1.x) - 1.1),
        liveScale1: s1,
        liveScale2: s2,
        ghostScale1: ghostBefore1.scale.x,
        ghostScale2: ghostBefore2.scale.x,
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({
          verticalFillTarget: 0.62,
          labelClusterReduced: true,
          labelClusterStrategy: 'phase-lanes-separated',
          minSafeMarginPx: projectedMarginPx,
          projectedMarginPx,
          labelOverlapTarget: 0,
          phaseLaneSeparationPx,
          postImpactGhostOffset: 0.92,
          ghostOpacity: 0.22,
          ghostLiveSeparationPx,
          ghostStateCue: 'ghost-before-after-live-current',
          ghostOpacityBand: 'subtle-readable',
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
      trail.length = 0;
      pendingReset = true;
      if (cue) cue.visible = false;
      if (ghostAfter1) ghostAfter1.visible = false;
      if (ghostAfter2) ghostAfter2.visible = false;
      trailDots1.concat(trailDots2).forEach(dot => { dot.visible = false; });
    }

    return { host: opts.host, setState, reset, dispose: shell.dispose };
  }

  root.Sim3Ch362 = { create };
})(typeof window !== 'undefined' ? window : this);
