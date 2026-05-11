/**
 * ch2-6-1: Relative Motion (Chuyển động tương đối)
 * v_A = v_B + v_AB => v_AB = v_A - v_B
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

    const engine = new SimulationEngine({ gravity: 0, viewHeight: 440, originX: 0, originY: 0, flipY: false });
    const ui = new SimUI(uiPanel);
    
    let state = {
      pA: { x: 150, y: 200 },
      pB: { x: 350, y: 200 },
      vA: { x: 40, y: 30 },
      vB: { x: 20, y: -20 },
      t: 0
    };

    const ballA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ballA.setAttribute('r', '8'); ballA.setAttribute('fill', '#3498db');
    ballA.setAttribute('stroke', '#fff'); ballA.setAttribute('stroke-width', '2');
    svg.appendChild(ballA);

    const ballB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ballB.setAttribute('r', '8'); ballB.setAttribute('fill', '#2ecc71');
    ballB.setAttribute('stroke', '#fff'); ballB.setAttribute('stroke-width', '2');
    svg.appendChild(ballB);

    const arrowVA = SimV2Primitives.createArrow(svg, { color: '#3498db', strokeWidth: 2, label: 'vA' });
    const arrowVB = SimV2Primitives.createArrow(svg, { color: '#2ecc71', strokeWidth: 2, label: 'vB' });
    const arrowVAB = SimV2Primitives.createArrow(svg, { color: '#e74c3c', strokeWidth: 2, label: 'vAB' });

    const readout = document.createElement('div');
    readout.setAttribute('class', 'sim-readout-v2');
    readout.style.marginTop = '20px';
    readout.style.padding = '10px';
    readout.style.borderRadius = '4px';
    readout.style.backgroundColor = 'rgba(0,0,0,0.2)';
    uiPanel.appendChild(readout);

    function update(dt) {
      state.t += dt / 1000;
      
      // Points move in some pattern
      const ax = 150 + 80 * Math.sin(state.t * 0.7);
      const ay = 220 + 40 * Math.cos(state.t * 1.1);
      const bx = 350 + 60 * Math.cos(state.t * 0.5);
      const by = 220 + 50 * Math.sin(state.t * 0.9);

      // Derivatives (velocities)
      state.vA.x = 80 * 0.7 * Math.cos(state.t * 0.7);
      state.vA.y = -40 * 1.1 * Math.sin(state.t * 1.1);
      state.vB.x = -60 * 0.5 * Math.sin(state.t * 0.5);
      state.vB.y = 50 * 0.9 * Math.cos(state.t * 0.9);

      ballA.setAttribute('cx', ax); ballA.setAttribute('cy', ay);
      ballB.setAttribute('cx', bx); ballB.setAttribute('cy', by);

      const vs = 1.5;
      arrowVA.update(ax, ay, ax + state.vA.x * vs, ay + state.vA.y * vs);
      arrowVB.update(bx, by, bx + state.vB.x * vs, by + state.vB.y * vs);
      
      // Relative velocity v_AB = v_A - v_B
      const vabx = state.vA.x - state.vB.x;
      const vaby = state.vA.y - state.vB.y;
      arrowVAB.update(bx, by, bx + vabx * vs, by + vaby * vs);

      readout.innerHTML = `
        <div style="color: #3498db">v_A = (${state.vA.x.toFixed(1)}, ${state.vA.y.toFixed(1)})</div>
        <div style="color: #2ecc71">v_B = (${state.vB.x.toFixed(1)}, ${state.vB.y.toFixed(1)})</div>
        <div style="color: #e74c3c">v_AB = v_A - v_B = (${vabx.toFixed(1)}, ${vaby.toFixed(1)})</div>
        <div style="color: #8ea0b8; margin-top: 10px;">|v_AB| = ${Math.sqrt(vabx*vabx + vaby*vaby).toFixed(1)} px/s</div>
      `;
    }

    ui.addButton('Reset', () => { state.t = 0; });

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
        SimV2Disposal.dispose([arrowVA, arrowVB, arrowVAB]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch2-6-1', {
      chapter: 2, type: 'kinematics', title: 'Quay quanh điểm cố định (Tương đối)',
      hint: 'Vận tốc tương đối v_AB là vận tốc của A khi quan sát từ hệ quy chiếu gắn với B.'
    });
  }
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch2-6-1'] = init;
})();
