'use strict';

const { meta } = require('./acceptance-deck-content');
const { C, F, addText, addPanel, addImageCard, addNotes, addCommon } = require('./acceptance-deck-theme');

module.exports = function specialSlides(pptx, abs) {
  function cover(slide, d) {
    slide.background = { color: C.navy950 };
    slide.addShape(pptx.ShapeType.line, { x: 0.72, y: 0.7, w: 1.05, h: 0, line: { color: C.gold, pt: 2.2 } });
    addText(slide, d.kicker, { x: 1.95, y: 0.55, w: 8.9, h: 0.3, fontSize: 12, bold: true, color: C.goldLight });
    addText(slide, d.title, { x: 0.72, y: 1.48, w: 8.72, h: 1.72, fontFace: F.heading, fontSize: 42, bold: true, color: C.white, valign: 'mid' });
    addText(slide, d.takeaway, { x: 0.78, y: 3.52, w: 8.8, h: 0.72, fontSize: 19, bold: true, color: C.goldLight });
    addPanel(slide, pptx, { x: 9.75, y: 1.25, w: 2.85, h: 4.6, fill: C.navy800, line: C.navy700 });
    addText(slide, 'NHÓM TÁC GIẢ', { x: 10.05, y: 1.55, w: 2.25, h: 0.3, fontSize: 12, bold: true, color: C.goldLight, align: 'center' });
    meta.authors.forEach((a, i) => addText(slide, a, { x: 10.02, y: 2.12 + i * 0.98, w: 2.32, h: 0.7, fontSize: 15, color: C.white, align: 'center', valign: 'mid' }));
    addText(slide, 'KHÁNH HÒA · 2026', { x: 0.78, y: 6.72, w: 3, h: 0.24, fontSize: 10, bold: true, color: C.goldLight });
    addText(slide, '15:00', { x: 11.8, y: 6.72, w: 0.55, h: 0.24, fontSize: 10, bold: true, color: C.goldLight, align: 'right' });
    addNotes(slide, d);
  }

  function decision(slide, d) {
    slide.background = { color: C.navy950 };
    addText(slide, '13', { x: 11.95, y: 0.44, w: 0.45, h: 0.22, fontSize: 10, bold: true, color: C.gold, align: 'right' });
    addText(slide, d.title, { x: 0.78, y: 0.68, w: 11.8, h: 0.78, fontFace: F.heading, fontSize: 36, bold: true, color: C.white, align: 'center' });
    addText(slide, d.takeaway, { x: 1.25, y: 1.58, w: 10.85, h: 0.52, fontSize: 18, bold: true, color: C.goldLight, align: 'center' });
    addPanel(slide, pptx, { x: 1.02, y: 2.34, w: 11.3, h: 3.18, fill: C.paper, line: C.gold, linePt: 1.3 });
    addText(slide, d.decision, { x: 1.5, y: 2.72, w: 10.35, h: 2.38, fontFace: F.heading, fontSize: 20, color: C.navy950, align: 'center', valign: 'mid' });
    addText(slide, 'Kính đề nghị Hội đồng xem xét và cho ý kiến.', { x: 1.5, y: 6.08, w: 10.35, h: 0.4, fontSize: 18, bold: true, color: C.white, align: 'center' });
    addNotes(slide, d);
  }


  function gateDetails(slide, d) {
    addCommon(slide, pptx, d);
    d.rows.forEach((r, i) => {
      const y = 2.22 + i * 0.95;
      addPanel(slide, pptx, { x: 0.72, y, w: 12, h: 0.74, fill: C.white, line: C.line });
      addText(slide, r[0], { x: 0.98, y: y + 0.17, w: 3.45, h: 0.32, fontSize: 15, bold: true, color: C.navy950 });
      addText(slide, r[1], { x: 4.72, y: y + 0.17, w: 1.1, h: 0.32, fontSize: 14.5, bold: true, color: r[1] === 'Blocked' ? C.warning : C.slate, align: 'center' });
      addText(slide, r[2], { x: 6.1, y: y + 0.13, w: 6.1, h: 0.4, fontSize: 15.5, color: C.ink });
    });
  }

  function qa(slide, d) {
    addCommon(slide, pptx, d);
    d.questions.forEach((q, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 0.72 + col * 6.12, y = 2.18 + row * 1.28;
      addPanel(slide, pptx, { x, y, w: 5.82, h: 1.0, fill: C.white, line: C.line });
      addText(slide, String(i + 1).padStart(2, '0'), { x: x + 0.18, y: y + 0.3, w: 0.45, h: 0.28, fontSize: 15, bold: true, color: C.gold, align: 'center' });
      addText(slide, q, { x: x + 0.82, y: y + 0.18, w: 4.65, h: 0.58, fontSize: 17, bold: true, color: C.navy950, valign: 'mid' });
    });
  }

  return { cover, decision, gateDetails, qa };
};
