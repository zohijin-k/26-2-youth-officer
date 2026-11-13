# Baseline execution checklist

Stage 0 execution approved on WSL2 (Ubuntu 24.04.5 LTS); native Windows measurement is excluded. Record actual completion evidence separately. Stage 1 remains planning.

1. Record requested origin, clean/dirty state and `git rev-parse HEAD`; use existing correct clone. For a genuinely new checkout use `gh repo clone zohijin-k/26-2-youth-applicant` outside the existing repository.
2. Record WSL distribution/version, platform/architecture and executable paths. Use `python3 -m venv .venv` and `source .venv/bin/activate`. Record tracked cleanliness versus known untracked planning files, commit/remote parity, ext4 versus /mnt/c, core.autocrlf, and tracked working-tree EOL statistics.
3. Run `python -m pip install -r demo/backend/requirements.txt -r engine_v2/requirements.txt` and `python -m pip install pytest`. Record actual versions. Preserve original dependency files. Non-macOS must not receive ocrmac/pyobjc.
4. Run `python -m engine_v2.tools.fetch_own_models`, then `python -c "from engine_v2.tools.fetch_own_models import verify_models; verify_models(); print('own hashes OK')"`. Save verification of all three files. Do not stage downloaded files.
5. Prepare the synthetic font path adaptation described in parent research using external temporary output. Check operational paths before running tests; if unsafe, report the conflict before execution. Do not change source/test expectations.
6. In `demo/frontend`, run `npm ci`, `npm run lint`, `npm run build`, recording each exit code and warning. Return to repository root.
7. From root execute `python -m pytest engine_v2/tests -q -rs` through the documented safe path bootstrap; separately execute `python -m pytest demo/backend/tests -q -rs`. Capture pass/fail/skip/error/collection counts and exact test identifiers for differences. Do not load `.env` or use real external OCR credentials.
8. Run each `python -m demo.backend.tests.<module>` from the table below in its own process. Set UTF-8 environment variables where needed; do not use P6 `--live`. Continue after any failure. Capture module exit status and all check/skip summary lines.
9. Write `research/baseline.md` with four-track totals, module table, causal comparison to supplied macOS numbers and all unresolved failures. Baseline completion means evidence is complete, not that failures have been hidden. Surface blockers before UI work.

## Scenario result template

| Module | Passed | Failed | Skipped | Exit | Notes |
| --- | --- | --- | --- | --- | --- |
| run_p2_scenarios | pending | pending | pending | pending | |
| run_p3_scenarios | pending | pending | pending | pending | |
| run_p4_scenarios | pending | pending | pending | pending | retained backend officer coverage |
| run_p5_scenarios | pending | pending | pending | pending | |
| run_p6_scenarios | pending | pending | pending | pending | isolated mode only |
| run_p7_scenarios | pending | pending | pending | pending | retain backend PDF templates/fonts |
| run_p8_localocr_scenarios | pending | pending | pending | pending | |
| run_p9_identity_scenarios | pending | pending | pending | pending | |
| run_p11_criteria_scenarios | pending | pending | pending | pending | |
| run_p12_subsidy_criteria_scenarios | pending | pending | pending | pending | |
| run_p13_household_scenarios | pending | pending | pending | pending | |
| run_p14_pdf_forms_scenarios | pending | pending | pending | pending | aggregate validation; separate form count |
| run_p15_jbai_scenarios | pending | pending | pending | pending | synthetic fixtures/mocks |
| run_p16_job_docs_scenarios | pending | pending | pending | pending | |
| run_p17_own_scenarios | pending | pending | pending | pending | real CPU inference on synthetic page |
| run_p18_applicant_precheck_scenarios | pending | pending | pending | pending | |
| run_p19_nhis_history_scenarios | pending | pending | pending | pending | |
| run_p20_nhis_continuation_scenarios | pending | pending | pending | pending | |

## Additional reporting requirements (user approved 2026-11-13)

Use macOS reference revision e449c55 and frontend lint 1 warning/build passed. For every difference report test name and evidence-based cause. Separate Apple Vision missing-package skips from absent-private-data skips/failures and all other categories. For private-data-related findings report test names only, never input file names. Do not assume missing synthetic fonts means private data is required.
