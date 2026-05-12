/**
 * SimNew Animation — Interpolator: lerp, easeIn, easeOut, easeInOut, spring.
 * Easing functions for smooth animations.
 */
(function(root) {
'use strict';

const Interpolator = {
  /** Linear interpolation */
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  /** Ease in (quadratic) */
  easeIn(t) {
    return t * t;
  },

  /** Ease out (quadratic) */
  easeOut(t) {
    return 1 - (1 - t) * (1 - t);
  },

  /** Ease in-out (quadratic) */
  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },

  /** Ease in cubic */
  easeInCubic(t) {
    return t * t * t;
  },

  /** Ease out cubic */
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  },

  /** Ease in-out cubic */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  /** Ease in exponential */
  easeInExpo(t) {
    return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
  },

  /** Ease out exponential */
  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },

  /** Ease in-out exponential */
  easeInOutExpo(t) {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  /** Ease in-out sine */
  easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  },

  /** Spring with damping */
  spring(t, opts) {
    opts = opts || {};
    const stiffness = opts.stiffness || 180;
    const damping = opts.damping || 12;
    const mass = opts.mass || 1;
    const w0 = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));

    if (zeta < 1) {
      // Under-damped
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w0 * t) * (
        Math.cos(wd * t) + (zeta * w0 / wd) * Math.sin(wd * t)
      );
    } else {
      // Critically damped or over-damped
      return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    }
  },

  /** Bounce out */
  bounceOut(t) {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },

  /** Ease in back (overshoot) */
  easeInBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },

  /** Ease out back */
  easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  /** Interpolate between two colors (hex) */
  lerpColor(colorA, colorB, t) {
    const parseHex = (c) => {
      if (c.startsWith('#')) c = c.slice(1);
      if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
      return {
        r: parseInt(c.slice(0, 2), 16),
        g: parseInt(c.slice(2, 4), 16),
        b: parseInt(c.slice(4, 6), 16)
      };
    };
    const a = parseHex(colorA), b = parseHex(colorB);
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const bl = Math.round(a.b + (b.b - a.b) * t);
    return `rgb(${r},${g},${bl})`;
  },

  /** Ease by name */
  byName(name, t) {
    const map = {
      linear: t => t,
      easeIn: this.easeIn,
      easeOut: this.easeOut,
      easeInOut: this.easeInOut,
      easeInCubic: this.easeInCubic,
      easeOutCubic: this.easeOutCubic,
      easeInOutCubic: this.easeInOutCubic,
      easeInExpo: this.easeInExpo,
      easeOutExpo: this.easeOutExpo,
      easeInOutExpo: this.easeInOutExpo,
      easeInOutSine: this.easeInOutSine,
      spring: t => this.spring(t),
      bounceOut: this.bounceOut,
      easeInBack: this.easeInBack,
      easeOutBack: this.easeOutBack
    };
    const fn = map[name] || map.linear;
    return fn(t);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Interpolator;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Interpolator = Interpolator;
}

})(typeof window !== 'undefined' ? window : this);
