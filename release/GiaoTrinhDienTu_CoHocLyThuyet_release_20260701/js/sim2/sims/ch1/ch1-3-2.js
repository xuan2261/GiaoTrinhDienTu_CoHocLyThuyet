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
    const W = 100, VIS = 0.02;
    const state = { alphaDeg: 30 };
    const node = { x: 0, y: 1 };

    svg.appendChild(render.line(tf, { x: -3.5, y: 4 }, { x: 3.5, y: 4 }, { stroke: Pal.axis, width: 4 }));

    function anchors(a) {
      const rad = a * Math.PI / 180;
      const dx = (4 - node.y) * Math.tan(rad);
      return [{ x: -dx, y: 4 }, { x: dx, y: 4 }];
    }

    const rope1 = render.line(tf, node, node, { stroke: Pal.reaction, width: 2 }); svg.appendChild(rope1);
    const rope2 = render.line(tf, node, node, { stroke: Pal.reaction, width: 2 }); svg.appendChild(rope2);
    const weight = render.arrow(tf, svg, node, node, { stroke: Pal.force, width: 3 }); svg.appendChild(weight);
    const box = render.poly(tf, [], { closed: true, gradient: 'axis', depth: true, stroke: Pal.axis });
    svg.appendChild(box);

    const lblT1 = overlay.label('T₁', { x: 0, y: 0 }, { anchor: 'right', color: Pal.reaction });
    const lblT2 = overlay.label('T₂', { x: 0, y: 0 }, { anchor: 'left', color: Pal.reaction });
    const lblW = overlay.label('W', node, { anchor: 'left', color: Pal.force });

    function setLine(ln, a, b) {
      const pa = tf.toScreen(a), pb = tf.toScreen(b);
      ln.setAttribute('x1', pa.x); ln.setAttribute('y1', pa.y);
      ln.setAttribute('x2', pb.x); ln.setAttribute('y2', pb.y);
    }
    function render2() {
      const [an1, an2] = anchors(state.alphaDeg);
      setLine(rope1, node, an1); setLine(rope2, node, an2);
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
      handle.move(anchors(state.alphaDeg)[1]);
      const rad = state.alphaDeg * Math.PI / 180;
      const T = W / (2 * Math.cos(rad));
      panel.setReadout([
        { label: 'W:', value: W + ' N' },
        { label: 'α:', value: state.alphaDeg.toFixed(0) + '°' },
        { label: 'T₁=T₂:', value: T.toFixed(1) + ' N' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#b10dc9}{T} = \\dfrac{\\textcolor{#e03030}{W}}{2\\cos\\alpha}'],
      legend: [{ color: Pal.reaction, label: 'T (lực căng)' }, { color: Pal.force, label: 'W' }],
      observe: 'Góc α càng lớn, lực căng T càng tăng (cosα giảm). Kéo handle hoặc thanh trượt.'
    });

    const controls = shell.addControls({
      sliders: [
        { id: 'alpha', label: 'α', min: 5, max: 75, step: 1, value: state.alphaDeg, unit: '°',
          onInput: v => { state.alphaDeg = v; render2(); } }
      ]
    });

    const handle = shell.addHandle(anchors(state.alphaDeg)[1], {
      fill: Pal.handle,
      onDrag(wp) {
        const dx = Math.max(0.2, wp.x), dy = 4 - node.y;
        state.alphaDeg = Math.min(75, Math.max(5, Math.atan2(dx, dy) * 180 / Math.PI));
        controls.setValue('alpha', state.alphaDeg.toFixed(0));
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
