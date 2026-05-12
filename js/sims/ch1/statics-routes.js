/**
 * Ch1 route registrations. Implementations remain in SimStatics legacy adapter.
 */
(function() {
'use strict';

const registry = window.SimRegistry;
const statics = window.SimStatics || {};

if (!registry) {
  console.warn('SimRegistry missing for Ch1 simulation routes');
  return;
}

registry.registerMany({
  'ch1-1-3': statics.simForceVectorAnatomy,
  'ch1-1-4': statics.simMoment,
  'ch1-1-5': statics.simForceSystemReducer2d,
  'ch1-1-6': statics.simCouple,
  'ch1-1-8': statics.simDofConstraintExplorer,
  'ch1-2-1': statics.simTwoForceEquilibrium,
  'ch1-2-3': statics.simParallelogram,
  'ch1-2-6': statics.simFbdBuilder,
  'ch1-3-1': statics.simSmoothSupportReaction,
  'ch1-3-2': statics.simCableTensionReaction,
  'ch1-3-3': statics.simSupportTypes,
  'ch1-3-4': statics.simRollerSupportReaction,
  'ch1-3-6': statics.simFixedSupportReaction,
  'ch1-3-7': statics.simTwoForceMemberReaction,
  'ch1-4-1': statics.simSpatialReducer,
  'ch1-4-2': statics.simSpatialMomentReducer,
  'ch1-4-4': statics.simBeamReactions,
  'ch1-5-1': statics.simFrictionContactLab,
  'ch1-5-2': statics.simFrictionTypeTabs,
  'ch1-5-3': statics.simFrictionConeInclineLab,
  'ch1-5-4': statics.simSelfLockingLab,
  'ch1-6-2': statics.simCenterGravity,
  'ch1-6-3': statics.simCentroidHoleLab,
  'ch1-7-1': statics.simStaticsGuidedSolver,
  'ch1-7-2': statics.simStaticsNumericChecker
});

})();
