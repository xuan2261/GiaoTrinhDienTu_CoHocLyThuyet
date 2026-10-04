/**
 * ch1-1-4 — Mô men lực & cánh tay đòn. M = F·d·sinθ (computeMoment).
 * Slider F + kéo điểm đặt lực → cánh tay đòn d đổi → M cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-1-4', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -0.9, maxX: 7, maxY: 3.8 }, reservePanel: true,
      meta: { name: 'Mô men lực & cánh tay đòn', section: '1.4', chapter: 1 }
    });
    const { svg, tf, overlay, render } = shell;
    const O = { x: 0, y: 0 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 7, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.circle(tf, O, 6, { pixel: true, fill: Pal.axis, stroke: Pal.axis }));

    const state = { F: 50, app: { x: 4, y: 0 } };
    const Fdir = 90;
    const VIS = 0.03;

    const armLine = render.line(tf, O, state.app, { stroke: Pal.moment, width: 2, class: 'sim2-guide-line sim2-moment-arm' });
    const forceArrow = render.arrow(tf, svg, state.app, state.app, { stroke: Pal.force, width: 3 });
    svg.appendChild(armLine); svg.appendChild(forceArrow);

    // Cung mũi tên chỉ CHIỀU quay mô men quanh O (chuẩn PhET). Chiều lấy từ tích có
    // hướng tau = rx·fy − ry·fx (KHÔNG từ |M| luôn dương). Vẽ inline el('path').
    const momentArc = render.el('path', {
      class: 'sim2-moment-arc', fill: 'none', stroke: Pal.moment, 'stroke-width': 2.5
    });
    momentArc.setAttribute('marker-end', `url(#${svg.__markerId})`);
    svg.appendChild(momentArc);

    // d 270° quanh tâm c (screen), bán kính r px, ccw=true → quét ngược chiều kim đồng hồ
    // trên màn (y-up sau flip). sweep-flag 0 = CCW thị giác, 1 = CW.
    function arcD(c, r, ccw) {
      const a0 = -Math.PI / 4;
      const a1 = a0 + (ccw ? -1 : 1) * 1.5 * Math.PI;
      const x0 = c.x + r * Math.cos(a0), y0 = c.y + r * Math.sin(a0);
      const x1 = c.x + r * Math.cos(a1), y1 = c.y + r * Math.sin(a1);
      return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 1 ${ccw ? 0 : 1} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
    }

    overlay.label('O', O, { anchor: 'right' });
    const lblArm = overlay.label('d', { x: 2, y: -0.5 }, { color: Pal.moment });
    const lblF = overlay.label('F', state.app, { anchor: 'bottom', color: Pal.force });

    function render2() {
      const d = Math.abs(state.app.x);
      const M = P.computeMoment(state.F, d, Fdir);
      const o = tf.toScreen(O), a = tf.toScreen(state.app);
      armLine.setAttribute('x1', o.x); armLine.setAttribute('y1', o.y);
      armLine.setAttribute('x2', a.x); armLine.setAttribute('y2', a.y);
      const tip = tf.toScreen({ x: state.app.x, y: state.app.y + state.F * VIS });
      forceArrow.setAttribute('x1', a.x); forceArrow.setAttribute('y1', a.y);
      forceArrow.setAttribute('x2', tip.x); forceArrow.setAttribute('y2', tip.y);
      overlay.moveLabel(lblArm, { x: state.app.x / 2, y: -0.5 });
      overlay.moveLabel(lblF, { x: state.app.x, y: state.app.y + state.F * VIS + 0.3 });
      handle.move(state.app);
      dInput.setValue(state.app.x);
      // Chiều quay từ tích có hướng: r=(app.x,0), f=(0,+F) (lực hướng lên) → tau=app.x·F.
      const tau = P.momentFromVectors(state.app.x, 0, 0, state.F);
      const ccw = tau > 0;
      const r = 14 + Math.min(M, 650) / 650 * 20;
      momentArc.setAttribute('d', arcD(o, r, ccw));
      momentArc.setAttribute('data-dir', ccw ? 'ccw' : 'cw');
      panel.setReadout([
        { key: 'F', label: 'F:', value: state.F.toFixed(0) + ' N' },
        { key: 'd', label: 'd:', value: d.toFixed(2) + ' m' },
        { key: 'M', label: 'M:', value: '+' + M.toFixed(1) + ' N·m' },
        { key: 'direction', label: 'Chiều M:', value: 'ngược chiều kim đồng hồ (CCW)' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['M = \\textcolor{#e03030}{F} \\cdot \\textcolor{#7c3aed}{d}'],
      legend: [{ color: Pal.force, label: 'F' }, { color: Pal.moment, label: 'd (cánh tay đòn)' }],
      observe: 'd là khoảng cách vuông góc từ O đến giá lực hướng lên trong cấu hình này. CCW dương. Cung chỉ chiều mômen, không biểu thị góc quay hay biến dạng; bán kính cung không có thang vật lý.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'F', label: 'F', min: 10, max: 100, step: 5, value: state.F, unit: 'N',
          onInput: v => { state.F = Math.round(v/5)*5; controls.setValue('F', state.F); render2(); } }
      ]
    });

    const handle = shell.addHandle(state.app, {
      fill: Pal.handle,
      a11y: { label: 'Cánh tay đòn d', axis: 'x', min: 0.5, max: 6.5, valueText: wp => `d ${wp.x.toFixed(1)} m` },
      bounds: { minX: 0.5, maxX: 6.5, minY: 0, maxY: 0 },
      keyboardStep: { x: 0.1, y: 0 },
      onDrag(wp) {
        state.app = { x: Math.round(Math.min(6.5, Math.max(0.5, wp.x)) * 10) / 10, y: 0 };
        render2();
      }
    });
    const dInput = shell.addNumberControl({ id: 'd', label: 'Cánh tay đòn d', min: 0.5, max: 6.5, step: 0.1, value: 4, unit: 'm', onInput(v) { state.app = { x: Math.round(v*10)/10, y: 0 }; render2(); } });
    shell.addAction({ id: 'reset', label: 'Đặt lại', onClick() { state.F = 50; state.app = { x: 4, y: 0 }; controls.setValue('F', 50); render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
