# Technical design

## Current approval — implementation authorized

The user approved frontend cleanup, root README and factual-only corrections to docs/DEVELOPMENT.md and demo/README.md. Baseline is recorded in research/baseline-results.md. Do not edit demo/backend, engine, engine_v2, tests/expectations there, package manifests/lockfiles, or template/font assets. Remove only unused frontend API calls/types. Preserve youth detail deep links and URL restoration; restrict only applicant/savings routes. If this cannot be preserved, STOP and report before implementing an alternative.

Before deleting phone.test.ts inspect officer and shared-code imports of its subject. Retain the test if used. Conditional deletion of an applicant-only orphan test is authorized, but record exact assertion groups/counts and reason. No other test deletion/expectation change is authorized.

Root README: youth officer purpose; one line that the service will expand to a generic application service based on announcement/form PDFs; guide plus all three sibling links; validated WSL2 Ubuntu commands; native Windows and macOS labeled not validated this session; only existing synthetic mock setup. No seed implementation. Secondary docs: factual corrections only, no new feature/plan descriptions.

Do not commit. Report git diff --stat main; per-commit deleted/modified/added lists; test expectation/deletion inventory and reasons; four-group baseline comparison including all three font skips; actual frontend navigation checks and methods. Proposed commits: (1) screen/component/test deletions, (2) remaining frontend routing/code changes, (3) README, (4) the two secondary documents. Trellis records must be listed separately and not silently mixed into these groups.

## Scope and task shape

Use one task: baseline is a prerequisite for frontend cleanup and README describes the resulting product. These share one acceptance/comparison gate rather than independent releases. Changes center on `demo/frontend` and the three requested documents; backend application APIs, schema, review persistence and both engines remain intact.

## Entry and program scope

`App.tsx` currently mounts both applicant and officer trees. Replace it with one officer shell. Normalize `/` and obsolete applicant/selection URLs to the officer list with replacement history. Preserve meaningful officer role/detail/criteria paths, filters, refresh/back/forward and `mock` query parameter. Brand/home returns to the list.

Use one youth program constant. `OfficerConsole` forces `program=job_package` and youth-compatible sort on initialization, role changes, query patches and URL restoration. Ignore legacy savings program/criteria and score sort. The frontend API boundary uses the same restriction for real and mock lists. Validate a detail response's program before display or enabling decisions; a direct savings/stale ID must not expose its details. Server API deletion is unnecessary.

## Officer components

- `ApplicationList.tsx`: remove product selector and savings quota/score presentation; preserve youth response-driven columns, support-item counts, status/date/region filters and first-come information.
- `OfficerConsole.tsx`: fix criteria to youth, remove product picker and savings skeleton labels. Adapt savings quota/score role notes in presentation while retaining role keys/actions.
- `ReviewDetail.tsx`: remove ScoreSheet6 and scoring interactions; keep original/form previews, extracted fields/findings, subsidy amounts, supplements and decisions. Applicant-authored documents are still needed in officer review.
- `CriteriaEditor.tsx`: remove savings DOCS/default fallback, applicantDemo mode and savings insurance/month/year/paper-form controls. Keep applicable youth settings/history; preserve hidden request fields from the fetched response so save contracts remain compatible. Existing manual criteria editing remains; PDF upload is deferred.
- `mock-data.ts`: retain only synthetic youth entries, clear mock label and in-memory decisions. Remove savings generation/presentation. Shared geographic sampling constants must be sampling weights, not displayed savings quotas.
- `index.html`, shell/styles: officer-specific title and navigation.

The current backend list still returns both sort options, generic savings-oriented role notes and quota rows for youth requests. Display a youth subset in frontend without changing those backend contracts.

## Dependency deletion

Delete applicant pages/styles. Trace imports before deleting applicant-only forms, bindings, SignaturePad and frontend API functions. `api.ts` imports form bindings at runtime through applicant fetchFormLayout; remove that unused dependency with its caller. Keep officer PDF/file viewers, status/modal/skeleton components and required API types.

Keep frontend TTF/WOFF2/OFL fonts plus backend templates/coordinates: P14 and backend generation use them. File location alone does not establish applicant-only ownership. Consult `research/baseline-audit.md` before deleting any tests/assets.

## Demonstration data

Recommend existing synthetic officer mock (`?mock=1`), which needs no new seed, DB mutation or applicant screen. Document that decisions reset on reload and evidence is generated. Keep backend running for real APIs such as manual criteria editing; do not promise those operate entirely from mock data.

Current `fetchOfficerList` requires `!params.program` to trigger automatic empty-list fallback. Fixed youth scope makes that false. Treat the fixed program as the base scope, distinguish actual empty base data from empty user filters, and honor `?mock=0` absolutely. Check forced mock, automatic fallback and real-only mode separately.

`seed_application` requires a verified draft and fills stage two; it cannot create a submitted officer case. P5/P6 youth fixtures create temporary DB/storage and clean up. P6 `--live` resets the demo and is not a seed solution. The historical-review helper deliberately inserts a review after blocked submit and must not become normal demo seeding.

If persistent seeding is later required, propose a separate guarded CLI that reuses synthetic youth inputs and public application/consent/subsidy/upload/submit handlers, refuses non-demo DBs, preserves identity/submission blockers, marks ownership and cleans only owned rows/files. No fabricated successful reviews, rule weakening or reset. Implementation requires separate authorization.

## Approved baseline execution

Use ordinary `python -m pytest engine_v2/tests -q -ra` and `python -m pytest demo/backend/tests -q -ra` without a harness, path redirection, deselection or expectation changes. Missing data/fonts are measured as-is. Ordinary references to ignored engine data paths are now explicitly authorized on this device. Do not download extra fonts/data to change those outcomes. Group missing-data/font tests separately from Apple Vision platform skips and report names/causes without filenames.

Record WSL2 Linux (Ubuntu 24.04.5 LTS), Python/Node/npm and pinned own model verification. If Node <22.13, stop without changing lockfile. Compare the four groups with the user-provided macOS e449c55 baseline and stop for approval before any implementation.

Direct youth detail entry and URL restoration must remain functional. Restrict only applicant/savings entries. Inspect officer/shared imports before any phone test deletion. Only root README is in the approved document-edit scope after the post-baseline gate; secondary docs need separate approval. Windows instructions use WSL2, native Windows is unverified, macOS follows existing guidance and is labeled not validated this session. README demo setup documents existing mock only. Separate deletion commits from other changes.

## Rollback and gates

Rollback only task-owned source/doc changes. Never reset/delete existing DB/storage or user changes. Test expectation changes/deletions require exact inventory and separate approval before edits. Commit approval follows full-scope review, baseline comparison and concrete diff/file groups. No push is implied.
