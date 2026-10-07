/**
 * ch3-2-3 — Định luật III: lực & phản lực. Cặp lực đối nhau cùng độ lớn, ngược chiều.
 * Slider F + kéo độ lớn lực → cặp F_AB / F_BA cập nhật, luôn đối nhau (inertialForce).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-2-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -6, minY: -1.7, maxX: 6, maxY: 1.0 }, reservePanel: true,
      meta: { name: 'Định luật III: lực & phản lực', section: '2.3', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const A = { x: -1.5, y: 0 }, B = { x: 1.5, y: 0 };
    const VIS = 0.03;
    const state = { Fmag: 60, system: 'all' };

    function blockPts(c) {
      return [{ x: c.x - 0.6, y: -0.6 }, { x: c.x + 0.6, y: -0.6 },
              { x: c.x + 0.6, y: 0.6 }, { x: c.x - 0.6, y: 0.6 }];
    }
    const blockA=render.poly(tf,blockPts(A),{closed:true,gradient:'a',depth:true,stroke:Pal.a}); svg.appendChild(blockA);
    const blockB=render.poly(tf,blockPts(B),{closed:true,gradient:'force',depth:true,stroke:Pal.force}); svg.appendChild(blockB);

    const fAB = render.arrow(tf, svg, B, B, { stroke: Pal.force, width: 3, class: 'sim2-action-reaction-pair' }); svg.appendChild(fAB);
    const fBA = render.arrow(tf, svg, A, A, { stroke: Pal.reaction, width: 3, class: 'sim2-action-reaction-pair' }); svg.appendChild(fBA);

    const labelA=overlay.label('A', { x: A.x, y: -0.9 }, { anchor: 'top' });
    const labelB=overlay.label('B', { x: B.x, y: -0.9 }, { anchor: 'top' });
    const lblAB = overlay.label('F_AB', B, { anchor: 'left', color: Pal.force });
    const lblBA = overlay.label('F_BA', A, { anchor: 'right', color: Pal.reaction });

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      const react = { fx: -state.Fmag }; // Newton III, not an inertial force.
      const tipAB = { x: B.x + state.Fmag * VIS, y: 0 };
      const tipBA = { x: A.x - state.Fmag * VIS, y: 0 };
      set(fAB, B, tipAB); set(fBA, A, tipBA);
      fAB.setAttribute('visibility',state.system==='a'?'hidden':'visible');
      fBA.setAttribute('visibility',state.system==='b'?'hidden':'visible');
      blockA.setAttribute('visibility',state.system==='b'?'hidden':'visible');
      blockB.setAttribute('visibility',state.system==='a'?'hidden':'visible');
      labelA.style.display=state.system==='b'?'none':'';
      labelB.style.display=state.system==='a'?'none':'';
      handle.node.style.display=state.system==='a'?'none':'';
      lblAB.style.display=state.system==='a'?'none':'';
      lblBA.style.display=state.system==='b'?'none':'';
      overlay.moveLabel(lblAB, { x: tipAB.x + 0.3, y: 0.4 });
      overlay.moveLabel(lblBA, { x: tipBA.x - 0.3, y: 0.4 });
      handle.move({ x: B.x + state.Fmag * VIS, y: 0 });
      panel.setFormulaHighlight(['pair']);
      panel.setReadout([
        { key: 'FAB', label: 'F_AB (A lên B):', value: '+' + String(state.Fmag) + ' N' },
        { key: 'FBA', label: 'F_BA (B lên A):', value: String(react.fx) + ' N' },
        { key: 'pairMag', label: '|F_AB|=|F_BA|:', value: String(state.Fmag) + ' N' },
        { key: 'sum', label: 'ΣF nội lực hệ A+B:', value: '0 N (chỉ cặp nội lực)' },
        { key: 'system', label: 'Vật thể đang xét:', value: state.system==='a'?'Vật A: nhận F_BA; chưa biết lực ngoài':state.system==='b'?'Vật B: nhận F_AB; chưa biết lực ngoài':'Hệ A+B: hai nội lực triệt tiêu' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: [{ key: 'pair', latex: '\\textcolor{#e03030}{\\vec{F}_{AB}} = -\\textcolor{#b10dc9}{\\vec{F}_{BA}}' }],
      legend: [{ color: Pal.force, label: 'F_AB (lên B)' }, { color: Pal.reaction, label: 'F_BA (lên A)' }],
      observe: 'F_AB là lực A tác dụng lên B; F_BA là lực B tác dụng lên A. Hai lực đặt trên hai vật khác nhau, không suy ra từng vật cân bằng. Chỉ tổng nội lực của hệ A+B bằng 0; chưa mô hình hóa các lực ngoài hay gia tốc từng vật. Chiều phải dương; thang chung 0,03 đơn vị hình/N.'
    });

    const controls = shell.addControls({
      actions: [
        {id:'fbd-a',label:'Xét riêng vật A',onClick:()=>{state.system='a';render2();}},
        {id:'fbd-b',label:'Xét riêng vật B',onClick:()=>{state.system='b';render2();}},
        {id:'fbd-system',label:'Xét hệ A+B',onClick:()=>{state.system='all';render2();}}
      ],
      sliders: [
        { id: 'F', label: 'F', min: 20, max: 80, step: 5, value: state.Fmag, unit: 'N',
          onInput: v => { state.Fmag = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: B.x + state.Fmag * VIS, y: 0 }, {
      fill: Pal.handle,
      a11y: { label: 'Lực A tác dụng lên B', axis: 'x', min: 20, max: 80, step: 5, valueFromPoint: wp => (wp.x - B.x) / VIS, pointFromValue:F=>({x:B.x+F*VIS,y:0}), valueText:()=>String(state.Fmag)+' N lên B, hướng phải' },
      keyboardStep: { x: 5 * VIS, y: 0 },
      onDrag(wp, phase) {
        // Clicking or replaying the same point must not quantize typed values.
        if (phase === 'start' || phase === 'end' || phase === 'cancel') return;
        const raw = (wp.x - B.x) / VIS;
        if (Math.abs(raw-state.Fmag) < 1e-10) return;
        // Pointer movement snaps to the visible slider lattice. Semantic keys
        // add their scalar step to the current value, preserving typed decimals.
        const next = Math.min(80, Math.max(20, Number((phase === 'keyboard' ? raw : Math.round(raw/5)*5).toPrecision(14))));
        if (Math.abs(next-state.Fmag) < 1e-12) return;
        state.Fmag = next;
        controls.setValue('F', state.Fmag);
        render2();
      }
    });
    shell.addAction({ id: 'reset', label: 'Đặt lại thí nghiệm', onClick() { state.Fmag = 60; state.system = 'all'; controls.setValue('F', 60); render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
