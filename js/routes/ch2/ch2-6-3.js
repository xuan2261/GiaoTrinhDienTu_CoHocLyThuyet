/**
 * ch2-6-3: Coriolis Acceleration (Gia tốc Coriolis)
 * a_C = 2 * ω × v_rel
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
    
    let state = { omega: 1.0, r_base: 80, r_amp: 40, r_freq: 0.5, theta: 0, t: 0 };

    const disk = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    disk.setAttribute('cx', '250'); disk.setAttribute('cy', '220'); disk.setAttribute('r', '150');
    disk.setAttribute('fill', 'rgba(201, 150, 58, 0.05)');
    disk.setAttribute('stroke', 'rgba(201, 150, 58, 0.2)');
    svg.appendChild(disk);

    const ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball.setAttribute('r', '7'); ball.setAttribute('fill', '#fff');
    ball.setAttribute('stroke', '#e74c3c'); ball.setAttribute('stroke-width', '2');
    svg.appendChild(ball);

    const arrowVrel = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2, label: 'v_rel' });
    const arrowAc = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 2.5, label: 'ac' });

    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function update(dt) {
      state.t += dt / 1000;
      state.theta += state.omega * (dt / 1000);
      
      // Radius oscillates: r = base + amp * sin(freq * t)
      const r = state.r_base + state.r_amp * Math.sin(state.r_freq * state.t);
      const vr = state.r_amp * state.r_freq * Math.cos(state.r_freq * state.t);

      const cosT = Math.cos(state.theta);
      const sinT = Math.sin(state.theta);
      const px = 250 + r * cosT;
      const py = 220 + r * sinT;

      ball.setAttribute('cx', px); ball.setAttribute('cy', py);

      // Relative velocity: radial
      const vrx = vr * cosT;
      const vry = vr * sinT;

      // Coriolis acceleration: a_c = 2 * omega * v_r, tangential
      const ac_mag = 2 * state.omega * vr;
      const acx = -ac_mag * sinT;
      const acy = ac_mag * cosT;

      const scale = 1.5;
      arrowVrel.update(px, py, px + vrx * scale, py + vry * scale);
      arrowAc.update(px, py, px + acx * scale, py + acy * scale);

      readout.innerHTML = `
        <div style="color: #3498db">v_rel (Tương đối) = ${vr.toFixed(1)} px/s</div>
        <div style="color: #e74c3c">a_c (Coriolis) = 2\u03C9v_rel = ${Math.abs(ac_mag).toFixed(1)} px/s\u00B2</div>
        <div style="color: #8ea0b8; margin-top: 10px;">\u03C9 = ${state.omega.toFixed(2)} rad/s</div>
        <div style="color: #8ea0b8;">r = ${r.toFixed(1)} px</div>
      `;
    }

    ui.addSlider('Vận tốc góc (\u03C9)', -5, 5, 0.1, v => state.omega = v, state.omega);
    ui.addSlider('Tần số dao động r', 0.1, 2.0, 0.1, v => state.r_freq = v, state.r_freq);

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
        SimV2Disposal.dispose([arrowVrel, arrowAc]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-6-3', {
      chapter: 2, type: 'kinematics', title: 'Gia tốc Coriolis (Mở rộng)',
      hint: 'Gia tốc Coriolis phụ thuộc vào vận tốc tương đối và vận tốc góc của hệ quy chiếu.'
    });
  }
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-6-3'] = init;
})();
