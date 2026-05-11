/**
 * ch3-1-2: Newton's 2nd Law (F = ma)
 * Demonstrates the relationship between force, mass, and acceleration.
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

    const chart = new SimChart(chartCanvas, "Gia tốc (px/s²)", "a (t)");

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
    const blockEl = SimV2Primitives.createBlock(svg, bw, bh, { fill: '#2ecc71', stroke: '#27ae60' });
    
    let mass = 5;
    let forceX = 100; // Newton (scaled for sim)
    
    const block = Matter.Bodies.rectangle(100, groundY - bh/2, bw, bh, {
      frictionAir: 0,
      friction: 0,
      label: 'block'
    });
    Matter.Body.setMass(block, mass);
    engine.addBody(block, blockEl);

    // Force and Acceleration arrows
    const fArrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 3 });
    const aArrow = SimV2Primitives.createArrow(svg, { color: '#f1c40f', strokeWidth: 2 });

    ui.addSlider('Khối lượng m (kg)', 1, 20, 1, (v) => {
      mass = v;
      Matter.Body.setMass(block, mass);
    }, mass);

    ui.addSlider('Lực tác dụng F (N)', 0, 500, 10, (v) => {
      forceX = v;
    }, forceX);

    ui.addButton('Đặt lại (Reset)', () => {
      Matter.Body.setPosition(block, { x: 100, y: groundY - bh/2 });
      Matter.Body.setVelocity(block, { x: 0, y: 0 });
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
      // Apply force: F = ma => a = F/m
      // In Matter.js, we apply force at each step
      // Scaling: 1 N in sim = 0.001 Matter force unit approx for these values
      const matterForce = forceX * 0.0005; 
      Matter.Body.applyForce(block, block.position, { x: matterForce, y: 0 });

      const accel = forceX / mass;
      const v = block.velocity.x * 60;
      
      // Update arrows
      fArrow.update(
        block.position.x + bw/2, 
        block.position.y - 10, 
        block.position.x + bw/2 + forceX * 0.5, 
        block.position.y - 10
      );
      
      aArrow.update(
        block.position.x + bw/2, 
        block.position.y + 10, 
        block.position.x + bw/2 + accel * 2, 
        block.position.y + 10
      );
      
      const elapsed = (time - startTime) / 1000;
      if (engine.isRunning) {
        chart.updateData(elapsed, accel);
      }
      
      // Loop block position
      if (block.position.x > 800 + bw/2) {
        Matter.Body.setPosition(block, { x: -bw/2, y: groundY - bh/2 });
      }

      originalTick(time);
    };

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, fArrow, aArrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-1-2', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dinh luat 2 Newton',
      hint: 'Dieu chinh F, nhan Play'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-1-2'] = init;
})();
