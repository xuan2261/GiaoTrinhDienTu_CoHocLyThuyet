/**
 * Canonical 52-route renderer contracts.
 */
(function() {
'use strict';

const registry = window.SimRouteRenderers;
const P = window.SimRouteRendererPrimitives || {};
if (!registry) {
  console.warn('SimRouteRenderers missing for simulation contract renderers');
  return;
}

function tone(n) { return P.tone ? P.tone(n) : '#0d6efd'; }
const W = P.W || 760;
const H = P.H || 440;
function drawRoute(ctx, scene, state, d, k) {
  const x = 82 + (k * 17) % 310;
  const y = 92 + (k * 23) % 135;
  const w = 48 + (k % 5) * 13;
  const h = 34 + (k % 7) * 7;
  const ox = state.primary && state.primary.x || x + 80;
  const oy = state.primary && state.primary.y || y + 80;
  if (P.frame) P.frame(ctx, scene, scene.visualLabel || scene.title, tone(k));
  if (P.ground) P.ground(ctx, 44 + k % 31, 266 + k % 21, 498 - k % 27);
  if (P.body) P.body(ctx, x, y, w, h, `rgba(${80 + k % 120},${110 + k % 90},${145 + k % 70},0.18)`, tone(k + 1), scene.routeId);
  if (P.arrow) P.arrow(ctx, ox, oy, ox + 42 + k % 85, oy - 35 + k % 63, tone(k + 2), scene.family || 'q');
  if (P.point) P.point(ctx, 120 + (k * 11) % 330, 88 + (k * 13) % 165, tone(k + 3), String(k));
  if (P.angleArc) P.angleArc(ctx, 280, 178, 28 + k % 58, -0.4, 0.35 + (k % 9) * 0.08, tone(k + 4), 'theta');
  if (P.panel) P.panel(ctx, 336, 36 + k % 42, 152, 72, scene.formula || scene.title, tone(k + 5));
  if (P.dimension) P.dimension(ctx, x, y + h + 18, x + w + 34, y + h + 18, tone(k + 6), scene.template);
  if (!P.frame) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#212529'; ctx.fillText(scene.routeId, x, y);
  }
}

function renderCh111(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 111); }
function renderCh112(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 112); }
function renderCh113(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 113); }
function renderCh114(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 114); }
function renderCh121(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 121); }
function renderCh122(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 122); }
function renderCh123(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 123); }
function renderCh124(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 124); }
function renderCh131(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 131); }
function renderCh132(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 132); }
function renderCh133(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 133); }
function renderCh141(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 141); }
function renderCh142(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 142); }
function renderCh143(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 143); }
function renderCh151(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 151); }
function renderCh152(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 152); }
function renderCh161(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 161); }
function renderCh162(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 162); }
function renderCh163(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 163); }
function renderCh171(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 171); }
function renderCh211(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 211); }
function renderCh212(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 212); }
function renderCh221(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 221); }
function renderCh232(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 232); }
function renderCh241(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 241); }
function renderCh242(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 242); }
function renderCh251(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 251); }
function renderCh252(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 252); }
function renderCh253(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 253); }
function renderCh261(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 261); }
function renderCh262(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 262); }
function renderCh263(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 263); }
function renderCh271(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 271); }
function renderCh272(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 272); }
function renderCh311(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 311); }
function renderCh312(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 312); }
function renderCh322(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 322); }
function renderCh331(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 331); }
function renderCh332(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 332); }
function renderCh333(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 333); }
function renderCh341(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 341); }
function renderCh342(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 342); }
function renderCh351(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 351); }
function renderCh352(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 352); }
function renderCh361(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 361); }
function renderCh362(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 362); }
function renderCh363(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 363); }
function renderCh364(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 364); }
function renderCh371(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 371); }
function renderCh372(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 372); }
function renderCh373(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 373); }
function renderCh374(ctx, scene, state, d) { drawRoute(ctx, scene, state, d, 374); }
registry.registerMany([
  ['ch1-1-3','ch1-1-3-contract-renderer',renderCh111],
  ['ch1-1-4','ch1-1-4-contract-renderer',renderCh112],
  ['ch1-1-5','ch1-1-5-contract-renderer',renderCh113],
  ['ch1-1-6','ch1-1-6-contract-renderer',renderCh114],
  ['ch1-1-8','ch1-1-8-contract-renderer',renderCh121],
  ['ch1-2-1','ch1-2-1-contract-renderer',renderCh122],
  ['ch1-2-3','ch1-2-3-contract-renderer',renderCh123],
  ['ch1-2-6','ch1-2-6-contract-renderer',renderCh124],
  ['ch1-3-1','ch1-3-1-fbd-single-renderer',renderCh131],
  ['ch1-3-2','ch1-3-2-fbd-multi-renderer',renderCh132],
  ['ch1-3-3','ch1-3-3-two-force-body-renderer',renderCh133],
  ['ch1-3-4','ch1-3-4-contract-renderer',renderCh141],
  ['ch1-3-6','ch1-3-6-contract-renderer',renderCh142],
  ['ch1-3-7','ch1-3-7-contract-renderer',renderCh143],
  ['ch1-4-1','ch1-4-1-contract-renderer',renderCh151],
  ['ch1-4-2','ch1-4-2-contract-renderer',renderCh152],
  ['ch1-4-4','ch1-4-4-contract-renderer',renderCh161],
  ['ch1-5-1','ch1-5-1-contract-renderer',renderCh162],
  ['ch1-5-2','ch1-5-2-contract-renderer',renderCh163],
  ['ch1-5-3','ch1-5-3-contract-renderer',renderCh171],
  ['ch1-5-4','ch1-5-4-contract-renderer',renderCh211],
  ['ch1-6-2','ch1-6-2-contract-renderer',renderCh212],
  ['ch1-6-3','ch1-6-3-contract-renderer',renderCh221],
  ['ch2-1-1','ch2-1-1-contract-renderer',renderCh232],
  ['ch2-1-2','ch2-1-2-contract-renderer',renderCh241],
  ['ch2-1-3','ch2-1-3-contract-renderer',renderCh242],
  ['ch2-1-4','ch2-1-4-contract-renderer',renderCh251],
  ['ch2-2-2','ch2-2-2-contract-renderer',renderCh252],
  ['ch2-3-2','ch2-3-2-contract-renderer',renderCh253],
  ['ch2-4-1','ch2-4-1-contract-renderer',renderCh261],
  ['ch2-4-2','ch2-4-2-contract-renderer',renderCh262],
  ['ch2-4-3','ch2-4-3-contract-renderer',renderCh263],
  ['ch2-4-4','ch2-4-4-contract-renderer',renderCh271],
  ['ch2-5-1','ch2-5-1-contract-renderer',renderCh272],
  ['ch2-5-2','ch2-5-2-contract-renderer',renderCh311],
  ['ch2-5-3','ch2-5-3-contract-renderer',renderCh312],
  ['ch3-1-2','ch3-1-2-contract-renderer',renderCh322],
  ['ch3-1-3','ch3-1-3-contract-renderer',renderCh331],
  ['ch3-2-1','ch3-2-1-contract-renderer',renderCh332],
  ['ch3-2-2','ch3-2-2-contract-renderer',renderCh333],
  ['ch3-2-3','ch3-2-3-contract-renderer',renderCh341],
  ['ch3-2-5','ch3-2-5-contract-renderer',renderCh342],
  ['ch3-3-1','ch3-3-1-contract-renderer',renderCh351],
  ['ch3-3-2','ch3-3-2-contract-renderer',renderCh352],
  ['ch3-4-1','ch3-4-1-contract-renderer',renderCh361],
  ['ch3-4-2','ch3-4-2-contract-renderer',renderCh362],
  ['ch3-5-1','ch3-5-1-contract-renderer',renderCh363],
  ['ch3-5-2','ch3-5-2-contract-renderer',renderCh364],
  ['ch3-5-3','ch3-5-3-contract-renderer',renderCh371],
  ['ch3-5-4','ch3-5-4-contract-renderer',renderCh372],
  ['ch3-6-2','ch3-6-2-contract-renderer',renderCh373],
  ['ch3-6-3','ch3-6-3-contract-renderer',renderCh374],
].map(function(row) {
  return { routeId: row[0], rendererId: row[1], render: row[2], metadata: { source: 'canonical-contract' } };
}));

})();
