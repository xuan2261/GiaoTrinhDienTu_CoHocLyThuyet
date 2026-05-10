/**
 * Ch1-5-2: Friction Angle
 * Relationship between friction coefficient mu and the friction angle phi.
 * phi = arctan(mu)
 */
(function() {
  'use strict';

  function init(host) {
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

    const engine = new SimulationEngine({ viewHeight: 440 });
    const ui = new SimUI(uiPanel);
    
    let state = {
      mu: 0.3,
      ox: 380,
      oy: 300
    };

    const cone = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    cone.setAttribute('fill', 'rgba(201, 150, 58, 0.1)');
    cone.setAttribute('stroke', '#c9963a');
    cone.setAttribute('stroke-width', '2');
    svg.appendChild(cone);

    const axisN = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2 });
    const axisR = SimV2Primitives.createArrow(svg, { color: '#f39c12', strokeWidth: 2.5 });

    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      const phi = Math.atan(state.mu);
      const phiDeg = phi * 180 / Math.PI;
      const radius = 150;

      const x1 = state.ox + radius * Math.sin(phi);
      const y1 = state.oy - radius * Math.cos(phi);
      const x2 = state.ox - radius * Math.sin(phi);
      const y2 = state.oy - radius * Math.cos(phi);

      cone.setAttribute('d', `M ${state.ox} ${state.oy} L ${x1} ${y1} L ${x2} ${y2} Z`);
      
      axisN.update(state.ox, state.oy, state.ox, state.oy - radius);
      axisR.update(state.ox, state.oy, x1, y1);

      readout.innerHTML = `
        <div style="color: #f39c12; font-weight: bold; margin-bottom: 10px;">Friction Angle:</div>
        <div style="color: #3498db;">\u03BCs = ${state.mu.toFixed(2)}</div>
        <div style="color: #c9963a; font-size: 1.2em; margin-top: 10px;">\u03A6 = ${phiDeg.toFixed(1)}\u00B0</div>
        
        <div style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px; font-size: 0.9em; color: #8ea0b8;">
          Relationship:<br>
          tan(\u03A6) = \u03BCs<br>
          \u21D2 \u03A6 = arctan(\u03BCs)
        </div>
      `;
    }

    ui.addSlider('Friction Coeff (\u03BC)', 0.05, 1.0, 0.05, (v) => { state.mu = v; updateVisuals(); }, state.mu);

    updateVisuals();
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([axisN, axisR]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-5-2', {
      chapter: 1,
      type: 'statics',
      title: 'Friction Angle',
      hint: 'Change friction coefficient to see how the friction angle cone changes.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-5-2'] = init;
})();
