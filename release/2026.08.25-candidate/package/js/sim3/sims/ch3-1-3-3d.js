(function(root) {
  'use strict';

  function create(opts) {
    const P = root.Sim3Primitives;
    const C = root.Sim3Coordinates;
    const LENGTH = 1.35;
    const pivot = { x: 0, y: 1.95, z: 0 };
    let THREERef, car, cord, cordAxis, bob, aArrow, fArrow, thetaGuide, thetaArc, tick = 0;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera, labels }) {
        THREERef = THREE;
        root.Sim3VisualKit.setCamera(camera, { x: 3.9, y: 2.8, z: 5.6 }, { x: -0.15, y: 1.42, z: 0 });
        scene.add(root.Sim3VisualKit.shadowPlane(THREE, 7));

        car = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(3.8, 1.6, 1.35),
          root.Sim3VisualKit.roleMaterial(THREE, 'surface', 'secondarySurface', { opacity: 0.54 })
        );
        body.position.y = 1.1;
        const roof = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.08, 1.2),
          root.Sim3VisualKit.material(THREE, 0x102a4d, { transparent: true, opacity: 0.55 })
        );
        roof.position.y = 1.95;
        car.add(body, roof);
        scene.add(car);

        cord = root.Sim3Primitives.cylinderBetween(THREE, { x: 0, y: 1.95, z: 0 }, { x: 0, y: 0.6, z: 0 }, 0.024, root.Sim3VisualKit.colors.axis);
        bob = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 28, 18),
          root.Sim3VisualKit.roleMaterial(THREE, 'force', 'primarySurface')
        );
        scene.add(cord, bob);
        cordAxis = new THREE.Vector3();

        aArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.a, { radius: 0.045, headRadius: 0.14, headLength: 0.36 });
        fArrow = root.Sim3Primitives.arrow(THREE, root.Sim3VisualKit.colors.force, { radius: 0.045, headRadius: 0.14, headLength: 0.36 });
        thetaGuide = root.Sim3Primitives.cylinderBetween(THREE, { x: 0, y: 1.95, z: 0 }, { x: 0, y: 0.75, z: 0 }, 0.018, root.Sim3VisualKit.colors.guide);
        thetaArc = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.014, 8, 48, Math.PI / 2),
          root.Sim3VisualKit.material(THREE, 'guide', { transparent: true, opacity: 0.72, emissive: 0x111827 })
        );
        thetaArc.position.set(0, 1.72, 0.04);
        thetaArc.rotation.x = Math.PI / 2;
        scene.add(aArrow, fArrow, thetaGuide, thetaArc);

        labels.add('a', 'a', () => aArrow.position, root.Sim3VisualKit.labelOffset('vector'));
        labels.add('f', 'F*', () => fArrow.position, root.Sim3VisualKit.labelOffset('vector', { dx: -16, dy: 8 }));
        labels.add('theta', 'θ', () => bob.position, root.Sim3VisualKit.labelOffset('point', { dx: 20, dy: -12 }));
      }
    });
    if (!shell) return null;

    function setState(state) {
      tick += 1;
      const acceleration = Number.isFinite(state.aFrame) ? state.aFrame : 0;
      const mass = Number.isFinite(state.mass) ? state.mass : 1;
      const theta = state.theta == null ? Math.atan2(acceleration, 9.81) : state.theta;
      const offset = C.vector2D({ x: -LENGTH * Math.sin(theta), y: -LENGTH * Math.cos(theta) }, { plane: C.PLANES.VERTICAL });
      const bobPoint = { x: pivot.x + offset.x, y: pivot.y + offset.y, z: pivot.z + offset.z };
      const force = C.vector2D({ x: -mass * acceleration, y: 0 }, { plane: C.PLANES.VERTICAL });
      const frameAcceleration = C.vector2D({ x: acceleration, y: 0 }, { plane: C.PLANES.VERTICAL });
      bob.position.set(bobPoint.x, bobPoint.y, bobPoint.z);
      P.setCylinderBetween(THREERef, cord, pivot, bobPoint);
      P.setCylinderBetween(THREERef, thetaGuide, pivot, { x: pivot.x, y: pivot.y - LENGTH, z: pivot.z });
      thetaArc.scale.setScalar(Math.max(0.75, Math.min(1.18, 0.85 + theta)));
      thetaArc.rotation.z = -theta;
      P.updateArrow(THREERef, aArrow, frameAcceleration, { base: { x: -1.55, y: 2.24, z: 0.78 }, factor: 0.22, maxLength: 1.5 });
      P.updateArrow(THREERef, fArrow, force, { base: { x: bob.position.x, y: bob.position.y, z: 0.36 }, factor: 0.24, maxLength: 1.5 });
      shell.setState(state);
      const cordLength = cord.geometry.parameters.height * cord.scale.y;
      const cordDirection = cordAxis.set(0, 1, 0).applyQuaternion(cord.quaternion);
      const cordStart = { x: cord.position.x - cordDirection.x * cordLength / 2, y: cord.position.y - cordDirection.y * cordLength / 2, z: cord.position.z - cordDirection.z * cordLength / 2 };
      const cordEnd = { x: cord.position.x + cordDirection.x * cordLength / 2, y: cord.position.y + cordDirection.y * cordLength / 2, z: cord.position.z + cordDirection.z * cordLength / 2 };
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch3-1-3'] = Object.assign({}, state, {
        updatedAt: tick,
        theta,
        thetaDeg: theta * 180 / Math.PI,
        inertiaFx: force.x,
        bob: { x: bob.position.x, y: bob.position.y, z: bob.position.z },
        physics: {
          length: cordLength,
          pivot: { x: pivot.x, y: pivot.y, z: pivot.z },
          bob: { x: bob.position.x, y: bob.position.y, z: bob.position.z },
          cord: { length: cordLength, start: cordStart, end: cordEnd, midpoint: { x: cord.position.x, y: cord.position.y, z: cord.position.z } },
          frameAcceleration,
          inertialForce: force,
          forceArrow: { visible: fArrow.visible, magnitude: fArrow.userData.sim3PhysicalMagnitude, displayLength: fArrow.userData.sim3DisplayLength, direction: fArrow.userData.sim3DirectionVector ? { x: fArrow.userData.sim3DirectionVector.x, y: fArrow.userData.sim3DirectionVector.y, z: fArrow.userData.sim3DirectionVector.z } : { x: 0, y: 0, z: 0 } },
          accelerationArrow: { visible: aArrow.visible, magnitude: aArrow.userData.sim3PhysicalMagnitude, direction: aArrow.userData.sim3DirectionVector ? { x: aArrow.userData.sim3DirectionVector.x, y: aArrow.userData.sim3DirectionVector.y, z: aArrow.userData.sim3DirectionVector.z } : { x: 0, y: 0, z: 0 } }
        },
        visualMetrics: root.Sim3VisualKit.visualMetrics({
          frameCue: 'transparent-car', forceDirection: 'opposes-frame-acceleration', carBodyOpacityMin: 0.54,
          carFrameCue: 'transparent-but-legible', bobRadiusMin: 0.24, bobContrastRole: 'primary-mass',
          inertialForceVectorScaleMin: 0.34, thetaCue: 'arc-guide-visible', thetaGuideOpacityMin: 0.72,
          vectorSeparationTargetPx: 18
        })
      });
    }

    return { host: opts.host, setState, resize: shell.resize, dispose: shell.dispose };
  }

  root.Sim3Ch313 = { create };
})(typeof window !== 'undefined' ? window : this);
