/**
 * ch3-5-2 — Định lý động lượng & xung lượng. J = Δp = F·t.
 * Slider F, t + kéo lực → xung lượng J và độ biến thiên động lượng Δp cập nhật. Graph p(t).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-5-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -3, maxX: 11, maxY: 4 }, reservePanel: true,
      meta: { name: 'Định lý động lượng & xung lượng', section: '5.2', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 2, v1 = 1;
    const state = { F: 6, tDur: 2 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 11, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.poly(tf,
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
      { closed: true, gradient: 'a', depth: true, stroke: Pal.a }));
    const fArrow = render.arrow(tf, svg, { x: 2, y: 0.5 }, { x: 2, y: 0.5 }, { stroke: Pal.force, width: 3 });
    svg.appendChild(fArrow);
    const gx0 = 0, gy0 = -2, gw = 4, gh = 1.5;
    const FMAX=20, PMAX=82, TMAX=4, FX=5;
    const pLine = render.el('polyline', { points: '', fill: 'none', stroke: Pal.v, 'stroke-width': 2, class: 'sim2-graph' });
    const forceArea = render.el('polygon', { points:'', fill:Pal.force, 'fill-opacity':.15, stroke:Pal.force, 'stroke-width':2, class:'sim2-force-area' });
    svg.appendChild(pLine); svg.appendChild(forceArea);
    for (const x0 of [gx0,FX]) {
      svg.appendChild(render.line(tf,{x:x0,y:gy0},{x:x0+gw,y:gy0},{stroke:Pal.axis,width:1}));
      svg.appendChild(render.line(tf,{x:x0,y:gy0},{x:x0,y:gy0+gh},{stroke:Pal.axis,width:1}));
      for(let i=0;i<=2;i++) {
        overlay.label(String(i*2)+' s',{x:x0+gw*i/2,y:gy0-.15},{anchor:'top'});
        overlay.label(String(i*(x0===FX?FMAX:PMAX)/2),{x:x0-.1,y:gy0+gh*i/2},{anchor:'right'});
      }
    }
    overlay.label('p (kg·m/s)',{x:gx0+gw/2,y:gy0+gh+.35},{color:Pal.v});
    overlay.label('F (N), diện tích = J',{x:FX+gw/2,y:gy0+gh+.35},{color:Pal.force});
    const lblF = overlay.label('F', { x: 2, y: 0.5 }, { anchor: 'left', color: Pal.force });

    function render2() {
      const a = D.accelerationFromForce(state.F, m);
      const v2 = v1 + a * state.tDur;
      const J = state.F * state.tDur, dp = m * v2 - m * v1;
      const VIS = 0.12;
      const ft = tf.toScreen({ x: 2 + state.F * VIS, y: 0.5 }), fb = tf.toScreen({ x: 2, y: 0.5 });
      fArrow.setAttribute('x1', fb.x); fArrow.setAttribute('y1', fb.y);
      fArrow.setAttribute('x2', ft.x); fArrow.setAttribute('y2', ft.y);
      overlay.moveLabel(lblF, { x: 2 + state.F * VIS + 0.3, y: 0.7 });
      const pts = [];
      const pMax = PMAX;
      for (let i = 0; i <= 20; i++) {
        const tt = state.tDur * i / 20, pp = m * (v1 + a * tt);
        const gx = gx0 + (tt / TMAX) * gw, gy = gy0 + (pp / (pMax || 1)) * gh;
        const s = tf.toScreen({ x: gx, y: gy }); pts.push(`${s.x},${s.y}`);
      }
      pLine.setAttribute('points', pts.join(' '));
      forceArea.setAttribute('points',[{x:FX,y:gy0},{x:FX,y:gy0+state.F/FMAX*gh},{x:FX+state.tDur/TMAX*gw,y:gy0+state.F/FMAX*gh},{x:FX+state.tDur/TMAX*gw,y:gy0}].map(p=>{const q=tf.toScreen(p);return `${q.x},${q.y}`;}).join(' '));
      handle.move({ x: 2 + state.F * VIS, y: 0.5 });
      panel.setFormulaHighlight(['impulse']);
      panel.setReadout([
        { key: 'F', label: 'F:', value: String(state.F) + ' N' },
        { key: 't', label: 't:', value: String(state.tDur) + ' s' },
        { key: 'J', label: 'J = F·t:', value: J.toFixed(1) + ' N·s' },
        { key: 'dp', label: 'Δp:', value: dp.toFixed(3) + ' kg·m/s' },
        { key: 'm', label: 'm:', value: m+' kg' },
        { key: 'v1', label: 'v₁:', value: v1+' m/s' },
        { key: 'v2', label: 'v₂:', value: v2.toFixed(3)+' m/s' },
        { key: 'p1', label: 'p₁ = mv₁:', value: (m*v1).toFixed(3)+' kg·m/s' },
        { key: 'p2', label: 'p₂ = mv₂:', value: (m*v2).toFixed(3)+' kg·m/s' },
        { key: 'area', label: 'Diện tích F–t:', value: state.F+' N × '+state.tDur+' s = '+J.toFixed(3)+' N·s' },
        { key: 'slope', label: 'Độ dốc p–t:', value: state.F+' kg·m/s² = '+state.F+' N' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: [{ key: 'impulse', latex: '\\textcolor{#159c3a}{J} = \\textcolor{#e03030}{F} \\cdot t = \\Delta p' }],
      legend: [{ color: Pal.force, label: 'F (lực)' }, { color: Pal.v, label: 'p(t) động lượng' }],
      observe: 'Lực hằng cùng chiều dương; m=2 kg, v₁=1 m/s. Hai đồ thị dùng thang cố định t=0–4 s, p=0–82 kg·m/s, F=0–20 N. Diện tích F–t là J; độ dốc p–t là F. Đổi tham số tính lại cả thí nghiệm. So 12 N×1 s và 3 N×4 s: cùng J, cùng v₂.'
    });

    const controls = shell.addControls({
      actions: [
        { id:'equal-short',label:'Xung ngắn: 12 N × 1 s',onClick:()=>{state.F=12;state.tDur=1;controls.setValue('F',12);controls.setValue('t',1);render2();} },
        { id:'equal-long',label:'Xung dài: 3 N × 4 s',onClick:()=>{state.F=3;state.tDur=4;controls.setValue('F',3);controls.setValue('t',4);render2();} }
      ],
      sliders: [
        { id: 'F', label: 'F', min: 2, max: 20, step: 1, value: state.F, unit: 'N',
          onInput: v => { state.F = v; render2(); } },
        { id: 't', label: 't', min: 0.5, max: 4, step: 0.5, value: state.tDur, unit: 's',
          onInput: v => { state.tDur = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: 2 + state.F * 0.12, y: 0.5 }, {
      fill: Pal.handle,
      a11y: { label: 'Lực hằng F sinh xung lượng, hướng phải', axis: 'x', min: 2, max: 20, step: 1, valueFromPoint: wp => (wp.x - 2) / 0.12, pointFromValue: F => ({x:2+F*.12,y:.5}), valueText: () => String(state.F)+' N, hướng phải' },
      keyboardStep: { x: 0.12, y: 0 },
      onDrag(wp, phase) {
        // Clicking or replaying the same point must not quantize typed values.
        if (phase === 'start' || phase === 'end' || phase === 'cancel') return;
        const raw = (wp.x - 2) / 0.12;
        if (Math.abs(raw-state.F) < 1e-10) return;
        // Pointer movement snaps to the visible slider lattice. Semantic keys
        // add their scalar step to the current value, preserving typed decimals.
        const next = Math.min(20, Math.max(2, Number((phase === 'keyboard' ? raw : Math.round(raw/1)*1).toPrecision(14))));
        if (Math.abs(next-state.F) < 1e-12) return;
        state.F = next;
        controls.setValue('F', state.F);
        render2();
      }
    });
    shell.addAction({ id: 'reset', label: 'Đặt lại thí nghiệm', onClick() { state.F = 6; state.tDur = 2; controls.setValue('F', 6); controls.setValue('t', 2); render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
