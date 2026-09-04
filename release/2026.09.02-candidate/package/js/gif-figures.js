(function initGifFigures(global) {
  'use strict';

  const STORAGE_KEY = 'gifMotionEnabled';
  const STATIC_TO_GIF = Object.freeze({
    'images/ch1/hinh-026.png': 'assets/gifs/ch1/hinh-1-06.gif',
    'images/ch1/hinh-033.png': 'assets/gifs/ch1/hinh-1-09.gif',
    'images/ch1/hinh-118.png': 'assets/gifs/ch1/hinh-1-28b.gif',
    'images/ch1/hinh-136.png': 'assets/gifs/ch1/hinh-1-34.gif',
    'images/ch1/hinh-138.png': 'assets/gifs/ch1/hinh-1-35.gif',
    'images/ch1/hinh-149.png': 'assets/gifs/ch1/hinh-1-minh-hoa-02.gif',
    'images/ch2/hinh-072.png': 'assets/gifs/ch2/hinh-2-07.gif',
    'images/ch2/hinh-080.png': 'assets/gifs/ch2/hinh-2-09.gif',
    'images/ch2/hinh-143.png': 'assets/gifs/ch2/hinh-2-15.gif',
    'images/ch2/hinh-147.png': 'assets/gifs/ch2/hinh-2-16.gif',
    'images/ch2/hinh-196.png': 'assets/gifs/ch2/hinh-2-22.gif',
    'images/ch2/hinh-219.png': 'assets/gifs/ch2/hinh-2-26.gif',
    'images/ch2/hinh-276.png': 'assets/gifs/ch2/hinh-2-34.gif',
    'images/ch3/hinh-101.png': 'assets/gifs/ch3/hinh-3-06.gif',
    'images/ch3/hinh-151.png': 'assets/gifs/ch3/hinh-3-10.gif',
    'images/ch3/hinh-169.png': 'assets/gifs/ch3/hinh-3-11.gif',
    'images/ch3/hinh-216.png': 'assets/gifs/ch3/hinh-3-17.gif',
    'images/ch3/hinh-225.png': 'assets/gifs/ch3/hinh-3-20.gif',
    'images/ch3/hinh-237.png': 'assets/gifs/ch3/hinh-3-21.gif',
    'images/ch3/hinh-244.png': 'assets/gifs/ch3/hinh-3-22.gif'
  });

  const IMAGE_TAG_PATTERN = /<img\b[^>]*>/gi;
  const SOURCE_ATTRIBUTE_PATTERN = /\bsrc=(["'])([^"']+)\1/i;
  const boundImages = new WeakSet();
  const motionQuery = typeof global.matchMedia === 'function'
    ? global.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  let storedPreference = null;
  try {
    storedPreference = global.localStorage.getItem(STORAGE_KEY);
  } catch (_error) {
    storedPreference = null;
  }

  let followsSystemPreference = storedPreference !== 'true' && storedPreference !== 'false';
  let motionEnabled = followsSystemPreference
    ? !(motionQuery && motionQuery.matches)
    : storedPreference === 'true';

  function transform(html) {
    if (typeof html !== 'string' || !html.includes('<img')) return html;

    return html.replace(IMAGE_TAG_PATTERN, tag => {
      if (/\bdata-gif-figure\b/i.test(tag)) return tag;
      const sourceMatch = tag.match(SOURCE_ATTRIBUTE_PATTERN);
      if (!sourceMatch) return tag;

      const staticSource = sourceMatch[2];
      const gifSource = STATIC_TO_GIF[staticSource];
      if (!gifSource) return tag;

      const selectedSource = motionEnabled ? gifSource : staticSource;
      let transformed = tag.replace(
        sourceMatch[0],
        `src=${sourceMatch[1]}${selectedSource}${sourceMatch[1]}`
      );
      transformed = transformed.replace(
        /^<img\b/i,
        `<img data-gif-figure data-static-src="${staticSource}" data-gif-src="${gifSource}"`
      );
      if (!/\bdecoding=/i.test(transformed)) {
        transformed = transformed.replace(/>$/, ' decoding="async">');
      }
      return transformed;
    });
  }

  function selectedSource(image) {
    if (motionEnabled && image.dataset.gifFailed !== 'true') {
      return image.dataset.gifSrc;
    }
    return image.dataset.staticSrc;
  }

  function applyImageState(image) {
    const source = selectedSource(image);
    if (source && image.getAttribute('src') !== source) {
      image.setAttribute('src', source);
    }
  }

  function handleImageError(event) {
    const image = event.currentTarget;
    if (
      image.dataset.gifSrc &&
      image.dataset.staticSrc &&
      image.getAttribute('src') === image.dataset.gifSrc
    ) {
      image.dataset.gifFailed = 'true';
      image.setAttribute('src', image.dataset.staticSrc);
    }
  }

  function mount(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    root.querySelectorAll('img[data-gif-figure]').forEach(image => {
      if (!boundImages.has(image)) {
        image.addEventListener('error', handleImageError);
        boundImages.add(image);
      }
      applyImageState(image);
    });
  }

  function sync(root) {
    mount(root || global.document);
  }

  function updateControl() {
    const button = global.document && global.document.getElementById('gifMotionBtn');
    if (!button) return;

    button.setAttribute('aria-pressed', String(motionEnabled));
    button.title = motionEnabled ? 'Tắt hoạt ảnh GIF' : 'Bật hoạt ảnh GIF';
    const icon = button.querySelector('.gif-motion-icon');
    const state = button.querySelector('.gif-motion-state');
    if (icon) icon.textContent = motionEnabled ? '■' : '▶';
    if (state) state.textContent = motionEnabled ? 'Bật' : 'Tắt';
  }

  function persistPreference() {
    try {
      global.localStorage.setItem(STORAGE_KEY, String(motionEnabled));
    } catch (_error) {
      // The current page still updates when storage is unavailable.
    }
  }

  function setEnabled(enabled, persist) {
    motionEnabled = Boolean(enabled);
    if (persist !== false) {
      followsSystemPreference = false;
      persistPreference();
    }
    updateControl();
    sync(global.document);
    return motionEnabled;
  }

  function toggle() {
    return setEnabled(!motionEnabled, true);
  }

  function handleSystemMotionChange(event) {
    if (followsSystemPreference) {
      setEnabled(!event.matches, false);
    }
  }

  function initializeControl() {
    const button = global.document.getElementById('gifMotionBtn');
    if (button) button.addEventListener('click', toggle);
    updateControl();
  }

  if (motionQuery) {
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleSystemMotionChange);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(handleSystemMotionChange);
    }
  }

  global.GifFigures = Object.freeze({
    manifest: STATIC_TO_GIF,
    transform,
    mount,
    sync,
    setEnabled,
    toggle,
    isEnabled: () => motionEnabled
  });

  global.document.addEventListener('DOMContentLoaded', initializeControl);
})(window);
