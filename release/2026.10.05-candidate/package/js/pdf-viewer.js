(() => {
  'use strict';
  const dialog = document.getElementById('pdf-viewer-dialog');
  if (!dialog) return;
  const ui = {
    title: document.getElementById('pdf-viewer-title'),
    status: dialog.querySelector('.pdf-viewer-status'),
    error: dialog.querySelector('.pdf-viewer-error'),
    errorMessage: dialog.querySelector('[data-pdf-error-message]'),
    pageHost: dialog.querySelector('.pdf-viewer-page'),
    viewport: dialog.querySelector('.pdf-viewer-viewport'),
    canvas: document.getElementById('pdf-viewer-canvas'),
    text: dialog.querySelector('.pdf-viewer-text-layer'),
    pageInput: document.getElementById('pdf-page-input'),
    pageTotal: document.getElementById('pdf-page-total'),
    zoomOutput: dialog.querySelector('.pdf-viewer-zoom-output'),
  };
  const state = {
    sessionGeneration: 0, renderGeneration: 0, fitGeneration: 0,
    page: 1, total: 0, zoom: 1, fit: false,
    doc: null, loadingTask: null, renderTask: null, textLayer: null,
    opener: null, scrollY: 0, closing: false,
  };
  let assetsPromise;
  let resizeFrame;
  function loadScript(src, attribute) {
    const existing = document.querySelector(`script[${attribute}]`);
    if (existing?.dataset.loaded === 'true') return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = existing || document.createElement('script');
      const done = () => { script.dataset.loaded = 'true'; resolve(); };
      const fail = () => { script.remove(); reject(new Error(`Không tải được ${src}`)); };
      script.addEventListener('load', done, { once: true });
      script.addEventListener('error', fail, { once: true });
      if (!existing) {
        script.src = new URL(src, document.baseURI).href;
        script.setAttribute(attribute, '');
        document.body.appendChild(script);
      }
    });
  }
  function ensureAssets() {
    assetsPromise ||= loadScript('lib/pdfjs/pdfjs-runtime.iife.min.js', 'data-pdf-runtime')
      .then(() => loadScript('lib/pdfjs/pdf-data.js', 'data-pdf-data'))
      .then(() => {
        if (!window.PdfTextbookRuntime || !window.PdfTextbookData) throw new Error('PDF runtime chưa sẵn sàng');
      }).catch(error => { assetsPromise = null; throw error; });
    return assetsPromise;
  }
  function setStatus(text) { ui.status.textContent = text; }
  function updateControls(ready = Boolean(state.doc)) {
    ui.pageInput.disabled = !ready;
    ui.pageInput.max = String(state.total || 1);
    ui.pageInput.value = String(state.page);
    ui.pageTotal.textContent = `/ ${state.total}`;
    ui.zoomOutput.textContent = `${Math.round(state.zoom * 100)}%`;
    dialog.querySelector('[data-pdf-action="previous"]').disabled = !ready || state.page <= 1;
    dialog.querySelector('[data-pdf-action="next"]').disabled = !ready || state.page >= state.total;
    dialog.querySelector('[data-pdf-action="zoom-out"]').disabled = !ready || state.zoom <= .5;
    dialog.querySelector('[data-pdf-action="zoom-in"]').disabled = !ready || state.zoom >= 3;
    dialog.querySelector('[data-pdf-action="fit"]').disabled = !ready;
    dialog.querySelector('.pdf-viewer-download').disabled = !ready;
  }
  const { cancelRender, fitWidth, renderPage } = window.PdfViewerRenderer.create({
    ui, state, updateControls, setStatus, onError: showError,
  });
  function showError(error) {
    ui.pageHost.hidden = true;
    ui.error.hidden = false;
    ui.errorMessage.textContent = error?.message || 'Vui lòng thử lại hoặc tải tệp PDF.';
    setStatus('Không thể mở bản PDF');
  }
  async function startSession() {
    const token = state.sessionGeneration;
    ui.error.hidden = true;
    ui.pageHost.hidden = true;
    setStatus('Đang mở CoHocLyThuyet.pdf…');
    updateControls(false);
    try {
      await ensureAssets();
      if (token !== state.sessionGeneration || !dialog.open) return;
      state.loadingTask = window.PdfTextbookRuntime.openDocument({ data: window.PdfTextbookData.getBytes() });
      state.doc = await state.loadingTask.promise;
      if (token !== state.sessionGeneration || !dialog.open) return;
      state.total = state.doc.numPages;
      state.page = 1;
      state.zoom = 1;
      state.fit = false;
      await renderPage();
    } catch (error) {
      if (token === state.sessionGeneration && dialog.open) showError(error);
    }
  }

  async function resetDocument() {
    cancelRender();
    const loadingTask = state.loadingTask;
    state.doc = state.loadingTask = null;
    try { await loadingTask?.destroy(); } catch (_) { /* cancelled */ }
  }

  async function retrySession() {
    const token = ++state.sessionGeneration;
    await resetDocument();
    if (token === state.sessionGeneration && dialog.open) startSession();
  }

  function renderSelection() {
    if (state.fit) fitWidth();
    else renderPage().catch(showError);
  }

  function openViewer(trigger) {
    if (dialog.open) return;
    state.opener = trigger;
    state.scrollY = window.scrollY;
    state.closing = false;
    state.sessionGeneration++;
    document.body.classList.add('pdf-viewer-open');
    dialog.showModal();
    ui.title.focus();
    history.pushState({ pdfViewer: state.sessionGeneration }, '', location.href);
    startSession();
  }

  async function finishClose() {
    if (!dialog.open) return;
    state.sessionGeneration++;
    await resetDocument();
    dialog.close();
    document.body.classList.remove('pdf-viewer-open');
    window.scrollTo(0, state.scrollY);
    state.opener?.focus();
    state.closing = false;
  }

  function requestClose() {
    if (state.closing || !dialog.open) return;
    state.closing = true;
    if (history.state?.pdfViewer) history.back();
    else finishClose();
  }

  async function downloadPdf() {
    try {
      const bytes = state.doc ? await state.doc.getData() : window.PdfTextbookData?.getBytes();
      const link = document.createElement('a');
      const blobUrl = bytes ? URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })) : null;
      link.href = blobUrl || new URL('CoHocLyThuyet.pdf', document.baseURI).href;
      link.download = 'CoHocLyThuyet.pdf';
      link.click();
      if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
    } catch (error) { showError(error); }
  }


  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-pdf-viewer-open]');
    if (trigger) { openViewer(trigger); return; }
    const action = event.target.closest('[data-pdf-action]')?.dataset.pdfAction;
    if (!action || !dialog.open) return;
    if (action === 'close') requestClose();
    else if (action === 'download') downloadPdf();
    else if (action === 'retry') retrySession();
    else if (action === 'previous' || action === 'next') {
      state.page = Math.min(state.total, Math.max(1,
        state.page + (action === 'next' ? 1 : -1)));
      renderSelection();
    } else if (action === 'zoom-in' || action === 'zoom-out') {
      state.zoom = Math.min(3, Math.max(.5, state.zoom + (action === 'zoom-in' ? .25 : -.25)));
      state.fit = false;
      renderPage().catch(showError);
    } else if (action === 'fit') {
      state.fit = true;
      fitWidth();
    }
  });

  ui.pageInput.addEventListener('change', () => {
    const value = Number(ui.pageInput.value);
    if (!Number.isInteger(value)) { ui.pageInput.value = String(state.page); return; }
    state.page = Math.min(state.total, Math.max(1, value));
    renderSelection();
  });
  ui.viewport.addEventListener('keydown', event => {
    if (event.target !== ui.viewport || !['PageUp', 'PageDown'].includes(event.key)) return;
    event.preventDefault();
    state.page = Math.min(state.total, Math.max(1, state.page + (event.key === 'PageDown' ? 1 : -1)));
    renderSelection();
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); requestClose(); });
  window.addEventListener('popstate', () => { if (dialog.open) finishClose(); });
  window.addEventListener('resize', () => {
    if (!dialog.open || !state.fit) return;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(fitWidth);
  });
})();
