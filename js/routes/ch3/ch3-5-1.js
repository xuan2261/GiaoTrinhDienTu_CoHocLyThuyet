/**
 * ch3-5-1: Impulse and Momentum Theorem
 * Demonstrates J = delta P = m * (v_after - v_before).
 * A sudden impulse J changes the momentum of a particle.
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

    const chart = new SimChart(chartCanvas, "Vận tốc v (m/s)", "v (t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Parameters
    let mass = 2.0;   // kg
    let v_init = 5.0; // m/s
    let impulse = 20; // N*s
    let posX = 100;
    let velocity = v_init;
    let timer = 0;
    let impulseApplied = false;

    // Visual Elements
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '0'); ground.setAttribute('y1', '300');
    ground.setAttribute('x2', '800'); ground.setAttribute('y2', '300');
    ground.setAttribute('stroke', '#7f8c8d'); ground.setAttribute('stroke-width', '4');
    svg.appendChild(ground);

    const impulseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    impulseLine.setAttribute('x1', '400'); impulseLine.setAttribute('y1', '250');
    impulseLine.setAttribute('x2', '400'); impulseLine.setAttribute('y2', '350');
    impulseLine.setAttribute('stroke', '#f1c40f'); impulseLine.setAttribute('stroke-width', '2');
    impulseLine.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(impulseLine);

    const ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball.setAttribute('fill', '#e74c3c'); ball.setAttribute('r', '25');
    svg.appendChild(ball);

    const vArrow = SimV2Primitives.createArrow(svg, { color: '#3498db' });
    const jArrow = SimV2Primitives.createArrow(svg, { color: '#f1c40f', strokeWidth: 4 });

    function updateVisuals() {
      ball.setAttribute('cx', posX); ball.setAttribute('cy', 275);
      ball.setAttribute('r', 15 + mass * 5);
      
      if (Math.abs(velocity) > 0.1) {
        vArrow.update(posX + 25, 275, posX + 25 + velocity * 10, 275);
      } else {
        vArrow.update(0,0,0,0);
      }

      if (!impulseApplied && posX > 350 && posX < 400) {
        jArrow.update(400 - impulse * 2, 275, 400, 275);
      } else {
        jArrow.update(0,0,0,0);
      }
    }

    function reset() {
      posX = 100;
      velocity = v_init;
      timer = 0;
      impulseApplied = false;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Khối lượng m (kg)', 0.5, 5, 0.5, (v) => { mass = v; reset(); }, 2.0);
    ui.addSlider('Vận tốc đầu v (m/s)', 1, 20, 1, (v) => { v_init = v; reset(); }, 5.0);
    ui.addSlider('Xung lượng J (N*s)', -50, 50, 5, (v) => { impulse = v; }, 20);

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
      
      if (!impulseApplied && posX >= 400) {
        velocity += impulse / mass;
        impulseApplied = true;
      }

      posX += velocity * dt * 50; // scaled
      if (posX > 850) posX = -50; // loop
      
      timer += dt;
      updateVisuals();
      
      if (engine.isRunning) {
        chart.updateData(timer, velocity);
      }
    };

    updateVisuals();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, vArrow, jArrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-5-1', {
      chapter: 3,
      type: 'dynamics',
      title: 'Xung luong - Dong luong',
      hint: 'm*dv = J'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-5-1'] = init;
})();
