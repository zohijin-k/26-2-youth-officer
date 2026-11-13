# Frontend boundary design

## Entry and navigation

Replace App's role switch and simultaneous applicant/officer mounts with one applicant shell. Retain application header controls hosted by the applicant portal. Simplify navigation URL support while retaining applicant stage routes, history handling and cleanup of obsolete navigation parameters. Normalize removed/invalid entry paths to `/apply/identity` using replaceState so obsolete screens do not become history destinations.

Load `job_package` from existing API configuration, then show identity verification without a program-selection stage. A fetch failure has a retryable error state; do not render a blank page or silently switch programs. The current IdentityCheck requires an application ID before rendering. Initialize a single youth draft when the fresh flow needs that ID, then show identity verification. Guard request reuse against React StrictMode effect replay, history remounts, retries and stale responses so loading does not create duplicate drafts. Do not restore or create savings drafts.

Restoration must validate the fetched application's program before hydrating form/subsidy/upload state. Valid same-tab youth applications keep their stage and persistence behavior. Reject stale savings restoration and clear only its frontend active pointer if necessary; do not delete backend applications or mutate their data.

## Remove and retain

Remove `pages/officer/`, ProgramPicker and its exclusive styles, role-switch navigation, exclusive officer utilities, and savings-only JSX/workspace branches. Trace all imports before deleting shared files. In particular, api.ts imports officer mock data, so the client officer API/mock section must be removed along with its importing code.

Use [the explicit inventory](research/ui-inventory-and-commits.md) for whole-file deletions versus retained mixed files and exact direct-route behavior. Both programs currently use `/apply/<stage>`; program identity must be checked at restoration, not inferred from the route. Removed officer paths, legacy mode/program entries, `/apply/program` and unknown paths normalize with replacement to youth identity; recognized valid youth stage URLs continue to restore. Remove obsolete mode/filter query fields without treating query application IDs as ownership.

Keep the youth modal PDF workspace, all shared rendering/field bindings/helpers it needs, fonts and license files used by backend PDF generation, and original backend templates/coordinate maps for both programs. Simplify mixed savings/youth branches without changing youth API payloads. Backend/API inventory is documentation-only.

`FormSheet.DateTriple`, `SignaturePad`, `Modal`, file/PDF preview, applicant status badges, shared loading primitives and phone/email/date helpers remain required. Keep job form-binding order unchanged: the API's opaque field IDs are mapped by position. `/api/files/{id}` still serves applicant previews/status and must not be classified as unused backend code.

## Tests and contracts

P4's source scan checks remaining files for forbidden download features and does not require officer frontend file existence. Its backend API tests, plus savings backend tests/scenarios, remain valid and must be preserved. No existing test removal or expectation change is planned. If implementation evidence changes that conclusion, obtain explicit approval before touching those tests.

Perform focused browser smoke checks of fresh/old entry URLs, history, same-tab youth restoration, savings-session rejection, PDF forms/save/consents/signatures, uploads/final submission and my-page. Record unavailable interaction checks; lint/build alone does not prove navigation behavior.

## Documentation

Rewrite root README around the user-facing applicant repository and related repository links. Use separate WSL2/macOS virtualenv setup; apply npm lockfile runtime requirements rather than copying stale Node minimum claims. Keep future generic PDF-driven application configuration to one roadmap sentence. Keep DEVELOPMENT/demo README edits narrowly tied to repository identity, removed frontend descriptions and measured test facts; do not rewrite backend history or expand into unrelated docs.

## Review and commit boundaries

Only WSL2 stage 0 is approved. Keep stage 1 in planning for a subsequent review of baseline results and this refined inventory. No existing test change or deletion is planned.

Propose entry/restoration behavior first, then a separate deletion commit with necessary import/mount/route/prop/CSS reference cleanup, then documentation. The entry commit leaves old files present so it compiles; the deletion commit can then remove ProgramPicker, officer mocks and Form5 types with their remaining references. ApplyFlow hunks span the two frontend commits and need explicit staging review. The inventory explains exact groups and shared-file risks. The complete final diff and validation must be approved before any commit; never auto-commit evidence or bookkeeping.

README Windows instructions are WSL2 commands; native PowerShell gets a single unverified-status line. macOS instructions remain separate. DEVELOPMENT/demo README updates stay narrowly scoped to removed screens and measured test facts.
