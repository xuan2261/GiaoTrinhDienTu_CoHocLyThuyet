/**
 * ch3-5-2: Angular Impulse and Momentum
 * Demonstrates H = delta L = I * (omega_after - omega_before).
 * An angular impulse H changes the angular momentum of a rotating body.
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

    const chart = new SimChart(chartCanvas, "Momen động lượng L", "L (t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 400,
      originY: 225,
      flipY: false
    });

    // Parameters
    let inertia = 1.0; // kg*m2
    let omega = 2.0;   // rad/s
    let angImpulse = 5.0; // N*m*s
    let angle = 0;
    let timer = 0;

    // Visual Elements
    const disk = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    disk.setAttribute('r', '100'); disk.setAttribute('fill', 'rgba(52, 152, 219, 0.2)');
    disk.setAttribute('stroke', '#3498db'); disk.setAttribute('stroke-width', '4');
    svg.appendChild(disk);

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    [line1, line2].forEach(l => {
      l.setAttribute('stroke', '#f1c40f'); l.setAttribute('stroke-width', '3');
      svg.appendChild(l);
    });

    const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    center.setAttribute('r', '6'); center.setAttribute('fill', '#f1c40f');
    svg.appendChild(center);

    const fArrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 3 });

    function updateVisuals() {
      disk.setAttribute('cx', 400); disk.setAttribute('cy', 225);
      center.setAttribute('cx', 400); center.setAttribute('cy', 225);
      
      const x1 = 400 + 100 * Math.cos(angle);
      const y1 = 225 + 100 * Math.sin(angle);
      const x2 = 400 + 100 * Math.cos(angle + Math.PI/2);
      const y2 = 225 + 100 * Math.sin(angle + Math.PI/2);
      
      line1.setAttribute('x1', 400); line1.setAttribute('y1', 225); line1.setAttribute('x2', x1); line1.setAttribute('y2', y1);
      line2.setAttribute('x1', 400); line2.setAttribute('y1', 225); line2.setAttribute('x2', x2); line2.setAttribute('y2', y2);

      // Tangential force arrow
      const tx = 400 + 100 * Math.cos(angle);
      const ty = 225 + 100 * Math.sin(angle);
      const tangentX = -Math.sin(angle);
      const tangentY = Math.cos(angle);
      fArrow.update(tx, ty, tx + tangentX * 40, ty + tangentY * 40);
    }

    function reset() {
      angle = 0;
      timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Momen quán tính I', 0.5, 5.0, 0.1, (v) => { inertia = v; }, 1.0);
    ui.addSlider('Vận tốc góc ω (rad/s)', 0, 10, 0.5, (v) => { omega = v; }, 2.0);
    ui.addSlider('Xung lượng góc H', -20, 20, 1, (v) => { angImpulse = v; }, 5.0);

    ui.addButton('Đặt lại (Reset)', reset);
    ui.addButton('Tác dụng xung H', () => {
      omega += angImpulse / inertia;
    });

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
      angle += omega * dt;
      timer += dt;
      updateVisuals();
      
      if (engine.isRunning) {
        const L = inertia * omega;
        chart.updateData(timer, L);
      }
    };

    updateVisuals();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, fArrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-5-2', {
      chapter: 3,
      type: 'dynamics',
      title: 'Xung luong goc - Momen dong luong',
      hint: 'I*domega = H'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-5-2'] = init;
})();
