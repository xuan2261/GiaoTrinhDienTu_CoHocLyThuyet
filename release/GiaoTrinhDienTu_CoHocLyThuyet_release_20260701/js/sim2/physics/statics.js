/**
 * Statics physics — port từ js/sim-physics-statics.js sang UMD (Node + browser).
 * Công thức GIỮ NGUYÊN (verified). Chỉ đổi cơ chế export.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SimPhysicsStatics = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  const DEG = Math.PI / 180;

  function resolveForceComponents(F, alphaDeg) {
    const alpha = (alphaDeg || 0) * DEG;
    return { fx: F * Math.cos(alpha), fy: F * Math.sin(alpha) };
  }

  function computeMoment(F, r, thetaDeg) {
    const theta = (thetaDeg !== undefined ? thetaDeg : 90) * DEG;
    return r * F * Math.sin(theta);
  }

  function momentFromVectors(rx, ry, fx, fy) {
    return rx * fy - ry * fx;
  }

  function beamReactions(load, distA, totalLength, x) {
    const L = totalLength || 1;
    const a = Math.min(Math.max(distA || 0, 0), L);
    const ra = load * (L - a) / L;
    const rb = load * a / L;
    let shear = 0, moment = 0;
    if (x !== undefined && x >= 0 && x <= L) {
      shear = x < a ? ra : ra - load;
      moment = x < a ? ra * x : ra * x - load * (x - a);
    }
    return { ra, rb, shear, moment };
  }

  function cantileverDistributed(w, L) {
    return { shear: w * L, moment: w * L * L / 2, ra: w * L, ma: w * L * L / 2 };
  }

  function coupleMoment(F, d) {
    return F * d;
  }

  function spatialForceComponents(F, alphaDeg, betaDeg) {
    const alpha = (alphaDeg || 0) * DEG;
    const beta = (betaDeg || 0) * DEG;
    return {
      Fx: F * Math.cos(beta) * Math.cos(alpha),
      Fy: F * Math.cos(beta) * Math.sin(alpha),
      Fz: F * Math.sin(beta)
    };
  }

  function spatialMoment(rx, ry, rz, fx, fy, fz) {
    return { Mx: ry * fz - rz * fy, My: rz * fx - rx * fz, Mz: rx * fy - ry * fx };
  }

  function reduceToResultant(forces) {
    let Rx = 0, Ry = 0, Mo = 0;
    for (const item of (forces || [])) {
      const F = item.F, r = item.r;
      Rx += F.fx; Ry += F.fy;
      Mo += momentFromVectors(r.x, r.y, F.fx, F.fy);
    }
    return { Rx, Ry, Mo };
  }

  function resultant3D(forces) {
    let Rx = 0, Ry = 0, Rz = 0;
    for (const f of (forces || [])) {
      Rx += Number(f && f.Fx) || 0;
      Ry += Number(f && f.Fy) || 0;
      Rz += Number(f && f.Fz) || 0;
    }
    return { Rx, Ry, Rz, magnitude: Math.sqrt(Rx * Rx + Ry * Ry + Rz * Rz) };
  }

  function frictionNormal(mu, N) {
    return mu * N;
  }

  function tensionInCable(w, L, x) {
    if (x === undefined) return w * L;
    return { T: w * x, y: w * x * x / 2 };
  }

  function centroidComposite(shapes) {
    let totalArea = 0, sx = 0, sy = 0;
    for (const s of (shapes || [])) {
      totalArea += s.area; sx += s.area * s.cx; sy += s.area * s.cy;
    }
    const A = totalArea || 1;
    return { cx: sx / A, cy: sy / A, area: totalArea };
  }

  function centroidWithHole(area, hole) {
    const netArea = area.area - (hole ? hole.area : 0);
    if (netArea === 0) return { cx: area.cx, cy: area.cy, area: 0 };
    const cx = (area.area * area.cx - (hole ? hole.area * hole.cx : 0)) / netArea;
    const cy = (area.area * area.cy - (hole ? hole.area * hole.cy : 0)) / netArea;
    return { cx, cy, area: netArea };
  }

  function checkEquilibrium(forces, moments, tol) {
    tol = tol || 1e-6;
    let sumFx = 0, sumFy = 0, sumM = 0;
    for (const f of (forces || [])) { sumFx += f.fx; sumFy += f.fy; }
    for (const m of (moments || [])) { sumM += m.M; }
    return {
      balanced: Math.abs(sumFx) < tol && Math.abs(sumFy) < tol && Math.abs(sumM) < tol,
      sumFx, sumFy, sumM
    };
  }

  return {
    resolveForceComponents, momentFromVectors, computeMoment, beamReactions,
    cantileverDistributed, coupleMoment, spatialForceComponents, spatialMoment,
    reduceToResultant, resultant3D, frictionNormal, tensionInCable,
    centroidComposite, centroidWithHole, checkEquilibrium
  };
});
