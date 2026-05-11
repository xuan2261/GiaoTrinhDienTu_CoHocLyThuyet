/**
 * ch2-5-4: Cơ cấu 4 khâu bản lề (Four-bar linkage mechanism)
 * Robust kinematic simulation of a four-bar linkage.
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
      originX: 150,
      originY: 250,
      flipY: false 
    });

    const ui = new SimUI(uiPanel);
    
    // 3. Link Lengths (Grashof: s + l <= p + q)
    let state = {
      a: 60,   // Crank
      b: 150,  // Coupler
      c: 120,  // Rocker
      d: 140,  // Ground (Distance between A and D)
      omega: 1.5,
      theta: 0
    };

    // 4. SVG Primitives
    const linkA = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linkA.setAttribute('stroke', '#ff4444');
    linkA.setAttribute('stroke-width', '4');
    svg.appendChild(linkA);

    const linkB = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linkB.setAttribute('stroke', '#44ff44');
    linkB.setAttribute('stroke-width', '4');
    svg.appendChild(linkB);

    const linkC = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linkC.setAttribute('stroke', '#3498db');
    linkC.setAttribute('stroke-width', '4');
    svg.appendChild(linkC);

    const linkD = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linkD.setAttribute('stroke', 'rgba(232, 236, 241, 0.2)');
    linkD.setAttribute('stroke-width', '2');
    linkD.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(linkD);

    const joints = [];
    for (let i = 0; i < 4; i++) {
      const joint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      joint.setAttribute('r', '6');
      joint.setAttribute('fill', '#fff');
      joint.setAttribute('stroke', '#c9963a');
      joint.setAttribute('stroke-width', '2');
      svg.appendChild(joint);
      joints.push(joint);
    }

    // 5. Kinematic Solver (Freudenstein's or Geometric)
    function solve(theta) {
      const { a, b, c, d } = state;
      const ox = 150, oy = 250;
      
      // Point A (Origin)
      const Ax = ox, Ay = oy;
      
      // Point B (Crank end)
      const Bx = Ax + a * Math.cos(theta);
      const By = Ay + a * Math.sin(theta);
      
      // Point D (Ground fixed)
      const Dx = Ax + d;
      const Dy = Ay;
      
      // Distance BD
      const distBD = Math.hypot(Dx - Bx, Dy - By);
      
      if (distBD > b + c || distBD < Math.abs(b - c)) {
        // Unreachable configuration
        return null;
      }
      
      // Intersection of two circles (Center B, radius b; Center D, radius c)
      // Angle alpha = angle of BD relative to horizontal
      const alpha = Math.atan2(Dy - By, Dx - Bx);
      
      // Angle beta = angle between BD and link b (law of cosines)
      const beta = Math.acos((distBD * distBD + b * b - c * c) / (2 * distBD * b));
      
      // Point C
      const Cx = Bx + b * Math.cos(alpha - beta); // One of two possible branches
      const Cy = By + b * Math.sin(alpha - beta);
      
      return { Ax, Ay, Bx, By, Cx, Cy, Dx, Dy };
    }

    function update(dt) {
      state.theta += state.omega * (dt / 1000);
      
      const res = solve(state.theta);
      if (!res) {
        state.omega = -state.omega; // Reverse if stuck
        return;
      }

      linkA.setAttribute('x1', res.Ax); linkA.setAttribute('y1', res.Ay);
      linkA.setAttribute('x2', res.Bx); linkA.setAttribute('y2', res.By);

      linkB.setAttribute('x1', res.Bx); linkB.setAttribute('y1', res.By);
      linkB.setAttribute('x2', res.Cx); linkB.setAttribute('y2', res.Cy);

      linkC.setAttribute('x1', res.Cx); linkC.setAttribute('y1', res.Cy);
      linkC.setAttribute('x2', res.Dx); linkC.setAttribute('y2', res.Dy);

      linkD.setAttribute('x1', res.Ax); linkD.setAttribute('y1', res.Ay);
      linkD.setAttribute('x2', res.Dx); linkD.setAttribute('y2', res.Dy);

      joints[0].setAttribute('cx', res.Ax); joints[0].setAttribute('cy', res.Ay);
      joints[1].setAttribute('cx', res.Bx); joints[1].setAttribute('cy', res.By);
      joints[2].setAttribute('cx', res.Cx); joints[2].setAttribute('cy', res.Cy);
      joints[3].setAttribute('cx', res.Dx); joints[3].setAttribute('cy', res.Dy);
    }

    // 6. Controls
    ui.addSlider('Vận tốc góc (\u03C9)', -5, 5, 0.1, (v) => {
      state.omega = v;
    }, state.omega);

    ui.addSlider('Chiều dài Crank (a)', 20, 100, 1, (v) => {
      state.a = v;
    }, state.a);

    ui.addSlider('Chiều dài Coupler (b)', 50, 200, 1, (v) => {
      state.b = v;
    }, state.b);

    ui.addSlider('Chiều dài Rocker (c)', 50, 200, 1, (v) => {
      state.c = v;
    }, state.c);

    // 7. Loop
    engine.tick = (time) => {
      if (!engine.isRunning) return;
      let delta = time - engine.lastTime;
      engine.lastTime = time;
      if (delta > 100) delta = 100;
      update(delta);
      requestAnimationFrame(engine.tick);
    };
    engine.start();

    return {
      dispose: () => {
        engine.stop();
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-5-4', {
      chapter: 2,
      type: 'kinematics',
      title: 'Cơ cấu 4 khâu bản lề',
      hint: 'Cơ cấu biến đổi chuyển động quay thành chuyển động lắc hoặc quay khác tùy thuộc vào chiều dài các khâu.'
    });
  }
  
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-5-4'] = init;
})();
