/**
 * ch1-3-6 — Phản lực & mô men ngàm (cantilever, tải đổi vị trí).
 * Slider a + P, kéo tải dọc dầm → phản lực R = P, mô men ngàm M = P·a cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, P = root.SimPhysicsStatics, Pal = root.Sim2Palette;

  Reg.register('ch1-3-6', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1.2, minY: -1.2, maxX: 8.7, maxY: 3.6 }, reservePanel: true,
      meta: { name: 'Phản lực & mô men ngàm', section: '3.6', chapter: 1 }
    });
    const { svg, tf, overlay, render } = shell;
    const L = 8, VIS = 0.018;
    const wall = { x: 0, y: 0 };
    const state = { load: 80, pos: 5 };

    svg.appendChild(render.line(tf, { x: 0, y: -1.5 }, { x: 0, y: 1.5 }, { stroke: Pal.axis, width: 5 }));
    svg.appendChild(render.line(tf, wall, { x: L, y: 0 }, { stroke: Pal.axis, width: 5 }));
    for (let i = -1.2; i <= 1.2; i += 0.4) {
      svg.appendChild(render.line(tf, { x: -0.4, y: i + 0.2 }, { x: 0, y: i }, { stroke: Pal.grid, width: 1 }));
    }

    const loadArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.force, width: 3 });
    svg.appendChild(loadArrow);
    const rArrow = render.arrow(tf, svg, wall, wall, { stroke: Pal.reaction, width: 3 }); svg.appendChild(rArrow);

    // Cung mũi tên chỉ CHIỀU mô men ngàm quanh ngàm. Chiều từ tích có hướng
    // M_ngàm = −M_tải; quy ước CCW dương (tải xuống ở x>0 tạo M_tải<0).
    const momentArc = render.el('path', {
      class: 'sim2-moment-arc', fill: 'none', stroke: Pal.moment, 'stroke-width': 2.5
    });
    momentArc.setAttribute('marker-end', `url(#${svg.__markerId})`);
    svg.appendChild(momentArc);
    function arcD(c, r, ccw) {
      const a0 = -Math.PI / 4;
      const a1 = a0 + (ccw ? -1 : 1) * 1.5 * Math.PI;
      const x0 = c.x + r * Math.cos(a0), y0 = c.y + r * Math.sin(a0);
      const x1 = c.x + r * Math.cos(a1), y1 = c.y + r * Math.sin(a1);
      return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 1 ${ccw ? 0 : 1} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
    }

    const lblP = overlay.label('P', { x: state.pos, y: 1 }, { anchor: 'bottom', color: Pal.force });
    const lblR = overlay.label('R', { x: 0, y: 0 }, { anchor: 'right', color: Pal.reaction });
    const lblM = overlay.label('M', { x: 0.2, y: -0.8 }, { color: Pal.moment });

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      const R = state.load;
      const loadMoment = P.momentFromVectors(state.pos, 0, 0, -state.load);
      const M = -loadMoment;
      set(loadArrow, { x: state.pos, y: state.load * VIS }, { x: state.pos, y: 0 });
      set(rArrow, wall, { x: 0, y: R * VIS });
      overlay.moveLabel(lblP, { x: state.pos, y: state.load * VIS + 0.3 });
      overlay.moveLabel(lblR, { x: -0.3, y: R * VIS });
      handle.move({ x: state.pos, y: 0 });
      // Phản lực mô men tác dụng lên dầm đối dấu với mô men của tải.
      const ccw = M > 0;
      const r = 14 + Math.min(M, 1200) / 1200 * 20;
      const wc = tf.toScreen(wall);
      momentArc.setAttribute('d', arcD(wc, r, ccw));
      momentArc.setAttribute('data-dir', ccw ? 'ccw' : 'cw');
      panel.setReadout([
        { key: 'P', label: 'P:', value: state.load + ' N' },
        { key: 'a', label: 'a:', value: state.pos.toFixed(2) + ' m' },
        { key: 'R', label: 'R:', value: R.toFixed(1) + ' N' },
        { key: 'M', label: 'M ngàm:', value: (M >= 0 ? '+' : '') + M.toFixed(1) + ' N·m' },
        { key: 'loadMoment', label: 'M tải:', value: loadMoment.toFixed(1) + ' N·m' },
        { key: 'sumM', label: 'M ngàm + M tải:', value: (M + loadMoment).toFixed(6) + ' N·m' },
        { key: 'sumFy', label: 'ΣFᵧ = R − P:', value: (R-state.load).toFixed(6) + ' N' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#b10dc9}{R} = \\textcolor{#e03030}{P}', '\\textcolor{#7c3aed}{M} = \\textcolor{#e03030}{P} \\cdot a'],
      legend: [{ color: Pal.force, label: 'P (tải)' }, { color: Pal.reaction, label: 'R ngàm' }, { color: Pal.moment, label: 'M ngàm' }],
      observe: 'Dầm nhẹ, tải đứng. Phản lực R = P; mômen ngàm ngược chiều mômen tải (CCW dương). Cung chỉ chiều mômen, không phải biến dạng hay góc quay dầm; bán kính cung minh họa, không có thang vật lý.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'P', label: 'P', min: 20, max: 150, step: 10, value: state.load, unit: 'N',
          onInput: v => { state.load = Math.round(v/10)*10; controls.setValue('P', state.load); render2(); } },
        { id: 'a', label: 'a', min: 0.5, max: L, step: 0.5, value: state.pos, unit: 'm',
          onInput: v => { state.pos = Math.round(v*2)/2; controls.setValue('a', state.pos); render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: state.pos, y: 0 }, {
      fill: Pal.handle,
      a11y: { label: 'Vị trí tải a từ ngàm', axis: 'x', min: 0.5, max: L, valueText: wp => `a ${wp.x.toFixed(1)} m từ ngàm` },
      bounds: { minX: 0.5, maxX: L, minY: 0, maxY: 0 },
      keyboardStep: { x: 0.5, y: 0 },
      onDrag(wp) {
        state.pos = Math.round(Math.min(L, Math.max(0.5, wp.x)) * 2) / 2;
        controls.setValue('a', state.pos.toFixed(1));
        render2();
      }
    });
    shell.addAction({ id: 'reset', label: 'Đặt lại', onClick() { state.load = 80; state.pos = 5; controls.setValue('P', 80); controls.setValue('a', 5); render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
