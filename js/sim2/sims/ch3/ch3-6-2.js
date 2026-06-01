/**
 * ch3-6-2 — Va chạm với hệ số phục hồi e. resolveCollision2D (port, e đúng chuẩn).
 * 2 vật va chạm trực diện; canvas vẽ VẾT (#25). Start paused; ▶/⏸/↺; slider e/m₁/m₂.
 * draw() vẽ từ p1/p2 (reset/step gọi được mà không advance); frame() = advance + draw.
 * Màu: m₁ rose (x), m₂ blue (y) — khớp legend.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-6-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -6, minY: -1.8, maxX: 6, maxY: 1.8 }, canvas: true, reservePanel: true,
      meta: { name: 'Va chạm với hệ số phục hồi e', section: '6.2', chapter: 3 }
    });
    const { svg, tf, overlay, render, canvas } = shell;
    const R1 = 0.6, R2 = 0.8;
    const params = { m1: 2, m2: 3, e: 0.7 };

    svg.appendChild(render.line(tf, { x: -6, y: -1 }, { x: 6, y: -1 }, { stroke: Pal.axis, width: 1 }));
    const b1 = render.circle(tf, { x: 0, y: 0 }, R1, { gradient: 'x', depth: true, stroke: Pal.x, width: 2 }); svg.appendChild(b1);
    const b2 = render.circle(tf, { x: 0, y: 0 }, R2, { gradient: 'y', depth: true, stroke: Pal.y, width: 2 }); svg.appendChild(b2);

    const lblM1 = overlay.label('m₁', { x: 0, y: 0 }, { anchor: 'center', color: Pal.x });
    const lblM2 = overlay.label('m₂', { x: 0, y: 0 }, { anchor: 'center', color: Pal.y });

    let p1, p2, v1, v2, trail1, trail2, collided, T0;

    function reset() {
      p1 = { x: -4, y: 0 }; p2 = { x: 3, y: 0 };
      v1 = { x: 2.2, y: 0 }; v2 = { x: -1.0, y: 0 };
      trail1 = []; trail2 = []; collided = false;
      T0 = D.kineticEnergy(params.m1, Math.hypot(v1.x, v1.y)) +
           D.kineticEnergy(params.m2, Math.hypot(v2.x, v2.y));
      draw();
    }

    function draw() {
      canvas.clear();
      canvas.drawTrail(trail1, { stroke: 'rgba(216,27,96,0.5)', width: 1.5 });
      canvas.drawTrail(trail2, { stroke: 'rgba(21,101,192,0.5)', width: 1.5 });
      const s1 = tf.toScreen(p1), s2 = tf.toScreen(p2);
      b1.setAttribute('cx', s1.x); b1.setAttribute('cy', s1.y);
      b2.setAttribute('cx', s2.x); b2.setAttribute('cy', s2.y);
      overlay.moveLabel(lblM1, p1);
      overlay.moveLabel(lblM2, p2);
      const pTot = D.momentum2d([{ m: params.m1, vx: v1.x, vy: v1.y }, { m: params.m2, vx: v2.x, vy: v2.y }]);
      const T = D.kineticEnergy(params.m1, Math.hypot(v1.x, v1.y)) +
                D.kineticEnergy(params.m2, Math.hypot(v2.x, v2.y));
      panel.setReadout([
        { label: 'p tổng:', value: pTot.x.toFixed(2) + ' kg·m/s' },
        { label: 'T tổng:', value: T.toFixed(2) + ' J' },
        { label: 'T mất:', value: Math.max(0, T0 - T).toFixed(2) + ' J' }
      ]);
    }

    function frame() {
      const dt = 1 / 60;
      p1 = { x: p1.x + v1.x * dt, y: p1.y + v1.y * dt };
      p2 = { x: p2.x + v2.x * dt, y: p2.y + v2.y * dt };
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (dist <= R1 + R2 && !collided) {
        const res = D.resolveCollision2D(params.m1, params.m2, p1, p2, v1, v2, params.e);
        v1 = res.v1; v2 = res.v2; collided = true;
      }
      if (p1.x > 6 || p2.x < -6) reset();
      trail1.push({ ...p1 }); trail2.push({ ...p2 });
      if (trail1.length > 300) { trail1.shift(); trail2.shift(); }
      draw();
    }

    const panel = shell.setTheory({
      formulas: [
        'm_1v_1 + m_2v_2 = \\text{const}',
        'e = \\dfrac{v_2\' - v_1\'}{v_1 - v_2}'
      ],
      legend: [
        { color: Pal.x, label: 'm₁' },
        { color: Pal.y, label: 'm₂' }
      ],
      observe: 'Bấm ▶ để chạy. Đổi e thấy phần động năng mất; động lượng luôn bảo toàn.'
    });

    shell.addControls({
      sliders: [
        { id: 'e', label: 'e', min: 0, max: 1, step: 0.05, value: params.e, unit: '',
          onInput: v => { params.e = v; } },
        { id: 'm1', label: 'm₁', min: 1, max: 5, step: 0.5, value: params.m1, unit: 'kg',
          onInput: v => { params.m1 = v; reset(); } },
        { id: 'm2', label: 'm₂', min: 1, max: 5, step: 0.5, value: params.m2, unit: 'kg',
          onInput: v => { params.m2 = v; reset(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(),
        onPause: () => shell.stop(),
        onStep: () => frame(),
        onReset: () => { shell.stop(); reset(); }
      }
    });

    reset();
    shell.onFrame(frame);
    shell.stop(); // start paused (RAF đã hủy; ▶ gọi start lại)
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
