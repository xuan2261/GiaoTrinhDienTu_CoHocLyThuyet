/**
 * Fixed-step simulation clock. UMD: browser -> window.Sim2AnimationClock; Node -> module.exports.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2AnimationClock = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  function createClock(options) {
    options = options || {};
    const stepSeconds = options.stepSeconds || 1 / 60;
    const maxFrameSeconds = options.maxFrameSeconds || 0.25;
    const maxSubSteps = options.maxSubSteps || 15;
    const update = options.update;
    if (!(stepSeconds > 0) || !(maxFrameSeconds > 0) || !(maxSubSteps > 0) || typeof update !== 'function') {
      throw new Error('Sim2AnimationClock.createClock: invalid options');
    }

    let lastTimestamp = null;
    let accumulator = 0;
    let simulationTime = 0;

    function runStep() {
      simulationTime += stepSeconds;
      update(stepSeconds, simulationTime);
    }

    function advance(timestampMs) {
      if (!Number.isFinite(timestampMs)) return 0;
      if (lastTimestamp == null) {
        lastTimestamp = timestampMs;
        return 0;
      }
      const elapsed = (timestampMs - lastTimestamp) / 1000;
      if (elapsed <= 0) return 0;
      lastTimestamp = timestampMs;
      accumulator += Math.min(elapsed, maxFrameSeconds);

      let count = 0;
      const epsilon = stepSeconds * 1e-9;
      while (accumulator + epsilon >= stepSeconds && count < maxSubSteps) {
        accumulator -= stepSeconds;
        if (accumulator < 0 && accumulator > -epsilon) accumulator = 0;
        runStep();
        count += 1;
      }
      if (count === maxSubSteps && accumulator >= stepSeconds) accumulator %= stepSeconds;
      return count;
    }

    function stepOnce() {
      runStep();
      return 1;
    }

    function resetTimestamp() {
      lastTimestamp = null;
      accumulator = 0;
    }

    function resetSimulationTime() {
      simulationTime = 0;
      accumulator = 0;
    }

    function getSimulationTime() { return simulationTime; }

    return { advance, stepOnce, resetTimestamp, resetSimulationTime, getSimulationTime };
  }

  return { createClock };
});
