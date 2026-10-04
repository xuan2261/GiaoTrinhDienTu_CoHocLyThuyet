'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const os = require('node:os');

const ROOT = path.resolve(__dirname, '..');
const contentManifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/content-manifest.json'), 'utf8'));
const acceptanceReport = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/acceptance-report.json'), 'utf8'));
const releaseCandidate = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/release-candidate.json'), 'utf8'));
const learningOutcomes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/learning-outcomes.json'), 'utf8'));
const academicSignoffs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/academic_signoffs.json'), 'utf8'));
const { meta, slides } = require('../tools/presentation/acceptance-deck-content');
const { collectVisualItems } = require('../tools/presentation/build-acceptance-web');
const liveCaptures = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/sim-live-captures.json'), 'utf8'));

const slideText = value => {
  if (Array.isArray(value)) return value.map(slideText).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(slideText).join(' ');
  return String(value ?? '');
};
const normalizeText = value => String(value).replace(/\s+/gu, ' ').trim();
const htmlContains = (content, text) => normalizeText(content
  .replace(/<[^>]+>/gu, ' ')
  .replaceAll('&amp;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')).includes(normalizeText(text));

test('presentation metadata contract', () => {
  assert.strictEqual(meta.totalTime, '12:00');
  assert.strictEqual(meta.sessionTime, '15:00');
  assert.strictEqual(slides.length, 19, 'Deck must contain exactly 19 slides (13 main + 6 backup)');
  const mainSlides = slides.filter(s => !s.backup);
  const backupSlides = slides.filter(s => s.backup);
  assert.strictEqual(mainSlides.length, 13, 'Main presentation must have exactly 13 slides');
  assert.strictEqual(backupSlides.length, 6, 'Backup appendix must have exactly 6 slides');
});

test('slide count, main narrative, and backup boundary contract', () => {
  assert.strictEqual(slides.length, 19, 'Deck must contain exactly 19 slides (13 main + 6 backup)');
  const mainSlides = slides.filter(s => !s.backup);
  const backupSlides = slides.filter(s => s.backup);
  assert.strictEqual(mainSlides.length, 13, 'Main presentation must have exactly 13 slides');
  assert.strictEqual(backupSlides.length, 6, 'Backup appendix must have exactly 6 slides');
  assert.deepStrictEqual(
    mainSlides.map(slide => slide.type),
    [
      'cover',
      'problemSolution',
      'coverage',
      'journey',
      'qrExperience',
      'scientificSample',
      'scientificSample',
      'scientificSample',
      'demoMain',
      'evidence',
      'resultLimits',
      'conditions',
      'decision',
    ],
    'The timed deck must present results first and limits later',
  );
  assert.deepStrictEqual(backupSlides.map(slide => slide.id), [14, 15, 16, 17, 18, 19]);
  assert.ok(backupSlides.every(slide => slide.time === 'backup'));
  slides.forEach((s, idx) => {
    assert.strictEqual(s.id, idx + 1, `Slide at index ${idx} must have id ${idx + 1}`);
    assert.ok(s.type, `Slide ${s.id} must have a type`);
    assert.ok(s.title, `Slide ${s.id} must have a title`);
    assert.ok(s.takeaway, `Slide ${s.id} must have a takeaway`);
    assert.ok(s.speaker, `Slide ${s.id} must have an assigned speaker`);
    assert.ok(Array.isArray(s.script) && s.script.length > 0, `Slide ${s.id} must have speaker script`);
    assert.ok(s.sourceId, `Slide ${s.id} must expose a concise evidence source id`);
  });
});

test('backup slides retain outcome, science, signoff, release, gate, and truthful Q&A detail', () => {
  const backupSlides = slides.filter(slide => slide.backup);
  const [outcomeDetails, scienceCases, checklist, technicalRelease, gateDetails, truthfulQa] = backupSlides;

  assert.ok(Array.isArray(outcomeDetails.outcomes) && outcomeDetails.outcomes.length > 0, 'Slide 14 must provide outcome details');
  assert.strictEqual(scienceCases.type, 'validation', 'Slide 15 must present scientific-case evidence boundaries');
  assert.match(slideText(scienceCases), /ba ca đối chiếu khoa học/i, 'Slide 15 must retain the three scientific comparison cases');
  assert.match(slideText(scienceCases), /mỗi chương một ca/i, 'Slide 15 must retain one science case per chapter');
  assert.match(slideText(checklist), /\b0\b/, 'Slide 16 must disclose that no academic signoffs exist');
  assert.match(slideText(checklist).toLowerCase(), /blocked|chờ thẩm định/, 'Slide 16 must disclose blocked academic review');
  assert.strictEqual(technicalRelease.releaseVersion, releaseCandidate.releaseVersion, 'Slide 17 must carry release status');
  assert.strictEqual(technicalRelease.packageSha256, releaseCandidate.packageSha256, 'Slide 17 must carry the release integrity hash');
  assert.match(slideText(technicalRelease), /không chấp thuận phát hành/i, 'Slide 17 must state the current rejected release decision');
  assert.doesNotMatch(slideText(technicalRelease), /chưa được chấp thuận|chưa chấp thuận/i, 'Slide 17 must not soften a rejected decision into a pending state');
  assert.ok(Array.isArray(gateDetails.rows) && gateDetails.rows.length > 0, 'Slide 18 must retain gate detail');
  assert.ok(Array.isArray(gateDetails.failedRows) && gateDetails.failedRows.length === acceptanceReport.gateSummary.fail, 'Slide 18 must enumerate all recorded failures');
  assert.match(gateDetails.title, /chín lần dừng kiểm tra.*bốn nội dung bị chặn/i);
  assert.ok(Array.isArray(truthfulQa.questions) && truthfulQa.questions.length > 0, 'Slide 19 must retain truthful Q&A');
  assert.match(slideText(truthfulQa), /(?:toàn bộ 24 điều kiện kiểm tra|chạy lại đủ 24 điều kiện)/i, 'Slide 19 must state the full rerun condition');
  assert.match(slideText(truthfulQa), /không còn.*không đạt.*chưa thể thực hiện.*chưa chạy/i, 'Slide 19 must not imply partial evidence is enough');

  const technicalFields = ['releaseVersion', 'packageSha256', 'hashes'];
  for (const slide of slides.filter(slide => !slide.backup)) {
    for (const field of technicalFields) {
      assert.ok(!(field in slide), `Technical release field "${field}" belongs only in the backup appendix, not Slide ${slide.id}`);
    }
  }
  const mainDeckText = slideText(slides.filter(slide => !slide.backup));
  assert.ok(!mainDeckText.includes(releaseCandidate.releaseVersion), 'Main slides must not show a technical release version');
  assert.ok(!mainDeckText.includes(releaseCandidate.packageSha256), 'Main slides must not show a technical release hash');
});

test('main deck timing leaves three minutes of session buffer', () => {
  const mainSlides = slides.filter(s => !s.backup);
  let totalSeconds = 0;
  mainSlides.forEach(s => {
    const parts = s.time.split(':');
    assert.strictEqual(parts.length, 2, `Slide ${s.id} time must be MM:SS format`);
    totalSeconds += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  });
  assert.strictEqual(totalSeconds, 720, `Main slides must total 12:00, got ${totalSeconds}s`);
});

test('main presentation limits speaker handoffs', () => {
  const speakers = slides.filter(slide => !slide.backup).map(slide => slide.speaker);
  const handoffs = speakers.slice(1).filter((speaker, index) => speaker !== speakers[index]).length;
  assert.ok(handoffs <= 3, `Main presentation must use at most three speaker handoffs, got ${handoffs}`);
});

test('scientific-pedagogical evidence is derived without overclaiming review status', () => {
  const qrSlide = slides.find(s => s.type === 'qrExperience');
  assert.ok(qrSlide, 'Slide deck must include a qrExperience slide');
  assert.strictEqual(qrSlide.id, 5, 'QR Experience slide must follow the results overview and learning loop');
  assert.strictEqual(qrSlide.url, 'https://xuan2261.github.io/GiaoTrinhDienTu_CoHocLyThuyet/');
  assert.ok(fs.existsSync(path.resolve(ROOT, qrSlide.qrImage)), 'QR image must exist on disk');

  const outcomes = slides.find(s => s.type === 'outcomes');
  assert.strictEqual(learningOutcomes.status, 'provisional');
  assert.ok(learningOutcomes.learningOutcomes.every(outcome => outcome.status === 'provisional'));
  assert.strictEqual(outcomes.outcomes.length, learningOutcomes.learningOutcomes.length);
  assert.deepStrictEqual(outcomes.outcomes.map(outcome => outcome[1].split(' · ')[0]), learningOutcomes.learningOutcomes.map(outcome => outcome.title));
  assert.ok(outcomes.outcomes.every(outcome => outcome[3] === 'sơ bộ'));
  assert.match(outcomes.notice, /không có ngoại lệ đánh giá được khai báo/i);
  outcomes.outcomes.forEach(outcome => {
    assert.match(outcome[2], /Điều kiện:/i, 'Slide 14 must show each outcome condition');
    assert.match(outcome[2], /Tiêu chí:/i, 'Slide 14 must show each outcome criterion');
  });

  const demo = slides.find(s => s.type === 'demoMain');
  assert.strictEqual(demo.time, '1:30');
  assert.strictEqual(demo.steps.length, 5);
  assert.ok(demo.steps.some(step => step[2].includes('200 N·m')));
  assert.match(demo.formula, /d⊥|d_perp|d_\{?\\perp\}?/u, 'Moment formula must identify the perpendicular lever arm');
  assert.match(slideText(demo), /khoảng cách vuông góc/i, 'Moment demo must explain the perpendicular distance');
  assert.match(slideText(demo), /dấu.*quy ước|quy ước.*dấu/i, 'Moment demo must explain the sign convention');
  assert.match(slideText(demo), /θ\s*=\s*90°/u, 'Moment demo must disclose its fixed right-angle case');
  assert.match(slideText(demo), /không minh họa.*đổi θ.*đổi dấu/i, 'Moment demo must disclose what it does not demonstrate');
  assert.match(slideText(demo), /giữ F\s*=\s*50 N.*kéo điểm đặt lực.*d⊥\s*=\s*4,00 m/iu, 'Moment demo must match the actual interaction');
  assert.match(slideText(demo), /PDF cục bộ/i, 'Moment demo must retain the local PDF comparison');

  const academicReview = acceptanceReport.gates.find(gate => gate.gateId === 'academic-review-currentness');
  assert.strictEqual(academicSignoffs.records.length, 0);
  assert.ok(academicReview, 'Acceptance report must identify the academic review gate');
  assert.strictEqual(academicReview.status, 'blocked');
  assert.strictEqual(acceptanceReport.independentReview.status, 'blocked');

  const limits = slides.find(s => s.type === 'resultLimits');
  assert.ok(limits, 'Main deck must distinguish achieved results from remaining limits');
  assert.match(slideText(limits), /chưa có ký xác nhận học thuật độc lập/i);
  assert.match(slideText(limits), /chưa có dữ liệu.*hiệu quả học tập/i);
  assert.match(slideText(limits), /mức ứng viên/i);
  assert.doesNotMatch(slideText(limits), /đã vận hành|đã được kết nối|ba minh chứng khoa học/i);
  assert.doesNotMatch(slideText(limits).toLowerCase(), /\bpass\b|\bfail\b|\bblocked\b|\bnot run\b|\bsignoff\b|\bgate\b|\bprovisional\b/, 'Main limits slide must use plain Vietnamese');

  assert.match(slideText(qrSlide), /bản web để trình diễn/i);
  assert.match(slideText(qrSlide), /chưa được chứng minh đồng nhất/i);

  const allDeckText = slideText(slides).toLocaleLowerCase('vi-VN');
  assert.doesNotMatch(allDeckText, /độc lập ký biên bản/u, 'Deck must not claim an existing independent signoff');
  assert.ok(!allDeckText.includes('đã nghiệm thu khoa học–sư phạm.'), 'Deck must not claim completed academic acceptance');
  assert.ok(!allDeckText.includes('đã thông qua khoa học–sư phạm.'), 'Deck must not claim completed academic acceptance');
  assert.ok(!allDeckText.includes('đã được chấp nhận học thuật.'), 'Deck must not claim completed academic acceptance');
});

test('main deck is a results report with simple Vietnamese wording', () => {
  const mainSlides = slides.filter(slide => !slide.backup);
  const mainText = slideText(mainSlides).toLocaleLowerCase('vi-VN');
  assert.match(meta.title, /báo cáo kết quả/i);
  assert.match(meta.request, /ghi nhận việc đã xây dựng hiện vật/i);
  assert.match(meta.request, /không đề nghị chấp thuận học thuật.*nghiệm thu cuối cùng.*phát hành/i);
  assert.match(mainSlides[0].title, /kết quả xây dựng/i);
  assert.match(mainSlides[2].title, /kết quả tổng thể/i);
  assert.match(mainSlides[3].title, /vòng học hỗ trợ tự học/i);
  assert.match(mainSlides[9].title, /căn cứ hội đồng có thể kiểm tra/i);
  assert.match(mainSlides[10].title, /kết quả đã có và giới hạn còn lại/i);
  assert.match(mainSlides[11].title, /nội dung xin ý kiến/i);
  assert.match(mainSlides[12].title, /ghi nhận.*hiện vật/i);
  assert.doesNotMatch(mainText, /\breadout\b|\bsignoff\b|\bgate\b|\bprovisional\b|\bblocked\b|\bpass\b|\bfail\b|\bnot run\b/u);
  assert.doesNotMatch(mainText, /nghiệm thu có điều kiện|chấp nhận có điều kiện|phê duyệt phát hành/u);
  assert.doesNotMatch(mainText, /minh chứng khoa học/u);
});

test('scientific examples state the correct concepts and conditions', () => {
  const [centroid, coriolis, collision] = slides.filter(slide => slide.type === 'scientificSample');
  for (const sample of [centroid, coriolis, collision]) {
    assert.match(sample.title, /ca đối chiếu khoa học/i);
    assert.match(slideText(sample), /chưa thẩm định độc lập/i);
  }
  assert.match(slideText(centroid), /tọa độ trọng tâm diện tích/i);
  assert.match(slideText(centroid), /diện tích có dấu âm/i);
  assert.doesNotMatch(slideText(centroid), /nằm trong miền hình học|nằm trong phần vật liệu/i);
  assert.match(slideText(coriolis), /thành phần gia tốc coriolis/i);
  assert.match(slideText(coriolis), /không phải toàn bộ gia tốc/i);
  assert.match(slideText(coriolis), /aCor, ω và vrel đều là vectơ/u, 'Coriolis slide must identify all vector quantities');
  assert.match(coriolis.sample.magnitudeFormula, /\|aCor\|\s*=\s*2ω\|vrel\|/u, 'Coriolis scalar magnitude must use |vrel|');
  assert.match(slideText(collision), /tổng động lượng/i);
  assert.match(slideText(collision), /xung lực ngoài.*không đáng kể/i);
  assert.match(slideText(collision), /va chạm thẳng một chiều/i);
  assert.match(slideText(collision), /va chạm[^.]{0,40}thụ động/i);
  assert.match(collision.sample.formula, /m₁u₁.*m₂u₂.*m₁v₁.*m₂v₂/u);
});

test('scope metrics use exact, non-inflated labels', () => {
  const evidenceSlide = slides.find(slide => slide.type === 'evidence');
  assert.ok(evidenceSlide);
  assert.deepStrictEqual(evidenceSlide.metrics.map(metric => metric[1]), [
    'mục/trang hiển thị',
    'tham chiếu hình duy nhất',
    'tham chiếu công thức',
    'câu tự kiểm tra',
  ]);
  assert.match(evidenceSlide.takeaway, /số liệu phạm vi/i);
  assert.match(evidenceSlide.takeaway, /không phải.*chất lượng/i);
  assert.match(evidenceSlide.takeaway, /45.*29.*31.*3 mục bổ trợ/i);
});

test('council feedback request includes inspectable outcome and quiz evidence', () => {
  const feedback = slides.find(slide => slide.type === 'conditions');
  const outcomes = slides.find(slide => slide.type === 'outcomes');
  assert.ok(Array.isArray(feedback.quizExamples) && feedback.quizExamples.length === 3, 'Slide 12 must show three representative quiz items');
  feedback.quizExamples.forEach(example => {
    assert.strictEqual(example.length, 4);
    assert.ok(example[1], 'Representative quiz item must show its question');
    assert.ok(example[2], 'Representative quiz item must show its correct answer');
    assert.ok(example[2].length <= 45, 'Representative quiz answer must fit its projected card');
    assert.match(example[3], /^data\/quiz-ch[123]\.json#/);
  });
  assert.match(slideText(feedback), /xem điều kiện và tiêu chí tại phụ lục 14/i);
  assert.ok(outcomes.outcomes.every(outcome => /Điều kiện:.*Tiêu chí:/i.test(outcome[2])));
});

test('release appendix explains all recorded failures and packaged LMS derivatives', () => {
  const release = slides.find(slide => slide.type === 'artifact');
  const gateDetails = slides.find(slide => slide.id === 18);
  const failedGateIds = acceptanceReport.gates.filter(gate => gate.status === 'fail').map(gate => gate.gateId).sort();
  const blockedGateIds = acceptanceReport.gates.filter(gate => gate.status === 'blocked').map(gate => gate.gateId).sort();
  assert.match(release.failureQualification, /thiếu.*Chromium/i);
  assert.match(release.failureQualification, /không.*bằng chứng.*kiểm tra vật lý.*thất bại/i);
  assert.strictEqual(release.snapshotDate, '2026-09-21');
  assert.strictEqual(release.latestEvidenceDate, '2026-09-25');
  assert.match(release.takeaway, /snapshot nền 2026-09-21.*mô phỏng cập nhật 2026-09-25/i);
  assert.doesNotMatch(release.takeaway, /Dữ liệu ngày 2026-09-25/i);
  assert.deepStrictEqual(gateDetails.failedRows.map(row => row[3]).sort(), failedGateIds);
  assert.deepStrictEqual(gateDetails.rows.map(row => row[3]).sort(), blockedGateIds);
  assert.strictEqual(release.derivatives.length, 2);
  assert.match(slideText(release.derivatives), /QTI 3/i);
  assert.match(slideText(release.derivatives), /Common Cartridge 1\.4/i);
  assert.match(slideText(release.derivatives), /không phải bằng chứng nhập thành công vào LMS/i);
});

test('final request is ready for council minutes', () => {
  const decision = slides.find(slide => slide.type === 'decision');
  assert.match(decision.minuteText, /Dự thảo biên bản:/i);
  assert.match(decision.minuteText, /ghi nhận.*đã xây dựng.*mức ứng viên/i);
  assert.match(decision.minuteText, /không kết luận.*chấp thuận học thuật.*nghiệm thu cuối cùng.*phát hành/i);
});

test('README identifies the authoritative current release candidate', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  assert.match(readme, new RegExp(`Candidate reproducible hiện tại: \`release/${releaseCandidate.releaseVersion}/\``));
  assert.ok(readme.includes(releaseCandidate.packageSha256));
  assert.doesNotMatch(readme, /Candidate reproducible hiện tại: `release\/2026\.08\.29-candidate\//);
});

test('referenced image assets exist on disk', () => {
  slides.forEach(s => {
    if (s.image) {
      assert.ok(fs.existsSync(path.resolve(ROOT, s.image)), `Slide ${s.id} image must exist: ${s.image}`);
      if (s.type === 'scientificSample') {
        const focusedImage = s.image.replace(/\.png$/i, '-focus.png');
        assert.ok(fs.existsSync(path.resolve(ROOT, focusedImage)), `Slide ${s.id} focused runtime image must exist: ${focusedImage}`);
      }
    }
    if (Array.isArray(s.images)) {
      s.images.forEach((img, i) => {
        assert.ok(fs.existsSync(path.resolve(ROOT, img)), `Slide ${s.id} image[${i}] must exist: ${img}`);
      });
    }
  });
});
test('live simulation evidence captures are large and bound to split slides', () => {
  assert.strictEqual(liveCaptures.captures.length, 3);
  for (const capture of liveCaptures.captures) {
    const file = path.resolve(ROOT, capture.file);
    assert.ok(fs.existsSync(file), `Live capture must exist: ${capture.file}`);
    const bytes = fs.readFileSync(file);
    assert.strictEqual(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.ok(bytes.readUInt32BE(16) >= 1280, `${capture.route} capture must be at least 1280px wide`);
    assert.ok(bytes.readUInt32BE(20) >= 700, `${capture.route} capture must be at least 700px high`);
    const slide = slides.find(s => s.sample && s.sample.id === capture.route);
    assert.ok(slide, `Split slide must bind ${capture.route}`);
    assert.strictEqual(slide.image, capture.file);
    assert.strictEqual(capture.focusedFile, capture.file.replace(/\.png$/i, '-focus.png'));
    assert.strictEqual(capture.focusedHeight, 580);
  }
});

test('build-acceptance-deck script is reproducible without overwriting delivered artifacts', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acceptance-deck-'));
  const tempPptx = path.join(tempDir, 'deck.pptx');
  try {
    const output = execFileSync(process.execPath, ['tools/presentation/build-acceptance-deck.js', tempPptx, tempDir], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    const result = JSON.parse(output.trim());
    assert.strictEqual(result.total, 19);
    assert.strictEqual(result.main, 13);
    assert.strictEqual(result.backup, 6);
    assert.strictEqual(result.output, tempPptx);
    assert.strictEqual(result.webOutput, tempDir);
    const deliveredDir = path.resolve(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu');
    const deliveredPptx = path.join(deliveredDir, 'bao-cao-nghiem-thu-giao-trinh-dien-tu.pptx');
    const freshPptxBytes = fs.readFileSync(tempPptx);
    const deliveredPptxBytes = fs.readFileSync(deliveredPptx);
    const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
    assert.ok(
      freshPptxBytes.equals(deliveredPptxBytes),
      `Delivered PPTX must match a fresh isolated build; fresh: ${freshPptxBytes.length} bytes, SHA-256 ${sha256(freshPptxBytes)}; delivered: ${deliveredPptxBytes.length} bytes, SHA-256 ${sha256(deliveredPptxBytes)}`,
    );
    assert.strictEqual(
      fs.readFileSync(path.join(tempDir, 'handout-in-an-hoi-dong.html'), 'utf8'),
      fs.readFileSync(path.join(deliveredDir, 'handout-in-an-hoi-dong.html'), 'utf8'),
      'Delivered handout must match a fresh isolated build',
    );
    const normalizeAssetPaths = content => content.replace(/src="[^"]+"/g, 'src="<asset>"');
    assert.strictEqual(
      normalizeAssetPaths(fs.readFileSync(path.join(tempDir, 'presentation-slides.html'), 'utf8')),
      normalizeAssetPaths(fs.readFileSync(path.join(deliveredDir, 'presentation-slides.html'), 'utf8')),
      'Delivered HTML slides must match a fresh isolated build',
    );
    const deliveredPdf = path.join(deliveredDir, 'bao-cao-nghiem-thu-giao-trinh-dien-tu.pdf');
    assert.ok(fs.statSync(deliveredPdf).size > 50000, 'Delivered slide PDF must have a reasonable size');
    assert.strictEqual(fs.readFileSync(deliveredPdf).subarray(0, 5).toString('ascii'), '%PDF-');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('presentation HTML slide deck contains the redesigned 13+6 narrative', () => {
  const htmlPath = path.resolve(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/presentation-slides.html');
  assert.ok(fs.existsSync(htmlPath), 'HTML presentation deck must exist');
  const content = fs.readFileSync(htmlPath, 'utf8');
  assert.doesNotMatch(content, /[ \t]+$/m, 'HTML slide deck must not contain trailing whitespace');
  assert.strictEqual((content.match(/<article class="slide/g) || []).length, 19);
  slides.forEach(slide => {
    assert.ok(content.includes(`data-id="${slide.id}"`), `HTML deck must render Slide ${slide.id}`);
    assert.ok(htmlContains(content, slide.title), `HTML deck must retain Slide ${slide.id} title`);
    assert.ok(htmlContains(content, slide.takeaway), `HTML deck must retain Slide ${slide.id} takeaway`);
  });
  assert.ok(content.includes('data-id="13"'));
  assert.ok(content.includes('data-id="19"'));
  assert.doesNotMatch(content, /\bruntime\b|\bprovisional\b|\bscreen reader\b|\breflow\b|\bfidelity\b/i);
  for (const id of [6, 7, 8]) {
    const article = content.match(new RegExp(`<article class="slide[^>]*data-id="${id}"[\\s\\S]*?<\\/article>`))?.[0] || '';
    assert.match(article, /chưa thẩm định độc lập/i, `HTML Slide ${id} must retain the independent-review disclaimer`);
  }
  const gateDetails = slides.find(slide => slide.id === 18);
  [...gateDetails.rows, ...gateDetails.failedRows].forEach(row => assert.ok(!content.includes(row[3]), `HTML deck must not expose internal identifier ${row[3]}`));
  assert.ok(content.includes(releaseCandidate.releaseVersion));
  assert.ok(content.includes(releaseCandidate.packageSha256));
  assert.ok(content.includes('Báo cáo kết quả xây dựng giáo trình điện tử'));
  assert.ok(content.includes('Phụ lục tra cứu khi Hội đồng yêu cầu'));
  assert.ok(content.includes('data-backup="true"'));
  assert.ok(!content.includes('axe-core scan tự động đạt tiêu chuẩn WCAG 2.2 AA'));
  assert.ok(!content.includes('Giảng viên cơ học độc lập ký biên bản đánh giá chuyên môn'));
  assert.ok(content.includes('ghi nhận việc đã xây dựng hiện vật'));
  assert.ok(content.includes('không đề nghị chấp thuận học thuật'));
  assert.match(content, /không có ngoại lệ đánh giá/i);
});

test('desktop HTML slides do not overflow their 16:9 frames', { skip: !fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe') }, async () => {
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    const url = `file:///${path.resolve(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/presentation-slides.html').replaceAll('\\', '/')}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const measurements = await page.locator('article.slide').evaluateAll(elements => elements.map(element => {
      const body = element.querySelector('.body');
      const footer = element.querySelector('footer');
      return {
        id: element.dataset.id,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        bodyBottom: body ? body.getBoundingClientRect().bottom : 0,
        footerTop: footer ? footer.getBoundingClientRect().top : Number.POSITIVE_INFINITY,
      };
    }));
    for (const measurement of measurements) {
      assert.ok(measurement.scrollHeight <= measurement.clientHeight + 1, `HTML Slide ${measurement.id} overflows by ${measurement.scrollHeight - measurement.clientHeight}px`);
      if (!['1', '13'].includes(measurement.id)) {
        assert.ok(measurement.bodyBottom <= measurement.footerTop - 2, `HTML Slide ${measurement.id} content enters its footer`);
      }
    }
  } finally {
    await browser.close();
  }
});

test('printable council handout follows the revised decision scope', () => {
  const handoutPath = path.resolve(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/handout-in-an-hoi-dong.html');
  assert.ok(fs.existsSync(handoutPath), 'Printable handout HTML must exist');
  const content = fs.readFileSync(handoutPath, 'utf8');
  assert.doesNotMatch(content, /[ \t]+$/m, 'Handout must not contain trailing whitespace');
  assert.ok(content.includes('SLIDE 01'));
  assert.ok(content.includes('SLIDE 02'));
  assert.ok(content.includes('SLIDE 13'));
  assert.ok(content.includes('SLIDE 19'));
  assert.strictEqual((content.match(/<section class="card(?:\s|")/g) || []).length, 19);
  slides.forEach(slide => {
    assert.ok(content.includes(`data-id="${slide.id}"`), `Handout must render Slide ${slide.id}`);
    assert.ok(htmlContains(content, slide.title), `Handout must retain Slide ${slide.id} title`);
    assert.ok(htmlContains(content, slide.takeaway), `Handout must retain Slide ${slide.id} takeaway`);
    const card = content.match(new RegExp(`<section class="card[^>]*data-id="${slide.id}"[\\s\\S]*?<\\/section>`))?.[0] || '';
    for (const item of collectVisualItems(slide)) {
      assert.ok(htmlContains(card, item), `Handout Slide ${slide.id} must retain: ${item}`);
    }
  });
  assert.ok(content.includes('BÁO CÁO KẾT QUẢ XÂY DỰNG GIÁO TRÌNH ĐIỆN TỬ'));
  assert.ok(content.includes('TÓM TẮT KẾT QUẢ & TÀI LIỆU PHÁT TAY'));
  assert.ok(content.includes('@media print'));
  assert.ok(content.includes('13 slide báo cáo kết quả'));
  assert.ok(content.includes('6 slide phụ lục tra cứu'));
  assert.ok(content.includes('Ý KIẾN GÓP Ý CỦA HỘI ĐỒNG'));
  assert.ok(content.includes('Đề nghị Hội đồng ghi nhận việc đã xây dựng hiện vật và cho ý kiến hoàn thiện'));
  assert.ok(content.includes('không đề nghị chấp thuận học thuật'));
  for (const id of [6, 7, 8]) {
    const card = content.match(new RegExp(`<section class="card[^>]*data-id="${id}"[\\s\\S]*?<\\/section>`))?.[0] || '';
    assert.match(card, /chưa thẩm định độc lập/i, `Handout Slide ${id} must retain the independent-review disclaimer`);
  }
  assert.match(content, /Khi nào có thể cập nhật kết luận/i);
  assert.match(content, /chạy lại đủ 24 điều kiện/i);
  const gateDetails = slides.find(slide => slide.id === 18);
  [...gateDetails.rows, ...gateDetails.failedRows].forEach(row => assert.ok(!content.includes(row[3]), `Handout must not expose internal identifier ${row[3]}`));
  assert.match(content, /không có ngoại lệ đánh giá/i);
  assert.ok(!content.includes('HỌC VIỆN HẢI QUÂN'));
  assert.ok(!content.includes('CHỦ TỊCH HỘI ĐỒNG KHOA HỌC'));
  assert.ok(!content.includes('HỘI ĐỒNG KHOA HỌC KHOA KTCS'));
  assert.ok(!content.includes('Giảng viên cơ học độc lập ký biên bản đánh giá chuyên môn'));
});
test('presentation wording is pedagogical and accessible to non-technical council', () => {
  const scienceSlide = slides.find(s => s.type === 'scientificSample');
  const scienceTakeaway = scienceSlide.takeaway.toLocaleLowerCase('vi-VN');
  assert.ok(!scienceTakeaway.includes('oracle'), 'Scientific evidence slide must not use foreign testing jargon "oracle"');
  assert.ok(scienceTakeaway.includes('diện tích có dấu âm'), 'Scientific evidence slide must explain the cutout convention plainly');

  const validationSlide = slides.find(s => s.type === 'validation');
  assert.ok(!validationSlide.takeaway.toLowerCase().includes('hợp đồng'), 'Scientific limits slide must not use devops jargon "hợp đồng"');

  const evidenceSlide = slides.find(s => s.type === 'evidence');
  assert.ok(evidenceSlide.takeaway.includes('mục/trang hiển thị'), 'Evidence slide must label manifest routes precisely');
  assert.doesNotMatch(slideText(evidenceSlide), /ba ca minh chứng|minh chứng khoa học/i);

  const journeySlide = slides.find(s => s.type === 'journey');
  const journeyTakeaway = journeySlide.takeaway.toLocaleLowerCase('vi-VN');
  assert.ok(journeyTakeaway.includes('thiết kế hướng tới') && journeyTakeaway.includes('tự kiểm tra'));
  assert.match(slideText(journeySlide), /vận hành xuyên suốt.*chưa được xác nhận/i);

  const appendixText = slideText(slides.filter(slide => slide.backup)).toLocaleLowerCase('vi-VN');
  assert.doesNotMatch(appendixText, /\bruntime\b|\bprovisional\b|\bscreen reader\b|\breflow\b|\bfidelity\b/u);
});

test('speaker and operation guides match the revised 13+6 decision scope', () => {
  const guideDir = path.resolve(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu');
  const speakerGuide = fs.readFileSync(path.join(guideDir, 'huong-dan-thuyet-trinh.md'), 'utf8');
  const operationGuide = fs.readFileSync(path.join(guideDir, 'huong-dan-trinh-bay.txt'), 'utf8');
  for (const content of [speakerGuide, operationGuide]) {
    const normalized = content.toLocaleLowerCase('vi-VN');
    assert.ok(content.includes('12:00'));
    assert.ok(content.includes('15:00'));
    assert.ok(normalized.includes('báo cáo kết quả'));
    assert.ok(
      (normalized.includes('chưa') && normalized.includes('signoff'))
      || (normalized.includes('chưa') && normalized.includes('ký xác nhận'))
      || normalized.includes('chưa có chữ ký học thuật độc lập'),
    );
    assert.ok(normalized.includes('s17') || normalized.includes('slide 17'));
    assert.ok(normalized.includes('phát hành') && normalized.includes('phụ lục'));
    assert.ok(content.includes('S13') || content.includes('Slide 13'));
    assert.ok(content.includes('S19') || content.includes('Slide 19'));
    assert.ok(normalized.includes('s05') && normalized.includes('nguyễn lê văn'));
    assert.ok(!content.includes('10 SLIDE CHÍNH') && !content.includes('11 SLIDE CHÍNH'));
    assert.ok(normalized.includes('chưa có chữ ký học thuật độc lập'));
    assert.ok(normalized.includes('ghi nhận việc đã xây dựng hiện vật'));
    assert.ok(normalized.includes('không đề nghị chấp thuận học thuật'));
    assert.ok(normalized.includes('bản web để trình diễn'));
    assert.ok(normalized.includes('θ = 90°') || normalized.includes('θ=90°'));
    assert.ok(!normalized.includes('nghiệm thu có điều kiện'));
    assert.ok(!normalized.includes('chấp nhận có điều kiện'));
  }
  const normalizeWhitespace = text => text.replace(/\s+/g, ' ').trim();
  const normalizedSpeakerGuide = normalizeWhitespace(speakerGuide);
  const normalizedOperationGuide = normalizeWhitespace(operationGuide);
  for (const slide of slides.filter(slide => !slide.backup)) {
    const normalizedTitle = normalizeWhitespace(slide.title);
    assert.ok(normalizedSpeakerGuide.includes(normalizedTitle), `Presenter guide must use the current title for slide ${slide.id}`);
    assert.ok(normalizedOperationGuide.includes(normalizedTitle), `Operation guide must use the current title for slide ${slide.id}`);
  }
});
