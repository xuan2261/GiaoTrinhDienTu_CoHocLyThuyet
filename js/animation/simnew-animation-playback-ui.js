/**
 * SimNew Animation — PlaybackUI: DOM controls for play/pause/speed/scrubber.
 * Creates and manages playback controls for an Animator + Timeline.
 */
(function(root) {
'use strict';

class PlaybackUI {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.container - DOM element to attach controls
   * @param {Animator} opts.animator
   * @param {Timeline} opts.timeline
   * @param {Function} opts.onScrub - fn(timeMs)
   */
  constructor(opts) {
    opts = opts || {};
    this.container = opts.container || document.body;
    this.animator = opts.animator || null;
    this.timeline = opts.timeline || null;
    this.onScrub = opts.onScrub || null;

    this._elements = {};
    this._bound = {
      onPlayPause: this._onPlayPause.bind(this),
      onSpeedChange: this._onSpeedChange.bind(this),
      onScrubInput: this._onScrubInput.bind(this)
    };

    this._speedOptions = [0.25, 0.5, 1, 1.5, 2];

    this.build();
  }

  build() {
    const wrap = document.createElement('div');
    wrap.style.cssText = [
      'display:flex', 'align-items:center', 'gap:8px',
      'padding:8px 12px', 'background:rgba(9,26,51,0.9)',
      'border-radius:8px', 'font-family:Segoe UI,sans-serif',
      'font-size:12px', 'user-select:none'
    ].join(';');

    // Play/Pause
    const playBtn = document.createElement('button');
    playBtn.innerHTML = '&#9654;';
    playBtn.title = 'Play/Pause';
    playBtn.style.cssText = [
      'background:rgba(201,150,58,0.2)', 'border:1px solid #c9963a',
      'border-radius:4px', 'color:#c9963a', 'cursor:pointer',
      'font-size:14px', 'width:32px', 'height:32px',
      'display:flex', 'align-items:center', 'justify-content:center'
    ].join(';');
    playBtn.addEventListener('click', this._bound.onPlayPause);
    this._elements.playBtn = playBtn;
    wrap.appendChild(playBtn);

    // Time label
    const timeLabel = document.createElement('span');
    timeLabel.style.cssText = 'color:rgba(255,255,255,0.7);min-width:60px;text-align:center;';
    timeLabel.textContent = '0.0s / 0.0s';
    this._elements.timeLabel = timeLabel;
    wrap.appendChild(timeLabel);

    // Scrubber
    const scrubber = document.createElement('input');
    scrubber.type = 'range';
    scrubber.min = '0';
    scrubber.max = '1000';
    scrubber.value = '0';
    scrubber.style.cssText = [
      'flex:1', 'height:4px', 'cursor:pointer',
      'accent-color:#c9963a', 'background:rgba(255,255,255,0.1)',
      'border-radius:2px'
    ].join(';');
    scrubber.addEventListener('input', this._bound.onScrubInput);
    this._elements.scrubber = scrubber;
    wrap.appendChild(scrubber);

    // Speed selector
    const speedSelect = document.createElement('select');
    speedSelect.style.cssText = [
      'background:rgba(201,150,58,0.2)', 'border:1px solid #c9963a',
      'border-radius:4px', 'color:#c9963a', 'cursor:pointer',
      'font-size:11px', 'padding:4px 6px', 'height:28px'
    ].join(';');
    for (const s of this._speedOptions) {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s + 'x';
      speedSelect.appendChild(opt);
    }
    speedSelect.value = '1';
    speedSelect.addEventListener('change', this._bound.onSpeedChange);
    this._elements.speedSelect = speedSelect;
    wrap.appendChild(speedSelect);

    this.container.appendChild(wrap);
    this._elements.wrapper = wrap;

    // Sync with animator callbacks
    if (this.animator) {
      this.animator.onPause = (elapsed) => {
        playBtn.innerHTML = '&#9654;';
        this._updateTimeLabel(elapsed);
      };
      this.animator.onResume = () => {
        playBtn.innerHTML = '&#10074;&#10074;';
      };
      this.animator.onStart = () => {
        playBtn.innerHTML = '&#10074;&#10074;';
      };
      this.animator.onStop = () => {
        playBtn.innerHTML = '&#9654;';
        this._elements.scrubber.value = 0;
        this._updateTimeLabel(0);
      };
      this.animator.onTick = (dt, elapsed) => {
        this._updateTimeLabel(elapsed);
        if (this.timeline) {
          const ratio = elapsed / this.timeline.duration;
          this._elements.scrubber.value = Math.min(1000, Math.round(ratio * 1000));
        }
      };
    }
  }

  _onPlayPause() {
    if (!this.animator) return;
    if (this.animator.isRunning()) {
      this.animator.pause();
    } else {
      if (this.animator.getElapsed() === 0 && this.timeline) {
        this.animator._elapsed = 0;
      }
      this.animator.resume();
    }
  }

  _onSpeedChange(e) {
    const speed = parseFloat(e.target.value);
    if (this.animator) this.animator.setSpeed(speed);
  }

  _onScrubInput(e) {
    if (!this.timeline) return;
    const ratio = parseInt(e.target.value) / 1000;
    const time = ratio * this.timeline.duration;
    if (this.onScrub) this.onScrub(time);
    if (this.animator) {
      this.animator._elapsed = time;
    }
    this._updateTimeLabel(time);
  }

  _updateTimeLabel(elapsed) {
    if (!this.timeline) return;
    const cur = (elapsed / 1000).toFixed(1);
    const tot = (this.timeline.duration / 1000).toFixed(1);
    this._elements.timeLabel.textContent = `${cur}s / ${tot}s`;
  }

  /** Show/hide controls */
  setVisible(v) {
    if (this._elements.wrapper) {
      this._elements.wrapper.style.display = v ? 'flex' : 'none';
    }
  }

  /** Remove from DOM */
  destroy() {
    if (this._elements.wrapper && this._elements.wrapper.parentNode) {
      this._elements.wrapper.parentNode.removeChild(this._elements.wrapper);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlaybackUI;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.PlaybackUI = PlaybackUI;
}

})(typeof window !== 'undefined' ? window : this);
