# Verification (2026-11-14)

Environment: macOS, Apple M2, Python 3.14.6, Node 26.13.1, npm 11.20.0. Synthetic fonts and own OCR models present. All runs used scratch clones; the repository working tree was not used to run tests.

## Tree checks on the merge commit `dd43016`

| Check | Result |
| --- | --- |
| Tracked paths == officer ∪ applicant | 769 == 769 (officer 718, applicant 747, shared 696) |
| Paths equal to neither tip | 6: `index.html`, `src/App.tsx`, `src/api.ts`, `src/app-shell.css`, `src/components/StatusBadge.tsx`, `src/navigation-url.ts` |
| `ReviewDetail.tsx`, `DocumentViewer.tsx` vs officer tip | identical blobs |
| `git diff ac8a345 dd43016` on backend, engine, dashboard, fixtures, package manifests | empty |
| Conflict markers | 0 |

## Python baselines, merged `dd43016` vs officer tip `ac8a345`

| Suite | Merged | Officer tip |
| --- | --- | --- |
| `python -m pytest engine_v2/tests` | 1267 passed, 0 failed, 0 skipped | 1267 passed, 0 failed, 0 skipped |
| `python -m pytest demo/backend/tests` | 1227 passed, 0 failed | 1227 passed, 0 failed |
| 18 scenario modules | all exit 0 | all exit 0 |

Scenario checks passed per module (identical on both): P2 53, P3 186, P4 189, P5 152, P6 261, P7 253, P8 89, P9 98, P11 38, P12 29, P13 26, P14 8 forms, P15 129, P16 96, P17 75, P18 180, P19 24, P20 7.

## Frontend, final working tree (merge commit plus review fixes)

| Command | Result |
| --- | --- |
| `npm run lint` | exit 0, 0 warnings |
| `npm run build` | exit 0, 65 modules, no chunk-size notice; largest JS chunk 446.78 kB |
| `node src/forms/phone.test.ts` | exit 0 |

## Browser (headless Chromium through the DevTools protocol), final working tree

| Check | Result |
| --- | --- |
| `/officer?mock=1` | officer list, 20 synthetic rows, `mock=1` kept, 0 console errors, no draft created |
| `/officer?mock=0` | officer console, empty real list |
| Open first mock row, Back, Forward | detail renders; list and detail restore |
| `/apply/identity` | applicant identity step, applicant title, one draft created (expected) |
| `/` | ends at `/apply/identity` |
| `/?mode=officer` | ends at `/officer` |
| Same-document move between screens (pushState + popstate, Back, Forward) | document reloads; 0 computed-style differences from a fresh load on the officer screen; on the applicant screen only the application-number text width differs (different draft number) |
| Stylesheets per screen on a fresh load | each screen loads only its own |
| 390x844 viewport | no header overflow on either screen |
| Pixel comparison with the tips, 11 pairs (officer list, officer review detail, applicant identity at 1440x900; both screens at 390x844) | 0 differing pixels in every pair |

Not covered: applicant steps after identity in a browser, officer actions on real (non-mock) data, and a run on WSL2 or Node 22.

## Review findings and what was done

| Finding | Action |
| --- | --- |
| Same-document switch between screens left both sides' global `.btn` CSS active | `popstate` handler reloads when the mode changes |
| Lazy loading reverses stylesheet order; `.status-badge--loading` border colour changed | removed the declaration that neither tip ever applied |
| Lint warning on `APPLICANT_DOCUMENT_STATUS` export (officer tip had 0) | export removed; nothing imported it |
| `state-management.md` said both screens stay mounted | spec rewritten for the one-screen rule |
| Documents: Node version for the unit test, verification environment, clone wording, P11–P20, old demo script label | corrected |
| Shared chunk carries officer mock data to the applicant screen; no error boundary around lazy screens; `job_package` constant defined on both sides; unreachable guards in `OfficerConsole` and `ApplyFlow` | left for the renewal |
