/**
 * ch2-5-2 — Tâm vận tốc tức thời (IC). locateInstantCenter + instantCenterVelocity.
 * Bespoke (hình-học): kéo đầu thanh → IC dựng hình giao 2 đường pháp tuyến vận tốc.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, K = root.SimPhysicsKinematics, Pal = root.Sim2Palette;

  Reg.register('ch2-5-2', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -5, minY: -1, maxX: 5, maxY: 6.5 }, reservePanel: true,
      meta: { name: 'Tâm vận tốc tức thời (IC)', section: '5.2', chapter: 2 }
    });
    const { svg, tf, overlay, render } = shell;

    let A = { x: -2, y: 0 };
    const Llen = 5;
    const Bx = 2;
    const minAx = Bx - Llen;
    const maxAx = 1.5;
    let omega = 0.4;
    let constructionStep = 2;
    const VELOCITY_SCALE = 1;
    let axControl, omegaControl;

    const bar = render.line(tf, A, A, { stroke: Pal.axis, width: 4 }); svg.appendChild(bar);
    const vaArrow = render.arrow(tf, svg, A, A, { stroke: Pal.v, width: 2.5 }); svg.appendChild(vaArrow);
    const vbArrow = render.arrow(tf, svg, A, A, { stroke: Pal.v, width: 2.5 }); svg.appendChild(vbArrow);
    const perpA = render.line(tf, A, A, { stroke: Pal.moment, width: 1, dash: '5 4', class: 'sim2-guide-line sim2-ic-radius-guide' }); svg.appendChild(perpA);
    const perpB = render.line(tf, A, A, { stroke: Pal.moment, width: 1, dash: '5 4', class: 'sim2-guide-line sim2-ic-radius-guide' }); svg.appendChild(perpB);
    const icMark = render.circle(tf, { x: 0, y: 0 }, 5, { pixel: true, fill: Pal.force, stroke: Pal.force, class: 'sim2-current-marker' });
    svg.appendChild(icMark);

    const lblA = overlay.label('A', A, { anchor: 'right' });
    const lblB = overlay.label('B', A, { anchor: 'left' });
    const lblIC = overlay.label('P (IC)', { x: 0, y: 0 }, { anchor: 'left', color: Pal.force });

    function setLine(ln, a, b) {
      const pa = tf.toScreen(a), pb = tf.toScreen(b);
      ln.setAttribute('x1', pa.x); ln.setAttribute('y1', pa.y);
      ln.setAttribute('x2', pb.x); ln.setAttribute('y2', pb.y);
    }
    function render2() {
      const dx = Bx - A.x;
      const dyy = Math.sqrt(Math.max(0, Llen * Llen - dx * dx));
      const B = { x: Bx, y: dyy };
      setLine(bar, A, B);
      // The slider constraints place P at (Ax, By). One finite angular velocity
      // determines BOTH magnitudes, including vA=0 when A coincides with P.
      const center = { x: A.x, y: B.y };
      const vA = K.instantCenterVelocity(omega, A.x - center.x, A.y - center.y);
      const vB = K.instantCenterVelocity(omega, B.x - center.x, B.y - center.y);
      setLine(vaArrow, A, { x: A.x + VELOCITY_SCALE * vA.vx, y: A.y + VELOCITY_SCALE * vA.vy });
      setLine(vbArrow, B, { x: B.x + VELOCITY_SCALE * vB.vx, y: B.y + VELOCITY_SCALE * vB.vy });
      vaArrow.setAttribute('visibility', Math.hypot(vA.vx, vA.vy) < 1e-12 ? 'hidden' : 'visible');
      setLine(perpA, A, center);
      setLine(perpB, B, center);
      perpA.setAttribute('visibility', constructionStep >= 1 ? 'visible' : 'hidden');
      perpB.setAttribute('visibility', constructionStep >= 2 ? 'visible' : 'hidden');
      icMark.setAttribute('visibility', constructionStep >= 2 ? 'visible' : 'hidden');
      lblIC.style.visibility = constructionStep >= 2 ? 'visible' : 'hidden';
      const ic = K.locateInstantCenter(A, B, vA, vB);
      if (ic) {
        const sIC = tf.toScreen(ic);
        icMark.setAttribute('cx', sIC.x); icMark.setAttribute('cy', sIC.y);
        overlay.moveLabel(lblIC, { x: ic.x + 0.3, y: ic.y + 0.2 });
      }
      overlay.moveLabel(lblA, { x: A.x - 0.3, y: A.y - 0.3 });
      overlay.moveLabel(lblB, { x: B.x + 0.3, y: B.y });
      handle.move(A);
      if (axControl) axControl.setValue(A.x);
      if (omegaControl) omegaControl.setValue(omega);
      panel.setReadout([
        { key: 'A', label: 'A:', value: `(${A.x.toFixed(1)}, 0) m` },
        { key: 'B', label: 'B:', value: `(${B.x.toFixed(1)}, ${B.y.toFixed(1)}) m` },
        { key: 'IC', label: 'IC:', value: ic ? `(${ic.x.toFixed(1)}, ${ic.y.toFixed(1)}) m` : '∞' },
        { key: 'construction', label: 'Dựng hình:', value: ['0: xác định vA, vB', '1: pháp tuyến qua A', '2: pháp tuyến qua B; giao tại IC'][constructionStep] },
        { key: 'ICStatus', label: 'Trạng thái IC:', value: ic ? 'Tâm hữu hạn của trường vận tốc tức thời' : 'Không xác định trong dữ liệu hiện tại' },
        { key: 'PA', label: 'PA:', value: B.y.toFixed(3) + ' m' },
        { key: 'PB', label: 'PB:', value: dx.toFixed(3) + ' m' },
        { key: 'ratio', label: '|vA|/|vB| = PA/PB:', value: (B.y / dx).toFixed(3) },
        { key: 'omega', label: 'ω:', value: omega.toFixed(3) + ' rad/s' },
        { key: 'vA', label: '|v_A|:', value: Math.hypot(vA.vx, vA.vy).toFixed(2) + ' m/s' },
        { key: 'vB', label: '|v_B|:', value: Math.hypot(vB.vx, vB.vy).toFixed(2) + ' m/s' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['v_P = 0', '\\vec{v}_M = \\vec{\\omega} \\times \\vec{r}_{M/P}'],
      legend: [{ color: Pal.v, label: 'v_A, v_B' }, { color: Pal.moment, label: 'pháp tuyến v' }, { color: Pal.force, label: 'P (IC)' }],
      observe: 'Thanh cứng dài 5 m; A trượt ngang, B trượt đứng. 1: dựng pháp tuyến qua A; 2: dựng pháp tuyến qua B; giao điểm là IC. IC chỉ là tâm vận tốc tức thời, không nhất thiết bản lề cố định. ω dương ngược kim đồng hồ (0,1–0,4 rad/s để giữ cùng thang hình). Cùng thang 1 đơn vị hình/(m/s); A trùng IC thì vA = 0, ẩn mũi tên.'
    });

    const handle = shell.addHandle(A, {
      fill: Pal.handle,
      bounds: { minX: minAx, maxX: maxAx, minY: 0, maxY: 0 },
      a11y: { label: 'A.x xác định tâm vận tốc tức thời, mét', axis: 'x', min: minAx, max: maxAx, valueFromPoint: p => p.x, valueText: p => 'A.x ' + p.x.toFixed(2) + ' mét' },
      keyboardStep: { x: 0.1, y: 0 },
      onDrag(wp) {
        A = { x: Math.min(maxAx, Math.max(minAx, wp.x)), y: 0 };
        render2();
      }
    });
    axControl = shell.addNumberControl({ id: 'ax', label: 'A.x', min: minAx, max: maxAx, step: 0.1, value: A.x, unit: 'm', onInput: x => { A = { x, y: 0 }; render2(); } });
    omegaControl = shell.addNumberControl({ id: 'omega', label: 'ω', min: 0.1, max: 0.4, step: 0.01, value: omega, unit: 'rad/s', onInput: v => { omega = v; render2(); } });
    shell.addAction({ id: 'construction-step', label: 'Dựng pháp tuyến từng bước', onClick: () => { constructionStep = (constructionStep + 1) % 3; render2(); } });
    shell.addAction({ id: 'reset-geometry', label: 'Đặt lại hình học', onClick: () => { A = { x: -2, y: 0 }; omega = 0.4; constructionStep = 2; render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
