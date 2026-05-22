/**
 * SimDynamics adapter backed by the shared professional lab engine.
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

window.SimDynamics = {
  simForceMotionConcept: route('ch3-1-2'),
  simInertialFrameLab: route('ch3-1-3'),
  simInertiaLaw: route('ch3-2-1'),
  simNewton: route('ch3-2-2'),
  simNewton3: route('ch3-2-3'),
  simDynamicFbd: route('ch3-2-5'),
  simDifferentialMotionLab: route('ch3-3-1'),
  simSystemDifferentialLab: route('ch3-3-2'),
  simDAlembert: route('ch3-4-1'),
  simInverseDynamics: route('ch3-4-2'),
  simCenterMassTheorem: route('ch3-5-1'),
  simMomentum: route('ch3-5-2'),
  simAngularMomentumLab: route('ch3-5-3'),
  simKineticEnergy: route('ch3-5-4'),
  simCollision2D: route('ch3-6-2'),
  simCollisionSolver: route('ch3-6-3')
};

})();
