'use strict';

// All coordinates use one 1280 × 720 scene, shared by native PowerPoint and HTML.
// This keeps the editable deck and its offline/print companions on the same grid.
const fs = require('fs');
const path = require('path');

const C = Object.freeze({
  navy: '0B2545', secondary: '13315C', orange: 'F77F00', paper: 'F5F7FA',
  green: '2E7D32', red: 'C62828', white: 'FFFFFF', ink: '24364A',
  muted: '586B81', line: 'D8E1EB', paleOrange: 'FFF1E1', paleNavy: 'E9EFF6',
});
const F = Object.freeze({ heading: 'Arial', body: 'Arial' });
const SW = 13.333;
const SH = 7.5;
const W = 1280;
const H = 720;
const CONTENT = Object.freeze({ x: 64, y: 232, w: 1152, h: 368 });
const GAP = 22;

function glyphWidth(character) {
  const c = character.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/\s/.test(c)) return 0.29;
  if (/[ilI.,:;!'|]/.test(c)) return 0.26;
  if (/[mwMW@%]/.test(c)) return 0.84;
  if (/[A-ZĐ]/.test(c)) return 0.66;
  if (/[0-9]/.test(c)) return 0.56;
  if (/[-()[\]\/]/.test(c)) return 0.35;
  return 0.53;
}

function textWidth(text, fontSize, bold = false) {
  return Array.from(text).reduce((sum, char) => sum + glyphWidth(char), 0)
    * fontSize * 4 / 3 * (bold ? 1.06 : 1.025);
}

function wrapText(text, width, fontSize, bold = false) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph) { lines.push(''); continue; }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (textWidth(next, fontSize, bold) <= width) { line = next; continue; }
      if (line) { lines.push(line); line = ''; }
      if (textWidth(word, fontSize, bold) <= width) { line = word; continue; }
      for (const character of word) {
        if (line && textWidth(line + character, fontSize, bold) > width) {
          lines.push(line);
          line = '';
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

function addText(scene, text, box, options = {}) {
  const { fontSize = 18, minFontSize = fontSize, bold = false, color = C.ink,
    align = 'left', valign = 'top', lineHeight = 1.14, role = 'body' } = options;
  let size = fontSize;
  let lines = wrapText(text, box.w - 3, size, bold);
  while (size > minFontSize && lines.length * size * 4 / 3 * lineHeight > box.h) {
    size = Math.max(minFontSize, size - 0.5);
    lines = wrapText(text, box.w - 3, size, bold);
  }
  const requiredHeight = lines.length * size * 4 / 3 * lineHeight;
  if (requiredHeight > box.h + 1) {
    throw new Error(`Slide ${scene.id}: ${role} does not fit its text box (${Math.ceil(requiredHeight)}px needed, ${box.h}px available): ${text.slice(0, 110)}`);
  }
  scene.objects.push({ kind: 'text', text: lines.join('\n'), original: text,
    ...box, fontSize: size, bold, color, align, valign, lineHeight, role });
}

function rect(scene, x, y, w, h, fill = C.white, stroke = null, radius = 0) {
  scene.objects.push({ kind: 'shape', shape: radius ? 'roundRect' : 'rect',
    x, y, w, h, fill, stroke, radius });
}

function line(scene, x1, y1, x2, y2, color = C.line, width = 1, arrow = false) {
  scene.objects.push({ kind: 'line', x1, y1, x2, y2, color, width, arrow });
}

function circle(scene, x, y, diameter, fill, stroke = null) {
  scene.objects.push({ kind: 'shape', shape: 'ellipse', x, y, w: diameter,
    h: diameter, fill, stroke, radius: diameter / 2 });
}

function common(scene, data, meta, total, dark = false) {
  scene.background = dark ? C.navy : C.paper;
  const primary = dark ? C.white : C.navy;
  const muted = dark ? 'BCCBDB' : C.muted;
  line(scene, 64, 45, 96, 45, C.orange, 3);
  addText(scene, data.section.toUpperCase(), { x: 108, y: 34, w: 628, h: 22 },
    { fontSize: 10.5, minFontSize: 9, bold: true, color: muted, valign: 'middle', role: 'section label' });
  // Typographic institution mark only: the source repository supplies no official logo.
  addText(scene, meta.institution.toUpperCase(), { x: 766, y: 29, w: 450, h: 40 },
    { fontSize: 10.5, minFontSize: 9, bold: true, color: primary, align: 'right', valign: 'middle', role: 'institution wordmark' });
  if (!dark) {
    addText(scene, data.title, { x: 64, y: 77, w: 1152, h: 94 },
      { fontSize: 34, minFontSize: 30, bold: true, color: C.navy, role: 'slide title' });
    if (data.subtitle) addText(scene, data.subtitle, { x: 64, y: 177, w: 1152, h: 45 },
      { fontSize: 16, color: C.muted, role: 'slide subtitle' });
  }
  rect(scene, 64, 618, 1152, 56, dark ? C.secondary : C.paleOrange);
  rect(scene, 64, 618, 5, 56, C.orange);
  addText(scene, data.takeaway, { x: 86, y: 627, w: 1108, h: 40 },
    { fontSize: 17, minFontSize: 16, bold: true, color: dark ? C.white : C.navy,
      valign: 'middle', role: 'takeaway' });
  line(scene, 64, 688, 1216, 688, dark ? '34516E' : C.line, 0.8);
  addText(scene, `${String(data.id).padStart(2, '0')} / ${total}`, { x: 1114, y: 694, w: 102, h: 17 },
    { fontSize: 9, bold: true, color: muted, align: 'right', role: 'slide number' });
  rect(scene, 0, 716, W, 4, dark ? C.secondary : C.line);
  rect(scene, 0, 716, W * data.id / total, 4, C.orange);
}

function accentColor(value, fallback = C.orange) {
  if (!value) return fallback;
  const names = { navy: C.navy, secondary: C.secondary, orange: C.orange,
    green: C.green, red: C.red, success: C.green, danger: C.red };
  return names[value] || value.replace(/^#/, '').toUpperCase();
}

function cardItems(data, excluded = []) {
  const items = [];
  if (!excluded.includes('cards')) items.push(...(data.cards || []));
  if (!excluded.includes('columns')) items.push(...(data.columns || []).map(column => ({
    title: column.title, body: column.items.join('\n'),
  })));
  if (!excluded.includes('steps')) items.push(...(data.steps || []));
  if (!excluded.includes('metrics')) items.push(...(data.metrics || []).map(metric => ({
    title: `${metric.value} · ${metric.label}`, body: metric.detail,
  })));
  return items;
}

function drawCards(scene, items, box = CONTENT, options = {}) {
  if (!items.length) return;
  const columns = items.length <= 3 ? items.length : items.length === 4 ? 2 : 3;
  const rows = Math.ceil(items.length / columns);
  const width = (box.w - (columns - 1) * GAP) / columns;
  const height = (box.h - (rows - 1) * GAP) / rows;
  items.forEach((card, index) => {
    const x = box.x + (index % columns) * (width + GAP);
    const y = box.y + Math.floor(index / columns) * (height + GAP);
    const color = accentColor(card.color, [C.orange, C.secondary, C.green][index % 3]);
    rect(scene, x, y, width, height, C.white, C.line, 10);
    rect(scene, x + 18, y + 20, 32, 4, color);
    const titleSize = options.compact ? 18 : 20;
    const titleLines = wrapText(card.title, width - 44, titleSize, true).length;
    const titleH = Math.max(31, titleLines * titleSize * 4 / 3 * 1.14 + 3);
    addText(scene, card.title, { x: x + 22, y: y + 38, w: width - 44, h: titleH },
      { fontSize: titleSize, minFontSize: options.compact ? 16 : 18, bold: true, color,
        role: 'card title' });
    addText(scene, card.body, { x: x + 22, y: y + 49 + titleH, w: width - 44,
      h: height - titleH - 68 },
    { fontSize: options.compact ? 16 : 18, minFontSize: 16, color: C.ink, role: 'card body' });
  });
}

function coordinateGrid(scene) {
  // A native line-based diagram, not a raster decoration or fabricated logo.
  for (let x = 838; x <= 1210; x += 31) line(scene, x, 145, x, 573, C.secondary, 0.6);
  for (let y = 145; y <= 573; y += 31) line(scene, 838, y, 1210, y, C.secondary, 0.6);
  const origin = { x: 1018, y: 403 };
  circle(scene, 903, 288, 230, null, '345B7B');
  circle(scene, 943, 328, 150, null, '345B7B');
  line(scene, origin.x, origin.y, 1180, origin.y, '87A8C6', 1.8, true);
  line(scene, origin.x, origin.y, origin.x, 207, '87A8C6', 1.8, true);
  line(scene, origin.x, origin.y, 907, 506, '87A8C6', 1.8, true);
  line(scene, origin.x, origin.y, 1135, 270, C.orange, 5, true);
  line(scene, 1135, 270, 1135, 403, '526F8F', 1.2);
  line(scene, 1018, 270, 1135, 270, '526F8F', 1.2);
  circle(scene, origin.x - 5, origin.y - 5, 10, C.orange);
  addText(scene, 'x', { x: 1184, y: 392, w: 24, h: 27 }, { fontSize: 16, color: 'BCCBDB' });
  addText(scene, 'y', { x: 1008, y: 177, w: 24, h: 27 }, { fontSize: 16, color: 'BCCBDB' });
  addText(scene, 'z', { x: 884, y: 506, w: 24, h: 27 }, { fontSize: 16, color: 'BCCBDB' });
  addText(scene, 'F', { x: 1146, y: 250, w: 32, h: 36 }, { fontSize: 20, bold: true, color: C.orange });
}

function cinematic(scene, data, meta) {
  coordinateGrid(scene);
  addText(scene, data.title, { x: 64, y: 143, w: 738, h: 178 },
    { fontSize: 36, minFontSize: 30, bold: true, color: C.white, role: 'cinematic title' });
  if (data.subtitle) addText(scene, data.subtitle, { x: 64, y: 340, w: 730, h: 84 },
    { fontSize: 20, minFontSize: 18, color: 'CCD8E5', role: 'cinematic subtitle' });
  const supplemental = cardItems(data);
  if (supplemental.length) {
    const content = supplemental.map(item => `${item.title}${item.body ? ` — ${item.body}` : ''}`).join('\n');
    addText(scene, content, { x: 64, y: 444, w: 738, h: 151 },
      { fontSize: 18, minFontSize: 16, color: 'CCD8E5', role: 'cinematic supporting content' });
  } else {
    addText(scene, meta.authors.join('\n'), { x: 64, y: 454, w: 738, h: 99 },
      { fontSize: 18, minFontSize: 16, bold: true, color: C.white, role: 'authors' });
    addText(scene, meta.date, { x: 64, y: 557, w: 300, h: 30 },
      { fontSize: 16, color: 'BCCBDB', role: 'presentation date' });
  }
}

function metrics(scene, data) {
  const items = data.metrics;
  const supporting = cardItems(data, ['metrics']);
  const height = supporting.length ? 208 : CONTENT.h;
  const width = (CONTENT.w - (items.length - 1) * GAP) / items.length;
  items.forEach((metric, index) => {
    const x = CONTENT.x + index * (width + GAP);
    rect(scene, x, CONTENT.y, width, height, C.white, C.line, 10);
    addText(scene, metric.value, { x: x + 18, y: CONTENT.y + 8, w: width - 36, h: 106 },
      { fontSize: 60, minFontSize: 60, bold: true, color: index === 0 ? C.orange : C.navy,
        align: 'center', valign: 'middle', role: 'prominent metric' });
    addText(scene, metric.label, { x: x + 18, y: CONTENT.y + 116, w: width - 36, h: 53 },
      { fontSize: 19, minFontSize: 16, bold: true, color: C.navy, align: 'center', role: 'metric label' });
    if (metric.detail) addText(scene, metric.detail, { x: x + 20, y: CONTENT.y + (supporting.length ? 172 : 195),
      w: width - 40, h: supporting.length ? 29 : height - 211 },
    { fontSize: supporting.length ? 16 : 18, minFontSize: 16, color: C.muted,
      align: 'center', role: 'metric detail' });
  });
  if (supporting.length) drawCards(scene, supporting, { ...CONTENT, y: CONTENT.y + 229, h: CONTENT.h - 229 }, { compact: true });
}

function drawSteps(scene, steps, box = CONTENT) {
  const count = steps.length;
  const horizontal = count <= 4 && box.w >= 850;
  const gap = horizontal ? 24 : 12;
  steps.forEach((step, index) => {
    const width = horizontal ? (box.w - gap * (count - 1)) / count : box.w;
    const height = horizontal ? box.h : (box.h - gap * (count - 1)) / count;
    const x = box.x + (horizontal ? index * (width + gap) : 0);
    const y = box.y + (horizontal ? 0 : index * (height + gap));
    rect(scene, x, y, width, height, C.white, C.line, 10);
    if (horizontal) {
      circle(scene, x + 22, y + 22, 44, C.navy);
      addText(scene, String(index + 1).padStart(2, '0'), { x: x + 23, y: y + 30, w: 42, h: 27 },
        { fontSize: 16, bold: true, color: C.white, align: 'center' });
      const titleH = Math.max(75, wrapText(step.title, width - 44, 20, true).length * 36 + 3);
      addText(scene, step.title, { x: x + 22, y: y + 91, w: width - 44, h: titleH },
        { fontSize: 20, minFontSize: 18, bold: true, color: C.navy, role: 'step title' });
      addText(scene, step.body, { x: x + 22, y: y + 104 + titleH, w: width - 44, h: height - titleH - 127 },
        { fontSize: 18, minFontSize: 16, role: 'step description' });
      if (index < count - 1) line(scene, x + width + 3, y + 46, x + width + gap - 3, y + 46, C.orange, 2, true);
    } else {
      addText(scene, String(index + 1).padStart(2, '0'), { x: x + 18, y: y + 15, w: 41, h: height - 30 },
        { fontSize: 22, minFontSize: 18, bold: true, color: C.orange, valign: 'middle', role: 'step index' });
      const titleWidth = Math.min(245, width * 0.32);
      addText(scene, step.title, { x: x + 73, y: y + 12, w: titleWidth, h: height - 24 },
        { fontSize: 18, minFontSize: 16, bold: true, color: C.navy, valign: 'middle', role: 'step title' });
      addText(scene, step.body, { x: x + 88 + titleWidth, y: y + 12, w: width - titleWidth - 108, h: height - 24 },
        { fontSize: 18, minFontSize: 16, valign: 'middle', role: 'step description' });
    }
  });
}

function steps(scene, data) {
  const supporting = cardItems(data, ['steps']);
  if (supporting.length) {
    drawSteps(scene, data.steps, { ...CONTENT, w: 768 });
    drawCards(scene, supporting, { x: 854, y: CONTENT.y, w: 362, h: CONTENT.h });
  } else drawSteps(scene, data.steps);
}

function table(scene, data) {
  const count = data.headers.length;
  const weights = data.headers.map((header, index) => {
    const longest = Math.max(header.length, ...data.rows.map(row => row[index].length));
    return Math.max(10, Math.min(65, longest));
  });
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const widths = weights.map(weight => CONTENT.w * weight / totalWeight);
  const available = data.caption ? CONTENT.h - 39 : CONTENT.h;
  const appendix = data.id >= 32;
  let fontSize = 18;
  let rowHeights;
  let headerH;
  let wrappedRows;
  let wrappedHeaders;
  do {
    wrappedHeaders = data.headers.map((header, i) => wrapText(header, widths[i] - 24, fontSize, true).join('\n'));
    headerH = Math.max(45, ...wrappedHeaders.map(value => value.split('\n').length * fontSize * 4 / 3 * 1.14 + 20));
    wrappedRows = data.rows.map(row => row.map((cell, i) => wrapText(cell, widths[i] - 24, fontSize).join('\n')));
    rowHeights = wrappedRows.map(row => Math.max(39, ...row.map(cell => cell.split('\n').length * fontSize * 4 / 3 * 1.14 + 16)));
    if (headerH + rowHeights.reduce((sum, height) => sum + height, 0) <= available) break;
    fontSize -= 0.5;
  } while (fontSize >= (appendix ? 12 : 16));
  if (fontSize < (appendix ? 12 : 16)) throw new Error(`Slide ${data.id}: table cannot fit on one slide at a readable font size. Shorten cells or rows.`);
  const spare = available - headerH - rowHeights.reduce((sum, height) => sum + height, 0);
  rowHeights = rowHeights.map(height => height + spare / rowHeights.length);
  scene.objects.push({ kind: 'table', x: CONTENT.x, y: CONTENT.y, w: CONTENT.w,
    h: available, headers: wrappedHeaders, rows: wrappedRows, widths, headerH, rowHeights, fontSize });
  if (data.caption) addText(scene, data.caption, { x: CONTENT.x, y: CONTENT.y + available + 12, w: CONTENT.w, h: 27 },
    { fontSize: 16, color: C.muted, role: 'table caption' });
  const extra = cardItems(data);
  if (extra.length) throw new Error(`Slide ${data.id}: table layout supports caption, not additional cards/steps/metrics/columns; choose a dedicated slide.`);
}

function imageDimensions(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    const width = buffer.readUInt32BE(16), height = buffer.readUInt32BE(20);
    if (!width || !height) throw new Error(`Invalid PNG dimensions: ${file}`);
    return { width, height };
  }
  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 4 <= buffer.length) {
      if (buffer[offset] !== 0xff) break;
      while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
      const marker = buffer[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > buffer.length) break;
      const length = buffer.readUInt16BE(offset);
      if (length < 2 || offset + length > buffer.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        if (length < 7) break;
        const width = buffer.readUInt16BE(offset + 5), height = buffer.readUInt16BE(offset + 3);
        if (!width || !height) break;
        return { width, height };
      }
      offset += length;
    }
  }
  throw new Error(`Unsupported or damaged image (PNG/JPEG required): ${file}`);
}

function image(scene, data, root) {
  const supporting = cardItems(data);
  const imageBox = { ...CONTENT, w: supporting.length ? 762 : CONTENT.w };
  rect(scene, imageBox.x, imageBox.y, imageBox.w, imageBox.h, C.white, C.line, 10);
  const captionH = data.caption ? 48 : 0;
  const available = { x: imageBox.x + 12, y: imageBox.y + 12,
    w: imageBox.w - 24, h: imageBox.h - 24 - captionH };
  const file = path.resolve(root, data.image);
  const dimensions = imageDimensions(file);
  const scale = Math.min(available.w / dimensions.width, available.h / dimensions.height);
  const width = dimensions.width * scale, height = dimensions.height * scale;
  scene.objects.push({ kind: 'image', file, repoPath: data.image,
    x: available.x + (available.w - width) / 2, y: available.y + (available.h - height) / 2,
    w: width, h: height, alt: data.caption || data.title });
  if (data.caption) addText(scene, data.caption, { x: imageBox.x + 18,
    y: imageBox.y + imageBox.h - captionH - 2, w: imageBox.w - 36, h: captionH - 6 },
  { fontSize: 12, color: C.muted, align: 'center', valign: 'middle', role: 'image caption' });
  supporting.forEach((item, index) => {
    const gap = 12;
    const height = (CONTENT.h - gap * (supporting.length - 1)) / supporting.length;
    const y = CONTENT.y + index * (height + gap);
    const accent = accentColor(item.color, [C.orange, C.secondary, C.green][index % 3]);
    rect(scene, 848, y, 368, height, C.white, C.line, 10);
    rect(scene, 848, y, 4, height, accent);
    addText(scene, item.title, { x: 869, y: y + 11, w: 326, h: 32 },
      { fontSize: 18, bold: true, color: accent, role: 'image feature title' });
    addText(scene, item.body, { x: 869, y: y + 47, w: 326, h: height - 55 },
      { fontSize: 16, minFontSize: 16, role: 'image feature body' });
  });
}
function qr(scene, data, root) {
  rect(scene, CONTENT.x, CONTENT.y, 708, CONTENT.h, C.white, C.line, 10);
  addText(scene, 'Quét mã để mở giáo trình', { x: 86, y: 258, w: 660, h: 48 },
    { fontSize: 26, bold: true, color: C.navy, role: 'QR instruction' });
  addText(scene, '1. Mở camera hoặc ứng dụng quét QR.\n2. Quét mã bên phải.\n3. Mở liên kết và trải nghiệm học liệu.',
    { x: 86, y: 330, w: 660, h: 138 }, { fontSize: 20, role: 'QR steps' });
  addText(scene, data.url, { x: 86, y: 505, w: 650, h: 75 },
    { fontSize: 17, color: C.secondary, role: 'online textbook URL' });
  const file = path.resolve(root, data.image);
  const dimensions = imageDimensions(file);
  const scale = Math.min(368 / dimensions.width, CONTENT.h / dimensions.height);
  const w = dimensions.width * scale, h = dimensions.height * scale;
  scene.objects.push({ kind: 'image', file, repoPath: data.image,
    x: 848 + (368 - w) / 2, y: CONTENT.y + (CONTENT.h - h) / 2, w, h,
    alt: `QR mở giáo trình trực tuyến: ${data.url}` });
}


function routes(scene, data) {
  const width = (CONTENT.w - 2 * GAP) / 3;
  data.columns.forEach((column, index) => {
    const x = CONTENT.x + index * (width + GAP);
    rect(scene, x, 228, width, 378, C.white, C.line, 8);
    rect(scene, x, 228, width, 41, C.secondary);
    addText(scene, column.title, { x: x + 14, y: 237, w: width - 28, h: 26 },
      { fontSize: 16, minFontSize: 14, bold: true, color: C.white, role: 'route column title' });
    const rowH = 330 / column.items.length;
    column.items.forEach((item, itemIndex) => {
      const y = 272 + rowH * itemIndex;
      const is3D = /\b3D\b/i.test(item);
      // Remove only the explicit marker; retain every character of the route name.
      const label = item.replace(/\s*[[(]3D[\])]\s*/gi, ' ').trim();
      if (itemIndex % 2 === 1) rect(scene, x + 1, y, width - 2, rowH, C.paper);
      addText(scene, label, { x: x + 14, y: y + 2, w: width - (is3D ? 66 : 28), h: rowH - 4 },
        { fontSize: 11.5, minFontSize: 10.5, color: C.ink, valign: 'middle', role: 'full route name' });
      if (is3D) {
        rect(scene, x + width - 45, y + (rowH - 22) / 2, 33, 22, C.paleOrange, null, 4);
        addText(scene, '3D', { x: x + width - 44, y: y + (rowH - 22) / 2 + 3, w: 31, h: 18 },
          { fontSize: 10, bold: true, color: C.orange, align: 'center', role: '3D mark' });
      }
    });
  });
  if (cardItems(data, ['columns']).length) throw new Error(`Slide ${data.id}: route appendix is reserved for three route columns.`);
}

function buildScene(data, meta, total, root) {
  const scene = { id: data.id, title: data.title, layout: data.layout,
    background: C.paper, objects: [] };
  const dark = data.layout === 'cover' || data.layout === 'closing';
  common(scene, data, meta, total, dark);
  const renderers = { cover: cinematic, closing: cinematic,
    metrics, cards: (target, content) => drawCards(target, cardItems(content)),
    steps, table, image: (target, content) => image(target, content, root),
    qr: (target, content) => qr(target, content, root), routes };
  renderers[data.layout](scene, data, meta);
  // Takeaway/footer were composed before content; their boxes never intersect it.
  return scene;
}

function renderPptxScene(slide, pptx, scene) {
  const sx = SW / W, sy = SH / H;
  const box = object => ({ x: object.x * sx, y: object.y * sy,
    w: object.w * sx, h: object.h * sy });
  slide.background = { color: scene.background };
  for (const object of scene.objects) {
    if (object.kind === 'text') {
      slide.addText(object.text, { ...box(object), fontFace: F.body,
        fontSize: object.fontSize, color: object.color, bold: object.bold,
        margin: 0, align: object.align,
        valign: object.valign === 'middle' ? 'mid' : 'top',
        lineSpacingMultiple: object.lineHeight, paraSpaceAfterPt: 0,
        breakLine: false, wrap: true, isTextBox: true });
    } else if (object.kind === 'shape') {
      slide.addShape(pptx.ShapeType[object.shape], { ...box(object),
        fill: object.fill ? { color: object.fill } : { color: C.white, transparency: 100 },
        line: { color: object.stroke || object.fill || C.line,
          width: object.stroke ? 0.6 : 0, transparency: object.stroke ? 0 : 100 },
        ...(object.shape === 'roundRect' ? { rectRadius: object.radius * Math.min(sx, sy) } : {}) });
    } else if (object.kind === 'line') {
      slide.addShape(pptx.ShapeType.line, { x: Math.min(object.x1, object.x2) * sx,
        y: Math.min(object.y1, object.y2) * sy,
        w: Math.abs(object.x2 - object.x1) * sx, h: Math.abs(object.y2 - object.y1) * sy,
        flipV: (object.x2 - object.x1) * (object.y2 - object.y1) < 0,
        line: { color: object.color, width: object.width * 0.75,
          ...(object.arrow ? { endArrowType: 'triangle' } : {}) } });
    } else if (object.kind === 'image') {
      slide.addImage({ ...box(object), path: object.file, altText: object.alt });
    } else if (object.kind === 'table') {
      const rows = [object.headers.map(text => ({ text, options: { bold: true,
        color: C.white, fill: C.secondary } })), ...object.rows.map((row, index) =>
        row.map(text => ({ text, options: { color: C.ink, fill: index % 2 ? C.paper : C.white, margin: [6, 9, 6, 9] } })))];
      slide.addTable(rows, { ...box(object), colW: object.widths.map(width => width * sx),
        rowH: [object.headerH, ...object.rowHeights].map(height => height * sy),
        autoPage: false, fontFace: F.body, fontSize: object.fontSize,
        margin: [7.5, 9, 7.5, 9], border: { color: C.line, pt: 0.65 },
        valign: 'middle', paraSpaceAfterPt: 0, lineSpacingMultiple: 1.14,
        color: C.ink, fill: C.white, verbose: false });
    }
  }
}

module.exports = { C, F, SW, SH, W, H, buildScene, renderPptxScene, imageDimensions, wrapText };
