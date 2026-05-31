/**
 * Canvas underlay — lớp <canvas> tùy chọn, CÙNG transform với SVG, vẽ trail/field.
 * Đặt DƯỚI svg (z thấp hơn). Mỗi frame ctx.clear rồi vẽ qua tf. Browser-only.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2CanvasUnderlay = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  /**
   * @param {HTMLElement} parent - container (position:relative)
   * @param {object} tf - transform dùng chung
   * @param {number} width, height - pixel
   */
  function createCanvasUnderlay(parent, tf, width, height) {
    const canvas = document.createElement('canvas');
    canvas.className = 'sim2-canvas';
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;';
    // chèn ĐẦU để nằm dưới svg
    parent.insertBefore(canvas, parent.firstChild);
    const ctx = canvas.getContext('2d');

    function clear() {
      ctx.clearRect(0, 0, width, height);
    }

    /** Vẽ trail (mảng điểm world) thành đường liền. */
    function drawTrail(points, opts) {
      opts = opts || {};
      if (!points || points.length < 2) return;
      ctx.beginPath();
      points.forEach((p, i) => {
        const s = tf.toScreen(p);
        if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
      });
      ctx.strokeStyle = opts.stroke || 'rgba(80,140,255,0.7)';
      ctx.lineWidth = opts.width != null ? opts.width : 1.5;
      ctx.stroke();
    }

    /** Chấm tròn world (pixel radius). */
    function dot(worldPt, opts) {
      opts = opts || {};
      const s = tf.toScreen(worldPt);
      ctx.beginPath();
      ctx.arc(s.x, s.y, opts.r || 2, 0, Math.PI * 2);
      ctx.fillStyle = opts.fill || 'rgba(80,140,255,0.9)';
      ctx.fill();
    }

    /** Đoạn world A→B (vector field). */
    function segment(a, b, opts) {
      opts = opts || {};
      const pa = tf.toScreen(a), pb = tf.toScreen(b);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = opts.stroke || 'rgba(80,140,255,0.6)';
      ctx.lineWidth = opts.width != null ? opts.width : 1;
      ctx.stroke();
    }

    function dispose() {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    return { canvas, ctx, clear, drawTrail, dot, segment, dispose };
  }

  return { createCanvasUnderlay };
});
