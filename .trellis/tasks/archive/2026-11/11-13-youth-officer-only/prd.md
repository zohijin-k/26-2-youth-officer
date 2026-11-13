# Youth employment package: officer-only repository

## Current approval — implementation authorized

The user approved frontend cleanup, root README and factual-only corrections to docs/DEVELOPMENT.md and demo/README.md. Baseline is recorded in research/baseline-results.md. Do not edit demo/backend, engine, engine_v2, tests/expectations there, package manifests/lockfiles, or template/font assets. Remove only unused frontend API calls/types. Preserve youth detail deep links and URL restoration; restrict only applicant/savings routes. If this cannot be preserved, STOP and report before implementing an alternative.

Before deleting phone.test.ts inspect officer and shared-code imports of its subject. Retain the test if used. Conditional deletion of an applicant-only orphan test is authorized, but record exact assertion groups/counts and reason. No other test deletion/expectation change is authorized.

Root README: youth officer purpose; one line that the service will expand to a generic application service based on announcement/form PDFs; guide plus all three sibling links; validated WSL2 Ubuntu commands; native Windows and macOS labeled not validated this session; only existing synthetic mock setup. No seed implementation. Secondary docs: factual corrections only, no new feature/plan descriptions.

Do not commit. Report git diff --stat main; per-commit deleted/modified/added lists; test expectation/deletion inventory and reasons; four-group baseline comparison including all three font skips; actual frontend navigation checks and methods. Proposed commits: (1) screen/component/test deletions, (2) remaining frontend routing/code changes, (3) README, (4) the two secondary documents. Trellis records must be listed separately and not silently mixed into these groups.

## Goal

Make this repository the officer-facing youth employment support package application review demo. Entry opens the application list directly, with no applicant or savings-product screens.

## Background

- Split from the guide repository: https://github.com/zohijin-k/26-2-capstone.
- Siblings: https://github.com/zohijin-k/26-2-savings-applicant, https://github.com/zohijin-k/26-2-savings-officer, https://github.com/zohijin-k/26-2-youth-applicant.
- Initial local state: clean `main`, correct youth-officer origin, HEAD `e449c550bdc9cc43b6793ca6636658c1f9f75cdd`.
- Actual host: WSL2 Linux (Ubuntu 24.04.5 LTS), Python 3.12.3, Node 22.23.4, npm 10.9.9; `python3` is available, `python` is absent outside virtualenv. Windows execution cannot be claimed from this host.
- User approved the measured baseline and then implementation, including factual corrections to both secondary documents. The remaining gate is explicit commit approval after verification.

## Requirements

### R0 — Unchanged-code baseline before implementation

Reuse the existing correct clone; document `gh repo clone zohijin-k/26-2-youth-officer` for fresh checkouts. After approval, create `.venv`, install both requirements files and pytest, fetch own OCR with `python -m engine_v2.tools.fetch_own_models`, and verify pinned hashes. Apple Vision is already excluded on Linux/Windows by its Darwin marker.

Record four groups separately: frontend `npm ci`/lint/build, engine_v2 pytest, backend pytest, and all scenario modules. Record module-level scenario outcomes, exit codes and logs. Preserve baseline failures and platform skips; do not repair OCR or rules to make this cleanup green.

### R1 — Direct entry and applicant frontend removal

Root opens the youth employment application list immediately. Remove applicant/program entry, application steps, navigation and applicant-only components/styles. Old applicant URLs must not mount applicant UI. Preserve officer detail/filter/history restoration.

### R2 — Youth officer presentation only

Restrict list requests, URL restoration, criteria editing, direct detail display and mock data to `job_package`. Remove savings selectors, scoring screens, ranking/quota/120% guidance and savings-only filters. Preserve youth support items, receipts, findings, inline documents/forms, decisions and supported officer roles. Mock data stays clearly labeled; real-data mode retains truthful empty lists.

### R3 — Backend and decision preservation

Keep application APIs, review persistence, DB models, engine_v2 and backend coverage for both products/applicant APIs. Do not change engine_v2 decision logic or eligibility/scoring rules. Retain shared fonts/templates/assets needed by backend tests despite their frontend locations.

### R4 — Demonstration data investigation

Recommend the existing synthetic officer mock, clearly documenting browser-memory behavior versus persisted application/review data. Investigate the existing CLI and scenario fixtures. If persistent seeding needs a new tool, propose the minimum approach only; approval of this cleanup plan does not authorize its implementation.

### R5 — Documentation

Rewrite root README for officer-only purpose; include one future PDF-registration sentence, guide and three sibling links, Windows WSL2/macOS setup/run commands (native Windows unverified; macOS not revalidated this session) and accurate synthetic demo-data instructions. Remove applicant/savings feature instructions there. Make only factual corrections in the now-approved `docs/DEVELOPMENT.md` and `demo/README.md`; do not add new features/plans there. Document only the currently available synthetic mock, keeping new seed tooling in proposal notes.

### R6 — Constraints and approval gates

- Synthetic data only. User explicitly permits ordinary test references to the ignored engine data directory on this device, which has no private data. Run default pytest unchanged; no execution wrapper, font/path redirection or additional font/data downloads to hide missing-data results. Group missing-data/font results separately from Apple Vision/ocrmac/pyobjc results; list test names and causes without filenames.
- Never commit weights, private/generated documents, DB/storage, `.venv` or node_modules. Inspect tracked/staged assets as well as ignores.
- Before changing any existing test expectation or deleting a test, report file, test/scenario name and reason and receive explicit approval. Group applicant/savings UI removals separately. General plan approval is not test-change approval.
- Before committing, show `git diff --stat main`, new/untracked-file inventory, all four groups against R0, and exact commit plan; wait for approval. No commit/push during planning.

## Acceptance criteria

| ID | Observable evidence |
| --- | --- |
| AC0 | Initial-HEAD baseline records environment, model hashes, four groups and all 18 scenario rows; blocked/unexecuted checks are labeled honestly. |
| AC1 | `/` directly opens the youth list; applicant routes/components/navigation are removed. |
| AC2 | Role/filter changes, legacy/tampered URLs, refresh/back/forward, criteria and direct details cannot expose savings UI. |
| AC3 | Synthetic mock supports youth list/detail/decisions; `?mock=0` uses actual APIs and legitimate empty results. |
| AC4 | Preserved APIs, persistence, schema and rules retain their baseline behavior and backend coverage. |
| AC5 | Root README contains purpose, future feature sentence, four related links, both OS instructions and truthful demo-data guidance; secondary docs receive factual corrections only. |
| AC6 | No prohibited inputs/assets are used or staged; test and commit approvals are observed separately. |

## Out of scope

PDF upload/automatic page configuration, applicant repository integration, OCR performance, rule changes, dashboard removal, backend API deletion and a new persistent seed implementation.

## Approval status

Implementation is authorized and complete. User review is required before committing. Baseline evidence is in research/baseline-results.md; final verification and exact commit inventories are in research/final-approval.md. Backend, engine, templates/assets and lockfiles remain unchanged. A persistent seed remains proposal-only in research/seed-proposal.md.
