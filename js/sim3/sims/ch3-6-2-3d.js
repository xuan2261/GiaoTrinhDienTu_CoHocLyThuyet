(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    let THREERef, b1, b2, cue, vArrow1, vArrow2, rail, tick = 0;
    const trail = [];
    const trailDots1 = [], trailDots2 = [];
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Va chạm 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera }) {
        THREERef = THREE;
        camera.position.set(3.4, 2.6, 4.4);
        camera.lookAt(0, -0.05, 0);
        const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
        rail = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.08, 0.1), railMat);
        rail.position.y = -0.55;
        scene.add(rail);
        b1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.34, 32, 16),
          new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.35 })
        );
        b2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.44, 32, 16),
          new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.35 })
        );
        cue = new THREE.Mesh(
          new THREE.TorusGeometry(0.45, 0.025, 8, 36),
          new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x3b0764 })
        );
        cue.rotation.x = Math.PI / 2;
        cue.visible = false;
        vArrow1 = P.arrow(THREE, 0xd81b60, { radius: 0.035, headRadius: 0.12 });
        vArrow2 = P.arrow(THREE, 0x1565c0, { radius: 0.035, headRadius: 0.12 });
        for (let i = 0; i < 24; i++) {
          trailDots1.push(new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.45 })
          ));
          trailDots2.push(new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.45 })
          ));
        }
        scene.add(b1, b2, cue, vArrow1, vArrow2, ...trailDots1, ...trailDots2);
        const grid = new THREE.GridHelper(8, 12, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -0.62;
        scene.add(grid);
      }
    });
    if (!shell) return null;

    function mapX(x) { return x * 0.58; }
    function setVelocityArrow(arrow, base, v, z) {
      const vx = v && isFinite(v.x) ? v.x : 0;
      arrow.position.set(base.x, 0.45, z);
      arrow.scale.y = Math.max(0.35, Math.min(1.55, Math.abs(vx) * 0.36));
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
      const p1 = { x: mapX(state.p1.x), z: -0.28 };
      const p2 = { x: mapX(state.p2.x), z: 0.28 };
      b1.position.set(p1.x, 0, p1.z);
      b2.position.set(p2.x, 0, p2.z);
      b1.scale.setScalar(Math.max(0.85, Math.sqrt(state.m1 || 2) * 0.55));
      b2.scale.setScalar(Math.max(0.85, Math.sqrt(state.m2 || 3) * 0.5));
      setVelocityArrow(vArrow1, p1, state.v1, p1.z);
      setVelocityArrow(vArrow2, p2, state.v2, p2.z);
      cue.visible = !!state.collided;
      cue.position.set(mapX(state.impactPoint ? state.impactPoint.x : 0), 0.02, 0);
      trail.push({ x1: state.p1.x, x2: state.p2.x, collided: !!state.collided });
      if (trail.length > 80) trail.shift();
      updateTrailDots(trail.map(p => ({ x: p.x1 })), trailDots1, p1.z);
      updateTrailDots(trail.map(p => ({ x: p.x2 })), trailDots2, p2.z);
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch3-6-2'] = Object.assign({ updatedAt: tick, trailLength: trail.length }, state);
    }
    function reset() {
      trail.length = 0;
      if (cue) cue.visible = false;
      trailDots1.concat(trailDots2).forEach(dot => { dot.visible = false; });
    }

    return { host: opts.host, setState, reset, dispose: shell.dispose };
  }

  root.Sim3Ch362 = { create };
})(typeof window !== 'undefined' ? window : this);
