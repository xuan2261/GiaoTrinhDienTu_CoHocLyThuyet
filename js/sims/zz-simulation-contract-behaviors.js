/**
 * Canonical 58-route behavior contracts.
 */
(function() {
'use strict';

const registry = window.SimRouteBehaviors;
if (!registry) {
  console.warn('SimRouteBehaviors missing for simulation contract behaviors');
  return;
}

const routes = [
  'ch1-1-3','ch1-1-4','ch1-1-5','ch1-1-6','ch1-1-8','ch1-2-1','ch1-2-3','ch1-2-6',
  'ch1-3-1','ch1-3-2','ch1-3-3','ch1-3-4','ch1-3-6','ch1-3-7','ch1-4-1','ch1-4-2',
  'ch1-4-4','ch1-5-1','ch1-5-2','ch1-5-3','ch1-5-4','ch1-6-2','ch1-6-3','ch1-7-1',
  'ch1-7-2','ch2-1-1','ch2-1-2','ch2-1-3','ch2-1-4','ch2-2-2','ch2-3-2','ch2-4-1',
  'ch2-4-2','ch2-4-3','ch2-4-4','ch2-5-1','ch2-5-2','ch2-5-3','ch2-7-1','ch2-7-2',
  'ch3-1-2','ch3-1-3','ch3-2-1','ch3-2-2','ch3-2-3','ch3-2-5','ch3-3-1','ch3-3-2',
  'ch3-4-1','ch3-4-2','ch3-5-1','ch3-5-2','ch3-5-3','ch3-5-4','ch3-6-2','ch3-6-3',
  'ch3-7-1','ch3-7-2'
];

function family(routeId) {
  if (routeId.indexOf('ch2-') === 0) return 'kinematics';
  if (routeId.indexOf('ch3-') === 0) return 'dynamics';
  return 'statics';
}

registry.registerMany(routes.map(function(routeId, index) {
  return {
    routeId,
    behaviorId: `${routeId}-${family(routeId)}-behavior`,
    directManipulation: true,
    touchTarget: 44,
    mode: `contract-${index + 1}`
  };
}));

})();
