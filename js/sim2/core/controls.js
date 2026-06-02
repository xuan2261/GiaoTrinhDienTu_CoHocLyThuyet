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

  /**
   * @param {HTMLElement} host
   * @param {object} opts
   * @param {Array<{id,label,min,max,step,value,unit,onInput}>} [opts.sliders]
   * @param {{playing,onPlay,onPause,onStep,onReset}} [opts.playback]
   * @returns {{root, setValue, setPlaying, dispose}}
   */
  function createControls(host, opts) {
    opts = opts || {};
    const cleanups = [];
    const timers = new Map();
    const sliderMap = {}; // id → { input, output, unit }

    function add(target, type, handler) {
      target.addEventListener(type, handler);
      cleanups.push(() => target.removeEventListener(type, handler));
    }

    const root = document.createElement('div');
    root.className = 'sim2-controls';

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
    for (const s of (opts.sliders || [])) {
      const wrap = document.createElement('div');
      wrap.className = 'sim2-slider';

      const lab = document.createElement('label');
      lab.className = 'sim2-slider-label';
      lab.textContent = s.label != null ? s.label : s.id;

      const input = document.createElement('input');
      input.type = 'range';
      input.min = s.min; input.max = s.max;
      input.step = s.step != null ? s.step : 1;
      input.value = s.value != null ? s.value : s.min;
      input.setAttribute('data-id', s.id);
      input.setAttribute('aria-label', s.label != null ? s.label : s.id);

      const output = document.createElement('output');
      output.className = 'sim2-output';
      output.textContent = fmtOut(s, input.value);

      add(input, 'input', () => {
        const v = parseFloat(input.value);
        output.textContent = fmtOut(s, input.value);
        markOutputChanged(output);
        if (typeof s.onInput === 'function') s.onInput(v);
      });

      wrap.appendChild(lab);
      wrap.appendChild(input);
      wrap.appendChild(output);
      root.appendChild(wrap);
      sliderMap[s.id] = { input, output, unit: s.unit };
    }

    // ─── Playback ───
    let playBtn = null, playing = false, pb = opts.playback;
    if (pb) {
      playing = !!pb.playing;
      const bar = document.createElement('div');
      bar.className = 'sim2-playback';

      playBtn = mkBtn('sim2-playpause', playing ? '⏸' : '▶', () => {
        setPlaying(!playing);
        if (playing) { if (pb.onPlay) pb.onPlay(); }
        else { if (pb.onPause) pb.onPause(); }
      });
      playBtn.setAttribute('aria-label', playing ? 'Tạm dừng' : 'Chạy');
      bar.appendChild(playBtn);

      bar.appendChild(mkBtn('sim2-step', '⏭', () => { if (pb.onStep) pb.onStep(); }));
      bar.appendChild(mkBtn('sim2-reset', '↺', () => {
        if (pb.onReset) pb.onReset();
        setPlaying(false);
      }));
      root.appendChild(bar);
    }

    function mkBtn(cls, glyph, onClick) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.textContent = glyph;
      add(b, 'click', onClick);
      return b;
    }

    host.appendChild(root);

    // ─── API ───
    function setValue(id, v) {
      const s = sliderMap[id];
      if (!s) return;
      s.input.value = v; // KHÔNG dispatch 'input' → không gọi onInput
      s.output.textContent = v + (s.unit ? ' ' + s.unit : '');
      markOutputChanged(s.output);
    }

    function setPlaying(bool) {
      if (!playBtn) return;
      playing = !!bool;
      playBtn.textContent = playing ? '⏸' : '▶';
      playBtn.setAttribute('aria-label', playing ? 'Tạm dừng' : 'Chạy');
    }

    function dispose() {
      for (const fn of cleanups) { try { fn(); } catch (e) { /* noop */ } }
      cleanups.length = 0;
      for (const id of timers.values()) clearTimeout(id);
      timers.clear();
      if (root.parentNode) root.parentNode.removeChild(root);
    }

    return { root, setValue, setPlaying, dispose };
  }

  return { createControls };
});
