(function(root) {
  'use strict';

  function button(label, mode) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.dataset.mode = mode;
    btn.setAttribute('aria-pressed', mode === '2d' ? 'true' : 'false');
    return btn;
  }

  function attach(cfg) {
    const toggle = document.createElement('div');
    toggle.className = 'sim3-mode-toggle';
    toggle.style.cssText = 'display:inline-flex;gap:4px;margin:8px 0;padding:3px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;';
    toggle.setAttribute('role', 'group');
    toggle.setAttribute('aria-label', 'Chọn chế độ mô phỏng');
    const b2 = button('2D', '2d'), b3 = button('3D', '3d');
    toggle.appendChild(b2); toggle.appendChild(b3);

    const fallback = document.createElement('div');
    fallback.className = 'sim3-fallback';
    fallback.style.cssText = 'margin:6px 0;padding:8px 10px;border:1px solid #f59e0b;border-radius:8px;background:#fffbeb;color:#92400e;font-size:13px;';
    fallback.hidden = true;
    fallback.textContent = '3D không khả dụng, đang dùng 2D.';

    const refParent = cfg.shell2dRoot.parentNode;
    cfg.container.insertBefore(toggle, cfg.container.firstChild);
    cfg.container.insertBefore(fallback, toggle.nextSibling);

    let mode = '2d', sim3 = null, lastState = null;
    function setPressed(next) {
      [b2, b3].forEach(btn => {
        const active = btn.dataset.mode === next;
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        btn.style.cssText = active
          ? 'min-width:42px;padding:5px 10px;border:0;border-radius:6px;background:#102a4d;color:#fff;cursor:pointer;'
          : 'min-width:42px;padding:5px 10px;border:0;border-radius:6px;background:transparent;color:#102a4d;cursor:pointer;';
      });
    }
    function show2d() {
      mode = '2d';
      setPressed(mode);
      fallback.hidden = true;
      cfg.shell2dRoot.style.display = '';
      if (sim3) {
        if (sim3.dispose) sim3.dispose();
        sim3 = null;
      }
      if (cfg.onModeChange) cfg.onModeChange(mode);
    }
    function show3d() {
      fallback.hidden = true;
      if (!sim3) {
        const host = document.createElement('div');
        host.className = 'sim3-host';
        refParent.appendChild(host);
        sim3 = cfg.create3d({
          host,
          onFallback: reason => {
            if (host.parentNode) host.parentNode.removeChild(host);
            sim3 = null;
            show2d();
            fallback.hidden = false;
            if (cfg.onFallback) cfg.onFallback(reason);
          }
        });
      }
      if (!sim3) return;
      mode = '3d';
      setPressed(mode);
      cfg.shell2dRoot.style.display = 'none';
      sim3.host && (sim3.host.hidden = false);
      if (lastState && sim3.setState) sim3.setState(lastState);
      if (sim3.start) sim3.start();
      if (cfg.onModeChange) cfg.onModeChange(mode);
    }
    b2.addEventListener('click', show2d);
    b3.addEventListener('click', show3d);
    setPressed('2d');

    return {
      setState(state) {
        lastState = state;
        if (mode === '3d' && sim3 && sim3.setState) sim3.setState(state);
      },
      reset() { if (sim3 && sim3.reset) sim3.reset(); },
      dispose() {
        b2.removeEventListener('click', show2d);
        b3.removeEventListener('click', show3d);
        if (sim3 && sim3.dispose) sim3.dispose();
        [toggle, fallback].forEach(el => { if (el.parentNode) el.parentNode.removeChild(el); });
      }
    };
  }

  root.Sim3Mode = { attach };
})(typeof window !== 'undefined' ? window : this);
