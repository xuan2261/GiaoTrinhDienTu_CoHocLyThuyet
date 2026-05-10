/**
 * ch2-7-2: Plane Motion (Lăn không trượt - Rolling without slipping)
 * IC is at the contact point. v_CM = ω * R.
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
    canvasArea.style.flex = '0 0 500px';
    canvasArea.style.position = 'relative';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 440');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.className = 'sim-svg-v2';
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

    const engine = new SimulationEngine({ gravity: 0, viewHeight: 440, originX: 0, originY: 0, flipY: false });
    const ui = new SimUI(uiPanel);
    
    let state = { omega: 1.5, R: 60, x_cm: 100, angle: 0 };

    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '0'); ground.setAttribute('y1', '260');
    ground.setAttribute('x2', '500'); ground.setAttribute('y2', '260');
    ground.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
    ground.setAttribute('stroke-width', '2');
    svg.appendChild(ground);

    const wheelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(wheelGroup);

    const wheel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    wheel.setAttribute('r', state.R);
    wheel.setAttribute('fill', 'rgba(201, 150, 58, 0.1)');
    wheel.setAttribute('stroke', '#c9963a');
    wheel.setAttribute('stroke-width', '3');
    wheelGroup.appendChild(wheel);

    // Spokes
    for (let i = 0; i < 6; i++) {
      const spoke = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const ang = (i / 6) * Math.PI * 2;
      spoke.setAttribute('x1', '0'); spoke.setAttribute('y1', '0');
      spoke.setAttribute('x2', state.R * Math.cos(ang)); spoke.setAttribute('y2', state.R * Math.sin(ang));
      spoke.setAttribute('stroke', 'rgba(201, 150, 58, 0.4)');
      spoke.setAttribute('stroke-width', '1.5');
      wheelGroup.appendChild(spoke);
    }

    const icCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    icCircle.setAttribute('r', '5'); icCircle.setAttribute('fill', '#e74c3c');
    icCircle.setAttribute('stroke', '#fff');
    svg.appendChild(icCircle);

    const icText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    icText.setAttribute('fill', '#e74c3c'); icText.setAttribute('font-weight', 'bold');
    icText.textContent = 'IC';
    svg.appendChild(icText);

    // Points for velocity display
    const pts = [
      { x: 0, y: 0, label: 'v_CM', color: '#3498db' },
      { x: 0, y: -state.R, label: 'v_top', color: '#3498db' },
      { x: state.R, y: 0, label: 'v_front', color: '#3498db' }
    ];
    const arrows = pts.map(p => SimV2Primitives.createArrow(svg, { color: p.color, label: p.label }));

    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function update(dt) {
      const v_cm = state.omega * state.R;
      state.angle += state.omega * (dt / 1000);
      state.x_cm += v_cm * (dt / 1000);
      
      // Loop around
      if (state.x_cm > 500 + state.R) state.x_cm = -state.R;
      if (state.x_cm < -state.R) state.x_cm = 500 + state.R;

      const cy = 260 - state.R;
      wheelGroup.setAttribute('transform', `translate(${state.x_cm}, ${cy}) rotate(${state.angle * 180 / Math.PI})`);

      // IC is at contact point
      const icx = state.x_cm;
      const icy = 260;
      icCircle.setAttribute('cx', icx); icCircle.setAttribute('cy', icy);
      icText.setAttribute('x', icx + 10); icText.setAttribute('y', icy + 15);

      pts.forEach((p, i) => {
        // Current position of point in world coords
        // Points are defined relative to CM in rotating frame
        const cosA = Math.cos(state.angle);
        const sinA = Math.sin(state.angle);
        const wx = state.x_cm + p.x * cosA - p.y * sinA;
        const wy = cy + p.x * sinA + p.y * cosA;

        // Velocity v = omega x r_IC
        const rx = wx - icx;
        const ry = wy - icy;
        const vx = -state.omega * ry;
        const vy = state.omega * rx;

        const vs = 0.5;
        arrows[i].update(wx, wy, wx + vx * vs, wy + vy * vs);
      });

      readout.innerHTML = `
        <div style="color: #c9963a">Lăn không trượt (Rolling)</div>
        <div style="color: #3498db; margin-top: 10px;">v_CM = \u03C9.R = ${Math.abs(v_cm).toFixed(1)} px/s</div>
        <div style="color: #e74c3c">v_IC = 0 (Điểm tiếp xúc)</div>
        <div style="color: #8ea0b8; margin-top: 10px;">\u03C9 = ${state.omega.toFixed(2)} rad/s</div>
        <div style="color: #8ea0b8;">R = ${state.R} px</div>
      `;
    }

    ui.addSlider('Vận tốc góc (\u03C9)', -5, 5, 0.1, v => state.omega = v, state.omega);

    engine.tick = (time) => {
      if (!engine.isRunning) return;
      let delta = time - engine.lastTime;
      engine.lastTime = time;
      update(Math.min(delta, 100));
      requestAnimationFrame(engine.tick);
    };
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose(arrows);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-7-2', {
      chapter: 2, type: 'kinematics', title: 'Bài tập thực hành (Lăn không trượt)',
      hint: 'Trong chuyển động lăn không trượt, tâm vận tốc tức thời nằm tại điểm tiếp xúc với mặt nền.'
    });
  }
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-7-2'] = init;
})();
