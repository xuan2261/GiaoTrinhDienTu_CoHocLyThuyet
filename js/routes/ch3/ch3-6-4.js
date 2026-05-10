/**
 * ch3-6-4: Power
 * Demonstrates P = F * v.
 * Power is the rate at which work is done.
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

    const chart = new SimChart(chartCanvas, "Công suất tức thời P (W)", "P (t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Parameters
    let force = 50; // N
    let mass = 5.0; // kg
    let posX = 100;
    let velocity = 0;
    let timer = 0;

    // Visual Elements
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '0'); ground.setAttribute('y1', '300');
    ground.setAttribute('x2', '800'); ground.setAttribute('y2', '300');
    ground.setAttribute('stroke', '#7f8c8d'); ground.setAttribute('stroke-width', '4');
    svg.appendChild(ground);

    const block = SimV2Primitives.createBlock(svg, 80, 50, { fill: '#2980b9', stroke: '#1c5980' });
    const fArrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c' });
    const vArrow = SimV2Primitives.createArrow(svg, { color: '#2ecc71', strokeWidth: 3 });

    const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    infoText.setAttribute('x', '20'); infoText.setAttribute('y', '50');
    infoText.setAttribute('fill', '#ecf0f1'); infoText.setAttribute('font-family', 'Segoe UI');
    svg.appendChild(infoText);

    function updateVisuals() {
      block.setAttribute('transform', `translate(${posX}, 275)`);
      fArrow.update(posX + 40, 275, posX + 40 + force, 275);
      
      if (Math.abs(velocity) > 0.1) {
        vArrow.update(posX + 40, 275 + 15, posX + 40 + velocity * 10, 275 + 15);
      } else {
        vArrow.update(0,0,0,0);
      }

      const P = force * velocity / 10; // scaled
      infoText.textContent = `Lực F = ${force} N | Vận tốc v = ${(velocity/10).toFixed(2)} m/s | Công suất P = ${P.toFixed(1)} W`;
    }

    function reset() {
      posX = 100; velocity = 0; timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Lực F (N)', 0, 150, 5, (v) => { force = v; updateVisuals(); }, 50);
    ui.addSlider('Khối lượng m (kg)', 1, 10, 0.5, (v) => { mass = v; reset(); }, 5.0);

    ui.addButton('Đặt lại (Reset)', reset);
    const playBtn = ui.addButton('Đẩy vật (Play)', () => {
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
      const accel = force / mass;
      velocity += accel * dt * 10;
      posX += velocity * dt * 5; 

      if (posX > 750) {
        posX = 750; velocity = 0; engine.stop();
        playBtn.textContent = 'Đẩy vật (Play)';
      }

      timer += dt;
      updateVisuals();
      
      if (engine.isRunning) {
        const P = force * velocity / 10;
        chart.updateData(timer, P);
      }
    };

    updateVisuals();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, fArrow, vArrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-6-4', {
      chapter: 3,
      type: 'dynamics',
      title: 'Cong suat',
      hint: 'P = F*v'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-6-4'] = init;
})();
