/**
 * Ch1-3-1: Reaction Normal (Liên kết tựa trơn)
 * Smooth support reaction: a single normal force.
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
      slopeAngle: 20, // degrees
      contactX: 380,
      contactY: 300,
      forceMag: 120
    };

    // 4. SVG Elements
    // Ground Slope
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('stroke', '#888');
    ground.setAttribute('stroke-width', '4');
    svg.appendChild(ground);

    const groundHatch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    groundHatch.setAttribute('fill', 'none');
    groundHatch.setAttribute('stroke', '#555');
    groundHatch.setAttribute('stroke-width', '1');
    svg.appendChild(groundHatch);

    // Block (Metal)
    const block = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    block.setAttribute('width', '120');
    block.setAttribute('height', '60');
    block.setAttribute('fill', '#95a5a6');
    block.setAttribute('stroke', '#7f8c8d');
    block.setAttribute('stroke-width', '2');
    block.setAttribute('rx', '4');
    svg.appendChild(block);

    // Normal Force Arrow
    const arrowN = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 3 });

    // 5. Readout
    const readout = document.createElement('div');
    readout.setAttribute('class', 'sim-readout-v2');
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      const rad = state.slopeAngle * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Update Ground
      const gx1 = state.contactX - 250 * cos;
      const gy1 = state.contactY + 250 * sin;
      const gx2 = state.contactX + 250 * cos;
      const gy2 = state.contactY - 250 * sin;
      ground.setAttribute('x1', gx1);
      ground.setAttribute('y1', gy1);
      ground.setAttribute('x2', gx2);
      ground.setAttribute('y2', gy2);

      // Hatching
      let hatchD = '';
      for (let i = -250; i <= 250; i += 20) {
        const hx1 = state.contactX + i * cos;
        const hy1 = state.contactY - i * sin;
        hatchD += ` M ${hx1} ${hy1} L ${hx1 + 10 * sin} ${hy1 + 10 * cos}`;
      }
      groundHatch.setAttribute('d', hatchD);

      // Update Block
      block.setAttribute('transform', `translate(${state.contactX}, ${state.contactY}) rotate(${-state.slopeAngle}) translate(-60, -60)`);

      // Normal Force (perpendicular to slope)
      const nx = state.contactX + state.forceMag * sin;
      const ny = state.contactY - state.forceMag * cos;
      arrowN.update(state.contactX, state.contactY, nx, ny);

      readout.innerHTML = `
        <div style="color: #e74c3c; font-weight: bold;">Phản lực N = ${state.forceMag.toFixed(1)} N</div>
        <div style="color: #8ea0b8; font-size: 0.9em; margin-top: 5px;">Góc nghiêng \u03B1 = ${state.slopeAngle}\u00B0</div>
        <div style="color: #8ea0b8; font-size: 0.85em; font-style: italic; margin-top: 10px;">
          * Liên kết tựa trơn chỉ có một phản lực pháp tuyến hướng vào vật.
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('Góc nghiêng \u03B1', 0, 60, 1, (v) => {
      state.slopeAngle = v;
      updateVisuals();
    }, state.slopeAngle);

    ui.addSlider('Độ lớn phản lực N', 50, 200, 1, (v) => {
      state.forceMag = v;
      updateVisuals();
    }, state.forceMag);

    // 7. Start
    updateVisuals();
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowN]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-3-1', {
      chapter: 1,
      type: 'statics',
      title: 'Liên kết tựa trơn',
      hint: 'Khám phá phản lực tại điểm tiếp xúc của vật trên bề mặt trơn.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-3-1'] = init;
})();
