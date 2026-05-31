/**
 * Sim shell — factory chung: dựng <svg>+overlay(+canvas) trong container,
 * wire pointer drag (toWorld), RAF loop, và dispose() GỠ SẠCH listener + RAF + DOM.
 * Mọi tầng dùng CÙNG 1 transform instance. Browser-only.
 *
 * Phụ thuộc (đã nạp trước qua script-tag): Sim2Transform, Sim2SvgRender,
 * Sim2Overlay, Sim2CanvasUnderlay.
 */
(function(root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2Shell = api;
})(typeof window !== 'undefined' ? window : this, function(root) {
  'use strict';

  /**
   * @param {object} cfg
   * @param {HTMLElement} cfg.container - nơi mount
   * @param {{minX,minY,maxX,maxY}} cfg.worldBox
   * @param {number} [cfg.width] [cfg.height] - kích thước px (mặc định theo container/480×360)
   * @param {boolean} [cfg.canvas] - bật canvas underlay
   * @returns {{root, svg, tf, overlay, canvas, onPointerDrag, onFrame, start, stop, dispose, addCleanup}}
   */
  function createSimShell(cfg) {
    const T = root.Sim2Transform;
    const R = root.Sim2SvgRender;
    const O = root.Sim2Overlay;
    const C = root.Sim2CanvasUnderlay;

    const container = cfg.container;
    const width = cfg.width || container.clientWidth || 480;
    const height = cfg.height || container.clientHeight || 360;

    // Root tương đối cho overlay tuyệt đối
    const rootEl = document.createElement('div');
    rootEl.className = 'sim2-root';
    rootEl.style.cssText = `position:relative;width:${width}px;height:${height}px;`;
    container.appendChild(rootEl);

    const tf = T.makeTransform({
      worldBox: cfg.worldBox,
      screenBox: { x: 0, y: 0, width, height }
    });

    // Canvas underlay (tùy chọn) — chèn trước để nằm dưới SVG
    let canvas = null;
    if (cfg.canvas) canvas = C.createCanvasUnderlay(rootEl, tf, width, height);

    // SVG
    const svg = R.createSvg(width, height);
    svg.style.cssText = 'position:absolute;left:0;top:0;';
    rootEl.appendChild(svg);

    // Overlay (nhãn/readout) — trên cùng
    const overlay = O.createOverlay(rootEl, tf);

    // ─── Quản lý listener + RAF để dispose sạch ───
    const cleanups = [];
    let rafId = null;
    let frameCb = null;
    let disposed = false;

    function addCleanup(fn) { cleanups.push(fn); }

    function addListener(target, type, handler, opts) {
      target.addEventListener(type, handler, opts);
      cleanups.push(() => target.removeEventListener(type, handler, opts));
    }

    /**
     * Đăng ký drag pointer trên svg: callback nhận world-pt khi kéo.
     * onDrag(worldPt, phase) phase ∈ 'start'|'move'|'end'.
     */
    function onPointerDrag(onDrag) {
      let dragging = false;

      function localScreen(ev) {
        const rect = svg.getBoundingClientRect();
        return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      }
      function down(ev) {
        dragging = true;
        svg.setPointerCapture && ev.pointerId != null && svg.setPointerCapture(ev.pointerId);
        onDrag(tf.toWorld(localScreen(ev)), 'start', ev);
      }
      function move(ev) {
        if (!dragging) return;
        onDrag(tf.toWorld(localScreen(ev)), 'move', ev);
      }
      function up(ev) {
        if (!dragging) return;
        dragging = false;
        onDrag(tf.toWorld(localScreen(ev)), 'end', ev);
      }
      addListener(svg, 'pointerdown', down);
      addListener(svg, 'pointermove', move);
      addListener(window, 'pointerup', up);
    }

    /** Đăng ký callback mỗi frame; tự gọi start(). */
    function onFrame(cb) {
      frameCb = cb;
      start();
    }

    function loop(ts) {
      if (disposed) return;
      if (frameCb) frameCb(ts);
      rafId = root.requestAnimationFrame(loop);
    }

    function start() {
      if (rafId == null && !disposed) rafId = root.requestAnimationFrame(loop);
    }

    function stop() {
      if (rafId != null) { root.cancelAnimationFrame(rafId); rafId = null; }
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      for (const fn of cleanups) { try { fn(); } catch (e) { /* noop */ } }
      cleanups.length = 0;
      overlay.dispose();
      if (canvas) canvas.dispose();
      if (svg.parentNode) svg.parentNode.removeChild(svg);
      if (rootEl.parentNode) rootEl.parentNode.removeChild(rootEl);
    }

    return {
      root: rootEl, svg, tf, overlay, canvas,
      render: R, // tiện gọi primitives
      onPointerDrag, onFrame, start, stop, addCleanup, addListener, dispose
    };
  }

  return { createSimShell };
});
