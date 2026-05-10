/**
 * Ch1-3-1: FBD Single Body
 * Free Body Diagram of a single rigid body.
 * Shows equilibrium equations: sum Fx = 0, sum Fy = 0, sum M = 0.
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
      ox: 380, oy: 220,
      bw: 240, bh: 100,
      F1: { x: -120, y: -50, fx: 0, fy: 100, label: 'P', color: '#ff4444' },
      F2: { x: 120, y: 50, fx: 0, fy: -100, label: 'Ry', color: '#44ff44' },
      F3: { x: 120, y: 0, fx: -50, fy: 0, label: 'Rx', color: '#4444ff' },
      F4: { x: -120, y: 0, fx: 50, fy: 0, label: 'F_ext', color: '#fd7e14' }
    };

    // 4. SVG Primitives
    // Rigid Body
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    body.setAttribute('x', state.ox - state.bw / 2);
    body.setAttribute('y', state.oy - state.bh / 2);
    body.setAttribute('width', state.bw);
    body.setAttribute('height', state.bh);
    body.setAttribute('fill', 'rgba(52, 73, 94, 0.5)');
    body.setAttribute('stroke', '#c9963a');
    body.setAttribute('stroke-width', '2');
    svg.appendChild(body);

    const bodyLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    bodyLabel.setAttribute('x', state.ox);
    bodyLabel.setAttribute('y', state.oy);
    bodyLabel.setAttribute('fill', '#fff');
    bodyLabel.setAttribute('text-anchor', 'middle');
    bodyLabel.setAttribute('dominant-baseline', 'middle');
    bodyLabel.setAttribute('font-weight', 'bold');
    bodyLabel.textContent = 'RIGID BODY';
    svg.appendChild(bodyLabel);

    // Force Arrows
    const arrows = {
      F1: SimV2Primitives.createArrow(svg, { color: state.F1.color, strokeWidth: 2.5 }),
      F2: SimV2Primitives.createArrow(svg, { color: state.F2.color, strokeWidth: 2.5 }),
      F3: SimV2Primitives.createArrow(svg, { color: state.F3.color, strokeWidth: 2.5 }),
      F4: SimV2Primitives.createArrow(svg, { color: state.F4.color, strokeWidth: 2.5 })
    };

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
      // Update arrows
      for (let key in arrows) {
        const f = state[key];
        const sx = state.ox + f.x;
        const sy = state.oy + f.y;
        arrows[key].update(sx, sy, sx + f.fx, sy + f.fy);
      }

      // Calculations
      const sumFx = state.F1.fx + state.F2.fx + state.F3.fx + state.F4.fx;
      const sumFy = state.F1.fy + state.F2.fy + state.F3.fy + state.F4.fy;
      
      // Moment about center (ox, oy)
      // M = r x F = (rx * fy - ry * fx)
      const M1 = (state.F1.x * state.F1.fy - state.F1.y * state.F1.fx);
      const M2 = (state.F2.x * state.F2.fy - state.F2.y * state.F2.fx);
      const M3 = (state.F3.x * state.F3.fy - state.F3.y * state.F3.fx);
      const M4 = (state.F4.x * state.F4.fy - state.F4.y * state.F4.fx);
      const sumM = (M1 + M2 + M3 + M4) / 100;

      const isBalanced = Math.abs(sumFx) < 0.1 && Math.abs(sumFy) < 0.1 && Math.abs(sumM) < 0.01;

      // Readout
      readout.innerHTML = `
        <div style="color: #8ea0b8; font-weight: bold; margin-bottom: 5px;">EQUILIBRIUM EQUATIONS:</div>
        <div style="color: ${Math.abs(sumFx) < 0.1 ? '#44ff44' : '#ff4444'}">\u03A3Fx = ${sumFx.toFixed(1)} N</div>
        <div style="color: ${Math.abs(sumFy) < 0.1 ? '#44ff44' : '#ff4444'}">\u03A3Fy = ${sumFy.toFixed(1)} N</div>
        <div style="color: ${Math.abs(sumM) < 0.01 ? '#44ff44' : '#ff4444'}">\u03A3M_G = ${sumM.toFixed(2)} N\u00B7m</div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
        <div style="text-align: center; font-weight: bold; color: ${isBalanced ? '#44ff44' : '#ff4444'}">
          ${isBalanced ? 'BALANCED' : 'UNBALANCED'}
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force P (Vertical)', 0, 200, 1, (v) => {
      state.F1.fy = v;
      updateVisuals();
    }, state.F1.fy);

    ui.addSlider('Force Ry (Reaction)', -200, 0, 1, (v) => {
      state.F2.fy = v;
      updateVisuals();
    }, state.F2.fy);

    ui.addSlider('Force Rx (Reaction)', -100, 100, 1, (v) => {
      state.F3.fx = v;
      updateVisuals();
    }, state.F3.fx);

    ui.addSlider('External Force Fx', -100, 100, 1, (v) => {
      state.F4.fx = v;
      updateVisuals();
    }, state.F4.fx);

    ui.addSlider('P Position X', -120, 120, 1, (v) => {
      state.F1.x = v;
      updateVisuals();
    }, state.F1.x);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose(Object.values(arrows));
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-2-6', {
      chapter: 1,
      type: 'statics',
      title: 'Free Body Diagram (FBD)',
      hint: 'Giải phóng liên kết và quan sát các phương trình cân bằng (ΣF=0, ΣM=0).'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-2-6'] = init;
})();
