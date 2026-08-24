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
    rootEl.style.cssText = `position:relative;width:100%;max-width:${width}px;aspect-ratio:${width}/${height};`;
    rootEl.setAttribute('data-logical-width', String(width));
    rootEl.setAttribute('data-logical-height', String(height));
    viewportHost.appendChild(rootEl);

    const tf = T.makeTransform({
      worldBox: cfg.worldBox,
      screenBox: { x: 0, y: 0, width, height }
    });

    let canvas = null;
    if (cfg.canvas) canvas = C.createCanvasUnderlay(rootEl, tf, width, height);

    const svg = R.createSvg(width, height);
    tf.svgIds = svg.__sim2Ids;
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;';
    rootEl.appendChild(svg);

    const overlay = O.createOverlay(rootEl, tf, width, height);

    // ─── Quản lý listener + RAF để dispose sạch ───
    const cleanups = [];
    let rafId = null;
    let running = false;
    let updateCb = null;
    let drawCb = null;
    let clock = null;
    let disposed = false;

    function addCleanup(fn) { cleanups.push(fn); }

    function addListener(target, type, handler, opts) {
      target.addEventListener(type, handler, opts);
      cleanups.push(() => target.removeEventListener(type, handler, opts));
    }

    function prefersReducedMotion() {
      return root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function applyResponsiveSize() {
      if (disposed) return;
      const displayWidth = rootEl.clientWidth;
      const displayHeight = rootEl.clientHeight;
      if (!displayWidth || !displayHeight) return;
      overlay.resize(displayWidth, displayHeight);
      if (canvas) canvas.resize(displayWidth, displayHeight, root.devicePixelRatio || 1);
    }

    if (typeof root.ResizeObserver === 'function') {
      const resizeObserver = new root.ResizeObserver(applyResponsiveSize);
      resizeObserver.observe(rootEl);
      addCleanup(() => resizeObserver.disconnect());
    } else {
      addListener(root, 'resize', applyResponsiveSize);
    }
    applyResponsiveSize();
    Promise.resolve().then(applyResponsiveSize);

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
        rst.title = 'Đặt lại mô phỏng';
        rst.setAttribute('aria-label', 'Đặt lại mô phỏng');
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
        return {
          x: (ev.clientX - rect.left) * width / rect.width,
          y: (ev.clientY - rect.top) * height / rect.height
        };
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

    /** Đăng ký fixed-step update và draw sau khi accumulator đã drain; tự gọi start(). */
    function onFrame(update, draw) {
      updateCb = update;
      drawCb = typeof draw === 'function' ? draw : null;
      clock = root.Sim2AnimationClock.createClock({
        stepSeconds: 1 / 60,
        maxFrameSeconds: 0.25,
        maxSubSteps: 15,
        update(dt, simulationTime) {
          if (!disposed && updateCb) updateCb(dt, simulationTime);
        }
      });
      start();
    }

    function loop(ts) {
      if (disposed || !running) return;
      rafId = null;
      const steps = clock ? clock.advance(ts) : 0;
      if (steps > 0 && drawCb && !disposed) drawCb();
      if (!disposed && running && rafId == null) rafId = root.requestAnimationFrame(loop);
    }

    function start() {
      if (!running && !disposed) {
        running = true;
        if (clock) clock.resetTimestamp();
        rafId = root.requestAnimationFrame(loop);
      }
    }

    function stop() {
      running = false;
      if (rafId != null) { root.cancelAnimationFrame(rafId); rafId = null; }
      if (clock) clock.resetTimestamp();
    }

    function stepOnce() {
      if (!clock || disposed) return 0;
      const steps = clock.stepOnce();
      if (drawCb && !disposed) drawCb();
      return steps;
    }

    function resetClock() {
      if (!clock) return;
      clock.resetTimestamp();
      clock.resetSimulationTime();
    }

    function getSimulationTime() {
      return clock ? clock.getSimulationTime() : 0;
    }

    /**
     * Thêm 1 drag-handle (SVG circle) tại world-pt. Kéo → onDrag(worldPt, phase).
     * Trả { node, move(worldPt) }. Hit-test riêng từng handle (không dùng global drag).
     */
    function addHandle(worldPt, opts) {
      opts = opts || {};
      let wp = worldPt;
      const a11y = opts.a11y || {};
      const axis = a11y.axis || 'x';
      const bounds = opts.bounds || cfg.worldBox;
      const stepOpt = opts.keyboardStep;
      const baseStep = typeof stepOpt === 'number' ? { x: stepOpt, y: stepOpt } : (stepOpt || {});
      const stepX = baseStep.x != null ? baseStep.x : worldW / 40;
      const stepY = baseStep.y != null ? baseStep.y : worldH / 40;
      const s = tf.toScreen(wp);
      const node = R.el('circle', {
        cx: s.x, cy: s.y, r: opts.r || 12,
        fill: opts.fill || '#ff7043',
        stroke: opts.stroke || '#fff',
        'stroke-width': 2,
        class: 'sim2-handle',
        tabindex: 0,
        role: a11y.role || 'slider',
        'aria-label': a11y.label || opts.label || 'Điểm điều khiển; dùng các phím mũi tên để di chuyển',
        style: 'cursor:grab;'
      });
      if (opts.hintPulse !== false && !prefersReducedMotion()) node.classList.add('sim2-handle-pulse');
      svg.appendChild(node);

      function localScreen(ev) {
        const rect = svg.getBoundingClientRect();
        return {
          x: (ev.clientX - rect.left) * width / rect.width,
          y: (ev.clientY - rect.top) * height / rect.height
        };
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
      function keydown(ev) {
        const directions = {
          ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
          ArrowUp: { x: 0, y: 1 }, ArrowDown: { x: 0, y: -1 }
        };
        let next = null;
        const direction = directions[ev.key];
        if (direction) {
          const multiplier = ev.shiftKey ? 5 : 1;
          next = {
            x: wp.x + direction.x * stepX * multiplier,
            y: wp.y + direction.y * stepY * multiplier
          };
        } else if ((ev.key === 'Home' || ev.key === 'End') && axis !== 'both') {
          next = { x: wp.x, y: wp.y };
          const end = ev.key === 'End';
          if (axis === 'y') next.y = end ? bounds.maxY : bounds.minY;
          else next.x = end ? bounds.maxX : bounds.minX;
        }
        if (!next) return;
        ev.preventDefault();
        node.classList.remove('sim2-handle-pulse');
        next.x = Math.min(bounds.maxX, Math.max(bounds.minX, next.x));
        next.y = Math.min(bounds.maxY, Math.max(bounds.minY, next.y));
        moveTo(next);
        if (opts.onDrag) opts.onDrag(next, 'keyboard', ev);
      }
      function updateA11y() {
        const value = typeof a11y.valueFromPoint === 'function' ? a11y.valueFromPoint(wp) : (axis === 'y' ? wp.y : wp.x);
        const min = a11y.min != null ? a11y.min : (axis === 'y' ? bounds.minY : bounds.minX);
        const max = a11y.max != null ? a11y.max : (axis === 'y' ? bounds.maxY : bounds.maxX);
        node.setAttribute('aria-valuemin', String(min));
        node.setAttribute('aria-valuemax', String(max));
        node.setAttribute('aria-valuenow', String(value));
        node.setAttribute('aria-valuetext', typeof a11y.valueText === 'function' ? a11y.valueText(wp) : `x ${wp.x.toFixed(2)}, y ${wp.y.toFixed(2)}`);
        if (axis === 'x' || axis === 'y') node.setAttribute('aria-orientation', axis === 'x' ? 'horizontal' : 'vertical');
        node.setAttribute('data-world-x', String(wp.x));
        node.setAttribute('data-world-y', String(wp.y));
      }
      function moveTo(newWp) {
        wp = newWp;
        const sc = tf.toScreen(wp);
        node.setAttribute('cx', sc.x);
        node.setAttribute('cy', sc.y);
        updateA11y();
      }
      addListener(node, 'pointerdown', down);
      addListener(window, 'pointermove', move);
      addListener(window, 'pointerup', up);
      addListener(node, 'keydown', keydown);
      updateA11y();

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
      onPointerDrag, onFrame, start, stop, stepOnce, resetClock, getSimulationTime,
      addHandle, addCleanup, addListener, setTheory, addControls, dispose
    };
  }

  return { createSimShell };
});
