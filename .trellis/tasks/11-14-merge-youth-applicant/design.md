# Design — merging the applicant repository into the officer repository

## Why a plain `git merge` is not enough

A trial `git merge --no-ff aa2dd7d` on top of `ac8a345` reports 26 conflicts (7 content, 19 modify/delete). It also changes three things without reporting anything:

1. 13 applicant files stay deleted, because the officer side deleted them and the applicant side left them unchanged since `e449c55`: `components/FileLink.tsx`, `forms/email.ts`, `forms/phone.ts`, `forms/phone.test.ts`, `forms/ymd.ts`, `pages/applicant/{IdentityCheck,MyPage,SubsidyItems}.tsx`, `pages/applicant/{document-upload,final-check,identity-check,my-page,subsidy-items}.css`.
2. 2 officer files are deleted for the mirror-image reason: `pages/officer/DocumentViewer.tsx`, `pages/officer/format.ts`.
3. `components/skeleton.css` takes the applicant version, which drops the officer list, review and criteria-editor skeleton rules.

`demo/README.md` and `docs/DEVELOPMENT.md` also auto-merge to officer-only text.

## Method

1. `git merge --no-commit --no-ff <applicant tip>` to record both parents.
2. Replace the index and working tree with the union: every officer path at officer content, every applicant-only path (51: 26 frontend, 25 archived Trellis task files) at applicant content.
3. Hand-merge the six shared frontend files (below). `skeleton.css` stays at officer content, which equals the base and is a superset of the applicant version.
4. Verify by blob hash, not by the conflict list: path set equals the union, and only the hand-merged files differ from their owning tip.

## Hand-merged files (all under `demo/frontend`)

| File | Resolution |
| --- | --- |
| `src/api.ts` | The tips partition the base exports (officer 29, applicant 49, 5 identical on both). Result = applicant file + officer's two imports + officer declarations appended. 73 exports, no duplicates, no signature differs. |
| `src/navigation-url.ts` | Applicant file (officer file plus `goToHome`) with `Mode` and `currentMode()` restored from the base. |
| `src/App.tsx` | Chooses one screen from `currentMode()` and mounts only that one. Re-reads the mode on `popstate`. Each screen keeps its own header markup. Screens are loaded with `React.lazy`. |
| `src/app-shell.css` | Both rule sets kept, each prefixed with `:where(.app-shell--officer)` or `:where(.app-shell--applicant)`; `:where()` adds no specificity, so the order among each side's own shell rules is unchanged. |
| `src/components/StatusBadge.tsx` | Base component with `audience` optional, default `officer`. No call site changes, so `ReviewDetail.tsx` stays byte-identical. The applicant label table is no longer exported (nothing imported it), which keeps lint at 0 warnings as on the officer tip. |
| `index.html` | Neutral static title; `App.tsx` sets `document.title` per screen. |

## Decisions

- **One screen at a time.** `ApplyFlow` creates a `job_package` draft when it mounts and both screens rewrite the address on mount. Mounting both, as the base did behind tabs, would create drafts on officer visits.
- **Root URL follows the pre-split rule.** `/` opens the applicant flow unless `?mode=officer` is present. Officer entry is `/officer`. This changes the officer documents, which described `/` as the officer list.
- **Lazy loading per screen.** Both sides define unscoped `.btn` and `.btn--primary` (in `apply-flow.css` and `officer.css`), and `document-upload.css` has a print rule on `body *`. In a single bundle these leak across screens. Lazy loading ships each side's CSS only with its own chunk, so each screen looks as it does on its tip. It also removes the 500 kB chunk notice (largest chunk 446.78 kB).
- **Moving between screens is a full page load.** A lazily loaded stylesheet is never removed, so the `popstate` handler reloads the document when the address now belongs to the other screen. Without this, a same-document switch left both sides' `.btn` rules active (measured: officer buttons changed radius, padding and font size).
- **Stylesheet order changed, one rule adjusted.** With lazy loading, `index.css` and `app-shell.css` load before the screen CSS instead of after it. A scan of equal-specificity pairs found one visible effect: `.status-badge--loading` in `skeleton.css` set a border colour that `index.css` used to override on both tips. That declaration was removed so the loading badge renders as it does on the applicant tip.
- **No role switcher.** Both tips removed the tabs; switching is by URL. Officer entry is `/officer...` or `?mode=officer` only; old officer links without `mode` (for example `/?o_open=9`) now open the applicant flow, as they did before the split.
- **`job_package` scoping stays.** `officer-scope.ts`, `youthList` and `YOUTH_PROGRAM_CODE` are kept as they are; the renewal will generalize them.

## Constraints found during analysis

- Backend tests and scenarios read frontend paths: `demo/frontend/src/assets/fonts` (render, P7, P14) and `PdfFormsWorkspace.tsx`, `pdf-forms-workspace.css`, `pages/applicant/DocumentUpload.tsx` (P4). The frontend directory layout is therefore kept.
- CORS and `seed_application` assume port 5173 and a single frontend origin.
- Engine baseline is 1,267 with synthetic fonts installed and 1,264 + 3 skipped without them (`engine_v2/tests/test_own_format_integration.py`).

## Rollback

The merge is a single merge commit on a feature branch. Before it reaches `main`, delete the branch. After, revert the merge commit with `git revert -m 1`. A repository rename can be reversed by renaming back.
