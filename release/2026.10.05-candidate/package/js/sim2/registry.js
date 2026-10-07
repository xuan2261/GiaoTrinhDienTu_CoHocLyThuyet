/**
 * Sim2 registry — register(routeId, factory) → build window.SIM_MAP[id].
 * Mount contract giữ nguyên: SIM_MAP[pageId] → factory(container) → { dispose }.
 * Browser-only (gắn window.SIM_MAP). UMD guard cho an toàn require.
 */
(function(root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2Registry = api;
})(typeof window !== 'undefined' ? window : this, function(root) {
  'use strict';

  if (root && !root.SIM_MAP) root.SIM_MAP = {};

  const routes = {};

  function register(routeId, factory) {
    if (typeof factory !== 'function') {
      throw new Error('Sim2Registry.register: factory phải là function cho ' + routeId);
    }
    routes[routeId] = factory;
    if (root && root.SIM_MAP) root.SIM_MAP[routeId] = factory;
  }

  function get(routeId) { return routes[routeId]; }

  function list() { return Object.keys(routes); }

  return { register, get, list, routes };
});
