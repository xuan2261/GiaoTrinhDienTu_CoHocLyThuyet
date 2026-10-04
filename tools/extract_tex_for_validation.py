"""Read TeX as an HTML parser sees it, before KaTeX (no browser rendering claim)."""
from html.parser import HTMLParser
import json,sys
from pathlib import Path
class MathText(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.active=None;self.items=[]
 def handle_starttag(self,tag,attrs):
  if self.active is not None:
   raise ValueError(f'Unexpected HTML <{tag}> inside TeX; escape less-than signs')
  classes=dict(attrs).get('class','').split()
  if 'math-tex' in classes or 'math-tex-block' in classes:
   self.active={'tag':tag,'text':'','display':'math-tex-block' in classes}
 def handle_endtag(self,tag):
  if self.active is not None:
   if tag!=self.active['tag']:raise ValueError('Mismatched end tag in TeX')
   text=self.active['text'].strip();display=self.active['display']
   if text.startswith(r'\[') and text.endswith(r'\]'):text=text[2:-2];display=True
   elif text.startswith(r'\(') and text.endswith(r'\)'):text=text[2:-2]
   else:raise ValueError('Unbalanced TeX delimiters after HTML parsing')
   self.items.append({'math':text,'display':display});self.active=None
 def handle_data(self,data):
  if self.active is not None:self.active['text']+=data
 def finish(self):
  self.close()
  if self.active is not None:raise ValueError('Unclosed TeX container')
  return self.items

def extract(source):
 parser=MathText();parser.feed(source);return parser.finish()
if __name__=='__main__':
 print(json.dumps(extract(Path(sys.argv[1]).read_text(encoding='utf-8')),ensure_ascii=False))
