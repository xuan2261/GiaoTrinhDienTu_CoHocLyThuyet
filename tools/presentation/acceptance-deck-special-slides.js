'use strict';

const { meta } = require('./acceptance-deck-content');
const { C, F, addText, addPanel, addImageCard, addNotes, addCommon } = require('./acceptance-deck-theme');

module.exports = function specialSlides(pptx, abs) {
  function cover(slide, d) {
    slide.background = { color: C.navy950 };
    slide.addShape(pptx.ShapeType.line, { x: 0.72, y: 0.7, w: 1.05, h: 0, line: { color: C.gold, pt: 2.2 } });
    addText(slide, d.kicker, { x: 1.95, y: 0.55, w: 8.9, h: 0.25, fontSize: 10, bold: true, color: C.goldLight });
    addText(slide, d.title, { x: 0.72, y: 1.55, w: 8.6, h: 1.6, fontFace: F.heading, fontSize: 31, bold: true, color: C.white, valign: 'mid' });
    addText(slide, d.takeaway, { x: 0.78, y: 3.48, w: 8.8, h: 0.68, fontSize: 17, bold: true, color: C.goldLight });
    addPanel(slide, pptx, { x: 9.75, y: 1.25, w: 2.85, h: 4.6, fill: C.navy800, line: C.navy700 });
    addText(slide, 'NHÓM TÁC GIẢ', { x: 10.05, y: 1.58, w: 2.25, h: 0.25, fontSize: 10, bold: true, color: C.goldLight, align: 'center' });
    meta.authors.forEach((a, i) => addText(slide, a, { x: 10.08, y: 2.18 + i * 0.95, w: 2.2, h: 0.62, fontSize: 12.2, color: C.white, align: 'center', valign: 'mid' }));
    addText(slide, 'KHÁNH HÒA · 2026', { x: 0.78, y: 6.72, w: 3, h: 0.24, fontSize: 10, bold: true, color: C.goldLight });
    addText(slide, '15:00', { x: 11.8, y: 6.72, w: 0.55, h: 0.24, fontSize: 10, bold: true, color: C.goldLight, align: 'right' });
    addNotes(slide, d);
  }

  function decision(slide, d) {
    slide.background = { color: C.navy950 };
    addText(slide, '13', { x: 11.95, y: 0.44, w: 0.45, h: 0.22, fontSize: 10, bold: true, color: C.gold, align: 'right' });
    addText(slide, d.title, { x: 0.78, y: 0.72, w: 11.8, h: 0.62, fontFace: F.heading, fontSize: 28, bold: true, color: C.white, align: 'center' });
    addText(slide, d.takeaway, { x: 1.25, y: 1.58, w: 10.85, h: 0.48, fontSize: 15.2, bold: true, color: C.goldLight, align: 'center' });
    addPanel(slide, pptx, { x: 1.02, y: 2.36, w: 11.3, h: 3.15, fill: C.paper, line: C.gold, linePt: 1.3 });
    addText(slide, d.decision, { x: 1.5, y: 2.83, w: 10.35, h: 2.2, fontFace: F.heading, fontSize: 18, color: C.navy950, align: 'center', valign: 'mid' });
    addText(slide, 'Kính đề nghị Hội đồng xem xét và cho ý kiến.', { x: 1.5, y: 6.08, w: 10.35, h: 0.36, fontSize: 15.5, bold: true, color: C.white, align: 'center' });
    addNotes(slide, d);
  }

  function demo(slide, d) {
    addCommon(slide, pptx, d);
    d.images.forEach((img, i) => addImageCard(slide, pptx, abs(img), 0.72 + i * 4.08, 2.14, 3.75, 2.65, ['Trang chủ','Sim2 mô men','PDF viewer'][i]));
    d.steps.forEach((s, i) => { addText(slide, s[0], { x: 0.85 + i * 2.35, y: 5.28, w: 0.62, h: 0.22, fontSize: 10, bold: true, color: C.gold }); addText(slide, s[1], { x: 1.45 + i * 2.35, y: 5.22, w: 1.15, h: 0.28, fontSize: 12, bold: true, color: C.navy950 }); addText(slide, s[2], { x: 1.45 + i * 2.35, y: 5.62, w: 1.45, h: 0.24, fontSize: 9.5, color: C.slate }); });
  }

  function gateDetails(slide, d) {
    addCommon(slide, pptx, d);
    d.rows.forEach((r, i) => {
      const y = 2.22 + i * 0.95;
      addPanel(slide, pptx, { x: 0.72, y, w: 12, h: 0.74, fill: C.white, line: C.line });
      addText(slide, r[0], { x: 0.98, y: y + 0.2, w: 3.45, h: 0.28, fontSize: 11.3, bold: true, color: C.navy950 });
      addText(slide, r[1], { x: 4.72, y: y + 0.2, w: 1.1, h: 0.28, fontSize: 11.2, bold: true, color: r[1] === 'Blocked' ? C.warning : C.slate, align: 'center' });
      addText(slide, r[2], { x: 6.1, y: y + 0.16, w: 6.1, h: 0.34, fontSize: 11.5, color: C.ink });
    });
  }

  function qa(slide, d) {
    addCommon(slide, pptx, d);
    d.questions.forEach((q, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 0.72 + col * 6.12, y = 2.18 + row * 1.28;
      addPanel(slide, pptx, { x, y, w: 5.82, h: 1.0, fill: C.white, line: C.line });
      addText(slide, String(i + 1).padStart(2, '0'), { x: x + 0.18, y: y + 0.32, w: 0.45, h: 0.25, fontSize: 13, bold: true, color: C.gold, align: 'center' });
      addText(slide, q, { x: x + 0.82, y: y + 0.22, w: 4.65, h: 0.5, fontSize: 13.2, bold: true, color: C.navy950, valign: 'mid' });
    });
  }

  return { cover, decision, demo, gateDetails, qa };
};
