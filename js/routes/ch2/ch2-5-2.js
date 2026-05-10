/**
 * ch2-5-2: Tâm vận tốc tức thời (IC - Instant Center visualization)
 * Plane motion: Finding the IC from two known velocity vectors.
 */
(function() {
  'use strict';

  function init(host) {
    // 1. Setup Layout
    const container = document.createElement('div');
    container.className = 'sim-viewport-v2';
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.width = '100%';
    container.style.height = '440px';
    
    const canvasArea = document.createElement('div');
    canvasArea.style.flex = '0 0 500px';
    canvasArea.style.position = 'relative';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 440');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.className = 'sim-svg-v2';
    canvasArea.appendChild(svg);
    
    const uiPanel = document.createElement('div');
    uiPanel.style.flex = '1';
    uiPanel.style.padding = '15px';
    uiPanel.style.backgroundColor = 'rgba(232, 236, 241, 0.03)';
    uiPanel.style.borderLeft = '1px solid rgba(232, 236, 241, 0.1)';
    uiPanel.style.overflowY = 'auto';
    
    container.appendChild(canvasArea);
    container.appendChild(uiPanel);
    host.appendChild(container);

    // 2. Foundation Components
    const engine = new SimulationEngine({ 
      gravity: 0,
      viewHeight: 440,
      originX: 0,
      originY: 0,
      flipY: false 
    });

    const ui = new SimUI(uiPanel);
    
    // 3. State
    let state = {
      omega: 1.2,
      ax: 150,
      ay: 150,
      bx: 350,
      by: 180,
      icx: 250,
      icy: 300
    };

    // 4. SVG Primitives
    // Rigid body (placeholder)
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    body.setAttribute('fill', 'rgba(201, 150, 58, 0.05)');
    body.setAttribute('stroke', '#c9963a');
    body.setAttribute('stroke-width', '1');
    body.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(body);

    // Perpendicular lines
    const perpA = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    perpA.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    perpA.setAttribute('stroke-dasharray', '4,4');
    svg.appendChild(perpA);

    const perpB = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    perpB.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    perpB.setAttribute('stroke-dasharray', '4,4');
    svg.appendChild(perpB);

    // Point A, B
    const pointA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointA.setAttribute('r', '5');
    pointA.setAttribute('fill', '#fff');
    pointA.setAttribute('stroke', '#3498db');
    svg.appendChild(pointA);

    const pointB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointB.setAttribute('r', '5');
    pointB.setAttribute('fill', '#fff');
    pointB.setAttribute('stroke', '#44ff44');
    svg.appendChild(pointB);

    // IC point
    const pointIC = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointIC.setAttribute('r', '6');
    pointIC.setAttribute('fill', '#ff4444');
    pointIC.setAttribute('stroke', '#fff');
    svg.appendChild(pointIC);

    // Velocity Arrows
    const arrowVa = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2, label: 'vA' });
    const arrowVb = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 2, label: 'vB' });

    // Labels
    function createText(text, color) {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      el.textContent = text;
      el.setAttribute('fill', color);
      el.setAttribute('font-size', '12');
      el.setAttribute('font-weight', 'bold');
      svg.appendChild(el);
      return el;
    }
    const labelA = createText('A', '#3498db');
    const labelB = createText('B', '#44ff44');
    const labelIC = createText('IC', '#ff4444');

    // 5. Result Readout
    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    readout.style.fontFamily = 'monospace';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      // Points
      pointA.setAttribute('cx', state.ax);
      pointA.setAttribute('cy', state.ay);
      pointB.setAttribute('cx', state.bx);
      pointB.setAttribute('cy', state.by);
      pointIC.setAttribute('cx', state.icx);
      pointIC.setAttribute('cy', state.icy);

      labelA.setAttribute('x', state.ax - 15);
      labelA.setAttribute('y', state.ay - 10);
      labelB.setAttribute('x', state.bx + 10);
      labelB.setAttribute('y', state.by - 10);
      labelIC.setAttribute('x', state.icx - 10);
      labelIC.setAttribute('y', state.icy + 20);

      // Radii from IC
      const rax = state.ax - state.icx;
      const ray = state.ay - state.icy;
      const rbx = state.bx - state.icx;
      const rby = state.by - state.icy;

      // Velocities: v = omega x r (in 2D perpendicular)
      // v.x = -omega * r.y, v.y = omega * r.x
      const vax = -state.omega * ray;
      const vay = state.omega * rax;
      const vbx = -state.omega * rby;
      const vby = state.omega * rbx;

      const scale = 0.5;
      arrowVa.update(state.ax, state.ay, state.ax + vax * scale, state.ay + vay * scale);
      arrowVb.update(state.bx, state.by, state.bx + vbx * scale, state.by + vby * scale);

      // Perpendicular lines (connecting points to IC)
      perpA.setAttribute('x1', state.ax);
      perpA.setAttribute('y1', state.ay);
      perpA.setAttribute('x2', state.icx);
      perpA.setAttribute('y2', state.icy);

      perpB.setAttribute('x1', state.bx);
      perpB.setAttribute('y1', state.by);
      perpB.setAttribute('x2', state.icx);
      perpB.setAttribute('y2', state.icy);

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">Tâm tức thời IC: (${state.icx.toFixed(0)}, ${state.icy.toFixed(0)})</div>
        <div style="color: #3498db">v_A = \u03C9.r_A = ${(state.omega * Math.hypot(rax, ray)).toFixed(1)}</div>
        <div style="color: #44ff44">v_B = \u03C9.r_B = ${(state.omega * Math.hypot(rbx, rby)).toFixed(1)}</div>
        <div style="color: #8ea0b8; margin-top: 10px;">\u03C9 = ${state.omega.toFixed(2)} rad/s</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Vận tốc góc (\u03C9)', 0.1, 5, 0.1, (v) => {
      state.omega = v;
      updateVisuals();
    }, state.omega);

    ui.addSlider('IC X', 50, 450, 1, (v) => {
      state.icx = v;
      updateVisuals();
    }, state.icx);

    ui.addSlider('IC Y', 50, 400, 1, (v) => {
      state.icy = v;
      updateVisuals();
    }, state.icy);

    ui.addSlider('Điểm A X', 50, 450, 1, (v) => {
      state.ax = v;
      updateVisuals();
    }, state.ax);

    ui.addSlider('Điểm A Y', 50, 400, 1, (v) => {
      state.ay = v;
      updateVisuals();
    }, state.ay);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowVa, arrowVb]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-5-2', {
      chapter: 2,
      type: 'kinematics',
      title: 'Tâm vận tốc tức thời (IC)',
      hint: 'Mọi điểm trên vật rắn đang chuyển động phẳng có thể coi là đang quay quanh Tâm vận tốc tức thời IC tại một thời điểm.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-5-2'] = init;
})();
