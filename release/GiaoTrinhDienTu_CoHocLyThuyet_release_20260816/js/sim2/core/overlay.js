/**
 * HTML overlay — nhãn + readout card định vị TUYỆT ĐỐI qua transform.
 * Nhãn là DOM (không vẽ trong SVG/canvas) → test getByText bắt được, không bị chồng.
 * Browser-only. UMD guard.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2Overlay = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  /**
   * Tạo lớp overlay phủ lên SVG. Container cha phải position:relative.
   * @param {HTMLElement} parent - phần tử chứa (sim-shell set position:relative)
   * @param {object} tf - transform dùng chung
   */
  function createOverlay(parent, tf) {
    const layer = document.createElement('div');
    layer.className = 'sim2-overlay';
    layer.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;';
    parent.appendChild(layer);

    const labels = [];

    /**
     * Nhãn HTML tại điểm world. anchor: 'center'|'left'|'right'|'top'|'bottom'.
     * @returns {HTMLElement} để cập nhật/định vị lại
     */
    function label(html, worldPt, opts) {
      opts = opts || {};
      const div = document.createElement('div');
      div.className = 'sim2-label' + (opts.class ? ' ' + opts.class : '');
      div.style.cssText = [
        'position:absolute',
        'white-space:nowrap',
        'font-size:' + (opts.fontSize || 13) + 'px',
        'color:' + (opts.color || '#1a1a1a'),
        'background:' + (opts.bg || 'rgba(255,255,255,0.85)'),
        'padding:1px 4px',
        'border-radius:3px',
        'pointer-events:none',
        'transform:translate(-50%,-50%)'
      ].join(';');
      div.innerHTML = html;
      div.__worldPt = worldPt;
      div.__anchor = opts.anchor || 'center';
      layer.appendChild(div);
      labels.push(div);
      position(div);
      return div;
    }

    function anchorTransform(anchor) {
      switch (anchor) {
        case 'left':   return 'translate(0,-50%)';
        case 'right':  return 'translate(-100%,-50%)';
        case 'top':    return 'translate(-50%,0)';
        case 'bottom': return 'translate(-50%,-100%)';
        default:       return 'translate(-50%,-50%)';
      }
    }

    function position(div) {
      const s = tf.toScreen(div.__worldPt);
      div.style.left = s.x + 'px';
      div.style.top = s.y + 'px';
      div.style.transform = anchorTransform(div.__anchor);
    }

    /** Cập nhật world-pt cho 1 nhãn rồi định vị lại. */
    function moveLabel(div, worldPt) {
      div.__worldPt = worldPt;
      position(div);
    }

    /** Định vị lại toàn bộ nhãn (gọi sau resize/đổi transform). */
    function reflow() {
      for (const d of labels) position(d);
    }

    /**
     * Readout card — panel HTML cố định góc, mỗi item KaTeX hoặc text.
     * items: [{label, value, latex?}]. noUnit khi value đã có ký hiệu.
     */
    function readoutCard(items, opts) {
      opts = opts || {};
      const card = document.createElement('div');
      card.className = 'sim2-readout';
      const pos = opts.position || 'top-right';
      const vert = pos.indexOf('bottom') >= 0 ? 'bottom:8px' : 'top:8px';
      const horiz = pos.indexOf('left') >= 0 ? 'left:8px' : 'right:8px';
      card.style.cssText = [
        'position:absolute', vert, horiz,
        'background:rgba(255,255,255,0.92)',
        'border:1px solid #ccc', 'border-radius:6px',
        'padding:6px 10px', 'font-size:13px', 'line-height:1.5',
        'pointer-events:none', 'box-shadow:0 1px 4px rgba(0,0,0,0.12)'
      ].join(';');
      layer.appendChild(card);

      function render(rows) {
        card.innerHTML = '';
        for (const it of rows) {
          const row = document.createElement('div');
          row.className = 'sim2-readout-row';
          const lab = document.createElement('span');
          lab.style.cssText = 'color:#555;margin-right:6px;';
          const val = document.createElement('span');
          val.style.cssText = 'font-weight:600;color:#1a1a1a;';
          if (it.latex && typeof window.katex !== 'undefined') {
            try { window.katex.render(it.latex, lab, { throwOnError: false }); }
            catch (e) { lab.textContent = it.label != null ? it.label : ''; }
          } else {
            lab.textContent = it.label != null ? it.label : '';
          }
          val.textContent = it.value != null ? String(it.value) : '';
          row.appendChild(lab); row.appendChild(val);
          card.appendChild(row);
        }
      }
      render(items || []);
      card.__render = render;
      return card;
    }

    function dispose() {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
      labels.length = 0;
    }

    return { layer, label, moveLabel, reflow, readoutCard, dispose };
  }

  return { createOverlay };
});
