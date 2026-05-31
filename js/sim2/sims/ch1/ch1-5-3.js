/**
 * ch1-5-3 — Nón ma sát trên mặt nghiêng. tanφ = μ; trượt khi β > φ.
 * Kéo góc nghiêng β → trạng thái cân bằng/trượt + góc nón ma sát cập nhật.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell;

  Reg.register('ch1-5-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 7, maxY: 5 }
    });
    const { svg, tf, overlay, render } = shell;
    const mu = 0.45;
    const base = { x: 0, y: 0 };
    const len = 6;

    let betaDeg = 18;
    function inclineTop(b) {
      const r = b * Math.PI / 180;
      return { x: base.x + len * Math.cos(r), y: base.y + len * Math.sin(r) };
    }

    const ground = render.line(tf, base, { x: len, y: 0 }, { stroke: '#ccc', width: 1 }); svg.appendChild(ground);
    const incline = render.line(tf, base, base, { stroke: '#555', width: 3 }); svg.appendChild(incline);
    const blockPoly = render.poly(tf, [], { closed: true, fill: 'rgba(90,140,200,0.4)', stroke: '#368' });
    svg.appendChild(blockPoly);

    const lblBeta = overlay.label('β', { x: 1.2, y: 0.15 }, { color: '#666' });
    const lblState = overlay.label('', { x: 3, y: 3.5 }, { color: '#c30' });
    const card = overlay.readoutCard([]);

    function update() {
      const top = inclineTop(betaDeg);
      const it = tf.toScreen(top), ib = tf.toScreen(base);
      incline.setAttribute('x1', ib.x); incline.setAttribute('y1', ib.y);
      incline.setAttribute('x2', it.x); incline.setAttribute('y2', it.y);
      // Khối ở giữa mặt nghiêng
      const r = betaDeg * Math.PI / 180;
      const mid = { x: base.x + (len * 0.5) * Math.cos(r), y: base.y + (len * 0.5) * Math.sin(r) };
      const nx = -Math.sin(r), ny = Math.cos(r); // pháp tuyến mặt nghiêng
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
      const phiDeg = Math.atan(mu) * 180 / Math.PI; // góc nón ma sát: tanφ = μ
      const slips = betaDeg > phiDeg;
      lblState.innerHTML = slips ? 'TRƯỢT' : 'CÂN BẰNG';
      lblState.style.color = slips ? '#c30' : '#2a7';
      overlay.moveLabel(lblState, { x: top.x * 0.6, y: top.y * 0.6 + 0.8 });
      card.__render([
        { label: 'μ:', value: mu.toFixed(2) },
        { label: 'φ (nón):', value: phiDeg.toFixed(1) + '°' },
        { label: 'β:', value: betaDeg.toFixed(1) + '°' },
        { label: 'Trạng thái:', value: slips ? 'β>φ trượt' : 'β≤φ cân bằng' }
      ]);
    }

    const handle = shell.addHandle(inclineTop(betaDeg), {
      onDrag(wp) {
        betaDeg = Math.min(60, Math.max(3, Math.atan2(Math.max(0, wp.y), Math.max(0.1, wp.x)) * 180 / Math.PI));
        handle.move(inclineTop(betaDeg));
        update();
      }
    });
    update();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
