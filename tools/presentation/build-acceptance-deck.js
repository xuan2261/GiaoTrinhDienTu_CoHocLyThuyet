'use strict';

const fs = require('fs');
const path = require('path');
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

function bullets(slide, items, x, y, w, size = 14, color = C.ink, gap = 0.55) {
  items.forEach((item, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x, y: y + i * gap + 0.11, w: 0.09, h: 0.09, fill: { color: C.gold }, line: { color: C.gold, pt: 0 } });
    addText(slide, item, { x: x + 0.22, y: y + i * gap, w: w - 0.22, h: 0.4, fontSize: size, color, valign: 'mid' });
  });
}


function chapters(slide, d) {
  addCommon(slide, pptx, d);
  d.chapters.forEach((c, i) => {
    const y = 2.2 + i * 1.28, color = [C.blue, C.green, C.purple][i];
    addPanel(slide, pptx, { x: 0.72, y, w: 7.15, h: 1.02, fill: C.white, line: C.line });
    addText(slide, c[0], { x: 0.95, y: y + 0.18, w: 0.6, h: 0.45, fontSize: 25, bold: true, color, align: 'center' });
    addText(slide, c[1], { x: 1.78, y: y + 0.14, w: 2.15, h: 0.32, fontFace: F.heading, fontSize: 17, bold: true, color: C.navy950 });
    addText(slide, c[2], { x: 1.78, y: y + 0.56, w: 4.9, h: 0.22, fontSize: 11.5, color: C.slate });
  });
  addImageCard(slide, pptx, abs(d.image), 8.25, 2.18, 4.35, 3.98, 'Hệ lực không gian · hình canonical Chương 1');
}

function authors(slide, d) {
  addCommon(slide, pptx, d);
  d.authors.forEach((a, i) => {
    const y = 2.16 + i * 1.18;
    addPanel(slide, pptx, { x: 0.72, y, w: 12, h: 0.94, fill: i === 0 ? 'EEF2F7' : C.white, line: C.line });
    addText(slide, String(i + 1).padStart(2, '0'), { x: 0.95, y: y + 0.25, w: 0.5, h: 0.3, fontSize: 18, bold: true, color: C.gold, align: 'center' });
    addText(slide, a, { x: 1.72, y: y + 0.2, w: 5.2, h: 0.34, fontSize: 15, bold: true, color: C.navy950 });
    addText(slide, d.responsibilities[i], { x: 7.35, y: y + 0.2, w: 4.85, h: 0.34, fontSize: 13, color: C.ink, align: 'right' });
  });
  addPanel(slide, pptx, { x: 0.72, y: 5.98, w: 12, h: 0.63, fill: C.navy950, line: C.navy950 });
  addText(slide, 'Nguồn chuẩn', { x: 1.0, y: 6.18, w: 1.35, h: 0.2, fontSize: 10, bold: true, color: C.goldLight });
  addText(slide, 'CoHocLyThuyet_Full_New.docx  →  HTML / PDF / package', { x: 2.55, y: 6.13, w: 8.7, h: 0.28, fontSize: 14, bold: true, color: C.white, align: 'center' });
}

function journey(slide, d) {
  addCommon(slide, pptx, d);
  d.steps.forEach((s, i) => {
    const y = 2.18 + i * 0.78;
    addText(slide, s[0], { x: 0.78, y: y + 0.12, w: 0.45, h: 0.26, fontSize: 14, bold: true, color: C.gold, align: 'center' });
    addText(slide, s[1], { x: 1.42, y: y + 0.05, w: 1.2, h: 0.28, fontSize: 15, bold: true, color: C.navy950 });
    addText(slide, s[2], { x: 2.65, y: y + 0.07, w: 2.6, h: 0.28, fontSize: 11.4, color: C.slate });
    if (i < d.steps.length - 1) line(slide, 0.98, y + 0.48, 0.05, C.gold, 1.5);
  });
  addImageCard(slide, pptx, abs(d.image), 5.45, 2.18, 7.18, 4.38, 'IMG-01 · trang chủ candidate qua HTTP');
}

function processFlow(slide, d) {
  addCommon(slide, pptx, d);
  d.nodes.forEach((n, i) => {
    const x = 0.72 + i * 2.42;
    addPanel(slide, pptx, { x, y: 2.35, w: 1.82, h: 1.08, fill: i === 4 ? C.navy950 : C.white, line: i === 4 ? C.navy950 : C.navy700 });
    addText(slide, n, { x: x + 0.12, y: 2.68, w: 1.58, h: 0.34, fontSize: 13.2, bold: true, color: i === 4 ? C.white : C.navy950, align: 'center', valign: 'mid' });
    if (i < d.nodes.length - 1) { line(slide, x + 1.86, 2.89, 0.5, C.gold, 2); slide.addShape(pptx.ShapeType.chevron, { x: x + 2.23, y: 2.77, w: 0.18, h: 0.24, fill: { color: C.gold }, line: { color: C.gold, pt: 0 } }); }
  });
  bullets(slide, d.facts, 1.0, 4.28, 11.6, 14.2, C.ink, 0.62);
}

function evidence(slide, d) {
  addCommon(slide, pptx, d);
  addImageCard(slide, pptx, abs(d.image), 0.72, 2.15, 7.75, 4.35, 'IMG-03 · học liệu Chương 1');
  addPanel(slide, pptx, { x: 8.75, y: 2.15, w: 3.87, h: 4.35, fill: C.white, line: C.line });
  addText(slide, 'Bằng chứng quan sát', { x: 9.05, y: 2.48, w: 3.25, h: 0.32, fontFace: F.heading, fontSize: 17, bold: true, color: C.navy950 });
  bullets(slide, d.bullets, 9.05, 3.12, 3.2, 13.2, C.ink, 0.8);
  addText(slide, 'Giới hạn', { x: 9.05, y: 5.48, w: 0.9, h: 0.2, fontSize: 10, bold: true, color: C.warning });
  addText(slide, 'Một bài đại diện không thay thẩm định toàn bộ ba chương.', { x: 9.05, y: 5.82, w: 3.2, h: 0.48, fontSize: 11.5, color: C.slate });
}

function simulation(slide, d) {
  addCommon(slide, pptx, d);
  addImageCard(slide, pptx, abs(d.image), 0.72, 2.15, 7.6, 4.4, 'IMG-04 · mô men lực, F = 50 N');
  d.compare.forEach((r, i) => {
    const y = 2.28 + i * 1.62, color = i === 0 ? C.success : C.warning;
    addPanel(slide, pptx, { x: 8.65, y, w: 3.95, h: 1.3, fill: C.white, line: color, linePt: 1.2 });
    addText(slide, r[0], { x: 8.95, y: y + 0.18, w: 1.0, h: 0.35, fontSize: 19, bold: true, color });
    addText(slide, r[1], { x: 10.25, y: y + 0.2, w: 1.8, h: 0.3, fontSize: 15, bold: true, color: C.navy950, align: 'right' });
    addText(slide, r[2], { x: 8.95, y: y + 0.74, w: 3.3, h: 0.25, fontSize: 11.2, color: C.slate });
  });
  addText(slide, 'Không claim 4D', { x: 8.8, y: 5.82, w: 3.5, h: 0.32, fontSize: 13, bold: true, color: C.danger, align: 'center' });
}

function integrity(slide, d) {
  addCommon(slide, pptx, d);
  d.lanes.forEach((r, i) => {
    const y = 2.3 + i * 1.58, fill = i === 0 ? 'EEF2F7' : C.white;
    addPanel(slide, pptx, { x: 0.72, y, w: 12, h: 1.25, fill, line: i === 0 ? C.navy700 : C.gold });
    addText(slide, r[0], { x: 1.02, y: y + 0.25, w: 1.6, h: 0.35, fontSize: 17, bold: true, color: i === 0 ? C.navy800 : C.gold });
    addText(slide, r[1], { x: 2.9, y: y + 0.2, w: 8.85, h: 0.45, fontSize: 14.5, color: C.ink, align: 'center', valign: 'mid' });
  });
  addPanel(slide, pptx, { x: 0.72, y: 5.63, w: 12, h: 0.7, fill: C.navy950, line: C.navy950 });
  addText(slide, 'Tự động hóa tạo bằng chứng · Hội đồng quyết định giá trị khoa học–sư phạm', { x: 1.0, y: 5.86, w: 11.4, h: 0.25, fontSize: 14.2, bold: true, color: C.white, align: 'center' });
}

function accessibility(slide, d) {
  addCommon(slide, pptx, d);
  addImageCard(slide, pptx, abs(d.image), 0.82, 2.12, 3.05, 4.45, 'IMG-02 · viewport 390 × 844');
  [['Đã có bằng chứng kỹ thuật', d.done, C.success], ['Còn cần review độc lập', d.open, C.warning]].forEach((g, i) => {
    const y = 2.12 + i * 2.24;
    addPanel(slide, pptx, { x: 4.25, y, w: 8.35, h: 1.94, fill: C.white, line: g[2], linePt: 1.1 });
    addText(slide, g[0], { x: 4.58, y: y + 0.22, w: 3.0, h: 0.3, fontSize: 15.2, bold: true, color: g[2] });
    bullets(slide, g[1], 7.62, y + 0.16, 4.55, 12.5, C.ink, 0.47);
  });
}

function artifact(slide, d) {
  addCommon(slide, pptx, d);
  d.metrics.forEach((m, i) => addMetric(slide, pptx, m[0], m[1], 0.72 + i * 2.18, 2.22, 1.9, i === 2 ? C.danger : C.navy800));
  addPanel(slide, pptx, { x: 7.45, y: 2.18, w: 5.15, h: 2.02, fill: 'FFF4E8', line: C.warning, linePt: 1.1 });
  addText(slide, 'HASH DRIFT', { x: 7.78, y: 2.46, w: 1.5, h: 0.28, fontSize: 11, bold: true, color: C.warning });
  d.hashes.forEach((r, i) => { addText(slide, r[0], { x: 7.78, y: 2.96 + i * 0.5, w: 1.7, h: 0.2, fontSize: 10.2, color: C.slate }); addText(slide, r[1], { x: 9.55, y: 2.9 + i * 0.5, w: 2.6, h: 0.28, fontSize: 11.2, bold: true, color: C.navy950, align: 'right' }); });
  addPanel(slide, pptx, { x: 0.72, y: 4.62, w: 11.88, h: 1.4, fill: C.white, line: C.danger, linePt: 1.2 });
  addText(slide, 'Kết luận', { x: 1.02, y: 4.92, w: 1.05, h: 0.28, fontSize: 14, bold: true, color: C.danger });
  addText(slide, 'Không phân phối ZIP như một hash-locked RC trước khi tái tạo summary, SHA-256 và smoke evidence.', { x: 2.3, y: 4.82, w: 9.8, h: 0.5, fontSize: 15.5, bold: true, color: C.navy950, align: 'center', valign: 'mid' });
}

function gates(slide, d) {
  addCommon(slide, pptx, d);
  const barX = 0.85, barY = 2.42, barW = 7.2, total = 24;
  let cur = barX;
  [[20,C.success],[3,C.warning],[1,C.slate]].forEach(([v,c]) => { const w = barW * v / total; slide.addShape(pptx.ShapeType.rect, { x: cur, y: barY, w, h: 0.58, fill: { color: c }, line: { color: c, pt: 0 } }); cur += w; });
  addText(slide, '20 PASS', { x: 0.95, y: 2.56, w: 2, h: 0.18, fontSize: 10, bold: true, color: C.white });
  addText(slide, '3 BLOCKED', { x: 6.55, y: 2.56, w: 1.2, h: 0.18, fontSize: 8.5, bold: true, color: C.white, align: 'right' });
  addText(slide, '1', { x: 7.78, y: 2.56, w: 0.15, h: 0.18, fontSize: 8.5, bold: true, color: C.white, align: 'center' });
  addText(slide, '24 gate · số tuyệt đối, không dùng % như điểm chất lượng', { x: 0.85, y: 3.18, w: 7.2, h: 0.24, fontSize: 11.2, color: C.slate, align: 'center' });
  d.gates.forEach((g, i) => {
    const y = 3.78 + i * 0.62, col = [C.success,C.slate,C.warning,C.slate][i];
    addText(slide, g[0], { x: 0.92, y, w: 1.05, h: 0.25, fontSize: 10.5, bold: true, color: col });
    addText(slide, String(g[1]), { x: 2.0, y: y - 0.05, w: 0.55, h: 0.32, fontSize: 17, bold: true, color: C.navy950, align: 'center' });
    addText(slide, g[2], { x: 2.75, y, w: 4.95, h: 0.25, fontSize: 11.2, color: C.ink });
  });
  addPanel(slide, pptx, { x: 8.48, y: 2.18, w: 4.12, h: 3.9, fill: 'FFF4E8', line: C.warning });
  addText(slide, 'OVERALL STATUS', { x: 8.86, y: 2.55, w: 3.36, h: 0.24, fontSize: 10, bold: true, color: C.warning, align: 'center' });
  addText(slide, 'BLOCKED', { x: 8.85, y: 3.05, w: 3.38, h: 0.58, fontSize: 32, bold: true, color: C.danger, align: 'center' });
  addText(slide, 'Không có gate fail không đồng nghĩa đủ điều kiện phát hành.', { x: 9.05, y: 4.02, w: 2.98, h: 0.74, fontSize: 13, color: C.navy950, align: 'center', valign: 'mid' });
}

function conditions(slide, d) {
  addCommon(slide, pptx, d);
  d.conditions.forEach((r, i) => {
    const y = 2.17 + i * 0.82, color = i === 4 ? C.danger : C.navy700;
    addText(slide, r[0], { x: 0.78, y: y + 0.1, w: 0.42, h: 0.3, fontSize: 15, bold: true, color: C.gold, align: 'center' });
    addPanel(slide, pptx, { x: 1.38, y, w: 11.18, h: 0.64, fill: i === 4 ? 'FDECEC' : C.white, line: color });
    addText(slide, r[1], { x: 1.68, y: y + 0.15, w: 2.1, h: 0.25, fontSize: 13.2, bold: true, color });
    addText(slide, r[2], { x: 4.0, y: y + 0.14, w: 8.05, h: 0.28, fontSize: 12.5, color: C.ink });
  });
}





const renderers = { ...special, chapters, authors, journey, process: processFlow, evidence, simulation, integrity, accessibility, artifact, gates, conditions };
for (const data of slides) {
  const slide = pptx.addSlide('BLANK');
  const render = renderers[data.type];
  if (!render) throw new Error(`Unknown slide type: ${data.type}`);
  render(slide, data);
}

pptx.writeFile({ fileName: out }).then(() => console.log(JSON.stringify({ output: out, slides: slides.length, main: slides.filter(s => !s.backup).length, backup: slides.filter(s => s.backup).length })));
