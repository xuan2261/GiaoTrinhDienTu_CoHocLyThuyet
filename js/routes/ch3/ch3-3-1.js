/**
 * ch3-3-1: Angular Momentum (Point mass on a string/pivot)
 * Demonstrates the principle of angular momentum for a point mass.
 * L = m * v * r = m * omega * r^2
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

    // Left Column: SVG
    const viewport = document.createElement('div');
    viewport.setAttribute('class', 'sim-viewport-v2');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.setAttribute('class', 'sim-svg-v2');
    viewport.appendChild(svg);
    layout.appendChild(viewport);

    // Right Column: Controls & Chart
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

    const chart = new SimChart(chartCanvas, "Mômen động lượng L", "L (t)");

    // Simulation Engine
    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 400,
      originY: 225,
      flipY: true
    });

    // Parameters
    let mass = 2; // kg
    let radius = 150; // px
    let omega = 2; // rad/s
    let angle = 0;

    // Visual Elements
    const pivot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivot.setAttribute('cx', '400');
    pivot.setAttribute('cy', '225');
    pivot.setAttribute('r', '6');
    pivot.setAttribute('fill', '#34495e');
    svg.appendChild(pivot);

    const string = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    string.setAttribute('stroke', '#7f8c8d');
    string.setAttribute('stroke-width', '2');
    string.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(string);

    const massEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    massEl.setAttribute('r', '15');
    massEl.setAttribute('fill', '#e74c3c');
    massEl.setAttribute('stroke', '#c0392b');
    massEl.setAttribute('stroke-width', '2');
    svg.appendChild(massEl);

    const vArrow = SimV2Primitives.createArrow(svg, { color: '#3498db' });

    // UI Controls
    ui.addSlider('Khối lượng m (kg)', 0.5, 5, 2, 0.1, (v) => {
      mass = v;
      updateVisuals();
    }, mass);

    ui.addSlider('Bán kính R (px)', 50, 200, 150, 10, (v) => {
      radius = v;
      updateVisuals();
    }, radius);

    ui.addSlider('Vận tốc góc ω (rad/s)', -10, 10, 2, 0.5, (v) => {
      omega = v;
      updateVisuals();
    }, omega);

    function updateVisuals() {
      const x = 400 + radius * Math.cos(angle);
      const y = 225 - radius * Math.sin(angle); // flipY handled by engine but we update manually here for non-body elements if needed
      
      massEl.setAttribute('cx', x);
      massEl.setAttribute('cy', y);
      massEl.setAttribute('r', 10 + mass * 2);

      string.setAttribute('x1', '400');
      string.setAttribute('y1', '225');
      string.setAttribute('x2', x);
      string.setAttribute('y2', y);

      // Tangential velocity vector
      const vx = -omega * radius * Math.sin(angle);
      const vy = -omega * radius * Math.cos(angle);
      vArrow.update(x, y, x + vx * 0.5, y + vy * 0.5);
    }

    ui.addButton('Đặt lại (Reset)', () => {
      angle = 0;
      chart.clear();
      updateVisuals();
    });

    const playBtn = ui.addButton('Chạy (Play)', () => {
      if (engine.isRunning) {
        engine.stop();
        playBtn.textContent = 'Chạy (Play)';
      } else {
        engine.start();
        playBtn.textContent = 'Dừng (Pause)';
      }
    }, true);

    let startTime = performance.now();
    engine.tick = (time) => {
      const dt = 1/60; // assume 60fps
      angle += omega * dt;
      
      updateVisuals();

      const L = mass * radius * radius * omega / 1000; // Scaled for display
      const elapsed = (time - startTime) / 1000;
      if (engine.isRunning) {
        chart.updateData(elapsed, L);
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
    window.RouteRegistry.register('ch3-3-1', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dao dong lo xo',
      hint: 'Ke A, dieu chinh k va m'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-3-1'] = init;
})();
