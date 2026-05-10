/**
 * ch3-7-5: Restitution (Energy Analysis)
 * Analyzes kinetic energy loss during collision based on coefficient of restitution e.
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

    const chart = new SimChart(chartCanvas, "Động năng hệ", "K (t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 225,
      flipY: true
    });

    // Parameters
    let e = 0.5;
    let m1 = 4.0, m2 = 2.0;
    let v1 = 80, v2 = 0;
    let x1 = -250, x2 = 50;
    const r1 = 30, r2 = 25;
    let timer = 0;
    let collided = false;
    let v1p = 0, v2p = 0;

    // Visual Elements
    const ball1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball1.setAttribute('fill', '#e74c3c'); svg.appendChild(ball1);
    const ball2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball2.setAttribute('fill', '#3498db'); svg.appendChild(ball2);

    const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    infoText.setAttribute('x', 400); infoText.setAttribute('y', 380);
    infoText.setAttribute('text-anchor', 'middle');
    infoText.setAttribute('fill', '#c9963a');
    infoText.setAttribute('font-family', 'Segoe UI');
    infoText.setAttribute('font-weight', 'bold');
    svg.appendChild(infoText);

    function updateVisuals() {
      ball1.setAttribute('cx', 400 + x1); ball1.setAttribute('cy', 225); ball1.setAttribute('r', r1);
      ball2.setAttribute('cx', 400 + x2); ball2.setAttribute('cy', 225); ball2.setAttribute('r', r2);
      
      const K_before = 0.5 * m1 * v1**2 + 0.5 * m2 * v2**2;
      const K_after = collided ? (0.5 * m1 * v1p**2 + 0.5 * m2 * v2p**2) : K_before;
      const dK = K_before - K_after;
      
      infoText.textContent = `ΔK = ${dK.toFixed(0)} J (${((dK/K_before)*100).toFixed(1)}% loss)`;
    }

    function reset() {
      x1 = -250; x2 = 50;
      collided = false;
      timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Hệ số phục hồi e', 0, 1, 0.01, (v) => { e = v; reset(); }, 0.5);
    ui.addSlider('Vận tốc v1', 20, 150, 5, (v) => { v1 = v; reset(); }, 80);

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
          const den = m1 + m2;
          v1p = ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / den;
          v2p = ((1 + e) * m1 * v1 + (m2 - e * m1) * v2) / den;
          collided = true;
        }
      } else {
        x1 += v1p * dt * 10;
        x2 += v2p * dt * 10;
      }

      timer += dt;
      updateVisuals();
      
      const curK = collided ? (0.5 * m1 * v1p**2 + 0.5 * m2 * v2p**2) : (0.5 * m1 * v1**2 + 0.5 * m2 * v2**2);
      chart.updateData(timer, curK / 100);
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
    window.RouteRegistry.register('ch3-7-5', {
      chapter: 3,
      type: 'dynamics',
      title: 'He so phuc hoi (nang luong)',
      hint: 'Energy bar + finer e control'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-7-5'] = init;
})();
