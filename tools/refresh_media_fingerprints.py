"""Refresh draft media byte references only; never grant review/efficacy approval."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parents[1]
def load(path):return json.loads((ROOT/path).read_text(encoding='utf-8'))
def save(path,data):(ROOT/path).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def update(value):
 if isinstance(value,dict):
  if 'path'in value and 'sha256'in value:
   path=(ROOT/value['path']).resolve()
   if ROOT not in path.parents or not path.is_file():raise ValueError('Invalid media fingerprint path')
   b=path.read_bytes();value['sha256']=hashlib.sha256(b).hexdigest()
   if 'bytes'in value:value['bytes']=len(b)
  for item in value.values():update(item)
 elif isinstance(value,list):
  for item in value:update(item)

def main():
 media=load('data/media-manifest.json')
 if media['status']!='pilot-draft' or any(a['review']['efficacyClaim'] or a['review']['institutionalAcceptanceClaim'] for a in media['assets']):
  raise ValueError('Approved media requires explicit review, not automatic refresh')
 for asset in media['assets']:
  path=asset['authoringPacket']['path'];packet=load(path);update(packet);save(path,packet)
 update(media)
 for asset in media['assets']:
  measured=sum(record['bytes'] for record in asset['sourceFiles'])
  if measured>asset['budget']['maximumBytes']:raise ValueError('Updated media exceeds unchanged budget')
  asset['budget']['measuredBytes']=measured
 save('data/media-manifest.json',media)
 index=load('data/media-pilot-manifest.json')
 for record in index['contractFiles']:
  if record['path']=='data/media-manifest.json':continue
  contract=load(record['path']);update(contract);save(record['path'],contract)
 update(index);save('data/media-pilot-manifest.json',index)
 print('Draft media fingerprints current; no review or efficacy status changed')
if __name__=='__main__':main()
