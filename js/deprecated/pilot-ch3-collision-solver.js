/**
 * Pilot 03: Collision Solver (Dynamics)
 * Demonstrate conservation of momentum and energy.
 */
(function() {
  'use strict';

  function init(host) {
    const container = document.createElement('div');
    container.setAttribute('class', 'sim-viewport-v2');
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.setAttribute('class', 'sim-svg-v2');
    
    const uiPanel = document.createElement('div');
    container.appendChild(svg);
    host.appendChild(container);
    host.appendChild(uiPanel);

    const engine = new SimulationEngine({ 
      gravity: 0, 
      viewHeight: 450,
      originX: 400,
      originY: 225,
      flipY: true 
    });

    const ui = new SimUI(uiPanel);
    
    // Create two spheres
    let ball1 = Matter.Bodies.circle(-100, 0, 30, { friction: 0, frictionAir: 0, restitution: 1 });
    let ball2 = Matter.Bodies.circle(100, 0, 30, { friction: 0, frictionAir: 0, restitution: 1 });

    const ball1El = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball1El.setAttribute('r', '30');
    ball1El.classList.add('sim-body-v2');
    svg.appendChild(ball1El);

    const ball2El = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball2El.setAttribute('r', '30');
    ball2El.classList.add('sim-body-v2');
    svg.appendChild(ball2El);

    engine.addBody(ball1, ball1El);
    engine.addBody(ball2, ball2El);

    let v1 = 2;
    let v2 = -2;
    let m1 = 1;
    let m2 = 1;
    let e = 1;

    ui.addSlider('Mass 1', 1, 10, 0.5, (v) => { m1 = v; Matter.Body.setMass(ball1, v); }, 1);
    ui.addSlider('Velocity 1', 0, 10, 0.5, (v) => { v1 = v; }, 2);
    ui.addSlider('Mass 2', 1, 10, 0.5, (v) => { m2 = v; Matter.Body.setMass(ball2, v); }, 1);
    ui.addSlider('Velocity 2', -10, 0, 0.5, (v) => { v2 = v; }, -2);
    ui.addSlider('Coefficient of Restitution (e)', 0, 1, 0.1, (v) => { 
        e = v; 
        ball1.restitution = v;
        ball2.restitution = v;
    }, 1);

    function run() {
      Matter.Body.setPosition(ball1, { x: -300, y: 0 });
      Matter.Body.setPosition(ball2, { x: 300, y: 0 });
      Matter.Body.setVelocity(ball1, { x: v1, y: 0 });
      Matter.Body.setVelocity(ball2, { x: v2, y: 0 });
      engine.start();
    }

    ui.addButton('Run Simulation', run, true);
    ui.addButton('Reset', () => {
      engine.stop();
      Matter.Body.setPosition(ball1, { x: -100, y: 0 });
      Matter.Body.setPosition(ball2, { x: 100, y: 0 });
      Matter.Body.setVelocity(ball1, { x: 0, y: 0 });
      Matter.Body.setVelocity(ball2, { x: 0, y: 0 });
      engine.defaultSync(ball1, ball1El);
      engine.defaultSync(ball2, ball2El);
    });

    engine.start();

    return {
      dispose: () => {
        engine.stop();
        host.innerHTML = '';
      }
    };
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['pilot-collision'] = init;
})();
