/**
 * ch1-2-3 — Hình bình hành lực (2 lực đồng quy). R = F1 + F2.
 * Bespoke (hình-học): kéo đầu 2 véc tơ → hợp lực R theo quy tắc hình bình hành cập nhật realtime.
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, Pal = root.Sim2Palette;

  Reg.register('ch1-2-3', function(container) {
    const shell = Shell.createSimShell({
      container, worldBox: { minX: -1, minY: -1, maxX: 6, maxY: 6 }, reservePanel: true,
      meta: { name: 'Hình bình hành lực (2 đồng quy)', section: '2.3', chapter: 1 }
    });
    const { svg, tf, overlay, render } = shell;
    const VIS = 0.04;
    const O = { x: 0, y: 0 };

    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 6, y: 0 }, { stroke: Pal.axis, width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: -1 }, { x: 0, y: 6 }, { stroke: Pal.axis, width: 1 }));

    let f1 = { fx: 80, fy: 20 }, f2 = { fx: 25, fy: 70 };
    const a1 = render.arrow(tf, svg, O, O, { stroke: Pal.x, width: 2.5 }); svg.appendChild(a1);
    const a2 = render.arrow(tf, svg, O, O, { stroke: Pal.y, width: 2.5 }); svg.appendChild(a2);
    const aR = render.arrow(tf, svg, O, O, { stroke: Pal.resultant, width: 3.5 }); svg.appendChild(aR);
    const e1 = render.line(tf, O, O, { stroke: Pal.grid, width: 1, dash: '4 3' }); svg.appendChild(e1);
    const e2 = render.line(tf, O, O, { stroke: Pal.grid, width: 1, dash: '4 3' }); svg.appendChild(e2);

    const lF1 = overlay.label('F₁', O, { anchor: 'left', color: Pal.x });
    const lF2 = overlay.label('F₂', O, { anchor: 'left', color: Pal.y });
    const lR = overlay.label('R', O, { anchor: 'left', color: Pal.resultant });

    function set(ar, base, tip) {
      const b = tf.toScreen(base), t = tf.toScreen(tip);
      ar.setAttribute('x1', b.x); ar.setAttribute('y1', b.y);
      ar.setAttribute('x2', t.x); ar.setAttribute('y2', t.y);
    }
    function render2() {
      const t1 = { x: f1.fx * VIS, y: f1.fy * VIS };
      const t2 = { x: f2.fx * VIS, y: f2.fy * VIS };
      const tR = { x: t1.x + t2.x, y: t1.y + t2.y };
      set(a1, O, t1); set(a2, O, t2); set(aR, O, tR);
      set(e1, t1, tR); set(e2, t2, tR);
      overlay.moveLabel(lF1, { x: t1.x + 0.3, y: t1.y });
      overlay.moveLabel(lF2, { x: t2.x + 0.3, y: t2.y });
      overlay.moveLabel(lR, { x: tR.x + 0.3, y: tR.y + 0.2 });
      h1.move(t1); h2.move(t2);
      const Rx = f1.fx + f2.fx, Ry = f1.fy + f2.fy;
      const m1 = Math.hypot(f1.fx, f1.fy), m2 = Math.hypot(f2.fx, f2.fy);
      // guard: kéo lực về gốc (m=0) → tránh acos(0/0)=NaN ở readout góc
      const cosA = (m1 > 1e-9 && m2 > 1e-9) ? (f1.fx * f2.fx + f1.fy * f2.fy) / (m1 * m2) : 1;
      const ang = Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI;
      panel.setReadout([
        { key: 'F1', label: '|F₁|:', value: m1.toFixed(0) + ' N' },
        { key: 'F2', label: '|F₂|:', value: m2.toFixed(0) + ' N' },
        { key: 'angle', label: '∠(F₁,F₂):', value: ang.toFixed(0) + '°' },
        { key: 'R', label: '|R|:', value: Math.hypot(Rx, Ry).toFixed(1) + ' N' }
      ]);
    }

    const panel = shell.setTheory({
      formulas: ['\\textcolor{#e06a00}{\\vec{R}} = \\textcolor{#d81b60}{\\vec{F_1}} + \\textcolor{#1565c0}{\\vec{F_2}}'],
      legend: [{ color: Pal.x, label: 'F₁' }, { color: Pal.y, label: 'F₂' }, { color: Pal.resultant, label: 'R' }],
      observe: 'Kéo đầu 2 véc tơ; hợp lực R là đường chéo hình bình hành dựng từ F₁, F₂.'
    });

    const h1 = shell.addHandle({ x: f1.fx * VIS, y: f1.fy * VIS }, {
      fill: Pal.handle,
      a11y: { label: 'Đầu vectơ lực thứ nhất', axis: 'both' },
      keyboardStep: { x: VIS, y: VIS },
      onDrag(wp) {
        f1.fx = Math.max(0, Math.min(5.5 - f2.fx * VIS, wp.x)) / VIS;
        f1.fy = Math.max(0, Math.min(5.5 - f2.fy * VIS, wp.y)) / VIS;
        render2();
      }
    });
    const h2 = shell.addHandle({ x: f2.fx * VIS, y: f2.fy * VIS }, {
      fill: Pal.handle,
      a11y: { label: 'Đầu vectơ lực thứ hai', axis: 'both' },
      keyboardStep: { x: VIS, y: VIS },
      onDrag(wp) {
        f2.fx = Math.max(0, Math.min(5.5 - f1.fx * VIS, wp.x)) / VIS;
        f2.fy = Math.max(0, Math.min(5.5 - f1.fy * VIS, wp.y)) / VIS;
        render2();
      }
    });
    render2();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
