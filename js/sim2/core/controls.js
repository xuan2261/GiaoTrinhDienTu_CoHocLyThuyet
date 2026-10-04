/**
 * Sim2Controls — control bar (slider + playback) đặt NGOÀI vùng vẽ SVG.
 * Mỗi slider kèm <output> value+đơn vị (cập nhật realtime trên 'input').
 * Playback: ▶/⏸ toggle + ⏭ step + ↺ reset. Mặc định start paused (playing:false).
 * setValue() set property KHÔNG bắn 'input' → chống vòng lặp drag→slider→onInput→drag.
 * dispose() gỡ sạch listener (bắn event sau dispose không gọi callback, không nổ).
 * Browser-only. UMD guard.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2Controls = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';
  let controlSerial = 0;


  /**
   * @param {HTMLElement} host
   * @param {object} opts
   * @param {Array<{id,label,min,max,step,value,unit,onInput}>} [opts.sliders]
   * @param {{playing,onPlay,onPause,onStep,onReset}} [opts.playback]
   * @returns {{root, setValue, setPlaying, dispose}}
   */
  function createControls(host, opts) {
    opts = opts || {};
    controlSerial += 1;
    const idPrefix = `sim2-controls-${controlSerial}`;
    const cleanups = [];
    const timers = new Map();
    const actionMap = {};
    const sliderMap = {}; // id → { input, output, unit }

    function add(target, type, handler) {
      target.addEventListener(type, handler);
      cleanups.push(() => target.removeEventListener(type, handler));
    }

    const root = document.createElement('div');
    root.className = 'sim2-controls';
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', 'Điều khiển mô phỏng');

    function fmtOut(s, value) {
      return value + (s.unit ? ' ' + s.unit : '');
    }

    function prefersReducedMotion() {
      return typeof window !== 'undefined' && window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function markOutputChanged(output) {
      if (prefersReducedMotion()) return;
      const oldId = timers.get(output);
      if (oldId) clearTimeout(oldId);
      output.classList.add('sim2-output-changed');
      const id = setTimeout(() => {
        output.classList.remove('sim2-output-changed');
        timers.delete(output);
      }, 450);
      timers.set(output, id);
    }

    // ─── Sliders ───
    for (const s of [...(opts.sliders || []).map(s => ({ ...s, range: true })), ...(opts.numbers || [])]) {
      const wrap = document.createElement('div');
      wrap.className = 'sim2-slider';

      const lab = document.createElement('label');
      lab.className = 'sim2-slider-label';
      lab.textContent = s.label != null ? s.label : s.id;

      const input = document.createElement('input');
      input.type = s.range ? 'range' : 'number';
      input.id = `${idPrefix}-${s.id}`;
      input.min = s.min; input.max = s.max;
      input.step = 'any';
      input.setAttribute('data-physical-step', String(s.step != null ? s.step : 1));
      input.value = s.value != null ? s.value : s.min;
      input.setAttribute('data-id', s.id);
      lab.htmlFor = input.id;

      const output = document.createElement('output');
      output.id = `${input.id}-output`;
      output.htmlFor = input.id;
      output.className = 'sim2-output';
      output.textContent = fmtOut(s, input.value);
      input.setAttribute('aria-describedby', output.id);

      const number = s.range ? document.createElement('input') : input;
      number.type = 'number';
      number.className = 'sim2-number-input';
      number.min = s.min; number.max = s.max; number.step = 'any';
      number.setAttribute('data-physical-step', String(s.step != null ? s.step : 1));
      number.value = input.value;
      if (s.range) {
        number.id = `${input.id}-number`;
        number.className = 'sim2-number-input';
        number.setAttribute('aria-label', `${s.label != null ? s.label : s.id}${s.unit ? ' (' + s.unit + ')' : ''}: nhập số`);
        number.setAttribute('data-number-for', s.id);
      }
      number.setAttribute('aria-describedby', output.id);
      let committed = Number(input.value);
      const configuredStep = Number(s.step);
      const keyboardStep = Number.isFinite(configuredStep) && configuredStep > 0 ? configuredStep : (Number(s.max) - Number(s.min)) / 100;
      function apply(source, commit, snapRange) {
        if (source.value === '' || !Number.isFinite(Number(source.value))) {
          if (commit) { number.value = committed; number.removeAttribute?.('aria-invalid'); }
          return;
        }
        let value = Number(source.value);
        const min = Number(s.min), max = Number(s.max);
        if (!commit && (value < min || value > max)) { number.setAttribute('aria-invalid', 'true'); return; }
        if (snapRange && Number.isFinite(configuredStep) && configuredStep > 0) value = min + Math.round((value - min) / configuredStep) * configuredStep;
        value = Math.max(min, Math.min(max, Number(value.toPrecision(14))));
        // Preserve finite decimals from analytical event/preset values; step is a
        // keyboard affordance, not a hidden second physics quantization layer.
        const changed = value !== committed;
        committed = value;
        input.value = value; number.value = value;
        number.removeAttribute?.('aria-invalid');
        output.textContent = fmtOut(s, value);
        markOutputChanged(output);
        if ((!commit || changed) && typeof s.onInput === 'function') s.onInput(value);
      }
      if (s.range) add(input, 'input', () => apply(input, false, true));
      // A numeric edit is a draft until blur/Enter commits the native change.
      // Rewriting value on each keystroke would eat decimals, signs and exponents.
      add(number, 'input', () => {
        const value = Number(number.value);
        const invalid = number.value !== '' && (!Number.isFinite(value) || value < Number(s.min) || value > Number(s.max));
        if (invalid) number.setAttribute('aria-invalid', 'true');
        else number.removeAttribute?.('aria-invalid');
      });
      add(number, 'change', () => apply(number, true));
      function keyboard(source, event) {
        if (event.key === 'Enter' && source === number) { event.preventDefault(); apply(number, true); return; }
        const directions = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
        if (!Object.hasOwn(directions, event.key) && event.key !== 'Home' && event.key !== 'End') return;
        // Home/End retain text-caret semantics in numeric drafts.
        if (source === number && ['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const base = Number.isFinite(Number(source.value)) && source.value !== '' ? Number(source.value) : committed;
        source.value = event.key === 'Home' ? s.min : event.key === 'End' ? s.max : base + directions[event.key] * keyboardStep;
        apply(source, true, false);
      }
      add(number, 'keydown', event => keyboard(number, event));
      if (s.range) add(input, 'keydown', event => keyboard(input, event));
      wrap.appendChild(lab);
      wrap.appendChild(input);
      if (number !== input) wrap.appendChild(number);
      wrap.appendChild(output);
      root.appendChild(wrap);
      sliderMap[s.id] = { input, number, output, unit: s.unit, commit(v) { committed = v; } };
    }

    for (const action of (opts.actions || [])) {
      const b = mkBtn('sim2-action', action.label, action.label, () => { if (action.onClick) action.onClick(); });
      b.setAttribute('data-action', action.id);
      actionMap[action.id] = b;
      root.appendChild(b);
    }

    // ─── Playback ───
    let playBtn = null, playing = false, pb = opts.playback;
    if (pb) {
      playing = !!pb.playing;
      const bar = document.createElement('div');
      bar.className = 'sim2-playback';

      playBtn = mkBtn('sim2-playpause', playing ? '⏸' : '▶', playing ? 'Tạm dừng' : 'Chạy', () => {
        setPlaying(!playing);
        if (playing) { if (pb.onPlay) pb.onPlay(); }
        else { if (pb.onPause) pb.onPause(); }
      });
      bar.appendChild(playBtn);

      bar.appendChild(mkBtn('sim2-step', '⏭', 'Tiến một bước', () => { if (pb.onStep) pb.onStep(); }));
      bar.appendChild(mkBtn('sim2-reset', '↺', 'Đặt lại mô phỏng', () => {
        if (pb.onReset) pb.onReset();
        setPlaying(false);
      }));
      root.appendChild(bar);
    }

    function mkBtn(cls, glyph, label, onClick) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.textContent = glyph;
      b.setAttribute('aria-label', label);
      b.title = label;
      add(b, 'click', onClick);
      return b;
    }

    host.appendChild(root);

    // ─── API ───
    function setValue(id, v) {
      const s = sliderMap[id];
      if (!s) return;
      if (!Number.isFinite(Number(v))) return;
      s.input.value = v; // KHÔNG dispatch 'input' → không gọi onInput
      s.number.value = v;
      s.commit(Number(v));
      s.output.textContent = v + (s.unit ? ' ' + s.unit : '');
      markOutputChanged(s.output);
    }

    function setActionLabel(id, label) {
      const action = actionMap[id];
      if (!action) return;
      action.textContent = label;
      action.setAttribute('aria-label', label);
      action.title = label;
    }

    function setPlaying(bool) {
      if (!playBtn) return;
      playing = !!bool;
      playBtn.textContent = playing ? '⏸' : '▶';
      playBtn.setAttribute('aria-label', playing ? 'Tạm dừng' : 'Chạy');
      playBtn.title = playing ? 'Tạm dừng' : 'Chạy';
    }

    function dispose() {
      for (const fn of cleanups) { try { fn(); } catch (e) { /* noop */ } }
      cleanups.length = 0;
      for (const id of timers.values()) clearTimeout(id);
      timers.clear();
      if (root.parentNode) root.parentNode.removeChild(root);
    }

    return { root, setValue, setActionLabel, setPlaying, dispose };
  }

  return { createControls };
});
