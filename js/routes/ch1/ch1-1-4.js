/**
 * Ch1-1-4: Moment Arm (Cánh tay đòn)
 * M = F x d - demonstrating the perpendicular distance from a point to a force line.
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
      ox: 180, oy: 220, // Pivot O
      fx: 480, fy: 160, // Force point
      fMag: 150,        // Force magnitude
      fAngle: 45,       // Force angle (deg)
      scale: 1          // 1px = 1N for simplicity
    };

    // 4. SVG Primitives
    // Pivot Base
    const pivotBase = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    pivotBase.setAttribute('x', state.ox - 40);
    pivotBase.setAttribute('y', state.oy + 60);
    pivotBase.setAttribute('width', '80');
    pivotBase.setAttribute('height', '10');
    pivotBase.setAttribute('fill', '#555');
    svg.appendChild(pivotBase);

    // Pivot Point O
    const pivot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivot.setAttribute('cx', state.ox);
    pivot.setAttribute('cy', state.oy);
    pivot.setAttribute('r', '8');
    pivot.setAttribute('fill', '#fff');
    pivot.setAttribute('stroke', '#c9963a');
    pivot.setAttribute('stroke-width', '2');
    svg.appendChild(pivot);

    const labelO = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelO.setAttribute('x', state.ox + 12);
    labelO.setAttribute('y', state.oy + 6);
    labelO.setAttribute('fill', '#c9963a');
    labelO.setAttribute('font-weight', 'bold');
    labelO.textContent = 'O';
    svg.appendChild(labelO);

    // Force Line (Infinite extension)
    const forceLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    forceLine.setAttribute('stroke', 'rgba(255,255,255,0.1)');
    forceLine.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(forceLine);

    // Perpendicular line (Moment arm d)
    const armLine = SimV2Primitives.createArrow(svg, { color: '#c9963a', strokeWidth: 1.5 });
    armLine.line.setAttribute('stroke-dasharray', '4,2');

    // Force Arrow
    const arrowF = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 2.5 });

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
      const rad = state.fAngle * Math.PI / 180;
      const fvx = Math.cos(rad) * state.fMag;
      const fvy = Math.sin(rad) * state.fMag;

      // Update Force Arrow
      arrowF.update(state.fx, state.fy, state.fx + fvx, state.fy + fvy);

      // Force Line
      forceLine.setAttribute('x1', state.fx - fvx * 5);
      forceLine.setAttribute('y1', state.fy - fvy * 5);
      forceLine.setAttribute('x2', state.fx + fvx * 5);
      forceLine.setAttribute('y2', state.fy + fvy * 5);

      // Calculate Perpendicular Distance (Moment Arm d)
      // d = |(x2-x1)(y1-y0) - (x1-x0)(y2-y1)| / sqrt((x2-x1)^2 + (y2-y1)^2)
      const x1 = state.fx;
      const y1 = state.fy;
      const x2 = state.fx + fvx;
      const y2 = state.fy + fvy;
      const x0 = state.ox;
      const y0 = state.oy;

      const d = Math.abs((x2-x1)*(y1-y0) - (x1-x0)*(y2-y1)) / Math.sqrt((x2-x1)**2 + (y2-y1)**2);
      
      // Find projection point P on force line
      const t = ((x0-x1)*(x2-x1) + (y0-y1)*(y2-y1)) / ((x2-x1)**2 + (y2-y1)**2);
      const px = x1 + t * (x2-x1);
      const py = y1 + t * (y2-y1);

      // Update arm line
      armLine.update(state.ox, state.oy, px, py);

      // Moment M = F * d
      const M = (state.fMag * d) / 100; // Scaled for display

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">Lực F = ${state.fMag.toFixed(1)} N</div>
        <div style="color: #c9963a">Tay đòn d = ${d.toFixed(1)} px</div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
        <div style="color: #fd7e14; font-size: 1.2em; font-weight: bold;">
          M_O = F \u00D7 d = ${M.toFixed(2)} N\u00B7m
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force Magnitude', 50, 250, 1, (v) => {
      state.fMag = v;
      updateVisuals();
    }, state.fMag);

    ui.addSlider('Force Angle', 0, 360, 1, (v) => {
      state.fAngle = v;
      updateVisuals();
    }, state.fAngle);

    ui.addSlider('Point F X', 200, 600, 1, (v) => {
      state.fx = v;
      updateVisuals();
    }, state.fx);

    ui.addSlider('Point F Y', 50, 350, 1, (v) => {
      state.fy = v;
      updateVisuals();
    }, state.fy);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowF, armLine]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-1-4', {
      chapter: 1,
      type: 'statics',
      title: 'Mô men lực',
      hint: 'Thay đổi điểm đặt, hướng và độ lớn của lực để xem sự thay đổi của cánh tay đòn và mô men.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-1-4'] = init;
})();
