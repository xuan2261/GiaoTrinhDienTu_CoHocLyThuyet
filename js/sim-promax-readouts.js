(function() {
'use strict';

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toFixed(Math.abs(n) >= 100 ? 1 : 2).replace(/\.00$/, '');
}
function formatValue(value) {
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  if (value && typeof value === 'object') {
    const x = Number(value.x);
    const y = Number(value.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      return `${formatNumber(Math.hypot(x, y))} (${formatNumber(x)};${formatNumber(y)})`;
    }
    return Object.keys(value).map(key => `${key}:${formatValue(value[key])}`).join(', ');
  }
  return formatNumber(value);
}

function formatFormula(spec) {
  const cfg = spec || {};
  const values = cfg.values || {};
  const parts = Object.keys(values).map(key => `${key}=${formatValue(values[key])}`);
  const result = cfg.result !== undefined ? `${formatValue(cfg.result)}${cfg.unit ? ` ${cfg.unit}` : ''}` : '';
  const text = [cfg.template || '', result].filter(Boolean).join(' = ');
  const summary = [cfg.template || 'công thức', parts.join(', '), result].filter(Boolean).join('; ');
  return { text, summary };
}

function invariantFormula(routeId, outcome) {
  const inv = outcome || {};
  const values = inv.values || {};
  if (routeId === 'ch1-5-3') return formatFormula({ template: 'mu - tan(alpha)', values: { mu: values.mu, alpha: values.alpha }, result: values.margin });
  if (routeId === 'ch3-6-2') return formatFormula({ template: 'p^- - p^+ signed/vector', values: { p0: values.momentumBefore, p1: values.momentumAfter, eResidual: values.restitutionResidual }, result: inv.residual });
  return formatFormula({ template: inv.spec && inv.spec.formula || 'sai so invariant', values, result: inv.residual });
}

window.SimPromaxReadouts = { formatFormula, invariantFormula };
})();
