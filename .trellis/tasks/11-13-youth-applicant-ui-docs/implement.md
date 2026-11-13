# UI/docs implementation checklist

Prerequisites: subsequent explicit stage 1 approval and the complete stage 0 WSL2 baseline report. Only stage 0 is currently approved. Do not start this child, edit product/tests or commit before its gates.

1. Load frontend specs (including PDF workspace/state ownership), parent research/frontend-boundaries.md and [research/ui-inventory-and-commits.md](research/ui-inventory-and-commits.md). Review the screen/route/component inventory and separate deletion/other-change commit proposal with the user after baseline. Create task branch from measured main revision only after stage 1 approval, without disturbing user edits.
2. Simplify App/navigation and make ApplyFlow use the API's job_package configuration directly. Remove program stage and ensure home/reset, loading/error/retry, history and direct entry normalize to youth identity.
3. Guard same-tab restoration against non-youth programs before hydrating state. Preserve youth stage URLs and ownership rules; do not expose applicant IDs or values in URLs.
4. Remove officer folder/routes/tabs/client API/mock/types and exclusive helpers after import inventory. Remove ProgramPicker and savings-only frontend branches/styles, tracing shared PDF/signature/download/form helpers before deletion.
5. Keep backend models/APIs/persistence, both program rules, PDF assets/templates and engine_v2 unchanged. Record newly unused frontend backend consumers in the task report.
6. Before changing any existing test, list file/function/check, old/new expectation or deletion and reason; ask approval. Separate officer/savings frontend removal items. Current plan has no test edits/deletions.
7. Rewrite root README with requested role, roadmap sentence, guide/sibling links, Windows (WSL2)/macOS virtualenv/install/model/backend/frontend commands. Minimally correct removed-screen/repository/test facts in DEVELOPMENT/demo README using measured counts; label baseline OS/revision.
8. Run focused applicant browser smoke checks and the same four-track full validation as the baseline, including all 18 scenario processes and frontend lint/build. Record before/after deltas, warnings, skips, failures and counting units.
9. Review applicable specs for narrowly necessary boundary updates. Inspect `git diff --check`, `git diff --stat main`, changed test file list, backend/engine protected paths and model/runtime assets. Report new planning files as well as tracked diff.
10. Present final report plus exact commit plan; wait for approval before committing. No push. Do not archive or auto-record a session in a way that commits before this gate.

## Expected change groups

- Remove officer UI, picker, exclusive utilities/client code and savings-only React/CSS paths.
- Modify applicant shell, navigation/restoration and retained shared youth frontend branches.
- Rewrite README; minimal DEVELOPMENT/demo README corrections; necessary Trellis planning/research/evidence/spec updates.
- Preserve backend/engine/tests/templates/fonts/dependency lockfiles unless a separately approved and evidenced change is needed.

## Proposed commit construction after final approval

The full file/hunk plan lives in [the inventory](research/ui-inventory-and-commits.md). Keep these logical groups distinct:

1. Entry/restoration behavior (`ApplyFlow.tsx`, applicant helper hunks if needed): direct youth startup, program guard, error/retry, same-tab/history preservation, duplicate-draft guard. Keep old unused screen files until the next commit so imports remain valid.
2. Frontend deletion plus required wiring: officer/picker/Form5-only files; their App/navigation/api imports/mounts/exports; savings-only branches/props/bindings/CSS in retained shared files. Include each reference fix with the corresponding deletion. Preserve shared youth PDF/DateTriple/SignaturePad/fonts and the original job field order.
3. Applicant documentation (`README.md`, minimal DEVELOPMENT/demo README facts) and explicitly listed Trellis planning/research/verification/spec records. Keep baseline evidence separately identifiable; no bookkeeping auto-commits.

`ApplyFlow.tsx` has hunks in groups 1 and 2; do not stage its complete final version into group 1. Each constructed intermediate commit must pass frontend lint/build. No commit, staging plan execution, push, archive or session-record auto-commit occurs before the complete final four-track comparison, `git diff --stat main`, exact file groups and user approval.

README Windows setup is WSL2; native Windows/PowerShell has only one unverified-status line. Tests remain unchanged; any discovered deletion or expectation change requires its own exact inventory and approval, separated by screen-removal cause.
