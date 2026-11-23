# Work cover layout editor

Run `npm run dev`, open http://localhost:5173/, and click **Edit Layout** above the right gallery. The button is available only in development on localhost/127.0.0.1/::1.

- Drag a cover up/down or into another column. A lime insertion marker shows its destination.
- Keyboard: focus a cover, press Space to pick it up, use arrows within the column or Tab/Shift+Tab to transfer between columns, and press Space to drop. Escape ends a keyboard drag. Touch: briefly hold a cover before dragging; a short delay preserves ordinary scrolling.
- **Save Layout** writes desktop column assignment and order to `src/lib/data/work-layout.json`. A confirmation appears after saving. Refresh preserves the saved layout.
- **Cancel** discards the draft. Unsaved changes prompt before cancellation, site navigation, or closing/reloading the page.
- **Reset to Default** restores the original automatic CSS-column arrangement in the draft. It does not write the file until Save Layout is clicked.

The initial JSON has `columns: null`, preserving the existing untouched CSS-balanced layout. Entering the editor captures its actual on-screen desktop positions. Saved layouts contain three ordered arrays of project slugs. Reset derives the native default placement using invisible, media-free aspect-ratio probes; it does not render duplicate images, videos or PDFs.

Desktop uses the exact saved columns. Tablet reads the saved columns top-to-bottom, left-to-right and splits that sequence into two contiguous groups. Mobile uses the same sequence in one column. In the editor, all three desktop column groups remain available and wrap/stack on smaller screens, so their assignments remain editable.

Saved changes are local source-file changes. Commit and deploy separately to publish them. The editor does not commit, push, or deploy.

## Save safety

The Vite development-only `/__work-layout` handler writes one fixed file atomically. It requires a loopback socket/Host and matching browser Origin for writes, validates every current project exactly once, rejects extra fields, caps request size, and checks a revision hash to avoid overwriting another save. No paths come from the request. If the layout changed elsewhere, Cancel and reopen the editor before trying again.

Production has no writer route or editing controls, and its build resolves the editor module to an empty stub. No production authentication or hidden URL bypass is used.

Existing project metadata, sidebar ordering, cover ratios, image/video/PDF behavior and project detail pages are unchanged. Later project additions/removals are reconciled safely on reads; the next save must include every currently listed project exactly once.

## Verification

- `npm run check`
- `node --test tests/*.test.mjs`
- `npm run verify:layout` (builds production, then tests using the installed Google Chrome on macOS)

Set `PDF_CHROME` to another Chromium executable or `LAYOUT_BROWSER_DRIVER` to an alternative `playwright-core` module if needed. Browser tests use isolated ports 5195/5196 and restore the original configuration after testing. They exercise real mouse, touch and keyboard events, persistence, warnings, default/cancel behavior, request validation and production isolation.

## Files added or updated

- `src/routes/+page.svelte`: hosts the shared gallery without changing the project index.
- `src/lib/components/WorkGallery.svelte`, `WorkCover.svelte`, `WorkLayoutEditor.svelte`: visitor rendering, unchanged media covers, and the development editor.
- `src/lib/data/work-layout.json`, `src/lib/utils/work-layout.js`, `src/lib/types/work-layout.ts`: canonical configuration, validation and placement helpers/types.
- `scripts/work-layout-dev.mjs`, `vite.config.js`, `src/gallery-files.d.ts`: local writer and production-safe editor module.
- `package.json`, `package-lock.json`: Svelte drag-and-drop dependency, development browser driver, and `verify:layout` command.
- `tests/work-layout.test.mjs`, `scripts/verify-work-layout-browser.mjs`, `scripts/verify-pdf-browser.mjs`: validation, security, interaction and media regression checks.
- `docs/WORK_LAYOUT_EDITOR.md`: these usage notes.
