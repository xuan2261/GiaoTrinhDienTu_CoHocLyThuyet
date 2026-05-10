/**
 * ch2-3-2: Truyền động đai (Two pulleys with a belt)
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
    const chart = new SimChart(canvas, 'Vận tốc dây đai', 'v (px/s)');

    // Simulation State
    let state = {
      omega1: 1.5,
      R1: 80,
      R2: 50,
      dist: 250,
      theta1: 0,
      theta2: 0,
      elapsed: 0
    };

    // Pulleys
    const pulley1Group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const pulley2Group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(pulley1Group);
    svg.appendChild(pulley2Group);

    function drawPulley(g, R, color) {
        while (g.firstChild) g.removeChild(g.firstChild);
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('r', R);
        c.setAttribute('fill', 'none');
        c.setAttribute('stroke', color);
        c.setAttribute('stroke-width', '4');
        g.appendChild(c);

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', R - 15); dot.setAttribute('cy', '0');
        dot.setAttribute('r', '5'); dot.setAttribute('fill', color);
        g.appendChild(dot);

        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('r', '4'); center.setAttribute('fill', '#fff');
        g.appendChild(center);
    }

    drawPulley(pulley1Group, state.R1, '#c9963a');
    drawPulley(pulley2Group, state.R2, '#3498db');

    const pulley1Body = Matter.Bodies.circle(0, 0, state.R1, { isStatic: true });
    const pulley2Body = Matter.Bodies.circle(0, 0, state.R2, { isStatic: true });
    engine.addBody(pulley1Body, pulley1Group);
    engine.addBody(pulley2Body, pulley2Group);

    // Belt
    const beltTop = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const beltBottom = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    [beltTop, beltBottom].forEach(l => {
        l.setAttribute('stroke', '#aaa');
        l.setAttribute('stroke-width', '2');
        l.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(l);
    });

    const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    infoText.setAttribute('x', '20');
    infoText.setAttribute('y', '40');
    infoText.setAttribute('fill', '#fff');
    infoText.setAttribute('font-family', 'Segoe UI');
    infoText.setAttribute('font-size', '14');
    svg.appendChild(infoText);

    function updateSimulation(dt) {
      if (!engine.isRunning) return;

      const deltaT = dt / 1000;
      state.elapsed += deltaT;
      const t = state.elapsed;

      const omega2 = state.omega1 * (state.R1 / state.R2);
      const vBelt = Math.abs(state.omega1 * state.R1);

      state.theta1 += state.omega1 * deltaT;
      state.theta2 += omega2 * deltaT;

      const x1 = -state.dist / 2;
      const x2 = state.dist / 2;

      Matter.Body.setPosition(pulley1Body, { x: x1, y: 0 });
      Matter.Body.setAngle(pulley1Body, state.theta1);
      Matter.Body.setPosition(pulley2Body, { x: x2, y: 0 });
      Matter.Body.setAngle(pulley2Body, state.theta2);

      // Update belt lines
      beltTop.setAttribute('x1', engine.originX + x1);
      beltTop.setAttribute('y1', engine.originY - state.R1);
      beltTop.setAttribute('x2', engine.originX + x2);
      beltTop.setAttribute('y2', engine.originY - state.R2);

      beltBottom.setAttribute('x1', engine.originX + x1);
      beltBottom.setAttribute('y1', engine.originY + state.R1);
      beltBottom.setAttribute('x2', engine.originX + x2);
      beltBottom.setAttribute('y2', engine.originY + state.R2);

      chart.updateData(t, vBelt);

      infoText.innerHTML = `
        <tspan x="20" dy="1.2em" fill="#c9963a">ω₁ = ${state.omega1.toFixed(2)} rad/s</tspan>
        <tspan x="20" dy="1.2em" fill="#3498db">ω₂ = ${omega2.toFixed(2)} rad/s</tspan>
        <tspan x="20" dy="1.2em" fill="#aaa">v_belt = ω₁R₁ = ω₂R₂ = ${vBelt.toFixed(1)} px/s</tspan>
      `;
    }

    ui.addSlider('Vận tốc góc ω₁', -5, 5, 0.1, (v) => { state.omega1 = v; }, 1.5);
    ui.addSlider('Bán kính R₁', 30, 120, 5, (v) => { 
        state.R1 = v; 
        drawPulley(pulley1Group, state.R1, '#c9963a');
    }, 80);
    ui.addSlider('Bán kính R₂', 30, 120, 5, (v) => { 
        state.R2 = v; 
        drawPulley(pulley2Group, state.R2, '#3498db');
    }, 50);

    ui.addButton('Reset', () => {
        state.elapsed = 0; state.theta1 = 0; state.theta2 = 0;
        chart.clear();
    });

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
  window.SIM_MAP['ch2-3-2'] = init;
})();
