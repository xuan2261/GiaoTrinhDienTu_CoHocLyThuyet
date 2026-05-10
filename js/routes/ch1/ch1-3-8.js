/**
 * Ch1-3-8: FBD Multiple Bodies
 * Shows the interaction between two connected bodies.
 * External forces (P) and internal reaction forces (T) are shown on each body's FBD.
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
      ox1: 200, oy1: 220,
      ox2: 450, oy2: 220,
      bw: 150, bh: 80,
      P_mag: 120,
      T_mag: 100
    };

    // 4. SVG Primitives
    // Bodies
    const body1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    body1.setAttribute('fill', 'rgba(52, 73, 94, 0.5)');
    body1.setAttribute('stroke', '#c9963a');
    body1.setAttribute('stroke-width', '2');
    svg.appendChild(body1);

    const body2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    body2.setAttribute('fill', 'rgba(52, 73, 94, 0.5)');
    body2.setAttribute('stroke', '#c9963a');
    body2.setAttribute('stroke-width', '2');
    svg.appendChild(body2);

    // Labels
    const label1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label1.setAttribute('fill', '#fff');
    label1.setAttribute('text-anchor', 'middle');
    label1.textContent = 'BODY 1';
    svg.appendChild(label1);

    const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label2.setAttribute('fill', '#fff');
    label2.setAttribute('text-anchor', 'middle');
    label2.textContent = 'BODY 2';
    svg.appendChild(label2);

    // Connection line (Visual only)
    const connection = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connection.setAttribute('stroke', '#9b59b6');
    connection.setAttribute('stroke-width', '4');
    svg.appendChild(connection);

    // Force Arrows
    const arrowP = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 2.5 });
    const arrowT1 = SimV2Primitives.createArrow(svg, { color: '#9b59b6', strokeWidth: 2.5 });
    const arrowT2 = SimV2Primitives.createArrow(svg, { color: '#9b59b6', strokeWidth: 2.5 });

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
      // Body 1
      body1.setAttribute('x', state.ox1 - state.bw / 2);
      body1.setAttribute('y', state.oy1 - state.bh / 2);
      body1.setAttribute('width', state.bw);
      body1.setAttribute('height', state.bh);
      label1.setAttribute('x', state.ox1);
      label1.setAttribute('y', state.oy1 + 5);

      // Body 2
      body2.setAttribute('x', state.ox2 - state.bw / 2);
      body2.setAttribute('y', state.oy2 - state.bh / 2);
      body2.setAttribute('width', state.bw);
      body2.setAttribute('height', state.bh);
      label2.setAttribute('x', state.ox2);
      label2.setAttribute('y', state.oy2 + 5);

      // Connection
      connection.setAttribute('x1', state.ox1 + state.bw / 2);
      connection.setAttribute('y1', state.oy1);
      connection.setAttribute('x2', state.ox2 - state.bw / 2);
      connection.setAttribute('y2', state.oy2);

      // External Force P on Body 2
      arrowP.update(state.ox2 + state.bw / 2, state.oy2, state.ox2 + state.bw / 2 + state.P_mag, state.oy2);
      
      // Internal Force T (Action/Reaction)
      arrowT1.update(state.ox1 + state.bw / 2, state.oy1, state.ox1 + state.bw / 2 + state.T_mag, state.oy1);
      arrowT2.update(state.ox2 - state.bw / 2, state.oy2, state.ox2 - state.bw / 2 - state.T_mag, state.oy2);

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">External P = ${state.P_mag.toFixed(0)} N</div>
        <div style="color: #9b59b6">Internal T = ${state.T_mag.toFixed(0)} N</div>
        <div style="color: #8ea0b8; font-size: 11px; margin-top: 10px;">
          Lực nội tại T là lực căng/nén xuất hiện tại liên kết giữa hai vật.
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('External Force P', 0, 200, 1, (v) => {
      state.P_mag = v;
      updateVisuals();
    }, state.P_mag);

    ui.addSlider('Tension T', 0, 200, 1, (v) => {
      state.T_mag = v;
      updateVisuals();
    }, state.T_mag);

    ui.addSlider('Spacing', 100, 300, 1, (v) => {
      state.ox2 = state.ox1 + state.bw + v;
      updateVisuals();
    }, state.ox2 - state.ox1 - state.bw);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowP, arrowT1, arrowT2]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-3-8', {
      chapter: 1,
      type: 'statics',
      title: 'FBD Multiple Bodies',
      hint: 'Quan sát các lực tác động lên từng vật thể trong hệ thống.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-3-8'] = init;
})();
