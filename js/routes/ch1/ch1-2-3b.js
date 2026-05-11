/**
 * Ch1-2-3b: Triangle Law of Forces (Tam giác lực)
 * Logic: Vector addition F1 + F2 = F3 (Resultant)
 * Visualization: Three arrows forming a triangle head-to-tail for addition.
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
      ox: 280,
      oy: 280,
      f1_mag: 120,
      f1_angle: 30,
      f2_mag: 100,
      f2_angle: 120
    };

    // 4. SVG Primitives
    // Coordinate Grid (Static)
    for(let i=0; i<760; i+=40) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', i); line.setAttribute('y1', 0);
      line.setAttribute('x2', i); line.setAttribute('y2', 440);
      line.setAttribute('stroke', 'rgba(255,255,255,0.05)');
      svg.appendChild(line);
    }
    for(let i=0; i<440; i+=40) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 0); line.setAttribute('y1', i);
      line.setAttribute('x2', 760); line.setAttribute('y2', i);
      line.setAttribute('stroke', 'rgba(255,255,255,0.05)');
      svg.appendChild(line);
    }

    // Origin point
    const originPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    originPoint.setAttribute('r', '4');
    originPoint.setAttribute('fill', '#fff');
    originPoint.setAttribute('cx', state.ox);
    originPoint.setAttribute('cy', state.oy);
    svg.appendChild(originPoint);

    // Force Arrows
    const arrowF1 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });
    const arrowF2 = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 3 });
    const arrowF3 = SimV2Primitives.createArrow(svg, { color: '#4444ff', strokeWidth: 3 });

    // Labels
    const labelF1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelF1.setAttribute('fill', '#ff4444');
    labelF1.setAttribute('font-size', '14');
    labelF1.setAttribute('font-weight', 'bold');
    labelF1.textContent = 'F1';
    svg.appendChild(labelF1);

    const labelF2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelF2.setAttribute('fill', '#44ff44');
    labelF2.setAttribute('font-size', '14');
    labelF2.setAttribute('font-weight', 'bold');
    labelF2.textContent = 'F2';
    svg.appendChild(labelF2);

    const labelF3 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelF3.setAttribute('fill', '#4444ff');
    labelF3.setAttribute('font-size', '14');
    labelF3.setAttribute('font-weight', 'bold');
    labelF3.textContent = 'F3 (R)';
    svg.appendChild(labelF3);

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
      const a1_rad = state.f1_angle * Math.PI / 180;
      const x1 = state.f1_mag * Math.cos(a1_rad);
      const y1 = -state.f1_mag * Math.sin(a1_rad); // Flip Y for Cartesian look

      const a2_rad = state.f2_angle * Math.PI / 180;
      const x2_rel = state.f2_mag * Math.cos(a2_rad);
      const y2_rel = -state.f2_mag * Math.sin(a2_rad);

      const p1x = state.ox + x1;
      const p1y = state.oy + y1;

      const p2x = p1x + x2_rel;
      const p2y = p1y + y2_rel;

      // Update Arrows
      arrowF1.update(state.ox, state.oy, p1x, p1y);
      arrowF2.update(p1x, p1y, p2x, p2y);
      arrowF3.update(state.ox, state.oy, p2x, p2y);

      // Update Labels
      labelF1.setAttribute('x', state.ox + x1 / 2 - 10);
      labelF1.setAttribute('y', state.oy + y1 / 2 - 10);
      
      labelF2.setAttribute('x', p1x + x2_rel / 2 - 10);
      labelF2.setAttribute('y', p1y + y2_rel / 2 - 10);

      labelF3.setAttribute('x', state.ox + (p2x - state.ox) / 2 + 10);
      labelF3.setAttribute('y', state.oy + (p2y - state.oy) / 2 + 10);

      // Calculate Resultant Magnitude and Angle
      const rx = p2x - state.ox;
      const ry = -(p2y - state.oy); // Back to Cartesian
      const r_mag = Math.sqrt(rx*rx + ry*ry);
      const r_angle = Math.atan2(ry, rx) * 180 / Math.PI;

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">F1: ${state.f1_mag.toFixed(1)} N @ ${state.f1_angle.toFixed(1)}°</div>
        <div style="color: #44ff44">F2: ${state.f2_mag.toFixed(1)} N @ ${state.f2_angle.toFixed(1)}°</div>
        <div style="color: #4444ff; margin-top: 10px; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px;">
          F3 (Resultant): ${r_mag.toFixed(1)} N @ ${r_angle.toFixed(1)}°
        </div>
        <div style="color: #8ea0b8; font-size: 11px; margin-top: 15px;">
          * Quy tắc tam giác: Hợp lực của hai lực được biểu diễn bằng cạnh thứ ba của tam giác khi đặt hai lực nối đuôi nhau.
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('F1 Magnitude', 0, 200, 1, (v) => {
      state.f1_mag = v;
      updateVisuals();
    }, state.f1_mag);

    ui.addSlider('F1 Angle (°)', -180, 180, 1, (v) => {
      state.f1_angle = v;
      updateVisuals();
    }, state.f1_angle);

    ui.addSlider('F2 Magnitude', 0, 200, 1, (v) => {
      state.f2_mag = v;
      updateVisuals();
    }, state.f2_mag);

    ui.addSlider('F2 Angle (°)', -180, 180, 1, (v) => {
      state.f2_angle = v;
      updateVisuals();
    }, state.f2_angle);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowF1, arrowF2, arrowF3]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-2-3b', {
      chapter: 1,
      type: 'statics',
      title: 'Triangle Law of Forces',
      hint: 'Hợp lực của hai lực được xác định theo quy tắc tam giác lực.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-2-3b'] = init;
})();
