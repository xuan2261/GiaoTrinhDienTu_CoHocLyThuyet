"""Generate the Phase 12 acceptance evidence bundle from current registries."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
try:
    from tools.validate_release_candidate import validate as validate_candidate
except ModuleNotFoundError:
    from validate_release_candidate import validate as validate_candidate
try:
    from tools.traceability_maps import validate_evidence
except ModuleNotFoundError:
    from traceability_maps import validate_evidence

ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / "plans" / "260820-0924-deep-tdd-remediation-for-electronic-textbook-release-readiness"
EVIDENCE_DIR = PLAN / "evidence"
REPORTS_DIR = PLAN / "reports"


def read_json(relative: str):
    return json.loads((ROOT / relative).read_text(encoding="utf-8-sig"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + "\n", encoding="utf-8", newline="\n")


def evidence_rows() -> tuple[list[dict], dict[str, dict]]:
    registry = read_json("data/evidence-registry.json")
    validate_evidence(ROOT, registry)
    rows = registry["records"]
    return rows, {row["gateId"]: row for row in rows}


def write_rtm(records: dict[str, dict]) -> None:
    requirements = read_json("data/requirement-traceability.json")["requirements"]
    path = EVIDENCE_DIR / "requirement-traceability-matrix.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = ["requirementId", "title", "ownerRole", "sourceRef", "status", "authorityStatus", "reviewRole", "learningOutcomeIds", "evidenceIds", "commands", "artifacts", "hashes", "evidenceStatuses"]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        for requirement in requirements:
            linked = [records[evidence_id] for evidence_id in requirement["evidenceIds"] if evidence_id in records]
            writer.writerow({
                "requirementId": requirement["id"], "title": requirement["title"], "ownerRole": requirement["ownerRole"],
                "sourceRef": requirement["sourceRef"], "status": requirement["status"], "authorityStatus": requirement["authorityStatus"],
                "reviewRole": requirement["reviewRole"], "learningOutcomeIds": ";".join(requirement["learningOutcomeIds"]),
                "evidenceIds": ";".join(requirement["evidenceIds"]), "commands": ";".join(item["command"] for item in linked),
                "artifacts": ";".join(item["artifact"] for item in linked), "hashes": ";".join(item["hash"] for item in linked),
                "evidenceStatuses": ";".join(item["status"] for item in linked),
            })


def write_command_log(rows: list[dict]) -> None:
    lines = ["Phase 12 QA command log", ""]
    for row in rows:
        lines.extend([
            f"[{row['gateId']}] status={row['status']} observedAt={row['observedAt']}",
            f"command={row['command']}", f"artifact={row['artifact']}", f"hash={row['hash']}",
            f"containsPII={str(row['containsPII']).lower()} redactionStatus={row['redactionStatus']} storageLocation={row['storageLocation']}",
            f"accessOwner={row['accessOwner']} retentionPolicy={row['retentionPolicy']}", "",
        ])
    write_text(EVIDENCE_DIR / "qa-command-log.txt", "\n".join(lines))


def write_manual_reports(records: dict[str, dict]) -> None:
    automated = records.get("phase-08-accessibility", {})
    smoke_status = records.get("release-independent-smoke", {}).get("status", "not-run")
    complete = smoke_status == "pass"
    box = "x" if complete else " "
    write_text(EVIDENCE_DIR / "manual-smoke-checklist.md", f"""# Manual smoke checklist

Status: **{'complete' if complete else 'pending independent manual execution'}**. Automated browser evidence is not substituted for this checklist.

- [{box}] Open the release through `file://`; navigate, search, restore quiz attempt, run representative Sim2, force Sim3 fallback, open PDF, and inspect media fallbacks.
- [{box}] Repeat launch/navigation/search/PDF through HTTP with external network disabled.
- [{box}] Confirm removed routes/assets remain unavailable.
- [{box}] Record reviewer role/unit, browser/OS, release version/hash, findings, and disposition.

Independent smoke gate: `{smoke_status}`. Related automated accessibility gate: `{automated.get('status', 'not-run')}` (`{automated.get('artifact', 'none')}`).
""")
    academic = records.get("academic-review-currentness", {}).get("status", "not-run")
    accessibility = records.get("accessibility-independent-review", {}).get("status", "not-run")
    ledger_count = len(read_json("data/academic_review_ledger.json").get("records", []))
    accepted_count = sum(item.get("decision") == "accept" for item in read_json("data/academic_signoffs.json").get("records", []))
    review_complete = academic == accessibility == "pass"
    write_text(EVIDENCE_DIR / "independent-review.md", f"""# Independent review

Status: **{'complete' if review_complete else 'blocked pending external review'}**.

- Academic acceptance gate: `{academic}`; accepted signoff records: {accepted_count}/{ledger_count}.
- Accessibility independent review gate: `{accessibility}`.
- {'Required independent review gates passed.' if review_complete else 'No institutional acceptance or formal signature is asserted while a required review gate is incomplete.'}
""")
    word = records.get("word-standalone-roundtrip", {})
    word_status = word.get("status", "not-run")
    word_data_path = ROOT / "tmp" / "word-acceptance" / "word-roundtrip-evidence.json"
    details = read_json("tmp/word-acceptance/word-roundtrip-evidence.json") if word_data_path.is_file() else {}
    environment = details.get("environment", {})
    disposition = "The recorded Word round-trip passed." if word_status == "pass" else "Release acceptance remains blocked until copy/update/save/reopen/render completes on the submission environment."
    write_text(EVIDENCE_DIR / "word-docx-gate.md", f"""# Word/DOCX gate

- Status: `{word_status}`
- Observed: `{word.get('observedAt', 'not-run')}`
- Word version/build: `{environment.get('wordVersion', 'unknown')}` / `{environment.get('wordBuild', 'unknown')}`
- Windows: `{environment.get('windows', 'unknown')}`
- Source SHA-256: `{details.get('source', {}).get('sha256', 'unknown')}`
- Error: `{details.get('error', 'none recorded')}`
- Command evidence: `{word.get('artifact', 'none')}` (`{word.get('hash', 'not-applicable')}`)

The source DOCX was not overwritten. {disposition}
""")


def write_release_inventory(summary_path: Path | None) -> dict:
    inventory = {"schemaVersion": 1, "status": "not-built", "summary": None, "verified": False, "derivatives": []}
    if summary_path and summary_path.is_file():
        try:
            inventory = validate_candidate(expected_summary=summary_path)
        except (OSError, ValueError, json.JSONDecodeError) as error:
            inventory = {"schemaVersion": 1, "status": "invalid", "summary": None, "verified": False, "derivatives": [], "error": str(error)}
    (EVIDENCE_DIR / "release-artifact-inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    return inventory


def write_report(generated_at: str, rows: list[dict], inventory: dict) -> None:
    counts = {status: sum(row["status"] == status for row in rows) for status in ("pass", "fail", "blocked", "not-run")}
    if counts["fail"] or inventory["status"] == "invalid":
        overall = "fail"
    elif counts["pass"] == len(rows) and inventory["status"] == "verified":
        overall = "pass"
    else:
        overall = "blocked"
    by_id = {row["gateId"]: row for row in rows}
    table = ["| Gate | Status | Evidence |", "| --- | --- | --- |"] + [f"| `{row['gateId']}` | `{row['status']}` | `{row['artifact']}` |" for row in rows]
    release = inventory.get("summary", {}).get("package", {}) if inventory.get("summary") else {}
    derivatives = "\n".join(f"- `{item['path']}` — `{item['sha256']}`" for item in inventory.get("derivatives", [])) or "- No derivative package built."
    incomplete = [row["gateId"] for row in rows if row["status"] != "pass"]
    if inventory["status"] != "verified":
        incomplete.append(f"release inventory: {inventory['status']}")
    decision = "All required gates and the policy-validated candidate passed." if overall == "pass" else f"Final acceptance remains {overall}; incomplete gates: {', '.join(incomplete) or 'none'}."
    write_text(REPORTS_DIR / "phase-12-acceptance-report.md", f"""# Phase 12 standalone acceptance report

Generated: `{generated_at}`  
Overall: **{overall}**  
Gate totals: {counts['pass']} pass, {counts['fail']} fail, {counts['blocked']} blocked, {counts['not-run']} not run.

Release artifact: `{release.get('path', 'not built')}`  
Release SHA-256: `{release.get('sha256', 'not available')}`

Derivative artifacts:
{derivatives}

Technical browser smoke: `evidence/technical-smoke.md` (`file://` and HTTP exercised).

{chr(10).join(table)}

## Decision and limitations

{decision} QTI 3/Common Cartridge adapter validation is derivative evidence only; `data/lms-targets.json` records no executed LMS import. No unsupported WCAG AA, academic correctness, institutional acceptance, legal approval, or LMS-conformance claim is made.
""")
    limitations = ["# Review status and claim limitations", ""]
    gate_limits = [
        ("academic-review-currentness", "Academic acceptance remains incomplete."),
        ("accessibility-independent-review", "Accessibility independent review remains incomplete."),
        ("word-standalone-roundtrip", "Word/DOCX round-trip remains incomplete."),
        ("release-independent-smoke", "Independent standalone smoke remains incomplete."),
        ("release-candidate-inventory", "Frozen release candidate validation remains incomplete."),
    ]
    limitations.extend(f"- {text} Status: `{by_id.get(gate_id, {}).get('status', 'not-run')}`." for gate_id, text in gate_limits if by_id.get(gate_id, {}).get("status") != "pass")
    limitations.extend([
        "- LMS: QTI 3 and Common Cartridge adapters validated locally; no target LMS import executed; xAPI/cmi5 and SCORM not executed.",
        "- Allowed claim: technical gates passed only where the current evidence record says `pass`.",
        "- Prohibited claims remain any claim not authorized by the applicable current review/evidence gate.",
    ])
    write_text(EVIDENCE_DIR / "review-status-and-limitations.md", "\n".join(limitations))


def write_checksums() -> None:
    target = EVIDENCE_DIR / "checksums" / "SHA256SUMS"
    files = sorted(path for path in list(EVIDENCE_DIR.rglob("*")) + list(REPORTS_DIR.rglob("*")) if path.is_file() and path != target)
    write_text(target, "\n".join(f"{sha256(path)} *{path.relative_to(PLAN).as_posix()}" for path in files))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release-summary", default=read_json("data/release-candidate.json")["summaryPath"])
    parser.add_argument("--generated-at", default=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
    args = parser.parse_args()
    rows, records = evidence_rows()
    write_rtm(records)
    write_command_log(rows)
    write_manual_reports(records)
    summary = (ROOT / args.release_summary).resolve() if args.release_summary else None
    inventory = write_release_inventory(summary)
    write_report(args.generated_at, rows, inventory)
    write_checksums()
    print(f"acceptance bundle: {sum(row['status'] == 'pass' for row in rows)}/{len(rows)} gates passed; release={inventory['status']}")


if __name__ == "__main__":
    main()
