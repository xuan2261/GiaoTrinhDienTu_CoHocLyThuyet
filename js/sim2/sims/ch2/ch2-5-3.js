/**
 * ch2-5-3 — Phân bố vận tốc điểm trên vật rắn. instantCenterVelocity (field).
 * Slider ω + kéo IC (field tĩnh, vẽ lại khi đổi). Canvas vẽ TRƯỜNG vận tốc (#17);
 * v_M tỉ lệ khoảng cách tới IC. SVG vẽ IC + điểm mẫu; nhãn DOM.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-5-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -4, maxX: 5, maxY: 4 }, canvas: true, reservePanel: true,
      meta: { name: 'Phân bố vận tốc điểm trên vật rắn', section: '5.3', chapter: 2 }
    });
    const { svg, tf, overlay, render, canvas } = shell;
    let IC = { x: -1, y: -1 };
    const params = { omega: 1.0 };

    const icMark = render.circle(tf, IC, 6, { pixel: true, fill: Pal.force, stroke: Pal.force });
    svg.appendChild(icMark);
    const sampMark = render.circle(tf, { x: 2, y: 1.5 }, 5, { pixel: true, fill: Pal.a, stroke: Pal.a });
    svg.appendChild(sampMark);
    const sampV = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.v, width: 2.5 });
    svg.appendChild(sampV);

    const lblIC = overlay.label('P (IC)', IC, { anchor: 'left', color: Pal.force });
    const lblSamp = overlay.label('M', { x: 2, y: 1.5 }, { anchor: 'left', color: Pal.a });

    const samp = { x: 2, y: 1.5 };
    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), tp = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', tp.x); ar.setAttribute('y2', tp.y);
    }
    function drawField() {
      canvas.clear();
      const VS = 0.18;
      for (let gx = -4; gx <= 4; gx += 1) {
        for (let gy = -3; gy <= 3; gy += 1) {
          const rx = gx - IC.x, ry = gy - IC.y;
          const v = K.instantCenterVelocity(params.omega, rx, ry);
          canvas.segment({ x: gx, y: gy }, { x: gx + v.vx * VS, y: gy + v.vy * VS },
            { stroke: 'rgba(21,156,58,0.55)', width: 1 });
          canvas.dot({ x: gx, y: gy }, { r: 1.5, fill: 'rgba(21,156,58,0.7)' });
        }
      }
    }
    function render2() {
      drawField();
      const sIC = tf.toScreen(IC);
      icMark.setAttribute('cx', sIC.x); icMark.setAttribute('cy', sIC.y);
      const rx = samp.x - IC.x, ry = samp.y - IC.y;
      const v = K.instantCenterVelocity(params.omega, rx, ry);
      const VS = 0.4;
      setArrow(sampV, samp, { x: samp.x + v.vx * VS, y: samp.y + v.vy * VS });
      overlay.moveLabel(lblIC, { x: IC.x + 0.3, y: IC.y - 0.3 });
      overlay.moveLabel(lblSamp, { x: samp.x + 0.3, y: samp.y });
      handle.move(IC);
      panel.setReadout([
        { label: 'ω:', value: params.omega.toFixed(2) + ' rad/s' },
        { label: 'r(M,IC):', value: Math.hypot(rx, ry).toFixed(2) },
        { label: '|v_M|:', value: Math.hypot(v.vx, v.vy).toFixed(2) }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#159c3a}{\\vec{v}_M} = \\vec{\\omega} \\times \\vec{r}_{M/P}', '|v_M| = \\omega \\cdot r_{M/P}'],
      legend: [{ color: Pal.force, label: 'P (IC)' }, { color: Pal.v, label: 'trường vận tốc' }, { color: Pal.a, label: 'điểm M' }],
      observe: 'Kéo IC hoặc đổi ω; vận tốc mỗi điểm tỉ lệ khoảng cách tới tâm tức thời P.'
    });

    shell.addControls({
      sliders: [
        { id: 'omega', label: 'ω', min: 0.3, max: 2.5, step: 0.1, value: params.omega, unit: 'rad/s',
          onInput: v => { params.omega = v; render2(); } }
      ]
    });

    const handle = shell.addHandle(IC, {
      fill: Pal.handle,
      onDrag(wp) {
        IC = { x: Math.min(4, Math.max(-4, wp.x)), y: Math.min(3, Math.max(-3, wp.y)) };
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
