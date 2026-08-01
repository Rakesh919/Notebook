/*
  search.js
  Small, dependency-free search over notes. Matches on title, category
  name, tags, and difficulty. No indexing library needed at this scale;
  swap the implementation here if the note count grows into the thousands.
*/

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

/**
 * Scores a note against a query. Returns null if it isn't a match.
 * Lower score = better match (title hits rank above tag hits).
 */
function scoreNote(note, query) {
  const q = normalize(query);
  if (!q) return 0;

  const title = normalize(note.title);
  const category = normalize(note.categoryName);
  const tags = (note.tags || []).map(normalize);

  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 2;
  if (category.includes(q)) return 3;
  if (tags.some((t) => t.includes(q))) return 4;
  if (normalize(note.difficulty).includes(q)) return 5;

  return null;
}

/** Filters + ranks a flat note list against a query string. */
function searchNotes(notes, query) {
  if (!normalize(query)) return notes;

  return notes
    .map((note) => ({ note, score: scoreNote(note, query) }))
    .filter((r) => r.score !== null)
    .sort((a, b) => a.score - b.score)
    .map((r) => r.note);
}

window.NotebookSearch = { searchNotes };
