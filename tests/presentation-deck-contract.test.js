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
  assert.strictEqual(meta.bufferTime, '3:00');
  const mainSlides = slides.filter(s => !s.backup);
  assert.strictEqual(mainSlides.length, 13, 'Timed presentation retains its agreed scope');
});

test('slide count, main narrative, and backup boundary contract', () => {
  const mainSlides = slides.filter(slide => !slide.backup);
  const backupSlides = slides.filter(slide => slide.backup);
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
      'methodology',
      'resultLimits',
      'conditions',
      'decision',
    ],
    'The timed deck must present results first and limits later',
  );
  assert.deepStrictEqual(backupSlides.map(slide => slide.id), Array.from({ length: slides.length - mainSlides.length }, (_, index) => index + 14));
  assert.ok(backupSlides.every(slide => slide.time === 'backup'));
  slides.forEach((s, idx) => {
    assert.strictEqual(s.id, idx + 1, `Slide at index ${idx} must have id ${idx + 1}`);
    assert.ok(s.type, `Slide ${s.id} must have a type`);
    assert.ok(s.title, `Slide ${s.id} must have a title`);
    assert.ok(s.takeaway, `Slide ${s.id} must have a takeaway`);
    assert.ok(s.speaker, `Slide ${s.id} must have an assigned speaker`);
    assert.ok(Array.isArray(s.script) && s.script.length > 0, `Slide ${s.id} must have speaker script`);
    assert.ok(s.sourceId, `Slide ${s.id} must expose a concise evidence source id`);
    if (s.type === 'methodology') {
      assert.strictEqual(s.nodes.length, 5, `Slide ${s.id} needs a complete five-stage method`);
      assert.ok(s.nodes.every(node => typeof node === 'string' && node.trim()));
      assert.strictEqual(s.cards.length, 4, `Slide ${s.id} needs four explanatory method groups`);
      assert.ok(s.cards.every(card => Array.isArray(card) && card.length === 2 && card.every(value => typeof value === 'string' && value.trim())));
      assert.ok(s.notice, `Slide ${s.id} must disclose its status boundary`);
    }
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
  assert.ok(Array.isArray(truthfulQa.questions) && truthfulQa.questions.length > 0, 'Slide 19 must retain truthful Q&A');
  assert.ok(slideText(truthfulQa).includes(`chạy lại đủ ${acceptanceReport.gateSummary.total} điều kiện`), 'A new release conclusion requires the complete gate set');
  assert.match(slideText(truthfulQa), /không còn.*không đạt.*chưa thể thực hiện.*chưa chạy/i, 'Slide 19 must not imply partial evidence is enough');

  const technicalFields = ['releaseVersion', 'packageSha256', 'hashes'];
  for (const slide of slides.filter(slide => !slide.backup)) {
    for (const field of technicalFields) {
      assert.ok(!(field in slide), `Technical release field "${field}" belongs only in the backup appendix, not Slide ${slide.id}`);
    }
  }
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

test('scope metrics are source-derived without inflating scientific evidence', () => {
  const coverage = slides.find(slide => slide.type === 'coverage');
  const routes = contentManifest.routes;
  const quizCount = [1, 2, 3].reduce((total, chapter) => total + JSON.parse(fs.readFileSync(path.join(ROOT, `data/quiz-ch${chapter}.json`), 'utf8')).items.length, 0);
  const expectedMetrics = [
    String(routes.length),
    String(new Set(routes.flatMap(route => route.figureRefs || [])).size),
    routes.reduce((total, route) => total + (route.equationRefs || []).length, 0).toLocaleString('vi-VN'),
    String(quizCount),
  ];
  assert.deepStrictEqual(coverage.metrics.map(metric => metric[0]), expectedMetrics);
  assert.strictEqual(coverage.supportingRoutes + coverage.chapters.reduce((total, chapter) => total + Number(chapter[0]), 0), routes.length);
});

test('technical detail distinguishes optional 3D from independent simulations and temporal 4D', () => {
  const simulations = slides.find(slide => slide.id === 20);
  const specifications = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/simulation-specifications.json'), 'utf8')).specifications;
  const reviews = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sim3-pedagogical-reviews.json'), 'utf8')).reviews;
  assert.ok(reviews.every(review => specifications.some(specification => specification.id === review.id)), '3D pilots are a subset of existing Sim2 positions');
  const text = slideText([simulations.cards, simulations.notice]);
  assert.match(text, new RegExp(`${specifications.length} vị trí 2D`));
  assert.match(text, new RegExp(`${reviews.length}.*trong số đó`));
  assert.match(text, /3D\+t.*diễn biến thời gian/i);
  assert.match(text, /tham số tĩnh.*không.*4D/i);
  assert.match(text, /(?:lỗi|không khả dụng).*về Sim2/i);
  assert.match(text, /nghiệm.*biên.*đơn vị.*dấu/i);
});

test('media claims are bounded to candidate inventory and separate proposal from existing GIF', () => {
  const media = slides.find(slide => slide.id === 21);
  const summary = JSON.parse(fs.readFileSync(path.join(ROOT, releaseCandidate.summaryPath), 'utf8'));
  const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, path.dirname(releaseCandidate.summaryPath), summary.manifest.path), 'utf8'));
  const gifCount = inventory.files.filter(file => path.extname(file.path).toLowerCase() === '.gif').length;
  const checkedExtensions = new Set(['.aac', '.aif', '.aiff', '.avi', '.flac', '.m4a', '.m4v', '.mkv', '.mov', '.mp3', '.mp4', '.mpeg', '.mpg', '.ogg', '.ogv', '.opus', '.wav', '.webm', '.wma']);
  assert.strictEqual(inventory.files.filter(file => checkedExtensions.has(path.extname(file.path).toLowerCase())).length, 0);
  const text = slideText(media.cards);
  assert.match(text, new RegExp(`${gifCount} GIF`));
  assert.match(text, /PNG/i);
  assert.match(text, /giảm chuyển động/i);
  assert.match(text, /danh mục gói ứng viên.*đuôi.*kiểm kê/i);
  assert.match(text, /pilot.*không phải.*video/i);
  assert.match(slideText(media), /bổ sung.*duyệt/i);
  assert.match(slideText(media), /phụ đề.*chép lời/i);
});

test('packaging does not claim successful LMS use or unimplemented standards', () => {
  const packaging = slides.find(slide => slide.id === 22);
  const targets = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lms-targets.json'), 'utf8'));
  assert.strictEqual(targets.status, 'not-executed');
  const text = slideText(packaging.cards);
  assert.match(text, new RegExp(`một lựa chọn.*tối đa ${targets.stages.qti3.maximumValidationItems}`));
  assert.match(text, /CC 1\.4.*static webcontent/i);
  assert.match(text, /kiểm adapter.*không.*nhập.*LMS/i);
  assert.match(text, /SCORM.*xAPI\/cmi5.*chưa triển khai/i);
  assert.match(text, /ZIP.*không.*SCORM/i);
  assert.match(slideText(packaging.notice), /lịch sử.*không.*QA mới/i);
});

test('search and learner feedback do not overclaim semantic search or formal assessment', () => {
  const learning = slides.find(slide => slide.id === 23);
  const quizCount = [1, 2, 3].reduce((total, chapter) => total + JSON.parse(fs.readFileSync(path.join(ROOT, `data/quiz-ch${chapter}.json`), 'utf8')).items.length, 0);
  const text = slideText(learning.cards);
  assert.match(text, /có dấu\/không dấu/i);
  assert.match(text, /không.*công thức ngữ nghĩa.*PDF/i);
  assert.match(text, new RegExp(`${quizCount} câu`));
  assert.match(text, /cục bộ.*chưa.*danh tính.*sổ điểm.*LMS/i);
  assert.match(text, /rubric.*duyệt/i);
  assert.match(slideText(learning.notice), /không chứng minh.*đầu ra.*hiệu quả học tập/i);
});

test('council feedback request includes inspectable outcome and quiz evidence', () => {
  const feedback = slides.find(slide => slide.type === 'conditions');
  const outcomes = slides.find(slide => slide.type === 'outcomes');
  assert.ok(Array.isArray(feedback.quizExamples) && feedback.quizExamples.length === 3, 'Slide 12 must show three representative quiz items');
  feedback.quizExamples.forEach(example => {
    assert.strictEqual(example.length, 4);
    assert.ok(example[1], 'Representative quiz item must show its question');
    assert.ok(example[2], 'Representative quiz item must show its correct answer');
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
  const observedDates = acceptanceReport.gates.map(gate => gate.observedAt.slice(0, 10));
  const snapshotDate = [...new Set(observedDates)].sort((left, right) => observedDates.filter(date => date === right).length - observedDates.filter(date => date === left).length)[0];
  assert.strictEqual(release.snapshotDate, snapshotDate);
  assert.strictEqual(release.latestEvidenceDate, [...observedDates].sort().at(-1));
  assert.deepStrictEqual(release.metrics.map(metric => Number(metric[0])), ['pass', 'fail', 'blocked'].map(status => acceptanceReport.gateSummary[status]));
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
    assert.strictEqual(result.total, slides.length);
    assert.strictEqual(result.main, slides.filter(slide => !slide.backup).length);
    assert.strictEqual(result.backup, slides.filter(slide => slide.backup).length);
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

test('presentation HTML renders every main and appendix slide', () => {
  const htmlPath = path.resolve(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/presentation-slides.html');
  assert.ok(fs.existsSync(htmlPath), 'HTML presentation deck must exist');
  const content = fs.readFileSync(htmlPath, 'utf8');
  assert.strictEqual((content.match(/<article class="slide/g) || []).length, slides.length);
  slides.forEach(slide => {
    assert.ok(content.includes(`data-id="${slide.id}"`), `HTML deck must render Slide ${slide.id}`);
    assert.ok(htmlContains(content, slide.title), `HTML deck must retain Slide ${slide.id} title`);
    assert.ok(htmlContains(content, slide.takeaway), `HTML deck must retain Slide ${slide.id} takeaway`);
  });
  for (const id of [6, 7, 8]) {
    const article = content.match(new RegExp(`<article class="slide[^>]*data-id="${id}"[\\s\\S]*?<\\/article>`))?.[0] || '';
    assert.match(article, /chưa thẩm định độc lập/i, `HTML Slide ${id} must retain the independent-review disclaimer`);
  }
  assert.ok(content.includes(releaseCandidate.releaseVersion));
  assert.ok(content.includes(releaseCandidate.packageSha256));
  assert.ok(content.includes('data-backup="true"'));
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
  assert.strictEqual((content.match(/<section class="card(?:\s|")/g) || []).length, slides.length);
  slides.forEach(slide => {
    assert.ok(content.includes(`data-id="${slide.id}"`), `Handout must render Slide ${slide.id}`);
    assert.ok(htmlContains(content, slide.title), `Handout must retain Slide ${slide.id} title`);
    assert.ok(htmlContains(content, slide.takeaway), `Handout must retain Slide ${slide.id} takeaway`);
    const card = content.match(new RegExp(`<section class="card[^>]*data-id="${slide.id}"[\\s\\S]*?<\\/section>`))?.[0] || '';
    for (const item of collectVisualItems(slide)) {
      assert.ok(htmlContains(card, item), `Handout Slide ${slide.id} must retain: ${item}`);
    }
  });
  assert.ok(content.includes('@media print'));
  assert.ok(content.includes('không đề nghị chấp thuận học thuật'));
  for (const id of [6, 7, 8]) {
    const card = content.match(new RegExp(`<section class="card[^>]*data-id="${id}"[\\s\\S]*?<\\/section>`))?.[0] || '';
    assert.match(card, /chưa thẩm định độc lập/i, `Handout Slide ${id} must retain the independent-review disclaimer`);
  }
  assert.match(content, /Khi nào có thể cập nhật kết luận/i);
  assert.ok(htmlContains(content, `chạy lại đủ ${acceptanceReport.gateSummary.total} điều kiện`));
  const gateDetails = slides.find(slide => slide.id === 18);
  [...gateDetails.rows, ...gateDetails.failedRows].forEach(row => assert.ok(!content.includes(row[3]), `Handout must not expose internal identifier ${row[3]}`));
  assert.match(content, /không có ngoại lệ đánh giá/i);
  assert.ok(!content.includes('Giảng viên cơ học độc lập ký biên bản đánh giá chuyên môn'));
});

test('speaker and operation guides preserve timing and authority boundaries', () => {
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
    assert.ok(normalized.includes('chưa có chữ ký học thuật độc lập'));
    assert.ok(normalized.includes('ghi nhận việc đã xây dựng hiện vật'));
    assert.ok(normalized.includes('không đề nghị chấp thuận học thuật'));
    assert.ok(normalized.includes('bản web để trình diễn'));
    assert.ok(normalized.includes('θ = 90°') || normalized.includes('θ=90°'));
    assert.ok(!normalized.includes('nghiệm thu có điều kiện'));
    assert.ok(!normalized.includes('chấp nhận có điều kiện'));
  }
});
