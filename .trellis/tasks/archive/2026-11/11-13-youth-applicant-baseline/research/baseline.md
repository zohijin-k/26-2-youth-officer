# WSL2 baseline — e449c55

Measured 2026-11-13 on **WSL2 (Ubuntu 24.04.5 LTS)**, x86_64. Native Windows was not measured. Stage 0 is complete; stage 1 remains planning and requires approval. No product source, existing test expectations, or tests were changed or deleted. No commits were made.

## Pre-measurement source and machine checks

| Item | Result |
| --- | --- |
| HEAD / local origin/main / live GitHub main | e449c550bdc9cc43b6793ca6636658c1f9f75cdd, all equal |
| Ahead / behind origin/main | 0 / 0 |
| Tracked working tree | clean before measurement; no tracked source changes after measurement |
| Full git status | not strictly clean: only known untracked Trellis task planning/evidence and codex workspace files |
| Repository filesystem | /home/ijin/26-2-youth-applicant, WSL ext4 under home; not /mnt/c |
| core.autocrlf | input (global config) |
| Tracked working-tree CRLF / mixed-EOL files | 0 / 0 |
| Python | 3.12.3, Linux virtualenv from /usr/bin/python3 |
| Node / npm | v22.23.4 / 10.9.9, Linux nvm executables |
| Kernel | 6.18.58.1-microsoft-standard-WSL2 |

Duplicate cloning was skipped as approved. Live GitHub parity was checked using git ls-remote without changing the checkout. See preflight.md for the initial observations and setup details.

## Four-track comparison

| Track | Supplied macOS e449c55 reference | WSL2 baseline | Difference |
| --- | --- | --- | --- |
| engine_v2 pytest | 1,264 passed; 3 skipped | **1,267 passed; 0 failed; 0 skipped** | +3 passed, -3 skipped; synthetic font-dependent coverage enabled |
| demo/backend pytest | 1,227 passed | **1,227 passed; 0 failed; 0 skipped** | pass counts match |
| 18 scenario modules | 1,885 passed; 0 failed | **1,885 check passes; 0 failed; all 18 modules exit 0** | check count matches; P14 aggregate success reported separately |
| Frontend lint | 1 warning | **exit 0; 1 warning** | matches supplied warning count |
| Frontend build | passed | **exit 0; passed** | matches; chunk-size warning also observed |

pytest engine run emitted 2 warnings; backend emitted 4 warnings. These are existing httpx/TestClient, fitz API and SQLModel query deprecations in the installed versions, not failed tests. The macOS pytest warning inventory was not supplied, so no warning-count delta is asserted. Frontend lint's one warning is react(only-export-components) in StatusBadge. No dependency or source edits were applied to suppress warnings.

## Engine difference: test names and cause

| Test name | WSL2 result | Evidence/cause |
| --- | --- | --- |
| test_own_insurance_stamp_and_right_cell[False] | passed | pinned synthetic Myeongjo font available in external temporary directory |
| test_own_insurance_stamp_and_right_cell[True] | passed | same synthetic-font prerequisite |
| test_own_four_myeongjo_conditions_recover_all_fields | passed | both pinned synthetic font families available; real own inference on authored synthetic images |

All three tests have explicit missing-synthetic-font skip paths. Providing those public fonts explains the three additional enabled cases without changing expected values. Identification of these as the exact three macOS skips is an inference: the supplied macOS reference includes totals but not skipped test names/reasons. Do not misclassify these as Apple Vision or private-data cases.

| Requested skip/failure category | Observed WSL2 tests |
| --- | --- |
| Apple Vision missing ocrmac/pyobjc | **0 skipped / 0 failed**; packages are absent as intended; unsupported-engine behavior is tested without requiring native Apple Vision |
| Missing private data | **0 skipped / 0 failed**; no private input data was required or accessed |
| Other skipped tests | **0** after own weights and public synthetic fonts were available |
| Sandbox execution restriction | preliminary TestClient attempt timed out; excluded from completed baseline; unchanged focused test passed outside sandbox and final backend/scenarios completed there |

No private input filenames appear in this report. execution-notes.md documents the interrupted attempt and temporary operational-path configuration.

## Per-module scenario results

All modules ran separately from the repository root with `python -m demo.backend.tests.<module>`. Failure in one process would not prevent later modules. P6 used isolated temporary storage, never live reset mode.

| Module | Passed | Failed | Skipped | Exit |
| --- | --- | --- | --- | --- |
| run_p2_scenarios | 53 | 0 | 0 | 0 |
| run_p3_scenarios | 186 | 0 | 0 | 0 |
| run_p4_scenarios | 189 | 0 | 0 | 0 |
| run_p5_scenarios | 152 | 0 | 0 | 0 |
| run_p6_scenarios | 261 | 0 | 0 | 0 |
| run_p7_scenarios | 253 | 0 | 0 | 0 |
| run_p8_localocr_scenarios | 89 | 0 | 0 | 0 |
| run_p9_identity_scenarios | 98 | 0 | 0 | 0 |
| run_p11_criteria_scenarios | 38 | 0 | 0 | 0 |
| run_p12_subsidy_criteria_scenarios | 29 | 0 | 0 | 0 |
| run_p13_household_scenarios | 26 | 0 | 0 | 0 |
| run_p14_pdf_forms_scenarios | 1 aggregate (8 forms; excluded from check sum) | 0 | 0 | 0 |
| run_p15_jbai_scenarios | 129 | 0 | 0 | 0 |
| run_p16_job_docs_scenarios | 96 | 0 | 0 | 0 |
| run_p17_own_scenarios | 75 | 0 | 0 | 0 |
| run_p18_applicant_precheck_scenarios | 180 | 0 | 0 | 0 |
| run_p19_nhis_history_scenarios | 24 | 0 | 0 | 0 |
| run_p20_nhis_continuation_scenarios | 7 | 0 | 0 | 0 |
| **Check total (17 counted modules)** | **1,885** | **0** | **0** | **all 0** |

P14 prints one aggregate successful validation covering 8 original forms instead of a check counter. It is the eighteenth successful module, excluded from the 1,885 individual-check sum. Adding its module success to individual checks would mix units and produce a misleading 1,886 total.

## Installation, models and reproducibility

- Created .venv and installed both unchanged requirements files plus pytest. `pip check` passed. See python-environment.txt for every installed version and frontend-environment.json for lockfile-installed frontend dependencies.
- Representative versions: FastAPI 0.162.5, Starlette 1.10.0, SQLModel 0.0.44, PyMuPDF 2.1, Pillow 13.0.0, ONNX Runtime 1.31.1, NumPy 2.5.4, pytest 9.2.0. No ocrmac or pyobjc packages installed.
- `npm ci` succeeded from the unchanged lockfile. No npm audit fixes or dependency updates were applied. Installation DNS failures under the sandbox were retried with approved network access; they are setup failures, not failed tests.
- Ran `python -m engine_v2.tools.fetch_own_models` and explicit verify_models(). All pinned hashes passed:

| Model asset | Bytes | SHA-256 |
| --- | --- | --- |
| detector | 4,819,576 | 4d97c44a20d30a81aad087d6a396b08f786c4635742afc391f6621f5c6ae78ae |
| Korean recognizer | 13,488,748 | cd6e2ea50f6943ca7271eb8c56a877a5a90720b7047fe9c41a2e541a25773c9b |
| dictionary | 47,451 | a88071c68c01707489baa79ebe0405b7beb5cca229f4fc94cc3ef992328802d7 |

Public synthetic fonts/licenses passed their pinned hashes in an OS temporary directory. bootstrap-sitecustomize.py configures only operational font/private-root paths and adds a Python filesystem guard; no OCR/rule implementation, input expectations or assertions are replaced. The final runs recorded **0 prohibited-tree access attempts**. The initial guarded attempt was investigated and corrected as described in execution-notes.md; no data was read from that tree.

The execution harness run-baseline.py records exact subprocess commands, counts and exit status. Raw logs/JUnit and generated assets are local in `/tmp/youth-applicant-baseline-OQ2u7q`; portable summaries are in results.json. Backend/scenarios use the same WSL2 .venv outside the sandbox because the sandbox stalls TestClient's AnyIO portal. Engine and frontend completed inside the sandbox; executable/dependency versions are the same.

## Stage 1 and commit gates

Stage 1 is unapproved. Its updated UI inventory enumerates whole-file deletions, shared files/exports to preserve, removed-path replacement behavior and separate behavior/deletion/documentation commit groups. README will describe Windows execution using WSL2; native Windows/PowerShell receives only a one-line unverified statement. Backend APIs/models/judgments, engine logic, templates and shared fonts remain.

Existing test expectation changes: **0**. Existing test deletions: **0**, including officer/savings frontend-removal-related test deletions. If implementation later requires any, obtain approval for the exact names and reasons first. Before any commit, re-run the full validation, compare against this baseline, show git diff --stat main and exact file/hunk groups, and wait for approval. No archive/session automation that auto-commits is used at this stage.
