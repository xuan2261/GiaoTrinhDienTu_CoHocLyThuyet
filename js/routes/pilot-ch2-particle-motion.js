/**
 * Pilot 02: Particle Kinematics (Projectile Motion)
 * Demonstrate projectile motion with realtime plotting.
 */
(function() {
  'use strict';

  function init(host) {
    const layout = document.createElement('div');
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = '1fr 300px';
    layout.style.gap = '12px';

    const leftCol = document.createElement('div');
    const rightCol = document.createElement('div');
    layout.appendChild(leftCol);
    layout.appendChild(rightCol);
    host.appendChild(layout);

    const container = document.createElement('div');
    container.className = 'sim-viewport-v2';
    leftCol.appendChild(container);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.className = 'sim-svg-v2';
    container.appendChild(svg);

    const chartCanvas = document.createElement('canvas');
    const chartContainer = document.createElement('div');
    chartContainer.className = 'sim-chart-container-v2';
    chartContainer.appendChild(chartCanvas);
    leftCol.appendChild(chartContainer);

    const uiPanel = document.createElement('div');
    rightCol.appendChild(uiPanel);

    const engine = new SimulationEngine({ 
      gravity: 1, 
      viewHeight: 450,
      originX: 50,
      originY: 50,
      flipY: true 
    });

    const ui = new SimUI(uiPanel);
    const chart = new SimChart(chartCanvas, 'Vertical Position vs Time', 'Y (m)');

    // Ground
    const ground = Matter.Bodies.rectangle(400, -25, 800, 50, { isStatic: true });
    const groundEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    groundEl.setAttribute('width', '800');
    groundEl.setAttribute('height', '50');
    groundEl.classList.add('sim-body-v2', 'static');
    svg.appendChild(groundEl);
    engine.addBody(ground, groundEl);

    // Projectile
    let projectile = null;
    let projectileEl = null;

    let v0 = 10;
    let angle = 45;
    let startTime = 0;

    ui.addSlider('Initial Velocity (v0)', 5, 20, 1, (v) => { v0 = v; }, 10);
    ui.addSlider('Launch Angle (°)', 0, 90, 1, (v) => { angle = v; }, 45);

    function launch() {
      if (projectile) {
        Matter.World.remove(engine.world, projectile);
        if (projectileEl.parentNode) svg.removeChild(projectileEl);
      }

      projectile = Matter.Bodies.circle(0, 0, 8, { 
        restitution: 0.5,
        friction: 0.1,
        label: 'projectile'
      });

      projectileEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      projectileEl.setAttribute('r', '8');
      projectileEl.classList.add('sim-body-v2');
      svg.appendChild(projectileEl);

      engine.addBody(projectile, projectileEl);

      const vx = v0 * Math.cos(angle * Math.PI / 180);
      const vy = v0 * Math.sin(angle * Math.PI / 180);
      
      Matter.Body.setVelocity(projectile, { x: vx, y: vy });
      
      chart.clear();
      startTime = performance.now();
    }

    ui.addButton('Launch Projectile', launch, true);
    ui.addButton('Reset', () => {
       if (projectile) {
        Matter.World.remove(engine.world, projectile);
        if (projectileEl.parentNode) svg.removeChild(projectileEl);
        projectile = null;
      }
      chart.clear();
    });

    const originalTick = engine.tick;
    engine.tick = (time) => {
      if (projectile && engine.isRunning) {
        const elapsed = (time - startTime) / 1000;
        chart.updateData(elapsed, projectile.position.y);
      }
      originalTick(time);
    };

    engine.start();
    launch();

    return {
      dispose: () => {
        engine.stop();
        host.innerHTML = '';
      }
    };
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['pilot-projectile'] = init;
})();
