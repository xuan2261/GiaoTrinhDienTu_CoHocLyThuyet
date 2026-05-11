/**
 * ch2-4-4: Coriolis Acceleration (Gia tốc Coriolis)
 * a_c = 2 * ω × v_r
 */
(function() {
  'use strict';

  function init(host) {
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

    const engine = new SimulationEngine({ gravity: 0, viewHeight: 440, originX: 250, originY: 220, flipY: false });
    const ui = new SimUI(uiPanel);
    
    let state = { omega: 1.0, vr: 40, r: 80, theta: 0, Rdisk: 150 };

    // SVG Elements
    const disk = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    disk.setAttribute('cx', '250'); disk.setAttribute('cy', '220'); disk.setAttribute('r', state.Rdisk);
    disk.setAttribute('fill', 'rgba(201, 150, 58, 0.05)');
    disk.setAttribute('stroke', 'rgba(201, 150, 58, 0.3)');
    disk.setAttribute('stroke-width', '2');
    svg.appendChild(disk);

    // Grid lines for the disk
    for (let a = 0; a < 360; a += 45) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', 'rgba(201, 150, 58, 0.1)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('class', 'disk-spoke');
      svg.appendChild(line);
    }

    const pointM = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointM.setAttribute('r', '6'); pointM.setAttribute('fill', '#e74c3c');
    pointM.setAttribute('stroke', '#fff'); pointM.setAttribute('stroke-width', '2');
    svg.appendChild(pointM);

    const arrowVr = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2, label: 'vr' });
    const arrowAc = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 3, label: 'ac' });

    const readout = document.createElement('div');
    readout.setAttribute('class', 'sim-readout-v2');
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function update(dt) {
      state.theta += state.omega * (dt / 1000);
      state.r += state.vr * (dt / 1000);
      if (state.r > state.Rdisk) state.r = 0;
      if (state.r < 0) state.r = state.Rdisk;

      const cosT = Math.cos(state.theta);
      const sinT = Math.sin(state.theta);
      const mx = 250 + state.r * cosT;
      const my = 220 + state.r * sinT;

      pointM.setAttribute('cx', mx);
      pointM.setAttribute('cy', my);

      const spokes = svg.querySelectorAll('.disk-spoke');
      spokes.forEach((line, i) => {
        const ang = state.theta + (i * Math.PI / 4);
        line.setAttribute('x1', '250'); line.setAttribute('y1', '220');
        line.setAttribute('x2', 250 + state.Rdisk * Math.cos(ang));
        line.setAttribute('y2', 220 + state.Rdisk * Math.sin(ang));
      });

      // Coriolis: a_c = 2 * omega * v_r (magnitude)
      // Direction: v_r is radial, so a_c is tangential
      const vrx = state.vr * cosT;
      const vry = state.vr * sinT;
      const ac_mag = 2 * state.omega * state.vr;
      const acx = -ac_mag * sinT;
      const acy = ac_mag * cosT;

      arrowVr.update(mx, my, mx + vrx * 0.8, my + vry * 0.8);
      arrowAc.update(mx, my, mx + acx * 0.8, my + acy * 0.8);

      readout.innerHTML = `
        <div style="color: #3498db">v_r = ${state.vr.toFixed(1)} px/s</div>
        <div style="color: #e74c3c">a_c = 2\u03C9v_r = ${ac_mag.toFixed(1)} px/s\u00B2</div>
        <div style="color: #8ea0b8; margin-top: 5px;">\u03C9 = ${state.omega.toFixed(2)} rad/s</div>
        <div style="color: #8ea0b8;">r = ${state.r.toFixed(1)} px</div>
      `;
    }

    ui.addSlider('Vận tốc góc (\u03C9)', -5, 5, 0.1, v => state.omega = v, state.omega);
    ui.addSlider('Vận tốc tương đối (v_r)', -100, 100, 1, v => state.vr = v, state.vr);
    ui.addButton('Reset', () => { state.r = 0; state.theta = 0; });

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
        SimV2Disposal.dispose([arrowVr, arrowAc]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-4-4', {
      chapter: 2, type: 'kinematics', title: 'Gia tốc Coriolis',
      hint: 'Gia tốc Coriolis xuất hiện khi một điểm chuyển động tương đối trong một hệ quy chiếu đang quay.'
    });
  }
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-4-4'] = init;
})();
