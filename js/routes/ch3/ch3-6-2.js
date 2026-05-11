/**
 * ch3-6-2: PE/KE Transformation
 * Demonstrates the conservation of mechanical energy on an incline.
 * KE + PE = Constant (in the absence of friction).
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

    const chart = new SimChart(chartCanvas, "Năng lượng", "E (t)");
    chart.data.datasets[0].label = 'Thế năng V';
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
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Parameters
    let mass = 2.0;   // kg
    let gravity = 9.8; // m/s^2
    let height = 3.0; // m
    let angle = 30;   // degrees
    let velocity = 0;
    let distance = 0;
    let timer = 0;

    // Visual Elements
    const incline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    incline.setAttribute('fill', '#2c3e50'); incline.setAttribute('stroke', '#34495e'); incline.setAttribute('stroke-width', '2');
    svg.appendChild(incline);

    const block = SimV2Primitives.createBlock(svg, 50, 30, { fill: '#e74c3c', stroke: '#c0392b' });
    
    function updateVisuals() {
      const rad = angle * Math.PI / 180;
      const h_px = height * 50;
      const startX = 100;
      const startY = 350 - h_px;
      const L_px = h_px / Math.sin(rad);
      const endX = startX + L_px * Math.cos(rad);
      const endY = 350;

      incline.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY} L ${startX} ${endY} Z`);

      const curX = startX + distance * Math.cos(rad);
      const curY = startY + distance * Math.sin(rad);

      block.setAttribute('transform', `translate(${curX}, ${curY}) rotate(${angle}) translate(0, -15)`);
    }

    function reset() {
      distance = 0; velocity = 0; timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Khối lượng m (kg)', 0.5, 5, 0.5, (v) => { mass = v; reset(); }, 2.0);
    ui.addSlider('Góc nghiêng θ (độ)', 10, 60, 5, (v) => { angle = v; reset(); }, 30);
    ui.addSlider('Độ cao h (m)', 1, 5, 0.5, (v) => { height = v; reset(); }, 3.0);

    ui.addButton('Đặt lại (Reset)', reset);
    const playBtn = ui.addButton('Thả vật (Play)', () => {
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
      const rad = angle * Math.PI / 180;
      const accel = gravity * Math.sin(rad);
      
      velocity += accel * dt;
      distance += velocity * dt * 50; // pixels

      const L_total = (height * 50) / Math.sin(rad);
      if (distance > L_total) {
        distance = L_total; velocity = 0; engine.stop();
        playBtn.textContent = 'Thả vật (Play)';
      }

      timer += dt;
      updateVisuals();
      
      if (engine.isRunning) {
        const h_now = Math.max(0, height - (distance / 50) * Math.sin(rad));
        const PE = mass * gravity * h_now;
        const KE = 0.5 * mass * velocity * velocity;
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
        SimV2Disposal.dispose([engine, chart]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-6-2', {
      chapter: 3,
      type: 'dynamics',
      title: 'The nang va Dong nang',
      hint: 'KE + PE = const'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-6-2'] = init;
})();
