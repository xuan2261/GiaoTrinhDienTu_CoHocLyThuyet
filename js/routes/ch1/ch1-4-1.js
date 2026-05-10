/**
 * Ch1-4-1: Support Reactions
 * Calculating reactions RA and RB for a simple beam under point load P.
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
      L: 500,
      P: 150,
      a: 200,
      RA: 0,
      RB: 0
    };

    const beamY = 260;
    const lx = (760 - state.L) / 2;
    const rx = lx + state.L;

    // Ground line
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '50');
    ground.setAttribute('y1', beamY + 40);
    ground.setAttribute('x2', '710');
    ground.setAttribute('y2', beamY + 40);
    ground.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    svg.appendChild(ground);

    // Support A (Pin)
    const supportA = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    supportA.setAttribute('d', `M ${lx+20-15} ${beamY+25} L ${lx+20+15} ${beamY+25} L ${lx+20} ${beamY} Z`);
    supportA.setAttribute('fill', '#c9963a');
    svg.appendChild(supportA);

    // Support B (Roller)
    const supportB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    supportB.setAttribute('cx', rx - 20);
    supportB.setAttribute('cy', beamY + 15);
    supportB.setAttribute('r', '10');
    supportB.setAttribute('fill', '#c9963a');
    svg.appendChild(supportB);

    // Beam
    const beam = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    beam.setAttribute('x', lx);
    beam.setAttribute('y', beamY - 15);
    beam.setAttribute('width', state.L);
    beam.setAttribute('height', '30');
    beam.setAttribute('rx', '4');
    beam.setAttribute('fill', 'rgba(52, 73, 94, 0.7)');
    beam.setAttribute('stroke', '#c9963a');
    beam.setAttribute('stroke-width', '2');
    svg.appendChild(beam);

    // Arrows
    const arrowP = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 3 });
    const arrowRA = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2.5 });
    const arrowRB = SimV2Primitives.createArrow(svg, { color: '#2ecc71', strokeWidth: 2.5 });

    // Dimension lines
    const dimL = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    dimL.setAttribute('stroke', 'rgba(232, 236, 241, 0.4)');
    dimL.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(dimL);

    const dimA = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    dimA.setAttribute('stroke', '#c9963a');
    dimA.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(dimA);

    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      state.RB = (state.P * state.a) / state.L;
      state.RA = state.P - state.RB;

      const px = lx + state.a;
      arrowP.update(px, beamY - 15 - state.P * 0.4, px, beamY - 15);
      arrowRA.update(lx + 20, beamY + 40, lx + 20, beamY + 40 - state.RA * 0.4);
      arrowRB.update(rx - 20, beamY + 40, rx - 20, beamY + 40 - state.RB * 0.4);

      dimL.setAttribute('x1', lx); dimL.setAttribute('y1', beamY + 55);
      dimL.setAttribute('x2', rx); dimL.setAttribute('y2', beamY + 55);

      dimA.setAttribute('x1', lx); dimA.setAttribute('y1', beamY + 62);
      dimA.setAttribute('x2', px); dimA.setAttribute('y2', beamY + 62);

      readout.innerHTML = `
        <div style="color: #e74c3c; font-weight: bold; margin-bottom: 5px;">Applied Load:</div>
        <div style="margin-left: 10px;">P = ${state.P.toFixed(1)} N</div>
        <div style="margin-left: 10px;">a = ${state.a.toFixed(0)} px</div>
        
        <div style="color: #c9963a; font-weight: bold; margin-top: 15px; margin-bottom: 5px;">Reactions:</div>
        <div style="color: #3498db; margin-left: 10px;">RA = ${state.RA.toFixed(1)} N</div>
        <div style="color: #2ecc71; margin-left: 10px;">RB = ${state.RB.toFixed(1)} N</div>
        
        <div style="color: #8ea0b8; font-size: 0.9em; margin-top: 15px; font-style: italic;">
          Equilibrium: \u03A3M_A = 0 \u21D2 RB = (P \u00D7 a) / L
        </div>
      `;
    }

    ui.addSlider('Load Position (a)', 20, 480, 1, (v) => {
      state.a = v;
      updateVisuals();
    }, state.a);

    ui.addSlider('Load Magnitude (P)', 20, 300, 1, (v) => {
      state.P = v;
      updateVisuals();
    }, state.P);

    updateVisuals();
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowP, arrowRA, arrowRB]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-4-1', {
      chapter: 1,
      type: 'statics',
      title: 'Support Reactions',
      hint: 'Move load position and change magnitude to see how reactions change.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-4-1'] = init;
})();
