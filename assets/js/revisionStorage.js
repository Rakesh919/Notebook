(function () {
  const STORAGE_KEY = 'notebook:progress';
  const STORAGE_VERSION = 1;
  const INTERVIEW_KEY = 'notebook:interview-progress';
  const MISTAKES_KEY = 'notebook:mistakes';
  const MISTAKE_ARCHIVE_KEY = 'notebook:mistakes-archived';

  function getToday() {
    if (typeof window.NotebookDateUtils !== 'undefined' && window.NotebookDateUtils.getToday) {
      return window.NotebookDateUtils.getToday();
    }
    return new Date().toISOString().slice(0, 10);
  }

  function getNextReviewDate(result) {
    if (typeof window.NotebookDateUtils !== 'undefined' && window.NotebookDateUtils.getNextReviewDate) {
      return window.NotebookDateUtils.getNextReviewDate(result);
    }
    switch (result) {
      case 'failed': return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      case 'partial': return new Date(Date.now() + 172800000).toISOString().slice(0, 10);
      case 'correct': return new Date(Date.now() + 604800000).toISOString().slice(0, 10);
      default: return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    }
  }

  function hasStorage() {
    try {
      return !!window.localStorage;
    } catch (error) {
      return false;
    }
  }

  function readStorageJson(key, fallback) {
    if (!hasStorage()) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorageJson(key, value) {
    if (!hasStorage()) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function normalizeProgress(data) {
    const base = { version: STORAGE_VERSION, revision: {} };
    if (!data || typeof data !== 'object') {
      return base;
    }

    const revision = data.revision && typeof data.revision === 'object' ? data.revision : {};
    const normalizedRevision = {};

    Object.keys(revision).forEach((key) => {
      const entry = revision[key];
      if (!entry || typeof entry !== 'object') return;
      normalizedRevision[key] = {
        status: ['Learning', 'Reviewing', 'Mastered'].includes(entry.status) ? entry.status : 'Learning',
        confidence: entry.confidence || null,
        lastReviewed: typeof entry.lastReviewed === 'string' ? entry.lastReviewed : '',
        nextReview: typeof entry.nextReview === 'string' ? entry.nextReview : '',
        reviewCount: Number.isFinite(Number(entry.reviewCount)) ? Number(entry.reviewCount) : 0,
      };
    });

    return {
      version: Number(data.version) || STORAGE_VERSION,
      revision: normalizedRevision,
    };
  }

  function readProgress() {
    const fallback = { version: STORAGE_VERSION, revision: {} };
    const raw = readStorageJson(STORAGE_KEY, fallback);
    return normalizeProgress(raw || fallback);
  }

  function writeProgress(data) {
    const payload = {
      version: STORAGE_VERSION,
      revision: data && data.revision ? data.revision : {},
    };
    return writeStorageJson(STORAGE_KEY, payload);
  }

  function noteKey(categoryId, noteId) {
    return `${encodeURIComponent(categoryId || 'unknown')}::${encodeURIComponent(noteId || 'unknown')}`;
  }

  function getNoteProgress(categoryId, noteId) {
    const state = readProgress();
    const key = noteKey(categoryId, noteId);
    return state.revision[key] || {
      status: 'Learning',
      confidence: null,
      lastReviewed: '',
      nextReview: '',
      reviewCount: 0,
    };
  }

  function setNoteProgress(categoryId, noteId, updates) {
    const state = readProgress();
    const key = noteKey(categoryId, noteId);
    const current = state.revision[key] || {
      status: 'Learning',
      confidence: null,
      lastReviewed: '',
      nextReview: '',
      reviewCount: 0,
    };

    const nextEntry = {
      ...current,
      ...updates,
      reviewCount: Number(updates.reviewCount ?? current.reviewCount ?? 0),
    };

    state.revision[key] = nextEntry;
    writeProgress(state);
    return nextEntry;
  }

  function getAllProgress() {
    return readProgress().revision;
  }

  function readInterviewProgress() {
    const fallback = { version: 1, stats: {} };
    const raw = readStorageJson(INTERVIEW_KEY, fallback);
    if (!raw || typeof raw !== 'object') return fallback;

    const normalized = {};
    Object.keys(raw.stats || {}).forEach((key) => {
      const item = raw.stats[key];
      if (!item || typeof item !== 'object') return;
      normalized[key] = {
        attempts: Number(item.attempts) || 0,
        correct: Number(item.correct) || 0,
        partial: Number(item.partial) || 0,
        failed: Number(item.failed) || 0,
        lastAttempted: typeof item.lastAttempted === 'string' ? item.lastAttempted : '',
        nextReview: typeof item.nextReview === 'string' ? item.nextReview : '',
      };
    });

    return { version: Number(raw.version) || 1, stats: normalized };
  }

  function saveInterviewProgress(data) {
    const payload = {
      version: 1,
      stats: data && data.stats ? data.stats : {},
    };
    return writeStorageJson(INTERVIEW_KEY, payload);
  }

  function getInterviewStat(questionId) {
    const state = readInterviewProgress();
    return state.stats[questionId] || {
      attempts: 0,
      correct: 0,
      partial: 0,
      failed: 0,
      lastAttempted: '',
      nextReview: '',
    };
  }

  function updateInterviewStat(questionId, result) {
    const state = readInterviewProgress();
    const key = String(questionId);
    const current = state.stats[key] || {
      attempts: 0,
      correct: 0,
      partial: 0,
      failed: 0,
      lastAttempted: '',
      nextReview: '',
    };

    const nextEntry = {
      ...current,
      attempts: Number(current.attempts || 0) + 1,
      correct: Number(current.correct || 0) + (result === 'correct' ? 1 : 0),
      partial: Number(current.partial || 0) + (result === 'partial' ? 1 : 0),
      failed: Number(current.failed || 0) + (result === 'failed' ? 1 : 0),
      lastAttempted: getToday(),
      nextReview: getNextReviewDate(result),
    };

    state.stats[key] = nextEntry;
    saveInterviewProgress(state);
    return nextEntry;
  }

  function readMistakes() {
    const fallback = { version: 1, items: [], archived: [] };
    const raw = readStorageJson(MISTAKES_KEY, fallback);
    if (!raw || typeof raw !== 'object') return fallback;
    return {
      version: Number(raw.version) || 1,
      items: Array.isArray(raw.items) ? raw.items : [],
      archived: Array.isArray(raw.archived) ? raw.archived : [],
    };
  }

  function writeMistakes(data) {
    const payload = {
      version: 1,
      items: Array.isArray(data && data.items) ? data.items : [],
      archived: Array.isArray(data && data.archived) ? data.archived : [],
    };
    return writeStorageJson(MISTAKES_KEY, payload);
  }

  function addMistake(entry) {
    const current = readMistakes();
    const nextEntry = {
      id: entry && entry.id ? entry.id : `mistake-${Date.now()}`,
      type: entry && entry.type ? entry.type : 'question',
      title: entry && entry.title ? entry.title : 'Untitled mistake',
      category: entry && entry.category ? entry.category : '',
      reason: entry && entry.reason ? entry.reason : '',
      addedOn: entry && entry.addedOn ? entry.addedOn : getToday(),
      nextReview: entry && entry.nextReview ? entry.nextReview : getToday(),
      priority: Number(entry && entry.priority ? entry.priority : 1),
      archived: false,
    };
    current.items.unshift(nextEntry);
    writeMistakes(current);
    return nextEntry;
  }

  function archiveMistake(id) {
    const current = readMistakes();
    const matchIndex = current.items.findIndex((item) => item.id === id);
    if (matchIndex === -1) return current;
    const match = current.items.splice(matchIndex, 1)[0];
    current.archived.push({ ...match, archived: true, archivedOn: getToday() });
    writeMistakes(current);
    return current;
  }

  function reviewMistake(id) {
    const current = readMistakes();
    const match = current.items.find((item) => item.id === id);
    if (!match) return current;
    match.nextReview = window.NotebookDateUtils ? window.NotebookDateUtils.addDays(getToday(), 1) : getToday();
    match.priority = Math.max(1, Number(match.priority || 1) + 1);
    writeMistakes(current);
    return current;
  }

  function getMistakes() {
    const current = readMistakes();
    return current.items || [];
  }

  function getArchivedMistakes() {
    const current = readMistakes();
    return current.archived || [];
  }

  window.NotebookStorage = {
    STORAGE_KEY,
    STORAGE_VERSION,
    INTERVIEW_KEY,
    MISTAKES_KEY,
    MISTAKE_ARCHIVE_KEY,
    getNoteProgress,
    setNoteProgress,
    getAllProgress,
    readProgress,
    writeProgress,
    noteKey,
    readInterviewProgress,
    saveInterviewProgress,
    getInterviewStat,
    updateInterviewStat,
    readMistakes,
    writeMistakes,
    addMistake,
    archiveMistake,
    reviewMistake,
    getMistakes,
    getArchivedMistakes,
  };
})();
