/**
 * Route-level behavior contract registry.
 */
(function() {
'use strict';

function validRouteId(routeId) {
  return typeof routeId === 'string' && /^ch\d+-\d+-\d+$/.test(routeId);
}

function validBehaviorId(behaviorId) {
  return typeof behaviorId === 'string' && behaviorId.trim().length > 0;
}

function hasOwn(source, key) {
  return Object.prototype.hasOwnProperty.call(source || {}, key);
}

function normalizeEntry(routeId, behavior) {
  if (routeId && typeof routeId === 'object') {
    const entry = routeId;
    const hasBehaviorId = hasOwn(entry, 'behaviorId');
    const hasId = hasOwn(entry, 'id');
    return Object.assign({}, entry, {
      routeId: entry.routeId,
      behaviorId: hasBehaviorId ? entry.behaviorId : (hasId ? entry.id : `${entry.routeId}-behavior`),
      explicitBehaviorId: hasBehaviorId || hasId
    });
  }
  const hasBehaviorId = hasOwn(behavior, 'behaviorId');
  const hasId = hasOwn(behavior, 'id');
  return Object.assign({}, behavior || {}, {
    routeId,
    behaviorId: hasBehaviorId ? behavior.behaviorId : (hasId ? behavior.id : `${routeId}-behavior`),
    explicitBehaviorId: hasBehaviorId || hasId
  });
}

function createRegistry() {
  const behaviors = {};
  return {
    register(routeId, behavior) {
      const entry = normalizeEntry(routeId, behavior);
      if (!validRouteId(entry.routeId) || !validBehaviorId(entry.behaviorId)) {
        console.warn('Invalid route behavior registration:', routeId);
        return null;
      }
      if (behaviors[entry.routeId]) console.warn('Route behavior overwritten:', entry.routeId);
      behaviors[entry.routeId] = entry;
      return behaviors[entry.routeId];
    },
    registerMany(entries) {
      if (Array.isArray(entries)) {
        entries.forEach(entry => this.register(entry));
        return;
      }
      Object.keys(entries || {}).forEach(routeId => this.register(routeId, entries[routeId]));
    },
    get(routeId) {
      return behaviors[routeId] || null;
    },
    has(routeId) {
      return Boolean(behaviors[routeId]);
    },
    routes() {
      return Object.keys(behaviors).sort();
    },
    entries() {
      return Object.assign({}, behaviors);
    }
  };
}

window.SimRouteBehaviors = window.SimRouteBehaviors || createRegistry();

})();
