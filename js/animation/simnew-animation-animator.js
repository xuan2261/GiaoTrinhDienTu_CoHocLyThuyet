/**
 * SimNew Animation — Animator: RAF loop, pause/resume/speed.
 * The main animation driver.
 */
(function(root) {
'use strict';

class Animator {
  /**
   * @param {Object} opts
   * @param {Function} opts.onTick - fn(dtMs, elapsedMs) called each frame
   * @param {number} opts.speed - playback speed (default 1)
   */
  constructor(opts) {
    opts = opts || {};
    this.onTick = opts.onTick || null;
    this.speed = opts.speed !== undefined ? opts.speed : 1;
    this._running = false;
    this._rafId = null;
    this._startTime = null;
    this._elapsed = 0; // accumulated ms (affected by speed)
    this._lastFrameTime = null;
    this._pausedAt = null;
    this._loopFn = this._loop.bind(this);

    // Callbacks
    this.onStart = null;
    this.onPause = null;
    this.onResume = null;
    this.onStop = null;
  }

  _loop(timestamp) {
    if (!this._running) return;

    if (this._startTime === null) {
      this._startTime = timestamp;
      this._lastFrameTime = timestamp;
    }

    const rawDt = timestamp - this._lastFrameTime;
    this._lastFrameTime = timestamp;

    // Cap dt to 100ms to avoid huge jumps
    const dt = Math.min(rawDt, 100) * this.speed;
    this._elapsed += dt;

    if (this.onTick) this.onTick(dt, this._elapsed);

    this._rafId = requestAnimationFrame(this._loopFn);
  }

  /** Start playing */
  play() {
    if (this._running) return;
    this._running = true;
    this._startTime = null;
    this._lastFrameTime = null;
    this._rafId = requestAnimationFrame(this._loopFn);
    if (this.onStart) this.onStart();
  }

  /** Pause */
  pause() {
    if (!this._running) return;
    this._running = false;
    this._pausedAt = this._elapsed;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    if (this.onPause) this.onPause(this._elapsed);
  }

  /** Resume from paused */
  resume() {
    if (this._running) return;
    this._running = true;
    this._lastFrameTime = null;
    if (this.onResume) this.onResume(this._elapsed);
    this._rafId = requestAnimationFrame(this._loopFn);
  }

  /** Stop and reset */
  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    const elapsed = this._elapsed;
    this._elapsed = 0;
    this._startTime = null;
    this._lastFrameTime = null;
    if (this.onStop) this.onStop(elapsed);
  }

  /** Toggle play/pause */
  toggle() {
    if (this._running) this.pause();
    else this.pause(); // resume if it was playing
    // Toggle logic: if paused -> resume, if running -> pause
    if (!this._running && this._elapsed > 0) {
      this._running = true;
      this._lastFrameTime = null;
      this._rafId = requestAnimationFrame(this._loopFn);
      if (this.onResume) this.onResume(this._elapsed);
    } else if (this._running) {
      this.pause();
    }
  }

  /** Set speed (0.25 - 4) */
  setSpeed(speed) {
    this.speed = Math.max(0.1, Math.min(4, speed));
  }

  /** Get current elapsed time in ms */
  getElapsed() { return this._elapsed; }

  /** Check if playing */
  isRunning() { return this._running; }

  /** Destroy */
  destroy() {
    this.stop();
    this.onTick = null;
    this.onStart = null;
    this.onPause = null;
    this.onResume = null;
    this.onStop = null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Animator;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Animator = Animator;
}

})(typeof window !== 'undefined' ? window : this);
