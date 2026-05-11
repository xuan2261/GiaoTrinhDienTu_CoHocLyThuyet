/**
 * ch2-5-1: Chuyển động song phẳng (Rolling without slipping)
 * Plane motion: A wheel rolling on a flat surface without slipping.
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
      originX: 0,
      originY: 220,
      flipY: false 
    });

    const ui = new SimUI(uiPanel);
    
    // 3. State
    let state = {
      omega: 1.5,
      radius: 60,
      theta: 0,
      cx: 100,
      cy: 220
    };

    // 4. SVG Primitives
    // Ground
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '0');
    ground.setAttribute('y1', state.cy + state.radius);
    ground.setAttribute('x2', '500');
    ground.setAttribute('y2', state.cy + state.radius);
    ground.setAttribute('stroke', '#8ea0b8');
    ground.setAttribute('stroke-width', '2');
    svg.appendChild(ground);

    // Wheel
    const wheelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(wheelGroup);

    const wheelCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    wheelCircle.setAttribute('r', state.radius);
    wheelCircle.setAttribute('fill', 'rgba(201, 150, 58, 0.1)');
    wheelCircle.setAttribute('stroke', '#c9963a');
    wheelCircle.setAttribute('stroke-width', '3');
    wheelGroup.appendChild(wheelCircle);

    // Spokes
    for (let i = 0; i < 8; i++) {
      const spoke = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const ang = (i / 8) * Math.PI * 2;
      spoke.setAttribute('x1', '0');
      spoke.setAttribute('y1', '0');
      spoke.setAttribute('x2', state.radius * Math.cos(ang));
      spoke.setAttribute('y2', state.radius * Math.sin(ang));
      spoke.setAttribute('stroke', 'rgba(201, 150, 58, 0.5)');
      spoke.setAttribute('stroke-width', '1');
      wheelGroup.appendChild(spoke);
    }

    // Velocity Arrows
    const arrowVo = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2, label: 'vO' });
    const arrowVa = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 2, label: 'vA' });
    const arrowVp = SimV2Primitives.createArrow(svg, { color: '#ff4444', strokeWidth: 2, label: 'vP' });

    // 5. Result Readout
    const readout = document.createElement('div');
    readout.setAttribute('class', 'sim-readout-v2');
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    readout.style.fontFamily = 'monospace';
    uiPanel.appendChild(readout);

    function update(dt) {
      const dtSec = dt / 1000;
      
      // Update state: s = R * theta => ds = R * dtheta
      state.theta += state.omega * dtSec;
      const ds = state.radius * state.omega * dtSec;
      state.cx += ds;
      
      if (state.cx > 440) state.cx = 60;

      // Update wheel transform
      wheelGroup.setAttribute('transform', `translate(${state.cx}, ${state.cy}) rotate(${state.theta * 180 / Math.PI})`);

      // Points: Center O, Top A, Contact P
      const ox = state.cx, oy = state.cy;
      const ax = state.cx, ay = state.cy - state.radius;
      const px = state.cx, py = state.cy + state.radius;

      // Velocities
      const vo = state.omega * state.radius;
      const va = 2 * vo;
      const vp = 0;

      const scale = 0.5;
      arrowVo.update(ox, oy, ox + vo * scale, oy);
      arrowVa.update(ax, ay, ax + va * scale, ay);
      // vP is 0, so arrow is just a dot or we hide it
      arrowVp.update(px, py, px, py);

      // Readout
      readout.innerHTML = `
        <div style="color: #3498db">v_O (Tâm) = \u03C9R = ${vo.toFixed(1)}</div>
        <div style="color: #44ff44">v_A (Đỉnh) = 2\u03C9R = ${va.toFixed(1)}</div>
        <div style="color: #ff4444">v_P (Tiếp xúc) = 0 (IC)</div>
        <div style="color: #8ea0b8; margin-top: 10px;">\u03C9 = ${state.omega.toFixed(2)} rad/s</div>
        <div style="color: #8ea0b8;">R = ${state.radius} px</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Vận tốc góc (\u03C9)', -5, 5, 0.1, (v) => {
      state.omega = v;
    }, state.omega);

    ui.addButton('Reset', () => {
      state.cx = 60;
      state.theta = 0;
    });

    // 7. Loop / Start
    engine.tick = (time) => {
      if (!engine.isRunning) return;
      let delta = time - engine.lastTime;
      engine.lastTime = time;
      if (delta > 100) delta = 100;
      update(delta);
      requestAnimationFrame(engine.tick);
    };
    engine.start();

    // 8. Disposal
    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([arrowVo, arrowVa, arrowVp]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-5-1', {
      chapter: 2,
      type: 'kinematics',
      title: 'Chuyển động song phẳng (Lăn không trượt)',
      hint: 'Khi bánh xe lăn không trượt, vận tốc tại điểm tiếp xúc bằng 0 (Tâm vận tốc tức thời IC).'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-5-1'] = init;
})();
