/**
 * probe-targets.js — PURE config (DEV-ONLY) giải quyết "selector ambiguity" của
 * route-map: mọi readout dùng `.sim2-readout-value` nên KHÔNG phân biệt được hàng.
 * Bảng này map mỗi route B-eligible → control slider để drive + chỉ số hàng readout
 * (rowIndex, 0-based, xác định theo thứ tự setReadout trong source sim) + expectSign.
 *
 * rowIndex xác minh trực tiếp từ js/sim2/sims/*.js (thứ tự mảng setReadout cố định).
 * Đây là phần CẤU HÌNH của harness probe — KHÔNG sửa sim. Giải đáp:
 *  - selector ambiguity: dùng rowIndex thay cho .sim2-readout-value mơ hồ.
 *  - ch2-3-2 sim2: readout gearOmega2 in dạng CÓ DẤU (âm cho bánh răng ngoài) → raw
 *    delta âm, nhưng route-map expectSign "+" nói về ĐỘ LỚN. Để tránh mismatch giả,
 *    target sim2 dùng beltV (dương, tăng theo r1 → +). Bản sim3 đo gearOmega2 thô (-).
 *
 * Chỉ liệt kê route bMode ∈ {monotonic, local-monotonic}. Route a-only/scene-delta
 * KHÔNG có ở đây → runner ghi bSkipped.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SimProbeTargets = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  // Sim2 DOM targets: drive slider `control` low→high, đo hàng readout `rowIndex`.
  // lo/hi (tuỳ chọn) ép biên slider cho local-monotonic (tránh điểm kỳ dị/cực trị).
  const SIM2 = {
    'ch1-1-3': [{ control: 'F', rowIndex: 1, key: 'Fx', expectSign: '+' }],
    'ch1-1-4': [{ control: 'F', rowIndex: 2, key: 'M', expectSign: '+' }],
    'ch1-1-6': [{ control: 'd', rowIndex: 2, key: 'M_couple', expectSign: '+' }],
    'ch1-1-8': [
      { control: 'P', rowIndex: 2, key: 'Ra', expectSign: '+' },
      { control: 'P', rowIndex: 3, key: 'Rb', expectSign: '+' }
    ],
    // local-monotonic: alpha trong [5,75] tránh α→90° singularity.
    'ch1-3-2': [{ control: 'alpha', rowIndex: 2, key: 'T', expectSign: '+', lo: 5, hi: 75 }],
    'ch1-3-6': [{ control: 'P', rowIndex: 3, key: 'M_ngam', expectSign: '+' }],
    // local-monotonic: mu trong [0.1,1.0], phi=atan(mu) đơn điệu tăng (không cực trị).
    'ch1-5-3': [{ control: 'mu', rowIndex: 1, key: 'phi', expectSign: '+', lo: 0.1, hi: 1.0 }],
    // beltV (dương) thay gearOmega2 (có dấu) — xem ghi chú đầu file.
    'ch2-3-2': [{ control: 'r1', rowIndex: 4, key: 'beltV', expectSign: '+' }],
    'ch2-5-3': [{ control: 'omega', rowIndex: 2, key: 'vM', expectSign: '+' }],
    'ch3-1-3': [
      { control: 'a', rowIndex: 2, key: 'theta', expectSign: '+' },
      { control: 'a', rowIndex: 1, key: 'inertiaForce', expectSign: '-' }
    ],
    'ch3-2-2': [{ control: 'F', rowIndex: 2, key: 'a', expectSign: '+' }],
    'ch3-2-3': [{ control: 'F', rowIndex: 2, key: 'pairMag', expectSign: '+' }],
    'ch3-3-1': [{ control: 'k', rowIndex: 2, key: 'omega', expectSign: '+' }],
    'ch3-5-2': [{ control: 'F', rowIndex: 2, key: 'J', expectSign: '+' }],
    // omega ~ 1/r² → tăng r làm omega giảm → expectSign "-".
    'ch3-5-3': [{ control: 'r', rowIndex: 2, key: 'omega', expectSign: '-' }],
    'ch3-5-4': [{ control: 'F', rowIndex: 2, key: 'W', expectSign: '+' }]
  };

  // Sim3 targets: drive slider Sim2 `control` low→high, đo field trong __SIM3_DEBUG__.
  // field = đường dẫn sau `].` (vd "gearOmega2", "physics.sampleVelocity.magnitude", "aCor.mag").
  const SIM3 = {
    'ch1-5-3#sim3': [{ control: 'mu', field: 'phiDeg', expectSign: '+', lo: 0.1, hi: 1.0 }],
    'ch2-3-2#sim3': [{ control: 'r1', field: 'gearOmega2', expectSign: '-' }],
    'ch2-5-3#sim3': [{ control: 'omega', field: 'physics.sampleVelocity.magnitude', expectSign: '+' }],
    'ch3-1-3#sim3': [{ control: 'a', field: 'thetaDeg', expectSign: '+' }],
    'ch3-5-3#sim3': [{ control: 'r', field: 'omega', expectSign: '-' }]
  };

  function targetsFor(routeKey) {
    if (SIM3[routeKey]) return { engine: 'sim3', targets: SIM3[routeKey] };
    if (SIM2[routeKey]) return { engine: 'sim2', targets: SIM2[routeKey] };
    return null;
  }

  return { SIM2, SIM3, targetsFor };
});
