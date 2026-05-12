/**
 * Route-specific scene catalog registry.
 */
(function() {
'use strict';

function validScene(scene) {
  return scene && typeof scene === 'object' && typeof scene.routeId === 'string';
}

function createRegistry() {
  const scenes = {};
  return {
    register(sceneOrRoute, maybeScene) {
      const scene = typeof sceneOrRoute === 'string'
        ? Object.assign({ routeId: sceneOrRoute }, maybeScene || {})
        : sceneOrRoute;
      if (!validScene(scene)) {
        console.warn('Invalid simulation scene registration:', sceneOrRoute);
        return;
      }
      if (!scene.sceneId) scene.sceneId = `${scene.routeId}-${scene.template || 'scene'}`;
      if (!scene.visualKey) scene.visualKey = scene.sceneId;
      if (scenes[scene.routeId]) console.warn('Simulation scene overwritten:', scene.routeId);
      scenes[scene.routeId] = scene;
    },
    registerMany(entries) {
      if (Array.isArray(entries)) {
        entries.forEach(entry => {
          if (Array.isArray(entry)) this.register(entry[0], entry[1]);
          else this.register(entry);
        });
        return;
      }
      Object.keys(entries || {}).forEach(routeId => this.register(routeId, entries[routeId]));
    },
    get(routeId) {
      return scenes[routeId] || null;
    },
    routes() {
      return Object.keys(scenes).sort();
    },
    entries() {
      return Object.assign({}, scenes);
    }
  };
}

window.SimSceneRegistry = window.SimSceneRegistry || createRegistry();

})();
