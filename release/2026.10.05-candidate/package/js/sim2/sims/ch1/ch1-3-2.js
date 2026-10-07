/**
 * ch1-3-2 — Lực căng dây (ràng buộc 1 chiều). 2 dây đối xứng treo vật.
 * Slider α + kéo handle → lực căng T = W/(2cosα) cập nhật realtime (drag↔slider đồng bộ).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, Pal = root.Sim2Palette;

  Reg.register('ch1-3-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -1.3, maxX: 4, maxY: 4.6 }, reservePanel: true,
      meta: { name: 'Lực căng dây (ràng buộc 1 chiều)', section: '3.2', chapter: 1 }
    });
    const { svg, tf, overlay, render } = shell;
    const W = 100, VIS = 0.02, ROPE_LENGTH = 3;
    const minAnchorX = ROPE_LENGTH * Math.sin(5 * Math.PI / 180);
    const maxAnchorX = ROPE_LENGTH * Math.sin(75 * Math.PI / 180);
    const state = { alphaDeg: 30 };

    function geometry(a) {
      const rad = a * Math.PI / 180;
      // Fixed rope length gives a strictly monotone anchor x over 5°..75°.
      const node = { x: 0, y: 4 - ROPE_LENGTH * Math.cos(rad) };
      const dx = ROPE_LENGTH * Math.sin(rad);
      return { node, anchors: [{ x: -dx, y: 4 }, { x: dx, y: 4 }] };
    }
    function angleFromPoint(wp) {
      const x = Math.min(maxAnchorX, Math.max(minAnchorX, wp.x));
      return Math.asin(x / ROPE_LENGTH) * 180 / Math.PI;
    }
    const initial = geometry(state.alphaDeg);

    svg.appendChild(render.line(tf, { x: -3.5, y: 4 }, { x: 3.5, y: 4 }, { stroke: Pal.axis, width: 4 }));

    const rope1 = render.line(tf, initial.node, initial.node, { stroke: Pal.reaction, width: 2 }); svg.appendChild(rope1);
    const rope2 = render.line(tf, initial.node, initial.node, { stroke: Pal.reaction, width: 2 }); svg.appendChild(rope2);
    const weight = render.arrow(tf, svg, initial.node, initial.node, { stroke: Pal.force, width: 3 }); svg.appendChild(weight);
    const box = render.poly(tf, [], { closed: true, gradient: 'axis', depth: true, stroke: Pal.axis });
    svg.appendChild(box);

    const lblT1 = overlay.label('T₁', { x: 0, y: 0 }, { anchor: 'right', color: Pal.reaction });
    const lblT2 = overlay.label('T₂', { x: 0, y: 0 }, { anchor: 'left', color: Pal.reaction });
    const lblW = overlay.label('W', initial.node, { anchor: 'left', color: Pal.force });

    const vertical = render.line(tf, initial.node, { x: 0, y: 4 }, { stroke: Pal.axis, width: 1, dash: '4 3', class: 'sim2-guide-line sim2-rope-vertical' });
    const angleArc = render.el('path', { class: 'sim2-angle-arc', fill: 'none', stroke: Pal.moment, 'stroke-width': 1.5 });
    svg.appendChild(vertical); svg.appendChild(angleArc);
    const lblAlpha = overlay.label('α', initial.node, { color: Pal.moment });

    function setLine(ln, a, b) {
      const pa = tf.toScreen(a), pb = tf.toScreen(b);
      ln.setAttribute('x1', pa.x); ln.setAttribute('y1', pa.y);
      ln.setAttribute('x2', pb.x); ln.setAttribute('y2', pb.y);
    }
    function render2() {
      const layout = geometry(state.alphaDeg);
      const node = layout.node;
      const [an1, an2] = layout.anchors;
      setLine(rope1, node, an1); setLine(rope2, node, an2);
      setLine(vertical, node, { x: 0, y: 4 });
      const arcRadius = 0.65, alpha = state.alphaDeg * Math.PI / 180;
      const as = tf.toScreen({ x: 0, y: node.y + arcRadius });
      const ae = tf.toScreen({ x: arcRadius*Math.sin(alpha), y: node.y + arcRadius*Math.cos(alpha) });
      const rr = arcRadius * tf.scale;
      angleArc.setAttribute('d', `M ${as.x} ${as.y} A ${rr} ${rr} 0 0 1 ${ae.x} ${ae.y}`);
      overlay.moveLabel(lblAlpha, { x: 0.85*Math.sin(alpha/2), y: node.y + 0.85*Math.cos(alpha/2) });
      const wTip = { x: node.x, y: node.y - W * VIS };
      const wp = tf.toScreen(node), wt = tf.toScreen(wTip);
      weight.setAttribute('x1', wp.x); weight.setAttribute('y1', wp.y);
      weight.setAttribute('x2', wt.x); weight.setAttribute('y2', wt.y);
      box.setAttribute('points', [
        { x: node.x - 0.4, y: node.y }, { x: node.x + 0.4, y: node.y },
        { x: node.x + 0.4, y: node.y - 0.6 }, { x: node.x - 0.4, y: node.y - 0.6 }
      ].map(p => { const s = tf.toScreen(p); return `${s.x},${s.y}`; }).join(' '));
      overlay.moveLabel(lblT1, { x: an1.x / 2 - 0.2, y: (an1.y + node.y) / 2 });
      overlay.moveLabel(lblT2, { x: an2.x / 2 + 0.2, y: (an2.y + node.y) / 2 });
      overlay.moveLabel(lblW, { x: node.x + 0.3, y: node.y - W * VIS / 2 });
      handle.move(an2);
      const rad = state.alphaDeg * Math.PI / 180;
      const T = W / (2 * Math.cos(rad));
      panel.setReadout([
        { key: 'W', label: 'W:', value: W + ' N' },
        { key: 'alpha', label: 'α:', value: state.alphaDeg.toFixed(0) + '°' },
        { key: 'T', label: 'T₁=T₂:', value: T.toFixed(1) + ' N' },
        { key: 'sumFx', label: 'ΣFₓ:', value: (-T*Math.sin(rad)+T*Math.sin(rad)).toFixed(6) + ' N' },
        { key: 'sumFy', label: 'ΣFᵧ = 2T cosα − W:', value: (2*T*Math.cos(rad)-W).toFixed(6) + ' N' },
        { key: 'ropeLength', label: 'Mỗi dây:', value: Math.hypot(an2.x-node.x,an2.y-node.y).toFixed(3) + ' m' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#b10dc9}{T} = \\dfrac{\\textcolor{#e03030}{W}}{2\\cos\\alpha}'],
      legend: [{ color: Pal.reaction, label: 'T (lực căng)' }, { color: Pal.force, label: 'W' }],
      observe: 'Hai dây nhẹ, không dãn, dài cố định 3 m; vật đứng yên. α đo từ phương đứng. Tăng α làm nút nâng lên và T tăng; T tăng nhanh khi gần 90°, ngoài miền 5–75° đang khảo sát. Nhãn T₁/T₂ chỉ lực căng, không phải mũi tên theo thang lực.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'alpha', label: 'α', min: 5, max: 75, step: 1, value: state.alphaDeg, unit: '°',
          onInput: v => { state.alphaDeg = Math.round(v); controls.setValue('alpha', state.alphaDeg); render2(); } }
      ]
    });

    const handle = shell.addHandle(initial.anchors[1], {
      fill: Pal.handle,
      a11y: { label: 'Điểm neo dây bên phải; góc α từ phương đứng', axis: 'x', min: 5, max: 75, valueFromPoint: angleFromPoint, valueText: wp => angleFromPoint(wp).toFixed(1) + '°' },
      bounds: { minX: minAnchorX, maxX: maxAnchorX, minY: 4, maxY: 4 },
      keyboardStep: { x: 0.05, y: 0 },
      onDrag(wp) {
        // Match the slider's 1° resolution so its value and physical state agree.
        state.alphaDeg = Math.round(angleFromPoint(wp));
        controls.setValue('alpha', state.alphaDeg);
        render2();
      }
    });
    shell.addAction({ id: 'reset', label: 'Đặt lại', onClick() { state.alphaDeg = 30; controls.setValue('alpha', 30); render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
