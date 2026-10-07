/**
 * Canonical 10-route Sim3 manifest. Sim3 augments an existing Sim2 base route.
 * UMD: browser -> window.SIM3_ROUTE_MANIFEST; Node -> module.exports.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SIM3_ROUTE_MANIFEST = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  return [
    { id: 'ch1-1-5', chapter: 1, baseRouteId: 'ch1-1-5', adapterGlobal: 'Sim3Ch115', source: 'js/sim3/sims/ch1-1-5-3d.js' },
    { id: 'ch1-5-3', chapter: 1, baseRouteId: 'ch1-5-3', adapterGlobal: 'Sim3Ch153', source: 'js/sim3/sims/ch1-5-3-3d.js' },
    { id: 'ch2-1-3', chapter: 2, baseRouteId: 'ch2-1-3', adapterGlobal: 'Sim3Ch213', source: 'js/sim3/sims/ch2-1-3-3d.js' },
    { id: 'ch2-2-2', chapter: 2, baseRouteId: 'ch2-2-2', adapterGlobal: 'Sim3Ch222', source: 'js/sim3/sims/ch2-2-2-3d.js' },
    { id: 'ch2-3-2', chapter: 2, baseRouteId: 'ch2-3-2', adapterGlobal: 'Sim3Ch232', source: 'js/sim3/sims/ch2-3-2-3d.js' },
    { id: 'ch2-4-4', chapter: 2, baseRouteId: 'ch2-4-4', adapterGlobal: 'Sim3Ch244', source: 'js/sim3/sims/ch2-4-4-3d.js' },
    { id: 'ch2-5-3', chapter: 2, baseRouteId: 'ch2-5-3', adapterGlobal: 'Sim3Ch253', source: 'js/sim3/sims/ch2-5-3-3d.js' },
    { id: 'ch3-1-3', chapter: 3, baseRouteId: 'ch3-1-3', adapterGlobal: 'Sim3Ch313', source: 'js/sim3/sims/ch3-1-3-3d.js' },
    { id: 'ch3-5-3', chapter: 3, baseRouteId: 'ch3-5-3', adapterGlobal: 'Sim3Ch353', source: 'js/sim3/sims/ch3-5-3-3d.js' },
    { id: 'ch3-6-2', chapter: 3, baseRouteId: 'ch3-6-2', adapterGlobal: 'Sim3Ch362', source: 'js/sim3/sims/ch3-6-2-3d.js' }
  ];
});
