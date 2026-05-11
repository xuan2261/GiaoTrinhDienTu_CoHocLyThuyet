/**
 * ch2-5-3: Cơ cấu tay quay thanh truyền (Slider-crank mechanism)
 * Uses Matter.js constraints for kinematic simulation.
 */
(function() {
  'use strict';

  function init(host) {
    // 1. Setup Layout
    const container = document.createElement('div');
    container.setAttribute('class', 'sim-viewport-v2');
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.width = '100%';
    container.style.height = '440px';
    
    const canvasArea = document.createElement('div');
    canvasArea.style.flex = '0 0 500px';
    canvasArea.style.position = 'relative';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 440');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.setAttribute('class', 'sim-svg-v2');
    canvasArea.appendChild(svg);
    
    const uiPanel = document.createElement('div');
    uiPanel.style.flex = '1';
    uiPanel.style.padding = '15px';
    uiPanel.style.backgroundColor = 'rgba(232, 236, 241, 0.03)';
    uiPanel.style.borderLeft = '1px solid rgba(232, 236, 241, 0.1)';
    uiPanel.style.overflowY = 'auto';
    
    container.appendChild(canvasArea);
    container.appendChild(uiPanel);
    host.appendChild(container);

    // 2. Foundation Components
    const engine = new SimulationEngine({ 
      gravity: 0,
      viewHeight: 440,
      originX: 120,
      originY: 220,
      flipY: false 
    });

    const ui = new SimUI(uiPanel);
    
    // 3. Physical Parameters
    const R = 70;
    const L = 160;
    let omega = 2.0;

    // 4. Matter.js Bodies & Constraints
    const base = Matter.Bodies.circle(0, 0, 10, { isStatic: true });
    
    // Crank point (motorized)
    const crankEnd = Matter.Bodies.circle(R, 0, 5, { 
      collisionFilter: { group: -1 },
      frictionAir: 0,
      inertia: Infinity
    });

    // Connecting rod
    // In V2 architecture, we usually sync Matter bodies to SVG.
    // For a slider-crank, we can use a constraint for the rod.
    
    // Slider
    const slider = Matter.Bodies.rectangle(R + L, 0, 40, 30, {
      collisionFilter: { group: -1 },
      inertia: Infinity
    });

    // Constraints
    const crankConstraint = Matter.Constraint.create({
      bodyA: base,
      bodyB: crankEnd,
      length: R,
      stiffness: 1
    });

    const rodConstraint = Matter.Constraint.create({
      bodyA: crankEnd,
      bodyB: slider,
      length: L,
      stiffness: 1
    });

    // Restrict slider to X axis
    const sliderGuide = Matter.Constraint.create({
      pointA: { x: 0, y: 0 },
      bodyB: slider,
      pointB: { x: 0, y: 0 },
      stiffness: 0.1,
      length: 0,
      render: { visible: false }
    });
    // Better way for slider: custom update or Matter.js axes
    // For kinematics, we can manually position crankEnd and let rod find slider.
    
    engine.addBody(slider, SimV2Primitives.createBlock(svg, 40, 30, { fill: 'rgba(52, 152, 219, 0.5)', stroke: '#3498db' }));

    // 5. SVG Primitives for lines
    const crankLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crankLine.setAttribute('stroke', '#c9963a');
    crankLine.setAttribute('stroke-width', '4');
    svg.appendChild(crankLine);

    const rodLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rodLine.setAttribute('stroke', '#8ea0b8');
    rodLine.setAttribute('stroke-width', '3');
    svg.appendChild(rodLine);

    const guideLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    guideLine.setAttribute('x1', '50'); guideLine.setAttribute('y1', '235');
    guideLine.setAttribute('x2', '450'); guideLine.setAttribute('y2', '235');
    guideLine.setAttribute('stroke', 'rgba(232, 236, 241, 0.1)');
    svg.appendChild(guideLine);

    // 6. Chart
    const chartCanvas = document.createElement('canvas');
    chartCanvas.style.height = '150px';
    chartCanvas.style.marginTop = '20px';
    uiPanel.appendChild(chartCanvas);
    const chart = new SimChart(chartCanvas, 'Vận tốc con trượt', 'v (px/s)');

    let theta = 0;
    let lastX = R + L;

    function kinematicUpdate(dt) {
      const dtSec = dt / 1000;
      theta += omega * dtSec;

      const cx = R * Math.cos(theta);
      const cy = R * Math.sin(theta);

      // Matter.js manual sync for kinematic driving
      Matter.Body.setPosition(crankEnd, { x: cx, y: cy });
      
      // Calculate slider X analytically for stability
      const sliderX = cx + Math.sqrt(L * L - cy * cy);
      Matter.Body.setPosition(slider, { x: sliderX, y: 0 });

      // Update Visuals
      const ox = 120, oy = 220;
      crankLine.setAttribute('x1', ox);
      crankLine.setAttribute('y1', oy);
      crankLine.setAttribute('x2', ox + cx);
      crankLine.setAttribute('y2', oy + cy);

      rodLine.setAttribute('x1', ox + cx);
      rodLine.setAttribute('y1', oy + cy);
      rodLine.setAttribute('x2', ox + sliderX);
      rodLine.setAttribute('y2', oy);

      // Velocity calculation for chart
      const vx = (sliderX - lastX) / dtSec;
      lastX = sliderX;
      
      if (engine.isRunning) {
        chart.updateData(engine.lastTime / 1000, vx);
      }
    }

    // 7. Controls
    ui.addSlider('Vận tốc góc (\u03C9)', 0, 10, 0.1, (v) => {
      omega = v;
    }, omega);

    ui.addButton('Reset Chart', () => chart.clear());

    // 8. Start
    engine.tick = (time) => {
      if (!engine.isRunning) return;
      let delta = time - engine.lastTime;
      engine.lastTime = time;
      if (delta > 100) delta = 100;
      kinematicUpdate(delta);
      
      // Sync slider body
      engine.defaultSync(slider, engine.bodies[0].domElement);
      
      requestAnimationFrame(engine.tick);
    };
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([chart]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-5-3', {
      chapter: 2,
      type: 'kinematics',
      title: 'Cơ cấu tay quay thanh truyền',
      hint: 'Chuyển động quay của tay quay được biến đổi thành chuyển động tịnh tiến của con trượt.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-5-3'] = init;
})();
