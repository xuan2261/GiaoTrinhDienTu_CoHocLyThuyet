(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.TextbookSearch = api;
}(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  let state = { engine: null, navItems: [], active: -1, input: null, list: null, status: null, results: [] };
  const weights = { title: 400, heading: 300, metadata: 200, body: 100 };

  function normalizeText(value, fold) {
    let text = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    if (!fold) text = String(value || '');
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function fnv1a(value) {
    let hash = 0x811c9dc5;
    const bytes = new TextEncoder().encode(value);
    for (let i = 0; i < bytes.length; i += 1) { hash ^= bytes[i]; hash = Math.imul(hash, 0x01000193); }
    return (`0000000${(hash >>> 0).toString(16)}`).slice(-8);
  }

  function validIndex(index) {
    if (!index || index.schemaVersion !== 1 || !Array.isArray(index.routes) || !Array.isArray(index.entries) || !index.entries.length) return false;
    const routeSet = new Set(index.routes.map(route => route && route.routeId));
    const ids = new Set(); const anchors = new Set();
    if (!index.entries.every(entry => entry && entry.id && entry.anchor && routeSet.has(entry.routeId) && entry.field && Number.isInteger(entry.blockIndex) && entry.blockIndex >= -1 && typeof entry.text === 'string' && typeof entry.normalized === 'string' && typeof entry.folded === 'string' && !ids.has(entry.id) && !anchors.has(entry.anchor) && ids.add(entry.id) && anchors.add(entry.anchor))) return false;
    const pages = typeof PAGES !== 'undefined' ? PAGES : root.PAGES;
    if (!pages) return false;
    const routeIds = Object.keys(pages);
    if (index.routes.length !== routeIds.length || routeSet.size !== routeIds.length) return false;
    if (!root.TEXTBOOK_GLOSSARY_TERMS || fnv1a(JSON.stringify(root.TEXTBOOK_GLOSSARY_TERMS)) !== index.glossaryDigest) return false;
    return index.routes.every(route => typeof pages[route.routeId] === 'string' && typeof route.runtimeDigest === 'string' && fnv1a(pages[route.routeId]) === route.runtimeDigest);
  }

  function createEngine(index, navItems) {
    const entries = index && Array.isArray(index.entries) ? index.entries : [];
    const nav = navItems || [];
    return { search(query) {
      const normalized = normalizeText(query, false);
      const folded = normalizeText(query, true);
      if (!normalized) return [];
      const perRoute = Object.create(null);
      entries.forEach((entry, order) => {
        const exact = entry.normalized.indexOf(normalized);
        const foldedAt = entry.folded.indexOf(folded);
        if (exact < 0 && foldedAt < 0) return;
        const phrase = (exact === 0 || foldedAt === 0) ? 40 : 0;
        const score = (weights[entry.field] || 0) + phrase + (exact >= 0 ? 20 : 10);
        (perRoute[entry.routeId] || (perRoute[entry.routeId] = [])).push({ entry, score, order });
      });
      return Object.keys(perRoute).flatMap(route => perRoute[route].sort((a, b) => b.score - a.score || a.entry.blockIndex - b.entry.blockIndex || a.order - b.order).slice(0, 3))
        .sort((a, b) => b.score - a.score || a.entry.routeId.localeCompare(b.entry.routeId) || a.entry.blockIndex - b.entry.blockIndex || a.order - b.order)
        .map(hit => hit.entry);
    }, nav };
  }

  function highlightSegments(text, query) {
    const source = String(text || ''); const needle = normalizeText(query, true);
    if (!needle) return [{ text: source, mark: false }];
    const folded = normalizeText(source, true); const index = folded.indexOf(needle);
    if (index < 0) return [{ text: source, mark: false }];
    const end = Math.min(source.length, index + String(query).length);
    return [{ text: source.slice(0, index), mark: false }, { text: source.slice(index, end), mark: true }, { text: source.slice(end), mark: false }].filter(segment => segment.text);
  }

  function setStatus(text) { state.status.textContent = text; }
  function clearList() { state.list.replaceChildren(); state.active = -1; state.input.removeAttribute('aria-activedescendant'); }
  function resultButton(result, query, index) {
    const button = document.createElement('button'); button.type = 'button'; button.id = `search-result-${index}`; button.setAttribute('role', 'option'); button.setAttribute('aria-selected', 'false'); button.dataset.route = result.routeId; button.dataset.anchor = result.anchor;
    const label = document.createElement('strong'); label.textContent = result.heading || result.text;
    const snippet = document.createElement('span'); snippet.className = 'search-snippet';
    highlightSegments(result.text, query).forEach(part => { const node = part.mark ? document.createElement('mark') : document.createTextNode(part.text); if (part.mark) node.textContent = part.text; snippet.appendChild(node); });
    button.append(label, snippet); button.addEventListener('click', () => choose(index)); return button;
  }
  function render(query) {
    clearList();
    if (!query) { state.list.classList.remove('show'); state.input.setAttribute('aria-expanded', 'false'); setStatus(''); return; }
    state.results = state.engine ? state.engine.search(query) : state.navItems.filter(item => normalizeText(item.text, true).includes(normalizeText(query, true))).map(item => ({ routeId: item.id, text: item.text, heading: item.text, anchor: '' }));
    if (!state.engine) {
      const degraded = document.createElement('div'); degraded.className = 'search-degraded'; degraded.textContent = 'Tìm kiếm toàn văn không khả dụng; đang dùng mục lục.'; state.list.appendChild(degraded);
    }
    state.results.forEach((result, index) => state.list.appendChild(resultButton(result, query, index)));
    state.list.classList.add('show'); state.input.setAttribute('aria-expanded', 'true');
    setStatus(state.results.length ? `${state.results.length} kết quả${state.engine ? '' : ' từ mục lục'}` : `Không tìm thấy kết quả${state.engine ? '' : '; đang dùng mục lục'}`);
  }
  function choose(index) { const result = state.results[index]; if (!result) return; if (result.anchor) { root.pendingSearchAnchor = result.anchor; root.pendingSearchEntry = result; } root.loadPage(result.routeId); close(); }
  function move(delta) { const items = state.list.querySelectorAll('[role="option"]'); if (!items.length) return; state.active = Math.max(0, Math.min(items.length - 1, state.active + delta)); items.forEach((item, index) => { const selected = index === state.active; item.classList.toggle('hl', selected); item.setAttribute('aria-selected', String(selected)); }); state.input.setAttribute('aria-activedescendant', items[state.active].id); items[state.active].scrollIntoView({ block: 'nearest' }); }
  function query(value) { render(value); }
  function keyboard(event) { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : -1); } else if (event.key === 'Enter' && state.results.length) { event.preventDefault(); choose(state.active >= 0 ? state.active : 0); } else if (event.key === 'Escape') { event.preventDefault(); close(); state.input.focus(); } }
  function close() { clearList(); state.list.classList.remove('show'); state.input.setAttribute('aria-expanded', 'false'); }
  function applyPendingAnchor(container) {
    const anchor = root.pendingSearchAnchor; const result = root.pendingSearchEntry; if (!anchor) return; delete root.pendingSearchAnchor; delete root.pendingSearchEntry;
    const blocks = container.querySelectorAll('h1,h2,h3,h4,h5,h6,.l3-title,p,li,dt,dd,td,th,figcaption,button,label,option');
    const match = (result && result.blockIndex >= 0 && blocks[result.blockIndex]) || Array.from(blocks).find(block => block.id === anchor || block.dataset.searchAnchor === anchor) || blocks[0];
    if (match) { match.id = anchor; match.setAttribute('tabindex', '-1'); match.focus({ preventScroll: true }); match.scrollIntoView({ block: 'center' }); }
  }
  function init(options) {
    options = options || {}; state.navItems = options.navItems || state.navItems || [];
    state.input = document.getElementById('si'); state.list = document.getElementById('sr'); state.status = document.getElementById('search-status');
    if (!state.input || !state.list || !state.status) return api;
    state.engine = validIndex(root.SEARCH_INDEX) ? createEngine(root.SEARCH_INDEX, state.navItems) : null;
    state.input.setAttribute('role', 'combobox'); state.input.setAttribute('aria-controls', 'sr'); state.input.setAttribute('aria-expanded', 'false'); state.list.setAttribute('role', 'listbox');
    setStatus(state.engine ? '' : 'Tìm kiếm toàn văn không khả dụng; đang dùng mục lục.'); return api;
  }
  const api = { normalizeText, highlightSegments, createEngine, init, query, keyboard, close, ready: () => !!state.input, applyPendingAnchor };
  return api;
}));
