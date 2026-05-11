/**
 * ch3-3-2: Coupled Oscillators
 * Two masses connected by three springs.
 * Demonstrates normal modes and energy transfer between coupled systems.
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

    const chart = new SimChart(chartCanvas, "Ly độ x1 (đỏ) & x2 (blue)", "x (px)");
    chart.data.datasets.push({
      label: 'x2',
      data: [],
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 0
    });

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 225,
      flipY: false
    });

    // Parameters
    let k = 20; // N/m
    let m = 2;  // kg
    let x1 = 60; // Initial displacement 1
    let x2 = -60; // Initial displacement 2
    let v1 = 0;
    let v2 = 0;
    let timer = 0;

    // Visual Elements
    const wallL = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    wallL.setAttribute('x', '0'); wallL.setAttribute('y', '150');
    wallL.setAttribute('width', '20'); wallL.setAttribute('height', '150');
    wallL.setAttribute('fill', '#7f8c8d');
    svg.appendChild(wallL);

    const wallR = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    wallR.setAttribute('x', '780'); wallR.setAttribute('y', '150');
    wallR.setAttribute('width', '20'); wallR.setAttribute('height', '150');
    wallR.setAttribute('fill', '#7f8c8d');
    svg.appendChild(wallR);

    const spring1 = SimV2Primitives.createSpring(svg, { color: '#95a5a6', coils: 12 });
    const spring2 = SimV2Primitives.createSpring(svg, { color: '#95a5a6', coils: 12 });
    const spring3 = SimV2Primitives.createSpring(svg, { color: '#95a5a6', coils: 12 });

    const block1 = SimV2Primitives.createBlock(svg, 60, 40, { fill: '#e74c3c', stroke: '#c0392b' });
    const block2 = SimV2Primitives.createBlock(svg, 60, 40, { fill: '#3498db', stroke: '#2980b9' });

    function updateVisuals() {
      const startX = 20;
      const endX = 780;
      const mid1 = 260 + x1;
      const mid2 = 540 + x2;

      spring1.update(startX, 225, mid1 - 30, 225);
      spring2.update(mid1 + 30, 225, mid2 - 30, 225);
      spring3.update(mid2 + 30, 225, endX, 225);

      block1.setAttribute('transform', `translate(${mid1}, 225)`);
      block2.setAttribute('transform', `translate(${mid2}, 225)`);
    }

    function reset() {
      x1 = parseFloat(s1.value);
      x2 = parseFloat(s2.value);
      v1 = 0; v2 = 0;
      timer = 0;
      chart.clear();
      updateVisuals();
    }

    const s1 = ui.addSlider('Lệch x1 (px)', -100, 100, 5, (v) => { x1 = v; updateVisuals(); }, 60);
    const s2 = ui.addSlider('Lệch x2 (px)', -100, 100, 5, (v) => { x2 = v; updateVisuals(); }, -60);
    ui.addSlider('Độ cứng k (N/m)', 5, 50, 1, (v) => { k = v; }, 20);
    ui.addSlider('Khối lượng m (kg)', 0.5, 5, 0.1, (v) => { m = v; }, 2);

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
      // F1 = -k*x1 + k*(x2-x1)
      // F2 = -k*x2 - k*(x2-x1)
      const a1 = (-k * x1 + k * (x2 - x1)) / m;
      const a2 = (-k * x2 - k * (x2 - x1)) / m;

      v1 += a1 * dt * 20; // scale for visuals
      v2 += a2 * dt * 20;
      x1 += v1 * dt;
      x2 += v2 * dt;
      timer += dt;

      updateVisuals();
      
      if (engine.isRunning) {
        chart.data.labels.push(timer.toFixed(2));
        chart.data.datasets[0].data.push(x1);
        chart.data.datasets[1].data.push(x2);
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
        SimV2Disposal.dispose([engine, chart, spring1, spring2, spring3]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-3-2', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dao dong lien ket',
      hint: '2 khoi noi 3 lo xo'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-3-2'] = init;
})();
