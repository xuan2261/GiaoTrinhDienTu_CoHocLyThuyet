/**
 * Progress Tracker & Bookmark System
 * Tracks reading progress per page, stores bookmarks in localStorage
 */
(function() {
  const STORE_KEY = 'chlyt_progress';
  const BM_KEY = 'chlyt_bookmarks';

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
  }
  function saveProgress(p) { localStorage.setItem(STORE_KEY, JSON.stringify(p)); }
  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem(BM_KEY)) || []; } catch { return []; }
  }
  function saveBookmarks(b) { localStorage.setItem(BM_KEY, JSON.stringify(b)); }

  function getCurrentPageId() {
    return location.hash.slice(1) || 'home';
  }

  // Mark page as visited + after 8s mark as read
  let readTimer = null;
  function trackPage(pageId) {
    if (!pageId || pageId === 'home') return;
    const p = getProgress();
    if (!p[pageId]) p[pageId] = { visits: 0, read: false };
    p[pageId].visits++;
    saveProgress(p);

    if (readTimer) clearTimeout(readTimer);
    readTimer = setTimeout(() => {
      const p2 = getProgress();
      if (p2[pageId]) { p2[pageId].read = true; saveProgress(p2); }
    }, 8000);
  }

  // Calc progress per chapter
  function calcProgress() {
    if (typeof PAGE_MAP === 'undefined') return {};
    const p = getProgress();
    const chapters = { ch1: [], ch2: [], ch3: [] };
    Object.keys(PAGE_MAP).forEach(k => {
      if (k.startsWith('ch1-') && PAGE_MAP[k]) chapters.ch1.push(k);
      if (k.startsWith('ch2-') && PAGE_MAP[k]) chapters.ch2.push(k);
      if (k.startsWith('ch3-') && PAGE_MAP[k]) chapters.ch3.push(k);
    });
    const result = {};
    for (const [ch, pages] of Object.entries(chapters)) {
      const read = pages.filter(pg => p[pg] && p[pg].read).length;
      result[ch] = { read, total: pages.length, pct: pages.length ? Math.round(read / pages.length * 100) : 0 };
    }
    return result;
  }

  // Inject progress bars on home page
  function injectProgressBars() {
    const ca = document.getElementById('content-area');
    if (!ca) return;
    // Only on home page
    const pageId = getCurrentPageId();
    if (pageId !== 'home') return;
    // Don't duplicate
    if (ca.querySelector('.progress-section')) return;
    const sg = ca.querySelector('.sg');
    if (!sg) return;

    const prog = calcProgress();
    const section = document.createElement('div');
    section.className = 'progress-section';
    section.style.cssText = 'margin:1rem 0;padding:1rem;background:var(--nav);border:1px solid var(--bdr);border-radius:8px;';

    const names = ['Tĩnh học', 'Động học', 'Động lực học'];
    const colors = ['#2980b9', '#27ae60', '#8e44ad'];
    const chs = ['ch1', 'ch2', 'ch3'];

    let html = '<div style="font-size:.85rem;font-weight:600;color:var(--gold);margin-bottom:.6rem;">📊 Tiến trình học tập</div>';
    chs.forEach((ch, i) => {
      const d = prog[ch] || { read: 0, total: 0, pct: 0 };
      html += `<div style="margin-bottom:.5rem;">
        <div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--tx2);margin-bottom:3px;">
          <span>Chương ${i + 1}: ${names[i]}</span>
          <span>${d.read}/${d.total} (${d.pct}%)</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${d.pct}%;background:${colors[i]};border-radius:3px;transition:width .5s;"></div>
        </div>
      </div>`;
    });
    section.innerHTML = html;
    sg.after(section);
  }

  // Bookmark button in topbar
  function injectBookmarkBtn() {
    const existing = document.querySelector('.bookmark-btn');
    if (existing) existing.remove();
    const pageId = getCurrentPageId();
    if (!pageId || pageId === 'home') return;

    const bm = getBookmarks();
    const isBookmarked = bm.includes(pageId);
    const btn = document.createElement('button');
    btn.className = 'bookmark-btn';
    btn.title = isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu trang này';
    btn.innerHTML = isBookmarked ? '🔖' : '📑';
    btn.style.cssText = 'background:none;border:1px solid rgba(255,255,255,0.15);color:#fbbf24;font-size:1.1rem;cursor:pointer;padding:2px 6px;border-radius:5px;transition:all .2s;margin-right:4px;';
    btn.addEventListener('click', () => {
      const bm2 = getBookmarks();
      const idx = bm2.indexOf(pageId);
      if (idx >= 0) { bm2.splice(idx, 1); btn.innerHTML = '📑'; btn.title = 'Đánh dấu trang này'; }
      else { bm2.push(pageId); btn.innerHTML = '🔖'; btn.title = 'Bỏ đánh dấu'; }
      saveBookmarks(bm2);
    });

    const bc = document.querySelector('.bc');
    if (bc && bc.parentElement) {
      bc.parentElement.insertBefore(btn, bc);
    }
  }

  // Run on page change
  function onPageChange() {
    const pageId = getCurrentPageId();
    trackPage(pageId);
    setTimeout(() => {
      injectBookmarkBtn();
      injectProgressBars();
    }, 300);
  }

  // Listen for hash changes
  window.addEventListener('hashchange', onPageChange);

  // Use MutationObserver on content-area to detect content loads
  const observer = new MutationObserver(() => {
    setTimeout(() => {
      injectBookmarkBtn();
      injectProgressBars();
    }, 200);
  });

  // Initialize
  function init() {
    const ca = document.getElementById('content-area');
    if (ca) {
      observer.observe(ca, { childList: true, subtree: false });
    }
    onPageChange();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
