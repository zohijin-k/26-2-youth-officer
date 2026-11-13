# Research: baseline commands, synthetic boundaries and test impact

> Revised approval: the user explicitly rejected the proposed path-isolation harness. Baseline now uses ordinary pytest and existing asset defaults, with no extra font/data downloads. Any missing-font/data and Apple Vision skips are measured as-is. The proposal below is historical research, not an execution instruction. Stop after the baseline report.

- Query: audit the requested phase-zero baseline and anticipated test impact before implementation.
- Scope: internal, static inspection only.
- Date: 2026-11-13.
- No dependency installation, model download, test execution or product/test edit occurred during this audit.
- The parent supplied the exact task directory. The research child's `task.py current --source` returned `none` because session task pointers are session-scoped; this report belongs to the parent's explicit task.

## Environment and installation

Read-only version commands report Linux, Python 3.12.3 (`python3`; `python` is unavailable before virtualenv activation), Node v22.23.4, npm 10.9.9.

The existing checkout is to be reused once origin and clean state are checked; a new machine would use `gh repo clone zohijin-k/26-2-youth-officer`. Do not clone into this existing checkout.

After planning approval, repository-root commands are:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r demo/backend/requirements.txt -r engine_v2/requirements.txt
python -m pip install pytest
python -m engine_v2.tools.fetch_own_models
```

Windows uses `py -3.12 -m venv .venv`, then `\.venv\Scripts\Activate.ps1` with a leading dot path (`.\.venv\Scripts\Activate.ps1`); macOS uses `python3` and POSIX activation. Run all backend/module commands at repository root. UTF-8 should be configured using the OS's correct environment-variable syntax. Do not claim Windows/macOS runtime validation from this Linux machine.

- `demo/backend/requirements.txt:1-13` and `engine_v2/requirements.txt:1-21` do not install pytest; it is a verification-only dependency to install separately, without changing application requirements merely for this task.
- `engine_v2/requirements.txt:7` already marks `ocrmac` with `sys_platform == "darwin"`; Windows and Linux skip Apple Vision automatically. No requirements edit is needed to exclude it.
- The README's blanket Node 20+ claim is too broad. `demo/frontend/package-lock.json:1495` requires `^20.19.0 || >=22.12.0` for Vite 8.3.0, and `:1314` requires `>=22.13.0 || >=24` for pdfjs-dist. Document Node 22.13+ (or compatible newer LTS); the installed Node 22.23.4 satisfies both. Keep package-lock unchanged unless a separate failure justifies a dependency change.

## Pinned model verification

`engine_v2/tools/fetch_own_models.py:9-15` writes only `engine_v2/models/own`. `fetch()` verifies cached assets before reuse (`:35-38`), verifies new downloads before atomic replacement (`:42-49`), and prints the successful SHA-256 (`:53`). `verify_models()` independently checks all assets (`:23-29`). Fetching needs public network access to ModelScope and GitHub; this is an environment action after approval, not an OCR performance task.

| Asset | Required SHA-256 |
| --- | --- |
| det.onnx | 4d97c44a20d30a81aad087d6a396b08f786c4635742afc391f6621f5c6ae78ae |
| rec.onnx | cd6e2ea50f6943ca7271eb8c56a877a5a90720b7047fe9c41a2e541a25773c9b |
| korean_dict.txt | a88071c68c01707489baa79ebe0405b7beb5cca229f4fc94cc3ef992328802d7 |

Never stage models or generated/private data. Root `.gitignore` already excludes both engine model/data directories. Use explicit file staging and inspect staged names before committing.

## Four baseline branches

| Branch | Command / scope | Required record |
| --- | --- | --- |
| Frontend | In `demo/frontend`: `npm ci`, then `npm run lint`, then `npm run build` | Separate exit codes, lint/build warnings and type-check failures; build includes `tsc -b` |
| Engine pytest | At root: `python -m pytest engine_v2/tests -q -ra` | passed/failed/skipped/error counts and node IDs; record any path-constraint block separately |
| Backend pytest | At root: `python -m pytest demo/backend/tests -q -ra` | passed/failed/skipped/error counts and node IDs |
| Scenario modules | One fresh subprocess per existing `run_p*_scenarios.py`, via `python -m demo.backend.tests.<module_stem>` | Module, exit code, reported pass/fail/skip counts or assertion result, relevant failure names |

Capture commands, commit SHA, OS/tool versions and installed Python package versions with the baseline. Run all branches even when an independent branch fails; never relabel an existing failure as a regression or silently repair it. Run the same environment, subprocess isolation and module set after changes.

`demo/frontend/package.json:6-10` has no test script. The frontend TypeScript phone assertion file is not executed by npm lint/build. Additional runtime/browser checks should cover the actual officer navigation and filters after implementation rather than introducing tests that merely mirror deleted code.

## Complete discovered scenario inventory

There are **18** modules. P10 is absent; do not infer modules from a continuous numeric range. All statuses below are **not run** at planning time.

| Module after `demo.backend.tests.` | Coverage | Baseline |
| --- | --- | --- |
| run_p2_scenarios | Immediate upload assessment | Not run |
| run_p3_scenarios | Combined review and scoring | Not run |
| run_p4_scenarios | Officer lists/roles/details, inline files and source safety | Not run |
| run_p5_scenarios | Job-package branching and subsidies | Not run |
| run_p6_scenarios | Reset and S1-S10 twice, idempotency | Not run |
| run_p7_scenarios | Written-form PDF export, forms APIs and officer form tabs | Not run |
| run_p8_localocr_scenarios | Local OCR and extracted fields | Not run |
| run_p9_identity_scenarios | Identity matching/privacy | Not run |
| run_p11_criteria_scenarios | Review criteria | Not run |
| run_p12_subsidy_criteria_scenarios | Subsidy limits, receipts and criteria snapshots | Not run |
| run_p13_household_scenarios | Household inference and duplicate links | Not run |
| run_p14_pdf_forms_scenarios | Original blank form templates, coordinate/rendering contracts and fonts | Not run |
| run_p15_jbai_scenarios | Synthetic/mocked JBAI transport, privacy and fallback | Not run |
| run_p16_job_docs_scenarios | Job document readers and upload boundaries | Not run |
| run_p17_own_scenarios | Own engine selection and actual synthetic CPU OCR | Not run |
| run_p18_applicant_precheck_scenarios | Applicant API precheck and uncertainty handling | Not run |
| run_p19_nhis_history_scenarios | NHIS history extraction and decisions | Not run |
| run_p20_nhis_continuation_scenarios | Multi-page NHIS continuation identity | Not run |

Most runners print pass/fail counts and return nonzero on failure. P14's `run()` raises on failure and prints a form count instead (`run_p14_pdf_forms_scenarios.py:311-323`); retain its native result rather than inventing a numeric test count. P17 explicitly reports skipped real-engine coverage if model files are absent (`:191-199`, `:274`); the approved baseline downloads models first, so absence must be recorded as incomplete environment setup.

## Synthetic-only execution and forbidden path caveats

- Existing scenarios create temporary DB/storage paths: e.g. P4 `_isolate()` changes DB, documents, signatures and files storage (`run_p4_scenarios.py:879-898`); `main()` creates and removes a temporary root (`:906-930`). Use modules, not isolated calls to runner helpers outside their isolation setup.
- P6's default uses a temporary directory. **Do not use `--live`**: it points at and resets real `demo/` (`run_p6_scenarios.py:767-775`) and its final cleanup removes DB/storage again (`:823-825`). It does not provide persistent officer seed data.
- P15 explicitly replaces HTTP and rejects actual network calls (`run_p15_jbai_scenarios.py:545-554`). P17 removes real JBAI credentials and asserts no remote call (`run_p17_own_scenarios.py:261-273`). Before other test runs clear user `JBAI_*` secrets/config and do not load an external `.env`; tests may set their own fake values. Leave engine-selection defaults intact for selection tests.
- Model files use the allowed ignored model directory. Test images/documents use temporary synthetic sources; demo sample generation writes under ignored `demo/fixtures/samples/`.
- **Do not run default synthetic CLI commands from the old development guide.** `make_synth_eval.OUT_DIR` (`engine_v2/tools/make_synth_eval.py:23`), `fetch_synth_fonts.FONT_DIR` (`engine_v2/tools/fetch_synth_fonts.py:10`) and `make_job_docs.DEFAULT_OUT` (`engine_v2/tools/make_job_docs.py:36`) target the forbidden engine data directory by default. These CLIs accept explicit output paths (`fetch_synth_fonts.py:67`, `make_job_docs.py:482`); this task does not need their default commands.
- There is a **strict runtime path issue** in full engine pytest: `test_own_format_integration.py::_available` calls `font_path("nanummyeongjo")` without an output-directory override (`:24`). The font helper's default directory is bound at function definition (`fetch_synth_fonts.py:30`). Its missing-font skip still probes that directory, which conflicts with the user's prohibition on referencing it. Affects `test_own_insurance_stamp_and_right_cell[False]`, `[True]` and `test_own_four_myeongjo_conditions_recover_all_fields`. The latter also invokes `extract_diag.synthetic_cases()` whose internal `font_path(font)` uses the same default (`extract_diag.py:158-166`). Do not skip/deselect tests or change expectations to get a successful baseline. Proposed execution-only solution for plan review: a temporary harness supplies pinned fonts outside the checkout and replaces the directory entry in the existing font helper's `__defaults__` before calling `pytest.main()` on the **full** suite; the original function object remains shared by imported aliases. Record the identical harness before/after. This changes the asset root only, with no assertion, OCR inference, eligibility rule or test-result mock change. If the harness cannot preserve these boundaries, record the execution as constraint-blocked and return for review rather than claiming a complete baseline.
- `engine_v2/paths.py:8` defines a private directory under the forbidden path, imported by `pipeline/jbai_ocr.py:31`. `_is_private_path` resolves that directory to classify input paths (`jbai_ocr.py:404-408`). This is reached with synthetic temporary paths by `test_jbai_ocr.py::test_three_page_pdf_calls_backend_in_page_order` (`:23-44`), and concretely by `test_jbai_transport.py::test_pdf_pages_are_sent_as_200dpi_rgb_jpeg` (`:67-71`), `test_photo_with_alpha_is_converted_to_rgb_jpeg` (`:90-96`) and `test_size_limit_is_checked_on_jpeg_bytes` (`:107-121`). Transport configure clears `JBAI_ALLOW_REAL_DOCS` (`:21-24`), so the classification is not bypassed. Existing privacy-boundary test patches the directory itself (`test_jbai_ocr.py::test_private_file_and_demo_upload_are_blocked_by_default`, `:204-213`), retaining its own temporary root. Proposed temporary harness also redirects `jbai_ocr.PRIVATE_DIR` (and original paths constant before consumers import it) to an empty temporary root, preserving containment semantics. Verify imports and subprocess behavior during phase zero; a main-process patch alone does not prove child-process coverage. Merely importing a Path constant does not read private documents, but claiming that this alone proves no runtime reference would be inaccurate.

## Test changes / deletions inventory for approval

No tests have been changed or deleted. The following are review candidates, not authorizations.

### Applicant/savings frontend removal group

| File / test | Likely impact | Reason and recommendation |
| --- | --- | --- |
| `demo/frontend/src/forms/phone.test.ts`: module-level `cases` formatting assertions and `validCases` validation assertions (no named functions) | Candidate deletion only if its unreferenced phone helper is removed | Helper is used by applicant IdentityCheck; removing the helper makes its test orphaned. Report the file and both assertion groups for explicit approval before deletion. Alternatively retain helper/test until approval. |
| `demo/backend/tests/run_p4_scenarios.py::test_no_download_in_source`, `APPLICANT_FORM_FILE_ALLOWLIST` at lines 642-647 | Metadata cleanup candidate, no expected result change required | Deleted PdfFormsWorkspace TSX/CSS and DocumentUpload paths may be removed from allowlist, while retained `backend/api/forms.py` stays. The scan checks existing files, so stale entries do not themselves fail. Keep expected empty forbidden-hit arrays unchanged. |
| Savings-specific frontend view code such as ScoreSheet6 | Product code deletion; no direct test deletion found | Tests of backend score sheets still exercise retained APIs. Do not delete their tests merely because the matching frontend view is removed. |

### Retained backend/engine contracts group

| File / test | Decision |
| --- | --- |
| P4 `test_list_and_filters`, `test_quota`, `test_roles`, `test_review_detail`, `test_applicant_form_archive_access`, `test_applicant_still_blind` | Retain: source inspection shows API responses, not browser applicant pages, are asserted. Backend savings and applicant APIs remain in scope for preservation. |
| P5 `test_program_branching`, `test_self_check`, `test_officer_view` | Retain: both program API contracts and job branch are preserved. |
| P7 `test_coordinate_maps`, `test_form_files_and_paper_flow`, `test_officer_tab`, and all PDF roundtrip/export tests | Retain along with original templates and shared font assets; UI deletion does not authorize removing form APIs. |
| P14 `_check_bundled_form_fonts` called by `run()` | Retain TTF **and WOFF2 plus OFL** under frontend fonts: lines 50-59 require all three; backend renderer and synthetic job generator also reuse TTF. Do not remove fonts as applicant-only assets. |
| `demo/backend/tests/test_seed_application.py` including `test_address_frontend_override_and_preserved_upload_context`, `test_frontend_path_override_rejected`, `test_frontend_shaped_patch_without_marker_is_missed_by_cleanup` | Retain: they assert preserved CLI/API compatibility and printed legacy route, not that applicant UI continues to exist here. Do not rewrite seed tool output as part of screen-only removal without a separate contract decision. |
| `engine_v2/tests` entire suite | Preserve assertions and cases. File names containing applicant, savings, private or observed do not establish real-data use; inspect actual fixtures, which mostly synthesize words/temporary documents. |

## Related specs and final review

- `.trellis/spec/backend/seed-application.md` requires full engine/backend pytest and all scenarios against baseline; seed CLI depends on a verified applicant draft and cannot provide a new persistent submitted officer application by itself.
- `.trellis/spec/backend/quality-guidelines.md` preserves OCR interfaces, pinned models and synthetic test privacy.
- `.trellis/spec/frontend/index.md` and quality guideline are required entry points; most generic frontend guidelines remain placeholders.

Before commit, present `git diff --stat main`, complete four-branch before/after comparison, module-by-module scenario table, and an explicit list of every changed/deleted test with rationale; keep UI-removal deletions in their own group. Obtain approval before any test expectation/deletion and again before committing. Baseline failures and OS-limited checks must remain visible.
