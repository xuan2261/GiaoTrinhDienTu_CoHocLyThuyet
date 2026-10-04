"""Run all equation regression scripts portably with the current Python."""
from pathlib import Path
import subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
failures=[]
for script in sorted((ROOT/'scripts').glob('test-phase-*.py')):
 print(f'=== {script.name} ===',flush=True)
 result=subprocess.run([sys.executable,str(script)],cwd=ROOT,check=False)
 if result.returncode: failures.append(script.name)
print(f'Equation scripts: {len(failures)} failed')
raise SystemExit(bool(failures))
