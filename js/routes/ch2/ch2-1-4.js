/**
 * ch2-1-4: Gia tốc tiếp tuyến và pháp tuyến (Tangential and Normal components)
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
    const chart = new SimChart(canvas, 'Thành phần gia tốc', 'a (px/s²)');
    chart.data.datasets.push({
      label: 'a_n',
      data: [],
      borderColor: '#e74c3c',
      borderDash: [5, 5],
      borderWidth: 1,
      tension: 0.3,
      pointRadius: 0
    });

    let state = {
      radius: 150,
      omega: 1.5,
      alpha: 0.5,
      theta: 0,
      elapsed: 0,
      trailPoints: []
    };

    const particle = Matter.Bodies.circle(0, 0, 8, { isStatic: true });
    const particleEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particleEl.setAttribute('r', '8');
    particleEl.setAttribute('fill', '#fff');
    particleEl.setAttribute('stroke', '#e67e22');
    particleEl.setAttribute('stroke-width', '2');
    svg.appendChild(particleEl);

    const trailGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(trailGroup);

    const atArrow = SimV2Primitives.createArrow(svg, { color: '#f1c40f', label: 'a_t' });
    const anArrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c', label: 'a_n' });
    const aArrow = SimV2Primitives.createArrow(svg, { color: '#fff', label: 'a', strokeWidth: 1 });

    function updateSimulation(dt) {
      if (!engine.isRunning) return;

      const deltaT = dt / 1000;
      state.elapsed += deltaT;
      
      const omega = state.omega + state.alpha * state.elapsed;
      state.theta = state.omega * state.elapsed + 0.5 * state.alpha * state.elapsed**2;

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
            dot.setAttribute('fill', '#e67e22');
            dot.setAttribute('opacity', i / state.trailPoints.length);
            trailGroup.appendChild(dot);
        }
      });

      const at = R * state.alpha;
      const an = R * omega**2;
      chart.updateData(state.elapsed, Math.abs(at));
      chart.data.datasets[1].data.push(Math.abs(an));
      if (chart.data.datasets[1].data.length > chart.maxPoints) chart.data.datasets[1].data.shift();
    }

    engine.addBody(particle, particleEl, (body, el) => {
       const x = body.position.x + engine.originX;
       const y = engine.viewHeight - body.position.y - engine.originY;
       el.setAttribute('cx', x);
       el.setAttribute('cy', y);
       
       const R = state.radius;
       const cosT = Math.cos(state.theta);
       const sinT = Math.sin(state.theta);
       const omega = state.omega + state.alpha * state.elapsed;
       
       const transform = (p) => ({
            x: p.x + engine.originX,
            y: engine.viewHeight - p.y - engine.originY
       });

       const p0 = transform(body.position);
       
       const at = R * state.alpha;
       const an = R * omega**2;
       
       const atDir = { x: -sinT, y: cosT };
       const anDir = { x: -cosT, y: -sinT };
       
       const aScale = 0.2;
       atArrow.update(p0.x, p0.y, p0.x + atDir.x * at * aScale, p0.y - atDir.y * at * aScale);
       anArrow.update(p0.x, p0.y, p0.x + anDir.x * an * aScale, p0.y - anDir.y * an * aScale);
       
       const ax = at * atDir.x + an * anDir.x;
       const ay = at * atDir.y + an * anDir.y;
       aArrow.update(p0.x, p0.y, p0.x + ax * aScale, p0.y - ay * aScale);

       trailGroup.setAttribute('transform', `translate(${engine.originX}, ${engine.originY}) scale(1, -1)`);
    });

    ui.addSlider('Bán kính', 50, 200, 10, (v) => { state.radius = v; state.trailPoints = []; chart.clear(); }, 150);
    ui.addSlider('Gia tốc góc (α)', -2, 2, 0.1, (v) => { state.alpha = v; state.elapsed = 0; state.trailPoints = []; chart.clear(); }, 0.5);

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
        SimV2Disposal.dispose([atArrow, anArrow, aArrow, chart]);
        host.innerHTML = '';
      }
    };
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-1-4'] = init;
})();
