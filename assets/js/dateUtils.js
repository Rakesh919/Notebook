(function () {
  /**
   * Date Utilities - Centralized date handling for the notebook app
   * All date operations use this module to ensure consistency and timezone correctness.
   */

  /**
   * Get today's date in YYYY-MM-DD format (browser local time).
   * @returns {string} ISO date string for today
   */
  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Get current timestamp for unique IDs.
   * @returns {number} Current time in milliseconds
   */
  function getNow() {
    return Date.now();
  }

  /**
   * Format a date object or ISO string to YYYY-MM-DD.
   * @param {Date|string} date - Date object or ISO string
   * @returns {string} Formatted date in YYYY-MM-DD
   */
  function formatDate(date) {
    if (typeof date === 'string') {
      return date.slice(0, 10);
    }
    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }
    return getToday();
  }

  /**
   * Add days to a date.
   * @param {Date|string} date - Starting date
   * @param {number} days - Days to add
   * @returns {string} Result date in YYYY-MM-DD
   */
  function addDays(date, days) {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  /**
   * Subtract days from a date.
   * @param {Date|string} date - Starting date
   * @param {number} days - Days to subtract
   * @returns {string} Result date in YYYY-MM-DD
   */
  function subtractDays(date, days) {
    return addDays(date, -days);
  }

  /**
   * Check if a date is due (on or before today).
   * @param {string} dueDate - Date in YYYY-MM-DD format
   * @returns {boolean} True if due date is today or earlier
   */
  function isDue(dueDate) {
    if (!dueDate) return false;
    const today = getToday();
    return dueDate <= today;
  }

  /**
   * Get days between two dates.
   * @param {string} startDate - Start date in YYYY-MM-DD
   * @param {string} endDate - End date in YYYY-MM-DD
   * @returns {number} Number of days (can be negative)
   */
  function daysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end - start;
    return Math.floor(diff / 86400000); // 86400000ms = 1 day
  }

  /**
   * Get days since a date.
   * @param {string} date - Date in YYYY-MM-DD
   * @returns {number} Days since that date
   */
  function daysSince(date) {
    return daysBetween(date, getToday());
  }

  /**
   * Calculate next review date based on spaced repetition.
   * @param {string} result - Result: 'failed', 'partial', 'correct'
   * @returns {string} Next review date in YYYY-MM-DD
   */
  function getNextReviewDate(result) {
    switch (result) {
      case 'failed':
        return addDays(getToday(), 1); // Review tomorrow
      case 'partial':
        return addDays(getToday(), 2); // Review in 2 days
      case 'correct':
        return addDays(getToday(), 7); // Review in a week
      default:
        return addDays(getToday(), 1);
    }
  }

  /**
   * Get human-readable time ago.
   * @param {string} date - Date in YYYY-MM-DD
   * @returns {string} Human-readable string
   */
  function timeAgo(date) {
    if (!date) return 'Never';
    const days = daysSince(date);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  /**
   * Validate if a string is a valid date in YYYY-MM-DD format.
   * @param {string} dateStr - Date string to validate
   * @returns {boolean} True if valid
   */
  function isValidDate(dateStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !Number.isNaN(date.getTime());
  }

  /**
   * Get the current date in a human-readable format.
   * @returns {string} Date like "Aug 31, 2026"
   */
  function getTodayFormatted() {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }

  window.NotebookDateUtils = {
    getToday,
    getNow,
    formatDate,
    addDays,
    subtractDays,
    isDue,
    daysBetween,
    daysSince,
    getNextReviewDate,
    timeAgo,
    isValidDate,
    getTodayFormatted,
  };
})();
