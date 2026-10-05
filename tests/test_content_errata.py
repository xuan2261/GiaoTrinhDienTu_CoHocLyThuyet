import importlib.util,json,hashlib,shutil,tempfile,unittest,sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('errata',ROOT/'tools/apply_content_errata.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class ErrataTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
  (self.root/'chapters').mkdir();(self.root/'scripts').mkdir()
  shutil.copy(ROOT/'scripts/dedupe-mathml-and-katex-render-pairs-keep-mathml.py',self.root/'scripts')
  (self.root/'source.docx').write_bytes(b'archival source')
  self.entry={'path':'chapters/test.html','auditedSha256':m.digest('before'),'correctedSha256':m.digest('after'),'changes':[{'before':'before','after':'after'}]}
  self.manifest={'schemaVersion':1,'source':{'path':'source.docx','sha256':hashlib.sha256(b'archival source').hexdigest()},'entries':[self.entry]}
  (self.root/'chapters/test.html').write_text('before')
 def tearDown(self):self.tmp.cleanup()
 def test_apply_and_idempotence(self):
  self.assertEqual(m.apply(self.root,self.manifest,True),1)
  self.assertEqual((self.root/'chapters/test.html').read_text(),'after')
  self.assertEqual(m.apply(self.root,self.manifest,True),0)
 def test_unknown_input_and_source_fail_closed(self):
  (self.root/'chapters/test.html').write_text('changed')
  with self.assertRaisesRegex(ValueError,'Unknown content'):m.apply(self.root,self.manifest,True)
  self.assertEqual((self.root/'chapters/test.html').read_text(),'changed')
  (self.root/'source.docx').write_bytes(b'new source')
  with self.assertRaisesRegex(ValueError,'DOCX source changed'):m.apply(self.root,self.manifest,True)
 def test_all_entries_validated_before_any_write(self):
  self.manifest['entries'].append({**self.entry,'path':'chapters/missing.html'})
  with self.assertRaises(OSError):m.apply(self.root,self.manifest,True)
  self.assertEqual((self.root/'chapters/test.html').read_text(),'before')
 def test_bad_output_or_duplicate_anchor_cannot_write(self):
  self.entry['changes'][0]['after']='incorrect'
  with self.assertRaisesRegex(ValueError,'output hash'):m.apply(self.root,self.manifest,True)
  self.assertEqual((self.root/'chapters/test.html').read_text(),'before')
 def test_actual_input_must_match_manifest_source(self):
  (self.root/'other.docx').write_bytes(b'archival source')
  with self.assertRaisesRegex(ValueError,'Actual DOCX input'):
   m.validate_source(self.root,self.manifest,self.root/'other.docx')
  m.validate_source(self.root,self.manifest,self.root/'source.docx')
 def test_extractor_rejects_alternate_input_before_loading_or_cleanup(self):
  (self.root/'data').mkdir()
  (self.root/m.MANIFEST).write_text(json.dumps(self.manifest),encoding='utf-8')
  (self.root/'other.docx').write_bytes(b'unreviewed alternate source')
  args=SimpleNamespace(output=str(self.root),input='other.docx',write=True)
  with patch.object(sys, 'path', [str(ROOT/'tools'), *sys.path]):
   import extract_docx as extractor
   with patch.object(extractor,'Document') as document, patch.object(extractor,'cleanup_generated') as cleanup:
    with self.assertRaisesRegex(ValueError,'Actual DOCX input'):
     extractor.extract(args)
    document.assert_not_called()
    cleanup.assert_not_called()
  self.assertEqual((self.root/'chapters/test.html').read_text(),'before')
 def test_path_escape_rejected(self):
  for name in ('../escape.html','chapters/../escape.html','chapters/./test.html','/tmp/escape.html'):
   self.entry['path']=name
   with self.assertRaisesRegex(ValueError,'Invalid'):m.apply(self.root,self.manifest,True)
  self.manifest['source']['path']='../source.docx'
  with self.assertRaisesRegex(ValueError,'Invalid'):m.apply(self.root,self.manifest,True)
if __name__=='__main__':unittest.main()
