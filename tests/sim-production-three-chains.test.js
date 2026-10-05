'use strict';
// Complete CPU production chains: native DOM, canvas drawing and WebGLRenderer
// are synthetic. No browser, WebGL/pixel, AT or performance qualification.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mountProductionThree, ROUTES, copy } = require('./helpers/production-sim2-three-dom.cjs');
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
  `${actual} != ${expected} (tolerance ${tolerance})`);
const vector = (actual, expected, tolerance) => { assert.ok(actual, 'vector exists'); for (const key of Object.keys(expected)) near(actual[key], expected[key], tolerance); };
const n = (h, id) => Number(h.input(id).value);
const objects = h => { const found = []; h.sceneShell.scene.traverse(object => found.push(object)); return found; };
const meshes = (h, type) => objects(h).filter(object => object.geometry?.type === type);
const arrows = h => objects(h).filter(object => Object.hasOwn(object.userData, 'sim3PhysicalMagnitude'));
const direct = (h, type) => h.sceneShell.scene.children.filter(object => object.geometry?.type === type);
const horizontal = (x, y, elevation = 0) => ({ x, y: elevation, z: -y });
const vertical = (x, y, z = 0) => ({ x, y, z });

function arrow(h, object, expected, factor, cap = Infinity, visible = true, minimum = 0) {
  assert.ok(object, 'production arrow exists');
  const magnitude = Math.hypot(expected.x, expected.y, expected.z);
  const length = magnitude ? Math.max(minimum, Math.min(cap, magnitude * factor)) : 0;
  near(object.userData.sim3PhysicalMagnitude, magnitude);
  near(object.scale.y, length);
  assert.equal(object.visible, magnitude !== 0 && visible);
  if (!magnitude) return;
  const direction = new h.THREE.Vector3(0, 1, 0).applyQuaternion(object.quaternion);
  vector(direction, { x: expected.x / magnitude, y: expected.y / magnitude, z: expected.z / magnitude });
  // Inspect transformed real geometry endpoints, not just the adapter's debug fields.
  const [shaft, head] = object.children;
  const base = shaft.localToWorld(new h.THREE.Vector3(0, -shaft.geometry.parameters.height / 2, 0));
  const tip = head.localToWorld(new h.THREE.Vector3(0, head.geometry.parameters.height / 2, 0));
  vector(base, object.position);
  vector(tip, { x: base.x + length * expected.x / magnitude, y: base.y + length * expected.y / magnitude, z: base.z + length * expected.z / magnitude });
}
function cylinder(h, object, start, end) {
  assert.ok(object, 'production cylinder exists');
  const half = object.geometry.parameters.height / 2;
  vector(object.localToWorld(new h.THREE.Vector3(0, -half, 0)), start);
  vector(object.localToWorld(new h.THREE.Vector3(0, half, 0)), end);
}
// Independent world→logical SVG affine transform; never call Sim2Transform as oracle.
function screen(h, point) {
  const w = h.shell.tf.worldBox, s = h.shell.tf.screenBox;
  const scale = Math.min(s.width / (w.maxX - w.minX), s.height / (w.maxY - w.minY));
  return { x: s.x + (s.width - scale * (w.maxX - w.minX)) / 2 + (point.x - w.minX) * scale,
    y: s.y + (s.height - scale * (w.maxY - w.minY)) / 2 + (w.maxY - point.y) * scale };
}
function svgArrow(h, selector, base, value, factor, cap = Infinity) {
  const node = h.host.querySelector(selector); assert.ok(node, selector);
  const magnitude = Math.hypot(value.x, value.y), scale = magnitude ? Math.min(factor, cap / magnitude) : 0;
  const b = screen(h, base), e = screen(h, { x: base.x + scale * value.x, y: base.y + scale * value.y });
  near(+node.attrs.x1, b.x); near(+node.attrs.y1, b.y); near(+node.attrs.x2, e.x); near(+node.attrs.y2, e.y);
}
function label(h, id, point, dx = 0, dy = 0) {
  const node = h.sceneShell.labels.element.children.find(value => value.dataset.label === id);
  assert.ok(node, `production label ${id}`);
  // Matrix multiplication written here independently; no project/bounds/distance helper.
  const multiply = (m, a) => [0, 1, 2, 3].map(row => m[row] * a[0] + m[row + 4] * a[1] + m[row + 8] * a[2] + m[row + 12] * a[3]);
  const eye = multiply(h.sceneShell.camera.matrixWorldInverse.elements, [point.x, point.y, point.z, 1]);
  const clip = multiply(h.sceneShell.camera.projectionMatrix.elements, eye);
  const ndc = clip.slice(0, 3).map(value => value / clip[3]);
  const rect = h.sceneShell.renderer.domElement.getBoundingClientRect();
  const visible = ndc[2] > -1 && ndc[2] < 1;
  assert.equal(node.style.display, visible ? 'block' : 'none');
  if (visible) {
    near(parseFloat(node.style.left), Math.max(8, Math.min(rect.width - 8, (ndc[0] / 2 + .5) * rect.width + dx)));
    near(parseFloat(node.style.top), Math.max(16, Math.min(rect.height - 8, (-ndc[1] / 2 + .5) * rect.height + dy)));
  }
}
function frozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.ok(Object.isFrozen(value), 'every adapter snapshot object is frozen');
  Object.values(value).forEach(frozen);
}
function live(h) {
  assert.equal(h.shell.root.style.display, 'none', 'actual mode bridge selected 3D');
  assert.equal(h.nodes().find(node => node.classList.contains('sim3-fallback')).hidden, true, 'no silent fallback');
  assert.ok(h.sceneShell.scene instanceof h.THREE.Scene);
  assert.ok(h.sceneShell.renderer.info.render.frame > 1);
  assert.ok(h.sceneShell.labels.element.children.length > 0);
  assert.deepEqual(copy(h.received), h.state, 'real adapter receives the current complete state'); frozen(h.received);
  for (const value of Object.values(h.rows())) assert.doesNotMatch(value, /NaN|Infinity/);
  for (const object of objects(h)) for (const value of [...object.position.toArray(), ...object.quaternion.toArray(), ...object.scale.toArray()]) assert.ok(Number.isFinite(value));
}

const checks = {
  'ch1-1-5'(h) {
    const f1 = { x: n(h, 'F1x'), y: n(h, 'F1y') }, f2 = { x: n(h, 'F2x'), y: n(h, 'F2y') };
    const resultant = { Rx: f1.x + f2.x, Ry: f1.y + f2.y, Mo: -2 * f1.y - f1.x + 2 * f2.y + f2.x };
    vector(h.state.resultant, resultant); vector(h.debug.resultant, resultant);
    vector(h.state.forces[0].r, { x: -2, y: 1 }); vector(h.state.forces[1].r, { x: 2, y: -1 });
    vector(h.state.forces[0].F, { fx: f1.x, fy: f1.y }); vector(h.state.forces[1].F, { fx: f2.x, fy: f2.y });
    const a = arrows(h); assert.equal(a.length, 6);
    arrow(h, a[0], horizontal(f1.x, f1.y), .03); arrow(h, a[1], horizontal(f2.x, f2.y), .03);
    arrow(h, a[2], horizontal(resultant.Rx, resultant.Ry), .03); arrow(h, a[3], vertical(0, resultant.Mo), .026);
    vector(a[0].position, horizontal(-1.56, .78, .12)); vector(a[1].position, horizontal(1.56, -.78, .12));
    assert.equal(direct(h, 'TorusGeometry')[0].visible, Math.abs(resultant.Mo) > 1e-9);
    svgArrow(h, '.sim2-resultant-line', { x: 0, y: 0 }, { x: resultant.Rx, y: resultant.Ry }, .03);
    near(parseFloat(h.rows().Mo), resultant.Mo, .050001);
    label(h, 'f1', horizontal(-1.56, .78, .12), -30, -26);
  },
  'ch1-5-3'(h) {
    const beta = n(h, 'beta') * Math.PI / 180, mu = n(h, 'mu'), c = Math.cos(beta), s = Math.sin(beta);
    const margin = mu * c - s, equilibrium = Math.abs(margin) <= 1e-9 ? 'limiting' : margin > 0 ? 'static' : 'impossible';
    near(h.state.betaDeg, n(h, 'beta')); near(h.state.mu, mu); near(h.state.phiDeg, Math.atan(mu) * 180 / Math.PI);
    assert.equal(h.state.equilibriumState, equilibrium); assert.equal(h.state.slips, equilibrium === 'impossible');
    near(h.state.requiredReaction.normalOverWeight, c); near(h.state.requiredReaction.frictionOverWeight, s);
    const contact = vertical(.35 * c - .11 * s, .35 * s + .11 * c);
    const block = vertical(.35 * c - .4 * s, .35 * s + .4 * c);
    const boxes = direct(h, 'BoxGeometry'), cone = direct(h, 'ConeGeometry')[0];
    vector(boxes[1].position, block); near(boxes[0].rotation.z, beta); near(boxes[1].rotation.z, beta);
    near(cone.geometry.parameters.radius, 1.15 * mu); near(cone.geometry.parameters.height, 1.15);
    vector(cone.localToWorld(new h.THREE.Vector3(0, 1.15 / 2, 0)), contact);
    const a = arrows(h), named = name => a.find(value => value.name === name);
    arrow(h, named('N-required'), vertical(-s * c, c * c), .8);
    arrow(h, named('Ft-required'), vertical(c * s, s * s), .8);
    arrow(h, named('R-required'), vertical(0, 1), .8); arrow(h, named('weight'), vertical(0, -1), .8);
    arrow(h, a[2], vertical(-c, -s), equilibrium === 'impossible' ? .78 : .42, Infinity, equilibrium === 'impossible');
    vector(h.debug.physics.contact, contact); near(h.debug.physics.required.marginOverWeight, margin);
    label(h, 'required', { ...contact, z: .48 }, 48, -52);
  },
  'ch2-1-3'(h) {
    const phase = n(h, 'phase') * Math.PI / 180, c = Math.cos(phase), s = Math.sin(phase);
    const point = { x: 4 * c, y: 2.5 * s }, vx = -4 * s, vy = 2.5 * c, ax = -4 * c, ay = -2.5 * s;
    const speed = Math.hypot(vx, vy), radius = speed ** 3 / 10, tx = vx / speed, ty = vy / speed, nx = -ty, ny = tx;
    near(h.state.tParam, phase); vector(h.state.point, point); vector(h.state.velocity, { vx, vy }); vector(h.state.acceleration, { ax, ay });
    near(h.state.speed, speed); near(h.state.radius, radius); near(h.state.aTangential, ax * tx + ay * ty); near(h.state.aNormal, speed * speed / radius);
    vector(h.state.tangent, { x: tx, y: ty }); vector(h.state.normal, { x: nx, y: ny });
    const p = horizontal(point.x * .54, point.y * .54, .14), center = horizontal((point.x + nx * radius) * .54, (point.y + ny * radius) * .54, .14);
    const a = arrows(h); arrow(h, a[0], horizontal(tx, ty), .9); arrow(h, a[1], horizontal(nx, ny), .82);
    vector(a[0].position, p); vector(direct(h, 'SphereGeometry')[0].position, p);
    const circle = direct(h, 'TorusGeometry')[0]; vector(circle.position, center); near(circle.geometry.parameters.radius * circle.scale.x, radius * .54);
    cylinder(h, direct(h, 'CylinderGeometry')[0], p, center); near(parseFloat(h.rows().R), radius, .000050001);
    label(h, 'tau', p, 56, -32);
  },
  'ch2-2-2'(h) {
    const t = h.state.time, w0 = n(h, 'omega0'), alpha = n(h, 'alphaAcc'), phi = w0 * t + .5 * alpha * t * t, w = w0 + alpha * t;
    const c = Math.cos(phi), s = Math.sin(phi), v = { x: -3 * w * s, y: 3 * w * c }, at = { x: -3 * alpha * s, y: 3 * alpha * c }, an = { x: -3 * w * w * c, y: -3 * w * w * s };
    near(h.state.phi, phi); near(h.state.omega, w); near(h.state.speed, 3 * w); near(h.state.radius, 3);
    vector(h.state.velocity, v); vector(h.state.accelerationTangential, at); vector(h.state.accelerationNormal, an);
    const a = arrows(h); arrow(h, a[0], vertical(0, w), .6, 1.6); arrow(h, a[1], horizontal(v.x, v.y), .46, 1.05);
    arrow(h, a[2], horizontal(at.x, at.y), .15, 1.2, h.state.showTangential); arrow(h, a[3], horizontal(an.x, an.y), .15, 1.2, h.state.showNormal);
    vector(direct(h, 'SphereGeometry')[0].position, horizontal(1.22 * c, 1.22 * s, .16)); near(direct(h, 'CylinderGeometry')[0].rotation.y, phi);
    svgArrow(h, '.sim2-acceleration-tangential', { x: 3 * c, y: 3 * s }, at, .15, 1.2);
    svgArrow(h, '.sim2-acceleration-normal', { x: 3 * c, y: 3 * s }, an, .15, 1.2);
    label(h, 'point-m', horizontal(1.22 * c, 1.22 * s, .16), 18, -18);
  },
  'ch2-3-2'(h) {
    const r1 = n(h, 'r1'), r2 = n(h, 'r2'), t = h.state.time, ratio = r1 / r2;
    near(h.state.r1, r1); near(h.state.r2, r2); near(h.state.omega1, 1); near(h.state.gearOmega2, -ratio); near(h.state.beltOmega2, ratio);
    near(h.state.gearPhi1, t); near(h.state.gearPhi2, -ratio * t); near(h.state.beltPhi2, ratio * t); near(h.state.beltSpeed, r1);
    near(parseFloat(h.rows().gearRatio12), -r2 / r1, .00050001); near(parseFloat(h.rows().beltRatio12), r2 / r1, .00050001);
    const wheels = h.sceneShell.scene.children.filter(object => object.type === 'Group' && object.children.some(child => child.geometry?.parameters.radiusTop === 1));
    assert.equal(wheels.length, 4);
    const centers = [vertical(-1.48, 1.12, -1.22), vertical(-1.48 + (r1 + r2) / 2, 1.12, -1.22), vertical(-1.62, -.22, 1.28), vertical(1.82, -.22, 1.28)];
    wheels.forEach((wheel, i) => { vector(wheel.position, centers[i]); near(wheel.scale.x, (i % 2 ? r2 : r1) / 2); near(wheel.rotation.z, [t, -ratio * t, t, ratio * t][i]); });
    const ax = (r1 - r2) / (2 * 3.44), ay = Math.sqrt(1 - ax * ax);
    const tangency = (i, sign) => vertical(centers[i + 2].x + (i ? r2 : r1) / 2 * ax, -.22 + sign * (i ? r2 : r1) / 2 * ay, 1.28);
    const belts = direct(h, 'CylinderGeometry').filter(object => object.geometry.parameters.radiusTop === .055);
    cylinder(h, belts[0], tangency(0, 1), tangency(1, 1)); cylinder(h, belts[1], tangency(0, -1), tangency(1, -1));
    const wraps = direct(h, 'BufferGeometry').filter(object => object.type === 'Line');
    for (let i = 0; i < 2; i++) {
      const positions = wraps[i].geometry.attributes.position;
      for (let k = 0; k < positions.count; k++) { near(Math.hypot(positions.getX(k) - centers[i + 2].x, positions.getY(k) + .22), (i ? r2 : r1) / 2, 2e-7); near(positions.getZ(k), 1.28, 1e-7); }
    }
    const a = arrows(h); [1, -ratio, 1, ratio].forEach((w, i) => arrow(h, a[i], vertical(0, 0, w), .42, .42, true, .08));
    label(h, 'gear-system', centers[0], -16, -46);
  },
  'ch2-4-4'(h) {
    const t = h.state.time, w = n(h, 'omega'), vmax = n(h, 'vRel'), q = vmax * t / 1.5, phi = w * t, c = Math.cos(phi), s = Math.sin(phi);
    const radius = 2 + 1.5 * Math.sin(q), speed = vmax * Math.cos(q), radialA = -vmax * vmax / 1.5 * Math.sin(q);
    const p = { x: radius * c, y: radius * s }, v = { x: speed * c, y: speed * s }, cor = { x: -2 * w * speed * s, y: 2 * w * speed * c };
    near(h.state.phi, phi); near(h.state.radius, radius); near(h.state.vRel, speed); vector(h.state.point, p); vector(h.state.vRelVec, v); vector(h.state.aCor, cor);
    vector(h.state.aRelative, { x: radialA * c, y: radialA * s }); vector(h.state.aTransport, { x: -w * w * p.x, y: -w * w * p.y });
    vector(h.state.aAbsolute, { x: (radialA - w * w * radius) * c + cor.x, y: (radialA - w * w * radius) * s + cor.y });
    vector(h.state.vAbsolute, { x: v.x - w * p.y, y: v.y + w * p.x }); near(cor.x * v.x + cor.y * v.y, 0);
    const a = arrows(h); arrow(h, a[0], vertical(0, 0, w), .55, 1.8); arrow(h, a[1], vertical(v.x, v.y), .6, 1.8); arrow(h, a[2], vertical(cor.x, cor.y), .13, 1.8);
    const bead = direct(h, 'SphereGeometry')[0]; vector(bead.position, vertical(.55 * p.x, .55 * p.y, .16));
    svgArrow(h, '.sim2-vector-vrel', p, v, 1.6, 2.2); svgArrow(h, '.sim2-vector-coriolis', p, cor, .42, 2.3);
    const ring = direct(h, 'RingGeometry')[0]; near(ring.rotation.z, Math.atan2(v.y, v.x));
    label(h, 'bead', vertical(.55 * p.x, .55 * p.y, .16), -34, 34);
  },
  'ch2-5-3'(h) {
    const w = n(h, 'omega'), x = n(h, 'icx'), y = n(h, 'icy'), vx = -w * (1.5 - y), vy = w * (2 - x);
    near(h.state.omega, w); vector(h.state.ic, { x, y }); vector(h.state.vM, { vx, vy, mag: Math.hypot(vx, vy) });
    const a = arrows(h); assert.equal(a.length, 9); arrow(h, a[0], vertical(vx, vy), .24, 2.2); arrow(h, a[1], vertical(0, 0, w), .55, 2.2);
    vector(direct(h, 'SphereGeometry')[0].position, vertical(.55 * x, .55 * y)); vector(direct(h, 'SphereGeometry')[1].position, vertical(1.1, .825));
    for (const measurement of h.state.measurements) { near(measurement.velocity.x, -w * (measurement.point.y - y)); near(measurement.velocity.y, w * (measurement.point.x - x)); }
    svgArrow(h, '.sim2-vector-vrel', { x: 2, y: 1.5 }, { x: vx, y: vy }, .4, 1.8);
    label(h, 'instant-center', vertical(.55 * x, .55 * y), -34, -32);
  },
  'ch3-1-3'(h) {
    const a = n(h, 'a'), theta = Math.atan(a / 9.81), c = Math.cos(theta), s = Math.sin(theta);
    near(h.state.aFrame, a); near(h.state.theta, theta); near(h.state.tension, Math.hypot(a, 9.81)); vector(h.state.fIner, { fx: -a, fy: 0 });
    vector(h.state.bob, { x: -3 * s, y: 5 - 3 * c }); vector(h.state.tensionForce, { x: a, y: 9.81 });
    const bob = vertical(-1.35 * s, 1.95 - 1.35 * c), pivot = vertical(0, 1.95);
    vector(direct(h, 'SphereGeometry')[0].position, bob); cylinder(h, direct(h, 'CylinderGeometry')[0], pivot, bob);
    const arr = arrows(h); arrow(h, arr[0], vertical(0, -9.81), .05); arrow(h, arr[1], vertical(a, 9.81), .05);
    arrow(h, arr[2], vertical(a, 0), .22, 1.5); arrow(h, arr[3], vertical(-a, 0), .05, Infinity, h.state.referenceFrame === 'car');
    const arc = direct(h, 'TorusGeometry')[0]; near(arc.geometry.parameters.arc, theta); assert.equal(arc.visible, theta > 1e-8);
    vector(h.debug.physics.groundForceSum, vertical(a, 0)); label(h, 'theta', bob, 20, -22);
  },
  'ch3-5-3'(h) {
    const r = n(h, 'r'), phi = h.state.phi, inertia = 4 * r * r, omega = 36 / inertia, energy = 36 * 36 / (2 * inertia);
    near(h.state.r, r); near(h.state.inertia, inertia); near(h.state.omega, omega); near(h.state.angularMomentum, 36); near(h.state.rotationalEnergy, energy); near(h.state.workFromInitial, energy - 18);
    const p = horizontal(.62 * r * Math.cos(phi), .62 * r * Math.sin(phi));
    const masses = meshes(h, 'SphereGeometry').filter(object => object.geometry.parameters.radius === .18);
    vector(masses[0].position, p); vector(masses[1].position, { x: -p.x, y: 0, z: -p.z });
    const rods = meshes(h, 'CylinderGeometry').filter(object => object.geometry.parameters.radiusTop === .035);
    cylinder(h, rods[0], vertical(0, 0), p); cylinder(h, rods[1], vertical(0, 0), { x: -p.x, y: 0, z: -p.z });
    arrow(h, arrows(h)[0], vertical(0, 36), .06, 1.8); near(parseFloat(h.rows().energy), energy, .000005001);
    const energyLabel = h.sceneShell.labels.element.children.find(node => node.dataset.label === 'energy'); assert.equal(energyLabel.textContent, 'E quay = ' + energy.toFixed(2) + ' J');
    label(h, 'mass-1', p, 22, -12);
  },
  'ch3-6-2'(h) {
    const m1 = n(h, 'm1'), m2 = n(h, 'm2'), e = n(h, 'e'), t = h.state.time, hit = 1.75;
    const momentum = 2.2 * m1 - m2, after1 = (momentum - m2 * e * 3.2) / (m1 + m2), after2 = (momentum + m1 * e * 3.2) / (m1 + m2);
    const collided = t >= hit - 1e-10, v1 = collided ? after1 : 2.2, v2 = collided ? after2 : -1;
    const x1 = -4 + 2.2 * Math.min(t, hit) + after1 * Math.max(0, t - hit), x2 = 3 - Math.min(t, hit) + after2 * Math.max(0, t - hit);
    near(h.state.m1, m1); near(h.state.m2, m2); near(h.state.e, e); assert.equal(h.state.collided, collided);
    vector(h.state.p1, { x: x1, y: 0 }, 2e-9); vector(h.state.p2, { x: x2, y: 0 }, 2e-9); vector(h.state.v1, { x: v1, y: 0 }); vector(h.state.v2, { x: v2, y: 0 });
    near(m1 * h.state.v1.x + m2 * h.state.v2.x, momentum);
    const loss = .5 * (m1 * m2 / (m1 + m2)) * (1 - e * e) * 3.2 ** 2;
    near(parseFloat(h.rows().lossPredict), loss, .000000501); near(parseFloat(h.rows().energyLoss), collided ? loss : 0, .005001);
    const balls = direct(h, 'SphereGeometry'); vector(balls[0].position, vertical(.48 * x1, 0)); vector(balls[1].position, vertical(.48 * x2, 0));
    near(balls[0].geometry.parameters.radius * balls[0].scale.x, .288); near(balls[1].geometry.parameters.radius * balls[1].scale.x, .384);
    const arr = arrows(h); arrow(h, arr[0], vertical(v1, 0), .44, 1.85); arrow(h, arr[1], vertical(v2, 0), .44, 1.85);
    assert.equal(direct(h, 'TorusGeometry')[0].visible, collided);
    if (collided) { near(h.state.impactTime, hit); vector(h.state.impactContact.p1, { x: -.15, y: 0 }); vector(h.state.impactContact.p2, { x: 1.25, y: 0 }); vector(h.state.impactPoint, { x: .45, y: 0 }); near(h.debug.physics.contactResidual, 0); near(v2 - v1, e * 3.2); }
    label(h, 'before', vertical(-1.92, .12, -.36), -60, -46);
  }
};

const cases = {
  'ch1-1-5': [{ F1x: 0, F1y: 0, F2x: 0, F2y: 0 }, { F1x: 20, F1y: -30, F2x: -20, F2y: 30 }, { F1x: 25.3, F1y: 47.1, F2x: -13.7, F2y: -25.9 }],
  'ch1-5-3': [{ beta: 3, mu: .1 }, { beta: 60, mu: .1 }, { beta: Math.atan(.45) * 180 / Math.PI, mu: .45 }, { beta: 45, mu: 1 }],
  'ch2-1-3': [0, 37.193, 90, 180, 270, 360].map(phase => ({ phase })),
  'ch2-2-2': [{ omega0: 0, alphaAcc: 0 }, { omega0: 2, alphaAcc: .5 }, { omega0: .713, alphaAcc: .137 }],
  'ch2-3-2': [{ r1: .8, r2: .8 }, { r1: .8, r2: 2.5 }, { r1: 2.5, r2: .8 }, { r1: 1.713, r2: 2.173 }],
  'ch2-4-4': [{ omega: .4, vRel: .5 }, { omega: 2.5, vRel: 3 }, { omega: 1.713, vRel: 2.173 }],
  'ch2-5-3': [{ omega: -2.5, icx: -4, icy: -3 }, { omega: 0, icx: 4, icy: 3 }, { omega: 1.713, icx: 2, icy: 1.5 }],
  'ch3-1-3': [{ a: 0 }, { a: 8 }, { a: 3.713 }],
  'ch3-5-3': [{ r: .8 }, { r: 3.5 }, { r: 1.713 }],
  'ch3-6-2': [{ e: 0, m1: 1, m2: 5 }, { e: 1, m1: 5, m2: 1 }, { e: .713, m1: 2.173, m2: 4.713 }]
};
const dynamic = new Set(['ch2-2-2', 'ch2-3-2', 'ch2-4-4', 'ch3-5-3', 'ch3-6-2']);
function check(h) { live(h); checks[h.route](h); }
function configure(h, values) { for (const [id, value] of Object.entries(values)) { h.edit(id, value); near(n(h, id), value); } }
function steps(h, count) { for (let i = 0; i < count; i++) h.playback('step'); }

for (const route of ROUTES) test(`${route}: actual production controls → physical state → real Three geometry and label projection`, t => {
  const h = mountProductionThree(route); t.after(h.dispose); h.mode('3d'); check(h);
  for (const values of cases[route]) {
    if (dynamic.has(route)) h.playback('reset');
    configure(h, values); check(h);
    if (dynamic.has(route)) {
      const count = route === 'ch2-4-4' ? 150 : route === 'ch3-6-2' ? 110 : 37;
      steps(h, count);
      if (route === 'ch3-5-3') near(h.state.phi, (9 / (values.r * values.r)) * count / 60);
      else near(h.state.time, count / 60);
      check(h);
    }
  }
});

function disposedScene(h, scene) {
  assert.equal(scene.labels.countVisible(), 0); assert.equal(scene.labels.element.parentNode, null);
  assert.equal(scene.host.parentNode, null); assert.equal(scene.renderer.domElement.parentNode, null);
  assert.equal(scene.renderer.disposeCount, 1); assert.equal(scene.renderer.contextLossCount, 1); assert.equal(scene.renderer.renderLists.disposeCount, 1);
  const owned = [...h.resources.values()].filter(record => record.scene === scene.scene);
  assert.ok(owned.length > 0);
  for (const record of owned) assert.equal(record.disposeCount, 1, `${record.resource.type} released once`);
}
function disposed(h) {
  assert.equal(h.host.children.length, 0); assert.equal(h.frames.size, 0); assert.equal(h.timers.size, 0);
  for (const node of h.all) assert.equal(Object.values(node.listeners).reduce((sum, listeners) => sum + listeners.length, 0), 0, 'owned node/window listeners removed');
  h.scenes.forEach(scene => disposedScene(h, scene));
}

for (const route of ROUTES) test(`${route}: 20 real 2D/3D cycles preserve state, controls and release owned resources`, t => {
  const h = mountProductionThree(route); t.after(h.dispose);
  configure(h, cases[route].at(-1));
  if (dynamic.has(route)) steps(h, 11);
  const firstNumber = h.nodes().find(node => node.type === 'number');
  for (let cycle = 0; cycle < 20; cycle++) {
    const before = copy(h.state), rows = h.rows(); h.mode('3d');
    assert.equal(h.scenes.length, cycle + 1); check(h); assert.deepEqual(h.state, before);
    for (const node of h.nodes().filter(value => value.type === 'number' || value.attrs['data-action'] || value.classList.contains('sim2-playback'))) {
      for (let parent = node; parent; parent = parent.parentNode) assert.notEqual(parent, h.shell.root, 'controls stay outside hidden 2D viewport');
    }
    // An actual numeric change while 3D is mounted must update this adapter,
    // including geometry. Returning to the original value must also propagate.
    const id = firstNumber.attrs['data-number-for'] || firstNumber.attrs['data-id'], previous = Number(firstNumber.value);
    const next = previous === Number(firstNumber.min) ? Number(firstNumber.max) : Number(firstNumber.min);
    h.edit(id, next); check(h); h.edit(id, previous); check(h);
    // Clocked parameter edits legitimately reset some routes. Observe the final
    // state *before* the toggle so preservation is not confused with reset.
    const changed = copy(h.state), changedRows = h.rows(), scene = h.sceneShell;
    h.mode('2d'); assert.notEqual(h.shell.root.style.display, 'none');
    assert.deepEqual(h.state, changed); assert.deepEqual(h.rows(), changedRows);
    assert.equal(h.nodes().filter(node => node.classList.contains('sim3-host')).length, 0);
    disposedScene(h, scene);
    assert.equal(h.frames.size, 0, 'paused/static state remains demand-rendered');
    if (!dynamic.has(route)) { assert.deepEqual(h.state, before); assert.deepEqual(h.rows(), rows); }
  }
  // Dispose with 3D mounted and a queued playback frame, not only after 2D release.
  h.mode('3d'); if (dynamic.has(route)) h.playback('playpause');
  h.dispose(); disposed(h); h.dispose(); disposed(h);
  const state = copy(h.state); firstNumber.value = '999'; firstNumber.emit('change'); h.frame(100000);
  assert.deepEqual(h.state, state, 'orphan controls/frames cannot mutate disposed state');
});

for (const route of ROUTES) test(`${route}: production clock controls or explicitly static no-clock behavior`, t => {
  const h = mountProductionThree(route); t.after(h.dispose); h.mode('3d');
  assert.equal(h.frames.size, 0);
  if (!dynamic.has(route)) {
    assert.equal(h.clocks.length, 0, 'static route has no fabricated simulation clock');
    assert.equal(h.nodes().some(node => node.classList.contains('sim2-playback')), false);
    const before = copy(h.state); h.frame(1000); h.frame(2000); assert.deepEqual(h.state, before); check(h);
    return;
  }
  assert.equal(h.clocks.length, 1);
  const playing = () => h.nodes().find(node => node.classList.contains('sim2-playpause'));
  const initial = copy(h.state); steps(h, 1); near(h.shell.getSimulationTime(), 1 / 60);
  if (route === 'ch3-5-3') near(h.state.phi, 1 / 60); else near(h.state.time, 1 / 60);
  h.playback('playpause'); assert.equal(h.frames.size, 1); assert.equal(playing().attrs['aria-label'], 'Tạm dừng');
  h.frame(1000); h.frame(1100); near(h.shell.getSimulationTime(), 7 / 60);
  near(route === 'ch3-5-3' ? h.state.phi : h.state.time, 7 / 60); check(h);
  h.playback('playpause'); assert.equal(h.frames.size, 0); assert.equal(playing().attrs['aria-label'], 'Chạy');
  const paused = copy(h.state); h.frame(9000); assert.deepEqual(h.state, paused);
  h.playback('playpause'); h.frame(10000); assert.deepEqual(h.state, paused, 'resume primes timestamp without catching up paused wall time');
  h.frame(10100); near(h.shell.getSimulationTime(), 13 / 60);
  near(route === 'ch3-5-3' ? h.state.phi : h.state.time, 13 / 60); check(h);
  h.playback('reset'); near(h.shell.getSimulationTime(), 0); assert.equal(h.frames.size, 0); assert.deepEqual(h.state, initial); check(h);
});

test('the fixture loads the full production stack, actual registry and exactly ten supported adapters', () => {
  assert.deepEqual(ROUTES, ['ch1-1-5', 'ch1-5-3', 'ch2-1-3', 'ch2-2-2', 'ch2-3-2', 'ch2-4-4', 'ch2-5-3', 'ch3-1-3', 'ch3-5-3', 'ch3-6-2']);
  const h = mountProductionThree('ch2-4-4');
  try {
    for (const source of ['lib/three/three.umd.min.js', 'js/sim2/registry.js', 'js/sim2/physics/statics.js', 'js/sim2/physics/kinematics.js', 'js/sim2/physics/dynamics.js',
      ...['palette', 'transform', 'svg-render', 'overlay', 'canvas-underlay', 'animation-clock', 'controls', 'panel', 'sim-shell'].map(name => `js/sim2/core/${name}.js`),
      ...['coordinate-system', 'three-primitives', 'visual-kit', 'three-label-layer', 'three-dispose', 'three-shell', 'mode-toggle'].map(name => `js/sim3/core/${name}.js`),
      'js/sim2/sims/ch2/ch2-4-4.js', 'js/sim3/sims/ch2-4-4-3d.js']) assert.ok(h.sources.includes(source), source);
    assert.deepEqual(copy(h.root.Sim2Registry.list()), ['ch2-4-4']);
    assert.equal(h.root.Sim2Registry.get('ch2-4-4'), h.root.SIM_MAP['ch2-4-4']);
    h.mode('3d'); check(h);
  } finally { h.dispose(); }
});

test('static reset, scale, frame and signed-field actions propagate through actual adapters', () => {
  for (const route of ['ch1-1-5', 'ch1-5-3', 'ch2-1-3', 'ch2-5-3', 'ch3-1-3']) {
    const h = mountProductionThree(route);
    try {
      const initial = copy(h.state), rows = h.rows(); h.mode('3d'); configure(h, cases[route].at(-1));
      if (route === 'ch2-1-3') {
        const before = copy(h.state); h.action('toggle-scale'); assert.equal(h.state.lockScale, true);
        assert.deepEqual({ ...h.state, lockScale: before.lockScale }, before); near(parseFloat(h.rows().scale), .3); check(h);
        h.action('toggle-scale'); assert.equal(h.state.lockScale, false);
      }
      if (route === 'ch3-1-3') {
        const before = copy(h.state); h.action('frame-ground'); assert.equal(h.state.referenceFrame, 'ground');
        assert.deepEqual({ ...h.state, referenceFrame: before.referenceFrame }, before); check(h);
        assert.equal(h.sceneShell.labels.element.children.find(node => node.dataset.label === 'f').style.display, 'none');
        h.action('frame-car'); assert.equal(h.state.referenceFrame, 'car'); check(h);
      }
      if (route === 'ch2-5-3') {
        h.action('reverse-omega'); near(h.state.omega, -1.713); check(h);
        h.action('rest-field'); near(h.state.omega, 0); check(h);
        const omega = h.sceneShell.labels.element.children.find(node => node.dataset.label === 'omega'); assert.equal(omega.textContent, 'ω = 0');
        h.action('reverse-omega'); near(h.state.omega, 0);
        h.edit('omega', -1.25); h.action('zero-sample'); vector(h.state.ic, { x: 2, y: 1.5 }); near(h.state.vM.mag, 0); check(h);
      }
      const action = route === 'ch2-1-3' ? 'reset-phase' : route === 'ch2-5-3' ? 'reset-field' : 'reset';
      h.action(action); assert.deepEqual(h.state, initial); assert.deepEqual(h.rows(), rows); check(h);
    } finally { h.dispose(); disposed(h); }
  }
});

test('rotation visibility actions change acceleration display without changing physical vectors', t => {
  const h = mountProductionThree('ch2-2-2'); t.after(h.dispose); h.mode('3d'); steps(h, 60);
  const before = copy(h.state);
  for (const [action, field] of [['toggle-tangential', 'showTangential'], ['toggle-normal', 'showNormal']]) {
    h.action(action); assert.equal(h.state[field], false); check(h);
    assert.deepEqual({ ...h.state, [field]: true }, before); h.action(action); check(h); assert.deepEqual(h.state, before);
  }
});

test('angular momentum compare and radius actions retain phase/L while accounting for work', t => {
  const h = mountProductionThree('ch3-5-3'); t.after(h.dispose); h.mode('3d'); steps(h, 30);
  near(h.state.phi, .5); h.action('radius-full'); h.action('capture-state');
  near(h.state.referenceRadius, 3); near(h.state.rotationalEnergy, 18);
  h.action('radius-half'); near(h.state.r, 1.5); near(h.state.phi, .5); near(h.state.omega, 4); near(h.state.rotationalEnergy, 72); near(h.state.workFromInitial, 54); check(h);
  near(parseFloat(h.rows().deltaEnergy), 54); steps(h, 30); near(h.state.phi, 2.5);
  h.action('capture-state'); near(h.state.referenceRadius, 1.5); near(parseFloat(h.rows().deltaEnergy), 0);
  h.action('radius-full'); near(h.state.phi, 2.5); near(h.state.angularMomentum, 36); near(parseFloat(h.rows().deltaEnergy), -54); check(h);
});

test('collision event actions, impact pause and retained end-of-lane state use the real clock and adapter', t => {
  const h = mountProductionThree('ch3-6-2'); t.after(h.dispose); h.mode('3d');
  for (const values of cases['ch3-6-2']) {
    configure(h, values);
    for (const [action, time, phase] of [['before-impact', 1.7, 'before'], ['at-impact', 1.75, 'impact'], ['after-impact', 1.8, 'after']]) {
      h.action(action); near(h.state.time, time); near(h.shell.getSimulationTime(), time); assert.equal(h.state.eventPhase, phase); assert.equal(h.frames.size, 0); check(h);
      const caption = h.sceneShell.labels.element.children.find(node => node.dataset.label === 'impact');
      assert.equal(caption.textContent, phase === 'before' ? 'Chưa va chạm' : phase === 'impact' ? 'Đúng tiếp xúc' : 'Đã va chạm');
    }
  }
  configure(h, { e: .7, m1: 2, m2: 3 }); h.action('toggle-impact-pause'); assert.equal(h.state.pauseOnImpact, true);
  h.playback('playpause'); h.frame(1000);
  for (let timestamp = 1100; timestamp <= 4000 && h.frames.size; timestamp += 100) h.frame(timestamp);
  near(h.state.time, 1.75); assert.equal(h.state.eventPhase, 'impact'); assert.equal(h.frames.size, 0); check(h);
  h.action('toggle-impact-pause'); assert.equal(h.state.pauseOnImpact, false); h.playback('playpause'); h.frame(5000);
  // The first boundary belongs to ball 2: x2=1.25 at impact, radius=.8,
  // post-impact speed=1.176 m/s, right lane edge=6. No renderer metric involved.
  const terminal = 1.75 + (6 - .8 - 1.25) / 1.176;
  for (let timestamp = 5100; timestamp <= 9000 && !h.state.retained; timestamp += 100) h.frame(timestamp);
  assert.equal(h.state.retained, true); near(h.state.time, terminal); near(h.shell.getSimulationTime(), terminal); assert.equal(h.frames.size, 0); check(h);
  const retained = copy(h.state); h.playback('step'); h.playback('playpause'); h.frame(10000); assert.deepEqual(h.state, retained); assert.equal(h.frames.size, 0);
  assert.equal(h.sceneShell.labels.element.children.find(node => node.dataset.label === 'impact').textContent, 'Giữ kết quả');
  h.playback('reset'); near(h.state.time, 0); assert.equal(h.state.retained, false); assert.equal(h.state.eventPhase, 'before'); check(h);
});

function canvasFrame(h) {
  const calls = h.shell.canvas.ctx.calls;
  return calls.slice(calls.findLastIndex(call => call.method === 'clearRect') + 1);
}
function commandPoint(call, expected) { near(call.args[0], expected.x); near(call.args[1], expected.y); }

test('production canvas underlay transforms all 63 signed velocity segments and dots', t => {
  const h = mountProductionThree('ch2-5-3'); t.after(h.dispose); h.mode('3d');
  for (const values of cases['ch2-5-3']) {
    configure(h, values); const commands = canvasFrame(h), starts = commands.filter(call => call.method === 'moveTo'), ends = commands.filter(call => call.method === 'lineTo'), dots = commands.filter(call => call.method === 'arc');
    assert.equal(starts.length, 63); assert.equal(ends.length, 63); assert.equal(dots.length, 63);
    let index = 0, capped = 0;
    for (let x = -4; x <= 4; x++) for (let y = -3; y <= 3; y++) {
      const vx = -values.omega * (y - values.icy), vy = values.omega * (x - values.icx), magnitude = Math.hypot(vx, vy), scale = magnitude ? Math.min(.18, .9 / magnitude) : 0;
      commandPoint(starts[index], screen(h, { x, y })); commandPoint(dots[index], screen(h, { x, y }));
      commandPoint(ends[index], screen(h, { x: x + scale * vx, y: y + scale * vy })); near(dots[index].args[2], 1.5);
      if (magnitude * .18 > .9) capped++; index++;
    }
    assert.equal(parseInt(h.rows().fieldCap, 10), capped); check(h);
  }
});

test('production canvas trails carry independently computed Coriolis and collision positions', () => {
  for (const route of ['ch2-4-4', 'ch3-6-2']) {
    const h = mountProductionThree(route);
    try {
      h.mode('3d'); steps(h, 12); check(h);
      const commands = canvasFrame(h), starts = commands.filter(call => call.method === 'moveTo'), ends = commands.filter(call => call.method === 'lineTo');
      if (route === 'ch2-4-4') {
        assert.equal(starts.length, 1); assert.equal(ends.length, 12); commandPoint(starts[0], screen(h, { x: 2, y: 0 }));
        for (let i = 0; i < 12; i++) { const time = (i + 1) / 60, r = 2 + 1.5 * Math.sin(time); commandPoint(ends[i], screen(h, { x: r * Math.cos(1.2 * time), y: r * Math.sin(1.2 * time) })); }
      } else {
        assert.equal(starts.length, 2); assert.equal(ends.length, 22);
        commandPoint(starts[0], screen(h, { x: -4 + 2.2 / 60, y: 0 })); commandPoint(starts[1], screen(h, { x: 3 - 1 / 60, y: 0 }));
        for (let i = 0; i < 11; i++) { const time = (i + 2) / 60; commandPoint(ends[i], screen(h, { x: -4 + 2.2 * time, y: 0 })); commandPoint(ends[i + 11], screen(h, { x: 3 - time, y: 0 })); }
      }
    } finally { h.dispose(); disposed(h); }
  }
});

test('actual label layer clamps synthetic projection coordinates, updates text and removes ownership', t => {
  const h = mountProductionThree('ch3-5-3'); t.after(h.dispose); h.mode('3d');
  const layer = h.sceneShell.labels, count = layer.element.children.length, point = vertical(0, 0);
  assert.equal(count, 5); assert.equal(layer.countVisible(), 5, 'all five known default scene labels project inside the depth range');
  const probe = layer.add('cpu-projection-probe', 'first', () => point, { dx: 100000, dy: -100000 });
  assert.equal(layer.countVisible(), 6, 'adding a visible projected label increments the count');
  label(h, 'cpu-projection-probe', point, 100000, -100000);
  const rect = h.sceneShell.renderer.domElement.getBoundingClientRect(); near(parseFloat(probe.style.left), rect.width - 8); near(parseFloat(probe.style.top), 16);
  const updated = layer.add('cpu-projection-probe', 'second', () => point, { dx: -100000, dy: 100000 });
  assert.equal(updated, probe); assert.equal(probe.textContent, 'second'); assert.equal(layer.element.children.length, count + 1);
  label(h, 'cpu-projection-probe', point, -100000, 100000); near(parseFloat(probe.style.left), 8); near(parseFloat(probe.style.top), rect.height - 8);
  // Camera basis columns supply known eye-space targets without calling
  // Three.project/unproject or the label layer's own projection helpers.
  const m = h.sceneShell.camera.matrixWorld.elements;
  function cameraTarget(distance, right = 0, up = 0) {
    return { x: m[12] - m[8] * distance + m[0] * right + m[4] * up,
      y: m[13] - m[9] * distance + m[1] * right + m[5] * up,
      z: m[14] - m[10] * distance + m[2] * right + m[6] * up };
  }
  for (const distance of [-1, .01, 200]) {
    const outsideDepth = cameraTarget(distance);
    layer.add('cpu-projection-probe', 'outside depth', () => outsideDepth);
    label(h, 'cpu-projection-probe', outsideDepth); assert.equal(probe.style.display, 'none');
    assert.equal(layer.countVisible(), 5, 'hidden probe is excluded from the visible count');
  }
  for (const sign of [-1, 1]) {
    const outsideEdge = cameraTarget(5, sign * 10000, sign * 10000);
    layer.add('cpu-projection-probe', 'outside edge', () => outsideEdge);
    label(h, 'cpu-projection-probe', outsideEdge); assert.equal(probe.style.display, 'block');
    assert.equal(layer.countVisible(), 6, 'edge-clamped probe becomes visible again');
    near(parseFloat(probe.style.left), sign > 0 ? rect.width - 8 : 8);
    near(parseFloat(probe.style.top), sign > 0 ? 16 : rect.height - 8);
  }
  layer.remove('cpu-projection-probe'); assert.equal(probe.parentNode, null); assert.equal(layer.element.children.length, count); assert.equal(layer.countVisible(), 5);
});

// Faults exist only in VM source strings. Product files stay byte-for-byte
// unchanged. Each route's geometry oracle must reject its own scale mutation.
const adapterMutations = {
  'ch1-1-5': ['const scale = 0.78', 'const scale = 0.88'],
  'ch1-5-3': ['const height = 1.15', 'const height = 1.35'],
  'ch2-1-3': ['const pathScale = 0.54', 'const pathScale = 0.64'],
  'ch2-2-2': ['const diskRadius = 1.22', 'const diskRadius = 1.32'],
  'ch2-3-2': ['const r1 = state.r1 * 0.5', 'const r1 = state.r1 * 0.6'],
  'ch2-4-4': ['state.point.x * 0.55', 'state.point.x * 0.65'],
  'ch2-5-3': ['icInput.x * 0.55', 'icInput.x * 0.65'],
  'ch3-1-3': ['const LENGTH = 1.35', 'const LENGTH = 1.45'],
  'ch3-5-3': ['const DISPLAY_SCALE = 0.62', 'const DISPLAY_SCALE = 0.72'],
  'ch3-6-2': ['const DISPLAY_SCALE = 0.48', 'const DISPLAY_SCALE = 0.58']
};
function mutant(route, file, old, replacement) {
  let applied = 0;
  const h = mountProductionThree(route, { transformSource(sourceFile, source) {
    if (sourceFile !== file) return source;
    assert.equal(source.split(old).length - 1, 1, 'sentinel selects exactly one current source expression'); applied++;
    return source.replace(old, replacement);
  } });
  assert.equal(applied, 1); return h;
}

test('independent per-route geometry oracles reject all ten in-memory adapter scale sentinels', () => {
  for (const [route, [old, replacement]] of Object.entries(adapterMutations)) {
    const h = mutant(route, `js/sim3/sims/${route}-3d.js`, old, replacement);
    try { h.mode('3d'); live(h); assert.throws(() => checks[route](h), { code: 'ERR_ASSERTION' }, `${route} geometry mutation must be detected`); }
    finally { h.dispose(); }
  }
});

test('independent physics, clock, immutable bridge, projection and disposal assertions reject targeted sentinels', () => {
  const mutations = [
    { route: 'ch2-3-2', file: 'js/sim2/physics/kinematics.js', old: 'return rDriven ? rDriver / rDriven : 0;', replacement: 'return rDriver ? rDriven / rDriver : 0;', prepare(h) { h.mode('3d'); }, verify: checks['ch2-3-2'] },
    { route: 'ch2-2-2', file: 'js/sim2/core/animation-clock.js', old: 'simulationTime += stepSeconds;', replacement: 'simulationTime += 2 * stepSeconds;', prepare(h) { h.mode('3d'); h.playback('step'); }, verify(h) { near(h.shell.getSimulationTime(), 1 / 60); } },
    { route: 'ch3-5-3', file: 'js/sim3/core/mode-toggle.js', old: 'return Object.freeze(copy);', replacement: 'return copy;', prepare(h) { h.mode('3d'); }, verify(h) { frozen(h.received); } },
    { route: 'ch1-1-5', file: 'js/sim3/core/three-label-layer.js', old: 'const dx = entry.opts.dx || 0', replacement: 'const dx = (entry.opts.dx || 0) + 20', prepare(h) { h.mode('3d'); }, verify: checks['ch1-1-5'] },
    { route: 'ch3-5-3', file: 'js/sim3/core/three-dispose.js', old: 'disposeResource(object.geometry);', replacement: '/* sentinel: omitted geometry disposal */', prepare(h) { h.mode('3d'); h.mode('2d'); }, verify(h) { disposedScene(h, h.sceneShell); } }
  ];
  for (const mutation of mutations) {
    const h = mutant(mutation.route, mutation.file, mutation.old, mutation.replacement);
    try { mutation.prepare(h); assert.throws(() => mutation.verify(h), { code: 'ERR_ASSERTION' }, `${mutation.file} sentinel must be detected`); }
    finally { h.dispose(); }
  }
});
