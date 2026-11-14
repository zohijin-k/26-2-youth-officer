# 청년 신청자·담당자 저장소 합치기

## Approval

The owner decided on 2026-11-14 to merge the two youth repositories ("저는 합치는 거 추천", "잘 받아와보세요") and asked for the GitHub repository name and description to be updated afterwards. Method and naming were delegated.

## Goal

Make `26-2-youth-officer` the single youth repository by bringing the applicant screens of `26-2-youth-applicant` back in, so the upcoming generic-program renewal has one backend, one database and one `engine_v2`.

## Background

- Officer tip `ac8a345`, applicant tip `aa2dd7d`. Both descend from `e449c55` (the pre-split capstone state) and add 6 commits each.
- `demo/backend`, `engine_v2`, `engine`, `dashboard`, `demo/fixtures`, package manifests and Trellis specs are blob-identical on both tips. Only the frontend, three documents and archived Trellis tasks differ.
- No open pull requests and no remote branches other than `main` on either repository.
- Youth and savings (두배적금) repositories stay separate.

## Requirements

### R1 — Nothing is lost

The merged tree is exactly the union of both tips: every officer path and every applicant path is present. Every path outside the hand-merged set is byte-identical to the tip that owns it.

### R2 — History is preserved

The result is a two-parent merge commit (officer first parent, applicant second parent), so the applicant repository's commits stay reachable.

### R3 — Both screens work from one frontend

- One Vite app at `demo/frontend`. Exactly one of the two screens is mounted at a time.
- `/officer...` opens the officer console; `/apply...` opens the applicant flow; any other path opens the officer console only with `?mode=officer`, otherwise the applicant flow (the rule the code had before the split).
- Each screen keeps the appearance and behaviour it has on its own tip. The review detail screen (document viewer and review sheet) is not modified.
- The program scope stays `job_package` on both sides; savings screens are not restored.

### R4 — Backend and engine untouched

No change under `demo/backend`, `engine_v2`, `engine`, `dashboard`, `demo/fixtures`, `package.json`, `package-lock.json`.

### R5 — Documents describe the merged repository

`README.md`, `demo/README.md` and `docs/DEVELOPMENT.md` state that both screens live here, give the URL for each screen, and no longer say that applicant screens do not exist.

### R6 — Repository identity

After the merge lands on `main`, rename the GitHub repository and update its description to describe both screens.

## Out of scope

- Renewal features (program list, form templates, LLM messages).
- Changes to the applicant repository on GitHub (archiving, description).
- Link updates in the capstone hub and the savings repositories.

## Acceptance Criteria

- [x] Tracked path set of the merge == officer paths ∪ applicant paths (769).
- [x] Paths differing from their owning tip are exactly: `index.html`, `src/App.tsx`, `src/api.ts`, `src/app-shell.css`, `src/components/StatusBadge.tsx`, `src/navigation-url.ts` (all under `demo/frontend`) plus the three documents. Follow-up fixes after review also touch `src/components/skeleton.css` and `.trellis/spec/frontend/state-management.md`.
- [x] No conflict markers; `git diff ac8a345 -- demo/backend engine_v2 engine dashboard demo/fixtures` is empty.
- [x] `npm run lint` exits 0 with no warnings, `npm run build` exits 0, `node src/forms/phone.test.ts` exits 0.
- [x] Engine, backend and scenario suites give the same result on the merged tree as on the officer tip, or better where restored applicant files are involved.
- [x] Browser check: `/officer?mock=1` shows the officer list; `/apply/identity` shows the applicant identity step; `/` goes to the applicant flow.
- [x] `main` contains the merge (pull request #2, merge commit `0d88b35`); repository renamed to `zohijin-k/26-2-youth`; description updated.
