/**
 * ch1-5-3 — Nón ma sát trên mặt nghiêng. tanφ = μ; trượt khi β > φ.
 * Slider β + μ, kéo góc nghiêng → trạng thái cân bằng/trượt + góc nón ma sát cập nhật.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, Pal = root.Sim2Palette;

  Reg.register('ch1-5-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 7, maxY: 5 }, reservePanel: true
    });
    const { svg, tf, overlay, render } = shell;
    const base = { x: 0, y: 0 };
    const len = 6;
    const state = { betaDeg: 18, mu: 0.45 };

    function inclineTop(b) {
      const r = b * Math.PI / 180;
      return { x: base.x + len * Math.cos(r), y: base.y + len * Math.sin(r) };
    }

    const ground = render.line(tf, base, { x: len, y: 0 }, { stroke: Pal.axis, width: 1 }); svg.appendChild(ground);
    const incline = render.line(tf, base, base, { stroke: Pal.axis, width: 3 }); svg.appendChild(incline);
    const blockPoly = render.poly(tf, [], { closed: true, fill: 'rgba(0,116,217,0.35)', stroke: Pal.a });
    svg.appendChild(blockPoly);

    const lblBeta = overlay.label('β', { x: 1.2, y: 0.15 }, { color: Pal.moment });
    const lblState = overlay.label('', { x: 3, y: 3.5 }, { color: Pal.force });

    function render2() {
      const top = inclineTop(state.betaDeg);
      const it = tf.toScreen(top), ib = tf.toScreen(base);
      incline.setAttribute('x1', ib.x); incline.setAttribute('y1', ib.y);
      incline.setAttribute('x2', it.x); incline.setAttribute('y2', it.y);
      const r = state.betaDeg * Math.PI / 180;
      const mid = { x: base.x + (len * 0.5) * Math.cos(r), y: base.y + (len * 0.5) * Math.sin(r) };
      const nx = -Math.sin(r), ny = Math.cos(r);
      const sz = 0.5;
      const corners = [
        { x: mid.x - sz * Math.cos(r), y: mid.y - sz * Math.sin(r) },
        { x: mid.x + sz * Math.cos(r), y: mid.y + sz * Math.sin(r) },
        { x: mid.x + sz * Math.cos(r) + sz * nx, y: mid.y + sz * Math.sin(r) + sz * ny },
        { x: mid.x - sz * Math.cos(r) + sz * nx, y: mid.y - sz * Math.sin(r) + sz * ny }
      ];
      blockPoly.setAttribute('points', corners.map(p => {
        const s = tf.toScreen(p); return `${s.x},${s.y}`;
      }).join(' '));
      overlay.moveLabel(lblBeta, { x: 1.2, y: 0.15 });
      const phiDeg = Math.atan(state.mu) * 180 / Math.PI;
      const slips = state.betaDeg > phiDeg;
      lblState.innerHTML = slips ? 'TRƯỢT' : 'CÂN BẰNG';
      lblState.style.color = slips ? Pal.force : Pal.v;
      overlay.moveLabel(lblState, { x: top.x * 0.6, y: top.y * 0.6 + 0.8 });
      handle.move(inclineTop(state.betaDeg));
      panel.setReadout([
        { label: 'μ:', value: state.mu.toFixed(2) },
        { label: 'φ (nón):', value: phiDeg.toFixed(1) + '°' },
        { label: 'β:', value: state.betaDeg.toFixed(1) + '°' },
        { label: 'Trạng thái:', value: slips ? 'β>φ trượt' : 'β≤φ cân bằng' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\tan\\varphi = \\mu', '\\text{trượt} \\Leftrightarrow \\beta > \\varphi'],
      legend: [{ color: Pal.a, label: 'khối' }, { color: Pal.moment, label: 'β (góc nghiêng)' }],
      observe: 'Vật trượt khi góc nghiêng β vượt góc nón ma sát φ (tanφ = μ). Kéo đỉnh hoặc đổi slider.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'beta', label: 'β', min: 3, max: 60, step: 1, value: state.betaDeg, unit: '°',
          onInput: v => { state.betaDeg = v; render2(); } },
        { id: 'mu', label: 'μ', min: 0.1, max: 1, step: 0.05, value: state.mu, unit: '',
          onInput: v => { state.mu = v; render2(); } }
      ]
    });

    const handle = shell.addHandle(inclineTop(state.betaDeg), {
      fill: Pal.handle,
      onDrag(wp) {
        state.betaDeg = Math.min(60, Math.max(3, Math.atan2(Math.max(0, wp.y), Math.max(0.1, wp.x)) * 180 / Math.PI));
        controls.setValue('beta', state.betaDeg.toFixed(0));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
