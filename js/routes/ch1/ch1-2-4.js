/**
 * Ch1-2-4: Action and Reaction (Tác dụng và phản tác dụng)
 * Newton's Third Law: For every action, there is an equal and opposite reaction.
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
      separation: 80,
      F_mag: 120
    };

    // 4. SVG Primitives
    // Two bodies
    const body1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    body1.setAttribute('width', '100');
    body1.setAttribute('height', '100');
    body1.setAttribute('fill', 'rgba(52, 73, 94, 0.6)');
    body1.setAttribute('stroke', '#44ff44');
    body1.setAttribute('stroke-width', '2');
    svg.appendChild(body1);

    const body2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    body2.setAttribute('width', '100');
    body2.setAttribute('height', '100');
    body2.setAttribute('fill', 'rgba(52, 73, 94, 0.6)');
    body2.setAttribute('stroke', '#ff4444');
    body2.setAttribute('stroke-width', '2');
    svg.appendChild(body2);

    // Force Arrows
    const arrowAction = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });
    const arrowReaction = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 3 });

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
      const halfSep = state.separation / 2;
      
      const b1x = state.ox - 50 - halfSep;
      const b1y = state.oy - 50;
      body1.setAttribute('x', b1x);
      body1.setAttribute('y', b1y);

      const b2x = state.ox + halfSep + 50; // Reference point for body 2 is its left edge? No, x,y is top-left
      body2.setAttribute('x', state.ox + halfSep);
      body2.setAttribute('y', b1y);

      // Forces at the interface
      const contactX1 = state.ox - halfSep;
      const contactX2 = state.ox + halfSep;

      // Force from body 1 on body 2 (Action)
      arrowAction.update(contactX1, state.oy, contactX1 + state.F_mag, state.oy);
      
      // Force from body 2 on body 1 (Reaction)
      arrowReaction.update(contactX2, state.oy, contactX2 - state.F_mag, state.oy);

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444; font-weight: bold;">Action (Force 1\u21922)</div>
        <div>Magnitude = ${state.F_mag.toFixed(0)} N</div>
        <div style="color: #44ff44; font-weight: bold; margin-top: 10px;">Reaction (Force 2\u21921)</div>
        <div>Magnitude = ${state.F_mag.toFixed(0)} N</div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
        <div style="font-style: italic; font-size: 0.9em; color: #8ea0b8;">
          Lực tác dụng và phản tác dụng luôn cùng phương, ngược chiều và cùng độ lớn.
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force Magnitude', 50, 200, 1, (v) => {
      state.F_mag = v;
      updateVisuals();
    }, state.F_mag);

    ui.addSlider('Separation', 0, 200, 1, (v) => {
      state.separation = v;
      updateVisuals();
    }, state.separation);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowAction, arrowReaction]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-2-4', {
      chapter: 1,
      type: 'statics',
      title: 'Action and Reaction',
      hint: 'Forces always occur in pairs. Observe how the reaction is always equal and opposite to the action.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-2-4'] = init;
})();
