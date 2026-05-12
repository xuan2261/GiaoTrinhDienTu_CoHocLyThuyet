/**
 * SimNew Interaction — HandleManager: hit-test, Tab navigation, focused handle.
 * Manages a collection of handles, handles pointer events, and supports keyboard navigation.
 */
(function(root) {
'use strict';

const Handle = root.SimNew ? root.SimNew.Handle : require('./simnew-interaction-handle');

class HandleManager {
  constructor() {
    this.handles = [];
    this.focusedIndex = -1;
    this.hoveredHandle = null;
    this.draggingHandle = null;
    this.guideSystem = null; // optional snap guide
    this.canvas = null;
    this._screenToWorld = null; // fn(sx,sy) => {x,y}
  }

  /** Set screen-to-world converter */
  setScreenConverter(fn) {
    this._screenToWorld = fn;
  }

  /** Add a handle */
  add(handle) {
    this.handles.push(handle);
    return handle;
  }

  /** Remove a handle */
  remove(handle) {
    const idx = this.handles.indexOf(handle);
    if (idx >= 0) this.handles.splice(idx, 1);
    if (this.focusedIndex >= this.handles.length) {
      this.focusedIndex = this.handles.length - 1;
    }
    return handle;
  }

  /** Clear all handles */
  clear() {
    this.handles = [];
    this.focusedIndex = -1;
    this.hoveredHandle = null;
    this.draggingHandle = null;
  }

  /** Get handle at screen position */
  getHandleAtScreen(sx, sy) {
    if (!this._screenToWorld) return null;
    const world = this._screenToWorld(sx, sy);
    // Test in reverse order (top-most first)
    for (let i = this.handles.length - 1; i >= 0; i--) {
      const h = this.handles[i];
      if (!h.visible || !h.draggable) continue;
      if (h.hitTest(world.x, world.y)) return h;
    }
    return null;
  }

  /** Set hovered handle (for cursor styling) */
  setHovered(sx, sy) {
    const h = this.getHandleAtScreen(sx, sy);
    if (this.hoveredHandle && this.hoveredHandle !== h) {
      this.hoveredHandle.isHovered = false;
    }
    this.hoveredHandle = h;
    if (h) h.isHovered = true;
    return h;
  }

  /** Start dragging a handle */
  startDrag(sx, sy) {
    const h = this.getHandleAtScreen(sx, sy);
    if (!h || !h.draggable) return null;
    h.startDrag();
    this.draggingHandle = h;
    return h;
  }

  /** Move dragging handle */
  moveDrag(sx, sy) {
    if (!this.draggingHandle || !this._screenToWorld) return;
    const world = this._screenToWorld(sx, sy);

    // Apply snapping if guide system is set
    let wx = world.x, wy = world.y;
    if (this.guideSystem) {
      wx = this.guideSystem.snapX ? this.guideSystem.snapX(wx) : wx;
      wy = this.guideSystem.snapY ? this.guideSystem.snapY(wy) : wy;
    }

    this.draggingHandle.setGhost(wx, wy);
    this.draggingHandle.drag(wx, wy);
  }

  /** End dragging */
  endDrag(sx, sy) {
    if (!this.draggingHandle) return;
    if (this._screenToWorld) {
      const world = this._screenToWorld(sx, sy);
      this.draggingHandle.setGhost(null, null);
      this.draggingHandle.endDrag();
    }
    this.draggingHandle = null;
  }

  /** Tab navigation between handles */
  tabNext() {
    if (this.handles.length === 0) return;
    if (this.focusedIndex >= 0) {
      this.handles[this.focusedIndex].isFocused = false;
    }
    this.focusedIndex = (this.focusedIndex + 1) % this.handles.length;
    this.handles[this.focusedIndex].isFocused = true;
    return this.handles[this.focusedIndex];
  }

  /** Shift+Tab navigation */
  tabPrev() {
    if (this.handles.length === 0) return;
    if (this.focusedIndex >= 0) {
      this.handles[this.focusedIndex].isFocused = false;
    }
    this.focusedIndex = this.focusedIndex <= 0
      ? this.handles.length - 1
      : this.focusedIndex - 1;
    this.handles[this.focusedIndex].isFocused = true;
    return this.handles[this.focusedIndex];
  }

  /** Move focused handle with arrow keys */
  nudgeFocused(dx, dy, largeStep) {
    if (this.focusedIndex < 0) return;
    const h = this.handles[this.focusedIndex];
    if (!h || !h.draggable) return;
    const step = largeStep ? 10 : 1;
    const nx = h.x + dx * step;
    const ny = h.y + dy * step;
    if (h.constraint) {
      const c = h.constraint(nx, ny, h);
      h.x = c.x; h.y = c.y;
    } else {
      h.x = nx; h.y = ny;
    }
    h.markDirty ? h.markDirty() : null;
  }

  /** Get all handles */
  getHandles() { return this.handles; }

  /** Render all handles */
  render(ctx) {
    for (const h of this.handles) {
      h.render(ctx);
    }
  }

  /** Get cursor based on current state */
  getCursor() {
    if (this.draggingHandle) return 'grabbing';
    if (this.hoveredHandle) return this.hoveredHandle.getCursor();
    return 'default';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HandleManager;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.HandleManager = HandleManager;
}

})(typeof window !== 'undefined' ? window : this);
