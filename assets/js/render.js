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
    <div class="sidebar-section">
      <div class="nav-section-label">Workspace</div>
      <a class="nav-item ${activeCategoryId === null ? 'is-active' : ''}" href="#/" id="sidebarNavOverview">
        <span class="nav-item__icon-box"><span class="nav-item__icon">⚡</span></span>
        <span class="nav-item__label">Overview</span>
        <span class="nav-item__count">${totalNotes}</span>
      </a>
      <a class="nav-item ${activeCategoryId === 'all' ? 'is-active' : ''}" href="#/category/all" id="sidebarNavAll">
        <span class="nav-item__icon-box"><span class="nav-item__icon">📚</span></span>
        <span class="nav-item__label">All Notes</span>
        <span class="nav-item__count">${totalNotes}</span>
      </a>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section__header">
        <div class="nav-section-label">Categories</div>
        <span class="sidebar-section__count">${lib.categories.length} Topics</span>
      </div>
      ${lib.categories.map((cat) => `
        <a class="nav-item ${cat.id === activeCategoryId ? 'is-active' : ''}"
           href="#/category/${encodeURIComponent(cat.id)}"
           title="${escapeHtml(cat.name)} (${cat.notes.length} notes)">
          <span class="nav-item__icon-box"><span class="nav-item__icon">${cat.icon || '📄'}</span></span>
          <span class="nav-item__label">${escapeHtml(cat.name)}</span>
          <span class="nav-item__count ${cat.notes.length === 0 ? 'is-zero' : ''}">${cat.notes.length}</span>
        </a>
      `).join('')}
    </div>

    <div class="sidebar-footer">
      <div class="sidebar-footer__stats">
        <span class="status-dot"></span>
        <span>${totalNotes} notes &middot; Offline Ready</span>
      </div>
    </div>
  `;
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
        <div class="category-card__icon-box"><span class="category-card__icon">📚</span></div>
        <span class="category-card__count">${totalNotes} notes</span>
      </div>
      <div class="category-card__name">
        <span>All Categories</span>
        <span class="category-card__arrow">→</span>
      </div>
      <p class="category-card__desc">Browse every engineering note across all core categories.</p>
      <div class="category-card__footer">
        <span class="category-card__path">notes/all/</span>
        <span class="category-card__sub-badge">All Notes</span>
      </div>
    </a>
  `;

  const categoryCards = lib.categories.map((cat, i) => `
    <a class="category-card" style="--i:${i + 1}" href="#/category/${encodeURIComponent(cat.id)}">
      <div class="category-card__top">
        <div class="category-card__icon-box"><span class="category-card__icon">${cat.icon || '📄'}</span></div>
        <span class="category-card__count ${cat.notes.length === 0 ? 'is-zero' : ''}">${cat.notes.length} note${cat.notes.length === 1 ? '' : 's'}</span>
      </div>
      <div class="category-card__name">
        <span>${escapeHtml(cat.name)}</span>
        <span class="category-card__arrow">→</span>
      </div>
      ${cat.description ? `<p class="category-card__desc">${escapeHtml(cat.description)}</p>` : ''}
      <div class="category-card__footer">
        <span class="category-card__path">notes/${cat.id}/</span>
        <span class="category-card__sub-badge">${cat.notes.length > 0 ? `${cat.notes.length} Guides` : '0 Guides'}</span>
      </div>
    </a>
  `).join('');

  grid.innerHTML = allCategoriesCard + categoryCards;
}

/* ---------------- Category view: note list ---------------- */

function noteCardHtml(note, i) {
  const tags = (note.tags || []).map((t) => `<span class="badge badge--tag">${escapeHtml(t)}</span>`).join('');
  const diffClass = difficultyClass(note.difficulty);
  const diffBadge = note.difficulty
    ? `<span class="badge ${diffClass}">
        <span class="diff-indicator ${diffClass}"></span>
        ${escapeHtml(note.difficulty)}
      </span>`
    : '';

  const catName = note.categoryName || note.categoryId || '';
  const fileName = (note.file || '').split('/').pop();

  return `
    <a class="note-card" style="--i:${i}" href="#/note/${encodeURIComponent(note.categoryId)}/${encodeURIComponent(note.id)}">
      <div class="note-card__top">
        <span class="note-card__category-badge">${catName ? escapeHtml(catName) : 'Technical Note'}</span>
        ${diffBadge}
      </div>

      <div class="note-card__title">
        <span>${escapeHtml(note.title)}</span>
        <span class="note-card__arrow">→</span>
      </div>

      <div class="note-card__meta">
        <span class="note-card__file" title="${escapeHtml(note.file)}">
          <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          ${escapeHtml(fileName)}
        </span>
        ${note.lastUpdated ? `<span class="note-card__date">Updated ${escapeHtml(note.lastUpdated)}</span>` : ''}
      </div>

      <div class="note-card__tags">${tags}</div>
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
    : (cat?.notes || []).map((note) => ({ ...note, categoryName: cat.name }));

  if (!isAllCategories && !cat) {
    view.innerHTML = `
      <div class="breadcrumb"><a href="#/">Home</a></div>
      ${emptyStateHtml('Category not found', `There is no category with id "${categoryId}" in data/notes.json.`)}
    `;
    return;
  }

  const title = isAllCategories ? 'All Categories' : `${cat.icon || '📄'} ${escapeHtml(cat.name)}`;
  const subtitle = isAllCategories
    ? `${notes.length} technical notes cataloged across ${lib.categories.length} core engineering categories.`
    : cat.description ? escapeHtml(cat.description) : '';

  view.innerHTML = `
    <div class="category-header-wrap">
      <div class="breadcrumb">
        <a href="#/">Home</a><span class="breadcrumb__sep">/</span><span>${isAllCategories ? 'All Categories' : escapeHtml(cat.name)}</span>
      </div>

      <div class="page-head">
        <div class="page-head__title-row">
          <h1 class="page-head__title">${escapeHtml(title)}</h1>
          <span class="badge badge--difficulty-beginner note-count-pill">${notes.length} note${notes.length === 1 ? '' : 's'}</span>
        </div>
        ${subtitle ? `<p class="page-head__subtitle">${subtitle}</p>` : ''}
      </div>

      <div class="category-toolbar">
        <div class="category-filters" id="categoryFilterChips">
          <button class="filter-chip is-active" data-filter="all">All (${notes.length})</button>
          <button class="filter-chip" data-filter="beginner">🟢 Beginner</button>
          <button class="filter-chip" data-filter="intermediate">🟡 Intermediate</button>
          <button class="filter-chip" data-filter="advanced">🔴 Advanced</button>
        </div>
        <div class="category-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="categorySearchInput" placeholder="Filter ${notes.length} notes..." />
        </div>
      </div>
    </div>

    <div class="card-grid" id="categoryNoteGrid">
      ${notes.length
        ? notes.map((n, i) => noteCardHtml(n, i)).join('')
        : emptyStateHtml('No notes here yet', `Drop an .html file into notes/${categoryId}/ and add an entry to data/notes.json.`)}
    </div>
  `;

  // Bind category filter chips and search
  const filterChips = view.querySelectorAll('#categoryFilterChips .filter-chip');
  const searchInput = view.querySelector('#categorySearchInput');
  const grid = view.querySelector('#categoryNoteGrid');

  let activeFilter = 'all';
  let searchQuery = '';

  function applyFilters() {
    const filtered = notes.filter((n) => {
      const diffMatch = activeFilter === 'all' || (n.difficulty || '').toLowerCase() === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const textMatch = !q
        || (n.title || '').toLowerCase().includes(q)
        || (n.file || '').toLowerCase().includes(q)
        || (n.tags || []).some((t) => t.toLowerCase().includes(q));
      return diffMatch && textMatch;
    });

    grid.innerHTML = filtered.length
      ? filtered.map((n, i) => noteCardHtml(n, i)).join('')
      : emptyStateHtml('No matching notes', `No notes found matching "${searchQuery || activeFilter}".`);
  }

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeFilter = chip.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyFilters();
    });
  }
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
