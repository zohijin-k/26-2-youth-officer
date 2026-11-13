"""Execute each unchanged suite/module separately, retaining raw local logs."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

ROOT = Path('/tmp/youth-applicant-baseline-OQ2u7q')
REPO = Path('/home/ijin/26-2-youth-applicant')
PYTHON = str(REPO / '.venv/bin/python')
env = {k:v for k,v in os.environ.items() if not k.startswith(('JBAI_', 'UPSTAGE_'))}
env.update(PYTHONPATH=str(ROOT/'bootstrap')+os.pathsep+str(REPO), PYTHONIOENCODING='utf-8', PYTHONUTF8='1')
env.pop('ENGINE_V2_OCR',None)

def run(label, command):
    started=time.monotonic()
    log_path=ROOT/(label+'.log')
    with log_path.open('w') as log:
        p=subprocess.run(command,cwd=REPO,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=600)
    output=log_path.read_text()
    row={'label':label,'command':command,'exit':p.returncode,'seconds':round(time.monotonic()-started,2)}
    summary=re.findall(r'통과 (\d+) / 실패 (\d+)(?: / SKIP (\d+))?',output)
    if summary:
        passed,failed,skipped=summary[-1]
        row.update(passed=int(passed),failed=int(failed),skipped=int(skipped or 0),unit='scenario checks')
    elif label=='run_p14_pdf_forms_scenarios':
        match=re.search(r'\[OK\] (\d+)개 원본 서식',output)
        row.update(passed=int(p.returncode==0),failed=int(p.returncode!=0),skipped=0,unit='aggregate module validation',forms=int(match[1]) if match else None)
    if label in ('engine-pytest','backend-pytest'):
        counts={kind:int(n) for n,kind in re.findall(r'(\d+) (passed|failed|skipped|errors?|warnings?)',output)}
        row.update(counts)
        row['summary']=output.splitlines()[-1] if output.splitlines() else 'no summary'
    (ROOT/(label+'.json')).write_text(json.dumps(row,indent=2))
    print(json.dumps(row,ensure_ascii=False),flush=True)
    return row

if sys.argv[1]=='engine':
    run('engine-pytest',[PYTHON,'-m','pytest','engine_v2/tests','-q','-rs','--junitxml='+str(ROOT/'engine.xml')])
elif sys.argv[1]=='backend':
    run('backend-pytest',[PYTHON,'-m','pytest','demo/backend/tests','-q','-rs','--junitxml='+str(ROOT/'backend.xml')])
elif sys.argv[1]=='scenarios':
    rows=[]
    for f in sorted((REPO/'demo/backend/tests').glob('run_p*_scenarios.py'),key=lambda p:int(p.name.split('_')[1][1:])):
        rows.append(run(f.stem,[PYTHON,'-m','demo.backend.tests.'+f.stem]))
    (ROOT/'scenarios.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False))
elif sys.argv[1]=='guard-check':
    run('guard-check',[PYTHON,'-c',"from engine_v2.tools import fetch_synth_fonts as f; import importlib.util; print('synthetic font path:',f.FONT_DIR); print('default matches:',f.font_path.__defaults__ == (f.FONT_DIR,)); print('ocrmac installed:',importlib.util.find_spec('ocrmac') is not None); print('nanummyeongjo verified:',f.font_path('nanummyeongjo').is_file())"])
else:
    raise SystemExit('unknown baseline track')
