/**
 * ch3-7-3: 2D Collision
 * Demonstrates the collision of two balls in 2D space.
 * Uses the coefficient of restitution e to determine energy loss.
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

    const chart = new SimChart(chartCanvas, "Động năng hệ", "K (t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Parameters
    let e = 0.8; // Restitution
    let m1 = 3.0, m2 = 2.0;
    let b1 = { x: 200, y: 150, vx: 40, vy: 20 };
    let b2 = { x: 500, y: 250, vx: -30, vy: -10 };
    const r1 = 30, r2 = 25;
    let timer = 0;
    let collided = false;

    // Visual Elements
    const ball1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball1.setAttribute('fill', '#e74c3c'); svg.appendChild(ball1);
    const ball2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball2.setAttribute('fill', '#3498db'); svg.appendChild(ball2);

    const v1Arrow = SimV2Primitives.createArrow(svg, { color: '#e74c3c' });
    const v2Arrow = SimV2Primitives.createArrow(svg, { color: '#3498db' });

    function updateVisuals() {
      ball1.setAttribute('cx', b1.x); ball1.setAttribute('cy', b1.y); ball1.setAttribute('r', r1);
      ball2.setAttribute('cx', b2.x); ball2.setAttribute('cy', b2.y); ball2.setAttribute('r', r2);
      
      v1Arrow.update(b1.x, b1.y, b1.x + b1.vx, b1.y + b1.vy);
      v2Arrow.update(b2.x, b2.y, b2.x + b2.vx, b2.y + b2.vy);
    }

    function reset() {
      b1 = { x: 200, y: 150, vx: 40, vy: 20 };
      b2 = { x: 500, y: 250, vx: -30, vy: -10 };
      timer = 0; collided = false;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Hệ số phục hồi e', 0, 1, 0.05, (v) => { e = v; }, 0.8);
    ui.addSlider('Khối lượng m1', 1, 10, 0.5, (v) => { m1 = v; reset(); }, 3.0);
    ui.addSlider('Khối lượng m2', 1, 10, 0.5, (v) => { m2 = v; reset(); }, 2.0);

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
      
      b1.x += b1.vx * dt * 10; b1.y += b1.vy * dt * 10;
      b2.x += b2.vx * dt * 10; b2.y += b2.vy * dt * 10;

      // Collision detection
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (!collided && dist < (r1 + r2)) {
        const nx = dx / dist;
        const ny = dy / dist;
        const vrx = b1.vx - b2.vx;
        const vry = b1.vy - b2.vy;
        const vrn = vrx * nx + vry * ny;
        
        if (vrn > 0) {
          const j = -(1 + e) * vrn / (1/m1 + 1/m2);
          b1.vx += (j / m1) * nx;
          b1.vy += (j / m1) * ny;
          b2.vx -= (j / m2) * nx;
          b2.vy -= (j / m2) * ny;
          collided = true;
        }
      }

      // Boundary check
      if (b1.x < r1 || b1.x > 800-r1) b1.vx *= -1;
      if (b1.y < r1 || b1.y > 450-r1) b1.vy *= -1;
      if (b2.x < r2 || b2.x > 800-r2) b2.vx *= -1;
      if (b2.y < r2 || b2.y > 450-r2) b2.vy *= -1;

      timer += dt;
      updateVisuals();
      
      if (engine.isRunning) {
        const KE = 0.5 * m1 * (b1.vx**2 + b1.vy**2) + 0.5 * m2 * (b2.vx**2 + b2.vy**2);
        chart.updateData(timer, KE / 100);
      }
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
    window.RouteRegistry.register('ch3-7-3', {
      chapter: 3,
      type: 'dynamics',
      title: 'Va cham 2 chieu',
      hint: 'Impulse along normal'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-7-3'] = init;
})();
