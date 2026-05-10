/**
 * ch3-7-4: Restitution Coefficient
 * Demonstrates the coefficient of restitution e in 1D collision.
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
    viewport.className = 'sim-viewport-v2';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.className = 'sim-svg-v2';
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
    chartContainer.className = 'sim-chart-container-v2';
    chartContainer.appendChild(chartCanvas);
    sidebar.appendChild(chartContainer);

    const chart = new SimChart(chartCanvas, "Vận tốc vật 1", "v1 (t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 225,
      flipY: true
    });

    // Parameters
    let e = 0.8;
    let m1 = 4.0, m2 = 2.0;
    let v1 = 60, v2 = -20;
    let x1 = -200, x2 = 200;
    const r1 = 30, r2 = 25;
    let timer = 0;
    let collided = false;
    let v1p = 60, v2p = -20;

    // Visual Elements
    const ball1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball1.setAttribute('fill', '#e74c3c'); svg.appendChild(ball1);
    const ball2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball2.setAttribute('fill', '#3498db'); svg.appendChild(ball2);

    const v1Arrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c' });
    const v2Arrow = SimV2Primitives.createArrow(svg, { color: '#3498db' });

    function updateVisuals() {
      // Coordinate transform: center is (400, 225)
      ball1.setAttribute('cx', 400 + x1); ball1.setAttribute('cy', 225); ball1.setAttribute('r', r1);
      ball2.setAttribute('cx', 400 + x2); ball2.setAttribute('cy', 225); ball2.setAttribute('r', r2);
      
      const curV1 = collided ? v1p : v1;
      const curV2 = collided ? v2p : v2;
      
      v1Arrow.update(400 + x1, 225, 400 + x1 + curV1, 225);
      v2Arrow.update(400 + x2, 225, 400 + x2 + curV2, 225);
    }

    function reset() {
      x1 = -200; x2 = 200;
      collided = false;
      timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Hệ số phục hồi e', 0, 1, 0.05, (v) => { e = v; reset(); }, 0.8);
    ui.addSlider('Khối lượng m1', 1, 8, 0.5, (v) => { m1 = v; reset(); }, 4.0);
    ui.addSlider('Khối lượng m2', 1, 8, 0.5, (v) => { m2 = v; reset(); }, 2.0);
    ui.addSlider('Vận tốc v1', -100, 150, 5, (v) => { v1 = v; reset(); }, 60);

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
      
      if (!collided) {
        x1 += v1 * dt * 10;
        x2 += v2 * dt * 10;
        
        if (x2 - x1 <= r1 + r2) {
          // Collision math
          const den = m1 + m2;
          v1p = ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / den;
          v2p = ((1 + e) * m1 * v1 + (m2 - e * m1) * v2) / den;
          collided = true;
        }
      } else {
        x1 += v1p * dt * 10;
        x2 += v2p * dt * 10;
      }

      // Boundary
      if (x1 < -370 || x1 > 370) { if(!collided) v1 *= -1; else v1p *= -1; }
      if (x2 < -370 || x2 > 370) { if(!collided) v2 *= -1; else v2p *= -1; }

      timer += dt;
      updateVisuals();
      chart.updateData(timer, collided ? v1p : v1);
    };

    updateVisuals();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, v1Arrow, v2Arrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-7-4', {
      chapter: 3,
      type: 'dynamics',
      title: 'He so phuc hoi',
      hint: 'Drag e slider (0-1)'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-7-4'] = init;
})();
