/**
 * Route scenes for Ch1 supports and spatial equilibrium.
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for Ch1 support/spatial scenes');
  return;
}

const rows = [
  ['ch1-3-1', 'smooth-support-normal', 'support', 'Phản lực pháp tuyến tựa trơn', '\\vec{N}\\perp\\text{mặt tựa}', 'Tựa trơn - pháp tuyến', '|N|', 'alpha', 'Góc tiếp tuyến', 'N', 'Phương'],
  ['ch1-3-2', 'cable-tension', 'support', 'Lực căng dây mềm', '\\vec{T}\\parallel\\text{dây}', 'Dây mềm chịu kéo', '|T|', 'alpha', 'Hướng dây', 'Lực căng', 'Dây'],
  ['ch1-3-3', 'support-component-selector', 'support', 'Thành phần phản lực bản lề', 'A: Ax, Ay', 'Bản lề hai thành phần', '|R| bản lề', 'load', 'Chọn loại', 'Rx/Ry', 'Loại liên kết'],
  ['ch1-3-4', 'roller-pin-builder', 'support', 'Gối di động và gối cố định', 'Gối di động: N; bản lề: Ax, Ay', 'Gối di động và gối cố định', 'P', 'load', 'Vị trí tải a', 'R_A', 'R_B'],
  ['ch1-3-6', 'fixed-support', 'support', 'Phản lực tại ngàm', 'Ngàm: Rx, Ry, MA', 'Ngàm có mô men phản lực', '|R| ngàm', 'load', 'Mô men ngàm', 'MA', 'Rx/Ry'],
  ['ch1-3-7', 'two-force-member', 'support', 'Thanh hai lực theo trục', 'N dọc trục thanh', 'Thanh hai lực', '|N| dọc trục', 'alpha', 'Trục thanh', 'N dọc trục', 'Đường trục'],
  ['ch1-4-1', 'spatial-resultant', 'spatial', 'Hợp lực không gian', 'R = ΣFx i + ΣFy j + ΣFz k', 'Véc tơ chính không gian', '|R| 3D', 'load', 'Tỉ lệ Fz', 'Rxyz', 'Hình chiếu'],
  ['ch1-4-2', 'spatial-moment', 'spatial', 'Hình chiếu mô men không gian', 'MO = r x F; M_axis = MO.e', 'Mô men theo trục chiếu', '|F| theo trục', 'alpha', 'Góc trục', 'M_axis', 'MO'],
  ['ch1-4-4', 'spatial-equilibrium-board', 'spatial', 'Bảng cân bằng không gian', 'ΣFx=ΣFy=ΣFz=ΣMx=ΣMy=ΣMz=0', 'Bảng phương trình cân bằng', '|R| cân bằng', 'load', 'Tải phương trình', 'ΣF', 'ΣM']
];

function scene(row, index) {
  const [routeId, template, family, title, formula, visualLabel, forceLabel, secondKey, secondLabel, read1, read2] = row;
  const momentScale = routeId === 'ch1-3-6' ? 1 : 0.01;
  const initialPoints = {
    'ch1-3-4': { x: 380, y: 145 },
    'ch1-3-6': { x: 420, y: 128 },
    'ch1-3-7': { x: 410, y: 118 },
    'ch1-4-1': { x: 342, y: 146 },
    'ch1-4-2': { x: 310, y: 170 },
    'ch1-4-4': { x: 214, y: 126 }
  };
  const initialPrimary = initialPoints[routeId] || { x: index === 0 ? 360 : (index === 1 ? 430 : 145 + (index % 5) * 28), y: index === 0 ? 258 : (index === 1 ? 238 : 246 - (index % 4) * 20) };
  const isHingeSelector = routeId === 'ch1-3-3';
  const loadMax = isHingeSelector ? 2 : (routeId === 'ch1-3-4' ? 4.6 : (routeId === 'ch1-3-6' ? 1.8 : 180));
  const loadValue = isHingeSelector ? 1 : (routeId === 'ch1-3-4' ? 2.5 : (routeId === 'ch1-3-6' ? 1 : 100));
  const loadUnit = routeId === 'ch1-3-4' || routeId === 'ch1-3-6' ? 'm' : '%';
  return {
    routeId,
    sceneId: `${routeId}-${template}`,
    template,
    family,
    title,
    formula,
    visualKey: `${template}-${index + 11}`,
    visualLabel,
    seed: index + 11,
    supportLabel: read1,
    projection: visualLabel,
    angle: -0.7 + index * 0.04,
    readoutPolicy: { appendControls: false },
    initialState: { primary: initialPrimary, force: routeId === 'ch1-3-4' ? 130 : 76 + index * 5, load: loadValue, omega: 1.2 },
    controls: [
      { type: 'slider', key: 'force', label: forceLabel, min: routeId === 'ch1-3-4' ? 35 : 20, max: routeId === 'ch1-3-4' ? 190 : 170, value: routeId === 'ch1-3-4' ? 130 : 85, step: 5, unit: 'N' },
      { type: 'slider', key: secondKey, label: secondLabel, min: 0, max: secondKey === 'load' ? loadMax : 55, value: secondKey === 'load' ? loadValue : 20, step: isHingeSelector ? 1 : (secondKey === 'load' ? (loadUnit === 'm' ? 0.1 : 5) : 1), unit: isHingeSelector ? '' : (secondKey === 'load' ? loadUnit : 'deg'), physicalUnit: isHingeSelector ? '' : (secondKey === 'load' ? loadUnit : 'deg'), pxPerUnit: loadUnit === 'm' ? 100 : undefined }
    ],
    readouts: (isHingeSelector ? [
      { label: read1, key: 'resultantMagnitude', digits: 1, unit: 'N', kind: 'result' },
      { label: read2, key: 'supportKind', kind: 'mode' },
      { label: 'Tải P', key: 'force', digits: 1, unit: 'N', kind: 'force' }
    ] : (routeId === 'ch1-3-6' ? [
      { label: 'MA', key: 'moment', digits: 1, unit: 'N.m', kind: 'moment' },
      { label: 'Rx', key: 'rx', digits: 1, unit: 'N', kind: 'result' },
      { label: 'Ry', key: 'ry', digits: 1, unit: 'N', kind: 'result' }
    ] : [
      { label: read1, key: read1 === 'R_A' ? 'ra' : (read1.indexOf('M') >= 0 ? 'moment' : 'resultantMagnitude'), scale: read1.indexOf('M') >= 0 ? momentScale : 1, digits: 1, unit: read1.indexOf('M') >= 0 ? 'N.m' : 'N', kind: read1.indexOf('T') >= 0 ? 'force' : 'result' },
      { label: read2, key: read2 === 'R_B' ? 'rb' : (index < 2 ? 'direction' : secondKey), digits: 1, unit: read2 === 'R_B' ? 'N' : '', kind: index < 2 ? 'mode' : 'angle' }
    ])).concat(routeId === 'ch1-4-1' ? [{ label: forceLabel, key: 'force', digits: 1, unit: 'N', kind: 'force' }] : [])
  };
}

registry.registerMany(rows.map(scene));

})();
