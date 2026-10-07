(function(root) {
  'use strict';

  function button(label, mode) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.dataset.mode = mode;
    btn.setAttribute('aria-label', `Chế độ mô phỏng ${label}`);
    btn.setAttribute('aria-pressed', mode === '2d' ? 'true' : 'false');
    return btn;
  }

  // Renderers receive an immutable copy, never a live mutable simulation object.
  // This preserves the exact last physical state across lazy mount and fallback.
  function snapshot(value) {
    if (Array.isArray(value)) return Object.freeze(value.map(snapshot));
    if (value && typeof value === 'object') {
      const copy = {};
      for (const key of Object.keys(value)) copy[key] = snapshot(value[key]);
      return Object.freeze(copy);
    }
    return value;
  }

  function attach(cfg) {
    const toggle = document.createElement('div');
    toggle.className = 'sim3-mode-toggle';
    toggle.setAttribute('role', 'group');
    toggle.setAttribute('aria-label', 'Chọn chế độ mô phỏng');
    const b2 = button('2D', '2d'), b3 = button('3D', '3d');
    toggle.appendChild(b2); toggle.appendChild(b3);

    const fallback = document.createElement('div');
    fallback.className = 'sim3-fallback';
    fallback.setAttribute('role', 'status');
    fallback.setAttribute('aria-live', 'polite');
    fallback.hidden = true;
    fallback.textContent = '3D không khả dụng, đang dùng 2D.';

    const refParent = cfg.shell2dRoot.parentNode;
    cfg.container.insertBefore(toggle, cfg.container.firstChild);
    cfg.container.insertBefore(fallback, toggle.nextSibling);

    let mode = '2d', sim3 = null, sim3Host = null, lastState = null, disposed = false, fallbackActive = false;
    function setPressed(next) {
      [b2, b3].forEach(btn => {
        btn.setAttribute('aria-pressed', btn.dataset.mode === next ? 'true' : 'false');
      });
    }
    function releaseSim3() {
      const current = sim3, host = sim3Host;
      sim3 = null; sim3Host = null;
      try { if (current && current.dispose) current.dispose(); }
      finally { if (host && host.parentNode) host.parentNode.removeChild(host); }
    }
    function restore2d(preserveStatus, focusButton) {
      mode = '2d';
      setPressed(mode);
      if (!preserveStatus) fallback.hidden = true;
      cfg.shell2dRoot.style.display = '';
      try { releaseSim3(); } catch (error) { /* fallback remains usable */ }
      if (focusButton) b2.focus();
      if (cfg.onModeChange) cfg.onModeChange(mode);
    }
    function fail(reason, error) {
      if (disposed || fallbackActive) return;
      fallbackActive = true;
      restore2d(true, true);
      fallback.hidden = false;
      if (cfg.onFallback) cfg.onFallback(reason, error);
    }
    function show2d() {
      fallbackActive = false;
      restore2d(false, false);
    }
    function show3d() {
      if (disposed) return;
      fallbackActive = false;
      fallback.hidden = true;
      if (!sim3) {
        const host = document.createElement('div');
        host.className = 'sim3-host';
        sim3Host = host;
        refParent.appendChild(host);
        try {
          const created = cfg.create3d({ host, onFallback: fail });
          // A factory may notify fallback before returning an object. Never
          // reactivate that failed scene or leave its pending host behind.
          if (fallbackActive || disposed) {
            try { if (created && created.dispose) created.dispose(); }
            finally { if (host.parentNode) host.parentNode.removeChild(host); }
            return;
          }
          sim3 = created;
        } catch (error) {
          if (host.parentNode) host.parentNode.removeChild(host);
          fail('create-3d-failed', error);
          return;
        }
        if (!sim3) {
          releaseSim3();
          if (!fallbackActive) fail('create-3d-failed');
          return;
        }
      }
      mode = '3d';
      setPressed(mode);
      cfg.shell2dRoot.style.display = 'none';
      if (sim3.host) sim3.host.hidden = false;
      try {
        if (sim3.resize) sim3.resize();
      } catch (error) {
        fail('scene-resize-failed', error);
        return;
      }
      if (!sim3 || fallbackActive) return;
      try {
        if (lastState && sim3.setState) sim3.setState(lastState);
      } catch (error) {
        fail('scene-update-failed', error);
        return;
      }
      if (cfg.onModeChange) cfg.onModeChange(mode);
    }
    b2.addEventListener('click', show2d);
    b3.addEventListener('click', show3d);
    setPressed('2d');

    return {
      setState(state) {
        lastState = snapshot(state);
        if (mode !== '3d' || !sim3 || !sim3.setState) return;
        try { sim3.setState(lastState); } catch (error) { fail('scene-update-failed', error); }
      },
      reset() {
        if (!sim3 || !sim3.reset) return;
        try { sim3.reset(); } catch (error) { fail('scene-reset-failed', error); }
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        b2.removeEventListener('click', show2d);
        b3.removeEventListener('click', show3d);
        try { releaseSim3(); } catch (error) { /* component is being removed */ }
        [toggle, fallback].forEach(el => { if (el.parentNode) el.parentNode.removeChild(el); });
      }
    };
  }

  root.Sim3Mode = { attach };
})(typeof window !== 'undefined' ? window : this);
