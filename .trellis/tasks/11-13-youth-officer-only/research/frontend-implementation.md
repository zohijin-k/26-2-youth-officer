# Frontend implementation report

## Scope and verification

Completed the approved officer-only frontend directly under the existing task branch. No backend, engine, engine_v2, package manifests/lockfiles, fonts, templates, docs or root README were changed by this frontend agent. No staging or commits.

- `npm run lint`: exit 0, **zero warnings**. The baseline warning came from an applicant-only named export in StatusBadge; removing that unused presentation/export resolves the Fast Refresh warning.
- `npm run build`: exit 0; TypeScript and Vite production build pass. Existing >500 kB bundle notice remains.
- `git diff --check`: passed.
- Main agent owns actual-browser validation and full engine/backend/scenario reruns.

## Resulting behavior

- App mounts only OfficerConsole. Root and obsolete applicant/savings paths normalize to the youth application list. No role/program entry screen or applicant navigation remains.
- Youth role/detail URLs and query restoration retain IDs, filters, paging and slot selection. Popstate remounts/restores the officer state. Explicit officer detail paths take precedence over obsolete applicant mode query values.
- Every list query is scoped to job_package and submitted order. Criteria editing always uses job_package. Savings score/quota/filter controls and skeleton labels are removed; server role keys, action keys and result labels remain intact.
- A fetched savings detail is rejected before rendering any detail/action controls, with a back-to-list action. Youth details continue to use real API IDs even when an earlier empty list activated mock mode. Decisions use explicit mock membership rather than global list mock state.
- Youth details without uploaded documents still display metadata/findings/decision controls rather than an endless loading skeleton. Existing uploaded originals and authored PDF tabs retain their viewers.
- The mock dataset retains existing youth generation helpers and 430 synthetic entries; savings generation/scoring code is removed. Its old youth ID range **901515–901944** is preserved by a fixed historical offset of 1515, without generating savings rows. Synthetic field values change because removed savings entries no longer consume RNG draws. Invalid/old savings mock IDs do not become youth entries.
- Mock mode reads the URL dynamically. Forced mock, automatic empty base-scope/API failure fallback and explicit real-only mode are preserved. A successful filtered empty API result does not trigger fallback. Regional/town filters also prevent empty-list fallback. Explicit real-only mode never uses synthetic rows/details/decisions.
- The list displays page-relative application sequence numbers rather than the unused server savings scoring rank.
- Hidden insurance/paper-form criteria payload fields remain preserved from the API response for save compatibility; their savings-only UI is removed.

## Applicant/savings UI test deletion

Only deleted test: `demo/frontend/src/forms/phone.test.ts`. It has no named test functions and is not run by the package scripts. It contains **9 formatPhone formatting cases** in `cases` and **4 isValidPhone validity cases** in `validCases`: 13 module-level assertions total. No expectation values were modified before deletion.

Import evidence before deletion: `phone.ts` was imported by applicant IdentityCheck, PdfFormsWorkspace and its own test. PdfFormsWorkspace was imported solely by applicant ApplyFlow. No officer component or remaining shared code imported the phone helper. Once those applicant-only consumers were deleted, both helper and test were orphaned. The conditional user approval therefore applies.

All backend and engine tests/expectations remain untouched. No other test file was deleted or changed. Shared TTF, WOFF2 and OFL assets are retained for backend/P14 use.

## Removed unused frontend API calls

- `uploadSignatureScan`
- `deleteSignatureScan`
- `fetchPrograms`
- `fetchProgramCriteria`
- `createApplication`
- `fetchApplication`
- `fetchApplicationConsents`
- `patchApplication`
- `fetchOriginalHwpOptions`
- `fetchInterviewFormFileOptions`
- `fetchFormLayout`
- `fetchApplicantForms`
- `verifyIdentity`
- `postSelfCheck`
- `postConsents`
- `fetchChecklist`
- `putDocContext`
- `uploadDocument`
- `uploadMerged`
- `deleteDocument`
- `fetchSubsidyItems`
- `saveSubsidyItems`
- `fetchFinalCheck`
- `submitApplication`
- `fetchStatus`

## Removed unused frontend API types

- `Program`
- `DocRow`
- `ReviewStep`
- `PackageDetail`
- `SavingsPlan`
- `ApplyStep`
- `ProgramDetail`
- `SubsidyCatalogItem`
- `SubsidySelection`
- `SubsidyState`
- `FirstComeInfo`
- `ApplicationRow`
- `SelfCheckResult`
- `ConsentPayload`
- `UploadedDocument`
- `DocRequirementRow`
- `DocContext`
- `ChecklistProgram`
- `Checklist`
- `MergedUploadResult`
- `Blocker`
- `FinalCheck`
- `SubmitResult`
- `ApplicationStatus`
- `FormFieldLayout`
- `FormLayout`
- `ApplicantFormSummary`
- `Identity`
- `IdentityPayload`
- `QuotaRow`
- `OfficerRowDoc`
- `ScoreItemRow`
- `ScoreSheetData`

These are frontend declarations only; all corresponding server endpoints, request/response behavior and persisted data remain unchanged. The internal unused multipart helper `form` was also removed. `OfficerRow` and `OfficerRole`/`OfficerList` frontend projections omit unused scoring/quota fields; raw backend JSON remains untouched.

## Frontend deletion files (proposed commit 1)

- `demo/frontend/src/components/FileLink.tsx`
- `demo/frontend/src/components/SignaturePad.tsx`
- `demo/frontend/src/forms/FormSheet.tsx`
- `demo/frontend/src/forms/PdfFormsWorkspace.tsx`
- `demo/frontend/src/forms/consent-model.ts`
- `demo/frontend/src/forms/email.ts`
- `demo/frontend/src/forms/form-field-bindings.ts`
- `demo/frontend/src/forms/form-sheet.css`
- `demo/frontend/src/forms/form1-model.ts`
- `demo/frontend/src/forms/form2-model.ts`
- `demo/frontend/src/forms/form5-model.ts`
- `demo/frontend/src/forms/pdf-forms-workspace.css`
- `demo/frontend/src/forms/phone.test.ts`
- `demo/frontend/src/forms/phone.ts`
- `demo/frontend/src/forms/ymd.ts`
- `demo/frontend/src/lib/period.ts`
- `demo/frontend/src/pages/applicant/ApplyFlow.tsx`
- `demo/frontend/src/pages/applicant/DocumentUpload.tsx`
- `demo/frontend/src/pages/applicant/FinalCheck.tsx`
- `demo/frontend/src/pages/applicant/IdentityCheck.tsx`
- `demo/frontend/src/pages/applicant/MyPage.tsx`
- `demo/frontend/src/pages/applicant/ProgramPicker.tsx`
- `demo/frontend/src/pages/applicant/SubsidyItems.tsx`
- `demo/frontend/src/pages/applicant/apply-flow.css`
- `demo/frontend/src/pages/applicant/document-upload.css`
- `demo/frontend/src/pages/applicant/final-check.css`
- `demo/frontend/src/pages/applicant/identity-check.css`
- `demo/frontend/src/pages/applicant/my-page.css`
- `demo/frontend/src/pages/applicant/program-picker.css`
- `demo/frontend/src/pages/applicant/subsidy-items.css`
- `demo/frontend/src/pages/officer/ScoreSheet6.tsx`

## Remaining frontend modifications (proposed commit 2)

- `demo/frontend/index.html`
- `demo/frontend/src/App.tsx`
- `demo/frontend/src/api.ts`
- `demo/frontend/src/app-shell.css`
- `demo/frontend/src/components/CriteriaEditor.tsx`
- `demo/frontend/src/components/StatusBadge.tsx`
- `demo/frontend/src/navigation-url.ts`
- `demo/frontend/src/pages/officer/ApplicationList.tsx`
- `demo/frontend/src/pages/officer/OfficerConsole.tsx`
- `demo/frontend/src/pages/officer/ReviewDetail.tsx`
- `demo/frontend/src/pages/officer/mock-data.ts`
- `demo/frontend/src/pages/officer/officer.css`

## Added frontend file (proposed commit 2)

- `demo/frontend/src/officer-scope.ts`: the fixed youth program constant and youth-only role presentation adapter.

Root-owned README/documentation/Trellis files must be inventoried separately from the frontend groups above.
