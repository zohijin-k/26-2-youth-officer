# Baseline execution notes

## Environment restriction diagnosis

Initial engine attempt passed 1,267 tests but logged 51 prohibited-path operations blocked before filesystem access. Investigation found the external-OCR safety helper resolves its configured private root even for synthetic source inputs. Final bootstrap redirects `engine_v2.paths.PRIVATE_DIR` to an external temporary synthetic root before consumers import it, in addition to redirecting synthetic font defaults. Existing test monkeypatches still override that root and all safety assertions remain. The final engine run passed 1,267 tests with no prohibited-path attempts. First-attempt logs are retained locally, not used as the authoritative baseline. No actual private files were accessed.

The initial backend suite stalled after 3 tests while entering TestClient, and was interrupted rather than counted as a completed baseline. A focused run of `test_actual_synthetic_image_upload_fails_with_certain_codes[date-MISSING_ADDRESS_DATES]` under the sandbox timed out after 35 seconds; the stack showed Starlette TestClient waiting on AnyIO's async portal. The unchanged test outside the sandbox passed in 2.25 seconds. Therefore final backend/scenario measurements use the same WSL2 .venv outside the restrictive sandbox. No dependency downgrade, test expectation edit, source patch, or synthetic-data exception was used.

Both font and private-root rebindings are operational test configuration only, and are inherited by subprocesses using sitecustomize. Final bootstrap and runner are saved beside this note. Logs and generated data stay in the external temporary directory. The path guard rejects Python open/stat/list/write operations against the prohibited tree and records only the current test name, not data filenames.

## Engine difference against supplied macOS reference

Final WSL2 engine result: 1,267 passed, 0 failed, 0 skipped, 2 warnings. macOS reference: 1,264 passed, 3 skipped. The following font-dependent tests all passed using pinned synthetic fonts in the temporary directory:

- test_own_insurance_stamp_and_right_cell[False]
- test_own_insurance_stamp_and_right_cell[True]
- test_own_four_myeongjo_conditions_recover_all_fields

Their source explicitly skips when the synthetic font is unavailable. This explains how three additional tests can run without code changes; matching these to the exact macOS skips is an inference because that run's skipped test names/reasons were not provided. Do not attribute the three skips to Apple Vision solely from the counts. WSL2 observed Apple Vision missing-package skips: 0. Private-data absence skips/failures: 0.
