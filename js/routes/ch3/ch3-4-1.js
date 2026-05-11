/**
 * ch3-4-1: Center of Mass
 * Demonstrates the position of the center of mass for a system of two particles.
 * r_CM = (m1*r1 + m2*r2) / (m1 + m2)
 */
(function() {
  'use strict';

  function init(host) {
    const layout = document.createElement('div');
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = '1fr 320px';
    layout.style.gap = '20px';
    layout.style.width = '100%';
    host.appendChild(layout);

    const viewport = document.createElement('div');
    viewport.setAttribute('class', 'sim-viewport-v2');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.setAttribute('class', 'sim-svg-v2');
    viewport.appendChild(svg);
    layout.appendChild(viewport);

    const sidebar = document.createElement('div');
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.gap = '15px';
    layout.appendChild(sidebar);

    const uiContainer = document.createElement('div');
    sidebar.appendChild(uiContainer);
    const ui = new SimUI(uiContainer);

    const chartCanvas = document.createElement('canvas');
    const chartContainer = document.createElement('div');
    chartContainer.setAttribute('class', 'sim-chart-container-v2');
    chartContainer.appendChild(chartCanvas);
    sidebar.appendChild(chartContainer);

    const chart = new SimChart(chartCanvas, "Tọa độ X của khối tâm", "X_CM (t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Parameters
    let m1 = 3.0; // kg
    let m2 = 2.0; // kg
    let x1 = 200, y1 = 150;
    let x2 = 500, y2 = 300;
    let vx1 = 30, vy1 = 10;
    let vx2 = -20, vy2 = -15;
    let timer = 0;

    // Visual Elements
    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    grid.setAttribute('stroke', 'rgba(232, 236, 241, 0.05)');
    grid.setAttribute('stroke-width', '1');
    let gridD = '';
    for(let i=0; i<=800; i+=50) gridD += `M ${i} 0 L ${i} 450 `;
    for(let j=0; j<=450; j+=50) gridD += `M 0 ${j} L 800 ${j} `;
    grid.setAttribute('d', gridD);
    svg.appendChild(grid);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'rgba(201, 150, 58, 0.3)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(line);

    const ball1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball1.setAttribute('fill', '#e74c3c');
    svg.appendChild(ball1);

    const ball2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball2.setAttribute('fill', '#3498db');
    svg.appendChild(ball2);

    const comMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    comMarker.setAttribute('r', '8');
    comMarker.setAttribute('fill', 'none');
    comMarker.setAttribute('stroke', '#f1c40f');
    comMarker.setAttribute('stroke-width', '3');
    svg.appendChild(comMarker);

    const comCross1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const comCross2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    [comCross1, comCross2].forEach(l => {
      l.setAttribute('stroke', '#f1c40f');
      l.setAttribute('stroke-width', '2');
      svg.appendChild(l);
    });

    const label1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    [label1, label2].forEach(l => {
      l.setAttribute('fill', '#fff');
      l.setAttribute('font-family', 'Segoe UI');
      l.setAttribute('font-size', '12');
      l.setAttribute('text-anchor', 'middle');
      svg.appendChild(l);
    });

    function updateVisuals() {
      const mt = m1 + m2;
      const xCM = (x1 * m1 + x2 * m2) / mt;
      const yCM = (y1 * m1 + y2 * m2) / mt;

      ball1.setAttribute('cx', x1); ball1.setAttribute('cy', y1); ball1.setAttribute('r', 10 + m1 * 4);
      ball2.setAttribute('cx', x2); ball2.setAttribute('cy', y2); ball2.setAttribute('r', 10 + m2 * 4);
      
      line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      line.setAttribute('x2', x2); line.setAttribute('y2', y2);

      comMarker.setAttribute('cx', xCM); comMarker.setAttribute('cy', yCM);
      comCross1.setAttribute('x1', xCM - 12); comCross1.setAttribute('y1', yCM); comCross1.setAttribute('x2', xCM + 12); comCross1.setAttribute('y2', yCM);
      comCross2.setAttribute('x1', xCM); comCross2.setAttribute('y1', yCM - 12); comCross2.setAttribute('x2', xCM); comCross2.setAttribute('y2', yCM + 12);

      label1.setAttribute('x', x1); label1.setAttribute('y', y1 + 4); label1.textContent = `m1`;
      label2.setAttribute('x', x2); label2.setAttribute('y', y2 + 4); label2.textContent = `m2`;
    }

    function reset() {
      x1 = 200; y1 = 150; x2 = 500; y2 = 300;
      vx1 = 30; vy1 = 10; vx2 = -20; vy2 = -15;
      timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Khối lượng m1 (kg)', 1, 10, 0.5, (v) => { m1 = v; updateVisuals(); }, 3.0);
    ui.addSlider('Khối lượng m2 (kg)', 1, 10, 0.5, (v) => { m2 = v; updateVisuals(); }, 2.0);

    ui.addButton('Đặt lại (Reset)', reset);
    const playBtn = ui.addButton('Chạy (Play)', () => {
      if (engine.isRunning) {
        engine.stop();
        playBtn.textContent = 'Tiếp tục (Resume)';
      } else {
        engine.start();
        playBtn.textContent = 'Dừng (Pause)';
      }
    }, true);

    engine.tick = (time) => {
      const dt = 1/60;
      x1 += vx1 * dt; y1 += vy1 * dt;
      x2 += vx2 * dt; y2 += vy2 * dt;
      
      // Boundary check
      if (x1 < 50 || x1 > 750) vx1 *= -1;
      if (y1 < 50 || y1 > 400) vy1 *= -1;
      if (x2 < 50 || x2 > 750) vx2 *= -1;
      if (y2 < 50 || y2 > 400) vy2 *= -1;

      timer += dt;
      updateVisuals();
      
      if (engine.isRunning) {
        const mt = m1 + m2;
        const xCM = (x1 * m1 + x2 * m2) / mt;
        chart.updateData(timer, xCM);
      }
    };

    updateVisuals();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-4-1', {
      chapter: 3,
      type: 'dynamics',
      title: 'Khoi tam 2 chat diem',
      hint: 'Ke 2 chat diem, xem khoi tam'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-4-1'] = init;
})();
