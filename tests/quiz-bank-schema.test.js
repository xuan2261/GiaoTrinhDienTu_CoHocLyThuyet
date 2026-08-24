const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const QuizRuntime = require('../js/quiz-state.js');
const ROOT = path.resolve(__dirname, '..');
const EXPECTED_COUNT = 100;
const EXPECTED_NEW_ANSWER_DISTRIBUTION = { 0: 13, 1: 13, 2: 12, 3: 12 };
const TARGET_DISTRIBUTION_BY_CHAPTER = {
  ch1: { I: 12, II: 9, III: 9, IV: 18, V: 32, VI: 5, VII: 15 },
  ch2: { I: 15, II: 11, III: 10, IV: 14, V: 24, VI: 11, VII: 15 },
  ch3: { I: 10, II: 27, III: 11, IV: 9, V: 14, VI: 14, VII: 15 },
};
const EXPECTED_CONTENT_HASHES = {
  ch1: 'cb5e7f8cabfcd8b1a6038c98d0c35e550c02d24455644008799d7610c10467da',
  ch2: '13a1e4b2cfc00dc609ae1aee3452e834c33ceef1dd037c1cd8e4515a20ef5e0d',
  ch3: 'd369db9c929905eaae75c6693c09cdbca09473e26465710945d351aeeef49e92',
};
const UNSAFE_TEXT = /<\s*script|on\w+\s*=|javascript:/i;
const VIETNAMESE_MARKS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
const TEMPLATE_TEXT = /^(Chon phat bieu dung ve|Nhan dinh dung:|Nhan dinh sai vi)/;

function readQuiz(chapter) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', `quiz-${chapter}.json`), 'utf8'));
}

function normalizeQuestion(question) {
  return question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function authoredHash(items) {
  return crypto.createHash('sha256').update(JSON.stringify(items.map(({ question, options, correct, feedbackCorrect, feedbackWrong }) => ({ question, options, correct, feedbackCorrect, feedbackWrong })))).digest('hex');
}

function assertSafeText(value, label) {
  assert.strictEqual(typeof value, 'string', `${label} must be a string`);
  assert.ok(value.trim(), `${label} must not be empty`);
  assert.ok(!UNSAFE_TEXT.test(value), `${label} contains unsafe HTML/script-like text`);
}

function assertQuizItem(chapter, item, index, allowedSections, expectedIds, outcomeIds) {
  const label = `${chapter}[${index}]`;
  assert.strictEqual(item.id, expectedIds[index], `${label}.id must remain map-stable`);
  assert.strictEqual(item.chapter, chapter, `${label}.chapter`);
  assertSafeText(item.question, `${label}.question`);
  if (index >= 50) assert.ok(VIETNAMESE_MARKS.test(item.question), `${label}.question must use Vietnamese diacritics`);
  assert.ok(!TEMPLATE_TEXT.test(item.question), `${label}.question must not use generated template text`);
  assert.ok(Array.isArray(item.options) && item.options.length === 4, `${label}.options must have 4 choices`);
  item.options.forEach((option, optionIndex) => { assertSafeText(option, `${label}.options[${optionIndex}]`); assert.ok(!TEMPLATE_TEXT.test(option), `${label}.options[${optionIndex}] must not use generated template text`); });
  assert.ok(Number.isInteger(item.correct) && item.correct >= 0 && item.correct <= 3, `${label}.correct must be in 0..3`);
  assert.ok(allowedSections.has(item.section), `${label}.section '${item.section}' is not allowed`);
  assert.ok(Array.isArray(item.learningOutcomeIds) && item.learningOutcomeIds.length, `${label}.learningOutcomeIds`);
  item.learningOutcomeIds.forEach(id => assert.ok(outcomeIds.has(id), `${label}.learningOutcomeIds resolves ${id}`));
  assert.ok(['foundation', 'intermediate', 'advanced'].includes(item.difficulty), `${label}.difficulty`);
  assert.strictEqual(item.type, 'single-choice', `${label}.type`);
  assertSafeText(item.sourceRef, `${label}.sourceRef`);
  assertSafeText(item.explanation, `${label}.explanation`);
  assertSafeText(item.feedbackCorrect, `${label}.feedbackCorrect`);
  assertSafeText(item.feedbackWrong, `${label}.feedbackWrong`);
}

function getPagesQuizData() {
  const pagesPath = path.join(ROOT, 'js', 'pages.js');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${fs.readFileSync(pagesPath, 'utf8')}\nthis.QUIZ_DATA = QUIZ_DATA;`, sandbox, { filename: pagesPath });
  return sandbox.QUIZ_DATA;
}

const mapItems = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'quiz-learning-map.json'), 'utf8')).items;
const outcomeIds = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'learning-outcomes.json'), 'utf8')).learningOutcomes.map(outcome => outcome.id));
for (const chapter of Object.keys(TARGET_DISTRIBUTION_BY_CHAPTER)) {
  const bank = readQuiz(chapter);
  const targetDistribution = TARGET_DISTRIBUTION_BY_CHAPTER[chapter];
  assert.strictEqual(bank.schemaVersion, 2, `${chapter} must use schema v2`);
  assert.deepStrictEqual(bank.assessmentMetadata.difficultyVocabulary, ['foundation', 'intermediate', 'advanced']);
  assert.deepStrictEqual(bank.assessmentMetadata.passPolicy, { id: 'quiz-v2-pass-70', minimumPercent: 70 });
  assert.strictEqual(bank.items.length, EXPECTED_COUNT, `${chapter} must have 100 questions`);
  const expectedIds = mapItems.filter(item => item.sourceFile === `data/quiz-${chapter}.json`).sort((a, b) => a.sourceIndex - b.sourceIndex).map(item => item.id);
  const distribution = {};
  const answerDistribution = {};
  const seenQuestions = new Set();
  const seenIds = new Set();
  bank.items.forEach((item, index) => {
    assertQuizItem(chapter, item, index, new Set(Object.keys(targetDistribution)), expectedIds, outcomeIds);
    assert.ok(!seenIds.has(item.id), `${chapter} duplicate id ${item.id}`); seenIds.add(item.id);
    const normalized = normalizeQuestion(item.question); assert.ok(!seenQuestions.has(normalized), `${chapter} duplicate question`); seenQuestions.add(normalized);
    distribution[item.section] = (distribution[item.section] || 0) + 1;
    if (index >= 50) answerDistribution[item.correct] = (answerDistribution[item.correct] || 0) + 1;
  });
  assert.deepStrictEqual(distribution, targetDistribution, `${chapter} section distribution mismatch`);
  assert.deepStrictEqual(answerDistribution, EXPECTED_NEW_ANSWER_DISTRIBUTION, `${chapter} new questions answer distribution mismatch`);
  assert.strictEqual(authoredHash(bank.items), EXPECTED_CONTENT_HASHES[chapter], `${chapter} authored assessment semantics changed`);
  assert.deepStrictEqual(QuizRuntime.normalizeBank([{ question: 'Fixture', options: ['A', 'B', 'C', 'D'], correct: 0, section: 'I', feedbackCorrect: 'Đúng', feedbackWrong: 'Sai' }], 'ch1').items[0].id, 'legacy-ch1-001');
}

const bundledQuiz = getPagesQuizData();
for (const chapter of Object.keys(TARGET_DISTRIBUTION_BY_CHAPTER)) {
  const fileName = `quiz-${chapter}.json`;
  assert.strictEqual(JSON.stringify(bundledQuiz[fileName]), JSON.stringify(readQuiz(chapter)), `QUIZ_DATA['${fileName}'] must match data/${fileName}; run python tools\\bundle_pages.py`);
}

console.log('quiz-bank-schema: PASS');
