/**
 * Phase 05: Ch3 Dynamics - All 22 Routes (new architecture)
 * Each route = window.SimRegistry['routeId'] = function(host) {...}
 *           + window.RouteRegistry.register(...)
 */
(function() {
'use strict';

const Animator = (window.SimNew && window.SimNew.Animator) || function() {
  const api = {
    _running: false, _rafId: null, _elapsed: 0, _lastTime: null, speed: 1,
    onTick: null, onStart: null, onPause: null, onResume: null, onStop: null,
    _loop(t) {
      if (!api._running) return;
      const dt = Math.min(t - (api._lastTime||t), 100) * api.speed;
      api._lastTime = t; api._elapsed += dt;
      if (api.onTick) api.onTick(dt, api._elapsed);
      api._rafId = requestAnimationFrame(api._loop);
    },
    play() { api._running = true; api._elapsed = 0; api._lastTime = null; if (api.onStart) api.onStart(); api._rafId = requestAnimationFrame(api._loop); },
    pause() { api._running = false; if (api._rafId) { cancelAnimationFrame(api._rafId); api._rafId = null; } if (api.onPause) api.onPause(api._elapsed); },
    resume() { api._running = true; api._lastTime = null; if (api.onResume) api.onResume(api._elapsed); api._rafId = requestAnimationFrame(api._loop); },
    stop() { api._running = false; if (api._rafId) { cancelAnimationFrame(api._rafId); api._rafId = null; } api._elapsed = 0; if (api.onStop) api.onStop(0); },
    isRunning() { return api._running; }, getElapsed() { return api._elapsed; },
    setSpeed(s) { api.speed = Math.max(0.1, Math.min(4, s)); },
    destroy() { api.stop(); api.onTick = null; }
  }; return api;
};

const Handle = window.SimNew && window.SimNew.Handle;
const HandleManager = window.SimNew && window.SimNew.HandleManager;
const InteractionManager = window.SimNew && window.SimNew.InteractionManager;

const C = {
  BG: '#091a33', GOLD: '#c9963a', RED: '#e74c3c', BLUE: '#3498db',
  GREEN: '#27ae60', KE: '#3498db', PE: '#27ae60', TOTAL: '#c9963a',
  PANEL: 'rgba(9,26,51,0.85)', BORDER: 'rgba(201,150,58,0.4)',
  WHITE: '#ffffff', DIM: 'rgba(255,255,255,0.5)', TICK: 'rgba(255,255,255,0.04)'
};

function drawBall(ctx, x, y, r, color, label) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.3);
  g.addColorStop(0, color); g.addColorStop(0.7, color + '99'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
  if (label) { ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y); }
  ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, color, lw, label) {
  const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy);
  if (len < 1) return;
  const a = Math.atan2(dy, dx), hl = Math.min(12, len*0.35);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw||2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hl*Math.cos(a-0.5), y2 - hl*Math.sin(a-0.5));
  ctx.lineTo(x2 - hl*Math.cos(a+0.5), y2 - hl*Math.sin(a+0.5)); ctx.closePath(); ctx.fill();
  if (label && len > 20) { const mx = (x1+x2)/2, my = (y1+y2)/2; ctx.font = 'bold 10px Segoe UI'; ctx.fillText(label, mx+5, my-4); }
  ctx.restore();
}

function drawPanel(ctx, x, y, w, h, title) {
  ctx.fillStyle = C.PANEL; ctx.strokeStyle = C.BORDER; ctx.lineWidth = 1;
  rRect(ctx, x, y, w, h, 8); ctx.fill(); ctx.stroke();
  if (title) { ctx.fillStyle = C.BORDER; ctx.font = 'bold 9px Segoe UI'; ctx.textAlign = 'left'; ctx.fillText(title, x+10, y+13); }
}

function rRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w/2, h/2); ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
  ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
  ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r);
  ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r); ctx.closePath();
}

function drawSpring(ctx, x1, y1, x2, y2, coils, stretch) {
  const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy);
  if (len < 1) return;
  const nx = dx/len, ny = dy/len, px = -ny, py = nx;
  const cw = Math.min(8, len/(coils*2)) * Math.min(1.5, Math.max(0.4, stretch));
  ctx.beginPath(); ctx.moveTo(x1, y1);
  for (let i = 0; i < coils; i++) {
    const t0 = (i*2+1)/(coils*2), t1 = (i*2+2)/(coils*2);
    ctx.lineTo(x1+nx*len*t0+px*cw*(i%2===0?1:-1), y1+ny*len*t0+py*cw*(i%2===0?1:-1));
    ctx.lineTo(x1+nx*len*t1, y1+ny*len*t1);
  }
  ctx.lineTo(x2, y2); ctx.stroke();
}

function drawEnergyBar(ctx, x, y, KE, PE, maxH) {
  drawPanel(ctx, x, y, 130, 90, 'Nang luong');
  const maxE = Math.max(KE+PE, 0.1);
  const keH = Math.min(maxH, Math.abs(KE)/maxE*maxH);
  const peH = Math.min(maxH, Math.abs(PE)/maxE*maxH);
  ctx.fillStyle = C.KE; ctx.fillRect(x+10, y+25+maxH-keH, 110, keH);
  ctx.fillStyle = C.PE; ctx.fillRect(x+10, y+25+maxH-keH-peH, 110, peH);
  ctx.fillStyle = C.TOTAL; ctx.fillRect(x+10, y+25+maxH-(keH+peH), 110, 3);
  ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
  ctx.fillText('KE='+KE.toFixed(1), x+12, y+82);
  ctx.fillText('PE='+PE.toFixed(1), x+72, y+82);
}

function bg(ctx, W, H) {
  ctx.fillStyle = C.BG; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = C.TICK; ctx.lineWidth = 0.5;
  for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

function kineticE(m, v) { return 0.5 * m * v * v; }

function solveCollision(m1, v1, m2, v2, e) {
  const den = m1 + m2;
  const v1p = v1 - (1+e)*m2/den*(v1-v2);
  const v2p = v2 + (1+e)*m1/den*(v1-v2);
  return { v1p, v2p };
}

function solveCollision2D(b1, b2, m1, m2, e) {
  const dx = b2.x - b1.x, dy = b2.y - b1.y;
  const dist = Math.sqrt(dx*dx+dy*dy);
  if (dist < 0.001) return;
  const nx = dx/dist, ny = dy/dist;
  const vrx = b1.vx-b2.vx, vry = b1.vy-b2.vy;
  const vrn = vrx*nx + vry*ny;
  if (vrn <= 0) return;
  const j = -(1+e)*vrn/(1/m1+1/m2);
  b1.vx += j/m1*nx; b1.vy += j/m1*ny;
  b2.vx -= j/m2*nx; b2.vy -= j/m2*ny;
}

function setupLab(host, title, hint, W, H) {
  const lab = window.SimLabUI.createLab(host, { title: title, hint: hint, width: W, height: H });
  lab.canvas.width = W; lab.canvas.height = H;
  const ctx = lab.canvas.getContext('2d');
  const animator = new Animator();
  const hMgr = new (HandleManager || function() {
    const api = { handles: [], add(h) { this.handles.push(h); return h; }, clear() { this.handles = []; },
      render(ctx) { for (const h of this.handles) if (h && h.render) h.render(ctx); },
      setHovered() {}, startDrag() {}, moveDrag() {}, endDrag() {}, getCursor() { return 'default'; } };
    return api;
  })();
  lab.addSlider = function(lbl, min, max, val, step, unit, onChg) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;gap:4px;';
    const le = document.createElement('span'); le.textContent = lbl+': '; le.style.cssText = 'color:#c9963a;font-size:11px;white-space:nowrap;';
    const ve = document.createElement('strong'); ve.style.cssText = 'color:#fff;font-size:12px;min-width:50px;display:inline-block;text-align:right;';
    const inp = document.createElement('input'); inp.type = 'range'; inp.min = min; inp.max = max; inp.value = val; inp.step = step;
    inp.style.cssText = 'accent-color:#c9963a;';
    ve.textContent = val+unit;
    inp.addEventListener('input', function() { ve.textContent = inp.value+unit; onChg(parseFloat(inp.value)); });
    wrap.appendChild(le); wrap.appendChild(inp); wrap.appendChild(ve); lab.toolbar.appendChild(wrap);
  };
  lab.addButton = function(label, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = 'background:rgba(201,150,58,0.2);border:1px solid #c9963a;color:#c9963a;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;';
    btn.addEventListener('click', onClick);
    lab.toolbar.appendChild(btn);
    return btn;
  };
  return { lab, ctx, canvas: lab.canvas, animator, hMgr, W, H };
}

// =============================================================================
// ROUTE 1: ch3-1-1 - Newton's 1st Law (Inertia)
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-1-1', { chapter: 3, type: 'dynamics', title: 'Dinh luat 1 Newton', hint: 'Ke bieu dien van toc khong doi', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-1-1'] = function(host) {
    const { lab, ctx, animator, hMgr, W, H } = setupLab(host, 'Dinh luat 1 Newton', 'Ke bieu dien van toc khong doi', 760, 440);
    const s = { x: 250, m: 5, v: 80 };
    const ground = 340, bw = 80, bh = 50;
    const hBlock = new (Handle || function(o) {
      return { x: o.x, y: o.y, color: o.color, label: o.label, radius: o.radius||10, draggable: true,
        onDrag: null, hitTest(wx, wy) { return Math.hypot(wx-this.x, wy-this.y) <= this.radius; },
        render(ctx) { ctx.save(); ctx.fillStyle = this.color+'55'; ctx.strokeStyle = this.color; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(this.x, this.y, this.radius+4, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); } };
    })({ x: s.x, y: ground-bh/2, color: C.GOLD, radius: 10 });
    hBlock.onDrag = function(h) { s.x = Math.max(40, Math.min(W-40, h.x)); };
    hMgr.add(hBlock);
    lab.addSlider('m', 1, 10, 5, 0.5, ' kg', function(v) { s.m = v; });
    lab.addSlider('v', 10, 200, 80, 5, ' px/s', function(v) { s.v = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); } else { s.x = 250; animator.play(); }
    });
    animator.onTick = function(dt) { s.x += s.v*dt/1000; if (s.x > W-40) s.x = 40; if (s.x < 40) s.x = W-40; };
    function render() {
      bg(ctx, W, H);
      ctx.fillStyle = '#1a3a5c'; ctx.fillRect(0, ground, W, H-ground);
      ctx.strokeStyle = '#2a5a8c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
      ctx.fillStyle = '#8e44ad'; rRect(ctx, s.x-bw/2, ground-bh, bw, bh, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', s.x, ground-bh/2+4);
      if (Math.abs(s.v) > 1) drawArrow(ctx, s.x+bw/2, ground-bh/2, s.x+bw/2+s.v*0.5, ground-bh/2, C.BLUE, 3, 'v='+s.v.toFixed(0)+'px/s');
      drawPanel(ctx, 20, 20, 200, 120, 'Thong so');
      ctx.fillStyle = '#fff'; ctx.font = '12px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('m = '+s.m+' kg', 30, 45);
      ctx.fillStyle = C.BLUE; ctx.fillText('v = '+s.v.toFixed(0)+' px/s', 30, 65);
      ctx.fillStyle = C.GOLD; ctx.fillText('a = 0 (F=0)', 30, 85);
      const KE = kineticE(s.m/5, s.v/20);
      ctx.fillStyle = C.KE; ctx.fillText('K = '+KE.toFixed(1)+' J', 30, 105);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI'; ctx.fillText('v = const (khong ma sat)', 30, 122);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'center';
      ctx.fillText('Khi F=0, vat chuyen dong deu: v=const', W/2, H-14);
      hMgr.render(ctx);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 2: ch3-1-2 - Newton's 2nd Law: F=ma
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-1-2', { chapter: 3, type: 'dynamics', title: 'Dinh luat 2 Newton', hint: 'Dieu chinh F, nhan Play', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-1-2'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Dinh luat 2 Newton', 'Dieu chinh F, nhan Play', 760, 440);
    const s = { x: 150, v: 0, a: 0, m: 5, F: 50, t: 0 };
    const ground = 340, bw = 80, bh = 50;
    lab.addSlider('m', 1, 10, 5, 0.5, ' kg', function(v) { s.m = v; });
    lab.addSlider('F', 0, 200, 50, 5, ' N', function(v) { s.F = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Play'; } else { s.x = 150; s.v = 0; s.t = 0; animator.play(); playBtn.textContent = 'Pause'; }
    });
    animator.onTick = function(dt) { s.a = s.F/s.m; s.v += s.a*dt/1000; s.x += s.v*dt/1000; s.t += dt/1000; if (s.x > W-40) { s.x = W-40; s.v = 0; } };
    function render() {
      bg(ctx, W, H);
      ctx.fillStyle = '#1a3a5c'; ctx.fillRect(0, ground, W, H-ground);
      ctx.strokeStyle = '#2a5a8c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
      ctx.fillStyle = '#2980b9'; rRect(ctx, s.x-bw/2, ground-bh, bw, bh, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', s.x, ground-bh/2+4);
      if (s.F > 0) drawArrow(ctx, s.x+bw/2, ground-bh/2, s.x+bw/2+s.F*1.2, ground-bh-20, C.RED, 3, 'F='+s.F+'N');
      if (Math.abs(s.a) > 0.1) drawArrow(ctx, s.x+bw/2, ground-bh/2+5, s.x+bw/2+s.a*20, ground-bh/2+5, C.GOLD, 2, 'a='+s.a.toFixed(1));
      drawPanel(ctx, 20, 20, 210, 140, 'Thong so dong luc');
      ctx.fillStyle = '#fff'; ctx.font = '12px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('m = '+s.m+' kg', 30, 45);
      ctx.fillStyle = C.RED; ctx.fillText('F = '+s.F+' N', 30, 65);
      ctx.fillStyle = C.GOLD; ctx.fillText('a = F/m = '+s.a.toFixed(2)+' m/s2', 30, 85);
      ctx.fillStyle = C.BLUE; ctx.fillText('v = '+s.v.toFixed(1)+' px/s', 30, 105);
      ctx.fillStyle = C.DIM; ctx.fillText('t = '+s.t.toFixed(1)+' s', 30, 125);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI'; ctx.fillText('F = ma (Newton II)', 30, 142);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 3: ch3-1-3 - Newton's 3rd Law: F_AB = -F_BA
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-1-3', { chapter: 3, type: 'dynamics', title: 'Dinh luat 3 Newton', hint: 'Ke 2 qua bong, nhan Play', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-1-3'] = function(host) {
    const { lab, ctx, animator, hMgr, W, H } = setupLab(host, 'Dinh luat 3 Newton', 'Ke 2 qua bong, Play', 760, 440);
    const s = { x1: 280, x2: 460, F: 80, colliding: false, collided: false };
    const cy = 200, R1 = 28, R2 = 24;
    function mkHandle(x, y, color, label) {
      const h = { x: x, y: y, color: color, label: label, radius: 10, draggable: true,
        hitTest(wx, wy) { return Math.hypot(wx-this.x, wy-this.y) <= this.radius+10; },
        render(ctx) { ctx.save(); ctx.fillStyle = this.color+'55'; ctx.strokeStyle = this.color; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(this.x, this.y, this.radius+4, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); } };
      return h;
    }
    const h1 = mkHandle(s.x1, cy, C.RED, 'A');
    const h2 = mkHandle(s.x2, cy, C.BLUE, 'B');
    h1.onDrag = function(h) { s.x1 = Math.max(R1+10, Math.min(s.x2-R1-R2-10, h.x)); s.colliding = false; s.collided = false; };
    h2.onDrag = function(h) { s.x2 = Math.max(s.x1+R1+R2+10, Math.min(W-R2-10, h.x)); s.colliding = false; s.collided = false; };
    hMgr.add(h1); hMgr.add(h2);
    lab.addSlider('F', 0, 150, 80, 5, ' N', function(v) { s.F = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Play'; } else { s.colliding = false; s.collided = false; s.x1 = 280; s.x2 = 460; animator.play(); playBtn.textContent = 'Pause'; }
    });
    animator.onTick = function(dt) {
      if (!s.collided) { s.x1 -= 0.05*dt; s.x2 += 0.05*dt; }
      if (s.x2-s.x1 <= R1+R2+2 && !s.colliding) { s.colliding = true; s.collided = true; }
      if (s.x1 < R1+5) s.x1 = R1+5; if (s.x2 > W-R2-5) s.x2 = W-R2-5;
    };
    function render() {
      bg(ctx, W, H);
      ctx.setLineDash([5,5]); ctx.strokeStyle = 'rgba(201,150,58,0.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(50, cy); ctx.lineTo(W-50, cy); ctx.stroke(); ctx.setLineDash([]);
      drawBall(ctx, s.x1, cy, R1, C.RED, '');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('A', s.x1, cy+4);
      drawBall(ctx, s.x2, cy, R2, C.BLUE, '');
      ctx.fillStyle = '#fff'; ctx.fillText('B', s.x2, cy+4);
      drawArrow(ctx, s.x1+R1, cy, s.x2-R2, cy, C.RED, 3, 'FAB='+s.F+'N');
      drawArrow(ctx, s.x2-R2, cy, s.x1+R1, cy, C.BLUE, 3, 'FBA='+(-s.F)+'N');
      if (s.colliding) {
        const cx = (s.x1+s.x2)/2;
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(201,150,58,0.6)'; ctx.fill(); ctx.strokeStyle = C.GOLD; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = C.GOLD; ctx.font = 'bold 9px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('VA CHAM!', cx, cy-18);
      }
      drawPanel(ctx, 20, 20, 200, 120, 'Luc phan ung');
      ctx.fillStyle = '#fff'; ctx.font = '12px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillStyle = C.RED; ctx.fillText('F_AB = '+s.F+' N', 30, 45);
      ctx.fillStyle = C.BLUE; ctx.fillText('F_BA = '+(-s.F)+' N', 30, 65);
      ctx.fillStyle = C.GOLD; ctx.fillText('F_AB = -F_BA', 30, 85);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI'; ctx.fillText('Doi cong huong, nguoc chieu', 30, 105);
      ctx.fillText('(Newton III)', 30, 120);
      ctx.fillStyle = s.colliding ? C.GREEN : 'rgba(255,255,255,0.4)';
      ctx.font = '12px Segoe UI'; ctx.textAlign = 'center';
      ctx.fillText(s.colliding ? 'Dang tuong tac' : 'Dang tien gap', W/2, H-14);
      hMgr.render(ctx);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 4: ch3-2-1 - D'Alembert Principle
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-2-1', { chapter: 3, type: 'dynamics', title: "Nguyen ly D'Alembert", hint: 'F + F* = 0 voi F* = -m*a', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-2-1'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, "Nguyen ly D'Alembert", 'F + F* = 0 voi F* = -m*a', 760, 440);
    const s = { F: 80, m: 5, a: 0 };
    lab.addSlider('F', 0, 200, 80, 5, ' N', function(v) { s.F = v; });
    lab.addSlider('m', 1, 10, 5, 0.5, ' kg', function(v) { s.m = v; });
    animator.onTick = function(dt) { s.a = s.F/s.m; };
    function render() {
      bg(ctx, W, H);
      const fi = -s.m * s.a;
      drawPanel(ctx, 40, 40, 220, 290, 'So do luc thuc');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'center';
      ctx.fillText('VAT (m='+s.m+'kg)', 150, 80);
      drawArrow(ctx, 150, 120, 150, 190, C.RED, 3, 'W=mg='+(s.m*9.8).toFixed(0)+'N');
      drawArrow(ctx, 150, 120, 150, 50, C.BLUE, 3, 'N');
      drawArrow(ctx, 150, 100, 150+s.F*0.8, 60, C.GOLD, 3, 'F='+s.F+'N');
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('SumF = F - mg = '+s.a.toFixed(1)+'N', 50, 245);
      drawPanel(ctx, 310, 40, 220, 290, "D'Alembert");
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'center';
      ctx.fillText('VAT (m='+s.m+'kg)', 420, 80);
      ctx.setLineDash([5,3]);
      drawArrow(ctx, 420, 120, 420, 190, 'rgba(155,89,182,0.8)', 3, 'F*='+fi.toFixed(1)+'N');
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('F+F* = '+(s.F+fi).toFixed(1)+'N', 325, 245);
      ctx.fillStyle = Math.abs(s.F+fi) < 1 ? C.GREEN : C.RED; ctx.font = 'bold 11px Segoe UI';
      ctx.fillText(Math.abs(s.F+fi) < 1 ? 'Can bang!' : 'Chua can bang', 325, 270);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI'; ctx.fillText('F+F*=0 => F=ma', 325, 295);
      ctx.fillText('Inertial force: F* = -m*a', 325, 315);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 5: ch3-2-2 - Dynamic Equilibrium
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-2-2', { chapter: 3, type: 'dynamics', title: 'Can bang dong', hint: 'SumF = m*a', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-2-2'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Can bang dong', 'SumF = m*a', 760, 440);
    const s = { F: 80, m: 5, a: 0 };
    const ground = 340, bw = 80, bh = 50;
    lab.addSlider('F', 0, 200, 80, 5, ' N', function(v) { s.F = v; });
    lab.addSlider('m', 1, 10, 5, 0.5, ' kg', function(v) { s.m = v; });
    animator.onTick = function(dt) { s.a = s.F/s.m; };
    function render() {
      bg(ctx, W, H);
      ctx.fillStyle = '#1a3a5c'; ctx.fillRect(0, ground, W, H-ground);
      ctx.strokeStyle = '#2a5a8c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
      ctx.fillStyle = '#2980b9'; rRect(ctx, 280-bw/2, ground-bh, bw, bh, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', 280, ground-bh/2+4);
      drawArrow(ctx, 280+bw/2, ground-bh/2, 280+bw/2+s.F*0.8, ground-bh-10, C.RED, 3, 'F='+s.F+'N');
      drawArrow(ctx, 280, ground-bh, 280, ground-bh-s.m*9.8*0.3, C.GREEN, 3, 'W=mg');
      drawArrow(ctx, 280, ground-bh, 280, 60, C.BLUE, 3, 'N');
      drawArrow(ctx, 280+bw/2, ground-bh/2+5, 280+bw/2+s.a*15, ground-bh/2+5, C.GOLD, 2, 'a='+s.a.toFixed(1));
      drawPanel(ctx, 40, 40, 220, 170, 'Phuong trinh dong luc');
      ctx.fillStyle = '#fff'; ctx.font = '13px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('SumF = m * a', 50, 65);
      ctx.fillStyle = C.RED; ctx.fillText('F = '+s.F+' N', 50, 90);
      ctx.fillStyle = C.GREEN; ctx.fillText('mg = '+(s.m*9.8).toFixed(1)+' N', 50, 110);
      ctx.fillStyle = C.BLUE; ctx.fillText('N = mg', 50, 130);
      ctx.fillStyle = C.GOLD; ctx.font = 'bold 12px Segoe UI'; ctx.fillText('=> a = '+s.a.toFixed(2)+' m/s2', 50, 155);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI'; ctx.fillText('N+F-W = ma (ngang)', 50, 175);
      drawPanel(ctx, 40, 220, 220, 90, 'Dong luong');
      const p = s.m * s.a * 10;
      ctx.fillStyle = C.KE; ctx.fillRect(50, 240, Math.min(Math.abs(p), 200), 20);
      ctx.fillStyle = '#fff'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('p = m*a = '+p.toFixed(1), 50, 280);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 6: ch3-3-1 - Mass-Spring (undamped)
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-3-1', { chapter: 3, type: 'dynamics', title: 'Dao dong lo xo', hint: 'Ke A, dieu chinh k va m', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-3-1'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Dao dong lo xo', 'Ke A, dieu chinh k va m', 760, 440);
    const s = { A: 80, k: 20, m: 2, t: 0, x: 80, v: 0, omega: 0, T: 0, trail: [] };
    const wallX = 100, attachY = 60, bw = 60, bh = 40;
    lab.addSlider('A', 10, 150, 80, 5, ' px', function(v) { s.A = v; });
    lab.addSlider('k', 5, 50, 20, 1, ' N/m', function(v) { s.k = v; s.omega = Math.sqrt(s.k/s.m); s.T = 2*Math.PI/s.omega; });
    lab.addSlider('m', 0.5, 5, 2, 0.1, ' kg', function(v) { s.m = v; s.omega = Math.sqrt(s.k/s.m); s.T = 2*Math.PI/s.omega; });
    s.omega = Math.sqrt(s.k/s.m); s.T = 2*Math.PI/s.omega;
    animator.onTick = function(dt) {
      s.t += dt/1000;
      s.x = s.A * Math.cos(s.omega * s.t);
      s.v = -s.A * s.omega * Math.sin(s.omega * s.t);
      s.trail.push({t: s.t, x: s.x});
      if (s.trail.length > 200) s.trail.shift();
    };
    function render() {
      bg(ctx, W, H);
      ctx.fillStyle = '#34495e'; ctx.fillRect(0, attachY, wallX, 320);
      ctx.strokeStyle = '#5d6d7e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wallX, attachY); ctx.lineTo(wallX, 400); ctx.stroke();
      const blockX = wallX + 30 + s.x;
      ctx.strokeStyle = C.GREEN; ctx.lineWidth = 3;
      drawSpring(ctx, wallX, attachY+20, blockX, attachY+20, 8, 0.8+s.x/s.A);
      ctx.fillStyle = '#7f8c8d'; rRect(ctx, blockX-bw/2, attachY+20, bw, bh, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', blockX, attachY+40);
      ctx.setLineDash([5,5]); ctx.strokeStyle = 'rgba(201,150,58,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(wallX, attachY+20+bh/2); ctx.lineTo(W, attachY+20+bh/2); ctx.stroke(); ctx.setLineDash([]);
      if (s.trail.length > 2) {
        ctx.strokeStyle = 'rgba(39,174,96,0.4)'; ctx.lineWidth = 2; ctx.beginPath();
        s.trail.forEach(function(p, i) {
          const gx = 450 + p.t * 20;
          const gy = 220 - p.x * 0.8;
          if (i===0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
        }); ctx.stroke();
      }
      const KE = 0.5*s.m*s.v*s.v/1000;
      const PE = 0.5*s.k*s.x*s.x/1000;
      drawEnergyBar(ctx, 20, 20, KE, PE, 50);
      drawPanel(ctx, 20, 120, 200, 130, 'Thong so dao dong');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('A = '+s.A+' px', 30, 140);
      ctx.fillText('k = '+s.k+' N/m', 30, 158);
      ctx.fillText('m = '+s.m+' kg', 30, 176);
      ctx.fillStyle = C.GOLD; ctx.fillText('w = sqrt(k/m) = '+s.omega.toFixed(2), 30, 196);
      ctx.fillText('T = 2pi/w = '+s.T.toFixed(2)+' s', 30, 214);
      ctx.fillStyle = C.DIM; ctx.fillText('x(t) = A*cos(wt)', 30, 232);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 7: ch3-3-2 - Coupled Oscillators
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-3-2', { chapter: 3, type: 'dynamics', title: 'Dao dong lien ket', hint: '2 khoi noi 3 lo xo', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-3-2'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Dao dong lien ket', '2 khoi noi 3 lo xo', 760, 440);
    const s = { x1: 60, x2: -60, v1: 0, v2: 0, m: 2, k: 20, t: 0 };
    const attachL = 80, bw = 50, bh = 36, midY = 180;
    lab.addSlider('k', 5, 50, 20, 1, ' N/m', function(v) { s.k = v; });
    lab.addSlider('m', 0.5, 5, 2, 0.1, ' kg', function(v) { s.m = v; });
    lab.addSlider('x1', -150, 150, 60, 5, ' px', function(v) { s.x1 = v; });
    animator.onTick = function(dt) {
      const a1 = s.k/s.m * (s.x2 - s.x1);
      const a2 = -s.k/s.m * (s.x2 - s.x1);
      s.v1 += a1 * dt/1000; s.v2 += a2 * dt/1000;
      s.x1 += s.v1 * dt/1000; s.x2 += s.v2 * dt/1000;
      s.t += dt/1000;
    };
    function render() {
      bg(ctx, W, H);
      ctx.fillStyle = '#34495e'; ctx.fillRect(0, midY-80, 30, 200);
      ctx.fillRect(W-30, midY-80, 30, 200);
      const b1x = attachL+60+s.x1, b2x = attachL+200+s.x2;
      ctx.strokeStyle = C.GREEN; ctx.lineWidth = 3;
      drawSpring(ctx, attachL+15, midY, b1x, midY, 8, 1+s.x1/100);
      drawSpring(ctx, b1x+bw, midY, b2x, midY, 8, 1+(s.x2-s.x1)/100);
      drawSpring(ctx, b2x+bw, midY, W-15, midY, 8, 1+s.x2/100);
      ctx.fillStyle = C.RED; rRect(ctx, b1x, midY-bh/2, bw, bh, 4); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m1', b1x+bw/2, midY+4);
      ctx.fillStyle = C.BLUE; rRect(ctx, b2x, midY-bh/2, bw, bh, 4); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillText('m2', b2x+bw/2, midY+4);
      drawPanel(ctx, 20, 20, 220, 130, 'Toa do & Van toc');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillStyle = C.RED; ctx.fillText('x1 = '+(b1x-attachL-60).toFixed(1)+' px', 30, 42);
      ctx.fillText('v1 = '+s.v1.toFixed(2)+' px/s', 30, 60);
      ctx.fillStyle = C.BLUE; ctx.fillText('x2 = '+(b2x-attachL-200).toFixed(1)+' px', 30, 80);
      ctx.fillText('v2 = '+s.v2.toFixed(2)+' px/s', 30, 98);
      ctx.fillStyle = C.GOLD; ctx.font = '10px Segoe UI';
      ctx.fillText('Mode: beat pattern', 30, 120);
      ctx.fillText('w ~ sqrt(k/m) = '+Math.sqrt(s.k/s.m).toFixed(2), 30, 136);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 8: ch3-3-3 - Damped Oscillation
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-3-3', { chapter: 3, type: 'dynamics', title: 'Dao dong tieu tan', hint: 'Dieu chinh he so cau c (damping)', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-3-3'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Dao dong tieu tan', 'Dieu chinh c (he so can)', 760, 440);
    const s = { A: 80, k: 20, m: 2, c: 2, t: 0, x: 80, v: 0, trail: [] };
    const wallX = 100, attachY = 60, bw = 60, bh = 40;
    lab.addSlider('A', 10, 150, 80, 5, ' px', function(v) { s.A = v; });
    lab.addSlider('k', 5, 50, 20, 1, ' N/m', function(v) { s.k = v; });
    lab.addSlider('c', 0, 20, 2, 0.5, ' kg/s', function(v) { s.c = v; });
    lab.addSlider('m', 0.5, 5, 2, 0.1, ' kg', function(v) { s.m = v; });
    const zeta = function() { return s.c / (2 * Math.sqrt(s.k * s.m)); };
    const omega_d = function() { return Math.sqrt(Math.max(0, s.k/s.m - Math.pow(s.c/(2*s.m), 2))); };
    animator.onTick = function(dt) {
      s.t += dt/1000;
      const z = zeta(), om = omega_d();
      if (z < 1) {
        s.x = s.A * Math.exp(-s.c/(2*s.m)*s.t) * Math.cos(om*s.t);
        const decay = Math.exp(-s.c/(2*s.m)*s.t);
        s.v = -s.A*decay*(s.c/(2*s.m)*Math.cos(om*s.t)+om*Math.sin(om*s.t));
      } else {
        const sq = Math.sqrt(Math.pow(s.c/(2*s.m), 2) - s.k/s.m);
        s.x = (s.A/2)*Math.exp(-s.c/(2*s.m)*s.t)*(Math.exp(sq*s.t)+Math.exp(-sq*s.t));
        s.v = -(s.A/2)*s.c/(2*s.m)*Math.exp(-s.c/(2*s.m)*s.t)*(Math.exp(sq*s.t)+Math.exp(-sq*s.t));
      }
      s.trail.push({t: s.t, x: s.x});
      if (s.trail.length > 200) s.trail.shift();
    };
    function render() {
      bg(ctx, W, H);
      ctx.fillStyle = '#34495e'; ctx.fillRect(0, attachY, wallX, 320);
      const blockX = wallX+30+s.x*0.5;
      ctx.strokeStyle = C.GREEN; ctx.lineWidth = 3;
      drawSpring(ctx, wallX, attachY+20, blockX, attachY+20, 8, 0.8+s.x*0.005);
      ctx.fillStyle = '#7f8c8d'; rRect(ctx, blockX-bw/2, attachY+20, bw, bh, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', blockX, attachY+40);
      if (s.trail.length > 2) {
        ctx.strokeStyle = 'rgba(39,174,96,0.4)'; ctx.lineWidth = 2; ctx.beginPath();
        s.trail.forEach(function(p, i) {
          const gx = 400 + p.t*8;
          const gy = 200 - p.x*0.5;
          if (gx < 50 || gx > W) return;
          if (i===0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
        }); ctx.stroke();
      }
      const z = zeta();
      const status = z < 1 ? 'Underdamped' : z < 1.01 ? 'Critical' : 'Overdamped';
      const statusColor = z < 1 ? C.GREEN : z < 1.01 ? C.GOLD : C.RED;
      drawPanel(ctx, 20, 20, 220, 170, 'Dieu kien tieu tan');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('k = '+s.k+' N/m', 30, 42);
      ctx.fillText('c = '+s.c.toFixed(1)+' kg/s', 30, 60);
      ctx.fillText('m = '+s.m+' kg', 30, 78);
      ctx.fillStyle = C.GOLD; ctx.fillText('zeta = c/(2*sqrt(km))', 30, 98);
      ctx.fillText('zeta = '+z.toFixed(3), 30, 116);
      ctx.fillStyle = statusColor; ctx.font = 'bold 12px Segoe UI'; ctx.fillText(status, 30, 138);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      const desc = z < 1 ? 'Dao dong giam dan' : z < 1.01 ? 'Tieu tan nhanh nhat' : 'Khong dao dong';
      ctx.fillText(desc, 30, 158);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 9: ch3-4-1 - Center of Mass (2 particles)
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-4-1', { chapter: 3, type: 'dynamics', title: 'Khoi tam 2 chat diem', hint: 'Ke 2 chat diem, xem khoi tam', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-4-1'] = function(host) {
    const { lab, ctx, animator, hMgr, W, H } = setupLab(host, 'Khoi tam 2 chat diem', 'Ke 2 chat diem', 760, 440);
    const s = { x1: 200, y1: 200, x2: 500, y2: 250, m1: 3, m2: 2 };
    const R1 = 25, R2 = 20;
    function mkHandle(x, y, color, label) {
      const h = { x: x, y: y, color: color, label: label, radius: 12, draggable: true,
        hitTest(wx, wy) { return Math.hypot(wx-this.x, wy-this.y) <= this.radius+8; },
        render(ctx) { ctx.save(); ctx.fillStyle = this.color+'55'; ctx.strokeStyle = this.color; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(this.x, this.y, this.radius+4, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); } };
      return h;
    }
    const h1 = mkHandle(s.x1, s.y1, C.RED, 'm1');
    const h2 = mkHandle(s.x2, s.y2, C.BLUE, 'm2');
    h1.onDrag = function(h) { s.x1 = Math.max(30, Math.min(W-30, h.x)); s.y1 = Math.max(30, Math.min(H-30, h.y)); };
    h2.onDrag = function(h) { s.x2 = Math.max(30, Math.min(W-30, h.x)); s.y2 = Math.max(30, Math.min(H-30, h.y)); };
    hMgr.add(h1); hMgr.add(h2);
    lab.addSlider('m1', 1, 6, 3, 0.5, ' kg', function(v) { s.m1 = v; });
    lab.addSlider('m2', 1, 6, 2, 0.5, ' kg', function(v) { s.m2 = v; });
    let animating = false;
    const playBtn = lab.addButton('Play', function() {
      animating = !animating;
      playBtn.textContent = animating ? 'Stop' : 'Play';
      if (animating) animator.play(); else animator.pause();
    });
    animator.onTick = function(dt) {
      if (!animating) return;
      s.x1 += 0.1*dt; s.y1 += 0.05*dt;
      s.x2 -= 0.08*dt; s.y2 -= 0.03*dt;
    };
    function render() {
      bg(ctx, W, H);
      const mt = s.m1+s.m2;
      const xCM = (s.x1*s.m1 + s.x2*s.m2)/mt;
      const yCM = (s.y1*s.m1 + s.y2*s.m2)/mt;
      ctx.setLineDash([5,5]); ctx.strokeStyle = 'rgba(201,150,58,0.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xCM, 0); ctx.lineTo(xCM, H); ctx.moveTo(0, yCM); ctx.lineTo(W, yCM); ctx.stroke(); ctx.setLineDash([]);
      ctx.setLineDash([3,3]); ctx.strokeStyle = 'rgba(201,150,58,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(xCM, yCM); ctx.moveTo(s.x2, s.y2); ctx.lineTo(xCM, yCM); ctx.stroke(); ctx.setLineDash([]);
      drawBall(ctx, s.x1, s.y1, R1+s.m1*3, C.RED, '');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m1='+s.m1+'kg', s.x1, s.y1+4);
      drawBall(ctx, s.x2, s.y2, R2+s.m2*3, C.BLUE, '');
      ctx.fillStyle = '#fff'; ctx.fillText('m2='+s.m2+'kg', s.x2, s.y2+4);
      ctx.beginPath(); ctx.arc(xCM, yCM, 10, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(201,150,58,0.4)'; ctx.fill(); ctx.strokeStyle = C.GOLD; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = C.GOLD; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('C', xCM, yCM+4);
      drawPanel(ctx, 20, 20, 210, 140, 'Khoi tam');
      ctx.fillStyle = '#fff'; ctx.font = '12px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('r_CM = (m1*r1 + m2*r2)/(m1+m2)', 30, 42);
      ctx.fillStyle = C.GOLD; ctx.fillText('x_CM = '+xCM.toFixed(1)+' px', 30, 65);
      ctx.fillText('y_CM = '+yCM.toFixed(1)+' px', 30, 85);
      ctx.fillStyle = '#fff'; ctx.fillText('m_total = '+mt+' kg', 30, 105);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('Khoi tam di chuyen deu', 30, 125);
      ctx.fillText('khi khong co luc ngoai', 30, 140);
      hMgr.render(ctx);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 10: ch3-4-2 - COM Theorem
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-4-2', { chapter: 3, type: 'dynamics', title: 'Dinh ly khoi tam', hint: 'm*a_CM = SumF_ext', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-4-2'] = function(host) {
    const { lab, ctx, animator, hMgr, W, H } = setupLab(host, 'Dinh ly khoi tam', 'm*a_CM = SumF_ext', 760, 440);
    const s = { x1: 200, y1: 200, x2: 500, y2: 250, m1: 3, m2: 2, F: 80, t: 0 };
    const R1 = 25, R2 = 20;
    function mkHandle(x, y, color, label) {
      const h = { x: x, y: y, color: color, label: label, radius: 12, draggable: true,
        hitTest(wx, wy) { return Math.hypot(wx-this.x, wy-this.y) <= this.radius+8; },
        render(ctx) { ctx.save(); ctx.fillStyle = this.color+'55'; ctx.strokeStyle = this.color; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(this.x, this.y, this.radius+4, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); } };
      return h;
    }
    const h1 = mkHandle(s.x1, s.y1, C.RED, 'm1');
    const h2 = mkHandle(s.x2, s.y2, C.BLUE, 'm2');
    h1.onDrag = function(h) { s.x1 = h.x; s.y1 = h.y; };
    h2.onDrag = function(h) { s.x2 = h.x; s.y2 = h.y; };
    hMgr.add(h1); hMgr.add(h2);
    lab.addSlider('F', 0, 150, 80, 5, ' N', function(v) { s.F = v; });
    lab.addSlider('m1', 1, 6, 3, 0.5, ' kg', function(v) { s.m1 = v; });
    lab.addSlider('m2', 1, 6, 2, 0.5, ' kg', function(v) { s.m2 = v; });
    let animating = false;
    const playBtn = lab.addButton('Play', function() {
      animating = !animating;
      playBtn.textContent = animating ? 'Stop' : 'Play';
      if (animating) animator.play(); else animator.pause();
    });
    animator.onTick = function(dt) {
      s.t += dt/1000;
      const mt = s.m1+s.m2;
      const aCM = s.F/mt;
      s.x1 += aCM*dt/1000; s.x2 += aCM*dt/1000;
    };
    function render() {
      bg(ctx, W, H);
      const mt = s.m1+s.m2;
      const xCM = (s.x1*s.m1+s.x2*s.m2)/mt;
      const yCM = (s.y1*s.m1+s.y2*s.m2)/mt;
      const aCM = s.F/mt;
      const vCM = aCM*10;
      drawBall(ctx, s.x1, s.y1, R1+s.m1*3, C.RED, '');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m1', s.x1, s.y1+4);
      drawBall(ctx, s.x2, s.y2, R2+s.m2*3, C.BLUE, '');
      ctx.fillStyle = '#fff'; ctx.fillText('m2', s.x2, s.y2+4);
      ctx.beginPath(); ctx.arc(xCM, yCM, 10, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(201,150,58,0.4)'; ctx.fill(); ctx.strokeStyle = C.GOLD; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = C.GOLD; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('C', xCM, yCM+4);
      if (Math.abs(vCM) > 0.1) drawArrow(ctx, xCM, yCM, xCM+vCM*2, yCM, C.GOLD, 3, 'v_CM='+vCM.toFixed(1));
      drawArrow(ctx, xCM, yCM, xCM+s.F*0.8, yCM-s.F*0.3, C.RED, 3, 'SumF='+s.F+'N');
      drawPanel(ctx, 20, 20, 220, 160, 'Dinh ly khoi tam');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('m_CM * a_CM = SumF_ext', 30, 42);
      ctx.fillText('('+mt+') * ('+aCM.toFixed(2)+') = '+s.F, 30, 65);
      ctx.fillStyle = C.GOLD;
      ctx.fillText('a_CM = '+aCM.toFixed(2)+' m/s2', 30, 88);
      ctx.fillText('v_CM = '+vCM.toFixed(1)+' px/s', 30, 108);
      ctx.fillStyle = Math.abs(mt*aCM-s.F)<0.5 ? C.GREEN : C.RED; ctx.font = 'bold 11px Segoe UI';
      ctx.fillText(Math.abs(mt*aCM-s.F)<0.5 ? 'Dung!' : 'Loi!', 30, 130);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('v_CM = const (F=0)', 30, 150);
      hMgr.render(ctx);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 11: ch3-5-1 - Impulse-Momentum (linear)
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-5-1', { chapter: 3, type: 'dynamics', title: 'Xung luong - Dong luong', hint: 'm*dv = J', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-5-1'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Xung luong - Dong luong', 'm*dv = J', 760, 440);
    const s = { m: 2, v_before: 5, v_after: 5, J: 20, collided: false, ballX: 150, t: 0 };
    const cy = 200, R = 28;
    lab.addSlider('m', 0.5, 5, 2, 0.1, ' kg', function(v) { s.m = v; });
    lab.addSlider('v', 0, 15, 5, 0.5, ' m/s', function(v) { s.v_before = v; });
    lab.addSlider('J', -50, 50, 20, 1, ' N*s', function(v) { s.J = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Play'; } else { s.ballX = 150; s.collided = false; s.v_after = s.v_before; animator.play(); playBtn.textContent = 'Pause'; }
    });
    animator.onTick = function(dt) {
      s.t += dt/1000;
      if (!s.collided && s.ballX >= 380) { s.collided = true; s.v_after = s.v_before + s.J/s.m; }
      if (s.collided) s.ballX += s.v_after*dt/10;
      else s.ballX += s.v_before*dt/10;
      if (s.ballX > W) s.ballX = 50;
    };
    function render() {
      bg(ctx, W, H);
      drawBall(ctx, s.ballX, cy, R, C.RED, '');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', s.ballX, cy+4);
      if (s.collided) {
        if (Math.abs(s.v_after) > 0.1) drawArrow(ctx, s.ballX+R, cy, s.ballX+R+s.v_after*10, cy, C.BLUE, 3, 'v='+s.v_after.toFixed(1));
      } else {
        if (s.ballX < 380) drawArrow(ctx, s.ballX+R, cy, s.ballX+R+s.v_before*10, cy, C.RED, 3, 'v='+s.v_before.toFixed(1));
      }
      const J_arrowX = 380;
      ctx.setLineDash([5,3]); ctx.strokeStyle = 'rgba(201,150,58,0.4)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(J_arrowX, cy-40); ctx.lineTo(J_arrowX, cy+40); ctx.stroke(); ctx.setLineDash([]);
      if (Math.abs(s.J) > 0.5) {
        const J_dir = s.J > 0 ? 1 : -1;
        drawArrow(ctx, J_arrowX, cy, J_arrowX + s.J*0.5*J_dir, cy, C.GOLD, 3, 'J='+s.J.toFixed(0));
      }
      drawPanel(ctx, 20, 20, 220, 170, 'Xung luong - Dong luong');
      ctx.fillStyle = '#fff'; ctx.font = '12px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('m = '+s.m+' kg', 30, 45);
      ctx.fillStyle = C.RED; ctx.fillText('v_truoc = '+s.v_before.toFixed(1)+' m/s', 30, 65);
      ctx.fillStyle = C.GOLD; ctx.fillText('J = '+s.J+' N*s', 30, 85);
      const dp = s.m * s.J;
      ctx.fillStyle = C.GREEN; ctx.fillText('dp = m*J = '+dp.toFixed(1), 30, 105);
      ctx.fillStyle = s.collided ? C.BLUE : C.RED;
      ctx.fillText('v_sau = '+s.v_after.toFixed(2)+' m/s', 30, 125);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('m*dv = J', 30, 145);
      ctx.fillText('dv = J/m = '+(s.J/s.m).toFixed(2), 30, 162);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 12: ch3-5-2 - Angular Impulse-Momentum
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-5-2', { chapter: 3, type: 'dynamics', title: 'Xung luong goc - Momen dong luong', hint: 'I*domega = H', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-5-2'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Xung luong goc', 'I*domega = H', 760, 440);
    const s = { I: 1, omega: 2, H: 5, t: 0, angle: 0, applied: false };
    const cx = 380, cy = 220, diskR = 80, m = 2;
    lab.addSlider('I', 0.5, 5, 1, 0.1, ' kg*m2', function(v) { s.I = v; });
    lab.addSlider('omega', 0, 8, 2, 0.1, ' rad/s', function(v) { s.omega = v; });
    lab.addSlider('H', -20, 20, 5, 0.5, ' N*m*s', function(v) { s.H = v; });
    const applyBtn = lab.addButton('Apply H', function() { s.omega += s.H/s.I; });
    animator.onTick = function(dt) { s.t += dt/1000; s.angle += s.omega*dt/1000; };
    function render() {
      bg(ctx, W, H);
      const L = s.I * s.omega;
      // Disk
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(s.angle);
      ctx.beginPath(); ctx.arc(0, 0, diskR, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(52,152,219,0.2)'; ctx.fill(); ctx.strokeStyle = C.BLUE; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = C.GOLD; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(diskR, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -diskR); ctx.stroke();
      ctx.restore();
      // Center marker
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2);
      ctx.fillStyle = C.GOLD; ctx.fill();
      // Tangential force arrow
      const fx = cx + Math.cos(s.angle) * diskR, fy = cy + Math.sin(s.angle) * diskR;
      drawArrow(ctx, fx, fy, fx + (-Math.sin(s.angle)*20), fy + (Math.cos(s.angle)*20), C.RED, 3, 'F_t');
      drawPanel(ctx, 20, 20, 220, 170, 'Momen dong luong');
      ctx.fillStyle = '#fff'; ctx.font = '12px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('I = '+s.I+' kg*m2', 30, 45);
      ctx.fillText('omega = '+s.omega.toFixed(2)+' rad/s', 30, 65);
      ctx.fillStyle = C.GOLD; ctx.fillText('H = '+s.H+' N*m*s', 30, 85);
      ctx.fillText('L = I*omega', 30, 105);
      ctx.fillStyle = C.GREEN; ctx.font = 'bold 12px Segoe UI';
      ctx.fillText('L = '+L.toFixed(2)+' kg*m2/s', 30, 130);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('dL = H*dt', 30, 150);
      ctx.fillText('(Tangential force)', 30, 168);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 13: ch3-6-1 - Work-Energy Theorem
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-6-1', { chapter: 3, type: 'dynamics', title: 'Dinh ly cong - Dong nang', hint: 'W = F*d*cos(theta)', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-6-1'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Dinh ly cong - Dong nang', 'W = F*d*cos(theta)', 760, 440);
    const s = { F: 50, theta: 0, d: 0, m: 5, v: 0, K_init: 0, t: 0, x: 100 };
    const ground = 340, bw = 60, bh = 40;
    lab.addSlider('F', 0, 150, 50, 5, ' N', function(v) { s.F = v; });
    lab.addSlider('theta', -60, 60, 0, 5, ' deg', function(v) { s.theta = v; });
    lab.addSlider('m', 1, 10, 5, 0.5, ' kg', function(v) { s.m = v; });
    const playBtn = lab.addButton('Push', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Push'; } else { s.x = 100; s.d = 0; s.v = 0; s.K_init = 0; animator.play(); playBtn.textContent = 'Pause'; }
    });
    animator.onTick = function(dt) {
      s.t += dt/1000;
      const theta = s.theta * Math.PI / 180;
      const a = (s.F * Math.cos(theta)) / s.m;
      s.v += a * dt/1000;
      s.x += s.v * dt/1000;
      s.d += s.v * dt/1000;
      if (s.K_init === 0) s.K_init = kineticE(s.m, s.v);
    };
    function render() {
      bg(ctx, W, H);
      ctx.fillStyle = '#1a3a5c'; ctx.fillRect(0, ground, W, H-ground);
      ctx.strokeStyle = '#2a5a8c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
      ctx.fillStyle = '#8e44ad'; rRect(ctx, s.x-bw/2, ground-bh, bw, bh, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', s.x, ground-bh/2+4);
      const theta = s.theta * Math.PI / 180;
      const Fx = s.F * Math.cos(theta), Fy = -s.F * Math.sin(theta);
      drawArrow(ctx, s.x+bw/2, ground-bh/2, s.x+bw/2+Fx*0.8, ground-bh/2+ Fy*0.8, C.RED, 3, 'F='+s.F+'N');
      // Work area
      if (s.d > 5) {
        ctx.fillStyle = 'rgba(201,150,58,0.1)';
        ctx.fillRect(s.x+bw/2, ground-bh/2-20, s.d, 40);
        ctx.strokeStyle = 'rgba(201,150,58,0.4)'; ctx.lineWidth = 1;
        ctx.strokeRect(s.x+bw/2, ground-bh/2-20, s.d, 40);
      }
      const W_val = s.F * s.d * Math.cos(theta);
      const K_now = kineticE(s.m, s.v);
      drawPanel(ctx, 20, 20, 220, 170, 'Cong - Dong nang');
      ctx.fillStyle = '#fff'; ctx.font = '12px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('F = '+s.F+' N', 30, 45);
      ctx.fillText('theta = '+s.theta+' deg', 30, 65);
      ctx.fillText('d = '+s.d.toFixed(1)+' m', 30, 85);
      ctx.fillStyle = C.GOLD; ctx.fillText('W = '+W_val.toFixed(1)+' J', 30, 105);
      ctx.fillStyle = C.RED; ctx.fillText('K_init = '+s.K_init.toFixed(1)+' J', 30, 125);
      ctx.fillStyle = C.GREEN; ctx.fillText('K_final = '+K_now.toFixed(1)+' J', 30, 145);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('W = F*d*cos(theta)', 30, 165);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 14: ch3-6-2 - Potential Energy (incline)
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-6-2', { chapter: 3, type: 'dynamics', title: 'The nang va Dong nang', hint: 'KE + PE = const', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-6-2'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'The nang va Dong nang', 'KE + PE = const', 760, 440);
    const s = { m: 2, h: 0, v: 0, g: 9.8, t: 0, x: 0, onIncline: true };
    const ground = 340, bw = 60, bh = 40, slope = 0.5;
    lab.addSlider('m', 0.5, 5, 2, 0.1, ' kg', function(v) { s.m = v; });
    lab.addButton('Reset', function() { s.x = 0; s.v = 0; s.h = 100; animator.stop(); });
    lab.addButton('Play', function() { if (!animator.isRunning()) { s.h = 100; animator.play(); } else animator.pause(); });
    s.h = 100;
    animator.onTick = function(dt) {
      s.t += dt/1000;
      const a = s.g * slope;
      s.v -= a * dt/1000;
      s.x += s.v * dt/1000;
      s.h = Math.max(0, 100 - s.x * slope);
      if (s.h <= 0) { s.h = 0; s.v = 0; animator.pause(); }
    };
    function render() {
      bg(ctx, W, H);
      // Incline plane
      const inclineH = 200, inclineL = 500;
      ctx.fillStyle = '#1a3a5c'; ctx.beginPath(); ctx.moveTo(50, ground); ctx.lineTo(50+inclineL, ground-inclineH); ctx.lineTo(50+inclineL, ground); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2a5a8c'; ctx.lineWidth = 2; ctx.stroke();
      // Object on incline
      const objX = 50 + s.x, objY = ground - s.x * slope;
      ctx.fillStyle = '#8e44ad'; rRect(ctx, objX-bw/2, objY-bh, bw, bh, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', objX, objY-bh/2+4);
      const KE = kineticE(s.m, s.v);
      const PE = s.m * s.g * s.h/50;
      const E = KE + PE;
      drawEnergyBar(ctx, 20, 20, KE, PE, 60);
      drawPanel(ctx, 20, 120, 200, 140, 'Thong so');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('h = '+s.h.toFixed(1)+' m', 30, 142);
      ctx.fillText('v = '+Math.abs(s.v).toFixed(2)+' m/s', 30, 162);
      ctx.fillStyle = C.KE; ctx.fillText('K = '+KE.toFixed(1)+' J', 30, 182);
      ctx.fillStyle = C.PE; ctx.fillText('V = '+PE.toFixed(1)+' J', 30, 200);
      ctx.fillStyle = C.TOTAL; ctx.font = 'bold 11px Segoe UI';
      ctx.fillText('E = '+E.toFixed(1)+' J', 30, 222);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('KE+PE = const', 30, 242);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 15: ch3-6-3 - Conservation of Energy (spring)
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-6-3', { chapter: 3, type: 'dynamics', title: 'Bao toan nang luong', hint: 'Spring oscillation: E_total = const', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-6-3'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Bao toan nang luong', 'Spring oscillation: E_total = const', 760, 440);
    const s = { A: 80, k: 20, m: 2, t: 0, omega: 0 };
    s.omega = Math.sqrt(s.k/s.m);
    const wallX = 100, attachY = 60, bw = 60, bh = 40;
    lab.addSlider('A', 10, 150, 80, 5, ' px', function(v) { s.A = v; });
    lab.addSlider('k', 5, 50, 20, 1, ' N/m', function(v) { s.k = v; s.omega = Math.sqrt(s.k/s.m); });
    lab.addSlider('m', 0.5, 5, 2, 0.1, ' kg', function(v) { s.m = v; s.omega = Math.sqrt(s.k/s.m); });
    animator.onTick = function(dt) { s.t += dt/1000; };
    function render() {
      bg(ctx, W, H);
      ctx.fillStyle = '#34495e'; ctx.fillRect(0, attachY, wallX, 320);
      const x = s.A * Math.cos(s.omega * s.t);
      const v = -s.A * s.omega * Math.sin(s.omega * s.t);
      const blockX = wallX + 30 + x;
      ctx.strokeStyle = C.GREEN; ctx.lineWidth = 3;
      drawSpring(ctx, wallX, attachY+20, blockX, attachY+20, 8, 0.8+x/s.A);
      ctx.fillStyle = '#7f8c8d'; rRect(ctx, blockX-bw/2, attachY+20, bw, bh, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', blockX, attachY+40);
      const KE = 0.5*s.m*v*v/1000;
      const PE = 0.5*s.k*x*x/1000;
      const E = KE + PE;
      const E0 = 0.5*s.k*s.A*s.A/1000;
      const dE_pct = E0 > 0 ? Math.abs((E-E0)/E0*100) : 0;
      drawEnergyBar(ctx, 20, 20, KE, PE, 60);
      drawPanel(ctx, 20, 120, 210, 150, 'Nang luong');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillStyle = C.KE; ctx.fillText('K = '+KE.toFixed(3)+' J', 30, 142);
      ctx.fillStyle = C.PE; ctx.fillText('V = '+PE.toFixed(3)+' J', 30, 162);
      ctx.fillStyle = C.TOTAL; ctx.font = 'bold 12px Segoe UI';
      ctx.fillText('E_total = '+E.toFixed(3)+' J', 30, 185);
      ctx.fillStyle = dE_pct < 1 ? C.GREEN : C.RED; ctx.font = '11px Segoe UI';
      ctx.fillText('Delta E = '+dE_pct.toFixed(2)+'%', 30, 208);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('(should be ~0%)', 30, 226);
      ctx.fillText('Verified: E = const', 30, 244);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 16: ch3-6-4 - Power
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-6-4', { chapter: 3, type: 'dynamics', title: 'Cong suat', hint: 'P = F*v', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-6-4'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Cong suat', 'P = F*v', 760, 440);
    const s = { F: 50, m: 5, v: 0, a: 0, t: 0, x: 150 };
    const ground = 340, bw = 80, bh = 50;
    lab.addSlider('F', 0, 200, 50, 5, ' N', function(v) { s.F = v; });
    lab.addSlider('m', 1, 10, 5, 0.5, ' kg', function(v) { s.m = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Play'; } else { s.v = 0; s.x = 150; animator.play(); playBtn.textContent = 'Pause'; }
    });
    animator.onTick = function(dt) {
      s.t += dt/1000;
      s.a = s.F / s.m;
      s.v += s.a * dt/1000;
      s.x += s.v * dt/1000;
      if (s.x > W-40) { s.x = W-40; s.v = 0; }
    };
    function render() {
      bg(ctx, W, H);
      ctx.fillStyle = '#1a3a5c'; ctx.fillRect(0, ground, W, H-ground);
      ctx.strokeStyle = '#2a5a8c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
      ctx.fillStyle = '#2980b9'; rRect(ctx, s.x-bw/2, ground-bh, bw, bh, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m='+s.m+'kg', s.x, ground-bh/2+4);
      if (s.F > 0) drawArrow(ctx, s.x+bw/2, ground-bh/2, s.x+bw/2+s.F*0.8, ground-bh-20, C.RED, 3, 'F='+s.F+'N');
      if (Math.abs(s.v) > 0.1) drawArrow(ctx, s.x+bw/2, ground-bh/2+5, s.x+bw/2+s.v*3, ground-bh/2+5, C.BLUE, 2, 'v='+s.v.toFixed(1));
      const P = s.F * s.v;
      const P_max = s.F * (s.F/s.m * 10);
      drawPanel(ctx, 20, 20, 220, 170, 'Cong suat');
      ctx.fillStyle = '#fff'; ctx.font = '12px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('F = '+s.F+' N', 30, 45);
      ctx.fillText('v = '+s.v.toFixed(2)+' m/s', 30, 65);
      ctx.fillStyle = C.RED; ctx.fillText('P = F*v', 30, 85);
      ctx.fillStyle = C.GOLD; ctx.font = 'bold 16px Segoe UI';
      ctx.fillText('P = '+P.toFixed(1)+' W', 30, 115);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('Instantaneous power', 30, 138);
      // Power bar
      const barMax = Math.max(P_max, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(30, 145, 180, 16);
      ctx.fillStyle = P > 0 ? C.GOLD : C.RED; ctx.fillRect(30, 145, Math.max(0, Math.min(180, Math.abs(P)/barMax*180)), 16);
      ctx.fillStyle = '#fff'; ctx.font = '9px Segoe UI'; ctx.fillText('Power meter', 30, 175);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 17: ch3-7-1 - Elastic Collision (1D)
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-7-1', { chapter: 3, type: 'dynamics', title: 'Va cham dan hoi 1D', hint: 'Analytical elastic formulas', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-7-1'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Va cham dan hoi 1D', 'Elastic collision 1D', 760, 440);
    const s = { m1: 4, m2: 2, v1: 5, v2: -3, e: 1, x1: 200, x2: 500, t: 0, collided: false, v1p: 5, v2p: -3 };
    const cy = 220, R1 = 30, R2 = 24;
    lab.addSlider('m1', 1, 8, 4, 0.5, ' kg', function(v) { s.m1 = v; });
    lab.addSlider('m2', 1, 8, 2, 0.5, ' kg', function(v) { s.m2 = v; });
    lab.addSlider('v1', -10, 15, 5, 0.5, ' m/s', function(v) { s.v1 = v; });
    lab.addSlider('v2', -10, 15, -3, 0.5, ' m/s', function(v) { s.v2 = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Play'; } else {
        s.x1 = 200; s.x2 = 500; s.collided = false;
        const r = solveCollision(s.m1, s.v1, s.m2, s.v2, 1);
        s.v1p = r.v1p; s.v2p = r.v2p;
        animator.play(); playBtn.textContent = 'Pause';
      }
    });
    animator.onTick = function(dt) {
      s.t += dt/1000;
      if (!s.collided) { s.x1 += s.v1*dt/10; s.x2 += s.v2*dt/10; }
      else { s.x1 += s.v1p*dt/10; s.x2 += s.v2p*dt/10; }
      if (!s.collided && s.x2-s.x1 <= R1+R2) { s.collided = true; }
      if (s.x1 < R1 || s.x1 > W-R1) s.collided ? (s.v1p *= -1) : (s.v1 *= -1);
      if (s.x2 < R2 || s.x2 > W-R2) s.collided ? (s.v2p *= -1) : (s.v2 *= -1);
    };
    function render() {
      bg(ctx, W, H);
      ctx.setLineDash([5,5]); ctx.strokeStyle = 'rgba(201,150,58,0.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(50, cy); ctx.lineTo(W-50, cy); ctx.stroke(); ctx.setLineDash([]);
      drawBall(ctx, s.x1, cy, R1, C.RED, '');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m1', s.x1, cy+4);
      drawBall(ctx, s.x2, cy, R2, C.BLUE, '');
      ctx.fillStyle = '#fff'; ctx.fillText('m2', s.x2, cy+4);
      const v1_arrow = s.collided ? s.v1p : s.v1;
      const v2_arrow = s.collided ? s.v2p : s.v2;
      if (Math.abs(v1_arrow) > 0.1) drawArrow(ctx, s.x1+R1, cy, s.x1+R1+v1_arrow*8, cy, C.RED, 3, 'v1='+v1_arrow.toFixed(1));
      if (Math.abs(v2_arrow) > 0.1) drawArrow(ctx, s.x2-R2, cy, s.x2-R2+v2_arrow*8, cy, C.BLUE, 3, 'v2='+v2_arrow.toFixed(1));
      if (s.collided) {
        const cx = (s.x1+s.x2)/2;
        ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(201,150,58,0.6)'; ctx.fill(); ctx.strokeStyle = C.GOLD; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = C.GOLD; ctx.font = 'bold 9px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('VA CHAM!', cx, cy-20);
      }
      const KE_before = kineticE(s.m1, s.v1) + kineticE(s.m2, s.v2);
      const KE_after = kineticE(s.m1, s.v1p) + kineticE(s.m2, s.v2p);
      drawPanel(ctx, 20, 20, 220, 180, 'Va cham dan hoi');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('m1='+s.m1+'kg  v1='+s.v1.toFixed(1), 30, 42);
      ctx.fillText('m2='+s.m2+'kg  v2='+s.v2.toFixed(1), 30, 60);
      ctx.fillStyle = C.GOLD; ctx.fillText('v1_sau = '+s.v1p.toFixed(2), 30, 80);
      ctx.fillText('v2_sau = '+s.v2p.toFixed(2), 30, 98);
      ctx.fillStyle = C.KE; ctx.fillText('KE_truoc = '+KE_before.toFixed(1)+' J', 30, 118);
      ctx.fillStyle = C.GREEN; ctx.fillText('KE_sau = '+KE_after.toFixed(1)+' J', 30, 136);
      ctx.fillStyle = Math.abs(KE_before-KE_after) < 0.5 ? C.GREEN : C.RED; ctx.font = 'bold 11px Segoe UI';
      ctx.fillText(Math.abs(KE_before-KE_after) < 0.5 ? 'KE bao toan!' : 'KE mat!', 30, 160);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('e = 1 (dan hoi)', 30, 180);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 18: ch3-7-2 - Inelastic Collision (1D)
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-7-2', { chapter: 3, type: 'dynamics', title: 'Va cham khong dan hoi', hint: 'Balls stick together', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-7-2'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Va cham khong dan hoi', 'Inelastic: balls stick', 760, 440);
    const s = { m1: 4, m2: 2, v1: 5, v2: -2, x1: 200, x2: 500, t: 0, collided: false, v_final: 0 };
    const cy = 220, R1 = 30, R2 = 24;
    lab.addSlider('m1', 1, 8, 4, 0.5, ' kg', function(v) { s.m1 = v; });
    lab.addSlider('m2', 1, 8, 2, 0.5, ' kg', function(v) { s.m2 = v; });
    lab.addSlider('v1', -10, 15, 5, 0.5, ' m/s', function(v) { s.v1 = v; });
    lab.addSlider('v2', -10, 15, -2, 0.5, ' m/s', function(v) { s.v2 = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Play'; } else {
        s.x1 = 200; s.x2 = 500; s.collided = false;
        s.v_final = (s.m1*s.v1 + s.m2*s.v2) / (s.m1+s.m2);
        animator.play(); playBtn.textContent = 'Pause';
      }
    });
    animator.onTick = function(dt) {
      s.t += dt/1000;
      if (!s.collided) { s.x1 += s.v1*dt/10; s.x2 += s.v2*dt/10; }
      else { const v = (s.x1+s.x2)/2; s.x1 = v-15; s.x2 = v+15; }
      if (!s.collided && s.x2-s.x1 <= R1+R2) { s.collided = true; }
    };
    function render() {
      bg(ctx, W, H);
      drawBall(ctx, s.x1, cy, R1, C.RED, '');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m1', s.x1, cy+4);
      if (!s.collided) {
        drawBall(ctx, s.x2, cy, R2, C.BLUE, '');
        ctx.fillStyle = '#fff'; ctx.fillText('m2', s.x2, cy+4);
      } else {
        ctx.beginPath(); ctx.arc((s.x1+s.x2)/2, cy, R1+5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(155,89,182,0.3)'; ctx.fill(); ctx.strokeStyle = 'rgba(155,89,182,0.6)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Segoe UI'; ctx.fillText('STICK', (s.x1+s.x2)/2, cy+4);
        if (Math.abs(s.v_final) > 0.1) drawArrow(ctx, s.x1+R1, cy, s.x1+R1+s.v_final*8, cy, C.GOLD, 3, 'v='+s.v_final.toFixed(1));
      }
      const KE_before = kineticE(s.m1, s.v1) + kineticE(s.m2, s.v2);
      const KE_after = 0.5*(s.m1+s.m2)*s.v_final*s.v_final;
      const loss = KE_before > 0 ? (KE_before-KE_after)/KE_before*100 : 0;
      drawPanel(ctx, 20, 20, 220, 170, 'Va cham khong dan hoi');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('m1='+s.m1+'kg  v1='+s.v1.toFixed(1), 30, 42);
      ctx.fillText('m2='+s.m2+'kg  v2='+s.v2.toFixed(1), 30, 60);
      ctx.fillStyle = C.GOLD; ctx.fillText('v_chung = '+s.v_final.toFixed(2), 30, 80);
      ctx.fillStyle = C.RED; ctx.fillText('KE_truoc = '+KE_before.toFixed(1)+' J', 30, 100);
      ctx.fillStyle = C.GREEN; ctx.fillText('KE_sau = '+KE_after.toFixed(1)+' J', 30, 118);
      ctx.fillStyle = C.RED; ctx.font = 'bold 12px Segoe UI';
      ctx.fillText('Mat = '+loss.toFixed(1)+'%', 30, 145);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('e = 0 (hoan toan khong dan hoi)', 30, 165);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 19: ch3-7-3 - 2D Collision Solver
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-7-3', { chapter: 3, type: 'dynamics', title: 'Va cham 2 chieu', hint: 'Impulse along normal', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-7-3'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Va cham 2 chieu', 'Oblique collision', 760, 440);
    const s = {
      b1: { x: 200, y: 180, vx: 4, vy: 2, m: 3 },
      b2: { x: 500, y: 200, vx: -2, vy: -1, m: 2 },
      e: 0.8, collided: false, collisionX: 0, collisionY: 0, t: 0, sparks: []
    };
    const R1 = 28, R2 = 24;
    lab.addSlider('e', 0, 1, 0.8, 0.05, '', function(v) { s.e = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Play'; } else {
        s.b1 = { x: 200, y: 180, vx: 4, vy: 2, m: 3 };
        s.b2 = { x: 500, y: 200, vx: -2, vy: -1, m: 2 };
        s.collided = false; s.sparks = [];
        animator.play(); playBtn.textContent = 'Pause';
      }
    });
    animator.onTick = function(dt) {
      s.t += dt/1000;
      if (!s.collided) {
        s.b1.x += s.b1.vx; s.b1.y += s.b1.vy;
        s.b2.x += s.b2.vx; s.b2.y += s.b2.vy;
        const dist = Math.sqrt(Math.pow(s.b1.x-s.b2.x, 2) + Math.pow(s.b1.y-s.b2.y, 2));
        if (dist < R1+R2) {
          solveCollision2D(s.b1, s.b2, s.b1.m, s.b2.m, s.e);
          s.collided = true; s.collisionX = (s.b1.x+s.b2.x)/2; s.collisionY = (s.b1.y+s.b2.y)/2;
          for (let i = 0; i < 8; i++) s.sparks.push({ x: s.collisionX, y: s.collisionY, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8, life: 1 });
        }
        if (s.b1.x < R1 || s.b1.x > W-R1) s.b1.vx *= -1;
        if (s.b1.y < R1 || s.b1.y > H-R1) s.b1.vy *= -1;
        if (s.b2.x < R2 || s.b2.x > W-R2) s.b2.vx *= -1;
        if (s.b2.y < R2 || s.b2.y > H-R2) s.b2.vy *= -1;
      } else {
        s.b1.x += s.b1.vx; s.b1.y += s.b1.vy;
        s.b2.x += s.b2.vx; s.b2.y += s.b2.vy;
      }
      s.sparks = s.sparks.filter(function(sp) { sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.03; return sp.life > 0; });
    };
    function render() {
      bg(ctx, W, H);
      drawBall(ctx, s.b1.x, s.b1.y, R1, C.RED, '');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m1', s.b1.x, s.b1.y+4);
      drawBall(ctx, s.b2.x, s.b2.y, R2, C.BLUE, '');
      ctx.fillStyle = '#fff'; ctx.fillText('m2', s.b2.x, s.b2.y+4);
      if (!s.collided) {
        if (Math.abs(s.b1.vx) > 0.1 || Math.abs(s.b1.vy) > 0.1) drawArrow(ctx, s.b1.x, s.b1.y, s.b1.x+s.b1.vx*8, s.b1.y+s.b1.vy*8, C.RED, 2, 'v1');
        if (Math.abs(s.b2.vx) > 0.1 || Math.abs(s.b2.vy) > 0.1) drawArrow(ctx, s.b2.x, s.b2.y, s.b2.x+s.b2.vx*8, s.b2.y+s.b2.vy*8, C.BLUE, 2, 'v2');
      }
      s.sparks.forEach(function(sp) {
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 3, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(201,150,58,'+sp.life+')'; ctx.fill();
      });
      if (s.collided) {
        ctx.beginPath(); ctx.arc(s.collisionX, s.collisionY, 8, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(201,150,58,0.4)'; ctx.fill();
      }
      const p1 = s.b1.m*Math.sqrt(s.b1.vx*s.b1.vx+s.b1.vy*s.b1.vy) + s.b2.m*Math.sqrt(s.b2.vx*s.b2.vx+s.b2.vy*s.b2.vy);
      drawPanel(ctx, 20, 20, 200, 140, 'Va cham 2 chieu');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('m1='+s.b1.m+'kg', 30, 42);
      ctx.fillText('v1=('+s.b1.vx.toFixed(1)+', '+s.b1.vy.toFixed(1)+')', 30, 60);
      ctx.fillText('m2='+s.b2.m+'kg', 30, 78);
      ctx.fillText('v2=('+s.b2.vx.toFixed(1)+', '+s.b2.vy.toFixed(1)+')', 30, 96);
      ctx.fillStyle = C.GOLD; ctx.fillText('e = '+s.e.toFixed(2), 30, 116);
      ctx.fillStyle = C.DIM; ctx.fillText(s.collided ? 'Da va cham' : 'Chua va cham', 30, 136);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 20: ch3-7-4 - Restitution Coefficient
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-7-4', { chapter: 3, type: 'dynamics', title: 'He so phuc hoi', hint: 'Drag e slider (0-1)', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-7-4'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'He so phuc hoi', 'Drag e slider (0-1)', 760, 440);
    const s = { m1: 4, m2: 2, v1: 6, v2: -2, e: 0.8, x1: 180, x2: 520, collided: false, v1p: 6, v2p: -2 };
    const cy = 220, R1 = 30, R2 = 24;
    lab.addSlider('m1', 1, 8, 4, 0.5, ' kg', function(v) { s.m1 = v; });
    lab.addSlider('m2', 1, 8, 2, 0.5, ' kg', function(v) { s.m2 = v; });
    lab.addSlider('v1', -10, 15, 6, 0.5, ' m/s', function(v) { s.v1 = v; });
    lab.addSlider('e', 0, 1, 0.8, 0.05, '', function(v) { s.e = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Play'; } else {
        s.x1 = 180; s.x2 = 520; s.collided = false;
        const r = solveCollision(s.m1, s.v1, s.m2, s.v2, s.e);
        s.v1p = r.v1p; s.v2p = r.v2p;
        animator.play(); playBtn.textContent = 'Pause';
      }
    });
    animator.onTick = function(dt) {
      if (!s.collided) { s.x1 += s.v1*dt/10; s.x2 += s.v2*dt/10; }
      else { s.x1 += s.v1p*dt/10; s.x2 += s.v2p*dt/10; }
      if (!s.collided && s.x2-s.x1 <= R1+R2) { s.collided = true; }
      if (s.x1 < R1 || s.x1 > W-R1) s.collided ? (s.v1p *= -1) : (s.v1 *= -1);
      if (s.x2 < R2 || s.x2 > W-R2) s.collided ? (s.v2p *= -1) : (s.v2 *= -1);
    };
    function render() {
      bg(ctx, W, H);
      drawBall(ctx, s.x1, cy, R1, C.RED, '');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m1', s.x1, cy+4);
      drawBall(ctx, s.x2, cy, R2, C.BLUE, '');
      ctx.fillStyle = '#fff'; ctx.fillText('m2', s.x2, cy+4);
      const v1_a = s.collided ? s.v1p : s.v1, v2_a = s.collided ? s.v2p : s.v2;
      if (Math.abs(v1_a) > 0.1) drawArrow(ctx, s.x1+R1, cy, s.x1+R1+v1_a*8, cy, C.RED, 3, 'v1='+v1_a.toFixed(1));
      if (Math.abs(v2_a) > 0.1) drawArrow(ctx, s.x2-R2, cy, s.x2-R2+v2_a*8, cy, C.BLUE, 3, 'v2='+v2_a.toFixed(1));
      if (s.collided) {
        const cx = (s.x1+s.x2)/2;
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(201,150,58,0.6)'; ctx.fill(); ctx.strokeStyle = C.GOLD; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = C.GOLD; ctx.font = 'bold 9px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('e='+s.e, cx, cy-18);
      }
      const KE_before = kineticE(s.m1, s.v1) + kineticE(s.m2, s.v2);
      const KE_after = kineticE(s.m1, s.v1p) + kineticE(s.m2, s.v2p);
      const loss = KE_before > 0 ? (KE_before-KE_after)/KE_before*100 : 0;
      drawPanel(ctx, 20, 20, 220, 170, 'He so phuc hoi');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillStyle = C.GOLD; ctx.font = 'bold 18px Segoe UI';
      ctx.fillText('e = '+s.e.toFixed(2), 30, 50);
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI';
      ctx.fillText('v1_truoc = '+s.v1.toFixed(1), 30, 75);
      ctx.fillText('v2_truoc = '+s.v2.toFixed(1), 30, 93);
      ctx.fillText('v1_sau = '+s.v1p.toFixed(2), 30, 111);
      ctx.fillText('v2_sau = '+s.v2p.toFixed(2), 30, 129);
      ctx.fillStyle = C.RED; ctx.font = 'bold 12px Segoe UI';
      ctx.fillText('KE_loss = '+loss.toFixed(1)+'%', 30, 155);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('e=1: dan hoi | e=0: deque', 30, 175);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 21: ch3-7-5 - Coefficient of Restitution (energy bar)
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-7-5', { chapter: 3, type: 'dynamics', title: 'He so phuc hoi (nang luong)', hint: 'Energy bar + finer e control', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-7-5'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'He so phuc hoi (nang luong)', 'Energy bar + finer e control', 760, 440);
    const s = { m1: 4, m2: 2, v1: 6, v2: -2, e: 0.8, x1: 180, x2: 520, collided: false, v1p: 6, v2p: -2 };
    const cy = 220, R1 = 30, R2 = 24;
    lab.addSlider('m1', 1, 8, 4, 0.5, ' kg', function(v) { s.m1 = v; });
    lab.addSlider('m2', 1, 8, 2, 0.5, ' kg', function(v) { s.m2 = v; });
    lab.addSlider('e', 0, 1, 0.8, 0.01, '', function(v) { s.e = v; });
    const playBtn = lab.addButton('Play', function() {
      if (animator.isRunning()) { animator.pause(); playBtn.textContent = 'Play'; } else {
        s.x1 = 180; s.x2 = 520; s.collided = false;
        const r = solveCollision(s.m1, s.v1, s.m2, s.v2, s.e);
        s.v1p = r.v1p; s.v2p = r.v2p;
        animator.play(); playBtn.textContent = 'Pause';
      }
    });
    animator.onTick = function(dt) {
      if (!s.collided) { s.x1 += s.v1*dt/10; s.x2 += s.v2*dt/10; }
      else { s.x1 += s.v1p*dt/10; s.x2 += s.v2p*dt/10; }
      if (!s.collided && s.x2-s.x1 <= R1+R2) { s.collided = true; }
      if (s.x1 < R1 || s.x1 > W-R1) s.collided ? (s.v1p *= -1) : (s.v1 *= -1);
      if (s.x2 < R2 || s.x2 > W-R2) s.collided ? (s.v2p *= -1) : (s.v2 *= -1);
    };
    function render() {
      bg(ctx, W, H);
      drawBall(ctx, s.x1, cy, R1, C.RED, '');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText('m1', s.x1, cy+4);
      drawBall(ctx, s.x2, cy, R2, C.BLUE, '');
      ctx.fillStyle = '#fff'; ctx.fillText('m2', s.x2, cy+4);
      const KE_before = kineticE(s.m1, s.v1) + kineticE(s.m2, s.v2);
      const KE_after = s.collided ? (kineticE(s.m1, s.v1p) + kineticE(s.m2, s.v2p)) : KE_before;
      const loss = KE_before > 0 ? (KE_before-KE_after)/KE_before*100 : 0;
      drawEnergyBar(ctx, 20, 20, KE_after, KE_before-KE_after, 60);
      drawPanel(ctx, 20, 120, 200, 150, 'Chi tiet');
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillStyle = C.GOLD; ctx.font = 'bold 16px Segoe UI';
      ctx.fillText('e = '+s.e.toFixed(2), 30, 142);
      ctx.fillStyle = '#fff'; ctx.font = '11px Segoe UI';
      ctx.fillText('KE_truoc = '+KE_before.toFixed(1)+' J', 30, 165);
      ctx.fillText('KE_sau = '+KE_after.toFixed(1)+' J', 30, 185);
      ctx.fillStyle = C.RED; ctx.font = 'bold 11px Segoe UI';
      ctx.fillText('Delta KE = '+loss.toFixed(1)+'%', 30, 208);
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('dE = (1-e2)*KE_before', 30, 228);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

// =============================================================================
// ROUTE 22: ch3-7-6 - Exercise Checker
// =============================================================================
(function() {
  window.RouteRegistry.register('ch3-7-6', { chapter: 3, type: 'dynamics', title: 'Kiem tra bai tap', hint: 'Select problem, enter answer', canvas: { width: 760, height: 440 } });
  window.SimRegistry['ch3-7-6'] = function(host) {
    const { lab, ctx, animator, W, H } = setupLab(host, 'Kiem tra bai tap', 'Select problem, enter answer', 760, 440);
    const problems = [
      { q: 'm=4kg, v=5m/s. Tim K?', ans: 50, unit: 'J', hint: 'K = 1/2*m*v^2' },
      { q: 'F=20N, d=3m. Tim W?', ans: 60, unit: 'J', hint: 'W = F*d' },
      { q: 'm=2kg, h=10m. Tim PE?', ans: 196, unit: 'J', hint: 'V = m*g*h' },
      { q: 'm1=3kg, v1=4; m2=1kg, v2=-2. Va cham dan hoi. Tim v1_sau?', ans: 2, unit: 'm/s', hint: 'v1p = v1 - 2*(m2/(m1+m2))*(v1-v2)' },
      { q: 'I=2kg*m2, omega=3rad/s. Tim L?', ans: 6, unit: 'kg*m2/s', hint: 'L = I*omega' }
    ];
    const s = { probIdx: 0, userAns: '', correct: null, showHint: false };
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Nhap dap an...';
    inp.style.cssText = 'background:rgba(9,26,51,0.8);border:1px solid rgba(201,150,58,0.4);color:#fff;padding:6px 10px;border-radius:4px;width:150px;font-size:13px;margin-left:8px;';
    const checkBtn = document.createElement('button');
    checkBtn.textContent = 'Kiem tra';
    checkBtn.style.cssText = 'background:rgba(201,150,58,0.2);border:1px solid #c9963a;color:#c9963a;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;';
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Tiep';
    nextBtn.style.cssText = 'background:rgba(201,150,58,0.2);border:1px solid #c9963a;color:#c9963a;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;';
    const hintBtn = document.createElement('button');
    hintBtn.textContent = 'Goi y';
    hintBtn.style.cssText = 'background:rgba(201,150,58,0.1);border:1px solid rgba(201,150,58,0.3);color:rgba(201,150,58,0.6);padding:6px 10px;border-radius:4px;cursor:pointer;font-size:12px;';
    lab.toolbar.appendChild(inp);
    lab.toolbar.appendChild(checkBtn);
    lab.toolbar.appendChild(nextBtn);
    lab.toolbar.appendChild(hintBtn);
    checkBtn.addEventListener('click', function() {
      const userVal = parseFloat(inp.value);
      const prob = problems[s.probIdx];
      if (Math.abs(userVal - prob.ans) < Math.abs(prob.ans)*0.05 + 0.1) {
        s.correct = true; s.showHint = false;
      } else { s.correct = false; }
    });
    nextBtn.addEventListener('click', function() {
      s.probIdx = (s.probIdx + 1) % problems.length;
      s.correct = null; s.showHint = false; inp.value = '';
    });
    hintBtn.addEventListener('click', function() { s.showHint = !s.showHint; });
    function render() {
      bg(ctx, W, H);
      const prob = problems[s.probIdx];
      drawPanel(ctx, 180, 80, 400, 260, 'Bai tap');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Segoe UI'; ctx.textAlign = 'center';
      ctx.fillText('Bai '+(s.probIdx+1)+'/'+problems.length, 380, 110);
      ctx.fillStyle = C.GOLD; ctx.font = 'bold 16px Segoe UI';
      ctx.fillText(prob.q, 380, 145);
      ctx.fillStyle = C.DIM; ctx.font = '11px Segoe UI';
      ctx.fillText('(don vi: '+prob.unit+')', 380, 170);
      if (s.showHint) {
        ctx.fillStyle = C.GREEN; ctx.font = '12px Segoe UI';
        ctx.fillText('Goi y: ' + prob.hint, 380, 200);
      }
      if (s.correct === true) {
        ctx.fillStyle = C.GREEN; ctx.font = 'bold 20px Segoe UI';
        ctx.fillText('DUNG!', 380, 240);
      } else if (s.correct === false) {
        ctx.fillStyle = C.RED; ctx.font = 'bold 20px Segoe UI';
        ctx.fillText('SAI! Dap an: '+prob.ans+' '+prob.unit, 380, 240);
      }
      ctx.fillStyle = C.DIM; ctx.font = '10px Segoe UI';
      ctx.fillText('Chon bai: ', 200, 370);
      problems.forEach(function(p, i) {
        const bx = 280 + i * 60, by = 358;
        ctx.fillStyle = i === s.probIdx ? C.GOLD : 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = i === s.probIdx ? C.GOLD : 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Segoe UI'; ctx.textAlign = 'center';
        ctx.fillText(i+1, bx, by+3);
      });
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return { dispose: function() { animator.destroy(); } };
  };
})();

})();
