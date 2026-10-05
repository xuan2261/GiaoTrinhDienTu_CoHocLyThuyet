"""Independent regressions for UI-01/02 from the 2026-10-02 audit."""
import importlib.util
import re
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'scripts/dedupe-mathml-and-katex-render-pairs-keep-mathml.py'
spec = importlib.util.spec_from_file_location('dedupe_audit', SCRIPT)
dedupe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dedupe)
MML = '<div class="mathml-block"><math><mrow><mover><mi>F</mi><mo>→</mo></mover><mo>=</mo><mi>m</mi><mover><mi>a</mi><mo>→</mo></mover></mrow></math></div>'
TEX = r'<div class="math-tex-block">\[\vec{F}=m\vec{a}\]</div>'

class AuditUiRegression(unittest.TestCase):
    def test_div_blocks_are_deduplicated_to_one_accessible_math(self):
        actual = dedupe.dedupe(MML+'\n'+TEX+'\n'+TEX)
        self.assertEqual(actual.strip(), MML)
        self.assertEqual(dedupe.dedupe(actual), actual)

    def test_unrelated_adjacent_formula_is_preserved(self):
        different = TEX.replace('=m', '=2m')
        self.assertEqual(dedupe.dedupe(MML+'\n'+different), MML+'\n'+different)

    def test_block_before_mathml_is_deduplicated(self):
        self.assertEqual(dedupe.dedupe(TEX+'\n'+MML).strip(), MML)

    def test_live_newton_route_has_single_display_formula(self):
        html = (ROOT/'chapters/ch3/muc-II-2.html').read_text()
        self.assertNotIn(TEX, html)
        self.assertIn('mathml-block', html)

    def test_non_equivalent_legacy_pairs_preserved(self):
        for wrapper,cls,texcls,left,right in [('span','mathml-inline','math-tex',r'\(',r'\)'),('div','mathml-block','math-tex',r'\[',r'\]')]:
            mml=f'<{wrapper} class="{cls}"><math><mi>x</mi></math></{wrapper}>'
            tex=f'<span class="{texcls}">{left}y{right}</span>'
            for original in (mml+tex,tex+mml): self.assertEqual(dedupe.dedupe(original),original)

    def test_unsupported_semantics_preserved(self):
        variants = ['<math><mi mathvariant="double-struck">R</mi></math>', '<math xmlns="urn:foreign"><mi>R</mi></math>', '<math><mi>RR</mi></math>']
        for markup in variants:
            mml='<div class="mathml-block">'+markup+'</div>'
            tex=r'<div class="math-tex-block">\[R\]</div>'
            for original in (mml+tex,tex+mml): self.assertEqual(dedupe.dedupe(original),original)

    def test_original_pdf_correction_status_is_disclosed(self):
        html = (ROOT/'index.html').read_text()
        self.assertIn('aria-describedby="pdf-source-errata-notice"', html)
        self.assertIn('chưa tích hợp các đính chính', html)
        self.assertIn('nghiệm thu học thuật độc lập', html)

    def test_dark_rule_covers_display_katex_container(self):
        css = (ROOT/'css/equations-and-figure-styling-mathml-katex-font-sync-figure-figcaption.css').read_text()
        self.assertRegex(css, r'\[data-theme="dark"\] \.math-tex-block\s*[,\{]')

if __name__ == '__main__': unittest.main()
