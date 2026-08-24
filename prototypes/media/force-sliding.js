(function initForceSliding(global) {
  'use strict';

  const image = document.querySelector('[data-animated-image]');
  const controls = document.querySelector('[data-force-controls]');
  const staticButton = document.querySelector('[data-force-static]');
  const retryButton = document.querySelector('[data-force-retry]');

  const controller = global.MediaPilotLoader.createController({
    mediaId: 'media-ch1-force-sliding',
    readyMessage: 'Ảnh động đang chạy. Có thể chuyển sang ảnh tĩnh bất kỳ lúc nào.',
    errorMessage: 'Ảnh động không tải được. Đang dùng poster tĩnh.',
    async mount() {
      const source = image.dataset.gifSrc;
      if (!source) throw new Error('missing-gif-source');
      await global.MediaPilotLoader.waitForImage(image, source);
      controls.hidden = false;
      return {
        dispose() {
          controls.hidden = true;
          image.removeAttribute('src');
        }
      };
    }
  });

  staticButton.addEventListener('click', () => {
    controller.dispose();
    controller.showFallback('Đã chuyển sang poster tĩnh theo lựa chọn của người học.');
  });

  retryButton.addEventListener('click', () => controller.start());
  controller.showFallback('Đang dùng poster tĩnh. Chọn Dùng ảnh động để phát minh họa.');
})(window);
