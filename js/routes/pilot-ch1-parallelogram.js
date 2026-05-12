/**
 * Pilot 01: Parallelogram of Forces
 * Demonstrate vector addition of forces.
 */
(function() {
  'use strict';

  function init(host) {
    const container = document.createElement('div');
    container.setAttribute('class', 'sim-viewport-v2');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.setAttribute('class', 'sim-svg-v2');

    // UI Panel
    const uiPanel = document.createElement('div');
    container.appendChild(svg);
    host.appendChild(container);
    host.appendChild(uiPanel);

    const engine = new SimulationEngine({
      gravity: 0, // Statics
      viewHeight: 450,
      originX: 400,
      originY: 225,
      flipY: true
    });

    const ui = new SimUI(uiPanel);

    // Physics Bodies
    const particle = Matter.Bodies.circle(0, 0, 10, {
      frictionAir: 0.1,
      label: 'particle'
    });
    const anchor = Matter.Bodies.circle(0, 0, 5, { isStatic: true });

    // SVG Elements
    const particleEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particleEl.setAttribute('r', '10');
    particleEl.classList.add('sim-body-v2');
    svg.appendChild(particleEl);

    // Force Vectors
    const force1El = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    force1El.classList.add('sim-vector-v2');
    svg.appendChild(force1El);

    const force2El = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    force2El.classList.add('sim-vector-v2');
    svg.appendChild(force2El);

    const resultantEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    resultantEl.setAttribute('stroke', '#f1c40f');
    resultantEl.setAttribute('stroke-width', '3');
    svg.appendChild(resultantEl);

    let f1Mag = 0.005;
    let f1Angle = 30;
    let f2Mag = 0.005;
    let f2Angle = 150;

    ui.addSlider('Force 1 Magnitude', 0, 10, 1, (v) => { f1Mag = v * 0.001; }, 5);
    ui.addSlider('Force 1 Angle (°)', 0, 360, 1, (v) => { f1Angle = v; }, 30);
    ui.addSlider('Force 2 Magnitude', 0, 10, 1, (v) => { f2Mag = v * 0.001; }, 5);
    ui.addSlider('Force 2 Angle (°)', 0, 360, 1, (v) => { f2Angle = v; }, 150);

    engine.addBody(particle, particleEl);

    // Custom sync for vectors
    const vectorSync = () => {
      const pos = particle.position;

      const fx1 = Math.cos(f1Angle * Math.PI / 180) * f1Mag * 10000;
      const fy1 = Math.sin(f1Angle * Math.PI / 180) * f1Mag * 10000;

      const fx2 = Math.cos(f2Angle * Math.PI / 180) * f2Mag * 10000;
      const fy2 = Math.sin(f2Angle * Math.PI / 180) * f2Mag * 10000;

      // Apply forces
      Matter.Body.applyForce(particle, pos, { x: f1Mag * Math.cos(f1Angle * Math.PI / 180), y: f1Mag * Math.sin(f1Angle * Math.PI / 180) });
      Matter.Body.applyForce(particle, pos, { x: f2Mag * Math.cos(f2Angle * Math.PI / 180), y: f2Mag * Math.sin(f2Angle * Math.PI / 180) });

      // Update SVG Vectors (coordinate transformed manually for lines as they are not bodies)
      const svgPos = { x: 400 + pos.x, y: 225 - pos.y };

      force1El.setAttribute('x1', svgPos.x);
      force1El.setAttribute('y1', svgPos.y);
      force1El.setAttribute('x2', svgPos.x + fx1);
      force1El.setAttribute('y2', svgPos.y - fy1);

      force2El.setAttribute('x1', svgPos.x);
      force2El.setAttribute('y1', svgPos.y);
      force2El.setAttribute('x2', svgPos.x + fx2);
      force2El.setAttribute('y2', svgPos.y - fy2);

      resultantEl.setAttribute('x1', svgPos.x);
      resultantEl.setAttribute('y1', svgPos.y);
      resultantEl.setAttribute('x2', svgPos.x + fx1 + fx2);
      resultantEl.setAttribute('y2', svgPos.y - (fy1 + fy2));
    };

    // Monkey patch tick to include vector sync
    const originalTick = engine.tick;
    engine.tick = (time) => {
      vectorSync();
      originalTick(time);
    };

    engine.start();

    return {
      dispose: () => {
        engine.stop();
        host.innerHTML = '';
      }
    };
  }

  // Reference-only pilot. Active Ch1 runtime lives under js/sims/ch1/*.
  window.CH1_PARALLELOGRAM_PILOT_REFERENCE = { init };
})();
