(function initCentroidReasoning(global) {
  'use strict';

  const physics = global.SimPhysicsStatics;
  const plate = { area: 24, cx: 3, cy: 2 };
  const hole = { area: Math.PI, cx: 4.5, cy: 2.5 };
  const centroid = physics && physics.centroidWithHole(plate, hole);
  const steps = Array.from(document.querySelectorAll('[data-step]'));
  const previous = document.querySelector('[data-step-previous]');
  const next = document.querySelector('[data-step-next]');
  const keyboardRegion = document.querySelector('[data-centroid-keyboard]');
  const formula = document.querySelector('[data-centroid-formula]');
  const holeShape = document.querySelector('[data-centroid-hole]');
  const holeLabel = document.querySelector('[data-hole-label]');
  const centroidMark = document.querySelector('[data-centroid-mark]');
  const centroidLabel = document.querySelector('[data-centroid-label]');
  const guideX = document.querySelector('[data-centroid-guide-x]');
  const guideY = document.querySelector('[data-centroid-guide-y]');
  let current = 0;

  const formulas = [
    'A₁ = 6 × 4 = 24 cm²; C₁ = (3; 2) cm.',
    'A₀ = −π cm²; C₀ = (4,5; 2,5) cm.',
    'ΣAx = 24×3 − π×4,5; ΣAy = 24×2 − π×2,5.',
    `C = (${centroid.cx.toFixed(2)}; ${centroid.cy.toFixed(2)}) cm; A = ${centroid.area.toFixed(2)} cm².`
  ];

  function setHidden(element, hidden) {
    if (!element) return;
    if (hidden) element.setAttribute('hidden', '');
    else element.removeAttribute('hidden');
  }

  function render() {
    steps.forEach((step, index) => {
      if (index === current) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    previous.disabled = current === 0;
    next.disabled = current === steps.length - 1;
    formula.textContent = formulas[current];
    setHidden(holeShape, current < 1);
    setHidden(holeLabel, current < 1);
    const showCentroid = current >= 3;
    setHidden(centroidMark, !showCentroid);
    setHidden(centroidLabel, !showCentroid);
    setHidden(guideX, !showCentroid);
    setHidden(guideY, !showCentroid);
    keyboardRegion.setAttribute('aria-label', `Bước ${current + 1} trên ${steps.length}. ${formulas[current]} Dùng mũi tên trái và phải để đổi bước.`);
  }

  function goTo(index) {
    current = Math.max(0, Math.min(steps.length - 1, index));
    render();
  }

  function keydown(event) {
    const actions = {
      ArrowLeft: () => goTo(current - 1),
      ArrowRight: () => goTo(current + 1),
      Home: () => goTo(0),
      End: () => goTo(steps.length - 1)
    };
    if (!actions[event.key]) return;
    event.preventDefault();
    actions[event.key]();
  }

  const controller = global.MediaPilotLoader.createController({
    mediaId: 'media-ch1-centroid-steps',
    readyMessage: 'Bốn bước sẵn sàng. Dùng nút hoặc phím mũi tên trái và phải.',
    errorMessage: 'Không thể khởi tạo phép tính. Đang dùng lời giải tĩnh.',
    mount() {
      if (!physics || typeof physics.centroidWithHole !== 'function' || !centroid) throw new Error('centroid-helper-missing');
      previous.addEventListener('click', () => goTo(current - 1));
      next.addEventListener('click', () => goTo(current + 1));
      keyboardRegion.addEventListener('keydown', keydown);
      render();
      return {
        dispose() {
          keyboardRegion.removeEventListener('keydown', keydown);
        }
      };
    }
  });

  controller.start();
})(window);
