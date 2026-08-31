(function () {
  const DSA_STORAGE_KEY = 'notebook:dsa-progress';
  const NINETY_DAY_KEY = 'notebook:90day-plan';

  function getToday() {
    if (typeof window.NotebookDateUtils !== 'undefined' && window.NotebookDateUtils.getToday) {
      return window.NotebookDateUtils.getToday();
    }
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(baseDate, days) {
    if (typeof window.NotebookDateUtils !== 'undefined' && window.NotebookDateUtils.addDays) {
      return window.NotebookDateUtils.addDays(baseDate, days);
    }
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
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

  function isoToday() {
    return getToday();
  }

  function readStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  async function loadDsaProblems() {
    try {
      const response = await fetch('data/dsa.json', { cache: 'no-store' });
      if (!response.ok) return { problems: [] };
      const data = await response.json();
      return data && Array.isArray(data.problems) ? data : { problems: [] };
    } catch (error) {
      return { problems: [] };
    }
  }

  function readDsaProgress() {
    return readStorage(DSA_STORAGE_KEY, {});
  }

  function saveDsaProgress(data) {
    return writeStorage(DSA_STORAGE_KEY, data || {});
  }

  function getProblemProgress(problemId) {
    const all = readDsaProgress();
    return all[problemId] || {
      solved: false,
      attempts: 0,
      lastSolved: '',
      nextReview: '',
      confidence: 0,
      neededSolution: false,
    };
  }

  function updateProblemProgress(problemId, updates) {
    const all = readDsaProgress();
    const current = all[problemId] || {
      solved: false,
      attempts: 0,
      lastSolved: '',
      nextReview: '',
      confidence: 0,
      neededSolution: false,
    };
    all[problemId] = { ...current, ...updates };
    saveDsaProgress(all);
    return all[problemId];
  }

  function markSolved(problemId, solvedWithoutLooking) {
    const current = getProblemProgress(problemId);
    const next = {
      solved: true,
      attempts: Number(current.attempts || 0) + 1,
      lastSolved: isoToday(),
      nextReview: solvedWithoutLooking ? addDays(isoToday(), 7) : addDays(isoToday(), 1),
      confidence: solvedWithoutLooking ? Math.min(5, Number(current.confidence || 0) + 1) : Math.max(1, Number(current.confidence || 0)),
      neededSolution: !solvedWithoutLooking,
    };
    return updateProblemProgress(problemId, next);
  }

  function renderDsaDashboard() {
    const container = document.getElementById('dsaDashboardPanel');
    if (!container) return;

    loadDsaProblems().then((data) => {
      const problems = data.problems || [];
      const progress = readDsaProgress();
      const total = problems.length;
      const solved = problems.filter((problem) => progress[problem.id] && progress[problem.id].solved).length;
      const easy = problems.filter((p) => String(p.difficulty || '').toLowerCase() === 'easy').length;
      const medium = problems.filter((p) => String(p.difficulty || '').toLowerCase() === 'medium').length;
      const hard = problems.filter((p) => String(p.difficulty || '').toLowerCase() === 'hard').length;
      const due = problems.filter((problem) => {
        const entry = progress[problem.id] || {};
        return entry.nextReview && entry.nextReview <= isoToday();
      }).length;

      container.innerHTML = `
        <div class="dsa-dashboard">
          <div class="dashboard-title">💻 DSA Progress</div>
          <div class="dsa-dashboard__row">
            <div class="dsa-dashboard__stat">
              <div class="dsa-dashboard__label">NeetCode 150</div>
              <div class="dsa-dashboard__value">${solved} / ${total}</div>
            </div>
          </div>
          <div class="dsa-dashboard__breakdown">
            <span class="badge badge--difficulty-beginner">Easy: ${easy}</span>
            <span class="badge badge--difficulty-intermediate">Medium: ${medium}</span>
            <span class="badge badge--difficulty-advanced">Hard: ${hard}</span>
          </div>
          <div class="dsa-dashboard__due">Due for revision: ${due}</div>
        </div>
      `;
    });
  }

  function render90DayDashboard() {
    const container = document.getElementById('ninetyDayPanel');
    if (!container) return;

    const plan = readStorage(NINETY_DAY_KEY, { active: false, startedAt: '', paused: false });
    const totalDays = 90;
    const startDate = plan.startedAt ? new Date(plan.startedAt) : null;
    const isActive = !!plan.active && startDate && !Number.isNaN(startDate.getTime());
    const today = new Date();
    const currentDay = isActive ? Math.min(totalDays, Math.max(1, Math.floor((today - startDate) / 86400000) + 1)) : 0;
    const remaining = isActive ? Math.max(0, totalDays - currentDay + 1) : totalDays;
    const endDate = startDate && !Number.isNaN(startDate.getTime()) ? new Date(startDate) : new Date();
    if (startDate && !Number.isNaN(startDate.getTime())) {
      endDate.setDate(endDate.getDate() + 89);
    }

    const controls = `
      <div class="plan-controls">
        ${isActive ? '<button class="interview-mode__button" data-plan-action="pause">Pause 90-day plan</button>' : '<button class="interview-mode__button" data-plan-action="start">Start 90-day plan</button>'}
        ${isActive ? '<button class="interview-mode__button secondary" data-plan-action="reset">Reset plan</button>' : ''}
      </div>
    `;

    container.innerHTML = `
      <div class="plan-panel">
        <div class="dashboard-title">🎯 90-Day Interview Preparation</div>
        <div class="plan-panel__meta">Start Date: ${plan.startedAt || 'Not started yet'}</div>
        <div class="plan-panel__meta">Current Day: ${currentDay} / ${totalDays}</div>
        <div class="plan-panel__meta">Days Remaining: ${remaining}</div>
        <div class="plan-panel__meta">End Date: ${plan.startedAt ? endDate.toISOString().slice(0, 10) : '—'}</div>
        ${controls}
      </div>
    `;

    container.querySelectorAll('[data-plan-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.planAction;
        if (action === 'start') {
          if (confirm('Start the 90-day interview plan?')) {
            writeStorage(NINETY_DAY_KEY, { active: true, startedAt: isoToday(), paused: false });
            render90DayDashboard();
          }
          return;
        }
        if (action === 'pause') {
          if (confirm('Pause the 90-day plan?')) {
            const planData = readStorage(NINETY_DAY_KEY, { active: false, startedAt: '', paused: false });
            planData.active = false;
            planData.paused = true;
            writeStorage(NINETY_DAY_KEY, planData);
            render90DayDashboard();
          }
          return;
        }
        if (action === 'reset') {
          if (confirm('Reset your 90-day plan? This only affects your 90-day plan progress, not your notes.')) {
            writeStorage(NINETY_DAY_KEY, { active: false, startedAt: '', paused: false });
            render90DayDashboard();
          }
        }
      });
    });
  }

  function renderDailyGoals() {
    const container = document.getElementById('dailyGoalsPanel');
    if (!container) return;

    const goals = [
      '1–2 hours theory',
      '1 DSA problem',
      'Revision',
      'Practical project work',
      'Mock interview',
    ];

    const saved = readStorage('notebook:daily-goals', {});
    const items = goals.map((goal) => {
      const selected = saved[goal] ? 'checked' : '';
      return `
        <label class="goal-item">
          <input type="checkbox" data-goal="${escapeHtml(goal)}" ${selected} />
          <span>${escapeHtml(goal)}</span>
        </label>
      `;
    }).join('');

    container.innerHTML = `
      <div class="goal-panel">
        <div class="dashboard-title">📅 Today's Goals</div>
        <div class="goal-list">${items}</div>
      </div>
    `;

    container.querySelectorAll('[data-goal]').forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
        const key = event.target.dataset.goal;
        const values = readStorage('notebook:daily-goals', {});
        values[key] = event.target.checked;
        writeStorage('notebook:daily-goals', values);
      });
    });
  }

  function renderWeekendGoals() {
    const container = document.getElementById('weekendGoalsPanel');
    if (!container) return;

    const goals = [
      '2–3 DSA problems',
      'Weekly revision',
      'Practical project work',
      'Mock interview',
    ];

    const saved = readStorage('notebook:weekend-goals', {});
    const items = goals.map((goal) => {
      const selected = saved[goal] ? 'checked' : '';
      return `
        <label class="goal-item">
          <input type="checkbox" data-weekend-goal="${escapeHtml(goal)}" ${selected} />
          <span>${escapeHtml(goal)}</span>
        </label>
      `;
    }).join('');

    container.innerHTML = `
      <div class="goal-panel">
        <div class="dashboard-title">📅 Weekend Goals</div>
        <div class="goal-list">${items}</div>
      </div>
    `;

    container.querySelectorAll('[data-weekend-goal]').forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
        const key = event.target.dataset.weekendGoal;
        const values = readStorage('notebook:weekend-goals', {});
        values[key] = event.target.checked;
        writeStorage('notebook:weekend-goals', values);
      });
    });
  }

  function renderWeeklySummary() {
    const container = document.getElementById('weeklySummaryPanel');
    if (!container) return;

    const interviewStats = window.NotebookStorage.readInterviewProgress().stats || {};
    const totalInterviewQuestions = Object.keys(interviewStats).length;
    const mistakes = window.NotebookStorage.getMistakes().length;
    const dsaProgress = readDsaProgress();
    const dsaSolved = Object.values(dsaProgress).filter((item) => item && item.solved).length;

    const summary = `
      <div class="goal-panel">
        <div class="dashboard-title">📊 Weekly Review</div>
        <div class="weekly-summary__list">
          <span>Topics learned: 0</span>
          <span>Topics revised: ${Object.values(readStorage('notebook:daily-goals', {})).filter(Boolean).length}</span>
          <span>Mistakes fixed: ${mistakes}</span>
          <span>DSA solved: ${dsaSolved}</span>
          <span>Interview questions: ${totalInterviewQuestions}</span>
        </div>
      </div>
    `;
    container.innerHTML = summary;
  }

  function renderDashboardModules() {
    renderDsaDashboard();
    render90DayDashboard();
    renderDailyGoals();
    renderWeekendGoals();
    renderWeeklySummary();
  }

  window.NotebookDSA = {
    DSA_STORAGE_KEY,
    NINETY_DAY_KEY,
    loadDsaProblems,
    readDsaProgress,
    saveDsaProgress,
    getProblemProgress,
    updateProblemProgress,
    markSolved,
    renderDsaDashboard,
    render90DayDashboard,
    renderDailyGoals,
    renderWeekendGoals,
    renderWeeklySummary,
    renderDashboardModules,
    isoToday,
  };
})();
