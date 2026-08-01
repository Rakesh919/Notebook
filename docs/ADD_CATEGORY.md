# Adding a new category

## 1. Create the folder

```
notes/<category-id>/
```

For example, a new "Redis" category:

```
notes/redis/
```

It's fine for this folder to start empty — the site will show an empty
state ("No notes here yet") until you add one.

## 2. Add the category to `data/notes.json`

Append a new object to the top-level `categories` array:

```json
{
  "id": "redis",
  "name": "Redis",
  "icon": "🧠",
  "description": "Caching patterns, data structures, and eviction policies.",
  "notes": []
}
```

| Field         | Required | Notes                                                          |
|---------------|----------|------------------------------------------------------------------|
| `id`          | yes      | Used as the folder name and the URL (`#/category/redis`). Lowercase, hyphenated. |
| `name`        | yes      | Display name shown in the sidebar and on the category card.       |
| `icon`        | no       | Any single emoji; falls back to 📄 if omitted.                    |
| `description` | no       | One line shown on the category card and category page.           |
| `notes`       | yes      | Start with `[]`, then add notes as described in `ADD_NOTE.md`.    |

That's the whole process — the sidebar, home grid, and search all update
automatically because they're generated from this file, not written by hand.
