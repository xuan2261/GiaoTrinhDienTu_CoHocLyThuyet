(function initFrictionConePrototype(global) {
  'use strict';

  const host = document.getElementById('friction-sim');
  const controller = global.MediaPilotLoader.createController({
    mediaId: 'media-ch1-friction-cone',
    readyMessage: 'Mô phỏng sẵn sàng. Hai slider và điểm kéo đều dùng được bằng bàn phím.',
    errorMessage: 'Không thể mount Sim2. Đang dùng sơ đồ tĩnh và phép tính mẫu.',
    mount() {
      const factory = global.SIM_MAP && global.SIM_MAP['ch1-5-3'];
      if (typeof factory !== 'function') throw new Error('canonical-sim-factory-missing');
      const instance = factory(host);
      if (!instance || typeof instance.dispose !== 'function') throw new Error('invalid-sim-instance');
      const sliders = host.querySelectorAll('input[type="range"]');
      if (sliders.length !== 2) {
        instance.dispose();
        throw new Error('expected-two-sliders');
      }
      host.querySelectorAll('.sim2-handle').forEach(handle => {
        handle.setAttribute('aria-describedby', 'friction-keyboard-help');
      });
      return instance;
    }
  });

  const help = document.createElement('p');
  help.id = 'friction-keyboard-help';
  help.className = 'sr-only';
  help.textContent = 'Dùng phím mũi tên để thay đổi vị trí. Giữ Shift để thay đổi nhanh hơn.';
  host.appendChild(help);
  controller.start();
})(window);
