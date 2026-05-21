const S1_SLIDER_UNIT_ROUTES = [
  'ch1-1-4',
  'ch1-1-6',
  'ch1-3-2',
  'ch1-3-4',
  'ch1-3-6',
  'ch1-4-1',
  'ch1-4-4',
  'ch1-6-2',
  'ch1-6-3',
  'ch2-3-2',
  'ch2-5-2',
  'ch2-5-3',
  'ch3-5-2',
];

const EMPTY_PANEL_ROUTES = [
  'ch2-2-2',
  'ch3-2-1',
  'ch3-2-2',
  'ch3-2-3',
  'ch3-2-5',
  'ch3-4-1',
  'ch3-4-2',
  'ch3-5-3',
  'ch3-5-4',
  'ch3-6-2',
  'ch3-6-3',
];

const AUTOPLAY_PREVIEW_ROUTES = ['ch3-5-4', 'ch3-6-2'];
const DECUONG_SHELL_ROUTES = ['ch2-1-1', 'ch2-1-4', 'ch2-7-2'];

const LABEL_COLLISION_ROUTES = [
  'ch1-3-1',
  'ch1-3-2',
  'ch1-3-3',
  'ch1-3-6',
  'ch1-3-7',
  'ch1-4-2',
  'ch1-5-1',
  'ch1-5-3',
  'ch2-1-1',
  'ch2-1-4',
  'ch2-5-2',
  'ch2-5-3',
  'ch3-5-2',
  'ch3-5-3',
  'ch3-6-2',
];

const COORDINATE_CLEANUP_ROUTES = [
  'ch1-1-3',
  'ch1-1-8',
  'ch1-6-2',
  'ch1-6-3',
  'ch2-5-2',
  'ch2-5-3',
  'ch3-5-1',
];

const REDESIGN_ROUTES = [
  'ch1-3-1',
  'ch1-3-3',
  'ch1-3-7',
  'ch1-4-2',
  'ch1-5-1',
  'ch1-5-4',
  'ch3-5-3',
];

const READOUT_UNIT_PATTERN = /(?:N|m|s|%|deg|°|rad|rad\/s|rad\/s²|kg|J|kg·m²|N·m|N·s|m\/s|m\/s²|kg·m²\/s|kg·m\/s)$/;

const REDESIGN_EXPECTED_MARKS = {
  'ch1-3-1': [/contact-point/, /surface-normal/, /normal-arc/],
  'ch1-3-3': [/force-label-f/, /link-type-label/, /reaction-offset/],
  'ch1-3-7': [/axis-aligned-member/, /in-frame-axial-arrow/],
  'ch1-4-2': [/moment-legend/, /axis-unit-e/, /axis-projection/],
  'ch1-5-1': [/contact-triangle-anchor/, /friction-offset-labels/, /no-rr-duplicate/],
  'ch1-5-4': [/wedge-apex-load/, /alpha-phi-arcs/, /attached-normal/],
  'ch3-5-3': [/angular-momentum-panel/, /rotating-mass/, /rv-vectors/],
};

module.exports = {
  S1_SLIDER_UNIT_ROUTES,
  EMPTY_PANEL_ROUTES,
  AUTOPLAY_PREVIEW_ROUTES,
  DECUONG_SHELL_ROUTES,
  LABEL_COLLISION_ROUTES,
  COORDINATE_CLEANUP_ROUTES,
  REDESIGN_ROUTES,
  READOUT_UNIT_PATTERN,
  REDESIGN_EXPECTED_MARKS,
};
