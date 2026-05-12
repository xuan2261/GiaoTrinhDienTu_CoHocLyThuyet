/**
 * Animation engine — stateless animation loop with easing, trails, and particles.
 * Phase 1 infrastructure for 58-route simulation rebuild.
 */
(function() {
'use strict';

// ─── Easing Functions ────────────────────────────────────────────────────────

function easeIn(t) { return t * t * t; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
}
function spring(t, tension, friction) {
  tension = tension !== undefined ? tension : 180;
  friction = friction !== undefined ? friction : 12;
  const omega = Math.sqrt(tension);
  const zeta = friction / (2 * Math.sqrt(tension));
  if (zeta < 1) {
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * omega * t) * (Math.cos(omegaD * t) + (zeta * omega / omegaD) * Math.sin(omegaD * t));
  }
  return 1 - Math.exp(-omega * t) * (1 + omega * t);
}
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ─── Trail Renderer ────────────────────────────────────────────────────────────

function createTrail(color, maxPoints, fade) {
  return { color: color || '#2980b9', maxPoints: maxPoints || 120, fade: fade !== undefined ? fade : true, points: [] };
}

function addTrailPoint(trail, x, y) {
  if (!trail) return;
  trail.points.push({ x, y });
  if (trail.points.length > trail.maxPoints) trail.points.shift();
}

function drawTrail(ctx, trail) {
  if (!trail || !trail.points || trail.points.length < 2) return;
  const pts = trail.points;
  const n = pts.length;
  for (let i = 1; i < n; i++) {
    const alpha = trail.fade ? (i / n) * 0.7 : 0.8;
    ctx.strokeStyle = trail.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
    ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ─── Particle System ───────────────────────────────────────────────────────────

const MAX_PARTICLES = 200;

const particlePool = [];
for (let i = 0; i < MAX_PARTICLES; i++) {
  particlePool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0, color: '#fff', gravity: 0 });
}

function acquireParticle() {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    if (!particlePool[i].active) return particlePool[i];
  }
  return null;
}

function createParticleEmitter(x, y, config) {
  config = config || {};
  return {
    x: x, y: y,
    count: config.count || 5,
    spread: config.spread || Math.PI * 2,
    angleOffset: config.angleOffset || 0,
    speedMin: config.speedMin || 20,
    speedMax: config.speedMax || 60,
    lifeMin: config.lifeMin || 0.5,
    lifeMax: config.lifeMax || 1.5,
    sizeMin: config.sizeMin || 2,
    sizeMax: config.sizeMax || 5,
    color: config.color || '#b8860b',
    gravity: config.gravity !== undefined ? config.gravity : 98,
    active: true
  };
}

function emitParticles(emitter, count) {
  if (!emitter || !emitter.active) return;
  const n = count || emitter.count;
  for (let i = 0; i < n; i++) {
    const p = acquireParticle();
    if (!p) break;
    const angle = emitter.angleOffset + (Math.random() - 0.5) * emitter.spread;
    const speed = lerp(emitter.speedMin, emitter.speedMax, Math.random());
    p.active = true;
    p.x = emitter.x;
    p.y = emitter.y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.life = 0;
    p.maxLife = lerp(emitter.lifeMin, emitter.lifeMax, Math.random());
    p.size = lerp(emitter.sizeMin, emitter.sizeMax, Math.random());
    p.color = emitter.color;
    p.gravity = emitter.gravity;
    emitter.x = emitter.x; // no drift unless updated externally
  }
}

function updateParticles(dt) {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particlePool[i];
    if (!p.active) continue;
    p.life += dt;
    if (p.life >= p.maxLife) { p.active = false; continue; }
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

function drawParticles(ctx) {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particlePool[i];
    if (!p.active) continue;
    const alpha = 1 - p.life / p.maxLife;
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function clearParticles() {
  for (let i = 0; i < MAX_PARTICLES; i++) particlePool[i].active = false;
}

// ─── Animation Engine ─────────────────────────────────────────────────────────

let labRef = null;
let scopeRef = null;

function createEngine() {
  let running = false;
  let paused = false;
  let frameId = 0;
  let startTime = 0;
  let pausedAt = 0;
  let totalPaused = 0;
  let lastTime = 0;
  let animTime = 0;
  let fps = 60;
  let fpsFrames = 0;
  let fpsAccum = 0;
  let callbacks = [];
  let emitters = [];

  function loop(now) {
    if (!running || paused) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    animTime = (now - startTime - totalPaused) / 1000;

    fpsFrames++;
    fpsAccum += dt;
    if (fpsAccum >= 0.5) {
      fps = Math.round(fpsFrames / fpsAccum);
      fpsFrames = 0;
      fpsAccum = 0;
    }

    for (let i = 0; i < callbacks.length; i++) {
      try { callbacks[i](animTime, dt); } catch (e) { console.warn('Animation frame error:', e); }
    }

    frameId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    paused = false;
    startTime = performance.now();
    lastTime = startTime;
    totalPaused = 0;
    animTime = 0;
    fps = 60;
    fpsFrames = 0;
    fpsAccum = 0;
    frameId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (frameId) { cancelAnimationFrame(frameId); frameId = 0; }
    animTime = 0;
    totalPaused = 0;
    callbacks = [];
    emitters = [];
    clearParticles();
  }

  function pause() {
    if (!running || paused) return;
    paused = true;
    pausedAt = performance.now();
  }

  function resume() {
    if (!running || !paused) return;
    totalPaused += performance.now() - pausedAt;
    paused = false;
    lastTime = performance.now();
  }

  function reset() {
    const wasRunning = running;
    stop();
    if (wasRunning) start();
  }

  function onFrame(cb) {
    if (typeof cb === 'function') callbacks.push(cb);
  }

  function removeFrameCallback(cb) {
    const idx = callbacks.indexOf(cb);
    if (idx >= 0) callbacks.splice(idx, 1);
  }

  function addEmitter(emitter) {
    if (emitter) emitters.push(emitter);
  }

  function removeEmitter(emitter) {
    const idx = emitters.indexOf(emitter);
    if (idx >= 0) emitters.splice(idx, 1);
  }

  function isRunning() { return running && !paused; }
  function getFPS() { return fps; }
  function getAnimTime() { return animTime; }
  function getEmitters() { return emitters; }
  function hasActiveParticles() {
    for (let i = 0; i < MAX_PARTICLES; i++) if (particlePool[i].active) return true;
    return false;
  }

  return {
    start, stop, pause, resume, reset,
    onFrame, removeFrameCallback,
    addEmitter, removeEmitter,
    isRunning, getFPS, getAnimTime, getEmitters, hasActiveParticles,
    emitParticles, updateParticles, drawParticles,
    // expose trail and easing for direct use
    createTrail, addTrailPoint, drawTrail,
    easeIn, easeOut, easeInOut, easeOutBack, easeOutElastic, spring,
    lerp, clamp
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

function bindToLab(lab, scope) {
  const engine = createEngine();
  labRef = lab;
  scopeRef = scope;

  if (scopeRef) {
    scopeRef.onDispose(() => {
      engine.stop();
      labRef = null;
      scopeRef = null;
    });
  }

  lab.anim = engine;
  return engine;
}

window.SimAnimationEngine = {
  bindToLab,
  createTrail,
  addTrailPoint,
  drawTrail,
  createParticleEmitter,
  emitParticles,
  updateParticles,
  drawParticles,
  clearParticles,
  createEngine,
  easeIn, easeOut, easeInOut, easeOutBack, easeOutElastic, spring,
  lerp, clamp
};

})();
