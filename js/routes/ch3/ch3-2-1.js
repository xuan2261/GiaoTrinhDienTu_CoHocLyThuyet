/**
 * ch3-2-1: Differential Equation of Motion
 * Particle on a line subjected to a time-varying force F(t) = F0 * sin(omega * t).
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
    const cy = 225;
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    track.setAttribute('x1', '50');
    track.setAttribute('y1', cy);
    track.setAttribute('x2', '750');
    track.setAttribute('y2', cy);
    track.setAttribute('stroke', '#444');
    track.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(track);

    const body = Matter.Bodies.circle(400, cy, 15, { frictionAir: 0, friction: 0 });
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '15');
    circle.setAttribute('fill', '#9b59b6');
    circle.setAttribute('stroke', '#8e44ad');
    circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);

    engine.addBody(body, circle);

    const fArrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 3 });

    let F0 = 150;
    let omega = 2;
    let mass = 2;
    let timeAcc = 0;

    ui.addSlider('Biên độ lực F0', 0, 300, 10, (v) => F0 = v, F0);
    ui.addSlider('Tần số góc omega', 0.5, 10, 0.5, (v) => omega = v, omega);
    ui.addSlider('Khối lượng m', 0.5, 10, 0.5, (v) => {
      mass = v;
      Matter.Body.setMass(body, mass);
    }, mass);

    ui.addButton('Đặt lại (Reset)', () => {
      Matter.Body.setPosition(body, { x: 400, y: cy });
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
      timeAcc = 0;
      chart.clear();
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

    const originalTick = engine.tick;
    engine.tick = (time) => {
      if (engine.isRunning) {
        timeAcc += 0.016; // Approx dt for force calculation
        const force = F0 * Math.sin(omega * timeAcc);
        
        // Apply varying force
        Matter.Body.applyForce(body, body.position, { x: force * 0.0005, y: 0 });
        
        const v = body.velocity.x * 60;
        chart.updateData(timeAcc, v);
        
        fArrow.update(
          body.position.x, 
          body.position.y - 25, 
          body.position.x + force * 0.5, 
          body.position.y - 25
        );

        // Keep in viewport
        if (body.position.x < 50 || body.position.x > 750) {
           Matter.Body.setVelocity(body, { x: -body.velocity.x, y: 0 });
        }
      }
      originalTick(time);
    };

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, fArrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-2-1', {
      chapter: 3,
      type: 'dynamics',
      title: "Nguyen ly D'Alembert",
      hint: 'F + F* = 0 voi F* = -m*a'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-2-1'] = init;
})();
