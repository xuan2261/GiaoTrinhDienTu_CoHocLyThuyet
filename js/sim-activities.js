/**
 * Shared activity/checker namespace for simulation labs.
 */
(function() {
'use strict';

const STORAGE_KEY = 'chlyt_activity_progress_v1';

function readProgress() {
  try {
    const raw = window.localStorage && window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (err) {
    console.warn('Activity progress read failed:', err);
    return {};
  }
}

function writeProgress(progress) {
  try {
    if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Activity progress write failed:', err);
  }
}

function normalizeRouteProgress(route) {
  const source = route && typeof route === 'object' && !Array.isArray(route) ? route : {};
  return {
    completed: Array.isArray(source.completed) ? source.completed.filter(step => typeof step === 'string') : [],
    lastScore: Number.isFinite(Number(source.lastScore)) ? Number(source.lastScore) : 0,
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : null
  };
}

function updateRouteProgress(routeId, stepId, score) {
  const progress = readProgress();
  const route = normalizeRouteProgress(progress[routeId]);
  if (stepId && !route.completed.includes(stepId)) route.completed.push(stepId);
  route.lastScore = Math.max(Number(route.lastScore) || 0, score || 0);
  route.updatedAt = new Date().toISOString();
  progress[routeId] = route;
  writeProgress(progress);
  return route;
}

function resetRoute(routeId) {
  const progress = readProgress();
  delete progress[routeId];
  writeProgress(progress);
}

function checkNumeric(value, expected, tolerance, unit) {
  const actual = Number(value);
  const target = Number(expected);
  const tol = Math.max(0, Number(tolerance) || 0);
  const ok = Number.isFinite(actual) && Math.abs(actual - target) <= tol;
  return {
    ok,
    actual,
    expected: target,
    message: ok
      ? `Đúng trong sai số ±${tol}${unit || ''}.`
      : `Sai số còn ${Number.isFinite(actual) ? Math.abs(actual - target).toFixed(2) : 'không hợp lệ'}${unit || ''}.`
  };
}

function checkVectorDirection(vector, expectedAngleDeg, toleranceDeg) {
  const angle = Math.atan2(vector.y || 0, vector.x || 0) * 180 / Math.PI;
  const delta = Math.abs(((angle - expectedAngleDeg + 540) % 360) - 180);
  const tol = Math.max(0, Number(toleranceDeg) || 0);
  return {
    ok: delta <= tol,
    angle,
    expected: expectedAngleDeg,
    message: delta <= tol ? 'Hướng véc tơ đúng.' : `Lệch hướng ${delta.toFixed(1)}°.`
  };
}

function createStepChecker(container, config) {
  const routeId = config.routeId || 'activity';
  const steps = config.steps || [];
  const panel = document.createElement('div');
  panel.className = 'sim-activity';
  panel.innerHTML = `<strong>${config.title || 'Kiểm tra nhanh'}</strong>`;
  const feedback = document.createElement('div');
  feedback.className = 'sim-feedback';

  steps.forEach((step, index) => {
    const row = document.createElement('div');
    row.className = 'sim-check-row';
    const label = document.createElement('label');
    label.textContent = step.prompt;
    const input = document.createElement('input');
    input.type = 'number';
    input.step = step.step || '0.01';
    input.placeholder = step.placeholder || '';
    const btn = document.createElement('button');
    btn.className = 'sim-btn';
    btn.textContent = 'Kiểm';
    btn.addEventListener('click', () => {
      const result = checkNumeric(input.value, step.expected, step.tolerance, step.unit);
      feedback.textContent = `${index + 1}. ${result.message}`;
      feedback.className = 'sim-feedback ' + (result.ok ? 'ok' : 'bad');
      if (result.ok) updateRouteProgress(routeId, step.id || `step-${index + 1}`, (index + 1) / steps.length);
    });
    row.append(label, input, btn);
    panel.appendChild(row);
  });

  if (steps.length) panel.appendChild(feedback);
  const reset = document.createElement('button');
  reset.className = 'sim-btn';
  reset.textContent = 'Reset activity';
  reset.addEventListener('click', () => {
    resetRoute(routeId);
    feedback.textContent = 'Đã xóa tiến trình activity của route này.';
    feedback.className = 'sim-feedback';
  });
  panel.appendChild(reset);
  container.appendChild(panel);
  return panel;
}

window.SimActivities = {
  STORAGE_KEY,
  readProgress,
  writeProgress,
  normalizeRouteProgress,
  updateRouteProgress,
  resetRoute,
  checkNumeric,
  checkVectorDirection,
  createStepChecker
};

})();
