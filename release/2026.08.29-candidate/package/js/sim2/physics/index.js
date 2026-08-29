/**
 * Physics index — gom 3 module port.
 * Node: require('../js/sim2/physics') → { statics, kinematics, dynamics }.
 * Browser: window.Sim2Physics (3 file đã set window.SimPhysics* riêng khi nạp).
 */
(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('./statics.js'),
      require('./kinematics.js'),
      require('./dynamics.js')
    );
  } else if (root) {
    root.Sim2Physics = factory(
      root.SimPhysicsStatics, root.SimPhysicsKinematics, root.SimPhysicsDynamics
    );
  }
})(typeof window !== 'undefined' ? window : this, function(statics, kinematics, dynamics) {
  'use strict';
  return { statics, kinematics, dynamics };
});
