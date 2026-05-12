/**
 * Route scenes for Ch1 solver exercise routes.
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for Ch1 solver exercises');
  return;
}

function slider(key, label, min, max, value, unit, step) {
  return { type: 'slider', key, label, min, max, value, step: step || 1, unit: unit || '' };
}

const routeSceneEntries = [
  ['ch1-7-1', 'guided-equilibrium-solver'],
  ['ch1-7-2', 'statics-numeric-checker']
];

const scenes = [
  {
    routeId: 'ch1-7-1', template: 'guided-equilibrium-solver', family: 'checker',
    title: 'Chuỗi giải tĩnh học', formula: '\\sum F_x=0,\\ \\sum F_y=0,\\ \\sum M_A=0',
    visualLabel: 'Quy trình giải từng bước', seed: 71, appendGenericReadouts: false,
    initialState: { primary: { x: 326, y: 166 }, force: 104, buoc: 1, loadRatio: 0.42, trail: [] },
    controls: [slider('force', 'P', 45, 180, 104, 'N', 5), slider('buoc', 'Bước', 1, 4, 1, '', 1)],
    readouts: [
      { label: 'P', key: 'force', digits: 1, unit: 'N', kind: 'force' },
      { label: 'Bước', key: 'progress', kind: 'mode' },
      { label: 'RA', key: 'ra', digits: 1, unit: 'N', kind: 'result' },
      { label: 'RB', key: 'rb', digits: 1, unit: 'N', kind: 'result' }
    ]
  },
  {
    routeId: 'ch1-7-2', template: 'statics-numeric-checker', family: 'checker',
    title: 'Đối chiếu kết quả tĩnh học', formula: 'R_A+R_B=P,\\quad R_B L=Pa',
    visualLabel: 'So sánh nghiệm nhập với cân bằng', seed: 72, appendGenericReadouts: false,
    initialState: { primary: { x: 348, y: 158 }, force: 112, buoc: 4, loadRatio: 0.47, inputRA: 48, inputRB: 50, trail: [] },
    controls: [
      slider('force', 'P', 45, 180, 112, 'N', 5),
      slider('inputRA', 'RA nhập', 0, 220, 48, 'N', 1),
      slider('inputRB', 'RB nhập', 0, 220, 50, 'N', 1)
    ],
    readouts: [
      { label: 'RA đúng', key: 'ra', digits: 1, unit: 'N', kind: 'result' },
      { label: 'RB đúng', key: 'rb', digits: 1, unit: 'N', kind: 'result' },
      { label: 'Sai số', key: 'residual', digits: 1, unit: 'N', kind: 'default' },
      { label: 'Kiểm', key: 'verify', kind: 'mode' }
    ]
  }
];

registry.registerMany(scenes.map(scene => Object.assign({
  sceneId: `${scene.routeId}-${scene.template}`,
  visualKey: `${scene.template}-${scene.seed}-${routeSceneEntries.length}`,
  equation: scene.formula
}, scene)));

})();
