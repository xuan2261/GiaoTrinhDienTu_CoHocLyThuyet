/**
 * Ch2 route registrations. Implementations remain in SimKinematics legacy adapter.
 */
(function() {
'use strict';

const registry = window.SimRegistry;
const kinematics = window.SimKinematics || {};

if (!registry) {
  console.warn('SimRegistry missing for Ch2 simulation routes');
  return;
}

registry.registerMany({
  'ch2-1-1': kinematics.simParticleMotion,
  'ch2-1-2': kinematics.simCartesianMotionGraph,
  'ch2-1-3': kinematics.simNaturalCoord,
  'ch2-1-4': kinematics.simMotionPresetGallery,
  'ch2-2-2': kinematics.simRotation,
  'ch2-3-2': kinematics.simGearTransmission,
  'ch2-4-1': kinematics.simCompositionScenario,
  'ch2-4-2': kinematics.simMotionDefinitionToggle,
  'ch2-4-3': kinematics.simVelocityComposition,
  'ch2-4-4': kinematics.simAccelerationComposition,
  'ch2-5-1': kinematics.simPlaneMotion,
  'ch2-5-2': kinematics.simInstantCenterFinder,
  'ch2-5-3': kinematics.simVelocityDistributionLab
});

})();
