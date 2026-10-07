/**
 * ch2-5-3 — Phân bố vận tốc điểm trên vật rắn. instantCenterVelocity (field).
 * Slider ω có dấu + kéo IC (field tĩnh, vẽ lại khi đổi). Canvas vẽ TRƯỜNG vận tốc (#17);
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
    let icxControl, icyControl, controls;
    let fieldCapCount = 0;
    const measurementPoints = [{ x: -2, y: -1 }, { x: 0, y: 0 }, { x: 2, y: 1.5 }];

    const icMark = render.circle(tf, IC, 6, { pixel: true, fill: Pal.force, stroke: Pal.force, class: 'sim2-current-marker' });
    svg.appendChild(icMark);
    const sampMark = render.circle(tf, { x: 2, y: 1.5 }, 5, { pixel: true, fill: Pal.a, stroke: Pal.a });
    svg.appendChild(sampMark);
    const sampV = render.arrow(tf, svg, { x: 0, y: 0 }, { x: 0, y: 0 }, { stroke: Pal.v, width: 2.5, class: 'sim2-vector-vrel' });
    const radiusGuide = render.line(tf, IC, { x: 2, y: 1.5 }, { stroke: Pal.moment, width: 1, dash: '5 4', class: 'sim2-guide-line sim2-ic-radius-guide' });
    svg.appendChild(radiusGuide);
    svg.appendChild(sampV);

    const lblIC = overlay.label('P (IC)', IC, { anchor: 'left', color: Pal.force });
    const lblSamp = overlay.label('M', { x: 2, y: 1.5 }, { anchor: 'left', color: Pal.a });

    const samp = { x: 2, y: 1.5 };
    function setArrow(ar, base, tip) {
      const b = tf.toScreen(base), tp = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', tp.x); ar.setAttribute('y2', tp.y);
    }
    function clampVector(v, maxLength) {
      const length = Math.hypot(v.vx, v.vy);
      if (length <= maxLength || length < 1e-9) return v;
      const scale = maxLength / length;
      return { vx: v.vx * scale, vy: v.vy * scale };
    }
    function drawField() {
      canvas.clear(); fieldCapCount = 0;
      const VS = 0.18;
      for (let gx = -4; gx <= 4; gx += 1) {
        for (let gy = -3; gy <= 3; gy += 1) {
          const rx = gx - IC.x, ry = gy - IC.y;
          const v = K.instantCenterVelocity(params.omega, rx, ry);
          if (Math.hypot(v.vx, v.vy) * VS > 0.9) fieldCapCount += 1;
          const displayV = clampVector({ vx: v.vx * VS, vy: v.vy * VS }, 0.9);
          canvas.segment({ x: gx, y: gy }, { x: gx + displayV.vx, y: gy + displayV.vy },
            { stroke: 'rgba(21,156,58,0.55)', width: 1 });
          canvas.dot({ x: gx, y: gy }, { r: 1.5, fill: 'rgba(21,156,58,0.7)' });
        }
      }
    }
    function render2() {
      drawField();
      const sIC = tf.toScreen(IC);
      icMark.setAttribute('cx', sIC.x); icMark.setAttribute('cy', sIC.y);
      setArrow(radiusGuide, IC, samp);
      const rx = samp.x - IC.x, ry = samp.y - IC.y;
      const v = K.instantCenterVelocity(params.omega, rx, ry);
      const displayV = clampVector({ vx: v.vx * 0.4, vy: v.vy * 0.4 }, 1.8);
      setArrow(sampV, samp, { x: samp.x + displayV.vx, y: samp.y + displayV.vy });
      const radius = Math.hypot(rx, ry);
      const vMag = Math.hypot(v.vx, v.vy);
      const rotationDirection = params.omega > 0 ? 'ccw' : params.omega < 0 ? 'cw' : 'rest';
      sampV.setAttribute('visibility', vMag > 0 ? 'visible' : 'hidden');
      lblIC.textContent = params.omega === 0 ? 'P (mốc)' : 'P (IC)';
      const measurements = measurementPoints.map(point => {
        const rx = point.x - IC.x, ry = point.y - IC.y;
        return { point, radius: Math.hypot(rx, ry), velocity: { x: -params.omega * ry, y: params.omega * rx } };
      });
      if (icxControl) icxControl.setValue(IC.x);
      if (icyControl) icyControl.setValue(IC.y);
      overlay.moveLabel(lblIC, { x: IC.x + 0.3, y: IC.y - 0.3 });
      overlay.moveLabel(lblSamp, { x: samp.x + 0.3, y: samp.y });
      handle.move(IC);
      panel.setReadout([
        { key: 'omega', label: 'ω:', value: params.omega.toFixed(2) + ' rad/s' },
        { key: 'direction', label: 'Chiều quay:', value: rotationDirection === 'ccw' ? 'Ngược kim đồng hồ (CCW)' : rotationDirection === 'cw' ? 'Cùng kim đồng hồ (CW)' : 'Đứng yên (ω = 0)' },
        { key: 'r', label: 'r(M,IC):', value: radius.toFixed(3) + ' m' },
        { key: 'vM', label: '|v_M|:', value: vMag.toFixed(3) + ' m/s' },
        { key: 'vx', label: 'vM,x:', value: v.vx.toFixed(3) + ' m/s' },
        { key: 'vy', label: 'vM,y:', value: v.vy.toFixed(3) + ' m/s' },
        { key: 'sampleDirection', label: 'Hướng vM:', value: vMag > 0 ? 'Tiếp tuyến, vuông góc PM' : 'vM = 0; hướng không xác định' },
        { key: 'IC', label: 'IC (x,y):', value: '(' + IC.x.toFixed(2) + ', ' + IC.y.toFixed(2) + ') m' },
        { key: 'ICStatus', label: 'Ý nghĩa P:', value: params.omega === 0 ? 'IC không duy nhất: mọi điểm có v = 0; P là mốc chọn' : 'IC hữu hạn, duy nhất trong trường này' },
        { key: 'fieldCap', label: 'Trường 2D rút ngắn:', value: fieldCapCount + '/63 vectơ; số đọc không cap' },
        { key: 'cap', label: 'M rút ngắn:', value: '2D ' + (vMag * 0.4 > 1.8 ? 'có' : 'không') + '; 3D ' + (vMag * 0.24 > 2.2 ? 'có' : 'không') },
        ...measurements.map((m, i) => ({ key: 'measurement' + i, label: '(' + m.point.x + ',' + m.point.y + ') m:', value: 'r=' + m.radius.toFixed(3) + ' m; v=(' + m.velocity.x.toFixed(3) + ', ' + m.velocity.y.toFixed(3) + ') m/s' }))
      ]);
      if (sim3) sim3.setState({
        omega: params.omega, rotationDirection, measurements,
        ic: { x: IC.x, y: IC.y },
        sample: { x: samp.x, y: samp.y },
        radius,
        vM: { vx: v.vx, vy: v.vy, mag: vMag }
      });
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#159c3a}{\\vec{v}_M} = \\vec{\\omega} \\times \\vec{r}_{M/P}', '|v_M| = |\\omega| \\cdot r_{M/P}'],
      legend: [{ color: Pal.force, label: 'P (IC)' }, { color: Pal.v, label: 'trường vận tốc' }, { color: Pal.a, label: 'điểm M' }],
      observe: 'IC là tâm vận tốc tức thời, không nhất thiết bản lề cố định hay nằm trong vật. Quy ước x sang phải, y lên trên; 3D dùng mặt phẳng XY, trục ω là Z. Nhìn từ phía +Z về mặt phẳng: ω dương ngược kim đồng hồ (CCW), âm cùng kim đồng hồ (CW); điểm M cố định (2;1,5) m. Đây là trường tức thời với v(P)=0, không mô phỏng quay theo thời gian. ω=0: mọi vận tốc bằng 0, IC không duy nhất; không phải mô hình tịnh tiến. Thử đảo dấu ω khi giữ IC: dự đoán vx,vy đổi dấu nhưng tốc độ không đổi; rồi chọn đứng yên và đối chiếu bảng. Chấm của trường 2D là gốc, đoạn đi về đầu vận tốc. Thang 2D: M ×0,4 cap 1,8; trường ×0,18 cap 0,9. 3D: vị trí ×0,55; M ×0,24, trường ×0,14, cap 2,2. Các bảng luôn dùng SI chưa cap; độ dài chính/nền không cùng thang.'
    });
    const sim3 = root.Sim3Mode && root.Sim3Ch253 ? root.Sim3Mode.attach({
      container,
      shell2dRoot: shell.root,
      create3d: ctx => root.Sim3Ch253.create({ host: ctx.host, referenceEl: shell.root, onFallback: ctx.onFallback })
    }) : null;
    if (sim3) shell.addCleanup(() => sim3.dispose());

    controls = shell.addControls({
      sliders: [
        { id: 'omega', label: 'ω (có dấu)', min: -2.5, max: 2.5, step: 0.1, value: params.omega, unit: 'rad/s',
          onInput: v => { params.omega = v; render2(); } }
      ]
    });

    const handle = shell.addHandle(IC, {
      fill: Pal.handle,
      bounds: { minX: -4, maxX: 4, minY: -3, maxY: 3 },
      a11y: { label: 'Tâm vận tốc tức thời, tọa độ mét', axis: 'both', valueText: p => 'IC x ' + p.x.toFixed(2) + ' mét, y ' + p.y.toFixed(2) + ' mét' },
      keyboardStep: { x: 0.1, y: 0.1 },
      onDrag(wp) {
        IC = { x: Math.min(4, Math.max(-4, wp.x)), y: Math.min(3, Math.max(-3, wp.y)) };
        render2();
      }
    });
    icxControl = shell.addNumberControl({ id: 'icx', label: 'IC.x', min: -4, max: 4, step: 0.1, value: IC.x, unit: 'm', onInput: x => { IC = { x, y: IC.y }; render2(); } });
    icyControl = shell.addNumberControl({ id: 'icy', label: 'IC.y', min: -3, max: 3, step: 0.1, value: IC.y, unit: 'm', onInput: y => { IC = { x: IC.x, y }; render2(); } });
    shell.addAction({ id: 'zero-sample', label: 'Đặt IC tại M (vM = 0)', onClick: () => { IC = { ...samp }; render2(); } });
    shell.addAction({ id: 'reverse-omega', label: 'Đảo chiều ω (giữ |ω|)', onClick: () => { params.omega = params.omega === 0 ? 0 : -params.omega; controls.setValue('omega', params.omega); render2(); } });
    shell.addAction({ id: 'rest-field', label: 'Đứng yên (ω = 0)', onClick: () => { params.omega = 0; controls.setValue('omega', 0); render2(); } });
    shell.addAction({ id: 'reset-field', label: 'Đặt lại trường', onClick: () => { IC = { x: -1, y: -1 }; params.omega = 1; controls.setValue('omega', 1); render2(); } });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
