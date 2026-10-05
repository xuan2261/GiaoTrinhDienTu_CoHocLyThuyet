#!/usr/bin/env python3
"""Refresh byte-currentness only; invalidate acceptance and preserve prior records.

Run after source, quiz, bundle, search and content-manifest rebuilds. This does
not execute runtime tests, create approvals or refresh captured QA test logs.
"""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from academic_review_contracts import build_inventory, confined, ledger_record
from traceability_contracts import question_hash

BLOCKER = "Current-source revalidation is pending; historical runtime evidence does not verify changed source."
CURRENT_RECEIPT = "data/simulation-current-revalidation.json"


def read(root, relative):
    return json.loads(confined(root, relative).read_text(encoding="utf-8"))


def sha(root, relative):
    return hashlib.sha256(confined(root, relative).read_bytes()).hexdigest()


def archive(root, relative):
    source = confined(root, relative)
    digest = sha(root, relative)
    relative_archive = f"data/review-history/{digest}-{source.name}"
    target = confined(root, relative_archive)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and target.read_bytes() != source.read_bytes():
        raise ValueError(f"historical snapshot collision: {relative_archive}")
    if not target.exists():
        target.write_bytes(source.read_bytes())
    return {"path": relative_archive, "sha256": digest, "scope": "historical record only; not current acceptance"}


def write(root, relative, data):
    confined(root, relative).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def prepare_quiz_map(root):
    document = read(root, "data/quiz-learning-map.json")
    for item in document["items"]:
        bank = read(root, item["sourceFile"])
        question = bank["items"][item["sourceIndex"]]
        if question["id"] != item["id"] or item["learningOutcomeId"] not in question["learningOutcomeIds"]:
            raise ValueError(f"quiz mapping needs authored review, refusing automatic remap: {item['id']}")
        authored = {key: question[key] for key in ("question", "options", "correct", "section", "feedbackCorrect", "feedbackWrong")}
        item["questionHash"] = question_hash(authored)
    return document


def prepare_simulation(root, relative, today):
    document = read(root, relative)
    document["status"] = "draft"
    document["upstreamBlocker"] = BLOCKER
    for entry in document["evidenceCatalog"]:
        entry["sha256"] = sha(root, entry["path"])
    for record in document.get("specifications", document.get("reviews", [])):
        record["status"] = "draft"
        record["evidence"]["verified"] = False
        record["freshness"]["metadataRefreshedOn"] = today
        record["freshness"]["scope"] = "byte-currentness only; runtime and human review pending"
        if "sources" in record:
            for source in record["sources"].values():
                if isinstance(source, dict) and "path" in source and "sha256" in source:
                    source["sha256"] = sha(root, source["path"])
            record["oracle"]["helperHash"] = sha(root, record["oracle"]["helper"])
            record["evidence"]["manualStatus"] = "draft"
            record["evidence"]["manualEvidence"] = {
                "status": "draft", "reviewerRole": "Project technical reviewer",
                "record": "Current-source review has not been performed. Prior review wording is preserved in the document historicalSnapshot.",
            }
        else:
            record["adapter"]["sha256"] = sha(root, record["adapter"]["path"])
            record["evidence"]["status"] = "draft"
            record["reviewer"]["currentReviewPending"] = True
    return document


def refresh(root, include_academic=False):
    root = root.resolve()
    today = datetime.now(timezone.utc).date().isoformat()
    signoffs = read(root, "data/academic_signoffs.json") if include_academic else None
    if include_academic and signoffs.get("records"):
        raise ValueError("independent signoffs exist; reconcile them explicitly instead of resetting the academic ledger")
    # Preflight every input before mutating any metadata.
    quiz = prepare_quiz_map(root)
    names = ("data/simulation-specifications.json", "data/sim3-pedagogical-reviews.json")
    documents = {name: prepare_simulation(root, name, today) for name in names}
    academic = None
    if include_academic:
        academic = read(root, "data/academic_review_ledger.json")
        academic["records"] = [ledger_record(record) for record in build_inventory(root)]
    receipt = {
        "schemaVersion": "1.0.0", "status": "pending", "sourceHash": None,
        "evidenceManifest": None, "review": None,
        "reason": BLOCKER,
        "requiredEvidence": ["fresh objective runtime execution", "WebGL visual and browser interaction capture", "three retry-free release runs", "explicit current-source technical review"],
    }
    if confined(root, CURRENT_RECEIPT).exists():
        old_receipt = read(root, CURRENT_RECEIPT)
        if old_receipt.get("status") == "verified":
            receipt["historicalSnapshot"] = archive(root, CURRENT_RECEIPT)
        elif old_receipt.get("historicalSnapshot"):
            receipt["historicalSnapshot"] = old_receipt["historicalSnapshot"]
    for name, document in documents.items():
        old = read(root, name)
        if not old.get("historicalSnapshot"):
            document["historicalSnapshot"] = archive(root, name)
        else:
            history = old["historicalSnapshot"]
            if sha(root, history["path"]) != history["sha256"]:
                raise ValueError(f"historical snapshot changed: {history['path']}")
            document["historicalSnapshot"] = history
    write(root, "data/quiz-learning-map.json", quiz)
    for name, document in documents.items():
        write(root, name, document)
    write(root, CURRENT_RECEIPT, receipt)
    if academic is not None:
        archive(root, "data/academic_review_ledger.json")
        write(root, "data/academic_review_ledger.json", academic)
    return {"quizItems": len(quiz["items"]), "sim2Draft": len(documents[names[0]]["specifications"]), "sim3Draft": len(documents[names[1]]["reviews"]), "academicPending": len(academic["records"]) if academic else None, "runtimeVerified": False, "independentAcceptance": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path("."))
    parser.add_argument("--write", action="store_true", required=True, help="explicitly refresh metadata and invalidate current runtime verification")
    parser.add_argument("--include-academic", action="store_true", help="rebuild pending academic inventory after the content manifest is rebuilt; refuses nonempty independent signoffs")
    args = parser.parse_args()
    print(json.dumps(refresh(args.root, args.include_academic), indent=2))


if __name__ == "__main__":
    main()
