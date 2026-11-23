# Project image naming audit

Rules: exact `cover` is homepage-only and never shown on detail pages; `coverNN` supplies consecutive large detail images before Overview; exact positive numeric stems supply the horizontal gallery. Extensions and case are preserved. Empty projects and unmatched folders do not create pages.

| Folder | Existing project | Cover | Detail large images | Horizontal gallery | Unrecognized / unsupported |
|---|---|---|---|---|---|
| ` sustainability` | **Unmapped; no page created** | cover.png | — | — | 01-overall-view.jpg |
| `cloud` | cloud-pavilion | cover.jpg | — | 01.png, 02.png, 03.png, 04.png | — |
| `decarbonization` | **Unmapped; no page created** | cover.jpg | — | — | — |
| `deep-eye` | deep-eye | cover.png | — | 01.png, 02.png, 03.png, 04.png, 05.png | — |
| `downsville-covered-bridge` | downsville-covered-bridge | cover.jpg | — | — | 05-axonometric.png |
| `floating-purifier` | floating-purifier | cover.jpg | — | 01.png | — |
| `layered-walkway` | layered-walkway | cover.png | cover01.png | — | — |
| `light-and-shadow-lane` | light-and-shadow-lane | cover.jpg | — | — | — |
| `material- experimentation` | **Unmapped; no page created** | — | — | — | cover.MOV |
| `mercury-store` | mercury-store | cover.JPG | — | 01.png, 02.png, 03.png, 04.jpg | — |
| `population-flood-sandbox` | population-flood-sandbox | cover.jpg | — | — | — |
| `reviving-spaces` | reviving-spaces | cover.png | — | — | 01-overall-view.jpg |
| `spatial-barrier-game` | spatial-barrier-game | cover.jpg | — | — | — |
| `theatre` | **Unmapped; no page created** | cover.png | — | — | — |

## Conflicts

No duplicate cover or numbered slots found.

Duplicate slots keep an already configured source where possible; otherwise a deterministic filename order selects one. Conflicts are always reported here.

## Existing-state notes

- `cloud` is the existing image-directory alias for Cloud Pavilion.
- Deep Eye and Reviving Spaces select their actual PNG covers instead of stale JPG paths.
- Mercury Store now has a cover and numbered images; it is an existing project, not a newly created page.
- The Work layout, aspect ratios, gaps and interactions are unchanged. Only exact cover files supply thumbnails; additional or numbered images never substitute for a missing cover.
- Named files such as `01-overall-view.jpg` and `05-axonometric.png` remain untouched but are not displayed under the new exact-number rule.
- Detail pages without `coverNN` files have no large-image section. Pages without exact numbered files have no horizontal gallery. No detail placeholders or cover fallbacks are created.

## Missing detail image groups

- deep-eye: no coverNN files; large section hidden; gallery files present.
- floating-purifier: no coverNN files; large section hidden; gallery files present.
- cloud-pavilion: no coverNN files; large section hidden; gallery files present.
- reviving-spaces: no coverNN files; large section hidden; no exact numbered images; gallery hidden.
- light-and-shadow-lane: no coverNN files; large section hidden; no exact numbered images; gallery hidden.
- layered-walkway: large files present; no exact numbered images; gallery hidden.
- downsville-covered-bridge: no coverNN files; large section hidden; no exact numbered images; gallery hidden.
- yuanmingyuan: no coverNN files; large section hidden; no exact numbered images; gallery hidden.
- venice-arsenale: no coverNN files; large section hidden; no exact numbered images; gallery hidden.
- mercury-store: no coverNN files; large section hidden; gallery files present.
- spatial-barrier-game: no coverNN files; large section hidden; no exact numbered images; gallery hidden.
- population-flood-sandbox: no coverNN files; large section hidden; no exact numbered images; gallery hidden.
