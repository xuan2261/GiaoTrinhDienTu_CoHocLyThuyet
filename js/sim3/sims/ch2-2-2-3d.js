(function(root) {
  'use strict';

  function makeArrow(THREE, color, opts) {
    opts = opts || {};
    const radius = opts.radius || 0.035;
    const headRadius = opts.headRadius || 0.11;
    const headLength = opts.headLength || 0.28;
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 1, 16),
      new THREE.MeshStandardMaterial({ color })
    );
    const head = new THREE.Mesh(
      new THREE.ConeGeometry(headRadius, headLength, 20),
      new THREE.MeshStandardMaterial({ color })
    );
    shaft.position.y = 0.5; head.position.y = 1 + headLength / 2;
    group.add(shaft, head);
    return group;
  }

  function orientArrow(THREE, arrow, direction) {
    const from = new THREE.Vector3(0, 1, 0);
    arrow.quaternion.setFromUnitVectors(from, direction.normalize());
  }

  function create(opts) {
    let THREERef, disk, marker, omegaArrow, vArrow, rim, orbit, tickGroup, tick = 0;
    const shell = root.Sim3Shell.create({
      host: opts.host,
      referenceEl: opts.referenceEl,
      label: 'Quay quanh trục cố định 3D',
      onFallback: opts.onFallback,
      setup({ THREE, scene, camera }) {
        THREERef = THREE;
        camera.position.set(4.2, 3.4, 6.2);
        camera.lookAt(0, 0.1, 0);
        const mat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.45, metalness: 0.12 });
        disk = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.25, 64), mat);
        disk.rotation.x = Math.PI / 2;
        rim = new THREE.Mesh(
          new THREE.TorusGeometry(1.82, 0.035, 10, 72),
          new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.4 })
        );
        orbit = new THREE.Mesh(
          new THREE.TorusGeometry(1.8, 0.014, 8, 72),
          new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.45, emissive: 0x220014 })
        );
        tickGroup = new THREE.Group();
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const tickMark = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.018, 0.035),
            new THREE.MeshStandardMaterial({ color: i % 4 === 0 ? 0xffffff : 0xc4b5fd })
          );
          tickMark.position.set(1.5 * Math.cos(a), 1.5 * Math.sin(a), 0.16);
          tickMark.rotation.z = a;
          tickGroup.add(tickMark);
        }
        disk.add(rim, orbit, tickGroup);
        scene.add(disk);

        const axisMat = new THREE.LineBasicMaterial({ color: 0x64748b });
        scene.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -2.4, 0), new THREE.Vector3(0, 2.4, 0)]),
          axisMat
        ));

        marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0xd81b60 })
        );
        scene.add(marker);
        omegaArrow = makeArrow(THREE, 0x7c3aed);
        omegaArrow.position.set(-2.3, -0.8, 0);
        scene.add(omegaArrow);
        vArrow = makeArrow(THREE, 0x159c3a, { radius: 0.055, headRadius: 0.16, headLength: 0.36 });
        scene.add(vArrow);

        const grid = new THREE.GridHelper(5, 10, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -1.45;
        scene.add(grid);
      }
    });
    if (!shell) return null;

    function setState(state) {
      tick += 1;
      disk.rotation.z = state.phi || 0;
      const r = 1.8, phi = state.phi || 0;
      marker.position.set(r * Math.cos(phi), 0.16, r * Math.sin(phi));
      omegaArrow.scale.y = Math.max(0.4, Math.min(1.6, Math.abs(state.omega || 0) * 0.6));
      vArrow.position.set(marker.position.x, 0.42, marker.position.z);
      orientArrow(THREERef, vArrow, new THREERef.Vector3(-Math.sin(phi), 0, Math.cos(phi)));
      vArrow.scale.y = Math.max(0.75, Math.min(1.65, Math.abs(state.omega || 0) * 0.65));
      shell.setState(state);
      root.__SIM3_DEBUG__ = root.__SIM3_DEBUG__ || {};
      root.__SIM3_DEBUG__['ch2-2-2'] = Object.assign({ updatedAt: tick }, state);
    }

    return { host: opts.host, setState, dispose: shell.dispose };
  }

  root.Sim3Ch222 = { create };
})(typeof window !== 'undefined' ? window : this);
