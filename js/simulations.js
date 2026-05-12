/**
 * Simulation Map V1 (Restored)
 * Compatibility layer between SimRegistry and loader.js
 */
(function() {
  'use strict';
  window.SimRegistry = window.SimRegistry || {};
  window.SIM_MAP = window.SIM_MAP || {};

  function isRouteId(id) {
    return typeof id === 'string' && /^ch\d+-\d+-\d+$/.test(id);
  }

  function cleanupHost(host) {
    if (!host) return;
    if (typeof host.innerHTML === 'string') host.innerHTML = '';
    if (Array.isArray(host.children) && host.children.length) {
      host.children.forEach(child => { if (child) child.parentNode = null; });
      host.children.length = 0;
    }
    while (host.firstChild && typeof host.removeChild === 'function') {
      host.removeChild(host.firstChild);
    }
  }

  function wrapMount(routeId, mountFn) {
    return function(host) {
      try {
        return mountFn(host);
      } catch (error) {
        if (console && typeof console.error === 'function') console.error(`Simulation mount failed for ${routeId}:`, error);
        else if (console && typeof console.warn === 'function') console.warn(`Simulation mount failed for ${routeId}: ${error && error.message ? error.message : error}`);
        cleanupHost(host);
        return null;
      }
    };
  }

  window.buildSimMap = function() {
    const nextMap = {};

    // Populate SIM_MAP from SimRegistry
    if (window.SimRegistry && typeof window.SimRegistry.entries === 'function') {
      const entries = window.SimRegistry.entries();
      Object.keys(entries).forEach(id => {
        if (isRouteId(id) && typeof entries[id] === 'function') {
          nextMap[id] = wrapMount(id, entries[id]);
        }
      });
    } else {
      Object.keys(window.SimRegistry || {}).forEach(id => {
        if (isRouteId(id) && typeof window.SimRegistry[id] === 'function') {
          nextMap[id] = wrapMount(id, window.SimRegistry[id]);
        }
      });
    }

    // Also check SimRouteRenderers if using the older pattern
    if (window.SimRouteRenderers && typeof window.SimRouteRenderers.entries === 'function') {
      const renderers = window.SimRouteRenderers.entries();
      Object.keys(renderers).forEach(routeId => {
        if (!nextMap[routeId]) {
          nextMap[routeId] = wrapMount(routeId, function(host) {
            if (!window.SimCore || !window.SimCore.createSimContainer) return null;
            if (window.SimProfessionalLab && typeof window.SimProfessionalLab.mount === 'function') {
              return window.SimProfessionalLab.mount(routeId)(host);
            }
            return window.SimCore.createSimContainer(host, routeId);
          });
        }
      });
    }

    window.SIM_MAP = nextMap;
    return nextMap;
  };

  window.disposeMount = function(host) {
    if (window.activeSimulationDispose) {
      window.activeSimulationDispose();
    }
    if (host && host.innerHTML) host.innerHTML = '';
  };

  // Initialize map now and once more after all scripts settle.
  window.buildSimMap();
  if (typeof setTimeout === 'function') {
    setTimeout(window.buildSimMap, 50);
  }
})();
