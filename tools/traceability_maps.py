"""Validate quiz, simulation, evidence, and confirmed-claim joins."""
import hashlib
import json
import re
import shlex
from pathlib import Path

try:
    from tools.content_manifest_utils import parse_sim2_route_ids, read_text, repo_path
    from tools.traceability_contracts import HASH, exact, fail, load, question_hash, root_shape, unique
    from tools.run_qa_gates import command_text, gate_definition_hash, repository_hash
except ModuleNotFoundError:
    from content_manifest_utils import parse_sim2_route_ids, read_text, repo_path
    from traceability_contracts import HASH, exact, fail, load, question_hash, root_shape, unique
    from run_qa_gates import command_text, gate_definition_hash, repository_hash

EVIDENCE_STATUSES = {"not-run", "pass", "fail", "blocked"}

def validate_evidence_command(root, command):
    try:
        parts = shlex.split(command, posix=True)
    except ValueError:
        fail("evidence record: unsupported command")
    if len(parts) < 2 or any(part in {"&&", "||", "|", ">", ">>"} for part in parts):
        fail("evidence record: unsupported command")
    executable = parts[0].lower()
    command_path = None
    if executable in {"python", "node"}:
        command_path = parts[1]
        allowed_root = ("tools/", "scripts/") if executable == "python" else ("tests/", "tools/")
        if not command_path.startswith(allowed_root):
            fail("evidence record: unsupported command")
    elif executable in {"npm", "npm.cmd"}:
        if len(parts) != 3 or parts[1] != "run":
            fail("evidence record: unsupported command")
        package = json.loads((root / "package.json").read_text(encoding="utf-8"))
        if parts[2] not in package.get("scripts", {}):
            fail("evidence record: unresolved command")
        return
    elif executable in {"powershell", "powershell.exe"}:
        lowered = [part.lower() for part in parts]
        if "-file" not in lowered:
            fail("evidence record: unsupported command")
        index = lowered.index("-file") + 1
        if index >= len(parts) or not parts[index].startswith("tools/"):
            fail("evidence record: unsupported command")
        command_path = parts[index]
    else:
        fail("evidence record: unsupported command")
    if not Path(repo_path(str(root), command_path)).is_file():
        fail("evidence record: unresolved command")



def validate_quizzes(root, data, lo_ids, routes):
    root_shape(data, "items", "quiz map")
    items = data["items"]
    unique(items, "id", "quiz map")
    seen_sources = set()
    keys = ["id", "sourceFile", "sourceIndex", "questionHash", "learningOutcomeId", "contentIds"]
    for item in items:
        exact(item, keys, "quiz item")
        if not isinstance(item["sourceFile"], str) or not item["sourceFile"].startswith("data/quiz-ch"):
            fail("quiz item: invalid source file")
        if not isinstance(item["sourceIndex"], int) or item["sourceIndex"] < 0:
            fail("quiz item: invalid source index")
        if not isinstance(item["questionHash"], str) or not HASH.fullmatch(item["questionHash"]):
            fail("quiz item: invalid question hash")
        if item["learningOutcomeId"] not in lo_ids:
            fail("quiz item: dangling learning outcome")
        if not isinstance(item["contentIds"], list) or not item["contentIds"] or not set(item["contentIds"]).issubset(routes):
            fail("quiz item: dangling content")
        source_key = (item["sourceFile"], item["sourceIndex"])
        if source_key in seen_sources:
            fail("quiz item: duplicate source index")
        seen_sources.add(source_key)
        try:
            bank = json.loads((root / item["sourceFile"]).read_text(encoding="utf-8"))
            questions = bank["items"] if isinstance(bank, dict) and bank.get("schemaVersion") == 2 else bank
            question = questions[item["sourceIndex"]]
            authored = {key: question[key] for key in ("question", "options", "correct", "section", "feedbackCorrect", "feedbackWrong")}
        except (OSError, ValueError, IndexError, KeyError, TypeError) as error:
            fail(f"quiz item: unresolved source question: {error}")
        if question.get("id") != item["id"] or item["learningOutcomeId"] not in question.get("learningOutcomeIds", []):
            fail("quiz item: stale ID or learning outcome mapping")
        if question_hash(authored) != item["questionHash"]:
            fail("quiz item: stale question hash")
    expected = set()
    for chapter in range(1, 4):
        bank = load(root, f"quiz-ch{chapter}.json")
        if not isinstance(bank, dict) or bank.get("schemaVersion") != 2 or not isinstance(bank.get("items"), list):
            fail(f"quiz coverage: ch{chapter} must use schema v2")
        questions = bank["items"]
        if len(questions) != 100:
            fail(f"quiz coverage: expected 100 questions for ch{chapter}, got {len(questions)}")
        expected.update((f"data/quiz-ch{chapter}.json", index) for index, _ in enumerate(questions))
    if seen_sources != expected:
        fail("quiz coverage: legacy no-ID sidecar or missing question")
    return items


def validate_simulations(root, data, lo_ids, routes):
    root_shape(data, "mappings", "simulation map")
    mappings = data["mappings"]
    sim_ids = unique(mappings, "simulationId", "simulation map")
    canonical = set(parse_sim2_route_ids(read_text(root / "js/sim2/sim2-route-manifest.js")))
    if len(canonical) != 25 or sim_ids != canonical:
        fail(f"Sim2 parity: expected 25 canonical routes, got {len(sim_ids)}")
    for item in mappings:
        exact(item, ["simulationId", "learningOutcomeId", "contentIds"], "simulation mapping")
        if item["learningOutcomeId"] not in lo_ids:
            fail("simulation mapping: dangling learning outcome")
        if not isinstance(item["contentIds"], list) or not item["contentIds"] or not set(item["contentIds"]).issubset(routes):
            fail("simulation mapping: dangling content")
    return mappings


def validate_evidence(root, data, enforce_repository_hash=True):
    root_shape(data, "records", "evidence registry")
    records = data["records"]
    ids = unique(records, "gateId", "evidence registry")
    keys = ["gateId", "gateDefinitionHash", "repositoryHash", "owner", "command", "inputs", "expected", "artifact", "hash", "status", "observedAt", "containsPII", "redactionStatus", "storageLocation", "accessOwner", "retentionPolicy"]
    config = json.loads((root / "data" / "qa-gates.json").read_text(encoding="utf-8"))
    configured = {gate["gateId"]: gate for gate in config["gates"]}
    canonical_root = Path(__file__).resolve().parents[1]
    current_repository_hash = f"sha256:{repository_hash()}" if enforce_repository_hash and root == canonical_root else None
    for item in records:
        exact(item, keys, "evidence record")
        gate = configured.get(item["gateId"])
        if gate is None:
            fail("evidence record: unknown gate")
        if item["status"] not in EVIDENCE_STATUSES or not isinstance(item["inputs"], list) or not item["inputs"]:
            fail("evidence record: invalid status or inputs")
        validate_evidence_command(root, item["command"])
        artifact_path = Path(repo_path(str(root), item["artifact"]))
        input_paths = [Path(repo_path(str(root), path)) for path in item["inputs"]]
        expected_command = command_text([str(part).replace("{observedAt}", item["observedAt"]) for part in gate["command"]])
        expected_definition = f"sha256:{gate_definition_hash(gate)}"
        if item["owner"] != gate["owner"] or item["command"] != expected_command or item["inputs"] != gate["inputs"] or item["expected"] != gate["expected"]:
            fail("evidence record: gate definition mismatch")
        if item["gateDefinitionHash"] != expected_definition or (current_repository_hash and item["repositoryHash"] != current_repository_hash):
            fail("evidence record: stale gate or repository hash")
        if not all(re.fullmatch(r"sha256:[a-f0-9]{64}", item[key]) for key in ("gateDefinitionHash", "repositoryHash")):
            fail("evidence record: invalid binding hash")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", item["observedAt"]):
            fail("evidence record: invalid observed timestamp")
        if not re.fullmatch(r"sha256:[a-f0-9]{64}", item["hash"]):
            fail("evidence record: invalid artifact hash")
        if not isinstance(item["containsPII"], bool) or item["redactionStatus"] not in {"not-required", "redacted", "pending-redaction"}:
            fail("evidence record: invalid privacy classification")
        if item["containsPII"] or item["redactionStatus"] == "pending-redaction":
            fail("evidence record: unredacted private evidence")
        if item["storageLocation"] != item["artifact"] or not all(isinstance(item[key], str) and item[key] for key in ("accessOwner", "retentionPolicy")):
            fail("evidence record: invalid storage or retention classification")
        if not artifact_path.is_file() or any(not path.is_file() for path in input_paths):
            fail("evidence record: unresolved input or artifact")
        actual = hashlib.sha256(artifact_path.read_bytes()).hexdigest()
        if item["hash"] != f"sha256:{actual}":
            fail("evidence record: artifact hash mismatch")
        capture = artifact_path.read_text(encoding="utf-8")
        headers = [f"gateId: {item['gateId']}", f"gateDefinitionHash: {item['gateDefinitionHash']}", f"repositoryHash: {item['repositoryHash']}", f"observedAt: {item['observedAt']}", f"command: {item['command']}", f"status: {item['status']}"]
        if not all(header in capture.splitlines()[:7] for header in headers):
            fail("evidence record: capture envelope mismatch")
        if item["status"] == "pass" and "exitCode: 0" not in capture.splitlines()[:7]:
            fail("evidence record: passed capture lacks successful exit")
        expected_inputs = [f"sha256:{hashlib.sha256(path.read_bytes()).hexdigest()} {logical}" for logical, path in zip(item["inputs"], input_paths)]
        input_section = capture.split("--- inputs ---\n", 1)[1].split("\n\n--- stdout ---", 1)[0].splitlines()
        if input_section != expected_inputs:
            fail("evidence record: stale or mismatched input hash set")
    return ids, {item["gateId"]: item for item in records}


def strict_claims(requirements, legal, los, content, quizzes, simulations, evidence):
    assessments = {item["learningOutcomeId"] for item in quizzes + simulations}
    mapped_content = set(content.values())
    for lo in los.values():
        if lo["status"] != "confirmed":
            continue
        if lo["authorityStatus"] != "confirmed":
            fail("confirmed learning outcome: authority status is not confirmed")
        if lo["id"] not in mapped_content:
            fail("confirmed learning outcome: missing content")
        if lo["id"] not in assessments and not lo["assessmentException"]:
            fail("confirmed learning outcome: missing assessment or recorded exception")
    for requirement in requirements:
        if requirement["status"] != "confirmed":
            continue
        if requirement["authorityStatus"] != "confirmed":
            fail("confirmed requirement: authority status is not confirmed")
        if requirement["sourceType"] == "regulation-derived":
            legal_row = legal.get(requirement["legalStandardId"])
            if not legal_row or legal_row["reviewStatus"] != "confirmed":
                fail("confirmed requirement: official reviewed legal row required")
        if any(lo_id not in los or los[lo_id]["status"] != "confirmed" for lo_id in requirement["learningOutcomeIds"]):
            fail("confirmed requirement: missing confirmed learning outcome")
        if not any(item["learningOutcomeId"] in requirement["learningOutcomeIds"] for item in quizzes + simulations):
            fail("confirmed requirement: missing assessment join")
        if any(evidence.get(eid, {}).get("status") != "pass" for eid in requirement["evidenceIds"]):
            fail("confirmed requirement: accepted evidence required")
