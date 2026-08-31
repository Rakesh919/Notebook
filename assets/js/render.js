/*
  render.js
  Turns library data into DOM. Every function here is pure UI: given data,
  produce markup. Routing decides *when* each of these gets called.
*/

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function difficultyClass(difficulty) {
  const key = (difficulty || '').toLowerCase();
  if (key === 'beginner') return 'badge--difficulty-beginner';
  if (key === 'intermediate') return 'badge--difficulty-intermediate';
  if (key === 'advanced') return 'badge--difficulty-advanced';
  return '';
}

/* ---------------- Sidebar ---------------- */

function renderSidebarNav(lib, activeCategoryId) {
  const nav = document.getElementById('sidebarNav');
  const totalNotes = lib.categories.reduce((n, c) => n + c.notes.length, 0);

  nav.innerHTML = `
    <a class="nav-item ${activeCategoryId === 'all' ? 'is-active' : ''}"
       href="#/category/all">
      <span class="nav-item__icon">📚</span>
      <span class="nav-item__label">All Categories</span>
      <span class="nav-item__count">${totalNotes}</span>
    </a>
  ` + lib.categories.map((cat) => `
    <a class="nav-item ${cat.id === activeCategoryId ? 'is-active' : ''}"
       href="#/category/${encodeURIComponent(cat.id)}">
      <span class="nav-item__icon">${cat.icon || '📄'}</span>
      <span class="nav-item__label">${escapeHtml(cat.name)}</span>
      <span class="nav-item__count">${cat.notes.length}</span>
    </a>
  `).join('');
}

/* ---------------- Home view: all categories ---------------- */

function renderHome(lib) {
  const view = document.getElementById('view-home');
  const totalNotes = lib.categories.reduce((n, c) => n + c.notes.length, 0);

  document.getElementById('homeSubtitle').textContent =
    lib.site.subtitle || `${totalNotes} notes across ${lib.categories.length} categories.`;

  const grid = document.getElementById('homeGrid');
  const todayRevision = document.getElementById('todayRevisionPanel');

  if (window.NotebookRevision && typeof window.NotebookRevision.renderTodayRevision === 'function') {
    todayRevision.innerHTML = window.NotebookRevision.renderTodayRevision(lib);
  }

  if (window.NotebookInterview && typeof window.NotebookInterview.renderInterviewMode === 'function') {
    window.NotebookInterview.renderInterviewMode();
  }

  if (window.NotebookInterview && typeof window.NotebookInterview.renderMistakeBank === 'function') {
    window.NotebookInterview.renderMistakeBank();
  }

  if (window.NotebookInterview && typeof window.NotebookInterview.renderWeakAreas === 'function') {
    window.NotebookInterview.renderWeakAreas();
  }

  if (window.NotebookDSA && typeof window.NotebookDSA.renderDashboardModules === 'function') {
    window.NotebookDSA.renderDashboardModules();
  }

  if (!lib.categories.length) {
    grid.innerHTML = emptyStateHtml('No categories yet', 'Add one in data/notes.json to get started.');
    return;
  }

  const allCategoriesCard = `
    <a class="category-card" style="--i:0" href="#/category/all">
      <div class="category-card__top">
        <span class="category-card__icon">📚</span>
        <span class="category-card__count">${totalNotes} note${totalNotes === 1 ? '' : 's'}</span>
      </div>
      <div class="category-card__name">All Categories</div>
      <p class="category-card__desc">Browse every note across all categories.</p>
      <div class="category-card__path">notes/all/</div>
    </a>
  `;

  const categoryCards = lib.categories.map((cat, i) => `
    <a class="category-card" style="--i:${i + 1}" href="#/category/${encodeURIComponent(cat.id)}">
      <div class="category-card__top">
        <span class="category-card__icon">${cat.icon || '📄'}</span>
        <span class="category-card__count">${cat.notes.length} note${cat.notes.length === 1 ? '' : 's'}</span>
      </div>
      <div class="category-card__name">${escapeHtml(cat.name)}</div>
      ${cat.description ? `<p class="category-card__desc">${escapeHtml(cat.description)}</p>` : ''}
      <div class="category-card__path">notes/${cat.id}/</div>
    </a>
  `).join('');

  grid.innerHTML = allCategoriesCard + categoryCards;
}

/* ---------------- Category view: note list ---------------- */

function noteCardHtml(note, i) {
  const tags = (note.tags || []).map((t) => `<span class="badge badge--tag">${escapeHtml(t)}</span>`).join('');
  const diff = note.difficulty
    ? `<span class="badge ${difficultyClass(note.difficulty)}">${escapeHtml(note.difficulty)}</span>`
    : '';
  return `
    <a class="note-card" style="--i:${i}" href="#/note/${encodeURIComponent(note.categoryId)}/${encodeURIComponent(note.id)}">
      <div class="note-card__title">${escapeHtml(note.title)}</div>
      <div class="note-card__meta">
        <span>${escapeHtml(note.file)}</span>
        ${note.lastUpdated ? `<span>&middot; updated ${escapeHtml(note.lastUpdated)}</span>` : ''}
      </div>
      <div class="note-card__tags">${diff}${tags}</div>
    </a>
  `;
}

function emptyStateHtml(title, body) {
  return `
    <div class="empty-state">
      <div class="empty-state__title">${escapeHtml(title)}</div>
      <p>${escapeHtml(body)}</p>
    </div>
  `;
}

function renderCategory(lib, categoryId) {
  const view = document.getElementById('view-category');
  const isAllCategories = categoryId === 'all';
  const cat = isAllCategories ? null : window.NotebookData.findCategory(lib, categoryId);
  const notes = isAllCategories
    ? lib.categories.flatMap((c) => c.notes.map((note) => ({ ...note, categoryName: c.name })))
    : cat?.notes || [];

  if (!isAllCategories && !cat) {
    view.innerHTML = `
      <div class="breadcrumb"><a href="#/">Home</a></div>
      ${emptyStateHtml('Category not found', `There is no category with id "${categoryId}" in data/notes.json.`)}
    `;
    return;
  }

  const title = isAllCategories ? 'All Categories' : `${cat.icon || '📄'} ${escapeHtml(cat.name)}`;
  const subtitle = isAllCategories
    ? `${notes.length} notes across ${lib.categories.length} categories.`
    : cat.description ? escapeHtml(cat.description) : '';

  view.innerHTML = `
    <div class="breadcrumb">
      <a href="#/">Home</a><span class="breadcrumb__sep">/</span><span>${isAllCategories ? 'All Categories' : escapeHtml(cat.name)}</span>
    </div>
    <div class="page-head">
      <h1 class="page-head__title">${escapeHtml(title)}</h1>
      ${subtitle ? `<p class="page-head__subtitle">${subtitle}</p>` : ''}
    </div>
    <div class="card-grid" id="categoryNoteGrid">
      ${notes.length
        ? notes.map((n, i) => noteCardHtml(n, i)).join('')
        : emptyStateHtml('No notes here yet', `Drop an .html file into notes/${categoryId}/ and add an entry to data/notes.json.`)}
    </div>
  `;
}

/* ---------------- Note viewer ---------------- */

function renderViewer(lib, categoryId, noteId) {
  const note = window.NotebookData.findNote(lib, categoryId, noteId);
  const frame = document.getElementById('viewerFrame');
  const pathEl = document.getElementById('viewerPath');
  const openTabLink = document.getElementById('viewerOpenTab');
  const backLink = document.getElementById('viewerBack');
  const revisionPanel = document.getElementById('revisionPanel');

  if (!note) {
    frame.removeAttribute('src');
    pathEl.textContent = 'Note not found';
    openTabLink.setAttribute('aria-disabled', 'true');
    if (revisionPanel) revisionPanel.innerHTML = '';
    return;
  }

  frame.src = note.file;
  pathEl.textContent = note.file;
  openTabLink.href = note.file;
  backLink.href = `#/category/${encodeURIComponent(categoryId)}`;

  if (revisionPanel && window.NotebookRevision && typeof window.NotebookRevision.renderRevisionSummary === 'function') {
    revisionPanel.innerHTML = window.NotebookRevision.renderRevisionSummary(note, categoryId, noteId);
    window.NotebookRevision.bindRevisionChoices(revisionPanel, categoryId, noteId);
  }
}

/* ---------------- Topbar breadcrumb path (desktop) ---------------- */

function setTopbarPath(text) {
  document.getElementById('topbarPath').textContent = text;
}

window.NotebookRender = {
  renderSidebarNav,
  renderHome,
  renderCategory,
  renderViewer,
  setTopbarPath,
  escapeHtml,
};
