'use strict';

const path = require('path');
const { meta } = require('./acceptance-deck-content');
const { C, F, addText, addSemanticTitle, addPanel, addNotes, addCommon, addImageCard } = require('./acceptance-deck-theme');

module.exports = function specialSlides(pptx) {
  function cover(slide, d) {
    slide.background = { color: C.navy950 };
    slide.addShape(pptx.ShapeType.line, { x: 0.72, y: 0.42, w: 0.7, h: 0, line: { color: C.gold, pt: 2.2 } });
    addText(slide, d.kicker, { x: 1.55, y: 0.28, w: 8.4, h: 0.28, fontSize: 11.5, bold: true, color: C.goldLight });
    addText(slide, d.title, { x: 0.72, y: 0.78, w: 6.05, h: 1.55, fontFace: F.heading, fontSize: 39, bold: true, color: C.white, valign: 'mid' });
    addText(slide, d.takeaway, { x: 0.76, y: 2.6, w: 5.95, h: 1.18, fontSize: 19, bold: true, color: C.goldLight, valign: 'mid' });
    addPanel(slide, pptx, { x: 0.72, y: 4.15, w: 5.92, h: 1.38, fill: C.navy800, line: C.navy700 });
    addText(slide, 'NHÓM TÁC GIẢ', { x: 1.0, y: 4.4, w: 1.45, h: 0.25, fontSize: 11, bold: true, color: C.goldLight });
    meta.authors.forEach((author, i) => addText(slide, author, { x: 2.45, y: 4.32 + i * 0.34, w: 3.8, h: 0.25, fontSize: 13.5, color: C.white, align: 'right' }));
    addImageCard(slide, pptx, path.resolve(__dirname, '../..', d.image), 7.02, 0.88, 5.6, 3.62, 'Ảnh giao diện học liệu · hiện vật dùng để trình diễn');
    d.illustrations.forEach((illustration, i) => {
      const x = 7.02 + i * 1.91;
      addImageCard(slide, pptx, path.resolve(__dirname, '../..', illustration.image), x, 4.72, 1.78, 1.55, illustration.label);
    });
    addText(slide, 'BA MẠCH KIẾN THỨC · SƠ ĐỒ NGUYÊN LÝ', { x: 7.02, y: 6.4, w: 5.6, h: 0.18, fontSize: 10, bold: true, color: C.goldLight, align: 'center' });
    addText(slide, 'KHÁNH HÒA · 2026', { x: 0.78, y: 6.72, w: 3, h: 0.24, fontSize: 10, bold: true, color: C.goldLight });
    addText(slide, `${meta.totalTime} nội dung · ${meta.bufferTime} dự phòng`, { x: 9.7, y: 6.72, w: 2.65, h: 0.24, fontSize: 10, bold: true, color: C.goldLight, align: 'right' });
    addNotes(slide, d);
  }

  function decision(slide, d) {
    slide.background = { color: C.navy950 };
    addText(slide, String(d.id).padStart(2, '0'), { x: 11.95, y: 0.44, w: 0.45, h: 0.22, fontSize: 10, bold: true, color: C.gold, align: 'right' });
    addSemanticTitle(slide, d.title, { x: 0.78, y: 0.62, w: 11.8, h: 0.72, fontSize: 34, color: C.white, align: 'center' });
    addText(slide, d.takeaway, { x: 1.0, y: 1.48, w: 11.35, h: 0.72, fontSize: 17.5, bold: true, color: C.goldLight, align: 'center', valign: 'mid' });
    d.decisionCards.forEach((card, i) => {
      const x = 0.78 + i * 4.16;
      const accent = [C.success, C.warning, C.gold][i];
      addPanel(slide, pptx, { x, y: 2.58, w: 3.78, h: 2.75, fill: C.paper, line: accent, linePt: 1.3 });
      addText(slide, card[0], { x: x + 0.28, y: 2.92, w: 3.22, h: 0.32, fontSize: 14, bold: true, color: accent, align: 'center' });
      addText(slide, card[1], { x: x + 0.34, y: 3.56, w: 3.1, h: 1.18, fontSize: 17, bold: i === 2, color: C.navy950, align: 'center', valign: 'mid' });
    });
    addPanel(slide, pptx, { x: 0.9, y: 5.67, w: 11.55, h: 0.88, fill: C.navy800, line: C.gold, linePt: 1.1 });
    addText(slide, d.minuteText, { x: 1.18, y: 5.82, w: 10.98, h: 0.55, fontSize: 14.3, bold: true, color: C.white, align: 'center', valign: 'mid' });
    addNotes(slide, d);
  }

  function gateDetails(slide, d) {
    addCommon(slide, pptx, d);
    addText(slide, 'LUỒNG XỬ LÝ HỒ SƠ ĐỀ XUẤT · KHÔNG PHẢI TRẠNG THÁI ĐÃ HOÀN TẤT', { x: 0.85, y: 2.2, w: 11.8, h: 0.24, fontSize: 11.5, bold: true, color: C.slate, align: 'center' });
    const blocks = [
      { x: 0.82, label: 'Hồ sơ đề xuất', color: C.blue },
      { x: 3.65, label: 'Chuyên gia\nthẩm định', color: C.navy700 },
      { x: 9.82, label: 'Ghi nhận có\nthẩm quyền', color: C.success },
    ];
    blocks.forEach(block => {
      addPanel(slide, pptx, { x: block.x, y: 2.68, w: 2.52, h: 0.98, fill: C.white, line: block.color, linePt: 1.4 });
      addText(slide, block.label, { x: block.x + 0.14, y: 2.88, w: 2.24, h: 0.55, fontSize: 18, bold: true, color: block.color, align: 'center', valign: 'mid' });
    });
    slide.addShape(pptx.ShapeType.diamond, { x: 6.8, y: 2.5, w: 1.92, h: 1.38, fill: { color: 'FFF8ED' }, line: { color: C.warning, pt: 1.4 } });
    addText(slide, 'Đủ\ncăn cứ?', { x: 7.18, y: 2.88, w: 1.16, h: 0.58, fontSize: 17, bold: true, color: C.warning, align: 'center' });
    [[3.34, 3.65], [6.17, 6.8], [8.72, 9.82]].forEach(([start, end]) => {
      slide.addShape(pptx.ShapeType.line, { x: start + 0.04, y: 3.17, w: end - start - 0.09, h: 0, line: { color: C.gold, pt: 1.8, endArrowType: 'triangle' } });
    });
    addText(slide, 'Có', { x: 8.95, y: 2.78, w: 0.55, h: 0.25, fontSize: 15, bold: true, color: C.success, align: 'center' });
    slide.addShape(pptx.ShapeType.line, { x: 7.76, y: 3.88, w: 0, h: 0.42, line: { color: C.warning, pt: 1.8 } });
    slide.addShape(pptx.ShapeType.line, { x: 4.91, y: 4.3, w: 2.85, h: 0, line: { color: C.warning, pt: 1.8 } });
    slide.addShape(pptx.ShapeType.line, { x: 4.91, y: 3.7, w: 0, h: 0.6, line: { color: C.warning, pt: 1.8, beginArrowType: 'triangle' } });
    addText(slide, 'Chưa', { x: 7.9, y: 3.87, w: 0.72, h: 0.24, fontSize: 14, bold: true, color: C.warning });
    addText(slide, 'Bổ sung / chỉnh sửa', { x: 5.12, y: 3.93, w: 2.42, h: 0.26, fontSize: 15, bold: true, color: C.warning, align: 'center' });
    d.rows.forEach((row, i) => {
      const x = 0.82 + (i % 2) * 6.05;
      const y = 4.66 + Math.floor(i / 2) * 1.01;
      addPanel(slide, pptx, { x, y, w: 5.64, h: 0.87, fill: C.white, line: C.line });
      addText(slide, row[0], { x: x + 0.18, y: y + 0.1, w: 3.28, h: 0.25, fontSize: 14, bold: true, color: C.navy950 });
      addText(slide, row[1], { x: x + 3.67, y: y + 0.08, w: 1.72, h: 0.32, fontSize: 11.3, bold: true, color: C.warning, align: 'right' });
      addText(slide, row[2], { x: x + 0.18, y: y + 0.44, w: 5.28, h: 0.3, fontSize: 12.8, color: C.ink });
    });
  }

  function releaseGates(slide, d) {
    addCommon(slide, pptx, d);
    addText(slide, '09 LẦN DỪNG DO MÔI TRƯỜNG', { x: 0.78, y: 2.03, w: 7.55, h: 0.28, fontSize: 12.5, bold: true, color: C.danger, align: 'center' });
    d.failedRows.forEach((row, i) => {
      const y = 2.36 + i * 0.46;
      addPanel(slide, pptx, { x: 0.72, y, w: 7.7, h: 0.39, fill: i % 2 ? 'F8FAFC' : C.white, line: C.line });
      addText(slide, row[0], { x: 0.88, y: y + 0.06, w: 2.18, h: 0.2, fontSize: 10.8, bold: true, color: C.navy950 });
      addText(slide, row[1], { x: 3.08, y: y + 0.06, w: 1.62, h: 0.2, fontSize: 9.5, bold: true, color: C.danger, align: 'center' });
      addText(slide, row[2], { x: 4.82, y: y + 0.04, w: 3.34, h: 0.26, fontSize: row[2].length > 100 ? 8.7 : 9.5, color: C.slate, valign: 'mid' });
    });
    addText(slide, '04 NỘI DUNG CẦN ĐÁNH GIÁ ĐỘC LẬP', { x: 8.66, y: 2.03, w: 3.95, h: 0.28, fontSize: 12, bold: true, color: C.warning, align: 'center' });
    d.rows.forEach((row, i) => {
      const y = 2.36 + i * 1.04;
      addPanel(slide, pptx, { x: 8.62, y, w: 4.0, h: 0.88, fill: 'FFF8ED', line: C.warning });
      addText(slide, row[0], { x: 8.82, y: y + 0.1, w: 3.6, h: 0.28, fontSize: 12.2, bold: true, color: C.navy950, align: 'center' });
      addText(slide, row[2], { x: 8.86, y: y + 0.42, w: 3.52, h: 0.3, fontSize: row[2].length > 95 ? 9.3 : 10.2, color: C.slate, align: 'center', valign: 'mid' });
    });
    addPanel(slide, pptx, { x: 8.62, y: 6.54, w: 4.0, h: 0.32, fill: 'EEF2F7', line: C.line });
    addText(slide, 'Không dùng trạng thái dừng để kết luận phép kiểm tra chuyên môn đã sai.', { x: 8.82, y: 6.6, w: 3.6, h: 0.16, fontSize: 8.8, bold: true, color: C.navy800, align: 'center' });
  }

  function qa(slide, d) {
    addCommon(slide, pptx, d);
    d.questions.forEach((pair, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.72 + col * 6.12;
      const y = 2.18 + row * 1.4;
      addPanel(slide, pptx, { x, y, w: 5.82, h: 1.24, fill: C.white, line: C.line });
      addText(slide, String(i + 1).padStart(2, '0'), { x: x + 0.18, y: y + 0.18, w: 0.45, h: 0.28, fontSize: 15, bold: true, color: C.gold, align: 'center' });
      addText(slide, pair[0], { x: x + 0.78, y: y + 0.12, w: 4.72, h: 0.42, fontSize: pair[0].length > 42 ? 16 : 17, bold: true, color: C.navy950 });
      addText(slide, pair[1], { x: x + 0.78, y: y + 0.6, w: 4.72, h: 0.54, fontSize: pair[1].length > 150 ? 11.5 : pair[1].length > 85 ? 12.8 : 14, color: C.slate });
    });
  }

  function qrExperience(slide, d) {
    addCommon(slide, pptx, d);
    const absPath = path.resolve(__dirname, '../..', d.qrImage || d.image);
    addImageCard(slide, pptx, absPath, 0.72, 2.18, 4.35, 4.05, 'Quét mã để mở giáo trình trên thiết bị cá nhân');
    (d.features || []).forEach((feat, i) => {
      const y = 2.18 + i * 1.05;
      addPanel(slide, pptx, { x: 5.32, y, w: 7.4, h: 0.92, fill: C.white, line: C.line });
      addText(slide, feat[0], { x: 5.48, y: y + 0.16, w: 0.55, h: 0.36, fontSize: 19, bold: true, color: C.gold, align: 'center' });
      addText(slide, feat[1], { x: 6.18, y: y + 0.12, w: 6.35, h: 0.32, fontFace: F.heading, fontSize: 18, bold: true, color: C.navy950 });
      addText(slide, feat[2], { x: 6.18, y: y + 0.46, w: 6.35, h: 0.38, fontSize: 14.5, color: C.slate, valign: 'mid' });
    });
    addPanel(slide, pptx, { x: 0.72, y: 6.38, w: 12.0, h: 0.46, fill: 'EEF2F7', line: C.gold, linePt: 0.8 });
    addText(slide, `Liên kết chính thức: ${d.url} · Trải nghiệm trực tiếp không cần đăng nhập`, {
      x: 0.95, y: 6.44, w: 11.5, h: 0.32, fontSize: 13.5, bold: true, color: C.navy950, align: 'center', valign: 'mid'
    });
  }

  return { cover, decision, gateDetails, releaseGates, qa, qrExperience };
};
