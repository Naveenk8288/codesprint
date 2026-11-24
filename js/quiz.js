/**
 * CodeSprint — 5-question timed quiz engine with instant feedback and best score.
 */
(function initQuizModule() {
  const QUIZ_DURATION = 60;
  const QUIZ_QUESTIONS = [
    {
      prompt: 'Which HTML element best represents the primary content unique to a document?',
      options: ['<div class="top">', '<main>', '<span id="body">', '<section-main>'],
      answer: 1, explanation: '<main> is the semantic landmark for a page\'s dominant content.'
    },
    {
      prompt: 'Which CSS property adds space INSIDE an element between content and border?',
      options: ['margin', 'gap', 'padding', 'outline-offset'],
      answer: 2, explanation: 'Padding sits inside the border; margin creates space outside it.'
    },
    {
      prompt: 'What does display: flex; do to an element\'s direct children by default?',
      options: ['Arranges them in a row', 'Hides overflowing items', 'Fixes them to the viewport', 'Converts them to tables'],
      answer: 0, explanation: 'Flex containers lay out direct children in a horizontal row by default.'
    },
    {
      prompt: 'Which DOM property inserts plain text safely without parsing HTML tags?',
      options: ['innerHTML', 'outerHTML', 'textContent', 'insertAdjacentHTML'],
      answer: 2, explanation: 'textContent treats input as literal text, preventing HTML injection.'
    },
    {
      prompt: 'Which JavaScript method attaches a click handler without overwriting others?',
      options: ['element.addEventListener("click", fn)', 'element.bindClick(fn)', 'element.on("click", fn)', 'element.listenClick(fn)'],
      answer: 0, explanation: 'addEventListener lets multiple listeners subscribe to the same event.'
    }
  ];

  let currentIndex = 0, score = 0, timeLeft = QUIZ_DURATION, timerId = null, answered = false;

  /** Shortcut for document.getElementById. */
  function byId(id) { return document.getElementById(id); }

  /** Update the best-score badge on the quiz start panel. */
  function updateBestBadge() {
    const badge = byId('quiz-best-badge');
    if (badge) badge.textContent = CodeSprint.state.bestQuizScore + ' / ' + QUIZ_QUESTIONS.length;
  }

  /** Toggle visibility among the start, play, and result panels. */
  function showPanel(panelName) {
    for (const name of ['start', 'play', 'result']) {
      const el = byId('quiz-' + name + '-panel');
      if (el) el.classList.toggle('d-none', name !== panelName);
    }
  }

  /** Stop the active countdown interval if running. */
  function stopTimer() { if (timerId) { window.clearInterval(timerId); timerId = null; } }

  /** Render remaining seconds and highlight danger style at 10s or below. */
  function renderTimer() {
    const el = byId('quiz-timer');
    if (!el) return;
    el.textContent = timeLeft + 's';
    el.className = 'badge fs-6 ' + (timeLeft <= 10 ? 'text-bg-danger' : 'text-bg-warning');
  }

  /** Decrement the countdown each second and finish when time runs out. */
  function tickTimer() { timeLeft -= 1; renderTimer(); if (timeLeft <= 0) finishQuiz(true); }

  /** Render the active question text and its four escaped answer buttons. */
  function renderQuestion() {
    const q = QUIZ_QUESTIONS[currentIndex];
    const optionsEl = byId('quiz-options'), promptEl = byId('quiz-question-text');
    if (!optionsEl || !promptEl) return;

    answered = false;
    byId('quiz-progress-text').textContent = `Question ${currentIndex + 1} of ${QUIZ_QUESTIONS.length}`;
    promptEl.textContent = q.prompt;
    const fb = byId('quiz-feedback'), nextBtn = byId('quiz-next-btn');
    if (fb) { fb.className = 'alert d-none mb-3'; fb.textContent = ''; }
    if (nextBtn) {
      nextBtn.classList.add('d-none');
      nextBtn.textContent = currentIndex === QUIZ_QUESTIONS.length - 1 ? 'See Results' : 'Next Question';
    }
    optionsEl.innerHTML = q.options.map(/** Build an escaped option button. */ function buildOpt(opt, i) {
      return `<button type="button" class="btn btn-outline-secondary quiz-option-btn" data-choice="${i}">${CodeSprint.escapeHtml(opt)}</button>`;
    }).join('');
  }

  /** Start or restart the quiz session and begin the 60-second timer. */
  function startQuiz() {
    stopTimer();
    currentIndex = 0; score = 0; timeLeft = QUIZ_DURATION;
    showPanel('play'); renderTimer(); renderQuestion();
    timerId = window.setInterval(tickTimer, 1000);
  }

  /** Evaluate an answer choice, show instant feedback, and reveal Next. */
  function handleOptionClick(event) {
    const btn = event.target.closest('[data-choice]');
    if (!btn || answered) return;
    answered = true;
    const choice = Number(btn.getAttribute('data-choice'));
    const q = QUIZ_QUESTIONS[currentIndex], isCorrect = choice === q.answer;
    if (isCorrect) score += 1;

    for (const optBtn of document.querySelectorAll('#quiz-options [data-choice]')) {
      const idx = Number(optBtn.getAttribute('data-choice'));
      optBtn.disabled = true;
      if (idx === q.answer) optBtn.className = 'btn btn-success quiz-option-btn';
      else if (idx === choice) optBtn.className = 'btn btn-danger quiz-option-btn';
    }
    const fb = byId('quiz-feedback'), nextBtn = byId('quiz-next-btn');
    if (fb) {
      fb.className = 'alert mb-3 ' + (isCorrect ? 'alert-success' : 'alert-danger');
      fb.textContent = (isCorrect ? 'Correct! ' : 'Not quite. ') + q.explanation;
    }
    if (nextBtn) { nextBtn.classList.remove('d-none'); nextBtn.focus(); }
  }

  /** Advance to the next question or finish after the final question. */
  function nextQuestion() {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) { currentIndex += 1; renderQuestion(); }
    else finishQuiz(false);
  }

  /** Stop the timer, persist any new best score, and render the score screen. */
  function finishQuiz(timedOut) {
    stopTimer();
    const isNewBest = score > CodeSprint.state.bestQuizScore;
    if (isNewBest) { CodeSprint.state.bestQuizScore = score; CodeSprint.saveState(); CodeSprint.notifyStateChange(); }
    const total = QUIZ_QUESTIONS.length;
    byId('quiz-result-heading').textContent = timedOut ? "Time's Up!" : 'Quiz Complete!';
    byId('quiz-result-summary').textContent = `You scored ${score} out of ${total} (${timeLeft}s remaining).`;
    byId('quiz-result-best').textContent = `${isNewBest ? 'New Best Score! ' : ''}Best saved score: ${CodeSprint.state.bestQuizScore} / ${total}.`;
    updateBestBadge(); showPanel('result');
  }

  /** Initialize quiz controls and sync best score on state updates. */
  function init() {
    for (const [id, fn] of [['quiz-start-btn', startQuiz], ['quiz-next-btn', nextQuestion], ['quiz-retake-btn', startQuiz], ['quiz-options', handleOptionClick]]) {
      const el = byId(id); if (el) el.addEventListener('click', fn);
    }
    CodeSprint.onStateChange(updateBestBadge); updateBestBadge();
  }

  CodeSprint.quiz = { questions: QUIZ_QUESTIONS, init, stopTimer };
})();
