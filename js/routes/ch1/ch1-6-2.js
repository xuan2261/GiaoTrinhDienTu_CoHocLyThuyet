/**
 * Ch1-6-2: Centroid Composite
 * Calculating the centroid (G) of a composite shape made of multiple rectangles.
 * x_bar = sum(Ai * xi) / sum(Ai)
 * y_bar = sum(Ai * yi) / sum(Ai)
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
      shapes: [
        { id: 1, x: 250, y: 200, w: 100, h: 60, color: '#e74c3c' },
        { id: 2, x: 400, y: 160, w: 80, h: 100, color: '#3498db' },
        { id: 3, x: 500, y: 240, w: 120, h: 40, color: '#2ecc71' }
      ]
    };

    // Draw shapes
    const svgShapes = state.shapes.map(s => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', s.w);
      rect.setAttribute('height', s.h);
      rect.setAttribute('fill', s.color + '44');
      rect.setAttribute('stroke', s.color);
      rect.setAttribute('stroke-width', '2');
      svg.appendChild(rect);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('fill', s.color);
      label.setAttribute('font-weight', 'bold');
      label.textContent = s.id;
      svg.appendChild(label);

      return { rect, label };
    });

    // Centroid Marker G
    const centroidG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(centroidG);

    const crossH = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crossH.setAttribute('x1', '-10'); crossH.setAttribute('y1', '0');
    crossH.setAttribute('x2', '10'); crossH.setAttribute('y2', '0');
    crossH.setAttribute('stroke', '#f1c40f');
    crossH.setAttribute('stroke-width', '2');
    centroidG.appendChild(crossH);

    const crossV = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crossV.setAttribute('x1', '0'); crossV.setAttribute('y1', '-10');
    crossV.setAttribute('x2', '0'); crossV.setAttribute('y2', '10');
    crossV.setAttribute('stroke', '#f1c40f');
    crossV.setAttribute('stroke-width', '2');
    centroidG.appendChild(crossV);

    const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelG.setAttribute('fill', '#f1c40f');
    labelG.setAttribute('font-weight', 'bold');
    labelG.textContent = 'G';
    labelG.setAttribute('x', '12');
    labelG.setAttribute('y', '-12');
    centroidG.appendChild(labelG);

    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      let totalArea = 0;
      let sumAx = 0;
      let sumAy = 0;

      state.shapes.forEach((s, i) => {
        const area = s.w * s.h;
        totalArea += area;
        sumAx += (s.x + s.w/2) * area;
        sumAy += (s.y + s.h/2) * area;

        const el = svgShapes[i];
        el.rect.setAttribute('x', s.x);
        el.rect.setAttribute('y', s.y);
        el.label.setAttribute('x', s.x + s.w/2 - 5);
        el.label.setAttribute('y', s.y + s.h/2 + 5);
      });

      const xBar = sumAx / totalArea;
      const yBar = sumAy / totalArea;

      centroidG.setAttribute('transform', `translate(${xBar}, ${yBar})`);

      readout.innerHTML = `
        <div style="color: #f1c40f; font-weight: bold; margin-bottom: 10px;">Composite Centroid:</div>
        <div style="font-family: monospace;">
          x_bar = \u03A3(Ai\u00B7xi) / \u03A3Ai = ${xBar.toFixed(1)}<br>
          y_bar = \u03A3(Ai\u00B7yi) / \u03A3Ai = ${yBar.toFixed(1)}
        </div>
        
        <div style="margin-top: 15px; font-size: 0.85em; color: #8ea0b8;">
          <div style="color: #e74c3c;">Shape 1: A=${(state.shapes[0].w*state.shapes[0].h)}</div>
          <div style="color: #3498db;">Shape 2: A=${(state.shapes[1].w*state.shapes[1].h)}</div>
          <div style="color: #2ecc71;">Shape 3: A=${(state.shapes[2].w*state.shapes[2].h)}</div>
        </div>
      `;
    }

    state.shapes.forEach((s, i) => {
      ui.addSlider(`Shape ${s.id} X`, 50, 600, 1, (v) => { s.x = v; updateVisuals(); }, s.x);
      ui.addSlider(`Shape ${s.id} Y`, 50, 350, 1, (v) => { s.y = v; updateVisuals(); }, s.y);
    });

    updateVisuals();
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-6-2', {
      chapter: 1,
      type: 'statics',
      title: 'Centroid Composite',
      hint: 'Move the rectangles to see how the centroid of the composite shape shifts.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-6-2'] = init;
})();
