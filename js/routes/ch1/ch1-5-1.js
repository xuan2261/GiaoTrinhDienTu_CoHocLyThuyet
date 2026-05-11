/**
 * Ch1-5-1: Dry Friction
 * Comparing the static friction force Ff against the maximum possible friction force Ff_max on an inclined plane.
 */
(function() {
  'use strict';

  function init(host) {
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

    const engine = new SimulationEngine({ viewHeight: 440 });
    const ui = new SimUI(uiPanel);
    
    let state = {
      theta: 20,
      P: 150, // Mass/Weight magnitude
      mu: 0.3
    };

    const ox = 100;
    const oy = 320;
    const planeLength = 500;

    // Inclined Plane
    const plane = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    plane.setAttribute('stroke', 'rgba(232, 236, 241, 0.4)');
    plane.setAttribute('stroke-width', '4');
    svg.appendChild(plane);

    // Block Group
    const blockGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(blockGroup);

    const block = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    block.setAttribute('width', '80');
    block.setAttribute('height', '40');
    block.setAttribute('x', '-40');
    block.setAttribute('y', '-40');
    block.setAttribute('fill', 'rgba(52, 73, 94, 0.8)');
    block.setAttribute('stroke', '#c9963a');
    block.setAttribute('stroke-width', '2');
    blockGroup.appendChild(block);

    // Arrows
    const arrowW = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 2.5 }); // Weight
    const arrowN = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2.5 }); // Normal
    const arrowFf = SimV2Primitives.createArrow(svg, { color: '#f39c12', strokeWidth: 2.5 }); // Friction

    const readout = document.createElement('div');
    readout.setAttribute('class', 'sim-readout-v2');
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      const rad = state.theta * Math.PI / 180;
      const ex = ox + planeLength * Math.cos(rad);
      const ey = oy - planeLength * Math.sin(rad);

      plane.setAttribute('x1', ox); plane.setAttribute('y1', oy);
      plane.setAttribute('x2', ex); plane.setAttribute('y2', ey);

      const bx = ox + planeLength * 0.4 * Math.cos(rad);
      const by = oy - planeLength * 0.4 * Math.sin(rad);
      blockGroup.setAttribute('transform', `translate(${bx}, ${by}) rotate(${-state.theta})`);

      // Physics
      const Weight = state.P;
      const N = Weight * Math.cos(rad);
      const Ff_req = Weight * Math.sin(rad); // Friction required for equilibrium
      const Ff_max = state.mu * N;
      
      const isSlipping = Ff_req > Ff_max + 0.1;
      const Ff_actual = isSlipping ? Ff_max : Ff_req;

      // Arrows
      arrowW.update(bx, by, bx, by + Weight * 0.4);
      
      const normalAngle = -rad + Math.PI/2;
      arrowN.update(bx, by, bx - 60 * Math.cos(normalAngle), by - 60 * Math.sin(normalAngle));
      
      arrowFf.update(bx, by, bx + Ff_actual * 0.4 * Math.cos(rad), by - Ff_actual * 0.4 * Math.sin(rad));

      readout.innerHTML = `
        <div style="color: #c9963a; font-weight: bold; margin-bottom: 10px;">Status: 
          <span style="color: ${isSlipping ? '#e74c3c' : '#2ecc71'}">${isSlipping ? 'SLIPPING' : 'STATIC'}</span>
        </div>
        
        <div style="color: #e74c3c;">Weight W = ${Weight.toFixed(1)} N</div>
        <div style="color: #3498db;">Normal N = ${N.toFixed(1)} N</div>
        <div style="color: #f39c12;">Friction Ff = ${Ff_actual.toFixed(1)} N</div>
        
        <div style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px; font-size: 0.9em; color: #8ea0b8;">
          Max Static Friction:<br>
          Ff_max = \u03BCs \u00D7 N = ${Ff_max.toFixed(1)} N
        </div>
      `;
    }

    ui.addSlider('Inclination (\u03B8)', 0, 60, 1, (v) => { state.theta = v; updateVisuals(); }, state.theta);
    ui.addSlider('Friction Coeff (\u03BC)', 0.1, 0.8, 0.05, (v) => { state.mu = v; updateVisuals(); }, state.mu);
    ui.addSlider('Block Weight (P)', 50, 250, 1, (v) => { state.P = v; updateVisuals(); }, state.P);

    updateVisuals();
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowW, arrowN, arrowFf]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-5-1', {
      chapter: 1,
      type: 'statics',
      title: 'Dry Friction',
      hint: 'Adjust inclination and friction coefficient to see when the block starts to slip.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-5-1'] = init;
})();
