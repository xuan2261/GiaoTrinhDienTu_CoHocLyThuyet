"""Build a conservative release-acceptance report from current evidence."""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "data" / "evidence-registry.json"
LMS = ROOT / "data" / "lms-targets.json"
QA_GATES = ROOT / "data" / "qa-gates.json"
OUTPUT = ROOT / "data" / "acceptance-report.json"
try:
    from tools.traceability_maps import validate_evidence
except ModuleNotFoundError:
    from traceability_maps import validate_evidence


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def status_of(records: dict[str, dict], gate_id: str) -> str:
    return records.get(gate_id, {}).get("status", "not-run")


def overall_status(statuses: list[str]) -> str:
    if "fail" in statuses:
        return "fail"
    if any(status != "pass" for status in statuses):
        return "blocked"
    return "pass"


def build(generated_at: str) -> dict:
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    lms = json.loads(LMS.read_text(encoding="utf-8"))
    config = json.loads(QA_GATES.read_text(encoding="utf-8"))
    validate_evidence(ROOT, evidence)
    records = {record["gateId"]: record for record in evidence.get("records", [])}
    gates = []
    for configured_gate in sorted(config["gates"], key=lambda gate: gate["gateId"]):
        gate_id = configured_gate["gateId"]
        record = records.get(gate_id)
        if record:
            gates.append({key: record[key] for key in ("gateId", "owner", "status", "artifact", "hash", "observedAt")})
        else:
            gates.append({
                "gateId": gate_id,
                "owner": configured_gate["owner"],
                "status": "not-run",
                "artifact": "docs/qa-gate-matrix.md",
                "hash": "not-applicable",
                "observedAt": generated_at,
            })
    statuses = [gate["status"] for gate in gates]
    summary = {
        "total": len(gates),
        "pass": statuses.count("pass"),
        "fail": statuses.count("fail"),
        "blocked": statuses.count("blocked"),
        "notRun": statuses.count("not-run"),
    }
    overall = overall_status(statuses)
    review_status = status_of(records, "academic-review-currentness")
    word_status = status_of(records, "word-standalone-roundtrip")
    candidate_status = status_of(records, "release-candidate-inventory")
    smoke_status = status_of(records, "release-independent-smoke")
    if overall == "pass":
        decision = "approved"
        rationale = "Every required release gate passed; LMS execution status remains separately scoped and is not implied by adapter validation."
    elif overall == "fail":
        decision = "rejected"
        rationale = "At least one required acceptance gate failed; release approval is prohibited."
    else:
        decision = "blocked"
        rationale = "One or more required gates are blocked or not run; no release or LMS certification is claimed."
    return {
        "schemaVersion": 1,
        "generatedAt": generated_at,
        "overallStatus": overall,
        "gateSummary": summary,
        "gates": gates,
        "lms": {"status": lms["status"], "stages": lms["stages"]},
        "independentReview": {"status": review_status, "gateId": "academic-review-currentness"},
        "wordRoundtrip": {"status": word_status, "gateId": "word-standalone-roundtrip"},
        "releaseCandidate": {"status": candidate_status, "gateId": "release-candidate-inventory"},
        "independentSmoke": {"status": smoke_status, "gateId": "release-independent-smoke"},
        "releaseDecision": {"decision": decision, "rationale": rationale},
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default=str(OUTPUT))
    parser.add_argument("--generated-at", default=utc_now())
    parser.add_argument("--require-pass", action="store_true")
    args = parser.parse_args()
    report = build(args.generated_at)
    output = Path(args.output)
    if not output.is_absolute():
        output = ROOT / output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"acceptance report: {report['overallStatus']} ({report['gateSummary']['pass']}/{report['gateSummary']['total']} passed)")
    return 1 if args.require_pass and report["overallStatus"] != "pass" else 0


if __name__ == "__main__":
    sys.exit(main())
