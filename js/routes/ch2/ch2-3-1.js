/**
 * ch2-3-1: Truyền động bánh răng (Two meshing gears: omega1*R1 = omega2*R2)
 * Architecture: V2 (SimulationEngine, SimV2Primitives, SimUI, SimChart)
 */
(function() {
  'use strict';

  function init(host) {
    // 1. Layout
    const layout = document.createElement('div');
    layout.setAttribute('class', 'sim-layout-v2');
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
    container.setAttribute('class', 'sim-viewport-v2');
    leftCol.appendChild(container);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.setAttribute('class', 'sim-svg-v2');
    container.appendChild(svg);

    // 3. Chart
    const chartContainer = document.createElement('div');
    chartContainer.setAttribute('class', 'sim-chart-container-v2');
    leftCol.appendChild(chartContainer);
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);

    // 4. UI Panel
    const uiPanel = document.createElement('div');
    uiPanel.setAttribute('class', 'sim-ui-panel-v2');
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
    const chart = new SimChart(canvas, 'Vận tốc góc bánh 2', 'ω₂ (rad/s)');

    // Simulation State
    let state = {
      omega1: 1.5,
      R1: 90,
      R2: 60,
      theta1: 0,
      theta2: 0,
      elapsed: 0
    };

    function drawGear(group, R, numTeeth, color) {
        while (group.firstChild) group.removeChild(group.firstChild);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', R);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', '4');
        group.appendChild(circle);

        for (let i = 0; i < numTeeth; i++) {
            const angle = (i / numTeeth) * Math.PI * 2;
            const tooth = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const tw = (2 * Math.PI * R) / (numTeeth * 2);
            const th = 10;
            tooth.setAttribute('width', tw);
            tooth.setAttribute('height', th);
            tooth.setAttribute('x', -tw / 2);
            tooth.setAttribute('y', -R - th / 2);
            tooth.setAttribute('fill', color);
            tooth.setAttribute('transform', `rotate(${angle * 180 / Math.PI})`);
            group.appendChild(tooth);
        }
        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('r', '4');
        center.setAttribute('fill', '#fff');
        group.appendChild(center);
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0'); line.setAttribute('y1', '0');
            line.setAttribute('x2', (R-5) * Math.cos(angle)); line.setAttribute('y2', (R-5) * Math.sin(angle));
            line.setAttribute('stroke', color); line.setAttribute('stroke-width', '2');
            group.appendChild(line);
        }
    }

    const gear1Group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gear2Group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(gear1Group);
    svg.appendChild(gear2Group);

    drawGear(gear1Group, state.R1, 24, '#c9963a');
    drawGear(gear2Group, state.R2, 16, '#3498db');

    const gear1Body = Matter.Bodies.circle(0, 0, state.R1, { isStatic: true });
    const gear2Body = Matter.Bodies.circle(0, 0, state.R2, { isStatic: true });
    engine.addBody(gear1Body, gear1Group);
    engine.addBody(gear2Body, gear2Group);

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
      state.theta1 += state.omega1 * deltaT;
      state.theta2 -= omega2 * deltaT;

      const x1 = - (state.R1 + state.R2) / 2;
      const x2 = (state.R1 + state.R2) / 2;

      Matter.Body.setPosition(gear1Body, { x: x1, y: 0 });
      Matter.Body.setAngle(gear1Body, state.theta1);
      Matter.Body.setPosition(gear2Body, { x: x2, y: 0 });
      Matter.Body.setAngle(gear2Body, state.theta2);

      chart.updateData(t, omega2);

      infoText.innerHTML = `
        <tspan x="20" dy="1.2em" fill="#c9963a">ω₁ = ${state.omega1.toFixed(2)} rad/s</tspan>
        <tspan x="20" dy="1.2em" fill="#3498db">ω₂ = ${omega2.toFixed(2)} rad/s</tspan>
        <tspan x="20" dy="1.2em" fill="#aaa">ω₁R₁ = ω₂R₂</tspan>
      `;
    }

    ui.addSlider('Vận tốc góc ω₁', -5, 5, 0.1, (v) => { state.omega1 = v; }, 1.5);
    ui.addSlider('Bán kính R₁', 50, 150, 5, (v) => { 
        state.R1 = v; 
        drawGear(gear1Group, state.R1, Math.round(state.R1/4), '#c9963a');
    }, 90);
    ui.addSlider('Bán kính R₂', 50, 150, 5, (v) => { 
        state.R2 = v; 
        drawGear(gear2Group, state.R2, Math.round(state.R2/4), '#3498db');
    }, 60);

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
  window.SIM_MAP['ch2-3-1'] = init;
})();
