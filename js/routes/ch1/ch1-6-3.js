/**
 * Ch1-6-3: Centroid with Holes
 * Centroid calculation for shapes with negative areas (holes).
 * x_bar = (sum(Ai*xi) - sum(Ah*xh)) / (sum(Ai) - sum(Ah))
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
        { id: 1, x: 200, y: 150, w: 300, h: 200, color: '#3498db' }
      ],
      hole: { x: 350, y: 250, r: 40, color: '#091a33' }
    };

    // Draw base shape
    const mainShape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    mainShape.setAttribute('fill', state.shapes[0].color + '44');
    mainShape.setAttribute('stroke', state.shapes[0].color);
    mainShape.setAttribute('stroke-width', '2');
    svg.appendChild(mainShape);

    // Draw hole
    const holeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    holeCircle.setAttribute('fill', '#1a2a44');
    holeCircle.setAttribute('stroke', '#ff4444');
    holeCircle.setAttribute('stroke-width', '2');
    holeCircle.setAttribute('stroke-dasharray', '4,2');
    svg.appendChild(holeCircle);

    const holeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    holeLabel.setAttribute('fill', '#ff4444');
    holeLabel.setAttribute('font-size', '12px');
    holeLabel.textContent = 'HOLE';
    svg.appendChild(holeLabel);

    // Centroid Marker G
    const centroidG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(centroidG);

    const crossH = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crossH.setAttribute('x1', '-12'); crossH.setAttribute('y1', '0');
    crossH.setAttribute('x2', '12'); crossH.setAttribute('y2', '0');
    crossH.setAttribute('stroke', '#f1c40f');
    crossH.setAttribute('stroke-width', '2');
    centroidG.appendChild(crossH);

    const crossV = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crossV.setAttribute('x1', '0'); crossV.setAttribute('y1', '-12');
    crossV.setAttribute('x2', '0'); crossV.setAttribute('y2', '12');
    crossV.setAttribute('stroke', '#f1c40f');
    crossV.setAttribute('stroke-width', '2');
    centroidG.appendChild(crossV);

    const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelG.setAttribute('fill', '#f1c40f');
    labelG.setAttribute('font-weight', 'bold');
    labelG.textContent = 'G';
    labelG.setAttribute('x', '15');
    labelG.setAttribute('y', '-15');
    centroidG.appendChild(labelG);

    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      const s = state.shapes[0];
      const h = state.hole;

      mainShape.setAttribute('x', s.x);
      mainShape.setAttribute('y', s.y);
      mainShape.setAttribute('width', s.w);
      mainShape.setAttribute('height', s.h);

      holeCircle.setAttribute('cx', h.x);
      holeCircle.setAttribute('cy', h.y);
      holeCircle.setAttribute('r', h.r);
      holeLabel.setAttribute('x', h.x - 15);
      holeLabel.setAttribute('y', h.y + 5);

      const areaS = s.w * s.h;
      const areaH = Math.PI * h.r * h.r;
      const totalArea = areaS - areaH;

      const xBar = ((s.x + s.w/2) * areaS - h.x * areaH) / totalArea;
      const yBar = ((s.y + s.h/2) * areaS - h.y * areaH) / totalArea;

      centroidG.setAttribute('transform', `translate(${xBar}, ${yBar})`);

      readout.innerHTML = `
        <div style="color: #f1c40f; font-weight: bold; margin-bottom: 10px;">Centroid with Hole:</div>
        <div style="color: #3498db;">Main Area A1 = ${areaS.toFixed(0)}</div>
        <div style="color: #ff4444;">Hole Area A2 = -${areaH.toFixed(0)}</div>
        <div style="color: #fff; margin-top: 5px;">Net Area = ${totalArea.toFixed(0)}</div>
        
        <div style="font-family: monospace; margin-top: 15px; color: #f1c40f;">
          x_bar = (A1\u00B7x1 - A2\u00B7x2) / NetArea<br>
          x_bar = ${xBar.toFixed(1)}<br>
          y_bar = ${yBar.toFixed(1)}
        </div>
      `;
    }

    ui.addSlider('Hole X', 200, 500, 1, (v) => { state.hole.x = v; updateVisuals(); }, state.hole.x);
    ui.addSlider('Hole Y', 150, 350, 1, (v) => { state.hole.y = v; updateVisuals(); }, state.hole.y);
    ui.addSlider('Hole Radius', 10, 80, 1, (v) => { state.hole.r = v; updateVisuals(); }, state.hole.r);

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
    window.RouteRegistry.register('ch1-6-3', {
      chapter: 1,
      type: 'statics',
      title: 'Centroid with Holes',
      hint: 'Move the hole and change its size to see how the composite centroid shifts.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-6-3'] = init;
})();
