"""Build an offline HTML UI for reviewing equation OCR mappings."""
import argparse
import json
import os
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]


def load_rows(path):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        return data.get("equations", data.get("items", []))
    return data if isinstance(data, list) else []


def enrich(row, output_dir):
    item = dict(row)
    item.pop("confidence", None)
    example = (item.get("examples") or [{}])[0]
    output = example.get("output") or ""
    if output:
        try:
            item["_image_src"] = Path(os.path.relpath(ROOT / output, output_dir)).as_posix()
        except ValueError:
            item["_image_src"] = output.replace("\\", "/")
    else:
        item["_image_src"] = ""
    item["_kind"] = example.get("kind") or item.get("kind") or ""
    item["_chapter"] = example.get("chapter") or ""
    item["_paragraph_index"] = example.get("paragraph_index") or ""
    item["_context"] = example.get("text_context") or ""
    item["_media"] = example.get("media") or ""
    return item


def safe_json(rows):
    return json.dumps(rows, ensure_ascii=False).replace("</", "<\\/")


HTML_TEMPLATE = r"""<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Equation Mapping Review</title><link rel="stylesheet" href="lib/katex/katex.min.css">
<style>
:root{font-family:Arial,sans-serif;color-scheme:light}body{margin:0;background:#f6f7f9;color:#18202a}
header{position:sticky;top:0;z-index:10;padding:14px 18px;background:#fff;border-bottom:1px solid #d8dde5}
h1{margin:0 0 10px;font-size:20px}.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
input,select,textarea,button{font:inherit;border:1px solid #c9d1dc;border-radius:6px;background:#fff}
input,select,button{min-height:34px;padding:0 10px}button{cursor:pointer}.primary{background:#195fb8;border-color:#195fb8;color:#fff}
main{padding:18px;display:grid;gap:14px}.card{display:grid;grid-template-columns:minmax(160px,260px) 1fr;gap:14px;padding:14px;background:#fff;border:1px solid #d8dde5;border-radius:8px}
.card.reviewed{border-color:#2e7d32}.preview-img{display:flex;min-height:96px;align-items:center;justify-content:center;background:#fbfbfb;border:1px solid #e2e6ec;border-radius:6px}
.preview-img img{max-width:100%;max-height:160px;object-fit:contain}.meta{margin-top:10px;color:#4f5d6d;font-size:12px;overflow-wrap:anywhere}
.fields{display:grid;gap:8px}textarea{width:100%;min-height:70px;padding:8px;box-sizing:border-box;resize:vertical}
.row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.row label{display:inline-flex;gap:6px;align-items:center}
.context{color:#334155;font-size:13px;line-height:1.45}.katex-preview{min-height:34px;padding:8px;background:#f9fafb;border:1px solid #e2e6ec;border-radius:6px;overflow-x:auto}
.hidden{display:none}#exportBox{width:100%;min-height:140px;margin-top:10px}@media(max-width:760px){.card{grid-template-columns:1fr}}
</style></head><body><header><h1>Equation Mapping Review</h1><div class="toolbar">
<span id="summary"></span><select id="filter"><option value="all">all</option><option value="unreviewed">unreviewed</option><option value="inline">inline</option><option value="display">display</option></select>
<input id="search" placeholder="hash, latex, context"><button id="renderAll">Render visible</button><button id="copyJson">Copy JSON</button><button class="primary" id="downloadJson">Download reviewed JSON</button>
</div><textarea id="exportBox" class="hidden" spellcheck="false"></textarea></header><main id="list"></main>
<script src="lib/katex/katex.min.js"></script><script id="equation-data" type="application/json">__DATA__</script>
<script>
const rows=JSON.parse(document.getElementById('equation-data').textContent),list=document.getElementById('list'),filter=document.getElementById('filter'),search=document.getElementById('search'),summary=document.getElementById('summary'),exportBox=document.getElementById('exportBox');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function matches(r,q,m){const k=r._kind||'';if(m==='unreviewed'&&r.reviewed)return false;if(m==='inline'&&k!=='math-inline')return false;if(m==='display'&&k!=='math-display')return false;if(!q)return true;return [r.hash,r.latex,r.mathml,r.notes,r._context,r._media].join(' ').toLowerCase().includes(q.toLowerCase())}
function preview(card,r){const t=card.querySelector('.katex-preview'),x=card.querySelector('.latex').value.trim();t.textContent='';if(!x)return;if(!window.katex){t.textContent=x;return}katex.render(x,t,{displayMode:r._kind==='math-display',throwOnError:false,strict:'warn'})}
function sync(card){const r=rows[Number(card.dataset.index)];r.latex=card.querySelector('.latex').value;r.mathml=card.querySelector('.mathml').value;r.reviewed=card.querySelector('.reviewed').checked;r.source=card.querySelector('.source').value||'manual-review';r.notes=card.querySelector('.notes').value;card.classList.toggle('reviewed',r.reviewed);preview(card,r);setSummary()}
function setSummary(n){const reviewed=rows.filter(r=>r.reviewed).length;summary.textContent=`${reviewed}/${rows.length} reviewed${Number.isFinite(n)?' | '+n+' visible':''}`}
function renderList(){const m=filter.value,q=search.value.trim();list.textContent='';let n=0;rows.forEach((r,i)=>{if(!matches(r,q,m))return;n++;const card=document.createElement('section');card.className='card'+(r.reviewed?' reviewed':'');card.dataset.index=String(i);card.innerHTML=`<div><div class="preview-img">${r._image_src?`<img src="${esc(r._image_src)}" alt="equation image">`:'no image'}</div><div class="meta"><div><strong>${esc(r._kind||'unknown')}</strong> | ch${esc(r._chapter)} | p${esc(r._paragraph_index)}</div><div>${esc(r._media)}</div><div>${esc(r.hash)}</div></div></div><div class="fields"><div class="context">${esc(r._context)}</div><textarea class="latex" spellcheck="false" placeholder="LaTeX">${esc(r.latex||'')}</textarea><textarea class="mathml" spellcheck="false" placeholder="MathML optional">${esc(r.mathml||'')}</textarea><div class="row"><label><input class="reviewed" type="checkbox" ${r.reviewed?'checked':''}> reviewed</label><label>source <input class="source" value="${esc(r.source||'manual-review')}" size="20"></label></div><textarea class="notes" spellcheck="false" placeholder="notes">${esc(r.notes||'')}</textarea><div class="katex-preview"></div></div>`;card.querySelectorAll('textarea,input').forEach(e=>e.addEventListener('input',()=>sync(card)));card.querySelector('.reviewed').addEventListener('change',()=>sync(card));list.appendChild(card);preview(card,r)});setSummary(n)}
function exported(){return rows.map(r=>{const c={...r};['_image_src','_kind','_chapter','_paragraph_index','_context','_media'].forEach(k=>delete c[k]);return c})}
function jsonText(){return JSON.stringify(exported(),null,2)}
document.getElementById('renderAll').addEventListener('click',renderList);filter.addEventListener('change',renderList);search.addEventListener('input',renderList);
document.getElementById('copyJson').addEventListener('click',async()=>{exportBox.value=jsonText();exportBox.classList.remove('hidden');exportBox.select();try{await navigator.clipboard.writeText(exportBox.value)}catch(e){document.execCommand('copy')}});
document.getElementById('downloadJson').addEventListener('click',()=>{const blob=new Blob([jsonText()],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='equation_mapping.reviewed.json';a.click();URL.revokeObjectURL(a.href)});
renderList();
</script></body></html>
"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data/equation_mapping.ocr.json")
    parser.add_argument("--output", default="equation-review.html")
    args = parser.parse_args()
    output_path = (ROOT / args.output).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    rows = [enrich(row, output_path.parent) for row in load_rows(args.input) if isinstance(row, dict)]
    output_path.write_text(HTML_TEMPLATE.replace("__DATA__", safe_json(rows)), encoding="utf-8")
    print("=== EQUATION REVIEW HTML ===")
    print(f"Input rows: {len(rows)}")
    print(f"Output: {output_path}")
    print("Export target filename: data/equation_mapping.reviewed.json")


if __name__ == "__main__":
    main()
