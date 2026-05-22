const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const EXPECTED_COUNT = 100;
const EXPECTED_NEW_ANSWER_DISTRIBUTION = { 0: 13, 1: 13, 2: 12, 3: 12 };
const TARGET_DISTRIBUTION_BY_CHAPTER = {
  ch1: { I: 12, II: 9, III: 9, IV: 18, V: 32, VI: 5, VII: 15 },
  ch2: { I: 15, II: 11, III: 10, IV: 14, V: 24, VI: 11, VII: 15 },
  ch3: { I: 10, II: 27, III: 11, IV: 9, V: 14, VI: 14, VII: 15 },
};
const UNSAFE_TEXT = /<\s*script|on\w+\s*=|javascript:/i;
const VIETNAMESE_MARKS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
const TEMPLATE_TEXT = /^(Chon phat bieu dung ve|Nhan dinh dung:|Nhan dinh sai vi)/;

function readQuiz(chapter) {
  const filePath = path.join(ROOT, 'data', `quiz-${chapter}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeQuestion(question) {
  return question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function assertSafeText(value, label) {
  assert.strictEqual(typeof value, 'string', `${label} must be a string`);
  assert.ok(value.trim(), `${label} must not be empty`);
  assert.ok(!UNSAFE_TEXT.test(value), `${label} contains unsafe HTML/script-like text`);
}

function assertQuizItem(chapter, item, index, allowedSections) {
  const label = `${chapter}[${index}]`;
  assertSafeText(item.question, `${label}.question`);
  if (index >= 50) {
    assert.ok(VIETNAMESE_MARKS.test(item.question), `${label}.question must use Vietnamese diacritics`);
  }
  assert.ok(!TEMPLATE_TEXT.test(item.question), `${label}.question must not use generated template text`);
  assert.ok(Array.isArray(item.options), `${label}.options must be an array`);
  assert.strictEqual(item.options.length, 4, `${label}.options must have 4 choices`);
  item.options.forEach((option, optionIndex) => {
    assertSafeText(option, `${label}.options[${optionIndex}]`);
    assert.ok(!TEMPLATE_TEXT.test(option), `${label}.options[${optionIndex}] must not use generated template text`);
  });
  assert.ok(Number.isInteger(item.correct), `${label}.correct must be an integer`);
  assert.ok(item.correct >= 0 && item.correct <= 3, `${label}.correct must be in 0..3`);
  const generatedCorrectIndex = item.options.findIndex(option => option.startsWith('Nhan dinh dung:'));
  if (generatedCorrectIndex >= 0) {
    assert.strictEqual(
      item.correct,
      generatedCorrectIndex,
      `${label}.correct must point to the generated correct option`
    );
  }
  assert.ok(allowedSections.has(item.section), `${label}.section '${item.section}' is not allowed`);
  assertSafeText(item.feedbackCorrect, `${label}.feedbackCorrect`);
  assertSafeText(item.feedbackWrong, `${label}.feedbackWrong`);
}

function getPagesQuizData() {
  const pagesPath = path.join(ROOT, 'js', 'pages.js');
  const source = fs.readFileSync(pagesPath, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${source}\nthis.QUIZ_DATA = QUIZ_DATA;`, sandbox, { filename: pagesPath });
  return sandbox.QUIZ_DATA;
}

function assertChapter(chapter) {
  const quiz = readQuiz(chapter);
  const targetDistribution = TARGET_DISTRIBUTION_BY_CHAPTER[chapter];
  const allowedSections = new Set(Object.keys(targetDistribution));
  const distribution = {};
  const newAnswerDistribution = {};
  const seen = new Map();

  assert.strictEqual(quiz.length, EXPECTED_COUNT, `${chapter} must have ${EXPECTED_COUNT} questions, got ${quiz.length}`);

  quiz.forEach((item, index) => {
    assertQuizItem(chapter, item, index, allowedSections);
    distribution[item.section] = (distribution[item.section] || 0) + 1;

    const normalized = normalizeQuestion(item.question);
    assert.ok(!seen.has(normalized), `${chapter} duplicate question: ${item.question}`);
    seen.set(normalized, index);

    if (index >= 50) {
      newAnswerDistribution[item.correct] = (newAnswerDistribution[item.correct] || 0) + 1;
    }
  });

  assert.deepStrictEqual(distribution, targetDistribution, `${chapter} section distribution mismatch`);
  assert.deepStrictEqual(
    newAnswerDistribution,
    EXPECTED_NEW_ANSWER_DISTRIBUTION,
    `${chapter} new questions answer distribution mismatch`
  );
}

for (const chapter of Object.keys(TARGET_DISTRIBUTION_BY_CHAPTER)) {
  assertChapter(chapter);
}

const bundledQuiz = getPagesQuizData();
for (const chapter of Object.keys(TARGET_DISTRIBUTION_BY_CHAPTER)) {
  const fileName = `quiz-${chapter}.json`;
  const quiz = readQuiz(chapter);
  assert.ok(Array.isArray(bundledQuiz[fileName]), `QUIZ_DATA['${fileName}'] must exist`);
  assert.strictEqual(
    bundledQuiz[fileName].length,
    EXPECTED_COUNT,
    `QUIZ_DATA['${fileName}'] must have ${EXPECTED_COUNT} questions`
  );
  assert.strictEqual(
    JSON.stringify(bundledQuiz[fileName]),
    JSON.stringify(quiz),
    `QUIZ_DATA['${fileName}'] must match data/${fileName}; run python tools\\bundle_pages.py`
  );
}

console.log('quiz-bank-schema: PASS');
