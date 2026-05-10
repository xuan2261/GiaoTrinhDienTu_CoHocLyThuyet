/**
 * ch3-4-2: Center of Mass Theorem
 * Demonstrates m_total * a_CM = Sum(F_ext).
 * The motion of the center of mass is determined only by external forces.
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

    const chart = new SimChart(chartCanvas, "Vận tốc khối tâm V_CM", "V_CM (t)");

    const engine = new SimulationEngine({
      viewHeight: 450,
      originX: 0,
      originY: 0,
      flipY: false
    });

    // Parameters
    let m1 = 3.0; // kg
    let m2 = 2.0; // kg
    let forceExt = 50; // N (External force on m1)
    let x1 = 150, y1 = 200;
    let x2 = 300, y2 = 250;
    let vx1 = 0, vy1 = 0;
    let vx2 = 0, vy2 = 0;
    let timer = 0;

    // Visual Elements
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '0'); ground.setAttribute('y1', '350');
    ground.setAttribute('x2', '800'); ground.setAttribute('y2', '350');
    ground.setAttribute('stroke', '#7f8c8d'); ground.setAttribute('stroke-width', '2');
    svg.appendChild(ground);

    const ball1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball1.setAttribute('fill', '#e74c3c');
    svg.appendChild(ball1);

    const ball2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball2.setAttribute('fill', '#3498db');
    svg.appendChild(ball2);

    const spring = SimV2Primitives.createSpring(svg, { color: '#95a5a6', coils: 8, width: 10 });
    const fArrow = SimV2Primitives.createArrow(svg, { color: '#f1c40f' });

    const comMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    comMarker.setAttribute('r', '6'); comMarker.setAttribute('fill', '#f1c40f');
    svg.appendChild(comMarker);

    function updateVisuals() {
      const mt = m1 + m2;
      const xCM = (x1 * m1 + x2 * m2) / mt;
      const yCM = (y1 * m1 + y2 * m2) / mt;

      ball1.setAttribute('cx', x1); ball1.setAttribute('cy', y1); ball1.setAttribute('r', 15 + m1 * 2);
      ball2.setAttribute('cx', x2); ball2.setAttribute('cy', y2); ball2.setAttribute('r', 15 + m2 * 2);
      
      spring.update(x1, y1, x2, y2);
      comMarker.setAttribute('cx', xCM); comMarker.setAttribute('cy', yCM);

      if (forceExt > 0) {
        fArrow.update(x1 - 60, y1, x1 - 10, y1);
      } else {
        fArrow.update(0,0,0,0);
      }
    }

    function reset() {
      x1 = 150; y1 = 200; x2 = 300; y2 = 250;
      vx1 = 0; vy1 = 0; vx2 = 0; vy2 = 0;
      timer = 0;
      chart.clear();
      updateVisuals();
    }

    ui.addSlider('Lực ngoại F (N)', 0, 100, 5, (v) => { forceExt = v; }, 50);
    ui.addSlider('m1 (kg)', 1, 5, 0.5, (v) => { m1 = v; reset(); }, 3.0);
    ui.addSlider('m2 (kg)', 1, 5, 0.5, (v) => { m2 = v; reset(); }, 2.0);

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
      const k_internal = 50;
      const restLen = 150;
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const f_spring = k_internal * (dist - restLen);
      
      const fx1 = forceExt + f_spring * (dx/dist);
      const fy1 = f_spring * (dy/dist);
      const fx2 = -f_spring * (dx/dist);
      const fy2 = -f_spring * (dy/dist);

      vx1 += (fx1 / m1) * dt * 20;
      vy1 += (fy1 / m1) * dt * 20;
      vx2 += (fx2 / m2) * dt * 20;
      vy2 += (fy2 / m2) * dt * 20;

      x1 += vx1 * dt; y1 += vy1 * dt;
      x2 += vx2 * dt; y2 += vy2 * dt;

      timer += dt;
      updateVisuals();
      
      if (engine.isRunning) {
        const mt = m1 + m2;
        const vCM_x = (vx1 * m1 + vx2 * m2) / mt;
        chart.updateData(timer, vCM_x / 10);
      }
    };

    updateVisuals();

    return {
      dispose: () => {
        engine.stop();
        SimV2Disposal.dispose([engine, chart, spring, fArrow]);
        host.innerHTML = '';
      }
    };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch3-4-2', {
      chapter: 3,
      type: 'dynamics',
      title: 'Dinh ly khoi tam',
      hint: 'm*a_CM = SumF_ext'
    });
  }

  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch3-4-2'] = init;
})();
