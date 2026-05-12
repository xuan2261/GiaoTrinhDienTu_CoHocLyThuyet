/**
 * Route behavior contracts for Ch1 solver exercise routes.
 */
(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) return;

const W = 760, H = 440;
const colors = { load: '#dc3545', step: '#c9963a' };
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bounded = point => ({ x: clamp(point.x, 56, W - 56), y: clamp(point.y, 72, H - 56) });
const primary = state => state.primary || (state.primary = { x: 326, y: 166 });

function makeHandle(id, label, stroke) {
  return (_scene, state) => [{
    id, label, hitRadius: 28, nudgeStep: 8, shiftStep: 24,
    get() { return primary(state); },
    set(point) {
      state.primary = { x: clamp(point.x, 150, 572), y: clamp(point.y, 92, 230) };
      state.loadRatio = clamp((state.primary.x - 150) / 422, 0.05, 0.95);
      state.force = clamp(220 - state.primary.y, 45, 180);
      state.trail = Array.isArray(state.trail) ? state.trail : [];
      state.trail.push({ x: state.primary.x, y: state.primary.y });
      if (state.trail.length > 34) state.trail.shift();
    },
    visual: { stroke }
  }];
}

function solverDerived(scene, state) {
  const routeId = scene.routeId || state.routeId || '';
  const p = primary(state), force = clamp(state.force, 45, 180);
  const ratio = clamp(state.loadRatio !== undefined ? state.loadRatio : (p.x - 150) / 422, 0.05, 0.95);
  const rb = force * ratio, ra = force - rb, span = 4.2, a = ratio * span;
  const inputRA = clamp(state.inputRA, 0, 220), inputRB = clamp(state.inputRB, 0, 220);
  const residual = routeId === 'ch1-7-2' ? Math.abs(inputRA - ra) + Math.abs(inputRB - rb) : 0;
  return {
    point: p, force, loadRatio: ratio, a, ra, rb,
    moment: force * a, step: clamp(state.buoc, 1, 4),
    residual, verify: residual < 8 ? 'đúng' : 'lệch',
    progress: `${clamp(state.buoc, 1, 4)}/4`,
    resultantMagnitude: Math.hypot(ra, rb),
    trail: state.trail || []
  };
}

function updateSolverState(_scene, state, key, value) {
  if (key === 'force') state.force = clamp(value, 45, 180);
  else if (key === 'buoc') state.buoc = clamp(Math.round(value), 1, 4);
  else if (key === 'inputRA') state.inputRA = clamp(value, 0, 220);
  else if (key === 'inputRB') state.inputRB = clamp(value, 0, 220);
  else state[key] = value;
}

registry.registerMany({
  'ch1-7-1': {
    behaviorId: 'ch1-7-1-guided-solver-behavior',
    derivedModelId: 'fbd-equation-solve-derived',
    interactionSchemaId: 'step-by-step-solver-interactions',
    derived: solverDerived,
    updateStateFromSlider: updateSolverState,
    handles: makeHandle('guided-solver-load-p', 'P', colors.load)
  },
  'ch1-7-2': {
    behaviorId: 'ch1-7-2-numeric-checker-behavior',
    derivedModelId: 'equilibrium-residual-derived',
    interactionSchemaId: 'input-verify-interactions',
    derived: solverDerived,
    updateStateFromSlider: updateSolverState,
    handles: makeHandle('numeric-checker-load-p', 'P', colors.step)
  }
});

})();
