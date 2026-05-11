/**
 * ch3-1-3: Newton's 3rd Law (Action and Reaction)
 * Demonstrates that for every action, there is an equal and opposite reaction.
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

    const chart = new SimChart(chartCanvas, "Lực tương tác (N)", "F_AB");

    // Simulation Engine
    const engine = new SimulationEngine({
      gravity: 0,
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Physics Bodies
    const r1 = 30, r2 = 30;
    const bodyA = Matter.Bodies.circle(200, 225, r1, { restitution: 1, frictionAir: 0, label: 'A' });
    const bodyB = Matter.Bodies.circle(600, 225, r2, { restitution: 1, frictionAir: 0, label: 'B' });
    
    // SVG Elements
    const circleA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleA.setAttribute('r', r1);
    circleA.setAttribute('fill', '#e74c3c');
    circleA.setAttribute('stroke', '#c0392b');
    circleA.setAttribute('stroke-width', '2');
    svg.appendChild(circleA);

    const circleB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleB.setAttribute('r', r2);
    circleB.setAttribute('fill', '#3498db');
    circleB.setAttribute('stroke', '#2980b9');
    circleB.setAttribute('stroke-width', '2');
    svg.appendChild(circleB);

    engine.addBody(bodyA, circleA);
    engine.addBody(bodyB, circleB);

    // Force arrows
    const fABArrow = SimV2Primitives.createArrow(svg, { color: '#f1c40f', strokeWidth: 3 });
    const fBAArrow = SimV2Primitives.createArrow(svg, { color: '#f1c40f', strokeWidth: 3 });

    let initialV = 120;

    ui.addSlider('Vận tốc va chạm', 50, 300, 10, (v) => {
      initialV = v;
    }, initialV);

    ui.addButton('Đặt lại (Reset)', () => {
      Matter.Body.setPosition(bodyA, { x: 200, y: 225 });
      Matter.Body.setPosition(bodyB, { x: 600, y: 225 });
      Matter.Body.setVelocity(bodyA, { x: 0, y: 0 });
      Matter.Body.setVelocity(bodyB, { x: 0, y: 0 });
      chart.clear();
      startTime = performance.now();
    });

    const playBtn = ui.addButton('Va chạm (Collide)', () => {
      Matter.Body.setPosition(bodyA, { x: 200, y: 225 });
      Matter.Body.setPosition(bodyB, { x: 600, y: 225 });
      Matter.Body.setVelocity(bodyA, { x: initialV / 60, y: 0 });
      Matter.Body.setVelocity(bodyB, { x: -initialV / 60, y: 0 });
      engine.start();
    }, true);

    let startTime = performance.now();
    const originalTick = engine.tick;
    engine.tick = (time) => {
      const dist = Math.hypot(bodyA.position.x - bodyB.position.x, bodyA.position.y - bodyB.position.y);
      const isColliding = dist <= (r1 + r2) + 2;
      
      const elapsed = (time - startTime) / 1000;
      
      if (isColliding) {
        // Show forces during collision
        const contactX = (bodyA.position.x + bodyB.position.x) / 2;
        const forceMag = initialV * 0.5; // Symbolic force proportional to velocity
        
        fABArrow.update(contactX, 225, contactX + forceMag, 225);
        fBAArrow.update(contactX, 225, contactX - forceMag, 225);
        
        if (engine.isRunning) {
           chart.updateData(elapsed, forceMag);
        }
      } else {
        fABArrow.update(0, 0, 0, 0);
        fBAArrow.update(0, 0, 0, 0);
        if (engine.isRunning) {
           chart.updateData(elapsed, 0);
        }
      }

      originalTick(time);
    };

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, fABArrow, fBAArrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-1-3', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dinh luat 3 Newton',
      hint: 'Ke 2 qua bong, nhan Play'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-1-3'] = init;
})();
