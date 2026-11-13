# Implementation complete — commit approval pending

No file is staged and no commit/push was made. Four ordered work commits are proposed below, matching the user-requested split. Task state remains in_progress until work and approved commits are complete.

## Result

- Root opens the youth employment officer list directly; applicant/program-selection and savings UI have been removed.
- Youth detail direct entry, selected document, supported legacy URL state, refresh/back/forward, filters and roles remain functional.
- Backend application APIs, persisted reviews, DB models, engine/engine_v2, fixtures/templates/fonts and package manifests/lockfiles are byte-identical to main.
- Only unused frontend API declarations were removed: 25 calls and 33 types, enumerated in [frontend implementation](frontend-implementation.md).
- Root README documents validated WSL2 setup, existing synthetic mock only, one future PDF-service sentence and all four related links. Native Windows and macOS are explicitly unverified this session.
- Secondary docs contain factual corrections only. Persistent synthetic seeding remains a [proposal only](seed-proposal.md).

## Repository and environment

- Branch: `refactor/youth-officer-only`; HEAD remains `e449c550bdc9cc43b6793ca6636658c1f9f75cdd`.
- Origin: `https://github.com/zohijin-k/26-2-youth-officer`.
- WSL2 Linux, Ubuntu 24.04.5 LTS; Python 3.12.3; Node 22.23.4; npm 10.9.9.
- Baseline: unchanged e449c55, recorded in [baseline results](baseline-results.md).

## git diff --stat main

```text
 README.md                                          |  113 +-
 demo/README.md                                     |  138 +--
 demo/frontend/index.html                           |    2 +-
 demo/frontend/src/App.tsx                          |  102 +-
 demo/frontend/src/api.ts                           |  750 +-----------
 demo/frontend/src/app-shell.css                    |  179 +--
 demo/frontend/src/components/CriteriaEditor.tsx    |  124 +-
 demo/frontend/src/components/FileLink.tsx          |   27 -
 demo/frontend/src/components/SignaturePad.tsx      |  122 --
 demo/frontend/src/components/StatusBadge.tsx       |   14 +-
 demo/frontend/src/forms/FormSheet.tsx              |  337 -----
 demo/frontend/src/forms/PdfFormsWorkspace.tsx      | 1115 -----------------
 demo/frontend/src/forms/consent-model.ts           |   14 -
 demo/frontend/src/forms/email.ts                   |   10 -
 demo/frontend/src/forms/form-field-bindings.ts     |  170 ---
 demo/frontend/src/forms/form-sheet.css             |  497 --------
 demo/frontend/src/forms/form1-model.ts             |  121 --
 demo/frontend/src/forms/form2-model.ts             |  165 ---
 demo/frontend/src/forms/form5-model.ts             |   28 -
 demo/frontend/src/forms/pdf-forms-workspace.css    |  199 ---
 demo/frontend/src/forms/phone.test.ts              |   30 -
 demo/frontend/src/forms/phone.ts                   |   29 -
 demo/frontend/src/forms/ymd.ts                     |   25 -
 demo/frontend/src/lib/period.ts                    |   88 --
 demo/frontend/src/navigation-url.ts                |   16 -
 demo/frontend/src/pages/applicant/ApplyFlow.tsx    |  623 ----------
 .../src/pages/applicant/DocumentUpload.tsx         |  637 ----------
 demo/frontend/src/pages/applicant/FinalCheck.tsx   |  255 ----
 .../frontend/src/pages/applicant/IdentityCheck.tsx |  384 ------
 demo/frontend/src/pages/applicant/MyPage.tsx       |  214 ----
 .../frontend/src/pages/applicant/ProgramPicker.tsx |  566 ---------
 demo/frontend/src/pages/applicant/SubsidyItems.tsx |  315 -----
 demo/frontend/src/pages/applicant/apply-flow.css   |  285 -----
 .../src/pages/applicant/document-upload.css        |  697 -----------
 demo/frontend/src/pages/applicant/final-check.css  |  191 ---
 .../src/pages/applicant/identity-check.css         |  389 ------
 demo/frontend/src/pages/applicant/my-page.css      |  257 ----
 .../src/pages/applicant/program-picker.css         |  439 -------
 .../frontend/src/pages/applicant/subsidy-items.css |  239 ----
 .../frontend/src/pages/officer/ApplicationList.tsx |  237 +---
 demo/frontend/src/pages/officer/OfficerConsole.tsx |   47 +-
 demo/frontend/src/pages/officer/ReviewDetail.tsx   |   64 +-
 demo/frontend/src/pages/officer/ScoreSheet6.tsx    |  208 ----
 demo/frontend/src/pages/officer/mock-data.ts       | 1293 ++------------------
 demo/frontend/src/pages/officer/officer.css        |  137 +--
 docs/DEVELOPMENT.md                                |   64 +-
 46 files changed, 373 insertions(+), 11583 deletions(-)
```

Ordinary diff excludes untracked new files. Those are all listed in commit 2 below, including officer-scope.ts and task records; developer workspace metadata is excluded explicitly.

## Four-group verification comparison

| Group | Approved WSL2 baseline (same as supplied macOS counts) | Final | Difference |
| --- | --- | --- | --- |
| engine_v2 pytest | 1,264 passed / 3 skipped / 0 failed | 1,264 passed / 3 skipped / 0 failed | None |
| demo/backend pytest | 1,227 passed / 0 failed | 1,227 passed / 0 failed | None |
| All 18 scenario modules | 1,885 checks passed / 0 failed | 1,885 checks passed / 0 failed | None |
| Frontend | lint 1 warning / build passed | lint 0 warnings / build passed | Applicant-only unused export removed |

P14 additionally verifies eight original form contracts, not included in the numeric check sum. All 18 module exit codes are 0. The existing large-bundle build notice remains; no dependency change was introduced. Engine/backend still report two/four library deprecation warnings respectively.

## Data/font and platform skips — test names only

| Test | Baseline | Final | Reason |
| --- | --- | --- | --- |
| `test_own_insurance_stamp_and_right_cell[False]` | Skipped | Skipped | Synthetic NanumMyeongjo font missing |
| `test_own_insurance_stamp_and_right_cell[True]` | Skipped | Skipped | Synthetic NanumMyeongjo font missing |
| `test_own_four_myeongjo_conditions_recover_all_fields` | Skipped | Skipped | Synthetic NanumMyeongjo font missing |

Missing-data/font failures: 0; other missing-data skips: 0. Apple Vision/ocrmac/pyobjc-related test skips: 0. The ocrmac dependency is excluded by its Darwin-only installation marker. No extra fonts/data were downloaded to alter these results. Default pytest commands were used with reporting flags only; no execution wrapper/path override/test deselection was introduced. Backend/scenario checks used approved elevated execution for the previously demonstrated sandbox TestClient restriction.

## Scenario module comparison

| Module | Baseline passed | Final passed | Failed | Exit |
| --- | ---: | ---: | ---: | ---: |
| `run_p2_scenarios` | 53 | 53 | 0 | 0 |
| `run_p3_scenarios` | 186 | 186 | 0 | 0 |
| `run_p4_scenarios` | 189 | 189 | 0 | 0 |
| `run_p5_scenarios` | 152 | 152 | 0 | 0 |
| `run_p6_scenarios` | 261 | 261 | 0 | 0 |
| `run_p7_scenarios` | 253 | 253 | 0 | 0 |
| `run_p8_localocr_scenarios` | 89 | 89 | 0 | 0 |
| `run_p9_identity_scenarios` | 98 | 98 | 0 | 0 |
| `run_p11_criteria_scenarios` | 38 | 38 | 0 | 0 |
| `run_p12_subsidy_criteria_scenarios` | 29 | 29 | 0 | 0 |
| `run_p13_household_scenarios` | 26 | 26 | 0 | 0 |
| `run_p14_pdf_forms_scenarios` | 8 form contracts | 8 form contracts | 0 | 0 |
| `run_p15_jbai_scenarios` | 129 | 129 | 0 | 0 |
| `run_p16_job_docs_scenarios` | 96 | 96 | 0 | 0 |
| `run_p17_own_scenarios` | 75 | 75 | 0 | 0 |
| `run_p18_applicant_precheck_scenarios` | 180 | 180 | 0 | 0 |
| `run_p19_nhis_history_scenarios` | 24 | 24 | 0 | 0 |
| `run_p20_nhis_continuation_scenarios` | 7 | 7 | 0 | 0 |

## Playwright execution method (no generated artifacts committed)

Use the existing Vite dev server on 127.0.0.1:5173 and FastAPI on 127.0.0.1:8000. The local Playwright package and Chromium browser are under /tmp/youth-officer-browser, outside the repository. Missing browser libraries were extracted under its sysroot, without system installation or application dependency changes.

The locally retained, ignored browser script can be invoked as follows; it is not part of any commit:

```bash
LD_LIBRARY_PATH=/tmp/youth-officer-browser/sysroot/usr/lib/x86_64-linux-gnu \
PLAYWRIGHT_BROWSERS_PATH=/tmp/youth-officer-browser/browsers \
node .trellis/.runtime/verification/youth-officer-only/browser-check.cjs
```

This requires browser execution outside the demonstrated sandbox process/socket restrictions. Root/removed entries, detail/slot refresh, history, filters, roles, actual backend empty lists and criteria GET are exercised. Real-detail/decision and criteria PUT boundary checks use intercepted synthetic responses, without persistent DB writes. Do not load private documents. No Playwright script, raw JSON, screenshots or logs are proposed for committing; .trellis/.gitignore excludes the entire .runtime directory. Only this invocation/method note is retained in task records.

## Test expectation changes and deletions

### Applicant/savings UI-removal group

- Deleted `demo/frontend/src/forms/phone.test.ts`: no named test functions or package test-runner integration; `cases` contained 9 formatPhone formatting assertions and `validCases` contained 4 isValidPhone assertions.
- Before deletion its subject was imported only by applicant IdentityCheck, applicant-only PdfFormsWorkspace and its own test; PdfFormsWorkspace was called solely from applicant ApplyFlow. No officer/retained shared consumer remained. Conditional user authorization applies.
- Expectation values changed before deletion: none. The 13 assertions are not part of engine/backend pytest or scenario counts.

### All other tests

- No other test deletion, expectation change or test source edit. Backend/engine/scenario tests remain identical to main, including applicant/savings API contracts and the P4 source safety allowlist.
- Runtime browser checks are validation artifacts under ignored runtime storage, not new committed project test files.

## Proposed commits — exact file lists

Commit 1 intentionally contains deletions only, as requested; apply commits 1 and 2 consecutively because retained imports/routing are updated in commit 2. Verification above applies to the final combined working tree.

Only this task’s planning/research/baseline/review records accompany commit 2. The two outside-task Trellis spec edits were restored to main at the user-requested scope audit; no Trellis spec change remains.

### 1. refactor(frontend): remove applicant and savings screens

| Action | File |
| --- | --- |
| Delete | `demo/frontend/src/components/FileLink.tsx` |
| Delete | `demo/frontend/src/components/SignaturePad.tsx` |
| Delete | `demo/frontend/src/forms/FormSheet.tsx` |
| Delete | `demo/frontend/src/forms/PdfFormsWorkspace.tsx` |
| Delete | `demo/frontend/src/forms/consent-model.ts` |
| Delete | `demo/frontend/src/forms/email.ts` |
| Delete | `demo/frontend/src/forms/form-field-bindings.ts` |
| Delete | `demo/frontend/src/forms/form-sheet.css` |
| Delete | `demo/frontend/src/forms/form1-model.ts` |
| Delete | `demo/frontend/src/forms/form2-model.ts` |
| Delete | `demo/frontend/src/forms/form5-model.ts` |
| Delete | `demo/frontend/src/forms/pdf-forms-workspace.css` |
| Delete | `demo/frontend/src/forms/phone.test.ts` |
| Delete | `demo/frontend/src/forms/phone.ts` |
| Delete | `demo/frontend/src/forms/ymd.ts` |
| Delete | `demo/frontend/src/lib/period.ts` |
| Delete | `demo/frontend/src/pages/applicant/ApplyFlow.tsx` |
| Delete | `demo/frontend/src/pages/applicant/DocumentUpload.tsx` |
| Delete | `demo/frontend/src/pages/applicant/FinalCheck.tsx` |
| Delete | `demo/frontend/src/pages/applicant/IdentityCheck.tsx` |
| Delete | `demo/frontend/src/pages/applicant/MyPage.tsx` |
| Delete | `demo/frontend/src/pages/applicant/ProgramPicker.tsx` |
| Delete | `demo/frontend/src/pages/applicant/SubsidyItems.tsx` |
| Delete | `demo/frontend/src/pages/applicant/apply-flow.css` |
| Delete | `demo/frontend/src/pages/applicant/document-upload.css` |
| Delete | `demo/frontend/src/pages/applicant/final-check.css` |
| Delete | `demo/frontend/src/pages/applicant/identity-check.css` |
| Delete | `demo/frontend/src/pages/applicant/my-page.css` |
| Delete | `demo/frontend/src/pages/applicant/program-picker.css` |
| Delete | `demo/frontend/src/pages/applicant/subsidy-items.css` |
| Delete | `demo/frontend/src/pages/officer/ScoreSheet6.tsx` |

Counts: 31 deleted, 0 modified, 0 added.

### 2. refactor(frontend): enter youth officer console directly

| Action | File |
| --- | --- |
| Modify | `demo/frontend/index.html` |
| Modify | `demo/frontend/src/App.tsx` |
| Modify | `demo/frontend/src/api.ts` |
| Modify | `demo/frontend/src/app-shell.css` |
| Modify | `demo/frontend/src/components/CriteriaEditor.tsx` |
| Modify | `demo/frontend/src/components/StatusBadge.tsx` |
| Modify | `demo/frontend/src/navigation-url.ts` |
| Modify | `demo/frontend/src/pages/officer/ApplicationList.tsx` |
| Modify | `demo/frontend/src/pages/officer/OfficerConsole.tsx` |
| Modify | `demo/frontend/src/pages/officer/ReviewDetail.tsx` |
| Modify | `demo/frontend/src/pages/officer/mock-data.ts` |
| Modify | `demo/frontend/src/pages/officer/officer.css` |
| Add | `demo/frontend/src/officer-scope.ts` |
| Add | `.trellis/tasks/11-13-youth-officer-only/check.jsonl` |
| Add | `.trellis/tasks/11-13-youth-officer-only/design.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/implement.jsonl` |
| Add | `.trellis/tasks/11-13-youth-officer-only/implement.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/prd.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/research/baseline-audit.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/research/baseline-results.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/research/current-state.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/research/final-approval.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/research/final-check.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/research/frontend-implementation.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/research/seed-proposal.md` |
| Add | `.trellis/tasks/11-13-youth-officer-only/task.json` |

Counts: 0 deleted, 12 modified, 14 added (revised after restoring both outside-task specs).

### 3. docs: rewrite youth officer README

| Action | File |
| --- | --- |
| Modify | `README.md` |

Counts: 0 deleted, 1 modified, 0 added.

### 4. docs: correct development and demo instructions

| Action | File |
| --- | --- |
| Modify | `docs/DEVELOPMENT.md` |
| Modify | `demo/README.md` |

Counts: 0 deleted, 2 modified, 0 added.

## Excluded untracked metadata

- `.trellis/workspace/codex/index.md` — developer initialization metadata, excluded from the four work commits.
- `.trellis/workspace/codex/journal-1.md` — developer initialization metadata, excluded from the four work commits.

## Final controls

- `git diff --check`: passed; Trellis context validation: passed.
- `git diff --exit-code main` for protected backend/engine/assets/manifests: passed.
- Tracked model/data inventory: empty. Downloaded own weights, .venv, demo DB/storage/samples, node_modules/dist and runtime evidence are ignored and unstaged.
- No staging, commit, push, reset or persistent seed implementation occurred.
- [Full-scope review](final-check.md) has no unresolved blocking finding. The outside-task spec synchronization was reverted during the subsequent scope audit; active behavior and review rationale remain recorded inside this task only.
- Stop here and wait for user approval before creating any of the four commits.


## Pre-commit scope audit requested by user

Previous commit-2 proposal: 14 modified / 14 added. Current proposal: **12 modified / 14 added**, after reverting the two spec files outside .trellis/tasks. No product-code change was made during this audit.

### Reverted outside-task Trellis guidelines

- `.trellis/spec/frontend/state-management.md`: had replaced applicant dual-mount/portal state guidance with current officer URL, mock identity and restoration contracts.
- `.trellis/spec/frontend/pdf-form-workspace.md`: had added a historical/inactive marker for the removed applicant workspace.

Reason for original changes: prevent future agents from reintroducing removed UI based on stale guidance. They are not necessary to deliver the current frontend and can be documented inside this task, so both files were restored byte-for-byte from main. Their new context-manifest entries were removed as well. There is now no diff under .trellis/spec.

### Scope module

`officer-scope.ts` shares `YOUTH_PROGRAM = 'job_package'` and youth role presentation (stage/notes/percentage decorations), preserving server role/action keys. Imported by api.ts, OfficerConsole.tsx and CriteriaEditor.tsx. Its OfficerRole import is type-only; it does not change backend authorization or adjudication rules.

### Mock and existing tests

Removed savings generation/scoring and retained 430 youth entries, historical IDs 901515–901944 and deterministic seed. Individual synthetic values can change because removed savings generation no longer consumes RNG draws. Mock identity now uses exact dataset membership, so real IDs are not intercepted by a broad numeric threshold; forced/automatic/real-only routing remains distinct.

Both main and current committed test sources have no direct reference to the frontend mock module/functions or hardcoded youth mock ID range. P4 retains a source-safety scan of officer frontend files; its 189 checks still pass. All 18 scenarios keep the baseline 1,885 passed / 0 failed and engine/backend tests remain 1,264 passed + 3 same font skips / 1,227 passed. The new local browser checks consumed the current synthetic mock and verified direct links. No existing dataset-based expectation was rewritten to accept the new generated values.

### Lint cause and suppression audit

StatusBadge.tsx remains present and modified, not deleted. The former warning was react(only-export-components) for named object export APPLICANT_DOCUMENT_STATUS. Removing that unused applicant export and audience branch leaves only the component export and resolves the warning. The named export removal is distinct from removing the source file.

.oxlintrc.json, package scripts/dependencies/lockfile, Vite config and all tsconfig files are unchanged. No eslint/oxlint disable was added or edited in retained files. Precisely one pre-existing `eslint-disable-next-line react-hooks/exhaustive-deps` line disappeared with the complete, approved deletion of applicant-only SignaturePad.tsx; this is not a suppression added to make lint pass and is unrelated to the StatusBadge warning.

### Excluded developer initialization metadata

- `.trellis/workspace/codex/index.md`: not tracked and not ignored; remains untracked and excluded.
- `.trellis/workspace/codex/journal-1.md`: not tracked and not ignored; remains untracked and excluded.

No ignore rule was added to hide these files.

### PR description draft

청년 취업지원패키지 담당자 목록으로 바로 진입하고 신청자·두배적금 화면과 전용 의존성을 제거합니다. 신청 API·판정 저장·DB 모델·백엔드·엔진은 보존하며, 취업지원 상세 직접 진입과 URL 복원을 유지합니다.

커밋 1은 삭제 전용이며 단독으로는 build가 실패합니다. 커밋 2까지 적용해야 정상 상태입니다.

검증: 엔진 1,264 통과·기존 글꼴 누락 3건 건너뜀, 백엔드 1,227 통과, 시나리오 18개 1,885 통과·실패 0, lint 경고 0·build 통과.

The draft above is local only; no PR has been created/edited and no commit/staging/push occurred. Stop and wait for approval.

## Exact commit-2 classification requested by user

The previous proposal had 14 modified and 14 added files. Both outside-task guideline modifications below are now reverted/excluded, leaving 12 modified and 14 added.

### Previously proposed modifications (14)

| Path | Classification |
| --- | --- |
| `demo/frontend/index.html` | 화면 코드 |
| `demo/frontend/src/App.tsx` | 화면 코드 |
| `demo/frontend/src/api.ts` | 화면 코드 |
| `demo/frontend/src/app-shell.css` | 화면 코드 |
| `demo/frontend/src/components/CriteriaEditor.tsx` | 화면 코드 |
| `demo/frontend/src/components/StatusBadge.tsx` | 화면 코드 |
| `demo/frontend/src/navigation-url.ts` | 화면 코드 |
| `demo/frontend/src/pages/officer/ApplicationList.tsx` | 화면 코드 |
| `demo/frontend/src/pages/officer/OfficerConsole.tsx` | 화면 코드 |
| `demo/frontend/src/pages/officer/ReviewDetail.tsx` | 화면 코드 |
| `demo/frontend/src/pages/officer/mock-data.ts` | 목업 |
| `demo/frontend/src/pages/officer/officer.css` | 화면 코드 |
| `.trellis/spec/frontend/pdf-form-workspace.md` | Trellis 규약 (main으로 원복, 커밋 제외) |
| `.trellis/spec/frontend/state-management.md` | Trellis 규약 (main으로 원복, 커밋 제외) |

### Additions (14, unchanged)

| Path | Classification |
| --- | --- |
| `demo/frontend/src/officer-scope.ts` | 범위 모듈 |
| `.trellis/tasks/11-13-youth-officer-only/check.jsonl` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/design.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/implement.jsonl` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/implement.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/prd.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/research/baseline-audit.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/research/baseline-results.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/research/current-state.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/research/final-approval.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/research/final-check.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/research/frontend-implementation.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/research/seed-proposal.md` | Trellis 태스크 기록 |
| `.trellis/tasks/11-13-youth-officer-only/task.json` | Trellis 태스크 기록 |
