/**
 * Route scenes for Ch1 centroid and area computation routes.
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for Ch1 centroid scenes');
  return;
}

function slider(key, label, min, max, value, unit, step) {
  return { type: 'slider', key, label, min, max, value, step: step || 1, unit: unit || '' };
}

const routeSceneEntries = [
  ['ch1-6-2', 'centroid-composite'],
  ['ch1-6-3', 'centroid-hole-shift']
];

const scenes = [
  {
    routeId: 'ch1-6-2', template: 'centroid-composite', family: 'centroid',
    title: 'Trọng tâm diện tích ghép', formula: 'x_G=\\frac{\\sum S_i x_i}{\\sum S_i}',
    visualLabel: 'Hai diện tích ghép và điểm G', seed: 62, appendGenericReadouts: false,
    initialState: { primary: { x: 332, y: 202 }, force: 88, load: 96, trail: [] },
    controls: [slider('load', 'S2', 20, 180, 96, '%', 1)],
    readouts: [
      { label: 'xG', key: 'gx', digits: 0, unit: 'px', kind: 'result' },
      { label: 'yG', key: 'gy', digits: 0, unit: 'px', kind: 'result' },
      { label: 'S2', key: 'load', digits: 0, unit: '%', kind: 'default' }
    ]
  },
  {
    routeId: 'ch1-6-3', template: 'centroid-hole-shift', family: 'centroid',
    title: 'Trọng tâm khi có lỗ khoét', formula: 'x_G=\\frac{Sx-S_hx_h}{S-S_h}',
    visualLabel: 'Đối xứng bị phá bởi phần khoét', seed: 63, appendGenericReadouts: false,
    initialState: { primary: { x: 244, y: 164 }, force: 88, load: 72, trail: [] },
    controls: [slider('load', 'S lỗ', 20, 150, 72, '%', 1)],
    readouts: [
      { label: 'xG', key: 'gx', digits: 0, unit: 'px', kind: 'result' },
      { label: 'Dịch G', key: 'shift', digits: 1, unit: 'px', kind: 'result' },
      { label: 'S lỗ', key: 'hole', digits: 0, unit: '', kind: 'default' }
    ]
  }
];

registry.registerMany(scenes.map(scene => Object.assign({
  sceneId: `${scene.routeId}-${scene.template}`,
  visualKey: `${scene.template}-${scene.seed}-${routeSceneEntries.length}`,
  equation: scene.formula
}, scene)));

})();
