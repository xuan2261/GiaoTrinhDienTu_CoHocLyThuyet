/**
 * ch3-7-1: Dynamics Theorem Selector (Hướng dẫn bài tập)
 * Demonstrates 1D Elastic Collision and Conservation of Momentum/Energy.
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
    viewport.className = 'sim-viewport-v2';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.className = 'sim-svg-v2';
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
    chartContainer.className = 'sim-chart-container-v2';
    chartContainer.appendChild(chartCanvas);
    sidebar.appendChild(chartContainer);

    const chart = new SimChart(chartCanvas, "Tổng động năng (J)", "K(t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Parameters
    let m1 = 4.0, m2 = 2.0;
    let v1 = 5.0, v2 = -3.0;
    let x1 = 200, x2 = 500;
    const r1 = 30, r2 = 24;
    const cy = 225;
    let collided = false;
    let v1p = 5.0, v2p = -3.0;
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

    const v1Arrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c' });
    const v2Arrow = SimV2Primitives.createArrow(svg, { color: '#3498db' });

    function updateVisuals() {
      ball1.setAttribute('cx', x1); ball1.setAttribute('cy', cy); ball1.setAttribute('r', r1);
      ball2.setAttribute('cx', x2); ball2.setAttribute('cy', cy); ball2.setAttribute('r', r2);
      label1.setAttribute('x', x1); label1.setAttribute('y', cy + 4);
      label2.setAttribute('x', x2); label2.setAttribute('y', cy + 4);
      
      const curV1 = collided ? v1p : v1;
      const curV2 = collided ? v2p : v2;
      
      if (Math.abs(curV1) > 0.1) {
        v1Arrow.line.setAttribute('visibility', 'visible');
        v1Arrow.update(x1 + (curV1 > 0 ? r1 : -r1), cy, x1 + (curV1 > 0 ? r1 : -r1) + curV1 * 10, cy);
      } else v1Arrow.line.setAttribute('visibility', 'hidden');

      if (Math.abs(curV2) > 0.1) {
        v2Arrow.line.setAttribute('visibility', 'visible');
        v2Arrow.update(x2 + (curV2 > 0 ? r2 : -r2), cy, x2 + (curV2 > 0 ? r2 : -r2) + curV2 * 10, cy);
      } else v2Arrow.line.setAttribute('visibility', 'hidden');
    }

    function reset() {
      x1 = 200; x2 = 600; collided = false; timer = 0;
      const den = m1 + m2;
      v1p = v1 - (2 * m2 / den) * (v1 - v2);
      v2p = v2 + (2 * m1 / den) * (v1 - v2);
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Khối lượng m1 (kg)', 1, 10, 0.5, (v) => { m1 = v; reset(); }, 4.0);
    ui.addSlider('Khối lượng m2 (kg)', 1, 10, 0.5, (v) => { m2 = v; reset(); }, 2.0);
    ui.addSlider('Vận tốc v1 (m/s)', -10, 15, 0.5, (v) => { v1 = v; reset(); }, 5.0);
    ui.addSlider('Vận tốc v2 (m/s)', -10, 15, 0.5, (v) => { v2 = v; reset(); }, -3.0);

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
        x1 += v1p * dt * 10; x2 += v2p * dt * 10;
      }

      // Wall bounce
      if (x1 < r1 || x1 > 800 - r1) { if (collided) v1p *= -1; else v1 *= -1; }
      if (x2 < r2 || x2 > 800 - r2) { if (collided) v2p *= -1; else v2 *= -1; }

      timer += dt;
      updateVisuals();
      
      const KE = 0.5 * m1 * (collided ? v1p : v1)**2 + 0.5 * m2 * (collided ? v2p : v2)**2;
      chart.updateData(timer, KE);
    };

    updateVisuals();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, v1Arrow, v2Arrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-7-1', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dynamics Theorem Selector (Hướng dẫn bài tập)',
      hint: 'Va chạm đàn hồi 1D'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-7-1'] = init;
})();
