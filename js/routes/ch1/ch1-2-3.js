/**
 * Ch1-2-3: Parallelogram Law (Hình bình hành lực)
 * Demonstrate vector addition of forces using the parallelogram law.
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
      f1_mag: 120, f1_angle: 30,
      f2_mag: 120, f2_angle: 150
    };

    // 4. SVG Primitives
    // Origin O
    const pivotO = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivotO.setAttribute('cx', state.ox);
    pivotO.setAttribute('cy', state.oy);
    pivotO.setAttribute('r', '6');
    pivotO.setAttribute('fill', '#fff');
    svg.appendChild(pivotO);

    // Force Arrows
    const arrowF1 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });
    const arrowF2 = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 3 });
    const arrowR = SimV2Primitives.createArrow(svg, { color: '#f1c40f', strokeWidth: 4 });

    // Parallelogram dashed lines
    const dash1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    dash1.setAttribute('stroke', 'rgba(232, 236, 241, 0.3)');
    dash1.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(dash1);

    const dash2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    dash2.setAttribute('stroke', 'rgba(232, 236, 241, 0.3)');
    dash2.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(dash2);

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
      const r1 = state.f1_angle * Math.PI / 180;
      const f1x = state.f1_mag * Math.cos(r1);
      const f1y = state.f1_mag * Math.sin(r1);

      const r2 = state.f2_angle * Math.PI / 180;
      const f2x = state.f2_mag * Math.cos(r2);
      const f2y = state.f2_mag * Math.sin(r2);

      const Rx = f1x + f2x;
      const Ry = f1y + f2y;
      const R_mag = Math.sqrt(Rx*Rx + Ry*Ry);

      // SVG Y is down, so we subtract Y components
      arrowF1.update(state.ox, state.oy, state.ox + f1x, state.oy - f1y);
      arrowF2.update(state.ox, state.oy, state.ox + f2x, state.oy - f2y);
      arrowR.update(state.ox, state.oy, state.ox + Rx, state.oy - Ry);

      // Dashed lines
      dash1.setAttribute('x1', state.ox + f1x);
      dash1.setAttribute('y1', state.oy - f1y);
      dash1.setAttribute('x2', state.ox + Rx);
      dash1.setAttribute('y2', state.oy - Ry);

      dash2.setAttribute('x1', state.ox + f2x);
      dash2.setAttribute('y1', state.oy - f2y);
      dash2.setAttribute('x2', state.ox + Rx);
      dash2.setAttribute('y2', state.oy - Ry);

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">F1 = ${state.f1_mag.toFixed(1)} N at ${state.f1_angle}\u00B0</div>
        <div style="color: #44ff44">F2 = ${state.f2_mag.toFixed(1)} N at ${state.f2_angle}\u00B0</div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 5px 0;">
        <div style="color: #f1c40f; font-weight: bold;">Resultant R = ${R_mag.toFixed(1)} N</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force 1 Magnitude', 50, 200, 1, (v) => {
      state.f1_mag = v;
      updateVisuals();
    }, state.f1_mag);

    ui.addSlider('Force 1 Angle', 0, 360, 1, (v) => {
      state.f1_angle = v;
      updateVisuals();
    }, state.f1_angle);

    ui.addSlider('Force 2 Magnitude', 50, 200, 1, (v) => {
      state.f2_mag = v;
      updateVisuals();
    }, state.f2_mag);

    ui.addSlider('Force 2 Angle', 0, 360, 1, (v) => {
      state.f2_angle = v;
      updateVisuals();
    }, state.f2_angle);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowF1, arrowF2, arrowR]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-2-3', {
      chapter: 1,
      type: 'statics',
      title: 'Parallelogram Law',
      hint: 'The sum of two forces can be found using the diagonal of the parallelogram formed by them.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-2-3'] = init;
})();
