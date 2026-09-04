'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const { meta, slides } = require('../tools/presentation/acceptance-deck-content');

test('presentation metadata contract', () => {
  assert.strictEqual(meta.totalTime, '15:00');
  assert.strictEqual(meta.authors.length, 3);
  assert.ok(meta.title.includes('Giáo trình điện tử'));
  assert.ok(meta.request.includes('thông qua có điều kiện'));
});

test('slide count and order contract', () => {
  assert.strictEqual(slides.length, 16, 'Deck must contain exactly 16 slides (13 main + 3 backup)');
  const mainSlides = slides.filter(s => !s.backup);
  const backupSlides = slides.filter(s => s.backup);
  assert.strictEqual(mainSlides.length, 13, 'Main presentation must have exactly 13 slides');
  assert.strictEqual(backupSlides.length, 3, 'Backup appendix must have exactly 3 slides');

  // Verify sequential IDs 1 to 16
  slides.forEach((s, idx) => {
    assert.strictEqual(s.id, idx + 1, `Slide at index ${idx} must have id ${idx + 1}`);
    assert.ok(s.type, `Slide ${s.id} must have a type`);
    assert.ok(s.title, `Slide ${s.id} must have a title`);
    assert.ok(s.takeaway, `Slide ${s.id} must have a takeaway`);
    assert.ok(s.speaker, `Slide ${s.id} must have an assigned speaker`);
    assert.ok(Array.isArray(s.script) && s.script.length > 0, `Slide ${s.id} must have speaker script`);
  });
});

test('main deck timing contract sums to exactly 900 seconds (15:00)', () => {
  const mainSlides = slides.filter(s => !s.backup);
  let totalSeconds = 0;
  mainSlides.forEach(s => {
    const parts = s.time.split(':');
    assert.strictEqual(parts.length, 2, `Slide ${s.id} time must be MM:SS format`);
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    totalSeconds += mins * 60 + secs;
  });
  assert.strictEqual(totalSeconds, 900, `Main slides total time must be exactly 900 seconds (15:00), got ${totalSeconds}s`);
});

test('scientific inventory and demo contract use canonical evidence', () => {
  const chapters = slides.find(s => s.id === 2);
  assert.deepStrictEqual(chapters.chapters.map(row => row[0]), ['45', '29', '31']);
  assert.strictEqual(chapters.supportingRoutes, 3);

  const journey = slides.find(s => s.id === 4);
  assert.ok(journey.steps.some(step => step[2].includes('300 câu hỏi')));

  const demo = slides.find(s => s.id === 8);
  assert.strictEqual(demo.type, 'demoMain');
  assert.strictEqual(demo.time, '1:30');
  assert.strictEqual(demo.images.length, 3);
  assert.strictEqual(demo.steps.length, 5);
  assert.ok(demo.steps.some(step => step[2].includes('M = 200 N·m')));

  const conditions = slides.find(s => s.id === 12);
  assert.strictEqual(conditions.conditions.length, 4);
  assert.ok(conditions.nextStep.includes('24 gate'));
});

test('referenced image assets exist on disk', () => {
  slides.forEach(s => {
    if (s.image) {
      const fullPath = path.resolve(ROOT, s.image);
      assert.ok(fs.existsSync(fullPath), `Slide ${s.id} image must exist: ${s.image}`);
    }
    if (Array.isArray(s.images)) {
      s.images.forEach((img, i) => {
        const fullPath = path.resolve(ROOT, img);
        assert.ok(fs.existsSync(fullPath), `Slide ${s.id} image[${i}] must exist: ${img}`);
      });
    }
  });
});

test('build-acceptance-deck script runs and outputs valid PPTX', () => {
  const output = execSync('node tools/presentation/build-acceptance-deck.js', { cwd: ROOT, encoding: 'utf8' });
  const result = JSON.parse(output.trim());
  assert.strictEqual(result.slides, 16);
  assert.strictEqual(result.main, 13);
  assert.strictEqual(result.backup, 3);
  const pptxPath = path.resolve(ROOT, result.output);
  assert.ok(fs.existsSync(pptxPath), 'PPTX file must exist on disk');
  const stat = fs.statSync(pptxPath);
  assert.ok(stat.size > 50000, 'PPTX file size must be reasonable (> 50KB)');
});

test('presentation HTML slide deck contains all 16 slides', () => {
  const htmlPath = path.resolve(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/presentation-slides.html');
  assert.ok(fs.existsSync(htmlPath), 'HTML presentation deck must exist');
  const content = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(content.includes('data-id="1"'));
  assert.ok(content.includes('data-id="13"'));
  assert.ok(content.includes('data-id="16"'));
  assert.ok(content.includes('2026.09.02-candidate'));
  assert.ok(content.includes('3defec1306bab10288faed66e45f19d8aa2befc2b66ecb1b6f2066df186f005a'));
  assert.ok(content.includes('45 route Tĩnh học'));
  assert.ok(content.includes('300 câu hỏi'));
  assert.ok(content.includes('Demo 90 giây: kiểm chứng mô men'));
  assert.ok(content.includes('78,7 MB (75,1 MiB)'));
  assert.ok(!content.includes('axe-core scan tự động đạt tiêu chuẩn WCAG 2.2 AA'));
});

test('printable council handout dossier contains all 16 slides and administrative header', () => {
  const handoutPath = path.resolve(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/handout-in-an-hoi-dong.html');
  assert.ok(fs.existsSync(handoutPath), 'Printable handout HTML must exist');
  const content = fs.readFileSync(handoutPath, 'utf8');
  assert.ok(content.includes('HỌC VIỆN HẢI QUÂN'));
  assert.ok(content.includes('BÁO CÁO TÓM TẮT & TÀI LIỆU PHÁT TAY'));
  assert.ok(content.includes('SLIDE 01'));
  assert.ok(content.includes('SLIDE 13'));
  assert.ok(content.includes('SLIDE 16'));
  assert.ok(content.includes('2026.09.02-candidate'));
  assert.ok(content.includes('@media print'));
  assert.ok(content.includes('CHỦ TỊCH HỘI ĐỒNG KHOA HỌC'));
  assert.ok(content.includes('Tĩnh học (45), Động học (29), Động lực học (31)'));
  assert.ok(content.includes('300 câu'));
  assert.ok(content.includes('DEMO 90 GIÂY: KIỂM CHỨNG MÔ MEN'));
  assert.ok(content.includes('78,7 MB (75,1 MiB)'));
  assert.ok(!content.includes('Tĩnh học (42)'));
});
