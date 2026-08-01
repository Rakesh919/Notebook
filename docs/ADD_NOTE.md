# Adding a new note

Two steps, always.

## 1. Copy the HTML file into its category folder

```
notes/<category-id>/<note-id>.html
```

For example, a new note about Bean Lifecycle in Spring Boot:

```
notes/spring-boot/bean-lifecycle.html
```

Use lowercase, hyphen-separated file names (`bean-lifecycle.html`, not
`Bean Lifecycle.html`). The file can be whatever standalone HTML your AI tool
generated — the site does not touch its markup or styling.

## 2. Add one entry to `data/notes.json`

Find the category's `notes` array and append an object:

```json
{
  "id": "bean-lifecycle",
  "title": "Bean Lifecycle",
  "file": "notes/spring-boot/bean-lifecycle.html",
  "tags": ["beans", "lifecycle"],
  "difficulty": "Intermediate",
  "lastUpdated": "2026-08-01"
}
```

| Field         | Required | Notes                                                             |
|---------------|----------|--------------------------------------------------------------------|
| `id`          | yes      | Unique within the category. Used in the URL (`#/note/spring-boot/bean-lifecycle`). |
| `title`       | yes      | What's shown on the card and in search.                          |
| `file`        | yes      | Path from the project root to the HTML file.                     |
| `tags`        | no       | Shown as badges, searchable.                                      |
| `difficulty`  | no       | `Beginner` / `Intermediate` / `Advanced` — colors a badge automatically. |
| `lastUpdated` | no       | Any string; shown as-is on the note card.                         |

That's it — commit both files and push. No HTML, CSS, or JavaScript file
needs to change.

## Common mistakes

- **Forgetting to add the JSON entry.** The file exists but the site has no
  idea it's there — nothing shows up. `notes.json` is the only source of
  truth.
- **`file` path typo.** If the note doesn't open, check that `file` matches
  the real path exactly, including the `notes/` prefix.
- **Duplicate `id` within a category.** Keep note ids unique per category;
  they don't need to be unique across the whole site.
