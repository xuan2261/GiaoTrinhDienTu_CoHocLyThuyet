/**
 * Ch1-1-5b: Varignon Theorem (Định lý Varignon)
 * The moment of a force about any point is equal to the sum of the moments of the components of the force about the same point.
 * In this simulation, we show that for multiple forces concurrent at point A, the sum of their moments about O equals the moment of their resultant R about O.
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
      ax: 200,
      ay: 150,
      F1_mag: 120, F1_angle: -30,
      F2_mag: 100, F2_angle: 45,
      F3_mag: 80,  F3_angle: 120
    };

    // 4. SVG Primitives
    // Point O (Moment Center)
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

    // Point A (Application Point)
    const pointA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointA.setAttribute('cx', state.ax);
    pointA.setAttribute('cy', state.ay);
    pointA.setAttribute('r', '6');
    pointA.setAttribute('fill', '#8ea0b8');
    svg.appendChild(pointA);

    const labelA = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelA.setAttribute('x', state.ax - 15);
    labelA.setAttribute('y', state.ay - 10);
    labelA.setAttribute('fill', '#8ea0b8');
    labelA.textContent = 'A';
    svg.appendChild(labelA);

    // Force Arrows
    const arrowF1 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 2 });
    const arrowF2 = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 2 });
    const arrowF3 = SimV2Primitives.createArrow(svg, { color: '#4444ff', strokeWidth: 2 });
    const arrowR = SimV2Primitives.createArrow(svg, { color: '#fd7e14', strokeWidth: 3 });

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
      const r1 = state.F1_angle * Math.PI / 180;
      const f1x = state.F1_mag * Math.cos(r1);
      const f1y = state.F1_mag * Math.sin(r1);

      const r2 = state.F2_angle * Math.PI / 180;
      const f2x = state.F2_mag * Math.cos(r2);
      const f2y = state.F2_mag * Math.sin(r2);

      const r3 = state.F3_angle * Math.PI / 180;
      const f3x = state.F3_mag * Math.cos(r3);
      const f3y = state.F3_mag * Math.sin(r3);

      const Rx = f1x + f2x + f3x;
      const Ry = f1y + f2y + f3y;

      arrowF1.update(state.ax, state.ay, state.ax + f1x, state.ay + f1y);
      arrowF2.update(state.ax, state.ay, state.ax + f2x, state.ay + f2y);
      arrowF3.update(state.ax, state.ay, state.ax + f3x, state.ay + f3y);
      arrowR.update(state.ax, state.ay, state.ax + Rx, state.ay + Ry);

      // Moment calculations
      // M = r x F = (rx * fy - ry * fx)
      const rx = state.ax - state.ox;
      const ry = state.ay - state.oy;

      const M1 = (rx * f1y - ry * f1x) / 100;
      const M2 = (rx * f2y - ry * f2x) / 100;
      const M3 = (rx * f3y - ry * f3x) / 100;
      const sumM = M1 + M2 + M3;
      const MR = (rx * Ry - ry * Rx) / 100;

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">M1 = ${M1.toFixed(2)} N\u00B7m</div>
        <div style="color: #44ff44">M2 = ${M2.toFixed(2)} N\u00B7m</div>
        <div style="color: #4444ff">M3 = ${M3.toFixed(2)} N\u00B7m</div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 5px 0;">
        <div style="color: #8ea0b8">\u03A3M = ${sumM.toFixed(2)} N\u00B7m</div>
        <div style="color: #fd7e14; font-weight: bold;">M_R = ${MR.toFixed(2)} N\u00B7m</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force F1 Angle', -180, 180, 1, (v) => {
      state.F1_angle = v;
      updateVisuals();
    }, state.F1_angle);

    ui.addSlider('Force F2 Angle', -180, 180, 1, (v) => {
      state.F2_angle = v;
      updateVisuals();
    }, state.F2_angle);

    ui.addSlider('Force F3 Angle', -180, 180, 1, (v) => {
      state.F3_angle = v;
      updateVisuals();
    }, state.F3_angle);

    ui.addSlider('Application Point X', 100, 600, 1, (v) => {
      state.ax = v;
      pointA.setAttribute('cx', v);
      labelA.setAttribute('x', v - 15);
      updateVisuals();
    }, state.ax);

    ui.addSlider('Application Point Y', 50, 350, 1, (v) => {
      state.ay = v;
      pointA.setAttribute('cy', v);
      labelA.setAttribute('y', v - 10);
      updateVisuals();
    }, state.ay);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowF1, arrowF2, arrowF3, arrowR]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-1-5b', {
      chapter: 1,
      type: 'statics',
      title: 'Varignon Theorem',
      hint: 'The moment of a force about any point is equal to the sum of the moments of the components of the force about the same point.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-1-5b'] = init;
})();
