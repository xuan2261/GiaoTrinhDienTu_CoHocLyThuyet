const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const fixtureUrl = name => `file:///${path.join(ROOT, `tests/fixtures/${name}`).replace(/\\/g, '/')}`;
const near = (actual, expected, digits = 6) => expect(actual).toBeCloseTo(expected, digits);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

async function mount(page, fixture, globalName, route, state) {
  await page.goto(fixtureUrl(fixture), { waitUntil: 'domcontentloaded' });
  return page.evaluate(({ globalName, route, state }) => {
    const adapter = window[globalName].create({ host: document.getElementById('host') });
    adapter.setState(state);
    window.__routeAdapter = adapter;
    return {
      api: ['host', 'setState', 'resize', 'dispose'].every(key => key in adapter),
      physics: window.__SIM3_DEBUG__[route].physics
    };
  }, { globalName, route, state });
}

test.describe('Sim3 route physical geometry', () => {
  test('ch1-1-5 maps horizontal forces and r cross F into +Y moment', async ({ page }) => {
    const state = { forces: [
      { r: { x: 0, y: 2 }, F: { fx: 3, fy: 0 } },
      { r: { x: 1, y: 0 }, F: { fx: 0, fy: 4 } }
    ] };
    const result = await mount(page, 'sim2-ch1.html', 'Sim3Ch115', 'ch1-1-5', state);
    expect(result.api).toBe(true);
    expect(result.physics.plane).toBe('horizontal');
    expect(result.physics.mappedForces[0].point).toMatchObject({ x: 0, y: 0.12, z: -1.56 });
    expect(result.physics.mappedForces[0].force).toEqual({ x: 3, y: 0, z: 0 });
    expect(result.physics.mappedForces[1].force).toEqual({ x: 0, y: 0, z: -4 });
    expect(result.physics.resultant).toEqual({ x: 3, y: 0, z: -4 });
    near(result.physics.moment.value, -2);
    expect(result.physics.moment.axis).toEqual({ x: 0, y: -2, z: 0 });
    expect(result.physics.transforms.forceMagnitudes).toEqual([3, 4]);
    const zero = await page.evaluate(() => { window.__routeAdapter.setState({ forces: [] }); return window.__SIM3_DEBUG__['ch1-1-5'].physics; });
    expect(zero.resultant).toEqual({ x: 0, y: 0, z: 0 });
    expect(zero.moment.value).toBe(0);
    expect(zero.transforms.resultantMagnitude).toBe(0);
  });

  test('ch1-5-3 constructs normal-centered cone with atan(mu) half-angle and downhill slip', async ({ page }) => {
    const result = await mount(page, 'sim2-ch1.html', 'Sim3Ch153', 'ch1-5-3', { betaDeg: 45, mu: 0.5 });
    expect(result.api).toBe(true);
    const physics = result.physics;
    expect(physics.plane).toBe('vertical');
    near(physics.tangent.x, Math.SQRT1_2); near(physics.tangent.y, Math.SQRT1_2);
    near(physics.normal.x, -Math.SQRT1_2); near(physics.normal.y, Math.SQRT1_2);
    near(physics.transforms.planeRotationZ, Math.PI / 4);
    near(physics.transforms.blockRotationZ, Math.PI / 4);
    near(physics.transforms.contactNormal.x, physics.normal.x);
    near(physics.transforms.contactNormal.y, physics.normal.y);
    near(physics.cone.halfAngle, Math.atan(0.5));
    near(physics.cone.radius / physics.cone.height, 0.5);
    expect(physics.transforms.slipVisible).toBe(true);
    near(physics.transforms.slipDirection.x, -Math.SQRT1_2); near(physics.transforms.slipDirection.y, -Math.SQRT1_2);
    const zero = await page.evaluate(() => { window.__routeAdapter.setState({ betaDeg: 0, mu: 0 }); return window.__SIM3_DEBUG__['ch1-5-3'].physics; });
    expect(zero.cone.halfAngle).toBe(0);
    expect(zero.transforms.slipVisible).toBe(false);
  });

  test('ch2-1-3 keeps tangent normal and osculating circle in horizontal world plane', async ({ page }) => {
    const result = await mount(page, 'sim2-ch2.html', 'Sim3Ch213', 'ch2-1-3', {
      point: { x: 2, y: 3 }, tangent: { x: 1, y: 0 }, normal: { x: 0, y: 1 }, radius: 4
    });
    expect(result.api).toBe(true);
    const physics = result.physics;
    expect(physics.plane).toBe('horizontal');
    expect(physics.tangent).toEqual({ x: 1, y: 0, z: 0 });
    expect(physics.normal).toEqual({ x: 0, y: 0, z: -1 });
    expect(physics.point).toEqual({ x: 1.08, y: 0.14, z: -1.62 });
    near(physics.center.x, 1.08); near(physics.center.y, physics.point.y); near(physics.center.z, -3.78);
    near(physics.transforms.circleRadius, 2.16);
    near(physics.transforms.radiusLineLength, 2.16);
    const negative = await page.evaluate(() => { window.__routeAdapter.setState({ point: { x: -1, y: -2 }, tangent: { x: -1, y: 0 }, normal: { x: 0, y: -1 }, radius: 0 }); return window.__SIM3_DEBUG__['ch2-1-3'].physics; });
    expect(negative.point).toEqual({ x: -0.54, y: 0.14, z: 1.08 });
    expect(negative.radius).toBe(0.1);
  });

  test('ch2-2-2 uses an XZ orbit, +Y fixed axis, and v equals omega cross r', async ({ page }) => {
    const result = await mount(page, 'sim2-ch2.html', 'Sim3Ch222', 'ch2-2-2', { phi: Math.PI / 2, omega: 3, radius: 2 });
    expect(result.api).toBe(true);
    const physics = result.physics;
    expect(physics.plane).toBe('horizontal');
    expect(physics.axis).toEqual({ x: 0, y: 1, z: 0 });
    near(physics.marker.x, 0); near(physics.marker.z, -1.22);
    expect(physics.omega).toEqual({ x: 0, y: 3, z: 0 });
    near(physics.velocity.x, -6); near(physics.velocity.y, 0); near(physics.velocity.z, 0);
    near(physics.transforms.diskRotationY, Math.PI / 2);
    expect(physics.transforms.orbitPlaneNormal).toEqual({ x: 0, y: 1, z: 0 });
    expect(physics.transforms.tickCount).toBe(16);
    const negative = await page.evaluate(() => { window.__routeAdapter.setState({ phi: 0, omega: -2, radius: 1 }); return window.__SIM3_DEBUG__['ch2-2-2'].physics; });
    expect(negative.velocity).toEqual({ x: 0, y: 0, z: 2 });
    const zero = await page.evaluate(() => { window.__routeAdapter.setState({ phi: 0, omega: 0, radius: 1 }); return window.__SIM3_DEBUG__['ch2-2-2'].physics; });
    expect(zero.velocity).toEqual({ x: 0, y: 0, z: 0 });
    expect(zero.transforms.velocityMagnitude).toBe(0);
  });
});

test.describe('Sim3 Phase 9 transmission and relative-motion geometry', () => {
  test('ch2-3-2 has face-normal shafts, opposite gears, and a continuous external tangent belt', async ({ page }) => {
    const state = { r1: 1.4, r2: 2.2, omega1: 1, gearOmega2: -1.4 / 2.2, beltOmega2: 1.4 / 2.2, gearPhi1: 0.4, gearPhi2: -0.25, beltPhi2: 0.25 };
    const result = await mount(page, 'sim2-ch2.html', 'Sim3Ch232', 'ch2-3-2', state);
    expect(result.api).toBe(true);
    const p = result.physics, { gear, pulley, belt } = p;
    expect(distance(gear.centers[0], gear.centers[1])).toBeCloseTo(gear.radii[0] + gear.radii[1], 9);
    expect(gear.omegas[0] * gear.omegas[1]).toBeLessThan(0);
    expect(pulley.omegas[0] * pulley.omegas[1]).toBeGreaterThan(0);
    [...gear.shafts, ...pulley.shafts].forEach(([start, end]) => {
      expect(end.x - start.x).toBeCloseTo(0, 9); expect(end.y - start.y).toBeCloseTo(0, 9); expect(Math.abs(end.z - start.z)).toBeGreaterThan(0);
    });
    [[belt.top, 1], [belt.bottom, -1]].forEach(([span, side]) => {
      const direction = { x: span[1].x - span[0].x, y: span[1].y - span[0].y, z: span[1].z - span[0].z };
      [0, 1].forEach(index => {
        const contact = span[index], center = pulley.centers[index], radius = pulley.radii[index];
        const radial = { x: contact.x - center.x, y: contact.y - center.y, z: contact.z - center.z };
        expect(Math.hypot(radial.x, radial.y, radial.z)).toBeCloseTo(radius, 9);
        expect(radial.x * direction.x + radial.y * direction.y + radial.z * direction.z).toBeCloseTo(0, 9);
      });
      expect(side).toBeDefined();
    });
    expect(belt.wraps[0][0]).toEqual(belt.bottom[0]); expect(belt.wraps[0][1]).toEqual(belt.top[0]);
    expect(belt.wraps[1][0]).toEqual(belt.top[1]); expect(belt.wraps[1][1]).toEqual(belt.bottom[1]);
    const next = await page.evaluate(() => { window.__routeAdapter.setState({ r1: 2.4, r2: 0.8, omega1: 1, gearPhi1: 0, gearPhi2: 0, beltPhi2: 0 }); return window.__SIM3_DEBUG__['ch2-3-2'].physics; });
    expect(next.objectCount).toBe(p.objectCount);
  });

  test('ch2-4-4 maps aCor = 2 omega cross vRel with perpendicular signed reversal', async ({ page }) => {
    const state = { point: { x: 1, y: -2 }, omega: 2, vRelVec: { x: 3, y: -4 }, phi: 0 };
    const result = await mount(page, 'sim2-ch2.html', 'Sim3Ch244', 'ch2-4-4', state);
    expect(result.api).toBe(true);
    const p = result.physics, v = p.vRel.vector, a = p.aCor.vector;
    expect(a.x * v.x + a.y * v.y + a.z * v.z).toBeCloseTo(0, 9);
    expect(p.aCor.magnitude).toBeCloseTo(2 * Math.abs(state.omega) * Math.hypot(v.x, v.y, v.z), 9);
    expect(a).toEqual({ x: 16, y: 12, z: 0 });
    const negative = await page.evaluate(() => { window.__routeAdapter.setState({ point: { x: 1, y: -2 }, omega: -2, vRelVec: { x: 3, y: -4 }, phi: 0 }); return window.__SIM3_DEBUG__['ch2-4-4'].physics; });
    expect(negative.aCor.vector.x).toBeCloseTo(-a.x, 9); expect(negative.aCor.vector.y).toBeCloseTo(-a.y, 9); expect(negative.aCor.vector.z).toBeCloseTo(-a.z, 9);
    expect(negative.objectCount).toBe(p.objectCount);
  });

  test('ch2-5-3 maps the IC velocity field to omega cross r, including zero and negative omega', async ({ page }) => {
    const state = { ic: { x: -1, y: -1 }, sample: { x: 2, y: 1.5 }, omega: 2 };
    const result = await mount(page, 'sim2-ch2.html', 'Sim3Ch253', 'ch2-5-3', state);
    expect(result.api).toBe(true);
    const p = result.physics, radius = p.sampleVelocity.radius, velocity = p.sampleVelocity.vector;
    expect(velocity.x * radius.x + velocity.y * radius.y + velocity.z * radius.z).toBeCloseTo(0, 9);
    expect(p.sampleVelocity.magnitude).toBeCloseTo(2 * Math.hypot(radius.x, radius.y, radius.z), 9);
    expect(p.field[0].magnitude).toBe(0); expect(p.field[0].vector).toEqual({ x: 0, y: 0, z: 0 });
    const negative = await page.evaluate(() => { window.__routeAdapter.setState({ ic: { x: -1, y: -1 }, sample: { x: 2, y: 1.5 }, omega: -2 }); return window.__SIM3_DEBUG__['ch2-5-3'].physics; });
    expect(negative.sampleVelocity.vector.x).toBeCloseTo(-velocity.x, 9); expect(negative.sampleVelocity.vector.y).toBeCloseTo(-velocity.y, 9); expect(negative.sampleVelocity.vector.z).toBeCloseTo(-velocity.z, 9);
    expect(negative.field.length).toBe(p.field.length);
    expect(negative.objectCount).toBe(p.objectCount);
  });
});

test.describe('Sim3 Chapter 3 physical geometry', () => {
  test('ch3-1-3 keeps cord endpoints at a fixed length and applies -m·a', async ({ page }) => {
    const result = await mount(page, 'sim2-ch3.html', 'Sim3Ch313', 'ch3-1-3', { aFrame: 3, theta: Math.atan2(3, 9.81) });
    const p = result.physics;
    expect(result.api).toBe(true);
    near(Math.hypot(p.pivot.x - p.bob.x, p.pivot.y - p.bob.y, p.pivot.z - p.bob.z), p.length);
    near(Math.hypot(p.cord.start.x - p.pivot.x, p.cord.start.y - p.pivot.y, p.cord.start.z - p.pivot.z), 0, 9);
    near(Math.hypot(p.cord.end.x - p.bob.x, p.cord.end.y - p.bob.y, p.cord.end.z - p.bob.z), 0, 9);
    expect(p.inertialForce).toEqual({ x: -3, y: 0, z: 0 });
    expect(p.inertialForce.x * p.frameAcceleration.x).toBeLessThan(0);
    expect(p.forceArrow.direction.x).toBeLessThan(0);
    const zero = await page.evaluate(() => { window.__routeAdapter.setState({ aFrame: 0 }); return window.__SIM3_DEBUG__['ch3-1-3'].physics; });
    expect(zero.inertialForce).toEqual({ x: 0, y: 0, z: 0 });
    expect(zero.forceArrow.visible).toBe(false);
  });

  test('ch3-5-3 maps an antipodal XZ orbit with signed +Y angular momentum', async ({ page }) => {
    const result = await mount(page, 'sim2-ch3.html', 'Sim3Ch353', 'ch3-5-3', { r: 3, phi: 0.4, inertia: 36, omega: 1, angularMomentum: 36 });
    const p = result.physics;
    expect(result.api).toBe(true);
    near(p.radius, 3 * p.displayScale);
    near(p.mass1.x + p.mass2.x, 0); near(p.mass1.y + p.mass2.y, 0); near(p.mass1.z + p.mass2.z, 0);
    expect(p.rightHandCross.y).toBeGreaterThan(0);
    near(p.rightHandCross.x, 0); near(p.rightHandCross.z, 0);
    near(p.angularMomentum, p.inertia * p.omega);
    expect(p.angularMomentumArrow.direction.y).toBeGreaterThan(0);
    const negative = await page.evaluate(() => { window.__routeAdapter.setState({ r: 2, phi: 0.4, inertia: 16, omega: -2, angularMomentum: -32 }); return window.__SIM3_DEBUG__['ch3-5-3'].physics; });
    expect(negative.rightHandCross.y).toBeLessThan(0);
    near(negative.angularMomentum, negative.inertia * negative.omega);
    expect(negative.angularMomentumArrow.magnitude).toBe(32);
    expect(negative.angularMomentumArrow.direction.y).toBeLessThan(0);
  });

  test('ch3-6-2 maintains one collision lane, tangent contact, ratio impact and bridge reset', async ({ page }) => {
    const initial = { p1: { x: -4, y: 0 }, p2: { x: 3, y: 0 }, v1: { x: 2.2, y: 0 }, v2: { x: -1, y: 0 }, r1: 0.6, r2: 0.8, collided: false, impactPoint: null };
    const result = await mount(page, 'sim2-ch3.html', 'Sim3Ch362', 'ch3-6-2', initial);
    let p = result.physics;
    expect(result.api).toBe(true);
    expect(p.lane).toEqual({ x: 1, y: 0, z: 0 });
    near(p.radius1, initial.r1 * p.displayScale); near(p.radius2, initial.r2 * p.displayScale);
    expect(p.velocity1.direction.x).toBeGreaterThan(0); expect(p.velocity2.direction.x).toBeLessThan(0);
    const contact = { p1: { x: -0.6, y: 0 }, p2: { x: 0.8, y: 0 }, v1: { x: -0.76, y: 0 }, v2: { x: 1.24, y: 0 }, r1: 0.6, r2: 0.8, collided: true, impactPoint: { x: 0, y: 0 } };
    p = await page.evaluate(state => { window.__routeAdapter.setState(state); return window.__SIM3_DEBUG__['ch3-6-2'].physics; }, contact);
    near(p.sourceSeparation, p.sourceRadiusSum, 9);
    expect(p.contactResidual).toBeLessThan(1e-9);
    near(p.impactRatio, contact.r1 / (contact.r1 + contact.r2));
    const impact = p.impactPoint;
    p = await page.evaluate(state => { window.__routeAdapter.setState(state); return window.__SIM3_DEBUG__['ch3-6-2'].physics; }, { ...contact, p1: { x: -0.7, y: 0 }, p2: { x: 1, y: 0 } });
    expect(p.impactPoint).toEqual(impact);
    await page.goto(fixtureUrl('sim2-ch3.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__sim = window.SIM_MAP['ch3-6-2'](document.getElementById('host')); });
    await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
    const bridged = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-6-2']);
    expect(bridged.physics.radius1).toBeCloseTo(bridged.r1 * bridged.physics.displayScale, 9);
    expect(bridged.physics.velocity1.magnitude).toBeCloseTo(Math.abs(bridged.v1.x), 9);
    await page.locator('#host .sim2-reset').click();
    const reset = await page.evaluate(() => window.__SIM3_DEBUG__['ch3-6-2']);
    expect(reset.collided).toBe(false);
    expect(reset.physics.impactPoint).toBeNull();
  });
});
