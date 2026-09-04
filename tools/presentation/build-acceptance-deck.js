'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const PptxGenJS = require('pptxgenjs');
const { meta, slides } = require('./acceptance-deck-content');
const { C, F, addText, addPanel, addMetric, addImageCard, addNotes, addCommon } = require('./acceptance-deck-theme');
const buildSpecialSlides = require('./acceptance-deck-special-slides');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Nhóm tác giả Khoa Kỹ thuật cơ sở, Học viện Hải quân';
pptx.company = 'Học viện Hải quân';
pptx.subject = meta.subject;
pptx.title = meta.title;
pptx.lang = 'vi-VN';
pptx.theme = { headFontFace: F.heading, bodyFontFace: F.body, lang: 'vi-VN' };
pptx.defineSlideMaster({ title: 'BLANK', background: { color: C.paper }, objects: [] });

const out = process.argv[2] || 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pptx';
fs.mkdirSync(path.dirname(out), { recursive: true });
const abs = p => path.resolve(p);
const special = buildSpecialSlides(pptx, abs);
const line = (slide, x, y, w, color = C.line, pt = 1) => slide.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color, pt } });

function bullets(slide, items, x, y, w, size = 16.5, color = C.ink, gap = 0.62) {
  items.forEach((item, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x, y: y + i * gap + 0.12, w: 0.1, h: 0.1, fill: { color: C.gold }, line: { color: C.gold, pt: 0 } });
    addText(slide, item, { x: x + 0.24, y: y + i * gap, w: w - 0.24, h: 0.46, fontSize: size, color, valign: 'mid' });
  });
}


function chapters(slide, d) {
  addCommon(slide, pptx, d);
  d.chapters.forEach((c, i) => {
    const y = 2.22 + i * 1.18, color = [C.blue, C.green, C.purple][i];
    addPanel(slide, pptx, { x: 0.72, y, w: 6.55, h: 0.95, fill: C.white, line: C.line });
    addText(slide, c[0], { x: 0.92, y: y + 0.15, w: 0.72, h: 0.45, fontSize: 28, bold: true, color, align: 'center' });
    addText(slide, c[1], { x: 1.82, y: y + 0.1, w: 1.9, h: 0.35, fontFace: F.heading, fontSize: 20, bold: true, color: C.navy950 });
    addText(slide, c[2], { x: 3.82, y: y + 0.13, w: 3.05, h: 0.36, fontSize: 16.5, color: C.slate, valign: 'mid' });
  });
  addText(slide, `+ ${d.supportingRoutes} route bổ trợ: lời nói đầu · tác giả · tài liệu tham khảo`, { x: 1.02, y: 5.92, w: 5.85, h: 0.34, fontSize: 15.5, bold: true, color: C.navy800, align: 'center' });
  addImageCard(slide, pptx, abs(d.image), 7.62, 2.2, 5.0, 4.12, 'Hệ lực không gian · hình canonical Chương 1');
}

function authors(slide, d) {
  addCommon(slide, pptx, d);
  d.authors.forEach((a, i) => {
    const y = 2.18 + i * 0.91;
    addPanel(slide, pptx, { x: 0.72, y, w: 12, h: 0.74, fill: i === 0 ? 'EEF2F7' : C.white, line: C.line });
    addText(slide, String(i + 1).padStart(2, '0'), { x: 0.94, y: y + 0.19, w: 0.5, h: 0.3, fontSize: 18, bold: true, color: C.gold, align: 'center' });
    addText(slide, a, { x: 1.68, y: y + 0.16, w: 5.6, h: 0.34, fontSize: 17.5, bold: true, color: C.navy950 });
    addText(slide, d.responsibilities[i], { x: 7.45, y: y + 0.16, w: 4.85, h: 0.34, fontSize: 16, color: C.ink, align: 'right' });
  });
  d.scopeMetrics.forEach((m, i) => addMetric(slide, pptx, m[0], m[1], 0.72 + i * 2.05, 5.18, 1.82, C.navy800));
  addPanel(slide, pptx, { x: 7.12, y: 5.18, w: 5.6, h: 1.16, fill: C.navy950, line: C.navy950 });
  addText(slide, 'NGUỒN CHUẨN', { x: 7.42, y: 5.38, w: 1.55, h: 0.25, fontSize: 12, bold: true, color: C.goldLight });
  addText(slide, 'CoHocLyThuyet_Full_New.docx', { x: 8.95, y: 5.34, w: 3.38, h: 0.3, fontSize: 17, bold: true, color: C.white, align: 'right' });
  addText(slide, '→ HTML · PDF · package', { x: 7.42, y: 5.82, w: 4.9, h: 0.26, fontSize: 15.5, color: C.white, align: 'right' });
}

function journey(slide, d) {
  addCommon(slide, pptx, d);
  d.steps.forEach((s, i) => {
    const y = 2.2 + i * 0.79;
    addText(slide, s[0], { x: 0.78, y: y + 0.1, w: 0.48, h: 0.3, fontSize: 17, bold: true, color: C.gold, align: 'center' });
    addText(slide, s[1], { x: 1.42, y: y + 0.03, w: 1.12, h: 0.34, fontSize: 18, bold: true, color: C.navy950 });
    addText(slide, s[2], { x: 2.55, y: y + 0.04, w: 2.55, h: 0.36, fontSize: 15.5, color: C.slate });
    if (i < d.steps.length - 1) line(slide, 1.0, y + 0.48, 0.04, C.gold, 1.5);
  });
  addImageCard(slide, pptx, abs(d.image), 5.25, 2.18, 7.38, 4.4, 'IMG-01 · trang chủ candidate qua HTTP');
}

function processFlow(slide, d) {
  addCommon(slide, pptx, d);
  d.nodes.forEach((n, i) => {
    const x = 0.72 + i * 2.42;
    addPanel(slide, pptx, { x, y: 2.36, w: 1.82, h: 1.12, fill: i === 4 ? C.navy950 : C.white, line: i === 4 ? C.navy950 : C.navy700 });
    addText(slide, n, { x: x + 0.1, y: 2.65, w: 1.62, h: 0.45, fontSize: 16, bold: true, color: i === 4 ? C.white : C.navy950, align: 'center', valign: 'mid' });
    if (i < d.nodes.length - 1) {
      line(slide, x + 1.86, 2.92, 0.5, C.gold, 2);
      slide.addShape(pptx.ShapeType.chevron, { x: x + 2.23, y: 2.8, w: 0.18, h: 0.24, fill: { color: C.gold }, line: { color: C.gold, pt: 0 } });
    }
  });
  bullets(slide, d.facts, 1.0, 4.38, 11.6, 17, C.ink, 0.68);
}

function evidence(slide, d) {
  addCommon(slide, pptx, d);
  addImageCard(slide, pptx, abs(d.image), 0.72, 2.16, 7.55, 4.38, 'IMG-03 · học liệu Chương 1');
  addPanel(slide, pptx, { x: 8.5, y: 2.16, w: 4.12, h: 4.38, fill: C.white, line: C.line });
  addText(slide, 'Bằng chứng quan sát', { x: 8.82, y: 2.48, w: 3.48, h: 0.36, fontFace: F.heading, fontSize: 21, bold: true, color: C.navy950 });
  bullets(slide, d.bullets, 8.82, 3.08, 3.42, 15.5, C.ink, 0.72);
  addText(slide, 'Không suy rộng một ảnh đại diện thành thẩm định toàn bộ ba chương.', { x: 8.82, y: 5.82, w: 3.42, h: 0.44, fontSize: 13.5, italic: true, color: C.warning, align: 'center' });
}

function simulationExample(slide, d) {
  addCommon(slide, pptx, d);
  addImageCard(slide, pptx, abs(d.image), 0.72, 2.16, 7.48, 4.4, 'IMG-04 · route ch1-1-4 · F = 50 N; d = 4,00 m');
  addPanel(slide, pptx, { x: 8.46, y: 2.16, w: 4.16, h: 1.02, fill: C.navy950, line: C.navy950 });
  addText(slide, d.formula, { x: 8.72, y: 2.36, w: 3.64, h: 0.48, fontFace: F.heading, fontSize: 32, bold: true, color: C.white, align: 'center' });
  d.observations.forEach((r, i) => {
    const y = 3.38 + i * 0.76;
    addText(slide, r[0], { x: 8.58, y: y + 0.08, w: 1.0, h: 0.28, fontSize: 14.5, bold: true, color: C.gold });
    addText(slide, r[1], { x: 9.65, y, w: 2.78, h: 0.46, fontSize: 15.5, color: C.ink, valign: 'mid' });
  });
}

function simulation(slide, d) {
  addCommon(slide, pptx, d);
  addImageCard(slide, pptx, abs(d.image), 0.72, 2.15, 7.6, 4.4, 'IMG-04 · lớp Sim2 canonical');
  d.compare.forEach((r, i) => {
    const y = 2.3 + i * 1.66, color = i === 0 ? C.success : C.warning;
    addPanel(slide, pptx, { x: 8.62, y, w: 4.0, h: 1.34, fill: C.white, line: color, linePt: 1.2 });
    addText(slide, r[0], { x: 8.9, y: y + 0.16, w: 1.05, h: 0.4, fontSize: 22, bold: true, color });
    addText(slide, r[1], { x: 10.18, y: y + 0.18, w: 1.98, h: 0.36, fontSize: 18, bold: true, color: C.navy950, align: 'right' });
    addText(slide, r[2], { x: 8.9, y: y + 0.76, w: 3.38, h: 0.3, fontSize: 15, color: C.slate });
  });
  addText(slide, 'Không dùng Sim3 để tuyên bố “4D”', { x: 8.72, y: 5.82, w: 3.7, h: 0.36, fontSize: 16, bold: true, color: C.danger, align: 'center' });
}

function demoMain(slide, d) {
  addCommon(slide, pptx, d);
  d.images.forEach((img, i) => addImageCard(slide, pptx, abs(img), 0.72 + i * 4.08, 2.14, 3.78, 2.42, ['1 · Mở gói', '2 · Thao tác mô men', '3 · Đối chiếu PDF'][i]));
  d.steps.forEach((s, i) => {
    const x = 0.72 + i * 2.42;
    addText(slide, s[0], { x, y: 4.9, w: 2.05, h: 0.22, fontSize: 11.5, bold: true, color: C.gold, align: 'center' });
    addPanel(slide, pptx, { x, y: 5.2, w: 2.05, h: 1.0, fill: i === 2 ? 'EEF7F2' : C.white, line: i === 2 ? C.success : C.line });
    addText(slide, s[1], { x: x + 0.1, y: 5.38, w: 1.85, h: 0.28, fontSize: 16, bold: true, color: C.navy950, align: 'center' });
    addText(slide, s[2], { x: x + 0.12, y: 5.76, w: 1.81, h: 0.3, fontSize: 12.5, color: C.slate, align: 'center' });
    if (i < d.steps.length - 1) {
      line(slide, x + 2.07, 5.7, 0.32, C.gold, 1.8);
      slide.addShape(pptx.ShapeType.chevron, { x: x + 2.31, y: 5.59, w: 0.14, h: 0.22, fill: { color: C.gold }, line: { color: C.gold, pt: 0 } });
    }
  });
}

function assurance(slide, d) {
  addCommon(slide, pptx, d);
  addImageCard(slide, pptx, abs(d.image), 0.72, 2.12, 2.55, 4.48, 'Viewport 390 × 844');
  d.lanes.forEach((r, i) => {
    const y = 2.12 + i * 0.94, color = i === 0 ? C.navy700 : C.gold;
    addPanel(slide, pptx, { x: 3.5, y, w: 9.12, h: 0.74, fill: i === 0 ? 'EEF2F7' : C.white, line: color });
    addText(slide, r[0], { x: 3.78, y: y + 0.15, w: 1.5, h: 0.3, fontSize: 17, bold: true, color });
    addText(slide, r[1], { x: 5.35, y: y + 0.14, w: 6.9, h: 0.32, fontSize: 15.5, color: C.ink, align: 'center' });
  });
  [['Đã có bằng chứng kỹ thuật', d.done, C.success], ['Còn cần đánh giá độc lập', d.open, C.warning]].forEach((g, i) => {
    const x = 3.5 + i * 4.69;
    addPanel(slide, pptx, { x, y: 4.18, w: 4.43, h: 2.14, fill: C.white, line: g[2], linePt: 1.1 });
    addText(slide, g[0], { x: x + 0.22, y: 4.42, w: 3.98, h: 0.32, fontSize: 16.5, bold: true, color: g[2], align: 'center' });
    bullets(slide, g[1], x + 0.28, 4.98, 3.86, 14.5, C.ink, 0.48);
  });
}

function artifact(slide, d) {
  addCommon(slide, pptx, d);
  d.metrics.forEach((m, i) => addMetric(slide, pptx, m[0], m[1], 0.72 + i * 2.18, 2.22, 1.9, i === 2 ? C.success : C.navy800));
  addPanel(slide, pptx, { x: 7.45, y: 2.18, w: 5.15, h: 2.12, fill: 'EEF7F2', line: C.success, linePt: 1.1 });
  addText(slide, 'XÁC THỰC HIỆN VẬT', { x: 7.78, y: 2.42, w: 2.8, h: 0.3, fontSize: 13, bold: true, color: C.success });
  d.hashes.forEach((r, i) => {
    addText(slide, r[0], { x: 7.78, y: 2.91 + i * 0.5, w: 1.9, h: 0.24, fontSize: 12, color: C.slate });
    addText(slide, r[1], { x: 9.72, y: 2.87 + i * 0.5, w: 2.62, h: 0.3, fontSize: 13.5, bold: true, color: C.navy950, align: 'right' });
  });
  addPanel(slide, pptx, { x: 0.72, y: 4.72, w: 11.88, h: 1.32, fill: C.white, line: C.navy800, linePt: 1.2 });
  addText(slide, 'Kết luận', { x: 1.02, y: 5.02, w: 1.2, h: 0.32, fontSize: 17, bold: true, color: C.navy950 });
  addText(slide, 'Gói ứng viên đã khóa hash; sẵn sàng cho bốn bước đánh giá độc lập, chưa phải bản phát hành cuối.', { x: 2.3, y: 4.9, w: 9.8, h: 0.52, fontSize: 18, bold: true, color: C.navy950, align: 'center', valign: 'mid' });
}

function gates(slide, d) {
  addCommon(slide, pptx, d);
  const barX = 0.85, barY = 2.42, barW = 7.2, total = 24;
  let cur = barX;
  [[20, C.success], [4, C.warning]].forEach(([v, c]) => {
    const w = barW * v / total;
    slide.addShape(pptx.ShapeType.rect, { x: cur, y: barY, w, h: 0.58, fill: { color: c }, line: { color: c, pt: 0 } });
    cur += w;
  });
  addText(slide, '20 PASS', { x: 1.0, y: 2.54, w: 2, h: 0.24, fontSize: 13, bold: true, color: C.white });
  addText(slide, '4 BLOCKED', { x: 6.35, y: 2.54, w: 1.55, h: 0.24, fontSize: 11.5, bold: true, color: C.white, align: 'right' });
  addText(slide, '24 cổng · số tuyệt đối, không dùng % như điểm chất lượng', { x: 0.85, y: 3.18, w: 7.2, h: 0.28, fontSize: 14, color: C.slate, align: 'center' });
  d.gates.forEach((g, i) => {
    const y = 3.74 + i * 0.62, col = [C.success, C.slate, C.warning, C.slate][i];
    addText(slide, g[0], { x: 0.92, y, w: 1.18, h: 0.28, fontSize: 13, bold: true, color: col });
    addText(slide, String(g[1]), { x: 2.12, y: y - 0.04, w: 0.58, h: 0.34, fontSize: 20, bold: true, color: C.navy950, align: 'center' });
    addText(slide, g[2], { x: 2.88, y, w: 4.9, h: 0.3, fontSize: 14.5, color: C.ink });
  });
  addPanel(slide, pptx, { x: 8.48, y: 2.18, w: 4.12, h: 3.9, fill: 'FFF4E8', line: C.warning });
  addText(slide, 'TRẠNG THÁI TỔNG THỂ', { x: 8.86, y: 2.54, w: 3.36, h: 0.3, fontSize: 13, bold: true, color: C.warning, align: 'center' });
  addText(slide, 'BLOCKED', { x: 8.85, y: 3.05, w: 3.38, h: 0.62, fontSize: 34, bold: true, color: C.danger, align: 'center' });
  addText(slide, 'Không có gate fail; 4 gate chờ đúng chuyên gia/người dùng độc lập đóng.', { x: 9.02, y: 4.03, w: 3.04, h: 0.84, fontSize: 16, color: C.navy950, align: 'center', valign: 'mid' });
}

function conditions(slide, d) {
  addCommon(slide, pptx, d);
  d.conditions.forEach((r, i) => {
    const y = 2.17 + i * 0.86;
    addText(slide, r[0], { x: 0.78, y: y + 0.12, w: 0.42, h: 0.32, fontSize: 18, bold: true, color: C.gold, align: 'center' });
    addPanel(slide, pptx, { x: 1.38, y, w: 11.18, h: 0.68, fill: C.white, line: C.navy700 });
    addText(slide, r[1], { x: 1.68, y: y + 0.14, w: 2.3, h: 0.3, fontSize: 16.5, bold: true, color: C.navy700 });
    addText(slide, r[2], { x: 4.12, y: y + 0.13, w: 7.95, h: 0.34, fontSize: 15.5, color: C.ink });
  });
  addPanel(slide, pptx, { x: 1.38, y: 5.86, w: 11.18, h: 0.62, fill: 'EEF7F2', line: C.success, linePt: 1.1 });
  addText(slide, d.nextStep, { x: 1.7, y: 6.02, w: 10.55, h: 0.28, fontSize: 16.5, bold: true, color: C.success, align: 'center' });
}





const renderers = { ...special, chapters, authors, journey, process: processFlow, evidence, simulationExample, simulation, demoMain, assurance, artifact, gates, conditions };
for (const data of slides) {
  const slide = pptx.addSlide('BLANK');
  const render = renderers[data.type];
  if (!render) throw new Error(`Unknown slide type: ${data.type}`);
  render(slide, data);
}

async function main() {
  await pptx.writeFile({ fileName: out });
  const normalizer = path.resolve(__dirname, 'normalize-pptx-package.py');
  const result = spawnSync(process.env.PYTHON || 'python', [normalizer, path.resolve(out)], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`PPTX normalization failed: ${result.stderr || result.stdout}`);
  }
  console.log(JSON.stringify({
    output: out,
    slides: slides.length,
    main: slides.filter(s => !s.backup).length,
    backup: slides.filter(s => s.backup).length,
  }));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
