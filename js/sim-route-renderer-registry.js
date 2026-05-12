/**
 * Route-level renderer contract registry.
 */
(function() {
'use strict';

function validRouteId(routeId) {
  return typeof routeId === 'string' && /^ch\d+-\d+-\d+$/.test(routeId);
}

function validRendererId(rendererId) {
  return typeof rendererId === 'string' && rendererId.trim().length > 0;
}

function normalizeEntry(routeId, rendererId, renderFn, metadata) {
  if (routeId && typeof routeId === 'object') {
    const entry = routeId;
    return {
      routeId: entry.routeId,
      rendererId: entry.rendererId || entry.id,
      render: entry.render || entry.renderFn || entry.fn,
      metadata: entry.metadata || {}
    };
  }
  return {
    routeId,
    rendererId,
    render: renderFn,
    metadata: metadata || {}
  };
}

function createRegistry() {
  const renderers = {};
  return {
    register(routeId, rendererId, renderFn, metadata) {
      const entry = normalizeEntry(routeId, rendererId, renderFn, metadata);
      if (!validRouteId(entry.routeId) || !validRendererId(entry.rendererId) || typeof entry.render !== 'function') {
        console.warn('Invalid route renderer registration:', routeId);
        return null;
      }
      if (renderers[entry.routeId]) console.warn('Route renderer overwritten:', entry.routeId);
      renderers[entry.routeId] = {
        routeId: entry.routeId,
        rendererId: entry.rendererId,
        render: entry.render,
        metadata: entry.metadata || {}
      };
      return renderers[entry.routeId];
    },
    registerMany(entries) {
      if (Array.isArray(entries)) {
        entries.forEach(entry => this.register(entry));
        return;
      }
      Object.keys(entries || {}).forEach(routeId => {
        const entry = entries[routeId];
        this.register(Object.assign({ routeId }, entry || {}));
      });
    },
    get(routeId) {
      return renderers[routeId] || null;
    },
    has(routeId) {
      return Boolean(renderers[routeId]);
    },
    routes() {
      return Object.keys(renderers).sort();
    },
    entries() {
      return Object.assign({}, renderers);
    },
    identity(routeId) {
      const entry = renderers[routeId];
      if (!entry) return null;
      return {
        routeId: entry.routeId,
        rendererId: entry.rendererId,
        functionName: entry.render.name || '',
        metadata: Object.assign({}, entry.metadata)
      };
    }
  };
}

window.SimRouteRenderers = window.SimRouteRenderers || createRegistry();

})();
