(function() {
'use strict';

const UNIT_RULES = [
  [/xg|yg|x_c|ic_|\bx\b|\by\b|x\(t\)|x0|x1|x2|dịch|lệch|hình chiếu|đường trục|s lỗ/i, 'm'],
  [/thời gian|time|^t$/i, 's'],
  [/omega|ω/i, 'rad/s'],
  [/phi|epsilon|theta|góc|alpha|α/i, '°'],
  [/moment|^m[o0]$|ΣM|n·m/i, 'N·m'],
  [/force|load|^f$|rx\/ry|tải|lực/i, 'N'],
  [/mass|khối lượng|^m$/i, 'kg'],
  [/speed|velocity|\bv\b|v\(|v1|v2|tốc/i, 'm/s'],
  [/accel|gia tốc|^a$/i, 'm/s²'],
  [/động lượng|p trước|p sau|Δp|^p$/i, 'kg·m/s'],
  [/\bl\b|angular|momentum/i, 'kg·m²/s'],
  [/energy|năng lượng|^e$|^k$|^t$|^v$/i, 'J'],
  [/sai số|error|độ nhiễu/i, '%'],
  [/điểm|score/i, '%']
];

const DISCRETE_LABELS = [
  [/loại liên kết|link type/i, 'Liên kết đã chọn'],
  [/bài toán|problem/i, 'Bài mẫu'],
  [/bước giải|step/i, 'Bước hiện tại']
];

function cleanNumber(value, digits) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  const precision = Number.isFinite(Number(digits)) ? Number(digits) : (Math.abs(n) >= 100 ? 1 : 2);
  return n.toFixed(precision).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

function stripPixel(value) {
  const text = String(value).trim();
  const match = text.match(/^(-?\d+(?:[.,]\d+)?)\s*px$/i);
  return match ? match[1].replace(',', '.') : text;
}

function inferUnit(label, key, unit) {
  const currentUnit = String(unit || '').trim();
  const text = `${label || ''} ${key || ''}`.trim();
  const rule = UNIT_RULES.find(([pattern]) => pattern.test(text));
  if (currentUnit && currentUnit.toLowerCase() !== 'px') return currentUnit;
  return rule ? rule[1] : '';
}

function discreteValue(label, key) {
  const text = `${label || ''} ${key || ''}`.trim();
  const rule = DISCRETE_LABELS.find(([pattern]) => pattern.test(text));
  return rule ? rule[1] : '';
}

/**
 * Format one learner-facing readout value with explicit semantic unit rules.
 * @param {*} value raw route value
 * @param {{label?: string, key?: string, unit?: string, kind?: string, digits?: number}} options
 * @returns {{value: string, unit: string, skip?: boolean}}
 */
function formatReadout(value, options) {
  const opts = options || {};
  if (/điểm đặt/i.test(String(opts.label || ''))) return { skip: true };
  const mapped = discreteValue(opts.label, opts.key);
  if (mapped) return { value: mapped, unit: '' };

  const unit = inferUnit(opts.label, opts.key, opts.unit);
  if (value === undefined || value === null || value === '') return { value: '—', unit };
  if (value === 'hold') return { value: 'bám', unit: '' };
  if (value === 'slip') return { value: 'trượt', unit: '' };

  if (typeof value === 'object') {
    const x = Number(value.x);
    const y = Number(value.y);
    if (Number.isFinite(x) && Number.isFinite(y)) return { value: `(${cleanNumber(x, opts.digits)}; ${cleanNumber(y, opts.digits)})`, unit };
    return { value: '—', unit };
  }

  const stripped = stripPixel(value);
  if (Number.isFinite(Number(stripped))) return { value: cleanNumber(stripped, opts.digits), unit };
  if (/^\(?-?\d+(?:\.\d+)?\s*;\s*-?\d+(?:\.\d+)?\)?$/.test(stripped)) return { value: stripped, unit };
  return { value: stripped, unit };
}

window.SimReadoutFormat = { formatReadout, inferUnit };
})();
