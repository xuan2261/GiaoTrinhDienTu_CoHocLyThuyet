/**
 * ch1-5-3 — Nón ma sát trên mặt nghiêng. tanφ = μ; trượt khi β > φ.
 * Slider β + μ, kéo góc nghiêng → trạng thái cân bằng/trượt + góc nón ma sát cập nhật.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch1-5-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 7, maxY: 5.8 }, reservePanel: true,
      meta: { name: 'Nón ma sát trên mặt nghiêng', section: '5.3', chapter: 1 }
    });
    const { svg, tf, overlay, render } = shell;
    const base = { x: 0, y: 0 };
    const len = 6;
    const state = { betaDeg: 18, mu: 0.45 };
    let sim3 = null;

    function inclineTop(b) {
      const r = b * Math.PI / 180;
      return { x: base.x + len * Math.cos(r), y: base.y + len * Math.sin(r) };
    }

    const ground = render.line(tf, base, { x: len, y: 0 }, { stroke: Pal.axis, width: 1 }); svg.appendChild(ground);
    const incline = render.line(tf, base, base, { stroke: Pal.axis, width: 3 }); svg.appendChild(incline);
    // Nón ma sát = miền ±φ quanh PHÁP TUYẾN mặt nghiêng (không phải 1 tia). Fill mờ + 2 cạnh.
    // Vẽ trước khối (z-order dưới) để không che khối. rgba cho phép (coverage guard).
    const coneFill = render.el('path', { class: 'sim2-guide-line sim2-friction-cone', fill: 'rgba(124,58,237,0.13)', stroke: 'none' });
    svg.appendChild(coneFill);
    const coneEdge1 = render.el('line', { class: 'sim2-friction-cone-edge', stroke: Pal.moment, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });
    const coneEdge2 = render.el('line', { class: 'sim2-friction-cone-edge', stroke: Pal.moment, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });
    svg.appendChild(coneEdge1); svg.appendChild(coneEdge2);
    const blockPoly = render.poly(tf, [], { closed: true, gradient: 'a', depth: true, stroke: Pal.a });
    svg.appendChild(blockPoly);
    // Vector phản lực R thẳng đứng (chống trọng lực). Trong nón ⟺ β≤φ. Trên khối → vẽ sau.
    const reactionLine = render.arrow(tf, svg, base, base, { stroke: Pal.v, width: 3, class: 'sim2-reaction-line' });
    svg.appendChild(reactionLine);

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
      const slip = D.slipCondition(state.betaDeg, state.mu);
      const phiDeg = slip.phi;
      const slips = slip.slips;
      // Pháp tuyến mặt nghiêng (góc β): hướng (−sinβ, cosβ) ⇒ góc từ +x = 90+β.
      // Nón = miền ±φ quanh pháp tuyến. R thẳng đứng (0,+1) lệch pháp tuyến đúng góc β.
      const DEG = Math.PI / 180;
      const normalDeg = 90 + state.betaDeg;
      const cl = 2.2; // chiều dài cạnh nón (world)
      const tip = a => ({ x: mid.x + cl * Math.cos(a * DEG), y: mid.y + cl * Math.sin(a * DEG) });
      const e1 = tip(normalDeg - phiDeg), e2 = tip(normalDeg + phiDeg);
      const pm = tf.toScreen(mid), pe1 = tf.toScreen(e1), pe2 = tf.toScreen(e2);
      const setLn = (ln, p) => { ln.setAttribute('x1', pm.x); ln.setAttribute('y1', pm.y); ln.setAttribute('x2', p.x); ln.setAttribute('y2', p.y); };
      setLn(coneEdge1, pe1); setLn(coneEdge2, pe2);
      const rPx = cl * tf.scale;
      coneFill.setAttribute('d', `M ${pm.x.toFixed(2)} ${pm.y.toFixed(2)} L ${pe1.x.toFixed(2)} ${pe1.y.toFixed(2)} A ${rPx.toFixed(2)} ${rPx.toFixed(2)} 0 0 1 ${pe2.x.toFixed(2)} ${pe2.y.toFixed(2)} Z`);
      coneFill.setAttribute('data-half-angle', phiDeg.toFixed(2));
      // Vector phản lực R thẳng đứng từ khối. Góc R↔pháp tuyến = β (data cho test).
      const rTip = tf.toScreen({ x: mid.x, y: mid.y + cl });
      reactionLine.setAttribute('x1', pm.x); reactionLine.setAttribute('y1', pm.y);
      reactionLine.setAttribute('x2', rTip.x); reactionLine.setAttribute('y2', rTip.y);
      reactionLine.setAttribute('stroke', slips ? Pal.force : Pal.v);
      reactionLine.setAttribute('data-r-angle', state.betaDeg.toFixed(2));
      lblState.innerHTML = slips ? 'TRƯỢT' : 'CÂN BẰNG';
      lblState.style.color = slips ? Pal.force : Pal.v;
      overlay.moveLabel(lblState, { x: top.x * 0.6, y: top.y * 0.6 + 0.8 });
      handle.move(inclineTop(state.betaDeg));
      panel.setReadout([
        { key: 'mu', label: 'μ:', value: state.mu.toFixed(2) },
        { key: 'phi', label: 'φ (nón):', value: phiDeg.toFixed(1) + '°' },
        { key: 'beta', label: 'β:', value: state.betaDeg.toFixed(1) + '°' },
        { key: 'state', label: 'Trạng thái:', value: slips ? 'β>φ trượt' : 'β≤φ cân bằng' }
      ]);
      if (sim3) sim3.setState({
        betaDeg: state.betaDeg,
        mu: state.mu,
        phiDeg,
        slips
      });
    }

    const panel = shell.setTheory({
      formulas: ['\\tan\\varphi = \\mu', '\\beta > \\varphi'],
      legend: [{ color: Pal.a, label: 'khối' }, { color: Pal.moment, label: 'β (góc nghiêng)' }],
      observe: 'Vật trượt khi góc nghiêng β vượt góc nón ma sát φ (tanφ = μ). Kéo đỉnh hoặc đổi slider.'
    });

    sim3 = root.Sim3Mode && root.Sim3Ch153 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch153.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

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
      a11y: { label: 'Đỉnh mặt phẳng nghiêng', axis: 'both', min: 3, max: 60, valueFromPoint: wp => Math.min(60, Math.max(3, Math.atan2(Math.max(0, wp.y), Math.max(0.1, wp.x)) * 180 / Math.PI)) },
      keyboardStep: { x: 0.1, y: 0.1 },
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
