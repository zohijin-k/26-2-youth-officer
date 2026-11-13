# Baseline results — WSL2, unchanged e449c55

## Checkpoint

All four groups match the macOS counts supplied by the user. Baseline execution is complete; STOP for explicit user approval before frontend or README implementation. Secondary documents remain separately gated. No product, test, expectation, rule, README or lockfile was edited; no commit or push occurred.

## Repository and environment

- Origin fetch/push: `https://github.com/zohijin-k/26-2-youth-officer`. Verified before setup and after all runs.
- Branch: `main`; full HEAD: `e449c550bdc9cc43b6793ca6636658c1f9f75cdd`.
- Host: **WSL2 Linux (Ubuntu 24.04.5 LTS / Noble)**.
- Kernel: `6.18.58.1-microsoft-standard-WSL2`.
- Python: **3.12.3**; Node: **22.23.4**; npm: **10.9.9**. Node >=22.13 prerequisite passed.
- Created `.venv`; installed both requirements plus pytest. No requirement/lockfile changes. Exact installed packages are recorded in the ignored runtime logs.
- Only synthetic tests and existing generated demo samples were used. No private document inputs, extra fonts or evaluation corpus were supplied. Models and generated data are ignored and unstaged.

## Comparison against user-supplied macOS baseline

| Group | macOS at e449c55 | WSL2 at same HEAD | Delta |
| --- | --- | --- | --- |
| engine_v2 pytest | 1,264 passed; 3 skipped | 1,264 passed; 3 skipped; 0 failed | None |
| demo/backend pytest | 1,227 passed | 1,227 passed; 0 failed; 0 skipped | None |
| Scenarios, all 18 modules | 1,885 passed; 0 failed | 1,885 passed; 0 failed; 0 skipped | None |
| Frontend | lint: 1 warning; build passed | npm ci passed; lint: 1 warning; build passed | None |

P14 reports eight original-form/coordinate/rendering contracts rather than a check count. All eight passed; they are not added to the 1,885 numeric checks. Every module exited 0.

## Missing-data/font outcomes (test names only)

| Test | Result | Cause |
| --- | --- | --- |
| `test_own_insurance_stamp_and_right_cell[False]` | Skipped | Pinned synthetic NanumMyeongjo font is absent |
| `test_own_insurance_stamp_and_right_cell[True]` | Skipped | Pinned synthetic NanumMyeongjo font is absent |
| `test_own_four_myeongjo_conditions_recover_all_fields` | Skipped | Pinned synthetic NanumMyeongjo font is absent |

No test failed from absent data/fonts. No other missing-data/font skips were reported. No fonts were downloaded to change these outcomes.

## Apple Vision outcomes

Apple Vision / ocrmac / pyobjc-related test skips: **0**. `ocrmac` is excluded from dependency installation by its Darwin-only environment marker on WSL2; this installation exclusion is not a pytest skip. No pyobjc dependency was installed.

## Commands and execution permissions

No temporary execution helper, path override, monkeypatch added by the runner, deselection or test change was used. Ordinary commands (virtualenv interpreter):

```bash
.venv/bin/python -m engine_v2.tools.fetch_own_models
.venv/bin/python -m pytest engine_v2/tests -q -ra
.venv/bin/python -m pytest demo/backend/tests -q -ra
# Each existing scenario was run as a separate ordinary module process:
.venv/bin/python -m demo.backend.tests.<module>
# In demo/frontend:
npm ci
npm run lint
npm run build
```

`-q -ra` only controls pytest reporting. There was no alteration of tests or test paths. All 18 scenario modules ran in numeric order; no --live mode was used.

Initial sandboxed Python/model downloads failed DNS and were retried with approved elevated execution. npm ci succeeded. The initial sandboxed backend run stopped after three completed cases because TestClient initialization blocked. A product-independent empty FastAPI app reproduced the timeout inside the sandbox and succeeded immediately outside it. That incomplete run was interrupted (exit 130); the complete unchanged backend command was rerun with elevated execution (exit 0). Scenario module commands likewise ran with approved elevated execution. Engine pytest and frontend ran within the sandbox. No dependency pin or test code was changed to resolve the environment limitation.

Engine completed in 52.07 seconds with two library deprecation warnings; backend completed in 224.80 seconds with four library deprecation warnings. Frontend lint has one Fast Refresh export warning; build succeeds with a >500 kB chunk-size notice. These diagnostics are recorded without modifying code.

## Own model verification

Both the fetcher and independent `verify_models()` plus SHA256 comparison passed for all three assets.

| Asset role | Expected and actual SHA256 (equal) | Result |
| --- | --- | --- |
| Detection model | `4d97c44a20d30a81aad087d6a396b08f786c4635742afc391f6621f5c6ae78ae` | Verified |
| Korean recognition model | `cd6e2ea50f6943ca7271eb8c56a877a5a90720b7047fe9c41a2e541a25773c9b` | Verified |
| Korean dictionary | `a88071c68c01707489baa79ebe0405b7beb5cca229f4fc94cc3ef992328802d7` | Verified |

## Per-module scenario baseline

| Module | Passed checks | Failed | Skipped | Exit | Additional native result |
| --- | ---: | ---: | ---: | ---: | --- |
| `run_p2_scenarios` | 53 | 0 | 0 | 0 |  |
| `run_p3_scenarios` | 186 | 0 | 0 | 0 |  |
| `run_p4_scenarios` | 189 | 0 | 0 | 0 |  |
| `run_p5_scenarios` | 152 | 0 | 0 | 0 |  |
| `run_p6_scenarios` | 261 | 0 | 0 | 0 |  |
| `run_p7_scenarios` | 253 | 0 | 0 | 0 |  |
| `run_p8_localocr_scenarios` | 89 | 0 | 0 | 0 |  |
| `run_p9_identity_scenarios` | 98 | 0 | 0 | 0 |  |
| `run_p11_criteria_scenarios` | 38 | 0 | 0 | 0 |  |
| `run_p12_subsidy_criteria_scenarios` | 29 | 0 | 0 | 0 |  |
| `run_p13_household_scenarios` | 26 | 0 | 0 | 0 |  |
| `run_p14_pdf_forms_scenarios` | Not counted | 0 | 0 | 0 | Eight form contracts verified |
| `run_p15_jbai_scenarios` | 129 | 0 | 0 | 0 |  |
| `run_p16_job_docs_scenarios` | 96 | 0 | 0 | 0 |  |
| `run_p17_own_scenarios` | 75 | 0 | 0 | 0 |  |
| `run_p18_applicant_precheck_scenarios` | 180 | 0 | 0 | 0 |  |
| `run_p19_nhis_history_scenarios` | 24 | 0 | 0 | 0 |  |
| `run_p20_nhis_continuation_scenarios` | 7 | 0 | 0 | 0 |  |
| **Total: 18 modules** | **1,885** | **0** | **0** | **All 0** | **P14: 8 forms** |

## Change and approval inventory

- `git diff --stat main`: empty. Tracked source/document files remain identical to main.
- Deleted files: none. Changed/deleted tests or expectations: none.
- New untracked files: this Trellis task (planning/research/baseline report/context) and the initialized codex developer workspace metadata only.
- Models, virtualenv, node_modules, dist, generated demo samples and detailed runtime logs are ignored. Nothing is staged; no tracked model/data assets were found.
- Raw logs, resolved Python packages, command metadata and scenario result JSON are under `.trellis/.runtime/baselines/youth-officer-e449c55/` (ignored).

## Pending document approval and later implementation conditions

- `docs/DEVELOPMENT.md`: candidate factual corrections for old repository/branch inventory, obsolete setup/tool-version/test counts and applicant frontend directions. No edit without separate approval.
- `demo/README.md`: candidate factual corrections for the dual-role/product entry, applicant-tab flow and stage-two upload instructions that become unavailable after UI removal. No edit without separate approval.
- Root README after post-baseline implementation approval: WSL2 Windows setup, native Windows unverified in one line, existing macOS setup labeled not verified this session, existing synthetic mock preparation only.
- Keep direct youth application detail entry and URL restoration. Restrict only applicant/savings entry. Report any incompatible alternative before implementation.
- Before deleting the phone test inspect subject-module officer/shared imports and retain the test if shared. Current static import search found applicant IdentityCheck and PdfFormsWorkspace plus its own test; recheck after deciding which shared components remain. No deletion is approved here.
- New persistent seed tool remains a proposal memo only. Separate deletion commits from other change commits.
- At final commit approval present diff stat, deletion versus other-change inventories, test expectation/deletion inventory with reasons, and four-group comparison against this WSL2 baseline.

## Gate

Awaiting user approval. Do not start phase-two frontend cleanup or edit README/secondary documentation in this baseline turn.
