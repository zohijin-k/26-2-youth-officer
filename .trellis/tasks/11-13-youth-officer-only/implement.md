# Execution plan — implemented; commit approval pending

## Current approval — implementation authorized

The user approved frontend cleanup, root README and factual-only corrections to docs/DEVELOPMENT.md and demo/README.md. Baseline is recorded in research/baseline-results.md. Do not edit demo/backend, engine, engine_v2, tests/expectations there, package manifests/lockfiles, or template/font assets. Remove only unused frontend API calls/types. Preserve youth detail deep links and URL restoration; restrict only applicant/savings routes. If this cannot be preserved, STOP and report before implementing an alternative.

Before deleting phone.test.ts inspect officer and shared-code imports of its subject. Retain the test if used. Conditional deletion of an applicant-only orphan test is authorized, but record exact assertion groups/counts and reason. No other test deletion/expectation change is authorized.

Root README: youth officer purpose; one line that the service will expand to a generic application service based on announcement/form PDFs; guide plus all three sibling links; validated WSL2 Ubuntu commands; native Windows and macOS labeled not validated this session; only existing synthetic mock setup. No seed implementation. Secondary docs: factual corrections only, no new feature/plan descriptions.

Do not commit. Report git diff --stat main; per-commit deleted/modified/added lists; test expectation/deletion inventory and reasons; four-group baseline comparison including all three font skips; actual frontend navigation checks and methods. Proposed commits: (1) screen/component/test deletions, (2) remaining frontend routing/code changes, (3) README, (4) the two secondary documents. Trellis records must be listed separately and not silently mixed into these groups.

## Current gate

Baseline was measured and approved. Implementation and both secondary-document corrections were subsequently approved. Do not stage/commit/push until final verification and the concrete four-commit inventory are approved.

## 1. Environment and unchanged-code baseline

- [x] Report remote, branch, full HEAD before beginning; verified requested youth-officer repo at e449c550bdc9cc43b6793ca6636658c1f9f75cdd on main.
- [x] Record WSL2 Linux (Ubuntu 24.04.5 LTS), Python 3.12.3, Node 22.23.4, npm 10.9.9; Node >=22.13 passes, lockfile stays intact.
- [x] Validate context and start the approved task. Reuse existing clone; no source pull/upgrade.
- [x] Create .venv with python3; install both requirements and pytest. Apple Vision has a Darwin marker and is not installed on WSL2.
- [x] Fetch own assets with python -m engine_v2.tools.fetch_own_models and independently verify pinned hashes. Never stage weights or generated data.
- [x] Use ordinary pytest with no path redirects or added skips. Missing-data/font and Apple Vision skips are reported separately by test name/cause, without filenames.
- [x] Run npm ci, npm run lint and npm run build in demo/frontend; run engine/backend pytest at root; execute all 18 scenario modules as ordinary separate python -m processes, continue after failures, never --live.
- [x] Record logs and dependency versions under ignored .trellis/.runtime/baselines; persist the measured summary under research/baseline-results.md. No helper script or test runner wrapper is created.
- [x] Compare engine, backend, all scenario modules and frontend with macOS e449c55: 1264 pass/3 skip; 1227 pass; 1885 pass/0 fail; lint 1 warning/build pass.
- [x] Baseline reported; subsequent user approval authorized implementation.

## 2. Test-change approval gate

- [ ] Reconcile audit candidates with actual collected cases and final dependency deletion list.
- [ ] Present exact file + function/scenario + expectation/assertion + reason for any expectation change/deletion, before editing.
- [ ] Separate applicant/savings UI removal group. Current deletion candidate: `src/forms/phone.test.ts` module-level formatting `cases` and validation `validCases`, only if its helper is removed after confirming there are no officer/shared imports. Retain the test when shared. Keep until explicitly approved.
- [ ] P4 download-source allowlist may be cleaned for deleted files without changing its empty-forbidden-hits expectation; retain all backend/applicant/savings API coverage.
- [ ] If no test changes are needed, record none. Overall plan approval is not test-change approval.

## 3. Frontend and documentation

- [ ] Replace dual-mode App/navigation with direct officer entry; preserve officer history and mock parameter.
- [ ] Force youth program/sort in console/API and all URL/role transitions; guard direct details before rendering/actions.
- [ ] Delete applicant pages and unused components/styles/API functions, retaining officer/shared and backend-required fonts/assets.
- [ ] Remove savings selectors, quota/ranking/score screens and savings-only criteria/role guidance. Keep server actions/response contracts intact.
- [ ] Generate youth-only mock data and correct base-scope fallback. Verify forced mock, automatic fallback, filtered empties and real-only mode.
- [ ] Update browser/shell/skeleton titles.
- [ ] Rewrite root README: officer purpose, one future PDF sentence, guide + three siblings, Windows WSL2/macOS setup/run instructions, native Windows unverified and macOS not revalidated this session, Node >=22.13, models and synthetic demonstration with limitations.
- [x] User approved both secondary documents; make factual corrections only, without new feature plans.
- [ ] Record persistent seed CLI as a proposal only; do not implement it or repurpose destructive scenario reset.

## 4. Final verification

- [ ] Repeat all four baseline groups with identical environment/assets/default commands and complete scenario rows/logs. Preserve independent failures.
- [ ] Smoke-check `/`, canonical officer routes, old `/apply/*`, legacy mode/program/sort, roles, filters, paging, refresh/back/forward, detail and criteria URLs.
- [ ] Mixed-product API results and direct savings IDs cannot display savings UI; `?mock=0` empty results never fall back silently.
- [ ] Verify youth inline originals/forms, subsidy amounts, findings, supplement information, criteria save/history and decisions.
- [ ] Confirm no applicant runtime import/route or savings-only presentation remains. Verify retained backend models/APIs and engine logic were not changed.
- [ ] Review frontend/backend specs and AC0–AC6; document spec-sync judgment and relevant new guidance only.

## 5. Commit approval

- [ ] Show `git diff --stat main` plus untracked/new-file inventory, since ordinary diff omits untracked planning artifacts.
- [ ] Present before/after/delta for frontend, engine pytest, backend pytest and each scenario. Separate pre-existing failures, platform skips and approved UI-test changes.
- [ ] Inspect tracked/staged names and ignores for weights/data/DB/storage/packages/environment artifacts.
- [ ] Separate deletion commits from all other modifications. Present exact commit messages/file groups, test approval evidence and user-owned dirty paths. Wait before staging/committing; no automatic push.
- [ ] Follow Trellis archive/journal bookkeeping only after approved work commits.
