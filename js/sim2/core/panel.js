/**
 * Sim2Panel — theory panel: công thức (KaTeX) + legend + readout sống + dòng quan sát.
 * KaTeX guard: window.katex vắng → fallback text (degrade như overlay.readoutCard).
 * Readout dùng tabular-nums + min-width (CSS) → giá trị đổi không nhảy layout.
 * Browser-only. UMD guard.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2Panel = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  /**
   * @param {HTMLElement} host
   * @param {object} opts
   * @param {string[]} [opts.formulas] - LaTeX (render KaTeX hoặc text fallback)
   * @param {Array<{color,label}>} [opts.legend]
   * @param {string} [opts.observe]
   * @returns {{root, setReadout, dispose}}
   */
  function createPanel(host, opts) {
    opts = opts || {};
    const root = document.createElement('div');
    root.className = 'sim2-theory';

    // ─── Công thức ───
    if (opts.formulas && opts.formulas.length) {
      const fwrap = document.createElement('div');
      fwrap.className = 'sim2-formulas';
      for (const latex of opts.formulas) {
        const f = document.createElement('div');
        f.className = 'sim2-formula';
        if (typeof window.katex !== 'undefined') {
          try { window.katex.render(latex, f, { throwOnError: false, displayMode: false }); }
          catch (e) { f.textContent = latex; }
        } else {
          f.textContent = latex;
        }
        fwrap.appendChild(f);
      }
      root.appendChild(fwrap);
    }

    // ─── Readout sống ───
    const live = document.createElement('div');
    live.className = 'sim2-readout-live';
    root.appendChild(live);

    // ─── Legend ───
    if (opts.legend && opts.legend.length) {
      const leg = document.createElement('div');
      leg.className = 'sim2-legend';
      for (const it of opts.legend) {
        const item = document.createElement('span');
        item.className = 'sim2-legend-item';
        const sw = document.createElement('span');
        sw.className = 'sim2-swatch';
        sw.style.background = it.color;
        const lab = document.createElement('span');
        lab.textContent = it.label != null ? it.label : '';
        item.appendChild(sw);
        item.appendChild(lab);
        leg.appendChild(item);
      }
      root.appendChild(leg);
    }

    // ─── Quan sát ───
    if (opts.observe) {
      const obs = document.createElement('div');
      obs.className = 'sim2-observe';
      obs.textContent = opts.observe;
      root.appendChild(obs);
    }

    host.appendChild(root);

    /** rows: [{label, value, latex?}] — label có thể KaTeX nếu kèm latex. */
    function setReadout(rows) {
      live.innerHTML = '';
      for (const it of (rows || [])) {
        const row = document.createElement('div');
        row.className = 'sim2-readout-row';
        const lab = document.createElement('span');
        lab.className = 'sim2-readout-label';
        if (it.latex && typeof window.katex !== 'undefined') {
          try { window.katex.render(it.latex, lab, { throwOnError: false }); }
          catch (e) { lab.textContent = it.label != null ? it.label : ''; }
        } else {
          lab.textContent = it.label != null ? it.label : '';
        }
        const val = document.createElement('span');
        val.className = 'sim2-readout-value';
        val.textContent = it.value != null ? String(it.value) : '';
        row.appendChild(lab);
        row.appendChild(val);
        live.appendChild(row);
      }
    }

    function dispose() {
      if (root.parentNode) root.parentNode.removeChild(root);
    }

    return { root, setReadout, dispose };
  }

  return { createPanel };
});
