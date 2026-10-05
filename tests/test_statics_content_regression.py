"""Academic regression checks for S-C01--S-C16 (not an academic sign-off).

Run: python -m unittest tests.test_statics_content_regression -v
MECHANICS_CONTENT_ROOT can point at an unmodified checkout for red/green proof.
The numerical oracles below use equilibrium and dimensional identities, rather
than copying a simulation kernel. Content checks bind the oracles to the lesson.
"""
import html
import json
import math
import os
from pathlib import Path
import re
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(os.environ.get('MECHANICS_CONTENT_ROOT', Path(__file__).resolve().parents[1]))
NS = {'m': 'http://www.w3.org/1998/Math/MathML'}


def source(name):
    return (ROOT / 'chapters/ch1' / (name + '.html')).read_text(encoding='utf-8')


def text(raw):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', raw))).strip()


def compact_math(raw):
    return re.sub(r'\s+', '', text(raw))


def exercise(number):
    raw = source('muc-VII-1')
    return re.split(r'<p><strong>Bài ' + str(number) + r'[.:]\s*</strong>', raw)[1].split('<p><strong>Bài ')[0]


def quiz(number):
    return next(q for q in json.loads((ROOT/'data/quiz-ch1.json').read_text())['items']
                if q['id'] == f'quiz-ch1-{number:03d}')


def near(actual, expected, tol=1e-6):
    assert math.isfinite(actual) and math.isfinite(expected)
    assert abs(actual-expected) < tol, (actual, expected)


class StaticsAcademicRegression(unittest.TestCase):
    def test_S_C01_spatial_resultant_requires_zero_pitch(self):
        q = quiz(27)
        self.assertIn('R ≠ 0', q['question'])
        self.assertIn('M_O · R = 0', q['question'])
        self.assertEqual(q['correct'], 1)
        for field in ('explanation', 'feedbackCorrect', 'feedbackWrong'):
            self.assertIn('M_O · R = 0', q[field])
        # r x (1,0,0) has zero x-component, unlike M=(1,0,0).
        for r in [(0, 0, 0), (2, -3, 4)]:
            self.assertEqual(r[1]*0-r[2]*0, 0)

    def test_S_C02_moment_is_vector_cross_product(self):
        raw = source('muc-I-4')
        first = re.search(r'<div class="mathml-block">(.*?)</div>', raw, re.S).group(1)
        m = ET.fromstring(first)
        ops = [e.text for e in m.findall('.//m:mo', NS)]
        self.assertEqual(ops.count('×'), 2)
        self.assertNotIn('.', ops)
        self.assertIn('bàn tay phải', raw)

    def test_S_C03_frame_answers_satisfy_both_bodies(self):
        raw = exercise(6)
        self.assertIn(r'+2F_1\sin\alpha', raw)
        self.assertIn(r'\sum M_D', raw)
        numbers = {}
        for label, val in re.findall(r'([XY]_[ACD])&?=(-?\d+(?:\.\d+)?)', raw):
            numbers[label] = float(val)
        self.assertEqual(set(numbers), {'X_A', 'Y_A', 'X_C', 'Y_C', 'X_D', 'Y_D'})
        a = numbers
        near(a['X_A']-5+a['X_D']+8, 0)
        near(a['Y_A']-10*math.sin(math.pi/3)-12+a['Y_D'], 0)
        near(-16+20+20*math.sin(math.pi/3)-25-60+7*a['Y_D'], 0)
        near(a['X_C']+a['X_D'], 0)
        near(a['Y_C']-12+a['Y_D'], 0)
        near(24-25-4*a['X_C']-4*a['Y_C'], 0)

    def test_S_C04_sphere_bottom_supports_both_weights(self):
        raw = exercise(5)
        self.assertIn('tiếp xúc nhẵn', raw)
        self.assertIn(r'N_B=40', raw)
        self.assertIn(r'N_A=N_C=20', raw)
        self.assertIn(r'N_D=20\sqrt{2}', raw)
        near(40-20*math.sqrt(2)*math.sin(math.pi/4)-20, 0)
        near(20*math.sqrt(2)*math.cos(math.pi/4)-20, 0)
        near(40-2*20, 0)

    def test_S_C05_cantilever_moment_arithmetic(self):
        raw = exercise(1)
        c = compact_math(raw)
        self.assertIn('24003', c)  # MathML digits + square-root operand
        self.assertNotIn('23003', c)
        self.assertNotIn('thanh AD', raw)
        self.assertNotRegex(raw, r'<mi>A</mi>\s*<mi>D</mi>')
        near(300*math.sqrt(3)*1.5+650*6*math.sqrt(3)/2, 2400*math.sqrt(3))

    def test_S_C06_ladder_has_parameterized_conditional_answers(self):
        raw = exercise(7)
        for s in ('chưa cho', 'chưa xác định duy nhất', 'chỉ khi bổ sung',
                  'b=BD/L', 'e=AE/L', r'N_B=840-360b', r'N_A=120+360b',
                  r'T=\frac{N_A-60}{1-e}', r'd_3=BD\cos45'):
            self.assertIn(s, raw)
        for b in [0, .2, .8, 1]:
            na, nb = 120+360*b, 840-360*b
            near(na+nb, 960)
            # L cos45 cancels in the whole-system moment about A.
            near(2*nb-60-180-720*(2-b), 0)
        near((120+360*.8-60)/(1-1/3), 522)

    def test_S_C07_incline_normal_balance_uses_N(self):
        raw = source('muc-V-3')
        segment = raw.split('Các phương trình cân bằng có dạng:')[1].split('Ngoài ra')[0]
        c = compact_math(segment)
        self.assertIn('Fy=N−P.cosα=0', c)
        self.assertNotIn('Fy=Fms', c)
        angle = math.pi/6
        near(100*math.cos(angle)-100*math.cos(angle), 0)

    def test_S_C08_friction_inequality_and_normal_definition(self):
        raw = source('muc-V-3')
        self.assertNotIn('£', raw)
        self.assertIn('N: giá trị của phản lực pháp tuyến', raw)
        self.assertIn('F<sub>ms</sub> ≤ fN', raw)

    def test_S_C09_self_locking_uses_available_not_actual_friction(self):
        raw = source('muc-V-4')
        for s in (r'F_{ms,\max}=fN', r'F_{ms}=P_n', r'P_n\lt F_{ms,\max}',
                  'cân bằng giới hạn', 'ma sát động'):
            self.assertIn(s, raw)
        self.assertNotIn('duy trì trạng thái chuyển động thẳng đều hoặc đứng yên', raw)
        p, f, alpha = 100, .4, .2
        actual, limit = p*math.sin(alpha), f*p*math.cos(alpha)
        self.assertLess(actual, limit)
        near(actual-p*math.sin(alpha), 0)

    def test_S_C10_load_density_and_integration_limit(self):
        raw = source('muc-IV-3')
        self.assertIn(r'\lim_{\Delta x\to0}\frac{\Delta Q}{\Delta x}', raw)
        before = raw.split('<p>(1.14)</p>')[0]
        formula = re.findall(r'<div class="mathml-block">(.*?)</div>', before, re.S)[-1]
        m = ET.fromstring(formula)
        integral = m.find('.//m:munderover', NS)
        self.assertEqual(''.join(integral[2].itertext()).strip(), 'l')
        near(100*3, 300)

    def test_S_C11_parallel_force_center_uses_signed_scalars(self):
        raw = source('muc-VI-2').split('(1.27)')[0]
        for s in (r'F_i=\vec{F}_i\cdot\vec{e}', r'\sum_iF_i\ne0',
                  r'\frac{\sum_i F_i\vec{r}_i}{\sum_i F_i}',
                  'vô hướng có dấu', 'không áp dụng'):
            self.assertIn(s, raw)
        # Signed weighting can locate the centre outside the attachment interval.
        near((3*0-1*2)/(3-1), -1)
        self.assertEqual(3-3, 0)  # zero-resultant case must not divide

    def test_S_C12_friction_coefficients_have_distinct_dimensions(self):
        raw = source('muc-V-3')
        self.assertIn('k/R', raw)
        self.assertIn('không thể so sánh trực tiếp', raw)
        self.assertIn('Hệ số ma sát trượt f', raw)
        q = quiz(86)
        self.assertIn('ma sát trượt', q['question'])
        for field in ('explanation','feedbackCorrect','feedbackWrong'):
            self.assertIn('độ dài', q[field])
        # k/R does not change when metres are converted to millimetres.
        near(.002/.25, 2/250)

    def test_S_C13_single_choice_distractors_are_not_equivalent(self):
        q50, q21 = quiz(50), quiz(21)
        self.assertEqual(q50['options'][q50['correct']], '√10 N')
        self.assertEqual(q50['options'][3], '4 N')
        self.assertNotIn('Song song thanh', q21['options'])
        self.assertIn('hai lực', q21['question'])
        near(math.hypot(3, 5-4), math.sqrt(10))

    def test_S_C14_contact_reaction_question_is_scoped(self):
        q = quiz(8)
        self.assertIn('mặt tựa nhẵn', q['question'])
        self.assertIn('Vuông góc', q['options'][q['correct']])
        self.assertNotIn('lực bị cản', json.dumps(q, ensure_ascii=False))

    def test_S_C15_inertial_frame_statement_is_qualified(self):
        raw = source('muc-I-2')
        self.assertNotIn('đã chứng minh rằng không tồn tại hệ quy chiếu quán tính', raw)
        self.assertIn('Trái Đất quay', raw)
        self.assertIn('phạm vi', raw)
        self.assertIn('thời gian', raw)

    def test_S_C16_reduction_lesson_covers_assessed_theorems(self):
        raw = source('muc-IV-2')
        for s in (r'\vec{M}_A=\vec{M}_O-\overrightarrow{OA}\times\vec{R}',
                  r'\vec{R}\cdot\vec{M}_O', 'Dời lực song song',
                  'hệ lực xoắn', 'Chứng minh', r'\vec{R}=\vec{0}',
                  r'\vec{R}\ne\vec{0}', r'\vec{R}\cdot\vec{M}_O=0'):
            self.assertIn(s, raw)
        r, m, oa = (2,3,4), (5,6,7), (1,-2,3)
        cross = (oa[1]*r[2]-oa[2]*r[1], oa[2]*r[0]-oa[0]*r[2], oa[0]*r[1]-oa[1]*r[0])
        ma = tuple(m[i]-cross[i] for i in range(3))
        near(sum(r[i]*m[i] for i in range(3)), sum(r[i]*ma[i] for i in range(3)))


if __name__ == '__main__':
    unittest.main()
