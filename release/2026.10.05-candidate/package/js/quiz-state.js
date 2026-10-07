(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.QuizRuntime = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SCHEMA_VERSION = 2;
  const STORAGE_KEY = 'chlyt_quiz_attempts';
  const HISTORY_LIMIT = 20;
  const RETENTION_MS = 180 * 24 * 60 * 60 * 1000;

  function normalizeBank(raw, chapter) {
    const isV2 = raw && raw.schemaVersion === SCHEMA_VERSION && Array.isArray(raw.items);
    const source = isV2 ? raw.items : (Array.isArray(raw) ? raw : []);
    const items = source.map((item, index) => ({
      ...item,
      id: item.id || `legacy-${chapter}-${String(index + 1).padStart(3, '0')}`,
      chapter: item.chapter || chapter,
      learningOutcomeIds: item.learningOutcomeIds || [],
      difficulty: item.difficulty || 'foundation',
      type: item.type || 'single-choice',
      sourceRef: item.sourceRef || `data/quiz-${chapter}.json#${index + 1}`,
      explanation: item.explanation || item.feedbackWrong || '',
    }));
    return {
      schemaVersion: SCHEMA_VERSION,
      assessmentMetadata: isV2 ? raw.assessmentMetadata : { difficultyVocabulary: ['foundation', 'intermediate', 'advanced'], passPolicy: { id: 'legacy-unscored', minimumPercent: 0 } },
      items,
    };
  }

  function hashSeed(seed) {
    let value = 2166136261;
    for (let index = 0; index < String(seed).length; index += 1) value = Math.imul(value ^ String(seed).charCodeAt(index), 16777619);
    return value >>> 0;
  }

  function seededOrder(items, seed) {
    const ordered = [...items];
    let state = hashSeed(seed) || 1;
    for (let index = ordered.length - 1; index > 0; index -= 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      const swapIndex = state % (index + 1);
      [ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]];
    }
    return ordered;
  }

  function selectQuestions(bank, options) {
    let items = bank.items.filter(item => !options.section || item.section === options.section);
    if (options.mode === 'random') items = seededOrder(items, options.seed).slice(0, 10);
    return items;
  }

  function scoreAttempt(attempt, bank) {
    const byId = new Map(bank.items.map(item => [item.id, item]));
    let correct = 0;
    let wrong = 0;
    attempt.questionIds.forEach(id => {
      if (!(id in attempt.answersByQuestionId)) return;
      if (byId.get(id) && byId.get(id).correct === attempt.answersByQuestionId[id]) correct += 1;
      else wrong += 1;
    });
    const answered = correct + wrong;
    return { correct, wrong, answered, percent: attempt.questionIds.length ? Math.round((correct / attempt.questionIds.length) * 100) : 0 };
  }

  function createAttempt(bank, options) {
    const selected = selectQuestions(bank, options);
    const now = options.now || Date.now();
    const questionIds = selected.map(item => item.id);
    return {
      attemptId: `${options.chapter}:${options.mode}:${options.section || 'all'}:${options.seed}`,
      schemaVersion: SCHEMA_VERSION, chapter: options.chapter, mode: options.mode, section: options.section || null, seed: String(options.seed),
      questionIds, order: [...questionIds], answersByQuestionId: {}, startedAt: now, updatedAt: now, completedAt: null, elapsed: 0,
      correct: 0, wrong: 0, percent: 0, passPolicyRef: bank.assessmentMetadata.passPolicy.id, status: 'active',
    };
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function restoreAttempt(attempt, bank, options) {
    if (!isPlainObject(attempt) || attempt.schemaVersion !== SCHEMA_VERSION) return null;
    const section = options.section || null;
    if (attempt.chapter !== options.chapter || attempt.mode !== options.mode || (attempt.section || null) !== section) return null;
    if (typeof attempt.attemptId !== 'string' || !attempt.attemptId || typeof attempt.seed !== 'string') return null;
    if (!Array.isArray(attempt.questionIds) || !Array.isArray(attempt.order) || !isPlainObject(attempt.answersByQuestionId)) return null;
    const expectedIds = selectQuestions(bank, { ...options, seed: attempt.seed }).map(item => item.id);
    if (attempt.questionIds.length !== new Set(attempt.questionIds).size || attempt.questionIds.length !== expectedIds.length) return null;
    if (!attempt.questionIds.every((id, index) => id === expectedIds[index] && attempt.order[index] === id)) return null;
    const byId = new Map(bank.items.map(item => [item.id, item]));
    const answers = {};
    for (const [id, picked] of Object.entries(attempt.answersByQuestionId)) {
      const question = byId.get(id);
      if (!attempt.questionIds.includes(id) || !question || !Number.isInteger(picked) || picked < 0 || picked >= question.options.length) return null;
      answers[id] = picked;
    }
    if (![attempt.startedAt, attempt.updatedAt].every(value => Number.isFinite(value) && value >= 0) || attempt.updatedAt < attempt.startedAt) return null;
    const complete = attempt.status === 'completed';
    if ((!complete && attempt.status !== 'active') || (complete && (Object.keys(answers).length !== expectedIds.length || !Number.isFinite(attempt.completedAt)))) return null;
    if (!complete && attempt.completedAt !== null) return null;
    return { ...attempt, section, questionIds: [...expectedIds], order: [...expectedIds], answersByQuestionId: answers, ...scoreAttempt({ ...attempt, questionIds: expectedIds, answersByQuestionId: answers }, bank) };
  }

  function mergeAttempts(stored, incoming, bank) {
    if (!stored || stored.attemptId !== incoming.attemptId) return stored || incoming;
    const answers = { ...stored.answersByQuestionId };
    Object.entries(incoming.answersByQuestionId).forEach(([id, picked]) => {
      if (!(id in answers)) answers[id] = picked;
    });
    const updatedAt = Math.max(stored.updatedAt, incoming.updatedAt);
    const merged = { ...stored, answersByQuestionId: answers, updatedAt, ...scoreAttempt({ ...stored, answersByQuestionId: answers }, bank) };
    if (Object.keys(answers).length === merged.questionIds.length) {
      if (stored.status === 'completed') return merged;
      return completeAttempt({ ...merged, status: 'active', completedAt: null }, bank, updatedAt);
    }
    return { ...merged, status: 'active', completedAt: null };
  }

  function recordAnswer(attempt, questionId, picked, bank, now) {
    if (attempt.status !== 'active' || !attempt.questionIds.includes(questionId) || questionId in attempt.answersByQuestionId) return attempt;
    const next = { ...attempt, answersByQuestionId: { ...attempt.answersByQuestionId, [questionId]: picked }, updatedAt: now || Date.now() };
    return { ...next, ...scoreAttempt(next, bank) };
  }

  function completeAttempt(attempt, bank, now) {
    const completedAt = now || Date.now();
    const scored = scoreAttempt(attempt, bank);
    return { ...attempt, ...scored, status: 'completed', completedAt, updatedAt: completedAt, elapsed: Math.max(0, Math.round((completedAt - attempt.startedAt) / 1000)), passPolicyRef: bank.assessmentMetadata.passPolicy.id };
  }

  function emptyStore() { return { schemaVersion: SCHEMA_VERSION, activeAttempts: {}, history: [], legacyScores: {}, selectedModes: {}, selectedSections: {} }; }
  function sanitizeLegacyScores(scores) {
    if (!scores || typeof scores !== 'object' || Array.isArray(scores)) return {};
    const result = {};
    Object.entries(scores).forEach(([key, value]) => {
      if (!/^ch[123]-(?:all|random)-[a-z0-9-]+$/i.test(key) || !value || typeof value !== 'object') return;
      const summary = {};
      ['correct', 'wrong', 'total', 'answered'].forEach(field => { if (Number.isFinite(value[field]) && value[field] >= 0) summary[field] = value[field]; });
      if (Object.keys(summary).length) result[key] = summary;
    });
    return result;
  }
  function sanitizeStore(store, now = Date.now()) {
    if (!store || store.schemaVersion !== SCHEMA_VERSION || typeof store !== 'object') return emptyStore();
    const cutoff = now - RETENTION_MS;
    const history = Array.isArray(store.history) ? store.history.filter(item => item && item.status === 'completed' && Number.isFinite(item.completedAt) && item.completedAt > cutoff).sort((a, b) => b.completedAt - a.completedAt).slice(0, HISTORY_LIMIT) : [];
    const selectedModes = Object.fromEntries(Object.entries(store.selectedModes || {}).filter(([chapter, mode]) => /^ch[123]$/.test(chapter) && ['all', 'random'].includes(mode)));
    const selectedSections = Object.fromEntries(Object.entries(store.selectedSections || {}).filter(([chapter, section]) => /^ch[123]$/.test(chapter) && ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].includes(section)));
    return { schemaVersion: SCHEMA_VERSION, activeAttempts: store.activeAttempts && typeof store.activeAttempts === 'object' && !Array.isArray(store.activeAttempts) ? store.activeAttempts : {}, history, legacyScores: sanitizeLegacyScores(store.legacyScores), selectedModes, selectedSections };
  }
  function readStore(storage) {
    let current = null;
    try { current = JSON.parse(storage.getItem(STORAGE_KEY) || 'null'); } catch (_) {}
    if (current && current.schemaVersion === SCHEMA_VERSION) return sanitizeStore(current);
    let legacy = null;
    try { legacy = JSON.parse(storage.getItem('quizScores') || 'null'); } catch (_) {}
    return { ...emptyStore(), legacyScores: sanitizeLegacyScores(legacy) };
  }
  function saveAttempt(storage, store, attempt, key) {
    const next = sanitizeStore(store);
    next.activeAttempts = { ...next.activeAttempts, [key]: attempt };
    if (attempt.status === 'completed' && !next.history.some(item => item.attemptId === attempt.attemptId)) next.history = [attempt, ...next.history];
    next.history = sanitizeStore(next).history;
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }
  function trySaveAttempt(storage, store, attempt, key) {
    try { return { ok: true, store: saveAttempt(storage, store, attempt, key) }; } catch (_) { return { ok: false, store }; }
  }
  function commitAttempt(storage, attempt, key, bank, options = {}) {
    const store = readStore(storage);
    if (options.selectedMode) store.selectedModes[options.selectedMode.chapter] = options.selectedMode.mode;
    if (options.selectedSection && /^ch[123]$/.test(options.selectedSection.chapter)) {
      if (['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].includes(options.selectedSection.section)) {
        store.selectedSections[options.selectedSection.chapter] = options.selectedSection.section;
      } else {
        delete store.selectedSections[options.selectedSection.chapter];
      }
    }
    const restoreOptions = { chapter: attempt.chapter, mode: attempt.mode, section: attempt.section };
    const incoming = restoreAttempt(attempt, bank, restoreOptions);
    if (!incoming) throw new Error('Invalid attempt');
    const stored = restoreAttempt(store.activeAttempts[key], bank, restoreOptions);
    const committed = options.replace ? incoming : mergeAttempts(stored, incoming, bank);
    return { store: saveAttempt(storage, store, committed, key), attempt: committed };
  }

  function tryCommitAttempt(storage, attempt, key, bank, options) {
    try {
      const committed = commitAttempt(storage, attempt, key, bank, options);
      return { ok: true, ...committed };
    } catch (_) {
      return { ok: false, store: readStore(storage), attempt };
    }
  }

  return { SCHEMA_VERSION, STORAGE_KEY, normalizeBank, seededOrder, selectQuestions, createAttempt, restoreAttempt, recordAnswer, completeAttempt, scoreAttempt, emptyStore, sanitizeStore, readStore, saveAttempt, trySaveAttempt, commitAttempt, tryCommitAttempt };
}));
