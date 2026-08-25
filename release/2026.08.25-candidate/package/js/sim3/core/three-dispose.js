(function(root) {
  'use strict';

  const disposedContexts = new WeakSet();
  const disposedResources = new WeakSet();
  const lostContexts = new WeakSet();

  function once(resource) {
    if (!resource || (typeof resource !== 'object' && typeof resource !== 'function')) return false;
    if (disposedResources.has(resource)) return false;
    disposedResources.add(resource);
    return true;
  }

  function disposeResource(resource) {
    if (once(resource) && typeof resource.dispose === 'function') resource.dispose();
  }

  function disposeTextures(value, visited) {
    if (!value || typeof value !== 'object' || visited.has(value)) return;
    visited.add(value);
    if (value.isTexture) {
      disposeResource(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(item => disposeTextures(item, visited));
      return;
    }
    Object.keys(value).forEach(key => {
      if (key !== 'parent') disposeTextures(value[key], visited);
    });
  }

  function disposeMaterial(material) {
    const list = Array.isArray(material) ? material : [material];
    list.forEach(item => {
      if (!item) return;
      disposeTextures(item, new WeakSet());
      disposeResource(item);
    });
  }

  function disposeScene(scene) {
    if (!scene || typeof scene.traverse !== 'function') return;
    scene.traverse(object => {
      disposeResource(object.geometry);
      disposeMaterial(object.material);
    });
  }

  function disposeAll(ctx) {
    if (!ctx || typeof ctx !== 'object' || disposedContexts.has(ctx)) return;
    disposedContexts.add(ctx);
    disposeResource(ctx.controls);
    disposeScene(ctx.scene);
    const renderer = ctx.renderer;
    if (!renderer) return;
    if (renderer.renderLists) disposeResource(renderer.renderLists);
    disposeResource(renderer);
    if (typeof renderer.forceContextLoss === 'function' && !lostContexts.has(renderer)) {
      lostContexts.add(renderer);
      renderer.forceContextLoss();
    }
    const canvas = renderer.domElement;
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  root.Sim3Dispose = { disposeAll, disposeScene };
})(typeof window !== 'undefined' ? window : this);
