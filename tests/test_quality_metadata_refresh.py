import hashlib
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from refresh_quality_metadata import refresh
from academic_review import validate_current, validate_ledger, validate_signoffs
import tests.test_academic_review_ledger as academic_fixtures


class QualityMetadataRefreshTests(unittest.TestCase):
    def fixture(self, academic=False):
        root = academic_fixtures.AcademicReviewLedgerTests().fixture() if academic else Path(tempfile.mkdtemp(prefix='quality-refresh-'))
        self.addCleanup(shutil.rmtree, root)
        (root / 'data').mkdir(exist_ok=True)
        copies = {'data/quiz-learning-map.json', 'data/simulation-learning-map.json', 'data/quiz-ch1.json', 'data/quiz-ch2.json', 'data/quiz-ch3.json'}
        for name, key in [('simulation-specifications', 'specifications'), ('sim3-pedagogical-reviews', 'reviews')]:
            document = json.loads((ROOT / f'data/{name}.json').read_text())
            document.pop('historicalSnapshot', None)
            document.pop('upstreamBlocker', None)
            document['status'] = 'verified'
            for entry in document['evidenceCatalog']:
                copies.add(entry['path'])
            for record in document[key]:
                record['status'] = 'verified'
                record['evidence']['verified'] = True
                if key == 'specifications':
                    record['evidence']['manualEvidence']['record'] = 'Synthetic historical approval wording that must remain unchanged.'
                    for source in record['sources'].values():
                        if isinstance(source, dict) and 'path' in source:
                            copies.add(source['path'])
                    copies.add(record['oracle']['helper'])
                else:
                    copies.add(record['adapter']['path'])
            (root / f'data/{name}.json').write_text(json.dumps(document))
        for relative in copies:
            target = root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, target)
        return root

    def test_refresh_preserves_approvals_but_never_inherits_verification(self):
        root = self.fixture()
        originals = {name: (root / f'data/{name}.json').read_bytes() for name in ('simulation-specifications', 'sim3-pedagogical-reviews')}
        result = refresh(root)
        self.assertFalse(result['runtimeVerified'])
        self.assertFalse(result['independentAcceptance'])
        for name, original in originals.items():
            data = json.loads((root / f'data/{name}.json').read_text())
            self.assertEqual(data['status'], 'draft')
            saved = data['historicalSnapshot']
            self.assertEqual((root / saved['path']).read_bytes(), original)
            self.assertEqual(saved['sha256'], hashlib.sha256(original).hexdigest())
            for record in data.get('specifications', data.get('reviews', [])):
                self.assertEqual(record['status'], 'draft')
                self.assertFalse(record['evidence']['verified'])
        receipt = json.loads((root / 'data/simulation-current-revalidation.json').read_text())
        self.assertEqual(receipt['status'], 'pending')
        self.assertIsNone(receipt['sourceHash'])
        self.assertIsNone(receipt['review'])
        after = (root / 'data/simulation-specifications.json').read_bytes()
        refresh(root)
        self.assertEqual((root / 'data/simulation-specifications.json').read_bytes(), after)

    def test_prior_current_receipt_is_archived_and_inactivated(self):
        root = self.fixture()
        path = root / 'data/simulation-current-revalidation.json'
        original = b'{"status":"verified","review":{"reviewer":"synthetic old reviewer"}}'
        path.write_bytes(original)
        refresh(root)
        receipt = json.loads(path.read_text())
        self.assertEqual(receipt['status'], 'pending')
        self.assertIsNone(receipt['review'])
        self.assertEqual((root / receipt['historicalSnapshot']['path']).read_bytes(), original)

    def test_quiz_identity_changes_require_review_not_an_automatic_remap(self):
        root = self.fixture()
        path = root / 'data/quiz-ch1.json'
        bank = json.loads(path.read_text())
        bank['items'][0]['id'] = 'different-question'
        path.write_text(json.dumps(bank))
        before = (root / 'data/simulation-specifications.json').read_bytes()
        with self.assertRaisesRegex(ValueError, 'refusing automatic remap'):
            refresh(root)
        self.assertEqual((root / 'data/simulation-specifications.json').read_bytes(), before)
        self.assertFalse((root / 'data/simulation-current-revalidation.json').exists())

    def test_academic_refresh_rebuilds_current_inventory_only_as_pending(self):
        root = self.fixture(academic=True)
        old_signoffs = (root / 'data/academic_signoffs.json').read_bytes()
        (root / 'chapters/ch1/index.html').write_text('changed source requiring new review')
        result = refresh(root, include_academic=True)
        self.assertGreater(result['academicPending'], 0)
        ledger = json.loads((root / 'data/academic_review_ledger.json').read_text())
        records = validate_ledger(ledger)
        active = validate_signoffs(root, json.loads(old_signoffs), records)
        validate_current(root, records, active)
        self.assertTrue(all(record['academicStatus'] == 'pending' for record in records.values()))
        self.assertEqual((root / 'data/academic_signoffs.json').read_bytes(), old_signoffs)

    def test_independent_signoffs_are_never_rewritten_or_silently_reset(self):
        root = self.fixture(academic=True)
        path = root / 'data/academic_signoffs.json'
        original = b'{"version":1,"records":[{"synthetic":"existing approval"}]}'
        path.write_bytes(original)
        before = (root / 'data/academic_review_ledger.json').read_bytes()
        with self.assertRaisesRegex(ValueError, 'independent signoffs exist'):
            refresh(root, include_academic=True)
        self.assertEqual(path.read_bytes(), original)
        self.assertEqual((root / 'data/academic_review_ledger.json').read_bytes(), before)
        self.assertFalse((root / 'data/simulation-current-revalidation.json').exists())


if __name__ == '__main__':
    unittest.main()
