/**
 * ch3-5-4 — Định lý động năng (công–năng). W = ΔT = ½m(v₂²-v₁²). workDone/kineticEnergy.
 * Slider F + kéo lực (quãng đường cố định) → công W và độ biến thiên động năng ΔT khớp nhau.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-5-4', function(container) {
    const shell = Shell.createSimShell({
      // U1: room below the scene for the fixed-scale F–x work area and SI ticks.
      container, worldBox: { minX: 0.3, minY: -3.2, maxX: 7.5, maxY: 2.2 }, reservePanel: true,
      meta: { name: 'Định lý động năng (công–năng)', section: '5.4', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 2, dDist = 6, v1 = 1;
    const state = { F: 4 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 11, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.line(tf, { x: 1, y: -0.3 }, { x: 1, y: 1.5 }, { stroke: Pal.grid, width: 1, dash: '3 3' }));
    svg.appendChild(render.line(tf, { x: 1 + dDist, y: -0.3 }, { x: 1 + dDist, y: 1.5 }, { stroke: Pal.grid, width: 1, dash: '3 3' }));
    svg.appendChild(render.poly(tf,
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
      { closed: true, gradient: 'a', depth: true, stroke: Pal.a }));
    const fArrow = render.arrow(tf, svg, { x: 2, y: 0.5 }, { x: 2, y: 0.5 }, { stroke: Pal.force, width: 3 });
    svg.appendChild(fArrow);

    const workLine = render.line(tf, { x: 1, y: 1.35 }, { x: 1 + dDist, y: 1.35 }, { stroke: Pal.moment, width: 2, dash: '5 4', class: 'sim2-guide-line sim2-work-distance' });
    svg.appendChild(workLine);
    const lblD = overlay.label('d', { x: 1 + dDist / 2, y: 1.7 }, { color: Pal.moment });
    const lblF = overlay.label('F', { x: 2, y: 0.5 }, { anchor: 'left', color: Pal.force });

    const workArea = render.el('polygon',{points:'',fill:Pal.force,'fill-opacity':.15,stroke:Pal.force,'stroke-width':2,class:'sim2-work-area'});
    svg.appendChild(workArea);
    svg.appendChild(render.line(tf,{x:1,y:-2.5},{x:7,y:-2.5},{stroke:Pal.axis,width:1}));
    svg.appendChild(render.line(tf,{x:1,y:-2.5},{x:1,y:-1},{stroke:Pal.axis,width:1}));
    for(let i=0;i<=3;i++) {
      overlay.label(String(i*2)+' m',{x:1+2*i,y:-2.65},{anchor:'top'});
      overlay.label(String(i*5)+' N',{x:.85,y:-2.5+i*.5},{anchor:'right'});
    }
    overlay.label('F–x: diện tích W (J)',{x:4,y:-.7},{color:Pal.force});
    function render2() {
      const W = D.workDone(state.F, dDist, 0);
      const v2 = Math.sqrt(v1 * v1 + 2 * W / m);
      const dT = D.kineticEnergy(m, v2) - D.kineticEnergy(m, v1);
      const VIS = 0.15;
      const fb = tf.toScreen({ x: 2, y: 0.5 }), ft = tf.toScreen({ x: 2 + state.F * VIS, y: 0.5 });
      fArrow.setAttribute('x1', fb.x); fArrow.setAttribute('y1', fb.y);
      fArrow.setAttribute('x2', ft.x); fArrow.setAttribute('y2', ft.y);
      overlay.moveLabel(lblF, { x: 2 + state.F * VIS + 0.3, y: 0.7 });
      handle.move({ x: 2 + state.F * VIS, y: 0.5 });
      workArea.setAttribute('points',[{x:1,y:-2.5},{x:1,y:-2.5+state.F/15*1.5},{x:7,y:-2.5+state.F/15*1.5},{x:7,y:-2.5}].map(p=>{const q=tf.toScreen(p);return `${q.x},${q.y}`;}).join(' '));
      panel.setFormulaHighlight(['work']);
      panel.setReadout([
        { key: 'F', label: 'F:', value: String(state.F) + ' N' },
        { key: 'd', label: 'd:', value: dDist + ' m' },
        { key: 'W', label: 'W = F·d:', value: W.toFixed(1) + ' J' },
        { key: 'dT', label: 'ΔT:', value: dT.toFixed(3) + ' J' },
        { key: 'm', label: 'm:', value: m+' kg' },
        { key: 'v1', label: 'v₁:', value: v1+' m/s' },
        { key: 'v2', label: 'v₂ dự đoán:', value: v2.toFixed(6)+' m/s' },
        { key: 'T1', label: 'T₁ = ½mv₁²:', value: (.5*m*v1*v1).toFixed(3)+' J' },
        { key: 'T2', label: 'T₂ = ½mv₂²:', value: (.5*m*v2*v2).toFixed(3)+' J' },
        { key: 'area', label: 'Diện tích F–x:', value: String(state.F)+' N × 6 m = '+W.toFixed(3)+' J' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: [
        { key: 'work', latex: '\\textcolor{#e03030}{W} = F \\cdot d = \\Delta T' },
        { key: 'work', latex: '\\Delta T = \\tfrac{1}{2}m(v_2^2 - v_1^2)' }
      ],
      legend: [{ color: Pal.force, label: 'F (lực)' }, { color: Pal.a, label: 'vật m' }],
      observe: 'Lực hằng cùng hướng chuyển dời (+x), không có lực cản, d=6 m. Vận tốc v₂ là dự đoán của mô hình; dùng m, v₁, v₂ để tự kiểm ½m(v₂²−v₁²). Đồ thị F–x có thang cố định 0–15 N và 0–6 m; diện tích là công. Đổi F tính lại thí nghiệm.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'F', label: 'F', min: 1, max: 15, step: 1, value: state.F, unit: 'N',
          onInput: v => { state.F = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: 2 + state.F * 0.15, y: 0.5 }, {
      fill: Pal.handle,
      a11y: { label: 'Lực sinh công cùng hướng chuyển dời', axis: 'x', min: 1, max: 15, step: 1, valueFromPoint: wp => (wp.x - 2) / 0.15, pointFromValue: F=>({x:2+F*.15,y:.5}), valueText:()=>String(state.F)+' N, hướng phải' },
      keyboardStep: { x: 0.15, y: 0 },
      onDrag(wp, phase) {
        // Clicking or replaying the same point must not quantize typed values.
        if (phase === 'start' || phase === 'end' || phase === 'cancel') return;
        const raw = (wp.x - 2) / 0.15;
        if (Math.abs(raw-state.F) < 1e-10) return;
        // Pointer movement snaps to the visible slider lattice. Semantic keys
        // add their scalar step to the current value, preserving typed decimals.
        const next = Math.min(15, Math.max(1, Number((phase === 'keyboard' ? raw : Math.round(raw/1)*1).toPrecision(14))));
        if (Math.abs(next-state.F) < 1e-12) return;
        state.F = next;
        controls.setValue('F', state.F);
        render2();
      }
    });
    shell.addAction({ id: 'reset', label: 'Đặt lại thí nghiệm', onClick() { state.F = 4; controls.setValue('F', 4); render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
