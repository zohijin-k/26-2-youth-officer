# Pre-measurement environment check

2026-11-13. Stage 0 approved; stage 1 is planning only.

| Item | Observed result |
| --- | --- |
| Environment | WSL2 (Ubuntu 24.04.5 LTS), x86_64; kernel 6.18.58.1-microsoft-standard-WSL2 |
| Checkout | /home/ijin/26-2-youth-applicant on ext4; WSL filesystem, not /mnt/c |
| HEAD | e449c550bdc9cc43b6793ca6636658c1f9f75cdd |
| Local origin/main | same full SHA; HEAD...origin/main ahead 0 / behind 0 |
| Tracked working tree | clean; git diff --quiet origin/main and HEAD exit 0 |
| Untracked files | task-owned Trellis planning directories (parent, two children) and codex workspace initialized in prior turn; full git status is therefore not strictly clean |
| core.autocrlf | input, from global Git configuration |
| Tracked working-tree EOL | CRLF 0; mixed 0, from git ls-files --eol |
| Python | 3.12.3 (/usr/bin/python3) |
| Node / npm | v22.23.4 / 10.9.9, nvm Linux executables |

No source changes or baseline tests at this point. Known untracked planning artifacts do not affect the measured application source and will not be committed before user review. Remote live parity is checked separately from the local tracking reference.

Live GitHub verification: `git ls-remote origin refs/heads/main` returned e449c550bdc9cc43b6793ca6636658c1f9f75cdd, matching HEAD and local origin/main. Initial sandbox DNS failures were resolved by an approved network-enabled rerun; no fetch/pull or source mutation was needed.

Dependency installation completed from both unmodified requirements files plus pytest. `ocrmac` was excluded by its darwin platform marker. Apple Vision/pyobjc are not installed. npm ci completed from the unchanged lockfile; npm reported 3 high-severity audit entries. No dependency updates or audit fixes were applied.

Own detector (4,819,576 bytes), recognizer (13,488,748 bytes) and dictionary (47,451 bytes) passed all pinned SHA-256 checks; an explicit verify_models() call also passed. Synthetic fonts and OFL licenses were fetched only to an external temporary directory and passed all pinned hashes. The checked-in engine/test source is unchanged.
