/**
 * Giáo Trình Điện Tử – Cơ Học Lý Thuyết
 * Quiz Engine
 * Supports: JSON data, random mode, section filter, localStorage score
 */

// ============================================
// QUIZ STATE
// ============================================
const quizState = {};

// ============================================
// LOAD QUIZ DATA
// ============================================
async function loadQuizData(chId) {
  const key = `quiz-${chId}`;
  if (quizState[key]) return quizState[key];

  try {
    // Use inline bundle (QUIZ_DATA) for offline/USB mode
    const fileName = `quiz-${chId}.json`;
    if (typeof QUIZ_DATA !== 'undefined' && QUIZ_DATA[fileName]) {
      quizState[key] = QUIZ_DATA[fileName];
      return quizState[key];
    }
    // Fallback to fetch (dev server mode)
    const res = await fetch(`data/${fileName}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    quizState[key] = data;
    return data;
  } catch (e) {
    console.warn(`Quiz data not found for ${chId}`, e);
    return [];
  }
}

// ============================================
// RENDER QUIZ
// ============================================
async function renderQuiz(containerId, chId, mode = 'all', section = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const allQuestions = await loadQuizData(chId);
  if (!allQuestions.length) {
    container.innerHTML = '<p class="l3-placeholder"><em>(Câu hỏi trắc nghiệm đang được cập nhật)</em></p>';
    return;
  }

  let questions = [...allQuestions];

  // Filter by section
  if (section) {
    questions = questions.filter(q => q.section === section);
  }

  // Random mode: pick 10 random questions
  if (mode === 'random') {
    questions = shuffleArray(questions).slice(0, 10);
  }

  const total = questions.length;
  const stateKey = `${chId}-${mode}-${section || 'all'}`;

  // Init state
  quizState[stateKey] = { correct: 0, wrong: 0, total, answered: 0 };

  let html = `
    <div class="quiz-header">
      <div class="quiz-score">
        <span class="qs-item qs-correct" id="${stateKey}-correct">✅ 0</span>
        <span class="qs-item qs-wrong" id="${stateKey}-wrong">❌ 0</span>
        <span class="qs-item qs-total" id="${stateKey}-total">📝 0/${total}</span>
      </div>
      <button class="quiz-reset" onclick="renderQuiz('${containerId}','${chId}','${mode}',${section ? `'${section}'` : 'null'})">🔄 Làm lại</button>
    </div>
    <div class="quiz-mode">
      <button class="${mode === 'all' ? 'active' : ''}" onclick="renderQuiz('${containerId}','${chId}','all')">📋 Tất cả (${allQuestions.length})</button>
      <button class="${mode === 'random' ? 'active' : ''}" onclick="renderQuiz('${containerId}','${chId}','random')">🎲 Random (10)</button>
    </div>`;

  questions.forEach((q, idx) => {
    const labels = ['A', 'B', 'C', 'D'];
    const optionsHtml = q.options.map((opt, oi) => `
      <div class="q-opt" onclick="checkQuizAnswer(this,${q.correct},${oi},'${stateKey}')" data-idx="${oi}">
        <span class="q-label">${labels[oi]}</span>
        <span>${opt}</span>
      </div>
    `).join('');

    html += `
      <div class="q-card" data-quiz="${stateKey}" data-correct="${q.correct}">
        <div class="q-num">Câu ${idx + 1}</div>
        <div class="q-text">${q.question}</div>
        <div class="q-options">${optionsHtml}</div>
        <div class="q-feedback correct">${q.feedbackCorrect || '✅ Chính xác!'}</div>
        <div class="q-feedback wrong">${q.feedbackWrong || '❌ Sai rồi!'}</div>
      </div>`;
  });

  container.innerHTML = html;
}

// ============================================
// CHECK ANSWER
// ============================================
function checkQuizAnswer(el, correct, picked, stateKey) {
  const card = el.closest('.q-card');
  if (card.classList.contains('answered-correct') || card.classList.contains('answered-wrong')) return;

  const opts = card.querySelectorAll('.q-opt');
  opts.forEach(o => o.classList.add('disabled'));
  el.classList.add('selected');

  const state = quizState[stateKey];

  if (picked === correct) {
    el.classList.add('correct');
    card.classList.add('answered-correct');
    card.querySelector('.q-feedback.correct').classList.add('show');
    state.correct++;
  } else {
    el.classList.add('wrong');
    opts[correct].classList.add('correct-reveal');
    card.classList.add('answered-wrong');
    card.querySelector('.q-feedback.wrong').classList.add('show');
    state.wrong++;
  }

  state.answered++;
  updateQuizScore(stateKey);

  // Save to localStorage
  saveQuizProgress(stateKey);
}

// ============================================
// UPDATE SCORE DISPLAY
// ============================================
function updateQuizScore(stateKey) {
  const state = quizState[stateKey];
  if (!state) return;

  const ce = document.getElementById(`${stateKey}-correct`);
  const we = document.getElementById(`${stateKey}-wrong`);
  const te = document.getElementById(`${stateKey}-total`);

  if (ce) ce.textContent = '✅ ' + state.correct;
  if (we) we.textContent = '❌ ' + state.wrong;
  if (te) te.textContent = '📝 ' + state.answered + '/' + state.total;
}

// ============================================
// SAVE/LOAD PROGRESS
// ============================================
function saveQuizProgress(stateKey) {
  try {
    const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    scores[stateKey] = quizState[stateKey];
    localStorage.setItem('quizScores', JSON.stringify(scores));
  } catch (e) {}
}

// ============================================
// LEGACY SUPPORT (for inline quiz in old format)
// ============================================
function checkAns(el, correct, picked, chId) {
  const card = el.closest('.q-card');
  if (card.classList.contains('answered-correct') || card.classList.contains('answered-wrong')) return;

  const opts = card.querySelectorAll('.q-opt');
  opts.forEach(o => o.classList.add('disabled'));
  el.classList.add('selected');

  if (picked === correct) {
    el.classList.add('correct');
    card.classList.add('answered-correct');
    card.querySelector('.q-feedback.correct').classList.add('show');
  } else {
    el.classList.add('wrong');
    opts[correct].classList.add('correct-reveal');
    card.classList.add('answered-wrong');
    card.querySelector('.q-feedback.wrong').classList.add('show');
  }
  updateScore(chId);
}

function updateScore(chId) {
  const cards = document.querySelectorAll('.q-card[data-quiz="' + chId + '"]');
  let c = 0, w = 0, t = cards.length;
  cards.forEach(card => {
    if (card.classList.contains('answered-correct')) c++;
    if (card.classList.contains('answered-wrong')) w++;
  });
  const ce = document.getElementById(chId + '-correct');
  const we = document.getElementById(chId + '-wrong');
  const te = document.getElementById(chId + '-total');
  if (ce) ce.textContent = '✅ ' + c;
  if (we) we.textContent = '❌ ' + w;
  if (te) te.textContent = '📝 ' + (c + w) + '/' + t;
}

function resetQuiz(chId) {
  const cards = document.querySelectorAll('.q-card[data-quiz="' + chId + '"]');
  cards.forEach(card => {
    card.classList.remove('answered-correct', 'answered-wrong');
    card.querySelectorAll('.q-opt').forEach(o => {
      o.classList.remove('selected', 'correct', 'wrong', 'disabled', 'correct-reveal');
    });
    card.querySelectorAll('.q-feedback').forEach(f => f.classList.remove('show'));
  });
  updateScore(chId);
}

// ============================================
// UTILITY
// ============================================
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Make functions globally accessible
window.renderQuiz = renderQuiz;
window.checkQuizAnswer = checkQuizAnswer;
window.checkAns = checkAns;
window.updateScore = updateScore;
window.resetQuiz = resetQuiz;
