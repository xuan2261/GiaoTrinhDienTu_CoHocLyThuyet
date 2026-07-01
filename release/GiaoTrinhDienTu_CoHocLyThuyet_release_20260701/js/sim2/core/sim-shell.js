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
    const Ctrl = root.Sim2Controls;
    const Pnl = root.Sim2Panel;

    const container = cfg.container;
    // Viewport KHỚP TỈ LỆ worldBox → transform lấp đầy, không để trống 2 bên/trên-dưới.
    // (Nếu lấy clientWidth × fallback-height sẽ ra khung bẹt → hình nhỏ dồn giữa.)
    const worldW = (cfg.worldBox.maxX - cfg.worldBox.minX) || 1;
    const worldH = (cfg.worldBox.maxY - cfg.worldBox.minY) || 1;
    const aspect = worldW / worldH;
    const MAX_W = 720, MAX_H = 440;
    // bề rộng khả dụng: ưu tiên cfg.width; else clientWidth trừ padding card; else 640
    let availW = cfg.width || (container.clientWidth ? container.clientWidth - 30 : 0) || 640;
    // reservePanel: sim sẽ đặt theory panel cạnh viewport → để dành chỗ cho panel,
    // viewport chỉ lấy ~60% (sàn 280px) → side-by-side thật trên khung rộng, KHÔNG rebuild transform.
    if (cfg.reservePanel && !cfg.width) {
      availW = Math.max(280, Math.round(availW * 0.6));
    }
    let width = Math.min(availW, MAX_W);
    let height = cfg.height || (width / aspect);
    if (!cfg.height && height > MAX_H) { height = MAX_H; width = height * aspect; }
    width = Math.round(width);
    height = Math.round(height);

    // Viewport host: căn giữa viewport trong card; root là vùng vẽ nền sáng (CSS .sim2-root).
    const viewportHost = document.createElement('div');
    viewportHost.className = 'sim2-viewport-host';
    container.appendChild(viewportHost);

    const rootEl = document.createElement('div');
    rootEl.className = 'sim2-root';
    rootEl.style.cssText = `position:relative;width:${width}px;height:${height}px;`;
    viewportHost.appendChild(rootEl);

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

    function prefersReducedMotion() {
      return root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // ─── Header thẻ (tùy chọn): tên sim + badge §mục (gradient theo chương) + reset ───
    // Đặt LÀM FIRST-CHILD container (trên stage); dispose gỡ kèm. Không meta → không header
    // (sim chưa retrofit giữ nguyên, không hồi quy).
    let headerEl = null;
    if (cfg.meta && cfg.meta.name) {
      headerEl = document.createElement('div');
      headerEl.className = 'sim2-card-header';
      if (cfg.meta.chapter != null) headerEl.setAttribute('data-chapter', String(cfg.meta.chapter));
      const title = document.createElement('span');
      title.className = 'sim2-card-title';
      title.textContent = cfg.meta.name;
      const metaWrap = document.createElement('span');
      metaWrap.className = 'sim2-card-meta';
      if (cfg.meta.section) {
        const badge = document.createElement('span');
        badge.className = 'sim2-badge';
        badge.textContent = '§' + cfg.meta.section;
        metaWrap.appendChild(badge);
      }
      if (typeof cfg.meta.onReset === 'function') {
        const rst = document.createElement('button');
        rst.className = 'sim2-card-reset';
        rst.type = 'button';
        rst.title = 'Đặt lại';
        rst.textContent = '↺';
        addListener(rst, 'click', cfg.meta.onReset);
        metaWrap.appendChild(rst);
      }
      headerEl.appendChild(title);
      headerEl.appendChild(metaWrap);
      container.insertBefore(headerEl, container.firstChild);
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

    /**
     * Thêm 1 drag-handle (SVG circle) tại world-pt. Kéo → onDrag(worldPt, phase).
     * Trả { node, move(worldPt) }. Hit-test riêng từng handle (không dùng global drag).
     */
    function addHandle(worldPt, opts) {
      opts = opts || {};
      let wp = worldPt;
      const s = tf.toScreen(wp);
      const node = R.el('circle', {
        cx: s.x, cy: s.y, r: opts.r || 8,
        fill: opts.fill || '#ff7043',
        stroke: opts.stroke || '#fff',
        'stroke-width': 2,
        class: 'sim2-handle',
        style: 'cursor:grab;'
      });
      if (opts.hintPulse !== false && !prefersReducedMotion()) node.classList.add('sim2-handle-pulse');
      svg.appendChild(node);

      function localScreen(ev) {
        const rect = svg.getBoundingClientRect();
        return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      }
      let dragging = false;
      function down(ev) {
        dragging = true;
        node.classList.add('is-active');
        node.classList.remove('sim2-handle-pulse');
        ev.stopPropagation();
        node.setPointerCapture && ev.pointerId != null && node.setPointerCapture(ev.pointerId);
        if (opts.onDrag) opts.onDrag(wp, 'start', ev);
      }
      function move(ev) {
        if (!dragging) return;
        wp = tf.toWorld(localScreen(ev));
        moveTo(wp);
        if (opts.onDrag) opts.onDrag(wp, 'move', ev);
      }
      function up(ev) {
        if (!dragging) return;
        dragging = false;
        node.classList.remove('is-active');
        if (opts.onDrag) opts.onDrag(wp, 'end', ev);
      }
      function moveTo(newWp) {
        wp = newWp;
        const sc = tf.toScreen(wp);
        node.setAttribute('cx', sc.x);
        node.setAttribute('cy', sc.y);
      }
      addListener(node, 'pointerdown', down);
      addListener(window, 'pointermove', move);
      addListener(window, 'pointerup', up);

      return { node, move: moveTo, get worldPt() { return wp; } };
    }

    // ─── Theory panel + control bar (lazy; DOM NGOÀI sim2-root → không chạm drag SVG) ───
    // Stage wrapper chỉ dựng khi setTheory được gọi → 23 sim chưa retrofit giữ DOM cũ (không hồi quy).
    let stageEl = null, panel = null, controls = null;

    function ensureStage() {
      if (stageEl) return stageEl;
      stageEl = document.createElement('div');
      stageEl.className = 'sim2-stage';
      container.insertBefore(stageEl, viewportHost);
      stageEl.appendChild(viewportHost); // viewport vào trái stage; panel sẽ vào phải
      return stageEl;
    }

    /** Gắn theory panel cạnh viewport. opts → Sim2Panel.createPanel. */
    function setTheory(opts) {
      ensureStage();
      if (panel) panel.dispose();
      panel = Pnl.createPanel(stageEl, opts);
      overlay.reflow();
      return panel;
    }

    /** Gắn control bar dưới stage. opts → Sim2Controls.createControls. */
    function addControls(opts) {
      if (controls) controls.dispose();
      controls = Ctrl.createControls(container, opts);
      return controls;
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      for (const fn of cleanups) { try { fn(); } catch (e) { /* noop */ } }
      cleanups.length = 0;
      overlay.dispose();
      if (canvas) canvas.dispose();
      if (controls) controls.dispose();
      if (panel) panel.dispose();
      if (svg.parentNode) svg.parentNode.removeChild(svg);
      // gỡ outer (stage chứa viewportHost+panel nếu có; else viewportHost) — không để node mồ côi
      const outer = stageEl || viewportHost;
      if (outer.parentNode) outer.parentNode.removeChild(outer);
      if (headerEl && headerEl.parentNode) headerEl.parentNode.removeChild(headerEl);
    }

    // Gắn dispose lên DOM node để loader gỡ được shell mồ côi nếu factory throw giữa mount.
    rootEl.__sim2Dispose = dispose;

    return {
      root: rootEl, svg, tf, overlay, canvas,
      render: R, // tiện gọi primitives
      onPointerDrag, onFrame, start, stop, addHandle, addCleanup, addListener,
      setTheory, addControls, dispose
    };
  }

  return { createSimShell };
});
