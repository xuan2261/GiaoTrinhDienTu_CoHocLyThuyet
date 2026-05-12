/**
 * SimNew Animation — Timeline: keyframes, scrub, record.
 * Core timeline data structure (no RAF, no DOM).
 */
(function(root) {
'use strict';

class Timeline {
  /**
   * @param {Object} opts
   * @param {number} opts.duration - total duration in ms (default 2000)
   */
  constructor(opts) {
    opts = opts || {};
    this.duration = opts.duration || 2000;
    this.currentTime = 0;
    this.keyframes = []; // [{time, data}]
    this.recording = false;
    this._recordBuffer = [];
  }

  /** Add a keyframe at time */
  addKeyframe(time, data) {
    // Remove existing at same time
    this.keyframes = this.keyframes.filter(k => k.time !== time);
    this.keyframes.push({ time: Math.max(0, Math.min(time, this.duration)), data });
    this.keyframes.sort((a, b) => a.time - b.time);
  }

  /** Remove keyframe at index */
  removeKeyframe(index) {
    if (index >= 0 && index < this.keyframes.length) {
      this.keyframes.splice(index, 1);
    }
  }

  /** Get value at time by interpolation between keyframes */
  getValue(property, time) {
    if (this.keyframes.length === 0) return null;
    if (this.keyframes.length === 1) return this.keyframes[0].data[property];

    // Find surrounding keyframes
    let k0 = this.keyframes[0], k1 = this.keyframes[this.keyframes.length - 1];
    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (this.keyframes[i].time <= time && this.keyframes[i + 1].time >= time) {
        k0 = this.keyframes[i];
        k1 = this.keyframes[i + 1];
        break;
      }
    }

    const t = (time - k0.time) / (k1.time - k0.time || 1);
    const v0 = k0.data[property];
    const v1 = k1.data[property];

    if (v0 === undefined || v1 === undefined) return null;
    if (typeof v0 === 'number') return v0 + (v1 - v0) * t;
    if (typeof v0 === 'string' && v0.startsWith('#')) return v0; // color: no lerp
    return t < 0.5 ? v0 : v1;
  }

  /** Scrub to a time position */
  scrubTo(time) {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
    return this.currentTime;
  }

  /** Start recording */
  startRecording() {
    this.recording = true;
    this._recordBuffer = [];
  }

  /** Record a frame */
  record(time, data) {
    if (!this.recording) return;
    this._recordBuffer.push({ time, data: Object.assign({}, data) });
  }

  /** Stop recording and commit keyframes */
  stopRecording() {
    if (!this.recording) return;
    this.recording = false;
    if (this._recordBuffer.length === 0) return;

    // Simplify: take first, last, and peaks
    const buf = this._recordBuffer;
    this.addKeyframe(buf[0].time, buf[0].data);
    if (buf.length > 1) {
      this.addKeyframe(buf[buf.length - 1].time, buf[buf.length - 1].data);
    }
    this._recordBuffer = [];
  }

  /** Clear all keyframes */
  clear() {
    this.keyframes = [];
    this.currentTime = 0;
  }

  /** Set duration */
  setDuration(duration) {
    this.duration = Math.max(100, duration);
    if (this.currentTime > this.duration) this.currentTime = this.duration;
  }

  /** Serialize to JSON */
  toJSON() {
    return {
      duration: this.duration,
      keyframes: this.keyframes.map(k => ({ time: k.time, data: k.data }))
    };
  }

  /** Load from JSON */
  fromJSON(json) {
    this.duration = json.duration || 2000;
    this.keyframes = (json.keyframes || []).map(k => ({ time: k.time, data: k.data }));
    this.currentTime = 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Timeline;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Timeline = Timeline;
}

})(typeof window !== 'undefined' ? window : this);
