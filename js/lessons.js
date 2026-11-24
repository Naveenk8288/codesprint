/**
 * CodeSprint — Lesson data (HTML, CSS, JS) and interactive lesson viewer.
 */
(function initLessonsModule() {
  const LESSONS = [
    {
      id: 'html-basics', topic: 'HTML', title: 'Semantic HTML Structure',
      explanation: 'HTML defines page structure and meaning. Semantic tags like <header>, <main>, <article>, and <button> help browsers, screen readers, and keyboards understand your content.',
      code: '<article class="card">\n  <h2>Hello, CodeSprint!</h2>\n  <p>Semantic elements make pages accessible.</p>\n  <button type="button">Learn More</button>\n</article>',
      starter: {
        html: '<article class="card">\n  <h2>Hello, CodeSprint!</h2>\n  <p>Edit this HTML and watch the preview update.</p>\n  <button id="greet-btn" type="button">Say Hi</button>\n</article>',
        css: 'body { font-family: system-ui, sans-serif; padding: 1rem; }\n.card { border: 2px solid #4f46e5; border-radius: 8px; padding: 1rem; }',
        js: 'document.getElementById("greet-btn").addEventListener("click", () => {\n  document.querySelector("p").textContent = "Nice work — you ran your first snippet!";\n});'
      }
    },
    {
      id: 'css-styling', topic: 'CSS', title: 'CSS Box Model & Flexbox',
      explanation: 'Every HTML element is a box with content, padding, border, and margin. Combine the box model with display: flex and gap to build responsive layouts on phones and laptops.',
      code: '.badge-row {\n  display: flex;\n  gap: 0.75rem;\n  flex-wrap: wrap;\n}\n.pill {\n  padding: 0.4rem 0.9rem;\n  border-radius: 999px;\n  background: #4f46e5;\n  color: #ffffff;\n}',
      starter: {
        html: '<div class="badge-row">\n  <span class="pill">HTML</span>\n  <span class="pill">CSS</span>\n  <span class="pill">Flexbox</span>\n</div>',
        css: 'body { font-family: system-ui, sans-serif; padding: 1rem; }\n.badge-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }\n.pill { padding: 0.4rem 0.9rem; border-radius: 999px; background: #4f46e5; color: #fff; font-weight: 600; }',
        js: ''
      }
    },
    {
      id: 'js-interactivity', topic: 'JavaScript', title: 'DOM Events & Safe Updates',
      explanation: 'JavaScript adds interactivity by listening for events such as clicks or typing. Prefer textContent over innerHTML for plain text so untrusted strings never run as HTML.',
      code: 'let count = 0;\nconst btn = document.getElementById("count-btn");\nbtn.addEventListener("click", () => {\n  count += 1;\n  btn.textContent = "Clicks: " + count;\n});',
      starter: {
        html: '<main class="box">\n  <h2>Click Counter</h2>\n  <button id="count-btn" type="button">Clicks: 0</button>\n</main>',
        css: 'body { font-family: system-ui, sans-serif; padding: 1rem; }\nbutton { padding: 0.6rem 1.1rem; font-size: 1rem; background: #0f766e; color: #fff; border: 0; border-radius: 6px; cursor: pointer; }',
        js: 'let count = 0;\nconst btn = document.getElementById("count-btn");\nbtn.addEventListener("click", () => {\n  count += 1;\n  btn.textContent = "Clicks: " + count;\n});'
      }
    }
  ];

  let activeLessonId = LESSONS[0].id;

  /** Return the currently selected lesson object. */
  function getActiveLesson() {
    for (const item of LESSONS) if (item.id === activeLessonId) return item;
    return LESSONS[0];
  }

  /** Render the lesson selector tabs and active lesson detail card. */
  function render() {
    const tabs = document.getElementById('lesson-tabs');
    const card = document.getElementById('lesson-detail');
    if (!tabs || !card) return;
    const { escapeHtml, state } = CodeSprint;

    tabs.innerHTML = LESSONS.map(/** Build a lesson tab button. */ function tabBtn(l, i) {
      const on = l.id === activeLessonId;
      const marks = (state.completedLessons.includes(l.id) ? ' \u2713' : '') + (state.bookmarks.includes(l.id) ? ' \u2605' : '');
      return `<button type="button" role="tab" class="btn btn-outline-secondary lesson-tab-btn${on ? ' active' : ''}" data-lesson-id="${escapeHtml(l.id)}" aria-selected="${on}">${i + 1}. ${escapeHtml(l.topic)}${marks}</button>`;
    }).join('');

    const l = getActiveLesson();
    const bm = state.bookmarks.includes(l.id);
    const done = state.completedLessons.includes(l.id);
    card.innerHTML = `<div class="card-body p-4">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div><span class="badge text-bg-primary mb-2">${escapeHtml(l.topic)}</span><h3 class="h4 mb-0">${escapeHtml(l.title)}</h3></div>
        <div class="d-flex flex-wrap gap-2">
          <button type="button" class="btn btn-sm ${bm ? 'btn-warning' : 'btn-outline-secondary'}" data-action="bookmark" aria-pressed="${bm}" aria-label="Toggle bookmark for this lesson">${bm ? '\u2605 Bookmarked' : '\u2606 Bookmark'}</button>
          <button type="button" class="btn btn-sm ${done ? 'btn-success' : 'btn-outline-success'}" data-action="complete" aria-pressed="${done}" aria-label="Toggle lesson completion">${done ? '\u2713 Completed' : 'Mark Complete'}</button>
        </div>
      </div>
      <p class="mb-4">${escapeHtml(l.explanation)}</p>
      <div class="code-block-wrap mb-4">
        <div class="code-block-header d-flex align-items-center justify-content-between px-3 py-2 small">
          <span>${escapeHtml(l.topic)} Example</span>
          <button type="button" class="btn btn-outline-light btn-sm py-0 px-2" data-action="copy" aria-label="Copy lesson code to clipboard">Copy</button>
        </div>
        <pre class="code-block-pre"><code>${escapeHtml(l.code)}</code></pre>
      </div>
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span id="lesson-copy-status" class="small text-success" role="status" aria-live="polite"></span>
        <button type="button" class="btn btn-primary" data-action="try" aria-label="Load this lesson code into the sandbox">Try it in Sandbox &rarr;</button>
      </div>
    </div>`;
  }

  /** Select a lesson by ID and re-render the lesson view. */
  function selectLesson(lessonId) {
    for (const item of LESSONS) if (item.id === lessonId) { activeLessonId = lessonId; render(); return; }
  }

  /** Copy the active lesson snippet to clipboard with an offline fallback. */
  function copyLessonCode(button) {
    const code = getActiveLesson().code;
    const status = document.getElementById('lesson-copy-status');
    /** Show temporary copy feedback on the button and status region. */
    function showCopied() {
      if (button) button.textContent = 'Copied!';
      if (status) status.textContent = 'Code copied to clipboard.';
      window.setTimeout(/** Reset copy labels. */ function resetCopy() {
        if (button) button.textContent = 'Copy';
        if (status) status.textContent = '';
      }, 1800);
    }
    /** Fallback copy routine when async Clipboard API is unavailable. */
    function fallbackCopy() {
      const area = document.createElement('textarea');
      area.value = code; area.setAttribute('readonly', ''); area.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(area); area.select();
      try { document.execCommand('copy'); } catch (_err) { /* ignore */ }
      document.body.removeChild(area); showCopied();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(showCopied).catch(fallbackCopy);
    else fallbackCopy();
  }

  /** Toggle activeLessonId inside bookmarks or completedLessons and persist. */
  function toggleStateItem(field) {
    const list = CodeSprint.state[field];
    const idx = list.indexOf(activeLessonId);
    if (idx >= 0) list.splice(idx, 1); else list.push(activeLessonId);
    CodeSprint.saveState(); CodeSprint.notifyStateChange();
  }

  /** Handle delegated tab and action button clicks in the lessons section. */
  function handleLessonClick(event) {
    const tab = event.target.closest('[data-lesson-id]');
    if (tab) return selectLesson(tab.getAttribute('data-lesson-id'));
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    if (action === 'copy') copyLessonCode(btn);
    if (action === 'bookmark') toggleStateItem('bookmarks');
    if (action === 'complete') toggleStateItem('completedLessons');
    if (action === 'try') {
      if (CodeSprint.sandbox) CodeSprint.sandbox.loadCode(getActiveLesson().starter);
      CodeSprint.showView('sandbox');
    }
  }

  /** Initialize the lessons module and listen for shared state changes. */
  function init() {
    const section = document.getElementById('view-lessons');
    if (section) section.addEventListener('click', handleLessonClick);
    CodeSprint.onStateChange(render); render();
  }

  CodeSprint.lessons = { list: LESSONS, init, selectLesson, render };
})();
