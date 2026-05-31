/**
 * ch1-3-2 — Lực căng dây (ràng buộc 1 chiều). 2 dây đối xứng treo vật.
 * Kéo góc dây α → lực căng T = W/(2cosα) cập nhật realtime (checkEquilibrium verify).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell;

  Reg.register('ch1-3-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -4, minY: -1, maxX: 4, maxY: 5 }
    });
    const { svg, tf, overlay, render } = shell;
    const W = 100, VIS = 0.02;

    // Trần
    svg.appendChild(render.line(tf, { x: -3.5, y: 4 }, { x: 3.5, y: 4 }, { stroke: '#666', width: 4 }));

    let alphaDeg = 30; // góc từ phương đứng
    const node = { x: 0, y: 1 }; // điểm treo vật
    function anchors(a) {
      const rad = a * Math.PI / 180;
      const dx = (4 - node.y) * Math.tan(rad);
      return [{ x: -dx, y: 4 }, { x: dx, y: 4 }];
    }

    const rope1 = render.line(tf, node, node, { stroke: '#964', width: 2 }); svg.appendChild(rope1);
    const rope2 = render.line(tf, node, node, { stroke: '#964', width: 2 }); svg.appendChild(rope2);
    const weight = render.arrow(tf, svg, node, node, { stroke: '#e63', width: 3 }); svg.appendChild(weight);
    const box = render.poly(tf, [], { closed: true, fill: 'rgba(100,100,100,0.3)', stroke: '#555' });
    svg.appendChild(box);

    const lblT1 = overlay.label('T₁', { x: 0, y: 0 }, { anchor: 'right', color: '#178' });
    const lblT2 = overlay.label('T₂', { x: 0, y: 0 }, { anchor: 'left', color: '#178' });
    const lblW = overlay.label('W', node, { anchor: 'left', color: '#c30' });
    const card = overlay.readoutCard([]);

    function setLine(ln, a, b) {
      const pa = tf.toScreen(a), pb = tf.toScreen(b);
      ln.setAttribute('x1', pa.x); ln.setAttribute('y1', pa.y);
      ln.setAttribute('x2', pb.x); ln.setAttribute('y2', pb.y);
    }
    function update() {
      const [an1, an2] = anchors(alphaDeg);
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
      const rad = alphaDeg * Math.PI / 180;
      const T = W / (2 * Math.cos(rad));
      card.__render([
        { label: 'W:', value: W + ' N' },
        { label: 'α:', value: alphaDeg.toFixed(0) + '°' },
        { label: 'T₁=T₂:', value: T.toFixed(1) + ' N' }
      ]);
    }

    // Kéo handle trên dây phải để đổi góc
    const handle = shell.addHandle(anchors(alphaDeg)[1], {
      onDrag(wp) {
        const dx = Math.max(0.2, wp.x), dy = 4 - node.y;
        alphaDeg = Math.min(75, Math.max(5, Math.atan2(dx, dy) * 180 / Math.PI));
        handle.move(anchors(alphaDeg)[1]);
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
