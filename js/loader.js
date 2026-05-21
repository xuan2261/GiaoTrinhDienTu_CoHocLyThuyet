/**
 * Giáo Trình Điện Tử – Cơ Học Lý Thuyết
 * Page Loader (Lazy Loading via fetch)
 * Loads HTML fragments on demand, caches them, renders KaTeX
 */

const LEGACY_ROUTE_MAP = {
  'ch1-8': 'ch1-7',
  'ch1-8-1': 'ch1-7-1',
  'ch1-8-2': 'ch1-7-2',
  'ch1-8-3': 'ch1-7-3',
  'ch2-8': 'ch2-7',
  'ch2-8-1': 'ch2-7-1',
  'ch2-8-2': 'ch2-7-2',
  'ch2-8-3': 'ch2-7-3',
};

// Keep hook for historical route remaps; current 58-route set mounts by exact page id.
const SIM_ROUTE_ALIAS_MAP = {};

// ============================================
// PAGE MAP: pageId → fragment path
// ============================================
const PAGE_MAP = {
  'home': null,
  'lnd': 'chapters/loi-noi-dau.html',
  'authors': 'chapters/tac-gia.html',
  'refs': 'chapters/tai-lieu-tham-khao.html',

  // Chapter 1
  'ch1': 'chapters/ch1/index.html',
  'ch1-1': 'chapters/ch1/muc-I.html',
  'ch1-1-1': 'chapters/ch1/muc-I-1.html',
  'ch1-1-2': 'chapters/ch1/muc-I-2.html',
  'ch1-1-3': 'chapters/ch1/muc-I-3.html',
  'ch1-1-4': 'chapters/ch1/muc-I-4.html',
  'ch1-1-5': 'chapters/ch1/muc-I-5.html',
  'ch1-1-6': 'chapters/ch1/muc-I-6.html',
  'ch1-1-7': 'chapters/ch1/muc-I-7.html',
  'ch1-1-8': 'chapters/ch1/muc-I-8.html',
  'ch1-2': 'chapters/ch1/muc-II.html',
  'ch1-2-1': 'chapters/ch1/muc-II-1.html',
  'ch1-2-2': 'chapters/ch1/muc-II-2.html',
  'ch1-2-3': 'chapters/ch1/muc-II-3.html',
  'ch1-2-4': 'chapters/ch1/muc-II-4.html',
  'ch1-2-5': 'chapters/ch1/muc-II-5.html',
  'ch1-2-6': 'chapters/ch1/muc-II-6.html',
  'ch1-3': 'chapters/ch1/muc-III.html',
  'ch1-3-1': 'chapters/ch1/muc-III-1.html',
  'ch1-3-2': 'chapters/ch1/muc-III-2.html',
  'ch1-3-3': 'chapters/ch1/muc-III-3.html',
  'ch1-3-4': 'chapters/ch1/muc-III-4.html',
  'ch1-3-5': 'chapters/ch1/muc-III-5.html',
  'ch1-3-6': 'chapters/ch1/muc-III-6.html',
  'ch1-3-7': 'chapters/ch1/muc-III-7.html',
  'ch1-4': 'chapters/ch1/muc-IV.html',
  'ch1-4-1': 'chapters/ch1/muc-IV-1.html',
  'ch1-4-2': 'chapters/ch1/muc-IV-2.html',
  'ch1-4-3': 'chapters/ch1/muc-IV-3.html',
  'ch1-4-4': 'chapters/ch1/muc-IV-4.html',
  'ch1-4-5': 'chapters/ch1/muc-IV-5.html',
  'ch1-5': 'chapters/ch1/muc-V.html',
  'ch1-5-1': 'chapters/ch1/muc-V-1.html',
  'ch1-5-2': 'chapters/ch1/muc-V-2.html',
  'ch1-5-3': 'chapters/ch1/muc-V-3.html',
  'ch1-5-4': 'chapters/ch1/muc-V-4.html',
  'ch1-6': 'chapters/ch1/muc-VI.html',
  'ch1-6-1': 'chapters/ch1/muc-VI-1.html',
  'ch1-6-2': 'chapters/ch1/muc-VI-2.html',
  'ch1-6-3': 'chapters/ch1/muc-VI-3.html',
  'ch1-7': 'chapters/ch1/muc-VII.html',
  'ch1-7-1': 'chapters/ch1/muc-VII-1.html',
  'ch1-7-2': 'chapters/ch1/muc-VII-2.html',
  'ch1-7-3': 'chapters/ch1/muc-VII-3.html',
  'ch1-rev': 'chapters/ch1/on-tap.html',
  'ch1-quiz': 'chapters/ch1/trac-nghiem.html',

  // Chapter 2
  'ch2': 'chapters/ch2/index.html',
  'ch2-1': 'chapters/ch2/muc-I.html',
  'ch2-1-1': 'chapters/ch2/muc-I-1.html',
  'ch2-1-2': 'chapters/ch2/muc-I-2.html',
  'ch2-1-3': 'chapters/ch2/muc-I-3.html',
  'ch2-1-4': 'chapters/ch2/muc-I-4.html',
  'ch2-2': 'chapters/ch2/muc-II.html',
  'ch2-2-1': 'chapters/ch2/muc-II-1.html',
  'ch2-2-2': 'chapters/ch2/muc-II-2.html',
  'ch2-3': 'chapters/ch2/muc-III.html',
  'ch2-3-1': 'chapters/ch2/muc-III-1.html',
  'ch2-3-2': 'chapters/ch2/muc-III-2.html',
  'ch2-4': 'chapters/ch2/muc-IV.html',
  'ch2-4-1': 'chapters/ch2/muc-IV-1.html',
  'ch2-4-2': 'chapters/ch2/muc-IV-2.html',
  'ch2-4-3': 'chapters/ch2/muc-IV-3.html',
  'ch2-4-4': 'chapters/ch2/muc-IV-4.html',
  'ch2-5': 'chapters/ch2/muc-V.html',
  'ch2-5-1': 'chapters/ch2/muc-V-1.html',
  'ch2-5-2': 'chapters/ch2/muc-V-2.html',
  'ch2-5-3': 'chapters/ch2/muc-V-3.html',
  'ch2-6': 'chapters/ch2/muc-VI.html',
  'ch2-6-1': 'chapters/ch2/muc-VI-1.html',
  'ch2-6-2': 'chapters/ch2/muc-VI-2.html',
  'ch2-6-3': 'chapters/ch2/muc-VI-2.html',
  'ch2-7': 'chapters/ch2/muc-VII.html',
  'ch2-7-1': 'chapters/ch2/muc-VII-1.html',
  'ch2-7-2': 'chapters/ch2/muc-VII-2.html',
  'ch2-7-3': 'chapters/ch2/muc-VII-3.html',
  'ch2-rev': 'chapters/ch2/on-tap.html',
  'ch2-quiz': 'chapters/ch2/trac-nghiem.html',

  // Chapter 3
  'ch3': 'chapters/ch3/index.html',
  'ch3-1': 'chapters/ch3/muc-I.html',
  'ch3-1-1': 'chapters/ch3/muc-I-1.html',
  'ch3-1-2': 'chapters/ch3/muc-I-2.html',
  'ch3-1-3': 'chapters/ch3/muc-I-3.html',
  'ch3-2': 'chapters/ch3/muc-II.html',
  'ch3-2-1': 'chapters/ch3/muc-II-1.html',
  'ch3-2-2': 'chapters/ch3/muc-II-2.html',
  'ch3-2-3': 'chapters/ch3/muc-II-3.html',
  'ch3-2-4': 'chapters/ch3/muc-II-4.html',
  'ch3-2-5': 'chapters/ch3/muc-II-5.html',
  'ch3-3': 'chapters/ch3/muc-III.html',
  'ch3-3-1': 'chapters/ch3/muc-III-1.html',
  'ch3-3-2': 'chapters/ch3/muc-III-2.html',
  'ch3-3-3': 'chapters/ch3/muc-III-2.html',
  'ch3-4': 'chapters/ch3/muc-IV.html',
  'ch3-4-1': 'chapters/ch3/muc-IV-1.html',
  'ch3-4-2': 'chapters/ch3/muc-IV-2.html',
  'ch3-5': 'chapters/ch3/muc-V.html',
  'ch3-5-1': 'chapters/ch3/muc-V-1.html',
  'ch3-5-2': 'chapters/ch3/muc-V-2.html',
  'ch3-5-3': 'chapters/ch3/muc-V-3.html',
  'ch3-5-4': 'chapters/ch3/muc-V-4.html',
  'ch3-6': 'chapters/ch3/muc-VI.html',
  'ch3-6-1': 'chapters/ch3/muc-VI-1.html',
  'ch3-6-2': 'chapters/ch3/muc-VI-2.html',
  'ch3-6-3': 'chapters/ch3/muc-VI-3.html',
  'ch3-6-4': 'chapters/ch3/muc-VI-3.html',
  'ch3-7': 'chapters/ch3/muc-VII.html',
  'ch3-7-1': 'chapters/ch3/muc-VII-1.html',
  'ch3-7-2': 'chapters/ch3/muc-VII-2.html',
  'ch3-7-3': 'chapters/ch3/muc-VII-3.html',
  'ch3-7-4': 'chapters/ch3/muc-VII-4.html',
  'ch3-7-5': 'chapters/ch3/muc-VII-5.html',
  'ch3-7-6': 'chapters/ch3/muc-VII-6.html',
  'ch3-rev': 'chapters/ch3/on-tap.html',
  'ch3-quiz': 'chapters/ch3/trac-nghiem.html',
};

// ============================================
// CACHE
// ============================================
const pageCache = {};
let currentPageId = 'home';
let activeSimulationDispose = null;
let loadSequence = 0;

function disposeActiveSimulation() {
  if (typeof activeSimulationDispose === 'function') {
    try {
      activeSimulationDispose();
    } catch (err) {
      console.warn('Simulation dispose error:', err);
    }
  }
  activeSimulationDispose = null;
}

// ============================================
// LOADING SKELETON
// ============================================
function showLoading() {
  const ca = document.getElementById('content-area');
  ca.innerHTML = `
    <div class="loading-skeleton">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>`;
}

// ============================================
// LOAD PAGE
// ============================================
async function loadPage(id) {
  id = LEGACY_ROUTE_MAP[id] || id;

  let baseId = id;
  while (baseId && !PAGE_MAP.hasOwnProperty(baseId)) {
    let nextId = baseId.replace(/[a-z]$/, '');
    if (nextId === baseId) {
      nextId = baseId.replace(/-\d+$/, '');
    }
    if (nextId === baseId) break;
    baseId = nextId;
  }

  if (!PAGE_MAP.hasOwnProperty(baseId)) {
    console.warn('Page not found:', id);
    return;
  }

  const loadToken = ++loadSequence;
  disposeActiveSimulation();
  currentPageId = id;

  // Update URL hash
  window.location.hash = id;

  // Update breadcrumb
  document.getElementById('bc').innerHTML = BC[baseId] || 'Trang chủ';

  // Update sidebar active state
  updateActiveNav(baseId);

  // Close mobile sidebar
  if (window.innerWidth <= 768) {
    document.getElementById('sb').classList.remove('om');
    document.getElementById('ov').classList.remove('show');
  }

  closeSR();

  // If page is null (embedded in index.html like home page)
  if (PAGE_MAP[baseId] === null) {
    const ca = document.getElementById('content-area');
    const homePage = document.getElementById('page-home-content');
    if (homePage) {
      ca.innerHTML = homePage.innerHTML;
    }
    addPageNavButtons(baseId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    markPageRead(baseId);
    return;
  }

  const path = PAGE_MAP[baseId];

  // Show loading if not cached
  if (!pageCache[baseId]) {
    showLoading();
  }

  try {
    // Check cache first
    if (!pageCache[baseId]) {
      // Use inline bundle (PAGES) for offline/USB mode
      if (typeof PAGES !== 'undefined' && PAGES[baseId]) {
        pageCache[baseId] = PAGES[baseId];
      } else {
        if (window.location && window.location.protocol === 'file:') {
          throw new Error(`Offline bundle missing for ${baseId}`);
        }
        // Fallback to fetch (dev server mode)
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        pageCache[baseId] = await response.text();
      }
    }

    if (loadToken !== loadSequence) return;

    const ca = document.getElementById('content-area');
    ca.innerHTML = pageCache[baseId];

    // Execute inline scripts (e.g. quiz renderQuiz calls)
    ca.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // Render KaTeX if available
    renderMath(ca);

    // Init simulations if any (BEFORE nav buttons so sims appear above)
    await initSimulations(ca, id);

    // Add page navigation buttons (AFTER sims)
    addPageNavButtons(id);

    // Init image tab switchers
    initImageTabs(ca);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Mark as read
    markPageRead(id);

  } catch (err) {
    if (loadToken !== loadSequence) return;
    const ca = document.getElementById('content-area');
    ca.innerHTML = `
      <div class="l3-content" style="text-align:center;">
        <div class="l3-title">📄 ${BC[id] || id}</div>
        <p class="l3-placeholder"><em>(Nội dung đang được cập nhật. Vui lòng quay lại sau.)</em></p>
      </div>`;
    initSimulations(ca, id);
    addPageNavButtons(id);
    console.warn('Failed to load page:', path, err);
  }
}

// ============================================
// PAGE NAV BUTTONS
// ============================================
function addPageNavButtons(id) {
  const ca = document.getElementById('content-area');
  const i = PAGE_ORDER.indexOf(id);
  if (i === -1) return;

  let prevBtn = '', nextBtn = '';

  if (i > 0) {
    const pid = PAGE_ORDER[i - 1];
    const pname = BC[pid] || pid;
    prevBtn = `<a class="pn-btn prev" onclick="loadPage('${pid}');return false" href="#">
      <span class="pn-arrow prev">←</span>
      <span><span class="pn-label">Trước</span><span class="pn-title">${pname}</span></span>
    </a>`;
  }

  if (i < PAGE_ORDER.length - 1) {
    const nid = PAGE_ORDER[i + 1];
    const nname = BC[nid] || nid;
    nextBtn = `<a class="pn-btn next" onclick="loadPage('${nid}');return false" href="#">
      <span><span class="pn-label">Tiếp theo</span><span class="pn-title">${nname}</span></span>
      <span class="pn-arrow next">→</span>
    </a>`;
  }

  if (!prevBtn && !nextBtn) return;
  if (!prevBtn) prevBtn = '<div class="pn-spacer"></div>';
  if (!nextBtn) nextBtn = '<div class="pn-spacer"></div>';

  const nav = document.createElement('div');
  nav.className = 'page-nav';
  nav.innerHTML = prevBtn + nextBtn;
  ca.appendChild(nav);
}

// ============================================
// KATEX RENDERING
// ============================================
function renderMath(container) {
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }
      ],
      output: 'htmlAndMathml',
      throwOnError: false,
      strict: code =>
        code === 'unicodeTextInMathMode' || code === 'unknownSymbol'
          ? 'ignore'
          : 'warn'
    });
  }

  // Also handle .math-block and .math-inline elements
  container.querySelectorAll('.math-block, .math-inline').forEach(el => {
    if (typeof katex !== 'undefined' && !el.querySelector('.katex')) {
      try {
        katex.render(el.textContent, el, {
          displayMode: el.classList.contains('math-block'),
          throwOnError: false,
          strict: code =>
            code === 'unicodeTextInMathMode' || code === 'unknownSymbol'
              ? 'ignore'
              : 'warn'
        });
      } catch (e) {
        console.warn('KaTeX render error:', e);
      }
    }
  });
}

// ============================================
// IMAGE TAB SWITCHER
// ============================================
function initImageTabs(container) {
  container.querySelectorAll('.img-compare').forEach(comp => {
    comp.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        comp.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        comp.querySelectorAll('.img-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = comp.querySelector(`.img-panel.${target}`);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

// ============================================
// SIMULATION INIT
// ============================================
async function loadSimScript(id) {
  // If already in map, it's loaded
  if (window.SIM_MAP && window.SIM_MAP[id]) return;

  // Determine path based on chapter prefix
  let path = `js/simulations/${id}.js`; // Fallback
  if (id.startsWith('ch1-')) path = `js/routes/ch1/${id}.js`;
  else if (id.startsWith('ch2-')) path = `js/routes/ch2/${id}.js`;
  else if (id.startsWith('ch3-')) path = `js/routes/ch3/${id}.js`;
  else if (id.startsWith('pilot-')) path = `js/routes/${id}.js`;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = path;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      console.warn(`Simulation script not found: ${path}`);
      resolve(); // Resolve anyway to not block page load
    };
    document.head.appendChild(script);
  });
}

async function initSimulations(container, pageId) {
  const simRouteId = SIM_ROUTE_ALIAS_MAP[pageId] || pageId;

  // Try to load script first
  await loadSimScript(simRouteId);

  // Inject simulation from js/simulations.js if available for current page
  if (window.SIM_MAP && window.SIM_MAP[simRouteId]) {
    let mountPoint = container.querySelector('#sim-' + simRouteId) ||
      container.querySelector('.sim-mount') ||
      container.querySelector('.sim-container:not(.sim-lab)');
    if (!mountPoint) {
      // Create a mount point at the bottom if none exists
      mountPoint = document.createElement('div');
      mountPoint.className = 'sim-mount';
      container.appendChild(mountPoint);
    }
    mountPoint.classList.remove('sim-container');
    mountPoint.classList.add('sim-mount');

    // Don't inject twice
    if (!mountPoint.hasAttribute('data-sim-mount-route')) {
      try {
        mountPoint.setAttribute('data-sim-mount-route', simRouteId);
        const mounted = window.SIM_MAP[simRouteId](mountPoint);
        if (typeof mounted === 'function') {
          activeSimulationDispose = mounted;
        } else if (mounted && typeof mounted.dispose === 'function') {
          activeSimulationDispose = () => mounted.dispose();
        }
      } catch (err) {
        activeSimulationDispose = null;
        console.warn('Failed to initialize simulation:', simRouteId, err);
      }
    }
  }
}

// ============================================
// HASH CHANGE HANDLER
// ============================================
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && hash !== currentPageId) {
    loadPage(hash);
  }
});

// Make loadPage globally accessible
window.loadPage = loadPage;
