"""Build a deterministic QTI 3 item package from canonical quiz data."""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import tempfile
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

RELEASE_TOOLS = Path(__file__).resolve().parents[1] / "release"
if str(RELEASE_TOOLS) not in sys.path:
    sys.path.insert(0, str(RELEASE_TOOLS))
from release_common import canonical_json, load_json, sha256_file, write_json, write_zip  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
QTI_NAMESPACE = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
QTI_CP_NAMESPACE = "http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"
RESOURCE_TYPE = "imsqti_qtiitem_xmlv3p0"
CHOICE_IDS = ("CHOICE_A", "CHOICE_B", "CHOICE_C", "CHOICE_D")
DEFAULT_SOURCE_FILE = "data/quiz-ch1.json"
SOURCE_RECORDS = (
    ("quiz", "data/quiz-ch1.json"),
    ("quizLearningMap", "data/quiz-learning-map.json"),
    ("learningOutcomes", "data/learning-outcomes.json"),
)


def fail(message: str) -> None:
    raise ValueError(message)


def attr(value: object) -> str:
    return xml_escape(str(value), {'"': "&quot;", "'": "&apos;"})


def text(value: str) -> str:
    return xml_escape(value)


def question_hash(item: dict) -> str:
    import hashlib

    authored = {key: item[key] for key in ("question", "options", "correct", "section", "feedbackCorrect", "feedbackWrong")}
    return hashlib.sha256(canonical_json(authored).encode("utf-8")).hexdigest()


def canonical_sources(quiz_path: Path, map_path: Path, outcomes_path: Path) -> list[dict]:
    paths = {"quiz": quiz_path, "quizLearningMap": map_path, "learningOutcomes": outcomes_path}
    return [
        {"key": key, "path": source_path, "sha256": sha256_file(paths[key])}
        for key, source_path in SOURCE_RECORDS
    ]


def select_items(quiz: dict, learning_map: dict, outcomes: dict, chapter: str, max_items: int, source_file: str) -> list[dict]:
    if not isinstance(max_items, int) or not 1 <= max_items <= 10:
        fail("max-items must be between 1 and 10")
    if not isinstance(quiz.get("items"), list) or not isinstance(learning_map.get("items"), list):
        fail("canonical quiz data is malformed")
    outcome_ids = {outcome.get("id") for outcome in outcomes.get("learningOutcomes", []) if isinstance(outcome, dict)}
    mapped = {entry.get("id"): entry for entry in learning_map["items"] if isinstance(entry, dict)}
    selected = []
    for index, item in enumerate(quiz["items"]):
        if not isinstance(item, dict) or item.get("chapter") != chapter or item.get("type") != "single-choice":
            continue
        if not isinstance(item.get("id"), str) or not isinstance(item.get("question"), str):
            fail("canonical quiz item is malformed")
        options = item.get("options")
        correct = item.get("correct")
        if not isinstance(options, list) or len(options) != 4 or not all(isinstance(option, str) for option in options):
            fail(f"canonical item requires four choices: {item['id']}")
        if not isinstance(correct, int) or correct not in range(4):
            fail(f"canonical item has invalid correct choice: {item['id']}")
        mapping = mapped.get(item["id"])
        if not isinstance(mapping, dict):
            fail(f"missing learning map entry: {item['id']}")
        if mapping.get("sourceFile") != source_file or mapping.get("sourceIndex") != index:
            fail(f"stale source mapping: {item['id']}")
        if mapping.get("questionHash") != question_hash(item):
            fail(f"stale canonical question hash: {item['id']}")
        outcome_id = mapping.get("learningOutcomeId")
        if outcome_id not in outcome_ids:
            fail(f"dangling learning outcome: {item['id']}")
        content_ids = mapping.get("contentIds")
        if not isinstance(content_ids, list) or not content_ids or not all(isinstance(value, str) and value for value in content_ids):
            fail(f"invalid content IDs: {item['id']}")
        selected.append({"item": item, "index": index, "mapping": mapping})
        if len(selected) == max_items:
            break
    if not selected:
        fail("no matching single-choice quiz items")
    return selected


def item_xml(item: dict, index: int, mapping: dict) -> str:
    content_ids = ",".join(mapping["contentIds"])
    choices = "\n".join(
        f'      <qti-simple-choice identifier="{choice_id}">{text(option)}</qti-simple-choice>'
        for choice_id, option in zip(CHOICE_IDS, item["options"])
    )
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="{QTI_NAMESPACE}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="{QTI_NAMESPACE} https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_itemv3p0p1_v1p0.xsd" identifier="{attr(item["id"])}" title="{attr(item["id"])}" adaptive="false" time-dependent="false" xml:lang="vi" data-source-file="{attr(mapping["sourceFile"])}" data-source-index="{index}" data-source-hash="{attr(mapping["questionHash"])}" data-learning-outcome-id="{attr(mapping["learningOutcomeId"])}" data-content-ids="{attr(content_ids)}">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>{CHOICE_IDS[item["correct"]]}</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>0</qti-value></qti-default-value></qti-outcome-declaration>
  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-prompt>{text(item["question"])}</qti-prompt>
{choices}
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct" />
</qti-assessment-item>
'''


def manifest_xml(records: list[dict]) -> str:
    resources = "\n".join(
        f'    <resource identifier="qti3-{attr(record["id"])}" type="{RESOURCE_TYPE}" href="{record["itemPath"]}"><file href="{record["itemPath"]}" /></resource>'
        for record in records
    )
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="{QTI_CP_NAMESPACE}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="{QTI_CP_NAMESPACE} https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqtiv3p0_imscpv1p2_v1p0.xsd" identifier="qti3-mechanics-chapter-package">
  <metadata />
  <organizations />
  <resources>
{resources}
  </resources>
</manifest>
'''


def build(output: Path, epoch: int, chapter: str, max_items: int, quiz_path: Path, map_path: Path, outcomes_path: Path, source_file: str) -> dict:
    quiz = load_json(quiz_path)
    learning_map = load_json(map_path)
    outcomes = load_json(outcomes_path)
    selected = select_items(quiz, learning_map, outcomes, chapter, max_items, source_file)
    staging = Path(tempfile.mkdtemp(prefix="qti3-build-"))
    try:
        records = []
        for selected_item in selected:
            item = selected_item["item"]
            mapping = selected_item["mapping"]
            relative = f"items/{item['id']}.xml"
            target = staging / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(item_xml(item, selected_item["index"], mapping), encoding="utf-8", newline="\n")
            records.append({
                "id": item["id"],
                "itemPath": relative,
                "itemSha256": sha256_file(target),
                "sourceFile": mapping["sourceFile"],
                "sourceIndex": selected_item["index"],
                "questionHash": mapping["questionHash"],
                "learningOutcomeId": mapping["learningOutcomeId"],
                "contentIds": mapping["contentIds"],
            })
        (staging / "imsmanifest.xml").write_text(manifest_xml(records), encoding="utf-8", newline="\n")
        traceability = {"schemaVersion": 1, "items": records}
        write_json(staging / "traceability.json", traceability)
        metadata = {
            "schemaVersion": 1,
            "adapter": {"name": "tools/lms/build_qti3_package.py", "version": 1},
            "buildEpoch": epoch,
            "chapter": chapter,
            "itemCount": len(records),
            "canonicalSources": canonical_sources(quiz_path, map_path, outcomes_path),
            "files": [
                {"path": record["itemPath"], "sha256": record["itemSha256"]}
                for record in records
            ] + [{"path": "traceability.json", "sha256": sha256_file(staging / "traceability.json")}],
        }
        write_json(staging / "adapter-metadata.json", metadata)
        write_zip(staging, output, epoch)
        return {"package": str(output), "itemCount": len(records), "sha256": sha256_file(output)}
    finally:
        shutil.rmtree(staging, ignore_errors=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--epoch", required=True, type=int)
    parser.add_argument("--chapter", default="ch1")
    parser.add_argument("--max-items", default=10, type=int)
    parser.add_argument("--quiz", default=ROOT / "data/quiz-ch1.json", type=Path)
    parser.add_argument("--quiz-learning-map", default=ROOT / "data/quiz-learning-map.json", type=Path)
    parser.add_argument("--learning-outcomes", default=ROOT / "data/learning-outcomes.json", type=Path)
    parser.add_argument("--source-file", default=DEFAULT_SOURCE_FILE)
    args = parser.parse_args()
    print(json.dumps(build(args.output, args.epoch, args.chapter, args.max_items, args.quiz, args.quiz_learning_map, args.learning_outcomes, args.source_file), ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"qti3 build: {error}", file=sys.stderr)
        raise SystemExit(1)
