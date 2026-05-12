(function() {
'use strict';
function addToolbarButton(toolbar, label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sim-lab-tool';
  button.textContent = label;
  setAttr(button, 'aria-label', label);
  if (typeof onClick === 'function') button.addEventListener('click', onClick);
  toolbar.appendChild(button);
  return button;
}
function placeBeforeOrAppend(parent, child, before) {
  if (!parent || !child) return;
  if (before && typeof parent.insertBefore === 'function') {
    parent.insertBefore(child, before);
  } else if (typeof parent.appendChild === 'function') {
    parent.appendChild(child);
  }
}
function hasClass(element, className) {
  return (` ${element && element.className || ''} `).indexOf(` ${className} `) >= 0;
}
function findDirectChildByClass(parent, className) {
  if (!parent) return null;
  if (typeof parent.querySelector === 'function') {
    try {
      return parent.querySelector(`:scope > .${className}`);
    } catch (_err) {}
  }
  return Array.prototype.find.call(parent.children || [], child => hasClass(child, className)) || null;
}
function removeNode(node) {
  if (!node) return;
  if (typeof node.remove === 'function') {
    node.remove();
  } else if (node.parentNode && typeof node.parentNode.removeChild === 'function') {
    node.parentNode.removeChild(node);
  }
}
function setAttr(node, name, value) {
  if (node && typeof node.setAttribute === 'function') node.setAttribute(name, value);
}
function inferRouteId(config) {
  const cfg = config || {};
  if (/^ch\d+-\d+-\d+$/.test(cfg.routeId || '')) return cfg.routeId;
  if (typeof window !== 'undefined' && window.location) {
    const hashRoute = String(window.location.hash || '').replace(/^#/, '');
    if (/^ch\d+-\d+-\d+$/.test(hashRoute)) return hashRoute;
  }
  const titleRoute = String(cfg.title || '').match(/ch\d+-\d+-\d+/);
  return titleRoute ? titleRoute[0] : '';
}
function routeDomId(routeId, suffix) {
  return `sim-${String(routeId || 'lab').replace(/[^a-z0-9_-]/gi, '-')}-${suffix}`;
}
function renderFormulaPanel(panel, formula) {
  const text = String(formula || '').trim();
  if (!panel) return;
  setAttr(panel, 'data-empty', text ? 'false' : 'true');
  setAttr(panel, 'data-equation-source', text);
  panel.innerHTML = '';
  if (!text) return;
  const canRenderKatex = window.katex && typeof window.katex.render === 'function';
  if (!canRenderKatex) {
    panel.textContent = text;
    return;
  }
  try {
    window.katex.render(text, panel, { throwOnError: false, displayMode: false });
  } catch (_err) {
    panel.textContent = text;
  }
}
function startStructuralSync(lab, routeId) {
  const primitives = window.SimRouteRendererPrimitives;
  if (!lab || !lab.wrap || !lab.ctx || !primitives) return;
  if (primitives.traceContext) primitives.traceContext(lab.ctx);
  if (primitives.resetMarks) primitives.resetMarks(routeId);
  const core = window.SimCore || {};
  const scope = core.getActiveScope && core.getActiveScope();
  const sync = function() {
    const marks = primitives.marks ? primitives.marks() : [];
    const routeMark = routeId ? [`route:${routeId}`] : [];
    setAttr(lab.wrap, 'data-structural-marks', routeMark.concat(marks).join('|'));
    if (scope && scope.disposed) return;
    if (core.requestSimFrame) core.requestSimFrame(scope, sync);
    else window.requestAnimationFrame(sync);
  };
  sync();
}
function createLab(host, config) {
  const cfg = config || {};
  const core = window.SimCore || {};
  const routeId = inferRouteId(cfg);
  if (!core.createSimContainer) {
    const canvas = document.createElement('canvas');
    canvas.width = cfg.width || 760;
    canvas.height = cfg.height || 440;
    host.appendChild(canvas);
    const toolbar = document.createElement('div');
    toolbar.className = 'sim-controls';
    host.appendChild(toolbar);
    return {
      canvas,
      wrap: host,
      toolbar,
      header: null,
      scene: null,
      overlay: null,
      legend: null,
      readout: null,
      hint: null,
      readoutGrid: null,
    };
  }
  const lab = core.createSimContainer(
    host,
    cfg.title || 'Phòng mô phỏng',
    cfg.width || 760,
    cfg.height || 440
  );
  lab.toolbar = lab.controls;
  lab.addSlider = function(lbl, min, max, val, step, unit, onChg) {
    const wrap = document.createElement('div');
    wrap.className = 'sim-slider-group sim-inline-slider';
    const le = document.createElement('span');
    le.className = 'sim-inline-slider-label';
    le.textContent = lbl + ': ';
    const ve = document.createElement('strong');
    ve.className = 'sim-inline-slider-value';
    const inp = document.createElement('input');
    inp.type = 'range';
    inp.min = min;
    inp.max = max;
    inp.step = step;
    inp.value = val;
    setAttr(inp, 'aria-label', lbl);
    ve.textContent = val + unit;
    inp.addEventListener('input', function() {
      ve.textContent = inp.value + unit;
      onChg(parseFloat(inp.value));
    });
    wrap.appendChild(le);
    wrap.appendChild(inp);
    wrap.appendChild(ve);
    lab.toolbar.appendChild(wrap);
    return inp;
  };
  lab.addButton = function(label, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sim-btn';
    btn.textContent = label;
    setAttr(btn, 'aria-label', label);
    btn.addEventListener('click', onClick);
    lab.toolbar.appendChild(btn);
    return btn;
  };

  const titleText = cfg.title || 'Phòng mô phỏng';
  lab.wrap.classList.add('sim-lab');
  setAttr(lab.wrap, 'role', 'region');
  setAttr(lab.wrap, 'aria-label', `Mô phỏng ${routeId || titleText}`);
  removeNode(findDirectChildByClass(lab.wrap, 'sim-header'));
  lab.header = document.createElement('div');
  lab.header.className = 'sim-header';
  const title = document.createElement('span');
  title.className = 'sim-title';
  title.textContent = /^Mô phỏng\b/i.test(titleText) ? titleText : `Mô phỏng ${titleText}`;
  lab.header.appendChild(title);
  const routeChip = document.createElement('span');
  routeChip.className = 'sim-lab-route-chip';
  routeChip.textContent = routeId || 'lab';
  setAttr(routeChip, 'aria-label', `Mã mô phỏng ${routeId || 'lab'}`);
  lab.header.appendChild(routeChip);
  const status = document.createElement('span');
  status.className = 'sim-lab-status';
  status.textContent = 'tương tác trực tiếp';
  setAttr(status, 'aria-live', 'polite');
  lab.header.appendChild(status);
  lab.status = status;
  lab.scene = document.createElement('div');
  lab.scene.className = 'sim-lab-scene';
  lab.overlay = document.createElement('div');
  lab.overlay.className = 'sim-lab-overlay';
  if (lab.canvas.parentNode) {
    placeBeforeOrAppend(lab.canvas.parentNode, lab.header, lab.canvas);
    placeBeforeOrAppend(lab.canvas.parentNode, lab.scene, lab.canvas);
    lab.scene.appendChild(lab.canvas);
  }
  lab.scene.appendChild(lab.overlay);
  lab.labToolbar = document.createElement('div');
  lab.labToolbar.className = 'sim-lab-toolbar';
  lab.legend = document.createElement('div');
  lab.legend.className = 'sim-lab-legend';
  lab.labToolbar.appendChild(lab.legend);
  placeBeforeOrAppend(lab.wrap, lab.labToolbar, lab.controls);
  lab.readoutGrid = document.createElement('div');
  lab.readoutGrid.className = 'sim-readout-grid';
  lab.formulaPanel = document.createElement('div');
  lab.formulaPanel.className = 'sim-formula-panel sim-lab-formula-panel sim-equation-panel';
  lab.formulaPanel.id = routeDomId(routeId, 'formula');
  renderFormulaPanel(lab.formulaPanel, cfg.formula);
  const rerenderFormula = () => renderFormulaPanel(lab.formulaPanel, cfg.formula);
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('sim:katex-ready', rerenderFormula);
  }
  const scope = core.getActiveScope && core.getActiveScope();
  if (scope && typeof window.removeEventListener === 'function') {
    scope.onDispose(() => window.removeEventListener('sim:katex-ready', rerenderFormula));
  }
  lab.hint = document.createElement('div');
  lab.hint.className = 'sim-lab-hint';
  lab.hint.id = routeDomId(routeId, 'hint');
  lab.hint.textContent = cfg.hint || cfg.formula || cfg.feedback || '';
  setAttr(lab.canvas, 'aria-describedby', lab.hint.id);
  lab.info.classList.add('sim-sr-readout');
  setAttr(lab.info, 'role', 'status');
  setAttr(lab.info, 'aria-live', 'polite');
  setAttr(lab.info, 'aria-atomic', 'true');
  lab.wrap.appendChild(lab.readoutGrid);
  lab.wrap.appendChild(lab.formulaPanel);
  lab.wrap.appendChild(lab.hint);

  lab.readout = lab.info;
  lab.addToolbarButton = (label, onClick) => addToolbarButton(lab.toolbar, label, onClick);
  lab.setHint = (text) => { if (lab.hint) lab.hint.textContent = text || ''; };
  lab.setFormula = (formula) => renderFormulaPanel(lab.formulaPanel, formula);
  if (routeId && typeof lab.wrap.setAttribute === 'function') {
    lab.wrap.setAttribute('data-route-id', routeId);
    lab.wrap.setAttribute('data-renderer-id', `${routeId}-direct-renderer`);
    lab.wrap.setAttribute('data-behavior-id', `${routeId}-direct-behavior`);
    lab.wrap.setAttribute('data-structural-marks', `route:${routeId}`);
    startStructuralSync(lab, routeId);
  }
  return lab;
}

window.SimLabUI = {
  createLab,
  addToolbarButton
};

})();
