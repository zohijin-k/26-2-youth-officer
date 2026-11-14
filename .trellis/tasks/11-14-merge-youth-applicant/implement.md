# Implementation plan

Branch `feat/merge-youth-applicant` from `main` (`ac8a345`).

1. [x] Merge commit: `git merge --no-commit --no-ff aa2dd7d`, restore the union tree, apply the six hand-merged files, run the path-set and blob checks, commit.
2. [x] Documents: rewrite `README.md`, `demo/README.md`, `docs/DEVELOPMENT.md` for the merged repository (both screens, `/officer` and `/apply/identity`, mock URLs under `/officer`, `phone.test.ts` command). Separate commit.
3. [x] Verification, each recorded in `research/verification.md`:
   - frontend: `npm run lint`, `npm run build`, `node src/forms/phone.test.ts`
   - engine: `python -m pytest engine_v2`
   - backend: `python -m pytest demo/backend`
   - scenarios: the 18 modules listed in `demo/README.md`
   - browser: `/officer?mock=1`, `/officer?mock=0`, `/apply/identity`, `/`
   Compare with the officer tip run in the same environment.
4. [x] Review of the hand-merged files; fix findings in follow-up commits (no amend).
5. [ ] Trellis record commit, push the branch, open the pull request, merge into `main`.
6. [ ] Rename the GitHub repository, update its description, point local `origin` at the new URL.
7. [ ] Archive this task.

Never stage the untracked nested clone `26-2-youth-officer/` at the repository root; stage paths explicitly.
