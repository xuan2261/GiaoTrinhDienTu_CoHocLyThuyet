/**
 * Route scenes for Ch1 friction labs.
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for Ch1 friction scenes');
  return;
}

function slider(key, label, min, max, value, unit, step) {
  return { type: 'slider', key, label, min, max, value, step: step || 1, unit: unit || '' };
}

const routeSceneEntries = [
  ['ch1-5-1', 'contact-force-decomposition'],
  ['ch1-5-2', 'friction-mode-tabs'],
  ['ch1-5-3', 'friction-cone-incline'],
  ['ch1-5-4', 'self-locking-wedge']
];

const scenes = [
  {
    routeId: 'ch1-5-1', template: 'contact-force-decomposition', family: 'friction',
    title: 'Phân tích lực tiếp xúc', formula: 'F_{ms}\\le\\mu N',
    visualLabel: 'N và lực ma sát tại mặt tiếp xúc', seed: 31, appendGenericReadouts: false,
    initialState: { primary: { x: 326, y: 254 }, force: 88, load: 140, mu: 0.38 },
    controls: [slider('load', 'N', 60, 220, 140, 'N', 5), slider('mu', 'μ', 0.1, 1, 0.38, '', 0.05)],
    readouts: [
      { label: 'N', key: 'normal', digits: 1, unit: 'N', kind: 'force' },
      { label: 'Fms', key: 'friction', digits: 1, unit: 'N', kind: 'result' },
      { label: '|R|', key: 'resultantMagnitude', digits: 1, unit: 'N', kind: 'result' }
    ]
  },
  {
    routeId: 'ch1-5-2', template: 'friction-mode-tabs', family: 'friction',
    title: 'Ma sát nghỉ, trượt và lăn', formula: 'F_{ms}\\le\\mu N',
    visualLabel: 'Thanh ngưỡng chuyển trạng thái', seed: 32, appendGenericReadouts: false,
    initialState: { primary: { x: 294, y: 252 }, force: 94, load: 150, mu: 0.48 },
    controls: [slider('force', 'F kéo', 20, 190, 94, 'N', 5), slider('mu', 'μ', 0.1, 1, 0.48, '', 0.05)],
    readouts: [
      { label: 'F kéo', key: 'force', digits: 1, unit: 'N', kind: 'force' },
      { label: 'μN', key: 'threshold', digits: 1, unit: 'N', kind: 'result' },
      { label: 'Trạng thái', key: 'slipState', kind: 'mode' }
    ]
  },
  {
    routeId: 'ch1-5-3', template: 'friction-cone-incline', family: 'friction',
    title: 'Nón ma sát trên mặt nghiêng', formula: '\\tan\\alpha\\le\\mu',
    visualLabel: 'Điều kiện bám trên mặt nghiêng', seed: 33, appendGenericReadouts: false,
    initialState: { primary: { x: 378, y: 230 }, alpha: 19, force: 92, load: 130, mu: 0.46 },
    controls: [slider('alpha', 'α', 5, 42, 19, '°', 1), slider('mu', 'μ', 0.1, 1, 0.46, '', 0.05)],
    readouts: [
      { label: 'α', key: 'alpha', digits: 0, unit: '°', kind: 'angle' },
      { label: 'tan α', key: 'tanAlpha', digits: 2, kind: 'angle' },
      { label: 'Trạng thái', key: 'slipState', kind: 'mode' }
    ]
  },
  {
    routeId: 'ch1-5-4', template: 'self-locking-wedge', family: 'friction',
    title: 'Tự hãm nêm và vít', formula: '\\alpha\\le\\varphi=\\arctan\\mu',
    visualLabel: 'Biên tự hãm của nêm', seed: 34, appendGenericReadouts: false,
    initialState: { primary: { x: 362, y: 222 }, alpha: 16, force: 88, load: 120, mu: 0.42 },
    controls: [slider('alpha', 'α', 5, 42, 16, '°', 1), slider('mu', 'μ', 0.1, 1, 0.42, '', 0.05)],
    readouts: [
      { label: 'α', key: 'alpha', digits: 0, unit: '°', kind: 'angle' },
      { label: 'φ', key: 'phi', digits: 0, unit: '°', kind: 'angle' },
      { label: 'Trạng thái', key: 'lockState', kind: 'mode' }
    ]
  }
];

registry.registerMany(scenes.map(scene => Object.assign({
  sceneId: `${scene.routeId}-${scene.template}`,
  visualKey: `${scene.template}-${scene.seed}-${routeSceneEntries.length}`,
  equation: scene.formula
}, scene)));

})();
