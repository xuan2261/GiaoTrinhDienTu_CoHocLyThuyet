/**
 * ch2-1-1: Quỹ đạo chuyển động (Trajectory: Circle, Ellipse, Lemniscate)
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
    const chart = new SimChart(canvas, 'Tốc độ theo thời gian', 'v (px/s)');

    // Simulation State
    let state = {
      pathType: 'circle',
      speed: 1.0,
      radius: 150,
      elapsed: 0,
      trailPoints: []
    };

    const particle = Matter.Bodies.circle(0, 0, 8, { isStatic: true });
    const particleEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particleEl.setAttribute('r', '8');
    particleEl.setAttribute('fill', '#fff');
    particleEl.setAttribute('stroke', '#c9963a');
    particleEl.setAttribute('stroke-width', '2');
    svg.appendChild(particleEl);

    // Trail Group
    const trailGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(trailGroup);

    // Vectors
    const vArrow = SimV2Primitives.createArrow(svg, { color: '#3498db', label: 'v' });
    const aArrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c', label: 'a' });

    // Path Logic
    const paths = {
      circle: (t) => {
        const R = state.radius;
        return {
          pos: { x: R * Math.cos(t), y: R * Math.sin(t) },
          vel: { x: -R * Math.sin(t), y: R * Math.cos(t) },
          acc: { x: -R * Math.cos(t), y: -R * Math.sin(t) }
        };
      },
      ellipse: (t) => {
        const a = state.radius;
        const b = state.radius * 0.6;
        return {
          pos: { x: a * Math.cos(t), y: b * Math.sin(t) },
          vel: { x: -a * Math.sin(t), y: b * Math.cos(t) },
          acc: { x: -a * Math.cos(t), y: -b * Math.sin(t) }
        };
      },
      lemniscate: (t) => {
        const a = state.radius * 1.2;
        const sinT = Math.sin(t);
        const cosT = Math.cos(t);
        const den = 1 + sinT * sinT;
        // Approximation for vel/acc for visual clarity
        const x = a * cosT / den;
        const y = a * sinT * cosT / den;
        const dt = 0.01;
        const t2 = t + dt;
        const sinT2 = Math.sin(t2);
        const cosT2 = Math.cos(t2);
        const den2 = 1 + sinT2 * sinT2;
        const x2 = a * cosT2 / den2;
        const y2 = a * sinT2 * cosT2 / den2;
        return {
          pos: { x, y },
          vel: { x: (x2 - x) / dt, y: (y2 - y) / dt },
          acc: { x: 0, y: 0 } // Simpler for lemniscate in V2
        };
      }
    };

    // Update function
    function updateSimulation(dt) {
      if (!engine.isRunning) return;

      state.elapsed += (dt / 1000) * state.speed;
      const t = state.elapsed;
      const calc = paths[state.pathType](t);

      Matter.Body.setPosition(particle, calc.pos);
      
      const vScale = 0.5;
      const aScale = 0.5;
      
      // Update vectors
      vArrow.update(calc.pos.x, calc.pos.y, calc.pos.x + calc.vel.x * vScale, calc.pos.y + calc.vel.y * vScale);
      if (state.pathType !== 'lemniscate') {
          aArrow.update(calc.pos.x, calc.pos.y, calc.pos.x + calc.acc.x * aScale, calc.pos.y + calc.acc.y * aScale);
      } else {
          aArrow.update(0,0,0,0);
      }

      // Trail
      state.trailPoints.push({ ...calc.pos });
      if (state.trailPoints.length > 100) state.trailPoints.shift();

      // Render Trail
      while (trailGroup.firstChild) trailGroup.removeChild(trailGroup.firstChild);
      state.trailPoints.forEach((pt, i) => {
        if (i % 2 === 0) { // Sparse trail
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', pt.x);
            dot.setAttribute('cy', pt.y);
            dot.setAttribute('r', 1);
            dot.setAttribute('fill', '#c9963a');
            dot.setAttribute('opacity', i / state.trailPoints.length);
            trailGroup.appendChild(dot);
        }
      });

      // Chart
      const speedMag = Math.sqrt(calc.vel.x**2 + calc.vel.y**2);
      chart.updateData(state.elapsed, speedMag);
    }

    engine.addBody(particle, particleEl, (body, el) => {
       // Manual sync handled in updateSimulation but Engine expects a function
       const x = body.position.x + engine.originX;
       const y = engine.viewHeight - body.position.y - engine.originY; // flipY
       el.setAttribute('cx', x);
       el.setAttribute('cy', y);
       
       // Update Arrows based on transformed coordinates
       // Actually it's easier to just use the engine's defaultSync if we use group
    });

    // Redefine sync for vectors
    const originalSync = engine.defaultSync;
    engine.defaultSync = (body, el) => {
        originalSync.call(engine, body, el);
        // We also need to sync the non-body elements
        const t = state.elapsed;
        const calc = paths[state.pathType](t);
        
        const transform = (p) => ({
            x: p.x + engine.originX,
            y: engine.viewHeight - p.y - engine.originY
        });

        const p0 = transform(calc.pos);
        const pv = transform({ x: calc.pos.x + calc.vel.x * 0.5, y: calc.pos.y + calc.vel.y * 0.5 });
        vArrow.update(p0.x, p0.y, pv.x, pv.y);

        if (state.pathType !== 'lemniscate') {
            const pa = transform({ x: calc.pos.x + calc.acc.x * 0.5, y: calc.pos.y + calc.acc.y * 0.5 });
            aArrow.update(p0.x, p0.y, pa.x, pa.y);
        }

        // Sync trail group
        trailGroup.setAttribute('transform', `translate(${engine.originX}, ${engine.originY}) scale(1, -1)`);
    };

    // UI Controls
    ui.addSlider('Tốc độ', 0.1, 5.0, 0.1, (v) => { state.speed = v; }, 1.0);
    ui.addSlider('Bán kính', 50, 200, 10, (v) => { 
        state.radius = v; 
        state.trailPoints = [];
        chart.clear();
    }, 150);

    const btnGroup = document.createElement('div');
    btnGroup.className = 'sim-btn-group-v2';
    uiPanel.appendChild(btnGroup);

    ['circle', 'ellipse', 'lemniscate'].forEach(p => {
        ui.addButton(p.toUpperCase(), () => {
            state.pathType = p;
            state.trailPoints = [];
            state.elapsed = 0;
            chart.clear();
        }, state.pathType === p);
    });

    ui.addButton('Reset', () => {
        state.elapsed = 0;
        state.trailPoints = [];
        chart.clear();
    });

    const originalTick = engine.tick;
    engine.tick = (time) => {
        if (engine.isRunning) {
            const dt = engine.fixedDelta;
            updateSimulation(dt);
        }
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
  window.SIM_MAP['ch2-1-1'] = init;
})();
