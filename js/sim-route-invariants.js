(function() {
'use strict';

const pilotRoutes = ['ch1-2-3', 'ch1-5-3', 'ch2-1-2', 'ch2-5-2', 'ch3-3-1', 'ch3-6-2'];

const specs = {
  'ch1-2-3': {
    routeId: 'ch1-2-3',
    domain: 'statics',
    invariant: 'force-resultant',
    tolerance: 1e-6,
    readoutKeys: ['f1Magnitude', 'f2Magnitude', 'resultantMagnitude', 'residual'],
    formula: '\\vec{R}=\\vec{F}_1+\\vec{F}_2'
  },
  'ch1-5-3': {
    routeId: 'ch1-5-3',
    domain: 'statics',
    invariant: 'friction-cone-margin',
    tolerance: 1e-3,
    readoutKeys: ['alpha', 'mu', 'margin', 'slipState'],
    formula: '\\tan(\\alpha)\\le\\mu'
  },
  'ch2-1-2': {
    routeId: 'ch2-1-2',
    domain: 'kinematics',
    invariant: 'derivative-chain',
    tolerance: 1e-2,
    readoutKeys: ['t', 'x', 'v', 'a', 'residual'],
    formula: 'v=\\frac{dx}{dt},\\quad a=\\frac{dv}{dt}'
  },
  'ch2-5-2': {
    routeId: 'ch2-5-2',
    domain: 'kinematics',
    invariant: 'instant-center-velocity',
    tolerance: 1e-6,
    readoutKeys: ['omega', 'radius', 'velocityMagnitude', 'perpendicularResidual'],
    formula: '\\vec{v}_P=\\vec{\\omega}\\times\\vec{r}_{P/IC}'
  },
  'ch3-3-1': {
    routeId: 'ch3-3-1',
    domain: 'dynamics',
    invariant: 'spring-energy-drift',
    tolerance: 5e-2,
    readoutKeys: ['x', 'v', 'kinetic', 'potential', 'energyDrift'],
    formula: 'x^{\\prime\\prime}+\\frac{k}{m}x=0'
  },
  'ch3-6-2': {
    routeId: 'ch3-6-2',
    domain: 'dynamics',
    invariant: 'collision-momentum-restitution',
    tolerance: 1e-6,
    readoutKeys: ['momentumBefore', 'momentumAfter', 'restitutionResidual'],
    formula: 'p^- = p^+,\\quad e=-\\frac{v_2^+-v_1^+}{v_2^- - v_1^-}'
  }
};

function get(routeId) {
  return specs[String(routeId || '')] || null;
}

function all() {
  return pilotRoutes.map(routeId => specs[routeId]);
}

window.SimRouteInvariants = { pilotRoutes, get, all };
})();
