#!/usr/bin/env python3
"""Validate curated requirement-to-learning evidence joins."""
import argparse
import sys
from pathlib import Path

from traceability_contracts import (
    STATUSES, content_routes, exact, fail, load, root_shape, unique,
    validate_content, validate_legal, validate_los,
)
from traceability_maps import (
    strict_claims, validate_evidence, validate_quizzes, validate_simulations,
)


def validate_requirements(data, legal_ids, lo_ids, evidence_ids):
    root_shape(data, "requirements", "requirements")
    requirements = data["requirements"]
    unique(requirements, "id", "requirements")
    keys = [
        "id", "title", "status", "authorityStatus", "sourceType", "sourceRef",
        "legalStandardId", "ownerRole", "reviewRole", "learningOutcomeIds", "evidenceIds",
    ]
    for item in requirements:
        exact(item, keys, "requirement", optional=("approvalRef",))
        if item["status"] not in STATUSES or item["authorityStatus"] not in STATUSES:
            fail("requirement: invalid status or source type")
        if item["sourceType"] not in {"project-derived", "regulation-derived"}:
            fail("requirement: invalid status or source type")
        if not isinstance(item["learningOutcomeIds"], list) or not item["learningOutcomeIds"]:
            fail("requirement: missing learning outcome or evidence join")
        if not isinstance(item["evidenceIds"], list) or not item["evidenceIds"]:
            fail("requirement: missing learning outcome or evidence join")
        if not all(lo in lo_ids for lo in item["learningOutcomeIds"]):
            fail("requirement: dangling learning outcome or evidence reference")
        if not all(eid in evidence_ids for eid in item["evidenceIds"]):
            fail("requirement: dangling learning outcome or evidence reference")
        if item["sourceType"] == "regulation-derived" and item["legalStandardId"] not in legal_ids:
            fail("requirement: dangling legal reference")
        if item["sourceType"] == "project-derived" and item["legalStandardId"] is not None:
            fail("requirement: project-derived source must not claim a legal standard")
        text = ("title", "sourceRef", "ownerRole", "reviewRole")
        if not all(isinstance(item[key], str) and item[key] for key in text):
            fail("requirement: invalid source, role, or title")
        if "approvalRef" in item and (not isinstance(item["approvalRef"], str) or not item["approvalRef"].strip()):
            fail("requirement: invalid approval reference")
    return requirements


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="repository or isolated fixture root")
    parser.add_argument("--strict-claims", action="store_true")
    parser.add_argument("--allow-fixture-repository-hash", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()
    root = Path(args.root).resolve()
    legal_ids, legal = validate_legal(load(root, "legal-standards-register.json"))
    lo_ids, los = validate_los(load(root, "learning-outcomes.json"))
    routes = content_routes(root)
    content = validate_content(load(root, "content-learning-map.json"), routes, lo_ids)
    quizzes = validate_quizzes(root, load(root, "quiz-learning-map.json"), lo_ids, routes)
    simulations = validate_simulations(root, load(root, "simulation-learning-map.json"), lo_ids, routes)
    evidence_ids, evidence = validate_evidence(root, load(root, "evidence-registry.json"), not args.allow_fixture_repository_hash)
    requirements_data = load(root, "requirement-traceability.json")
    requirements = validate_requirements(requirements_data, legal_ids, lo_ids, evidence_ids)
    if args.strict_claims:
        strict_claims(requirements, legal, los, content, quizzes, simulations, evidence)
    confirmed = sum(item["status"] == "confirmed" for item in requirements)
    formal = "confirmed" if confirmed == len(requirements) and requirements_data["status"] == "confirmed" else "provisional"
    print(
        f"traceability: content={len(content)}/{len(routes)} quiz={len(quizzes)} "
        f"sim={len(simulations)}/25 requirements=confirmed:{confirmed}, "
        f"provisional:{len(requirements) - confirmed} formal-claim:{formal}"
    )


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        print(f"traceability: FAIL: {error}", file=sys.stderr)
        sys.exit(1)
