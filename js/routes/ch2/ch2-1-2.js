/**
 * ch2-1-2: Vận tốc (Velocity Vector: prescribed motion on a curve)
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
    const chart = new SimChart(canvas, 'Thành phần vận tốc', 'v (px/s)');
    chart.data.datasets.push({
      label: 'v_y',
      data: [],
      borderColor: '#3498db',
      borderDash: [5, 5],
      borderWidth: 1,
      tension: 0.3,
      pointRadius: 0
    });

    let state = {
      amplitude: 150,
      freq: 1.0,
      elapsed: 0,
      trailPoints: []
    };

    const particle = Matter.Bodies.circle(0, 0, 8, { isStatic: true });
    const particleEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particleEl.setAttribute('r', '8');
    particleEl.setAttribute('fill', '#fff');
    particleEl.setAttribute('stroke', '#3498db');
    particleEl.setAttribute('stroke-width', '2');
    svg.appendChild(particleEl);

    const trailGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(trailGroup);

    const vArrow = SimV2Primitives.createArrow(svg, { color: '#3498db', label: 'v' });
    const vxArrow = SimV2Primitives.createArrow(svg, { color: '#8ea0b8', strokeWidth: 1, label: 'vx' });
    const vyArrow = SimV2Primitives.createArrow(svg, { color: '#8ea0b8', strokeWidth: 1, label: 'vy' });

    function getMotion(t) {
      const A = state.amplitude;
      const w = state.freq;
      const x = A * Math.cos(w * t);
      const y = A * 0.5 * Math.sin(2 * w * t);
      const vx = -A * w * Math.sin(w * t);
      const vy = A * w * Math.cos(2 * w * t);
      return { pos: { x, y }, vel: { x: vx, y: vy } };
    }

    function updateSimulation(dt) {
      if (!engine.isRunning) return;

      state.elapsed += (dt / 1000);
      const calc = getMotion(state.elapsed);
      Matter.Body.setPosition(particle, calc.pos);

      state.trailPoints.push({ ...calc.pos });
      if (state.trailPoints.length > 100) state.trailPoints.shift();

      while (trailGroup.firstChild) trailGroup.removeChild(trailGroup.firstChild);
      state.trailPoints.forEach((pt, i) => {
        if (i % 2 === 0) {
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', pt.x);
            dot.setAttribute('cy', pt.y);
            dot.setAttribute('r', 1);
            dot.setAttribute('fill', '#3498db');
            dot.setAttribute('opacity', i / state.trailPoints.length);
            trailGroup.appendChild(dot);
        }
      });

      chart.updateData(state.elapsed, Math.abs(calc.vel.x));
      chart.data.datasets[1].data.push(Math.abs(calc.vel.y));
      if (chart.data.datasets[1].data.length > chart.maxPoints) chart.data.datasets[1].data.shift();
    }

    engine.addBody(particle, particleEl, (body, el) => {
       const x = body.position.x + engine.originX;
       const y = engine.viewHeight - body.position.y - engine.originY;
       el.setAttribute('cx', x);
       el.setAttribute('cy', y);
       
       const calc = getMotion(state.elapsed);
       const transform = (p) => ({
            x: p.x + engine.originX,
            y: engine.viewHeight - p.y - engine.originY
       });

       const p0 = transform(calc.pos);
       const vScale = 0.5;
       vArrow.update(p0.x, p0.y, p0.x + calc.vel.x * vScale, p0.y - calc.vel.y * vScale);
       vxArrow.update(p0.x, p0.y, p0.x + calc.vel.x * vScale, p0.y);
       vyArrow.update(p0.x, p0.y, p0.x, p0.y - calc.vel.y * vScale);

       trailGroup.setAttribute('transform', `translate(${engine.originX}, ${engine.originY}) scale(1, -1)`);
    });

    ui.addSlider('Biên độ', 50, 250, 10, (v) => { state.amplitude = v; state.trailPoints = []; chart.clear(); }, 150);
    ui.addSlider('Tần số', 0.1, 3.0, 0.1, (v) => { state.freq = v; state.trailPoints = []; chart.clear(); }, 1.0);

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
        SimV2Disposal.dispose([vArrow, vxArrow, vyArrow, chart]);
        host.innerHTML = '';
      }
    };
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-1-2'] = init;
})();
