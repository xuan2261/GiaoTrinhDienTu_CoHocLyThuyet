'use strict';

const fs = require('fs');
const path = require('path');

const C = {
  navy950: '07182F', navy900: '091A33', navy800: '0D2447', navy700: '15355F',
  paper: 'F7F5EF', white: 'FFFFFF', ink: '243247', slate: '5B6B80',
  gold: 'C9963A', goldLight: 'DBB36A', line: 'D7DEE8',
  success: '137A3D', warning: '9A5B00', danger: 'B42318', blue: '2980B9', green: '27AE60', purple: '8E44AD',
};
const F = { heading: 'Georgia', body: 'Arial' };
const SW = 13.333, SH = 7.5;

function pngSize(file) {
  const b = fs.readFileSync(file);
  if (b.subarray(1, 4).toString() !== 'PNG') throw new Error(`Only PNG supported: ${file}`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function contain(file, x, y, w, h) {
  const s = pngSize(file), r = s.width / s.height, box = w / h;
  if (r > box) { const ih = w / r; return { path: file, x, y: y + (h - ih) / 2, w, h: ih }; }
  const iw = h * r; return { path: file, x: x + (w - iw) / 2, y, w: iw, h };
}

function addText(slide, text, o = {}) {
  slide.addText(text, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fontFace: o.fontFace || F.body, fontSize: o.fontSize || 15,
    color: o.color || C.ink, bold: !!o.bold, italic: !!o.italic,
    align: o.align || 'left', valign: o.valign || 'top',
    margin: o.margin === undefined ? 0 : o.margin,
    breakLine: false, fit: 'shrink', paraSpaceAfterPt: o.paraSpaceAfterPt || 0,
    bullet: o.bullet, isTextBox: true,
  });
}

function addPanel(slide, pptx, o = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    rectRadius: 0.04,
    fill: { color: o.fill || C.white, transparency: o.transparency || 0 },
    line: { color: o.line || C.line, pt: o.linePt === undefined ? 0.8 : o.linePt },
  });
}

function addTitle(slide, pptx, title, index, section = 'BÁO CÁO NGHIỆM THU', backup = false) {
  slide.background = { color: C.paper };
  slide.addShape(pptx.ShapeType.line, { x: 0.67, y: 0.43, w: 0.52, h: 0, line: { color: C.gold, pt: 2 } });
  addText(slide, backup ? 'PHỤ LỤC / DEMO DỰ PHÒNG' : section, { x: 1.32, y: 0.28, w: 4.5, h: 0.25, fontSize: 9.5, bold: true, color: C.slate, valign: 'mid' });
  addText(slide, title, { x: 0.67, y: 0.72, w: 12.0, h: 0.66, fontFace: F.heading, fontSize: 23.5, bold: true, color: C.navy950, valign: 'mid' });
  addText(slide, String(index).padStart(2, '0'), { x: 12.15, y: 0.28, w: 0.5, h: 0.25, fontSize: 10, bold: true, color: C.gold, align: 'right' });
}

function addFooter(slide, index, source = '', backup = false) {
  slide.addShape('line', { x: 0.67, y: 7.13, w: 12.0, h: 0, line: { color: C.line, pt: 0.75 } });
  addText(slide, backup ? 'BACKUP' : 'HỘI ĐỒNG KHOA HỌC KHOA KTCS · 2026', { x: 0.67, y: 7.2, w: 3.9, h: 0.16, fontSize: 8.2, bold: backup, color: C.slate });
  addText(slide, source, { x: 4.15, y: 7.2, w: 7.75, h: 0.16, fontSize: 7.6, color: C.slate, align: 'center' });
  addText(slide, String(index), { x: 12.1, y: 7.2, w: 0.55, h: 0.16, fontSize: 8.2, color: C.slate, align: 'right' });
}

function addTakeaway(slide, pptx, text, y = 1.46) {
  slide.addShape(pptx.ShapeType.rect, { x: 0.67, y, w: 12, h: 0.48, fill: { color: 'EEF2F7' }, line: { color: C.line, pt: 0.5 } });
  addText(slide, text, { x: 0.9, y: y + 0.1, w: 11.55, h: 0.26, fontSize: 13.2, bold: true, color: C.navy800, valign: 'mid' });
}

function addMetric(slide, pptx, value, label, x, y, w = 1.9, color = C.navy800) {
  addPanel(slide, pptx, { x, y, w, h: 1.16, fill: C.white, line: C.line });
  addText(slide, value, { x: x + 0.1, y: y + 0.15, w: w - 0.2, h: 0.46, fontSize: 28, bold: true, color, align: 'center', valign: 'mid' });
  addText(slide, label, { x: x + 0.1, y: y + 0.73, w: w - 0.2, h: 0.22, fontSize: 10.2, color: C.slate, align: 'center', valign: 'mid' });
}

function addImageCard(slide, pptx, file, x, y, w, h, caption = '') {
  addPanel(slide, pptx, { x, y, w, h, fill: C.white, line: C.navy800, linePt: 0.8 });
  const pad = 0.08, cap = caption ? 0.28 : 0;
  slide.addImage({ ...contain(file, x + pad, y + pad, w - 2 * pad, h - 2 * pad - cap), altText: caption || path.basename(file) });
  if (caption) addText(slide, caption, { x: x + 0.12, y: y + h - 0.24, w: w - 0.24, h: 0.14, fontSize: 8.5, color: C.slate, align: 'center' });
}

function addNotes(slide, data) {
  const lines = [`SLIDE ${data.id} · ${data.time} · ${data.speaker}`, '', ...(data.script || []), '', 'Nguồn:', ...(data.sources || []).map(s => `- ${s}`)];
  slide.addNotes(lines.join('\n'));
}

function addCommon(slide, pptx, data) {
  addTitle(slide, pptx, data.title, data.id, 'BÁO CÁO NGHIỆM THU', !!data.backup);
  addTakeaway(slide, pptx, data.takeaway);
  addFooter(slide, data.id, (data.sources || [])[0] || '', !!data.backup);
  addNotes(slide, data);
}

module.exports = { C, F, SW, SH, addText, addPanel, addTitle, addFooter, addTakeaway, addMetric, addImageCard, addNotes, addCommon, contain };
