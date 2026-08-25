(function () {
  const cache = {};
  let serial = 0;

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

  function persist(context, attempt, options = {}) {
    if (!context.storage) return false;
    const result = QuizRuntime.tryCommitAttempt(context.storage, attempt, context.key, context.bank, {
      ...options,
      selectedMode: { chapter: context.chapter, mode: context.mode },
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

  function renderExisting(context, showWarning, focusRequest) {
    const { container, bank, attempt } = context;
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
    const modes = element('div', 'quiz-mode');
    [['all', `Tất cả (${bank.items.length})`], ['random', 'Random (10)']].forEach(([mode, label]) => {
      const button = element('button', mode === context.mode ? 'active' : '', label); button.type = 'button';
      button.addEventListener('click', () => renderQuiz(context.container.id, context.chapter, mode, context.section, false, true)); modes.append(button);
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

  async function renderQuiz(containerId, chapter, mode = 'all', section = null, persistenceFailed = false, userSelected = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const bank = await loadQuizData(chapter);
    if (!bank.items.length) { container.textContent = 'Câu hỏi trắc nghiệm đang được cập nhật.'; return; }
    const storage = safeStorage();
    let store = storage ? QuizRuntime.readStore(storage) : QuizRuntime.emptyStore();
    if (!userSelected && containerId === `quiz-${chapter}` && store.selectedModes[chapter]) mode = store.selectedModes[chapter];
    const modeChanged = store.selectedModes[chapter] !== mode;
    store.selectedModes[chapter] = mode;
    const key = attemptKey(chapter, mode, section);
    let attempt = QuizRuntime.restoreAttempt(store.activeAttempts[key], bank, { chapter, mode, section });
    const validAttempt = Boolean(attempt);
    if (!attempt) attempt = QuizRuntime.createAttempt(bank, { chapter, mode, section, seed: makeSeed(chapter, mode, section) });
    if (!validAttempt || userSelected || modeChanged) {
      const saved = storage && QuizRuntime.tryCommitAttempt(storage, attempt, key, bank, {
        selectedMode: { chapter, mode },
      });
      if (saved && saved.ok) { store = saved.store; attempt = saved.attempt; }
      else persistenceFailed = true;
    }
    renderExisting({ container, chapter, mode, section, key, bank, storage, store, attempt, reviewing: false }, persistenceFailed || !storage);
  }

  window.renderQuiz = renderQuiz;
}());
