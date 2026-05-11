/**
 * ch3-2-2: Equation of Motion (Pendulum)
 * Demonstrates the motion of a particle on a curve (circular arc) under gravity.
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

    const chart = new SimChart(chartCanvas, "Ly độ ngang (px)", "x (t)");

    // Simulation Engine
    const engine = new SimulationEngine({
      gravity: 0.5, // Reduced gravity for smoother sim
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Scene
    const pivotX = 400, pivotY = 50;
    let length = 250;
    let angle = 45; // degrees

    const pivotEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivotEl.setAttribute('cx', pivotX);
    pivotEl.setAttribute('cy', pivotY);
    pivotEl.setAttribute('r', '5');
    pivotEl.setAttribute('fill', '#555');
    svg.appendChild(pivotEl);

    const rodEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rodEl.setAttribute('stroke', '#888');
    rodEl.setAttribute('stroke-width', '2');
    svg.appendChild(rodEl);

    const body = Matter.Bodies.circle(
      pivotX + length * Math.sin(angle * Math.PI / 180),
      pivotY + length * Math.cos(angle * Math.PI / 180),
      20,
      { frictionAir: 0, friction: 0, restitution: 1 }
    );
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '20');
    circle.setAttribute('fill', '#e67e22');
    circle.setAttribute('stroke', '#d35400');
    circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);

    const constraint = Matter.Constraint.create({
      pointA: { x: pivotX, y: pivotY },
      bodyB: body,
      length: length,
      stiffness: 1
    });

    Matter.Composite.add(engine.world, [body, constraint]);
    engine.addBody(body, circle);

    ui.addSlider('Chiều dài dây L', 100, 350, 10, (v) => {
      length = v;
      constraint.length = length;
      if (!engine.isRunning) resetPos();
    }, length);

    ui.addSlider('Góc ban đầu (độ)', -90, 90, 5, (v) => {
      angle = v;
      if (!engine.isRunning) resetPos();
    }, angle);

    function resetPos() {
      const rad = angle * Math.PI / 180;
      Matter.Body.setPosition(body, {
        x: pivotX + length * Math.sin(rad),
        y: pivotY + length * Math.cos(rad)
      });
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
      chart.clear();
      startTime = performance.now();
    }

    ui.addButton('Đặt lại (Reset)', resetPos);

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
      rodEl.setAttribute('x1', pivotX);
      rodEl.setAttribute('y1', pivotY);
      rodEl.setAttribute('x2', body.position.x);
      rodEl.setAttribute('y2', body.position.y);
      
      const elapsed = (time - startTime) / 1000;
      if (engine.isRunning) {
        chart.updateData(elapsed, body.position.x - pivotX);
      }
      originalTick(time);
    };

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-2-2', {
      chapter: 3,
      type: 'dynamics',
      title: 'Can bang dong',
      hint: 'SumF = m*a'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-2-2'] = init;
})();
