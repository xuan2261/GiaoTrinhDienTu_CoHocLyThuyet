/**
 * Ch1-1-6: Force Couple (Ngẫu lực)
 * A couple consists of two parallel forces that are equal in magnitude and opposite in direction.
 * The moment of a couple is M = F * d, where d is the perpendicular distance between the forces.
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
    canvasArea.style.flex = '0 0 760px';
    canvasArea.style.position = 'relative';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 760 440');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.className = 'sim-svg-v2';
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
      ox: 380,
      oy: 220,
      F_mag: 150,
      d: 120,
      angle: 0
    };

    // 4. SVG Primitives
    // Object (rectangle)
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    body.setAttribute('fill', 'rgba(52, 73, 94, 0.4)');
    body.setAttribute('stroke', '#c9963a');
    body.setAttribute('stroke-width', '2');
    svg.appendChild(body);

    // Force Arrows
    const arrowF1 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });
    const arrowF2 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });

    // Distance marker
    const armD = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    armD.setAttribute('stroke', '#c9963a');
    armD.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(armD);

    const labelD = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelD.setAttribute('fill', '#c9963a');
    labelD.setAttribute('font-size', '12px');
    labelD.setAttribute('text-anchor', 'middle');
    svg.appendChild(labelD);

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
      const rad = state.angle * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Force positions
      const perpCos = -sin;
      const perpSin = cos;
      
      const x1 = state.ox + perpCos * (state.d / 2);
      const y1 = state.oy + perpSin * (state.d / 2);
      
      const x2 = state.ox - perpCos * (state.d / 2);
      const y2 = state.oy - perpSin * (state.d / 2);

      // Force vectors
      const fx = state.F_mag * cos;
      const fy = state.F_mag * sin;

      arrowF1.update(x1, y1, x1 + fx, y1 + fy);
      arrowF2.update(x2, y2, x2 - fx, y2 - fy);

      // Distance marker
      armD.setAttribute('x1', x1);
      armD.setAttribute('y1', y1);
      armD.setAttribute('x2', x2);
      armD.setAttribute('y2', y2);
      
      labelD.setAttribute('x', state.ox - 10 * cos);
      labelD.setAttribute('y', state.oy - 10 * sin);
      labelD.textContent = `d = ${state.d.toFixed(0)} px`;

      // Body
      const bw = 240, bh = 100;
      body.setAttribute('x', -bw/2);
      body.setAttribute('y', -bh/2);
      body.setAttribute('width', bw);
      body.setAttribute('height', bh);
      body.setAttribute('transform', `translate(${state.ox}, ${state.oy}) rotate(${state.angle})`);

      const M = (state.F_mag * state.d / 100);

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">F = ${state.F_mag.toFixed(1)} N</div>
        <div style="color: #c9963a">d = ${state.d.toFixed(0)} px</div>
        <div style="color: #fd7e14; margin-top: 5px; font-weight: bold;">M = F \u00D7 d = ${M.toFixed(2)} N\u00B7m</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force Magnitude (F)', 50, 250, 1, (v) => {
      state.F_mag = v;
      updateVisuals();
    }, state.F_mag);

    ui.addSlider('Distance (d)', 20, 200, 1, (v) => {
      state.d = v;
      updateVisuals();
    }, state.d);

    ui.addSlider('Rotation Angle', 0, 360, 1, (v) => {
      state.angle = v;
      updateVisuals();
    }, state.angle);

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
    window.RouteRegistry.register('ch1-1-6', {
      chapter: 1,
      type: 'statics',
      title: 'Force Couple',
      hint: 'A couple consists of two parallel forces that are equal in magnitude and opposite in direction.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-1-6'] = init;
})();
