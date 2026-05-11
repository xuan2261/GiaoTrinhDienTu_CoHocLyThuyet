/**
 * Ch1-2-2: Two-Force Equilibrium (Hai lực cân bằng)
 * A body subjected to only two forces is in equilibrium if and only if the two forces are 
 * equal in magnitude, opposite in direction, and collinear.
 */
(function() {
  'use strict';

  function init(host) {
    // 1. Setup Layout
    const container = document.createElement('div');
    container.setAttribute('class', 'sim-viewport-v2');
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.width = '100%';
    container.style.height = '440px';
    
    const canvasArea = document.createElement('div');
    canvasArea.style.flex = '0 0 760px';
    canvasArea.style.position = 'relative';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 760 440');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.setAttribute('class', 'sim-svg-v2');
    canvasArea.appendChild(svg);
    
    const uiPanel = document.createElement('div');
    uiPanel.style.flex = '1';
    uiPanel.style.padding = '15px';
    uiPanel.style.backgroundColor = 'rgba(232, 236, 241, 0.03)';
    uiPanel.style.borderLeft = '1px solid rgba(232, 236, 241, 0.1)';
    
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
      ox: 380, oy: 220,
      bw: 300, bh: 40,
      angle: 20,
      F_mag: 150,
      isCollinear: true
    };

    // 4. SVG Primitives
    // Bar
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    body.setAttribute('fill', 'rgba(52, 73, 94, 0.6)');
    body.setAttribute('stroke', '#c9963a');
    body.setAttribute('stroke-width', '2');
    svg.appendChild(body);

    // Force Arrows
    const arrowF1 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });
    const arrowF2 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });

    // Collinear line (Dashed)
    const lineCollinear = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineCollinear.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    lineCollinear.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(lineCollinear);

    // 5. Result Readout
    const readout = document.createElement('div');
    readout.setAttribute('class', 'sim-readout-v2');
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    readout.style.fontFamily = 'monospace';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      const rad = state.angle * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Body transformation
      body.setAttribute('x', -state.bw / 2);
      body.setAttribute('y', -state.bh / 2);
      body.setAttribute('width', state.bw);
      body.setAttribute('height', state.bh);
      body.setAttribute('transform', `translate(${state.ox}, ${state.oy}) rotate(${state.angle})`);

      // Force positions
      const x1 = state.ox - (state.bw / 2) * cos;
      const y1 = state.oy - (state.bw / 2) * sin;
      const x2 = state.ox + (state.bw / 2) * cos;
      const y2 = state.oy + (state.bw / 2) * sin;

      // Forces
      let f1x, f1y, f2x, f2y;
      if (state.isCollinear) {
        f1x = -state.F_mag * cos;
        f1y = -state.F_mag * sin;
        f2x = state.F_mag * cos;
        f2y = state.F_mag * sin;
      } else {
        f1x = 0;
        f1y = -state.F_mag;
        f2x = 0;
        f2y = state.F_mag;
      }

      arrowF1.update(x1, y1, x1 + f1x, y1 + f1y);
      arrowF2.update(x2, y2, x2 + f2x, y2 + f2y);

      // Collinear line
      lineCollinear.setAttribute('x1', x1 - 100 * cos);
      lineCollinear.setAttribute('y1', y1 - 100 * sin);
      lineCollinear.setAttribute('x2', x2 + 100 * cos);
      lineCollinear.setAttribute('y2', y2 + 100 * sin);

      // Equilibrium check
      const rx1 = x1 - state.ox;
      const ry1 = y1 - state.oy;
      const rx2 = x2 - state.ox;
      const ry2 = y2 - state.oy;

      const M1 = rx1 * f1y - ry1 * f1x;
      const M2 = rx2 * f2y - ry2 * f2x;
      const sumM = (M1 + M2) / 100;

      const isBalanced = Math.abs(sumM) < 0.01;

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">F1 = F2 = ${state.F_mag.toFixed(0)} N</div>
        <div style="color: #c9963a">Bar Angle = ${state.angle.toFixed(1)}\u00B0</div>
        <div style="color: ${isBalanced ? '#44ff44' : '#ff4444'}">\u03A3M = ${sumM.toFixed(2)} N\u00B7m</div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
        <div style="text-align: center; font-weight: bold; color: ${isBalanced ? '#44ff44' : '#ff4444'}">
          ${isBalanced ? 'EQUILIBRIUM' : 'NON-EQUILIBRIUM'}
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force Magnitude', 50, 200, 1, (v) => {
      state.F_mag = v;
      updateVisuals();
    }, state.F_mag);

    ui.addSlider('Bar Angle', -90, 90, 1, (v) => {
      state.angle = v;
      updateVisuals();
    }, state.angle);

    ui.addCheckbox('Collinear Forces', (v) => {
      state.isCollinear = v;
      updateVisuals();
    }, state.isCollinear);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowF1, arrowF2]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-2-2', {
      chapter: 1,
      type: 'statics',
      title: 'Two-Force Equilibrium',
      hint: 'Two forces in equilibrium must be equal, opposite, and collinear.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-2-2'] = init;
})();
