/**
 * ch3-1-1: Newton's 1st Law (Inertia)
 * Demonstrates that an object stays in motion with constant velocity when net force is zero.
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
    viewport.className = 'sim-viewport-v2';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.className = 'sim-svg-v2';
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
    chartContainer.className = 'sim-chart-container-v2';
    chartContainer.appendChild(chartCanvas);
    sidebar.appendChild(chartContainer);

    const chart = new SimChart(chartCanvas, "Vận tốc (px/s)", "v (t)");

    // Simulation Engine
    const engine = new SimulationEngine({
      gravity: 0,
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Scene
    const groundY = 350;
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '0');
    ground.setAttribute('y1', groundY);
    ground.setAttribute('x2', '800');
    ground.setAttribute('y2', groundY);
    ground.setAttribute('stroke', '#555');
    ground.setAttribute('stroke-width', '2');
    svg.appendChild(ground);

    const bw = 80, bh = 50;
    const blockEl = SimV2Primitives.createBlock(svg, bw, bh, { fill: '#3498db', stroke: '#2980b9' });
    
    let mass = 5;
    let initialV = 120;
    
    const block = Matter.Bodies.rectangle(100, groundY - bh/2, bw, bh, {
      frictionAir: 0,
      friction: 0,
      restitution: 1,
      label: 'block'
    });
    
    // Initial velocity setup
    Matter.Body.setVelocity(block, { x: initialV / 60, y: 0 });
    engine.addBody(block, blockEl);

    // Velocity arrow
    const vArrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 3 });

    ui.addSlider('Khối lượng m (kg)', 1, 20, 1, (v) => {
      mass = v;
      Matter.Body.setMass(block, mass);
    }, mass);

    ui.addSlider('Vận tốc ban đầu v0', 0, 300, 10, (v) => {
      initialV = v;
      if (!engine.isRunning) {
        Matter.Body.setVelocity(block, { x: initialV / 60, y: 0 });
      }
    }, initialV);

    ui.addButton('Đặt lại (Reset)', () => {
      Matter.Body.setPosition(block, { x: 100, y: groundY - bh/2 });
      Matter.Body.setVelocity(block, { x: initialV / 60, y: 0 });
      chart.clear();
      startTime = performance.now();
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
    const originalTick = engine.tick;
    engine.tick = (time) => {
      // Newton's 1st Law: No net force, a=0, v=const
      // We force v to stay constant just in case of float errors
      if (engine.isRunning) {
        Matter.Body.setVelocity(block, { x: initialV / 60, y: 0 });
      }

      const v = block.velocity.x * 60; 
      vArrow.update(
        block.position.x + bw/2, 
        block.position.y, 
        block.position.x + bw/2 + v * 0.5, 
        block.position.y
      );
      
      const elapsed = (time - startTime) / 1000;
      if (engine.isRunning) {
        chart.updateData(elapsed, v);
      }
      
      // Loop block position for infinite motion
      if (block.position.x > 800 + bw/2) {
        Matter.Body.setPosition(block, { x: -bw/2, y: groundY - bh/2 });
      }

      originalTick(time);
    };

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, vArrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-1-1', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dinh luat 1 Newton',
      hint: 'Ke bieu dien van toc khong doi'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-1-1'] = init;
})();
