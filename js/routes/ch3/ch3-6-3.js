/**
 * ch3-6-3: Total Energy Conservation
 * Demonstrates E_total = KE + PE = Constant for a mass-spring system.
 * Shows the periodic transfer between potential and kinetic energy.
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

    const chart = new SimChart(chartCanvas, "Bảo toàn năng lượng", "E (t)");
    chart.data.datasets[0].label = 'Thế năng đàn hồi V';
    chart.data.datasets.push({
      label: 'Động năng K',
      data: [],
      borderColor: '#2ecc71',
      backgroundColor: 'rgba(46, 204, 113, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 0
    });
    chart.data.datasets.push({
      label: 'Tổng năng lượng E',
      data: [],
      borderColor: '#f1c40f',
      backgroundColor: 'rgba(241, 196, 15, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 0
    });

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 100,
      originY: 225,
      flipY: false
    });

    // Parameters
    let k = 20; // N/m
    let m = 2.0; // kg
    let amplitude = 120; // px
    let x = amplitude;
    let v = 0;
    let timer = 0;

    // Visual Elements
    const wall = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    wall.setAttribute('x', '0'); wall.setAttribute('y', '150');
    wall.setAttribute('width', '20'); wall.setAttribute('height', '150');
    wall.setAttribute('fill', '#7f8c8d');
    svg.appendChild(wall);

    const spring = SimV2Primitives.createSpring(svg, { color: '#95a5a6', coils: 12 });
    const block = SimV2Primitives.createBlock(svg, 60, 40, { fill: '#3498db', stroke: '#2980b9' });

    function updateVisuals() {
      const blockMidX = 150 + x;
      spring.update(20, 225, blockMidX - 30, 225);
      block.setAttribute('transform', `translate(${blockMidX}, 225)`);
    }

    function reset() {
      x = amplitude;
      v = 0;
      timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Biên độ A (px)', 20, 200, 10, (val) => { amplitude = val; reset(); }, 120);
    ui.addSlider('Độ cứng k (N/m)', 5, 50, 1, (val) => { k = val; }, 20);
    ui.addSlider('Khối lượng m (kg)', 0.5, 5, 0.1, (val) => { m = val; }, 2.0);

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
      const omega = Math.sqrt(k / m);
      const accel = (-k * x) / m;
      
      v += accel * dt * 20; // scale
      x += v * dt;
      timer += dt;

      updateVisuals();
      
      if (engine.isRunning) {
        // Energy calculations (scaled for chart visibility)
        const PE = 0.5 * k * Math.pow(x/20, 2); 
        const KE = 0.5 * m * Math.pow(v/20, 2);
        const TotalE = PE + KE;
        
        chart.data.labels.push(timer.toFixed(2));
        chart.data.datasets[0].data.push(PE);
        chart.data.datasets[1].data.push(KE);
        chart.data.datasets[2].data.push(TotalE);
        
        if (chart.data.labels.length > chart.maxPoints) {
          chart.data.labels.shift();
          chart.data.datasets.forEach(ds => ds.data.shift());
        }
        chart.instance.update('none');
      }
    };

    updateVisuals();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, spring]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-6-3', {
      chapter: 3,
      type: 'dynamics',
      title: 'Bao toan nang luong',
      hint: 'Spring oscillation: E_total = const'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-6-3'] = init;
})();
