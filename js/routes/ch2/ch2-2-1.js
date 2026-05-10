/**
 * ch2-2-1: Chuyển động quay của vật rắn (Rotation with constant alpha)
 * Architecture: V2 (SimulationEngine, SimV2Primitives, SimUI, SimChart)
 */
(function() {
  'use strict';

  function init(host) {
    // 1. Layout
    const layout = document.createElement('div');
    layout.className = 'sim-layout-v2';
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = '1fr 320px';
    layout.style.gap = '16px';
    host.appendChild(layout);

    const leftCol = document.createElement('div');
    const rightCol = document.createElement('div');
    layout.appendChild(leftCol);
    layout.appendChild(rightCol);

    // 2. SVG Viewport
    const container = document.createElement('div');
    container.className = 'sim-viewport-v2';
    leftCol.appendChild(container);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.className = 'sim-svg-v2';
    container.appendChild(svg);

    // 3. Chart
    const chartContainer = document.createElement('div');
    chartContainer.className = 'sim-chart-container-v2';
    leftCol.appendChild(chartContainer);
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);

    // 4. UI Panel
    const uiPanel = document.createElement('div');
    uiPanel.className = 'sim-ui-panel-v2';
    rightCol.appendChild(uiPanel);

    // 5. Engine & Logic
    const engine = new SimulationEngine({
      gravity: 0,
      viewHeight: 500,
      originX: 400,
      originY: 250,
      flipY: true
    });

    const ui = new SimUI(uiPanel);
    const chart = new SimChart(canvas, 'Vận tốc góc theo thời gian', 'ω (rad/s)');

    // Simulation State
    let state = {
      theta0: 0,
      omega0: 1.0,
      alpha: 0.2,
      elapsed: 0,
      theta: 0,
      omega: 1.0
    };

    // Wheel Primitive (Custom SVG)
    const wheelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(wheelGroup);

    const R = 150;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', R);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#3498db');
    circle.setAttribute('stroke-width', '4');
    wheelGroup.appendChild(circle);

    // Spokes
    const numSpokes = 8;
    for (let i = 0; i < numSpokes; i++) {
      const angle = (i / numSpokes) * Math.PI * 2;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', '0');
      line.setAttribute('x2', R * Math.cos(angle));
      line.setAttribute('y2', R * Math.sin(angle));
      line.setAttribute('stroke', '#3498db');
      line.setAttribute('stroke-width', '2');
      wheelGroup.appendChild(line);
    }

    // Reference mark
    const mark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    mark.setAttribute('cx', R - 10);
    mark.setAttribute('cy', '0');
    mark.setAttribute('r', '6');
    mark.setAttribute('fill', '#e74c3c');
    wheelGroup.appendChild(mark);

    // Text info on SVG
    const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    infoText.setAttribute('x', '20');
    infoText.setAttribute('y', '40');
    infoText.setAttribute('fill', '#fff');
    infoText.setAttribute('font-family', 'Segoe UI');
    infoText.setAttribute('font-size', '14');
    svg.appendChild(infoText);

    // Matter Body for synchronization
    const wheelBody = Matter.Bodies.circle(0, 0, R, { isStatic: true });
    engine.addBody(wheelBody, wheelGroup);

    function updateSimulation(dt) {
      if (!engine.isRunning) return;

      const deltaT = dt / 1000;
      state.elapsed += deltaT;
      const t = state.elapsed;

      // Kinematic formula: theta = theta0 + omega0*t + 0.5*alpha*t^2
      state.theta = state.theta0 + state.omega0 * t + 0.5 * state.alpha * t * t;
      state.omega = state.omega0 + state.alpha * t;

      // Update Body
      Matter.Body.setAngle(wheelBody, state.theta);

      // Update Info
      infoText.innerHTML = `
        <tspan x="20" dy="1.2em">θ = ${(state.theta * 180 / Math.PI).toFixed(1)}°</tspan>
        <tspan x="20" dy="1.2em" fill="#3498db">ω = ${state.omega.toFixed(2)} rad/s</tspan>
        <tspan x="20" dy="1.2em" fill="#e74c3c">α = ${state.alpha.toFixed(2)} rad/s²</tspan>
        <tspan x="20" dy="1.2em" fill="#c9963a">t = ${t.toFixed(2)} s</tspan>
      `;

      // Update Chart
      chart.updateData(t, state.omega);
    }

    // UI Controls
    ui.addSlider('Vận tốc đầu ω₀', -5, 5, 0.1, (v) => { 
        state.omega0 = v; 
        resetSim();
    }, 1.0);
    ui.addSlider('Gia tốc góc α', -1, 1, 0.05, (v) => { 
        state.alpha = v; 
        resetSim();
    }, 0.2);

    function resetSim() {
        state.elapsed = 0;
        state.theta = state.theta0;
        state.omega = state.omega0;
        Matter.Body.setAngle(wheelBody, state.theta);
        chart.clear();
    }

    ui.addButton('Reset', resetSim);

    // Integration with engine tick
    const originalTick = engine.tick;
    engine.tick = (time) => {
        if (engine.isRunning) {
            updateSimulation(engine.fixedDelta);
        }
        originalTick(time);
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

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-2-1'] = init;
})();
