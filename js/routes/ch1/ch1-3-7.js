/**
 * Ch1-3-7: Two-force Member (Thanh hai lực)
 * Two-force member: reactions are directed along the axis connecting the two points.
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
      ax: 200, ay: 300, // Point A
      bx: 500, by: 150, // Point B
      fMag: 100
    };

    // 4. SVG Elements
    // Axial line
    const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axis.setAttribute('stroke', 'rgba(255,255,255,0.1)');
    axis.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(axis);

    // Member (Beam)
    const beam = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    beam.setAttribute('stroke', '#95a5a6');
    beam.setAttribute('stroke-width', '10');
    beam.setAttribute('stroke-linecap', 'round');
    svg.appendChild(beam);

    // Points
    const pointA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointA.setAttribute('r', '6');
    pointA.setAttribute('fill', '#fff');
    pointA.setAttribute('stroke', '#34495e');
    svg.appendChild(pointA);

    const pointB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointB.setAttribute('r', '6');
    pointB.setAttribute('fill', '#fff');
    pointB.setAttribute('stroke', '#34495e');
    svg.appendChild(pointB);

    // Arrows
    const arrowA = SimV2Primitives.createArrow(svg, { color: '#e67e22', strokeWidth: 3 });
    const arrowB = SimV2Primitives.createArrow(svg, { color: '#e67e22', strokeWidth: 3 });

    // 5. Readout
    const readout = document.createElement('div');
    readout.setAttribute('class', 'sim-readout-v2');
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      // Points
      pointA.setAttribute('cx', state.ax);
      pointA.setAttribute('cy', state.ay);
      pointB.setAttribute('cx', state.bx);
      pointB.setAttribute('cy', state.by);

      // Beam
      beam.setAttribute('x1', state.ax);
      beam.setAttribute('y1', state.ay);
      beam.setAttribute('x2', state.bx);
      beam.setAttribute('y2', state.by);

      // Axis
      const dx = state.bx - state.ax;
      const dy = state.by - state.ay;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const ux = dx / dist;
      const uy = dy / dist;

      axis.setAttribute('x1', state.ax - ux * 100);
      axis.setAttribute('y1', state.ay - uy * 100);
      axis.setAttribute('x2', state.bx + ux * 100);
      axis.setAttribute('y2', state.by + uy * 100);

      // Forces (Directed along AB)
      arrowA.update(state.ax, state.ay, state.ax - ux * state.fMag, state.ay - uy * state.fMag);
      arrowB.update(state.bx, state.by, state.bx + ux * state.fMag, state.by + uy * state.fMag);

      readout.innerHTML = `
        <div style="color: #e67e22; font-weight: bold;">Lực dọc trục N = ${state.fMag.toFixed(1)} N</div>
        <div style="color: #8ea0b8; font-size: 0.9em; margin-top: 5px;">Khoảng cách AB = ${dist.toFixed(1)} px</div>
        <div style="color: #8ea0b8; font-size: 0.85em; font-style: italic; margin-top: 10px;">
          * Thanh hai lực (chịu lực tại 2 điểm, không có ngẫu lực/lực khác) luôn có phản lực dọc theo đường nối 2 điểm đó.
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('Độ lớn lực N', 50, 200, 1, (v) => {
      state.fMag = v;
      updateVisuals();
    }, state.fMag);

    ui.addSlider('Vị trí B - X', 300, 700, 1, (v) => {
      state.bx = v;
      updateVisuals();
    }, state.bx);

    ui.addSlider('Vị trí B - Y', 50, 400, 1, (v) => {
      state.by = v;
      updateVisuals();
    }, state.by);

    // 7. Start
    updateVisuals();
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowA, arrowB]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-3-7', {
      chapter: 1,
      type: 'statics',
      title: 'Thanh hai lực',
      hint: 'Khám phá đặc điểm phản lực của thanh hai lực khi thay đổi vị trí các điểm liên kết.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-3-7'] = init;
})();
