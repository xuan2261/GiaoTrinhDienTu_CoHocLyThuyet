import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from academic_review_contracts import write_ledger


class AcademicReviewLedgerTests(unittest.TestCase):
    def fixture(self):
        root = Path(tempfile.mkdtemp(prefix="academic-review-")).resolve()
        for path in ("data", "tools", "chapters/ch1", "chapters/ch2", "chapters/ch3", "images/ch1", "docs"):
            (root / path).mkdir(parents=True, exist_ok=True)
        for name in ("academic_review.py", "academic_review_contracts.py"):
            shutil.copy2(ROOT / "tools" / name, root / "tools" / name)
        for chapter in (1, 2, 3):
            (root / f"chapters/ch{chapter}/index.html").write_text(f"chapter {chapter}", encoding="utf-8")
        equation_bytes, figure_bytes = b"equation", b"figure"
        (root / "images/ch1/equation.png").write_bytes(equation_bytes)
        (root / "images/ch1/figure.png").write_bytes(figure_bytes)
        report = {"counts": {"math-inline": 1, "math-display": 0, "figure": 1, "unknown": 0}, "items": [
            {"chapter": 1, "paragraph_index": 1, "media": "equation.wmf", "kind": "math-inline", "output": "images/ch1/equation.png", "hash": hashlib.sha256(equation_bytes).hexdigest(), "text_context": "equation context"},
            {"chapter": 1, "paragraph_index": 2, "media": "figure.png", "kind": "figure", "output": "images/ch1/figure.png", "hash": hashlib.sha256(figure_bytes).hexdigest(), "text_context": "figure context"},
        ]}
        manifest = {"routes": [
            {"routeId": f"ch{chapter}", "title": f"Chapter {chapter}", "chapterFile": f"chapters/ch{chapter}/index.html"}
            for chapter in (1, 2, 3)
        ]}
        self.save(root, "data/content-manifest.json", manifest)
        self.save(root, "tools/equation_report.json", report)
        self.save(root, "data/equation_mapping.json", [])
        self.save(root, "data/equation_manual_reviews.json", [])
        self.save(root, "tools/image_mapping.json", {"saved": []})
        self.save(root, "data/image_alt_overrides.json", [])
        self.save(root, "data/academic_signoffs.json", {"version": 1, "records": []})
        write_ledger(root)
        return root

    def save(self, root, name, value):
        (root / name).write_text(json.dumps(value), encoding="utf-8")

    def data(self, root, name):
        return json.loads((root / name).read_text(encoding="utf-8"))

    def run_gate(self, root, require_accepted=False):
        command = [sys.executable, "tools/academic_review.py", "--root", str(root), "--strict-current"]
        if require_accepted:
            command.append("--require-accepted")
        return subprocess.run(command, cwd=root, text=True, capture_output=True)

    def mutate_fails(self, mutate, expected):
        root = self.fixture()
        try:
            mutate(root)
            result = self.run_gate(root)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn(expected, result.stderr)
        finally:
            shutil.rmtree(root)

    def accepted_signoff(self, root):
        ledger = self.data(root, "data/academic_review_ledger.json")
        item = ledger["records"][0]
        item["academicStatus"] = "accepted"
        (root / "docs/evidence.txt").write_text("review packet", encoding="utf-8")
        signoff = {"reviewId": "review-1", "itemId": item["id"], "reviewer": {"role": "Independent SME", "affiliation": "Mechanics Unit"}, "independent": True, "decision": "accept", "scopeHash": item["scopeHash"], "evidenceRefs": ["docs/evidence.txt"], "reviewedAt": "2026-08-21T00:00:00Z"}
        self.save(root, "data/academic_review_ledger.json", ledger)
        self.save(root, "data/academic_signoffs.json", {"version": 1, "records": [signoff]})
        return signoff

    def test_valid_current_acceptance_isolated(self):
        root = self.fixture()
        try:
            self.accepted_signoff(root)
            self.assertEqual(self.run_gate(root).returncode, 0)
        finally:
            shutil.rmtree(root)

    def test_pending_inventory_cannot_pass_acceptance_gate(self):
        root = self.fixture()
        try:
            result = self.run_gate(root, require_accepted=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("academic acceptance incomplete", result.stderr)
        finally:
            shutil.rmtree(root)

    def test_stale_source_output_and_scope_hashes_fail(self):
        for field in ("sourceHash", "outputHash", "scopeHash"):
            self.mutate_fails(lambda root, field=field: self._stale(root, field), f"stale {field}")

    def _stale(self, root, field):
        ledger = self.data(root, "data/academic_review_ledger.json")
        ledger["records"][0][field] = "0" * 64
        self.save(root, "data/academic_review_ledger.json", ledger)

    def test_invalid_output_resolution_fails(self):
        def mutate(root):
            ledger = self.data(root, "data/academic_review_ledger.json")
            ledger["records"][0]["outputResolution"] = "heuristic-remap"
            self.save(root, "data/academic_review_ledger.json", ledger)

        self.mutate_fails(mutate, "invalid output resolution vocabulary")


    def test_missing_reviewer_role_or_affiliation_fails(self):
        for field in ("role", "affiliation"):
            self.mutate_fails(lambda root, field=field: self._missing_reviewer(root, field), "reviewer role and affiliation")

    def _missing_reviewer(self, root, field):
        signoff = self.accepted_signoff(root)
        signoff["reviewer"].pop(field)
        self.save(root, "data/academic_signoffs.json", {"version": 1, "records": [signoff]})

    def test_unknown_and_escaping_evidence_fail(self):
        for evidence, expected in (("docs/missing.txt", "missing evidence"), ("../escape.txt", "path escapes root")):
            self.mutate_fails(lambda root, evidence=evidence: self._evidence(root, evidence), expected)

    def _evidence(self, root, evidence):
        signoff = self.accepted_signoff(root)
        signoff["evidenceRefs"] = [evidence]
        self.save(root, "data/academic_signoffs.json", {"version": 1, "records": [signoff]})

    def test_duplicate_active_invalid_supersedes_and_overclaim_fail(self):
        self.mutate_fails(self._duplicate, "duplicate or conflicting active decisions")
        self.mutate_fails(self._bad_supersedes, "invalid supersedes chain")
        self.mutate_fails(self._overclaim, "accepted item lacks current independent signoff")

    def _duplicate(self, root):
        signoff = self.accepted_signoff(root)
        extra = {**signoff, "reviewId": "review-2"}
        self.save(root, "data/academic_signoffs.json", {"version": 1, "records": [signoff, extra]})

    def _bad_supersedes(self, root):
        signoff = self.accepted_signoff(root)
        signoff["supersedes"] = "unknown-review"
        self.save(root, "data/academic_signoffs.json", {"version": 1, "records": [signoff]})

    def _overclaim(self, root):
        ledger = self.data(root, "data/academic_review_ledger.json")
        ledger["records"][0]["academicStatus"] = "accepted"
        self.save(root, "data/academic_review_ledger.json", ledger)


if __name__ == "__main__":
    unittest.main()
