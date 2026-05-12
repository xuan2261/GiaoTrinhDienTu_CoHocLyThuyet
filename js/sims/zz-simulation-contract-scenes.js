/**
 * Canonical 58-route scene metadata used by release QA contracts.
 */
(function() {
'use strict';

const registry = window.SimSceneRegistry;
if (!registry) {
  console.warn('SimSceneRegistry missing for simulation contract scenes');
  return;
}

const rows = [
  ['ch1-1-3','force-vector','statics','Cau tao vec to luc','F = |F| u','F','alpha','|F|','Fx/Fy'],
  ['ch1-1-4','moment-arm','statics','Canh tay don mo men','MO = r x F','F','d','MO','d'],
  ['ch1-1-5','force-reducer','statics','Thu gon he luc phang','R = sum F; MO = sum r x F','F','x','R','MO'],
  ['ch1-1-6','couple-system','statics','Ngau luc','M = F a','F','a','M','a'],
  ['ch1-1-8','constraint-release','support','Luc chu dong va phan luc','rang buoc -> phan luc','F','mode','R','mode'],
  ['ch1-2-1','two-force-body','statics','Hai luc can bang','F1 + F2 = 0','F','alpha','verify','alpha'],
  ['ch1-2-3','parallelogram','statics','Hinh binh hanh luc','R = F1 + F2','F','alpha','R','alpha'],
  ['ch1-2-6','fbd-builder','checker','So do vat the tu do','sum F = 0; sum M = 0','load','mode','verify','MO'],
  ['ch1-3-1','smooth-support','support','Phan luc phap tuyen','N vuong goc mat tua','load','x','N','x'],
  ['ch1-3-2','cable-tension','support','Luc cang day','T doc theo day','load','alpha','T','alpha'],
  ['ch1-3-3','hinge-reaction','support','Phan luc ban le','R = Rx i + Ry j','load','alpha','Rx','Ry'],
  ['ch1-3-4','roller-pin','support','Goi di dong va goi co dinh','rang buoc -> R','load','mode','RA','RB'],
  ['ch1-3-6','fixed-support','support','Lien ket ngam','R va M ngam','load','x','R','M'],
  ['ch1-3-7','two-force-member','support','Thanh hai luc','luc doc truc thanh','load','alpha','N','alpha'],
  ['ch1-4-1','spatial-resultant','spatial','Vec to chinh khong gian','R = sum F','F','theta','Rx','Rz'],
  ['ch1-4-2','spatial-moment','spatial','Mo men chinh khong gian','M = r x F','F','theta','Mx','Mz'],
  ['ch1-4-4','spatial-equilibrium','spatial','Can bang he luc khong gian','sum Fx=sum Fy=sum Fz=0','load','mode','verify','eq'],
  ['ch1-5-1','contact-force','friction','Phan luc tiep xuc','R = N + Fms','mu','alpha','N','Fms'],
  ['ch1-5-2','friction-mode','friction','Trang thai ma sat','Fms <= mu N','mu','alpha','Fms','state'],
  ['ch1-5-3','friction-cone','friction','Non ma sat','tan phi = mu','mu','alpha','phi','state'],
  ['ch1-5-4','self-locking','friction','Dieu kien tu ham','alpha <= phi','mu','alpha','phi','state'],
  ['ch1-6-2','centroid-composite','centroid','Trong tam hinh ghep','xC = sum A x / sum A','area','x','xC','yC'],
  ['ch1-6-3','centroid-hole','centroid','Trong tam hinh khoet','A am cho phan khoet','area','x','xC','yC'],
  ['ch1-7-1','guided-statics','checker','Giai bai tap tinh hoc','lap FBD va phuong trinh','step','load','step','verify'],
  ['ch1-7-2','numeric-statics','checker','Doi chieu so tinh hoc','sai so can bang','case','answer','score','residual'],
  ['ch2-1-1','trajectory-param','kinematics','Quy dao chat diem','r = r(t); v = dr/dt','omega','t','x','v'],
  ['ch2-1-2','motion-graphs','kinematics','Do thi dong hoc','v = dx/dt; a = dv/dt','omega','t','x(t)','v(t)'],
  ['ch2-1-3','natural-coordinates','kinematics','Toa do tu nhien','a = at tau + an n','speed','rho','at','an'],
  ['ch2-1-4','motion-presets','kinematics','Mau chuyen dong','s(t), v(t), a(t)','omega','mode','x','v'],
  ['ch2-2-2','fixed-axis-rotation','kinematics','Chuyen dong quay','theta, omega, alpha','omega','alpha','theta','omega'],
  ['ch2-3-2','gear-transmission','kinematics','Truyen dong quay','omega1 r1 = omega2 r2','omega','ratio','omega2','v'],
  ['ch2-4-1','relative-composition','kinematics','Hop chuyen dong','v_a = v_e + v_r','ve','vr','va','vr'],
  ['ch2-4-2','relative-absolute','kinematics','Van toc tuyet doi va tuong doi','v_a = v_e + v_r','ve','vr','va','ve'],
  ['ch2-4-3','velocity-triangle','kinematics','Tam giac van toc','va, ve, vr','ve','vr','va','vr'],
  ['ch2-4-4','coriolis','kinematics','Gia toc Coriolis','a_c = 2 omega x v_r','omega','vr','ac','ae'],
  ['ch2-5-1','plane-motion','kinematics','Chuyen dong song phang','vB = vA + omega x AB','omega','theta','vA','vB'],
  ['ch2-5-2','instant-center','kinematics','Tam van toc tuc thoi','v = omega r_IC','omega','r','ICx','ICy'],
  ['ch2-5-3','velocity-distribution','kinematics','Phan bo van toc','vP = vA + omega x AP','omega','theta','vP','r'],
  ['ch2-7-1','guided-kinematics','checker','Giai bai tap dong hoc','chon cong thuc theo buoc','step','t','x','v'],
  ['ch2-7-2','numeric-kinematics','checker','Doi chieu so dong hoc','sai so x va v','case','answer','score','error'],
  ['ch3-1-2','force-motion','dynamics','Luc va chuyen dong','F -> a','F','m','a','v'],
  ['ch3-1-3','reference-frame','dynamics','He quy chieu','quan tinh va phi quan tinh','F','m','a','frame'],
  ['ch3-2-1','inertia','dynamics','Dinh luat quan tinh','sum F = 0 -> v const','F','m','v','a'],
  ['ch3-2-2','newton-2','dynamics','Dinh luat II Newton','F = m a','F','m','a','F'],
  ['ch3-2-3','newton-3','dynamics','Dinh luat III Newton','F_AB = -F_BA','F','m','FAB','FBA'],
  ['ch3-2-5','dynamic-fbd','dynamics','Dynamic FBD','sum F = m a','F','m','a','sumF'],
  ['ch3-3-1','ode-particle','dynamics','Phuong trinh vi phan chat diem','m xdd = sum F','k','m','x','v'],
  ['ch3-3-2','ode-system','dynamics','Phuong trinh vi phan co he','M qdd = Q','k','m','x1','x2'],
  ['ch3-4-1','direct-dynamics','dynamics','Bai toan thuan dong luc','F da biet -> chuyen dong','F','m','a','x'],
  ['ch3-4-2','inverse-dynamics','dynamics','Bai toan nguoc dong luc','chuyen dong -> F','F','m','a','Fyc'],
  ['ch3-5-1','center-of-mass','dynamics','Dinh ly khoi tam','m aC = sum F_ext','F','m','aC','xC'],
  ['ch3-5-2','impulse-momentum','dynamics','Dong luong va xung luong','J = Delta p','J','m','p0','p1'],
  ['ch3-5-3','angular-momentum','dynamics','Mo men dong luong','H = I omega','H','I','L','omega'],
  ['ch3-5-4','work-energy','dynamics','Dinh ly dong nang','A = Delta T','F','s','A','T'],
  ['ch3-6-2','collision-restitution','dynamics','Va cham co he so phuc hoi','e = v_sep/v_app','e','m1','vn','vt'],
  ['ch3-6-3','collision-solver','dynamics','Giai bai toan va cham','bao toan dong luong','e','m1','p','loss'],
  ['ch3-7-1','theorem-selector','checker','Chon dinh ly dong luc','chon xC, p, L, T','case','theorem','score','verify'],
  ['ch3-7-2','dynamics-checker','checker','Doi chieu so dong luc','sai so ket qua','case','answer','score','residual'],
];

function state(routeId, index) {
  const x = 145 + (index * 29) % 270;
  const y = 130 + (index * 17) % 120;
  return {
    routeId,
    primary: { x, y },
    vector: { x: x + 58 + (index % 5) * 13, y: y - 42 + (index % 7) * 9 },
    secondary: { x: 420 - (index * 11) % 150, y: 185 + (index % 4) * 22 },
    force: 70 + index,
    mass: 4 + index % 9,
    load: 75 + index * 2,
    mu: 0.25 + (index % 7) * 0.04,
    omega: 0.8 + (index % 8) * 0.22,
    radius: 45 + (index % 6) * 7,
    t: index * 0.07,
    mode: `M${index % 4}`
  };
}

function scene(row, index) {
  const [routeId, template, family, title, formula, c1, c2, r1, r2] = row;
  return {
    routeId,
    sceneId: `${routeId}-${template}`,
    template,
    family,
    title,
    formula,
    visualKey: `${template}-${index + 1}`,
    visualLabel: title,
    seed: index + 101,
    initialState: state(routeId, index),
    controls: [
      { type: 'slider', key: c1, label: c1, min: 0, max: 200, value: 50 + index % 40, step: 1, unit: '' },
      { type: 'slider', key: c2, label: c2, min: 0, max: 120, value: 10 + index % 30, step: 1, unit: '' }
    ],
    readouts: [
      { label: r1, key: r1.toLowerCase().replace(/[^a-z0-9]/g, '') || 'resultantMagnitude', digits: 2 },
      { label: r2, key: r2.toLowerCase().replace(/[^a-z0-9]/g, '') || 'moment', digits: 2 }
    ]
  };
}

registry.registerMany(rows.map(scene));

})();
