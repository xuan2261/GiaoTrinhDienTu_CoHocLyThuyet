/**
 * SimNew Render — Visual effects: glow, gradient, glassmorphism, particle burst.
 */
(function(root) {
'use strict';

const FX = {
  /** Glow shadow on element */
  glow(ctx, color, blurPx, drawFn) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blurPx || 8;
    drawFn();
    ctx.restore();
  },

  /** Linear gradient fill */
  linearGradient(ctx, x, y, w, h, colors, opts) {
    opts = opts || {};
    const angle = opts.angle !== undefined ? opts.angle : 0; // radians
    const g = ctx.createLinearGradient(x, y, x + Math.cos(angle) * w, y + Math.sin(angle) * h);
    if (Array.isArray(colors)) {
      colors.forEach((c, i) => g.addColorStop(i / Math.max(colors.length - 1, 1), c));
    }
    return g;
  },

  /** Radial gradient */
  radialGradient(ctx, cx, cy, r, colors) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    if (Array.isArray(colors)) {
      colors.forEach((c, i) => g.addColorStop(i / Math.max(colors.length - 1, 1), c));
    }
    return g;
  },

  /** Glassmorphism panel (semi-transparent rounded rect) */
  glassPanel(ctx, x, y, w, h, opts) {
    opts = opts || {};
    const r = opts.radius || 8;
    const alpha = opts.alpha !== undefined ? opts.alpha : 0.1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
    if (opts.border !== false) {
      ctx.strokeStyle = `rgba(255,255,255,${(opts.borderAlpha !== undefined ? opts.borderAlpha : 0.2)})`;
      ctx.lineWidth = opts.borderWidth || 1;
      ctx.stroke();
    }
    ctx.restore();
  },

  /** Particle burst at position */
  particleBurst(ctx, x, y, count, color, opts) {
    opts = opts || {};
    const speed = opts.speed || 3;
    const life = opts.life || 30;
    const size = opts.size || 3;
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.5 + Math.random() * 0.5);
      particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: life,
        maxLife: life,
        size: size * (0.5 + Math.random())
      });
    }
    return particles;
  },

  /** Draw burst particles (call each frame with particle array) */
  drawBurst(ctx, particles) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const alpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha *= alpha;
      ctx.fill();
      ctx.globalAlpha /= alpha;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  },

  /** Neon text outline (stroked then filled) */
  neonText(ctx, text, x, y, color, glowPx, fontSize) {
    ctx.save();
    ctx.font = 'bold ' + (fontSize || 12) + 'px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = glowPx || 8;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.fillText(text, x, y);
    ctx.restore();
  },

  /** Energy bar (horizontal bar with fill) */
  energyBar(ctx, x, y, w, h, fillRatio, color, bgColor) {
    bgColor = bgColor || 'rgba(0,0,0,0.15)';
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);
    if (fillRatio > 0) {
      ctx.fillStyle = color;
      ctx.globalAlpha *= 0.8;
      ctx.fillRect(x, y, w * Math.max(0, Math.min(1, fillRatio)), h);
      ctx.globalAlpha /= 0.8;
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FX;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Effects = FX;
}

})(typeof window !== 'undefined' ? window : this);
