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
    // Điều kiện đầu dùng chung cho reset() + predictLoss() (DRY).
    const INIT = { p1: { x: -4, y: 0 }, p2: { x: 3, y: 0 }, v1: { x: 2.2, y: 0 }, v2: { x: -1.0, y: 0 } };

    svg.appendChild(render.line(tf, { x: -6, y: -1 }, { x: 6, y: -1 }, { stroke: Pal.axis, width: 1 }));
    const b1 = render.circle(tf, { x: 0, y: 0 }, R1, { gradient: 'x', depth: true, stroke: Pal.x, width: 2 }); svg.appendChild(b1);
    const b2 = render.circle(tf, { x: 0, y: 0 }, R2, { gradient: 'y', depth: true, stroke: Pal.y, width: 2 }); svg.appendChild(b2);

    const lblM1 = overlay.label('m₁', { x: 0, y: 0 }, { anchor: 'center', color: Pal.x });
    const lblM2 = overlay.label('m₂', { x: 0, y: 0 }, { anchor: 'center', color: Pal.y });
    let impactCue = null;
    let impactState = null;

    let p1, p2, v1, v2, trail1, trail2, collided, impactPointData, T0;

    function reset() {
      p1 = { x: INIT.p1.x, y: INIT.p1.y }; p2 = { x: INIT.p2.x, y: INIT.p2.y };
      v1 = { x: INIT.v1.x, y: INIT.v1.y }; v2 = { x: INIT.v2.x, y: INIT.v2.y };
      trail1 = []; trail2 = []; collided = false; impactPointData = null;
      clearImpactCue();
      if (sim3) sim3.reset();
      T0 = D.kineticEnergy(params.m1, Math.hypot(v1.x, v1.y)) +
           D.kineticEnergy(params.m2, Math.hypot(v2.x, v2.y));
      shell.resetClock();
      draw();
    }

    // Dự đoán T mất hậu-va-chạm ở điều kiện đầu (va chạm trực diện trên y=0 → normal +x,
    // v không đổi trước va chạm nên kết quả khớp lúc va chạm thật). Dùng đúng hàm port.
    function predictLoss(e) {
      const r = D.resolveCollision2D(params.m1, params.m2, INIT.p1, INIT.p2, INIT.v1, INIT.v2, e);
      const Tin = D.kineticEnergy(params.m1, Math.hypot(INIT.v1.x, INIT.v1.y)) +
                  D.kineticEnergy(params.m2, Math.hypot(INIT.v2.x, INIT.v2.y));
      const Tout = D.kineticEnergy(params.m1, Math.hypot(r.v1.x, r.v1.y)) +
                   D.kineticEnergy(params.m2, Math.hypot(r.v2.x, r.v2.y));
      return Math.max(0, Tin - Tout);
    }

    function clearImpactCue() {
      if (impactCue && impactCue.parentNode) impactCue.parentNode.removeChild(impactCue);
      impactCue = null;
      if (impactState && impactState.parentNode) impactState.parentNode.removeChild(impactState);
      impactState = null;
    }

    function showImpactCue(worldPt) {
      clearImpactCue();
      impactCue = render.circle(tf, worldPt, 10, {
        pixel: true,
        fill: 'none',
        stroke: Pal.moment,
        width: 2.5,
        class: 'sim2-impact-cue'
      });
      svg.appendChild(impactCue);
      impactState = overlay.label('Sau va chạm', { x: worldPt.x, y: worldPt.y + 1.0 }, {
        anchor: 'bottom',
        color: Pal.moment,
        class: 'sim2-impact-state'
      });
    }

    function splitTrail(points, beforeCollision) {
      if (!beforeCollision) return { before: points, after: [] };
      const before = [], after = [];
      for (const p of points) (p.afterImpact ? after : before).push(p);
      return { before, after };
    }

    function draw() {
      canvas.clear();
      const t1 = splitTrail(trail1, collided);
      const t2 = splitTrail(trail2, collided);
      canvas.drawTrail(t1.before, { fade: true, stroke: 'rgba(216,27,96,0.35)', width: 1.3, kind: 'before' });
      canvas.drawTrail(t2.before, { fade: true, stroke: 'rgba(21,101,192,0.35)', width: 1.3, kind: 'before' });
      canvas.drawTrail(t1.after, { fade: true, stroke: 'rgba(216,27,96,0.78)', width: 2, kind: 'after' });
      canvas.drawTrail(t2.after, { fade: true, stroke: 'rgba(21,101,192,0.78)', width: 2, kind: 'after' });
      const s1 = tf.toScreen(p1), s2 = tf.toScreen(p2);
      b1.setAttribute('cx', s1.x); b1.setAttribute('cy', s1.y);
      b2.setAttribute('cx', s2.x); b2.setAttribute('cy', s2.y);
      overlay.moveLabel(lblM1, p1);
      overlay.moveLabel(lblM2, p2);
      const pTot = D.momentum2d([{ m: params.m1, vx: v1.x, vy: v1.y }, { m: params.m2, vx: v2.x, vy: v2.y }]);
      const T = D.kineticEnergy(params.m1, Math.hypot(v1.x, v1.y)) +
                D.kineticEnergy(params.m2, Math.hypot(v2.x, v2.y));
      panel.setReadout([
        { key: 'phase', label: 'Pha:', value: collided ? 'Sau va chạm' : 'Trước va chạm' },
        { key: 'momentum', label: 'p tổng:', value: pTot.x.toFixed(2) + ' kg·m/s' },
        { key: 'energy', label: 'T tổng:', value: T.toFixed(2) + ' J' },
        { key: 'energyLoss', label: 'T mất:', value: Math.max(0, T0 - T).toFixed(2) + ' J' },
        { key: 'lossPredict', label: 'ΔT dự đoán:', value: predictLoss(params.e).toFixed(2) + ' J' }
      ]);
      if (sim3) sim3.setState({
        p1, p2, v1, v2, m1: params.m1, m2: params.m2, e: params.e,
        r1: R1, r2: R2, collided, trailLength: trail1.length + trail2.length,
        impactPoint: impactPointData ? { x: impactPointData.x, y: impactPointData.y } : null
      });
    }

    function advance(seconds) {
      p1 = { x: p1.x + v1.x * seconds, y: p1.y + v1.y * seconds };
      p2 = { x: p2.x + v2.x * seconds, y: p2.y + v2.y * seconds };
    }

    function timeToContact(dt) {
      const rx = p2.x - p1.x, ry = p2.y - p1.y;
      const rvx = v2.x - v1.x, rvy = v2.y - v1.y;
      const a = rvx * rvx + rvy * rvy;
      const b = 2 * (rx * rvx + ry * rvy);
      const c = rx * rx + ry * ry - (R1 + R2) * (R1 + R2);
      if (c <= 0) return 0;
      if (a < 1e-12 || b >= 0) return null;
      const discriminant = b * b - 4 * a * c;
      if (discriminant < 0) return null;
      const hit = (-b - Math.sqrt(discriminant)) / (2 * a);
      return hit >= 0 && hit <= dt ? hit : null;
    }

    function fullyExited() {
      return p1.x + R1 < -6 || p1.x - R1 > 6 || p2.x + R2 < -6 || p2.x - R2 > 6;
    }

    function update(dt) {
      const hit = collided ? null : timeToContact(dt);
      if (hit != null) {
        advance(hit);
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const distance = Math.hypot(dx, dy) || 1;
        impactPointData = { x: p1.x + dx * R1 / distance, y: p1.y + dy * R1 / distance };
        const res = D.resolveCollision2D(params.m1, params.m2, p1, p2, v1, v2, params.e);
        v1 = res.v1; v2 = res.v2; collided = true;
        showImpactCue(impactPointData);
      } else {
        advance(dt);
      }
      if (fullyExited()) { reset(); return; }
      trail1.push({ ...p1, afterImpact: collided }); trail2.push({ ...p2, afterImpact: collided });
      if (trail1.length > 300) { trail1.shift(); trail2.shift(); }
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
    const sim3 = root.Sim3Mode && root.Sim3Ch362 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch362.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    let controls = null;
    function stopAndReset() {
      shell.stop();
      if (controls) controls.setPlaying(false);
      reset();
    }
    controls = shell.addControls({
      sliders: [
        { id: 'e', label: 'e', min: 0, max: 1, step: 0.05, value: params.e, unit: '',
          onInput: v => { params.e = v; stopAndReset(); } },
        { id: 'm1', label: 'm₁', min: 1, max: 5, step: 0.5, value: params.m1, unit: 'kg',
          onInput: v => { params.m1 = v; stopAndReset(); } },
        { id: 'm2', label: 'm₂', min: 1, max: 5, step: 0.5, value: params.m2, unit: 'kg',
          onInput: v => { params.m2 = v; stopAndReset(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(),
        onPause: () => shell.stop(),
        onStep: () => shell.stepOnce(),
        onReset: stopAndReset
      }
    });

    reset();
    shell.onFrame(update, draw);
    shell.stop(); // start paused (RAF đã hủy; ▶ gọi start lại)
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
