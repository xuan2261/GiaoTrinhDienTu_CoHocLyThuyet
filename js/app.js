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
  'ch1-7-3': 'Chương 1 › VII › 3. Câu hỏi ôn tập',
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
  'ch2-6-3': 'Chương 2 › VI › 3. Gia tốc Coriolis',
  'ch2-7': 'Chương 2 › VII. BÀI TẬP',
  'ch2-7-1': 'Chương 2 › VII › 1. Hướng dẫn giải bài tập',
  'ch2-7-2': 'Chương 2 › VII › 2. Bài tập',
  'ch2-7-3': 'Chương 2 › VII › 3. Câu hỏi ôn tập',
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
  'ch3-3-3': 'Chương 3 › III › 3. Dao động tắt dần',
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
  'ch3-6-4': 'Chương 3 › VI › 4. Công suất tức thời',
  'ch3-7': 'Chương 3 › VII. BÀI TẬP',
  'ch3-7-1': 'Chương 3 › VII › 1. Hướng dẫn giải bài tập',
  'ch3-7-2': 'Chương 3 › VII › 2. Bài tập',
  'ch3-7-3': 'Chương 3 › VII › 3. Câu hỏi ôn tập',
  'ch3-7-4': 'Chương 3 › VII › 4. Hệ số phục hồi',
  'ch3-7-5': 'Chương 3 › VII › 5. Ảnh hưởng hệ số e',
  'ch3-7-6': 'Chương 3 › VII › 6. Bộ kiểm tra tổng hợp',
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
  document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
}

function togSub(b) {
  b.classList.toggle('open');
  b.nextElementSibling.classList.toggle('open');
}

function togL3(a) {
  a.classList.toggle('open');
  a.closest('.l2-group').querySelector('.l3-menu').classList.toggle('open');
}

function tSB() {
  const s = document.getElementById('sb');
  const o = document.getElementById('ov');
  if (window.innerWidth <= 768) {
    s.classList.toggle('om');
    o.classList.toggle('show');
  } else {
    s.classList.toggle('closed');
  }
}

function updateActiveNav(id) {
  document.querySelectorAll('.sub-menu .l2, .sub-menu .l3').forEach(a => {
    const m = a.getAttribute('onclick') || '';
    const r = m.match(/(?:loadPage|showPage)\('([^']+)'\)/);
    a.classList.toggle('active', r && r[1] === id);
  });
}

// ============================================
// THEME
// ============================================
function togTheme() {
  const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeBtn').textContent = t === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('theme', t);
}

(function initTheme() {
  const t = localStorage.getItem('theme');
  if (t) {
    document.documentElement.setAttribute('data-theme', t);
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = t === 'dark' ? '🌙' : '☀️';
  }
})();

// ============================================
// SEARCH
// ============================================
const SDB = [];

function buildSDB() {
  document.querySelectorAll('.sub-menu .l2, .sub-menu .l3').forEach(a => {
    const m = a.getAttribute('onclick') || '';
    const r = m.match(/(?:loadPage|showPage)\('([^']+)'\)/);
    if (r) SDB.push({ id: r[1], text: a.textContent.replace('▶', '').trim() });
  });
  SDB.push(
    { id: 'home', text: 'Trang chủ' },
    { id: 'lnd', text: 'Lời nói đầu' },
    { id: 'authors', text: 'Tác giả' },
    { id: 'refs', text: 'Tài liệu tham khảo' }
  );
}

let srIdx = -1;

function doSearch(q) {
  const sr = document.getElementById('sr');
  if (!q || q.length < 1) {
    sr.innerHTML = '';
    sr.classList.remove('show');
    srIdx = -1;
    return;
  }
  const lq = q.toLowerCase();
  const hits = SDB.filter(s => s.text.toLowerCase().includes(lq)).slice(0, 12);
  if (!hits.length) {
    sr.innerHTML = '<div class="cat" style="padding:.5rem .8rem;color:var(--tx2)">Không tìm thấy</div>';
    sr.classList.add('show');
    return;
  }
  sr.innerHTML = hits.map((h, i) =>
    `<a data-i="${i}" onclick="loadPage('${h.id}');closeSR()">${h.text}</a>`
  ).join('');
  sr.classList.add('show');
  srIdx = -1;
}

function closeSR() {
  document.getElementById('sr').classList.remove('show');
  document.getElementById('si').value = '';
  srIdx = -1;
}

function skn(e) {
  const sr = document.getElementById('sr');
  const items = sr.querySelectorAll('a');
  if (!items.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    srIdx = Math.min(srIdx + 1, items.length - 1);
    items.forEach((a, i) => a.classList.toggle('hl', i === srIdx));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    srIdx = Math.max(srIdx - 1, 0);
    items.forEach((a, i) => a.classList.toggle('hl', i === srIdx));
  } else if (e.key === 'Enter' && srIdx >= 0) {
    e.preventDefault();
    items[srIdx].click();
  } else if (e.key === 'Escape') {
    closeSR();
  }
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('si').focus();
  }
});

document.addEventListener('click', e => {
  if (!e.target.closest('.search')) closeSR();
});

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
function getReadPages() {
  try {
    return JSON.parse(localStorage.getItem('readPages') || '{}');
  } catch { return {}; }
}

function markPageRead(id) {
  const pages = getReadPages();
  pages[id] = Date.now();
  localStorage.setItem('readPages', JSON.stringify(pages));
  updateProgress();
}

function updateProgress() {
  const pages = getReadPages();
  const total = PAGE_ORDER.length;
  const read = PAGE_ORDER.filter(p => pages[p]).length;
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
  'ch1-6-2', 'ch1-6-3', 'ch1-7', 'ch1-7-1', 'ch1-7-2', 'ch1-7-3', 'ch1-rev', 'ch1-quiz',
  'ch2', 'ch2-1', 'ch2-1-1', 'ch2-1-2', 'ch2-1-3', 'ch2-1-4', 'ch2-2', 'ch2-2-1',
  'ch2-2-2', 'ch2-3', 'ch2-3-1', 'ch2-3-2', 'ch2-4', 'ch2-4-1', 'ch2-4-2', 'ch2-4-3',
  'ch2-4-4', 'ch2-5', 'ch2-5-1', 'ch2-5-2', 'ch2-5-3', 'ch2-6', 'ch2-6-1', 'ch2-6-2', 'ch2-6-3',
  'ch2-7', 'ch2-7-1', 'ch2-7-2', 'ch2-7-3', 'ch2-rev', 'ch2-quiz', 'ch3', 'ch3-1',
  'ch3-1-1', 'ch3-1-2', 'ch3-1-3', 'ch3-2', 'ch3-2-1', 'ch3-2-2', 'ch3-2-3', 'ch3-2-4',
  'ch3-2-5', 'ch3-3', 'ch3-3-1', 'ch3-3-2', 'ch3-3-3', 'ch3-4', 'ch3-4-1', 'ch3-4-2', 'ch3-5',
  'ch3-5-1', 'ch3-5-2', 'ch3-5-3', 'ch3-5-4', 'ch3-6', 'ch3-6-1', 'ch3-6-2', 'ch3-6-3', 'ch3-6-4',
  'ch3-7', 'ch3-7-1', 'ch3-7-2', 'ch3-7-3', 'ch3-7-4', 'ch3-7-5', 'ch3-7-6', 'ch3-rev', 'ch3-quiz', 'authors', 'refs'
];

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initBC();
  buildSDB();
  updateProgress();

  // Handle hash navigation
  const hash = window.location.hash.replace('#', '');
  if (hash && hash !== 'home') {
    loadPage(hash);
  }
});
