/**
 * Ch1-3-3: Hinge (Liên kết bản lề)
 * Hinge support: two perpendicular reaction components.
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
    const engine = new SimulationEngine({ gravity: 0 });
    const ui = new SimUI(uiPanel);
    
    // 3. State
    let state = {
      ax: 200, ay: 250, // Hinge A
      beamLen: 300,
      fMag: 150,
      fAngle: 60 // deg from horizontal
    };

    // 4. SVG Elements
    // Ground
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '100'); ground.setAttribute('y1', '280');
    ground.setAttribute('x2', '300'); ground.setAttribute('y2', '280');
    ground.setAttribute('stroke', '#7f8c8d'); ground.setAttribute('stroke-width', '4');
    svg.appendChild(ground);

    // Support Triangle
    const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    triangle.setAttribute('d', `M ${state.ax-15} ${state.ay+30} L ${state.ax+15} ${state.ay+30} L ${state.ax} ${state.ay} Z`);
    triangle.setAttribute('fill', '#95a5a6');
    svg.appendChild(triangle);

    // Beam
    const beam = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    beam.setAttribute('x', state.ax);
    beam.setAttribute('y', state.ay - 10);
    beam.setAttribute('width', state.beamLen);
    beam.setAttribute('height', '20');
    beam.setAttribute('fill', '#bdc3c7');
    beam.setAttribute('stroke', '#7f8c8d');
    svg.appendChild(beam);

    // Pivot Point
    const pivot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pivot.setAttribute('cx', state.ax);
    pivot.setAttribute('cy', state.ay);
    pivot.setAttribute('r', '5');
    pivot.setAttribute('fill', '#fff');
    svg.appendChild(pivot);

    // Arrows
    const arrowP = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 3 }); // Applied Force
    const arrowAx = SimV2Primitives.createArrow(svg, { color: '#2ecc71', strokeWidth: 2 }); // Rx
    const arrowAy = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2 }); // Ry

    // 5. Readout
    const readout = document.createElement('div');
    readout.setAttribute('class', 'sim-readout-v2');
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      const rad = state.fAngle * Math.PI / 180;
      const fx = Math.cos(rad) * state.fMag;
      const fy = Math.sin(rad) * state.fMag;

      const forceX = state.ax + state.beamLen * 0.8;
      const forceY = state.ay;

      // Update Force P
      arrowP.update(forceX, forceY, forceX + fx, forceY + fy);

      // Reaction Components (Equilibrium: Ax = -Px, Ay = -Py if no other forces)
      // For demonstration, we show them acting at the hinge.
      const Ax = -fx;
      const Ay = -fy;

      arrowAx.update(state.ax, state.ay, state.ax + Ax, state.ay);
      arrowAy.update(state.ax, state.ay, state.ax, state.ay + Ay);

      readout.innerHTML = `
        <div style="color: #e74c3c;">Lực tác dụng P = ${state.fMag.toFixed(1)} N</div>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:10px 0;">
        <div style="color: #2ecc71;">Phản lực Ax = ${Math.abs(Ax).toFixed(1)} N</div>
        <div style="color: #3498db;">Phản lực Ay = ${Math.abs(Ay).toFixed(1)} N</div>
        <div style="color: #8ea0b8; font-size: 0.85em; font-style: italic; margin-top: 10px;">
          * Liên kết bản lề ngăn cản chuyển động thẳng theo mọi hướng, do đó có hai thành phần phản lực.
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('Độ lớn lực P', 50, 200, 1, (v) => {
      state.fMag = v;
      updateVisuals();
    }, state.fMag);

    ui.addSlider('Góc lực P', 0, 360, 1, (v) => {
      state.fAngle = v;
      updateVisuals();
    }, state.fAngle);

    // 7. Start
    updateVisuals();
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowP, arrowAx, arrowAy]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-3-3', {
      chapter: 1,
      type: 'statics',
      title: 'Liên kết bản lề',
      hint: 'Quan sát các thành phần phản lực tại bản lề khi thay đổi lực tác dụng.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-3-3'] = init;
})();
