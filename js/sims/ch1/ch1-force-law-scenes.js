/**
 * Route scenes for Ch1 force fundamentals and statics laws.
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for Ch1 force/law scenes');
  return;
}

const common = {
  family: 'statics',
  mass: 8,
  mu: 0.42
};
const routeSceneTokens = [['ch1-1-3', 1], ['ch1-1-4', 1], ['ch1-1-5', 1], ['ch1-1-6', 1], ['ch1-1-8', 1], ['ch1-2-1', 1]];

function slider(key, label, min, max, value, unit, step) {
  return { type: 'slider', key, label, min, max, value, step: step || 1, unit: unit || '' };
}

const scenes = [
  {
    routeId: 'ch1-1-3',
    template: 'force-vector',
    title: 'Cấu tạo véc tơ lực',
    formula: '\\vec{F}=F(\\cos\\alpha\\,\\vec{i}+\\sin\\alpha\\,\\vec{j})',
    visualLabel: 'Điểm đặt - phương - chiều',
    seed: 1,
    angle: 32 * Math.PI / 180,
    appendGenericReadouts: false,
    initialState: { primary: { x: 170, y: 290 }, vector: { x: 390, y: 155 }, force: 260, angle: 32, trail: [] },
    controls: [slider('force', '|F|', 40, 260, 260, 'N', 5), slider('angle', 'α', -45, 75, 32, '°')],
    readouts: [
      { label: '|F|', key: 'force', digits: 1, unit: 'N', kind: 'force' },
      { label: 'α', key: 'forceAngle', digits: 0, unit: '°', kind: 'angle' },
      { label: 'Điểm đặt', key: 'primary', kind: 'default' }
    ]
  },
  {
    routeId: 'ch1-1-4',
    template: 'moment-arm',
    title: 'Cánh tay đòn mô men',
    formula: 'M_O(\\vec{F})=\\pm F\\cdot d',
    visualLabel: 'Cánh tay đòn và chiều quay',
    seed: 2,
    angle: -Math.PI / 2,
    appendGenericReadouts: false,
    initialState: { primary: { x: 330, y: 185 }, vector: { x: 330, y: 295 }, force: 110, load: 180, trail: [] },
    controls: [slider('force', 'F', 30, 180, 110, 'N', 5), slider('load', 'd', 60, 220, 180, 'px', 5)],
    readouts: [
      { label: 'F', key: 'force', digits: 1, unit: 'N', kind: 'force' },
      { label: 'd', key: 'distance', digits: 1, unit: 'm', kind: 'default' },
      { label: 'M_O', key: 'moment', digits: 1, unit: 'N.m', kind: 'moment' }
    ]
  },
  {
    routeId: 'ch1-1-5',
    template: 'force-system-reducer',
    title: 'Thu gọn hệ lực phẳng',
    formula: '\\vec{R}=\\sum\\vec{F}_i,\\quad M_O=\\sum M_O(\\vec{F}_i)',
    visualLabel: 'Thu gọn hệ lực phẳng',
    seed: 3,
    angle: 34 * Math.PI / 180,
    appendGenericReadouts: false,
    initialState: { primary: { x: 455, y: 215 }, vector: { x: 560, y: 150 }, force: 125, load: 95, mode: 'Thu gọn', trail: [] },
    controls: [slider('force', '|R|', 50, 180, 125, 'N', 5), { type: 'buttons', key: 'mode', label: 'Chế độ', options: ['Thu gọn', 'Phân tích'] }],
    readouts: [
      { label: '|R|', key: 'resultantMagnitude', digits: 1, unit: 'N', kind: 'result' },
      { label: 'M_O', key: 'moment', digits: 1, unit: 'N.m', kind: 'moment' },
      { label: 'Chế độ', key: 'mode', kind: 'mode' }
    ]
  },
  {
    routeId: 'ch1-1-6',
    template: 'couple-free-vector',
    title: 'Mô men ngẫu lực tự do',
    formula: 'M=F\\cdot d',
    visualLabel: 'Ngẫu lực song song ngược chiều',
    seed: 4,
    angle: Math.PI / 2,
    appendGenericReadouts: false,
    initialState: { primary: { x: 410, y: 230 }, force: 90, distance: 180, trail: [] },
    controls: [slider('force', 'F', 30, 150, 90, 'N', 5), slider('distance', 'd', 80, 260, 180, 'px', 5)],
    readouts: [
      { label: 'F', key: 'force', digits: 1, unit: 'N', kind: 'force' },
      { label: 'd', key: 'distance', digits: 1, unit: 'm', kind: 'default' },
      { label: 'M', key: 'moment', digits: 1, unit: 'N.m', kind: 'moment' }
    ]
  },
  {
    routeId: 'ch1-1-8',
    template: 'constraint-release',
    family: 'support',
    title: 'Lực chủ động và phản lực liên kết',
    formula: 'N,\\ T,\\ R_x,\\ R_y,\\ M_A',
    visualLabel: 'Khóa bậc tự do',
    seed: 5,
    angle: -Math.PI / 2,
    appendGenericReadouts: false,
    initialState: { primary: { x: 380, y: 140 }, vector: { x: 380, y: 250 }, force: 110, mode: 'Tựa', trail: [] },
    controls: [{ type: 'buttons', key: 'mode', label: 'Loại liên kết', options: ['Tựa', 'Dây', 'Bản lề', 'Gối', 'Ngàm'] }],
    readouts: [
      { label: 'Loại', key: 'supportKind', kind: 'mode' },
      { label: 'Khóa', key: 'supportDof', kind: 'default' },
      { label: 'Phản lực', key: 'supportReaction', kind: 'result' },
      { label: 'Điểm đặt', key: 'primary', kind: 'default' }
    ]
  },
  {
    routeId: 'ch1-2-1',
    template: 'two-force-body',
    title: 'Cân bằng vật chịu hai lực',
    formula: '\\vec{F}_1+\\vec{F}_2=\\vec{0}',
    visualLabel: 'Hai lực cân bằng',
    seed: 6,
    angle: 0,
    appendGenericReadouts: false,
    initialState: { primary: { x: 470, y: 230 }, vector: { x: 575, y: 230 }, force: 105, angle: 0, trail: [] },
    controls: [slider('force', '|F|', 40, 170, 105, 'N', 5), slider('angle', 'α', -30, 30, 0, '°')],
    readouts: [
      { label: '|F|', key: 'force', digits: 1, unit: 'N', kind: 'force' },
      { label: 'Lệch', key: 'balanceError', digits: 1, unit: 'px', kind: 'default' },
      { label: 'Cân bằng', key: 'balanceState', kind: 'result' }
    ]
  },
  {
    routeId: 'ch1-2-3',
    template: 'parallelogram-law',
    title: 'Quy tắc hình bình hành lực',
    formula: '\\vec{R}=\\vec{F}_1+\\vec{F}_2',
    visualLabel: 'Hình bình hành lực',
    seed: 7,
    appendGenericReadouts: false,
    initialState: { primary: { x: 350, y: 180 }, secondary: { x: 380, y: 300 }, alpha: 39, force: 192, mass: 8, load: 118, mu: 0.42, trail: [] },
    controls: [slider('force', '|F1|', 60, 260, 192, 'N', 5), slider('alpha', 'α', 0, 90, 39, '°')],
    readouts: [
      { label: '|F₁|', key: 'f1Magnitude', digits: 1, unit: 'N', kind: 'force' },
      { label: '|F₂|', key: 'f2Magnitude', digits: 1, unit: 'N', kind: 'force' },
      { label: '|R|', key: 'resultantMagnitude', digits: 1, unit: 'N', kind: 'result' },
      { label: 'α', key: 'alpha', digits: 0, unit: '°', kind: 'angle' }
    ]
  },
  {
    routeId: 'ch1-2-6',
    template: 'fbd-builder',
    family: 'checker',
    title: 'Dựng sơ đồ vật thể tự do',
    formula: '\\sum\\vec{F}=\\vec{0},\\quad \\sum M_O=0',
    visualLabel: 'Giải phóng liên kết',
    seed: 8,
    appendGenericReadouts: false,
    initialState: { primary: { x: 476, y: 86 }, vector: { x: 476, y: 176 }, force: 90, mass: 8, load: 120, mu: 0.42, trail: [] },
    controls: [slider('force', '|F| sơ đồ', 20, 160, 90, 'N', 5), slider('load', '|R| liên kết', 0, 160, 120, 'N', 5)],
    readouts: [
      { label: '|F|', key: 'force', digits: 1, unit: 'N', kind: 'force' },
      { label: '|R|', key: 'resultantMagnitude', digits: 1, unit: 'N', kind: 'result' },
      { label: 'M_O', key: 'moment', digits: 1, unit: 'N.m', kind: 'moment' }
    ]
  }
];

registry.registerMany(scenes.map(scene => Object.assign({
  sceneId: `${scene.routeId}-${scene.template}`,
  visualKey: `${scene.template}-${scene.seed}`,
  family: common.family
}, scene, {
  initialState: Object.assign({}, common, scene.initialState || {})
})));

})();
