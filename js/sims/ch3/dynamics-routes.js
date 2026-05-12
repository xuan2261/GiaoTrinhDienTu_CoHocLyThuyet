/**
 * Ch3 route registrations. Implementations remain in SimDynamics legacy adapter.
 */
(function() {
'use strict';

const registry = window.SimRegistry;
const dynamics = window.SimDynamics || {};

if (!registry) {
  console.warn('SimRegistry missing for Ch3 simulation routes');
  return;
}

registry.registerMany({
  'ch3-1-2': dynamics.simForceMotionConcept,
  'ch3-1-3': dynamics.simInertialFrameLab,
  'ch3-2-1': dynamics.simInertiaLaw,
  'ch3-2-2': dynamics.simNewton,
  'ch3-2-3': dynamics.simNewton3,
  'ch3-2-5': dynamics.simDynamicFbd,
  'ch3-3-1': dynamics.simDifferentialMotionLab,
  'ch3-3-2': dynamics.simSystemDifferentialLab,
  'ch3-4-1': dynamics.simDAlembert,
  'ch3-4-2': dynamics.simInverseDynamics,
  'ch3-5-1': dynamics.simCenterMassTheorem,
  'ch3-5-2': dynamics.simMomentum,
  'ch3-5-3': dynamics.simAngularMomentumLab,
  'ch3-5-4': dynamics.simKineticEnergy,
  'ch3-6-2': dynamics.simCollision2D,
  'ch3-6-3': dynamics.simCollisionSolver,
  'ch3-7-1': dynamics.simDynamicsTheoremSelector,
  'ch3-7-2': dynamics.simDynamicsNumericChecker
});

})();
