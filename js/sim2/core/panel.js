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
    const flashTimers = {};
    const rowNodes = new Map();
    let currentRows = [];
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
    const readButton = document.createElement('button');
    readButton.type = 'button';
    readButton.className = 'sim2-read-current';
    readButton.textContent = 'Đọc trạng thái hiện tại';
    const status = document.createElement('div');
    status.className = 'sim2-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    function announce(message) { status.textContent = String(message || ''); }
    const announceCurrent = () => announce(currentRows.map(row => `${row.label || row.key}: ${row.value ?? ''}`).join('; '));
    readButton.addEventListener('click', announceCurrent);
    root.appendChild(readButton); root.appendChild(status);

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
      currentRows = (rows || []).map(row => ({ ...row }));
      const active = new Set();
      currentRows.forEach((it, index) => {
        const key = it.key != null ? String(it.key) : String(it.label || index);
        active.add(key);
        const value = it.value != null ? String(it.value) : '';
        let entry = rowNodes.get(key);
        if (!entry) {
          const row = document.createElement('div'); row.className = 'sim2-readout-row'; row.setAttribute('data-readout-key', key);
          const lab = document.createElement('span'); lab.className = 'sim2-readout-label';
          const val = document.createElement('span'); val.className = 'sim2-readout-value';
          row.appendChild(lab); row.appendChild(val);
          entry = { row, lab, val, label: null, latex: null }; rowNodes.set(key, entry);
        }
        const label = it.label != null ? String(it.label) : '';
        if (entry.label !== label || entry.latex !== it.latex) {
          if (it.latex && typeof window.katex !== 'undefined') {
            try { window.katex.render(it.latex, entry.lab, { throwOnError: false }); }
            catch (error) { entry.lab.textContent = label; }
          } else entry.lab.textContent = label;
          entry.label = label; entry.latex = it.latex;
        }
        if (entry.val.textContent !== value) entry.val.textContent = value;
        if (previous[key] != null && previous[key] !== value && !prefersReducedMotion()) {
          if (flashTimers[key]) clearTimeout(flashTimers[key]);
          entry.row.classList.add('sim2-readout-changed');
          flashTimers[key] = setTimeout(() => { entry.row.classList.remove('sim2-readout-changed'); delete flashTimers[key]; }, 500);
        }
        previous[key] = value;
        if (live.children[index] !== entry.row) live.insertBefore(entry.row, live.children[index] || null);
      });
      for (const [key, entry] of rowNodes) {
        if (!active.has(key)) {
          if (flashTimers[key]) clearTimeout(flashTimers[key]);
          delete flashTimers[key]; delete previous[key];
          if (entry.row.parentNode) entry.row.parentNode.removeChild(entry.row);
          rowNodes.delete(key);
        }
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
      readButton.removeEventListener('click', announceCurrent);
      rowNodes.clear();
      if (root.parentNode) root.parentNode.removeChild(root);
    }

    return { root, setReadout, setFormulaHighlight, announce, dispose };
  }

  return { createPanel };
});
