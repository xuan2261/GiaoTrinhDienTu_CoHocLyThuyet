/**
 * ch3-7-2: Dynamics Numerical Practice (Bài tập thực hành)
 * Demonstrates 1D Inelastic Collision where objects stick together.
 * Ported to Standalone V2.
 */
(function() {
  'use strict';

  function init(host) {
    const layout = document.createElement('div');
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = '1fr 320px';
    layout.style.gap = '20px';
    layout.style.width = '100%';
    host.appendChild(layout);

    const viewport = document.createElement('div');
    viewport.setAttribute('class', 'sim-viewport-v2');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.setAttribute('class', 'sim-svg-v2');
    viewport.appendChild(svg);
    layout.appendChild(viewport);

    const sidebar = document.createElement('div');
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.gap = '15px';
    layout.appendChild(sidebar);

    const uiContainer = document.createElement('div');
    sidebar.appendChild(uiContainer);
    const ui = new SimUI(uiContainer);

    const chartCanvas = document.createElement('canvas');
    const chartContainer = document.createElement('div');
    chartContainer.setAttribute('class', 'sim-chart-container-v2');
    chartContainer.appendChild(chartCanvas);
    sidebar.appendChild(chartContainer);

    const chart = new SimChart(chartCanvas, "Động năng hệ (J)", "K(t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Parameters
    let m1 = 4.0, m2 = 2.0;
    let v1 = 5.0, v2 = -2.0;
    let x1 = 200, x2 = 500;
    const r1 = 30, r2 = 24;
    const cy = 225;
    let collided = false;
    let v_final = 0;
    let timer = 0;

    // Visual Elements
    const ball1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball1.setAttribute('fill', '#e74c3c'); svg.appendChild(ball1);
    const ball2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball2.setAttribute('fill', '#3498db'); svg.appendChild(ball2);

    const label1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label1.setAttribute('fill', '#fff'); label1.setAttribute('font-size', '12');
    label1.setAttribute('font-weight', 'bold');
    label1.setAttribute('text-anchor', 'middle'); label1.textContent = 'm1';
    svg.appendChild(label1);

    const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label2.setAttribute('fill', '#fff'); label2.setAttribute('font-size', '12');
    label2.setAttribute('font-weight', 'bold');
    label2.setAttribute('text-anchor', 'middle'); label2.textContent = 'm2';
    svg.appendChild(label2);

    const vArrow = SimV2Primitives.createArrow(svg, { color: '#f1c40f' });

    function updateVisuals() {
      if (!collided) {
        ball1.setAttribute('cx', x1); ball1.setAttribute('cy', cy); ball1.setAttribute('r', r1);
        ball2.setAttribute('cx', x2); ball2.setAttribute('cy', cy); ball2.setAttribute('r', r2);
        ball2.setAttribute('visibility', 'visible');
        label1.setAttribute('x', x1); label1.setAttribute('y', cy + 4);
        label2.setAttribute('x', x2); label2.setAttribute('y', cy + 4);
        label1.textContent = 'm1';
        label2.setAttribute('visibility', 'visible');
        vArrow.line.setAttribute('visibility', 'hidden');
      } else {
        const x = (x1 + x2) / 2;
        ball1.setAttribute('cx', x); ball1.setAttribute('cy', cy); ball1.setAttribute('r', r1 + 5);
        ball2.setAttribute('visibility', 'hidden');
        label1.setAttribute('x', x); label1.setAttribute('y', cy + 4);
        label1.textContent = 'm1+m2';
        label2.setAttribute('visibility', 'hidden');
        
        if (Math.abs(v_final) > 0.1) {
          vArrow.line.setAttribute('visibility', 'visible');
          vArrow.update(x + (v_final > 0 ? r1 + 5 : -r1 - 5), cy, x + (v_final > 0 ? r1 + 5 : -r1 - 5) + v_final * 10, cy);
        } else vArrow.line.setAttribute('visibility', 'hidden');
      }
    }

    function reset() {
      x1 = 200; x2 = 500; collided = false; timer = 0;
      v_final = (m1 * v1 + m2 * v2) / (m1 + m2);
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Khối lượng m1 (kg)', 1, 10, 0.5, (v) => { m1 = v; reset(); }, 4.0);
    ui.addSlider('Khối lượng m2 (kg)', 1, 10, 0.5, (v) => { m2 = v; reset(); }, 2.0);
    ui.addSlider('Vận tốc v1 (m/s)', -10, 15, 0.5, (v) => { v1 = v; reset(); }, 5.0);
    ui.addSlider('Vận tốc v2 (m/s)', -10, 15, 0.5, (v) => { v2 = v; reset(); }, -2.0);

    ui.addButton('Đặt lại (Reset)', reset);
    const playBtn = ui.addButton('Chạy (Play)', () => {
      if (engine.isRunning) {
        engine.stop();
        playBtn.textContent = 'Tiếp tục (Resume)';
      } else {
        engine.start();
        playBtn.textContent = 'Dừng (Pause)';
      }
    }, true);

    engine.tick = (time) => {
      const dt = 1/60;
      
      if (!collided) {
        x1 += v1 * dt * 10; x2 += v2 * dt * 10;
        if (x2 - x1 <= r1 + r2) collided = true;
      } else {
        x1 += v_final * dt * 10; x2 += v_final * dt * 10;
      }

      // Wall bounce for joined mass
      const x = (x1 + x2) / 2;
      const r_eff = collided ? r1 + 5 : r1;
      if (x < r_eff || x > 800 - r_eff) v_final *= -1;

      timer += dt;
      updateVisuals();
      
      const KE = collided ? 0.5 * (m1 + m2) * v_final**2 : (0.5 * m1 * v1**2 + 0.5 * m2 * v2**2);
      chart.updateData(timer, KE);
    };

    updateVisuals();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, vArrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-7-2', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dynamics Numerical Practice (Bài tập thực hành)',
      hint: 'Va chạm không đàn hồi'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-7-2'] = init;
})();
