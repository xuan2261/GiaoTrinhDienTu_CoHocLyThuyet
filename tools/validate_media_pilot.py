#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from media_pilot_contracts import (
    REMOTE_RE, html_dependencies, load_json, png_size, repository_path,
    require, require_anchor, require_text, unique, validate_file,
)

EXPECTED = {
    "media-ch1-force-sliding": ("obj-ch1-force-sliding", "animated-figure", ["ch1-2-2"], None),
    "media-ch1-resultant-angle": ("obj-ch1-resultant-angle", "quantitative-chart", ["ch1-2-3"], "ch1-2-3"),
    "media-ch1-friction-cone": ("obj-ch1-friction-cone", "mounted-simulation", ["ch1-5-3"], "ch1-5-3"),
    "media-ch1-centroid-steps": ("obj-ch1-centroid-steps", "step-interaction", ["ch1-6-2", "ch1-6-3"], "ch1-6-3"),
}
BANNED_CLAIM_RE = re.compile(r"\b(?:approved|effective|certified|validated)\b", re.IGNORECASE)


def validate_gap(gap_data: dict, asset_ids: set[str]) -> None:
    require(gap_data.get("status") == "pilot-draft", "gap analysis status must be pilot-draft")
    require(gap_data.get("parentLearningOutcomeId") == "lo-ch1-statics", "gap analysis parent LO mismatch")
    scope = gap_data.get("scope")
    require(isinstance(scope, dict), "missing gap analysis scope")
    require(scope.get("pilotCap") == 4 and scope.get("selectedCount") == 4, "gap pilot cap mismatch")
    rubric = gap_data.get("rubric")
    require(isinstance(rubric, dict), "missing gap rubric")
    dimensions = rubric.get("dimensions")
    require(isinstance(dimensions, list) and len(dimensions) == 5, "invalid gap rubric dimensions")
    dimension_ids = unique(dimensions, "id", "rubric dimension")
    weights = {item["id"]: item.get("weight") for item in dimensions}
    require(all(isinstance(value, int) and value > 0 for value in weights.values()), "invalid rubric weight")
    require(sum(weights.values()) == 100, "rubric weights must sum to 100")
    candidates = gap_data.get("evaluatedCandidates")
    require(isinstance(candidates, list) and len(candidates) >= 7, "missing evaluated candidates")
    unique(candidates, "id", "candidate")
    require({item.get("chapterSection") for item in candidates} >= {"I", "II", "III", "IV", "V", "VI", "VII"}, "gap analysis must cover Chapter 1 sections I-VII")
    selected: set[str] = set()
    for candidate in candidates:
        require(candidate.get("decision") in {"selected", "no-go"}, "candidate missing selection or no-go decision")
        require_text(candidate.get("reason"), "candidate decision reason")
        scores = candidate.get("scores")
        require(isinstance(scores, dict) and set(scores) == dimension_ids, "candidate rubric score mismatch")
        require(all(isinstance(value, int) and 0 <= value <= 4 for value in scores.values()), "candidate score outside rubric")
        calculated = sum(scores[key] * weights[key] for key in dimension_ids) / 4
        require(abs(calculated - candidate.get("weightedScore", -1)) < 0.001, "candidate weighted score is stale")
        if candidate["decision"] == "selected":
            selected.add(require_text(candidate.get("assetId"), "selected candidate asset ID"))
    require(selected == asset_ids, "selected gap candidates do not match media manifest assets")
    require(set(gap_data.get("selectedAssetIds", [])) == asset_ids, "gap selected asset ledger mismatch")


def validate_packet(root: Path, asset: dict, packet_record: dict) -> None:
    packet_path = validate_file(root, packet_record, "authoring packet")
    packet = load_json(packet_path)
    require(packet.get("status") == "pilot-draft", "authoring packet status must be pilot-draft")
    require(packet.get("assetId") == asset["id"], "authoring packet asset mismatch")
    require(packet.get("parentLearningOutcomeId") == asset["parentLearningOutcomeId"], "authoring packet LO mismatch")
    require(packet.get("contentRoutes") == asset["contentRoutes"], "authoring packet route mismatch")
    require(packet.get("simulationId") == asset["simulationId"], "authoring packet simulation mismatch")
    objective = packet.get("localObjective")
    require(isinstance(objective, dict) and objective.get("id") == asset["localObjectiveId"], "authoring packet objective mismatch")
    for key in ("verb", "condition", "criterion"):
        require_text(objective.get(key), f"local objective {key}")
    gap = packet.get("gapDecision")
    require(isinstance(gap, dict) and gap.get("decision") == "selected", "packet missing selected gap decision")
    for key in ("modalityRationale", "misconceptionTarget", "evidenceTarget"):
        require_text(gap.get(key), f"packet {key}")
    authoring = packet.get("authoring")
    require(isinstance(authoring, dict), "missing authoring workflow")
    require(isinstance(authoring.get("script"), list) and authoring["script"], "missing authoring script")
    require(isinstance(authoring.get("storyboard"), list) and authoring["storyboard"], "missing storyboard")
    math = authoring.get("math")
    require(isinstance(math, dict), "missing packet math contract")
    for key in ("expression", "units"):
        require_text(math.get(key), f"packet math {key}")
    require(isinstance(math.get("assumptions"), list) and math["assumptions"], "missing packet assumptions")
    accessibility = packet.get("accessibility")
    require(isinstance(accessibility, dict), "missing packet accessibility")
    for key in ("keyboard", "reducedMotion", "staticFallback", "textAlternative"):
        require_text(accessibility.get(key), f"packet accessibility {key}")
    require(accessibility.get("autoplay") is False, "packet autoplay must be false")
    for evidence in packet.get("sourceEvidence", []):
        validate_file(root, evidence, "packet source evidence")
    review = packet.get("review")
    require(isinstance(review, dict) and review.get("status") == "technical-review", "packet review status must be technical-review")
    for key in ("ownerRole", "reviewerRole", "reviewUnit", "claim"):
        require_text(review.get(key), f"packet review {key}")
    require(review.get("efficacyEvidence") is None, "packet must not claim efficacy evidence")


def validate_content_contracts(data: dict, assets: dict[str, dict]) -> None:
    require(data.get("status") == "pilot-draft", "content contract status must be pilot-draft")
    require(data.get("parentLearningOutcomeId") == "lo-ch1-statics", "content contract parent LO mismatch")
    contracts = data.get("contracts")
    require(isinstance(contracts, list) and len(contracts) == 4, "content contracts must contain exactly four entries")
    contract_ids = unique(contracts, "assetId", "content contract")
    require(contract_ids == set(assets), "content contract asset set mismatch")
    for contract in contracts:
        asset = assets[contract["assetId"]]
        objective = contract.get("localObjective")
        require(isinstance(objective, dict) and objective.get("id") == asset["localObjectiveId"], "content contract objective mismatch")
        for key in ("verb", "condition", "criterion"):
            require_text(objective.get(key), f"content contract objective {key}")
        require(contract.get("contentRoutes") == asset["contentRoutes"], "content contract route mismatch")
        require(contract.get("canonicalSimulationId") == asset["simulationId"], "content contract simulation mismatch")
        for key in ("modality", "modalityRationale", "misconceptionTarget", "evidenceTarget", "math", "authoringPacket", "review"):
            require(contract.get(key) == asset.get(key), f"content contract {key} mismatch")


def validate_learning_map(data: dict, assets: dict[str, dict]) -> None:
    require(data.get("status") == "pilot-draft", "multimedia learning map status must be pilot-draft")
    require(data.get("parentLearningOutcomeId") == "lo-ch1-statics", "multimedia learning map parent LO mismatch")
    entries = data.get("entries")
    require(isinstance(entries, list) and len(entries) == 4, "multimedia learning map must contain exactly four entries")
    entry_ids = unique(entries, "assetId", "multimedia learning map entry")
    require(entry_ids == set(assets), "multimedia learning map asset set mismatch")
    for entry in entries:
        asset = assets[entry["assetId"]]
        require(entry.get("localObjectiveId") == asset["localObjectiveId"], "multimedia learning map objective mismatch")
        require(entry.get("parentLearningOutcomeId") == "lo-ch1-statics", "multimedia learning map dangling LO")
        require(entry.get("contentRoutes") == asset["contentRoutes"], "multimedia learning map route mismatch")
        require(entry.get("canonicalSimulationId") == asset["simulationId"], "multimedia learning map simulation mismatch")
        require(entry.get("evidenceTarget") == asset["evidenceTarget"], "multimedia learning map evidence target mismatch")
        require_text(entry.get("evidenceMethod"), "multimedia learning map evidence method")
        require(entry.get("evidenceStatus") == "not-collected", "multimedia evidence must remain not-collected")


def validate_accessibility(data: dict, assets: dict[str, dict]) -> None:
    require(data.get("status") == "pilot-draft", "multimedia accessibility status must be pilot-draft")
    entries = data.get("entries")
    require(isinstance(entries, list) and len(entries) == 4, "multimedia accessibility must contain exactly four entries")
    entry_ids = unique(entries, "assetId", "multimedia accessibility entry")
    require(entry_ids == set(assets), "multimedia accessibility asset set mismatch")
    for entry in entries:
        runtime = assets[entry["assetId"]]["runtime"]
        require(entry.get("status") == "technical-review", "accessibility entry status must be technical-review")
        for key in ("keyboard", "reducedMotion", "staticFallback", "textAlternative", "captions", "loadFailure"):
            require(entry.get(key) == runtime.get(key), f"multimedia accessibility {key} mismatch")
        require(entry.get("autoplay") is False and entry.get("audio") is False, "autoplay or audio contract mismatch")
        for key in ("focusOrder", "liveStatus", "targetSize"):
            require_text(entry.get(key), f"multimedia accessibility {key}")
        manual = entry.get("manualReview")
        require(isinstance(manual, dict) and manual, "missing manual accessibility review ledger")
        require(all(value == "pending" for value in manual.values()), "manual accessibility review must remain pending")


def validate_asset(root: Path, asset: dict, routes: set[str], content_map: dict, simulations: dict) -> None:
    expected = EXPECTED.get(asset.get("id"))
    require(expected is not None, "unexpected pilot asset")
    objective_id, modality, expected_routes, simulation_id = expected
    require(asset.get("localObjectiveId") == objective_id, "local objective mismatch")
    require(asset.get("parentLearningOutcomeId") == "lo-ch1-statics", "dangling or invalid parent LO")
    require(asset.get("modality") == modality, "modality mismatch")
    require(asset.get("contentRoutes") == expected_routes, "content route mismatch")
    require(asset.get("simulationId") == simulation_id, "simulation mapping mismatch")
    for route in expected_routes:
        require(route in routes and content_map.get(route) == "lo-ch1-statics", f"dangling route or LO mapping: {route}")
    if simulation_id:
        mapping = simulations.get(simulation_id)
        require(mapping is not None and mapping["learningOutcomeId"] == "lo-ch1-statics", "dangling simulation or LO mapping")
        require(set(expected_routes) & set(mapping["contentIds"]), "simulation content mapping mismatch")
    for key in ("modalityRationale", "misconceptionTarget", "evidenceTarget"):
        require_text(asset.get(key), key)
    math = asset.get("math")
    require(isinstance(math, dict), "missing manifest math contract")
    for key in ("expression", "units"):
        require_text(math.get(key), f"manifest math {key}")
    require(isinstance(math.get("assumptions"), list) and math["assumptions"], "missing manifest assumptions")
    runtime = asset.get("runtime")
    require(isinstance(runtime, dict), "missing runtime contract")
    for key in ("keyboard", "reducedMotion", "loadFailure"):
        require_text(runtime.get(key), f"runtime {key}")
    prototype = require_text(runtime.get("offlineSourcePath"), "offline source path")
    listed = asset.get("sourceFiles")
    require(isinstance(listed, list) and listed, "missing source file ledger")
    unique(listed, "path", "source file")
    listed_paths = {record["path"] for record in listed}
    for record in listed:
        validate_file(root, record, "source file")
    dependencies = html_dependencies(root, prototype)
    require(dependencies <= listed_paths, f"prototype dependency missing from hash ledger: {sorted(dependencies - listed_paths)}")
    for name in ("primary", "staticFallback", "textAlternative"):
        record = runtime.get(name)
        require(isinstance(record, dict), f"missing {name}")
        validate_file(root, record, name)
        require(record["path"] in listed_paths, f"{name} missing from source ledger")
        require_anchor(root, record, name)
    captions = runtime.get("captions")
    require(isinstance(captions, dict) and isinstance(captions.get("required"), bool), "missing captions decision")
    if not captions["required"]:
        require_text(captions.get("reason"), "captions rationale")
    validate_packet(root, asset, asset.get("authoringPacket", {}))
    require(asset["authoringPacket"]["path"] in listed_paths, "authoring packet missing from source ledger")
    budget = asset.get("budget")
    require(isinstance(budget, dict), "missing module and maintenance budget")
    measured = sum(record["bytes"] for record in listed)
    require(budget.get("measuredBytes") == measured, "stale module size budget")
    require(isinstance(budget.get("maximumBytes"), int) and measured <= budget["maximumBytes"], "module size budget exceeded")
    for key in ("maintenanceTier", "ownerRole", "reviewTrigger"):
        require_text(budget.get(key), f"budget {key}")
    review = asset.get("review")
    require(isinstance(review, dict) and review.get("status") == "technical-review", "manifest review status must be technical-review")
    require(review.get("efficacyClaim") is False and review.get("institutionalAcceptanceClaim") is False, "unsupported claim flag")
    runtime_bundle = repository_path(root, "prototypes/media/shared/media-pilot-runtime.js").read_text(encoding="utf-8")
    for expected_text in (asset["id"], objective_id, modality, prototype):
        require(expected_text in runtime_bundle, "runtime manifest bundle mismatch")
    if asset["id"] == "media-ch1-force-sliding":
        poster = repository_path(root, runtime["staticFallback"]["path"])
        require(png_size(poster) == (720, 416), "force poster dimensions are stale")
        require(asset.get("posterDerivation", {}).get("frame") == 0, "missing deterministic poster derivation")


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate the Chapter 1 media pilot contract.")
    parser.add_argument("--root", default=".")
    parser.add_argument("--strict", action="store_true")
    arguments = parser.parse_args()
    root = Path(arguments.root).resolve()
    index = load_json(root / "data/media-pilot-manifest.json")
    require(index.get("status") == "pilot-draft", "manifest index status must be pilot-draft")
    require(index.get("parentLearningOutcomeId") == "lo-ch1-statics", "manifest index parent LO mismatch")
    expected_contract_paths = {
        "data/multimedia-gap-analysis.json",
        "data/multimedia-content-contracts.json",
        "data/multimedia-learning-map.json",
        "data/media-manifest.json",
        "data/multimedia-accessibility.json",
    }
    contract_records = index.get("contractFiles")
    require(isinstance(contract_records, list) and len(contract_records) == 5, "manifest index must reference five contracts")
    unique(contract_records, "path", "contract file")
    require({record["path"] for record in contract_records} == expected_contract_paths, "manifest index contract set mismatch")
    contracts: dict[str, dict] = {}
    for record in contract_records:
        contract_path = validate_file(root, record, "contract file")
        contracts[record["path"]] = load_json(contract_path)
    all_contract_text = json.dumps({"index": index, "contracts": contracts})
    require(REMOTE_RE.search(all_contract_text) is None, "remote dependency in multimedia contracts")
    require(BANNED_CLAIM_RE.search(all_contract_text) is None, "unsupported approval or efficacy wording")
    scope = index.get("scope")
    require(isinstance(scope, dict) and scope.get("pilotCap") == 4 and scope.get("selectedCount") == 4, "pilot cap mismatch")
    require(scope.get("remoteDependenciesAllowed") is False, "remote dependencies must be forbidden")
    media_manifest = contracts["data/media-manifest.json"]
    require(media_manifest.get("status") == "pilot-draft", "media manifest status must be pilot-draft")
    require(media_manifest.get("parentLearningOutcomeId") == "lo-ch1-statics", "media manifest parent LO mismatch")
    assets = media_manifest.get("assets")
    require(isinstance(assets, list) and len(assets) == 4, "media manifest must contain exactly four assets")
    asset_ids = unique(assets, "id", "asset")
    require(asset_ids == set(EXPECTED), "selected asset set mismatch")
    require(set(index.get("selectedAssetIds", [])) == asset_ids, "manifest index selected asset mismatch")
    assets_by_id = {asset["id"]: asset for asset in assets}
    for asset in assets:
        runtime = asset.get("runtime")
        require(isinstance(runtime, dict), "missing runtime")
        for name in ("primary", "staticFallback", "textAlternative"):
            require(isinstance(runtime.get(name), dict), f"missing {name}")
    gap_data = contracts["data/multimedia-gap-analysis.json"]
    validate_gap(gap_data, asset_ids)
    validate_content_contracts(contracts["data/multimedia-content-contracts.json"], assets_by_id)
    validate_learning_map(contracts["data/multimedia-learning-map.json"], assets_by_id)
    validate_accessibility(contracts["data/multimedia-accessibility.json"], assets_by_id)
    los = load_json(root / "data/learning-outcomes.json")["learningOutcomes"]
    require(any(item.get("id") == "lo-ch1-statics" for item in los), "dangling parent LO")
    content_manifest = load_json(root / "data/content-manifest.json")
    routes = {item["routeId"] for item in content_manifest["routes"]}
    content_map = {item["contentId"]: item["learningOutcomeId"] for item in load_json(root / "data/content-learning-map.json")["mappings"]}
    simulations = {item["simulationId"]: item for item in load_json(root / "data/simulation-learning-map.json")["mappings"]}
    for asset in assets:
        validate_asset(root, asset, routes, content_map, simulations)
    print(f"media-pilot: PASS assets={len(assets)} candidates={len(gap_data['evaluatedCandidates'])} contracts={len(contract_records)} status=pilot-draft")


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        print(f"media-pilot: FAIL: {error}", file=sys.stderr)
        sys.exit(1)
