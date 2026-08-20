(function(root) {
  'use strict';

  function setArrow(THREE, arrow, base, dir, scale) {
    const v = new THREE.Vector3(dir.x || 0, dir.y || 0, dir.z || 0);
    const len = Math.max(0.05, v.length() * (scale || 1));
    arrow.position.set(base.x || 0, base.y || 0, base.z || 0);
    root.Sim3Primitives.orientArrow(THREE, arrow, v);
    arrow.scale.y = len;
  }

  function create(opts) {
    let THREERef, plane, block, cone, betaArrow, normalArrow, contactShadow, stateBand, slipArrow, tick = 0;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Nón ma sát 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        root.Sim3VisualKit.setCamera(camera, { x: 3.8, y: 3.0, z: 5.6 }, { x: 0.35, y: 0.35, z: 0 });
        scene.add(root.Sim3VisualKit.shadowPlane(THREE, 7));

        plane = new THREE.Mesh(
          new THREE.BoxGeometry(5.0, 0.22, 2.55),
          root.Sim3VisualKit.material(THREE, 0xdbeafe, { transparent: true, opacity: 0.72, roughness: 0.78 })
        );
        plane.position.set(0, 0.08, 0);
        scene.add(plane);

        block = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.58, 0.78),
          root.Sim3VisualKit.roleMaterial(THREE, 'a', 'primarySurface')
        );
        scene.add(block);

        contactShadow = new THREE.Mesh(
          new THREE.CircleGeometry(0.58, 36),
          root.Sim3VisualKit.material(THREE, 0x334155, { transparent: true, opacity: 0.36, roughness: 0.9 })
        );
        contactShadow.rotation.x = -Math.PI / 2;
        scene.add(contactShadow);

        stateBand = new THREE.Mesh(
          new THREE.RingGeometry(0.48, 0.7, 48),
          root.Sim3VisualKit.material(THREE, 0x159c3a, { transparent: true, opacity: 0.24, roughness: 0.8 })
        );
        stateBand.rotation.x = -Math.PI / 2;
        scene.add(stateBand);

        cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.62, 1.15, 48, 1, true),
          root.Sim3VisualKit.material(THREE, 'moment', { transparent: true, opacity: 0.22, roughness: 0.65 })
        );
        cone.rotation.x = Math.PI;
        scene.add(cone);

        betaArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.moment, { radius: 0.025, headRadius: 0.08 });
        normalArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.03, headRadius: 0.09 });
        slipArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.035, headRadius: 0.12, headLength: 0.32 });
        scene.add(betaArrow, normalArrow, slipArrow);

        labels.add('beta', 'β', () => betaArrow.position, root.Sim3VisualKit.labelOffset('guide', { dx: 20, dy: -8 }));
        labels.add('phi', 'φ', () => cone.position, root.Sim3VisualKit.labelOffset('axis', { dx: -46, dy: 24 }));
        labels.add('cone', 'Nón ma sát', () => new THREE.Vector3(block.position.x, block.position.y + 0.95, block.position.z), root.Sim3VisualKit.labelOffset('phase', { dx: 34, dy: -26 }));
      }
    });
    if (!shell) return null;

    function setState(state) {
      tick += 1;
      const beta = (state.betaDeg || 0) * Math.PI / 180;
      const phiDeg = state.phiDeg == null ? Math.atan(state.mu || 0) * 180 / Math.PI : state.phiDeg;
      plane.rotation.z = -beta;
      block.position.set(0.35 * Math.cos(beta), 0.55 + 0.35 * Math.sin(beta), 0);
      block.rotation.z = -beta;
      cone.position.set(block.position.x, block.position.y + 0.72, block.position.z);
      cone.scale.setScalar(Math.max(0.55, Math.min(1.3, 0.65 + (state.mu || 0.4) * 0.45)));
      contactShadow.position.set(block.position.x, block.position.y - 0.31, block.position.z);
      contactShadow.rotation.z = -beta;
      stateBand.position.set(block.position.x, block.position.y - 0.29, block.position.z);
      stateBand.rotation.z = -beta;
      stateBand.material.color.set(state.slips ? 0xd81b60 : 0x159c3a);
      stateBand.material.opacity = state.slips ? 0.3 : 0.24;
      setArrow(THREERef, betaArrow, { x: -2.1, y: 0.16, z: -1.35 }, { x: Math.cos(beta), y: Math.sin(beta), z: 0 }, 0.95);
      setArrow(THREERef, normalArrow, { x: block.position.x, y: block.position.y, z: 0.48 }, { x: -Math.sin(beta), y: Math.cos(beta), z: 0 }, 0.8);
      setArrow(THREERef, slipArrow, { x: block.position.x + 0.15, y: block.position.y + 0.05, z: -0.45 }, { x: Math.cos(beta), y: -Math.sin(beta), z: 0 }, state.slips ? 0.78 : 0.42);
      slipArrow.visible = !!state.slips;
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch1-5-3'] = Object.assign({}, state, {
        updatedAt: tick,
        phiDeg,
        slips: !!state.slips,
        visualMetrics: root.Sim3VisualKit.visualMetrics({
          coneRole: 'primary-spatial-concept',
          blockRole: 'slip-state-carrier',
          contactShadowOpacityMin: 0.32,
          blockGrounding: 'contact-shadow-on-incline',
          inclineThicknessMin: 0.22,
          equilibriumCue: 'inside-friction-cone-band',
          slipCue: 'downslope-arrow-and-block-state',
          coneOpacityMax: 0.28
        })
      });
    }

    return { host: opts.host, setState, dispose: shell.dispose };
  }

  root.Sim3Ch153 = { create };
})(typeof window !== 'undefined' ? window : this);
