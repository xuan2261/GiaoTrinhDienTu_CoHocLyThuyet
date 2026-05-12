/**
 * Statics physics helpers — force resolution, moment, beam reactions, friction.
 * Phase 1 infrastructure for 58-route simulation rebuild.
 */
(function() {
'use strict';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

// ─── Force Components ─────────────────────────────────────────────────────────

/**
 * Resolve force F into Fx, Fy components.
 * @param {number} F - Magnitude in N
 * @param {number} alphaDeg - Angle from positive x-axis in degrees
 * @returns {{fx: number, fy: number}}
 */
function resolveForceComponents(F, alphaDeg) {
  const alpha = (alphaDeg || 0) * DEG;
  return {
    fx: F * Math.cos(alpha),
    fy: F * Math.sin(alpha)
  };
}

/**
 * Compute moment of force about a point.
 * @param {number} F - Force magnitude in N
 * @param {number} r - Perpendicular distance (lever arm) in mm or m
 * @param {number} thetaDeg - Angle between r and F in degrees (default 90°)
 * @returns {number} Moment M = r × F (positive = counterclockwise)
 */
function computeMoment(F, r, thetaDeg) {
  const theta = (thetaDeg !== undefined ? thetaDeg : 90) * DEG;
  return r * F * Math.sin(theta);
}

/**
 * Moment using vector cross product (2D).
 * @param {number} rx - x-component of position vector from O to force point
 * @param {number} ry - y-component
 * @param {number} fx - x-component of force
 * @param {number} fy - y-component of force
 * @returns {number} M_O = rx*Fy - ry*Fx
 */
function momentFromVectors(rx, ry, fx, fy) {
  return rx * fy - ry * fx;
}

// ─── Beam Reactions ───────────────────────────────────────────────────────────

/**
 * Simply supported beam with point load P at distance x from left support.
 * @param {number} load - Point load P in N
 * @param {number} distA - Distance from left support to load in mm
 * @param {number} totalLength - Beam length L in mm
 * @param {number} x - Position along beam to compute shear/moment (optional)
 * @returns {{ra: number, rb: number, shear: number, moment: number}}
 */
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

/**
 * Cantilever beam with distributed load w (N/mm) over length L.
 * @param {number} w - Distributed load in N/mm
 * @param {number} L - Length in mm
 * @returns {{shear: number, moment: number, ra: number, ma: number}}
 */
function cantileverDistributed(w, L) {
  return {
    shear: w * L,
    moment: w * L * L / 2,
    ra: w * L,
    ma: w * L * L / 2
  };
}

// ─── Couple Moment ─────────────────────────────────────────────────────────────

/**
 * Couple moment: M = F × d.
 * @param {number} F - Force magnitude in N
 * @param {number} d - Perpendicular distance between forces in mm
 * @returns {number} Moment magnitude
 */
function coupleMoment(F, d) {
  return F * d;
}

// ─── Spatial (3D) Forces ───────────────────────────────────────────────────────

/**
 * 3D force components from magnitude and direction angles.
 * @param {number} F - Magnitude
 * @param {number} alphaDeg - Angle from x-axis in xy-plane (azimuth)
 * @param {number} betaDeg - Angle from xy-plane (elevation)
 * @returns {{Fx: number, Fy: number, Fz: number}}
 */
function spatialForceComponents(F, alphaDeg, betaDeg) {
  const alpha = (alphaDeg || 0) * DEG;
  const beta = (betaDeg || 0) * DEG;
  return {
    Fx: F * Math.cos(beta) * Math.cos(alpha),
    Fy: F * Math.cos(beta) * Math.sin(alpha),
    Fz: F * Math.sin(beta)
  };
}

/**
 * 3D moment from position vector r and force vector F.
 * M_O = r × F using cross product.
 * @param {number} rx, ry, rz - Position components from O to force point
 * @param {number} fx, fy, fz - Force vector components
 * @returns {{Mx: number, My: number, Mz: number}}
 */
function spatialMoment(rx, ry, rz, fx, fy, fz) {
  return {
    Mx: ry * fz - rz * fy,
    My: rz * fx - rx * fz,
    Mz: rx * fy - ry * fx
  };
}

/**
 * Reduce 2-force system to resultant R and moment M_O.
 * @param {Array<{F: {fx,fy}, r: {x,y}}>} forces - Array of {F, r} objects
 * @returns {{Rx: number, Ry: number, Mo: number}}
 */
function reduceToResultant(forces) {
  let Rx = 0, Ry = 0, Mo = 0;
  for (const item of (forces || [])) {
    const F = item.F, r = item.r;
    Rx += F.fx;
    Ry += F.fy;
    Mo += momentFromVectors(r.x, r.y, F.fx, F.fy);
  }
  return { Rx, Ry, Mo };
}

// ─── Friction ─────────────────────────────────────────────────────────────────

/**
 * Maximum static/kinetic friction force.
 * @param {number} mu - Friction coefficient (dimensionless)
 * @param {number} N - Normal force in N
 * @returns {number} F_ms max in N
 */
function frictionNormal(mu, N) {
  return mu * N;
}

/**
 * Tension in cable with distributed load w (N/m) over length L.
 * @param {number} w - Distributed load in N/m
 * @param {number} L - Cable length in m
 * @param {number} x - Position along cable (optional)
 * @returns {number|{T: number, y: number}} Tension at x
 */
function tensionInCable(w, L, x) {
  if (x === undefined) return w * L;
  return { T: w * x, y: w * x * x / 2 };
}

// ─── Centroid ─────────────────────────────────────────────────────────────────

/**
 * Centroid of composite area (list of shapes).
 * @param {Array<{area: number, cx: number, cy: number}>} shapes
 * @returns {{cx: number, cy: number}}
 */
function centroidComposite(shapes) {
  let totalArea = 0, sx = 0, sy = 0;
  for (const s of (shapes || [])) {
    totalArea += s.area;
    sx += s.area * s.cx;
    sy += s.area * s.cy;
  }
  const A = totalArea || 1;
  return { cx: sx / A, cy: sy / A, area: totalArea };
}

/**
 * Centroid of area with circular hole.
 * @param {{area: number, cx: number, cy: number}} area - Full area
 * @param {{area: number, cx: number, cy: number}} hole - Hole area (subtracted)
 * @returns {{cx: number, cy: number, area: number}}
 */
function centroidWithHole(area, hole) {
  const netArea = area.area - (hole ? hole.area : 0);
  if (netArea === 0) return { cx: area.cx, cy: area.cy, area: 0 };
  const cx = (area.area * area.cx - (hole ? hole.area * hole.cx : 0)) / netArea;
  const cy = (area.area * area.cy - (hole ? hole.area * hole.cy : 0)) / netArea;
  return { cx, cy, area: netArea };
}

/**
 * Static equilibrium check: ΣFx=0, ΣFy=0, ΣM=0.
 * @param {Array<{fx: number, fy: number}>} forces
 * @param {Array<{M: number}>} moments
 * @param {number} tol - Tolerance (default 1e-6)
 * @returns {{balanced: boolean, sumFx: number, sumFy: number, sumM: number}}
 */
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

// ─── Public API ────────────────────────────────────────────────────────────────

window.SimPhysicsStatics = {
  resolveForceComponents,
  momentFromVectors,
  computeMoment,
  beamReactions,
  cantileverDistributed,
  coupleMoment,
  spatialForceComponents,
  spatialMoment,
  reduceToResultant,
  frictionNormal,
  tensionInCable,
  centroidComposite,
  centroidWithHole,
  checkEquilibrium
};

})();
