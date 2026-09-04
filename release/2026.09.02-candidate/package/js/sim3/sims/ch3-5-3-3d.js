(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    const C = root.Sim3Coordinates;
    const DISPLAY_SCALE = 0.62;
    let THREERef, pivot, mass1, mass2, arm1, arm2, lArrow, orbit, hub, tick = 0;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Mô men động lượng 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        if (root.Sim3VisualKit) root.Sim3VisualKit.setCamera(camera, { x: 4.15, y: 3.1, z: 5.95 }, { x: -0.05, y: 0.15, z: 0 });
        pivot = new THREE.Group();
        mass1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), P.material(THREE, 0xd81b60));
        mass2 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), P.material(THREE, 0xd81b60));
        arm1 = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0.035, 0x7c3aed);
        arm2 = P.cylinderBetween(THREE, { x: 0, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, 0.035, 0x7c3aed);
        hub = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 12), P.material(THREE, 0x334155));
        orbit = new THREE.Mesh(new THREE.TorusGeometry(1, 0.024, 8, 96), P.material(THREE, 0xc4b5fd, { roughness: 0.62, transparent: true, opacity: 0.68 }));
        orbit.rotation.x = Math.PI / 2;
        pivot.add(mass1, mass2, arm1, arm2, hub, orbit);
        scene.add(pivot);
        const axis = P.cylinderBetween(THREE, { x: 0, y: -1.4, z: 0 }, { x: 0, y: 1.6, z: 0 }, 0.018, 0x64748b);
        axis.material.transparent = true;
        axis.material.opacity = 0.46;
        lArrow = P.arrow(THREE, 0x7c3aed, { radius: 0.045, headRadius: 0.14 });
        scene.add(axis, lArrow);
        const grid = new THREE.GridHelper(6, 10, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -0.35;
        scene.add(grid);
        labels.add('mass-1', 'm₁', () => mass1.position, { dx: 22, dy: -12 });
        labels.add('mass-2', 'm₂', () => mass2.position, { dx: -46, dy: -28 });
        labels.add('angular-momentum', 'L', () => lArrow.position, { dx: -34, dy: -20 });
        labels.add('radius', 'r', () => arm1.position, { dx: 24, dy: 34 });
      }
    });
    if (!shell) return null;

    function setState(state) {
      tick += 1;
      const radius = Number.isFinite(state.r) ? state.r : 0;
      const phi = Number.isFinite(state.phi) ? state.phi : 0;
      const omega = Number.isFinite(state.omega) ? state.omega : 0;
      const sourcePosition = { x: radius * Math.cos(phi), y: radius * Math.sin(phi) };
      const sourceVelocity = { x: -radius * omega * Math.sin(phi), y: radius * omega * Math.cos(phi) };
      const mappedPosition = C.point2D(sourcePosition, { plane: C.PLANES.HORIZONTAL });
      const mappedVelocity = C.vector2D(sourceVelocity, { plane: C.PLANES.HORIZONTAL });
      const p1 = { x: mappedPosition.x * DISPLAY_SCALE, y: mappedPosition.y, z: mappedPosition.z * DISPLAY_SCALE };
      const p2 = { x: -p1.x, y: -p1.y, z: -p1.z };
      const velocity = { x: mappedVelocity.x * DISPLAY_SCALE, y: mappedVelocity.y, z: mappedVelocity.z * DISPLAY_SCALE };
      const cross = C.cross(p1, velocity);
      const signedL = Number.isFinite(state.angularMomentum) ? state.angularMomentum : (state.inertia || 0) * omega;
      mass1.position.set(p1.x, p1.y, p1.z);
      mass2.position.set(p2.x, p2.y, p2.z);
      mass1.scale.setScalar(1);
      mass2.scale.setScalar(1);
      orbit.scale.set(radius * DISPLAY_SCALE, radius * DISPLAY_SCALE, radius * DISPLAY_SCALE);
      P.setCylinderBetween(THREERef, arm1, { x: 0, y: 0, z: 0 }, p1);
      P.setCylinderBetween(THREERef, arm2, { x: 0, y: 0, z: 0 }, p2);
      P.updateArrow(THREERef, lArrow, C.axisVector(signedL, C.PLANES.HORIZONTAL), { base: { x: -2.2, y: -0.6, z: 0 }, factor: 0.06, maxLength: 1.8 });
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch3-5-3'] = Object.assign({
        updatedAt: tick,
        mass1: { x: mass1.position.x, y: mass1.position.y, z: mass1.position.z },
        mass2: { x: mass2.position.x, y: mass2.position.y, z: mass2.position.z },
        cueLabels: ['m1', 'm2', 'L', 'r'],
        physics: {
          displayScale: DISPLAY_SCALE,
          radius: Math.hypot(mass1.position.x, mass1.position.z),
          mass1: { x: mass1.position.x, y: mass1.position.y, z: mass1.position.z },
          mass2: { x: mass2.position.x, y: mass2.position.y, z: mass2.position.z },
          velocity,
          rightHandCross: cross,
          inertia: state.inertia,
          omega,
          angularMomentum: signedL,
          angularMomentumArrow: { visible: lArrow.visible, magnitude: lArrow.userData.sim3PhysicalMagnitude, displayLength: lArrow.userData.sim3DisplayLength, direction: lArrow.userData.sim3DirectionVector ? { x: lArrow.userData.sim3DirectionVector.x, y: lArrow.userData.sim3DirectionVector.y, z: lArrow.userData.sim3DirectionVector.z } : { x: 0, y: 0, z: 0 } }
        },
        visualMetrics: root.Sim3VisualKit && root.Sim3VisualKit.visualMetrics({
          radiusCue: 'dimension', orbitRole: 'secondary', orbitOpacity: 0.68, lLabelAttachmentPx: 24, axisRole: 'subdued'
        })
      }, state);
    }

    return { host: opts.host, setState, resize: shell.resize, dispose: shell.dispose };
  }

  root.Sim3Ch353 = { create };
})(typeof window !== 'undefined' ? window : this);
