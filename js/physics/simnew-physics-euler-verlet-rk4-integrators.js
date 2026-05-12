/**
 * SimNew Physics — Integrator functions (Euler, Verlet, RK4)
 * Zero DOM dependency.
 */
(function(root) {
'use strict';

/** Semi-implicit Euler (velocity-verlet style) */
function integrateEuler(body, dt) {
  if (body.isStatic || !body.isAwake) return;
  body.vel.x += body._force.x * body.invMass * dt;
  body.vel.y += body._force.y * body.invMass * dt;
  body.angularVel += body._torque * body.invInertia * dt;
  body.pos.x += body.vel.x * dt;
  body.pos.y += body.vel.y * dt;
  body.angle += body.angularVel * dt;
  _normalizeAngle(body);
}

/** Velocity Verlet (symplectic, energy-preserving) */
function integrateVerlet(body, dt) {
  if (body.isStatic || !body.isAwake) return;
  const ax = body._force.x * body.invMass;
  const ay = body._force.y * body.invMass;
  const alpha = body._torque * body.invInertia;
  body.pos.x += body.vel.x * dt + 0.5 * ax * dt * dt;
  body.pos.y += body.vel.y * dt + 0.5 * ay * dt * dt;
  body.angle += body.angularVel * dt + 0.5 * alpha * dt * dt;
  body.vel.x += ax * dt;
  body.vel.y += ay * dt;
  body.angularVel += alpha * dt;
  _normalizeAngle(body);
}

/** 4th-order Runge-Kutta (most accurate) */
function integrateRK4(body, dt) {
  if (body.isStatic || !body.isAwake) return;
  const { pos: p0, vel: v0, angle: a0, angularVel: w0 } = body;

  function deriv(x, y, vx, vy, angle, omega) {
    return {
      dx: vx, dy: vy,
      dVx: body._force.x * body.invMass,
      dVy: body._force.y * body.invMass,
      dAngle: omega,
      dOmega: body._torque * body.invInertia
    };
  }

  function addScaled(s, d, sc) {
    return { x: s.x + d.dx*sc, y: s.y + d.dy*sc, vx: s.vx + d.dVx*sc, vy: s.vy + d.dVy*sc,
             angle: s.angle + d.dAngle*sc, omega: s.omega + d.dOmega*sc };
  }

  const k1 = deriv(p0.x, p0.y, v0.x, v0.y, a0, w0);
  const k2 = deriv(addScaled({x:p0,y:p0,vx:v0,vy:v0,angle:a0,omega:w0},k1,dt*0.5).x,
                    addScaled({x:p0,y:p0,vx:v0,vy:v0,angle:a0,omega:w0},k1,dt*0.5).y,
                    addScaled({x:p0,y:p0,vx:v0,vy:v0,angle:a0,omega:w0},k1,dt*0.5).vx,
                    addScaled({x:p0,y:p0,vx:v0,vy:v0,angle:a0,omega:w0},k1,dt*0.5).vy,
                    addScaled({x:p0,y:p0,vx:v0,vy:v0,angle:a0,omega:w0},k1,dt*0.5).angle,
                    addScaled({x:p0,y:p0,vx:v0,vy:v0,angle:a0,omega:w0},k1,dt*0.5).omega);
  // Simplified RK4 — use body state for k2/k3/k4
  const s2 = { x: p0.x + k1.dx*dt*0.5, y: p0.y + k1.dy*dt*0.5,
               vx: v0.x + k1.dVx*dt*0.5, vy: v0.y + k1.dVy*dt*0.5,
               angle: a0 + k1.dAngle*dt*0.5, omega: w0 + k1.dOmega*dt*0.5 };
  const k2s = deriv(s2.x, s2.y, s2.vx, s2.vy, s2.angle, s2.omega);
  const s3 = { x: p0.x + k2s.dx*dt*0.5, y: p0.y + k2s.dy*dt*0.5,
               vx: v0.x + k2s.dVx*dt*0.5, vy: v0.y + k2s.dVy*dt*0.5,
               angle: a0 + k2s.dAngle*dt*0.5, omega: w0 + k2s.dOmega*dt*0.5 };
  const k3s = deriv(s3.x, s3.y, s3.vx, s3.vy, s3.angle, s3.omega);
  const s4 = { x: p0.x + k3s.dx*dt, y: p0.y + k3s.dy*dt,
               vx: v0.x + k3s.dVx*dt, vy: v0.y + k3s.dVy*dt,
               angle: a0 + k3s.dAngle*dt, omega: w0 + k3s.dOmega*dt };
  const k4s = deriv(s4.x, s4.y, s4.vx, s4.vy, s4.angle, s4.omega);

  body.pos.x += (k1.dx + 2*k2s.dx + 2*k3s.dx + k4s.dx) * dt / 6;
  body.pos.y += (k1.dy + 2*k2s.dy + 2*k3s.dy + k4s.dy) * dt / 6;
  body.vel.x += (k1.dVx + 2*k2s.dVx + 2*k3s.dVx + k4s.dVx) * dt / 6;
  body.vel.y += (k1.dVy + 2*k2s.dVy + 2*k3s.dVy + k4s.dVy) * dt / 6;
  body.angle += (k1.dAngle + 2*k2s.dAngle + 2*k3s.dAngle + k4s.dAngle) * dt / 6;
  body.angularVel += (k1.dOmega + 2*k2s.dOmega + 2*k3s.dOmega + k4s.dOmega) * dt / 6;
  _normalizeAngle(body);
}

function _normalizeAngle(body) {
  const PI = Math.PI;
  body.angle = body.angle - PI * 2 * Math.floor((body.angle + PI) / (PI * 2));
}

const INTEGRATORS = { integrateEuler, integrateVerlet, integrateRK4 };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = INTEGRATORS;
} else {
  root.SimNew = root.SimNew || {};
  root.SimNew.Integrators = INTEGRATORS;
  root.SimNew.integrateEuler = integrateEuler;
  root.SimNew.integrateVerlet = integrateVerlet;
  root.SimNew.integrateRK4 = integrateRK4;
}

})(typeof window !== 'undefined' ? window : this);
