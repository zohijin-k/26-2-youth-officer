# Youth applicant frontend and repository documentation

## Goal and dependency

After `11-13-youth-applicant-baseline` records the complete pre-change baseline, make this frontend dedicated to youth employment package applicants (parent R1-R6). Explicit implementation approval is required; all product work remains pending.

## Requirements

- Fresh entry opens the youth identity verification step. Remove role/program landing pages, officer frontend routes/components/navigation and savings frontend screens.
- Preserve youth applicant identity, forms, consent/signature, subsidy selection, upload, final check/submission and my-page behavior. Preserve same-tab youth restoration and browser history; a saved savings application must not bypass the frontend scope.
- Keep backend officer APIs, judgment persistence, models, both backend program rules and engine_v2 intact. Report backend code that loses frontend consumers without deleting it.
- Root README explains applicant-only scope, one future PDF-driven service sentence, related repositories, own model setup and Windows (WSL2)/macOS backend/frontend execution.
- Guide: https://github.com/zohijin-k/26-2-capstone
- Siblings: https://github.com/zohijin-k/26-2-savings-applicant , https://github.com/zohijin-k/26-2-savings-officer , https://github.com/zohijin-k/26-2-youth-officer
- Only minimal stale screen/test facts are corrected in docs/DEVELOPMENT.md and demo/README.md. Retained backend tooling descriptions must remain accurate.
- No real documents or prohibited data paths; no model commits; no engine judgment changes. No generic PDF page generation, officer-repository integration or OCR optimization.
- Existing test deletion or expectation change requires a file/test/reason inventory and approval before editing, grouped by frontend-removal cause versus other changes. Prefer zero such changes.

## Acceptance criteria

- `/` and old role/program entry URLs lead to youth identity verification; no officer/savings interface remains reachable or selectable.
- Youth deep-link reload, same-tab recovery, history, reset/home and my-page return behavior remain correct; savings sessions are rejected without deleting backend records.
- Officer pages and exclusive helpers/client API code are removed; shared applicant PDF/assets/components remain functional.
- Backend and engine source contracts and coverage remain unchanged; unused-backend inventory distinguishes unused endpoints from shared code still needed by applicants.
- Root README contains all requested links and commands: `uvicorn demo.backend.main:app --reload --port 8000`, frontend `npm run dev`, `python -m engine_v2.tools.fetch_own_models`.
- Full final four-track validation is compared with baseline, with every scenario row and explained deltas; expected test-change inventory is zero unless specifically approved.
- Before any commit, present `git diff --stat main`, protected-code/asset checks and exact proposed commit groups; wait for approval.

## Review inventory and approval status

The user approved only stage 0 baseline execution in WSL2. Stage 1 remains `planning`; completing that baseline does not authorize screen changes, tests changes, task start or commits for this child.

The reviewable inventory is [research/ui-inventory-and-commits.md](research/ui-inventory-and-commits.md): it enumerates removed screens/routes/files, retained shared applicant components, removed/unknown URL fallback, savings-session rejection and proposed separate behavior, deletion/wiring and documentation commit groups. Deletion-supporting edits in shared files belong with their removed imports/branches so each commit builds.

README Windows instructions must use WSL2; native Windows (PowerShell) gets only one line saying it has not been verified. Test deletion and expectation-change inventories remain empty unless separately reviewed and approved.
