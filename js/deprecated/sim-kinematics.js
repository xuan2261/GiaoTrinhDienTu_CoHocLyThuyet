/**
 * SimKinematics adapter backed by the shared professional lab engine.
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

window.SimKinematics = {
  simParticleMotion: route('ch2-1-1'),
  simCartesianMotionGraph: route('ch2-1-2'),
  simNaturalCoord: route('ch2-1-3'),
  simMotionPresetGallery: route('ch2-1-4'),
  simRotation: route('ch2-2-2'),
  simGearTransmission: route('ch2-3-2'),
  simCompositionScenario: route('ch2-4-1'),
  simMotionDefinitionToggle: route('ch2-4-2'),
  simVelocityComposition: route('ch2-4-3'),
  simAccelerationComposition: route('ch2-4-4'),
  simPlaneMotion: route('ch2-5-1'),
  simInstantCenterFinder: route('ch2-5-2'),
  simVelocityDistributionLab: route('ch2-5-3'),
  simKinematicsGuidedChecker: route('ch2-7-1'),
  simKinematicsNumericChecker: route('ch2-7-2')
};

})();
