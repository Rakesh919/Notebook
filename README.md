# Notebook

A static, frontend-only website for a personal library of technical notes.
No backend, no database, no build step — copy an HTML file in, add one line
to a metadata file, push to GitHub, done.

```
┌─────────────┐   copy file    ┌──────────────────┐   git push   ┌──────────────┐
│  AI-generated│ ─────────────▶ │ notes/<category>/ │ ────────────▶ │ GitHub Pages │
│  note (.html)│   + 1 JSON     │   your-note.html   │              │  live site   │
└─────────────┘   entry        └──────────────────┘              └──────────────┘
```

## How it works

Every category and every note is described in **`data/notes.json`** — nothing
is hardcoded in HTML or JavaScript. The site reads that file at load time and
builds the sidebar, the category grid, the note lists, and the search index
from it. This is the only architectural rule that matters: **if it's not in
`notes.json`, the site doesn't know it exists.**

```
notes.json
   └── categories[]
         ├── id, name, icon, description
         └── notes[]
               └── id, title, file, tags, difficulty, lastUpdated
```

## Project structure

```
.
├── index.html                 # the entire app shell (one page, hash-routed)
├── data/
│   └── notes.json              # ← the single source of truth
├── assets/
│   ├── css/
│   │   ├── variables.css       # design tokens (color, type, spacing, motion)
│   │   ├── base.css            # resets + base typography
│   │   ├── layout.css          # topbar / sidebar / grid / responsive rules
│   │   ├── components.css      # cards, nav items, search palette, badges
│   │   ├── animations.css      # the small set of keyframes actually used
│   │   └── themes.css          # dark (default) + light theme overrides
│   ├── js/
│   │   ├── dataLoader.js       # fetch + normalize notes.json (only place that fetches it)
│   │   ├── search.js           # client-side search/ranking
│   │   ├── theme.js            # dark/light toggle, persisted
│   │   ├── render.js           # data → DOM for every view
│   │   ├── router.js           # hash router (#/, #/category/:id, #/note/:cat/:id)
│   │   └── app.js              # bootstrap, command palette, mobile nav, shortcuts
│   └── icons/
│       ├── logo.svg
│       └── favicon.svg
├── notes/
│   ├── spring-boot/
│   │   ├── ioc.html
│   │   └── dependency-injection.html
│   ├── java/
│   │   └── jvm.html
│   └── dsa/
│       └── two-sum.html
├── docs/
│   ├── ADD_CATEGORY.md
│   ├── ADD_NOTE.md
│   └── DEPLOYMENT.md
└── .nojekyll                    # tells GitHub Pages to serve folders as-is
```

Each category gets its own folder under `notes/`. A category with one note
looks exactly like a category with five hundred — the folder just has fewer
files in it. Nothing about the structure changes as it scales.

## Adding content

- **New note in an existing category:** see [`docs/ADD_NOTE.md`](docs/ADD_NOTE.md).
- **Brand new category:** see [`docs/ADD_CATEGORY.md`](docs/ADD_CATEGORY.md).
- **Deploying / updating the live site:** see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

In short, adding a note is always exactly two steps:

1. Put the `.html` file in `notes/<category-id>/`.
2. Add one object to that category's `notes` array in `data/notes.json`.

No JavaScript, no HTML template, no other file ever needs to change.

## How notes are displayed

Notes are standalone HTML files — the kind Claude or Gemini generates directly
— so they're shown in a full-screen `<iframe>` viewer rather than being
parsed or restyled. Your note keeps its own fonts, colors, and layout exactly
as generated. The surrounding chrome (back button, path, "open in new tab")
belongs to the library, not the note.

## Search

Press **`/`** or **⌘/Ctrl + K** anywhere to open the command palette. It
searches note titles, category names, tags, and difficulty, all client-side,
with no indexing step required. At the scale of hundreds of notes this is
plenty fast; see the comment at the top of `assets/js/search.js` if you ever
need to swap in a real search index at thousands of notes.

## Design

Dark mode is the default. The visual language is deliberately "your own repo,
rendered nicely": file paths in monospace, a command-palette search modeled
on Raycast/Linear, and category folders that read like a directory listing.
Light mode is available via the toggle in the top bar and is remembered
across visits.

## Local preview

Because the app uses `fetch()` to load `data/notes.json`, opening
`index.html` directly from the filesystem (`file://`) will fail in most
browsers due to CORS restrictions on local file access. Serve it locally
instead:

```bash
# any static server works, for example:
python3 -m http.server 8000
# then open http://localhost:8000
```

## Extending later

The metadata-driven architecture is intentionally future-proof. Ideas like
bookmarks, favorites, recently-viewed, or reading progress can all be built
as small additions:

- **Favorites/bookmarks** — store an array of note `id`s in `localStorage`,
  add a filter toggle in `render.js`.
- **Recent notes** — push to a `localStorage` list from `router.js` every
  time the `note` route fires.
- **Tags as a browsing dimension** — `search.js` already reads `tags`; a tag
  cloud view would reuse `renderCategory`'s note-card rendering as-is.

None of these require touching `notes.json`'s shape or the note files
themselves.
