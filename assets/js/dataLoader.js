/*
  dataLoader.js
  The single place that knows how to read data/notes.json.
  Nothing else in the app should call fetch() directly for note metadata.
*/

const DATA_URL = 'data/notes.json';

let cache = null;

/**
 * Loads and lightly normalizes the metadata file.
 * Every note gets its parent category attached so views don't need to
 * re-derive it, and a stable "path" string for display/search.
 */
async function loadLibrary() {
  if (cache) return cache;

  const res = await fetch(DATA_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Could not load ${DATA_URL} (${res.status})`);
  }
  const raw = await res.json();

  const categories = (raw.categories || []).map((cat) => {
    const notes = (cat.notes || []).map((note) => ({
      ...note,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon || '📄',
    }));
    return { ...cat, notes };
  });

  cache = {
    site: raw.site || { title: 'Notebook', subtitle: '' },
    categories,
  };
  return cache;
}

/** Flat list of every note across every category, for search/palette. */
async function allNotes() {
  const lib = await loadLibrary();
  return lib.categories.flatMap((c) => c.notes);
}

function findCategory(lib, categoryId) {
  return lib.categories.find((c) => c.id === categoryId) || null;
}

function findNote(lib, categoryId, noteId) {
  const cat = findCategory(lib, categoryId);
  if (!cat) return null;
  return cat.notes.find((n) => n.id === noteId) || null;
}

window.NotebookData = { loadLibrary, allNotes, findCategory, findNote };
