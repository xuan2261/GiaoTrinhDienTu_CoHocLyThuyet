/**
 * Ch1-1-3: Force Vector Anatomy
 * Anatomy of a force vector: magnitude, direction, and components.
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
      ox: 200, // Tail X
      oy: 300, // Tail Y
      ex: 480, // Tip X
      ey: 140  // Tip Y
    };

    // 4. SVG Primitives
    // Tail point
    const tailPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    tailPoint.setAttribute('r', '5');
    tailPoint.setAttribute('fill', '#fff');
    svg.appendChild(tailPoint);

    // Tip point
    const tipPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    tipPoint.setAttribute('r', '5');
    tipPoint.setAttribute('fill', '#ff4444');
    svg.appendChild(tipPoint);

    // Arrows
    const arrowF = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });
    const arrowFx = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 2 });
    const arrowFy = SimV2Primitives.createArrow(svg, { color: '#4444ff', strokeWidth: 2 });

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
      const dx = state.ex - state.ox;
      const dy = state.oy - state.ey; // Y decreases upwards in display
      
      const Fmag = Math.sqrt(dx*dx + dy*dy);
      const alpha = Math.atan2(dy, dx) * 180 / Math.PI;

      // Points
      tailPoint.setAttribute('cx', state.ox);
      tailPoint.setAttribute('cy', state.oy);
      tipPoint.setAttribute('cx', state.ex);
      tipPoint.setAttribute('cy', state.ey);

      // Force F
      arrowF.update(state.ox, state.oy, state.ex, state.ey);
      
      // Components
      arrowFx.update(state.ox, state.oy, state.ex, state.oy);
      arrowFy.update(state.ex, state.oy, state.ex, state.ey);

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">|F| = ${Fmag.toFixed(1)} N</div>
        <div style="color: #44ff44">Fx = ${dx.toFixed(1)} N</div>
        <div style="color: #4444ff">Fy = ${dy.toFixed(1)} N</div>
        <div style="color: #8ea0b8; margin-top: 5px;">\u03B1 = ${alpha.toFixed(1)}\u00B0</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Tail X', 50, 710, 1, (v) => {
      state.ox = v;
      updateVisuals();
    }, state.ox);

    ui.addSlider('Tail Y', 50, 390, 1, (v) => {
      state.oy = v;
      updateVisuals();
    }, state.oy);

    ui.addSlider('Tip X', 50, 710, 1, (v) => {
      state.ex = v;
      updateVisuals();
    }, state.ex);

    ui.addSlider('Tip Y', 50, 390, 1, (v) => {
      state.ey = v;
      updateVisuals();
    }, state.ey);

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
    window.RouteRegistry.register('ch1-1-3', {
      chapter: 1,
      type: 'statics',
      title: 'Force Vector Anatomy',
      hint: 'Define a force vector by moving its tail and tip. Explore its components and magnitude.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-1-3'] = init;
})();
