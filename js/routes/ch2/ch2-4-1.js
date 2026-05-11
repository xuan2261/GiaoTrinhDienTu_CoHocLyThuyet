/**
 * ch2-4-1: Chuyển động phức hợp điểm (Point moving on a rotating disk)
 * Composition of motion: Point M moving radially on a rotating disk.
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
      originX: 250,
      originY: 220,
      flipY: false 
    });

    const ui = new SimUI(uiPanel);
    
    // 3. State
    let state = {
      omega: 1.0,
      vr_mag: 50,
      radius: 0,
      theta: 0,
      Rdisk: 150
    };

    // 4. SVG Primitives
    // Disk
    const disk = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    disk.setAttribute('cx', '250');
    disk.setAttribute('cy', '220');
    disk.setAttribute('r', state.Rdisk);
    disk.setAttribute('fill', 'rgba(201, 150, 58, 0.05)');
    disk.setAttribute('stroke', 'rgba(201, 150, 58, 0.3)');
    disk.setAttribute('stroke-width', '2');
    svg.appendChild(disk);

    // Radial guide (rotating line)
    const radialGuide = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    radialGuide.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    radialGuide.setAttribute('stroke-width', '1');
    radialGuide.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(radialGuide);

    // Point M
    const pointM = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointM.setAttribute('r', '6');
    pointM.setAttribute('fill', '#ff4444');
    pointM.setAttribute('stroke', '#fff');
    pointM.setAttribute('stroke-width', '2');
    svg.appendChild(pointM);

    // Velocity Arrows
    const arrowVr = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 2, label: 'vr' });
    const arrowVe = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2, label: 've' });
    const arrowVa = SimV2Primitives.createArrow(svg, { color: '#ffcc00', strokeWidth: 3, label: 'va' });

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
      // Update state
      state.theta += state.omega * (dt / 1000);
      state.radius += state.vr_mag * (dt / 1000);
      
      // Ping-pong radius for continuous motion
      if (state.radius > state.Rdisk) state.radius = 0;
      if (state.radius < 0) state.radius = state.Rdisk;

      const cosT = Math.cos(state.theta);
      const sinT = Math.sin(state.theta);

      // Position M
      const mx = 250 + state.radius * cosT;
      const my = 220 + state.radius * sinT;

      pointM.setAttribute('cx', mx);
      pointM.setAttribute('cy', my);

      radialGuide.setAttribute('x1', '250');
      radialGuide.setAttribute('y1', '220');
      radialGuide.setAttribute('x2', 250 + state.Rdisk * cosT);
      radialGuide.setAttribute('y2', 220 + state.Rdisk * sinT);

      // Velocities
      // vr (relative): along the radial line
      const vrx = state.vr_mag * cosT;
      const vry = state.vr_mag * sinT;

      // ve (transport): perpendicular to radial line, magnitude omega * r
      const ve_mag = state.omega * state.radius;
      const vex = -ve_mag * sinT;
      const vey = ve_mag * cosT;

      // va (absolute): sum
      const vax = vrx + vex;
      const vay = vry + vey;

      const scale = 0.8;
      arrowVr.update(mx, my, mx + vrx * scale, my + vry * scale);
      arrowVe.update(mx, my, mx + vex * scale, my + vey * scale);
      arrowVa.update(mx, my, mx + vax * scale, my + vay * scale);

      // Readout
      readout.innerHTML = `
        <div style="color: #44ff44">v_r (Tương đối) = ${state.vr_mag.toFixed(1)}</div>
        <div style="color: #3498db">v_e (Kéo theo) = \u03C9.r = ${ve_mag.toFixed(1)}</div>
        <div style="color: #ffcc00">v_a (Tuyệt đối) = \u221A(v_r\u00B2 + v_e\u00B2) = ${Math.sqrt(vax*vax + vay*vay).toFixed(1)}</div>
        <div style="color: #8ea0b8; margin-top: 10px;">r = ${state.radius.toFixed(1)} px</div>
        <div style="color: #8ea0b8;">\u03C9 = ${state.omega.toFixed(2)} rad/s</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Vận tốc góc (\u03C9)', -5, 5, 0.1, (v) => {
      state.omega = v;
    }, state.omega);

    ui.addSlider('Vận tốc tương đối (v_r)', 0, 100, 1, (v) => {
      state.vr_mag = v;
    }, state.vr_mag);

    ui.addButton('Reset Vị trí', () => {
      state.radius = 0;
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
        SimV2Disposal.dispose([arrowVr, arrowVe, arrowVa]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-4-1', {
      chapter: 2,
      type: 'kinematics',
      title: 'Chuyển động phức hợp điểm',
      hint: 'Điểm M chuyển động dọc theo thanh quay. Vận tốc tuyệt đối là tổng vector của vận tốc tương đối và vận tốc kéo theo.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-4-1'] = init;
})();
