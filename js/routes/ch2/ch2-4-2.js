/**
 * ch2-4-2: Định lý hợp vận tốc (va = ve + vr)
 * Velocity addition theorem: Vector sum of relative and transport velocities.
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
    canvasArea.style.flex = '0 0 500px';
    canvasArea.style.position = 'relative';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 440');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.setAttribute('class', 'sim-svg-v2');
    canvasArea.appendChild(svg);
    
    const uiPanel = document.createElement('div');
    uiPanel.style.flex = '1';
    uiPanel.style.padding = '15px';
    uiPanel.style.backgroundColor = 'rgba(232, 236, 241, 0.03)';
    uiPanel.style.borderLeft = '1px solid rgba(232, 236, 241, 0.1)';
    uiPanel.style.overflowY = 'auto';
    
    container.appendChild(canvasArea);
    container.appendChild(uiPanel);
    host.appendChild(container);

    // 2. Foundation Components
    const engine = new SimulationEngine({ 
      gravity: 0,
      viewHeight: 440,
      originX: 250,
      originY: 220,
      flipY: false 
    });

    const ui = new SimUI(uiPanel);
    
    // 3. State
    let state = {
      vr_mag: 100,
      vr_angle: 0,
      ve_mag: 80,
      ve_angle: 60,
      ox: 250,
      oy: 220
    };

    // 4. SVG Primitives
    // Origin
    const origin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    origin.setAttribute('cx', state.ox);
    origin.setAttribute('cy', state.oy);
    origin.setAttribute('r', '4');
    origin.setAttribute('fill', '#fff');
    svg.appendChild(origin);

    // Parallelogram lines
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    line1.setAttribute('stroke-dasharray', '4,4');
    svg.appendChild(line1);

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    line2.setAttribute('stroke-dasharray', '4,4');
    svg.appendChild(line2);

    // Velocity Arrows
    const arrowVr = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 2, label: 'vr' });
    const arrowVe = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2, label: 've' });
    const arrowVa = SimV2Primitives.createArrow(svg, { color: '#ffcc00', strokeWidth: 3, label: 'va' });

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
      const radR = state.vr_angle * Math.PI / 180;
      const radE = state.ve_angle * Math.PI / 180;

      const vrx = state.vr_mag * Math.cos(radR);
      const vry = -state.vr_mag * Math.sin(radR);

      const vex = state.ve_mag * Math.cos(radE);
      const vey = -state.ve_mag * Math.sin(radE);

      const vax = vrx + vex;
      const vay = vry + vey;

      // Update arrows
      arrowVr.update(state.ox, state.oy, state.ox + vrx, state.oy + vry);
      arrowVe.update(state.ox, state.oy, state.ox + vex, state.oy + vey);
      arrowVa.update(state.ox, state.oy, state.ox + vax, state.oy + vay);

      // Update helper lines
      line1.setAttribute('x1', state.ox + vrx);
      line1.setAttribute('y1', state.oy + vry);
      line1.setAttribute('x2', state.ox + vax);
      line1.setAttribute('y2', state.oy + vay);

      line2.setAttribute('x1', state.ox + vex);
      line2.setAttribute('y1', state.oy + vey);
      line2.setAttribute('x2', state.ox + vax);
      line2.setAttribute('y2', state.oy + vay);

      // Readout
      readout.innerHTML = `
        <div style="color: #44ff44">v_r = ${state.vr_mag.toFixed(1)} @ ${state.vr_angle}\u00B0</div>
        <div style="color: #3498db">v_e = ${state.ve_mag.toFixed(1)} @ ${state.ve_angle}\u00B0</div>
        <div style="color: #ffcc00; margin-top: 5px; font-weight: bold;">v_a = v_e + v_r</div>
        <div style="color: #ffcc00">|v_a| = ${Math.sqrt(vax*vax + vay*vay).toFixed(1)}</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Độ lớn v_r', 0, 150, 1, (v) => {
      state.vr_mag = v;
      updateVisuals();
    }, state.vr_mag);

    ui.addSlider('Góc v_r (\u00B0)', 0, 360, 1, (v) => {
      state.vr_angle = v;
      updateVisuals();
    }, state.vr_angle);

    ui.addSlider('Độ lớn v_e', 0, 150, 1, (v) => {
      state.ve_mag = v;
      updateVisuals();
    }, state.ve_mag);

    ui.addSlider('Góc v_e (\u00B0)', 0, 360, 1, (v) => {
      state.ve_angle = v;
      updateVisuals();
    }, state.ve_angle);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowVr, arrowVe, arrowVa]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-4-2', {
      chapter: 2,
      type: 'kinematics',
      title: 'Định lý hợp vận tốc',
      hint: 'Vận tốc tuyệt đối v_a bằng tổng vector của vận tốc kéo theo v_e và vận tốc tương đối v_r.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-4-2'] = init;
})();
