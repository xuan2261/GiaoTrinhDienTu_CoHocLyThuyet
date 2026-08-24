(function initMediaPilotLoader(global) {
  'use strict';

  function getEntry(id) {
    const runtime = global.MEDIA_PILOT_RUNTIME;
    if (!runtime || !Array.isArray(runtime.entries)) return null;
    return runtime.entries.find(entry => entry.id === id) || null;
  }

  function createController(options) {
    const root = options.root || document;
    const mediaId = options.mediaId || document.body.dataset.mediaId;
    const entry = getEntry(mediaId);
    const interactive = root.querySelector('[data-interactive]');
    const fallback = root.querySelector('[data-static-fallback]');
    const status = root.querySelector('[data-media-status]');
    const motionQuery = global.matchMedia
      ? global.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };
    let instance = null;
    let mode = 'static';

    function setStatus(message, tone) {
      if (!status) return;
      status.textContent = message;
      status.dataset.tone = tone || 'neutral';
    }

    function showFallback(reason, tone) {
      if (interactive) interactive.hidden = true;
      if (fallback) fallback.hidden = false;
      mode = 'static';
      document.body.dataset.mediaMode = mode;
      setStatus(reason || 'Đang dùng phương án tĩnh.', tone);
    }

    function showInteractive(message) {
      if (interactive) interactive.hidden = false;
      if (fallback && options.keepFallbackVisible !== true) fallback.hidden = true;
      mode = 'interactive';
      document.body.dataset.mediaMode = mode;
      setStatus(message || 'Tương tác sẵn sàng.');
    }

    async function start() {
      if (!entry) {
        showFallback('Không tìm thấy mục tương ứng trong manifest runtime.', 'error');
        return null;
      }
      if (!interactive || !fallback) {
        showFallback('Prototype thiếu vùng tương tác hoặc phương án tĩnh.', 'error');
        return null;
      }
      if (motionQuery.matches && entry.reducedMotionMode === 'static') {
        showFallback('Hệ thống yêu cầu giảm chuyển động. Đang dùng ảnh tĩnh.');
        return null;
      }
      try {
        instance = await options.mount({ entry, interactive, fallback, setStatus, showFallback, showInteractive });
        showInteractive(options.readyMessage);
        return instance;
      } catch (error) {
        showFallback(options.errorMessage || 'Không thể mở nội dung tương tác. Đang dùng phương án tĩnh.', 'error');
        return null;
      }
    }

    function dispose() {
      if (instance && typeof instance.dispose === 'function') instance.dispose();
      instance = null;
    }

    const api = { entry, start, dispose, showFallback, showInteractive, setStatus, get mode() { return mode; } };
    global.__MEDIA_PILOT__ = api;
    return api;
  }

  function waitForImage(image, source) {
    return new Promise((resolve, reject) => {
      const loaded = () => { cleanup(); resolve(image); };
      const failed = () => { cleanup(); reject(new Error('image-load-failed')); };
      const cleanup = () => {
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', failed);
      };
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', failed, { once: true });
      image.src = source;
      if (image.complete) {
        if (image.naturalWidth > 0) loaded();
        else failed();
      }
    });
  }

  global.MediaPilotLoader = Object.freeze({ createController, getEntry, waitForImage });
})(window);
