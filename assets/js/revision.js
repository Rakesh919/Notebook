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
        <div class="revision-panel__empty">
          <div class="revision-panel__title">🔥 Today's Revision</div>
          <div class="revision-panel__message">🎉 No revision due today</div>
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
                <span>${escapeHtml(category)}</span>
                ${difficulty}
              </div>
            </div>
            <a class="revision-item__button" href="#/note/${encodeURIComponent(note.categoryId)}/${encodeURIComponent(note.id)}">Open</a>
          </div>
          <div class="revision-item__stats">
            <span>Last reviewed: ${escapeHtml(item.lastReviewed === 'Never' ? 'Never' : item.lastReviewed)}</span>
            <span>Next review: ${escapeHtml(item.nextReview)}</span>
            <span>Status: ${escapeHtml(getStatusLabel(item.status))}</span>
            <span>Confidence: ${escapeHtml(item.confidence ? getConfidenceLabel(item.confidence) : 'Not reviewed')}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="revision-panel__header">
        <div class="revision-panel__title">🔥 Today's Revision</div>
      </div>
      <div class="revision-panel__list">${noteItems}</div>
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

  function renderRevisionSummary(note, categoryId, noteId) {
    const progress = getProgressForNote(categoryId, noteId);
    const statusText = getStatusLabel(progress.status || 'Learning');
    const confidenceText = progress.confidence ? getConfidenceLabel(progress.confidence) : 'Not reviewed';
    const nextReview = progress.nextReview || 'Not scheduled';
    const lastReviewed = progress.lastReviewed || 'Never';

    const options = REVIEW_CHOICES.map((choice) => `
      <button class="revision-choice" data-response="${choice.key}" data-category-id="${escapeHtml(categoryId)}" data-note-id="${escapeHtml(noteId)}">
        ${choice.label}
      </button>
    `).join('');

    return `
      <div class="revision-panel">
        <div class="revision-panel__title">Revision</div>
        <div class="revision-panel__details">
          <span>Last reviewed: ${escapeHtml(lastReviewed)}</span>
          <span>Next review: ${escapeHtml(nextReview)}</span>
          <span>Status: ${escapeHtml(statusText)}</span>
          <span>Confidence: ${escapeHtml(confidenceText)}</span>
        </div>
        <div class="revision-panel__prompt">How well did you remember this?</div>
        <div class="revision-panel__choices">${options}</div>
      </div>
    `;
  }

  function bindRevisionChoices(container, categoryId, noteId) {
    const choices = container.querySelectorAll('.revision-choice');
    choices.forEach((button) => {
      button.addEventListener('click', async () => {
        const responseKey = button.dataset.response;
        if (!responseKey) return;

        submitRevision(categoryId, noteId, responseKey);

        const panel = document.getElementById('revisionPanel');
        if (panel) {
          panel.innerHTML = renderRevisionSummary(null, categoryId, noteId);
          bindRevisionChoices(panel, categoryId, noteId);
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
