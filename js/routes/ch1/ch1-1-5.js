/**
 * Ch1-1-5: Force System Reducer
 * R = sum(Fi), M_O = sum(ri x Fi)
 * Reducing a system of forces to a single resultant force and a moment.
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
      ox: 380, oy: 220, // Center O
      forces: [
        { x: -100, y: -80, fx: 120, fy: -40, color: '#ff4444', label: 'F1' },
        { x: 40, y: -100, fx: -60, fy: -110, color: '#4444ff', label: 'F2' },
        { x: 120, y: 20, fx: -90, fy: 60, color: '#44ff44', label: 'F3' }
      ]
    };

    // 4. SVG Primitives
    // Center Point O
    const pivot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivot.setAttribute('cx', state.ox);
    pivot.setAttribute('cy', state.oy);
    pivot.setAttribute('r', '6');
    pivot.setAttribute('fill', '#fff');
    pivot.setAttribute('stroke', '#c9963a');
    pivot.setAttribute('stroke-width', '2');
    svg.appendChild(pivot);

    const labelO = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelO.setAttribute('x', state.ox + 10);
    labelO.setAttribute('y', state.oy + 5);
    labelO.setAttribute('fill', '#c9963a');
    labelO.setAttribute('font-weight', 'bold');
    labelO.textContent = 'O';
    svg.appendChild(labelO);

    // Force Arrows
    const forceArrows = state.forces.map(f => SimV2Primitives.createArrow(svg, { color: f.color, strokeWidth: 2 }));
    const resultArrow = SimV2Primitives.createArrow(svg, { color: '#c9963a', strokeWidth: 3 });

    // Resultant Circle (for Moment)
    const momentArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    momentArc.setAttribute('fill', 'none');
    momentArc.setAttribute('stroke', '#fd7e14');
    momentArc.setAttribute('stroke-width', '2');
    momentArc.setAttribute('stroke-dasharray', '4,2');
    svg.appendChild(momentArc);

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
      let sumFx = 0, sumFy = 0, sumM = 0;

      state.forces.forEach((f, i) => {
        const sx = state.ox + f.x;
        const sy = state.oy + f.y;
        forceArrows[i].update(sx, sy, sx + f.fx, sy + f.fy);
        
        sumFx += f.fx;
        sumFy += f.fy;
        // M = rx*fy - ry*fx
        sumM += (f.x * f.fy - f.y * f.fx);
      });

      const R = Math.sqrt(sumFx**2 + sumFy**2);
      resultArrow.update(state.ox, state.oy, state.ox + sumFx, state.oy + sumFy);

      const M_norm = sumM / 100; // Scaled for display

      // Moment Arc Visual
      if (Math.abs(sumM) > 1) {
        const radius = 40;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (sumM > 0 ? 1.5 : -1.5) * Math.PI;
        
        const x1 = state.ox + radius * Math.cos(startAngle);
        const y1 = state.oy + radius * Math.sin(startAngle);
        const x2 = state.ox + radius * Math.cos(endAngle);
        const y2 = state.oy + radius * Math.sin(endAngle);
        
        const largeArc = 1;
        const sweep = sumM > 0 ? 1 : 0;
        
        momentArc.setAttribute('d', `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${x2} ${y2}`);
        momentArc.style.display = 'block';
      } else {
        momentArc.style.display = 'none';
      }

      // Readout
      readout.innerHTML = `
        <div style="color: #8ea0b8; font-weight: bold; margin-bottom: 5px;">HỆ LỰC THU GỌN:</div>
        <div style="color: #fff">Rx = ${sumFx.toFixed(1)} N</div>
        <div style="color: #fff">Ry = ${sumFy.toFixed(1)} N</div>
        <div style="color: #c9963a; font-weight: bold;">R = ${R.toFixed(1)} N</div>
        <div style="color: #fd7e14; font-weight: bold;">M_O = ${M_norm.toFixed(2)} N\u00B7m</div>
      `;
    }

    // 6. Controls
    state.forces.forEach((f, i) => {
      ui.addSlider(`${f.label} X`, -150, 150, 1, (v) => {
        f.x = v;
        updateVisuals();
      }, f.x);
      ui.addSlider(`${f.label} Fx`, -150, 150, 1, (v) => {
        f.fx = v;
        updateVisuals();
      }, f.fx);
      ui.addSlider(`${f.label} Fy`, -150, 150, 1, (v) => {
        f.fy = v;
        updateVisuals();
      }, f.fy);
    });

    // 7. Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([...forceArrows, resultArrow]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-1-5', {
      chapter: 1,
      type: 'statics',
      title: 'Thu gọn hệ lực',
      hint: 'Quan sát véc tơ chính R và mô men chính M khi thay đổi các lực thành phần.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-1-5'] = init;
})();
