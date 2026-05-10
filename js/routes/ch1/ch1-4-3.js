/**
 * Ch1-4-3: Types of Spatial Force Systems (Dạng hệ lực không gian)
 * Demonstrating Concurrent, Parallel, and General force systems in 3D.
 */
(function() {
  'use strict';

  function init(host) {
    const container = document.createElement('div');
    container.className = 'sim-viewport-v2';
    container.style.cssText = 'display:flex; width:100%; height:440px; background:#1a1c24; color:#e8ecf1;';
    
    const canvasArea = document.createElement('div');
    canvasArea.style.cssText = 'flex:0 0 540px; position:relative; overflow:hidden;';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 540 440');
    svg.style.cssText = 'width:100%; height:100%;';
    canvasArea.appendChild(svg);
    
    const uiPanel = document.createElement('div');
    uiPanel.style.cssText = 'flex:1; padding:20px; border-left:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02);';
    
    container.appendChild(canvasArea);
    container.appendChild(uiPanel);
    host.appendChild(container);

    const engine = new SimulationEngine({ viewHeight: 440 });
    const ui = new SimUI(uiPanel);
    const ox = 270, oy = 250;
    const cos30 = Math.cos(Math.PI/6), sin30 = Math.sin(Math.PI/6);
    const project = (x, y, z) => ({ sx: ox + (x - z) * cos30, sy: oy - y + (x + z) * sin30 });

    const drawAxis = (name, end, color) => {
      const p0 = project(0,0,0), p1 = project(end.x, end.y, end.z);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p0.sx); line.setAttribute('y1', p0.sy);
      line.setAttribute('x2', p1.sx); line.setAttribute('y2', p1.sy);
      line.setAttribute('stroke', color); line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '4,2'); svg.appendChild(line);
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', p1.sx + 5); txt.setAttribute('y', p1.sy + 5);
      txt.setAttribute('fill', color); txt.textContent = name; svg.appendChild(txt);
    };

    drawAxis('x', {x:150, y:0, z:0}, '#ff4757');
    drawAxis('y', {x:0, y:150, z:0}, '#2ed573');
    drawAxis('z', {x:0, y:0, z:150}, '#1e90ff');

    const forces = [], labels = [];
    for(let i=0; i<4; i++) {
      forces.push(SimV2Primitives.createArrow(svg, { color: i===3?'#ffa502':'#ffffff', strokeWidth: i===3?3:2 }));
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('font-size', '12'); svg.appendChild(txt);
      labels.push(txt);
    }

    const state = { mode: 'concurrent' };
    const modes = {
      concurrent: {
        title: 'Hệ lực đồng quy', desc: 'Các lực có đường tác dụng gặp nhau tại một điểm O. Hệ thu gọn về một hợp lực R.',
        data: [
          {p:{x:0,y:0,z:0}, f:{x:80,y:40,z:20}, c:'#ffffff', n:'F1'},
          {p:{x:0,y:0,z:0}, f:{x:-40,y:60,z:30}, c:'#ffffff', n:'F2'},
          {p:{x:0,y:0,z:0}, f:{x:20,y:-30,z:-60}, c:'#ffffff', n:'F3'},
          {p:{x:0,y:0,z:0}, f:{x:60,y:70,z:-10}, c:'#ffa502', n:'R'}
        ]
      },
      parallel: {
        title: 'Hệ lực song song', desc: 'Các lực có đường tác dụng song song với nhau. Thường thu gọn về một hợp lực R.',
        data: [
          {p:{x:60,y:0,z:0}, f:{x:0,y:80,z:0}, c:'#ffffff', n:'F1'},
          {p:{x:0,y:0,z:60}, f:{x:0,y:50,z:0}, c:'#ffffff', n:'F2'},
          {p:{x:-60,y:0,z:-40}, f:{x:0,y:60,z:0}, c:'#ffffff', n:'F3'},
          {p:{x:0,y:0,z:10}, f:{x:0,y:190,z:0}, c:'#ffa502', n:'R'}
        ]
      },
      general: {
        title: 'Hệ lực tổng quát', desc: 'Các lực nằm tùy ý. Thu gọn về véc tơ chính R và mô men chính Mo.',
        data: [
          {p:{x:80,y:20,z:0}, f:{x:0,y:70,z:30}, c:'#ffffff', n:'F1'},
          {p:{x:-40,y:50,z:40}, f:{x:60,y:0,z:-20}, c:'#ffffff', n:'F2'},
          {p:{x:20,y:-30,z:-50}, f:{x:-30,y:40,z:0}, c:'#ffffff', n:'F3'},
          {p:{x:0,y:0,z:0}, f:{x:30,y:110,z:10}, c:'#ffa502', n:'R'}
        ]
      }
    };

    const readout = document.createElement('div');
    readout.style.cssText = 'margin-top:20px; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px; border-left:4px solid #ffa502;';
    uiPanel.appendChild(readout);

    function update() {
      const m = modes[state.mode];
      readout.innerHTML = `<h3 style="color:#ffa502; margin:0 0 10px 0;">${m.title}</h3><p style="font-size:14px; line-height:1.5; color:#cbd5e0;">${m.desc}</p>`;
      m.data.forEach((d, i) => {
        const p1 = project(d.p.x, d.p.y, d.p.z), p2 = project(d.p.x+d.f.x, d.p.y+d.f.y, d.p.z+d.f.z);
        forces[i].update(p1.sx, p1.sy, p2.sx, p2.sy);
        labels[i].setAttribute('x', p2.sx + 5); labels[i].setAttribute('y', p2.sy - 5);
        labels[i].setAttribute('fill', d.c); labels[i].textContent = d.n;
      });
    }

    ui.addButton('Hệ đồng quy', () => { state.mode = 'concurrent'; update(); });
    ui.addButton('Hệ song song', () => { state.mode = 'parallel'; update(); });
    ui.addButton('Hệ tổng quát', () => { state.mode = 'general'; update(); });

    update(); engine.start();
    return { dispose: () => { engine.stop(); SimV2Disposal.dispose(forces); host.innerHTML = ''; } };
  }

  if (window.RouteRegistry) {
    window.RouteRegistry.register('ch1-4-3', { chapter: 1, type: 'statics', title: 'Các dạng hệ lực không gian', hint: 'Khảo sát 3 trường hợp thu gọn cơ bản của hệ lực không gian.' });
  }
  window.SIM_MAP = window.SIM_MAP || {};
  window.SIM_MAP['ch1-4-3'] = init;
})();
