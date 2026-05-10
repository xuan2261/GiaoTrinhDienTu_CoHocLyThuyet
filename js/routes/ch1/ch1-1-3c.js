/**
 * Ch1-1-3c: Force Projection
 * Projection of a force F onto an arbitrary axis.
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
      ox: 380,
      oy: 220,
      F: 200,
      theta: 20, // Axis angle
      alpha: 45  // Force angle
    };

    // 4. SVG Primitives
    // Axis line (Gold dashed)
    const axisGold = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisGold.setAttribute('stroke', '#ffcc00');
    axisGold.setAttribute('stroke-width', '1.5');
    axisGold.setAttribute('stroke-dasharray', '8,4');
    svg.appendChild(axisGold);

    // Origin point
    const originPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    originPoint.setAttribute('cx', state.ox);
    originPoint.setAttribute('cy', state.oy);
    originPoint.setAttribute('r', '4');
    originPoint.setAttribute('fill', '#fff');
    svg.appendChild(originPoint);

    // Arrows
    const arrowF = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 3 });
    const arrowFp = SimV2Primitives.createArrow(svg, { color: '#4444ff', strokeWidth: 2.5 });
    
    // Auxiliary line for projection
    const projGuide = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    projGuide.setAttribute('stroke', 'rgba(232, 236, 241, 0.4)');
    projGuide.setAttribute('stroke-width', '1');
    projGuide.setAttribute('stroke-dasharray', '4,2');
    svg.appendChild(projGuide);

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
      const alphaRad = state.alpha * Math.PI / 180;
      const thetaRad = state.theta * Math.PI / 180;
      
      const fx = state.F * Math.cos(alphaRad);
      const fy = state.F * Math.sin(alphaRad);
      const tipX = state.ox + fx;
      const tipY = state.oy - fy;

      // Force F
      arrowF.update(state.ox, state.oy, tipX, tipY);
      
      // Axis Gold
      const axisLen = 300;
      axisGold.setAttribute('x1', state.ox - axisLen * Math.cos(thetaRad));
      axisGold.setAttribute('y1', state.oy + axisLen * Math.sin(thetaRad));
      axisGold.setAttribute('x2', state.ox + axisLen * Math.cos(thetaRad));
      axisGold.setAttribute('y2', state.oy - axisLen * Math.sin(thetaRad));

      // Projection calculation: Fp = F * cos(alpha - theta)
      const Fp = state.F * Math.cos((state.alpha - state.theta) * Math.PI / 180);
      const fpx = Fp * Math.cos(thetaRad);
      const fpy = Fp * Math.sin(thetaRad);
      const pTipX = state.ox + fpx;
      const pTipY = state.oy - fpy;

      // Projected Force Arrow
      arrowFp.update(state.ox, state.oy, pTipX, pTipY);

      // Guide line from F tip to projection tip
      projGuide.setAttribute('x1', tipX);
      projGuide.setAttribute('y1', tipY);
      projGuide.setAttribute('x2', pTipX);
      projGuide.setAttribute('y2', pTipY);

      // Readout
      readout.innerHTML = `
        <div style="color: #ff4444">F  = ${state.F.toFixed(1)} N</div>
        <div style="color: #ffcc00">Axis Angle (\u03B8) = ${state.theta}\u00B0</div>
        <div style="color: #4444ff">Fp = F.cos(\u03B1 - \u03B8) = ${Fp.toFixed(1)} N</div>
        <div style="color: #8ea0b8; margin-top: 5px;">Force Angle (\u03B1) = ${state.alpha}\u00B0</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Force Magnitude (F)', 50, 200, 1, (v) => {
      state.F = v;
      updateVisuals();
    }, state.F);

    ui.addSlider('Force Angle (\u03B1)', 0, 360, 1, (v) => {
      state.alpha = v;
      updateVisuals();
    }, state.alpha);

    ui.addSlider('Axis Angle (\u03B8)', 0, 180, 1, (v) => {
      state.theta = v;
      updateVisuals();
    }, state.theta);

    // 7. Loop / Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowF, arrowFp]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-1-3c', {
      chapter: 1,
      type: 'statics',
      title: 'Force Projection',
      hint: 'Decompose a force along an arbitrary axis using the dot product concept.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-1-3c'] = init;
})();
