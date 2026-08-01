# Deploying on GitHub Pages

## First-time setup

1. Create a new GitHub repository (public, or private if you have GitHub Pro/Team).
2. Push this project's contents to the repository root:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: notes library"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Set **Branch** to `main` and the folder to `/ (root)`.
6. Save. GitHub will publish the site at:

   ```
   https://<your-username>.github.io/<your-repo>/
   ```

   The first deploy can take a minute or two.

## Why `.nojekyll` is in the project

GitHub Pages runs everything through Jekyll by default, which ignores files
and folders starting with an underscore and can interfere with plain static
sites. The empty `.nojekyll` file at the project root tells GitHub Pages to
skip that processing and serve the files exactly as they are.

## Updating the live site

Every push to `main` redeploys automatically:

```bash
git add .
git commit -m "Add Bean Lifecycle note"
git push
```

No build step, no CI configuration, nothing to install — the site is exactly
the files in the repository.

## Using a custom domain (optional)

1. Add a `CNAME` file at the project root containing your domain, e.g.:

   ```
   notes.yourdomain.com
   ```

2. In your DNS provider, add a `CNAME` record pointing that subdomain to
   `<your-username>.github.io`.
3. In **Settings → Pages**, enter the same domain under **Custom domain** and
   enable **Enforce HTTPS** once it's available.

## Troubleshooting

- **Blank category grid / "Loading…" that never resolves** — check the
  browser console for a fetch error on `data/notes.json`. This almost always
  means a JSON syntax error (trailing comma, missing quote) — paste the file
  into any JSON validator to find it.
- **A note doesn't open** — the `file` path in `notes.json` doesn't match the
  actual file path. Paths are relative to the project root, e.g.
  `notes/spring-boot/ioc.html`, not `/notes/spring-boot/ioc.html`.
- **Site works locally but not on GitHub Pages** — if your repository is a
  *project* page (not `<username>.github.io`), all paths are already relative
  in this project, so this is usually the `.nojekyll` file being missing or
  gitignored. Confirm it's present in the deployed branch.
