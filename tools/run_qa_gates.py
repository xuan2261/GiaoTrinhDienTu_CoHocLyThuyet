"""Run canonical QA gates and persist definition- and repository-bound evidence."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import time
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "data" / "qa-gates.json"
REGISTRY = ROOT / "data" / "evidence-registry.json"
EVIDENCE_DIR = ROOT / "plans" / "260820-0924-deep-tdd-remediation-for-electronic-textbook-release-readiness" / "evidence" / "command-captures"
ALLOWED_FAILURE_STATUSES = {"fail", "blocked"}
REPOSITORY_ROOTS = ["README.md", "package.json", ".nojekyll", "index.html", "assets", "chapters", "css", "data", "docs", "gif-conversion-workspace", "images", "js", "lib", "media", "prototypes", "scripts", "tests", "tools"]
REPOSITORY_EXCLUSIONS = {"data/evidence-registry.json", "data/acceptance-report.json"}


def logical(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def command_text(command: list[str]) -> str:
    return subprocess.list2cmdline(command).replace("\\", "/")


def repository_hash() -> str:
    records = []
    for entry in REPOSITORY_ROOTS:
        root = ROOT / entry
        paths = [root] if root.is_file() else sorted(path for path in root.rglob("*") if path.is_file())
        for path in paths:
            relative = logical(path)
            if relative in REPOSITORY_EXCLUSIONS or "__pycache__" in path.parts or path.suffix == ".pyc":
                continue
            records.append((relative, file_hash(path)))
    payload = json.dumps(records, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def gate_definition_hash(gate: dict) -> str:
    payload = json.dumps(gate, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def redact(text: str) -> tuple[str, bool]:
    result = text.replace(str(ROOT), "<repo>").replace(str(ROOT).replace("\\", "/"), "<repo>")
    result = re.sub(r"(?i)C:[\\/]Users[\\/][^\\/\s]+", r"C:\\Users\\<redacted>", result)
    result = re.sub(r"(?i)(authorization:\s*bearer\s+)\S+", r"\1<redacted>", result)
    result = re.sub(r"(?i)((?:api[_-]?key|token)\s*[=:]\s*)\S+", r"\1<redacted>", result)
    result = re.sub(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", "<redacted-email>", result)
    result = re.sub(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "<redacted-ip>", result)
    return result, result != text


def load_config() -> list[dict]:
    data = json.loads(CONFIG.read_text(encoding="utf-8"))
    if data.get("schemaVersion") != 1 or not isinstance(data.get("gates"), list):
        raise ValueError("invalid QA gate configuration")
    seen: set[str] = set()
    for gate in data["gates"]:
        gate_id = gate.get("gateId")
        if not isinstance(gate_id, str) or not gate_id or gate_id in seen:
            raise ValueError("invalid or duplicate QA gate ID")
        seen.add(gate_id)
        if gate.get("failureStatus", "fail") not in ALLOWED_FAILURE_STATUSES or gate.get("evidenceClass") not in {"public", "restricted"}:
            raise ValueError(f"invalid gate policy: {gate_id}")
        if not gate.get("command") or not gate.get("inputs"):
            raise ValueError(f"incomplete QA gate: {gate_id}")
        for value in gate["inputs"]:
            candidate = (ROOT / value).resolve()
            if ROOT not in candidate.parents or not candidate.is_file():
                raise ValueError(f"unresolved QA gate input: {gate_id}: {value}")
    return data["gates"]


def capture_record(gate: dict, observed_at: str, repo_hash: str, status: str, exit_code: str | int | None, stdout: str, stderr: str) -> dict:
    gate_id = gate["gateId"]
    display_command = [str(part).replace("{observedAt}", observed_at) for part in gate["command"]]
    definition_hash = gate_definition_hash(gate)
    input_hashes = [(value, file_hash(ROOT / value)) for value in gate["inputs"]]
    stdout, stdout_redacted = redact(stdout)
    stderr, stderr_redacted = redact(stderr)
    redacted = stdout_redacted or stderr_redacted
    artifact = EVIDENCE_DIR / f"{gate_id}.log"
    artifact.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        f"gateId: {gate_id}", f"gateDefinitionHash: sha256:{definition_hash}", f"repositoryHash: sha256:{repo_hash}",
        f"observedAt: {observed_at}", f"command: {command_text(display_command)}", f"status: {status}", f"exitCode: {exit_code}",
        "", "--- inputs ---", *[f"sha256:{digest} {value}" for value, digest in input_hashes],
        "", "--- stdout ---", stdout.rstrip(), "", "--- stderr ---", stderr.rstrip(), "",
    ]
    artifact.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    restricted = gate["evidenceClass"] == "restricted"
    return {
        "gateId": gate_id, "gateDefinitionHash": f"sha256:{definition_hash}", "repositoryHash": f"sha256:{repo_hash}",
        "owner": gate["owner"], "command": command_text(display_command), "inputs": gate["inputs"], "expected": gate["expected"],
        "artifact": logical(artifact), "hash": f"sha256:{file_hash(artifact)}", "status": status, "observedAt": observed_at,
        "containsPII": False, "redactionStatus": "redacted" if redacted else "not-required", "storageLocation": logical(artifact),
        "accessOwner": gate["owner"], "retentionPolicy": "restricted-acceptance-evidence" if restricted else "retain-with-release-evidence",
    }


def run_gate(gate: dict, observed_at: str, repo_hash: str) -> dict:
    display_command = [str(part).replace("{observedAt}", observed_at) for part in gate["command"]]
    command = display_command.copy()
    command[0] = shutil.which(command[0]) or command[0]
    environment = os.environ.copy()
    environment["CI"] = "1"
    try:
        result = subprocess.run(command, cwd=ROOT, env=environment, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=int(gate.get("timeoutSeconds", 600)), check=False)
        exit_code: str | int | None = result.returncode
        stdout, stderr = result.stdout, result.stderr
    except subprocess.TimeoutExpired as error:
        exit_code = "timeout"
        stdout = error.stdout.decode("utf-8", "replace") if isinstance(error.stdout, bytes) else (error.stdout or "")
        stderr = error.stderr.decode("utf-8", "replace") if isinstance(error.stderr, bytes) else (error.stderr or "")
    status = "pass" if exit_code == 0 else gate.get("failureStatus", "fail")
    record = capture_record(gate, observed_at, repo_hash, status, exit_code, stdout, stderr)
    print(f"{gate['gateId']}: {status}")
    return record


def normalize_registry(registry: dict, gates: list[dict], observed_at: str, repo_hash: str) -> dict:
    existing = {record.get("gateId"): record for record in registry.get("records", [])}
    normalized = []
    for gate in gates:
        record = existing.get(gate["gateId"], {})
        artifact = ROOT / record.get("artifact", "missing")
        current = record.get("gateDefinitionHash") == f"sha256:{gate_definition_hash(gate)}" and record.get("repositoryHash") == f"sha256:{repo_hash}" and artifact.is_file()
        if current:
            normalized.append(record)
        else:
            normalized.append(capture_record(gate, observed_at, repo_hash, "not-run", "not-run", "", "Gate definition or repository state changed; rerun required."))
    registry["records"] = normalized
    return registry

def write_registry(registry: dict) -> None:
    payload = json.dumps(registry, ensure_ascii=False, indent=2) + "\n"
    temporary = REGISTRY.with_name(f".{REGISTRY.name}.{os.getpid()}.tmp")
    last_error = None
    for attempt in range(10):
        try:
            temporary.write_text(payload, encoding="utf-8", newline="\n")
            os.replace(temporary, REGISTRY)
            return
        except OSError as error:
            last_error = error
            if temporary.exists():
                temporary.unlink()
            if attempt < 9:
                time.sleep(0.2 * (attempt + 1))
    raise last_error


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("gate_ids", nargs="*", help="Gate IDs to execute; omit with --all")
    parser.add_argument("--all", action="store_true", help="Execute every configured gate")
    parser.add_argument("--observed-at", help="UTC timestamp used by every generated record")
    args = parser.parse_args()
    gates = load_config()
    selected_ids = {gate["gateId"] for gate in gates} if args.all else set(args.gate_ids)
    if not selected_ids:
        parser.error("provide gate IDs or --all")
    unknown = sorted(selected_ids - {gate["gateId"] for gate in gates})
    if unknown:
        parser.error(f"unknown gate IDs: {', '.join(unknown)}")
    observed_at = args.observed_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    repo_hash = repository_hash()
    registry = normalize_registry(json.loads(REGISTRY.read_text(encoding="utf-8")), gates, observed_at, repo_hash)
    write_registry(registry)
    generated = []
    for gate in gates:
        if gate["gateId"] not in selected_ids:
            continue
        record = run_gate(gate, observed_at, repo_hash)
        generated.append(record)
        registry["records"] = [record if existing["gateId"] == record["gateId"] else existing for existing in registry["records"]]
        write_registry(registry)
    return 0 if all(record["status"] == "pass" for record in generated) else 1


if __name__ == "__main__":
    sys.exit(main())
