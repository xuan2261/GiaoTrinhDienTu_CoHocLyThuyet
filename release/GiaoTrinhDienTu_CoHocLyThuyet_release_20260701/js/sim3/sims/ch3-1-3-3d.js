(function(root) {
  'use strict';

  function setArrow(THREE, arrow, base, dir, scale) {
    const v = new THREE.Vector3(dir.x || 0, dir.y || 0, dir.z || 0);
    arrow.position.set(base.x || 0, base.y || 0, base.z || 0);
    root.Sim3Primitives.orientArrow(THREE, arrow, v);
    arrow.scale.y = Math.max(0.08, v.length() * (scale || 1));
  }

  function create(opts) {
    let THREERef, car, cord, bob, aArrow, fArrow, thetaGuide, thetaArc, tick = 0;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Hệ quy chiếu phi quán tính 3D',
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
      const theta = state.theta == null ? Math.atan2(state.aFrame || 0, 9.81) : state.theta;
      const pivot = new THREERef.Vector3(0, 1.95, 0);
      const bobPos = new THREERef.Vector3(-1.28 * Math.sin(theta), 0.62, 0);
      bob.position.copy(bobPos);
      root.Sim3Primitives.setCylinderBetween(THREERef, cord, pivot, bobPos);
      root.Sim3Primitives.setCylinderBetween(THREERef, thetaGuide, pivot, new THREERef.Vector3(0, 0.72, 0));
      thetaArc.scale.setScalar(Math.max(0.75, Math.min(1.18, 0.85 + theta)));
      thetaArc.rotation.z = -theta;
      setArrow(THREERef, aArrow, { x: -1.55, y: 2.24, z: 0.78 }, { x: Math.max(0.2, state.aFrame || 0), y: 0, z: 0 }, 0.22);
      setArrow(THREERef, fArrow, { x: bobPos.x, y: bobPos.y, z: 0.36 }, { x: -(state.aFrame || 0), y: 0, z: 0 }, 0.24);
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch3-1-3'] = Object.assign({}, state, {
        updatedAt: tick,
        theta,
        thetaDeg: theta * 180 / Math.PI,
        inertiaFx: state.fIner && state.fIner.fx != null ? state.fIner.fx : -(state.aFrame || 0),
        bob: { x: bobPos.x, y: bobPos.y, z: bobPos.z },
        visualMetrics: root.Sim3VisualKit.visualMetrics({
          frameCue: 'transparent-car',
          forceDirection: 'opposes-frame-acceleration',
          carBodyOpacityMin: 0.54,
          carFrameCue: 'transparent-but-legible',
          bobRadiusMin: 0.24,
          bobContrastRole: 'primary-mass',
          inertialForceVectorScaleMin: 0.34,
          thetaCue: 'arc-guide-visible',
          thetaGuideOpacityMin: 0.72,
          vectorSeparationTargetPx: 18
        })
      });
    }

    return { host: opts.host, setState, dispose: shell.dispose };
  }

  root.Sim3Ch313 = { create };
})(typeof window !== 'undefined' ? window : this);
