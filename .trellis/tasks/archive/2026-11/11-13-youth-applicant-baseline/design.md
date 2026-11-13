# Baseline design

The baseline is execution evidence, not a product change. Use one virtualenv and the checked-in npm lockfile for both before/after validation. Save structured summaries in this task's research directory; keep verbose logs, generated fonts and package inventories in OS temp unless a sanitized record is useful for review.

Use separate Python processes for engine pytest, backend pytest, and each scenario. Scenarios share test helpers and mutate module/global environment state, so a single interpreter is inappropriate. Never run scenarios concurrently against shared sample generation. Report total errors/skips and process exit status separately.

Own weights stay in their existing ignored models directory. Synthetic documents use temporary paths or existing ignored demo fixture locations. The synthetic font default must be redirected to OS temp before full test collection; see parent research/baseline-boundaries.md. Do not weaken tests or change engine rules. Runtime path adaptation and all extra downloaded fonts are included in reproducibility evidence.

P14 has an aggregate validation message rather than the ordinary check counter. Label the unit explicitly and keep the module's success/failure and form count visible. Do not invent individual assertion counts to force agreement with the macOS reference.

Keep source revision and installed dependency versions stable for the UI/docs child. If platform/package repair changes the environment, record an attempt and measure a new baseline before product work.
