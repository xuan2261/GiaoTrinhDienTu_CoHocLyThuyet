/**
 * SimNew Interaction — Unified pointer/touch/keyboard input manager.
 * Single source of truth for all input events across all canvas simulations.
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

const InteractionManager = root.InteractionManager || class InteractionManager {
  constructor(canvas) {
    this.canvas = canvas || null;
    this._listeners = [];
    this._enabled = true;
    this.pointers = new Map(); // pointerId -> {x, y, pressure, button, buttons}
    this.keyboard = new Map(); // keyCode -> true
    this._activeGesture = null;
    this._dragTarget = null;
    this._dragStart = null;
    this._dragThreshold = 4; // px before drag starts

    // Callbacks
    this.onPointerDown = null;
    this.onPointerMove = null;
    this.onPointerUp = null;
    this.onPointerCancel = null;
    this.onWheel = null;
    this.onKeyDown = null;
    this.onKeyUp = null;
    this.onDragStart = null;
    this.onDragMove = null;
    this.onDragEnd = null;

    if (this.canvas) this.attach(this.canvas);
  }

  attach(canvas) {
    this.canvas = canvas;
    this._addListener(canvas, 'pointerdown', this._handlePointerDown.bind(this), { passive: false });
    this._addListener(canvas, 'pointermove', this._handlePointerMove.bind(this));
    this._addListener(canvas, 'pointerup', this._handlePointerUp.bind(this));
    this._addListener(canvas, 'pointercancel', this._handlePointerCancel.bind(this));
    this._addListener(canvas, 'wheel', this._handleWheel.bind(this), { passive: false });
    canvas.style.touchAction = 'none';

    // Keyboard on window
    this._addListener(window, 'keydown', this._handleKeyDown.bind(this));
    this._addListener(window, 'keyup', this._handleKeyUp.bind(this));
  }

  detach() {
    for (const { el, type, fn } of this._listeners) {
      el.removeEventListener(type, fn);
    }
    this._listeners = [];
  }

  _addListener(el, type, fn, opts) {
    el.addEventListener(type, fn, opts);
    this._listeners.push({ el, type, fn });
  }

  _handlePointerDown(e) {
    if (!this._enabled) return;
    e.preventDefault();
    this.pointers.set(e.pointerId, {
      x: e.clientX, y: e.clientY,
      pressure: e.pressure, button: e.button, buttons: e.buttons
    });

    // Get canvas-relative coords
    const rect = this.canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    this._dragStart = { x: cx, y: cy };
    this._dragTarget = null;

    if (this.onPointerDown) this.onPointerDown(cx, cy, e, this.pointers);
  }

  _handlePointerMove(e) {
    if (!this._enabled) return;
    const prev = this.pointers.get(e.pointerId);
    if (!prev) return;

    prev.x = e.clientX; prev.y = e.clientY;
    prev.pressure = e.pressure; prev.buttons = e.buttons;

    const rect = this.canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Drag threshold check
    if (this._dragStart && !this._dragTarget) {
      const dx = cx - this._dragStart.x, dy = cy - this._dragStart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= this._dragThreshold) {
        this._dragTarget = this._dragStart;
        if (this.onDragStart) this.onDragStart(this._dragStart.x, this._dragStart.y, e);
      }
    }

    if (this._dragTarget && this.onDragMove) {
      this.onDragMove(cx, cy, e);
    }

    if (this.onPointerMove) this.onPointerMove(cx, cy, e, this.pointers);
  }

  _handlePointerUp(e) {
    if (!this._enabled) return;
    const cx = e.clientX, cy = e.clientY;
    const rect = this.canvas.getBoundingClientRect();
    const px = cx - rect.left, py = cy - rect.top;

    if (this._dragTarget && this.onDragEnd) {
      this.onDragEnd(px, py, e);
    }
    this._dragTarget = null;
    this._dragStart = null;
    this.pointers.delete(e.pointerId);

    if (this.onPointerUp) this.onPointerUp(px, py, e, this.pointers);
  }

  _handlePointerCancel(e) {
    this.pointers.clear();
    this._dragTarget = null;
    this._dragStart = null;
    if (this.onPointerCancel) this.onPointerCancel(e);
  }

  _handleWheel(e) {
    if (!this._enabled) return;
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    if (this.onWheel) this.onWheel(cx, cy, e.deltaX, e.deltaY, e.deltaMode);
  }

  _handleKeyDown(e) {
    if (!this._enabled) return;
    this.keyboard.set(e.code, true);
    if (this.onKeyDown) this.onKeyDown(e.code, e);
  }

  _handleKeyUp(e) {
    if (!this._enabled) return;
    this.keyboard.delete(e.code);
    if (this.onKeyUp) this.onKeyUp(e.code, e);
  }

  /** Check if a key is currently held */
  isKeyDown(code) {
    return this.keyboard.has(code);
  }

  /** Get pointer count */
  get pointerCount() {
    return this.pointers.size;
  }

  /** Enable/disable input */
  set enabled(v) { this._enabled = v; }
  get enabled() { return this._enabled; }

  /** Clear all pressed pointers */
  clearPointers() {
    this.pointers.clear();
    this._dragTarget = null;
    this._dragStart = null;
  }

  destroy() {
    this.detach();
    this.pointers.clear();
    this.keyboard.clear();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractionManager;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.InteractionManager = InteractionManager;
}

})(typeof window !== 'undefined' ? window : this);
