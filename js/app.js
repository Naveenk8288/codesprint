/**
 * CodeSprint — Core shell, shared state, safe storage, navigation, and 3D tilt.
 */
(function initCodeSprintCore() {
  const STORAGE_KEY = 'codesprint_state_v1';
  const VIEW_TITLES = { lessons: 'Lessons', sandbox: 'Sandbox', quiz: 'Quiz', dashboard: 'Progress' };
  const listeners = [];

  /** Return a fresh copy of the default application state. */
  function createDefaultState() {
    return { theme: 'light', completedLessons: [], bookmarks: [], bestQuizScore: 0, sandboxRuns: 0 };
  }

  /** Safely read and validate persisted state from localStorage. */
  function loadState() {
    const defaults = createDefaultState();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const p = JSON.parse(raw);
      return {
        theme: p.theme === 'dark' ? 'dark' : 'light',
        completedLessons: Array.isArray(p.completedLessons) ? p.completedLessons : [],
        bookmarks: Array.isArray(p.bookmarks) ? p.bookmarks : [],
        bestQuizScore: Number.isFinite(p.bestQuizScore) ? p.bestQuizScore : 0,
        sandboxRuns: Number.isFinite(p.sandboxRuns) ? p.sandboxRuns : 0
      };
    } catch (_err) { return defaults; }
  }

  /** Safely persist the current shared state into localStorage. */
  function saveState() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(CodeSprint.state)); }
    catch (_err) { /* Ignore quota or restricted-storage errors. */ }
  }

  /** Clear saved progress while preserving the active color theme. */
  function resetState() {
    const theme = CodeSprint.state.theme;
    try { window.localStorage.removeItem(STORAGE_KEY); }
    catch (_err) { /* Ignore storage errors in restricted environments. */ }
    CodeSprint.state = Object.assign(createDefaultState(), { theme });
    saveState(); notifyStateChange();
  }

  /** Escape HTML special characters before inserting dynamic text into the DOM. */
  function escapeHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Register a callback invoked whenever shared state changes. */
  function onStateChange(callback) { listeners.push(callback); }

  /** Notify all registered subscribers that shared state has updated. */
  function notifyStateChange() { for (const fn of listeners) fn(CodeSprint.state); }

  /** Apply light or dark theme variables and update the theme toggle button. */
  function applyTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    btn.textContent = dark ? '\u2600\uFE0F Light Mode' : '\uD83C\uDF19 Dark Mode';
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /** Toggle between light and dark themes and persist the preference. */
  function toggleTheme() {
    CodeSprint.state.theme = CodeSprint.state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(CodeSprint.state.theme); saveState();
  }

  /** Switch the active view, update nav state, and close mobile offcanvas. */
  function showView(viewId) {
    if (!VIEW_TITLES[viewId]) return;
    for (const s of document.querySelectorAll('.app-view')) s.classList.toggle('d-none', s.id !== 'view-' + viewId);
    for (const btn of document.querySelectorAll('[data-view]')) {
      const on = btn.getAttribute('data-view') === viewId;
      btn.classList.toggle('active', on);
      if (on) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
    }
    const heading = document.getElementById('view-heading');
    if (heading) heading.textContent = VIEW_TITLES[viewId];
    const sidebarEl = document.getElementById('sidebarNav');
    if (sidebarEl && window.bootstrap && window.bootstrap.Offcanvas) {
      const inst = window.bootstrap.Offcanvas.getInstance(sidebarEl);
      if (inst) inst.hide();
    }
    if (viewId === 'dashboard' && CodeSprint.dashboard) CodeSprint.dashboard.render();
  }

  /** Handle sidebar navigation button clicks. */
  function handleNavClick(event) {
    const btn = event.target.closest('[data-view]');
    if (btn) showView(btn.getAttribute('data-view'));
  }

  /** Collapse or expand the desktop sidebar and update aria-expanded. */
  function toggleDesktopSidebar() {
    const shell = document.getElementById('app-shell'), btn = document.getElementById('sidebar-collapse-btn');
    if (shell && btn) btn.setAttribute('aria-expanded', String(!shell.classList.toggle('sidebar-collapsed')));
  }

  /** Apply real-time 3D tilt and specular glare variables on pointer movement. */
  function handleTiltMove(event) {
    if (event.pointerType === 'touch') return;
    const card = event.currentTarget, r = card.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width, y = (event.clientY - r.top) / r.height;
    card.style.setProperty('--rx', ((0.5 - y) * 9).toFixed(2) + 'deg');
    card.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
    card.style.setProperty('--mx', Math.round(x * 100) + '%');
    card.style.setProperty('--my', Math.round(y * 100) + '%');
    card.style.setProperty('--glare-o', '1');
  }

  /** Reset 3D tilt angles and glare opacity when the pointer leaves a card. */
  function handleTiltLeave(event) {
    const s = event.currentTarget.style;
    s.setProperty('--rx', '0deg'); s.setProperty('--ry', '0deg'); s.setProperty('--glare-o', '0');
  }

  /** Bind subtle 3D pointer tilt to .tilt-3d cards unless reduced motion is set. */
  function initTilt3D() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (const card of document.querySelectorAll('.tilt-3d')) {
      card.addEventListener('pointermove', handleTiltMove);
      card.addEventListener('pointerleave', handleTiltLeave);
    }
  }

  /** Boot core UI listeners, 3D tilt effects, and feature modules. */
  function initApp() {
    CodeSprint.state = loadState(); applyTheme(CodeSprint.state.theme);
    for (const [id, fn] of [['sidebarNav', handleNavClick], ['theme-toggle-btn', toggleTheme], ['sidebar-collapse-btn', toggleDesktopSidebar]]) {
      const el = document.getElementById(id); if (el) el.addEventListener('click', fn);
    }
    initTilt3D();
    for (const mod of ['lessons', 'sandbox', 'quiz', 'dashboard']) if (CodeSprint[mod]) CodeSprint[mod].init();
  }

  window.CodeSprint = {
    state: createDefaultState(),
    loadState, saveState, resetState, escapeHtml, showView, onStateChange, notifyStateChange
  };
  document.addEventListener('DOMContentLoaded', initApp);
})();
