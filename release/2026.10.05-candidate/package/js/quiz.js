(function () {
  const cache = {};
  let serial = 0;
  const ROMAN_SECTIONS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  function safeStorage() {
    try { return window.localStorage; } catch (_) { return null; }
  }

  function attemptKey(chapter, mode, section) { return `${chapter}|${mode}|${section || 'all'}`; }
  function makeSeed(chapter, mode, section) { serial += 1; return `${chapter}|${mode}|${section || 'all'}|${Date.now()}|${serial}`; }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  async function loadQuizData(chapter) {
    if (cache[chapter]) return cache[chapter];
    const fileName = `quiz-${chapter}.json`;
    try {
      const raw = typeof QUIZ_DATA !== 'undefined' && QUIZ_DATA[fileName]
        ? QUIZ_DATA[fileName]
        : await (await fetch(`data/${fileName}`)).json();
      cache[chapter] = QuizRuntime.normalizeBank(raw, chapter);
    } catch (error) {
      console.warn(`Quiz data not found for ${chapter}`, error);
      cache[chapter] = QuizRuntime.normalizeBank([], chapter);
    }
    return cache[chapter];
  }

  function sectionCatalog(chapter, items) {
    const counts = new Map();
    items.forEach(item => {
      if (ROMAN_SECTIONS.includes(item.section)) counts.set(item.section, (counts.get(item.section) || 0) + 1);
    });
    const generated = typeof window.CHAPTER_SECTIONS !== 'undefined' && Array.isArray(window.CHAPTER_SECTIONS[chapter])
      ? window.CHAPTER_SECTIONS[chapter]
      : [];
    const sections = [];
    generated.forEach(section => {
      if (!section || !counts.has(section.id) || !section.title) return;
      sections.push({ id: section.id, title: section.title, count: counts.get(section.id) });
      counts.delete(section.id);
    });
    ROMAN_SECTIONS.forEach(id => {
      if (counts.has(id)) sections.push({ id, title: `Phần ${id}`, count: counts.get(id) });
    });
    return sections;
  }

  function validSection(section, sections) {
    return sections.some(candidate => candidate.id === section) ? section : null;
  }

  function persist(context, attempt, options = {}) {
    if (!context.storage) return false;
    const result = QuizRuntime.tryCommitAttempt(context.storage, attempt, context.key, context.bank, {
      ...options,
      selectedMode: { chapter: context.chapter, mode: context.mode },
      selectedSection: context.canonical ? { chapter: context.chapter, section: context.section } : undefined,
    });
    if (result.ok) {
      context.store = result.store;
      context.attempt = result.attempt;
    }
    return result.ok;
  }

  function renderScore(header, attempt) {
    header.querySelector('.qs-correct').textContent = `Đúng: ${attempt.correct}`;
    header.querySelector('.qs-wrong').textContent = `Sai: ${attempt.wrong}`;
    header.querySelector('.qs-total').textContent = `${attempt.answersByQuestionId ? Object.keys(attempt.answersByQuestionId).length : 0}/${attempt.questionIds.length}`;
  }

  function renderCard(question, index, attempt, context) {
    const card = element('article', 'q-card');
    card.dataset.questionId = question.id;
    const answer = attempt.answersByQuestionId[question.id];
    const answered = answer !== undefined;
    const correct = answered && answer === question.correct;
    if (answered) card.classList.add(correct ? 'answered-correct' : 'answered-wrong');
    card.append(element('div', 'q-num', `Câu ${index + 1}`));
    const fieldset = element('fieldset', 'q-options');
    const legend = element('legend', 'q-text', question.question);
    fieldset.append(legend);
    question.options.forEach((option, optionIndex) => {
      const inputId = `quiz-${attempt.attemptId.replace(/[^a-z0-9_-]/gi, '-')}-${index}-${optionIndex}`;
      const label = element('label', 'q-opt');
      const input = element('input');
      input.type = 'radio'; input.name = `question-${question.id}`; input.id = inputId; input.value = optionIndex;
      input.checked = answer === optionIndex; input.disabled = answered;
      const marker = element('span', 'q-label', String.fromCharCode(65 + optionIndex));
      const copy = element('span', '', option);
      label.htmlFor = inputId; label.append(input, marker, copy);
      if (answer === optionIndex) label.classList.add('selected', correct ? 'correct' : 'wrong');
      if (answered && optionIndex === question.correct && !correct) label.classList.add('correct-reveal');
      input.addEventListener('change', () => answerQuestion(question, Number(input.value), context));
      fieldset.append(label);
    });
    card.append(fieldset);
    const feedback = element('div', `q-feedback ${correct ? 'correct' : 'wrong'}`, answered ? (correct ? question.feedbackCorrect : question.feedbackWrong) : '');
    feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
    if (answered || context.reviewing) {
      feedback.classList.add('show');
      feedback.textContent = correct ? question.feedbackCorrect : (answered ? question.feedbackWrong : question.explanation);
    }
    card.append(feedback);
    return card;
  }

  function answerQuestion(question, picked, context) {
    const previous = context.attempt;
    const recorded = QuizRuntime.recordAnswer(previous, question.id, picked, context.bank);
    if (recorded === previous) return;
    context.attempt = Object.keys(recorded.answersByQuestionId).length === recorded.questionIds.length
      ? QuizRuntime.completeAttempt(recorded, context.bank)
      : recorded;
    const saved = persist(context, context.attempt);
    renderExisting(context, !saved, { answeredQuestionId: question.id });
  }

  function renderScopeControl(context, scopedCount) {
    const control = element('div', 'quiz-scope');
    const label = element('label', '', 'Phạm vi ôn tập');
    const select = element('select');
    select.id = `${context.container.id}-scope`;
    label.htmlFor = select.id;
    const all = element('option', '', `Toàn chương (${context.bank.items.length})`);
    all.value = '';
    select.append(all);
    context.sections.forEach(section => {
      const option = element('option', '', `${section.id}. ${section.title} (${section.count})`);
      option.value = section.id;
      select.append(option);
    });
    select.value = context.section || '';
    select.setAttribute('aria-describedby', `${select.id}-count`);
    const count = element('span', 'sr-only', `${scopedCount} câu hỏi trong phạm vi đã chọn`);
    count.id = `${select.id}-count`;
    select.addEventListener('change', () => {
      renderQuiz(context.container.id, context.chapter, context.mode, select.value || null, false, true, 'scope');
    });
    control.append(label, select, count);
    return control;
  }

  function renderExisting(context, showWarning, focusRequest) {
    const { container, bank, attempt } = context;
    const scopedItems = bank.items.filter(item => !context.section || item.section === context.section);
    const scopedCount = scopedItems.length;
    container.replaceChildren();
    const header = element('div', 'quiz-header');
    const score = element('div', 'quiz-score');
    ['qs-correct', 'qs-wrong', 'qs-total'].forEach(className => {
      const item = element('span', `qs-item ${className}`); if (className === 'qs-total') item.setAttribute('aria-live', 'polite'); score.append(item);
    });
    header.append(score);
    const review = element('button', 'quiz-review', context.reviewing ? 'Ẩn xem lại' : 'Xem lại đáp án');
    review.type = 'button'; review.setAttribute('aria-pressed', String(context.reviewing));
    review.addEventListener('click', () => { context.reviewing = !context.reviewing; renderExisting(context, false, { selector: '.quiz-review' }); });
    const reset = element('button', 'quiz-reset', 'Xóa và làm lại');
    reset.type = 'button'; reset.addEventListener('click', () => resetAttempt(context));
    header.append(review, reset); renderScore(header, attempt); container.append(header);

    const warning = element('p', 'quiz-persistence-warning', 'Không thể lưu tiến trình trên thiết bị này; bạn vẫn có thể làm bài trong trang hiện tại.');
    warning.setAttribute('role', 'alert'); warning.hidden = !showWarning; container.append(warning);
    if (context.canonical) container.append(renderScopeControl(context, scopedCount));
    const modes = element('div', 'quiz-mode');
    [['all', `Tất cả (${scopedCount})`], ['random', `Random (${Math.min(10, scopedCount)})`]].forEach(([mode, label]) => {
      const button = element('button', mode === context.mode ? 'active' : '', label);
      button.type = 'button';
      button.addEventListener('click', () => renderQuiz(context.container.id, context.chapter, mode, context.section, false, true, 'mode'));
      modes.append(button);
    });
    container.append(modes);
    const byId = new Map(bank.items.map(question => [question.id, question]));
    attempt.questionIds.map(id => byId.get(id)).filter(Boolean).forEach((question, index) => container.append(renderCard(question, index, attempt, context)));
    if (focusRequest && focusRequest.answeredQuestionId) {
      const answeredIndex = attempt.questionIds.indexOf(focusRequest.answeredQuestionId);
      const cards = Array.from(container.querySelectorAll('.q-card'));
      let nextInput = null;
      for (let index = answeredIndex + 1; index < cards.length && !nextInput; index += 1) {
        nextInput = cards[index].querySelector('input[type="radio"]:not(:disabled)');
      }
      if (nextInput) nextInput.focus();
      else {
        const feedback = container.querySelector(`.q-card[data-question-id="${focusRequest.answeredQuestionId}"] .q-feedback`);
        if (feedback) { feedback.tabIndex = -1; feedback.focus(); }
      }
    } else if (focusRequest && focusRequest.selector) {
      const target = container.querySelector(focusRequest.selector);
      if (target) target.focus();
    }
  }

  function resetAttempt(context) {
    const seed = makeSeed(context.chapter, context.mode, context.section);
    context.attempt = QuizRuntime.createAttempt(context.bank, { chapter: context.chapter, mode: context.mode, section: context.section, seed });
    context.reviewing = false;
    const saved = persist(context, context.attempt, { replace: true });
    renderExisting(context, !saved, { selector: 'input[type="radio"]:not(:disabled)' });
  }

  async function renderQuiz(containerId, chapter, mode = 'all', section = null, persistenceFailed = false, userSelected = false, focus = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const bank = await loadQuizData(chapter);
    if (!bank.items.length) { container.textContent = 'Câu hỏi trắc nghiệm đang được cập nhật.'; return; }
    const canonical = containerId === `quiz-${chapter}`;
    const sections = sectionCatalog(chapter, bank.items);
    const storage = safeStorage();
    let store = storage ? QuizRuntime.readStore(storage) : QuizRuntime.emptyStore();
    if (!userSelected && canonical && store.selectedModes[chapter]) mode = store.selectedModes[chapter];
    if (!userSelected && canonical && store.selectedSections[chapter]) section = store.selectedSections[chapter];
    section = validSection(section, sections);
    const modeChanged = store.selectedModes[chapter] !== mode;
    const sectionChanged = canonical && (store.selectedSections[chapter] || null) !== section;
    store.selectedModes[chapter] = mode;
    const key = attemptKey(chapter, mode, section);
    let attempt = QuizRuntime.restoreAttempt(store.activeAttempts[key], bank, { chapter, mode, section });
    const validAttempt = Boolean(attempt);
    if (!attempt) attempt = QuizRuntime.createAttempt(bank, { chapter, mode, section, seed: makeSeed(chapter, mode, section) });
    if (!validAttempt || userSelected || modeChanged || sectionChanged) {
      const saved = storage && QuizRuntime.tryCommitAttempt(storage, attempt, key, bank, {
        selectedMode: { chapter, mode },
        selectedSection: canonical ? { chapter, section } : undefined,
      });
      if (saved && saved.ok) { store = saved.store; attempt = saved.attempt; }
      else persistenceFailed = true;
    }
    const focusRequest = focus === 'scope'
      ? { selector: '.quiz-scope select' }
      : (focus === 'mode' ? { selector: '.quiz-mode button.active' } : null);
    renderExisting({ container, chapter, mode, section, key, bank, storage, store, attempt, sections, canonical, reviewing: false }, persistenceFailed || !storage, focusRequest);
  }

  window.renderQuiz = renderQuiz;
}());
