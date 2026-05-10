/**
 * ch2-4-3: Định lý hợp gia tốc (aa = ae + ar + ac)
 * Acceleration addition theorem: Includes Coriolis acceleration ac = 2 * omega x vr.
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
      omega: 1.5,
      epsilon: 0.2, // angular acceleration
      vr_mag: 40,
      ar_mag: 10,   // relative acceleration
      radius: 60,
      theta: 0,
      Rdisk: 150,
      currentOmega: 1.5
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

    // Point M
    const pointM = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pointM.setAttribute('r', '6');
    pointM.setAttribute('fill', '#e74c3c');
    pointM.setAttribute('stroke', '#fff');
    pointM.setAttribute('stroke-width', '2');
    svg.appendChild(pointM);

    // Acceleration Arrows
    const arrowAr = SimV2Primitives.createArrow(svg, { color: '#44ff44', strokeWidth: 2, label: 'ar' });
    const arrowAe = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2, label: 'ae' });
    const arrowAc = SimV2Primitives.createArrow(svg, { color: '#9b59b6', strokeWidth: 2, label: 'ac' });
    const arrowAa = SimV2Primitives.createArrow(svg, { color: '#ffcc00', strokeWidth: 3, label: 'aa' });

    // 5. Result Readout
    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    readout.style.fontFamily = 'monospace';
    uiPanel.appendChild(readout);

    function update(dt) {
      const dtSec = dt / 1000;
      
      // Update state
      state.currentOmega += state.epsilon * dtSec;
      state.theta += state.currentOmega * dtSec;
      state.radius += state.vr_mag * dtSec;
      
      if (state.radius > state.Rdisk) state.radius = 20;

      const cosT = Math.cos(state.theta);
      const sinT = Math.sin(state.theta);

      // Position M
      const mx = 250 + state.radius * cosT;
      const my = 220 + state.radius * sinT;

      pointM.setAttribute('cx', mx);
      pointM.setAttribute('cy', my);

      // Accelerations
      // ar (relative): along the radial line (assuming constant vr for simplicity, or add ar)
      const arx = state.ar_mag * cosT;
      const ary = state.ar_mag * sinT;

      // ae (transport): ae = an_e + at_e
      // an_e (centripetal): toward center, magnitude omega^2 * r
      const ane_mag = state.currentOmega * state.currentOmega * state.radius;
      const anex = -ane_mag * cosT;
      const aney = -ane_mag * sinT;

      // at_e (tangential): perpendicular to radial line, magnitude epsilon * r
      const ate_mag = state.epsilon * state.radius;
      const atex = -ate_mag * sinT;
      const atey = ate_mag * cosT;

      const aex = anex + atex;
      const aey = aney + atey;

      // ac (Coriolis): 2 * omega x vr. Magnitude = 2 * omega * vr
      // Direction: vr rotated by 90 deg in direction of omega
      const ac_mag = 2 * state.currentOmega * state.vr_mag;
      const acx = -ac_mag * sinT;
      const acy = ac_mag * cosT;

      // aa (absolute): sum
      const aax = arx + aex + acx;
      const aay = ary + aey + acy;

      const scale = 0.5;
      arrowAr.update(mx, my, mx + arx * scale, my + ary * scale);
      arrowAe.update(mx, my, mx + aex * scale, my + aey * scale);
      arrowAc.update(mx, my, mx + acx * scale, my + acy * scale);
      arrowAa.update(mx, my, mx + aax * scale, my + aay * scale);

      // Readout
      readout.innerHTML = `
        <div style="color: #44ff44">a_r (Tương đối) = ${state.ar_mag.toFixed(1)}</div>
        <div style="color: #3498db">a_e (Kéo theo) = ${Math.sqrt(aex*aex + aey*aey).toFixed(1)}</div>
        <div style="color: #9b59b6">a_c (Coriolis) = 2\u03C9v_r = ${ac_mag.toFixed(1)}</div>
        <div style="color: #ffcc00; font-weight: bold;">a_a (Tuyệt đối) = ${Math.sqrt(aax*aax + aay*aay).toFixed(1)}</div>
        <div style="color: #8ea0b8; margin-top: 5px;">\u03C9 = ${state.currentOmega.toFixed(2)} rad/s</div>
      `;
    }

    // 6. Controls
    ui.addSlider('Gia tốc góc (\u03B5)', -2, 2, 0.1, (v) => {
      state.epsilon = v;
    }, state.epsilon);

    ui.addSlider('Vận tốc tương đối (v_r)', 0, 100, 1, (v) => {
      state.vr_mag = v;
    }, state.vr_mag);

    ui.addButton('Reset', () => {
      state.radius = 20;
      state.theta = 0;
      state.currentOmega = state.omega;
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
        SimV2Disposal.dispose([arrowAr, arrowAe, arrowAc, arrowAa]);
        host.innerHTML = '';
      }
    };
  }

  // Register simulation
  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-4-3', {
      chapter: 2,
      type: 'kinematics',
      title: 'Định lý hợp gia tốc',
      hint: 'Gia tốc tuyệt đối a_a bao gồm gia tốc kéo theo a_e, gia tốc tương đối a_r và gia tốc Coriolis a_c.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-4-3'] = init;
})();
