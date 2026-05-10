/**
 * ch2-7-1: Instant Center (Tâm vận tốc tức thời - IC)
 * v = ω × r_IC
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
    
    let state = { omega: 1.2, t: 0, angle: 0, ic: { x: 150, y: 300 } };

    const bodyGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(bodyGroup);

    const bodyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bodyRect.setAttribute('width', '160'); bodyRect.setAttribute('height', '60');
    bodyRect.setAttribute('x', '-80'); bodyRect.setAttribute('y', '-30');
    bodyRect.setAttribute('fill', 'rgba(201, 150, 58, 0.1)');
    bodyRect.setAttribute('stroke', 'rgba(201, 150, 58, 0.5)');
    bodyRect.setAttribute('stroke-width', '2');
    bodyGroup.appendChild(bodyRect);

    const icCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    icCircle.setAttribute('r', '6'); icCircle.setAttribute('fill', '#e74c3c');
    icCircle.setAttribute('stroke', '#fff');
    svg.appendChild(icCircle);

    const icText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    icText.setAttribute('fill', '#e74c3c'); icText.setAttribute('font-weight', 'bold');
    icText.textContent = 'IC';
    svg.appendChild(icText);

    // Points on the body
    const pts = [
      { x: -60, y: 0, arrow: SimV2Primitives.createArrow(svg, { color: '#3498db', label: 'v1' }) },
      { x: 60, y: 0, arrow: SimV2Primitives.createArrow(svg, { color: '#3498db', label: 'v2' }) },
      { x: 0, y: -20, arrow: SimV2Primitives.createArrow(svg, { color: '#3498db', label: 'v3' }) }
    ];

    const readout = document.createElement('div');
    readout.className = 'sim-readout-v2';
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function update(dt) {
      state.t += dt / 1000;
      state.angle += state.omega * (dt / 1000);
      
      // IC moves a bit
      state.ic.x = 150 + 50 * Math.sin(state.t * 0.5);
      state.ic.y = 300 + 30 * Math.cos(state.t * 0.7);

      icCircle.setAttribute('cx', state.ic.x); icCircle.setAttribute('cy', state.ic.y);
      icText.setAttribute('x', state.ic.x + 10); icText.setAttribute('y', state.ic.y - 10);

      const bodyCx = 250; const bodyCy = 200;
      bodyGroup.setAttribute('transform', `translate(${bodyCx}, ${bodyCy}) rotate(${state.angle * 180 / Math.PI})`);

      pts.forEach(p => {
        // World coordinates of the point
        const cosA = Math.cos(state.angle);
        const sinA = Math.sin(state.angle);
        const wx = bodyCx + p.x * cosA - p.y * sinA;
        const wy = bodyCy + p.x * sinA + p.y * cosA;

        // Velocity v = omega x r_IC
        const rx = wx - state.ic.x;
        const ry = wy - state.ic.y;
        const vx = -state.omega * ry;
        const vy = state.omega * rx;

        const vs = 0.5;
        p.arrow.update(wx, wy, wx + vx * vs, wy + vy * vs);
      });

      readout.innerHTML = `
        <div style="color: #c9963a">Tâm vận tốc tức thời (IC)</div>
        <div style="color: #fff; margin-top: 10px;">\u03C9 = ${state.omega.toFixed(2)} rad/s</div>
        <div style="color: #e74c3c">IC = (${state.ic.x.toFixed(0)}, ${state.ic.y.toFixed(0)})</div>
        <div style="color: #3498db; margin-top: 5px;">v = \u03C9 \u00D7 r_IC</div>
      `;
    }

    ui.addSlider('Vận tốc góc (\u03C9)', -3, 3, 0.1, v => state.omega = v, state.omega);

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
        SimV2Disposal.dispose(pts.map(p => p.arrow));
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-7-1', {
      chapter: 2, type: 'kinematics', title: 'Hướng dẫn bài tập (IC)',
      hint: 'Mọi điểm trên vật phẳng đang chuyển động song phẳng đều có thể coi là đang quay quanh IC.'
    });
  }
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-7-1'] = init;
})();
