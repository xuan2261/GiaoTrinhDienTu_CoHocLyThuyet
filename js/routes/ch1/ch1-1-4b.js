/**
 * Ch1-1-4b: Moment About a Point (Mô men lực đối với 1 điểm)
 * M = F * d where d is the perpendicular distance from point O to the line of action of F.
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
      ox: 150,
      oy: 200,
      fx: 280,
      fy: 160,
      F_mag: 150,
      F_angle: -30
    };

    // 4. SVG Primitives
    // Support beam
    const beam = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    beam.setAttribute('x1', '60');
    beam.setAttribute('y1', state.oy + 80);
    beam.setAttribute('x2', '700');
    beam.setAttribute('y2', state.oy + 80);
    beam.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    beam.setAttribute('stroke-width', '4');
    svg.appendChild(beam);

    // Pivot Point O
    const pivotO = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivotO.setAttribute('cx', state.ox);
    pivotO.setAttribute('cy', state.oy);
    pivotO.setAttribute('r', '8');
    pivotO.setAttribute('fill', '#fff');
    pivotO.setAttribute('stroke', '#c9963a');
    pivotO.setAttribute('stroke-width', '2');
    svg.appendChild(pivotO);

    const labelO = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelO.setAttribute('x', state.ox + 12);
    labelO.setAttribute('y', state.oy + 8);
    labelO.setAttribute('fill', '#c9963a');
    labelO.setAttribute('font-weight', 'bold');
    labelO.textContent = 'O';
    svg.appendChild(labelO);

    // Force Line of Action (Dashed)
    const lineOfAction = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineOfAction.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    lineOfAction.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(lineOfAction);

    // Perpendicular arm d (Dashed)
    const armD = SimV2Primitives.createArrow(svg, { color: '#c9963a', strokeWidth: 1.5, dashed: true });

    // Force F
    const arrowF = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });

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
      const rad = state.F_angle * Math.PI / 180;
      const fx = state.F_mag * Math.cos(rad);
      const fy = state.F_mag * Math.sin(rad);

      // Force arrow
      arrowF.update(state.fx, state.fy, state.fx + fx, state.fy + fy);
      
      // Line of action
      const tMin = -2, tMax = 3;
      lineOfAction.setAttribute('x1', state.fx + fx * tMin);
      lineOfAction.setAttribute('y1', state.fy + fy * tMin);
      lineOfAction.setAttribute('x2', state.fx + fx * tMax);
      lineOfAction.setAttribute('y2', state.fy + fy * tMax);

      // Moment arm d
      // Projection of (O - P) onto force direction vector v
      const dx = state.ox - state.fx;
      const dy = state.oy - state.fy;
      const f_len = Math.hypot(fx, fy);
      const ux = fx / f_len;
      const uy = fy / f_len;
      
      const dot = dx * ux + dy * uy;
      const px = state.fx + ux * dot;
      const py = state.fy + uy * dot;
      
      armD.update(state.ox, state.oy, px, py);
      
      const d = Math.hypot(state.ox - px, state.oy - py);
      const M = (state.F_mag * d / 100); // Scale for N*m

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">F = ${state.F_mag.toFixed(1)} N</div>
        <div style="color: #c9963a">d = ${d.toFixed(1)} px</div>
        <div style="color: #fd7e14; margin-top: 5px; font-weight: bold;">M_O = F \u00D7 d = ${M.toFixed(2)} N\u00B7m</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force Magnitude (F)', 50, 250, 1, (v) => {
      state.F_mag = v;
      updateVisuals();
    }, state.F_mag);

    ui.addSlider('Force Angle', -180, 180, 1, (v) => {
      state.F_angle = v;
      updateVisuals();
    }, state.F_angle);

    ui.addSlider('Position X (F)', 100, 600, 1, (v) => {
      state.fx = v;
      updateVisuals();
    }, state.fx);

    ui.addSlider('Position Y (F)', 50, 350, 1, (v) => {
      state.fy = v;
      updateVisuals();
    }, state.fy);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowF, armD]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-1-4b', {
      chapter: 1,
      type: 'statics',
      title: 'Moment About a Point',
      hint: 'Adjust force F and position to see the moment arm d and calculated moment.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-1-4b'] = init;
})();
