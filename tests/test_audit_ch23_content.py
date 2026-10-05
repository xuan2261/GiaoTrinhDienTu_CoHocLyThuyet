"""Academic regression contracts C2-01..13, C3-01..12, Q-01..05.

Reads published HTML/quiz data. The numerical checks interpret the repaired
MathML expressions and compare them with independent kinematic/mechanical
invariants; no simulation kernel is imported. Run directly with Python.
"""
import ast
import json
import math
import os
from pathlib import Path
import random
import re
import unittest
from lxml import etree, html

ROOT = Path(os.environ.get('MECHANICS_CONTENT_ROOT', Path(__file__).resolve().parents[1]))

def compact(node):
    return re.sub(r'\s+', '', ''.join(node.itertext()))

def page(ch, name):
    return html.fromstring((ROOT / f'chapters/ch{ch}/{name}.html').read_text())

# Original formula positions at audit baseline 36e9289, used when semantic IDs
# are absent. RED tests therefore exercise the faulty original expression,
# rather than merely failing because an ID is new.
BASELINE_FORMULA_INDEX = {(2, 'muc-II-2', '2.28'): 48, (2, 'muc-II-2', '2.20'): 19, (2, 'muc-III-2', '2.29-radius'): 0, (2, 'muc-III-2', '2.29-teeth'): 1, (2, 'muc-I-1', '2.2'): 8, (2, 'muc-I-1', '2.3'): 15, (2, 'muc-I-2', 'ellipse-velocity'): 14, (2, 'muc-I-4', '2.15'): 5, (2, 'muc-V-3', '2.43'): 2, (2, 'muc-VII-1', 'exercise-1-speed'): 1, (2, 'muc-VII-1', 'flywheel-acceleration'): 14, (2, 'muc-VII-1', 'exercise-3-angular-acceleration'): 33, (2, 'muc-VII-1', 'exercise-4-angular-acceleration'): 50, (2, 'muc-I-1', 'direction-summary'): 25, (2, 'muc-I-1', 'speed-summary'): 29, (3, 'muc-VI-3', '3.55'): 16, (3, 'muc-VI-3', '3.56'): 17, (3, 'muc-VI-3', '3.57'): 18, (3, 'muc-III-1', 'acceleration-definition'): 5, (3, 'muc-III-1', '3.4'): 6, (3, 'muc-III-1', '3.5'): 7, (3, 'muc-V-3', '3.23'): 0, (3, 'muc-V-1', '3.13'): 6, (3, 'muc-V-2', '3.17'): 6, (3, 'muc-V-2', '3.22'): 34, (3, 'muc-V-3', 'rotational-angular-momentum'): 10, (3, 'muc-V-3', '3.29'): 16, (3, 'muc-VI-3', '3.62'): 35, (3, 'muc-VI-3', '3.54'): 8, (3, 'muc-IV-1', 'ellipse-second-derivatives'): 16, (3, 'muc-VII-1', 'ellipse-second-derivatives'): 13, (3, 'muc-VII-1', 'pulley-acceleration'): 11, (3, 'muc-VII-2', 'incline-friction-coefficient'): 9, (3, 'muc-VII-2', 'incline-friction-bound'): 16, (3, 'muc-V-2', 'impulse-integral'): 23, (3, 'muc-V-2', 'impulse-states'): 25, (2, 'muc-I-3', 'motion-direction'): 7, (2, 'muc-I-3', 'motion-speed'): 16}

def formula(ch, name, key):
    nodes = page(ch, name).xpath(f'.//math[@data-equation-id="{key}"]')
    if len(nodes) > 1:raise AssertionError(f'Repeated semantic equation {ch}/{name}#{key}')
    if nodes:return nodes[0]
    index=BASELINE_FORMULA_INDEX.get((ch,name,key))
    if index is None:raise AssertionError(f'Missing equation {ch}/{name}#{key}')
    return page(ch,name).xpath('.//math')[index]

def q(ch, number):
    bank=json.loads((ROOT/f'data/quiz-ch{ch}.json').read_text())
    return next(item for item in bank['items'] if item['id']==f'quiz-ch{ch}-{number:03}')

def identifier(n):
    if n.tag in ('mrow', 'math') and len(n)==1: return identifier(n[0])
    if n.tag=='mover': return identifier(n[0])
    if n.tag=='msub': return identifier(n[0])+'_'+compact(n[1])
    if n.tag=='msubsup' and compact(n[2]) in ("'",'′'):return identifier(n[0])+'_'+compact(n[1])+'_prime'
    if n.tag=='msup' and compact(n[1]) in ("'",'′'):return identifier(n[0])+'_prime'
    return compact(n)

def expression(n):
    """Small arithmetic-only Presentation MathML interpreter, not a kernel."""
    if n.tag in ('mn','mi'):return n.text.replace(',','.')
    if n.tag=='mo':return (n.text or '').replace('−','-').replace('·','*').replace('.','*')
    if n.tag=='mover':return expression(n[0])
    if n.tag=='msubsup' and compact(n[2]) in ("'",'′'):return identifier(n)
    if n.tag=='msub' or (n.tag=='msup' and compact(n[1]) in ("'",'′')):return identifier(n)
    if n.tag=='mfrac':return '(('+expression(n[0])+')/('+expression(n[1])+'))'
    if n.tag=='msup':return '(('+expression(n[0])+')**('+expression(n[1])+'))'
    if n.tag=='msqrt':return 'sqrt('+expression(n[0])+')'
    if n.tag not in ('mrow','math'):raise AssertionError('Unsupported arithmetic '+n.tag)
    parts=[]
    for child in n:
        value=expression(child)
        atom=child.tag!='mo'
        if parts:
            prev=parts[-1][0]
            left=parts[-1][1] or prev==')'
            right=atom or value=='('
            if left and right:
                # Separate digit runs are a legacy exporter representation.
                if child.tag=='mn' and parts[-1][2]=='mn':parts[-1]=(prev+value,True,'mn');continue
                parts.append(('*',False,'mo'))
        parts.append((value,atom,child.tag))
    return ''.join(p[0] for p in parts)

def compute(nodes, env):
    row=etree.Element('mrow')
    for n in nodes:row.append(etree.fromstring(etree.tostring(n)))
    source=expression(row)
    tree=ast.parse(source,mode='eval')
    allowed=(ast.Expression,ast.BinOp,ast.UnaryOp,ast.Constant,ast.Name,ast.Load,
             ast.Add,ast.Sub,ast.Mult,ast.Div,ast.Pow,ast.USub,ast.UAdd,ast.Call)
    if any(not isinstance(n,allowed) for n in ast.walk(tree)):raise AssertionError(source)
    for call in (n for n in ast.walk(tree) if isinstance(n,ast.Call)):
        if not isinstance(call.func,ast.Name) or call.func.id!='sqrt':raise AssertionError(source)
    result=eval(compile(tree,'<MathML arithmetic>','eval'),{'__builtins__':{},'sqrt':math.sqrt},env)
    if not math.isfinite(result):raise AssertionError('Non-finite result: '+source)
    return result

def rhs(node):
    row=node[0];eqs=[i for i,n in enumerate(row) if n.tag=='mo' and n.text=='=']
    return list(row)[eqs[-1]+1:]

def cross(a,b):return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def dot(a,b):return sum(x*y for x,y in zip(a,b))

class AcademicRepairTests(unittest.TestCase):
    def test_C2_01_direction_and_speed_are_distinct(self):
        a=formula(2,'muc-I-3','motion-direction');b=formula(2,'muc-I-3','motion-speed')
        self.assertEqual(compact(a),'c→=v→×a→');self.assertIn('q=v→·a→',compact(b))
        prose=page(2,'muc-I-3').text_content()
        for s in ['mọi thời điểm','điểm dừng','gia tốc toàn phần']:self.assertIn(s,prose)
        # Uniform circular motion and accelerated straight motion disagree with old dot rule.
        self.assertNotEqual(cross((0,2,0),(-4,0,0)),(0,0,0));self.assertEqual(dot((0,2,0),(-4,0,0)),0)
        self.assertEqual(cross((2,0,0),(3,0,0)),(0,0,0));self.assertGreater(dot((2,0,0),(3,0,0)),0)

    def test_C2_02_tangential_acceleration_uses_radius(self):
        n=formula(2,'muc-II-2','2.28')
        # Read the final cross-product operand from the actual printed formula.
        operand=n[0][-1];name=compact(operand).replace('→','')
        actual=cross((0,0,2),{'r':(1,0,0),'v':(0,3,0)}[name])
        self.assertEqual(actual,(0,2,0))
        self.assertTrue(compact(n).endswith('a→t=ε→∧r→'))

    def test_C2_03_angle_matches_integrated_angular_velocity(self):
        n=formula(2,'muc-II-2','2.20')
        for t in [0,.2,1,3,8]:
            env={'φ_0':.3,'ω_0':-2,'ε_0':2,'t':t}
            actual=compute(rhs(n),env)
            # Trapezoidal integration is exact for linearly changing angular velocity.
            expected=.3+t*(-2+(-2+2*t))/2
            self.assertAlmostEqual(actual,expected)

    def test_C2_04_driver_driven_ratio_reciprocates_geometry(self):
        radius=formula(2,'muc-III-2','2.29-radius');teeth=formula(2,'muc-III-2','2.29-teeth')
        for r1,r2 in [(1,2),(3,1),(.3,2.7)]:
            ratio=compute([radius.xpath('.//mfrac')[-1]],{'r_1':r1,'r_2':r2})
            omega1=7;omega2=omega1*r1/r2
            self.assertAlmostEqual(ratio,omega1/omega2)
        self.assertEqual(compact(radius.xpath('.//mfrac')[-1]),'r2r1')
        self.assertEqual(compact(teeth.xpath('.//mfrac')[-1]),'Z2Z1')

    def test_C2_05_position_derivative_accents(self):
        for key,accent in [('2.2','˙'),('2.3','¨')]:
            n=formula(2,'muc-I-1',key)[0][-1]
            self.assertEqual(n.tag,'mover');self.assertEqual(compact(n[1]),accent);self.assertEqual(compact(n[0]),'r→')
        self.assertNotEqual(3**2,2*3);self.assertNotEqual(3**2,2)

    def test_C2_06_ellipse_velocity_has_no_constant_offset(self):
        n=formula(2,'muc-I-2','ellipse-velocity');s=compact(n)
        self.assertIn('vy=y.=−dω.sinωt',s);self.assertNotIn('−b−d',s)
        # Differentiate y=d cos(omega t) numerically at asymmetric times.
        for t in [0,.4,1.2]:
            h=1e-5;d=2;w=3;fd=(d*math.cos(w*(t+h))-d*math.cos(w*(t-h)))/(2*h)
            self.assertAlmostEqual(fd,-d*w*math.sin(w*t),places=8)

    def test_C2_07_projectile_initial_vertical_velocity(self):
        n=formula(2,'muc-I-4','2.15');self.assertIn('y=y0+v0yt',compact(n));self.assertNotIn('yOy',compact(n))
        self.assertEqual(3+4*2-.5*10*2**2,-9)

    def test_C2_08_velocity_uses_actual_point_M(self):
        n=formula(2,'muc-V-3','2.43');self.assertTrue(compact(n).endswith('ω→∧AM→'))
        self.assertIn('Vị trí của điểm M',page(2,'muc-V-3').text_content())
        self.assertNotEqual(cross((0,0,2),(3,0,0)),cross((0,0,2),(1,0,0)))

    def test_C2_09_finite_centers_include_degenerate_cases(self):
        s=page(2,'muc-V-3').text_content()
        for part in ['khi ω ≠ 0','không có tâm hữu hạn','tâm không duy nhất','ε² + ω⁴ > 0','không có tâm gia tốc hữu hạn']:self.assertIn(part,s)
        for no in [34,82]:self.assertIn('khác không',q(2,no)['question']);self.assertIn('không duy nhất',q(2,no)['explanation'])
        # The planar acceleration map [-w²,-e;e,-w²] is invertible exactly here.
        for w,e in [(0,0),(0,2),(3,0),(2,-4)]:self.assertEqual((-w*w)**2+e*e,w**4+e**2)

    def test_C2_10_speed_nonnegative_and_reversal_intervals(self):
        n=formula(2,'muc-VII-1','exercise-1-speed');self.assertIn('10|1−t|',compact(n))
        s=page(2,'muc-VII-1').text_content();self.assertIn('Khi t > 1 s',s);self.assertIn('100(t − 1) > 0',s)
        for t in [0,.5,1,2,3]:
            v=(8*(1-t),6*(1-t));self.assertAlmostEqual(math.hypot(*v),10*abs(1-t))
            self.assertEqual(dot(v,(-8,-6)),100*(t-1))

    def test_C2_11_flywheel_acceleration_norm(self):
        n=formula(2,'muc-VII-1','flywheel-acceleration');root=n.xpath('.//msqrt')[0]
        self.assertAlmostEqual(compute([root],{}),math.hypot(450,6))
        self.assertIn('≈450,04',compact(n));self.assertGreater(compute([root],{}),450)

    def test_C2_12_angular_acceleration_units(self):
        a=formula(2,'muc-VII-1','exercise-3-angular-acceleration');b=formula(2,'muc-VII-1','exercise-4-angular-acceleration')
        self.assertIn('rad/s2',compact(a));self.assertTrue(compact(b).endswith('3s−2'))
        # (length / time²) / length has time exponent -2.
        self.assertEqual((1-1,-2-0),(0,-2))

    def test_C2_13_motion_summary_cells_are_complete(self):
        for key,nrows in [('direction-summary',2),('speed-summary',3)]:
            rows=formula(2,'muc-I-1',key).xpath('.//mtr');self.assertEqual(len(rows),nrows)
            for row in rows:self.assertTrue(row.xpath('./mtd/mtext'));self.assertTrue(compact(row[-1]))
        s=page(2,'muc-I-1').text_content();self.assertIn('mọi thời điểm',s);self.assertIn('điểm dừng',s)

    def test_C3_01_collision_velocity_conserves_momentum(self):
        n1=formula(3,'muc-VI-3','3.55');n2=formula(3,'muc-VI-3','3.56');rng=random.Random(102026)
        cases=[(2,3,4,-1,.6),(1,1,1,0,1)]+[(rng.uniform(.2,8),rng.uniform(.2,8),rng.uniform(1,9),rng.uniform(-5,0),rng.random()) for _ in range(100)]
        for m1,m2,v1,v2,k in cases:
            env={'m_1':m1,'m_2':m2,'v_1':v1,'v_2':v2,'k':k};u1=compute(rhs(n1),env);u2=compute(rhs(n2),env)
            self.assertAlmostEqual(m1*u1+m2*u2,m1*v1+m2*v2,places=10)
            self.assertAlmostEqual(u2-u1,k*(v1-v2),places=10)
            loss=.5*(m1*v1*v1+m2*v2*v2-m1*u1*u1-m2*u2*u2)
            self.assertAlmostEqual(loss,.5*m1*m2/(m1+m2)*(1-k*k)*(v1-v2)**2,places=9)

    def test_C3_02_restitution_is_separation_over_approach(self):
        n=formula(3,'muc-VI-3','3.57')
        self.assertAlmostEqual(compute(rhs(n),{'v_1_prime':0,'v_2_prime':1,'v_1':1,'v_2':0}),1)
        self.assertIn('tốc độ tiếp cận khác không',page(3,'muc-VI-3').text_content())

    def test_C3_03_ode_has_velocity_and_acceleration_derivatives(self):
        a=formula(3,'muc-III-1','acceleration-definition');ode=formula(3,'muc-III-1','3.4');xyz=formula(3,'muc-III-1','3.5')
        self.assertEqual(compact(a[0][-1][1]),'¨')
        self.assertIn('mr→¨=F→(t,r→,r→˙)',compact(ode))
        self.assertIn('mx¨=Fx',compact(xyz));self.assertFalse(xyz.xpath('.//mover[count(*)!=2]'))

    def test_C3_04_angular_momentum_is_cross_product(self):
        n=formula(3,'muc-V-3','3.23');self.assertTrue(compact(n).endswith('r→×mv→'))
        self.assertEqual(cross((1,0,0),(0,1,0)),(0,0,1));self.assertEqual(dot((1,0,0),(0,1,0)),0)

    def test_C3_05_all_six_component_and_moment_repairs(self):
        xyz=compact(formula(3,'muc-V-1','3.13'));self.assertIn('mzC..=∑Fkze',xyz);self.assertEqual(xyz.count('myC'),1)
        mom=formula(3,'muc-V-2','3.17');self.assertEqual(compact(mom).count('∑'),6)
        self.assertIn('∑F→ke',compact(formula(3,'muc-V-2','3.22')))
        rot=formula(3,'muc-V-3','rotational-angular-momentum');self.assertTrue(compact(rot).endswith('rk2mkω=Jzω'))
        deriv=formula(3,'muc-V-3','3.29');self.assertEqual(compact(deriv.xpath('.//mfrac')[0]),'dL0→dt')
        impulse=formula(3,'muc-VI-3','3.62');self.assertIn('aS.sinα',compact(impulse))
        # Independent multi-particle sums; verifies why lost sum/radius changes physics.
        masses=[2,3];radii=[1,4];w=5
        self.assertEqual(sum(m*r*(r*w) for m,r in zip(masses,radii)),sum(m*r*r for m,r in zip(masses,radii))*w)
        self.assertEqual(sum(m*v for m,v in [(2,3),(5,-1)]),1)
        self.assertAlmostEqual(2*7*math.sin(math.pi/6),7)

    def test_C3_06_opposite_recovery_impulses(self):
        n=formula(3,'muc-VI-3','3.54');self.assertIn('−Δpkp=−∫',compact(n))
        j=3;self.assertEqual(j+(-j),0)

    def test_C3_07_both_ellipse_second_derivatives_negative(self):
        for f in ['muc-IV-1','muc-VII-1']:
            s=compact(formula(3,f,'ellipse-second-derivatives'))
            self.assertIn('=−ak2coskt=−k2.x',s);self.assertIn('=−bk2sinkt=−k2.y',s)
        for t in [.2,.8,1.5]:
            h=1e-4;k=2;a=3;f=lambda x:a*math.cos(k*x)
            self.assertAlmostEqual((f(t+h)-2*f(t)+f(t-h))/(h*h),-k*k*f(t),places=6)

    def test_C3_08_pulled_block_intermediate_steps(self):
        s=page(3,'muc-VII-1').text_content();self.assertIn('cosα = √(1 − sin²α) = 0,8',s);self.assertIn('µ(mg − F sinα)',s)
        normal=4*10-6*.6;a=(6*math.sqrt(1-.6**2)-.1*normal)/4
        self.assertAlmostEqual(a,.29);self.assertAlmostEqual(.5*a*5**2,3.625)

    def test_C3_09_pulley_acceleration_keeps_chosen_sign(self):
        n=formula(3,'muc-VII-1','pulley-acceleration');self.assertTrue(compact(n).endswith('=−2,5m/s²'))
        # Independently solve the two tension equations with a2=-2 a1.
        a=-2.5;T=1*(10-2*a);self.assertEqual(2*T-4*10,4*a)
        row=n[0];fr=row.xpath('./mfrac')[0]
        actual=compute([fr],{'m_1':4,'m_2':1})*10;self.assertEqual(actual,a)

    def test_C3_10_incline_coefficient_and_friction_dimensions(self):
        mu=formula(3,'muc-VII-2','incline-friction-coefficient');value=compute(rhs(mu),{})
        self.assertAlmostEqual(value,1/(2*math.sqrt(3)))
        bound=compact(formula(3,'muc-VII-2','incline-friction-bound'));self.assertIn('≤μ.m1g.cosα',bound);self.assertNotIn('.N',bound)
        lo=3*.5-value*3*math.cos(math.pi/6);hi=3*.5+value*3*math.cos(math.pi/6)
        self.assertAlmostEqual(lo,.75);self.assertAlmostEqual(hi,2.25)
        for m2 in [.5,.75,1.5,2.25,2.5]:self.assertEqual(abs(m2*10-15)<=value*30*math.cos(math.pi/6)+1e-12,.75<=m2<=2.25)

    def test_C3_11_force_changes_velocity(self):
        s=page(3,'muc-II-2').text_content();self.assertIn('hợp lực gây gia tốc',s);self.assertIn('vẫn có thể chuyển động thẳng đều',s)
        self.assertNotIn('lực là nguyên nhân làm cho chất điểm chuyển động',s)

    def test_C3_12_impulse_limits_match_states(self):
        n=formula(3,'muc-V-2','impulse-integral');limits=n.xpath('.//munderover')[0]
        self.assertEqual(compact(limits[1]),'Q0');self.assertEqual(compact(limits[2]),'Q1')
        self.assertEqual(compact(formula(3,'muc-V-2','impulse-states')),'Q→0,Q→1')
        q0=4;force=3;t0=2;t1=5;q1=q0+force*(t1-t0);self.assertEqual(q1-q0,9)

    def test_Q_01_open_belt_grading_and_feedback(self):
        item=q(2,20);self.assertIn('đai thẳng',item['question']);self.assertEqual(item['options'][item['correct']],'Cùng chiều')
        self.assertEqual(item['correct'],0)
        for field in ['explanation','feedbackCorrect','feedbackWrong']:
            self.assertIn('Đai thẳng: hai bánh quay cùng chiều',item[field]);self.assertIn('đai chéo: hai bánh quay ngược chiều',item[field])
        self.assertEqual(len(set(item['options'])),4)

    def test_Q_02_first_problem_follows_course_convention(self):
        item=q(3,4);self.assertEqual(item['correct'],1);self.assertEqual(item['section'],'IV');self.assertIn('quy ước',item['question'])
        for field in ['explanation','feedbackCorrect','feedbackWrong']:self.assertIn('biết chuyển động để tìm lực',item[field])
        self.assertIn('cho biết chuyển động',page(3,'muc-IV-1').text_content())

    def test_Q_03_Euler_angle_convention_consistent(self):
        item=q(2,39);self.assertEqual(item['options'][item['correct']],'ψ: tiến động; θ: trương động; φ: quay riêng')
        for field in ['explanation','feedbackCorrect','feedbackWrong']:self.assertIn('ψ cho tiến động, θ cho trương động và φ cho quay riêng',item[field])

    def test_Q_04_slider_crank_finite_rod(self):
        item=q(2,50);self.assertIn('L > R',item['question']);self.assertEqual(item['correct'],1)
        for field in ['explanation','feedbackCorrect','feedbackWrong']:
            self.assertIn('1 + R cosφ/√(L² − R² sin²φ)',item[field]);self.assertIn('R/L rất nhỏ',item[field])
        # Differentiate rod-length constraint d²+(R sin phi)²=L², independently.
        R=1;L=2;w=1;p=math.pi/4;py=R*math.sin(p);d=math.sqrt(L*L-py*py)
        expected=-R*w*math.sin(p)-py*(R*w*math.cos(p))/d
        self.assertAlmostEqual(expected,-.9743680231,places=9);self.assertNotAlmostEqual(expected,-R*w*math.sin(p),places=5)

    def test_Q_05_single_choice_domains_and_distinct_options(self):
        self.assertIn('định nghĩa',q(2,12)['question']);self.assertNotIn('ω = v/r',q(2,12)['options'])
        self.assertIn('Hai chuyển động tịnh tiến',q(2,30)['options'])
        for n in [26,65]:
            item=q(2,n);self.assertIn('không song song',item['options'][item['correct']]);self.assertIn('không song song',item['feedbackWrong'])
        self.assertIn('vuông góc nhau',q(2,29)['question']);self.assertIn('Song song với ω',q(2,29)['options'])
        self.assertIn('có thể thay đổi',q(2,40)['options'][1]);self.assertIn('không bắt buộc',q(2,40)['feedbackWrong'])
        self.assertEqual(cross((0,0,2),(0,0,3)),(0,0,0))

if __name__=='__main__':unittest.main(verbosity=2)
