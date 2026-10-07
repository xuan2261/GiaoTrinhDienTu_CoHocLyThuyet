/**
 * Transform world→screen DÙNG CHUNG cho mọi tầng (SVG, overlay, canvas).
 * scale = min(screenW/worldW, screenH/worldH) giữ tỉ lệ; flip-y; tự căn giữa.
 * UMD: browser → window.Sim2Transform; Node → module.exports.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2Transform = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  /**
   * @param {{worldBox:{minX,minY,maxX,maxY}, screenBox:{x,y,width,height}}} opts
   * @returns {{toScreen, toWorld, scale, worldBox, screenBox}}
   */
  function makeTransform(opts) {
    const wb = opts.worldBox;
    const sb = opts.screenBox;
    const worldW = wb.maxX - wb.minX || 1;
    const worldH = wb.maxY - wb.minY || 1;

    const scale = Math.min(sb.width / worldW, sb.height / worldH);
    // Căn giữa world trong screenBox sau khi scale.
    const offsetX = sb.x + (sb.width - scale * worldW) / 2;
    const offsetY = sb.y + (sb.height - scale * worldH) / 2;

    function toScreen(p) {
      return {
        x: offsetX + (p.x - wb.minX) * scale,
        y: offsetY + (wb.maxY - p.y) * scale // flip-y
      };
    }

    function toWorld(s) {
      return {
        x: wb.minX + (s.x - offsetX) / scale,
        y: wb.maxY - (s.y - offsetY) / scale
      };
    }

    return { toScreen, toWorld, scale, worldBox: wb, screenBox: sb };
  }

  return { makeTransform };
});
