(() => {
  'use strict';

  function create({ ui, state, updateControls, setStatus, onError }) {
    function cancelRender() {
      state.renderGeneration++;
      state.fitGeneration++;
      state.renderTask?.cancel();
      state.textLayer?.cancel();
      state.renderTask = state.textLayer = null;
    }

    async function renderPage() {
      cancelRender();
      const token = state.renderGeneration;
      const session = state.sessionGeneration;
      const pageNumber = state.page;
      let page;
      try { page = await state.doc.getPage(pageNumber); }
      catch (error) {
        if (token !== state.renderGeneration || session !== state.sessionGeneration) return;
        throw error;
      }
      if (token !== state.renderGeneration || session !== state.sessionGeneration) return;
      const viewport = page.getViewport({ scale: state.zoom });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = ui.canvas;
      canvas.width = Math.ceil(viewport.width * ratio);
      canvas.height = Math.ceil(viewport.height * ratio);
      canvas.style.width = `${Math.ceil(viewport.width)}px`;
      canvas.style.height = `${Math.ceil(viewport.height)}px`;
      ui.pageHost.style.width = canvas.style.width;
      ui.pageHost.style.height = canvas.style.height;
      ui.pageHost.style.setProperty('--scale-factor', String(state.zoom));
      ui.text.replaceChildren();
      state.renderTask = page.render({
        canvas,
        canvasContext: canvas.getContext('2d'),
        viewport,
        transform: ratio === 1 ? null : [ratio, 0, 0, ratio, 0, 0],
      });
      try { await state.renderTask.promise; }
      catch (error) {
        if (token !== state.renderGeneration || error?.name === 'RenderingCancelledException') return;
        throw error;
      }
      if (token !== state.renderGeneration || session !== state.sessionGeneration) return;
      state.textLayer = new window.PdfTextbookRuntime.TextLayer({
        textContentSource: page.streamTextContent({ includeMarkedContent: true }),
        container: ui.text,
        viewport,
      });
      try { await state.textLayer.render(); }
      catch (error) {
        if (token !== state.renderGeneration ||
            ['AbortException', 'RenderingCancelledException'].includes(error?.name)) return;
        throw error;
      }
      if (token !== state.renderGeneration || session !== state.sessionGeneration) return;
      ui.pageHost.hidden = false;
      updateControls(true);
      setStatus(`Trang ${state.page} trên ${state.total}`);
    }

    function fitWidth() {
      if (!state.doc) return;
      const token = ++state.fitGeneration;
      const session = state.sessionGeneration;
      const pageNumber = state.page;
      state.doc.getPage(pageNumber).then(page => {
        if (token !== state.fitGeneration || session !== state.sessionGeneration ||
            pageNumber !== state.page || !state.fit) return;
        const base = page.getViewport({ scale: 1 });
        state.zoom = Math.min(3, Math.max(.5, (ui.viewport.clientWidth - 32) / base.width));
        renderPage().catch(onError);
      }).catch(error => {
        if (token === state.fitGeneration && session === state.sessionGeneration) onError(error);
      });
    }

    return { cancelRender, fitWidth, renderPage };
  }

  window.PdfViewerRenderer = Object.freeze({ create });
})();
