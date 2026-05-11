/**
 * ch3-3-3: Damped Oscillations
 * Mass-spring system with damping force (F_damping = -c*v).
 * Demonstrates underdamped, critically damped, and overdamped motion.
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

    const chart = new SimChart(chartCanvas, "Ly độ x(t)", "x (px)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 100,
      originY: 225,
      flipY: false
    });

    // Parameters
    let m = 2.0;    // kg
    let k = 20.0;   // N/m
    let c = 1.0;    // kg/s (damping coefficient)
    let amplitude = 100; // px
    let x = amplitude;
    let v = 0;
    let timer = 0;

    // Visual Elements
    const wall = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    wall.setAttribute('x', '0'); wall.setAttribute('y', '150');
    wall.setAttribute('width', '20'); wall.setAttribute('height', '150');
    wall.setAttribute('fill', '#7f8c8d');
    svg.appendChild(wall);

    const spring = SimV2Primitives.createSpring(svg, { color: '#95a5a6', coils: 15 });
    const block = SimV2Primitives.createBlock(svg, 60, 40, { fill: '#e67e22', stroke: '#d35400' });
    
    const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    infoText.setAttribute('x', '300');
    infoText.setAttribute('y', '50');
    infoText.setAttribute('fill', '#ecf0f1');
    infoText.setAttribute('font-family', 'Segoe UI');
    infoText.setAttribute('font-size', '16');
    svg.appendChild(infoText);

    function updateVisuals() {
      const startX = 20;
      const blockMidX = 150 + x;
      spring.update(startX, 225, blockMidX - 30, 225);
      block.setAttribute('transform', `translate(${blockMidX}, 225)`);
      
      const zeta = c / (2 * Math.sqrt(k * m));
      let state = "Dưới hạn (Underdamped)";
      if (zeta >= 1) state = "Quá hạn (Overdamped)";
      if (Math.abs(zeta - 1) < 0.05) state = "Tới hạn (Critically Damped)";
      
      infoText.textContent = `ζ = ${zeta.toFixed(2)} - ${state}`;
    }

    function reset() {
      x = amplitude;
      v = 0;
      timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Biên độ A (px)', 20, 150, 5, (val) => { amplitude = val; reset(); }, 100);
    ui.addSlider('Hệ số c (Damping)', 0, 20, 0.5, (val) => { c = val; updateVisuals(); }, 1.0);
    ui.addSlider('Độ cứng k (N/m)', 5, 50, 1, (val) => { k = val; updateVisuals(); }, 20.0);
    ui.addSlider('Khối lượng m (kg)', 0.5, 5, 0.1, (val) => { m = val; updateVisuals(); }, 2.0);

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
      // F = -k*x - c*v
      const f_spring = -k * x;
      const f_damping = -c * v;
      const a = (f_spring + f_damping) / m;

      v += a * dt * 20; // scale factor
      x += v * dt;
      timer += dt;

      updateVisuals();
      if (engine.isRunning) {
        chart.updateData(timer, x);
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
    window.RouteRegistry.register('ch3-3-3', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dao dong tieu tan',
      hint: 'Dieu chinh he so cau c (damping)'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-3-3'] = init;
})();
