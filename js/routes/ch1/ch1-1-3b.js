/**
 * Ch1-1-3b: Cartesian Force Components
 * Decomposition of a force vector into Fx and Fy.
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
      F: 150,
      alpha: 35
    };

    // 4. SVG Primitives
    // Coordinate axes
    const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisX.setAttribute('x1', '50');
    axisX.setAttribute('y1', state.oy);
    axisX.setAttribute('x2', '710');
    axisX.setAttribute('y2', state.oy);
    axisX.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    axisX.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(axisX);

    const axisY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisY.setAttribute('x1', state.ox);
    axisY.setAttribute('y1', '20');
    axisY.setAttribute('x2', state.ox);
    axisY.setAttribute('y2', '420');
    axisY.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    axisY.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(axisY);

    // Origin point
    const originPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    originPoint.setAttribute('cx', state.ox);
    originPoint.setAttribute('cy', state.oy);
    originPoint.setAttribute('r', '4');
    originPoint.setAttribute('fill', '#fff');
    svg.appendChild(originPoint);

    // Arrows
    const arrowF = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });
    const arrowFx = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 2 });
    const arrowFy = SimV2Primitives.createArrow(svg, { color: '#4444ff', strokeWidth: 2 });

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
      const rad = state.alpha * Math.PI / 180;
      const fx = state.F * Math.cos(rad);
      const fy = state.F * Math.sin(rad);

      // Force F
      arrowF.update(state.ox, state.oy, state.ox + fx, state.oy - fy);
      
      // Component Fx
      arrowFx.update(state.ox, state.oy, state.ox + fx, state.oy);
      
      // Component Fy
      arrowFy.update(state.ox, state.oy, state.ox, state.oy - fy);

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">F  = ${state.F.toFixed(1)} N</div>
        <div style="color: #44ff44">Fx = F.cos(\u03B1) = ${fx.toFixed(1)} N</div>
        <div style="color: #4444ff">Fy = F.sin(\u03B1) = ${fy.toFixed(1)} N</div>
        <div style="color: #8ea0b8; margin-top: 5px;">\u03B1  = ${state.alpha}\u00B0</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force Magnitude (F)', 50, 200, 1, (v) => {
      state.F = v;
      updateVisuals();
    }, state.F);

    ui.addSlider('Angle (\u03B1)', 0, 360, 1, (v) => {
      state.alpha = v;
      updateVisuals();
    }, state.alpha);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowF, arrowFx, arrowFy]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-1-3b', {
      chapter: 1,
      type: 'statics',
      title: 'Cartesian Force Components',
      hint: 'Adjust Force magnitude and angle to see component decomposition.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-1-3b'] = init;
})();
