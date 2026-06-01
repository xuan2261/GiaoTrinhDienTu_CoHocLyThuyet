/**
 * contact-sheet — logic THUẦN (Node → HTML string): từ list bản ghi ảnh đã chụp
 * sinh contact-sheet HTML (lưới thumbnail nhóm theo chương, mỗi route 1 hàng).
 * img src trỏ PNG cùng thư mục → mở offline. Escape text (nguồn nội bộ nhưng vẫn an toàn).
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2ContactSheet = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderFlags(flags) {
    if (!flags || !flags.length) return '';
    return flags.map(function(f) {
      const sev = f.severity === 'high' ? 'high' : (f.severity === 'low' ? 'low' : 'ok');
      return '<span class="flag flag-' + sev + '">' + esc(f.note || sev) + '</span>';
    }).join(' ');
  }

  function renderImages(images) {
    return (images || []).map(function(im) {
      return '<figure class="shot">' +
        '<img src="' + esc(im.src) + '" alt="' + esc(im.label) + '" loading="lazy">' +
        '<figcaption>' + esc(im.label) + '</figcaption>' +
        '</figure>';
    }).join('');
  }

  function renderRow(r) {
    return '<div class="route" id="' + esc(r.route) + '">' +
      '<div class="route-head">' +
        '<span class="badge">§' + esc(r.section) + '</span>' +
        '<span class="rid">' + esc(r.route) + '</span>' +
        '<span class="kind kind-' + esc(r.kind) + '">' + esc(r.kind) + '</span>' +
        '<span class="rname">' + esc(r.name) + '</span>' +
        '<span class="flags">' + renderFlags(r.flags) + '</span>' +
      '</div>' +
      '<div class="shots">' + renderImages(r.images) + '</div>' +
    '</div>';
  }

  /**
   * @param {Array<{route,chapter,section,name,kind,images:Array<{label,src}>,flags?:Array}>} records
   * @returns {string} HTML đầy đủ (1 <html>), mở offline được.
   */
  function renderContactSheet(records) {
    records = records || [];
    // Nhóm theo chương, giữ thứ tự xuất hiện.
    const groups = {};
    const order = [];
    for (const r of records) {
      const ch = r.chapter;
      if (!groups[ch]) { groups[ch] = []; order.push(ch); }
      groups[ch].push(r);
    }
    const body = order.map(function(ch) {
      const rows = groups[ch].map(renderRow).join('\n');
      return '<section class="chapter"><h2>Chương ' + esc(ch) + '</h2>' + rows + '</section>';
    }).join('\n');

    const style =
      'body{font-family:system-ui,Segoe UI,sans-serif;margin:16px;background:#f5f5f5;color:#222}' +
      'h1{font-size:20px}h2{font-size:16px;border-bottom:2px solid #ccc;padding-bottom:4px;margin-top:24px}' +
      '.route{background:#fff;border:1px solid #ddd;border-radius:6px;padding:8px;margin:8px 0}' +
      '.route-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;margin-bottom:6px}' +
      '.badge{background:#1565c0;color:#fff;border-radius:4px;padding:1px 6px;font-weight:600}' +
      '.rid{font-family:monospace;font-weight:600}' +
      '.kind{border-radius:4px;padding:1px 6px;font-size:11px}' +
      '.kind-static{background:#eceff1;color:#455a64}.kind-dynamic{background:#e8f5e9;color:#2e7d32}' +
      '.rname{color:#555}' +
      '.shots{display:flex;gap:8px;flex-wrap:wrap}' +
      '.shot{margin:0;text-align:center}' +
      '.shot img{max-width:260px;border:1px solid #ccc;background:#fff;display:block}' +
      '.shot figcaption{font-size:11px;color:#777}' +
      '.flag{border-radius:4px;padding:1px 6px;font-size:11px}' +
      '.flag-high{background:#ffcdd2;color:#b71c1c;font-weight:600}' +
      '.flag-low{background:#fff9c4;color:#827717}' +
      '.flag-ok{background:#eceff1;color:#607d8b}';

    return '<!DOCTYPE html>\n<html lang="vi"><head><meta charset="UTF-8">' +
      '<title>Contact sheet — sim2 visual QA</title><style>' + style + '</style></head>' +
      '<body><h1>Contact sheet — ' + records.length + ' route</h1>\n' +
      body + '\n</body></html>';
  }

  return { renderContactSheet, esc };
});
