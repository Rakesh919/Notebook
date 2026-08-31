/*
  app.js
  Bootstraps the app and owns the bits of behavior that don't belong to
  a single view: the command palette, mobile sidebar, and theme toggle.
*/

(function () {
  let paletteNotes = [];
  let paletteSelected = 0;

  function openPalette() {
    document.getElementById('paletteBackdrop').classList.add('is-active');
    const input = document.getElementById('paletteInput');
    input.value = '';
    input.focus();
    renderPaletteResults('');
  }

  function closePalette() {
    document.getElementById('paletteBackdrop').classList.remove('is-active');
  }

  function renderPaletteResults(query) {
    const results = window.NotebookSearch.searchNotes(paletteNotes, query).slice(0, 8);
    paletteSelected = 0;
    const el = document.getElementById('paletteResults');

    if (!results.length) {
      el.innerHTML = `<div class="palette__empty">No notes match "${window.NotebookRender.escapeHtml(query)}"</div>`;
      return;
    }

    el.innerHTML = results.map((note, i) => `
      <a class="palette__item ${i === 0 ? 'is-selected' : ''}"
         data-href="#/note/${encodeURIComponent(note.categoryId)}/${encodeURIComponent(note.id)}">
        <span class="nav-item__icon">${note.categoryIcon}</span>
        <span>
          <div class="palette__item-title">${window.NotebookRender.escapeHtml(note.title)}</div>
          <div class="palette__item-path">${window.NotebookRender.escapeHtml(note.file)}</div>
        </span>
      </a>
    `).join('');

    el.querySelectorAll('.palette__item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = item.dataset.href;
        closePalette();
      });
    });
  }

  function movePaletteSelection(delta) {
    const items = Array.from(document.querySelectorAll('.palette__item'));
    if (!items.length) return;
    items[paletteSelected]?.classList.remove('is-selected');
    paletteSelected = (paletteSelected + delta + items.length) % items.length;
    items[paletteSelected].classList.add('is-selected');
    items[paletteSelected].scrollIntoView({ block: 'nearest' });
  }

  function confirmPaletteSelection() {
    const items = document.querySelectorAll('.palette__item');
    const active = items[paletteSelected];
    if (active) {
      window.location.hash = active.dataset.href;
      closePalette();
    }
  }

  function bindPalette() {
    document.getElementById('searchTrigger').addEventListener('click', openPalette);
    document.getElementById('paletteBackdrop').addEventListener('click', (e) => {
      if (e.target.id === 'paletteBackdrop') closePalette();
    });
    document.getElementById('paletteInput').addEventListener('input', (e) => {
      renderPaletteResults(e.target.value);
    });
    document.getElementById('paletteInput').addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); movePaletteSelection(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); movePaletteSelection(-1); }
      if (e.key === 'Enter') { e.preventDefault(); confirmPaletteSelection(); }
      if (e.key === 'Escape') closePalette();
    });
  }

  function bindGlobalShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
        return;
      }
      if (e.key === '/' && !typing) {
        e.preventDefault();
        openPalette();
        return;
      }
      if (e.key === 'Escape') {
        closePalette();
      }
    });
  }

  function bindMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('sidebarScrim');
    document.getElementById('hamburger').addEventListener('click', () => {
      sidebar.classList.add('is-open');
      scrim.classList.add('is-active');
    });
    scrim.addEventListener('click', () => {
      sidebar.classList.remove('is-open');
      scrim.classList.remove('is-active');
    });
  }

  async function init() {
    window.NotebookTheme.initTheme();
    document.getElementById('themeToggle').addEventListener('click', window.NotebookTheme.toggleTheme);

    bindMobileSidebar();
    bindPalette();
    bindGlobalShortcuts();

    paletteNotes = await window.NotebookData.allNotes();

    if (window.NotebookInterview && typeof window.NotebookInterview.initInterviewDashboard === 'function') {
      window.NotebookInterview.initInterviewDashboard();
    }

    if (window.NotebookDSA && typeof window.NotebookDSA.renderDashboardModules === 'function') {
      window.NotebookDSA.renderDashboardModules();
    }

    if (window.NotebookSettings && typeof window.NotebookSettings.renderSettingsPanel === 'function') {
      window.NotebookSettings.renderSettingsPanel();
    }

    window.addEventListener('hashchange', window.NotebookRouter.route);
    window.NotebookRouter.route();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
