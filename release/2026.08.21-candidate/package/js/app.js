/**
 * Giáo Trình Điện Tử – Cơ Học Lý Thuyết
 * Core Application Logic
 * Navigation, Theme, Search, Font Zoom, Breadcrumb
 */

// ============================================
// BREADCRUMB MAP
// ============================================
const BC = {
  'home': 'Trang chủ',
  'lnd': 'Lời nói đầu',
  'authors': 'Tác giả',
  'refs': 'Tài liệu tham khảo',
  'ch1': 'Chương 1 › Tĩnh học',
  'ch1-1': 'Chương 1 › I. KHÁI NIỆM CƠ BẢN',
  'ch1-1-1': 'Chương 1 › I › 1. Vật rắn tuyệt đối',
  'ch1-1-2': 'Chương 1 › I › 2. Cân bằng',
  'ch1-1-3': 'Chương 1 › I › 3. Lực',
  'ch1-1-4': 'Chương 1 › I › 4. Mô men',
  'ch1-1-5': 'Chương 1 › I › 5. Hệ lực',
  'ch1-1-6': 'Chương 1 › I › 6. Ngẫu lực',
  'ch1-1-7': 'Chương 1 › I › 7. Vật tự do và vật không tự do',
  'ch1-1-8': 'Chương 1 › I › 8. Lực liên kết, lực hoạt động, phản lực liên kết',
  'ch1-2': 'Chương 1 › II. CÁC ĐỊNH LUẬT TĨNH HỌC',
  'ch1-2-1': 'Chương 1 › II › 1. Định luật hai lực cân bằng',
  'ch1-2-2': 'Chương 1 › II › 2. Định luật thêm bớt hai lực cân bằng',
  'ch1-2-3': 'Chương 1 › II › 3. Định luật hình bình hành lực',
  'ch1-2-4': 'Chương 1 › II › 4. Định luật tác dụng và phản tác dụng',
  'ch1-2-5': 'Chương 1 › II › 5. Định luật hóa rắn',
  'ch1-2-6': 'Chương 1 › II › 6. Định luật về giải phóng liên kết',
  'ch1-3': 'Chương 1 › III. MỘT SỐ LIÊN KẾT THƯỜNG GẶP',
  'ch1-3-1': 'Chương 1 › III › 1. Liên kết tựa',
  'ch1-3-2': 'Chương 1 › III › 2. Liên kết dây mềm, thẳng',
  'ch1-3-3': 'Chương 1 › III › 3. Liên kết bản lề',
  'ch1-3-4': 'Chương 1 › III › 4. Liên kết gối',
  'ch1-3-5': 'Chương 1 › III › 5. Liên kết gối cầu',
  'ch1-3-6': 'Chương 1 › III › 6. Liên kết ngàm',
  'ch1-3-7': 'Chương 1 › III › 7. Liên kết thanh',
  'ch1-4': 'Chương 1 › IV. HỆ LỰC KHÔNG GIAN',
  'ch1-4-1': 'Chương 1 › IV › 1. Véc tơ chính của hệ lực không gian',
  'ch1-4-2': 'Chương 1 › IV › 2. Mô men chính của hệ lực không gian đối với một tâm',
  'ch1-4-3': 'Chương 1 › IV › 3. Các dạng cơ bản của hệ lực không gian',
  'ch1-4-4': 'Chương 1 › IV › 4. Điều kiện cân bằng và phương trình cân bằng của hệ lực không gian',
  'ch1-4-5': 'Chương 1 › IV › 5. Điều kiện cân bằng và phương trình cân bằng của hệ lực đặc biệt',
  'ch1-5': 'Chương 1 › V. MA SÁT',
  'ch1-5-1': 'Chương 1 › V › 1. Khái niệm',
  'ch1-5-2': 'Chương 1 › V › 2. Phân loại ma sát',
  'ch1-5-3': 'Chương 1 › V › 3. Định luật ma sát',
  'ch1-5-4': 'Chương 1 › V › 4. Hiện tượng tự hãm',
  'ch1-6': 'Chương 1 › VI. TRỌNG TÂM',
  'ch1-6-1': 'Chương 1 › VI › 1. Khái niệm',
  'ch1-6-2': 'Chương 1 › VI › 2. Công thức tính trọng tâm',
  'ch1-6-3': 'Chương 1 › VI › 3. Tính chất và trọng tâm một số vật',
  'ch1-7': 'Chương 1 › VII. BÀI TẬP',
  'ch1-7-1': 'Chương 1 › VII › 1. Hướng dẫn giải bài tập',
  'ch1-7-2': 'Chương 1 › VII › 2. Bài tập',
  'ch1-rev': 'Chương 1 › Câu hỏi ôn tập',
  'ch1-quiz': 'Chương 1 › Ôn tập trắc nghiệm',
  'ch2': 'Chương 2 › Động học',
  'ch2-1': 'Chương 2 › I. KHẢO SÁT CHUYỂN ĐỘNG CỦA CHẤT ĐIỂM',
  'ch2-1-1': 'Chương 2 › I › 1. Phương pháp véc tơ',
  'ch2-1-2': 'Chương 2 › I › 2. Phương pháp tọa độ Đề các',
  'ch2-1-3': 'Chương 2 › I › 3. Phương pháp tọa độ tự nhiên',
  'ch2-1-4': 'Chương 2 › I › 4. Các dạng chuyển động đặc biệt',
  'ch2-2': 'Chương 2 › II. CHUYỂN ĐỘNG CƠ BẢN CỦA VẬT RẮN',
  'ch2-2-1': 'Chương 2 › II › 1. Chuyển động tịnh tiến',
  'ch2-2-2': 'Chương 2 › II › 2. Chuyển động quay quanh một trục cố định',
  'ch2-3': 'Chương 2 › III. TRUYỀN ĐỘNG ĐƠN GIẢN',
  'ch2-3-1': 'Chương 2 › III › 1. Khái niệm',
  'ch2-3-2': 'Chương 2 › III › 2. Một số loại truyền động đơn giản',
  'ch2-4': 'Chương 2 › IV. HỢP CHUYỂN ĐỘNG ĐIỂM',
  'ch2-4-1': 'Chương 2 › IV › 1. Bài toán',
  'ch2-4-2': 'Chương 2 › IV › 2. Định nghĩa các chuyển động',
  'ch2-4-3': 'Chương 2 › IV › 3. Định lý về hợp vận tốc',
  'ch2-4-4': 'Chương 2 › IV › 4. Định lý về hợp gia tốc',
  'ch2-5': 'Chương 2 › V. CHUYỂN ĐỘNG SONG PHẲNG',
  'ch2-5-1': 'Chương 2 › V › 1. Khái niệm và mô hình',
  'ch2-5-2': 'Chương 2 › V › 2. Khảo sát chuyển động của vật rắn',
  'ch2-5-3': 'Chương 2 › V › 3. Khảo sát chuyển động của các điểm thuộc vật rắn',
  'ch2-6': 'Chương 2 › VI. CHUYỂN ĐỘNG CỦA VẬT RẮN QUAY QUANH 1 ĐIỂM CỐ ĐỊNH',
  'ch2-6-1': 'Chương 2 › VI › 1. Khái niệm',
  'ch2-6-2': 'Chương 2 › VI › 2. Phân tích chuyển động',
  'ch2-7': 'Chương 2 › VII. BÀI TẬP',
  'ch2-7-1': 'Chương 2 › VII › 1. Hướng dẫn giải bài tập',
  'ch2-7-2': 'Chương 2 › VII › 2. Bài tập',
  'ch2-rev': 'Chương 2 › Câu hỏi ôn tập',
  'ch2-quiz': 'Chương 2 › Ôn tập trắc nghiệm',
  'ch3': 'Chương 3 › Động lực học',
  'ch3-1': 'Chương 3 › I. CÁC KHÁI NIỆM',
  'ch3-1-1': 'Chương 3 › I › 1. Vật thể',
  'ch3-1-2': 'Chương 3 › I › 2. Lực',
  'ch3-1-3': 'Chương 3 › I › 3. Hệ quy chiếu quán tính',
  'ch3-2': 'Chương 3 › II. CÁC ĐỊNH LUẬT CƠ BẢN',
  'ch3-2-1': 'Chương 3 › II › 1. Định luật quán tính',
  'ch3-2-2': 'Chương 3 › II › 2. Định luật cơ bản của động lực học',
  'ch3-2-3': 'Chương 3 › II › 3. Định luật tác dụng và phản tác dụng',
  'ch3-2-4': 'Chương 3 › II › 4. Định luật về tính độc lập giữa tác dụng của lực',
  'ch3-2-5': 'Chương 3 › II › 5. Định luật giải phóng liên kết',
  'ch3-3': 'Chương 3 › III. PHƯƠNG TRÌNH VI PHÂN CHUYỂN ĐỘNG',
  'ch3-3-1': 'Chương 3 › III › 1. Phương trình vi phân chuyển động của chất điểm',
  'ch3-3-2': 'Chương 3 › III › 2. Phương trình vi phân chuyển động của cơ hệ',
  'ch3-4': 'Chương 3 › IV. HAI BÀI TOÁN CƠ BẢN CỦA ĐỘNG LỰC HỌC',
  'ch3-4-1': 'Chương 3 › IV › 1. Bài toán thuận',
  'ch3-4-2': 'Chương 3 › IV › 2. Bài toán ngược',
  'ch3-5': 'Chương 3 › V. CÁC ĐỊNH LÝ TỔNG QUÁT',
  'ch3-5-1': 'Chương 3 › V › 1. Định lý chuyển động khối tâm',
  'ch3-5-2': 'Chương 3 › V › 2. Định lý động lượng',
  'ch3-5-3': 'Chương 3 › V › 3. Định lý mô men động lượng',
  'ch3-5-4': 'Chương 3 › V › 4. Định lý động năng',
  'ch3-6': 'Chương 3 › VI. LÝ THUYẾT VA CHẠM',
  'ch3-6-1': 'Chương 3 › VI › 1. Các đặc điểm và giả thiết về va chạm',
  'ch3-6-2': 'Chương 3 › VI › 2. Các định lý tổng quát của động lực học áp dụng vào va chạm',
  'ch3-6-3': 'Chương 3 › VI › 3. Hai bài toán cơ bản về va chạm',
  'ch3-7': 'Chương 3 › VII. BÀI TẬP',
  'ch3-7-1': 'Chương 3 › VII › 1. Hướng dẫn giải bài tập',
  'ch3-7-2': 'Chương 3 › VII › 2. Bài tập',
  'ch3-rev': 'Chương 3 › Câu hỏi ôn tập',
  'ch3-quiz': 'Chương 3 › Ôn tập trắc nghiệm',
};

function initBC() {
  BC['home'] = 'Trang chủ';
  BC['lnd'] = 'Lời nói đầu';
  BC['authors'] = 'Tác giả';
  BC['refs'] = 'Tài liệu tham khảo';
  BC['ch1'] = 'Chương 1 › Tĩnh học';
  BC['ch2'] = 'Chương 2 › Động học';
  BC['ch3'] = 'Chương 3 › Động lực học';

  // Build from sidebar links
  document.querySelectorAll('.sub-menu .l2').forEach(a => {
    const m = a.getAttribute('onclick') || a.getAttribute('data-page');
    if (m) {
      const r = m.match(/(?:loadPage|showPage)\('([^']+)'\)/);
      if (r && !BC[r[1]]) {
        const ch = r[1].startsWith('ch1') ? 'Chương 1 › ' :
                   r[1].startsWith('ch2') ? 'Chương 2 › ' : 'Chương 3 › ';
        BC[r[1]] = ch + a.textContent.replace('▶', '').trim();
      }
    }
  });

  document.querySelectorAll('.sub-menu .l3').forEach(a => {
    const m = a.getAttribute('onclick') || a.getAttribute('data-page');
    if (m) {
      const r = m.match(/(?:loadPage|showPage)\('([^']+)'\)/);
      if (r && !BC[r[1]]) {
        const ch = r[1].startsWith('ch1') ? 'Chương 1 › ' :
                   r[1].startsWith('ch2') ? 'Chương 2 › ' : 'Chương 3 › ';
        const grp = a.closest('.l2-group');
        let parentL2 = '';
        if (grp) {
          const l2a = grp.querySelector('.l2.has-sub');
          if (l2a) {
            let t = l2a.textContent.replace('▶', '').trim();
            const rm = t.match(/^([IVXLC]+)\./);
            parentL2 = (rm ? rm[1] : t) + ' › ';
          }
        }
        BC[r[1]] = ch + parentL2 + a.textContent.trim();
      }
    }
  });
}

// ============================================
// SIDEBAR NAVIGATION
// ============================================
function setNav(b) {
  document.querySelectorAll('.nav-btn').forEach(x => {
    x.classList.remove('active');
    x.removeAttribute('aria-current');
  });
  b.classList.add('active');
  b.setAttribute('aria-current', 'page');
}

function togSub(b) {
  const menu = b.nextElementSibling;
  const expanded = !b.classList.contains('open');
  b.classList.toggle('open', expanded);
  b.setAttribute('aria-expanded', String(expanded));
  menu.hidden = !expanded;
  menu.classList.toggle('open', expanded);
}

function togL3(a) {
  const menu = a.closest('.l2-group').querySelector('.l3-menu');
  const expanded = !a.classList.contains('open');
  a.classList.toggle('open', expanded);
  a.setAttribute('aria-expanded', String(expanded));
  menu.hidden = !expanded;
  menu.classList.toggle('open', expanded);
}

function setSidebar(open, focusToggle) {
  const sidebar = document.getElementById('sb');
  const overlay = document.getElementById('ov');
  const toggle = document.querySelector('.menu-toggle');
  const mobile = window.innerWidth <= 768;
  sidebar.hidden = !open;
  sidebar.classList.toggle('om', mobile && open);
  sidebar.classList.toggle('closed', !mobile && !open);
  overlay.classList.toggle('show', mobile && open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Đóng mục lục' : 'Mở mục lục');
  toggle.title = open ? 'Đóng mục lục' : 'Mở mục lục';
  if (focusToggle) toggle.focus();
}

function tSB() {
  const sidebar = document.getElementById('sb');
  const open = window.innerWidth <= 768
    ? sidebar.classList.contains('om')
    : !sidebar.classList.contains('closed');
  setSidebar(!open, false);
}

function updateActiveNav(id) {
  document.querySelectorAll('.sub-menu .l2, .sub-menu .l3').forEach(a => {
    const m = a.getAttribute('onclick') || '';
    const r = m.match(/(?:loadPage|showPage)\('([^']+)'\)/);
    const active = Boolean(r && r[1] === id);
    a.classList.toggle('active', active);
    if (active) {
      a.setAttribute('aria-current', 'page');
      const chapterMenu = a.closest('.sub-menu');
      if (chapterMenu) {
        chapterMenu.hidden = false;
        chapterMenu.classList.add('open');
        const chapterControl = chapterMenu.previousElementSibling;
        chapterControl.classList.add('open');
        chapterControl.setAttribute('aria-expanded', 'true');
      }
      const sectionMenu = a.closest('.l3-menu');
      if (sectionMenu) {
        sectionMenu.hidden = false;
        sectionMenu.classList.add('open');
        const sectionControl = sectionMenu.closest('.l2-group').querySelector('.l2.has-sub');
        sectionControl.classList.add('open');
        sectionControl.setAttribute('aria-expanded', 'true');
      }
    } else a.removeAttribute('aria-current');
  });
}

// ============================================
// THEME
// ============================================
function updateThemeControl(theme) {
  const btn = document.getElementById('themeBtn');
  if (!btn) return;
  const light = theme === 'light';
  btn.textContent = light ? '☀️' : '🌙';
  btn.setAttribute('aria-pressed', String(light));
  btn.setAttribute('aria-label', light ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng');
  btn.title = light ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng';
}

function togTheme() {
  const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  updateThemeControl(t);
  localStorage.setItem('theme', t);
}

(function initTheme() {
  const t = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  updateThemeControl(t);
})();

// ============================================
// SEARCH
// ============================================
const SDB = [];

function buildSDB() {
  document.querySelectorAll('.sub-menu .l2, .sub-menu .l3').forEach(a => {
    const match = (a.getAttribute('onclick') || '').match(/(?:loadPage|showPage)\('([^']+)'\)/);
    if (match) SDB.push({ id: match[1], text: a.textContent.replace('▶', '').trim() });
  });
  SDB.push({ id: 'home', text: 'Trang chủ' }, { id: 'lnd', text: 'Lời nói đầu' }, { id: 'authors', text: 'Tác giả' }, { id: 'refs', text: 'Tài liệu tham khảo' });
}

function doSearch(query) { if (window.TextbookSearch) window.TextbookSearch.query(query); }
function closeSR() { if (window.TextbookSearch) window.TextbookSearch.close(); }
function skn(event) { if (window.TextbookSearch) window.TextbookSearch.keyboard(event); }

document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    document.getElementById('si').focus();
  } else if (event.key === 'Escape' && document.getElementById('sb').classList.contains('om')) {
    event.preventDefault();
    setSidebar(false, true);
  }
});
document.addEventListener('click', event => { if (!event.target.closest('.search')) closeSR(); });

// ============================================
// FONT ZOOM
// ============================================
let fontZoomLevel = parseInt(localStorage.getItem('fontZoom') || '0');

function zoomFont(dir) {
  if (dir === 0) { fontZoomLevel = 0; }
  else { fontZoomLevel = Math.max(-3, Math.min(5, fontZoomLevel + dir)); }
  applyFontZoom();
  localStorage.setItem('fontZoom', fontZoomLevel);
}

function applyFontZoom() {
  document.documentElement.style.fontSize = '';
  if (fontZoomLevel !== 0) {
    const current = parseFloat(getComputedStyle(document.documentElement).fontSize);
    document.documentElement.style.fontSize = (current + fontZoomLevel * 1.5) + 'px';
  }
}

if (fontZoomLevel !== 0) applyFontZoom();

// ============================================
// PROGRESS TRACKING
// ============================================
// Nguồn duy nhất: chlyt_progress (ghi bởi js/progress.js). Topbar đếm theo
// visits>0 (phản hồi tức thì khi mở trang); home per-chương dùng cờ read (8s).
function getReadingProgress() {
  try {
    return JSON.parse(localStorage.getItem('chlyt_progress') || '{}');
  } catch { return {}; }
}

function updateProgress() {
  const pages = getReadingProgress();
  const total = PAGE_ORDER.length;
  const read = PAGE_ORDER.filter(p => pages[p] && pages[p].visits > 0).length;
  const pct = total > 0 ? Math.round(read / total * 100) : 0;
  const fill = document.querySelector('.progress-fill');
  if (fill) fill.style.width = pct + '%';
}

// ============================================
// PAGE ORDER (for navigation)
// ============================================
const PAGE_ORDER = [
  'home', 'lnd', 'ch1', 'ch1-1', 'ch1-1-1', 'ch1-1-2', 'ch1-1-3', 'ch1-1-4',
  'ch1-1-5', 'ch1-1-6', 'ch1-1-7', 'ch1-1-8', 'ch1-2', 'ch1-2-1', 'ch1-2-2', 'ch1-2-3',
  'ch1-2-4', 'ch1-2-5', 'ch1-2-6', 'ch1-3', 'ch1-3-1', 'ch1-3-2', 'ch1-3-3', 'ch1-3-4',
  'ch1-3-5', 'ch1-3-6', 'ch1-3-7', 'ch1-4', 'ch1-4-1', 'ch1-4-2', 'ch1-4-3', 'ch1-4-4',
  'ch1-4-5', 'ch1-5', 'ch1-5-1', 'ch1-5-2', 'ch1-5-3', 'ch1-5-4', 'ch1-6', 'ch1-6-1',
  'ch1-6-2', 'ch1-6-3', 'ch1-7', 'ch1-7-1', 'ch1-7-2', 'ch1-rev', 'ch1-quiz', 'ch2',
  'ch2-1', 'ch2-1-1', 'ch2-1-2', 'ch2-1-3', 'ch2-1-4', 'ch2-2', 'ch2-2-1', 'ch2-2-2',
  'ch2-3', 'ch2-3-1', 'ch2-3-2', 'ch2-4', 'ch2-4-1', 'ch2-4-2', 'ch2-4-3', 'ch2-4-4',
  'ch2-5', 'ch2-5-1', 'ch2-5-2', 'ch2-5-3', 'ch2-6', 'ch2-6-1', 'ch2-6-2', 'ch2-7',
  'ch2-7-1', 'ch2-7-2', 'ch2-rev', 'ch2-quiz', 'ch3', 'ch3-1', 'ch3-1-1', 'ch3-1-2',
  'ch3-1-3', 'ch3-2', 'ch3-2-1', 'ch3-2-2', 'ch3-2-3', 'ch3-2-4', 'ch3-2-5', 'ch3-3',
  'ch3-3-1', 'ch3-3-2', 'ch3-4', 'ch3-4-1', 'ch3-4-2', 'ch3-5', 'ch3-5-1', 'ch3-5-2',
  'ch3-5-3', 'ch3-5-4', 'ch3-6', 'ch3-6-1', 'ch3-6-2', 'ch3-6-3', 'ch3-7', 'ch3-7-1',
  'ch3-7-2', 'ch3-rev', 'ch3-quiz', 'authors', 'refs'
];

// ============================================
// INIT
// ============================================
function initDisclosureSemantics() {
  document.querySelectorAll('.nav-btn + .sub-menu').forEach((menu, index) => {
    const control = menu.previousElementSibling;
    if (!menu.id) menu.id = `chapter-menu-${index + 1}`;
    control.setAttribute('aria-controls', menu.id);
    control.setAttribute('aria-label', control.textContent.replace('▶', '').trim());
    control.setAttribute('aria-expanded', String(menu.classList.contains('open')));
    menu.hidden = !menu.classList.contains('open');
  });
  document.querySelectorAll('.l2.has-sub').forEach((control, index) => {
    const menu = control.closest('.l2-group').querySelector('.l3-menu');
    if (!menu.id) menu.id = `section-menu-${index + 1}`;
    control.setAttribute('aria-controls', menu.id);
    control.setAttribute('role', 'button');
    control.setAttribute('aria-label', control.textContent.replace('▶', '').trim());
    control.setAttribute('aria-expanded', String(menu.classList.contains('open')));
    menu.hidden = !menu.classList.contains('open');
    control.addEventListener('keydown', event => {
      if (event.key !== ' ') return;
      event.preventDefault();
      control.click();
    });
  });
  const active = document.querySelector('.nav-btn.active');
  if (active) active.setAttribute('aria-current', 'page');
}

function syncSidebarForViewport() {
  const mobile = window.innerWidth <= 768;
  const sidebar = document.getElementById('sb');
  if (mobile) sidebar.classList.remove('closed');
  setSidebar(mobile ? sidebar.classList.contains('om') : !sidebar.classList.contains('closed'), false);
}

document.addEventListener('DOMContentLoaded', () => {
  initBC();
  initDisclosureSemantics();
  syncSidebarForViewport();
  buildSDB();
  updateProgress();

  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    document.getElementById('main-content').focus();
  });
  window.addEventListener('resize', syncSidebarForViewport);

  // Handle hash navigation
  if (window.TextbookSearch) window.TextbookSearch.init({ navItems: SDB });
  const hash = window.location.hash.replace('#', '');
  if (hash && hash !== 'home') loadPage(hash);
});
