/**
 * ch3-5-3 — Bảo toàn mô men động lượng. L = I·ω giữ nguyên khi không mô men ngoài.
 * Slider r + playback (start paused). Co/giãn bán kính → I đổi → ω đổi sao cho L = const.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-5-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -4, maxX: 4, maxY: 4 }, reservePanel: true,
      meta: { name: 'Bảo toàn mô men động lượng', section: '5.3', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const O = { x: 0, y: 0 }, mPoint = 2;
    const r0 = 3, omega0 = 1;
    const Ltot = D.angularMomentum(D.momentOfInertia(mPoint, r0), omega0) * 2; // L tổng 2 khối
    const state = { r: r0 };
    let phi = 0, referenceRadius = r0;

    svg.appendChild(render.circle(tf, O, 5, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));
    const arm1 = render.line(tf, O, { x: state.r, y: 0 }, { stroke: Pal.moment, width: 3, class: 'sim2-guide-line sim2-angular-momentum-radius' }); svg.appendChild(arm1);
    const arm2 = render.line(tf, O, { x: -state.r, y: 0 }, { stroke: Pal.moment, width: 3, class: 'sim2-guide-line sim2-angular-momentum-radius' }); svg.appendChild(arm2);
    const mass1 = render.circle(tf, { x: state.r, y: 0 }, 7, { pixel: true, gradient: 'force', depth: true, stroke: Pal.force }); svg.appendChild(mass1);
    const mass2 = render.circle(tf, { x: -state.r, y: 0 }, 7, { pixel: true, gradient: 'force', depth: true, stroke: Pal.force }); svg.appendChild(mass2);

    overlay.label('O', O, { anchor: 'right' });

    function curOmega() {
      const I = D.momentOfInertia(mPoint, state.r) * 2;
      return Ltot / I;
    }
    function draw() {
      const I = D.momentOfInertia(mPoint, state.r) * 2;
      const omega = Ltot / I;
      const p1 = { x: state.r * Math.cos(phi), y: state.r * Math.sin(phi) };
      const p2 = { x: -state.r * Math.cos(phi), y: -state.r * Math.sin(phi) };
      const sO = tf.toScreen(O), s1 = tf.toScreen(p1), s2 = tf.toScreen(p2);
      arm1.setAttribute('x1', sO.x); arm1.setAttribute('y1', sO.y);
      arm1.setAttribute('x2', s1.x); arm1.setAttribute('y2', s1.y);
      arm2.setAttribute('x1', sO.x); arm2.setAttribute('y1', sO.y);
      arm2.setAttribute('x2', s2.x); arm2.setAttribute('y2', s2.y);
      mass1.setAttribute('cx', s1.x); mass1.setAttribute('cy', s1.y);
      mass2.setAttribute('cx', s2.x); mass2.setAttribute('cy', s2.y);
      handle.move(p1);
      panel.setReadout([
        { key: 'r', label: 'r:', value: String(state.r) + ' m' },
        { key: 'I', label: 'I:', value: I.toFixed(2) + ' kg·m²' },
        { key: 'omega', label: 'ω:', value: omega.toFixed(2) + ' rad/s' },
        { key: 'L', label: 'L = I·ω:', value: (I * omega).toFixed(2) + ' kg·m²/s (không đổi)' },
        { key: 'energy', label: 'E quay = L²/(2I):', value: (Ltot*Ltot/(2*I)).toFixed(5)+' J' },
        { key: 'work', label: 'Công co/giãn từ r₀=3 m:', value: (Ltot*Ltot/(2*I)-.5*(2*mPoint*r0*r0)*omega0*omega0).toFixed(5)+' J' },
        { key: 'referenceRadius', label: 'r tham chiếu:', value: referenceRadius.toFixed(2)+' m' },
        { key: 'referenceInertia', label: 'I tham chiếu:', value: (2*mPoint*referenceRadius*referenceRadius).toFixed(4)+' kg·m²' },
        { key: 'referenceOmega', label: 'ω tham chiếu:', value: (Ltot/(2*mPoint*referenceRadius*referenceRadius)).toFixed(4)+' rad/s' },
        { key: 'referenceEnergy', label: 'E quay tham chiếu:', value: (Ltot*Ltot/(4*mPoint*referenceRadius*referenceRadius)).toFixed(5)+' J' },
        { key: 'deltaEnergy', label: 'E quay−E tham chiếu:', value: (Ltot*Ltot/(2*I)-Ltot*Ltot/(4*mPoint*referenceRadius*referenceRadius)).toFixed(5)+' J' }
      ]);
      if (sim3) sim3.setState({ r: state.r, phi, omega, inertia: I, angularMomentum: I * omega, rotationalEnergy:Ltot*Ltot/(2*I), workFromInitial:Ltot*Ltot/(2*I)-18, referenceRadius, modelAssumptions:'no-external-torque; prescribed-radius; radial-energy-not-modelled' });
    }
    function update(dt) { phi += curOmega() * dt; }
    function reset() { phi = 0; shell.resetClock(); draw(); }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#7c3aed}{L} = I\\omega = \\text{const}', 'I = \\sum m_i r_i^2'],
      legend: [{ color: Pal.force, label: 'khối m' }, { color: Pal.moment, label: 'cánh tay r' }],
      observe: 'Hai chất điểm, mỗi m=2 kg; không mômen ngoài, L=36 kg·m²/s. Đổi r tức thời giữ góc φ và L, không bảo toàn E quay: công co/giãn bằng ΔE quay giữa hai trạng thái ổn định. Không mô hình hóa chuyển động hay động năng xuyên tâm. Mũi tên L có giới hạn chiều dài; dùng số đọc để đo. Slider/nhập số/ phím cùng đổi bán kính ở góc hiện tại.'
    });
    const sim3 = root.Sim3Mode && root.Sim3Ch353 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch353.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    const controls = shell.addControls({
      actions:[
        {id:'capture-state',label:'Lưu trạng thái tham chiếu',onClick:()=>{referenceRadius=state.r;draw();}},
        {id:'radius-full',label:'r = 3 m',onClick:()=>{state.r=3;controls.setValue('r',3);draw();}},
        {id:'radius-half',label:'r = 1,5 m',onClick:()=>{state.r=1.5;controls.setValue('r',1.5);draw();}}
      ],
      sliders: [
        { id: 'r', label: 'r', min: 0.8, max: 3.5, step: 0.1, value: state.r, unit: 'm',
          onInput: v => { state.r = v; draw(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(), onPause: () => shell.stop(),
        onStep: () => shell.stepOnce(), onReset: () => { shell.stop(); reset(); }
      }
    });

    const handle = shell.addHandle({ x: state.r, y: 0 }, {
      fill: Pal.handle,
      a11y: { label: 'Bán kính quay; L không đổi', axis: 'both', min: 0.8, max: 3.5, step:.1, valueFromPoint: wp => Math.hypot(wp.x, wp.y), pointFromValue:r=>({x:r*Math.cos(phi),y:r*Math.sin(phi)}), valueText:()=>String(state.r)+' m; L = 36 kg·m²/s' },
      keyboardStep: { x: 0.1, y: 0.1 },
      onDrag(wp, phase) {
        // Clicking or replaying the same point must not quantize typed values.
        if (phase === 'start' || phase === 'end' || phase === 'cancel') return;
        const raw = Math.hypot(wp.x, wp.y);
        if (Math.abs(raw-state.r) < 1e-10) return;
        // Pointer movement snaps to the visible slider lattice. Semantic keys
        // add their scalar step to the current value, preserving typed decimals.
        const next = Math.min(3.5, Math.max(0.8, Number((phase === 'keyboard' ? raw : Math.round(raw/0.1)*0.1).toPrecision(14))));
        if (Math.abs(next-state.r) < 1e-12) return;
        state.r = next;
        controls.setValue('r', state.r);
        draw();
      }
    });

    reset();
    shell.onFrame(update, draw);
    shell.stop();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
