# CodeSprint

**CodeSprint** is a lightweight, zero-build beginner programming sandbox and learning hub built with plain **HTML, CSS, vanilla JavaScript, and Bootstrap 5 (CDN)**. Designed for first-year CS students on low-spec laptops and tablets, it loads fast, persists progress locally, and runs without a backend or npm.

## Features

- **3D UI & Responsive Sidebar:** Pure-CSS 3D rotating cube emblem, perspective backdrop, interactive 3D card tilt, tactile keycap buttons, collapsible desktop sidebar / mobile Bootstrap Offcanvas drawer, and Light/Dark mode via CSS variables.
- **Interactive Lessons:** Beginner lessons for HTML, CSS, and JavaScript with syntax-safe code blocks, copy-to-clipboard, bookmarks, completion tracking, and one-click **Try it in Sandbox**.
- **Isolated Live Sandbox:** Split-screen HTML, CSS, and JS editors rendering into `<iframe sandbox="allow-scripts">` via `srcdoc`, with 500 ms debounced auto-run and a manual **Run** button.
- **60-Second Timed Quiz:** 5 multiple-choice questions, countdown timer, instant feedback with explanations, score summary, and persisted best score.
- **Progress Dashboard:** Bootstrap progress bars for completed lessons, best quiz score, and sandbox runs, plus a clickable bookmarks list and progress reset.

## How to Run

No installation, build step, or server is required.

### Option 1 — Open Directly
Double-click `index.html` (or open it from your browser via **File → Open File**).

### Option 2 — Local Static Server (recommended for Clipboard API & testing)
Run any lightweight static file server from the project root:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

> **Offline Use:** After the first load, your browser caches the Bootstrap 5 CDN assets automatically, and all progress (theme, completed lessons, bookmarks, best quiz score, sandbox runs) is saved locally under `localStorage` key `codesprint_state_v1`.

## Deploy Live on GitHub Pages

1. Make sure `index.html`, `.nojekyll`, `css/`, and `js/` are at the **root** of your GitHub repository (not inside an extra `codesprint/` subfolder).
2. Ensure the repository visibility is **Public** (required for GitHub Pages on GitHub Free).
3. Push your files to the `main` branch:

```bash
git init
git add .
git commit -m "Deploy CodeSprint"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

4. On GitHub, open **Settings → Pages**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` and folder `/ (root)` → click **Save**.
5. Wait ~1–2 minutes and visit `https://<your-username>.github.io/<your-repo>/`.

## Project Structure

```text
codesprint/
├── index.html          # Semantic SPA layout and views
├── css/
│   └── style.css       # Custom styles & CSS variable light/dark themes
├── js/
│   ├── app.js          # Shared state, safe localStorage wrapper, escapeHtml, router
│   ├── lessons.js      # Lesson data array, rendering, copy, bookmarks & Try It
│   ├── sandbox.js      # Split-screen editor & sandboxed iframe preview
│   ├── quiz.js         # Timed quiz engine & question array
│   └── dashboard.js    # Progress bars, bookmarks list & reset flow
└── README.md
```

## How to Add a Lesson

Open `js/lessons.js` and append a new object to the `LESSONS` array:

```js
{
  id: 'forms-basics',            // Unique slug used for bookmarks & completion
  topic: 'HTML',                 // Short badge label
  title: 'Accessible HTML Forms',
  explanation: 'Pair every <input> with a <label for="..."> for keyboard and screen-reader usability.',
  code: '<label for="name">Name</label>\n<input id="name" type="text">',
  starter: {
    html: '<label for="name">Name</label>\n<input id="name" type="text">',
    css: 'body { font-family: system-ui, sans-serif; padding: 1rem; }',
    js: ''
  }
}
```

The lesson tab bar, bookmark list, and dashboard completion progress bar (`X / N`) update automatically based on `LESSONS.length`.

## How to Add a Quiz Question

Open `js/quiz.js` and append a new object to the `QUIZ_QUESTIONS` array:

```js
{
  prompt: 'Which CSS unit scales relative to the root element font size?',
  options: ['px', 'rem', 'vh', '%'],
  answer: 1, // Zero-based index of the correct option ('rem')
  explanation: 'rem stands for root em and scales relative to <html> font-size.'
}
```

The quiz question counter, scoring total, and dashboard quiz progress bar automatically adapt to `QUIZ_QUESTIONS.length`.
