# Research: officer entry, scope and demonstration data

- Query: smallest officer-only cleanup preserving backend contracts.
- Scope: local static inspection; no installs, tests, DB/document inputs or product edits.
- Date: 2026-11-13.

## Evidence

| File / anchor | Finding |
| --- | --- |
| `demo/frontend/src/App.tsx:15` | Imports ApplyFlow, mounts both trees and renders applicant/officer tabs; replace the shell. |
| `demo/frontend/src/navigation-url.ts:23` | Root and `/apply` default to applicant; normalize routes/history. |
| `demo/frontend/src/pages/officer/OfficerConsole.tsx:31` | Default query has no program; restoration accepts arbitrary program and defaults criteria to savings. All transitions need fixed scope. |
| `demo/frontend/src/pages/officer/ApplicationList.tsx:247` | Product selector includes both products; savings quotas and score cells are present. |
| `demo/frontend/src/pages/officer/ReviewDetail.tsx:29` | Savings ScoreSheet6 imports shared FormSheet; youth originals/forms remain separate preserved functions. |
| `demo/frontend/src/components/CriteriaEditor.tsx:14` | Both DOCS sets, savings fallback, applicantDemo and insurance settings remain. Remove their UI while preserving youth save contract. |
| `demo/frontend/src/api.ts:10` | Runtime form bindings imported solely for applicant fetchFormLayout. Prune caller/dependency together. |
| `demo/frontend/src/api.ts:986` | `!params.program` controls empty-list fallback; fixing program breaks automatic mock unless adapted. |
| `demo/frontend/src/pages/officer/mock-data.ts:392` | Role notes/quota ratios include savings score rules. Retain identities/actions, adapt presentation. |
| `demo/frontend/src/pages/officer/mock-data.ts:1932` | Savings generation precedes 430 youth entries. Existing youth list/detail/decisions need no new DB seed. Removing earlier RNG draws can change mock values/IDs; this is synthetic dataset change. |
| `demo/frontend/src/pages/officer/mock-data.ts:2477` | Global ID detail lookup supports both products; guard direct detail entry. |
| `demo/backend/api/officer.py:494` | Backend supports both products and returns generic role/quota/sort data even in youth scope; frontend adapts display. |
| `demo/backend/tools/seed_application.py:1` | Existing verified-draft stage-two helper cannot create/submit a case. Its original-tab upload direction becomes unusable in officer-only frontend. |
| `demo/backend/tests/run_p5_scenarios.py:645` | Temporary DB/storage cleanup means fixture execution does not leave persistent demo rows. |
| `demo/backend/tests/run_p6_scenarios.py:611` | S10 creates a youth case via APIs. Reusable inputs for a future guarded seed; not a persistent command itself. `--live` resets the demo. |
| `demo/backend/tests/scenario_support.py:44` | Historical-review helper bypasses submit after asserting rejection; retain regression use, do not use as normal demonstration seed. |
| `demo/frontend/index.html:6` | Title still names both products/application flow. |
| `docs/DEVELOPMENT.md:25` | Old repository/branch inventory and test counts; active data-generation commands use prohibited defaults. |
| `demo/README.md:1` | Both frontend flows and original-tab stage-two directions need minimal factual corrections; backend contracts remain. |

## Environment and process

Clean initial `main` HEAD `e449c550bdc9cc43b6793ca6636658c1f9f75cdd`; correct youth-officer origin. Actual Linux/Python 3.12.3/Node 22.23.4/npm 10.9.9. No tracked model/data assets were found by scoped git inventory. Reuse this clone rather than duplicating it.

Trellis developer `codex` initialized through helper, task created in planning. `task.py start` not run. Planning files and developer workspace metadata are the only added files.

## External references

Guide/sibling identities come from the user. Attempted web read of the guide URL returned a cache miss; its contents were not used as evidence. No remote modifications or messages were made.

## Specs and remaining verification

Read frontend/backend indexes, backend seed-application and quality guidelines. Actual runtime/model hashes/test outcomes/browser behavior are unmeasured. See `baseline-audit.md` for full module inventory, asset-path constraints, preserved tests and deletion candidates.
