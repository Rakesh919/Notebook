(function () {
  const REVIEW_CHOICES = [
    { key: 'forgot', label: '😵 Forgot', days: 1 },
    { key: 'hard', label: '😐 Hard', days: 2 },
    { key: 'good', label: '🙂 Good', days: 7 },
    { key: 'easy', label: '🔥 Easy', days: 14 },
  ];

  function formatDate(date) {
    if (typeof window.NotebookDateUtils !== 'undefined') {
      return window.NotebookDateUtils.formatDate(date);
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTodayIso() {
    if (typeof window.NotebookDateUtils !== 'undefined') {
      return window.NotebookDateUtils.getToday();
    }
    return formatDate(new Date());
  }

  function addDaysToDate(date, days) {
    if (typeof window.NotebookDateUtils !== 'undefined') {
      return window.NotebookDateUtils.addDays(date, days);
    }
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return formatDate(next);
  }

  function getProgressForNote(categoryId, noteId) {
    return window.NotebookStorage.getNoteProgress(categoryId, noteId);
  }

  function getStatusLabel(status) {
    if (status === 'Mastered') return 'Mastered';
    if (status === 'Reviewing') return 'Reviewing';
    return 'Learning';
  }

  function getConfidenceLabel(key) {
    const match = REVIEW_CHOICES.find((choice) => choice.key === key);
    return match ? match.label : 'Not reviewed';
  }

  function computeInterval(responseKey, reviewCount) {
    const safeCount = Number(reviewCount) || 0;

    if (responseKey === 'forgot') return 1;
    if (responseKey === 'hard') return safeCount >= 2 ? 7 : 2;
    if (responseKey === 'good') {
      if (safeCount >= 3) return 30;
      if (safeCount >= 1) return 14;
      return 7;
    }
    if (responseKey === 'easy') {
      if (safeCount >= 3) return 60;
      if (safeCount >= 1) return 30;
      return 14;
    }

    return 7;
  }

  function computeStatus(responseKey, reviewCount) {
    const safeCount = Number(reviewCount) || 0;

    if (responseKey === 'forgot') return 'Learning';
    if (responseKey === 'hard') return safeCount >= 2 ? 'Reviewing' : 'Reviewing';
    if (responseKey === 'good') return safeCount >= 2 ? 'Mastered' : 'Reviewing';
    if (responseKey === 'easy') return safeCount >= 2 ? 'Mastered' : 'Reviewing';

    return 'Learning';
  }

  function submitRevision(categoryId, noteId, responseKey) {
    const current = getProgressForNote(categoryId, noteId);
    const reviewCount = Number(current.reviewCount || 0) + 1;
    const nextReviewDays = computeInterval(responseKey, reviewCount - 1);
    const today = getTodayIso();

    const nextEntry = {
      status: computeStatus(responseKey, reviewCount - 1),
      confidence: responseKey,
      lastReviewed: today,
      nextReview: addDaysToDate(today, nextReviewDays),
      reviewCount,
    };

    window.NotebookStorage.setNoteProgress(categoryId, noteId, nextEntry);
    return nextEntry;
  }

  function getDueToday() {
    const today = getTodayIso();
    const allProgress = window.NotebookStorage.getAllProgress();
    const due = [];

    Object.keys(allProgress).forEach((key) => {
      const entry = allProgress[key];
      if (!entry || !entry.nextReview || entry.nextReview > today) {
        return;
      }

      const [categoryId, noteId] = key.split('::').map((part) => decodeURIComponent(part));
      due.push({
        key,
        categoryId,
        noteId,
        status: entry.status || 'Learning',
        confidence: entry.confidence || null,
        lastReviewed: entry.lastReviewed || 'Never',
        nextReview: entry.nextReview,
        reviewCount: Number(entry.reviewCount || 0),
      });
    });

    return due.sort((a, b) => (a.nextReview || '').localeCompare(b.nextReview || ''));
  }

  function renderRevisionList(lib) {
    const due = getDueToday();
    if (!due.length) {
      return `
        <div class="revision-summary-card">
          <div class="revision-summary-header">
            <div class="revision-summary-title">
              <span class="flame-glow">🔥</span> Today's Spaced Repetition
            </div>
            <span class="badge badge--difficulty-beginner">All Caught Up</span>
          </div>
          <div class="revision-summary-content">
            <div class="revision-summary-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div class="revision-summary-text">
              <div class="revision-summary-headline">Memory Bank Clear</div>
              <p>No technical notes are due for spaced repetition review today. Keep your momentum going by exploring a new topic or testing yourself in Interview Mode!</p>
            </div>
          </div>
        </div>
      `;
    }

    const noteItems = due.map((item) => {
      const note = lib.categories
        .find((cat) => cat.id === item.categoryId)
        ?.notes.find((entry) => entry.id === item.noteId);

      if (!note) return '';

      const category = note.categoryName || item.categoryId;
      const difficulty = note.difficulty ? `<span class="badge ${difficultyClass(note.difficulty)}">${escapeHtml(note.difficulty)}</span>` : '';

      return `
        <div class="revision-item">
          <div class="revision-item__header">
            <div>
              <div class="revision-item__title">${escapeHtml(note.title)}</div>
              <div class="revision-item__meta">
                <span class="badge badge--tag">${escapeHtml(category)}</span>
                ${difficulty}
              </div>
            </div>
            <a class="revision-item__button" href="#/note/${encodeURIComponent(item.categoryId)}/${encodeURIComponent(item.noteId)}">Review Note →</a>
          </div>
          <div class="revision-item__stats">
            <span>Last reviewed: <strong>${escapeHtml(item.lastReviewed === 'Never' ? 'Never' : item.lastReviewed)}</strong></span>
            <span>Next: <strong>${escapeHtml(item.nextReview)}</strong></span>
            <span>Status: <span class="status-chip ${item.status ? item.status.toLowerCase() : ''}">${escapeHtml(getStatusLabel(item.status))}</span></span>
            <span>Confidence: ${escapeHtml(item.confidence ? getConfidenceLabel(item.confidence) : 'Not reviewed')}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="revision-panel-wrap">
        <div class="revision-summary-header">
          <div class="revision-summary-title">
            <span class="flame-glow">🔥</span> Notes Due for Review
          </div>
          <span class="badge badge--difficulty-advanced">${due.length} Due Today</span>
        </div>
        <div class="revision-panel__list">${noteItems}</div>
      </div>
    `;
  }

  function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));
  }

  function difficultyClass(difficulty) {
    const key = (difficulty || '').toLowerCase();
    if (key === 'beginner') return 'badge--difficulty-beginner';
    if (key === 'intermediate') return 'badge--difficulty-intermediate';
    if (key === 'advanced') return 'badge--difficulty-advanced';
    return '';
  }

  let revisionExpanded = false;

  function renderRevisionSummary(note, categoryId, noteId) {
    const progress = getProgressForNote(categoryId, noteId);
    const statusText = getStatusLabel(progress.status || 'Learning');
    const confidenceText = progress.confidence ? getConfidenceLabel(progress.confidence) : 'Not reviewed';
    const nextReview = progress.nextReview || 'Not scheduled';
    const lastReviewed = progress.lastReviewed || 'Never';

    const options = REVIEW_CHOICES.map((choice) => `
      <button class="revision-choice choice--${choice.key}" data-response="${choice.key}" data-category-id="${escapeHtml(categoryId)}" data-note-id="${escapeHtml(noteId)}">
        ${choice.label}
      </button>
    `).join('');

    return `
      <div class="viewer-rev ${revisionExpanded ? 'is-expanded' : 'is-collapsed'}" id="viewerRev">
        <div class="viewer-rev__header" id="viewerRevToggle">
          <div class="viewer-rev__summary">
            <span class="viewer-rev__icon">🔥</span>
            <span class="viewer-rev__title">Revision</span>
            <span class="viewer-rev__badge status--${statusText.toLowerCase()}">${escapeHtml(statusText)}</span>
            <span class="viewer-rev__next">Next: <strong>${escapeHtml(nextReview)}</strong></span>
          </div>
          <button class="viewer-rev__toggle-btn" id="viewerRevToggleBtn" aria-label="Toggle rating panel" type="button">
            <span class="toggle-text">${revisionExpanded ? 'Hide' : 'Rate Recall'}</span>
            <span class="toggle-icon">${revisionExpanded ? '▲' : '▼'}</span>
          </button>
        </div>

        <div class="viewer-rev__drawer">
          <div class="viewer-rev__prompt">How well did you remember this note?</div>
          <div class="viewer-rev__choices">${options}</div>
          <div class="viewer-rev__meta">
            <span>Last reviewed: ${escapeHtml(lastReviewed)}</span>
            <span>Confidence: ${escapeHtml(confidenceText)}</span>
            <span>Total reviews: ${progress.reviewCount || 0}</span>
          </div>
        </div>
      </div>
    `;
  }

  function bindRevisionChoices(container, categoryId, noteId) {
    const toggleBtn = container.querySelector('#viewerRevToggleBtn');
    const header = container.querySelector('#viewerRevToggle');
    const toggleHandler = () => {
      revisionExpanded = !revisionExpanded;
      const rev = container.querySelector('#viewerRev');
      if (rev) {
        rev.classList.toggle('is-expanded', revisionExpanded);
        rev.classList.toggle('is-collapsed', !revisionExpanded);
        const label = rev.querySelector('.toggle-text');
        const icon = rev.querySelector('.toggle-icon');
        if (label) label.textContent = revisionExpanded ? 'Hide' : 'Rate Recall';
        if (icon) icon.textContent = revisionExpanded ? '▲' : '▼';
      }
    };

    if (toggleBtn) toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleHandler(); });
    if (header) header.addEventListener('click', toggleHandler);

    const choices = container.querySelectorAll('.revision-choice');
    choices.forEach((button) => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const responseKey = button.dataset.response;
        if (!responseKey) return;

        const nextEntry = submitRevision(categoryId, noteId, responseKey);

        // Auto collapse after rating
        revisionExpanded = false;

        const panel = document.getElementById('revisionPanel');
        if (panel) {
          panel.innerHTML = renderRevisionSummary(null, categoryId, noteId);
          bindRevisionChoices(panel, categoryId, noteId);

          // Brief toast feedback
          const summaryEl = panel.querySelector('.viewer-rev__summary');
          if (summaryEl) {
            summaryEl.innerHTML = `<span class="viewer-rev__icon" style="color:var(--success);">✓</span> <span style="color:var(--success); font-weight:600;">Saved! Next: ${escapeHtml(nextEntry.nextReview)}</span>`;
          }
        }

        const homeView = document.getElementById('view-home');
        if (homeView && homeView.classList.contains('is-active')) {
          const lib = await window.NotebookData.loadLibrary();
          if (window.NotebookRender && typeof window.NotebookRender.renderHome === 'function') {
            window.NotebookRender.renderHome(lib);
          }
        }
      });
    });
  }

  function renderTodayRevision(lib) {
    return renderRevisionList(lib);
  }

  function initRevision() {
    document.addEventListener('DOMContentLoaded', () => {
      const panel = document.getElementById('revisionPanel');
      if (panel) {
        panel.addEventListener('click', (event) => {
          const target = event.target.closest('.revision-choice');
          if (!target) return;
          const { response } = target.dataset;
          if (!response) return;

          const noteId = target.dataset.noteId;
          const categoryId = target.dataset.categoryId;
          if (noteId && categoryId) {
            submitRevision(categoryId, noteId, response);
            const parent = target.closest('.revision-panel');
            if (parent) {
              parent.innerHTML = renderRevisionSummary(null, categoryId, noteId);
              bindRevisionChoices(parent, categoryId, noteId);
            }
          }
        });
      }
    });
  }

  window.NotebookRevision = {
    REVIEW_CHOICES,
    getTodayIso,
    submitRevision,
    getDueToday,
    renderTodayRevision,
    renderRevisionSummary,
    bindRevisionChoices,
    getProgressForNote,
    computeInterval,
    computeStatus,
    getStatusLabel,
    getConfidenceLabel,
  };

  initRevision();
})();
