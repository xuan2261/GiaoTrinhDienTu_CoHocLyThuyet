const assert = require('assert');
const QuizRuntime = require('../js/quiz-state.js');

const bank = QuizRuntime.normalizeBank({
  schemaVersion: 2,
  assessmentMetadata: { passPolicy: { id: 'quiz-v2-pass-70', minimumPercent: 70 } },
  items: Array.from({ length: 12 }, (_, index) => ({
    id: `quiz-ch1-${String(index + 1).padStart(3, '0')}`,
    chapter: 'ch1', section: 'I', learningOutcomeIds: ['lo-ch1-statics'],
    difficulty: 'foundation', type: 'single-choice', sourceRef: 'data/quiz-ch1.json',
    question: `Question ${index}`, options: ['A', 'B', 'C', 'D'], correct: index % 4,
    explanation: 'Explanation', feedbackCorrect: 'Correct', feedbackWrong: 'Wrong',
  })),
}, 'ch1');

const first = QuizRuntime.createAttempt(bank, { chapter: 'ch1', mode: 'random', seed: 'stable-seed', now: 1000 });
const second = QuizRuntime.createAttempt(bank, { chapter: 'ch1', mode: 'random', seed: 'stable-seed', now: 1000 });
assert.deepStrictEqual(first.questionIds, second.questionIds, 'same seed must yield identical selection and order');
assert.strictEqual(first.questionIds.length, 10);
assert.strictEqual(first.schemaVersion, 2);
assert.strictEqual(first.status, 'active');
assert.deepStrictEqual(first.answersByQuestionId, {});

const answeredQuestion = bank.items.find(item => item.id === first.questionIds[0]);
const answered = QuizRuntime.recordAnswer(first, answeredQuestion.id, answeredQuestion.correct, bank, 2000);
assert.strictEqual(answered.answersByQuestionId[answeredQuestion.id], answeredQuestion.correct);
assert.strictEqual(answered.correct, 1);
assert.strictEqual(answered.status, 'active');

const complete = QuizRuntime.completeAttempt({ ...answered, answersByQuestionId: Object.fromEntries(answered.questionIds.map(id => [id, 0])) }, bank, 3000);
assert.strictEqual(complete.status, 'completed');
assert.strictEqual(complete.elapsed, 2);
assert.strictEqual(complete.passPolicyRef, 'quiz-v2-pass-70');
assert.strictEqual(complete.percent, Math.round((complete.correct / 10) * 100));

const storage = new Map([['chlyt_quiz_attempts', '{bad json'], ['quizScores', '{also bad']]);
let writes = 0;
const adapter = { getItem: key => storage.get(key) || null, setItem: (key, value) => { writes += 1; storage.set(key, value); } };
assert.deepStrictEqual(QuizRuntime.readStore(adapter), QuizRuntime.emptyStore(), 'corrupt stores must not crash');
const legacyStorage = new Map([['quizScores', JSON.stringify({ 'ch1-all-all': { correct: 4, wrong: 1, total: 10, answered: 5 } })]]);
let migrationWrites = 0;
const legacyAdapter = { getItem: key => legacyStorage.get(key) || null, setItem: (key, value) => { migrationWrites += 1; legacyStorage.set(key, value); } };
const migrated = QuizRuntime.readStore(legacyAdapter);
assert.deepStrictEqual(migrated.legacyScores['ch1-all-all'], { correct: 4, wrong: 1, total: 10, answered: 5 }, 'legacy aggregate scores must migrate without pretending answers are restorable');
QuizRuntime.saveAttempt(legacyAdapter, migrated, first, 'ch1|random|all');
assert.strictEqual(migrationWrites, 1, 'lazy migration must write only the v2 namespace once');
assert.ok(JSON.parse(legacyStorage.get('chlyt_quiz_attempts')).legacyScores['ch1-all-all']);
const stale = { ...complete, completedAt: Date.now() - (181 * 24 * 60 * 60 * 1000) };
const oversized = { ...QuizRuntime.emptyStore(), history: Array.from({ length: 25 }, (_, index) => ({ ...complete, attemptId: String(index), completedAt: Date.now() - index })) };
const saved = QuizRuntime.saveAttempt(adapter, oversized, stale, 'ch1|all|all');
assert.strictEqual(writes, 1, 'a state update must use one atomic setItem write');
assert.strictEqual(saved.history.length, 20, 'history must be capped');
assert.ok(saved.history.every(item => item.completedAt > Date.now() - (180 * 24 * 60 * 60 * 1000)), 'history must retain at most 180 days');

const failingStorage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } };
assert.strictEqual(QuizRuntime.trySaveAttempt(failingStorage, QuizRuntime.emptyStore(), first, 'ch1|all|all').ok, false, 'quota errors must be reported without throwing');

const sharedState = new Map();
let sharedWrites = 0;
const sharedAdapter = {
  getItem: key => sharedState.get(key) || null,
  setItem: (key, value) => { sharedWrites += 1; sharedState.set(key, value); },
};
const concurrentBase = QuizRuntime.createAttempt(bank, { chapter: 'ch1', mode: 'random', seed: 'concurrent', now: 4000 });
const answerA = QuizRuntime.recordAnswer(concurrentBase, concurrentBase.questionIds[0], 0, bank, 5000);
const answerB = QuizRuntime.recordAnswer(concurrentBase, concurrentBase.questionIds[1], 1, bank, 6000);
const committedA = QuizRuntime.tryCommitAttempt(sharedAdapter, answerA, 'ch1|random|all', bank);
const committedB = QuizRuntime.tryCommitAttempt(sharedAdapter, answerB, 'ch1|random|all', bank);
assert.strictEqual(committedA.ok, true);
assert.strictEqual(committedB.ok, true);
assert.deepStrictEqual(committedB.attempt.answersByQuestionId, {
  [concurrentBase.questionIds[0]]: 0,
  [concurrentBase.questionIds[1]]: 1,
}, 'concurrent same-attempt writes must merge answers instead of replacing progress');
assert.strictEqual(sharedWrites, 2, 'each accepted concurrent update must use one setItem write');

const malformed = {
  ...concurrentBase,
  status: 'completed',
  completedAt: 7000,
  answersByQuestionId: {},
};
assert.strictEqual(
  QuizRuntime.restoreAttempt(malformed, bank, { chapter: 'ch1', mode: 'random', section: null }),
  null,
  'incomplete completed attempts must not restore as non-answerable active state'
);

const scopedBank = QuizRuntime.normalizeBank({
  schemaVersion: 2,
  assessmentMetadata: { passPolicy: { id: 'quiz-v2-pass-70', minimumPercent: 70 } },
  items: bank.items.slice(0, 5).map((item, index) => ({ ...item, id: `quiz-ch1-vi-${index + 1}`, section: 'VI' })),
}, 'ch1');
assert.strictEqual(
  QuizRuntime.selectQuestions(scopedBank, { mode: 'random', section: 'VI', seed: 'scoped' }).length,
  5,
  'random selection must not claim more questions than the selected section contains',
);
const sanitizedSelection = QuizRuntime.sanitizeStore({
  ...QuizRuntime.emptyStore(),
  selectedSections: { ch1: 'VI', ch2: 'I', ch3: 'VIII', unknown: 'II' },
});
assert.deepStrictEqual(
  sanitizedSelection.selectedSections,
  { ch1: 'VI', ch2: 'I' },
  'only known chapters and I–VII section preferences may persist',
);
const scopedStorageData = new Map();
let scopedWrites = 0;
const scopedStorage = {
  getItem: key => scopedStorageData.get(key) || null,
  setItem: (key, value) => { scopedWrites += 1; scopedStorageData.set(key, value); },
};
const scopedAttempt = QuizRuntime.createAttempt(scopedBank, {
  chapter: 'ch1', mode: 'random', section: 'VI', seed: 'section-preference', now: 8000,
});
const committedScopedAttempt = QuizRuntime.tryCommitAttempt(
  scopedStorage,
  scopedAttempt,
  'ch1|random|VI',
  scopedBank,
  { selectedMode: { chapter: 'ch1', mode: 'random' }, selectedSection: { chapter: 'ch1', section: 'VI' } },
);
assert.strictEqual(committedScopedAttempt.ok, true);
assert.strictEqual(scopedWrites, 1, 'attempt and selected section must commit atomically');
assert.deepStrictEqual(committedScopedAttempt.store.selectedSections, { ch1: 'VI' });

console.log('quiz scoped selection: PASS');
console.log('quiz-state-migration: PASS');
