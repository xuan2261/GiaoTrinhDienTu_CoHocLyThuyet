(function(root) {
  'use strict';
  function webglAvailable() {
    if (root.__SIM3_FORCE_WEBGL_FAIL) return false;
    try {
      const canvas = root.document.createElement('canvas');
      const gl = (root.WebGL2RenderingContext && canvas.getContext('webgl2')) || canvas.getContext('webgl');
      if (gl) {
        const lose = gl.getExtension && gl.getExtension('WEBGL_lose_context');
        if (lose && typeof lose.loseContext === 'function') lose.loseContext();
      }
      return !!gl;
    } catch (error) {
      return false;
    }
  }
  function hostSize(host, cfg) {
    const rect = host.getBoundingClientRect();
    if (!rect.width && !host.getClientRects().length) return null;
    const reference = cfg.referenceEl && cfg.referenceEl.getBoundingClientRect();
    return {
      width: Math.max(280, Math.round(rect.width || (reference && reference.width) || cfg.width || 360)),
      height: Math.max(220, Math.round(cfg.height || (reference && reference.height) || rect.height || 280))
    };
  }
  function create(cfg) {
    cfg = cfg || {};
    let fallbackSent = false;
    function notify(reason, error) {
      if (fallbackSent) return;
      fallbackSent = true;
      if (cfg.onFallback) cfg.onFallback(reason, error);
    }
    const THREE = root.THREE;
    if (!THREE || !webglAvailable()) {
      notify(!THREE ? 'three-missing' : 'webgl-unavailable');
      return null;
    }
    const initial = hostSize(cfg.host, cfg) || { width: 360, height: cfg.height || 280 };
    cfg.host.style.position = 'relative';
    cfg.host.style.width = '100%';
    cfg.host.style.height = `${initial.height}px`;
    let scene, camera, renderer, labels, api;
    let disposed = false, rafId = null, observer = null, listeningWindow = false;
    let lastState = null, width = 0, height = 0, pixelRatio = 0;
    const baseFov = 40, framingAspect = initial.width / initial.height;
    function stop() {
      if (rafId == null) return false;
      root.cancelAnimationFrame(rafId);
      rafId = null;
      return true;
    }

    function cleanup() {
      if (disposed) return;
      disposed = true;
      stop();
      if (observer) observer.disconnect();
      observer = null;
      if (listeningWindow) root.removeEventListener('resize', resize);
      listeningWindow = false;
      if (labels) labels.dispose();
      try { root.Sim3Dispose.disposeAll(api || { scene, renderer }); } catch (error) { /* best-effort cleanup */ }
      if (cfg.host && cfg.host.parentNode) cfg.host.parentNode.removeChild(cfg.host);
    }

    function fail(reason, error) {
      if (fallbackSent) return false;
      cleanup();
      notify(reason, error);
      return false;
    }

    function currentPixelRatio() {
      const value = Number(root.devicePixelRatio);
      return Math.min(Number.isFinite(value) && value > 0 ? value : 1, cfg.pixelRatioCap || 2);
    }

    function applySize(next) {
      const ratio = currentPixelRatio();
      const changed = next.width !== width || next.height !== height || ratio !== pixelRatio;
      if (!changed) return false;
      renderer.setPixelRatio(ratio);
      renderer.setSize(next.width, next.height, false);
      camera.aspect = next.width / next.height;
      camera.fov = cfg.responsiveFraming === 'horizontal'
        ? 2 * Math.atan(Math.tan(baseFov * Math.PI / 360) * framingAspect / camera.aspect) * 180 / Math.PI
        : baseFov;
      camera.updateProjectionMatrix();
      width = next.width; height = next.height; pixelRatio = ratio;
      return true;
    }

    function render() {
      if (disposed) return false;
      try {
        renderer.render(scene, camera);
        labels.update();
        return true;
      } catch (error) {
        return fail('scene-render-failed', error);
      }
    }

    function setState(state) {
      if (disposed) return false;
      lastState = state;
      try {
        if (cfg.update) cfg.update(state, api);
      } catch (error) {
        return fail('scene-update-failed', error);
      }
      return disposed ? false : render();
    }

    function resize() {
      if (disposed) return false;
      try {
        const next = hostSize(cfg.host, cfg);
        if (!next || !applySize(next)) return false;
        return render();
      } catch (error) {
        return fail('scene-resize-failed', error);
      }
    }

    function loop() {
      rafId = null;
      if (disposed) return;
      try {
        if (cfg.update) cfg.update(lastState, api);
      } catch (error) {
        fail('scene-update-failed', error);
        return;
      }
      if (render() && !disposed) rafId = root.requestAnimationFrame(loop);
    }

    function start() {
      if (!cfg.continuous || disposed || rafId != null) return false;
      rafId = root.requestAnimationFrame(loop);
      return true;
    }

    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);
      camera = new THREE.PerspectiveCamera(40, initial.width / initial.height, 0.1, 100);
      camera.position.set(4.5, 4.2, 6.5);
      camera.lookAt(0, 0, 0);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.domElement.className = 'sim3-canvas';
      renderer.domElement.setAttribute('role', 'img');
      renderer.domElement.setAttribute('aria-label', cfg.label || 'Mô phỏng cơ học 3D tương tác');
      cfg.host.appendChild(renderer.domElement);
      applySize(initial);
      labels = root.Sim3LabelLayer.create({ THREE, renderer, camera, host: cfg.host });
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8aa0b8, 2.5));
      const key = new THREE.DirectionalLight(0xffffff, 1.3);
      key.position.set(4, 6, 5); key.castShadow = true; scene.add(key);
      const fill = new THREE.DirectionalLight(0xdbeafe, 0.55);
      fill.position.set(-3, 3, -4); scene.add(fill);
    } catch (error) {
      cleanup();
      notify('renderer-create-failed', error);
      return null;
    }

    api = {
      THREE, scene, camera, renderer, host: cfg.host, labels,
      projectMargin: labels.margin, projectBounds: labels.bounds, projectDistance: labels.distance,
      setState, render, resize, start, stop, dispose: cleanup
    };
    try {
      if (cfg.setup) cfg.setup(api);
    } catch (error) {
      fail('scene-setup-failed', error);
      return null;
    }
    if (!render()) return null;

    if (root.ResizeObserver) {
      try {
        observer = new root.ResizeObserver(resize);
        observer.observe(cfg.host);
      } catch (error) {
        observer = null;
      }
    }
    if (!observer) {
      root.addEventListener('resize', resize);
      listeningWindow = true;
    }
    if (cfg.continuous) start();
    return api;
  }

  root.Sim3Shell = { create, webglAvailable };
})(typeof window !== 'undefined' ? window : this);
