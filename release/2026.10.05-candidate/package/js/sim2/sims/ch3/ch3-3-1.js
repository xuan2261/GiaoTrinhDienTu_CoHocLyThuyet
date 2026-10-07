/**
 * ch3-3-1 — Dao động lò xo không cản. rk4Step/integrateMotion.
 * Slider k, m + playback (start paused). Dao động x'' = -(k/m)x tích phân RK4; SVG + graph x(t).
 */
(function(root) {
  'use strict';
  const Reg = root.Sim2Registry, Shell = root.Sim2Shell, D = root.SimPhysicsDynamics, Pal = root.Sim2Palette;

  Reg.register('ch3-3-1', function(container) {
    const shell = Shell.createSimShell({
      // minY -5→-5.25: nới margin để trace x(t) đáy (gy0=-3, biên độ tới gy0-gh≈-4.6) không chạm mép.
      container, worldBox: { minX: -1, minY: -5.25, maxX: 11, maxY: 4 }, reservePanel: true,
      meta: { name: 'Giải ODE chuyển động (RK4)', section: '3.1', chapter: 3 }
    });
    const { svg, tf, overlay, render } = shell;
    const params = { m: 1, k: 4 };
    const wallX = 0, eqX = 4;

    svg.appendChild(render.line(tf, { x: wallX, y: -1.5 }, { x: wallX, y: 1.5 }, { stroke: Pal.axis, width: 4 }));
    svg.appendChild(render.line(tf, { x: eqX, y: -0.8 }, { x: eqX, y: 0.8 }, { stroke: Pal.moment, width: 1.5, dash: '4 3', class: 'sim2-guide-line sim2-equilibrium-line' }));
    const spring = render.el('polyline', { points: '', fill: 'none', stroke: Pal.axis, 'stroke-width': 2 });
    svg.appendChild(spring);
    const box = render.poly(tf, [], { closed: true, gradient: 'a', depth: true, stroke: Pal.a });
    svg.appendChild(box);

    const gx0 = 0, gy0 = -3, gw = 9, gh = 1.6;
    svg.appendChild(render.line(tf, { x: gx0, y: gy0 }, { x: gx0 + gw, y: gy0 }, { stroke: Pal.grid, width: 1 }));
    svg.appendChild(render.line(tf,{x:gx0,y:gy0-gh},{x:gx0,y:gy0+gh},{stroke:Pal.grid,width:1}));
    const graphLine = render.el('polyline', { points: '', fill: 'none', stroke: Pal.v, 'stroke-width': 2, class: 'sim2-graph' });
    svg.appendChild(graphLine);
    const exactLine = render.el('polyline', { points: '', fill: 'none', stroke: Pal.moment, 'stroke-width': 1.5, 'stroke-dasharray': '5 3', class: 'sim2-graph-exact' });
    svg.appendChild(exactLine);
    const graphCursor = render.line(tf, { x: gx0, y: gy0 - gh }, { x: gx0, y: gy0 + gh }, {
      stroke: Pal.resultant, width: 1.5, dash: '3 3', class: 'sim2-graph-cursor'
    });
    svg.appendChild(graphCursor);

    overlay.label('x (m)', { x: gx0 + .45, y: gy0 + gh + .35 }, { anchor: 'left', color: Pal.v });
    overlay.label('t (s)', { x: gx0 + gw + .15, y: gy0 }, { anchor: 'left' });
    const lblBox = overlay.label('m', { x: eqX, y: 0.7 }, { color: Pal.a });

    const lblStart = overlay.label('0 s', { x: gx0, y: gy0-gh-0.15 }, { anchor: 'top' });
    const lblMid = overlay.label('',{x:gx0+gw/2,y:gy0-gh-.15},{anchor:'top'});
    const lblEnd = overlay.label('', { x: gx0+gw, y: gy0-gh-0.15 }, { anchor: 'top' });
    for (const x of [-2,-1,0,1,2]) overlay.label(String(x), { x: gx0-.15, y: gy0+x/2*gh }, { anchor: 'right' });
    let s, t, data;
    const tMax = 2 * Math.PI;
    function reset() { s = { x: 2, v: 0 }; t = 0; data = [{t:0,x:2}]; shell.resetClock(); draw(); }
    function draw() {
      const bx = eqX + s.x;
      const graphStart = Math.max(0,t-tMax), omega = Math.sqrt(params.k/params.m);
      lblStart.textContent = graphStart.toFixed(2)+' s';
      lblMid.textContent = (graphStart+tMax/2).toFixed(2)+' s';
      lblEnd.textContent = (graphStart+tMax).toFixed(2)+' s';
      const segs = 8, pts = [];
      for (let i = 0; i <= segs; i++) {
        const xx = wallX + (bx - 0.4 - wallX) * i / segs;
        const yy = (i > 0 && i < segs) ? (i % 2 ? 0.25 : -0.25) : 0;
        const sc = tf.toScreen({ x: xx, y: yy }); pts.push(`${sc.x},${sc.y}`);
      }
      spring.setAttribute('points', pts.join(' '));
      box.setAttribute('points', [
        { x: bx - 0.4, y: -0.4 }, { x: bx + 0.4, y: -0.4 }, { x: bx + 0.4, y: 0.4 }, { x: bx - 0.4, y: 0.4 }
      ].map(p => { const sc = tf.toScreen(p); return `${sc.x},${sc.y}`; }).join(' '));
      overlay.moveLabel(lblBox, { x: bx, y: 0.8 });
      const gpts = data.map(d => {
        const gx = gx0 + ((d.t-graphStart) / tMax) * gw, gy = gy0 + (d.x / 2) * gh;
        const sc = tf.toScreen({ x: gx, y: gy }); return `${sc.x},${sc.y}`;
      }).join(' ');
      graphLine.setAttribute('points', gpts);
      const exact = [];
      for (let i=0;i<=120;i++) { const tt=graphStart+tMax*i/120; const p=tf.toScreen({x:gx0+gw*i/120,y:gy0+Math.cos(omega*tt)*gh});exact.push(`${p.x},${p.y}`); }
      exactLine.setAttribute('points',exact.join(' '));
      const cx = gx0 + Math.min(1,t / tMax) * gw;
      const c0 = tf.toScreen({ x: cx, y: gy0 - gh }), c1 = tf.toScreen({ x: cx, y: gy0 + gh });
      graphCursor.setAttribute('x1', c0.x); graphCursor.setAttribute('y1', c0.y);
      graphCursor.setAttribute('x2', c1.x); graphCursor.setAttribute('y2', c1.y);
      panel.setReadout([
        { key: 'k', label: 'k:', value: params.k + ' N/m' },
        { key: 'm', label: 'm:', value: params.m + ' kg' },
        { key: 'omega', label: 'ω:', value: Math.sqrt(params.k / params.m).toFixed(2) + ' rad/s' },
        { key: 't', label: 't vật lý:', value: t.toFixed(6)+' s' },
        { key: 'x', label: 'x RK4:', value: s.x.toFixed(6) + ' m' },
        { key: 'v', label: 'v RK4:', value: s.v.toFixed(6)+' m/s' },
        { key: 'period', label: 'Chu kỳ T:', value: (2*Math.PI/omega).toFixed(6)+' s' },
        { key: 'exact', label: 'x giải tích:', value: (2*Math.cos(omega*t)).toFixed(6)+' m' },
        { key: 'energy', label: 'E = ½mv²+½kx²:', value: (.5*params.m*s.v*s.v+.5*params.k*s.x*s.x).toFixed(6)+' J' },
        { key: 'energyError', label: 'E−E₀:', value: (.5*params.m*s.v*s.v+.5*params.k*s.x*s.x-2*params.k).toExponential(3)+' J' },
        { key: 'error', label: '|x RK4−x giải tích|:', value: Math.abs(s.x-2*Math.cos(omega*t)).toExponential(3)+' m' },
        { key: 'window', label: 'Cửa sổ đồ thị:', value: graphStart.toFixed(2)+'–'+(graphStart+tMax).toFixed(2)+' s; x: −2…2 m cố định' }
      ]);
    }
    function update(dt) {
      s = D.integrateMotion(params.m, params.k, () => 0, s.v, s.x, dt);
      t += dt;
      data.push({ t, x: s.x });
      data = data.filter(d => d.t >= Math.max(0,t-tMax));
      if (data.length > 400) data.splice(0,data.length-400);
    }

    const panel = shell.setTheory({
      formulas: ['m\\ddot{x} + kx = 0', '\\omega = \\sqrt{k/m}'],
      legend: [{ color: Pal.a, label: 'vật m' }, { color: Pal.v, label: 'x(t)' }],
      observe: 'Lò xo lý tưởng không cản/ngoại lực; x₀=2 m, v₀=0. Nét liền: RK4; nét đứt: x=2cos(√(k/m)t). Trục t là thời gian vật lý liên tục, cửa sổ cuộn 2π s. Đổi k/m đặt lại thí nghiệm. Nút một chu kỳ tích phân bằng bước ≤1/60 s rồi dừng.'
    });

    const controls = shell.addControls({
      actions: [{ id: 'one-cycle', label: 'Tính và dừng sau một chu kỳ', onClick: () => {
        shell.stop(); controls.setPlaying(false); reset();
        const period=2*Math.PI*Math.sqrt(params.m/params.k);
        while(t<period-1e-12) update(Math.min(1/60,period-t));
        shell.seekTime(t); draw();
      } }],
      sliders: [
        { id: 'k', label: 'k', min: 1, max: 12, step: 1, value: params.k, unit: 'N/m',
          onInput: v => { params.k = v; reset(); } },
        { id: 'm', label: 'm', min: 0.5, max: 4, step: 0.5, value: params.m, unit: 'kg',
          onInput: v => { params.m = v; reset(); } }
      ],
      playback: {
        playing: false,
        onPlay: () => shell.start(), onPause: () => shell.stop(),
        onStep: () => shell.stepOnce(), onReset: () => { shell.stop(); reset(); }
      }
    });

    reset();
    shell.onFrame(update, draw);
    shell.stop();
    return { dispose: shell.dispose };
  });
})(typeof window !== 'undefined' ? window : this);
