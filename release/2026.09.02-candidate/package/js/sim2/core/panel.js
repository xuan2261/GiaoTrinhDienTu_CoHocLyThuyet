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
    const previous = {};
    const flashUntil = {};
    const flashTimers = {};
    const root = document.createElement('div');
    root.className = 'sim2-theory';

    // ─── Công thức ───
    if (opts.formulas && opts.formulas.length) {
      const fwrap = document.createElement('div');
      fwrap.className = 'sim2-formulas';
      opts.formulas.forEach((formula, index) => {
        const latex = typeof formula === 'string' ? formula : formula.latex;
        const f = document.createElement('div');
        f.className = 'sim2-formula';
        const key = typeof formula === 'object' && formula.key != null ? String(formula.key) : String(index);
        f.setAttribute('data-key', key);
        if (typeof window.katex !== 'undefined') {
          try { window.katex.render(latex, f, { throwOnError: false, displayMode: false }); }
          catch (e) { f.textContent = latex; }
        } else {
          f.textContent = latex;
        }
        fwrap.appendChild(f);
      });
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
        const key = it.key != null ? String(it.key) : String(it.label || '');
        const value = it.value != null ? String(it.value) : '';
        const row = document.createElement('div');
        row.className = 'sim2-readout-row';
        if (key) row.setAttribute('data-readout-key', key);
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
        val.textContent = value;
        row.appendChild(lab);
        row.appendChild(val);
        if (key && previous[key] != null && previous[key] !== value && !prefersReducedMotion()) {
          if (flashTimers[key]) clearTimeout(flashTimers[key]);
          flashUntil[key] = Date.now() + 500;
          flashTimers[key] = setTimeout(() => {
            delete flashUntil[key];
            delete flashTimers[key];
          }, 500);
        }
        if (key && flashUntil[key] && Date.now() < flashUntil[key] && !prefersReducedMotion()) {
          row.classList.add('sim2-readout-changed');
        }
        if (key) previous[key] = value;
        live.appendChild(row);
      }
    }

    function prefersReducedMotion() {
      return typeof window !== 'undefined' && window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function setFormulaHighlight(keys) {
      const active = {};
      for (const key of (keys || [])) active[String(key)] = true;
      root.querySelectorAll('.sim2-formula').forEach(el => {
        el.classList.toggle('sim2-formula-highlight', !!active[el.getAttribute('data-key')]);
      });
    }

    function dispose() {
      for (const key in flashTimers) clearTimeout(flashTimers[key]);
      if (root.parentNode) root.parentNode.removeChild(root);
    }

    return { root, setReadout, setFormulaHighlight, dispose };
  }

  return { createPanel };
});
