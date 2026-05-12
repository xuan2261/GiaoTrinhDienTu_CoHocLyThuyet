/**
 * SimNew Interaction — Nudge: arrow key nudge (small/large step).
 * Integrates with HandleManager for keyboard-based handle manipulation.
 */
(function(root) {
'use strict';

class Nudge {
  /**
   * @param {Object} opts
   * @param {HandleManager} opts.handleManager
   * @param {number} opts.smallStep - default 1
   * @param {number} opts.largeStep - default 10
   */
  constructor(opts) {
    opts = opts || {};
    this.handleManager = opts.handleManager || null;
    this.smallStep = opts.smallStep || 1;
    this.largeStep = opts.largeStep || 10;
    this._listeners = [];
  }

  /** Attach keyboard listeners */
  attach(keydownHandler, keyupHandler) {
    this._keydown = keydownHandler;
    this._keyup = keyupHandler;
  }

  /** Process a keydown event, return true if handled */
  onKeyDown(code) {
    if (!this.handleManager) return false;
    const large = false; // Shift held
    let dx = 0, dy = 0, handled = true;

    switch (code) {
      case 'ArrowLeft':  dx = -1; break;
      case 'ArrowRight': dx =  1; break;
      case 'ArrowUp':    dy = -1; break;
      case 'ArrowDown':  dy =  1; break;
      case 'Home':       dx = -10; break;
      case 'End':       dx =  10; break;
      case 'PageUp':    dy = -10; break;
      case 'PageDown':  dy =  10; break;
      default:          handled = false;
    }

    if (handled) {
      const step = large ? this.largeStep : this.smallStep;
      this.handleManager.nudgeFocused(dx * step, dy * step, large);
    }

    return handled;
  }

  /** Focus first handle */
  focusFirst() {
    if (!this.handleManager || this.handleManager.handles.length === 0) return;
    this.handleManager.handles[0].isFocused = true;
    this.handleManager.focusedIndex = 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Nudge;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Nudge = Nudge;
}

})(typeof window !== 'undefined' ? window : this);
