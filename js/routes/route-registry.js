/**
 * Phase 02: Route Registry — declarative route configuration.
 * Single source of truth for all new-architecture pilots.
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

const RouteRegistry = root.RouteRegistry || class RouteRegistry {
  constructor() {
    this._routes = new Map();
    this._byChapter = new Map();
  }

  /** Register a route config */
  register(id, config) {
    config = config || {};
    config.id = id;
    config.chapter = config.chapter || 1;
    config.type = config.type || 'unknown';

    this._routes.set(id, config);

    if (!this._byChapter.has(config.chapter)) {
      this._byChapter.set(config.chapter, []);
    }
    this._byChapter.get(config.chapter).push(config);
    return config;
  }

  /** Get a route config */
  get(id) {
    return this._routes.get(id) || null;
  }

  /** List all route ids */
  list() {
    return [...this._routes.keys()];
  }

  /** Get routes by chapter number */
  byChapter(n) {
    return this._byChapter.get(n) || [];
  }

  /** Check if route exists */
  has(id) {
    return this._routes.has(id);
  }

  /** Get total count */
  get count() {
    return this._routes.size;
  }
};

// Static storage so RouteRegistry.register() works as both static AND instance call
RouteRegistry._routes = RouteRegistry._routes || new Map();
RouteRegistry._byChapter = RouteRegistry._byChapter || new Map();

// Static register method — supports both RouteRegistry.register() and instance.register()
RouteRegistry.register = function(id, config) {
  var inst = RouteRegistry._routes instanceof Map ? RouteRegistry : null;
  // Use the class itself as the store (both static and instance calls work)
  var store = RouteRegistry;
  config = config || {};
  config.id = id;
  config.chapter = config.chapter || 1;
  config.type = config.type || 'unknown';
  store._routes.set(id, config);
  if (!store._byChapter.has(config.chapter)) {
    store._byChapter.set(config.chapter, []);
  }
  store._byChapter.get(config.chapter).push(config);
  return config;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RouteRegistry;
} else {
  root.SimNew = root.SimNew || {};
  // Protect against route files doing window.RouteRegistry = {} which overwrites the class
  if (!root.RouteRegistry || typeof root.RouteRegistry.register !== 'function') {
    root.RouteRegistry = RouteRegistry;
  }
  root.SimNew.RouteRegistry = root.RouteRegistry;
}

})(typeof window !== 'undefined' ? window : this);
