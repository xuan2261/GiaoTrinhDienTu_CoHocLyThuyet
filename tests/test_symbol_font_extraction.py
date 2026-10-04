import sys,unittest
from pathlib import Path
from lxml import etree
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
import extract_docx as extractor
class SymbolTests(unittest.TestCase):
    def render(self,char,font='Symbol'):
        run=etree.fromstring(f'<w:r xmlns:w="{extractor.NS["w"]}"><w:sym w:font="{font}" w:char="{char}"/></w:r>')
        return ''.join(s['html'] for s in extractor.render_run_segments(run,1,0,'',None,{},None))
    def test_inequality_is_not_currency(self):
        self.assertEqual(self.render('00A3'),'≤')
        self.assertEqual(self.render('F0B3'),'≥')
    def test_private_use_and_standard_symbol_codes_agree(self):
        for code,text in [('77','ω'),('44','Δ'),('61','α'),('53','Σ'),('72','ρ'),('DE','⇒'),('BA','≡'),('A5','∞')]:
            self.assertEqual(self.render('00'+code),text)
            self.assertEqual(self.render('F0'+code),text)
    def test_normal_unicode_font_is_preserved(self):
        self.assertEqual(self.render('00A3','Arial'),'£')
    def test_unknown_symbol_fails_loudly(self):
        with self.assertRaises(ValueError): self.render('FFFF')
if __name__=='__main__':unittest.main()
