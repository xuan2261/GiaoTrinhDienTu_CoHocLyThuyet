'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const PptxGenJS = require('pptxgenjs');
const { meta, slides } = require('./acceptance-deck-content');
const { C, F, addText, addPanel, addMetric, addImageCard, addNotes, addCommon } = require('./acceptance-deck-theme');
const buildSpecialSlides = require('./acceptance-deck-special-slides');
const { buildWebArtifacts } = require('./build-acceptance-web');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Nhóm tác giả biên soạn Giáo trình điện tử Cơ học lý thuyết';
pptx.company = 'Dự án Giáo trình điện tử Cơ học lý thuyết';
pptx.subject = meta.subject;
pptx.title = meta.title;
pptx.lang = 'vi-VN';
pptx.theme = { headFontFace: F.heading, bodyFontFace: F.body, lang: 'vi-VN' };
pptx.defineSlideMaster({
  title: 'CONTENT',
  background: { color: C.paper },
  objects: [
    {
      placeholder: {
        options: {
          name: 'slideTitle',
          type: 'title',
          x: 0.67,
          y: 0.68,
          w: 12.0,
          h: 0.78,
          fontFace: F.heading,
          fontSize: 36,
          bold: true,
          color: C.navy950,
          margin: 0,
          valign: 'mid',
        },
        text: '',
      },
    },
  ],
});

const out = process.argv[2] || 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pptx';
const webOut = process.argv[3] || path.dirname(out);
fs.mkdirSync(path.dirname(out), { recursive: true });
const abs = relativePath => path.resolve(relativePath);
const special = buildSpecialSlides(pptx);
const line = (slide, x, y, w, color = C.line, pt = 1) => slide.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color, pt } });

function bullets(slide, items, x, y, w, size = 18, color = C.ink, gap = 0.68) {
  items.forEach((item, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x, y: y + i * gap + 0.15, w: 0.1, h: 0.1, fill: { color: C.gold }, line: { color: C.gold, pt: 0 } });
    addText(slide, item, { x: x + 0.24, y: y + i * gap, w: w - 0.24, h: 0.52, fontSize: size, color, valign: 'mid' });
  });
}

function outcomes(slide, data) {
  addCommon(slide, pptx, data);
  data.outcomes.forEach((row, i) => {
    const col = i % 2;
    const gridRow = Math.floor(i / 2);
    const x = 0.72 + col * 6.12;
    const y = 2.18 + gridRow * 1.86;
    const accent = [C.blue, C.green, C.purple, C.gold][i];
    addPanel(slide, pptx, { x, y, w: 5.82, h: 1.58, fill: C.white, line: accent, linePt: 1.1 });
    addText(slide, row[0], { x: x + 0.24, y: y + 0.14, w: 4.45, h: 0.22, fontSize: 11.5, bold: true, color: accent });
    addText(slide, row[1], { x: x + 0.24, y: y + 0.4, w: 4.65, h: 0.38, fontFace: F.heading, fontSize: 18.5, bold: true, color: C.navy950 });
    addText(slide, row[2], { x: x + 0.24, y: y + 0.83, w: 5.34, h: 0.58, fontSize: row[2].length > 150 ? 11.5 : 12.5, color: C.ink, valign: 'mid' });
    addText(slide, row[3] === 'provisional' ? 'SƠ BỘ' : row[3].toUpperCase(), { x: x + 4.87, y: y + 0.16, w: 0.68, h: 0.24, fontSize: 10, bold: true, color: C.warning, align: 'right' });
  });
  addPanel(slide, pptx, { x: 1.2, y: 5.98, w: 10.9, h: 0.48, fill: 'FFF4E8', line: C.warning });
  addText(slide, data.notice, { x: 1.5, y: 6.1, w: 10.3, h: 0.24, fontSize: 15.5, bold: true, color: C.warning, align: 'center' });
}

function problemSolution(slide, data) {
  addCommon(slide, pptx, data);
  addText(slide, 'ĐIỂM CẦN HỖ TRỢ', { x: 0.78, y: 2.2, w: 5.6, h: 0.3, fontSize: 13, bold: true, color: C.danger, align: 'center' });
  addText(slide, 'CÁCH SẢN PHẨM ĐÁP ỨNG', { x: 6.96, y: 2.2, w: 5.6, h: 0.3, fontSize: 13, bold: true, color: C.success, align: 'center' });
  data.problems.forEach((problem, i) => {
    const y = 2.66 + i * 0.89;
    addPanel(slide, pptx, { x: 0.72, y, w: 5.72, h: 0.72, fill: 'FFF7F5', line: C.danger });
    addText(slide, problem[0], { x: 0.98, y: y + 0.1, w: 2.1, h: 0.26, fontSize: 16.5, bold: true, color: C.navy950 });
    addText(slide, problem[1], { x: 3.12, y: y + 0.09, w: 3.0, h: 0.42, fontSize: 14.5, color: C.slate, valign: 'mid' });
    slide.addShape(pptx.ShapeType.chevron, { x: 6.57, y: y + 0.22, w: 0.25, h: 0.28, fill: { color: C.gold }, line: { color: C.gold, pt: 0 } });
    const solution = data.solutions[i];
    addPanel(slide, pptx, { x: 6.92, y, w: 5.72, h: 0.72, fill: 'F3FAF6', line: C.success });
    addText(slide, solution[0], { x: 7.18, y: y + 0.1, w: 2.15, h: 0.26, fontSize: 16.5, bold: true, color: C.navy950 });
    addText(slide, solution[1], { x: 9.36, y: y + 0.09, w: 3.0, h: 0.42, fontSize: 14.5, color: C.slate, valign: 'mid' });
  });
}

function coverage(slide, data) {
  addCommon(slide, pptx, data);
  data.metrics.forEach((metric, i) => addMetric(slide, pptx, metric[0], metric[1], 0.72 + i * 1.72, 2.18, 1.52, [C.blue, C.green, C.purple, C.gold][i]));
  data.chapters.forEach((chapter, i) => {
    const y = 3.75 + i * 0.78;
    const color = [C.blue, C.green, C.purple][i];
    addPanel(slide, pptx, { x: 0.72, y, w: 6.6, h: 0.62, fill: C.white, line: color });
    addText(slide, chapter[0], { x: 0.92, y: y + 0.1, w: 0.55, h: 0.32, fontSize: 21, bold: true, color, align: 'center' });
    addText(slide, chapter[1], { x: 1.55, y: y + 0.1, w: 1.78, h: 0.28, fontSize: 16.5, bold: true, color: C.navy950 });
    addText(slide, chapter[2], { x: 3.38, y: y + 0.09, w: 3.62, h: 0.34, fontSize: 14.8, color: C.slate, valign: 'mid' });
  });
  addText(slide, `+ ${data.supportingRoutes} mục tra cứu bổ trợ`, { x: 0.95, y: 6.18, w: 5.95, h: 0.28, fontSize: 15, bold: true, color: C.navy800, align: 'center' });
  addImageCard(slide, pptx, abs(data.image), 7.62, 2.18, 5.0, 4.38, 'Hình vẽ kỹ thuật · ví dụ hệ lực không gian');
}

function journey(slide, data) {
  addCommon(slide, pptx, data);
  const nodes = [
    { x: 0.82, y: 2.63 }, { x: 3.44, y: 2.63 }, { x: 6.06, y: 2.63 },
    { x: 6.06, y: 4.75 }, { x: 3.44, y: 4.75 },
  ];
  const arrow = (x, y, w, h, reverse = false) => slide.addShape(pptx.ShapeType.line, {
    x, y, w, h, line: { color: C.gold, pt: 2, [reverse ? 'beginArrowType' : 'endArrowType']: 'triangle' },
  });
  arrow(3.06, 3.34, 0.38, 0);
  arrow(5.68, 3.34, 0.38, 0);
  arrow(7.18, 4.03, 0, 0.72);
  arrow(5.68, 5.46, 0.38, 0, true);
  slide.addShape(pptx.ShapeType.line, { x: 3.22, y: 5.46, w: 0.22, h: 0, line: { color: C.blue, pt: 1.8 } });
  slide.addShape(pptx.ShapeType.line, { x: 3.22, y: 4.38, w: 0, h: 1.08, line: { color: C.blue, pt: 1.8 } });
  slide.addShape(pptx.ShapeType.line, { x: 3.22, y: 4.38, w: 1.34, h: 0, line: { color: C.blue, pt: 1.8 } });
  slide.addShape(pptx.ShapeType.line, { x: 4.56, y: 4.03, w: 0, h: 0.35, line: { color: C.blue, pt: 1.8, beginArrowType: 'triangle' } });
  data.steps.forEach((step, i) => {
    const { x, y } = nodes[i];
    const accent = i === 4 ? C.blue : C.navy700;
    addPanel(slide, pptx, { x, y, w: 2.24, h: 1.4, fill: i === 4 ? 'E3F1F6' : C.white, line: accent, linePt: 1.2 });
    addText(slide, step[0], { x: x + 0.15, y: y + 0.14, w: 0.42, h: 0.3, fontSize: 17, bold: true, color: C.gold, align: 'center' });
    addText(slide, step[1], { x: x + 0.57, y: y + 0.12, w: 1.55, h: 0.48, fontSize: 17, bold: true, color: C.navy950, valign: 'mid' });
    addText(slide, step[2], { x: x + 0.17, y: y + 0.67, w: 1.9, h: 0.61, fontSize: 13.5, color: C.slate, valign: 'mid' });
  });
  addText(slide, 'QUAY LẠI NỘI DUNG', { x: 0.88, y: 5.1, w: 2.1, h: 0.42, fontSize: 13, bold: true, color: C.blue, align: 'right', valign: 'mid' });
  addImageCard(slide, pptx, abs(data.image), 8.66, 2.66, 3.96, 3.46, 'Giao diện giáo trình · ảnh chụp hiện vật');
}

function scientificSample(slide, data) {
  addCommon(slide, pptx, data);
  const sample = data.sample;
  const accent = sample.id === 'ch1-6-3' ? C.blue : sample.id === 'ch2-4-4' ? C.green : C.purple;
  const focusedImage = data.image.replace(/\.png$/i, '-focus.png');
  addImageCard(slide, pptx, abs(data.diagram.replace(/\.svg$/, '.png')), 0.72, 2.18, 4.15, 4.42, 'Sơ đồ nguyên lý · minh họa, không theo tỉ lệ');
  addImageCard(slide, pptx, abs(focusedImage), 5.05, 2.18, 7.57, 3.0, `${sample.route} · mô phỏng và giá trị hiển thị`);
  addPanel(slide, pptx, { x: 5.05, y: 5.38, w: 7.57, h: 1.24, fill: C.white, line: accent, linePt: 1.2 });
  addText(slide, sample.chapter.toUpperCase(), { x: 5.28, y: 5.52, w: 2.16, h: 0.18, fontSize: 9.8, bold: true, color: accent });
  addText(slide, sample.title, { x: 5.28, y: 5.72, w: 2.35, h: 0.34, fontFace: F.heading, fontSize: 14.5, bold: true, color: C.navy950, valign: 'mid' });
  addPanel(slide, pptx, { x: 7.78, y: 5.53, w: 2.62, h: 0.54, fill: 'EEF2F7', line: C.line });
  addText(slide, sample.formula, { x: 7.92, y: 5.67, w: 2.34, h: 0.24, fontFace: F.heading, fontSize: 13.8, bold: true, color: C.navy800, align: 'center', valign: 'mid' });
  addPanel(slide, pptx, { x: 10.55, y: 5.53, w: 1.8, h: 0.54, fill: 'FFF8ED', line: C.warning });
  addText(slide, data.reviewBoundary, { x: 10.67, y: 5.65, w: 1.56, h: 0.26, fontSize: 8.4, italic: true, bold: true, color: C.warning, align: 'center', valign: 'mid' });
  addText(slide, 'ĐIỂM ĐỐI CHIẾU', { x: 5.3, y: 6.17, w: 1.55, h: 0.17, fontSize: 9.2, bold: true, color: C.slate });
  addText(slide, sample.check, { x: 6.82, y: 6.09, w: 5.26, h: 0.36, fontSize: sample.check.length > 120 ? 9.6 : sample.check.length > 95 ? 10.3 : 11.3, color: C.ink, valign: 'mid' });
}

function demoMain(slide, data) {
  addCommon(slide, pptx, data);
  addImageCard(slide, pptx, abs(data.image), 0.72, 2.14, 7.35, 4.44, 'Mô men của lực · ảnh dự phòng khi không demo trực tiếp');
  addPanel(slide, pptx, { x: 8.32, y: 2.14, w: 4.3, h: 0.72, fill: C.navy950, line: C.gold, linePt: 1.1 });
  addText(slide, data.formula, { x: 8.55, y: 2.34, w: 3.84, h: 0.32, fontFace: F.heading, fontSize: 18, bold: true, color: C.goldLight, align: 'center', valign: 'mid' });
  data.steps.forEach((step, i) => {
    const y = 3.02 + i * 0.69;
    addText(slide, step[0], { x: 8.34, y: y + 0.12, w: 1.1, h: 0.24, fontSize: 11.5, bold: true, color: C.gold, align: 'center' });
    addPanel(slide, pptx, { x: 9.52, y, w: 3.1, h: 0.56, fill: i === 2 ? 'EEF7F2' : C.white, line: i === 2 ? C.success : C.line });
    addText(slide, step[1], { x: 9.7, y: y + 0.07, w: 1.0, h: 0.24, fontSize: 15.5, bold: true, color: C.navy950 });
    addText(slide, step[2], { x: 10.74, y: y + 0.06, w: 1.7, h: 0.34, fontSize: 13.2, color: C.slate, valign: 'mid' });
  });
}

function validation(slide, data) {
  addCommon(slide, pptx, data);
  addText(slide, 'MẪU VÀ THAO TÁC XEM XÉT', { x: 0.82, y: 2.23, w: 5.56, h: 0.27, fontSize: 13, bold: true, color: C.navy700 });
  addText(slide, 'KẾT LUẬN GIỚI HẠN · CHƯA THẨM ĐỊNH ĐỘC LẬP', { x: 7.02, y: 2.23, w: 5.56, h: 0.27, fontSize: 12.5, bold: true, color: C.warning });
  slide.addShape(pptx.ShapeType.line, { x: 6.68, y: 2.27, w: 0, h: 2.48, line: { color: C.warning, pt: 1.6, dashType: 'dash' } });
  const xs = [0.78, 3.78, 6.98, 9.98];
  data.layers.forEach((layer, i) => {
    const x = xs[i];
    const color = [C.navy700, C.blue, C.warning, C.purple][i];
    addPanel(slide, pptx, { x, y: 2.66, w: 2.58, h: 2.08, fill: i > 1 ? 'FFF8ED' : C.white, line: color, linePt: 1.2 });
    addText(slide, layer[0], { x: x + 0.17, y: 2.81, w: 0.36, h: 0.42, fontSize: 24, bold: true, color, align: 'center' });
    addText(slide, layer[1], { x: x + 0.57, y: 2.82, w: 1.85, h: 0.58, fontFace: F.heading, fontSize: 17, bold: true, color: C.navy950, valign: 'mid' });
    addText(slide, layer[2], { x: x + 0.2, y: 3.56, w: 2.18, h: 0.94, fontSize: 15.5, color: C.ink, valign: 'mid' });
    if (i < data.layers.length - 1) slide.addShape(pptx.ShapeType.line, {
      x: x + 2.58, y: 3.71, w: xs[i + 1] - x - 2.58, h: 0,
      line: { color: i === 1 ? C.warning : C.gold, pt: 1.6, endArrowType: 'triangle' },
    });
  });
  addText(slide, '3 ca · mỗi chương 1 ca', { x: 0.85, y: 4.87, w: 3.36, h: 0.26, fontSize: 14, bold: true, color: C.blue });
  addText(slide, 'RANH GIỚI: không suy rộng ngoài mẫu đã xem', { x: 5.06, y: 4.87, w: 7.48, h: 0.26, fontSize: 14, bold: true, color: C.warning, align: 'right' });
  addPanel(slide, pptx, { x: 0.72, y: 5.26, w: 12, h: 1.54, fill: 'FFF4E8', line: C.warning });
  addText(slide, 'GIỚI HẠN KẾT LUẬN', { x: 0.98, y: 5.38, w: 3.1, h: 0.26, fontSize: 13, bold: true, color: C.warning });
  data.limitations.forEach((limitation, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x: 1.02, y: 5.75 + i * 0.34, w: 0.08, h: 0.08, fill: { color: C.warning }, line: { color: C.warning, pt: 0 } });
    addText(slide, limitation, { x: 1.2, y: 5.67 + i * 0.34, w: 11.18, h: 0.3, fontSize: 14.2, color: C.ink, valign: 'mid' });
  });
}

function evidence(slide, data) {
  addCommon(slide, pptx, data);
  addText(slide, 'NGUỒN CÓ THỂ MỞ', { x: 0.84, y: 2.22, w: 4.0, h: 0.26, fontSize: 13, bold: true, color: C.navy700 });
  addText(slide, 'NHÓM CĂN CỨ CÓ THỂ ĐỐI CHIẾU', { x: 5.48, y: 2.22, w: 6.9, h: 0.26, fontSize: 13, bold: true, color: C.navy700 });
  const sourceLabels = [
    'Danh mục nội dung\nĐối chiếu nguồn DOCX',
    'Bản đồ công thức\nĐặc tả mô phỏng',
    'Ngân hàng câu hỏi\nPhản hồi cho người học',
    'Ảnh, tài liệu kèm theo\nHồ sơ ký xác nhận',
  ];
  data.evidence.forEach((item, i) => {
    const y = 2.62 + i * 0.82;
    const color = [C.blue, C.green, C.purple, C.gold][i];
    slide.addShape(pptx.ShapeType.line, { x: 4.84, y: y + 0.35, w: 0.56, h: 0, line: { color, pt: 1.8, endArrowType: 'triangle' } });
    addPanel(slide, pptx, { x: 0.78, y, w: 4.06, h: 0.7, fill: C.white, line: C.line });
    addText(slide, sourceLabels[i], { x: 1.02, y: y + 0.06, w: 3.62, h: 0.57, fontSize: i === 2 ? 12.3 : 13.4, color: C.ink, valign: 'mid' });
    addPanel(slide, pptx, { x: 5.4, y, w: 7.18, h: 0.7, fill: C.white, line: color, linePt: 1.2 });
    addText(slide, item[0], { x: 5.62, y: y + 0.18, w: 1.26, h: 0.31, fontSize: 17, bold: true, color: C.navy950 });
    addText(slide, item[1], { x: 7.04, y: y + 0.09, w: 5.28, h: 0.51, fontSize: 15.4, color: C.slate, valign: 'mid' });
  });
  addText(slide, 'Mũi tên = truy vết nguồn → căn cứ; không biểu thị thẩm định, ký duyệt hay đo hiệu quả.', {
    x: 0.84, y: 5.98, w: 11.76, h: 0.27, fontSize: 13.4, bold: true, color: C.warning,
  });
  addPanel(slide, pptx, { x: 0.78, y: 6.35, w: 11.8, h: 0.44, fill: 'EEF2F7', line: C.line });
  data.metrics.forEach((metric, i) => {
    const x = 0.98 + i * 2.9;
    addText(slide, metric[0], { x, y: 6.43, w: 0.74, h: 0.25, fontSize: 17, bold: true, color: [C.blue, C.green, C.purple, C.gold][i] });
    addText(slide, metric[1], { x: x + 0.79, y: 6.46, w: 1.98, h: 0.2, fontSize: 11.5, color: C.ink, valign: 'mid' });
  });
}

function resultLimits(slide, data) {
  addCommon(slide, pptx, data);
  addText(slide, 'KẾT QUẢ ĐÃ CÓ', { x: 0.82, y: 2.2, w: 5.7, h: 0.28, fontSize: 13, bold: true, color: C.success, align: 'center' });
  addText(slide, 'GIỚI HẠN CÒN LẠI', { x: 6.82, y: 2.2, w: 5.7, h: 0.28, fontSize: 13, bold: true, color: C.warning, align: 'center' });
  data.results.forEach((item, i) => {
    const y = 2.67 + i * 1.08;
    addPanel(slide, pptx, { x: 0.72, y, w: 5.82, h: 0.88, fill: 'F3FAF6', line: C.success, linePt: 1.1 });
    addText(slide, item[0], { x: 0.98, y: y + 0.13, w: 1.35, h: 0.3, fontSize: 18, bold: true, color: C.success });
    addText(slide, item[1], { x: 2.35, y: y + 0.08, w: 3.85, h: 0.58, fontSize: 14.5, color: C.navy950, valign: 'mid' });
  });
  data.limitations.forEach((item, i) => {
    const y = 2.67 + i * 0.82;
    addPanel(slide, pptx, { x: 6.8, y, w: 5.82, h: 0.66, fill: 'FFF8ED', line: C.warning });
    addText(slide, String(i + 1).padStart(2, '0'), { x: 7.0, y: y + 0.14, w: 0.42, h: 0.26, fontSize: 15, bold: true, color: C.warning, align: 'center' });
    addText(slide, item, { x: 7.58, y: y + 0.08, w: 4.72, h: 0.42, fontSize: 15, color: C.ink, valign: 'mid' });
  });
  addPanel(slide, pptx, { x: 0.72, y: 6.12, w: 11.9, h: 0.48, fill: 'EEF2F7', line: C.line });
  addText(slide, 'Báo cáo nêu rõ phần đã xây dựng và phần cần tiếp tục kiểm chứng.', { x: 1.1, y: 6.22, w: 11.1, h: 0.24, fontSize: 15.5, bold: true, color: C.navy800, align: 'center' });
}

function readiness(slide, data) {
  addCommon(slide, pptx, data);
  const summary = data.summary;
  const stateLabels = data.stateLabels || ['PASS', 'FAIL', 'BLOCKED', 'NOT RUN'];
  const states = [
    [stateLabels[0], summary.pass, C.success],
    [stateLabels[1], summary.fail, C.danger],
    [stateLabels[2], summary.blocked, C.warning],
    [stateLabels[3], summary.notRun, C.slate],
  ];
  states.forEach((state, i) => addMetric(slide, pptx, String(state[1]), state[0], 0.72 + i * 1.72, 2.18, 1.5, state[2]));
  addPanel(slide, pptx, { x: 7.82, y: 2.18, w: 4.8, h: 1.16, fill: data.overallStatus === 'pass' ? 'EEF7F2' : 'FFF4E8', line: data.overallStatus === 'pass' ? C.success : C.warning, linePt: 1.2 });
  addText(slide, data.statusLabel || 'TRẠNG THÁI SNAPSHOT', { x: 8.12, y: 2.38, w: 2.2, h: 0.24, fontSize: 12, bold: true, color: C.slate });
  addText(slide, data.overallDisplay || String(data.overallStatus).toUpperCase(), { x: 10.05, y: 2.31, w: 2.22, h: 0.4, fontSize: 20, bold: true, color: data.overallStatus === 'pass' ? C.success : C.danger, align: 'right' });
  data.actions.forEach((action, i) => {
    const y = 3.72 + i * 0.66;
    addText(slide, action[0], { x: 0.82, y: y + 0.11, w: 0.5, h: 0.28, fontSize: 16, bold: true, color: C.gold, align: 'center' });
    addPanel(slide, pptx, { x: 1.46, y, w: 11.16, h: 0.56, fill: C.white, line: C.line });
    addText(slide, action[1], { x: 1.7, y: y + 0.08, w: 3.0, h: 0.28, fontSize: 16, bold: true, color: C.navy950 });
    addText(slide, action[2], { x: 4.8, y: y + 0.07, w: 7.5, h: 0.32, fontSize: 14.5, color: C.slate, valign: 'mid' });
  });
}

function gates(slide, data) {
  addCommon(slide, pptx, data);
  const summary = data.summary;
  const total = summary.total;
  const barX = 0.85;
  const barY = 2.42;
  const barW = 7.2;
  let currentX = barX;
  [[summary.pass, C.success], [summary.fail, C.danger], [summary.blocked, C.warning], [summary.notRun, C.slate]].forEach(([value, color]) => {
    if (!value) return;
    const width = barW * value / total;
    slide.addShape(pptx.ShapeType.rect, { x: currentX, y: barY, w: width, h: 0.58, fill: { color }, line: { color, pt: 0 } });
    currentX += width;
  });
  addText(slide, `${summary.pass} ĐẠT CHUẨN`, { x: 1.0, y: 2.54, w: 2.0, h: 0.24, fontSize: 12.5, bold: true, color: C.white });
  addText(slide, `${summary.blocked} CHỜ ĐÁNH GIÁ`, { x: 5.8, y: 2.54, w: 2.1, h: 0.24, fontSize: 11, bold: true, color: C.white, align: 'right' });
  addText(slide, `${total} tiêu chí chất lượng · kiểm tra thực tế, không dùng % làm điểm số`, { x: 0.85, y: 3.18, w: 7.2, h: 0.3, fontSize: 15.5, color: C.slate, align: 'center' });
  data.gates.forEach((gate, i) => {
    const y = 3.72 + i * 0.64;
    const color = [C.success, C.danger, C.warning, C.slate][i];
    addText(slide, gate[0], { x: 0.92, y, w: 1.45, h: 0.3, fontSize: 13, bold: true, color });
    addText(slide, String(gate[1]), { x: 2.42, y: y - 0.03, w: 0.58, h: 0.34, fontSize: 20, bold: true, color: C.navy950, align: 'center' });
    addText(slide, gate[2], { x: 3.15, y, w: 4.65, h: 0.34, fontSize: 16, color: C.ink });
  });
  addPanel(slide, pptx, { x: 8.48, y: 2.18, w: 4.12, h: 3.9, fill: 'FFF4E8', line: C.warning });
  addText(slide, 'TRẠNG THÁI HỒ SƠ', { x: 8.86, y: 2.54, w: 3.36, h: 0.3, fontSize: 13, bold: true, color: C.warning, align: 'center' });
  addText(slide, 'CHỜ THẨM ĐỊNH', { x: 8.82, y: 3.05, w: 3.44, h: 0.62, fontSize: 26, bold: true, color: C.danger, align: 'center' });
  addText(slide, '4 nội dung đang chờ chuyên gia và người học độc lập thẩm định.', { x: 9.0, y: 4.0, w: 3.05, h: 0.9, fontSize: 17, color: C.navy950, align: 'center', valign: 'mid' });
}

function conditions(slide, data) {
  addCommon(slide, pptx, data);
  data.conditions.forEach((condition, i) => {
    const y = 2.12 + i * 0.73;
    addText(slide, condition[0], { x: 0.78, y: y + 0.12, w: 0.42, h: 0.32, fontSize: 18, bold: true, color: C.gold, align: 'center' });
    addPanel(slide, pptx, { x: 1.38, y, w: 11.18, h: 0.59, fill: C.white, line: C.navy700 });
    addText(slide, condition[1], { x: 1.68, y: y + 0.08, w: 3.6, h: 0.32, fontSize: 16.5, bold: true, color: C.navy700 });
    addText(slide, condition[2], { x: 5.4, y: y + 0.07, w: 6.7, h: 0.35, fontSize: condition[2].length > 85 ? 13.2 : 14.8, color: C.ink });
  });
  addText(slide, 'BA CÂU HỎI ĐẠI DIỆN ĐỂ GÓP Ý', { x: 1.38, y: 5.1, w: 11.18, h: 0.22, fontSize: 11.5, bold: true, color: C.gold, align: 'center' });
  data.quizExamples.forEach((example, i) => {
    const x = 1.38 + i * 3.79;
    addPanel(slide, pptx, { x, y: 5.34, w: 3.55, h: 0.96, fill: 'F8FAFC', line: C.line });
    addText(slide, example[0].toUpperCase(), { x: x + 0.14, y: 5.43, w: 1.3, h: 0.18, fontSize: 9.1, bold: true, color: [C.blue, C.green, C.purple][i] });
    addText(slide, example[1], { x: x + 0.14, y: 5.64, w: 3.27, h: 0.34, fontSize: example[1].length > 55 ? 9.2 : 10.2, bold: true, color: C.navy950 });
    addText(slide, `Đáp án: ${example[2]}`, { x: x + 0.14, y: 6.03, w: 3.27, h: 0.18, fontSize: 8.5, color: C.slate });
  });
  addText(slide, data.nextStep, { x: 1.58, y: 6.43, w: 10.78, h: 0.2, fontSize: 11.8, bold: true, color: C.success, align: 'center' });
}

function authors(slide, data) {
  addCommon(slide, pptx, data);
  data.authors.forEach((author, i) => {
    const y = 2.18 + i * 0.91;
    addPanel(slide, pptx, { x: 0.72, y, w: 12, h: 0.74, fill: i === 0 ? 'EEF2F7' : C.white, line: C.line });
    addText(slide, String(i + 1).padStart(2, '0'), { x: 0.94, y: y + 0.19, w: 0.5, h: 0.3, fontSize: 18, bold: true, color: C.gold, align: 'center' });
    addText(slide, author, { x: 1.68, y: y + 0.12, w: 5.75, h: 0.4, fontSize: 18, bold: true, color: C.navy950 });
    addText(slide, data.responsibilities[i], { x: 7.45, y: y + 0.12, w: 4.85, h: 0.4, fontSize: 17, color: C.ink, align: 'right' });
  });
  data.scopeMetrics.forEach((metric, i) => addMetric(slide, pptx, metric[0], metric[1], 0.72 + i * 2.05, 5.18, 1.82, C.navy800));
  addPanel(slide, pptx, { x: 7.12, y: 5.18, w: 5.6, h: 1.16, fill: C.navy950, line: C.navy950 });
  addText(slide, 'NGUỒN CHUẨN', { x: 7.42, y: 5.38, w: 1.55, h: 0.25, fontSize: 12, bold: true, color: C.goldLight });
  addText(slide, 'CoHocLyThuyet_Full_New.docx', { x: 8.95, y: 5.32, w: 3.38, h: 0.34, fontSize: 18, bold: true, color: C.white, align: 'right' });
  addText(slide, '→ HTML · PDF · package', { x: 7.42, y: 5.8, w: 4.9, h: 0.3, fontSize: 16.5, color: C.white, align: 'right' });
}

function processFlow(slide, data) {
  addCommon(slide, pptx, data);
  data.nodes.forEach((node, i) => {
    const x = 0.72 + i * 2.42;
    addPanel(slide, pptx, { x, y: 2.36, w: 1.82, h: 1.12, fill: i === 4 ? C.navy950 : C.white, line: i === 4 ? C.navy950 : C.navy700 });
    addText(slide, node, { x: x + 0.1, y: 2.6, w: 1.62, h: 0.52, fontSize: 17, bold: true, color: i === 4 ? C.white : C.navy950, align: 'center', valign: 'mid' });
    if (i < data.nodes.length - 1) {
      line(slide, x + 1.86, 2.92, 0.5, C.gold, 2);
      slide.addShape(pptx.ShapeType.chevron, { x: x + 2.23, y: 2.8, w: 0.18, h: 0.24, fill: { color: C.gold }, line: { color: C.gold, pt: 0 } });
    }
  });
  bullets(slide, data.facts, 1.0, 4.38, 11.6, 18, C.ink, 0.72);
}

function methodology(slide, data) {
  addCommon(slide, pptx, data);
  data.nodes.forEach((node, i) => {
    const x = 0.72 + i * 2.46;
    const final = i === data.nodes.length - 1;
    addPanel(slide, pptx, { x, y: 2.18, w: 2.1, h: 0.74, fill: final ? C.navy950 : C.white, line: C.navy700 });
    addText(slide, node, { x: x + 0.12, y: 2.25, w: 1.86, h: 0.6, fontSize: 16.5, bold: true, color: final ? C.white : C.navy950, align: 'center', valign: 'mid' });
    if (!final) slide.addShape(pptx.ShapeType.line, {
      x: x + 2.17, y: 2.55, w: 0.22, h: 0,
      line: { color: C.gold, pt: 1.8, endArrowType: 'triangle' },
    });
  });
  data.cards.forEach(([title, body], i) => {
    const x = 0.72 + (i % 2) * 6.1;
    const y = 3.12 + Math.floor(i / 2) * 1.64;
    const accent = [C.blue, C.green, C.purple, C.gold][i];
    addPanel(slide, pptx, { x, y, w: 5.8, h: 1.46, fill: C.white, line: accent, linePt: 1.1 });
    addText(slide, title, { x: x + 0.22, y: y + 0.13, w: 5.36, h: 0.3, fontFace: F.heading, fontSize: 18, bold: true, color: C.navy950 });
    addText(slide, body, { x: x + 0.22, y: y + 0.52, w: 5.36, h: 0.81, fontSize: 16, color: C.ink, valign: 'top' });
  });
  addPanel(slide, pptx, { x: 0.72, y: 6.4, w: 11.9, h: 0.4, fill: 'FFF4E8', line: C.warning });
  addText(slide, data.notice, { x: 0.94, y: 6.48, w: 11.46, h: 0.24, fontSize: 14, bold: true, color: C.warning, align: 'center' });
}

function artifact(slide, data) {
  addCommon(slide, pptx, data);
  data.metrics.forEach((metric, i) => addMetric(slide, pptx, metric[0], metric[1], 0.72 + i * 2.18, 2.22, 1.9, i === 2 ? C.success : C.navy800));
  addPanel(slide, pptx, { x: 7.45, y: 2.18, w: 5.15, h: 2.22, fill: 'EEF7F2', line: C.success, linePt: 1.1 });
  addText(slide, 'THÔNG TIN BẢN ĐANG KIỂM TRA', { x: 7.78, y: 2.42, w: 3.9, h: 0.3, fontSize: 13, bold: true, color: C.success });
  data.hashes.forEach((row, i) => {
    addText(slide, row[0], { x: 7.78, y: 2.86 + i * 0.39, w: 1.9, h: 0.22, fontSize: 10.8, color: C.slate });
    addText(slide, row[1], { x: 9.72, y: 2.82 + i * 0.39, w: 2.62, h: 0.28, fontSize: 12.2, bold: true, color: C.navy950, align: 'right' });
  });
  addPanel(slide, pptx, { x: 0.72, y: 4.58, w: 7.38, h: 1.22, fill: 'FFF8ED', line: C.warning, linePt: 1.1 });
  addText(slide, 'GIẢI THÍCH 09 TRẠNG THÁI “KHÔNG ĐẠT”', { x: 0.98, y: 4.78, w: 6.86, h: 0.24, fontSize: 12, bold: true, color: C.warning, align: 'center' });
  addText(slide, data.failureQualification, { x: 1.02, y: 5.12, w: 6.78, h: 0.48, fontSize: 11.3, color: C.navy950, align: 'center', valign: 'mid' });
  addPanel(slide, pptx, { x: 8.34, y: 4.58, w: 4.26, h: 1.22, fill: C.white, line: C.navy800, linePt: 1.1 });
  addText(slide, 'GÓI CHUYỂN GIAO KÈM THEO', { x: 8.58, y: 4.76, w: 3.78, h: 0.22, fontSize: 11.5, bold: true, color: C.navy800, align: 'center' });
  data.derivatives.forEach((row, i) => {
    addText(slide, row[0], { x: 8.58, y: 5.08 + i * 0.34, w: 1.38, h: 0.2, fontSize: 10.5, bold: true, color: C.navy950 });
    addText(slide, row[2], { x: 9.95, y: 5.04 + i * 0.34, w: 2.4, h: 0.26, fontSize: 8.7, color: C.slate, align: 'right' });
  });
  addText(slide, 'Quyết định vẫn là không chấp thuận phát hành cho đến khi chạy lại đủ 24 điều kiện.', { x: 1.1, y: 6.14, w: 11.1, h: 0.28, fontSize: 14.5, bold: true, color: C.danger, align: 'center' });
}

function simulation(slide, data) {
  addCommon(slide, pptx, data);
  const positions = [
    [0.85, 3.3], [2.9, 3.3], [5.0, 3.3], [7.1, 3.3], [9.2, 3.3], [11.15, 3.3],
  ];
  data.nodes.forEach((node, i) => {
    const [x, y] = positions[i];
    const isDecision = i === 2 || i === 4;
    const color = i === 5 ? C.success : i === 3 ? C.gold : C.navy700;
    slide.addShape(isDecision ? pptx.ShapeType.diamond : pptx.ShapeType.roundRect, {
      x,
      y: isDecision ? y - 0.2 : y,
      w: isDecision ? 1.65 : 1.55,
      h: isDecision ? 1.45 : 1.05,
      fill: { color: i === 5 ? 'EEF7F2' : C.white },
      line: { color, pt: 1.2 },
    });
    addText(slide, node, { x: x + 0.08, y: y + (isDecision ? 0.08 : 0.18), w: isDecision ? 1.48 : 1.38, h: 0.62, fontSize: isDecision ? 13.5 : 15, bold: true, color: C.navy950, align: 'center', valign: 'mid' });
    if (i < data.nodes.length - 1) {
      line(slide, x + (isDecision ? 1.68 : 1.58), 3.83, 0.36, C.gold, 1.8);
      slide.addShape(pptx.ShapeType.chevron, { x: x + (isDecision ? 1.93 : 1.83), y: 3.72, w: 0.15, h: 0.22, fill: { color: C.gold }, line: { color: C.gold, pt: 0 } });
    }
  });
  addPanel(slide, pptx, { x: 2.1, y: 5.35, w: 9.15, h: 0.72, fill: 'FFF4E8', line: C.warning });
  addText(slide, 'Mô phỏng 3D chỉ bổ trợ trực quan cho 2D, không phải "4D" và không đòi hỏi máy tính cấu hình cao.', { x: 2.38, y: 5.55, w: 8.6, h: 0.3, fontSize: 17, bold: true, color: C.warning, align: 'center' });
}

const renderers = {
  ...special,
  problemSolution,
  outcomes,
  coverage,
  journey,
  scientificSample,
  demoMain,
  validation,
  evidence,
  resultLimits,
  readiness,
  gates,
  conditions,
  authors,
  process: processFlow,
  methodology,
  artifact,
  simulation,
};

for (const data of slides) {
  const slide = pptx.addSlide('CONTENT');
  const render = renderers[data.type];
  if (!render) throw new Error(`Unknown slide type: ${data.type}`);
  render(slide, data);
}

async function main() {
  await pptx.writeFile({ fileName: out });
  const normalizer = path.resolve(__dirname, 'normalize-pptx-package.py');
  const normalized = spawnSync(process.env.PYTHON || 'python', [normalizer, path.resolve(out)], { cwd: path.resolve(__dirname, '../..'), encoding: 'utf8' });
  if (normalized.status !== 0) throw new Error(normalized.stderr || normalized.stdout || 'PPTX normalization failed');
  buildWebArtifacts(path.resolve(webOut));
  process.stdout.write(JSON.stringify({
    output: out,
    webOutput: webOut,
    total: slides.length,
    slides: slides.length,
    main: slides.filter(slide => !slide.backup).length,
    backup: slides.filter(slide => slide.backup).length,
    totalTime: meta.totalTime,
    sessionTime: meta.sessionTime,
  }));
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
