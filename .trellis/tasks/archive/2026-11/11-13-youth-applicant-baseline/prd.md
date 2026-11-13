# Environment and synthetic validation baseline

## Goal

Establish reproducible machine-specific evidence before applicant-only product changes (parent R0/R4).

## Requirements

- Use the requested repository. If already cloned at the correct origin, record that fact and HEAD instead of cloning into a nested directory.
- Measure on WSL2 (Ubuntu 24.04.5 LTS), as approved. Do not measure native Windows. Record distribution/version, architecture, Python, Node and package versions accurately.
- Create `.venv`; install backend and engine_v2 requirements plus pytest. Do not install Apple Vision on non-macOS.
- Download own models using the requested module command and verify pinned hashes. No downloaded/runtime/private assets may enter commits.
- Execute frontend `npm ci`, `npm run lint`, `npm run build`; separate pytest suites; every scenario module individually.
- Tests use only authored synthetic data. Do not create/access the prohibited engine data tree. Resolve synthetic font defaults operationally before full tests.
- Compare against user reference: macOS engine 1,264 passed/3 skipped; backend 1,227 passed; 18 scenarios 1,885 passed/0 failed. Explain differences with observed evidence.

## Acceptance criteria

- A report records commands, source revision, environment, dependency versions, model hashes and exit codes.
- Engine/backend pass/fail/skip/error counts are separate. All 18 scenario modules have individual rows and counting definitions.
- Missing/failed modules are reported, never omitted or converted to successes; later modules still run.
- No product source, test expectations, private data or engine rules are changed to obtain the baseline.
- UI/docs child cannot run before this report is complete. Environment/package failures are reported as baseline findings and their resolution recorded.
