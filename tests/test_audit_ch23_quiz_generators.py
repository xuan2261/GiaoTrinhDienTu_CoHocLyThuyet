"""Legacy entry points must not destroy canonical reviewed quiz banks."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
ROOT=Path(__file__).resolve().parents[1]
class QuizGeneratorPreservationTests(unittest.TestCase):
    def test_validate_does_not_write_and_export_preserves_all_fields(self):
        for ch in [2,3]:
            source=ROOT/f'data/quiz-ch{ch}.json';before=source.read_bytes()
            script=ROOT/f'tools/gen_quiz_ch{ch}.py'
            result=subprocess.run([sys.executable,str(script)],capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stderr);self.assertEqual(source.read_bytes(),before)
            with tempfile.TemporaryDirectory() as temp:
                export=Path(temp)/'quiz.json'
                result=subprocess.run([sys.executable,str(script),'--output',str(export)],capture_output=True,text=True)
                self.assertEqual(result.returncode,0,result.stderr)
                self.assertEqual(json.loads(export.read_text()),json.loads(before))
            refused=subprocess.run([sys.executable,str(script),'--output',str(source)],capture_output=True,text=True)
            self.assertNotEqual(refused.returncode,0)
            self.assertIn('Refusing to overwrite',refused.stderr);self.assertEqual(source.read_bytes(),before)
if __name__=='__main__':unittest.main(verbosity=2)
