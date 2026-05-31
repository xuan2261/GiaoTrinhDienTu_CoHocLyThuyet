/**
 * hello-sim — demo P1 chứng minh engine: SVG vector + HTML label + readout, dispose sạch.
 * Route tạm 'sim2-hello' (scaffold, gỡ ở P5 — không thuộc 25 route chính thức).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry;
  const Shell = root.Sim2Shell;
  const Phys = root.SimPhysicsStatics;

  Reg.register('sim2-hello', function(container) {
    const shell = Shell.createSimShell({
      container,
      worldBox: { minX: -1, minY: -1, maxX: 6, maxY: 5 }
    });
    const { svg, tf, overlay, render } = shell;

    // Trục
    svg.appendChild(render.line(tf, { x: -1, y: 0 }, { x: 6, y: 0 }, { stroke: '#bbb', width: 1 }));
    svg.appendChild(render.line(tf, { x: 0, y: -1 }, { x: 0, y: 5 }, { stroke: '#bbb', width: 1 }));

    // Véc tơ lực F tại gốc, độ lớn 100N, góc 30°
    const F = 100, alphaDeg = 30;
    const comp = Phys.resolveForceComponents(F, alphaDeg);
    const scaleVis = 0.04; // 100N → 4 đơn vị world
    const tip = { x: comp.fx * scaleVis, y: comp.fy * scaleVis };

    svg.appendChild(render.arrow(tf, svg, { x: 0, y: 0 }, tip, { stroke: '#2a6', width: 3 }));

    // Nhãn HTML overlay (DOM, không vẽ trong SVG)
    overlay.label('F = 100 N', tip, { anchor: 'left', color: '#178' });
    overlay.label('O', { x: 0, y: 0 }, { anchor: 'right' });

    // Readout card
    overlay.readoutCard([
      { label: 'Fx:', value: comp.fx.toFixed(1) + ' N' },
      { label: 'Fy:', value: comp.fy.toFixed(1) + ' N' },
      { label: 'α:', value: alphaDeg + '°' }
    ]);

    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
