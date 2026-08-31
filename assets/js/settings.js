(function () {
  /**
   * Settings and Backup Module
   * Handles export, import, and reset of user progress data.
   */

  function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));
  }

  /**
   * Get all personal progress data from localStorage
   * @returns {object} Complete progress data
   */
  function getAllProgressData() {
    const data = {
      exportedAt: window.NotebookDateUtils.getToday(),
      exportedFormatted: window.NotebookDateUtils.getTodayFormatted(),
      appVersion: '1.0',
      revision: {},
      interview: {},
      mistakes: [],
      dsa: {},
      plan: {},
      dailyGoals: {},
      weekendGoals: {},
      settings: {},
    };

    try {
      // Revision progress
      const revisionRaw = window.localStorage.getItem('notebook:progress');
      if (revisionRaw) {
        data.revision = JSON.parse(revisionRaw);
      }
    } catch (e) {
      console.warn('Could not read revision data:', e);
    }

    try {
      // Interview progress
      const interviewRaw = window.localStorage.getItem('notebook:interview-progress');
      if (interviewRaw) {
        data.interview = JSON.parse(interviewRaw);
      }
    } catch (e) {
      console.warn('Could not read interview data:', e);
    }

    try {
      // Mistakes
      const mistakesRaw = window.localStorage.getItem('notebook:mistakes');
      if (mistakesRaw) {
        data.mistakes = JSON.parse(mistakesRaw);
      }
    } catch (e) {
      console.warn('Could not read mistakes data:', e);
    }

    try {
      // DSA progress
      const dsaRaw = window.localStorage.getItem('notebook:dsa-progress');
      if (dsaRaw) {
        data.dsa = JSON.parse(dsaRaw);
      }
    } catch (e) {
      console.warn('Could not read DSA data:', e);
    }

    try {
      // 90-day plan
      const planRaw = window.localStorage.getItem('notebook:90day-plan');
      if (planRaw) {
        data.plan = JSON.parse(planRaw);
      }
    } catch (e) {
      console.warn('Could not read plan data:', e);
    }

    try {
      // Daily goals
      const dailyRaw = window.localStorage.getItem('notebook:daily-goals');
      if (dailyRaw) {
        data.dailyGoals = JSON.parse(dailyRaw);
      }
    } catch (e) {
      console.warn('Could not read daily goals:', e);
    }

    try {
      // Weekend goals
      const weekendRaw = window.localStorage.getItem('notebook:weekend-goals');
      if (weekendRaw) {
        data.weekendGoals = JSON.parse(weekendRaw);
      }
    } catch (e) {
      console.warn('Could not read weekend goals:', e);
    }

    try {
      // Theme preference
      const themeRaw = window.localStorage.getItem('notebook:theme');
      if (themeRaw) {
        data.settings.theme = themeRaw;
      }
    } catch (e) {
      console.warn('Could not read theme:', e);
    }

    return data;
  }

  /**
   * Export all progress data as JSON file
   */
  function exportProgress() {
    const data = getAllProgressData();
    const json = JSON.stringify(data, null, 2);
    const date = window.NotebookDateUtils.getToday().replace(/-/g, '');
    const filename = `notebook-progress-${date}.json`;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validate imported JSON data structure
   * @param {object} data - Data to validate
   * @returns {object} Validation result { valid: bool, errors: array }
   */
  function validateImportData(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid data structure');
      return { valid: false, errors };
    }

    // Check for required fields
    if (!data.exportedAt) {
      errors.push('Missing export timestamp');
    }

    // Validate each section if it exists
    if (data.revision && typeof data.revision !== 'object') {
      errors.push('Invalid revision data');
    }
    if (data.interview && typeof data.interview !== 'object') {
      errors.push('Invalid interview data');
    }
    if (data.mistakes && !Array.isArray(data.mistakes)) {
      errors.push('Invalid mistakes data');
    }
    if (data.dsa && typeof data.dsa !== 'object') {
      errors.push('Invalid DSA data');
    }
    if (data.plan && typeof data.plan !== 'object') {
      errors.push('Invalid plan data');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Import progress data from parsed JSON
   * @param {object} data - Parsed JSON data
   * @returns {object} Import result { success: bool, message: string }
   */
  function importProgressData(data) {
    const validation = validateImportData(data);
    if (!validation.valid) {
      return {
        success: false,
        message: `Invalid data: ${validation.errors.join(', ')}`,
      };
    }

    try {
      if (data.revision && Object.keys(data.revision).length > 0) {
        window.localStorage.setItem('notebook:progress', JSON.stringify(data.revision));
      }

      if (data.interview && Object.keys(data.interview).length > 0) {
        window.localStorage.setItem('notebook:interview-progress', JSON.stringify(data.interview));
      }

      if (data.mistakes && data.mistakes.length > 0) {
        window.localStorage.setItem('notebook:mistakes', JSON.stringify(data.mistakes));
      }

      if (data.dsa && Object.keys(data.dsa).length > 0) {
        window.localStorage.setItem('notebook:dsa-progress', JSON.stringify(data.dsa));
      }

      if (data.plan && Object.keys(data.plan).length > 0) {
        window.localStorage.setItem('notebook:90day-plan', JSON.stringify(data.plan));
      }

      if (data.dailyGoals && Object.keys(data.dailyGoals).length > 0) {
        window.localStorage.setItem('notebook:daily-goals', JSON.stringify(data.dailyGoals));
      }

      if (data.weekendGoals && Object.keys(data.weekendGoals).length > 0) {
        window.localStorage.setItem('notebook:weekend-goals', JSON.stringify(data.weekendGoals));
      }

      if (data.settings && data.settings.theme) {
        window.localStorage.setItem('notebook:theme', data.settings.theme);
      }

      return {
        success: true,
        message: 'Progress imported successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Import error: ${error.message}`,
      };
    }
  }

  /**
   * Reset all personal progress (but keep notes and metadata)
   */
  function resetAllProgress() {
    const keysToDelete = [
      'notebook:progress',
      'notebook:interview-progress',
      'notebook:mistakes',
      'notebook:dsa-progress',
      'notebook:90day-plan',
      'notebook:daily-goals',
      'notebook:weekend-goals',
    ];

    keysToDelete.forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Could not remove ${key}:`, e);
      }
    });
  }

  /**
   * Render the settings panel
   */
  function renderSettingsPanel() {
    const container = document.getElementById('settingsPanelWrap');
    if (!container) return;

    const data = getAllProgressData();
    const revisionCount = Object.keys(data.revision.revision || {}).length;
    const interviewCount = Object.keys(data.interview.stats || {}).length;
    const mistakesCount = (data.mistakes.items || []).length;
    const dsaCount = Object.keys(data.dsa).length;

    container.innerHTML = `
      <div class="settings-panel">
        <div class="dashboard-title">⚙️ Settings & Backup</div>
        
        <div class="settings-section">
          <div class="settings-section__title">Progress Summary</div>
          <div class="settings-summary">
            <span>${revisionCount} topics revised</span>
            <span>${interviewCount} interview questions</span>
            <span>${mistakesCount} mistakes tracked</span>
            <span>${dsaCount} DSA problems</span>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__title">Backup & Restore</div>
          <div class="settings-actions">
            <button class="interview-mode__button" id="exportBtn" title="Download your progress as JSON">
              📥 Export My Progress
            </button>
            <button class="interview-mode__button" id="importBtn" title="Upload a previously exported progress file">
              📤 Import My Progress
            </button>
            <input type="file" id="importFileInput" accept=".json" style="display:none;" />
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__title">Reset</div>
          <div class="settings-actions">
            <button class="interview-mode__button danger" id="resetBtn" title="Clear all personal progress data">
              🔄 Reset All Progress
            </button>
          </div>
          <div class="settings-note">
            ⓘ Reset will clear revision, interview, mistakes, DSA progress, and goals.<br/>
            Your notes and settings will not be affected.
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__title">About</div>
          <div class="settings-note">
            <strong>Notebook</strong> — Personal Java + Spring Boot Interview Preparation Dashboard<br/>
            Version 1.0 • GitHub Pages compatible • Static application<br/>
            Last backup: ${escapeHtml(data.exportedFormatted)}
          </div>
        </div>
      </div>
    `;

    // Bind events
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      exportProgress();
      alert('Progress exported successfully!\nFile: notebook-progress-' + window.NotebookDateUtils.getToday().replace(/-/g, '') + '.json');
    });

    document.getElementById('importBtn')?.addEventListener('click', () => {
      document.getElementById('importFileInput').click();
    });

    document.getElementById('importFileInput')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (!confirm('This will replace your current progress.\n\nAre you sure?')) {
            return;
          }

          const result = importProgressData(data);
          if (result.success) {
            alert('✓ ' + result.message);
            // Reload to reflect imported data
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            alert('✗ ' + result.message);
          }
        } catch (error) {
          alert('✗ Failed to parse JSON file: ' + error.message);
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('resetBtn')?.addEventListener('click', () => {
      const confirmed = confirm(
        'This will clear all your progress:\n' +
        '- Revision history\n' +
        '- Interview attempts\n' +
        '- Mistakes\n' +
        '- DSA progress\n' +
        '- Goals\n\n' +
        'Your notes will NOT be deleted.\n\n' +
        'Are you absolutely sure?'
      );

      if (confirmed) {
        const confirmed2 = confirm('Last chance! This action cannot be undone.');
        if (confirmed2) {
          resetAllProgress();
          alert('✓ Progress reset successfully');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    });
  }

  window.NotebookSettings = {
    getAllProgressData,
    exportProgress,
    validateImportData,
    importProgressData,
    resetAllProgress,
    renderSettingsPanel,
  };
})();
