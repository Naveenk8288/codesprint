/**
 * CodeSprint — Split-screen HTML/CSS/JS sandbox with debounced srcdoc preview.
 */
(function initSandboxModule() {
  const DEBOUNCE_MS = 500;
  const DEFAULT_SNIPPET = {
    html: '<div class="welcome">\n  <h2>Welcome to CodeSprint!</h2>\n  <p id="msg">Edit HTML, CSS, or JS to see live changes.</p>\n  <button id="demo-btn" type="button">Click me</button>\n</div>',
    css: 'body { font-family: system-ui, sans-serif; padding: 1.25rem; margin: 0; }\n.welcome { border: 2px solid #4f46e5; border-radius: 10px; padding: 1rem; }\nbutton { background: #4f46e5; color: #fff; border: 0; border-radius: 6px; padding: 0.5rem 0.9rem; cursor: pointer; }',
    js: 'let taps = 0;\ndocument.getElementById("demo-btn").addEventListener("click", () => {\n  taps += 1;\n  document.getElementById("msg").textContent = "Button clicked " + taps + " time(s)!";\n});'
  };

  let debounceTimer = null;

  /** Return references to the three editor textareas, preview iframe, and status label. */
  function getElements() {
    return {
      html: document.getElementById('editor-html'),
      css: document.getElementById('editor-css'),
      js: document.getElementById('editor-js'),
      frame: document.getElementById('sandbox-preview'),
      status: document.getElementById('sandbox-status')
    };
  }

  /** Assemble a standalone HTML document string for the sandboxed iframe srcdoc. */
  function buildSrcdoc(html, css, js) {
    const safeJs = String(js).replace(/<\/script/gi, '<\\/script');
    return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>' +
      css +
      '</style></head><body>' +
      html +
      '<script>try {\n' +
      safeJs +
      '\n} catch (err) {' +
      'const pre = document.createElement("pre");' +
      'pre.style.cssText = "color:#b91c1c;background:#fee2e2;padding:8px;border-radius:6px;margin-top:12px;";' +
      'pre.textContent = "Runtime Error: " + err.message;' +
      'document.body.appendChild(pre);' +
      '}<\/script></body></html>';
  }

  /** Render current editor contents into the iframe and optionally count the run. */
  function runPreview(countRun) {
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    const els = getElements();
    if (!els.frame || !els.html || !els.css || !els.js) return;

    els.frame.srcdoc = buildSrcdoc(els.html.value, els.css.value, els.js.value);
    if (els.status) els.status.textContent = 'Preview updated';

    if (countRun) {
      CodeSprint.state.sandboxRuns += 1;
      CodeSprint.saveState();
      CodeSprint.notifyStateChange();
    }
  }

  /** Schedule a debounced preview update 500 ms after the last editor keystroke. */
  function scheduleAutoRun() {
    const els = getElements();
    if (els.status) els.status.textContent = 'Typing...';
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(/** Execute debounced preview run. */ function onDebounce() {
      runPreview(true);
    }, DEBOUNCE_MS);
  }

  /** Populate the editors with a code snippet and immediately render it. */
  function loadCode(snippet) {
    const els = getElements();
    if (!els.html || !els.css || !els.js) return;
    els.html.value = snippet && snippet.html ? snippet.html : '';
    els.css.value = snippet && snippet.css ? snippet.css : '';
    els.js.value = snippet && snippet.js ? snippet.js : '';
    runPreview(true);
  }

  /** Handle clicking the manual Run button. */
  function handleRunClick() {
    runPreview(true);
  }

  /** Restore the default starter snippet into all three panes. */
  function resetEditors() {
    const els = getElements();
    if (!els.html || !els.css || !els.js) return;
    els.html.value = DEFAULT_SNIPPET.html;
    els.css.value = DEFAULT_SNIPPET.css;
    els.js.value = DEFAULT_SNIPPET.js;
    runPreview(false);
  }

  /** Initialize sandbox editor events and load the initial starter preview. */
  function init() {
    const els = getElements();
    for (const editor of [els.html, els.css, els.js]) {
      if (editor) editor.addEventListener('input', scheduleAutoRun);
    }
    const runBtn = document.getElementById('sandbox-run-btn');
    if (runBtn) runBtn.addEventListener('click', handleRunClick);
    const resetBtn = document.getElementById('sandbox-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetEditors);

    resetEditors();
  }

  CodeSprint.sandbox = { init, loadCode, runPreview };
})();
