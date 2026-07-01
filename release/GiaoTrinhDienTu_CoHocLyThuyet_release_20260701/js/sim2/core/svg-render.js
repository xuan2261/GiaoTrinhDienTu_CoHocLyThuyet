/**
 * SVG render primitives — nhận transform `tf`, trả SVG node (toạ độ world→screen).
 * Browser-only (document.createElementNS). UMD guard cho an toàn khi require.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2SvgRender = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const node = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  /** Trộn hex về phía trắng theo tỉ lệ amt (0..1) — tạo stop sáng cho gradient chiều sâu. */
  function lighten(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (255 - r) * amt);
    g = Math.round(g + (255 - g) * amt);
    b = Math.round(b + (255 - b) * amt);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Chèn 1 lần vào <defs>: soft drop-shadow + gradient theo từng token Sim2Palette.
   * Shape dùng opts.depth (shadow) / opts.gradient='<token>' (fill gradient) tham chiếu các id này.
   * Giữ vector (arrow/line) PHẲNG — chỉ khối/bi/dầm có chiều sâu (chuẩn PhET: ít nhiễu).
   */
  function ensureDefs(svg) {
    if (svg.__sim2DefsReady) return;
    const defs = svg.querySelector('defs');
    if (!defs) return;
    const filt = el('filter', { id: 'sim2-shadow', x: '-20%', y: '-20%', width: '140%', height: '140%' });
    filt.appendChild(el('feDropShadow', {
      dx: 0, dy: 1, stdDeviation: 1.5, 'flood-color': '#1e293b', 'flood-opacity': 0.28
    }));
    defs.appendChild(filt);
    const pal = (typeof window !== 'undefined' && window.Sim2Palette) || null;
    if (pal) {
      for (const key in pal) {
        const base = pal[key];
        if (typeof base !== 'string' || base[0] !== '#') continue;
        const grad = el('linearGradient', { id: 'sim2-grad-' + key, x1: '0', y1: '0', x2: '1', y2: '1' });
        grad.appendChild(el('stop', { offset: '0%', 'stop-color': lighten(base, 0.45) }));
        grad.appendChild(el('stop', { offset: '100%', 'stop-color': base }));
        defs.appendChild(grad);
      }
    }
    svg.__sim2DefsReady = true;
  }

  /** Fill chiều sâu: gradient token nếu opts.gradient, else opts.fill / fallback. */
  function depthFill(opts, fallback) {
    if (opts.gradient) return 'url(#sim2-grad-' + opts.gradient + ')';
    return opts.fill || fallback;
  }

  /** Tạo <svg> + <defs> chứa arrow marker + shadow/gradient dùng chung. */
  function createSvg(width, height) {
    const svg = el('svg', {
      width, height,
      viewBox: `0 0 ${width} ${height}`,
      class: 'sim2-svg'
    });
    const defs = el('defs');
    // arrow marker (id duy nhất theo svg để tránh đụng khi nhiều sim)
    const markerId = 'sim2-arrow-' + Math.floor(width * 7 + height * 13);
    const marker = el('marker', {
      id: markerId, markerWidth: 10, markerHeight: 10,
      refX: 8, refY: 3, orient: 'auto', markerUnits: 'strokeWidth'
    });
    marker.appendChild(el('path', { d: 'M0,0 L8,3 L0,6 Z', fill: 'context-stroke' }));
    defs.appendChild(marker);
    svg.appendChild(defs);
    svg.__markerId = markerId;
    ensureDefs(svg); // shadow + gradient token → opts.depth/opts.gradient luôn resolve
    return svg;
  }

  /** Đường thẳng world A→B; opts.arrow=true gắn marker mũi tên. */
  function line(tf, a, b, opts) {
    opts = opts || {};
    const pa = tf.toScreen(a), pb = tf.toScreen(b);
    const ln = el('line', {
      x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y,
      stroke: opts.stroke || '#333',
      'stroke-width': opts.width != null ? opts.width : 2
    });
    if (opts.dash) ln.setAttribute('stroke-dasharray', opts.dash);
    if (opts.class) ln.setAttribute('class', opts.class);
    return ln;
  }

  /** Mũi tên vector world A→B (dùng marker của svg). */
  function arrow(tf, svg, a, b, opts) {
    opts = opts || {};
    const ln = line(tf, a, b, opts);
    ln.setAttribute('marker-end', `url(#${svg.__markerId})`);
    return ln;
  }

  /** Vòng tròn tại world center, bán kính theo world (nhân scale) hoặc pixel cố định. */
  function circle(tf, center, r, opts) {
    opts = opts || {};
    const c = tf.toScreen(center);
    const radius = opts.pixel ? r : r * tf.scale;
    const node = el('circle', {
      cx: c.x, cy: c.y, r: radius,
      fill: depthFill(opts, 'none'),
      stroke: opts.stroke || '#333',
      'stroke-width': opts.width != null ? opts.width : (opts.depth ? 2.5 : 2)
    });
    if (opts.depth) node.setAttribute('filter', 'url(#sim2-shadow)');
    if (opts.class) node.setAttribute('class', opts.class);
    return node;
  }

  /** Polyline/polygon từ mảng điểm world. closed=true → polygon. */
  function poly(tf, points, opts) {
    opts = opts || {};
    const pts = points.map(p => { const s = tf.toScreen(p); return `${s.x},${s.y}`; }).join(' ');
    const node = el(opts.closed ? 'polygon' : 'polyline', {
      points: pts,
      fill: depthFill(opts, (opts.closed ? 'rgba(80,140,255,0.15)' : 'none')),
      stroke: opts.stroke || '#333',
      'stroke-width': opts.width != null ? opts.width : (opts.depth ? 2.5 : 2)
    });
    if (opts.depth) node.setAttribute('filter', 'url(#sim2-shadow)');
    if (opts.class) node.setAttribute('class', opts.class);
    return node;
  }

  /** Path từ chuỗi điểm world → "M.. L.. L.." (smooth=false). */
  function path(tf, points, opts) {
    opts = opts || {};
    let d = '';
    points.forEach((p, i) => {
      const s = tf.toScreen(p);
      d += (i === 0 ? 'M' : 'L') + s.x.toFixed(2) + ',' + s.y.toFixed(2) + ' ';
    });
    const node = el('path', {
      d: d.trim(),
      fill: depthFill(opts, 'none'),
      stroke: opts.stroke || '#333',
      'stroke-width': opts.width != null ? opts.width : (opts.depth ? 2.5 : 2)
    });
    if (opts.depth) node.setAttribute('filter', 'url(#sim2-shadow)');
    if (opts.class) node.setAttribute('class', opts.class);
    return node;
  }

  return { NS, el, createSvg, ensureDefs, line, arrow, circle, poly, path };
});
