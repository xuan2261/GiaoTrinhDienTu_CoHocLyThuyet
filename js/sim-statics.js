/**
 * SimStatics adapter backed by the shared professional lab engine.
 */
(function() {
'use strict';

const lab = window.SimProfessionalLab;

function route(routeId) {
  return lab && lab.mount ? lab.mount(routeId) : function(host) {
    const fallback = window.SimCore && window.SimCore.createSimContainer;
    if (fallback) fallback(host, routeId, 520, 320);
  };
}

const SimStatics = {
  simForceVectorAnatomy: route('ch1-1-3'),
  simMoment: route('ch1-1-4'),
  simForceSystemReducer2d: route('ch1-1-5'),
  simCouple: route('ch1-1-6'),
  simDofConstraintExplorer: route('ch1-1-8'),
  simTwoForceEquilibrium: route('ch1-2-1'),
  simParallelogram: route('ch1-2-3'),
  simFbdBuilder: route('ch1-2-6'),
  simSmoothSupportReaction: route('ch1-3-1'),
  simCableTensionReaction: route('ch1-3-2'),
  simSupportTypes: route('ch1-3-3'),
  simRollerSupportReaction: route('ch1-3-4'),
  simFixedSupportReaction: route('ch1-3-6'),
  simTwoForceMemberReaction: route('ch1-3-7'),
  simSpatialReducer: route('ch1-4-1'),
  simSpatialMomentReducer: route('ch1-4-2'),
  simBeamReactions: route('ch1-4-4'),
  simFrictionContactLab: route('ch1-5-1'),
  simFrictionTypeTabs: route('ch1-5-2'),
  simFrictionConeInclineLab: route('ch1-5-3'),
  simSelfLockingLab: route('ch1-5-4'),
  simCenterGravity: route('ch1-6-2'),
  simCentroidHoleLab: route('ch1-6-3')
};

window.SimStatics = SimStatics;

})();
