import json
import shutil
import tempfile
import unittest
from pathlib import Path

from tools import validate_release_candidate as candidate


class ReleaseCandidateTest(unittest.TestCase):
    def test_current_candidate_is_policy_validated(self):
        inventory = candidate.validate()
        self.assertEqual(inventory["status"], "verified")
        self.assertEqual(inventory["summary"]["releaseVersion"], "2026.08.25-candidate")
        self.assertEqual(len(inventory["derivatives"]), 2)

    def test_summary_path_must_remain_in_repository(self):
        temp = Path(tempfile.mkdtemp(prefix="candidate-contract-")).resolve()
        try:
            contract = json.loads(candidate.CONTRACT.read_text(encoding="utf-8"))
            contract["summaryPath"] = "../outside/release-summary.json"
            path = temp / "candidate.json"
            path.write_text(json.dumps(contract), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "escapes repository root"):
                candidate.validate(path)
        finally:
            shutil.rmtree(temp)

    def test_expected_summary_cannot_be_substituted(self):
        with self.assertRaisesRegex(ValueError, "differs from candidate contract"):
            candidate.validate(expected_summary=candidate.ROOT / "data" / "release-summary.json")


if __name__ == "__main__":
    unittest.main()
