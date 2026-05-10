/**
 * Ch1-3-2: Tension (Liên kết dây mềm)
 * Cable tension: force directed along the cable.
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
    const engine = new SimulationEngine({ gravity: 0 });
    const ui = new SimUI(uiPanel);
    
    // 3. State
    let state = {
      ax: 150, ay: 100, // Anchor
      lx: 450, ly: 300, // Load
      weight: 150
    };

    // 4. SVG Elements
    // Wall
    const wall = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    wall.setAttribute('x', '130');
    wall.setAttribute('y', '50');
    wall.setAttribute('width', '40');
    wall.setAttribute('height', '100');
    wall.setAttribute('fill', '#7f8c8d');
    svg.appendChild(wall);

    // Cable
    const cable = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    cable.setAttribute('stroke', '#ecf0f1');
    cable.setAttribute('stroke-width', '2');
    svg.appendChild(cable);

    // Points
    const anchorPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    anchorPoint.setAttribute('r', '5');
    anchorPoint.setAttribute('fill', '#fff');
    svg.appendChild(anchorPoint);

    const loadPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    loadPoint.setAttribute('r', '8');
    loadPoint.setAttribute('fill', '#f1c40f');
    svg.appendChild(loadPoint);

    // Arrows
    const arrowT = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 3 });
    const arrowW = SimV2Primitives.createArrow(svg, { color: '#95a5a6', strokeWidth: 2 });

    // 5. Readout
    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function updateVisuals() {
      // Positions
      anchorPoint.setAttribute('cx', state.ax);
      anchorPoint.setAttribute('cy', state.ay);
      loadPoint.setAttribute('cx', state.lx);
      loadPoint.setAttribute('cy', state.ly);

      cable.setAttribute('x1', state.ax);
      cable.setAttribute('y1', state.ay);
      cable.setAttribute('x2', state.lx);
      cable.setAttribute('y2', state.ly);

      // Tension T (along cable)
      const dx = state.ax - state.lx;
      const dy = state.ay - state.ly;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const ux = dx / dist;
      const uy = dy / dist;

      // In equilibrium for a single vertical weight, T = W / cos(theta) if held by other forces
      // Here we just demonstrate the direction.
      const Tmag = state.weight / Math.abs(uy) || state.weight;
      arrowT.update(state.lx, state.ly, state.lx + ux * Tmag * 0.8, state.ly + uy * Tmag * 0.8);

      // Weight W (downward)
      arrowW.update(state.lx, state.ly, state.lx, state.ly + state.weight * 0.6);

      readout.innerHTML = `
        <div style="color: #3498db; font-weight: bold;">Lực căng T = ${Tmag.toFixed(1)} N</div>
        <div style="color: #95a5a6;">Trọng lượng W = ${state.weight.toFixed(1)} N</div>
        <div style="color: #8ea0b8; font-size: 0.85em; font-style: italic; margin-top: 10px;">
          * Phản lực dây mềm luôn hướng dọc theo dây và hướng ra khỏi vật đang xét.
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('Tải trọng W', 50, 200, 1, (v) => {
      state.weight = v;
      updateVisuals();
    }, state.weight);

    ui.addSlider('Vị trí tải X', 250, 650, 1, (v) => {
      state.lx = v;
      updateVisuals();
    }, state.lx);

    ui.addSlider('Vị trí tải Y', 150, 380, 1, (v) => {
      state.ly = v;
      updateVisuals();
    }, state.ly);

    // 7. Start
    updateVisuals();
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowT, arrowW]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-3-2', {
      chapter: 1,
      type: 'statics',
      title: 'Liên kết dây mềm',
      hint: 'Quan sát hướng của lực căng dây khi thay đổi vị trí tải trọng.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-3-2'] = init;
})();
