/**
 * Phase 03: Ch1 Statics -- ALL 20 Routes (new architecture)
 * Based on pilot-ch1-parallelogram.js pattern.
 * Each route: SimRegistry['routeId'] = function(host) { ... }
 */
(function() {
'use strict';

var V = (window.SimNew && window.SimNew.Vec2) || window.Vec2;
var RawHandle = window.SimNew && window.SimNew.Handle;
var H = function(opts) {
  function isConstructorMismatch(err) {
    return err && /constructor/i.test(String(err.message || err));
  }
  if (typeof RawHandle === 'function') {
    try { return new RawHandle(opts); }
    catch (err) {
      if (!isConstructorMismatch(err)) throw err;
      try { return RawHandle(opts); }
      catch (err2) {
        if (!isConstructorMismatch(err2)) throw err2;
      }
    }
  }
  opts = opts || {};
  return {
    _id: opts.label || opts.id || Math.random(),
    x: opts.x || 0,
    y: opts.y || 0,
    color: opts.color,
    type: opts.type,
    label: opts.label,
    radius: opts.radius || 10,
    onDrag: null,
    render: function(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color || C.gold;
      ctx.fill();
    }
  };
};
function makeHandle(opts) {
  return H(opts);
}
var HM = window.SimNew && window.SimNew.HandleManager;
var IM = window.SimNew && window.SimNew.InteractionManager;

// Colors
var C = {
  bg: '#091a33', gold: '#c9963a', red: '#e74c3c', blue: '#2980b9',
  green: '#27ae60', orange: '#fd7e14', purple: '#9b59b6',
  dim: 'rgba(255,255,255,0.5)', white: '#ffffff',
  panel: 'rgba(9,26,51,0.88)', border: 'rgba(201,150,58,0.4)',
  grid: 'rgba(255,255,255,0.04)',
};

// SHARED HELPERS
function dArrow(ctx, x1, y1, x2, y2, color, lw, label) {
  var dx = x2-x1, dy = y2-y1;
  var len = Math.hypot(dx, dy);
  if (len < 1) return;
  var a = Math.atan2(dy, dx);
  var hl = Math.min(14, len * 0.38);
  var ha = Math.PI / 7;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = lw || 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hl*Math.cos(a-ha), y2 - hl*Math.sin(a-ha));
  ctx.lineTo(x2 - hl*Math.cos(a+ha), y2 - hl*Math.sin(a+ha));
  ctx.closePath(); ctx.fill();
  if (label) {
    var mx = (x1+x2)/2, my = (y1+y2)/2;
    ctx.fillStyle = color; ctx.font = 'bold 12px Segoe UI';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 4;
    ctx.fillText(label, mx, my - 4);
  }
  ctx.restore();
}

function dArrowDashed(ctx, x1, y1, x2, y2, color, lw, label) {
  ctx.save();
  ctx.setLineDash([6, 4]);
  dArrow(ctx, x1, y1, x2, y2, color, lw, label);
  ctx.setLineDash([]); ctx.restore();
}

function dLine(ctx, x1, y1, x2, y2, color, lw, dashed) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw || 1.5;
  if (dashed) ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
  ctx.arcTo(x+w, y, x+w, y+r, r); ctx.lineTo(x+w, y+h-r);
  ctx.arcTo(x+w, y+h, x+w-r, y+h, r); ctx.lineTo(x+r, y+h);
  ctx.arcTo(x, y+h, x, y+h-r, r); ctx.lineTo(x, y+r);
  ctx.arcTo(x, y, x+r, y, r); ctx.closePath();
}

function dPanel(ctx, x, y, w, h, title) {
  ctx.fillStyle = C.panel; ctx.strokeStyle = C.border; ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 8); ctx.fill(); ctx.stroke();
  if (title) {
    ctx.fillStyle = C.gold; ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(title, x+10, y+8);
  }
}

function dText(ctx, text, x, y, font, color, align) {
  ctx.save();
  ctx.fillStyle = color || C.white; ctx.font = font || '13px Segoe UI';
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
  ctx.fillText(text, x, y); ctx.restore();
}

function dGrid(ctx, W, H) {
  ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
  var gx, gy;
  for (gx=0; gx<=W; gx+=30) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
  for (gy=0; gy<=H; gy+=30) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }
}

// SIM FACTORY
function makeSim(host, title, hint, cfg, renderFn) {
  var W = cfg.width || 760, H = cfg.height || 440;
  var lab = window.SimLabUI && window.SimLabUI.createLab(host, {title:title, hint:hint, width:W, height:H}) || {};
  var canvas = lab.canvas || (function() {
    var c = document.createElement('canvas'); c.width=W; c.height=H;
    host.appendChild(c); return c;
  })();
  canvas.width=W; canvas.height=H;
  var ctx = canvas.getContext('2d');

  var hm = new HM();
  hm.setScreenConverter(function(sx) {
    var r = canvas.getBoundingClientRect();
    return {x:(sx.x-r.left)*(W/r.width), y:(sx.y-r.top)*(H/r.height)};
  });

  var interaction = new IM(canvas);
  interaction.onPointerMove = function(cx, cy) {
    var w2 = hm._screenToWorld({x:cx, y:cy});
    hm.setHovered(w2.x, w2.y);
    canvas.style.cursor = hm.getCursor();
  };
  interaction.onDragStart = function(cx, cy) {
    var w2 = hm._screenToWorld({x:cx, y:cy});
    hm.startDrag(w2.x, w2.y); canvas.style.cursor = 'grabbing';
  };
  interaction.onDragMove = function(cx, cy) {
    var w2 = hm._screenToWorld({x:cx, y:cy});
    hm.moveDrag(w2.x, w2.y);
  };
  interaction.onDragEnd = function() { hm.endDrag(0,0); canvas.style.cursor = hm.getCursor(); };
  interaction.onKeyDown = function(code) {
    if (code === 'Tab') { interaction.isKeyDown('ShiftLeft') ? hm.tabPrev() : hm.tabNext(); return; }
    var d = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[code];
    if (d) hm.nudgeFocused(d[0], d[1], interaction.isKeyDown('ShiftLeft'));
  };

  function loop() {
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    dGrid(ctx, W, H);
    renderFn(ctx, hm, W, H);
    hm.render(ctx);
    requestAnimationFrame(loop);
  }
  loop();
  return { dispose: function() { interaction.destroy(); } };
}

// ROUTE REGISTRY
var RR = window.RouteRegistry;
var SR = window.SimRegistry;

[
 ['ch1-1-1','Cartesian Force Components','Kéo F hoặc góc alpha de thay doi luc'],
 ['ch1-1-2','Force Projection','Kéo truc (theta) hoac luc (alpha, F) de xem chieu'],
 ['ch1-1-3','Force Vector Anatomy','Kéo diem dat A hoac diem cuoi F'],
 ['ch1-1-4','Moment Arm (Canh tay dòn)','Kéo điểm đặt F hoặc góc — moment M = F x d'],
 ['ch1-1-5','Force System Reducer','Thêm lực F1, F2 — xem hợp lực R và moment M'],
 ['ch1-2-1','Moment About a Point','Kéo vi tri F de thay doi canh tay don d'],
 ['ch1-2-2','Varignon Theorem','3 luc hoi tu -- tong mo men = mo men hop luc'],
 ['ch1-2-3','Couple System','2 luc song song, nguoc chieu tao ngau luc'],
 ['ch1-2-4','Equivalent Couple','Kéo vi tri ngau luc -- mo men khong doi'],
 ['ch1-3-1','FBD Single Body','Kéo cac luc tren so do vat the tu do'],
 ['ch1-3-2','FBD Multiple Bodies','2 vat noi nhau -- xem luc tai lien ket'],
 ['ch1-3-3','Two-Force Body','Kéo thanh de xem 2 luc cung phuong, nguoc chieu'],
 ['ch1-4-1','Support Reactions','Kéo tai trong P -- tinh RA, RB tu sumM=0'],
 ['ch1-4-2','Beam Reactions','Kéo vi tri a và P -- tinh phan luc RB=P*a/L'],
 ['ch1-4-3','Cantilever Beam','Kéo tai trong P -- ngam tao M_fixed=P*a'],
 ['ch1-5-1','Spatial 3D Force','Kéo cac goc thetax, thetay de xem Fx, Fy, Fz'],
 ['ch1-5-2','3D Moment Vector','Kéo r và F trong khong gian 3D'],
 ['ch1-6-1','Dry Friction','Kéo goc nghieng theta -- so sanh Ff vs Ff_max'],
 ['ch1-6-2','Friction Angle','Kéo mu de thay doi goc ma sat phi'],
 ['ch1-6-3','Friction Rollback','Quan sat huong truot sap xay ra'],
 ['ch1-7-1','Centroid Composite','Kéo vi tri hinh chu nhat -- tinh trong tam'],
 ['ch1-7-2','Centroid with Holes','Tuong tu + lo khoet tru dien tich'],
].forEach(function(r) {
  if (window.RouteRegistry) window.RouteRegistry.register(r[0], {chapter:1, type:'statics', title:r[1], hint:r[2]});
});

// ============================================================
// 1. ch1-1-1 -- Cartesian Force Components
// ============================================================
(function() {
  var W=760, H=440;
  var st = {ox:380, oy:220, F:200, alpha:35};

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy, a=st.alpha*Math.PI/180;
    var fx=st.F*Math.cos(a), fy=-st.F*Math.sin(a);
    var ex=ox+fx, ey=oy+fy;
    var Fmag = Math.hypot(fx, fy);
    dArrow(ctx, ox, oy, ex, ey, C.red, 2.5, 'F');
    dArrowDashed(ctx, ox, oy, ex, oy, C.blue, 2, 'Fx');
    dLine(ctx, ex, oy, ex, ey, C.green, 1.5, true);
    ctx.save();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(ox, oy, 55, 0, -a, a<0); ctx.stroke();
    ctx.fillStyle = C.gold; ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('alpha='+st.alpha.toFixed(0)+' deg', ox+70, oy-30);
    ctx.restore();
    ctx.beginPath(); ctx.arc(ox, oy, 6, 0, Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill();
    dPanel(ctx, 20, 20, 165, 108, 'Ket qua', C.gold);
    dText(ctx, 'F  = '+Fmag.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'Fx = '+fx.toFixed(1)+' N', 30, 54, null, C.blue);
    dText(ctx, 'Fy = '+(-fy).toFixed(1)+' N', 30, 70, null, C.green);
    dText(ctx, 'a  = '+st.alpha.toFixed(1)+' deg', 30, 86, null, C.dim);
  }

  function build(hm) {
    var a=st.alpha*Math.PI/180;
    var ex=st.ox+st.F*Math.cos(a), ey=st.oy-st.F*Math.sin(a);
    var hF = makeHandle({x:ex, y:ey, color:C.red, type:'circle', label:'F', radius:10, snapEnabled:true});
    hF.onDrag = function(h) {
      var dx=h.x-st.ox, dy=st.oy-h.y;
      st.F = Math.min(300, Math.max(20, Math.hypot(dx,dy)));
      st.alpha = (Math.atan2(dy,dx)*180/Math.PI+360)%360;
    };
    hm.add(hF);
    var ax=st.ox+80*Math.cos(a), ay=st.oy-80*Math.sin(a);
    var hA = makeHandle({x:ax, y:ay, color:C.gold, type:'circle', label:'a', radius:9, snapEnabled:true});
    hA.onDrag = function(h) {
      var dx=h.x-st.ox, dy=st.oy-h.y;
      st.alpha = (Math.atan2(dy,dx)*180/Math.PI+360)%360;
    };
    hm.add(hA);
  }

  SR['ch1-1-1'] = function(host) {
    return makeSim(host, 'Cartesian Force Components', 'Kéo F hoac alpha de thay doi luc', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 2. ch1-1-2 -- Force Projection
// ============================================================
(function() {
  var W=760, H=440;
  var st = {ox:380, oy:220, F:200, theta:20, alpha:45};

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy;
    var ta=st.theta*Math.PI/180, fa=st.alpha*Math.PI/180;
    var F=st.F;
    var axD=Math.cos(ta), ayD=-Math.sin(ta);
    dLine(ctx, ox-300*axD, oy+300*ayD, ox+300*axD, oy-300*ayD, C.gold, 1.5, true);
    var fx=F*Math.cos(fa), fy=F*Math.sin(fa);
    var ex=ox+fx, ey=oy-fy;
    dArrow(ctx, ox, oy, ex, ey, C.red, 2.5, 'F');
    var proj=F*Math.cos(fa-ta);
    var px=ox+proj*Math.cos(ta), py=oy-proj*Math.sin(ta);
    dArrowDashed(ctx, ox, oy, px, py, C.blue, 2.5, 'Fp');
    dLine(ctx, ex, ey, px, py, C.green, 1.5, true);
    ctx.save();
    ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(ox, oy, 60, 0, -ta, ta<0); ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 11px Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('theta='+st.theta.toFixed(0)+' deg', ox+75, oy-30);
    ctx.restore();
    dPanel(ctx, 20, 20, 165, 100, 'Ket qua', C.gold);
    dText(ctx, 'F   = '+F.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'theta   = '+st.theta.toFixed(1)+' deg', 30, 54, null, C.gold);
    dText(ctx, 'alpha   = '+st.alpha.toFixed(1)+' deg', 30, 70, null, C.dim);
    dText(ctx, 'Fp  = '+proj.toFixed(1)+' N', 30, 86, null, C.blue);
  }

  function build(hm) {
    var ta=st.theta*Math.PI/180, fa=st.alpha*Math.PI/180;
    var ax=st.ox+90*Math.cos(ta), ay=st.oy-90*Math.sin(ta);
    var hT = makeHandle({x:ax, y:ay, color:C.gold, type:'circle', label:'theta', radius:10});
    hT.onDrag = function(h){ var dx=h.x-st.ox, dy=st.oy-h.y; st.theta=(Math.atan2(dy,dx)*180/Math.PI+360)%360; };
    hm.add(hT);
    var ex=st.ox+st.F*Math.cos(fa), ey=st.oy-st.F*Math.sin(fa);
    var hA = makeHandle({x:ex, y:ey, color:C.red, type:'circle', label:'alpha', radius:10});
    hA.onDrag = function(h){ var dx=h.x-st.ox, dy=st.oy-h.y; st.alpha=(Math.atan2(dy,dx)*180/Math.PI+360)%360; };
    hm.add(hA);
    var fx=st.F*Math.cos(fa), fy=st.F*Math.sin(fa);
    var mx=st.ox+fx*0.6, my=st.oy-fy*0.6;
    var hF = makeHandle({x:mx, y:my, color:C.red, type:'circle', label:'F', radius:9});
    hF.onDrag = function(h){ st.F=Math.min(300,Math.max(20,Math.hypot(h.x-st.ox,st.oy-h.y))); };
    hm.add(hF);
  }

  SR['ch1-1-2'] = function(host) {
    return makeSim(host, 'Force Projection', 'Kéo truc (theta) hoac luc (alpha, F)', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 3. ch1-1-3 -- Force Vector Anatomy
// ============================================================
(function() {
  var W=760, H=440;
  var st = {ox:200, oy:240, ex:480, ey:160};

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy, ex=st.ex, ey=st.ey;
    var dx=ex-ox, dy=ey-oy;
    var Fmag=Math.hypot(dx,dy);
    var alpha=Math.atan2(-dy,dx);
    var Fx=dx, Fy=-dy;
    dArrow(ctx, ox, oy, ex, ey, C.red, 3, 'F');
    dArrowDashed(ctx, ox, oy, ex, oy, C.blue, 2, 'Fx');
    dArrowDashed(ctx, ex, oy, ex, ey, C.green, 2, 'Fy');
    dLine(ctx, ox-20, oy, W-20, oy, C.dim, 1, true);
    ctx.save();
    ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(ox, oy, 60, 0, -alpha, alpha<0); ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 11px Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('alpha='+(alpha*180/Math.PI).toFixed(1)+' deg', ox+75, oy-30);
    ctx.restore();
    ctx.fillStyle='#fff'; ctx.font='bold 13px Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('A', ox, oy+8);
    ctx.fillStyle=C.gold; ctx.font='11px Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('diem dat', ox, oy+24);
    ctx.fillText('phuong', (ox+ex)/2, oy+10);
    ctx.fillText('chieu', ex+18, ey);
    dPanel(ctx, 20, 20, 170, 105, 'Thanh phan vec to', C.gold);
    dText(ctx, '|F| = '+Fmag.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'alpha   = '+(alpha*180/Math.PI).toFixed(1)+' deg', 30, 54, null, C.gold);
    dText(ctx, 'Fx  = '+Fx.toFixed(1)+' N', 30, 70, null, C.blue);
    dText(ctx, 'Fy  = '+Fy.toFixed(1)+' N', 30, 86, null, C.green);
  }

  function build(hm) {
    var hE = makeHandle({x:st.ex, y:st.ey, color:C.red, type:'circle', label:'F', radius:10});
    hE.onDrag = function(h){ st.ex=Math.min(W-20,Math.max(st.ox+20,h.x)); st.ey=Math.max(20,Math.min(H-20,h.y)); };
    hm.add(hE);
    var hO = makeHandle({x:st.ox, y:st.oy, color:C.gold, type:'diamond', label:'A', radius:10});
    hO.onDrag = function(h){ st.ox=Math.min(st.ex-20,Math.max(30,h.x)); st.oy=Math.max(20,Math.min(H-20,h.y)); };
    hm.add(hO);
  }

  SR['ch1-1-3'] = function(host) {
    return makeSim(host, 'Force Vector Anatomy', 'Kéo diem dat A hoac diem cuoi F', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 4. ch1-1-4 -- Moment Arm (Canh tay don)
// M = F x d  —  d = khoang cach phap tuyen tu O den duong tac dung cua F
// ============================================================
(function() {
  var W=760, HH=440;
  var st = {ox:180, oy:220, fx:480, fy:160, F:200, scale:100};

  function perpDist(px,py,ax,ay,bx,by) {
    var dx=bx-ax, dy=by-ay;
    var len=Math.hypot(dx,dy)||1;
    return Math.abs((by-ay)*(px-ax)-(bx-ax)*(py-ay))/len;
  }

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy;
    var fx2=st.fx-ox, fy2=st.fy-oy;
    var F=Math.hypot(fx2,fy2);
    var d=perpDist(ox,oy,st.fx,st.fy,st.fx+fx2,st.fy+fy2);
    var M=F*d/st.scale;

    // Beam / pivot
    ctx.save();
    ctx.strokeStyle=C.dim; ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(ox-40,oy+70); ctx.lineTo(ox+200,oy+70); ctx.stroke();
    ctx.restore();
    ctx.fillStyle='rgba(52,73,94,0.7)'; ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    roundRect(ctx, ox-45, oy-10, 90, 60, 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(ox, oy, 8, 0, Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill(); ctx.strokeStyle=C.gold; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 12px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('O', ox+12, oy+6);

    // Force arrow
    dArrow(ctx, st.fx, st.fy, st.fx+fx2, st.fy+fy2, C.red, 2.5, 'F');

    // Perpendicular line from O to force line
    var angle=Math.atan2(fy2,fx2);
    var perpA=angle-Math.PI/2;
    var pax=ox+d*Math.cos(perpA), pay=oy+d*Math.sin(perpA);
    dArrowDashed(ctx, ox, oy, pax, pay, C.gold, 1.5, 'd');

    // Arc at O
    ctx.save();
    ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(ox, oy, 60, angle-0.5, angle+0.5); ctx.stroke();
    ctx.beginPath();
    var aa=angle+0.5;
    ctx.moveTo(ox+60*Math.cos(aa), oy+60*Math.sin(aa));
    ctx.lineTo(ox+60*Math.cos(aa)-8*Math.cos(aa-0.3), oy+60*Math.sin(aa)-8*Math.sin(aa-0.3));
    ctx.lineTo(ox+60*Math.cos(aa)-8*Math.cos(aa+0.3), oy+60*Math.sin(aa)-8*Math.sin(aa+0.3));
    ctx.closePath(); ctx.fillStyle=C.gold; ctx.fill();
    ctx.restore();

    dPanel(ctx, 20, 20, 170, 105, 'Canh tay don M_O');
    dText(ctx, 'F   = '+F.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'd   = '+d.toFixed(1)+' px', 30, 54, null, C.gold);
    dText(ctx, 'M_O = '+(F/st.scale).toFixed(2)+' x '+d.toFixed(1), 30, 70, null, C.orange);
    dText(ctx, 'M_O = '+M.toFixed(2)+' N*m', 30, 86, null, C.orange);
    dText(ctx, '1px = 1 N (scale)', 30, 102, null, C.dim);
  }

  function build(hm) {
    var hF=makeHandle({x:st.fx, y:st.fy, color:C.red, type:'circle', label:'F', radius:10, snapEnabled:true});
    hF.onDrag=function(h){ st.fx=Math.max(st.ox+30,Math.min(W-20,h.x)); st.fy=Math.max(20,HH-20,h.y); };
    hm.add(hF);
  }

  SR['ch1-1-4'] = function(host) {
    return makeSim(host, 'Moment Arm (Canh tay don)', 'Keo diem dat F de thay doi canh tay don d', {width:W,height:HH}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 5. ch1-1-5 -- Force System Reducer
// R = sum(F_i),  M_O = sum(r_i x F_i)
// ============================================================
(function() {
  var W=760, HH=440;
  var st = {
    ox:380, oy:220,
    forces:[
      {x:280,y:140,fx:120,fy:-80,color:C.red},
      {x:420,y:120,fx:-60,fy:-110,color:C.blue},
      {x:500,y:200,fx:-90,fy:60,color:C.green}
    ]
  };

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy;
    // Compute resultant
    var Rx=0, Ry=0, M=0;
    st.forces.forEach(function(f){
      Rx+=f.fx; Ry+=f.fy;
      M+=(f.x-ox)*f.fy-(f.y-oy)*f.fx;
    });
    var R=Math.hypot(Rx,Ry);

    // Draw each force
    st.forces.forEach(function(f){
      dArrow(ctx, f.x, f.y, f.x+f.fx, f.y+f.fy, f.color, 2, '');
    });

    // Resultant
    if(R>1) {
      var rAngle=Math.atan2(Ry,Rx);
      dArrow(ctx, ox, oy, ox+Rx, oy+Ry, C.gold, 3, 'R');
      ctx.save();
      ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
      ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.arc(ox, oy, 50, 0, rAngle, Ry<0); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=C.gold; ctx.font='bold 11px Segoe UI'; ctx.textAlign='left';
      ctx.fillText('R='+R.toFixed(1)+'N', ox+60, oy-20);
      ctx.restore();
    }

    // O marker
    ctx.beginPath(); ctx.arc(ox, oy, 6, 0, Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill(); ctx.strokeStyle=C.gold; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 12px Segoe UI'; ctx.textAlign='left';
    ctx.fillText('O', ox+10, oy+5);

    dPanel(ctx, 20, 20, 180, 110, 'He thong luc → R, M');
    dText(ctx, 'Rx = '+Rx.toFixed(1)+' N', 30, 38, null, C.dim);
    dText(ctx, 'Ry = '+Ry.toFixed(1)+' N', 30, 54, null, C.dim);
    dText(ctx, 'R  = '+R.toFixed(1)+' N', 30, 70, null, C.gold);
    dText(ctx, 'M_O= '+(M/100).toFixed(2)+' N*m', 30, 86, null, C.orange);
    dText(ctx, 'Kéo cac muc ten de them luc', 30, 102, null, C.dim);
  }

  function build(hm) {
    st.forces.forEach(function(f,i){
      var h=makeHandle({x:f.x+f.fx*0.3, y:f.y+f.fy*0.3, color:f.color, type:'circle', label:'F'+(i+1), radius:9});
      h.onDrag=function(ho){
        f.fx=Math.max(-200,Math.min(200,ho.x-f.x));
        f.fy=Math.max(-200,Math.min(200,ho.y-f.y));
      };
      hm.add(h);
    });
  }

  SR['ch1-1-5'] = function(host) {
    return makeSim(host, 'Force System Reducer', 'Keo cac muc ten F de xem hop luc R va moment M', {width:W,height:HH}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 4. ch1-2-1 -- Moment About a Point
// ============================================================
(function() {
  var W=760, H=440;
  var st = {ox:150, oy:200, fx:280, fy:160};

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy;
    var fx2=st.fx-ox, fy2=st.fy-oy;
    var F=Math.hypot(fx2,fy2);
    var angle=Math.atan2(fy2,fx2);
    var dperp = Math.abs(fx2*Math.sin(angle) - fy2*Math.cos(angle)) || Math.abs((st.fx-ox)*(oy-st.fy)-(ox-st.fx)*(st.fy-oy))/F;
    var M=F*dperp;
    ctx.save(); ctx.strokeStyle=C.dim; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(60,oy+80); ctx.lineTo(W-60,oy+80); ctx.stroke(); ctx.restore();
    var bw=90, bh=50;
    ctx.fillStyle='rgba(52,73,94,0.6)'; ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    roundRect(ctx, st.fx-bw/2, st.fy-bh/2, bw, bh, 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(ox, oy, 8, 0, Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill(); ctx.strokeStyle=C.gold; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 13px Segoe UI'; ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText('O', ox+12, oy+8);
    dArrow(ctx, st.fx, st.fy, st.fx+fx2, st.fy+fy2, C.red, 2.5, 'F');
    var perpA=angle-Math.PI/2;
    var pax=st.fx+dperp*Math.cos(perpA), pay=st.fy+dperp*Math.sin(perpA);
    dArrowDashed(ctx, ox, oy, pax, pay, C.gold, 1.5, 'd');
    ctx.save(); ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(ox, oy, 55, angle-0.4, angle+0.4); ctx.stroke();
    var aa=angle+0.4;
    ctx.beginPath(); ctx.moveTo(ox+55*Math.cos(aa), oy-55*Math.sin(aa));
    ctx.lineTo(ox+55*Math.cos(aa)-8*Math.cos(aa-0.3), oy-55*Math.sin(aa)+8*Math.sin(aa-0.3));
    ctx.lineTo(ox+55*Math.cos(aa)-8*Math.cos(aa+0.3), oy-55*Math.sin(aa)+8*Math.sin(aa+0.3));
    ctx.closePath(); ctx.fillStyle=C.gold; ctx.fill(); ctx.restore();
    dPanel(ctx, 20, 20, 165, 100, 'Mo men tai O', C.gold);
    dText(ctx, 'F = '+F.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'd = '+dperp.toFixed(1)+' px', 30, 54, null, C.gold);
    dText(ctx, 'M = '+M.toFixed(1)+' N*px', 30, 70, null, C.orange);
    dText(ctx, 'M ~ '+(M/100).toFixed(2)+' N*m', 30, 86, null, C.dim);
  }

  function build(hm) {
    var hF = makeHandle({x:st.fx, y:st.fy, color:C.red, type:'circle', label:'F', radius:10});
    hF.onDrag = function(h){ st.fx=Math.max(st.ox+30,Math.min(W-20,h.x)); st.fy=Math.max(20,Math.min(st.oy+60,h.y)); };
    hm.add(hF);
    var fx2=st.fx-st.ox, fy2=st.fy-st.oy;
    var hE = makeHandle({x:st.fx+fx2, y:st.fy+fy2, color:C.red, type:'circle', label:'', radius:9});
    hE.onDrag = function(h){ var efx=h.x-st.fx, efy=h.y-st.fy; st.fx=Math.max(st.ox+30,Math.min(W-20,st.fx+efx)); st.fy=Math.max(20,Math.min(st.oy+60,st.fy+efy)); };
    hm.add(hE);
  }

  SR['ch1-2-1'] = function(host) {
    return makeSim(host, 'Moment About a Point', 'Kéo diem dat luc F de thay doi canh tay don', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 5. ch1-2-2 -- Varignon Theorem
// ============================================================
(function() {
  var W=760, H=440;
  var st = {
    ox:380, oy:220,
    F1:{fx:120,fy:-80}, F2:{fx:80,fy:100}, F3:{fx:-60,fy:-60}
  };

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy;
    var Fs=[st.F1,st.F2,st.F3];
    var cols=[C.red,C.blue,C.green], lbs=['F1','F2','F3'];
    var Rx=0,Ry=0;
    Fs.forEach(function(f){ Rx+=f.fx; Ry+=f.fy; });
    var R=Math.hypot(Rx,Ry);
    Fs.forEach(function(f,i){ dArrow(ctx,ox,oy,ox+f.fx,oy+f.fy,cols[i],2.5,lbs[i]); });
    dArrowDashed(ctx, ox, oy, ox+Rx, oy+Ry, C.gold, 2.5, 'R');
    ctx.beginPath(); ctx.arc(ox, oy, 8, 0, Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill(); ctx.strokeStyle=C.gold; ctx.lineWidth=2; ctx.stroke();
    var M1=st.F1.fx*(oy-(oy+st.F1.fy))-st.F1.fy*(ox+(st.F1.fx)-ox);
    var M2=st.F2.fx*(oy-(oy+st.F2.fy))-st.F2.fy*(ox+(st.F2.fx)-ox);
    var M3=st.F3.fx*(oy-(oy+st.F3.fy))-st.F3.fy*(ox+(st.F3.fx)-ox);
    var sumM=M1+M2+M3;
    dPanel(ctx, 20, 20, 170, 125, 'Varignon: sumMi = MR', C.gold);
    dText(ctx, 'M1 = '+(M1/100).toFixed(2)+' N*m', 30, 38, null, cols[0]);
    dText(ctx, 'M2 = '+(M2/100).toFixed(2)+' N*m', 30, 54, null, cols[1]);
    dText(ctx, 'M3 = '+(M3/100).toFixed(2)+' N*m', 30, 70, null, cols[2]);
    dText(ctx, 'sumM  = '+(sumM/100).toFixed(2)+' N*m', 30, 86, null, C.purple);
    dText(ctx, '|R| = '+R.toFixed(1)+' N', 30, 102, null, C.gold);
    dPanel(ctx, W-220, H-50, 200, 36, '', C.gold);
    dText(ctx, 'sumM = '+(sumM/100).toFixed(2)+' N*m', W-210, H-36, 'bold 13px Segoe UI', C.gold, 'center');
  }

  function build(hm) {
    [st.F1,st.F2,st.F3].forEach(function(f,i){
      var h = makeHandle({x:st.ox+f.fx, y:st.oy+f.fy, color:[C.red,C.blue,C.green][i], type:'circle', label:['F1','F2','F3'][i], radius:10});
      h.onDrag = function(h2){ f.fx=h2.x-st.ox; f.fy=h2.y-st.oy; };
      hm.add(h);
    });
  }

  SR['ch1-2-2'] = function(host) {
    return makeSim(host, 'Varignon Theorem', '3 luc hoi tu -- tong mo men = mo men hop luc', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 6. ch1-2-3 -- Couple System
// ============================================================
(function() {
  var W=760, H=440;
  var st = {ox:380, oy:220, F:150, d:120};

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy, F=st.F, d=st.d;
    var fv=Math.min(100,F*0.5), topY=oy-50, botY=oy+50;
    ctx.fillStyle='rgba(52,73,94,0.6)'; ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    roundRect(ctx, ox-120, topY-30, 240, 60, 8); ctx.fill(); ctx.stroke();
    dArrow(ctx, ox, topY, ox, topY-fv, C.red, 3, '+F');
    dArrow(ctx, ox, botY, ox, botY+fv, C.red, 3, '-F');
    dLine(ctx, ox-d/2, topY, ox-d/2, botY, C.gold, 1.5, true);
    dText(ctx, 'd='+d.toFixed(0)+' px', ox-d/2-10, (topY+botY)/2, '11px Segoe UI', C.gold, 'right');
    ctx.save(); ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(ox-d/2-30, (topY+botY)/2, 40, -0.3, Math.PI-0.3); ctx.stroke(); ctx.restore();
    var M=F*d;
    dPanel(ctx, 20, 20, 165, 95, 'Ngau luc', C.gold);
    dText(ctx, 'F = '+F.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'd = '+d.toFixed(0)+' px', 30, 54, null, C.gold);
    dText(ctx, 'M = F*d', 30, 70, null, C.dim);
    dText(ctx, 'M = '+(M/100).toFixed(2)+' N*m', 30, 86, null, C.orange);
    dPanel(ctx, W-220, H-50, 200, 36, '', C.gold);
    dText(ctx, 'M = '+F+'*'+(d/100).toFixed(1)+' = '+(M/100).toFixed(2)+' N*m', W-210, H-36, 'bold 12px Segoe UI', C.gold, 'center');
  }

  function build(hm) {
    var hF = makeHandle({x:st.ox, y:st.oy-50-st.F*0.5, color:C.red, type:'circle', label:'F', radius:10});
    hF.onDrag = function(h){ st.F=Math.min(300,Math.max(20,Math.abs(h.y-(st.oy-50))*2)); };
    hm.add(hF);
    var hD = makeHandle({x:st.ox-st.d/2, y:st.oy, color:C.gold, type:'square', label:'d', radius:9});
    hD.onDrag = function(h){ st.d=Math.min(300,Math.max(20,Math.abs(h.x-st.ox)*2)); };
    hm.add(hD);
  }

  SR['ch1-2-3'] = function(host) {
    return makeSim(host, 'Couple System', 'Kéo F hoac d de thay doi mo men ngau luc', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 7. ch1-2-4 -- Equivalent Couple
// ============================================================
(function() {
  var W=760, H=440;
  var st = {ox:380, oy:220, angle:0, pos:0};
  var M = 18000;

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy, a=st.angle*Math.PI/180, pos=st.pos;
    var blen=200;
    ctx.save(); ctx.translate(ox+pos, oy); ctx.rotate(a);
    ctx.fillStyle='rgba(52,73,94,0.6)'; ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    roundRect(ctx, -blen/2, -25, blen, 50, 8); ctx.fill(); ctx.stroke();
    ctx.restore();
    dPanel(ctx, 20, 20, 180, 85, 'Ngau luc tuong duong', C.gold);
    dText(ctx, 'M = '+(M/100).toFixed(0)+' N*px', 30, 38, null, C.orange);
    dText(ctx, 'M = '+(M/100).toFixed(0)+' N*m', 30, 54, null, C.gold);
    dText(ctx, '(tinh tien khong doi)', 30, 70, '10px Segoe UI', C.dim);
    ctx.save(); ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(ox+pos, oy, 35, 0, Math.PI*1.5); ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 11px Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('M='+(M/100).toFixed(0), ox+pos, oy-40); ctx.restore();
  }

  function build(hm) {
    var hA = makeHandle({x:st.ox+100, y:st.oy-60, color:C.gold, type:'circle', label:'theta', radius:10});
    hA.onDrag = function(h){ st.angle=(Math.atan2(h.y-st.oy,h.x-st.ox)*180/Math.PI+360)%360; };
    hm.add(hA);
    var hP = makeHandle({x:st.ox+st.pos+50, y:st.oy+50, color:C.blue, type:'circle', label:'pos', radius:9});
    hP.onDrag = function(h){ st.pos=Math.max(-150,Math.min(150,h.x-st.ox)); };
    hm.add(hP);
  }

  SR['ch1-2-4'] = function(host) {
    return makeSim(host, 'Equivalent Couple', 'Kéo vi tri va goc -- mo men khong doi', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 8. ch1-3-1 -- FBD Single Body
// ============================================================
(function() {
  var W=760, H=440;
  var st = {
    bx:280, by:180, bw:200, bh:80,
    forces:[
      {fx:0,fy:-120,color:C.red,label:'P'},
      {fx:-80,fy:0,color:C.blue,label:'Rx'},
      {fx:0,fy:80,color:C.green,label:'Ry'},
    ]
  };

  function render(ctx, hm, W, H) {
    var bx=st.bx, by=st.by, bw=st.bw, bh=st.bh;
    var mx=bx+bw/2, my=by+bh/2;
    ctx.fillStyle='rgba(52,73,94,0.7)'; ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    roundRect(ctx, bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 12px Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Vat ran', mx, my);
    st.forces.forEach(function(f){
      var sx=mx+(f.fx===0?0:(f.fx>0?bw/2:-bw/2));
      var sy=my+(f.fy===0?0:(f.fy<0?-bh/2:bh/2));
      dArrow(ctx, sx, sy, sx+f.fx, sy+f.fy, f.color, 2.5, f.label);
    });
    var sumFx=st.forces.reduce(function(s,f){return s+f.fx;},0);
    var sumFy=st.forces.reduce(function(s,f){return s+f.fy;},0);
    var sumM=st.forces.reduce(function(s,f){
      var sx=mx+(f.fx===0?0:(f.fx>0?bw/2:-bw/2));
      var sy=my+(f.fy===0?0:(f.fy<0?-bh/2:bh/2));
      return s+f.fx*(sy-my)-f.fy*(sx-mx);
    },0);
    dPanel(ctx, 20, 20, 165, 105, 'Can bang FBD', C.gold);
    dText(ctx, 'sumFx = '+sumFx.toFixed(1)+' N', 30, 38, null, C.blue);
    dText(ctx, 'sumFy = '+sumFy.toFixed(1)+' N', 30, 54, null, C.green);
    dText(ctx, 'sumM  = '+(sumM/100).toFixed(2)+' N*m', 30, 70, null, C.orange);
    dText(ctx, 'sumF=0, sumM=0 => can bang', 30, 86, '10px Segoe UI', C.dim);
  }

  function build(hm) {
    var mx=st.bx+st.bw/2, my=st.by+st.bh/2;
    st.forces.forEach(function(f){
      var sx=mx+(f.fx===0?0:(f.fx>0?st.bw/2:-st.bw/2));
      var sy=my+(f.fy===0?0:(f.fy<0?-st.bh/2:st.bh/2));
      var h = makeHandle({x:sx+f.fx, y:sy+f.fy, color:f.color, type:'circle', label:f.label, radius:10});
      h.onDrag = function(h2){ f.fx=h2.x-sx; f.fy=h2.y-sy; };
      hm.add(h);
    });
  }

  SR['ch1-3-1'] = function(host) {
    return makeSim(host, 'FBD Single Body', 'Kéo cac luc tren so do vat the tu do', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 9. ch1-3-2 -- FBD Multiple Bodies
// ============================================================
(function() {
  var W=760, H=440;
  var st = {
    b1:{x:120,y:180,w:120,h:60},
    b2:{x:300,y:180,w:120,h:60},
    P:150, T:120,
  };

  function render(ctx, hm, W, H) {
    var b1=st.b1, b2=st.b2;
    ctx.fillStyle='rgba(52,73,94,0.7)'; ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    roundRect(ctx, b1.x, b1.y, b1.w, b1.h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 11px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Vat 1', b1.x+b1.w/2, b1.y+b1.h/2);
    roundRect(ctx, b2.x, b2.y, b2.w, b2.h, 6); ctx.fill(); ctx.stroke();
    ctx.fillText('Vat 2', b2.x+b2.w/2, b2.y+b2.h/2);
    dLine(ctx, b1.x+b1.w, b1.y+b1.h/2, b2.x, b2.y+b2.h/2, C.purple, 2);
    dText(ctx, 'T', (b1.x+b1.w+b2.x)/2, b1.y+b1.h/2-10, '11px Segoe UI', C.purple, 'center');
    dArrow(ctx, b1.x+b1.w, b1.y+b1.h/2, b1.x+b1.w+st.T/2, b1.y+b1.h/2, C.purple, 2, 'T');
    dArrow(ctx, b2.x, b2.y+b2.h/2, b2.x-st.T/2, b2.y+b2.h/2, C.purple, 2, 'T');
    dArrow(ctx, b2.x+b2.w/2, b2.y, b2.x+b2.w/2, b2.y-st.P, C.red, 2.5, 'P');
    ctx.strokeStyle=C.dim; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(b1.x, b1.y+b1.h+10); ctx.lineTo(b1.x+b1.w, b1.y+b1.h+10); ctx.stroke();
    dPanel(ctx, 20, 20, 175, 90, 'Luc tai lien ket', C.gold);
    dText(ctx, 'P  = '+st.P.toFixed(1)+' N (ngoai)', 30, 38, null, C.red);
    dText(ctx, 'T  = '+st.T.toFixed(1)+' N (trong)', 30, 54, null, C.purple);
    dText(ctx, 'Luc trong = phan luc lien ket', 30, 70, '10px Segoe UI', C.dim);
  }

  function build(hm) {
    var b2=st.b2;
    var hP = makeHandle({x:b2.x+b2.w/2, y:b2.y-st.P, color:C.red, type:'circle', label:'P', radius:10});
    hP.onDrag = function(h){ st.P=Math.min(300,Math.max(10,b2.y-h.y)); };
    hm.add(hP);
    var hT = makeHandle({x:st.b1.x+st.b1.w+st.T/2, y:st.b1.y+st.b1.h/2, color:C.purple, type:'circle', label:'T', radius:10});
    hT.onDrag = function(h){ st.T=Math.min(300,Math.max(10,h.x-(st.b1.x+st.b1.w))); };
    hm.add(hT);
  }

  SR['ch1-3-2'] = function(host) {
    return makeSim(host, 'FBD Multiple Bodies', 'Kéo P hoac T de xem luc noi tai', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 10. ch1-3-3 -- Two-Force Body
// ============================================================
(function() {
  var W=760, H=440;
  var st = {ox:380, oy:220, angle:15, F:180};

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy, a=st.angle*Math.PI/180, F=st.F;
    var bw=200, bh=30;
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(-a);
    ctx.fillStyle='rgba(52,73,94,0.7)'; ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    roundRect(ctx, -bw/2, -bh/2, bw, bh, 6); ctx.fill(); ctx.stroke();
    ctx.restore();
    var axD=Math.cos(a), ayD=-Math.sin(a);
    var fv=Math.min(80,F*0.4);
    var lx=ox-bw/2*axD, ly=oy+bw/2*Math.sin(a);
    var rx=ox+bw/2*axD, ry=oy-bw/2*Math.sin(a);
    dArrow(ctx, lx, ly, lx-axD*fv, ly+ayD*fv, C.red, 2.5, 'F1');
    dArrow(ctx, rx, ry, rx+axD*fv, ry-ayD*fv, C.red, 2.5, 'F2');
    dLine(ctx, lx-axD*100, ly+ayD*100, rx+axD*100, ry-ayD*100, C.dim, 1, true);
    dPanel(ctx, 20, 20, 165, 80, 'Vat hai luc', C.gold);
    dText(ctx, 'F = '+F.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'theta = '+st.angle.toFixed(1)+' deg', 30, 54, null, C.gold);
    dText(ctx, 'F1 // F2, nguoc chieu', 30, 70, '10px Segoe UI', C.dim);
  }

  function build(hm) {
    var hA = makeHandle({x:st.ox+80, y:st.oy-60, color:C.gold, type:'circle', label:'theta', radius:10});
    hA.onDrag = function(h){ st.angle=(Math.atan2(st.oy-h.y,h.x-st.ox)*180/Math.PI+360)%90; };
    hm.add(hA);
    var hF = makeHandle({x:st.ox-st.F*0.4-100, y:st.oy, color:C.red, type:'circle', label:'F', radius:10});
    hF.onDrag = function(h){ st.F=Math.min(300,Math.max(20,Math.abs(h.x-(st.ox-100)))); };
    hm.add(hF);
  }

  SR['ch1-3-3'] = function(host) {
    return makeSim(host, 'Two-Force Body', 'Kéo thanh -- 2 luc cung phuong, nguoc chieu', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 11. ch1-4-1 -- Support Reactions (Pin + Roller)
// ============================================================
(function() {
  var W=760, H=440;
  var st = {L:500, P:150, a:200};

  function compute() {
    var L=st.L, P=st.P, a=st.a;
    st.RB = P*a/L; st.RA = P - st.RB;
  }

  function render(ctx, hm, W, H) {
    compute();
    var L=st.L, P=st.P, a=st.a, RA=st.RA, RB=st.RB;
    var beamY=260, lx=(W-L)/2, rx=lx+L;
    ctx.save(); ctx.strokeStyle=C.dim; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(lx,beamY+10); ctx.lineTo(lx+40,beamY+10); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(lx+20,beamY+25,12,0,Math.PI*2);
    ctx.fillStyle=C.gold; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 11px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('A', lx+20, beamY+44);
    ctx.save(); ctx.strokeStyle=C.dim; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(rx-40,beamY+10); ctx.lineTo(rx,beamY+10); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(rx-20,beamY+25,12,0,Math.PI*2);
    ctx.fillStyle=C.gold; ctx.fill();
    ctx.fillText('B', rx-20, beamY+44);
    ctx.fillStyle='rgba(52,73,94,0.7)'; ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    roundRect(ctx, lx, beamY-15, L, 30, 4); ctx.fill(); ctx.stroke();
    var px=lx+a;
    dArrow(ctx, px, beamY-15, px, beamY-15-P*0.3, C.red, 2.5, 'P='+P.toFixed(0)+'N');
    dArrow(ctx, lx+20, beamY+40, lx+20, beamY+40+RA*0.3, C.blue, 2.5, 'RA='+RA.toFixed(0)+'N');
    dArrow(ctx, rx-20, beamY+40, rx-20, beamY+40+RB*0.3, C.green, 2.5, 'RB='+RB.toFixed(0)+'N');
    dLine(ctx, lx, beamY+55, rx, beamY+55, C.dim, 1, true);
    dText(ctx, 'L='+L+'px', (lx+rx)/2, beamY+60, '10px Segoe UI', C.dim, 'center');
    dLine(ctx, lx, beamY+62, lx+a, beamY+62, C.gold, 1, true);
    dText(ctx, 'a='+a+'px', lx+a/2, beamY+67, '10px Segoe UI', C.gold, 'center');
    dPanel(ctx, 20, 20, 165, 90, 'Phan luc goi', C.gold);
    dText(ctx, 'P  = '+P.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'RA = '+RA.toFixed(1)+' N', 30, 54, null, C.blue);
    dText(ctx, 'RB = '+RB.toFixed(1)+' N', 30, 70, null, C.green);
    dText(ctx, 'sumM=0 => RB=P*a/L', 30, 86, '10px Segoe UI', C.dim);
  }

  function build(hm) {
    var lx=(W-st.L)/2;
    var hP = makeHandle({x:lx+st.a, y:260-15-st.P*0.3, color:C.red, type:'circle', label:'P', radius:10});
    hP.onDrag = function(h){ st.P=Math.min(300,Math.max(20,(260-15-h.y)/0.3)); };
    hm.add(hP);
    var hA = makeHandle({x:lx+st.a, y:260+65, color:C.gold, type:'circle', label:'a', radius:10});
    hA.onDrag = function(h){ st.a=Math.min(450,Math.max(20,h.x-lx)); };
    hm.add(hA);
  }

  SR['ch1-4-1'] = function(host) {
    return makeSim(host, 'Support Reactions', 'Kéo P hoac a -- tinh RA, RB tu sumM=0', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 12. ch1-4-2 -- Beam Reactions
// ============================================================
(function() {
  var W=760, H=440;
  var st = {L:500, P:150, a:200};

  function render(ctx, hm, W, H) {
    var L=st.L, P=st.P, a=st.a;
    var RB=P*a/L, RA=P-RB;
    var beamY=260, lx=(W-L)/2, rx=lx+L;
    ctx.save(); ctx.strokeStyle=C.dim; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(lx,beamY+10); ctx.lineTo(lx+30,beamY+10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx-30,beamY+10); ctx.lineTo(rx,beamY+10); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(lx+15,beamY+22,10,0,Math.PI*2); ctx.fillStyle=C.gold; ctx.fill();
    ctx.beginPath(); ctx.arc(rx-15,beamY+22,10,0,Math.PI*2); ctx.fillStyle=C.gold; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 10px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('A', lx+15, beamY+38); ctx.fillText('B', rx-15, beamY+38);
    ctx.fillStyle='rgba(52,73,94,0.7)'; ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    roundRect(ctx, lx, beamY-15, L, 30, 4); ctx.fill(); ctx.stroke();
    var px=lx+a;
    dArrow(ctx, px, beamY-15, px, beamY-15-P*0.3, C.red, 2.5, 'P');
    dArrow(ctx, lx+15, beamY+40, lx+15, beamY+40+RA*0.3, C.blue, 2.5, 'RA');
    dArrow(ctx, rx-15, beamY+40, rx-15, beamY+40+RB*0.3, C.green, 2.5, 'RB');
    dLine(ctx, lx, beamY+55, rx, beamY+55, C.dim, 1, true);
    dText(ctx, 'L='+L+'px', (lx+rx)/2, beamY+60, '10px Segoe UI', C.dim, 'center');
    dLine(ctx, lx, beamY+62, px, beamY+62, C.gold, 1, true);
    dText(ctx, 'a='+a+'px', lx+(a)/2, beamY+67, '10px Segoe UI', C.gold, 'center');
    dPanel(ctx, 20, 20, 165, 95, 'Phan luc dam', C.gold);
    dText(ctx, 'P  = '+P.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'a  = '+a.toFixed(0)+' px', 30, 54, null, C.gold);
    dText(ctx, 'RA = '+RA.toFixed(1)+' N', 30, 70, null, C.blue);
    dText(ctx, 'RB = '+RB.toFixed(1)+' N', 30, 86, null, C.green);
  }

  function build(hm) {
    var L=st.L, lx=(W-L)/2;
    var hP = makeHandle({x:lx+st.a, y:260-15-st.P*0.3, color:C.red, type:'circle', label:'P', radius:10});
    hP.onDrag = function(h){ st.P=Math.min(300,Math.max(10,(260-15-h.y)/0.3)); };
    hm.add(hP);
    var hA = makeHandle({x:lx+st.a, y:260+65, color:C.gold, type:'circle', label:'a', radius:10});
    hA.onDrag = function(h){ st.a=Math.min(L-20,Math.max(20,h.x-lx)); };
    hm.add(hA);
  }

  SR['ch1-4-2'] = function(host) {
    return makeSim(host, 'Beam Reactions', 'Kéo vi tri a va P -- tinh phan luc', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 13. ch1-4-3 -- Cantilever Beam
// ============================================================
(function() {
  var W=760, H=440;
  var st = {P:150, a:200};

  function render(ctx, hm, W, H) {
    var P=st.P, a=st.a;
    var Mfixed=P*a;
    var beamY=220, bx=100, bw=400, bh=30;
    ctx.fillStyle='rgba(52,73,94,0.8)'; ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    roundRect(ctx, bx-30, beamY-50, 30, 130, 4); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.strokeStyle=C.dim; ctx.lineWidth=1;
    for(var i=0;i<6;i++){ctx.beginPath();ctx.moveTo(bx-28,i*22+beamY-40);ctx.lineTo(bx-8,i*22+beamY-40+15);ctx.stroke();}
    ctx.restore();
    ctx.fillStyle='rgba(52,73,94,0.7)'; ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    roundRect(ctx, bx, beamY-bh/2, bw, bh, 4); ctx.fill(); ctx.stroke();
    var px=bx+a;
    dArrow(ctx, px, beamY-bh/2, px, beamY-bh/2-P*0.3, C.red, 2.5, 'P='+P+'N');
    ctx.save(); ctx.strokeStyle=C.gold; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(bx-15, beamY, 30, -0.5, Math.PI-0.5); ctx.stroke(); ctx.restore();
    dText(ctx, 'M_A', bx-10, beamY-50, 'bold 11px Segoe UI', C.gold, 'left');
    dPanel(ctx, 20, 20, 165, 85, 'Ngam co dinh', C.gold);
    dText(ctx, 'P = '+P.toFixed(1)+' N', 30, 38, null, C.red);
    dText(ctx, 'a = '+a.toFixed(0)+' px', 30, 54, null, C.gold);
    dText(ctx, 'M_fixed = P*a', 30, 70, null, C.dim);
    dText(ctx, 'M_A = '+(Mfixed/100).toFixed(2)+' N*m', 30, 86, null, C.orange);
  }

  function build(hm) {
    var bx=100, beamY=220;
    var hP = makeHandle({x:bx+st.a, y:beamY-15-st.P*0.3, color:C.red, type:'circle', label:'P', radius:10});
    hP.onDrag = function(h){ st.P=Math.min(300,Math.max(10,(beamY-15-h.y)/0.3)); };
    hm.add(hP);
    var hA = makeHandle({x:bx+st.a, y:beamY+60, color:C.gold, type:'circle', label:'a', radius:10});
    hA.onDrag = function(h){ st.a=Math.max(20,Math.min(480,h.x-bx)); };
    hm.add(hA);
  }

  SR['ch1-4-3'] = function(host) {
    return makeSim(host, 'Cantilever Beam', 'Kéo tai trong P -- ngam tao M_fixed=P*a', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 14. ch1-5-1 -- Spatial 3D Force
// ============================================================
(function() {
  var W=760, H=440;
  var st = {ox:380, oy:260, F:200, thetaX:25, thetaY:30};

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy;
    var tX=st.thetaX*Math.PI/180, tY=st.thetaY*Math.PI/180;
    var F=st.F;
    var Fx=F*Math.cos(tY)*Math.cos(tX);
    var Fy=-F*Math.sin(tY);
    var Fz=F*Math.cos(tY)*Math.sin(tX);
    var d=80, h=100, w=120;
    ctx.save();
    ctx.strokeStyle='rgba(201,150,58,0.3)'; ctx.lineWidth=1;
    ctx.strokeRect(ox-d, oy-h, d*2, h*2);
    ctx.beginPath(); ctx.moveTo(ox-d,oy-h); ctx.lineTo(ox-d+w,oy-h-h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox+d,oy-h); ctx.lineTo(ox+d+w,oy-h-h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox-d,oy+h); ctx.lineTo(ox-d+w,oy+h-h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox+d,oy+h); ctx.lineTo(ox+d+w,oy+h-h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox-d+w,oy-h-h); ctx.lineTo(ox+d+w,oy-h-h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox-d+w,oy+h-h); ctx.lineTo(ox+d+w,oy+h-h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox+d+w,oy-h-h); ctx.lineTo(ox+d+w,oy+h-h); ctx.stroke();
    ctx.restore();
    var axLen=120;
    dArrow(ctx, ox, oy, ox+axLen, oy, C.red, 2, 'x');
    dArrow(ctx, ox, oy, ox, oy-axLen, C.green, 2, 'y');
    dArrow(ctx, ox, oy, ox+axLen*0.6, oy-axLen*0.6, C.blue, 2, 'z');
    var ex=ox+Fx, ey=oy+Fy;
    dArrow(ctx, ox, oy, ex, ey, C.gold, 3, 'F');
    dArrowDashed(ctx, ox, oy, ox+Fx, oy, C.red, 1.5, 'Fx');
    dArrowDashed(ctx, ox+Fx, oy, ox+Fx, oy+Fy, C.green, 1.5, 'Fy');
    dText(ctx, 'Fz', ex+10, ey, '11px Segoe UI', C.blue, 'left');
    dPanel(ctx, 20, 20, 175, 115, 'Luc khong gian 3D', C.gold);
    dText(ctx, 'F   = '+F.toFixed(1)+' N', 30, 38, null, C.gold);
    dText(ctx, 'Fx  = '+Fx.toFixed(1)+' N', 30, 54, null, C.red);
    dText(ctx, 'Fy  = '+Fy.toFixed(1)+' N', 30, 70, null, C.green);
    dText(ctx, 'Fz  = '+Fz.toFixed(1)+' N', 30, 86, null, C.blue);
    dText(ctx, 'thetax='+st.thetaX.toFixed(0)+' thetay='+st.thetaY.toFixed(0)+' deg', 30, 102, null, C.dim);
  }

  function build(hm) {
    var hX = makeHandle({x:st.ox+100, y:st.oy-30, color:C.red, type:'circle', label:'thetax', radius:10});
    hX.onDrag = function(h){ st.thetaX=(Math.atan2(h.y-st.oy,h.x-st.ox)*180/Math.PI+360)%90; };
    hm.add(hX);
    var hY = makeHandle({x:st.ox+80, y:st.oy+40, color:C.green, type:'circle', label:'thetay', radius:10});
    hY.onDrag = function(h){ st.thetaY=(Math.atan2(st.oy-h.y,h.x-st.ox)*180/Math.PI+360)%90; };
    hm.add(hY);
    var hF = makeHandle({x:st.ox+st.F*0.5, y:st.oy-st.F*0.3, color:C.gold, type:'circle', label:'F', radius:9});
    hF.onDrag = function(h){ st.F=Math.min(300,Math.max(20,Math.hypot(h.x-st.ox,st.oy-h.y))); };
    hm.add(hF);
  }

  SR['ch1-5-1'] = function(host) {
    return makeSim(host, 'Spatial 3D Force', 'Kéo cac goc thetax, thetay de xem Fx, Fy, Fz', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 15. ch1-5-2 -- 3D Moment Vector
// ============================================================
(function() {
  var W=760, H=440;
  var st = {ox:380, oy:240, rx:80, ry:-60, rz:40, F:150};

  function render(ctx, hm, W, H) {
    var ox=st.ox, oy=st.oy;
    var rx2=st.rx, ry2=st.ry, rz2=st.rz, F2=st.F;
    var Mx=ry2*0-rz2*(-F2*0.5), My=rz2*rx2-rx2*0, Mz=rx2*(-F2*0.5)-ry2*rx2;
    var Mmag=Math.hypot(Mx,My,Mz);
    var rMag=Math.hypot(rx2,ry2,rz2);
    ctx.save();
    ctx.strokeStyle='rgba(201,150,58,0.25)'; ctx.lineWidth=1;
    ctx.strokeRect(ox-80, oy-80, 160, 160);
    ctx.restore();
    dArrow(ctx, ox, oy, ox+rx2, oy+ry2, C.blue, 2.5, 'r');
    dArrow(ctx, ox+rx2, oy+ry2, ox+rx2, oy+ry2-F2*0.5, C.red, 2.5, 'F');
    var mLen=Math.min(60,Mmag*0.05);
    ctx.save();
    ctx.strokeStyle=C.gold; ctx.fillStyle=C.gold; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(ox+rx2/2, oy+ry2/2, mLen, 0, Math.PI*2); ctx.stroke();
    ctx.font='bold 11px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('M', ox+rx2/2, oy+ry2/2);
    ctx.restore();
    dPanel(ctx, 20, 20, 170, 105, 'Mo men 3D M=r*F', C.gold);
    dText(ctx, '|r| = '+rMag.toFixed(1)+' px', 30, 38, null, C.blue);
    dText(ctx, '|F| = '+F2.toFixed(1)+' N', 30, 54, null, C.red);
    dText(ctx, '|M| = '+(Mmag/100).toFixed(2)+' N*m', 30, 70, null, C.gold);
    dText(ctx, 'Mx='+Mx.toFixed(0)+' My='+My.toFixed(0)+' Mz='+Mz.toFixed(0), 30, 86, '10px Segoe UI', C.dim);
  }

  function build(hm) {
    var hR = makeHandle({x:st.ox+st.rx, y:st.oy+st.ry, color:C.blue, type:'circle', label:'r', radius:10});
    hR.onDrag = function(h){ st.rx=h.x-st.ox; st.ry=h.y-st.oy; };
    hm.add(hR);
    var hF = makeHandle({x:st.ox+st.rx, y:st.oy+st.ry-st.F*0.5, color:C.red, type:'circle', label:'F', radius:10});
    hF.onDrag = function(h){ st.F=Math.min(300,Math.max(10,Math.abs(h.y-(st.oy+st.ry))*2)); };
    hm.add(hF);
    var hRz = makeHandle({x:st.ox+st.rx+40, y:st.oy+st.ry+20, color:C.purple, type:'circle', label:'rz', radius:9});
    hRz.onDrag = function(h){ st.rz=Math.max(-100,Math.min(100,h.x-(st.ox+st.rx))); };
    hm.add(hRz);
  }

  SR['ch1-5-2'] = function(host) {
    return makeSim(host, '3D Moment Vector', 'Kéo r va F trong khong gian 3D', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 16. ch1-6-1 -- Dry Friction
// ============================================================
(function() {
  var W=760, H=440;
  var st = {theta:20, P:150, mu:0.3};

  function render(ctx, hm, W, H) {
    var theta=st.theta*Math.PI/180, P=st.P, mu=st.mu;
    var N=P*Math.cos(theta);
    var Ff=P*Math.sin(theta);
    var Ff_max=mu*N;
    var status=Ff<Ff_max?'bam':'truot';
    var statusColor=Ff<Ff_max?C.green:C.red;
    var iLen=500, iRise=iLen*Math.sin(theta), iRun=iLen*Math.cos(theta);
    var ox=100, oy=320;
    ctx.save(); ctx.strokeStyle=C.dim; ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+iRun,oy-iRise); ctx.stroke(); ctx.restore();
    var bx=ox+iRun*0.4-iRise*0.1, by=oy-iRise*0.4-iRun*0.1;
    ctx.save(); ctx.translate(bx,by); ctx.rotate(-theta);
    ctx.fillStyle='rgba(52,73,94,0.7)'; ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    roundRect(ctx, -30, -20, 60, 40, 4); ctx.fill(); ctx.stroke();
    ctx.restore();
    dArrow(ctx, bx, by, bx, by+P*0.3, C.red, 2.5, 'P='+P+'N');
    var na=-theta+Math.PI/2;
    dArrow(ctx, bx, by, bx+30*Math.cos(na), by+30*Math.sin(na), C.blue, 2, 'N');
    dArrow(ctx, bx, by, bx-30*Math.cos(theta), by-30*Math.sin(theta), C.orange, 2, 'Ff');
    dArrowDashed(ctx, bx, by-40, bx-30*Math.cos(theta), by-40-30*Math.sin(theta), C.dim, 1, 'Ff_max');
    ctx.save(); ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(ox, oy, 40, 0, -theta); ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 11px Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('theta='+st.theta.toFixed(0)+' deg', ox+50, oy-20); ctx.restore();
    dPanel(ctx, 20, 20, 175, 115, 'Ma sat kho', C.gold);
    dText(ctx, 'theta = '+st.theta.toFixed(1)+' deg', 30, 38, null, C.gold);
    dText(ctx, 'P = '+P.toFixed(1)+' N', 30, 54, null, C.red);
    dText(ctx, 'N = '+N.toFixed(1)+' N', 30, 70, null, C.blue);
    dText(ctx, 'Ff = '+Ff.toFixed(1)+' N', 30, 86, null, C.orange);
    dText(ctx, 'Ff_max = '+Ff_max.toFixed(1)+' N', 30, 102, null, C.dim);
    dPanel(ctx, W-180, 20, 160, 40, '', statusColor);
    dText(ctx, status, W-170, 35, 'bold 14px Segoe UI', statusColor, 'center');
  }

  function build(hm) {
    var hT = makeHandle({x:100+220, y:320-80, color:C.gold, type:'circle', label:'theta', radius:10});
    hT.onDrag = function(h){ st.theta=Math.min(60,Math.max(5,(320-h.y)/2.8)); };
    hm.add(hT);
    var hP = makeHandle({x:100+220, y:320-st.P*0.3, color:C.red, type:'circle', label:'P', radius:10});
    hP.onDrag = function(h){ st.P=Math.min(300,Math.max(20,(320-h.y)*1)); };
    hm.add(hP);
  }

  SR['ch1-6-1'] = function(host) {
    return makeSim(host, 'Dry Friction', 'Kéo goc nghieng theta -- so sanh Ff vs Ff_max', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 17. ch1-6-2 -- Friction Angle
// ============================================================
(function() {
  var W=760, H=440;
  var st = {mu:0.3, ox:380, oy:260};

  function render(ctx, hm, W, H) {
    var mu=st.mu, phi=Math.atan(mu)*180/Math.PI;
    var ox=st.ox, oy=st.oy, R=80;
    ctx.save();
    ctx.strokeStyle=C.gold; ctx.fillStyle='rgba(201,150,58,0.1)'; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox+R*Math.cos(phi), oy-R*Math.sin(phi));
    ctx.lineTo(ox+R*Math.cos(-phi), oy-R*Math.sin(-phi));
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    dArrow(ctx, ox, oy, ox, oy-R, C.blue, 2.5, 'N');
    dArrowDashed(ctx, ox, oy, ox+R*Math.cos(phi), oy-R*Math.sin(phi), C.orange, 1.5, 'R');
    dArrowDashed(ctx, ox, oy, ox+R*Math.cos(-phi), oy-R*Math.sin(-phi), C.dim, 1.5, 'R');
    ctx.save(); ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(ox, oy, 25, -phi, phi); ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 11px Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('phi='+phi.toFixed(1)+' deg', ox+30, oy-R+20); ctx.restore();
    dPanel(ctx, 20, 20, 175, 85, 'Goc ma sat', C.gold);
    dText(ctx, 'mu = '+mu.toFixed(2), 30, 38, null, C.orange);
    dText(ctx, 'phi = arctan(mu)', 30, 54, null, C.dim);
    dText(ctx, 'phi = '+phi.toFixed(1)+' deg', 30, 70, null, C.gold);
    dPanel(ctx, W-200, H-50, 180, 36, '', C.gold);
    dText(ctx, 'phi = arctan('+mu.toFixed(2)+') = '+phi.toFixed(1)+' deg', W-190, H-36, 'bold 12px Segoe UI', C.gold, 'center');
  }

  function build(hm) {
    var hR = makeHandle({x:st.ox+80, y:st.oy-80, color:C.gold, type:'circle', label:'R', radius:9});
    hR.onDrag = function(h){ var r=Math.hypot(h.x-st.ox,st.oy-h.y); st.mu=Math.min(1.0,Math.max(0.05,r/80)); };
    hm.add(hR);
  }

  SR['ch1-6-2'] = function(host) {
    return makeSim(host, 'Friction Angle', 'Kéo mu de thay doi goc ma sat phi', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 18. ch1-6-3 -- Friction Rollback
// ============================================================
(function() {
  var W=760, H=440;
  var st = {theta:18, mu_s:0.35, mu_k:0.25};

  function render(ctx, hm, W, H) {
    var theta=st.theta*Math.PI/180, mu_s=st.mu_s, mu_k=st.mu_k;
    var phi_s=Math.atan(mu_s)*180/Math.PI;
    var phi_k=Math.atan(mu_k)*180/Math.PI;
    var impending=theta*180/Math.PI<phi_s?'len':'xuong';
    var status=theta*180/Math.PI<phi_s?'bam':(theta*180/Math.PI<phi_k?'truot cham':'truot nhanh');
    var iLen=500, iRise=iLen*Math.sin(theta), iRun=iLen*Math.cos(theta);
    var ox=100, oy=320;
    ctx.save(); ctx.strokeStyle=C.dim; ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+iRun,oy-iRise); ctx.stroke(); ctx.restore();
    var bx=ox+iRun*0.4, by=oy-iRise*0.4;
    ctx.save(); ctx.translate(bx,by); ctx.rotate(-theta);
    ctx.fillStyle='rgba(52,73,94,0.7)'; ctx.strokeStyle=impending==='len'?C.green:C.red; ctx.lineWidth=2;
    roundRect(ctx, -30, -20, 60, 40, 4); ctx.fill(); ctx.stroke();
    ctx.restore();
    var dir=impending==='len'?1:-1;
    dArrow(ctx, bx, by, bx+dir*30*Math.cos(theta), by-dir*30*Math.sin(theta), C.orange, 2.5, impending==='len'?'up':'down');
    ctx.save(); ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(ox, oy, 40, 0, -theta); ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 11px Segoe UI';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('theta='+st.theta.toFixed(0)+' deg', ox+50, oy-20); ctx.restore();
    ctx.save(); ctx.strokeStyle='rgba(201,150,58,0.3)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(ox, oy, 60, 0, -phi_s*Math.PI/180); ctx.stroke();
    ctx.restore();
    dPanel(ctx, 20, 20, 185, 115, 'Rollback & impending motion', C.gold);
    dText(ctx, 'theta  = '+st.theta.toFixed(1)+' deg', 30, 38, null, C.gold);
    dText(ctx, 'phi_s = arctan('+mu_s.toFixed(2)+')='+phi_s.toFixed(1)+' deg', 30, 54, null, C.green);
    dText(ctx, 'phi_k = arctan('+mu_k.toFixed(2)+')='+phi_k.toFixed(1)+' deg', 30, 70, null, C.red);
    dText(ctx, 'impending: '+impending, 30, 86, null, C.dim);
    dText(ctx, 'status: '+status, 30, 102, null, C.dim);
  }

  function build(hm) {
    var hT = makeHandle({x:100+220, y:320-80, color:C.gold, type:'circle', label:'theta', radius:10});
    hT.onDrag = function(h){ st.theta=Math.min(45,Math.max(5,(320-h.y)/2.8)); };
    hm.add(hT);
  }

  SR['ch1-6-3'] = function(host) {
    return makeSim(host, 'Friction Rollback', 'Quan sat huong truot sap xay ra', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 19. ch1-7-1 -- Centroid Composite (3 rectangles)
// ============================================================
(function() {
  var W=760, H=440;
  var st = {
    shapes:[
      {x:200, y:200, w:100, h:60, color:C.red},
      {x:350, y:160, w:80, h:100, color:C.blue},
      {x:500, y:220, w:120, h:50, color:C.green},
    ]
  };

  function render(ctx, hm, W, H) {
    var shapes=st.shapes;
    shapes.forEach(function(s,i){
      ctx.fillStyle=s.color+'22'; ctx.strokeStyle=s.color; ctx.lineWidth=1.5;
      roundRect(ctx, s.x-s.w/2, s.y-s.h/2, s.w, s.h, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle=s.color; ctx.font='bold 11px Segoe UI';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(String(i+1), s.x, s.y);
    });
    var Atotal=0, xcSum=0, ycSum=0;
    shapes.forEach(function(s){ var A=s.w*s.h; Atotal+=A; xcSum+=s.x*A; ycSum+=s.y*A; });
    var xb=xcSum/Atotal, yb=ycSum/Atotal;
    ctx.beginPath(); ctx.arc(xb, yb, 8, 0, Math.PI*2);
    ctx.fillStyle=C.gold; ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 13px Segoe UI';
    ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText('G', xb+12, yb-12);
    dLine(ctx, xb-15, yb, xb+15, yb, C.gold, 1, true);
    dLine(ctx, xb, yb-15, xb, yb+15, C.gold, 1, true);
    dPanel(ctx, 20, 20, 170, 105, 'Trong tam hinh ghep', C.gold);
    dText(ctx, 'xbar = '+xb.toFixed(1)+' px', 30, 38, null, C.gold);
    dText(ctx, 'ybar = '+yb.toFixed(1)+' px', 30, 54, null, C.gold);
    dText(ctx, 'A = '+Atotal.toFixed(0)+' px^2', 30, 70, null, C.dim);
    dText(ctx, 'xbar = sum(Ai*xi)/sumAi', 30, 86, '10px Segoe UI', C.dim);
  }

  function build(hm) {
    st.shapes.forEach(function(s,i){
      var h = makeHandle({x:s.x, y:s.y, color:s.color, type:'circle', label:String(i+1), radius:10});
      h.onDrag = function(h2){ s.x=h2.x; s.y=h2.y; };
      hm.add(h);
    });
  }

  SR['ch1-7-1'] = function(host) {
    return makeSim(host, 'Centroid Composite', 'Kéo vi tri hinh chu nhat -- tinh trong tam', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// ============================================================
// 20. ch1-7-2 -- Centroid with Holes
// ============================================================
(function() {
  var W=760, H=440;
  var st = {
    shapes:[
      {x:200, y:200, w:120, h:80, color:C.red},
      {x:380, y:180, w:100, h:120, color:C.blue},
      {x:540, y:220, w:80, h:60, color:C.green},
    ],
    holes:[
      {x:380, y:180, r:30, color:C.bg},
    ]
  };

  function render(ctx, hm, W, H) {
    var shapes=st.shapes, holes=st.holes;
    shapes.forEach(function(s,i){
      ctx.fillStyle=s.color+'22'; ctx.strokeStyle=s.color; ctx.lineWidth=1.5;
      roundRect(ctx, s.x-s.w/2, s.y-s.h/2, s.w, s.h, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle=s.color; ctx.font='bold 11px Segoe UI';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(String(i+1), s.x, s.y);
    });
    holes.forEach(function(h2){
      ctx.fillStyle=C.bg; ctx.strokeStyle=C.red; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(h2.x, h2.y, h2.r, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle=C.red; ctx.font='bold 10px Segoe UI';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('lo', h2.x, h2.y);
    });
    var Atotal=0, xcSum=0, ycSum=0;
    shapes.forEach(function(s){ var A=s.w*s.h; Atotal+=A; xcSum+=s.x*A; ycSum+=s.y*A; });
    holes.forEach(function(h2){ var A=Math.PI*h2.r*h2.r; Atotal-=A; xcSum-=h2.x*A; ycSum-=h2.y*A; });
    var xb=xcSum/Atotal, yb=ycSum/Atotal;
    ctx.beginPath(); ctx.arc(xb, yb, 8, 0, Math.PI*2);
    ctx.fillStyle=C.gold; ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle=C.gold; ctx.font='bold 13px Segoe UI';
    ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText('G', xb+12, yb-12);
    dLine(ctx, xb-15, yb, xb+15, yb, C.gold, 1, true);
    dLine(ctx, xb, yb-15, xb, yb+15, C.gold, 1, true);
    dPanel(ctx, 20, 20, 170, 105, 'Trong tam co lo', C.gold);
    dText(ctx, 'xbar = '+xb.toFixed(1)+' px', 30, 38, null, C.gold);
    dText(ctx, 'ybar = '+yb.toFixed(1)+' px', 30, 54, null, C.gold);
    dText(ctx, 'A_net = '+Atotal.toFixed(0)+' px^2', 30, 70, null, C.dim);
    dText(ctx, '(tru lo khi tinh A)', 30, 86, '10px Segoe UI', C.dim);
  }

  function build(hm) {
    st.shapes.forEach(function(s,i){
      var h = makeHandle({x:s.x, y:s.y, color:s.color, type:'circle', label:String(i+1), radius:10});
      h.onDrag = function(h2){ s.x=h2.x; s.y=h2.y; };
      hm.add(h);
    });
    st.holes.forEach(function(h2){
      var h = makeHandle({x:h2.x+h2.r, y:h2.y, color:C.red, type:'circle', label:'r', radius:9});
      h.onDrag = function(h3){ var dx=h3.x-h2.x, dy=h3.y-h2.y; h2.r=Math.min(60,Math.max(10,Math.hypot(dx,dy))); };
      hm.add(h);
      var hH = makeHandle({x:h2.x, y:h2.y, color:C.red, type:'diamond', label:'lo', radius:8});
      hH.onDrag = function(h3){ h2.x=h3.x; h2.y=h3.y; };
      hm.add(hH);
    });
  }

  SR['ch1-7-2'] = function(host) {
    return makeSim(host, 'Centroid with Holes', 'Tuong tu + lo khoet tru dien tich', {width:W,height:H}, function(ctx,hm,W,H){
      if(hm.handles.length===0) build(hm);
      render(ctx,hm,W,H);
    });
  };
}());

// END
})();

