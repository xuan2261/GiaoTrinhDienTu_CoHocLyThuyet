(function() {
'use strict';

function nums(values, key) {
  return (values || []).map(item => Number(item && item[key])).filter(Number.isFinite);
}
function magnitude(value) {
  if (Number.isFinite(Number(value))) return Math.abs(Number(value));
  if (value && Number.isFinite(Number(value.x)) && Number.isFinite(Number(value.y))) {
    return Math.hypot(Number(value.x), Number(value.y));
  }
  return 0;
}
function fmt(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toFixed(Math.abs(n) >= 100 ? 1 : 2).replace(/\.00$/, '');
}
function bars(items) {
  const max = Math.max.apply(null, (items || []).map(item => magnitude(item.value)).concat([1]));
  return (items || []).map(item => ({
    label: item.label,
    value: item.value,
    ratio: magnitude(item.value) / max * 100
  }));
}

function buildLineSummary(points, label) {
  const ys = nums(points, 'y');
  const minY = ys.length ? Math.min.apply(null, ys) : 0;
  const maxY = ys.length ? Math.max.apply(null, ys) : 0;
  return {
    count: ys.length,
    minY,
    maxY,
    summary: `${label || 'đồ thị'}: ${ys.length} mẫu, min ${minY}, max ${maxY}`
  };
}

function buildBeforeAfterSummary(config) {
  const before = config && config.before;
  const after = config && config.after;
  const beforeMag = magnitude(before);
  const afterMag = magnitude(after);
  const residual = Number.isFinite(Number(config && config.residual))
    ? Math.abs(Number(config.residual))
    : Math.abs(afterMag - beforeMag);
  const label = config && config.label || 'giá trị';
  return {
    before: beforeMag,
    after: afterMag,
    residual,
    bars: bars([{ label: 'trước', value: beforeMag }, { label: 'sau', value: afterMag }]),
    summary: `${label}: trước ${fmt(beforeMag)}, sau ${fmt(afterMag)}, sai số ${fmt(residual)}`
  };
}

function routeSummary(routeId, state, outcome) {
  const s = state || {};
  const values = outcome && outcome.values || {};
  if (routeId === 'ch2-1-2') {
    const items = [
      { label: 'x', value: s.xVal },
      { label: 'v', value: s.vVal },
      { label: 'a', value: s.aVal }
    ];
    return { summary: `x/v/a: t=${fmt(s.t || 0)}s, 3 mẫu`, bars: bars(items) };
  }
  if (routeId === 'ch3-3-1') {
    const kinetic = Number.isFinite(Number(s.kinetic)) ? Number(s.kinetic) : values.kinetic;
    const potential = Number.isFinite(Number(s.potential)) ? Number(s.potential) : values.potential;
    const energy = Number.isFinite(Number(values.energy)) ? Number(values.energy) : magnitude(kinetic) + magnitude(potential);
    return {
      summary: `năng lượng E: T=${fmt(kinetic)}, V=${fmt(potential)}, E=${fmt(energy)}`,
      bars: bars([{ label: 'T', value: kinetic }, { label: 'V', value: potential }, { label: 'E', value: energy }])
    };
  }
  if (routeId === 'ch3-6-2') {
    return buildBeforeAfterSummary({
      label: 'động lượng',
      before: values.momentumBefore,
      after: values.momentumAfter,
      residual: outcome && outcome.residual
    });
  }
  return null;
}

function drawBars(ctx, x, y, w, h, summary) {
  if (!ctx || !summary) return;
  const max = Math.max(Math.abs(summary.before), Math.abs(summary.after), 1);
  ctx.save();
  ctx.fillStyle = 'rgba(39,174,96,.16)';
  ctx.fillRect(x, y, w * Math.abs(summary.before) / max, h / 2 - 2);
  ctx.fillStyle = 'rgba(41,128,185,.2)';
  ctx.fillRect(x, y + h / 2 + 2, w * Math.abs(summary.after) / max, h / 2 - 2);
  ctx.restore();
}

window.SimPromaxMiniGraph = { buildLineSummary, buildBeforeAfterSummary, routeSummary, drawBars };
})();
