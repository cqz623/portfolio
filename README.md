# Qizhen Chen architecture portfolio

SvelteKit 3 / Svelte 5 portfolio. Project content, media conventions, the Work index and saved cover layout stay in their existing source files.

## Local development

Use Node.js 24 and the locked dependencies:

```sh
npm ci
npm run dev
```

Development runs at `http://localhost:5173/` without a repository prefix. The local layout editor remains available only in development, on a loopback host. Its save handler is not a production route.

## GitHub Pages build

```sh
npm run check
npm test
npm run build
npm run verify:pages
npm run verify:spatial
npm run verify:flood
node scripts/verify-project-image-standard.mjs
npm run audit:deployment -- --strict
```

`npm run build` uses `@sveltejs/adapter-static` and produces **`build/`**, served under **`/portfolio`**. The expected public URL is https://cqz623.github.io/portfolio/.

Every project is explicitly enumerated by `entries()` in `src/routes/projects/[slug]/+page.js`, including APTNE without media. Prerendering writes directory indexes such as `build/projects/deep-eye/index.html`; direct requests work without a Node server or an SPA rewrite. The Cloud alias and a fallback `404.html` are included. The static adapter does not recompress original media.

To inspect the actual static output (including video/PDF byte ranges):

```sh
npm run preview:pages
```

Open `http://127.0.0.1:5180/portfolio/`. `npm run preview` also previews the production prefix. An explicit `PORTFOLIO_BASE_PATH` overrides the default for diagnostic builds; an empty value produces a root build. Normal development defaults to `/`.

`npm run verify:pages:browser` checks the plain static server in an isolated Chrome instance: direct project visits, internal navigation, multi-page PDFs and local workers, MP4 metadata, both standalone/embedded simulations, scenario controls, and production editing exclusion. It uses installed Google Chrome on macOS; set `PDF_CHROME` to another Chromium executable when needed. External Google Fonts, Leaflet and basemap resources still require internet access.

## Web delivery and preserved originals

GitHub confirms the canonical repository is `cqz623/portfolio` (repository ID 1447074013, default branch `main`). This local working folder has no `.git` directory. Use a fresh clone to preserve the remote history.

The two oversized originals remain unchanged at their original local paths. Exact `.gitignore` entries exclude them from upload. `src/lib/data/media-delivery.js` maps their logical media slots to separately generated assets in `static/optimized/projects/`. Discovery works even when the ignored originals are absent in a fresh clone. The static adapter removes only their generated build copies, after checking that their delivery replacements exist. No source media is removed during a build.

Do not remove these ignore rules or stage the originals with `git add -f`. Keep a separate backup of your local originals: GitHub will contain the delivery copies, not these two master files.

The image derivative preserves transparency and aspect ratio at 8000px tall using quality-94 WebP. The video derivative preserves the entire 30fps sequence and copies its original AAC audio, using H.264/yuv420p, CRF 26, 1280px width and fast-start metadata. The smaller original Work video cover is unchanged. Existing PDF files and interactive datasets are unchanged.

See `docs/media-optimization-report.json` for exact sizes, source checksums, the largest assets, duplicate media and validation results. Run `npm run audit:deployment -- --strict` to reject oversized publishable files, oversized build files and a site exceeding the Pages size limit. The inventory still reports the locally preserved originals separately.

## GitHub Actions and repository settings

`.github/workflows/deploy.yml` runs on pushes to `main` and supports manual dispatch. It installs dependencies with `npm ci`, runs checks/tests, builds and validates the static output, checks size limits, uploads **`build/`**, then deploys through the `github-pages` environment. Deployment permissions are restricted to the deployment job; no personal token is stored in source.

In the repository's **Settings → Pages → Build and deployment**, select **GitHub Actions**. Configure environment approval rules if desired before pushing. No repository settings or remote files have been changed during preparation.

## Upload commands after approval

Do not run the commit/push steps until publishing is approved. The strict audit below stops the sequence if size blockers return. The fresh-clone approach preserves the remote `main` history. `rsync` does not delete remote working-copy files and excludes ignored local caches/secrets; all required delivery media remains included; only the two explicitly replaced originals are excluded.

```sh
(
  set -e
  cd "$HOME/Documents/architecture-portfolio"
  npm ci
  npm run check
  npm test
  npm run build
  npm run verify:pages
  npm run audit:deployment -- --strict

  git clone --branch main https://github.com/cqz623/portfolio.git \
    "$HOME/Documents/architecture-portfolio-publish"

  rsync -av --exclude-from=.gitignore --exclude='.git/' \
    ./ "$HOME/Documents/architecture-portfolio-publish/"

  cd "$HOME/Documents/architecture-portfolio-publish"
  git status --short
  git add .
  git diff --cached --stat
  git commit -m "Prepare portfolio for GitHub Pages"
  git push origin main
)
```

Use a new clone destination if that directory already exists. The commands do not force-push, reset remote history or delete the original local portfolio. Pushing this workflow to `main` will trigger the deployment workflow; until then no deployment occurs.

## Files changed for media delivery

- `static/optimized/projects/floating-purifier/cover1.webp` and `static/optimized/projects/material- experimentation/cover01.mp4`: separate delivery copies.
- `src/lib/data/media-delivery.js`, `src/lib/utils/project-gallery.js`, `scripts/project-gallery-files.mjs`: replacement mapping, logical media slots and optimized metadata/discovery, including clean checkouts without originals.
- `scripts/web-media.mjs`, `vite.config.js`, `.gitignore`: exclude only replaced originals from the published build and Git; preserve local masters.
- `.github/workflows/deploy.yml`, `vite.config.js`: verified `/portfolio` production base path.
- `scripts/audit-deployment.mjs`, `scripts/verify-pages.mjs`, `scripts/verify-pages-browser.mjs`, `tests/project-video.test.mjs`, `tests/web-media.test.mjs`: delivery limits, source exclusion, playback/decoding and regression checks.
- `docs/media-optimization-report.json`, `README.md`: audit results and safe upload instructions.

Project metadata, Overview copy, categories, cover assignments, saved cover positions, original media and interactive application source files are unchanged.
