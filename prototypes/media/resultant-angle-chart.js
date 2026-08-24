(function initResultantChart(global) {
  'use strict';

  const F1 = 80;
  const F2 = 60;
  const canvas = document.querySelector('[data-resultant-chart]');
  const slider = document.querySelector('[data-angle-control]');
  const angleOutput = document.getElementById('angle-output');
  const resultantOutput = document.getElementById('resultant-output');
  const reset = document.querySelector('[data-chart-reset]');
  const physics = global.SimPhysicsStatics;

  function resultant(angleDeg) {
    const components = physics.resolveForceComponents(F2, angleDeg);
    return Math.hypot(F1 + components.fx, components.fy);
  }

  function colors() {
    const style = getComputedStyle(document.documentElement);
    return {
      ink: style.getPropertyValue('--media-ink').trim(),
      muted: style.getPropertyValue('--media-muted').trim(),
      line: style.getPropertyValue('--media-line').trim(),
      resultant: style.getPropertyValue('--media-resultant').trim(),
      paper: style.getPropertyValue('--media-paper').trim()
    };
  }

  function draw(angleDeg) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas-context-unavailable');
    const c = colors();
    const width = canvas.width;
    const height = canvas.height;
    const plot = { left: 64, top: 24, right: width - 24, bottom: height - 56 };
    const x = angle => plot.left + angle / 180 * (plot.right - plot.left);
    const y = value => plot.bottom - value / 150 * (plot.bottom - plot.top);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = c.paper;
    ctx.fillRect(0, 0, width, height);
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.strokeStyle = c.line;
    ctx.fillStyle = c.muted;
    ctx.lineWidth = 1;

    for (let value = 0; value <= 150; value += 30) {
      ctx.beginPath();
      ctx.moveTo(plot.left, y(value));
      ctx.lineTo(plot.right, y(value));
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(String(value), plot.left - 12, y(value) + 6);
    }
    for (let angle = 0; angle <= 180; angle += 30) {
      ctx.beginPath();
      ctx.moveTo(x(angle), plot.top);
      ctx.lineTo(x(angle), plot.bottom);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(`${angle}°`, x(angle), plot.bottom + 28);
    }

    ctx.strokeStyle = c.resultant;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let angle = 0; angle <= 180; angle += 2) {
      const px = x(angle);
      const py = y(resultant(angle));
      if (angle === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const value = resultant(angleDeg);
    ctx.fillStyle = c.resultant;
    ctx.beginPath();
    ctx.arc(x(angleDeg), y(value), 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.ink;
    ctx.textAlign = 'left';
    ctx.font = '700 18px "Segoe UI", sans-serif';
    ctx.fillText(`R = ${value.toFixed(1)} N`, Math.min(x(angleDeg) + 16, width - 152), Math.max(y(value) - 12, 28));
    canvas.setAttribute('aria-label', `Biểu đồ hợp lực. Tại góc ${angleDeg} độ, R bằng ${value.toFixed(1)} newton.`);
    return value;
  }

  function update() {
    const angle = Number(slider.value);
    const value = draw(angle);
    angleOutput.textContent = `${angle}°`;
    resultantOutput.textContent = `R = ${value.toFixed(1)} N`;
    slider.setAttribute('aria-valuetext', `${angle} độ, hợp lực ${value.toFixed(1)} newton`);
  }

  const controller = global.MediaPilotLoader.createController({
    mediaId: 'media-ch1-resultant-angle',
    keepFallbackVisible: true,
    readyMessage: 'Biểu đồ sẵn sàng. Dùng phím mũi tên để đổi góc.',
    mount() {
      if (!physics || typeof physics.resolveForceComponents !== 'function') throw new Error('physics-helper-missing');
      update();
      slider.addEventListener('input', update);
      reset.addEventListener('click', () => { slider.value = '60'; update(); slider.focus(); });
      return { dispose() { slider.removeEventListener('input', update); } };
    }
  });

  controller.start();
})(window);
