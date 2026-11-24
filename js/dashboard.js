/**
 * CodeSprint — Progress dashboard with Bootstrap progress bars, bookmarks, and reset.
 */
(function initDashboardModule() {
  const SANDBOX_GOAL = 10;

  /** Update a Bootstrap progress bar's width, ARIA attributes, and text label. */
  function updateBar(barId, labelId, value, max, labelText) {
    const bar = document.getElementById(barId);
    const label = document.getElementById(labelId);
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    if (bar) {
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(pct));
    }
    if (label) label.textContent = labelText;
  }

  /** Find a lesson definition by its ID from the lessons module. */
  function findLessonById(lessonId) {
    const list = CodeSprint.lessons ? CodeSprint.lessons.list : [];
    for (const lesson of list) {
      if (lesson.id === lessonId) return lesson;
    }
    return null;
  }

  /** Render the bookmarked lessons list with quick-jump buttons. */
  function renderBookmarks() {
    const listEl = document.getElementById('dashboard-bookmarks');
    if (!listEl) return;
    const bookmarks = CodeSprint.state.bookmarks;

    if (!bookmarks.length) {
      listEl.innerHTML = '<li class="list-group-item text-body-secondary">No bookmarks yet. Bookmark any lesson to save it here.</li>';
      return;
    }

    const { escapeHtml } = CodeSprint;
    let html = '';
    for (const id of bookmarks) {
      const lesson = findLessonById(id);
      if (!lesson) continue;
      html += `<li class="list-group-item d-flex flex-wrap align-items-center justify-content-between gap-2 px-0">
        <div>
          <span class="badge text-bg-secondary me-2">${escapeHtml(lesson.topic)}</span>
          <span class="fw-medium">${escapeHtml(lesson.title)}</span>
        </div>
        <button type="button" class="btn btn-outline-primary btn-sm" data-open-lesson="${escapeHtml(lesson.id)}" aria-label="Open bookmarked lesson ${escapeHtml(lesson.title)}">Open Lesson</button>
      </li>`;
    }
    listEl.innerHTML = html || '<li class="list-group-item text-body-secondary">No bookmarks yet.</li>';
  }

  /** Refresh all dashboard progress bars and the bookmarks list from state. */
  function render() {
    const totalLessons = CodeSprint.lessons ? CodeSprint.lessons.list.length : 3;
    const totalQuiz = CodeSprint.quiz ? CodeSprint.quiz.questions.length : 5;
    const { completedLessons, bestQuizScore, sandboxRuns } = CodeSprint.state;

    updateBar('bar-lessons', 'stat-lessons-label', completedLessons.length, totalLessons, completedLessons.length + ' / ' + totalLessons);
    updateBar('bar-quiz', 'stat-quiz-label', bestQuizScore, totalQuiz, bestQuizScore + ' / ' + totalQuiz);
    updateBar('bar-sandbox', 'stat-sandbox-label', sandboxRuns, SANDBOX_GOAL, sandboxRuns + ' / ' + SANDBOX_GOAL + ' goal');
    renderBookmarks();
  }

  /** Show or hide the inline reset confirmation banner. */
  function toggleResetConfirm(show) {
    const box = document.getElementById('reset-confirm-box');
    if (!box) return;
    box.classList.toggle('d-none', !show);
    box.classList.toggle('d-flex', show);
  }

  /** Jump to a bookmarked lesson when its Open Lesson button is clicked. */
  function handleBookmarkClick(event) {
    const btn = event.target.closest('[data-open-lesson]');
    if (!btn) return;
    const lessonId = btn.getAttribute('data-open-lesson');
    if (CodeSprint.lessons) CodeSprint.lessons.selectLesson(lessonId);
    CodeSprint.showView('lessons');
  }

  /** Confirm and execute a full progress reset. */
  function confirmReset() {
    if (CodeSprint.quiz) CodeSprint.quiz.stopTimer();
    CodeSprint.resetState();
    toggleResetConfirm(false);
  }

  /** Handle clicking the Reset Progress button. */
  function handleResetRequest() {
    toggleResetConfirm(true);
  }

  /** Handle canceling a pending progress reset. */
  function handleResetCancel() {
    toggleResetConfirm(false);
  }

  /** Initialize dashboard controls and subscribe to shared state changes. */
  function init() {
    const listEl = document.getElementById('dashboard-bookmarks');
    const resetBtn = document.getElementById('dashboard-reset-btn');
    const yesBtn = document.getElementById('reset-confirm-yes');
    const cancelBtn = document.getElementById('reset-confirm-cancel');

    if (listEl) listEl.addEventListener('click', handleBookmarkClick);
    if (resetBtn) resetBtn.addEventListener('click', handleResetRequest);
    if (yesBtn) yesBtn.addEventListener('click', confirmReset);
    if (cancelBtn) cancelBtn.addEventListener('click', handleResetCancel);

    CodeSprint.onStateChange(render);
    render();
  }

  CodeSprint.dashboard = { init, render };
})();
