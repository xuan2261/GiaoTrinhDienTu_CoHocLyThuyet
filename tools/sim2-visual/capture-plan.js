/**
 * capture-plan — logic THUẦN (Node + browser, UMD): từ manifest + bảng phân loại
 * runtime → danh sách job chụp ảnh + tên file kỳ vọng. KHÔNG đoán static/dynamic,
 * KHÔNG hardcode count (lấy từ manifest). Dùng chung bởi capture spec + contact-sheet.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2CapturePlan = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  const DEFAULT_N1 = 60;
  const DEFAULT_N2 = 120;

  /** section suy từ id: bỏ tiền tố "ch{chapter}-" → thay "-" bằng "." (ch1-6-3 → 6.3). */
  function sectionOf(route, chapter) {
    return String(route).replace(new RegExp('^ch' + chapter + '-'), '').replace(/-/g, '.');
  }

  /**
   * @param {Array<{id,chapter,name}>} manifest - nguồn route + count
   * @param {Object<string,'static'|'dynamic'>} classifyMap - phân loại runtime (mặc định static)
   * @param {{stepDefaults?:{N1,N2}, overrides?:Object<string,{N1,N2}>,
   *          interactionTargets?:Object<string,{kind:'slider'|'drag',control?,selector?,lo?,hi?}>}} [opts]
   * @returns {Array<{route,chapter,section,name,kind,shots:Array<{label,frame}>}>}
   */
  function buildCapturePlan(manifest, classifyMap, opts) {
    classifyMap = classifyMap || {};
    opts = opts || {};
    const sd = opts.stepDefaults || {};
    const overrides = opts.overrides || {};
    const interactionTargets = opts.interactionTargets || {};
    const dN1 = sd.N1 != null ? sd.N1 : DEFAULT_N1;
    const dN2 = sd.N2 != null ? sd.N2 : DEFAULT_N2;

    return manifest.map(function(r) {
      const kind = classifyMap[r.id] === 'dynamic' ? 'dynamic' : 'static';
      let shots;
      if (kind === 'dynamic') {
        const ov = overrides[r.id] || {};
        const N1 = ov.N1 != null ? ov.N1 : dN1;
        const N2 = ov.N2 != null ? ov.N2 : dN2;
        shots = [
          { label: 't0', frame: 0 },
          { label: 'mid', frame: N1 },
          { label: 'end', frame: N2 }
        ];
      } else {
        shots = [
          { label: 'init', frame: 0 },
          { label: 'live', frame: null }
        ];
      }
      // Interaction-far: route có entry → thêm 1 shot tương tác (KHÔNG có frame; spec set
      // control/drag handle tới biên XA init runtime rồi chụp). Áp cho cả static lẫn dynamic.
      const it = interactionTargets[r.id];
      if (it && it.kind === 'slider') {
        shots = shots.concat([{
          label: 'slider-far', kind: 'slider',
          control: it.control,
          lo: it.lo != null ? it.lo : null,
          hi: it.hi != null ? it.hi : null
        }]);
      } else if (it && it.kind === 'drag') {
        shots = shots.concat([{
          label: 'drag-far', kind: 'drag',
          selector: it.selector
        }]);
      }
      return {
        route: r.id,
        chapter: r.chapter,
        section: sectionOf(r.id, r.chapter),
        name: r.name,
        kind: kind,
        shots: shots
      };
    });
  }

  /** Tên file artifact dùng chung capture + sheet: "<route>__<label>.png". */
  function artifactName(shot) {
    return shot.route + '__' + shot.label + '.png';
  }

  return { buildCapturePlan, artifactName, sectionOf };
});
