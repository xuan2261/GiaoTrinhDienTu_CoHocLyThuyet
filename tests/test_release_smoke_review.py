import json
import tempfile
import unittest
from pathlib import Path

from tools import validate_release_candidate as candidate
from tools import validate_release_smoke_review as smoke


class ReleaseSmokeReviewTest(unittest.TestCase):
 def write_review(self, **changes):
  contract = json.loads(candidate.CONTRACT.read_text(encoding="utf-8"))
  summary = json.loads((candidate.ROOT / contract["summaryPath"]).read_text(encoding="utf-8"))
  review = {
   "schemaVersion": 1,
   "status": "complete",
   "reviewerRole": "Independent release reviewer",
   "reviewerUnit": "External QA unit",
   "environment": "Windows 10; Chrome; file and HTTP",
   "releaseVersion": summary["releaseVersion"],
   "releaseSha256": summary["package"]["sha256"],
   "evidenceRefs": ["plans/260820-0924-deep-tdd-remediation-for-electronic-textbook-release-readiness/evidence/technical-smoke.md"],
   "decision": "accept",
   "limitations": ["Technical critical-path smoke only."],
  }
  review.update(changes)
  handle = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False)
  with handle:
   json.dump(review, handle)
  return Path(handle.name)

 def test_repository_review_remains_pending(self):
  with self.assertRaisesRegex(ValueError, "incomplete|not independently accepted"):
   smoke.validate(smoke.DEFAULT, require_complete=True)

 def test_complete_current_review_passes(self):
  path = self.write_review()
  try:
   result = smoke.validate(path, require_complete=True)
   self.assertEqual(result["status"], "complete")
  finally:
   path.unlink(missing_ok=True)

 def test_wrong_candidate_hash_fails(self):
  path = self.write_review(releaseSha256="0" * 64)
  try:
   with self.assertRaisesRegex(ValueError, "candidate hash mismatch"):
    smoke.validate(path, require_complete=True)
  finally:
   path.unlink(missing_ok=True)


if __name__ == "__main__":
 unittest.main()
