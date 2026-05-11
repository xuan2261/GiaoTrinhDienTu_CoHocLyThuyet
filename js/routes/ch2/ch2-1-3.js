/**
 * ch2-1-3: Gia tốc (Acceleration Vector: circular motion with alpha adjustment)
 * Architecture: V2 (SimulationEngine, SimV2Primitives, SimUI, SimChart)
 */
(function() {
  'use strict';

  function init(host) {
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

    const container = document.createElement('div');
    container.setAttribute('class', 'sim-viewport-v2');
    leftCol.appendChild(container);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.setAttribute('class', 'sim-svg-v2');
    container.appendChild(svg);

    const chartContainer = document.createElement('div');
    chartContainer.setAttribute('class', 'sim-chart-container-v2');
    leftCol.appendChild(chartContainer);
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);

    const uiPanel = document.createElement('div');
    uiPanel.setAttribute('class', 'sim-ui-panel-v2');
    rightCol.appendChild(uiPanel);

    const engine = new SimulationEngine({
      gravity: 0,
      viewHeight: 500,
      originX: 400,
      originY: 250,
      flipY: true
    });

    const ui = new SimUI(uiPanel);
    const chart = new SimChart(canvas, 'Độ lớn gia tốc', 'a (px/s²)');

    let state = {
      radius: 150,
      omega0: 1.0,
      alpha: 0.2,
      theta: 0,
      omega: 1.0,
      elapsed: 0,
      trailPoints: []
    };

    const particle = Matter.Bodies.circle(0, 0, 8, { isStatic: true });
    const particleEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particleEl.setAttribute('r', '8');
    particleEl.setAttribute('fill', '#fff');
    particleEl.setAttribute('stroke', '#e74c3c');
    particleEl.setAttribute('stroke-width', '2');
    svg.appendChild(particleEl);

    // Center point
    const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    center.setAttribute('cx', 400);
    center.setAttribute('cy', 250);
    center.setAttribute('r', 3);
    center.setAttribute('fill', '#8ea0b8');
    svg.appendChild(center);

    const trailGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(trailGroup);

    const aArrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c', label: 'a' });
    const vArrow = SimV2Primitives.createArrow(svg, { color: '#3498db', label: 'v' });

    function updateSimulation(dt) {
      if (!engine.isRunning) return;

      const deltaT = dt / 1000;
      state.elapsed += deltaT;
      
      // omega = omega0 + alpha * t
      state.omega = state.omega0 + state.alpha * state.elapsed;
      // theta = omega0 * t + 0.5 * alpha * t^2
      state.theta = state.omega0 * state.elapsed + 0.5 * state.alpha * state.elapsed**2;

      const R = state.radius;
      const x = R * Math.cos(state.theta);
      const y = R * Math.sin(state.theta);
      
      Matter.Body.setPosition(particle, { x, y });

      state.trailPoints.push({ x, y });
      if (state.trailPoints.length > 100) state.trailPoints.shift();

      while (trailGroup.firstChild) trailGroup.removeChild(trailGroup.firstChild);
      state.trailPoints.forEach((pt, i) => {
        if (i % 2 === 0) {
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', pt.x);
            dot.setAttribute('cy', pt.y);
            dot.setAttribute('r', 1);
            dot.setAttribute('fill', '#e74c3c');
            dot.setAttribute('opacity', i / state.trailPoints.length);
            trailGroup.appendChild(dot);
        }
      });

      // Calculate acceleration magnitude
      // a_t = R * alpha
      // a_n = R * omega^2
      const at = R * state.alpha;
      const an = R * state.omega**2;
      const aMag = Math.sqrt(at**2 + an**2);
      chart.updateData(state.elapsed, aMag);
    }

    engine.addBody(particle, particleEl, (body, el) => {
       const x = body.position.x + engine.originX;
       const y = engine.viewHeight - body.position.y - engine.originY;
       el.setAttribute('cx', x);
       el.setAttribute('cy', y);
       
       const R = state.radius;
       const cosT = Math.cos(state.theta);
       const sinT = Math.sin(state.theta);
       
       const transform = (p) => ({
            x: p.x + engine.originX,
            y: engine.viewHeight - p.y - engine.originY
       });

       const p0 = transform(body.position);
       
       // v = R*omega in tangential direction
       const vScale = 0.5;
       const vMag = R * state.omega;
       const vx = -vMag * sinT;
       const vy = vMag * cosT;
       vArrow.update(p0.x, p0.y, p0.x + vx * vScale, p0.y - vy * vScale);

       // a = at * tau + an * n
       // tau = (-sinT, cosT), n = (-cosT, -sinT)
       const at = R * state.alpha;
       const an = R * state.omega**2;
       const ax = at * (-sinT) + an * (-cosT);
       const ay = at * (cosT) + an * (-sinT);
       
       const aScale = 0.2;
       aArrow.update(p0.x, p0.y, p0.x + ax * aScale, p0.y - ay * aScale);

       trailGroup.setAttribute('transform', `translate(${engine.originX}, ${engine.originY}) scale(1, -1)`);
    });

    ui.addSlider('Vận tốc góc đầu (ω₀)', 0, 5, 0.5, (v) => { 
        state.omega0 = v; 
        state.elapsed = 0; 
        state.trailPoints = []; 
        chart.clear(); 
    }, 1.0);
    ui.addSlider('Gia tốc góc (α)', -2, 2, 0.1, (v) => { 
        state.alpha = v; 
        state.elapsed = 0; 
        state.trailPoints = []; 
        chart.clear(); 
    }, 0.2);

    ui.addButton('Reset', () => {
        state.elapsed = 0;
        state.trailPoints = [];
        chart.clear();
    });

    const originalTick = engine.tick;
    engine.tick = (time) => {
        if (engine.isRunning) updateSimulation(engine.fixedDelta);
        originalTick(time);
    };

    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([vArrow, aArrow, chart]);
        host.innerHTML = '';
      }
    };
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-1-3'] = init;
})();
