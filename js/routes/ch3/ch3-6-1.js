/**
 * ch3-6-1: Work-Energy Theorem
 * Demonstrates W = delta K = K_final - K_initial.
 * The work done by a net force equals the change in kinetic energy.
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

    const chart = new SimChart(chartCanvas, "Công (W) vs Động năng (K)", "Năng lượng (J)");
    chart.data.datasets.push({
      label: 'K',
      data: [],
      borderColor: '#2ecc71',
      backgroundColor: 'rgba(46, 204, 113, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 0
    });

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
    let distance = 0;
    let totalWork = 0;
    let timer = 0;

    // Visual Elements
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '0'); ground.setAttribute('y1', '300');
    ground.setAttribute('x2', '800'); ground.setAttribute('y2', '300');
    ground.setAttribute('stroke', '#7f8c8d'); ground.setAttribute('stroke-width', '4');
    svg.appendChild(ground);

    const block = SimV2Primitives.createBlock(svg, 80, 50, { fill: '#9b59b6', stroke: '#8e44ad' });
    const fArrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c' });

    const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    infoText.setAttribute('x', '20'); infoText.setAttribute('y', '50');
    infoText.setAttribute('fill', '#ecf0f1'); infoText.setAttribute('font-family', 'Segoe UI');
    svg.appendChild(infoText);

    function updateVisuals() {
      block.setAttribute('transform', `translate(${posX}, 275)`);
      fArrow.update(posX + 40, 275, posX + 40 + force, 275);
      
      const kineticE = 0.5 * mass * velocity * velocity;
      infoText.textContent = `Công thực hiện W = ${totalWork.toFixed(1)} J | Động năng K = ${kineticE.toFixed(1)} J`;
    }

    function reset() {
      posX = 100; velocity = 0; distance = 0; totalWork = 0; timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Lực F (N)', 0, 100, 5, (v) => { force = v; updateVisuals(); }, 50);
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
      velocity += accel * dt;
      const dx = velocity * dt * 50; // scale
      posX += dx;
      distance += (velocity * dt);
      totalWork = force * distance;

      if (posX > 750) {
        posX = 750; velocity = 0; engine.stop();
        playBtn.textContent = 'Đẩy vật (Play)';
      }

      timer += dt;
      updateVisuals();
      
      if (engine.isRunning) {
        const kineticE = 0.5 * mass * velocity * velocity;
        chart.data.labels.push(timer.toFixed(2));
        chart.data.datasets[0].data.push(totalWork);
        chart.data.datasets[1].data.push(kineticE);
        if (chart.data.labels.length > chart.maxPoints) {
          chart.data.labels.shift();
          chart.data.datasets[0].data.shift();
          chart.data.datasets[1].data.shift();
        }
        chart.instance.update('none');
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
    window.RouteRegistry.register('ch3-6-1', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dinh ly cong - Dong nang',
      hint: 'W = F*d*cos(theta)'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-6-1'] = init;
})();
