(function(root) {
  'use strict';

  function disposeMaterial(mat) {
    if (!mat) return;
    const list = Array.isArray(mat) ? mat : [mat];
    list.forEach(m => {
      ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap'].forEach(k => {
        if (m[k] && typeof m[k].dispose === 'function') m[k].dispose();
      });
      if (typeof m.dispose === 'function') m.dispose();
    });
  }

  function disposeScene(scene) {
    if (!scene || typeof scene.traverse !== 'function') return;
    scene.traverse(obj => {
      if (obj.geometry && typeof obj.geometry.dispose === 'function') obj.geometry.dispose();
      disposeMaterial(obj.material);
    });
  }

  function disposeAll(ctx) {
    if (!ctx) return;
    if (ctx.controls && typeof ctx.controls.dispose === 'function') ctx.controls.dispose();
    disposeScene(ctx.scene);
    if (ctx.renderer) {
      if (typeof ctx.renderer.setAnimationLoop === 'function') ctx.renderer.setAnimationLoop(null);
      if (typeof ctx.renderer.dispose === 'function') ctx.renderer.dispose();
      if (typeof ctx.renderer.forceContextLoss === 'function') ctx.renderer.forceContextLoss();
      const canvas = ctx.renderer.domElement;
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  }

  root.Sim3Dispose = { disposeAll, disposeScene };
})(typeof window !== 'undefined' ? window : this);
