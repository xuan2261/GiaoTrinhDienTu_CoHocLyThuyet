/**
 * Ch1-4-2: Beam Reactions
 * Similar to ch1-4-1 but focusing on simple beam reaction distribution.
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

    // Supports
    const supA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    supA.setAttribute('cx', lx + 15);
    supA.setAttribute('cy', beamY + 22);
    supA.setAttribute('r', '10');
    supA.setAttribute('fill', '#c9963a');
    svg.appendChild(supA);

    const supB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    supB.setAttribute('cx', rx - 15);
    supB.setAttribute('cy', beamY + 22);
    supB.setAttribute('r', '10');
    supB.setAttribute('fill', '#c9963a');
    svg.appendChild(supB);

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
      arrowRA.update(lx + 15, beamY + 40, lx + 15, beamY + 40 - state.RA * 0.4);
      arrowRB.update(rx - 15, beamY + 40, rx - 15, beamY + 40 - state.RB * 0.4);

      readout.innerHTML = `
        <div style="color: #e74c3c; font-weight: bold;">Applied Load P:</div>
        <div style="margin-left: 10px; margin-bottom: 10px;">${state.P.toFixed(1)} N at a = ${state.a.toFixed(0)}</div>
        
        <div style="color: #c9963a; font-weight: bold;">Reactions:</div>
        <div style="color: #3498db; margin-left: 10px;">RA = ${state.RA.toFixed(1)} N</div>
        <div style="color: #2ecc71; margin-left: 10px;">RB = ${state.RB.toFixed(1)} N</div>
        
        <div style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px; font-size: 0.9em;">
          Sum of Moments at A = 0:<br>
          P \u00D7 a - RB \u00D7 L = 0<br>
          \u21D2 RB = (P \u00D7 a) / L
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
    window.RouteRegistry.register('ch1-4-2', {
      chapter: 1,
      type: 'statics',
      title: 'Beam Reactions',
      hint: 'Adjust load magnitude and position to calculate reactions.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-4-2'] = init;
})();
