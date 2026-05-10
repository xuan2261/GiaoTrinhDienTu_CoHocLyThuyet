/**
 * ch2-6-2: Carry-Along Velocity (Vận tốc kéo theo)
 * v_e = ω × r
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

    const engine = new SimulationEngine({ gravity: 0, viewHeight: 440, originX: 250, originY: 220, flipY: false });
    const ui = new SimUI(uiPanel);
    
    let state = { omega: 1.2, r: 100, theta: 0 };

    const disk = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    disk.setAttribute('cx', '250'); disk.setAttribute('cy', '220'); disk.setAttribute('r', '150');
    disk.setAttribute('fill', 'rgba(201, 150, 58, 0.05)');
    disk.setAttribute('stroke', 'rgba(201, 150, 58, 0.2)');
    svg.appendChild(disk);

    const radiusLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    radiusLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
    radiusLine.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(radiusLine);

    const ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball.setAttribute('r', '7'); ball.setAttribute('fill', '#fff');
    ball.setAttribute('stroke', '#c9963a'); ball.setAttribute('stroke-width', '2');
    svg.appendChild(ball);

    const arrowVe = SimV2Primitives.createArrow(svg, { color: '#c9963a', strokeWidth: 2.5, label: 've' });

    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function update(dt) {
      state.theta += state.omega * (dt / 1000);
      
      const cosT = Math.cos(state.theta);
      const sinT = Math.sin(state.theta);
      const px = 250 + state.r * cosT;
      const py = 220 + state.r * sinT;

      ball.setAttribute('cx', px); ball.setAttribute('cy', py);
      radiusLine.setAttribute('x1', '250'); radiusLine.setAttribute('y1', '220');
      radiusLine.setAttribute('x2', px); radiusLine.setAttribute('y2', py);

      // Transport velocity: v_e = omega * r, perpendicular to r
      const ve_mag = state.omega * state.r;
      const vex = -ve_mag * sinT;
      const vey = ve_mag * cosT;

      arrowVe.update(px, py, px + vex * 0.8, py + vey * 0.8);

      readout.innerHTML = `
        <div style="color: #c9963a">Vận tốc kéo theo v_e = \u03C9.r</div>
        <div style="font-size: 1.2em; margin: 10px 0;">|v_e| = ${Math.abs(ve_mag).toFixed(1)} px/s</div>
        <div style="color: #8ea0b8">\u03C9 = ${state.omega.toFixed(2)} rad/s</div>
        <div style="color: #8ea0b8">r = ${state.r.toFixed(0)} px</div>
      `;
    }

    ui.addSlider('Vận tốc góc (\u03C9)', -5, 5, 0.1, v => state.omega = v, state.omega);
    ui.addSlider('Bán kính (r)', 20, 140, 1, v => state.r = v, state.r);

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
        SimV2Disposal.dispose([arrowVe]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-6-2', {
      chapter: 2, type: 'kinematics', title: 'Phân tích chuyển động (Vận tốc kéo theo)',
      hint: 'Vận tốc kéo theo là vận tốc của điểm thuộc hệ quy chiếu động tại vị trí của điểm khảo sát.'
    });
  }
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-6-2'] = init;
})();
