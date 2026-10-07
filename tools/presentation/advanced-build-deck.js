'use strict';

// One scene graph drives editable PowerPoint, offline HTML and the printed handout.
// Run: node tools/presentation/advanced-build-deck.js [output-directory]
const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { meta, slides } = require('./advanced-deck-content');
const { C, F, SW, SH, W, H, buildScene, renderPptxScene } = require('./advanced-deck-theme');

const ROOT = path.resolve(__dirname, '../..');
const DEFAULT_OUTPUT = 'assets/designs/bao-cao-hoi-dong-nang-cao-33-slides';
const PPTX_NAME = 'bao-cao-hoi-dong-nang-cao.pptx';
const imageCache = new Map();
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
const flatTitle = value => value.replace(/\s+/g, ' ').trim();
const markdownText = value => String(value).replace(/([\\`*_{}\[\]<>])/g, '\\$1');
const color = value => `#${value.replace(/^#/, '')}`;
const px = value => `${Number(value.toFixed(4))}px`;

function validateContent() {
  if (!meta || typeof meta.title !== 'string' || typeof meta.institution !== 'string'
      || typeof meta.repository !== 'string' || !Array.isArray(meta.authors)
      || !Array.isArray(meta.editorialNotes)) {
    throw new Error('The advanced content module must provide title, institution, repository, authors and editorialNotes.');
  }
  if (!Array.isArray(slides) || slides.length !== 34) {
    throw new Error('The advanced report must contain exactly 34 slides, including the opening QR page.');
  }
  slides.forEach((slide, index) => {
    if (slide.id !== index + 1 || typeof slide.title !== 'string'
        || typeof slide.section !== 'string' || typeof slide.takeaway !== 'string'
        || !Array.isArray(slide.notes) || !slide.notes.length
        || !Array.isArray(slide.sources) || !slide.sources.length
        || [...slide.notes, ...slide.sources].some(value => typeof value !== 'string' || !value.trim())) {
      throw new Error(`Slide ${index + 1} requires a sequential id, title, section, takeaway, notes and full source paths.`);
    }
  });
}

function sourcesFor(data, scene) {
  return [...new Set([...data.sources, ...scene.objects
    .filter(object => object.kind === 'image').map(object => object.repoPath)])];
}

function notesFor(data, scene) {
  return [
    `TRANG ${data.id}/${slides.length} — ${flatTitle(data.title)}`,
    `Phần: ${data.section}`,
    ...(data.subtitle ? [data.subtitle] : []),
    '', ...data.notes, '',
    `Thông điệp chính: ${data.takeaway}`, '',
    'NGUỒN ĐẦY ĐỦ (đường dẫn tương đối từ gốc kho mã hoặc địa chỉ mạng nguyên vẹn):',
    ...sourcesFor(data, scene).map(source => `- ${source}`),
    `Kho mã: ${meta.repository}`,
    ...(data.id === 1 ? ['', 'LƯU Ý BIÊN TẬP:', ...meta.editorialNotes.map(note => `- ${note}`)] : []),
  ].join('\n');
}

function embeddedImage(file) {
  if (!imageCache.has(file)) {
    const extension = path.extname(file).toLowerCase();
    const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' }[extension];
    if (!mime) throw new Error(`Unsupported scene image format: ${file}`);
    imageCache.set(file, `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`);
  }
  return imageCache.get(file);
}

function objectBox(object) {
  return `left:${px(object.x)};top:${px(object.y)};width:${px(object.w)};height:${px(object.h)};`;
}

function renderTable(object) {
  const row = (cells, index) => {
    const isHeader = index === 0;
    const height = isHeader ? object.headerH : object.rowHeights[index - 1];
    const fill = isHeader ? C.secondary : ((index - 1) % 2 ? C.paper : C.white);
    const textColor = isHeader ? C.white : C.ink;
    const tag = isHeader ? 'th' : 'td';
    return `<tr style="height:${px(height)}">${cells.map(text => `<${tag}${isHeader ? ' scope="col"' : ''} style="background:${color(fill)};color:${color(textColor)};font-weight:${isHeader ? 700 : 400}"><span>${escapeHtml(text)}</span></${tag}>`).join('')}</tr>`;
  };
  return `<table class="scene-object scene-table" style="${objectBox(object)}font-size:${px(object.fontSize * 4 / 3)}"><colgroup>${object.widths.map(width => `<col style="width:${px(width)}">`).join('')}</colgroup><thead>${row(object.headers, 0)}</thead><tbody>${object.rows.map((cells, index) => row(cells, index + 1)).join('')}</tbody></table>`;
}

function renderObject(object, sceneId, index) {
  if (object.kind === 'text') {
    const align = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[object.valign] || 'flex-start';
    return `<div class="scene-object scene-text" style="${objectBox(object)}font-size:${px(object.fontSize * 4 / 3)};font-weight:${object.bold ? 700 : 400};color:${color(object.color)};text-align:${object.align};line-height:${object.lineHeight};justify-content:${align}"><span>${escapeHtml(object.text)}</span></div>`;
  }
  if (object.kind === 'shape') {
    if (!['rect', 'roundRect', 'ellipse'].includes(object.shape)) throw new Error(`Unsupported scene shape: ${object.shape}`);
    const radius = object.shape === 'ellipse' ? '50%' : px(object.radius || 0);
    return `<div aria-hidden="true" class="scene-object scene-shape" style="${objectBox(object)}background:${object.fill ? color(object.fill) : 'transparent'};border:${object.stroke ? `0.8px solid ${color(object.stroke)}` : 'none'};border-radius:${radius}"></div>`;
  }
  if (object.kind === 'line') {
    const markerId = `arrow-${sceneId}-${index}`;
    const arrow = object.arrow ? `<defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M 0 0 L 8 4 L 0 8 Z" fill="${color(object.color)}"/></marker></defs>` : '';
    return `<svg aria-hidden="true" class="scene-object scene-line" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${arrow}<line x1="${object.x1}" y1="${object.y1}" x2="${object.x2}" y2="${object.y2}" stroke="${color(object.color)}" stroke-width="${object.width}"${object.arrow ? ` marker-end="url(#${markerId})"` : ''}/></svg>`;
  }
  if (object.kind === 'image') {
    return `<img class="scene-object scene-image" style="${objectBox(object)}" src="${embeddedImage(object.file)}" alt="${escapeHtml(object.alt)}" draggable="false">`;
  }
  if (object.kind === 'table') return renderTable(object);
  throw new Error(`Unsupported scene object: ${object.kind}`);
}

function renderScene(scene) {
  return `<section class="stage" id="slide-${scene.id}" aria-label="Trang ${scene.id}: ${escapeHtml(flatTitle(scene.title))}" style="background:${color(scene.background)}">${scene.objects.map((object, index) => renderObject(object, scene.id, index)).join('')}</section>`;
}

const sceneStyles = `
*{box-sizing:border-box}
.stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;transform-origin:top left;font-family:${F.body},sans-serif;flex:none;print-color-adjust:exact;-webkit-print-color-adjust:exact}
.scene-object{position:absolute}
.scene-text{display:flex;flex-direction:column;overflow:hidden;margin:0;padding:0}
.scene-text>span{display:block;white-space:pre;margin:0;padding:0}
.scene-line{left:0;top:0;overflow:visible;pointer-events:none}
.scene-image{display:block;object-fit:contain}
.scene-table{table-layout:fixed;border-collapse:collapse;border-spacing:0;line-height:1.14}
.scene-table th,.scene-table td{position:relative;padding:8px 12px;border:0.8667px solid ${color(C.line)};text-align:left;vertical-align:middle;overflow:hidden}
.scene-table th{padding-top:10px;padding-bottom:10px}
.scene-table span{position:absolute;left:12px;right:12px;top:50%;transform:translateY(-50%);display:block;white-space:pre}
`;

function renderNotes(data, scene) {
  return `<article class="slide-notes" data-slide="${data.id}"${data.id === 1 ? '' : ' hidden'}><h2>Trang ${data.id} — ${escapeHtml(flatTitle(data.title))}</h2>${data.notes.map(note => `<p>${escapeHtml(note)}</p>`).join('')}<p><strong>Thông điệp chính:</strong> ${escapeHtml(data.takeaway)}</p><h3>Nguồn đầy đủ</h3><ul>${sourcesFor(data, scene).map(source => `<li>${escapeHtml(source)}</li>`).join('')}</ul></article>`;
}

function presentationHtml(sceneHtml, scenes) {
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(meta.title)} — Báo cáo hội đồng ${slides.length} trang</title><style>
${sceneStyles}
html,body{margin:0;height:100%;background:#081c34;color:#fff;font-family:${F.body},sans-serif}
body{display:flex;flex-direction:column}
[hidden]{display:none!important}
.controls{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;flex:none;min-height:64px;padding:10px 16px;background:${color(C.secondary)}}
button{font:inherit;font-size:14px;color:#fff;background:${color(C.navy)};border:1px solid #7190b0;border-radius:6px;padding:8px 14px;cursor:pointer}
button:hover:not(:disabled){background:#244d78}button:disabled{opacity:.4;cursor:default}button:focus-visible,a:focus-visible{outline:3px solid ${color(C.orange)};outline-offset:3px}
#slide-status{min-width:76px;text-align:center;font-variant-numeric:tabular-nums}
.key-help{font-size:12px;color:#c4d4e5}
.workspace{display:flex;flex:1;min-height:0;flex-direction:column;padding:12px;gap:12px}
.slide-viewport{display:flex;flex:1;min-height:0;align-items:center;justify-content:center;overflow:hidden}
.slide-shell{flex:none;position:relative;box-shadow:0 12px 42px #0006;overflow:hidden}
.stage{position:absolute;left:0;top:0}.stage:not(.active){display:none}
.notes-panel{flex:none;max-height:28vh;overflow:auto;background:#fff;color:${color(C.ink)};border-radius:8px;padding:16px 22px}
.notes-panel h2{font-size:18px;margin:0 0 12px}.notes-panel h3{font-size:15px}.notes-panel p,.notes-panel li{font-size:14px;line-height:1.5;overflow-wrap:anywhere}
.no-script{margin:0;padding:12px;background:#fff;color:${color(C.ink)}}
@page{size:13.333333in 7.5in;margin:0}
@media print{
html,body{height:auto;display:block;background:#fff;margin:0!important;padding:0!important}
.controls,.notes-panel,.no-script{display:none!important}
.workspace,.slide-viewport,.slide-shell{display:block;position:static;overflow:visible;width:auto!important;height:auto!important;min-height:0;margin:0;padding:0;box-shadow:none}
.stage,.stage:not(.active){display:block!important;position:relative;width:13.333333in!important;height:7.5in!important;transform:none!important;break-inside:avoid;break-after:page;page-break-after:always}
.stage:last-child{break-after:auto;page-break-after:auto}
}
</style></head><body>
<header class="controls" aria-label="Điều khiển trình chiếu"><button id="previous" type="button" aria-label="Trang trước">Trước</button><span id="slide-status" role="status" aria-live="polite">1 / ${slides.length}</span><button id="next" type="button" aria-label="Trang sau">Tiếp</button><button id="notes-toggle" type="button" aria-expanded="false" aria-controls="notes-panel">Ghi chú thuyết trình</button><span class="key-help">← / →: chuyển trang · Home / End: đầu / cuối · N: ghi chú · Ctrl+P: in ${slides.length} trang</span></header>
<noscript><p class="no-script">Bật JavaScript để trình chiếu và chuyển trang. Bản in vẫn chứa đầy đủ ${slides.length} trang.</p></noscript>
<main class="workspace"><div class="slide-viewport"><div class="slide-shell">${sceneHtml.map((html, index) => index === 0 ? html.replace('class="stage"', 'class="stage active"') : html).join('\n')}</div></div><aside id="notes-panel" class="notes-panel" aria-label="Ghi chú thuyết trình và nguồn" hidden>${slides.map((data, index) => renderNotes(data, scenes[index])).join('\n')}</aside></main>
<script>
(function () {
  'use strict';
  var stages = Array.from(document.querySelectorAll('.stage'));
  var notePages = Array.from(document.querySelectorAll('.slide-notes'));
  var viewport = document.querySelector('.slide-viewport');
  var shell = document.querySelector('.slide-shell');
  var panel = document.getElementById('notes-panel');
  var previous = document.getElementById('previous');
  var next = document.getElementById('next');
  var toggle = document.getElementById('notes-toggle');
  var status = document.getElementById('slide-status');
  var current = 0;
  function resize() {
    var scale = Math.min(viewport.clientWidth / ${W}, viewport.clientHeight / ${H});
    if (scale <= 0) return;
    shell.style.width = (${W} * scale) + 'px';
    shell.style.height = (${H} * scale) + 'px';
    stages.forEach(function (stage) { stage.style.transform = 'scale(' + scale + ')'; });
  }
  function hashIndex() {
    var match = /^#slide-([0-9]+)$/.exec(location.hash);
    return match ? Math.min(stages.length - 1, Math.max(0, Number(match[1]) - 1)) : 0;
  }
  function show(index) {
    current = Math.min(stages.length - 1, Math.max(0, index));
    stages.forEach(function (stage, i) { stage.classList.toggle('active', i === current); stage.setAttribute('aria-hidden', String(i !== current)); });
    notePages.forEach(function (page, i) { page.hidden = i !== current; });
    status.textContent = (current + 1) + ' / ' + stages.length;
    previous.disabled = current === 0;
    next.disabled = current === stages.length - 1;
    panel.scrollTop = 0;
    resize();
  }
  function navigate(index) {
    var target = Math.min(stages.length - 1, Math.max(0, index));
    var hash = '#slide-' + (target + 1);
    if (location.hash !== hash) location.hash = hash;
    show(target);
  }
  function toggleNotes() {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
    resize();
  }
  previous.addEventListener('click', function () { navigate(current - 1); });
  next.addEventListener('click', function () { navigate(current + 1); });
  toggle.addEventListener('click', toggleNotes);
  window.addEventListener('hashchange', function () { show(hashIndex()); });
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(viewport);
  document.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') navigate(current + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') navigate(current - 1);
    else if (event.key === 'Home') navigate(0);
    else if (event.key === 'End') navigate(stages.length - 1);
    else if (event.key.toLowerCase() === 'n') toggleNotes();
    else return;
    event.preventDefault();
  });
  show(hashIndex());
  if (!/^#slide-[0-9]+$/.test(location.hash)) location.hash = '#slide-1';
  window.addEventListener('afterprint', resize);
}());
</script></body></html>\n`;
}

function handoutHtml(sceneHtml) {
  // 140 mm-wide scenes leave room for three 16:9 slides and captions on A4.
  const scale = (140 / 25.4 * 96) / W;
  const sheets = [];
  for (let start = 0; start < sceneHtml.length; start += 3) {
    const items = sceneHtml.slice(start, start + 3).map((html, offset) => {
      const data = slides[start + offset];
      return `<figure class="handout-slide"><div class="handout-frame">${html}</div><figcaption>${data.id} / ${slides.length} — ${escapeHtml(flatTitle(data.title))}</figcaption></figure>`;
    }).join('\n');
    sheets.push(`<section class="handout-sheet" aria-label="Trang in ${sheets.length + 1}"><header>${escapeHtml(meta.institution)} · ${escapeHtml(meta.title)}</header>${items}<footer>Hội đồng · ${escapeHtml(meta.date)} · ${sheets.length + 1} / ${Math.ceil(slides.length / 3)}</footer></section>`);
  }
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bản in hội đồng — ${escapeHtml(meta.title)}</title><style>
${sceneStyles}
html,body{margin:0;padding:0;font-family:${F.body},sans-serif;background:#dce4ed;color:${color(C.ink)}}
.handout-help{margin:16px auto;max-width:190mm;padding:12px;background:#fff;font-size:14px;line-height:1.5}
.handout-sheet{width:210mm;height:297mm;padding:10mm;margin:8mm auto;background:#fff;overflow:hidden;box-shadow:0 4px 20px #0002;break-inside:avoid;break-after:page;page-break-after:always}
.handout-sheet:last-child{break-after:auto;page-break-after:auto}
.handout-sheet>header{height:8mm;font-size:9pt;font-weight:bold;border-bottom:1px solid ${color(C.line)};padding-bottom:2mm}
.handout-slide{margin:2mm 0 0;height:85mm;break-inside:avoid}
.handout-frame{width:140mm;height:78.75mm;margin:0 auto;position:relative;overflow:hidden;border:0;outline:1px solid ${color(C.line)}}
.handout-frame .stage{transform:scale(${scale})}
figcaption{margin:1.5mm 0 0;font-size:8pt;line-height:1.3}
.handout-sheet>footer{height:5mm;margin-top:3mm;border-top:1px solid ${color(C.line)};padding-top:1.5mm;font-size:7pt;text-align:right}
@page{size:A4 portrait;margin:0}
@media print{html,body{background:#fff}.handout-help{display:none}.handout-sheet{margin:0;box-shadow:none}}
</style></head><body><p class="handout-help">Bản in gồm đủ ${slides.length} trang trình chiếu, 3 trang trên một tờ A4 dọc (${sheets.length} tờ). Chọn in A4, tỷ lệ 100%, tắt đầu trang và chân trang của trình duyệt và bật đồ họa nền. Ghi chú thuyết trình, nguồn và câu hỏi dự kiến nằm trong huong-dan-thuyet-trinh.md.</p>${sheets.join('\n')}</body></html>\n`;
}

function speakingGuide(scenes) {
  const questions = [
    [12, 'Vì sao chọn ngoại tuyến và cần chứng minh điều gì trên máy đích?'],
    [13, 'Có 25 hay 35 bài mô phỏng? Các bản mô phỏng ba chiều có vai trò gì?'],
    [10, 'Giáo trình có thay thế hệ thống quản lý học tập và sổ điểm chính thức không?'],
    [18, 'Tám nhóm kiểm tra chất lượng có nghĩa tám điều kiện kiểm tra đã đạt hay không?'],
    [19, 'Sổ theo dõi minh chứng và số bản ký có đủ chứng minh đã nghiệm thu học thuật không?'],
    [20, 'Mã kiểm tra toàn vẹn của gói, tính bằng thuật toán băm an toàn 256 bit, chứng minh điều gì và không chứng minh điều gì?'],
    [17, 'Có thể tuyên bố đáp ứng hoặc được chứng nhận theo hướng dẫn về khả năng tiếp cận nội dung web phiên bản 2.2, mức đáp ứng trung gian, chưa?'],
    [22, 'Moodle và Google Classroom có khả năng ngoại tuyến không?'],
    [26, 'Đã chứng minh tác động học tập hoặc tiết kiệm chi phí chưa?'],
    [30, 'Hội đồng được đề nghị quyết định gì trong lần báo cáo này?'],
  ];
  const lines = [
    `# Hướng dẫn thuyết trình — ${markdownText(meta.title)}`, '',
    `**Đơn vị:** ${markdownText(meta.institution)}  `,
    `**Ngày báo cáo:** ${markdownText(meta.date)}  `,
    `**Tác giả:** ${meta.authors.map(markdownText).join('; ')}  `,
    `**Kho mã:** ${meta.repository}`, '',
    '## Cách dùng bộ báo cáo', '',
    '- Mở bao-cao-hoi-dong-nang-cao.pptx để chỉnh sửa các đối tượng và đọc ghi chú thuyết trình.',
    '- Mở presentation-slides.html bằng trình duyệt, kể cả qua file://. Ảnh đã nhúng trong tệp, không cần truy cập mạng.',
    '- Dùng phím mũi tên, Home/End (về trang đầu/cuối) hoặc nút Trước/Tiếp. Phím N hoặc nút Ghi chú thuyết trình mở phần thuyết minh; địa chỉ #slide-N mở trực tiếp trang N.',
    `- In presentation-slides.html để lấy đủ ${slides.length} trang 16:9. In handout-in-an-hoi-dong.html theo A4 dọc, 100%, không thêm đầu trang và chân trang của trình duyệt để lấy ${Math.ceil(slides.length / 3)} tờ, tối đa 3 trang trình chiếu mỗi tờ.`,
    '- Không sửa riêng số liệu trên trang trình chiếu. Cập nhật nguồn có thẩm quyền và dựng lại từ advanced-deck-content.js cùng advanced-deck-theme.js.', '',
    '## Lưu ý biên tập', '',
    ...meta.editorialNotes.map(note => `- ${markdownText(note)}`), '',
    '## Danh sách kiểm tra trước báo cáo', '',
    '- [ ] Chốt phiên bản kho mã và gói đề nghị xét duyệt được trích; phân biệt hồ sơ lịch sử với nguồn hiện tại.',
    '- [ ] Đối chiếu kết quả kiểm tra chất lượng với đúng bản chụp trạng thái; giữ nguyên trạng thái chưa đạt, chưa thể đánh giá và đang chờ kiểm tra lại nếu chưa có bằng chứng mới.',
    '- [ ] Đối chiếu mã kiểm tra toàn vẹn của tệp nén với hồ sơ; không dùng mã này như chứng nhận học thuật hay hiệu quả học tập.',
    '- [ ] Kiểm tên đơn vị, tác giả, ngày và quyền sử dụng hình; không dùng biểu trưng tự dựng.',
    `- [ ] Mở bao-cao-hoi-dong-nang-cao.pptx trên máy trình chiếu, kiểm phông chữ Arial, dấu tiếng Việt, bảng, hình và ghi chú thuyết trình của đủ ${slides.length} trang.`,
    `- [ ] Mở bản trình chiếu trên trình duyệt khi không có mạng; thử Trước/Tiếp, mũi tên, Home/End, ghi chú thuyết trình và liên kết #slide-${slides.length}.`,
    `- [ ] Xem trước bản in đủ ${slides.length} trang 16:9 và bản phát tay đủ ${Math.ceil(slides.length / 3)} tờ A4; bật đồ họa nền, tắt đầu trang và chân trang của trình duyệt.`,
    '- [ ] Chuẩn bị các nguồn và bằng chứng để tra cứu; ảnh lịch sử không được dùng xác nhận mã mới.',
    '- [ ] Quét mã truy cập ở trang 1; tập phần báo cáo chính theo phân bổ ở trang 4; dành 5–10 phút hỏi–đáp và chỉ mở trang 33–34 khi cần.',
    '- [ ] Ghi nhận câu hỏi thiếu dữ liệu để kiểm chứng sau; không trả lời bằng tỷ lệ, điểm số hoặc hiệu quả chưa đo.', '',
    `## Thuyết minh và nguồn của toàn bộ ${slides.length} trang`, '',
  ];
  slides.forEach((data, index) => {
    lines.push(`### Trang ${data.id} — ${markdownText(flatTitle(data.title))}`, '',
      `**Phần:** ${markdownText(data.section)}`, '',
      ...(data.subtitle ? [`**Dẫn nhập:** ${markdownText(data.subtitle)}`, ''] : []),
      ...data.notes.flatMap(note => [markdownText(note), '']),
      `**Thông điệp chính:** ${markdownText(data.takeaway)}`, '',
      '**Nguồn đầy đủ:**', '',
      ...sourcesFor(data, scenes[index]).map(source => `- ${markdownText(source)}`), '');
  });
  lines.push('## 10 câu hỏi dự kiến và trả lời có căn cứ', '',
    'Các trả lời dưới đây lấy nguyên nội dung ghi chú từ phần dữ liệu báo cáo, không tạo một bộ số liệu song song.', '');
  questions.forEach(([id, question], index) => {
    const data = slides[id - 1];
    lines.push(`### ${index + 1}. ${question}`, '',
      ...data.notes.flatMap(note => [markdownText(note), '']),
      `**Đối chiếu:** Trang ${id} — ${markdownText(flatTitle(data.title))}.`, '',
      ...sourcesFor(data, scenes[id - 1]).map(source => `- ${markdownText(source)}`), '');
  });
  return `${lines.join('\n')}\n`;
}

async function main() {
  if (process.argv.length > 3) throw new Error('Usage: node tools/presentation/advanced-build-deck.js [output-directory]');
  validateContent();
  const out = path.resolve(ROOT, process.argv[2] || DEFAULT_OUTPUT);
  const scenes = slides.map(data => buildScene(data, meta, slides.length, ROOT));
  const sceneHtml = scenes.map(renderScene);
  const presentation = presentationHtml(sceneHtml, scenes);
  const handout = handoutHtml(sceneHtml);
  const guide = speakingGuide(scenes);
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'ADVANCED_REPORT', width: SW, height: SH });
  pptx.layout = 'ADVANCED_REPORT';
  pptx.author = meta.authors.join('; ');
  pptx.company = meta.institution;
  pptx.title = meta.title;
  pptx.subject = meta.subtitle;
  pptx.lang = 'vi-VN';
  pptx.theme = { headFontFace: F.heading, bodyFontFace: F.body, lang: 'vi-VN' };
  scenes.forEach((scene, index) => {
    const slide = pptx.addSlide();
    renderPptxScene(slide, pptx, scene);
    slide.addNotes(notesFor(slides[index], scene));
  });
  fs.mkdirSync(out, { recursive: true });
  await pptx.writeFile({ fileName: path.join(out, PPTX_NAME) });
  fs.writeFileSync(path.join(out, 'presentation-slides.html'), presentation, 'utf8');
  fs.writeFileSync(path.join(out, 'handout-in-an-hoi-dong.html'), handout, 'utf8');
  fs.writeFileSync(path.join(out, 'huong-dan-thuyet-trinh.md'), guide, 'utf8');
  console.log(`Created ${slides.length} editable slides, portable HTML, ${Math.ceil(slides.length / 3)}-sheet A4 handout and speaking guide in ${out}`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(`Advanced deck build failed: ${error.stack || error.message || String(error)}`);
    process.exitCode = 1;
  });
}
