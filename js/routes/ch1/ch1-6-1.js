/**
 * Ch1-6-1: Centroid of Composite Areas (Trọng tâm hình phẳng)
 * The centroid of a composite area is found by summing the first moments of its parts.
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
      ox: 300, oy: 350,
      w1: 200, h1: 100,
      w2: 100, h2: 150,
      offset: 50
    };

    // 4. SVG Primitives
    const part1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    part1.setAttribute('fill', 'rgba(52, 73, 94, 0.4)');
    part1.setAttribute('stroke', '#44ff44');
    part1.setAttribute('stroke-width', '2');
    svg.appendChild(part1);

    const part2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    part2.setAttribute('fill', 'rgba(52, 73, 94, 0.4)');
    part2.setAttribute('stroke', '#4444ff');
    part2.setAttribute('stroke-width', '2');
    svg.appendChild(part2);

    // Individual Centroids
    const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c1.setAttribute('r', '4');
    c1.setAttribute('fill', '#44ff44');
    svg.appendChild(c1);

    const c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c2.setAttribute('r', '4');
    c2.setAttribute('fill', '#4444ff');
    svg.appendChild(c2);

    // Composite Centroid
    const centroid = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centroid.setAttribute('r', '8');
    centroid.setAttribute('fill', '#ff4444');
    centroid.setAttribute('stroke', '#fff');
    centroid.setAttribute('stroke-width', '2');
    svg.appendChild(centroid);

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
      // Part 1 (Base)
      const x1 = state.ox;
      const y1 = state.oy - state.h1;
      part1.setAttribute('x', x1);
      part1.setAttribute('y', y1);
      part1.setAttribute('width', state.w1);
      part1.setAttribute('height', state.h1);

      const cx1 = x1 + state.w1 / 2;
      const cy1 = y1 + state.h1 / 2;
      c1.setAttribute('cx', cx1);
      c1.setAttribute('cy', cy1);

      // Part 2 (Stem)
      const x2 = state.ox + state.offset;
      const y2 = y1 - state.h2;
      part2.setAttribute('x', x2);
      part2.setAttribute('y', y2);
      part2.setAttribute('width', state.w2);
      part2.setAttribute('height', state.h2);

      const cx2 = x2 + state.w2 / 2;
      const cy2 = y2 + state.h2 / 2;
      c2.setAttribute('cx', cx2);
      c2.setAttribute('cy', cy2);

      // Areas
      const a1 = state.w1 * state.h1;
      const a2 = state.w2 * state.h2;
      const totalA = a1 + a2;

      // Composite Centroid (X_bar, Y_bar) relative to local origin (ox, oy)
      // For simplicity, let's use SVG coordinates
      const cx_comp = (a1 * cx1 + a2 * cx2) / totalA;
      const cy_comp = (a1 * cy1 + a2 * cy2) / totalA;

      centroid.setAttribute('cx', cx_comp);
      centroid.setAttribute('cy', cy_comp);

      // Readout
      readout.innerHTML = `
        <div style="color: #44ff44">Part 1: A1=${a1}, (${cx1.toFixed(0)}, ${cy1.toFixed(0)})</div>
        <div style="color: #4444ff">Part 2: A2=${a2}, (${cx2.toFixed(0)}, ${cy2.toFixed(0)})</div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 5px 0;">
        <div style="color: #ff4444; font-weight: bold;">Centroid C</div>
        <div>X_bar = ${cx_comp.toFixed(1)}</div>
        <div>Y_bar = ${cy_comp.toFixed(1)}</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Part 1 Width', 50, 300, 1, (v) => { state.w1 = v; updateVisuals(); }, state.w1);
    ui.addSlider('Part 2 Height', 50, 250, 1, (v) => { state.h2 = v; updateVisuals(); }, state.h2);
    ui.addSlider('Stem Offset', 0, 200, 1, (v) => { state.offset = v; updateVisuals(); }, state.offset);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-6-1', {
      chapter: 1,
      type: 'statics',
      title: 'Centroid of Composite Areas',
      hint: 'The centroid of a complex shape is the area-weighted average of the centroids of its simpler parts.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-6-1'] = init;
})();
