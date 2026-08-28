(function () {
  const STORAGE_KEY = 'contentWidth';
  const STANDARD = 'standard';
  const WIDE = 'wide';
  let current = STANDARD;

  function normalizeContentWidth(value) {
    return value === WIDE ? WIDE : STANDARD;
  }

  function readContentWidth() {
    try {
      return normalizeContentWidth(window.localStorage.getItem(STORAGE_KEY));
    } catch (_) {
      return STANDARD;
    }
  }

  function updateContentWidthControl(mode) {
    const button = document.getElementById('contentWidthBtn');
    if (!button) return;
    const wide = mode === WIDE;
    button.setAttribute('aria-pressed', String(wide));
    button.setAttribute('aria-label', wide ? 'Dùng chiều rộng tiêu chuẩn' : 'Mở rộng nội dung');
    button.title = wide ? 'Dùng chiều rộng tiêu chuẩn' : 'Mở rộng nội dung';
    const state = button.querySelector('.content-width-state');
    if (state) state.textContent = wide ? 'Rộng' : 'Tiêu chuẩn';
  }

  function applyContentWidth(mode) {
    current = normalizeContentWidth(mode);
    document.documentElement.dataset.contentWidth = current;
    updateContentWidthControl(current);
    return current;
  }

  function persistContentWidth(mode) {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (_) {}
  }

  function toggleContentWidth() {
    const next = current === WIDE ? STANDARD : WIDE;
    applyContentWidth(next);
    persistContentWidth(next);
  }

  function bindContentWidthControl() {
    const button = document.getElementById('contentWidthBtn');
    if (!button || button.dataset.boundContentWidth) return;
    button.dataset.boundContentWidth = 'true';
    button.addEventListener('click', toggleContentWidth);
    updateContentWidthControl(current);
  }

  applyContentWidth(readContentWidth());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindContentWidthControl, { once: true });
  else bindContentWidthControl();
}());
