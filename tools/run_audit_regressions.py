"""Deterministic local CPU/structural gates for the 2026-10-02 repairs.

No GPU, browser layout or independent human certification is implied.
"""
from pathlib import Path
import subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
PYTHON_TESTS=['test_audit_ch23_content.py','test_statics_content_regression.py','test_statics_quiz_export.py','test_audit_ch23_quiz_generators.py','test_audit_ui_regressions.py','test_content_errata.py','test_symbol_font_extraction.py']
NODE_TESTS=['sim2-audit-repairs.test.js','sim2-audit-domain-sweep.test.js','sim3-audit-regression.test.js','notes-security-audit.test.js','content-math-render-audit.test.js','simulation-current-revalidation.test.js']
commands=[[sys.executable,'tests/'+p]for p in PYTHON_TESTS]+[['node','--test','tests/'+p]for p in NODE_TESTS]+[[sys.executable,'tools/apply_content_errata.py','--check']]
failed=[]
for command in commands:
 print('=== '+' '.join(command)+' ===',flush=True)
 result=subprocess.run(command,cwd=ROOT,check=False)
 if result.returncode:failed.append(command)
print(f'Audit repair commands: {len(commands)-len(failed)}/{len(commands)} PASS; browser/GPU/human acceptance separate')
raise SystemExit(bool(failed))
