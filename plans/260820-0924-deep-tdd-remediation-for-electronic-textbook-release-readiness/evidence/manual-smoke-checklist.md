# Manual smoke checklist

Status: **pending independent manual execution**. Automated browser evidence is not substituted for this checklist.

- [ ] Open the release through `file://`; navigate, search, restore quiz attempt, run representative Sim2, force Sim3 fallback, open PDF, and inspect media fallbacks.
- [ ] Repeat launch/navigation/search/PDF through HTTP with external network disabled.
- [ ] Confirm removed routes/assets remain unavailable.
- [ ] Record reviewer role/unit, browser/OS, release version/hash, findings, and disposition.

Independent smoke gate: `blocked`. Related automated accessibility gate: `pass` (`plans/260820-0924-deep-tdd-remediation-for-electronic-textbook-release-readiness/evidence/command-captures/phase-08-accessibility.log`).
