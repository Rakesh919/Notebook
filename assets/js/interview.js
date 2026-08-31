(function () {
  const INTERVIEW_CATEGORIES = [
    'Java',
    'Spring Boot',
    'JPA/Hibernate',
    'SQL',
    'Spring Security',
    'Redis',
    'Kafka',
    'Microservices',
    'System Design',
    'Testing',
    'Design Patterns',
    'SOLID',
  ];

  function getToday() {
    if (typeof window.NotebookDateUtils !== 'undefined' && window.NotebookDateUtils.getToday) {
      return window.NotebookDateUtils.getToday();
    }
    return new Date().toISOString().slice(0, 10);
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

  function readQuestionSet() {
    const fallback = { questions: [] };
    try {
      const raw = window.localStorage.getItem('notebook:questions');
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && Array.isArray(parsed.questions) ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  async function loadQuestions() {
    try {
      const response = await fetch('data/questions.json', { cache: 'no-store' });
      if (!response.ok) {
        return readQuestionSet();
      }
      const data = await response.json();
      if (data && Array.isArray(data.questions)) {
        return data;
      }
      return readQuestionSet();
    } catch (error) {
      return readQuestionSet();
    }
  }

  function getRandomQuestion(questions, categoryFilter, difficultyFilter) {
    const filtered = questions.filter((question) => {
      const categoryMatch = !categoryFilter || categoryFilter === 'All' || question.category === categoryFilter;
      const difficultyMatch = !difficultyFilter || difficultyFilter === 'All' || String(question.difficulty || '').toLowerCase() === String(difficultyFilter).toLowerCase();
      return categoryMatch && difficultyMatch;
    });

    if (!filtered.length) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  function buildStats(questionId) {
    const stats = window.NotebookStorage.getInterviewStat(questionId);
    return {
      attempts: Number(stats.attempts || 0),
      correct: Number(stats.correct || 0),
      partial: Number(stats.partial || 0),
      failed: Number(stats.failed || 0),
      lastAttempted: stats.lastAttempted || 'Never',
      nextReview: stats.nextReview || 'Not scheduled',
    };
  }

  function renderInterviewMode() {
    const container = document.getElementById('interviewModePanel');
    if (!container) return;

    const state = window.NotebookInterviewState || {
      questions: [],
      category: 'All',
      difficulty: 'All',
      index: 0,
      current: null,
      answerVisible: false,
    };

    const categoryOptions = ['All', ...INTERVIEW_CATEGORIES].map((category) => `
      <option value="${escapeHtml(category)}" ${state.category === category ? 'selected' : ''}>${escapeHtml(category)}</option>
    `).join('');

    const difficultyOptions = ['All', 'easy', 'medium', 'hard'].map((level) => `
      <option value="${escapeHtml(level)}" ${state.difficulty === level ? 'selected' : ''}>${escapeHtml(level === 'All' ? 'All' : level)}</option>
    `).join('');

    const question = state.current || getRandomQuestion(state.questions, state.category, state.difficulty);
    const stats = question ? buildStats(question.id) : null;
    const answerText = question && state.answerVisible ? `<div class="interview-mode__answer"><strong>Answer:</strong><p>${escapeHtml(question.answer || 'No answer provided yet.')}</p></div>` : '';

    container.innerHTML = `
      <div class="interview-mode">
        <div class="interview-mode__header">
          <div class="interview-mode__title">🎤 Interview Mode</div>
          <div class="interview-mode__meta">Question ${state.questions.length ? state.index + 1 : 0} / ${state.questions.length || 0}</div>
        </div>

        <div class="interview-mode__filters">
          <label>
            <span>Category</span>
            <select id="interviewCategoryFilter">${categoryOptions}</select>
          </label>
          <label>
            <span>Difficulty</span>
            <select id="interviewDifficultyFilter">${difficultyOptions}</select>
          </label>
        </div>

        ${question ? `
          <div class="interview-mode__card">
            <div class="interview-mode__badge-row">
              <span class="badge badge--tag">${escapeHtml(question.category || 'General')}</span>
              <span class="badge ${question.difficulty === 'easy' ? 'badge--difficulty-beginner' : question.difficulty === 'hard' ? 'badge--difficulty-advanced' : 'badge--difficulty-intermediate'}">${escapeHtml(String(question.difficulty || 'medium'))}</span>
            </div>
            <div class="interview-mode__question">${escapeHtml(question.question || 'Question unavailable')}</div>
            ${answerText}
            <div class="interview-mode__actions">
              <button class="interview-mode__button secondary" id="interviewRandomBtn">Random Question</button>
              <button class="interview-mode__button" id="interviewShowAnswerBtn">Show Answer</button>
            </div>
            <div class="interview-mode__choices">
              <button class="interview-mode__choice failed" data-result="failed">❌ Forgot</button>
              <button class="interview-mode__choice partial" data-result="partial">🟡 Partial</button>
              <button class="interview-mode__choice correct" data-result="correct">🟢 Correct</button>
            </div>
          </div>
          <div class="interview-mode__stats">
            <span>Attempts: ${stats ? stats.attempts : 0}</span>
            <span>Correct: ${stats ? stats.correct : 0}</span>
            <span>Partial: ${stats ? stats.partial : 0}</span>
            <span>Failed: ${stats ? stats.failed : 0}</span>
            <span>Last attempted: ${escapeHtml(stats ? stats.lastAttempted : 'Never')}</span>
            <span>Next review: ${escapeHtml(stats ? stats.nextReview : 'Not scheduled')}</span>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state__title">No questions available</div>
            <p>Add a question to data/questions.json to start interview mode.</p>
          </div>
        `}
      </div>
    `;

    const categorySelect = container.querySelector('#interviewCategoryFilter');
    const difficultySelect = container.querySelector('#interviewDifficultyFilter');
    const randomBtn = container.querySelector('#interviewRandomBtn');
    const answerBtn = container.querySelector('#interviewShowAnswerBtn');
    const choiceButtons = container.querySelectorAll('.interview-mode__choice');

    categorySelect?.addEventListener('change', (e) => {
      const nextCategory = e.target.value;
      const nextState = window.NotebookInterviewState || {};
      nextState.category = nextCategory;
      nextState.answerVisible = false;
      nextState.current = getRandomQuestion(nextState.questions, nextCategory, nextState.difficulty);
      nextState.index = 0;
      window.NotebookInterviewState = nextState;
      renderInterviewMode();
    });

    difficultySelect?.addEventListener('change', (e) => {
      const nextDifficulty = e.target.value;
      const nextState = window.NotebookInterviewState || {};
      nextState.difficulty = nextDifficulty;
      nextState.answerVisible = false;
      nextState.current = getRandomQuestion(nextState.questions, nextState.category, nextDifficulty);
      nextState.index = 0;
      window.NotebookInterviewState = nextState;
      renderInterviewMode();
    });

    randomBtn?.addEventListener('click', () => {
      const nextState = window.NotebookInterviewState || {};
      nextState.answerVisible = false;
      nextState.current = getRandomQuestion(nextState.questions, nextState.category, nextState.difficulty);
      nextState.index = Math.max(0, nextState.index);
      window.NotebookInterviewState = nextState;
      renderInterviewMode();
    });

    answerBtn?.addEventListener('click', () => {
      const nextState = window.NotebookInterviewState || {};
      nextState.answerVisible = !nextState.answerVisible;
      window.NotebookInterviewState = nextState;
      renderInterviewMode();
    });

    choiceButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const result = button.dataset.result;
        const nextState = window.NotebookInterviewState || {};
        const activeQuestion = nextState.current;
        if (!activeQuestion) return;

        window.NotebookStorage.updateInterviewStat(activeQuestion.id, result || 'failed');
        nextState.answerVisible = false;
        nextState.current = getRandomQuestion(nextState.questions, nextState.category, nextState.difficulty) || activeQuestion;
        window.NotebookInterviewState = nextState;
        renderInterviewMode();
      });
    });
  }

  async function initInterviewMode() {
    const data = await loadQuestions();
    const questions = Array.isArray(data.questions) ? data.questions : [];
    const state = {
      questions,
      category: 'All',
      difficulty: 'All',
      index: 0,
      current: getRandomQuestion(questions, 'All', 'All'),
      answerVisible: false,
    };
    window.NotebookInterviewState = state;
    renderInterviewMode();
  }

  function renderMistakeBank() {
    const container = document.getElementById('mistakeBankPanel');
    if (!container) return;
    const items = window.NotebookStorage.getMistakes();

    if (!items.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__title">❌ Mistake Bank</div>
          <p>No mistakes recorded yet.</p>
        </div>
      `;
      return;
    }

    const rows = items.map((item) => `
      <div class="mistake-item">
        <div class="mistake-item__title">${escapeHtml(item.title)}</div>
        <div class="mistake-item__meta">${escapeHtml(item.type || 'question')} · ${escapeHtml(item.category || 'General')}</div>
        <div class="mistake-item__reason"><strong>Reason:</strong> ${escapeHtml(item.reason || 'No reason provided')}</div>
        <div class="mistake-item__meta">Added: ${escapeHtml(item.addedOn || 'Unknown')} · Next review: ${escapeHtml(item.nextReview || 'Not scheduled')}</div>
        <div class="mistake-item__actions">
          <button class="mistake-item__button" data-action="review" data-id="${escapeHtml(item.id)}">Review Mistake</button>
          <button class="mistake-item__button danger" data-action="remove" data-id="${escapeHtml(item.id)}">Remove from Mistakes</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="mistake-bank">
        <div class="mistake-bank__header">
          <div class="mistake-bank__title">❌ Mistake Bank</div>
        </div>
        <div class="mistake-bank__list">${rows}</div>
      </div>
    `;

    container.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const id = button.dataset.id;
        if (action === 'review') {
          window.NotebookStorage.reviewMistake(id);
          renderMistakeBank();
          return;
        }
        if (action === 'remove') {
          window.NotebookStorage.archiveMistake(id);
          renderMistakeBank();
        }
      });
    });
  }

  function renderWeakAreas() {
    const container = document.getElementById('weakAreasPanel');
    if (!container) return;

    const questionStats = window.NotebookStorage.readInterviewProgress().stats || {};
    const weakAreas = Object.keys(questionStats)
      .filter((questionId) => Number(questionStats[questionId].failed || 0) > 0 || Number(questionStats[questionId].partial || 0) > 0)
      .map((questionId) => questionId)
      .slice(0, 10);

    if (!weakAreas.length) {
      container.innerHTML = `
        <div class="weak-areas empty-state">
          <div class="empty-state__title">⚠️ Weak Areas</div>
          <p>No weak areas yet. Answer a few interview questions to build your signal.</p>
        </div>
      `;
      return;
    }

    const unique = [...new Set(weakAreas)];
    container.innerHTML = `
      <div class="weak-areas">
        <div class="weak-areas__title">⚠️ Weak Areas</div>
        <div class="weak-areas__list">${unique.map((item) => `<span class="badge badge--tag">${escapeHtml(item)}</span>`).join('')}</div>
      </div>
    `;
  }

  function bindMistakeForm() {
    const form = document.getElementById('mistakeForm');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        id: `mistake-${Date.now()}`,
        type: formData.get('type') || 'question',
        title: formData.get('title') || 'Untitled mistake',
        category: formData.get('category') || 'General',
        reason: formData.get('reason') || '',
        addedOn: getToday(),
        nextReview: formData.get('nextReview') || getToday(),
        priority: 1,
      };

      window.NotebookStorage.addMistake(payload);
      form.reset();
      renderMistakeBank();
      renderWeakAreas();
    });
  }

  function renderMistakeForm() {
    const container = document.getElementById('mistakeFormWrap');
    if (!container) return;
    container.innerHTML = `
      <form class="mistake-form" id="mistakeForm">
        <div class="mistake-form__grid">
          <label>
            <span>Type</span>
            <select name="type">
              <option value="question">Interview question</option>
              <option value="note">Note / topic</option>
              <option value="dsa">DSA problem</option>
            </select>
          </label>
          <label>
            <span>Title</span>
            <input type="text" name="title" placeholder="SOLID Principles" required />
          </label>
          <label>
            <span>Category</span>
            <input type="text" name="category" placeholder="SOLID" />
          </label>
          <label>
            <span>Next review</span>
            <input type="date" name="nextReview" />
          </label>
        </div>
        <label>
          <span>Reason</span>
          <textarea name="reason" rows="3" placeholder="Forgot the five principles"></textarea>
        </label>
        <button class="interview-mode__button" type="submit">Add to Mistake Bank</button>
      </form>
    `;
    bindMistakeForm();
  }

  function initInterviewDashboard() {
    renderMistakeForm();
    renderMistakeBank();
    renderWeakAreas();
    initInterviewMode();
  }

  window.NotebookInterview = {
    INTERVIEW_CATEGORIES,
    loadQuestions,
    renderInterviewMode,
    renderMistakeBank,
    renderWeakAreas,
    renderMistakeForm,
    initInterviewDashboard,
    getRandomQuestion,
    buildStats,
    readQuestionSet,
  };
})();
