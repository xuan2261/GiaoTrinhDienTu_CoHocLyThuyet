/**
 * ch2-2-2: Vận tốc và gia tốc các điểm trên vật quay (Show v, at, an at different radii)
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
    const chart = new SimChart(canvas, 'Gia tốc tổng hợp (điểm ngoài cùng)', 'a (px/s²)');

    // Simulation State
    let state = {
      omega: 1.0,
      alpha: 0.5,
      theta: 0,
      elapsed: 0,
      radii: [60, 110, 160]
    };

    // Body Group
    const bodyGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(bodyGroup);

    // Draw rotating arm/disk background
    const disk = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    disk.setAttribute('r', '170');
    disk.setAttribute('fill', 'rgba(52, 152, 219, 0.05)');
    disk.setAttribute('stroke', 'rgba(52, 152, 219, 0.2)');
    disk.setAttribute('stroke-dasharray', '5,5');
    bodyGroup.appendChild(disk);

    // Spokes for visual reference
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0'); line.setAttribute('y1', '0');
        line.setAttribute('x2', 170 * Math.cos(angle)); line.setAttribute('y2', 170 * Math.sin(angle));
        line.setAttribute('stroke', 'rgba(255,255,255,0.1)');
        bodyGroup.appendChild(line);
    }

    // Points and Arrows
    const points = state.radii.map((r, i) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        bodyGroup.appendChild(g);

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', r);
        dot.setAttribute('cy', '0');
        dot.setAttribute('r', '5');
        dot.setAttribute('fill', '#fff');
        g.appendChild(dot);

        return {
            r,
            group: g,
            vArrow: SimV2Primitives.createArrow(svg, { color: '#3498db', label: 'v' }),
            atArrow: SimV2Primitives.createArrow(svg, { color: '#27ae60', label: 'at' }),
            anArrow: SimV2Primitives.createArrow(svg, { color: '#e74c3c', label: 'an' })
        };
    });

    const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    infoText.setAttribute('x', '20');
    infoText.setAttribute('y', '40');
    infoText.setAttribute('fill', '#fff');
    infoText.setAttribute('font-family', 'Segoe UI');
    infoText.setAttribute('font-size', '14');
    svg.appendChild(infoText);

    // Matter Body for synchronization
    const mainBody = Matter.Bodies.circle(0, 0, 10, { isStatic: true });
    engine.addBody(mainBody, bodyGroup);

    function updateSimulation(dt) {
      if (!engine.isRunning) return;

      const deltaT = dt / 1000;
      state.elapsed += deltaT;
      const t = state.elapsed;

      state.omega += state.alpha * deltaT;
      state.theta += state.omega * deltaT;

      Matter.Body.setAngle(mainBody, state.theta);

      const transform = (p) => ({
          x: p.x + engine.originX,
          y: engine.viewHeight - p.y - engine.originY
      });

      // Update vectors based on world space positions
      points.forEach(p => {
          const angle = state.theta;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          
          const px = p.r * cos;
          const py = p.r * sin;
          const p0 = transform({ x: px, y: py });

          const vMag = state.omega * p.r;
          const atMag = state.alpha * p.r;
          const anMag = state.omega * state.omega * p.r;

          const vScale = 0.5;
          const aScale = 0.2;

          const vVec = { x: -sin * vMag, y: cos * vMag };
          const atVec = { x: -sin * atMag, y: cos * atMag };
          const anVec = { x: -cos * anMag, y: -sin * anMag };

          const pv = transform({ x: px + vVec.x * vScale, y: py + vVec.y * vScale });
          const pat = transform({ x: px + atVec.x * aScale, y: py + atVec.y * aScale });
          const pan = transform({ x: px + anVec.x * aScale, y: py + anVec.y * aScale });

          p.vArrow.update(p0.x, p0.y, pv.x, pv.y);
          p.atArrow.update(p0.x, p0.y, pat.x, pat.y);
          p.anArrow.update(p0.x, p0.y, pan.x, pan.y);
      });

      const outer = points[points.length - 1];
      const aTotal = Math.sqrt(Math.pow(state.alpha * outer.r, 2) + Math.pow(state.omega * state.omega * outer.r, 2));
      chart.updateData(t, aTotal);

      infoText.innerHTML = `
        <tspan x="20" dy="1.2em" fill="#3498db">ω = ${state.omega.toFixed(2)} rad/s</tspan>
        <tspan x="20" dy="1.2em" fill="#e74c3c">α = ${state.alpha.toFixed(2)} rad/s²</tspan>
        <tspan x="20" dy="1.2em" fill="#aaa">v = ω·r</tspan>
        <tspan x="20" dy="1.2em" fill="#aaa">a_t = ε·r, a_n = ω²·r</tspan>
      `;
    }

    ui.addSlider('Gia tốc góc α', -2, 2, 0.1, (v) => { state.alpha = v; }, 0.5);
    ui.addButton('Reset Vận tốc', () => { state.omega = 0; chart.clear(); });
    ui.addButton('Reset Tất cả', () => { 
        state.elapsed = 0; state.theta = 0; state.omega = 0; 
        Matter.Body.setAngle(mainBody, 0);
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
        points.forEach(p => SimV2Disposal.dispose([p.vArrow, p.atArrow, p.anArrow]));
        SimV2Disposal.dispose([chart]);
        host.innerHTML = '';
      }
    };
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-2-2'] = init;
})();
