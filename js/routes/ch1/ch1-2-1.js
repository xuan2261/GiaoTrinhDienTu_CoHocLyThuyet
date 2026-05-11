/**
 * Ch1-2-1: Two-Force Equilibrium
 * Condition for two forces to be in equilibrium: collinear, equal magnitude, opposite direction.
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
    const engine = new SimulationEngine({ 
      gravity: 0,
      viewHeight: 440,
      originX: 380,
      originY: 220,
      flipY: false 
    });

    const ui = new SimUI(uiPanel);
    
    // 3. State
    let state = {
      p1: { x: -100, y: -50 },
      p2: { x: 100, y: 50 },
      f1Mag: 100,
      f2Mag: 100,
      f1Angle: 180,
      f2Angle: 0
    };

    // 4. SVG Primitives
    // Rigid Body (Generic Shape)
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    body.setAttribute('d', 'M -150 -80 Q -180 0 -150 80 Q 0 110 150 80 Q 180 0 150 -80 Q 0 -110 -150 -80 Z');
    body.setAttribute('fill', 'rgba(142, 160, 184, 0.2)');
    body.setAttribute('stroke', '#8ea0b8');
    body.setAttribute('stroke-width', '2');
    body.setAttribute('transform', 'translate(380, 220)');
    svg.appendChild(body);

    // Line of Action (Connecting P1 and P2)
    const loa = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    loa.setAttribute('stroke', 'rgba(201, 150, 58, 0.3)');
    loa.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(loa);

    // Points
    const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot1.setAttribute('r', '5');
    dot1.setAttribute('fill', '#fff');
    svg.appendChild(dot1);

    const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot2.setAttribute('r', '5');
    dot2.setAttribute('fill', '#fff');
    svg.appendChild(dot2);

    // Force Arrows
    const arrow1 = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 2.5 });
    const arrow2 = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 2.5 });

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
      const ox = 380, oy = 220;
      
      const s1x = ox + state.p1.x;
      const s1y = oy + state.p1.y;
      const s2x = ox + state.p2.x;
      const s2y = oy + state.p2.y;

      dot1.setAttribute('cx', s1x);
      dot1.setAttribute('cy', s1y);
      dot2.setAttribute('cx', s2x);
      dot2.setAttribute('cy', s2y);

      loa.setAttribute('x1', s1x - (s2x-s1x)*2);
      loa.setAttribute('y1', s1y - (s2y-s1y)*2);
      loa.setAttribute('x2', s2x + (s2x-s1x)*2);
      loa.setAttribute('y2', s2y + (s2y-s1y)*2);

      const rad1 = state.f1Angle * Math.PI / 180;
      const rad2 = state.f2Angle * Math.PI / 180;

      arrow1.update(s1x, s1y, s1x + Math.cos(rad1) * state.f1Mag, s1y + Math.sin(rad1) * state.f1Mag);
      arrow2.update(s2x, s2y, s2x + Math.cos(rad2) * state.f2Mag, s2y + Math.sin(rad2) * state.f2Mag);

      // Check conditions
      const magEqual = Math.abs(state.f1Mag - state.f2Mag) < 1;
      const oppDir = Math.abs(Math.abs(state.f1Angle - state.f2Angle) - 180) < 1 || Math.abs(Math.abs(state.f1Angle - state.f2Angle) + 180) < 1;
      
      // Collinear check: force vector must be parallel to line (P2-P1)
      const dx = state.p2.x - state.p1.x;
      const dy = state.p2.y - state.p1.y;
      const lineAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      const f1Collinear = Math.abs(state.f1Angle % 180 - lineAngle % 180) < 1 || Math.abs(Math.abs(state.f1Angle % 180 - lineAngle % 180) - 180) < 1;
      
      const isBalanced = magEqual && oppDir && f1Collinear;

      // Readout
      readout.innerHTML = `
        <div style="color: #8ea0b8; font-weight: bold; margin-bottom: 5px;">KIỂM TRA CÂN BẰNG:</div>
        <div style="color: ${magEqual ? '#44ff44' : '#ff4444'}">1. Cùng độ lớn: ${magEqual ? 'OK' : 'SAI'}</div>
        <div style="color: ${oppDir ? '#44ff44' : '#ff4444'}">2. Ngược chiều: ${oppDir ? 'OK' : 'SAI'}</div>
        <div style="color: ${f1Collinear ? '#44ff44' : '#ff4444'}">3. Cùng đường tác dụng: ${f1Collinear ? 'OK' : 'SAI'}</div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
        <div style="text-align: center; font-weight: bold; color: ${isBalanced ? '#44ff44' : '#ff4444'}">
          ${isBalanced ? 'VẬT CÂN BẰNG' : 'VẬT KHÔNG CÂN BẰNG'}
        </div>
      `;
    }

    // 6. Controls
    ui.addSlider('F1 Magnitude', 50, 200, 1, (v) => { state.f1Mag = v; updateVisuals(); }, state.f1Mag);
    ui.addSlider('F1 Angle', 0, 360, 1, (v) => { state.f1Angle = v; updateVisuals(); }, state.f1Angle);
    ui.addSlider('F2 Magnitude', 50, 200, 1, (v) => { state.f2Mag = v; updateVisuals(); }, state.f2Mag);
    ui.addSlider('F2 Angle', 0, 360, 1, (v) => { state.f2Angle = v; updateVisuals(); }, state.f2Angle);
    
    ui.addButton('Snap to Balanced', () => {
      const dx = state.p2.x - state.p1.x;
      const dy = state.p2.y - state.p1.y;
      const lineAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      state.f1Mag = 100;
      state.f2Mag = 100;
      state.f1Angle = lineAngle + 180;
      state.f2Angle = lineAngle;
      updateVisuals();
    });

    // 7. Start
    updateVisuals();
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrow1, arrow2]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-2-1', {
      chapter: 1,
      type: 'statics',
      title: 'Cân bằng vật chịu hai lực',
      hint: 'Điều chỉnh các lực để thỏa mãn điều kiện cân bằng của vật chịu tác dụng của hai lực.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-2-1'] = init;
})();
