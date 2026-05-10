/**
 * Ch1-5-3: Friction Rollback
 * Impending motion analysis based on static and kinetic friction angles.
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
      theta: 15,
      mu_s: 0.35,
      mu_k: 0.25
    };

    const ox = 100;
    const oy = 320;
    const planeLength = 500;

    // Plane and Block
    const plane = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    plane.setAttribute('stroke', 'rgba(232, 236, 241, 0.4)');
    plane.setAttribute('stroke-width', '4');
    svg.appendChild(plane);

    const blockGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(blockGroup);

    const block = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    block.setAttribute('width', '80');
    block.setAttribute('height', '40');
    block.setAttribute('x', '-40');
    block.setAttribute('y', '-40');
    block.setAttribute('fill', 'rgba(52, 73, 94, 0.8)');
    block.setAttribute('stroke-width', '2');
    blockGroup.appendChild(block);

    // Friction angle arcs
    const arcStatic = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arcStatic.setAttribute('fill', 'none');
    arcStatic.setAttribute('stroke', '#2ecc71');
    arcStatic.setAttribute('stroke-width', '1');
    arcStatic.setAttribute('stroke-dasharray', '2,2');
    svg.appendChild(arcStatic);

    const arrowImpending = SimV2Primitives.createArrow(svg, { color: '#f39c12', strokeWidth: 3 });

    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      const rad = state.theta * Math.PI / 180;
      const phi_s = Math.atan(state.mu_s);
      const phi_s_deg = phi_s * 180 / Math.PI;

      plane.setAttribute('x1', ox); plane.setAttribute('y1', oy);
      plane.setAttribute('x2', ox + planeLength * Math.cos(rad)); 
      plane.setAttribute('y2', oy - planeLength * Math.sin(rad));

      const bx = ox + 200 * Math.cos(rad);
      const by = oy - 200 * Math.sin(rad);
      blockGroup.setAttribute('transform', `translate(${bx}, ${by}) rotate(${-state.theta})`);

      const isStable = state.theta <= phi_s_deg;
      block.setAttribute('stroke', isStable ? '#2ecc71' : '#e74c3c');

      // Impending motion arrow (points down if unstable)
      if (!isStable) {
        arrowImpending.update(bx, by - 30, bx + 50 * Math.cos(rad), by - 50 * Math.sin(rad) + 30);
        arrowImpending.line.style.display = 'block';
      } else {
        arrowImpending.line.style.display = 'none';
      }

      // Draw friction angle arc
      const arcR = 60;
      const x1 = ox + arcR;
      const y1 = oy;
      const x2 = ox + arcR * Math.cos(phi_s);
      const y2 = oy - arcR * Math.sin(phi_s);
      arcStatic.setAttribute('d', `M ${x1} ${y1} A ${arcR} ${arcR} 0 0 0 ${x2} ${y2}`);

      readout.innerHTML = `
        <div style="color: #c9963a; font-weight: bold; margin-bottom: 10px;">Stability Analysis:</div>
        <div style="color: #fff;">Plane \u03B8 = ${state.theta}\u00B0</div>
        <div style="color: #2ecc71;">Friction \u03A6s = ${phi_s_deg.toFixed(1)}\u00B0</div>
        
        <div style="margin-top: 15px; font-weight: bold; font-size: 1.1em; color: ${isStable ? '#2ecc71' : '#e74c3c'}">
          ${isStable ? 'STABLE (No Motion)' : 'UNSTABLE (Sliding Down)'}
        </div>
        
        <div style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px; font-size: 0.85em; color: #8ea0b8;">
          Impending motion occurs when the angle of inclination exceeds the angle of static friction (\u03B8 > \u03A6s).
        </div>
      `;
    }

    ui.addSlider('Inclination (\u03B8)', 0, 45, 1, (v) => { state.theta = v; updateVisuals(); }, state.theta);
    ui.addSlider('Static \u03BCs', 0.1, 0.8, 0.01, (v) => { state.mu_s = v; updateVisuals(); }, state.mu_s);

    updateVisuals();
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowImpending]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-5-3', {
      chapter: 1,
      type: 'statics',
      title: 'Friction Rollback',
      hint: 'Compare the inclination angle with the static friction angle to predict impending motion.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-5-3'] = init;
})();
