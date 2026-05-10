/**
 * Phase 02: Chapter 2 Kinematics — All 16 Routes
 * Architecture: SimRegistry[routeId] + RouteRegistry.register()
 * Each route: canvas 760x440, Animator + Timeline (4000ms), PlaybackUI, trail 60pts.
 * Colors: bg=#091a33, gold=#c9963a, vel=#3498db, acc=#e74c3c, path=rgba(201,150,58,0.2)
 */
(function() {
'use strict';

var Animator   = window.SimNew && window.SimNew.Animator;
var Timeline   = window.SimNew && window.SimNew.Timeline;
var PlaybackUI = window.SimNew && window.SimNew.PlaybackUI;

// RouteRegistry is already set by route-registry.js
// SimRegistry is accumulated across all route files — do not reset

// ================================================================
// SHARED HELPERS
// ================================================================

function drawArrow(ctx, x1, y1, x2, y2, color, lw, label) {
  var dx = x2-x1, dy = y2-y1;
  var len = Math.sqrt(dx*dx + dy*dy);
  if (len < 1) return;
  var a = Math.atan2(dy, dx);
  var hl = Math.min(12, len * 0.4);
  var ha = Math.PI / 7;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw||2;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2 - hl*Math.cos(a-ha), y2 - hl*Math.sin(a-ha));
  ctx.lineTo(x2 - hl*Math.cos(a+ha), y2 - hl*Math.sin(a+ha));
  ctx.closePath(); ctx.fill();
  if (label && len > 20) {
    ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, (x1+x2)/2, (y1+y2)/2 - 3);
  }
  ctx.restore();
}

function drawBall(ctx, x, y, r, fill, stroke, glow) {
  if (glow) {
    ctx.beginPath(); ctx.arc(x,y,r+6,0,Math.PI*2);
    ctx.strokeStyle = glow; ctx.lineWidth = 4; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2.5; ctx.stroke(); }
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

function drawPanel(ctx, x, y, w, h, title) {
  ctx.fillStyle = 'rgba(9,26,51,0.85)';
  ctx.strokeStyle = 'rgba(201,150,58,0.4)';
  ctx.lineWidth = 1;
  roundRect(ctx,x,y,w,h,8); ctx.fill(); ctx.stroke();
  if (title) {
    ctx.fillStyle = 'rgba(201,150,58,0.6)';
    ctx.font = 'bold 10px Segoe UI';
    ctx.textAlign = 'left';
    ctx.fillText(title, x+10, y+14);
  }
}

function drawGrid(ctx, W, H, step) {
  step = step || 30;
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
  var x, y;
  for (x=0; x<=W; x+=step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (y=0; y<=H; y+=step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
}

function drawWheel(ctx, cx, cy, R, angle, spokes) {
  spokes = spokes || 6;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath(); ctx.arc(0,0,R,0,Math.PI*2);
  ctx.strokeStyle = 'rgba(201,150,58,0.6)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(201,150,58,0.05)'; ctx.fill();
  var i, a;
  for (i=0; i<spokes; i++) {
    a = (i/spokes)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.lineTo(R*0.85*Math.cos(a), R*0.85*Math.sin(a));
    ctx.strokeStyle = 'rgba(201,150,58,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0,0,6,0,Math.PI*2);
  ctx.fillStyle = '#c9963a'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(R, 0); ctx.lineTo(R+12, 0);
  ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

function drawGear(ctx, cx, cy, R, n, angle, color) {
  color = color || '#c9963a';
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  var ta = (Math.PI*2)/n;
  ctx.beginPath();
  var i;
  for (i=0; i<n; i++) {
    var a1 = i*ta, a2 = (i+0.3)*ta, a3 = (i+0.5)*ta, a4 = (i+0.7)*ta;
    var r1 = R, r2 = R*0.82;
    if (i===0) ctx.moveTo(r1*Math.cos(a1), r1*Math.sin(a1));
    else ctx.lineTo(r1*Math.cos(a1), r1*Math.sin(a1));
    ctx.lineTo(r2*Math.cos(a2), r2*Math.sin(a2));
    ctx.lineTo(r2*Math.cos(a3), r2*Math.sin(a3));
    ctx.lineTo(r1*Math.cos(a4), r1*Math.sin(a4));
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(201,150,58,0.08)'; ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,R*0.3,0,Math.PI*2);
  ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}

function drawBeltPulley(ctx, cx, cy, R) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath(); ctx.arc(0,0,R,0,Math.PI*2);
  ctx.strokeStyle = 'rgba(201,150,58,0.7)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,R-5,0,Math.PI*2);
  ctx.strokeStyle = 'rgba(201,150,58,0.2)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2);
  ctx.fillStyle = '#c9963a'; ctx.fill();
  ctx.restore();
}

function drawGraphAxes(ctx, ox, oy, w, h, labelX, labelY) {
  labelX = labelX || 't';
  labelY = labelY || 'x';
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+w,oy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox,oy-h); ctx.stroke();
  ctx.font = 'bold 11px Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'left';
  ctx.fillText(labelX, ox+w-5, oy+15);
  ctx.textAlign = 'right';
  ctx.fillText(labelY, ox-5, oy-h+5);
}

function simSetup(host, title, hint) {
  var lab    = window.SimLabUI.createLab(host, { title: title, hint: hint, width: 760, height: 440 });
  var canvas = lab.canvas;
  canvas.width  = 760;
  canvas.height = 440;
  var ctx     = canvas.getContext('2d');
  var timeline = new Timeline({ duration: 4000 });
  var animator = new Animator({ speed: 1 });
  var pbUI    = new PlaybackUI({ container: lab.toolbar.parentNode, animator: animator, timeline: timeline });
  return { lab: lab, canvas: canvas, ctx: ctx, animator: animator, timeline: timeline, pbUI: pbUI };
}

function makeState() {
  return { t: 0, speed: 1, playing: false, trail: [],
           _animator: null, _timeline: null,
           path: 'circle', preset: 'uniform', mode: 0 };
}

// ================================================================
// ROUTE 1: ch2-1-1 — Cartesian Trajectory (circle/ellipse/lemniscate)
// ================================================================
window.RouteRegistry.register('ch2-1-1', {
  chapter: 2, type: 'kinematics',
  title: 'Quỹ đạo chuyển động',
  hint: 'Chọn quỹ đạo để xem chuyển động với vận tốc và gia tốc',
  canvas: { width: 760, height: 440 },
  paths: ['circle', 'ellipse', 'lemniscate']
});

window.SimRegistry['ch2-1-1'] = function(host) {
  var s   = simSetup(host, 'Quỹ đạo chuyển động', 'Chọn quỹ đạo để xem chuyển động');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440, cx=W/2, cy=H/2, R=110;

  var presets = [
    {
      name: 'circle',
      fn:  function(t){ return { x: cx+R*Math.cos(t), y: cy+R*Math.sin(t) }; },
      dfn: function(t){ return { x: -R*Math.sin(t), y:  R*Math.cos(t) }; },
      ddfn:function(t){ return { x: -R*Math.cos(t), y: -R*Math.sin(t) }; }
    },
    {
      name: 'ellipse',
      fn:  function(t){ return { x: cx+R*Math.cos(t), y: cy+R*0.65*Math.sin(t) }; },
      dfn: function(t){ return { x: -R*Math.sin(t), y:  R*0.65*Math.cos(t) }; },
      ddfn:function(t){ return { x: -R*Math.cos(t), y: -R*0.65*Math.sin(t) }; }
    },
    {
      name: 'lemniscate',
      fn:  function(t){
        var s2=Math.sin(t), c2=Math.cos(t), den=1+s2*s2;
        return { x: cx+R*(c2/den), y: cy+R*((c2*s2)/den) };
      },
      dfn: function(t){
        var s2=Math.sin(t), c2=Math.cos(t), den=1+s2*s2;
        return { x: -R*((2*s2*c2*c2+(1+s2*s2)*s2)/(den*den*den)), y: -R*((2*s2*c2*s2-(1+s2*s2)*c2*c2)/(den*den*den)) };
      },
      ddfn: function(t){ return { x: 0, y: 0 }; }
    }
  ];

  function getPreset(name) {
    for (var i=0; i<presets.length; i++) if (presets[i].name===name) return presets[i];
    return presets[0];
  }

  canvas.addEventListener('click', function(e){
    var rect = canvas.getBoundingClientRect();
    var sx = e.clientX-rect.left, sy = e.clientY-rect.top;
    var scaleX = canvas.width/rect.width, scaleY = canvas.height/rect.height;
    var wx = sx*scaleX, wy = sy*scaleY;
    var selX = W-380, selY = 20;
    for (var i=0; i<presets.length; i++) {
      var bx = selX+4+i*120, by = selY+4;
      if (wx>=bx && wx<=bx+112 && wy>=by && wy<=by+28) {
        state.path = presets[i].name; state.trail = [];
      }
    }
  });

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000) % (Math.PI*2);
    state.t = rawT;
    var p = getPreset(state.path);
    var pos = p.fn(rawT);
    state.trail.push({ x: pos.x, y: pos.y });
    if (state.trail.length > 60) state.trail.shift();
  };

  function render() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);

    var p = getPreset(state.path);
    var pos = p.fn(state.t);
    var vel = p.dfn(state.t);
    var acc = p.ddfn(state.t);
    var vmag = Math.sqrt(vel.x*vel.x+vel.y*vel.y);
    var amag = Math.sqrt(acc.x*acc.x+acc.y*acc.y);
    var rho  = (vmag*vmag/Math.max(amag,0.001));

    // Path trace
    ctx.save();
    ctx.strokeStyle='rgba(201,150,58,0.2)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath();
    for (var i=0; i<=200; i++) {
      var pt = p.fn((i/200)*Math.PI*2);
      i===0 ? ctx.moveTo(pt.x,pt.y) : ctx.lineTo(pt.x,pt.y);
    }
    ctx.closePath(); ctx.stroke(); ctx.setLineDash([]); ctx.restore();

    // Trail
    for (var j=1; j<state.trail.length; j++) {
      var alpha = (j/state.trail.length)*0.5;
      ctx.strokeStyle = 'rgba(52,152,219,'+alpha+')';
      ctx.lineWidth = 2*(j/state.trail.length);
      ctx.beginPath();
      ctx.moveTo(state.trail[j-1].x, state.trail[j-1].y);
      ctx.lineTo(state.trail[j].x, state.trail[j].y);
      ctx.stroke();
    }

    // Vectors
    var vs = 15/Math.max(vmag,0.01), as = 10/Math.max(amag,0.01);
    drawArrow(ctx, pos.x,pos.y, pos.x+vel.x*vs, pos.y+vel.y*vs, '#3498db', 2, 'v');
    if (amag > 0.1) drawArrow(ctx, pos.x,pos.y, pos.x+acc.x*as, pos.y+acc.y*as, '#e74c3c', 2, 'a');

    drawBall(ctx, pos.x, pos.y, 8, '#fff', '#c9963a', 'rgba(201,150,58,0.3)');

    drawPanel(ctx,20,20,170,115,'Thông số');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('Quỹ đạo: '+state.path, 30, 42);
    ctx.fillStyle='#3498db'; ctx.fillText('|v|='+(vmag*state.speed).toFixed(1)+' px/s', 30, 60);
    ctx.fillStyle='#e74c3c'; ctx.fillText('|a|='+(amag*state.speed*state.speed).toFixed(1)+' px/s²', 30, 78);
    ctx.fillStyle='#c9963a'; ctx.fillText('t='+state.t.toFixed(2)+' s', 30, 96);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px Segoe UI';
    ctx.fillText('ρ='+rho.toFixed(0)+' px', 30, 114);

    // Path selector
    var selX=W-380, selY=20;
    ctx.fillStyle='rgba(9,26,51,0.85)'; ctx.strokeStyle='rgba(201,150,58,0.3)';
    roundRect(ctx,selX,selY,360,36,8); ctx.fill(); ctx.stroke();
    for (var k=0; k<presets.length; k++) {
      var bx=selX+4+k*120, by=selY+4;
      var sel = (presets[k].name===state.path);
      ctx.fillStyle = sel ? 'rgba(201,150,58,0.3)' : 'rgba(255,255,255,0.05)';
      ctx.strokeStyle = sel ? '#c9963a' : 'rgba(255,255,255,0.1)';
      roundRect(ctx,bx,by,112,28,6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = sel ? '#c9963a' : 'rgba(255,255,255,0.6)';
      ctx.font='bold 11px Segoe UI'; ctx.textAlign='center';
      ctx.fillText(presets[k].name.charAt(0).toUpperCase()+presets[k].name.slice(1), bx+56, by+18);
    }
    ctx.textAlign='left';
    state._pathButtons = { selX: selX, selY: selY };
    ctx.clearRect(0,0,8,H);
    ctx.clearRect(W-8,0,8,H);
    ctx.clearRect(0,0,W,8);
    ctx.clearRect(0,H-8,W,8);

    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 2: ch2-1-2 — Trajectory + Position Graph (dual canvas)
// ================================================================
window.RouteRegistry.register('ch2-1-2', {
  chapter: 2, type: 'kinematics',
  title: 'Quỹ đạo + Đồ thị x(t), y(t)',
  hint: 'Quỹ đạo chuyển động đồng thời với đồ thị tọa độ theo thời gian',
  canvas: { width: 760, height: 560 }
});

window.SimRegistry['ch2-1-2'] = function(host) {
  var s   = simSetup(host, 'Quỹ đạo + Đồ thị', '');
  var W=760, H1=440, H2=120;
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;

  var gCanvas = document.createElement('canvas');
  gCanvas.width = W; gCanvas.height = H2;
  gCanvas.style.display = 'block';
  s.lab.scene.appendChild(gCanvas);
  var gctx = gCanvas.getContext('2d');

  var histX=[], histY=[];
  var MAX_H = 200;
  var cx=W/2, cy=H1/2, R=100;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000) % (Math.PI*2);
    state.t = rawT;
    var xv = R*Math.cos(rawT);
    var yv = R*0.65*Math.sin(rawT);
    histX.push({ t: rawT, v: xv });
    histY.push({ t: rawT, v: yv });
    if (histX.length > MAX_H) histX.shift();
    if (histY.length > MAX_H) histY.shift();
  };

  function renderSim(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H1);
    drawGrid(ctx2,W,H1);
    var x = cx+R*Math.cos(state.t), y = cy+R*0.65*Math.sin(state.t);
    var vx = -R*Math.sin(state.t), vy = R*0.65*Math.cos(state.t);
    var ax = -R*Math.cos(state.t), ay = -R*0.65*Math.sin(state.t);

    ctx2.save();
    ctx2.strokeStyle='rgba(201,150,58,0.2)'; ctx2.lineWidth=1; ctx2.setLineDash([4,4]);
    ctx2.beginPath();
    for (var i=0; i<=200; i++) {
      var px=cx+R*Math.cos((i/200)*Math.PI*2), py=cy+R*0.65*Math.sin((i/200)*Math.PI*2);
      i===0 ? ctx2.moveTo(px,py) : ctx2.lineTo(px,py);
    }
    ctx2.closePath(); ctx2.stroke(); ctx2.setLineDash([]); ctx2.restore();

    var vs = 12/Math.max(Math.sqrt(vx*vx+vy*vy),0.01);
    var as = 8/Math.max(Math.sqrt(ax*ax+ay*ay),0.01);
    drawArrow(ctx2,x,y, x+vx*vs,y+vy*vs, '#3498db', 2, 'v');
    drawArrow(ctx2,x,y, x+ax*as,y+ay*as, '#e74c3c', 2, 'a');
    drawBall(ctx2,x,y,8,'#fff','#c9963a','rgba(201,150,58,0.3)');

    drawPanel(ctx2,20,20,160,100,'Thông số');
    ctx2.fillStyle='#fff'; ctx2.font='13px Segoe UI'; ctx2.textAlign='left';
    ctx2.fillText('x='+(x-cx).toFixed(1)+' px',30,42);
    ctx2.fillText('y='+(y-cy).toFixed(1)+' px',30,60);
    ctx2.fillStyle='#3498db'; ctx2.fillText('vx='+(vx*state.speed).toFixed(1),30,78);
    ctx2.fillStyle='#e74c3c'; ctx2.fillText('ax='+(ax*state.speed*state.speed).toFixed(1),30,96);
    ctx2.textAlign='left';
  }

  function renderGraph(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H2);
    var pad=35, gW=W-pad*2, gH=H2-30;
    var ox=pad, oy=H2-20;
    drawGraphAxes(ctx2,ox,oy,gW,gH,'t','x,y');
    if (histX.length < 2) return;
    var tMin=histX[0].t, tMax=histX[histX.length-1].t;
    var xMin=-R, xMax=R;
    function gx(t){ return ox+((t-tMin)/Math.max(tMax-tMin,0.001))*gW; }
    function gy(v){ return oy-((v-xMin)/(xMax-xMin))*gH; }

    ctx2.save();
    ctx2.globalAlpha=0.15;
    ctx2.strokeStyle='#fff'; ctx2.lineWidth=1; ctx2.setLineDash([2,3]);
    ctx2.beginPath(); ctx2.moveTo(ox,oy); ctx2.lineTo(ox+gW,oy); ctx2.stroke();
    ctx2.setLineDash([]); ctx2.restore();

    ctx2.strokeStyle='#3498db'; ctx2.lineWidth=1.5;
    ctx2.beginPath();
    for (var i=0; i<histX.length; i++) {
      var px=gx(histX[i].t), py=gy(histX[i].v);
      i===0 ? ctx2.moveTo(px,py) : ctx2.lineTo(px,py);
    }
    ctx2.stroke();

    ctx2.strokeStyle='#e74c3c'; ctx2.lineWidth=1.5;
    ctx2.beginPath();
    for (var j=0; j<histY.length; j++) {
      var px=gx(histY[j].t), py=gy(histY[j].v);
      j===0 ? ctx2.moveTo(px,py) : ctx2.lineTo(px,py);
    }
    ctx2.stroke();

    if (histX.length > 0) {
      var last = histX[histX.length-1];
      var cx2 = gx(last.t);
      ctx2.strokeStyle='rgba(255,255,255,0.3)'; ctx2.lineWidth=1;
      ctx2.beginPath(); ctx2.moveTo(cx2,oy-gH); ctx2.lineTo(cx2,oy); ctx2.stroke();
      ctx2.fillStyle='#c9963a'; ctx2.font='10px Segoe UI'; ctx2.textAlign='left';
      ctx2.fillText('x(t) [xanh], y(t) [đỏ]', ox+2, 12);
    }
  }

  function render() {
    renderSim(ctx);
    renderGraph(gctx);
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 3: ch2-2-1 — Velocity-Time Graph
// ================================================================
window.RouteRegistry.register('ch2-2-1', {
  chapter: 2, type: 'kinematics',
  title: 'Đồ thị vận tốc - thời gian',
  hint: 'Quỹ đạo chuyển động và đồ thị vận tốc theo thời gian',
  canvas: { width: 760, height: 560 }
});

window.SimRegistry['ch2-2-1'] = function(host) {
  var s   = simSetup(host, 'Đồ thị vận tốc - thời gian', '');
  var W=760, H1=440, H2=120;
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;

  var gCanvas = document.createElement('canvas');
  gCanvas.width=W; gCanvas.height=H2; gCanvas.style.display='block';
  s.lab.scene.appendChild(gCanvas);
  var gctx = gCanvas.getContext('2d');

  var histV=[]; var MAX_H=200;
  var cx=W/2, cy=H1/2, R=100;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000) % (Math.PI*2);
    state.t = rawT;
    var vx = -R*Math.sin(rawT), vy = R*0.65*Math.cos(rawT);
    var v  = Math.sqrt(vx*vx+vy*vy);
    histV.push({ t: rawT, v: v });
    if (histV.length > MAX_H) histV.shift();
  };

  function renderSim(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H1);
    drawGrid(ctx2,W,H1);
    var x = cx+R*Math.cos(state.t), y = cy+R*0.65*Math.sin(state.t);
    var vx = -R*Math.sin(state.t), vy = R*0.65*Math.cos(state.t);
    var ax = -R*Math.cos(state.t), ay = -R*0.65*Math.sin(state.t);
    var vs = 12/Math.max(Math.sqrt(vx*vx+vy*vy),0.01);
    var as = 8/Math.max(Math.sqrt(ax*ax+ay*ay),0.01);
    drawArrow(ctx2,x,y,x+vx*vs,y+vy*vs,'#3498db',2,'v');
    drawArrow(ctx2,x,y,x+ax*as,y+ay*as,'#e74c3c',2,'a');
    drawBall(ctx2,x,y,8,'#fff','#c9963a','rgba(201,150,58,0.3)');
    drawPanel(ctx2,20,20,150,80,'Thông số');
    ctx2.fillStyle='#fff'; ctx2.font='13px Segoe UI'; ctx2.textAlign='left';
    var v = Math.sqrt(vx*vx+vy*vy);
    ctx2.fillText('|v|='+(v*state.speed).toFixed(1)+' px/s',30,42);
    ctx2.fillStyle='#3498db'; ctx2.fillText('vx='+(vx*state.speed).toFixed(1),30,60);
    ctx2.fillStyle='#e74c3c'; ctx2.fillText('vy='+(vy*state.speed).toFixed(1),30,78);
    ctx2.textAlign='left';
  }

  function renderGraph(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H2);
    var pad=35, gW=W-pad*2, gH=H2-30;
    var ox=pad, oy=H2-20;
    drawGraphAxes(ctx2,ox,oy,gW,gH,'t','|v|');
    if (histV.length < 2) return;
    var tMin=histV[0].t, tMax=histV[histV.length-1].t;
    var vMax=0;
    for (var i=0; i<histV.length; i++) if (histV[i].v > vMax) vMax=histV[i].v;
    vMax = vMax || 100;
    function gx(t){ return ox+((t-tMin)/Math.max(tMax-tMin,0.001))*gW; }
    function gy(v){ return oy-(v/vMax)*gH; }
    ctx2.strokeStyle='#3498db'; ctx2.lineWidth=2;
    ctx2.beginPath();
    for (var j=0; j<histV.length; j++) {
      var px=gx(histV[j].t), py=gy(histV[j].v);
      j===0 ? ctx2.moveTo(px,py) : ctx2.lineTo(px,py);
    }
    ctx2.stroke();
    if (histV.length > 0) {
      var last = histV[histV.length-1];
      var cx2 = gx(last.t);
      ctx2.strokeStyle='rgba(255,255,255,0.3)'; ctx2.lineWidth=1;
      ctx2.beginPath(); ctx2.moveTo(cx2,oy-gH); ctx2.lineTo(cx2,oy); ctx2.stroke();
    }
  }

  function render() {
    renderSim(ctx);
    renderGraph(gctx);
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 4: ch2-2-2 — Acceleration-Time Graph
// ================================================================
window.RouteRegistry.register('ch2-2-2', {
  chapter: 2, type: 'kinematics',
  title: 'Đồ thị gia tốc - thời gian',
  hint: 'Quỹ đạo chuyển động và đồ thị gia tốc theo thời gian',
  canvas: { width: 760, height: 560 }
});

window.SimRegistry['ch2-2-2'] = function(host) {
  var s   = simSetup(host, 'Đồ thị gia tốc - thời gian', '');
  var W=760, H1=440, H2=120;
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;

  var gCanvas = document.createElement('canvas');
  gCanvas.width=W; gCanvas.height=H2; gCanvas.style.display='block';
  s.lab.scene.appendChild(gCanvas);
  var gctx = gCanvas.getContext('2d');

  var histA=[]; var MAX_H=200;
  var cx=W/2, cy=H1/2, R=100;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000) % (Math.PI*2);
    state.t = rawT;
    var ax = -R*Math.cos(rawT), ay = -R*0.65*Math.sin(rawT);
    var a  = Math.sqrt(ax*ax+ay*ay);
    histA.push({ t: rawT, a: a });
    if (histA.length > MAX_H) histA.shift();
  };

  function renderSim(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H1);
    drawGrid(ctx2,W,H1);
    var x = cx+R*Math.cos(state.t), y = cy+R*0.65*Math.sin(state.t);
    var vx = -R*Math.sin(state.t), vy = R*0.65*Math.cos(state.t);
    var ax = -R*Math.cos(state.t), ay = -R*0.65*Math.sin(state.t);
    var vs = 12/Math.max(Math.sqrt(vx*vx+vy*vy),0.01);
    var as = 8/Math.max(Math.sqrt(ax*ax+ay*ay),0.01);
    drawArrow(ctx2,x,y,x+vx*vs,y+vy*vs,'#3498db',2,'v');
    drawArrow(ctx2,x,y,x+ax*as,y+ay*as,'#e74c3c',2,'a');
    drawBall(ctx2,x,y,8,'#fff','#c9963a','rgba(201,150,58,0.3)');
    drawPanel(ctx2,20,20,150,80,'Thông số');
    ctx2.fillStyle='#fff'; ctx2.font='13px Segoe UI'; ctx2.textAlign='left';
    var a = Math.sqrt(ax*ax+ay*ay);
    ctx2.fillText('|a|='+(a*state.speed*state.speed).toFixed(1)+' px/s²',30,42);
    ctx2.fillStyle='#3498db'; ctx2.fillText('ax='+(ax*state.speed*state.speed).toFixed(1),30,60);
    ctx2.fillStyle='#e74c3c'; ctx2.fillText('ay='+(ay*state.speed*state.speed).toFixed(1),30,78);
    ctx2.textAlign='left';
  }

  function renderGraph(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H2);
    var pad=35, gW=W-pad*2, gH=H2-30;
    var ox=pad, oy=H2-20;
    drawGraphAxes(ctx2,ox,oy,gW,gH,'t','|a|');
    if (histA.length < 2) return;
    var tMin=histA[0].t, tMax=histA[histA.length-1].t;
    var aMax=0;
    for (var i=0; i<histA.length; i++) if (histA[i].a > aMax) aMax=histA[i].a;
    aMax = aMax || 100;
    function gx(t){ return ox+((t-tMin)/Math.max(tMax-tMin,0.001))*gW; }
    function gy(a){ return oy-(a/aMax)*gH; }
    ctx2.strokeStyle='#e74c3c'; ctx2.lineWidth=2;
    ctx2.beginPath();
    for (var j=0; j<histA.length; j++) {
      var px=gx(histA[j].t), py=gy(histA[j].a);
      j===0 ? ctx2.moveTo(px,py) : ctx2.lineTo(px,py);
    }
    ctx2.stroke();
    if (histA.length > 0) {
      var last = histA[histA.length-1];
      var cx2 = gx(last.t);
      ctx2.strokeStyle='rgba(255,255,255,0.3)'; ctx2.lineWidth=1;
      ctx2.beginPath(); ctx2.moveTo(cx2,oy-gH); ctx2.lineTo(cx2,oy); ctx2.stroke();
    }
  }

  function render() {
    renderSim(ctx);
    renderGraph(gctx);
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 5: ch2-3-1 — Natural Coordinates
// ================================================================
window.RouteRegistry.register('ch2-3-1', {
  chapter: 2, type: 'kinematics',
  title: 'Tọa độ tự nhiên',
  hint: 's(t), θ(t), ds/dt, dθ/dt trong hệ tọa độ tự nhiên',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-3-1'] = function(host) {
  var s   = simSetup(host, 'Tọa độ tự nhiên', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440, cx=W/2, cy=H/2, R=110;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000) % (Math.PI*2);
    state.t = rawT;
    state.trail.push({ x: cx+R*Math.cos(rawT), y: cy+R*Math.sin(rawT) });
    if (state.trail.length > 60) state.trail.shift();
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var t = state.t;
    var x = cx+R*Math.cos(t), y = cy+R*Math.sin(t);
    var vx = -R*Math.sin(t), vy = R*Math.cos(t);
    var ax = -R*Math.cos(t), ay = -R*Math.sin(t);
    var vmag = Math.sqrt(vx*vx+vy*vy);
    var amag = Math.sqrt(ax*ax+ay*ay);
    var ds   = vmag * state.speed;
    var dtheta = state.speed;
    var rho  = (vmag*vmag/Math.max(amag,0.001));

    var tdir = { x: vx/vmag, y: vy/vmag };
    var ndir = { x: -vy/vmag, y: vx/vmag };
    drawArrow(ctx, x,y, x+tdir.x*50, y+tdir.y*50, '#3498db', 2.5, 'τ');
    drawArrow(ctx, x,y, x+ndir.x*50, y+ndir.y*50, '#e74c3c', 2.5, 'n');

    ctx.strokeStyle='rgba(201,150,58,0.3)'; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.arc(cx,cy,R, 0, t, t<0);
    ctx.stroke();

    drawBall(ctx,x,y,8,'#fff','#c9963a','rgba(201,150,58,0.3)');

    drawPanel(ctx,20,20,170,120,'Tọa độ tự nhiên');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('s='+(t*R).toFixed(1)+' px',30,42);
    ctx.fillText('θ='+((t*180/Math.PI)%360).toFixed(1)+'°',30,60);
    ctx.fillStyle='#3498db';
    ctx.fillText('ds/dt='+ds.toFixed(1)+' px/s',30,78);
    ctx.fillStyle='#e74c3c';
    ctx.fillText('dθ/dt='+dtheta.toFixed(2)+' rad/s',30,96);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='11px Segoe UI';
    ctx.fillText('ρ='+rho.toFixed(0)+' px',30,114);
    ctx.textAlign='left';

    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
    ctx.setLineDash([3,5]);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.stroke();
    ctx.setLineDash([]);
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 6: ch2-3-2 — Motion Templates
// ================================================================
window.RouteRegistry.register('ch2-3-2', {
  chapter: 2, type: 'kinematics',
  title: 'Mẫu chuyển động',
  hint: 'Chọn mẫu: đều, gia tốc, tròn, dao động điều hòa',
  canvas: { width: 760, height: 440 },
  templates: ['uniform','accelerated','circular','harmonic']
});

window.SimRegistry['ch2-3-2'] = function(host) {
  var s   = simSetup(host, 'Mẫu chuyển động', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state.preset = 'uniform';
  var W=760, H=440;

  var templates = [
    {
      name: 'uniform', label: 'Đều v=const',
      pos: function(t){ return { x: 150+t*80, y: 220 }; },
      vel: function(t){ return { x: 80, y: 0 }; },
      acc: function(t){ return { x: 0, y: 0 }; }
    },
    {
      name: 'accelerated', label: 'Gia tốc',
      pos: function(t){ var a=50; return { x: 150+a*t*t*0.5, y: 220 }; },
      vel: function(t){ return { x: 50*t, y: 0 }; },
      acc: function(t){ return { x: 50, y: 0 }; }
    },
    {
      name: 'circular', label: 'Tròn',
      pos: function(t){ return { x: 380+90*Math.cos(t), y: 220-90*Math.sin(t) }; },
      vel: function(t){ return { x: -90*Math.sin(t), y: -90*Math.cos(t) }; },
      acc: function(t){ return { x: -90*Math.cos(t), y: 90*Math.sin(t) }; }
    },
    {
      name: 'harmonic', label: 'Dao động',
      pos: function(t){ return { x: 380, y: 220-80*Math.sin(t*2)/2 }; },
      vel: function(t){ return { x: 0, y: -80*Math.cos(t*2) }; },
      acc: function(t){ return { x: 0, y: 160*Math.sin(t*2) }; }
    }
  ];

  function getTpl(n) {
    for (var i=0; i<templates.length; i++) if (templates[i].name===n) return templates[i];
    return templates[0];
  }

  canvas.addEventListener('click', function(e){
    var rect = canvas.getBoundingClientRect();
    var sx = e.clientX-rect.left, sy = e.clientY-rect.top;
    var scaleX = canvas.width/rect.width, scaleY = canvas.height/rect.height;
    var wx = sx*scaleX, wy = sy*scaleY;
    var selX = W-360, selY = 20;
    var bw = 360/templates.length;
    for (var i=0; i<templates.length; i++) {
      var bx = selX+4+i*bw, by = selY+4;
      if (wx>=bx && wx<=bx+bw-8 && wy>=by && wy<=by+28) {
        state.preset = templates[i].name; state.trail = [];
      }
    }
  });

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var p = getTpl(state.preset);
    var pos = p.pos(rawT);
    state.trail.push({ x: pos.x, y: pos.y });
    if (state.trail.length > 60) state.trail.shift();
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var rawT = state.t;
    var p = getTpl(state.preset);
    var pos = p.pos(rawT);
    var vel = p.vel(rawT);
    var acc = p.acc(rawT);
    var vmag = Math.sqrt(vel.x*vel.x+vel.y*vel.y);
    var amag = Math.sqrt(acc.x*acc.x+acc.y*acc.y);

    for (var j=1; j<state.trail.length; j++) {
      var alpha = (j/state.trail.length)*0.5;
      ctx.strokeStyle = 'rgba(52,152,219,'+alpha+')';
      ctx.lineWidth = 2*(j/state.trail.length);
      ctx.beginPath();
      ctx.moveTo(state.trail[j-1].x, state.trail[j-1].y);
      ctx.lineTo(state.trail[j].x, state.trail[j].y);
      ctx.stroke();
    }

    var vs = 20/Math.max(vmag,0.01), as = 15/Math.max(amag,0.01);
    if (vmag > 0.5) drawArrow(ctx,pos.x,pos.y,pos.x+vel.x*vs,pos.y+vel.y*vs,'#3498db',2,'v');
    if (amag > 0.5) drawArrow(ctx,pos.x,pos.y,pos.x+acc.x*as,pos.y+acc.y*as,'#e74c3c',2,'a');
    drawBall(ctx,pos.x,pos.y,8,'#fff','#c9963a','rgba(201,150,58,0.3)');

    drawPanel(ctx,20,20,170,105,'Mẫu: '+p.label);
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('x='+pos.x.toFixed(1)+' y='+pos.y.toFixed(1),30,42);
    ctx.fillStyle='#3498db'; ctx.fillText('|v|='+(vmag*state.speed).toFixed(1)+' px/s',30,60);
    ctx.fillStyle='#e74c3c'; ctx.fillText('|a|='+(amag*state.speed*state.speed).toFixed(1)+' px/s²',30,78);
    ctx.fillStyle='#c9963a'; ctx.fillText('t='+rawT.toFixed(2)+' s',30,96);
    ctx.textAlign='left';

    var selX=W-360, selY=20;
    var bw = 360/templates.length;
    ctx.fillStyle='rgba(9,26,51,0.85)'; ctx.strokeStyle='rgba(201,150,58,0.3)';
    roundRect(ctx,selX,selY,360,36,8); ctx.fill(); ctx.stroke();
    for (var i=0; i<templates.length; i++) {
      var bx=selX+4+i*bw, by=selY+4, bw2=bw-8;
      var sel = templates[i].name===state.preset;
      ctx.fillStyle = sel ? 'rgba(201,150,58,0.3)' : 'rgba(255,255,255,0.05)';
      ctx.strokeStyle = sel ? '#c9963a' : 'rgba(255,255,255,0.1)';
      roundRect(ctx,bx,by,bw2,28,6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = sel ? '#c9963a' : 'rgba(255,255,255,0.6)';
      ctx.font='bold 11px Segoe UI'; ctx.textAlign='center';
      ctx.fillText(templates[i].label, bx+bw2/2, by+18);
    }
    ctx.textAlign='left';
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 7: ch2-4-1 — Rotation Kinematics
// ================================================================
window.RouteRegistry.register('ch2-4-1', {
  chapter: 2, type: 'kinematics',
  title: 'Chuyển động quay',
  hint: 'θ=θ₀+ω₀·t+½αt² — bánh xe quay với đồ thị θ(t)',
  canvas: { width: 760, height: 560 }
});

window.SimRegistry['ch2-4-1'] = function(host) {
  var s   = simSetup(host, 'Chuyển động quay', '');
  var W=760, H1=440, H2=120;
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;

  var gCanvas = document.createElement('canvas');
  gCanvas.width=W; gCanvas.height=H2; gCanvas.style.display='block';
  s.lab.scene.appendChild(gCanvas);
  var gctx = gCanvas.getContext('2d');

  var histT=[]; var MAX_H=200;
  var theta0=0, omega0=1, alpha0=0.3;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var theta = theta0 + omega0*rawT + 0.5*alpha0*rawT*rawT;
    var omega = omega0 + alpha0*rawT;
    state._theta=theta; state._omega=omega; state._alpha=alpha0;
    histT.push({ t: rawT, theta: theta });
    if (histT.length > MAX_H) histT.shift();
  };

  function renderSim(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H1);
    drawGrid(ctx2,W,H1);
    var angle = state._theta || 0;
    var cx=W/2, cy=H1/2, R=120;
    drawWheel(ctx2,cx,cy,R,angle,8);
    drawPanel(ctx2,20,20,170,100,'Thông số quay');
    ctx2.fillStyle='#fff'; ctx2.font='13px Segoe UI'; ctx2.textAlign='left';
    ctx2.fillText('θ='+((state._theta||0)*180/Math.PI).toFixed(1)+'°',30,42);
    ctx2.fillStyle='#3498db'; ctx2.fillText('ω='+(state._omega||0).toFixed(2)+' rad/s',30,60);
    ctx2.fillStyle='#e74c3c'; ctx2.fillText('α='+(state._alpha||0).toFixed(2)+' rad/s²',30,78);
    ctx2.fillStyle='#c9963a'; ctx2.fillText('t='+state.t.toFixed(2)+' s',30,96);
    ctx2.textAlign='left';
  }

  function renderGraph(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H2);
    var pad=35, gW=W-pad*2, gH=H2-30;
    var ox=pad, oy=H2-20;
    drawGraphAxes(ctx2,ox,oy,gW,gH,'t','θ');
    if (histT.length < 2) return;
    var tMin=histT[0].t, tMax=histT[histT.length-1].t;
    var thMax=0;
    for (var i=0; i<histT.length; i++) if (histT[i].theta > thMax) thMax=histT[i].theta;
    thMax = thMax || 10;
    function gx(t){ return ox+((t-tMin)/Math.max(tMax-tMin,0.001))*gW; }
    function gy(th){ return oy-(th/thMax)*gH*0.8; }
    ctx2.strokeStyle='#c9963a'; ctx2.lineWidth=2;
    ctx2.beginPath();
    for (var j=0; j<histT.length; j++) {
      var px=gx(histT[j].t), py=gy(histT[j].theta);
      j===0 ? ctx2.moveTo(px,py) : ctx2.lineTo(px,py);
    }
    ctx2.stroke();
  }

  function render() {
    renderSim(ctx);
    renderGraph(gctx);
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 8: ch2-4-2 — Angular Velocity/Acceleration
// ================================================================
window.RouteRegistry.register('ch2-4-2', {
  chapter: 2, type: 'kinematics',
  title: 'Vận tốc & Gia tốc góc',
  hint: 'Đồ thị ω(t) và α(t) cho chuyển động quay',
  canvas: { width: 760, height: 560 }
});

window.SimRegistry['ch2-4-2'] = function(host) {
  var s   = simSetup(host, 'Vận tốc & Gia tốc góc', '');
  var W=760, H1=440, H2=120;
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;

  var gCanvas = document.createElement('canvas');
  gCanvas.width=W; gCanvas.height=H2; gCanvas.style.display='block';
  s.lab.scene.appendChild(gCanvas);
  var gctx = gCanvas.getContext('2d');

  var histW=[], histA=[]; var MAX_H=200;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var omega = 1 + 0.5*rawT;
    var alpha = 0.5;
    var theta = rawT + 0.25*rawT*rawT;
    state._theta=theta; state._omega=omega; state._alpha=alpha;
    histW.push({ t: rawT, v: omega });
    histA.push({ t: rawT, v: alpha });
    if (histW.length > MAX_H) { histW.shift(); histA.shift(); }
  };

  function renderSim(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H1);
    drawGrid(ctx2,W,H1);
    drawWheel(ctx2,W/2,H1/2,120,state._theta||0,8);
    drawPanel(ctx2,20,20,160,100,'Thông số');
    ctx2.fillStyle='#fff'; ctx2.font='13px Segoe UI'; ctx2.textAlign='left';
    ctx2.fillText('θ='+((state._theta||0)*180/Math.PI).toFixed(1)+'°',30,42);
    ctx2.fillStyle='#3498db'; ctx2.fillText('ω='+(state._omega||0).toFixed(2)+' rad/s',30,60);
    ctx2.fillStyle='#e74c3c'; ctx2.fillText('α='+(state._alpha||0).toFixed(2)+' rad/s²',30,78);
    ctx2.fillStyle='#c9963a'; ctx2.fillText('t='+state.t.toFixed(2)+' s',30,96);
    ctx2.textAlign='left';
  }

  function renderGraph(ctx2) {
    ctx2.fillStyle='#091a33'; ctx2.fillRect(0,0,W,H2);
    var pad=35, gW=W-pad*2, gH=H2-30;
    var ox=pad, oy=H2-20;
    drawGraphAxes(ctx2,ox,oy,gW,gH,'t','ω,α');
    if (histW.length < 2) return;
    var tMin=histW[0].t, tMax=histW[histW.length-1].t;
    var vMax=0;
    for (var i=0; i<histW.length; i++) if (histW[i].v > vMax) vMax=histW[i].v;
    vMax = vMax || 10;
    function gx(t){ return ox+((t-tMin)/Math.max(tMax-tMin,0.001))*gW; }
    function gy(v){ return oy-(v/vMax)*gH*0.7; }
    ctx2.strokeStyle='#3498db'; ctx2.lineWidth=2;
    ctx2.beginPath();
    for (var j=0; j<histW.length; j++) {
      var px=gx(histW[j].t), py=gy(histW[j].v);
      j===0 ? ctx2.moveTo(px,py) : ctx2.lineTo(px,py);
    }
    ctx2.stroke();
    ctx2.strokeStyle='#e74c3c'; ctx2.lineWidth=1.5;
    ctx2.beginPath();
    for (var k=0; k<histA.length; k++) {
      var px=gx(histA[k].t), py=gy(histA[k].v*5);
      k===0 ? ctx2.moveTo(px,py) : ctx2.lineTo(px,py);
    }
    ctx2.stroke();
    ctx2.fillStyle='rgba(255,255,255,0.4)'; ctx2.font='10px Segoe UI'; ctx2.textAlign='left';
    ctx2.fillText('ω [xanh], α×5 [đỏ]', ox+2, 12);
  }

  function render() {
    renderSim(ctx);
    renderGraph(gctx);
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 9b: ch2-4-4 — Coriolis Acceleration
// a_e = epsilon x r,  a_c = 2 * omega x v_r
// ================================================================
window.RouteRegistry.register('ch2-4-4', {
  chapter: 2, type: 'kinematics',
  title: 'Gia tốc Coriolis',
  hint: 'Đĩa quay ω — kéo điểm trượt để xem a_c = 2 ω × v_r',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-4-4'] = function(host) {
  var s = simSetup(host, 'Gia toc Coriolis', 'Keo diem tren dia de xem gia toc Coriolis');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator;
  var W=760, H=440, cx=W/2, cy=H/2, Rdisk=150;
  var state = { omega:1.0, vr:0, theta:0, px:cx+80, py:cy };
  state._animator = animator;

  s.lab.addSlider('omega', 0, 3, 1.0, 0.1, ' rad/s', function(v){ state.omega=v; });

  function render() {
    var om=state.omega, t=state.theta;
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);

    // Disk
    ctx.save();
    ctx.strokeStyle='rgba(201,150,58,0.3)'; ctx.lineWidth=1;
    for(var r=30;r<=Rdisk;r+=30){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();}
    ctx.strokeStyle='rgba(201,150,58,0.5)'; ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(cx,cy,Rdisk,0,Math.PI*2);ctx.stroke();
    // Spokes
    for(var a=0;a<Math.PI*2;a+=Math.PI/4){
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Rdisk*Math.cos(a),cy+Rdisk*Math.sin(a));ctx.stroke();
    }
    ctx.restore();

    // Rotating reference — show disk angle
    ctx.save();
    ctx.translate(cx,cy); ctx.rotate(t);
    ctx.strokeStyle='rgba(52,152,219,0.6)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Rdisk-10,0);ctx.stroke();
    ctx.fillStyle='rgba(52,152,219,0.8)'; ctx.font='bold 11px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('ref',Rdisk-20,0); ctx.restore();

    // Particle on disk (relative position)
    var rx=state.px-cx, ry=state.py-cy;
    var rr=Math.hypot(rx,ry);
    var speed=state.vr;
    // Relative velocity direction (tangential for display)
    var tangA=Math.atan2(ry,rx)+Math.PI/2;
    var vrx=speed*Math.cos(tangA), vry=speed*Math.sin(tangA);

    // Coriolis: a_c = 2 * omega x v_r (in 2D: magnitude = 2*om*vr)
    var ac=2*om*speed;
    // Direction of Coriolis: perpendicular to v_r, right-hand rule
    var acA=tangA+Math.PI/2; // perpendicular to v_r
    var acx=ac*Math.cos(acA), acy=ac*Math.sin(acA);

    // Draw particle
    ctx.beginPath(); ctx.arc(state.px,state.py,8,0,Math.PI*2);
    ctx.fillStyle='#e74c3c'; ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();

    // Relative velocity arrow
    if(Math.abs(speed)>0.1) {
      ctx.save();
      ctx.strokeStyle='rgba(52,152,219,0.8)'; ctx.fillStyle='rgba(52,152,219,0.8)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(state.px,state.py);
      ctx.lineTo(state.px+vrx*3, state.py+vry*3); ctx.stroke();
      ctx.font='bold 10px Segoe UI'; ctx.textAlign='left';
      ctx.fillText('v_r', state.px+vrx*3+5, state.py+vry*3+5);
      ctx.restore();
    }

    // Coriolis acceleration arrow
    if(Math.abs(ac)>0.1) {
      ctx.save();
      ctx.strokeStyle='rgba(231,76,60,0.9)'; ctx.fillStyle='rgba(231,76,60,0.9)'; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(state.px,state.py);
      ctx.lineTo(state.px+acx*3, state.py+acy*3); ctx.stroke();
      ctx.font='bold 10px Segoe UI'; ctx.textAlign='left';
      ctx.fillText('a_c', state.px+acx*3+5, state.py+acy*3+5);
      ctx.restore();
    }

    // Readout
    var panelX=20, panelY=20, panelW=190, panelH=110;
    ctx.fillStyle='rgba(9,26,51,0.88)'; ctx.strokeStyle='rgba(201,150,58,0.4)'; ctx.lineWidth=1;
    roundRect(ctx,panelX,panelY,panelW,panelH,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(201,150,58,0.6)'; ctx.font='bold 10px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('Gia toc Coriolis', panelX+10, panelY+14);
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI';
    ctx.fillText('omega = '+om.toFixed(2)+' rad/s', panelX+10, panelY+34);
    ctx.fillText('|v_r| = '+speed.toFixed(1)+' px/s', panelX+10, panelY+52);
    ctx.fillStyle='#e74c3c';
    ctx.fillText('|a_c| = '+ac.toFixed(1)+' px/s^2', panelX+10, panelY+70);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px Segoe UI';
    ctx.fillText('a_c = 2*omega*v_r', panelX+10, panelY+88);

    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='11px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('Keo diem do de thay doi vr', W/2, H-14);
  }

  function roundRect(ctx,x,y,w,h,r){
    r=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
    ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
    ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
    ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
  }

  animator.onTick=function(dt,elapsed){
    state.theta+=state.omega*(dt/1000);
    state.px=cx+rr*Math.cos(state.theta);
    state.py=cy+rr*Math.sin(state.theta);
  };

  function loop(){ render(); requestAnimationFrame(loop); }
  loop();

  return { dispose: function(){ animator.destroy(); } };
};

// ================================================================
// ROUTE 9: ch2-5-1 — Gear Transmission
// ================================================================
window.RouteRegistry.register('ch2-5-1', {
  chapter: 2, type: 'kinematics',
  title: 'Truyền động bánh răng',
  hint: 'ω₂ = ω₁ × N₁/N₂',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-5-1'] = function(host) {
  var s   = simSetup(host, 'Truyền động bánh răng', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440;
  var R1=70, N1=20, R2=50, N2=14;
  var cx1=W/2-80, cy1=H/2, cx2=W/2+80+R2-R1+10, cy2=H/2;
  var omega1=1.5;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var ratio = N1/N2;
    state._omega1 = omega1;
    state._omega2 = omega1 * ratio;
    state._angle1 = omega1 * rawT;
    state._angle2 = -omega1 * ratio * rawT;
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var a1=state._angle1||0, a2=state._angle2||0;
    drawGear(ctx,cx1,cy1,R1,N1,a1,'#c9963a');
    drawGear(ctx,cx2,cy2,R2,N2,a2,'#3498db');

    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(cx1+R1,cy1); ctx.lineTo(cx2-R2,cy2); ctx.stroke();

    ctx.fillStyle='#c9963a'; ctx.font='bold 12px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('Bánh 1 (N='+N1+')', cx1, cy1+R1+18);
    ctx.fillStyle='#3498db';
    ctx.fillText('Bánh 2 (N='+N2+')', cx2, cy2+R2+18);

    drawPanel(ctx,20,20,160,95,'Thông số truyền');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('ω₁='+(state._omega1||0).toFixed(2)+' rad/s',30,42);
    ctx.fillStyle='#3498db';
    ctx.fillText('ω₂='+(state._omega2||0).toFixed(2)+' rad/s',30,60);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText('Tỷ lệ N₁/N₂='+(N1/N2).toFixed(2),30,78);
    ctx.fillStyle='#c9963a';
    ctx.fillText('t='+state.t.toFixed(2)+' s',30,96);
    ctx.textAlign='left';
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 10: ch2-5-2 — Belt/Pulley System
// ================================================================
window.RouteRegistry.register('ch2-5-2', {
  chapter: 2, type: 'kinematics',
  title: 'Hệ puli - dây curoa',
  hint: 'v_belt = r × ω',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-5-2'] = function(host) {
  var s   = simSetup(host, 'Hệ puli - dây curoa', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440;
  var R1=60, R2=40, cx1=W/2-120, cy=H/2, cx2=W/2+120, cy2=H/2;
  var omega1=1.5;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var omega2 = omega1 * R1 / R2;
    var vbelt = omega1 * R1;
    state._omega1=omega1; state._omega2=omega2; state._vbelt=vbelt;
    state._angle1 = omega1 * rawT;
    state._angle2 = omega2 * rawT;
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var a1=state._angle1||0, a2=state._angle2||0;

    ctx.strokeStyle='rgba(201,150,58,0.4)'; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(cx1,cy-R1, R1, 0, Math.PI, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx2,cy2-R2, R2, 0, Math.PI, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx1,cy+R1, R1, Math.PI, Math.PI*2, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx2,cy2+R2, R2, Math.PI, Math.PI*2, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx1,cy-R1); ctx.lineTo(cx2,cy2-R2);
    ctx.moveTo(cx1,cy+R1); ctx.lineTo(cx2,cy2+R2);
    ctx.stroke();

    drawBeltPulley(ctx,cx1,cy,R1);
    drawBeltPulley(ctx,cx2,cy2,R2);

    ctx.fillStyle='#c9963a'; ctx.font='bold 12px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('Puli 1 (r='+R1+')', cx1, cy+R1+18);
    ctx.fillStyle='#3498db';
    ctx.fillText('Puli 2 (r='+R2+')', cx2, cy2+R2+18);

    drawPanel(ctx,20,20,170,95,'Thông số');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('ω₁='+(state._omega1||0).toFixed(2)+' rad/s',30,42);
    ctx.fillStyle='#3498db';
    ctx.fillText('ω₂='+(state._omega2||0).toFixed(2)+' rad/s',30,60);
    ctx.fillStyle='#c9963a';
    ctx.fillText('v_belt='+(state._vbelt||0).toFixed(1)+' px/s',30,78);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText('t='+state.t.toFixed(2)+' s',30,96);
    ctx.textAlign='left';
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 11: ch2-5-3 — Slider-Crank
// ================================================================
window.RouteRegistry.register('ch2-5-3', {
  chapter: 2, type: 'kinematics',
  title: 'Cơ cấu tay quay - con trượt',
  hint: 'x = r·cos(θ) + √(l² - r²sin²θ)',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-5-3'] = function(host) {
  var s   = simSetup(host, 'Cơ cấu Tay quay - Con trượt', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440;
  var r=80, l=180, cy=H/2;
  var cx_crank=150, omega=1.5;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var theta = omega * rawT;
    var sinT=Math.sin(theta), cosT=Math.cos(theta);
    var radicand = l*l - r*r*sinT*sinT;
    var x = r*cosT + Math.sqrt(radicand > 0 ? radicand : 0);
    var xdot = -r*sinT*omega - (r*r*sinT*cosT*omega)/(Math.sqrt(radicand > 0 ? radicand : 0.001));
    state._theta=theta; state._x=x; state._xdot=xdot;
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var theta=state._theta||0, x=state._x||(r+l), xdot=state._xdot||0;
    var px_crank=cx_crank+r*Math.cos(theta), py_crank=cy+r*Math.sin(theta);
    var ex=x, ey=cy;

    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(80,cy+10); ctx.lineTo(W-20,cy+10); ctx.stroke();

    ctx.strokeStyle='#c9963a'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(cx_crank,cy); ctx.lineTo(px_crank,py_crank); ctx.stroke();
    ctx.strokeStyle='#3498db'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(px_crank,py_crank); ctx.lineTo(ex,ey); ctx.stroke();
    ctx.fillStyle='rgba(201,150,58,0.3)'; ctx.strokeStyle='#c9963a'; ctx.lineWidth=2;
    roundRect(ctx,ex-15,ey-15,30,30,4); ctx.fill(); ctx.stroke();

    drawBall(ctx,cx_crank,cy,5,'#c9963a','#c9963a',null);
    drawBall(ctx,px_crank,py_crank,5,'#fff','#c9963a',null);
    drawBall(ctx,ex,ey,5,'#fff','#3498db',null);

    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(cx_crank,cy-25); ctx.lineTo(ex,cy-25); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='10px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('x='+x.toFixed(1), (cx_crank+ex)/2, cy-28);

    ctx.fillStyle='#c9963a'; ctx.font='bold 12px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('Crank r='+r, cx_crank+(px_crank-cx_crank)/2, cy-20);
    ctx.fillStyle='#3498db';
    ctx.fillText('Rod l='+l, (px_crank+ex)/2, (py_crank+ey)/2-10);

    drawPanel(ctx,20,20,160,100,'Thông số');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('θ='+((theta*180/Math.PI)%360).toFixed(1)+'°',30,42);
    ctx.fillStyle='#c9963a';
    ctx.fillText('x='+x.toFixed(1)+' px',30,60);
    ctx.fillStyle='#3498db';
    ctx.fillText('ẋ='+xdot.toFixed(1)+' px/s',30,78);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText('t='+state.t.toFixed(2)+' s',30,96);
    ctx.textAlign='left';
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 12: ch2-6-1 — Relative Motion
// ================================================================
window.RouteRegistry.register('ch2-6-1', {
  chapter: 2, type: 'kinematics',
  title: 'Chuyển động tương đối',
  hint: 'v_A = v_B + v_AB',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-6-1'] = function(host) {
  var s   = simSetup(host, 'Chuyển động tương đối', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var vBx=60, vBy=30;
    var vAx=90, vAy=50;
    var vABx=vAx-vBx, vABy=vAy-vBy;
    state._pA={ x: 180+120*Math.sin(rawT*0.7), y: 220+60*Math.sin(rawT) };
    state._pB={ x: 400+80*Math.sin(rawT*0.5), y: 220+50*Math.cos(rawT*0.8) };
    state._vA={ x:vAx, y:vAy };
    state._vB={ x:vBx, y:vBy };
    state._vAB={ x:vABx, y:vABy };
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var pA=state._pA||{x:180,y:220}, pB=state._pB||{x:400,y:220};
    var vA=state._vA||{x:0,y:0}, vB=state._vB||{x:0,y:0}, vAB=state._vAB||{x:0,y:0};

    var vs=2;
    drawArrow(ctx,pB.x,pB.y,pB.x+vB.x*vs,pB.y+vB.y*vs,'#2ecc71',2,'v_B');
    drawArrow(ctx,pA.x,pA.y,pA.x+vA.x*vs,pA.y+vA.y*vs,'#3498db',2,'v_A');
    drawArrow(ctx,pB.x,pB.y+25,pB.x+vAB.x*vs,pB.y+25+vAB.y*vs,'#e74c3c',2,'v_AB');

    drawBall(ctx,pA.x,pA.y,8,'#fff','#3498db','rgba(52,152,219,0.3)');
    drawBall(ctx,pB.x,pB.y,8,'#fff','#2ecc71','rgba(46,204,113,0.3)');

    ctx.fillStyle='#3498db'; ctx.font='bold 14px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('A', pA.x, pA.y-18);
    ctx.fillStyle='#2ecc71';
    ctx.fillText('B', pB.x, pB.y-18);

    drawPanel(ctx,20,20,170,100,'Thông số');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillStyle='#3498db';
    ctx.fillText('v_A=('+vA.x.toFixed(1)+','+vA.y.toFixed(1)+')',30,42);
    ctx.fillStyle='#2ecc71';
    ctx.fillText('v_B=('+vB.x.toFixed(1)+','+vB.y.toFixed(1)+')',30,60);
    ctx.fillStyle='#e74c3c';
    ctx.fillText('v_AB=('+vAB.x.toFixed(1)+','+vAB.y.toFixed(1)+')',30,78);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText('|v_A|='+Math.sqrt(vA.x*vA.x+vA.y*vA.y).toFixed(1),30,96);
    ctx.textAlign='left';

    ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='11px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('v_A = v_B + v_AB', W/2, H-15);
    ctx.textAlign='left';
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 13: ch2-6-2 — Carry-Along Velocity
// ================================================================
window.RouteRegistry.register('ch2-6-2', {
  chapter: 2, type: 'kinematics',
  title: 'Vận tốc kéo theo',
  hint: 'v_carrier = ω × r',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-6-2'] = function(host) {
  var s   = simSetup(host, 'Vận tốc kéo theo', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440, cx=W/2, cy=H/2, R=120, omega=1.2;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var theta = omega * rawT;
    var r=80, phi=Math.PI/4;
    var rx=r*Math.cos(phi), ry=r*Math.sin(phi);
    var px=cx+rx*Math.cos(theta)-ry*Math.sin(theta);
    var py=cy+rx*Math.sin(theta)+ry*Math.cos(theta);
    var vx=-omega*(rx*Math.sin(theta)+ry*Math.cos(theta));
    var vy=omega*(rx*Math.cos(theta)-ry*Math.sin(theta));
    state._px=px; state._py=py;
    state._vx=vx; state._vy=vy;
    state._v_mag=Math.sqrt(vx*vx+vy*vy);
    state._theta=theta;
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var theta=state._theta||0;
    var px=state._px||cx, py=state._py||cy;
    var vx=state._vx||0, vy=state._vy||0, vmag=state._v_mag||0;

    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.strokeStyle='rgba(201,150,58,0.3)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.strokeStyle='rgba(201,150,58,0.06)'; ctx.fillStyle='rgba(201,150,58,0.03)'; ctx.fill();

    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.setLineDash([3,5]);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py); ctx.stroke();
    ctx.setLineDash([]);

    drawArrow(ctx,cx,cy,px,py,'rgba(255,255,255,0.3)',1.5,'r');

    var vs=3;
    drawArrow(ctx,px,py,px+vx*vs,py+vy*vs,'#c9963a',2.5,'v_carry');

    drawBall(ctx,px,py,7,'#fff','#c9963a','rgba(201,150,58,0.4)');
    drawBall(ctx,cx,cy,5,'#c9963a','#c9963a',null);

    drawPanel(ctx,20,20,160,100,'Vận tốc kéo theo');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('ω='+omega.toFixed(2)+' rad/s',30,42);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText('r=80 px',30,60);
    ctx.fillStyle='#c9963a';
    ctx.fillText('|v|='+(vmag*state.speed).toFixed(1)+' px/s',30,78);
    ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.fillText('t='+state.t.toFixed(2)+' s',30,96);
    ctx.textAlign='left';
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 14: ch2-6-3 — Coriolis Acceleration
// ================================================================
window.RouteRegistry.register('ch2-6-3', {
  chapter: 2, type: 'kinematics',
  title: 'Gia tốc Coriolis',
  hint: 'a_C = 2 × ω × v_rel',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-6-3'] = function(host) {
  var s   = simSetup(host, 'Gia tốc Coriolis', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440, cx=W/2, cy=H/2, R=110, omega=1.0;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var r = 30 + 80 * (Math.sin(rawT*0.5)*0.5+0.5);
    var phi = omega * rawT;
    var px = cx + r*Math.cos(phi), py = cy + r*Math.sin(phi);
    var v_rel_rad = 40 * Math.cos(rawT*0.5) * 0.5;
    var vx = v_rel_rad*Math.cos(phi) - r*omega*Math.sin(phi);
    var vy = v_rel_rad*Math.sin(phi) + r*omega*Math.cos(phi);
    var aCx = -2*omega*vy, aCy = 2*omega*vx;
    state._px=px; state._py=py;
    state._vx=vx; state._vy=vy;
    state._aCx=aCx; state._aCy=aCy;
    state._r=r; state._phi=phi;
    state._aC_mag=Math.sqrt(aCx*aCx+aCy*aCy);
    state._v_mag=Math.sqrt(vx*vx+vy*vy);
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var px=state._px||cx, py=state._py||cy;
    var vx=state._vx||0, vy=state._vy||0;
    var aCx=state._aCx||0, aCy=state._aCy||0;
    var r=state._r||50, phi=state._phi||0;
    var aCmag=state._aC_mag||0, vmag=state._v_mag||0;

    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.strokeStyle='rgba(201,150,58,0.3)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='rgba(201,150,58,0.03)'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.setLineDash([3,5]);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py); ctx.stroke();
    ctx.setLineDash([]);

    var vs=2, as=0.5;
    drawArrow(ctx,px,py,px+vx*vs,py+vy*vs,'#3498db',2,'v_rel');
    if (aCmag > 0.1) drawArrow(ctx,px,py,px+aCx*as,py+aCy*as,'#e74c3c',2,'a_C');

    drawBall(ctx,px,py,7,'#fff','#c9963a','rgba(201,150,58,0.4)');

    drawPanel(ctx,20,20,170,115,'Gia tốc Coriolis');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('ω='+omega.toFixed(2)+' rad/s',30,42);
    ctx.fillStyle='#3498db';
    ctx.fillText('|v_rel|='+(vmag*state.speed).toFixed(1)+' px/s',30,60);
    ctx.fillStyle='#e74c3c';
    ctx.fillText('|a_C|='+(aCmag*state.speed*state.speed).toFixed(1)+' px/s²',30,78);
    ctx.fillText('a_C = 2·ω·v_rel',30,96);
    ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.fillText('r='+r.toFixed(0)+' px',30,114);
    ctx.textAlign='left';
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 15: ch2-7-1 — Instant Center (IC)
// ================================================================
window.RouteRegistry.register('ch2-7-1', {
  chapter: 2, type: 'kinematics',
  title: 'Tâm vận tốc tức thời (IC)',
  hint: 'v = ω × r_IC',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-7-1'] = function(host) {
  var s   = simSetup(host, 'Tâm vận tốc tức thời (IC)', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var omega=1.2;
    state._omega=omega;
    state._angle=omega*rawT;
    state._ic={ x: 200+80*Math.sin(rawT*0.3), y: H/2+60*Math.cos(rawT*0.3) };
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var angle=state._angle||0, omega=state._omega||1.2;
    var ic=state._ic||{x:200,y:H/2};
    var bodyCx=W/2, bodyCy=H/2;
    var R=100;

    ctx.save();
    ctx.translate(bodyCx, bodyCy);
    ctx.rotate(angle);
    ctx.strokeStyle='rgba(201,150,58,0.5)'; ctx.lineWidth=2;
    ctx.strokeRect(-80,-30,160,60);
    ctx.fillStyle='rgba(201,150,58,0.06)'; ctx.fill();
    var verts=[[-80,-30],[80,-30],[80,30],[-80,30],[-80,-30]];
    for(var i=0;i<4;i++) {
      var vx=bodyCx+verts[i][0]*Math.cos(angle)-verts[i][1]*Math.sin(angle);
      var vy=bodyCy+verts[i][0]*Math.sin(angle)+verts[i][1]*Math.cos(angle);
      drawBall(ctx,vx,vy,4,'#c9963a','#c9963a',null);
    }
    ctx.restore();

    ctx.beginPath(); ctx.arc(ic.x,ic.y,6,0,Math.PI*2);
    ctx.fillStyle='#e74c3c'; ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='#e74c3c'; ctx.font='bold 11px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('IC', ic.x, ic.y-12);

    var pts=[[bodyCx-60,bodyCy],[bodyCx+60,bodyCy],[bodyCx,bodyCy-30]];
    for(var j=0;j<pts.length;j++) {
      var px=pts[j][0], py=pts[j][1];
      var rICx=px-ic.x, rICy=py-ic.y;
      var vx=-omega*rICy, vy=omega*rICx;
      var vs=8/Math.max(Math.sqrt(vx*vx+vy*vy),0.01);
      drawArrow(ctx,px,py,px+vx*vs,py+vy*vs,'#3498db',2,null);
    }

    drawPanel(ctx,20,20,160,80,'Thông số');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('ω='+omega.toFixed(2)+' rad/s',30,42);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText('IC: ('+ic.x.toFixed(0)+','+ic.y.toFixed(0)+')',30,60);
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.fillText('v = ω × r_IC',30,78);
    ctx.textAlign='left';
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

// ================================================================
// ROUTE 16: ch2-7-2 — Plane Motion IC (Rolling)
// ================================================================
window.RouteRegistry.register('ch2-7-2', {
  chapter: 2, type: 'kinematics',
  title: 'Chuyển động phẳng - IC lăn trượt',
  hint: 'IC tại điểm tiếp xúc, v=0',
  canvas: { width: 760, height: 440 }
});

window.SimRegistry['ch2-7-2'] = function(host) {
  var s   = simSetup(host, 'Chuyển động phẳng - IC lăn trượt', '');
  var canvas = s.canvas, ctx = s.ctx;
  var animator = s.animator, timeline = s.timeline;
  var state = makeState();
  state._animator = animator; state._timeline = timeline;
  var W=760, H=440, R=60, cx=W/2, cy=H/2, omega=1.5;

  animator.onTick = function(dt, elapsed) {
    var rawT = ((elapsed*state.speed)/1000);
    state.t = rawT;
    var s_arc = omega * R * rawT;
    state._angle = omega * rawT;
    state._s = s_arc;
    state._omega = omega;
    state._cx = cx + s_arc;
    state._ic_x = cx + s_arc;
  };

  function render() {
    ctx.fillStyle='#091a33'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    var angle=state._angle||0;
    var wheelCx=state._cx||cx, icX=state._ic_x||cx;
    var wheelCy=cy, R2=R;

    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,cy+R2+5); ctx.lineTo(W,cy+R2+5); ctx.stroke();

    ctx.beginPath(); ctx.arc(icX,cy+R2,6,0,Math.PI*2);
    ctx.fillStyle='#e74c3c'; ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='#e74c3c'; ctx.font='bold 11px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('IC', icX, cy+R2-12);

    drawWheel(ctx,wheelCx,wheelCy,R2,angle,6);

    var pts=[
      [wheelCx, wheelCy],
      [wheelCx+R2*0.7, wheelCy],
      [wheelCx, wheelCy-R2*0.7],
      [wheelCx-R2*0.7, wheelCy]
    ];
    for(var j=0;j<pts.length;j++) {
      var px=pts[j][0], py=pts[j][1];
      var rICx=px-icX, rICy=py-(cy+R2);
      var vx=-omega*rICy, vy=omega*rICx;
      var vs=4/Math.max(Math.sqrt(vx*vx+vy*vy),0.01);
      drawArrow(ctx,px,py,px+vx*vs,py+vy*vs,'#3498db',1.5,null);
    }

    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('IC = điểm tiếp xúc, v=0', 20, H-15);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.textAlign='center';
    ctx.fillText('v = ω × r_IC', W/2, H-15);
    ctx.textAlign='left';

    drawPanel(ctx,20,20,170,100,'Lăn không trượt');
    ctx.fillStyle='#fff'; ctx.font='13px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('ω='+omega.toFixed(2)+' rad/s',30,42);
    ctx.fillStyle='#3498db';
    ctx.fillText('|v_CM|='+(omega*R).toFixed(1)+' px/s',30,60);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText('s='+(state._s||0).toFixed(1)+' px',30,78);
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.fillText('R='+R+' px',30,96);
    ctx.textAlign='left';
    requestAnimationFrame(render);
  }
  render();
  setTimeout(function(){ animator.play(); }, 100);
  return { dispose: function(){ animator.destroy(); s.pbUI.destroy(); } };
};

})();


