/*
  router.js
  Tiny hash router. Three routes:
    #/                          -> home (category grid)
    #/category/:categoryId      -> notes within a category
    #/note/:categoryId/:noteId  -> full-screen note viewer
*/

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean).map(decodeURIComponent);

  if (parts[0] === 'category' && parts[1]) {
    return { name: 'category', categoryId: parts[1] };
  }
  if (parts[0] === 'note' && parts[1] && parts[2]) {
    return { name: 'note', categoryId: parts[1], noteId: parts[2] };
  }
  return { name: 'home' };
}

function showView(id) {
  document.querySelectorAll('.view').forEach((el) => el.classList.remove('is-active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('is-active');
}

async function route() {
  const lib = await window.NotebookData.loadLibrary();
  const r = parseHash();
  const viewer = document.getElementById('viewer');

  if (r.name === 'note') {
    window.NotebookRender.renderViewer(lib, r.categoryId, r.noteId);
    viewer.classList.add('is-active');
    return; // keep whatever view was underneath; viewer sits on top
  }

  viewer.classList.remove('is-active');
  viewer.classList.remove('is-focus-mode');
  const frame = document.getElementById('viewerFrame');
  if (frame) frame.removeAttribute('src'); // stop any playing/heavy note content

  if (r.name === 'category') {
    window.NotebookRender.renderCategory(lib, r.categoryId);
    window.NotebookRender.renderSidebarNav(lib, r.categoryId);
    window.NotebookRender.setTopbarPath(`notes/${r.categoryId === 'all' ? 'all' : r.categoryId}/`);
    showView('view-category');
  } else {
    window.NotebookRender.renderHome(lib);
    window.NotebookRender.renderSidebarNav(lib, null);
    window.NotebookRender.setTopbarPath('~/notebook');
    showView('view-home');
  }

  document.getElementById('sidebar').classList.remove('is-open');
  document.getElementById('sidebarScrim').classList.remove('is-active');
  window.scrollTo(0, 0);
}

window.NotebookRouter = { route };
