/**
 * Ch1-1-6b: Equivalent Couples (Các tính chất của ngẫu lực)
 * Two couples are equivalent if they produce the same moment.
 * This simulation allows comparing two couples with different forces and distances.
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
      ox1: 380, oy1: 120,
      f1_mag: 100, d1: 100,
      angle1: 0,
      
      ox2: 380, oy2: 320,
      f2_mag: 50, d2: 200,
      angle2: 0
    };

    // 4. SVG Primitives
    const arrowA1 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 2 });
    const arrowA2 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 2 });
    const arrowB1 = SimV2Primitives.createArrow(svg, { color: '#4444ff', strokeWidth: 2 });
    const arrowB2 = SimV2Primitives.createArrow(svg, { color: '#4444ff', strokeWidth: 2 });

    const lineD1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineD1.setAttribute('stroke', 'rgba(255, 68, 68, 0.3)');
    lineD1.setAttribute('stroke-dasharray', '3,3');
    svg.appendChild(lineD1);

    const lineD2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineD2.setAttribute('stroke', 'rgba(68, 68, 255, 0.3)');
    lineD2.setAttribute('stroke-dasharray', '3,3');
    svg.appendChild(lineD2);

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
      // Couple 1
      const rad1 = state.angle1 * Math.PI / 180;
      const x1a = state.ox1 + Math.sin(rad1) * (state.d1 / 2);
      const y1a = state.oy1 - Math.cos(rad1) * (state.d1 / 2);
      const x1b = state.ox1 - Math.sin(rad1) * (state.d1 / 2);
      const y1b = state.oy1 + Math.cos(rad1) * (state.d1 / 2);
      
      arrowA1.update(x1a, y1a, x1a + state.f1_mag * Math.cos(rad1), y1a + state.f1_mag * Math.sin(rad1));
      arrowA2.update(x1b, y1b, x1b - state.f1_mag * Math.cos(rad1), y1b - state.f1_mag * Math.sin(rad1));
      lineD1.setAttribute('x1', x1a); lineD1.setAttribute('y1', y1a);
      lineD1.setAttribute('x2', x1b); lineD1.setAttribute('y2', y1b);

      // Couple 2
      const rad2 = state.angle2 * Math.PI / 180;
      const x2a = state.ox2 + Math.sin(rad2) * (state.d2 / 2);
      const y2a = state.oy2 - Math.cos(rad2) * (state.d2 / 2);
      const x2b = state.ox2 - Math.sin(rad2) * (state.d2 / 2);
      const y2b = state.oy2 + Math.cos(rad2) * (state.d2 / 2);

      arrowB1.update(x2a, y2a, x2a + state.f2_mag * Math.cos(rad2), y2a + state.f2_mag * Math.sin(rad2));
      arrowB2.update(x2b, y2b, x2b - state.f2_mag * Math.cos(rad2), y2b - state.f2_mag * Math.sin(rad2));
      lineD2.setAttribute('x1', x2a); lineD2.setAttribute('y1', y2a);
      lineD2.setAttribute('x2', x2b); lineD2.setAttribute('y2', y2b);

      const M1 = state.f1_mag * state.d1 / 100;
      const M2 = state.f2_mag * state.d2 / 100;

      const equivalent = Math.abs(M1 - M2) < 0.1;

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">Couple 1: M1 = ${M1.toFixed(1)} N\u00B7m</div>
        <div style="color: #4444ff">Couple 2: M2 = ${M2.toFixed(1)} N\u00B7m</div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
        <div style="text-align: center; font-weight: bold; color: ${equivalent ? '#44ff44' : '#ff4444'}">
          ${equivalent ? 'EQUIVALENT' : 'NOT EQUIVALENT'}
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('C1 Force', 20, 200, 1, (v) => { state.f1_mag = v; updateVisuals(); }, state.f1_mag);
    ui.addSlider('C1 Dist', 20, 200, 1, (v) => { state.d1 = v; updateVisuals(); }, state.d1);
    ui.addSlider('C2 Force', 20, 200, 1, (v) => { state.f2_mag = v; updateVisuals(); }, state.f2_mag);
    ui.addSlider('C2 Dist', 20, 200, 1, (v) => { state.d2 = v; updateVisuals(); }, state.d2);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowA1, arrowA2, arrowB1, arrowB2]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-1-6b', {
      chapter: 1,
      type: 'statics',
      title: 'Equivalent Couples',
      hint: 'Adjust forces and distances. When the product F \u00D7 d is the same, the couples are equivalent.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-1-6b'] = init;
})();
