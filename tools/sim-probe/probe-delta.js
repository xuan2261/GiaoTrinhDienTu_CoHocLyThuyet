/**
 * probe-delta.js — PURE helpers cho interaction-probe (DEV-ONLY triage harness).
 * Không DOM, không Playwright → require được trong Node thuần (unit test) và browser.
 * UMD guard giữ pattern chung với js/sim2/core/*.
 *
 * Trách nhiệm:
 *  - computeDelta/signOf/parseReadout: lõi đo Δ + dấu + bóc số từ chuỗi readout.
 *  - midValue/isLive: Probe A (liveness).
 *  - compareSign: Probe B (monotonic sign khớp physics).
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SimProbeDelta = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  // Ngưỡng quanh 0 cho dấu — nhỏ để không nuốt thay đổi vật lý thật, đủ lớn để
  // bỏ qua nhiễu float khi readout chỉ in vài chữ số thập phân.
  const DEFAULT_EPSILON = 1e-6;

  // Unicode minus U+2212 (−) khác ASCII hyphen-minus (-). Readout vật lý dùng
  // dấu trừ typographic → phải chuẩn hoá trước khi parseFloat.
  const UNICODE_MINUS = '−';

  /** Hiệu số sau − trước. Non-numeric → NaN (caller coi là finding/parse fail). */
  function computeDelta(before, after) {
    const a = Number(before), b = Number(after);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
    return b - a;
  }

  /** Dấu của delta: "+" | "-" | "0" (|delta|<=epsilon → "0"; NaN → "0"). */
  function signOf(delta, epsilon) {
    const eps = epsilon == null ? DEFAULT_EPSILON : epsilon;
    if (!Number.isFinite(delta)) return '0';
    if (Math.abs(delta) <= eps) return '0';
    return delta > 0 ? '+' : '-';
  }

  /**
   * Bóc số đầu tiên (có dấu) từ chuỗi readout: "12 N·m", "ω = 2.5 rad/s",
   * "−3.0" (unicode minus), "M = 12", "Cx = −2.70 m". Trả NaN nếu không có số.
   */
  function parseReadout(str) {
    if (str == null) return NaN;
    const s = String(str).replace(new RegExp(UNICODE_MINUS, 'g'), '-');
    // Khớp số có dấu đầu tiên: optional +/-, digits, optional . digits.
    // Cho phép dạng .5 và 5. (hiếm) — \d*\.?\d+ phủ phần thập phân.
    const m = s.match(/[+-]?(?:\d+\.?\d*|\.\d+)/);
    if (!m) return NaN;
    const v = parseFloat(m[0]);
    return Number.isFinite(v) ? v : NaN;
  }

  /**
   * Giá trị đại diện "giữa" của slider, snap về step gần nhất trong [min,max].
   * Dùng cho Probe A: đẩy control tới vị trí khác biệt rõ so với min để đo Δ.
   */
  function midValue(min, max, step) {
    const lo = Number(min), hi = Number(max);
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return NaN;
    if (hi <= lo) return lo;
    const mid = (lo + hi) / 2;
    const st = Number(step);
    if (!Number.isFinite(st) || st <= 0) return mid;
    const snapped = lo + Math.round((mid - lo) / st) * st;
    // Kẹp trong biên (tránh lệch ra ngoài do round).
    if (snapped < lo) return lo;
    if (snapped > hi) return hi;
    // Làm sạch sai số float tích luỹ (vd 0.30000000000000004).
    return Math.round(snapped * 1e8) / 1e8;
  }

  /** Control "sống" khi |delta| > epsilon (mặc định DEFAULT_EPSILON). */
  function isLive(delta, epsilon) {
    const eps = epsilon == null ? DEFAULT_EPSILON : epsilon;
    if (!Number.isFinite(delta)) return false;
    return Math.abs(delta) > eps;
  }

  /**
   * So dấu quan sát với dấu kỳ vọng (Probe B). Trả boolean match.
   * - expectSign null/undefined → null (không có kỳ vọng → không kết luận).
   * - observed hoặc expect không hợp lệ → false.
   * Hợp lệ: "+","-","0".
   */
  function compareSign(observedSign, expectSign) {
    if (expectSign == null) return null;
    const valid = { '+': 1, '-': 1, '0': 1 };
    if (!valid[observedSign] || !valid[expectSign]) return false;
    return observedSign === expectSign;
  }

  return {
    DEFAULT_EPSILON,
    computeDelta, signOf, parseReadout,
    midValue, isLive,
    compareSign
  };
});
