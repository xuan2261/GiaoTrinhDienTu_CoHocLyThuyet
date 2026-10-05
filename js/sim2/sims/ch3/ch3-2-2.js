/**
 * ch3-2-2 — Định luật II Newton F = m·a. accelerationFromForce + integrateMotion.
 * Slider F, m + playback (start paused). Graph v(t) DOM (.sim2-graph) cập nhật mỗi frame.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-2-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -3, maxX: 11, maxY: 5 }, reservePanel: true,
      meta: { name: 'Định luật II Newton F = m·a', section: '2.2', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const params = { m: 2, F: 6 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 11, y: 0 }, { stroke: Pal.axis, width: 1 }));
    const box = render.poly(tf, [], { closed: true, gradient: 'a', depth: true, stroke: Pal.a });
    svg.appendChild(box);
    const fArrow = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.force, width: 3 });
    svg.appendChild(fArrow);

    const gx0 = 0, gy0 = -2.5, gw = 9, gh = 2;
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0 + gw, y: gy0 }, { stroke: Pal.grid, width: 1 }));
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0, y: gy0 + gh }, { stroke: Pal.grid, width: 1 }));
    const graphLine = render.el('polyline', {
      points: '', fill: 'none', stroke: Pal.v, 'stroke-width': 2, class: 'sim2-graph'
    });
    svg.appendChild(graphLine);
    const referenceLine = render.el('polyline', { points: '', fill: 'none', stroke: Pal.moment, 'stroke-width': 2, 'stroke-dasharray': '5 3', class: 'sim2-graph-reference' });
    svg.appendChild(referenceLine);
    const graphCursor = render.line(tf, { x: gx0, y: gy0 }, { x: gx0, y: gy0 + gh }, {
      stroke: Pal.resultant, width: 1.5, dash: '3 3', class: 'sim2-graph-cursor'
    });
    svg.appendChild(graphCursor);

    overlay.label('v (m/s)', { x: gx0 + gw, y: gy0 + gh }, { anchor: 'left', color: Pal.v });
    const lblTimeStart = overlay.label('0 s', { x: gx0, y: gy0 - 0.15 }, { anchor: 'top' });
    const lblTimeEnd = overlay.label('2,8 s', { x: gx0 + gw, y: gy0 - 0.15 }, { anchor: 'top' });
    const lblVMax = overlay.label('', { x: gx0 - 0.15, y: gy0 + gh }, { anchor: 'right', color: Pal.v });
    const lblBox = overlay.label('m', { x: 0, y: 0.6 }, { anchor: 'center', color: Pal.a });

    let t = 0, vData = [], reference = null;
    const tMax = 2.8, VELOCITY_MAX = 56, POSITION_SCALE = 0.4;
    // One immutable SI scale for every allowed F/m, including reference A.
    for (let i = 0; i <= 4; i++) {
      const x = gx0 + gw * i / 4, y = gy0 + gh * i / 4;
      svg.appendChild(render.line(tf, { x, y: gy0 }, { x, y: gy0 + gh }, { stroke: Pal.grid, width: 0.5, dash: '2 3' }));
      if (i < 4) overlay.label((VELOCITY_MAX * i / 4).toFixed(0), { x: gx0 - 0.12, y }, { anchor: 'right' });
      if (i > 0 && i < 4) overlay.label((tMax * i / 4).toFixed(1), { x, y: gy0 - 0.15 }, { anchor: 'top' });
    }
    function accel() { return D.accelerationFromForce(params.F, params.m); }
    function reset() { t = 0; vData = [{ t: 0, v: 0 }]; shell.resetClock(); draw(); }
    function draw() {
      const a = accel(), vMax = VELOCITY_MAX;
      const graphStart = 0;
      const x = 0.5 * a * t * t;
      const v = a * t;
      const displayX = POSITION_SCALE * x;
      const cx = 0.2 + (displayX % 8.5);
      lblTimeStart.textContent = graphStart.toFixed(1) + ' s';
      lblTimeEnd.textContent = (graphStart + tMax).toFixed(1) + ' s';
      lblVMax.textContent = vMax.toFixed(1);
      overlay.moveLabel(lblTimeStart, { x: gx0, y: gy0 - 0.15 });
      overlay.moveLabel(lblTimeEnd, { x: gx0 + gw, y: gy0 - 0.15 });
      overlay.moveLabel(lblVMax, { x: gx0 - 0.15, y: gy0 + gh });
      box.setAttribute('points', [
        { x: cx, y: 0 }, { x: cx + 0.8, y: 0 }, { x: cx + 0.8, y: 0.8 }, { x: cx, y: 0.8 }
      ].map(p => { const s = tf.toScreen(p); return `${s.x},${s.y}`; }).join(' '));
      const fb = tf.toScreen({ x: cx + 0.8, y: 0.4 }), ft = tf.toScreen({ x: cx + 2, y: 0.4 });
      fArrow.setAttribute('x1', fb.x); fArrow.setAttribute('y1', fb.y);
      fArrow.setAttribute('x2', ft.x); fArrow.setAttribute('y2', ft.y);
      overlay.moveLabel(lblBox, { x: cx + 0.4, y: 1.2 });
      const pts = vData.map(d => {
        const gx = gx0 + ((d.t - graphStart) / tMax) * gw, gy = gy0 + (d.v / vMax) * gh;
        const s = tf.toScreen({ x: gx, y: gy }); return `${s.x},${s.y}`;
      }).join(' ');
      graphLine.setAttribute('points', pts);
      referenceLine.setAttribute('points', reference ? reference.data.map(d => {
        const p = tf.toScreen({ x: gx0 + d.t / tMax * gw, y: gy0 + d.v / VELOCITY_MAX * gh });
        return `${p.x},${p.y}`;
      }).join(' ') : '');
      const c0 = tf.toScreen({ x: gx0 + Math.min(1, t / tMax) * gw, y: gy0 });
      const c1 = tf.toScreen({ x: gx0 + Math.min(1, t / tMax) * gw, y: gy0 + gh });
      graphCursor.setAttribute('x1', c0.x); graphCursor.setAttribute('y1', c0.y);
      graphCursor.setAttribute('x2', c1.x); graphCursor.setAttribute('y2', c1.y);
      panel.setReadout([
        { key: 'F', label: 'F:', value: params.F + ' N' },
        { key: 'm', label: 'm:', value: params.m + ' kg' },
        { key: 'a', label: 'a = F/m:', value: a.toFixed(1) + ' m/s²' },
        { key: 't', label: 't:', value: t.toFixed(2) + ' s' },
        { key: 'x', label: 'x(t):', value: x.toFixed(4) + ' m' },
        { key: 'v', label: 'v(t):', value: v.toFixed(4) + ' m/s' },
        { key: 'reference', label: 'Lần A (nét đứt):', value: reference ? `F=${reference.F} N, m=${reference.m} kg; t≤${reference.end.toFixed(2)} s` : 'Chưa lưu; lần B là nét liền' },
        { key: 'graphScale', label: 'Thang chung A/B:', value: '0–56 m/s; t=0–2,8 s cố định' },
        { key: 'sample', label: 'Mẫu (t; x; v; a):', value: `${t.toFixed(2)} s; ${x.toFixed(3)} m; ${v.toFixed(3)} m/s; ${a.toFixed(3)} m/s²` }
      ]);
    }
    function update(dt) {
      t += dt;
      if (t <= tMax + 1e-10) vData.push({ t: Math.min(t,tMax), v: accel() * Math.min(t,tMax) });
      else if (vData[vData.length - 1].t < tMax) vData.push({ t: tMax, v: accel() * tMax });
      // Keep the fixed comparison interval while physical time continues.
      if (vData.length > 170) vData.splice(1, vData.length - 170);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#e03030}{F} = \\textcolor{#0074d9}{m} \\cdot a', 'a = \\dfrac{F}{m}'],
      legend: [{ color: Pal.force, label: 'F (lực)' }, { color: Pal.a, label: 'vật m' }, { color: Pal.v, label: 'v(t)' }],
      observe: 'Lực hằng, không ma sát, x₀=v₀=0; chiều phải dương. Đổi F/m đặt lại lần B. Lưu A rồi đổi tham số để so cùng thang cố định 0–2,8 s; đồ thị giữ mẫu sau cửa sổ, t vật lý vẫn tăng. Hình thu x theo 0,4 và lặp làn; mũi tên F chỉ ký hiệu, không đo lực.'
    });

    shell.addControls({
      actions: [
        { id: 'capture-reference', label: 'Lưu lần A để so sánh', onClick: () => { reference = { F: params.F, m: params.m, end: Math.min(t,tMax), data: vData.map(p=>({...p})) }; draw(); } },
        { id: 'clear-reference', label: 'Xóa lần A', onClick: () => { reference = null; draw(); } }
      ],
      sliders: [
        { id: 'F', label: 'F', min: 2, max: 20, step: 1, value: params.F, unit: 'N',
          onInput: v => { params.F = v; reset(); } },
        { id: 'm', label: 'm', min: 1, max: 6, step: 0.5, value: params.m, unit: 'kg',
          onInput: v => { params.m = v; reset(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(), onPause: () => shell.stop(),
        onStep: () => shell.stepOnce(), onReset: () => { shell.stop(); reset(); }
      }
    });

    reset();
    shell.onFrame(update, draw);
    shell.stop();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
