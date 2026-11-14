# Stage 1 review inventory and commit proposal

Planning only. The user approved stage 0 in WSL2; no stage 1 implementation, test change, or commit is authorized. This inventory supplements the parent research `../11-13-youth-applicant-scope/research/frontend-boundaries.md` and is based on the unchanged product source at `e449c550bdc9cc43b6793ca6636658c1f9f75cdd`.

## Screens and routes

| Screen/control | Current implementation | Proposed result |
| --- | --- | --- |
| Applicant/officer role tabs and two-program heading | `src/App.tsx:20-22`, `:75-92` | Remove tabs, officer mount/state and dual-program copy; retain one youth-applicant shell and header portal |
| Program landing, two program cards, demo criteria editor entry | `src/pages/applicant/ProgramPicker.tsx:455-504`, `ApplyFlow.tsx:312-325` | Remove picker screen and program stage; fresh applicant flow goes directly to identity verification |
| Officer listing, scope/role filters, quota, mock display and bulk decisions | `src/pages/officer/OfficerConsole.tsx`, `ApplicationList.tsx` | Remove frontend screens and controls |
| Officer split review, original viewer, score sheet and single decision controls | `ReviewDetail.tsx`, `DocumentViewer.tsx`, `ScoreSheet6.tsx` | Remove frontend screens and controls |
| Officer/program criteria editor, including applicant-demo entry | `src/components/CriteriaEditor.tsx`, called by OfficerConsole and ProgramPicker | Remove component and both entry points; backend criteria APIs remain |
| Savings forms 1–5, eight-question self-check, admin-info consent, Form5 signature-file mode and inline PDF workspace | Mixed branches in `ApplyFlow.tsx` and `src/forms/PdfFormsWorkspace.tsx` | Remove these frontend-only paths and their exclusive metadata/styles; keep youth modal form flow |
| Youth identity → forms/self-check/consents/signatures → subsidy → upload → final-check/submission → completion/My Page | `src/pages/applicant/*` except ProgramPicker; shared PDF renderer | Preserve screens and API behavior |

Paths above are relative to `demo/frontend/`. There is no independent savings route namespace: both programs share `/apply/<stage>`, with the saved application deciding the program. Removing a card alone therefore cannot enforce the repository boundary.

## Direct URL and browser behavior after all stage 1 commits

| Input | Proposed observable behavior |
| --- | --- |
| Fresh `/` with no recognized stage | Initialize youth configuration/draft once, then replace the URL with `/apply/identity`; display identity verification without role/program selection |
| `/apply/identity` with no usable same-tab pointer | Initialize a youth draft and show identity; loading/failure has explicit feedback and retry |
| `/apply/forms`, `/apply/subsidy`, `/apply/upload`, `/apply/final`, `/apply/complete`, `/apply/mypage` with a valid same-tab youth application | Preserve existing restoration, ownership and submission restrictions. My Page keeps a valid `from` stage; draft `/complete` still falls back to final-check as today |
| Same applicant stage URL without a usable pointer | Replace with `/apply/identity`; do not infer ownership from URL query fields |
| Same applicant stage URL whose saved application is savings | Reject before hydrating forms/consents/subsidy/upload state; clear only the incompatible frontend pointer, initialize youth identity, and leave the backend application untouched |
| `/officer`, `/officer/<role>`, `/officer/<role>/review/<id>`, `/officer/criteria/<code>` | Replace with `/apply/identity`; never mount officer components, hydrate officer query state, or call officer APIs |
| `/?mode=officer`, legacy `o_*` controls, `program=double_savings`, `/apply/program`, unknown/obsolete paths | Normalize to youth identity. Program query fields cannot choose another program. Remove obsolete routing parameters while preserving unrelated URL information according to the existing navigation policy |
| Browser back/forward, refresh at a valid youth stage | Restore the valid youth stage; an obsolete history entry normalizes with replaceState, avoiding a redirect loop |
| Existing top-mark/home control | Return to youth first step through the same guarded initializer; do not recreate a role/program landing page. Reuse a valid current youth draft when appropriate; do not delete or overwrite saved applications |

The canonical code `job_package` belongs at the frontend boundary; dates, forms, requirements and options continue to come from existing backend program configuration. No new backend API or frontend hard-coded eligibility rules are needed. Guard automatic draft initialization against React StrictMode effect replay (`src/main.tsx:1-12`), repeated home/history entry, stale responses and retry; testing only the visible first page would miss duplicate DB drafts.

## File/component inventory

### Delete whole files

- `src/pages/officer/OfficerConsole.tsx`
- `src/pages/officer/ApplicationList.tsx`
- `src/pages/officer/ReviewDetail.tsx`
- `src/pages/officer/DocumentViewer.tsx`
- `src/pages/officer/ScoreSheet6.tsx`
- `src/pages/officer/mock-data.ts`
- `src/pages/officer/format.ts`
- `src/pages/officer/officer.css`
- `src/pages/applicant/ProgramPicker.tsx`
- `src/pages/applicant/program-picker.css`
- `src/components/CriteriaEditor.tsx`
- `src/forms/form5-model.ts`, after removing Form5 state/props and all imports from ApplyFlow/PdfFormsWorkspace
- `src/lib/period.ts`, if the implementation's final import/reference audit confirms the current zero-consumer finding; it contains savings-only residence/work-period presentation helpers

### Edit retained mixed files instead of deleting them

| File | Remove | Preserve |
| --- | --- | --- |
| `src/App.tsx` | Officer mount, role tabs, remembered officer URL/state, dual-program heading | Applicant shell, header portal and browser-history handling |
| `src/navigation-url.ts` | Mode selection/officer route interpretation | Applicant params, canonical stage URLs and obsolete-parameter cleanup; add removed-route normalization |
| `src/api.ts` | Officer mock import (`:3-9`), exclusive officer DTO/mock/client section (`:656-1044`), criteria editor calls/history types (`:451-459`), savings signature-scan client calls (`:411-423`) after their controls are gone | All youth application, identity, consent, forms/layout, subsidy, upload, final-check/submit/status and archive/preview clients |
| `src/pages/applicant/ApplyFlow.tsx` | Picker/stage, savings consent/Form5 state and flow branches, savings workspace modifier | Youth initialization/restoration, queues, identity locks, original forms/signatures, subsidy, uploads, submission, My Page and progress |
| `src/forms/PdfFormsWorkspace.tsx` | Savings inline branch/sorting, Form5/admin consent/scan behavior, savings-only extras | Youth list/modal, renderer/layout coordinates, field mapping, save/flush, signatures, preview, reset and download menu |
| `src/forms/form2-model.ts` | Savings question data/defaults | Youth self-check data and required shared types/helpers |
| `src/forms/form-field-bindings.ts` | Internal savings `서식1`–`서식5` entries | Exact job application/consent key order; positional opaque-field mapping is a contract |
| `src/components/StatusBadge.tsx` | Exclusive officer presentation variant if no consumers remain | Applicant labels, including the meaningful applicant status “담당자 확인 예정” |
| `src/app-shell.css`, `src/pages/applicant/apply-flow.css`, `src/forms/pdf-forms-workspace.css` | Proven role-tab/savings-inline/Form5-only selectors | Applicant shell/stepper, common buttons, youth modal forms, save/errors and download-menu styles |

Do not remove shared files based on officer imports alone. Keep IdentityCheck, SubsidyItems, DocumentUpload, FinalCheck, MyPage, FormSheet (`DateTriple` is still used), SignaturePad (youth signatures still use it), Modal, FileLink, FilePreview, PdfPages, Skeleton, useDelayedFlag, phone/email/date helpers and font/license assets. Keep `forms/phone.test.ts`. In `FormSheet.tsx`, `DateTriple` is the confirmed applicant dependency; audit the other exported wrappers/controls and `form-sheet.css` individually after ScoreSheet6 deletion, removing only exports/styles proven exclusive or unused. Do not delete the whole file or generic applicant date behavior. Keep backend templates/coordinate maps for both programs; they are also consumed by unchanged backend tests.

## Retained backend contracts and tests

The parent research inventories officer list/detail/roles/decision/bulk decision, officer criteria read/write, picker-only public criteria fetch and savings Form5 scan endpoints that lose frontend consumers. Keep these implementations, models and persisted judgment paths. `/api/files/{id}` remains an applicant preview/status/final-check dependency and must not be called wholly unused. Removing frontend savings selection does not remove the savings backend program or its tests.

No existing test deletion or expectation change is proposed. In particular, `demo/backend/tests/run_p4_scenarios.py::test_no_download_in_source` scans present files and requires empty forbidden-use results; it does not require officer files to exist. Officer API tests and all savings engine/backend/scenario coverage remain. If an unexpected test change becomes necessary, obtain approval for the exact file/test/old-new expectation or deletion/reason; list changes caused by officer/savings screen removal separately.

## Proposed commit split and dependency order

This is a review proposal, not commit authorization. Perform the complete stage 1 change and verification first, then show final exact file/hunk groups with `git diff --stat main` and the four baseline comparisons. Wait for approval before creating any commit. Do not push.

1. **Other behavior change — `feat: start youth package applications directly`**
   - `src/pages/applicant/ApplyFlow.tsx`: fixed youth initialization, picker-stage bypass, loading/error/retry, program validation before restore, same-tab/history-safe initialization and duplicate-draft guard.
   - `src/navigation-url.ts` only if an applicant helper change is needed for this behavior; do not remove officer exports while App/OfficerConsole still import them.
   - Existing picker/officer files remain physically present in this intermediate commit, so there are no unresolved imports. This commit establishes the replacement applicant entry before file deletion.

2. **Deletion and required wiring — `refactor: remove savings and officer frontend`**
   - All whole-file deletions listed above.
   - `App.tsx`, `navigation-url.ts`, `api.ts`: remove the corresponding mounts/tabs/routes/imports/types/mock clients and wire removed-route fallback to the youth entry created in commit 1.
   - `ApplyFlow.tsx`, `PdfFormsWorkspace.tsx`, `form2-model.ts`, `form-field-bindings.ts`, `StatusBadge.tsx` and the three CSS files: remove exclusive savings/officer branches and references while retaining applicant behavior. These are deletion-supporting edits, not a redesign.
   - Risk: deleting `mock-data.ts` before removing `api.ts`'s top-level import breaks build; deleting form5-model before removing shared props/imports does the same. They belong together in this deletion commit. Savings content is embedded in retained files, so a pure file-delete-only commit would leave unavailable screens in source or break compilation.
   - `ApplyFlow.tsx` appears in both commits with distinct hunks (entry/restoration versus savings cleanup). Review those hunks explicitly; do not stage the whole final file into the first commit accidentally. Keep each intermediate commit lint/build valid when it is constructed.

3. **Other documentation change — `docs: describe the youth applicant repository`**
   - Root `README.md`: applicant scope, one PDF-driven future-service sentence, guide/three sibling links, own-model setup, WSL2/macOS commands and backend/frontend launch commands.
   - `docs/DEVELOPMENT.md`, `demo/README.md`: only stale screen/test facts, retaining accurate backend/tool information.
   - README's Windows route is WSL2. Native Windows/PowerShell is represented by one “not verified” line, without a claimed working native setup.
   - Narrowly necessary Trellis research/plan/validation/spec boundary records are explicitly listed in the final commit proposal. Stage-0 baseline evidence remains a separate evidence group if it is committed in this batch; do not mix it into the frontend deletion commit or auto-commit it through bookkeeping tools.

The final commit plan may refine exact hunk allocation after implementation evidence, but must keep deletion and behavior/documentation groups distinct and obtain fresh approval for material regrouping. A temporary intermediate commit need not meet every final applicant-only acceptance criterion; it must build and its successor must finish the removal. Do not land or push an incomplete intermediate state by itself.

## Post-baseline acceptance review

Run the same full four validation tracks, all 18 scenario processes separately, plus targeted browser checks for every route-table row and the complete synthetic youth application. Compare with the stage-0 WSL2 environment and counting units; do not silently equate scenario aggregate checks with pytest tests. Confirm no backend/engine/test/template/font/dependency-lockfile changes, no private/runtime/model artifacts staged, and no test suppression. Record unavailable browser checks explicitly. Stage 1 stays `planning` until the user approves this refined plan after reviewing stage-0 results.
