import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from tools import run_qa_gates as gates


class QaEvidenceCaptureTest(unittest.TestCase):
 def setUp(self):
  self.temp = tempfile.TemporaryDirectory()
  self.root = Path(self.temp.name)
  (self.root / "tools").mkdir()
  (self.root / "data").mkdir()
  (self.root / "chapters").mkdir()
  (self.root / "evidence").mkdir()
  (self.root / "tools" / "emit.py").write_text("print(r'C:\\Users\\Alice\\secret alice@example.com 192.168.1.10')\n", encoding="utf-8")
  (self.root / "data" / "input.txt").write_text("input\n", encoding="utf-8")
  self.patchers = [
   patch.object(gates, "ROOT", self.root),
   patch.object(gates, "EVIDENCE_DIR", self.root / "evidence"),
   patch.object(gates, "REPOSITORY_ROOTS", ("tools", "data", "chapters")),
  ]
  for patcher in self.patchers:
   patcher.start()

 def tearDown(self):
  for patcher in reversed(self.patchers):
   patcher.stop()
  self.temp.cleanup()

 def gate(self):
  return {
   "gateId": "fixture-gate",
   "owner": "QA",
   "command": ["python", "tools/emit.py"],
   "expected": "Command succeeds.",
   "inputs": ["data/input.txt"],
   "timeoutSeconds": 30,
   "evidenceClass": "public",
  }

 def test_capture_is_bound_and_public_output_is_redacted(self):
  record = gates.run_gate(self.gate(), "2026-08-21T00:00:00Z", gates.repository_hash())
  capture = (self.root / record["artifact"]).read_text(encoding="utf-8")
  self.assertEqual(record["status"], "pass")
  self.assertIn(f"gateDefinitionHash: {record['gateDefinitionHash']}", capture)
  self.assertIn(f"repositoryHash: {record['repositoryHash']}", capture)
  self.assertIn("sha256:", capture.split("--- inputs ---", 1)[1])
  self.assertNotIn("alice@example.com", capture)
  self.assertNotIn("192.168.1.10", capture)
  self.assertNotIn("Alice", capture)
  self.assertEqual(record["redactionStatus"], "redacted")
  self.assertFalse(record["containsPII"])

 def test_config_rejects_missing_declared_input(self):
  gate = self.gate()
  gate["inputs"] = ["data/missing.txt"]
  config = self.root / "data" / "qa-gates.json"
  config.write_text(__import__("json").dumps({"schemaVersion": 1, "gates": [gate]}), encoding="utf-8")
  with patch.object(gates, "CONFIG", config), self.assertRaisesRegex(ValueError, "unresolved QA gate input"):
   gates.load_config()

 def test_hashes_change_for_definition_and_unlisted_repository_content(self):
  gate = self.gate()
  changed = {**gate, "expected": "Different contract."}
  self.assertNotEqual(gates.gate_definition_hash(gate), gates.gate_definition_hash(changed))
  before = gates.repository_hash()
  (self.root / "chapters" / "unlisted.html").write_text("changed\n", encoding="utf-8")
  after = gates.repository_hash()
  self.assertNotEqual(before, after)
  (self.root / "data" / "evidence-registry.json").write_text("mutable\n", encoding="utf-8")
  self.assertEqual(after, gates.repository_hash())


if __name__ == "__main__":
 unittest.main()
