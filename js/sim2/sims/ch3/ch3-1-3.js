/**
 * ch3-1-3 — HQC quán tính vs phi quán tính. dalembertForce + equilibriumWithInertia.
 * Slider a + kéo gia tốc toa → lực quán tính F* và góc lệch con lắc cập nhật.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-1-3', function(container) {
    const shell = Shell.createSimShell({
      // worldBox thu DỌC -1..6 → -0.5..5.5: thân toa (y 0..5) lấp ~83% chiều cao (hết dead-space
      // trên+dưới). GIỮ maxX=5: thu ngang sẽ clip thân toa (x ±3.5). pivot y=5, bob hạ xuống vẫn trong khung.
      container, worldBox: { minX: -5, minY: -0.5, maxX: 5, maxY: 5.5 }, reservePanel: true,
      meta: { name: 'HQC quán tính vs phi quán tính', section: '1.3', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const m = 1, g = 9.81, VIS = 0.12;
    const state = { aFrame: 3, referenceFrame: 'car' };
    let sim3 = null;

    svg.appendChild(render.poly(tf,
      [{ x: -3.5, y: 0 }, { x: 3.5, y: 0 }, { x: 3.5, y: 5 }, { x: -3.5, y: 5 }],
      { closed: true, gradient: 'axis', depth: true, stroke: Pal.axis, width: 3.5 }));
    const pivot = { x: 0, y: 5 };
    const bob = render.circle(tf, pivot, 7, { pixel: true, fill: Pal.a, stroke: Pal.a }); svg.appendChild(bob);
    const cord = render.line(tf, pivot, pivot, { stroke: Pal.axis, width: 2 }); svg.appendChild(cord);
    const aArrow = render.arrow(tf, svg, { x: -2.5, y: 2.5 }, { x: -2.5, y: 2.5 }, { stroke: Pal.a, width: 3 }); svg.appendChild(aArrow);
    const finArrow = render.arrow(tf, svg, pivot, pivot, { stroke: Pal.force, width: 2.5 }); svg.appendChild(finArrow);

    const lblA = overlay.label('a (toa)', { x: -2.5, y: 2.5 }, { anchor: 'bottom', color: Pal.a });
    const lblF = overlay.label('F* qt', pivot, { anchor: 'left', color: Pal.force });
    const gravityArrow = render.arrow(tf,svg,pivot,pivot,{stroke:Pal.v,width:2.5}); svg.appendChild(gravityArrow);
    const tensionArrow = render.arrow(tf,svg,pivot,pivot,{stroke:Pal.reaction,width:2.5}); svg.appendChild(tensionArrow);
    const lblP=overlay.label('P=mg',pivot,{anchor:'right',color:Pal.v});
    const lblT=overlay.label('T',pivot,{anchor:'left',color:Pal.reaction});

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      const theta = Math.atan2(state.aFrame, g);
      const L = 3;
      const bobPt = { x: pivot.x - L * Math.sin(theta), y: pivot.y - L * Math.cos(theta) };
      const sp = tf.toScreen(pivot), sb = tf.toScreen(bobPt);
      cord.setAttribute('x1', sp.x); cord.setAttribute('y1', sp.y);
      cord.setAttribute('x2', sb.x); cord.setAttribute('y2', sb.y);
      bob.setAttribute('cx', sb.x); bob.setAttribute('cy', sb.y);
      set(aArrow, { x: -2.5, y: 2.5 }, { x: -2.5 + state.aFrame * VIS, y: 2.5 });
      const fIner = D.dalembertForce(m, state.aFrame, 0);
      const tension=m*Math.hypot(g,state.aFrame), gravity={x:0,y:-m*g}, tensionForce={x:m*state.aFrame,y:m*g};
      set(gravityArrow,bobPt,{x:bobPt.x,y:bobPt.y+gravity.y*VIS});
      set(tensionArrow,bobPt,{x:bobPt.x+tensionForce.x*VIS,y:bobPt.y+tensionForce.y*VIS});
      overlay.moveLabel(lblP,{x:bobPt.x+.2,y:bobPt.y+gravity.y*VIS});
      overlay.moveLabel(lblT,{x:bobPt.x+tensionForce.x*VIS+.2,y:bobPt.y+tensionForce.y*VIS});
      finArrow.setAttribute('visibility',state.referenceFrame==='car'&&state.aFrame!==0?'visible':'hidden');
      aArrow.setAttribute('visibility',state.aFrame===0?'hidden':'visible');
      lblF.style.display=state.referenceFrame==='car'&&state.aFrame!==0?'':'none';
      set(finArrow, bobPt, { x: bobPt.x + fIner.fx * VIS, y: bobPt.y });
      overlay.moveLabel(lblA, { x: -2.5 + state.aFrame * VIS * 0.5, y: 2.9 });
      overlay.moveLabel(lblF, { x: bobPt.x + fIner.fx * VIS - 0.3, y: bobPt.y + 0.4 });
      handle.move({ x: -2.5 + state.aFrame * VIS, y: 2.5 });
      panel.setFormulaHighlight(['inertia']);
      panel.setReadout([
        { key: 'aFrame', label: 'a toa:', value: String(state.aFrame) + ' m/s²' },
        { key: 'inertiaForce', label: 'F* = -m·a:', value: fIner.fx.toFixed(1) + ' N' },
        { key: 'theta', label: 'θ lệch:', value: (theta * 180 / Math.PI).toFixed(1) + '°' },
        { key: 'tan', label: 'tanθ = a/g:', value: (state.aFrame / g).toFixed(3) },
        { key: 'model', label: 'Mô hình:', value: 'Trạng thái cân bằng tương đối; không giải quá độ' },
        { key: 'tension', label: 'T:', value: tension.toFixed(4)+' N' },
        { key: 'gravity', label: 'P = mg:', value: (m*g).toFixed(2)+' N, xuống' },
        { key: 'tx', label: 'T sinθ = ma:', value: tensionForce.x.toFixed(4)+' N' },
        { key: 'ty', label: 'T cosθ = mg:', value: tensionForce.y.toFixed(4)+' N' },
        { key: 'frame', label: 'Hệ quy chiếu:', value: state.referenceFrame==='car'?'Toa gia tốc (phi quán tính)':'Mặt đất (quán tính)' },
        { key: 'balance', label: 'Phương trình lực:', value: state.referenceFrame==='car'?'T + P + F* = 0; bob đứng yên tương đối':'T + P = ma; bob gia tốc cùng toa' }

      ]);
      if (sim3) sim3.setState({
        aFrame: state.aFrame, mass:m, gravity, tension, tensionForce,
        referenceFrame:state.referenceFrame, modelAssumptions:'relative-equilibrium', displayScales:{force:VIS},
        theta,
        thetaDeg: theta * 180 / Math.PI,
        fIner,
        pivot,
        bob: bobPt
      });
    }

    const panel = shell.setTheory({
      formulas: [
        { key: 'inertia', latex: '\\textcolor{#e03030}{F^*} = -m\\,\\textcolor{#0074d9}{a}' },
        { key: 'inertia', latex: '\\tan\\theta = \\dfrac{a}{g}' }
      ],
      legend: [{ color: Pal.a, label: 'a (gia tốc toa)' }, { color: Pal.force, label: 'F* quán tính' }],
      observe: 'Dây không khối lượng, bob 1 kg; g=9,81 m/s², gia tốc toa hằng hướng phải. Đây là cân bằng tương đối: đổi a đặt ngay trạng thái cân bằng mới, không mô phỏng dao động quá độ. Hệ toa thêm F*=−ma; hệ đất chỉ có T và P với tổng ma. Chọn hệ đổi sơ đồ lực, không đổi trạng thái; các lực dùng chung thang hình 0,12/N.'
    });

    sim3 = root.Sim3Mode && root.Sim3Ch313 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch313.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    const controls = shell.addControls({
      actions:[
        {id:'frame-car',label:'Sơ đồ lực trong hệ toa',onClick:()=>{state.referenceFrame='car';render2();}},
        {id:'frame-ground',label:'Sơ đồ lực trong hệ mặt đất',onClick:()=>{state.referenceFrame='ground';render2();}}
      ],
      sliders: [
        { id: 'a', label: 'a', min: 0, max: 8, step: 0.5, value: state.aFrame, unit: 'm/s²',
          onInput: v => { state.aFrame = v; render2(); } }
      ]
    });

    const handle = shell.addHandle({ x: -2.5 + state.aFrame * VIS, y: 2.5 }, {
      fill: Pal.handle,
      a11y: { label: 'Gia tốc toa hướng phải', axis: 'x', min: 0, max: 8, step: .5, valueFromPoint: wp => (wp.x + 2.5) / VIS, pointFromValue:a=>({x:-2.5+a*VIS,y:2.5}), valueText:()=>String(state.aFrame)+' m/s², hướng phải' },
      keyboardStep: { x: 0.5 * VIS, y: 0 },
      onDrag(wp, phase) {
        // Clicking or replaying the same point must not quantize typed values.
        if (phase === 'start' || phase === 'end' || phase === 'cancel') return;
        const raw = (wp.x + 2.5) / VIS;
        if (Math.abs(raw-state.aFrame) < 1e-10) return;
        // Pointer movement snaps to the visible slider lattice. Semantic keys
        // add their scalar step to the current value, preserving typed decimals.
        const next = Math.min(8, Math.max(0, Number((phase === 'keyboard' ? raw : Math.round(raw/0.5)*0.5).toPrecision(14))));
        if (Math.abs(next-state.aFrame) < 1e-12) return;
        state.aFrame = next;
        controls.setValue('a', state.aFrame);
        render2();
      }
    });
    shell.addAction({ id: 'reset', label: 'Đặt lại thí nghiệm', onClick() { state.aFrame = 3; state.referenceFrame = 'car'; controls.setValue('a', 3); render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
