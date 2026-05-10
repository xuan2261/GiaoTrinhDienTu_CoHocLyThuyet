# Simulation Coverage Matrix

## Legend

| Priority | Meaning |
|---|---|
| P1 | High impact, implement first |
| P2 | Useful, implement after P1 |
| P3 | Nice-to-have or lightweight visual |

## Current Existing Sim Routes

`ch1-1-4`, `ch1-1-6`, `ch1-2-3`, `ch1-3-3`, `ch1-4-4`, `ch1-6-2`, `ch2-1-1`, `ch2-1-3`, `ch2-2-2`, `ch2-3-2`, `ch2-4-3`, `ch2-5-1`, `ch3-2-2`, `ch3-2-3`, `ch3-4-1`, `ch3-5-2`, `ch3-5-4`, `ch3-6-2`.

## Chapter 1 Tĩnh Học

| Route | Topic | Proposed Interaction | Priority |
|---|---|---|---|
| ch1-1-1 | Vật rắn tuyệt đối | rigid vs deformable visual toggle | P3 |
| ch1-1-2 | Cân bằng | equilibrium state classifier | P2 |
| ch1-1-3 | Lực | force vector anatomy: point, direction, magnitude | P1 |
| ch1-1-4 | Mô men | extend current moment: sign, lever arm, line of action | P1 |
| ch1-1-5 | Hệ lực | force system reducer and force polygon | P1 |
| ch1-1-6 | Ngẫu lực | extend couple: free vector moment, distance effect | P1 |
| ch1-1-7 | Vật tự do/không tự do | DOF lock visual | P2 |
| ch1-1-8 | Lực liên kết/phản lực | reaction direction classifier | P1 |
| ch1-2-1 | Hai lực cân bằng | draggable two-force equilibrium | P1 |
| ch1-2-2 | Thêm/bớt cặp lực | invariant equilibrium animation | P2 |
| ch1-2-3 | Hình bình hành lực | preserve/clean existing | P1 |
| ch1-2-4 | Tác dụng/phản tác dụng | paired-body interaction visual | P2 |
| ch1-2-5 | Hóa rắn | deformable-to-rigid assumption toggle | P3 |
| ch1-2-6 | Giải phóng liên kết | FBD builder | P1 |
| ch1-3-1 | Liên kết tựa | reaction normal selector | P1 |
| ch1-3-2 | Dây mềm | tension-only visual | P1 |
| ch1-3-3 | Bản lề | preserve support type selector | P1 |
| ch1-3-4 | Gối | movable/fixed support reaction builder | P1 |
| ch1-3-5 | Gối cầu | 3D reaction components visual | P2 |
| ch1-3-6 | Ngàm | fixed-end force + moment visual | P1 |
| ch1-3-7 | Thanh | two-force member visual | P1 |
| ch1-4-1 | Véc tơ chính | 3D/2.5D vector sum | P1 |
| ch1-4-2 | Mô men chính | moment about point/axis | P1 |
| ch1-4-3 | Dạng hệ lực | reducer state classifier | P2 |
| ch1-4-4 | Điều kiện cân bằng KG | replace/extend beam with equilibrium equation board | P1 |
| ch1-4-5 | Hệ lực đặc biệt | equation picker by force system | P2 |
| ch1-5-1 | Ma sát khái niệm | contact force decomposition | P1 |
| ch1-5-2 | Phân loại ma sát | static/sliding/rolling tabs | P1 |
| ch1-5-3 | Định luật ma sát | friction cone + inclined plane | P1 |
| ch1-5-4 | Tự hãm | wedge/screw self-locking lab | P1 |
| ch1-6-1 | Trọng tâm khái niệm | balance point visual | P2 |
| ch1-6-2 | Công thức trọng tâm | preserve/extend centroid calculator | P1 |
| ch1-6-3 | Tính chất trọng tâm | symmetry/composite/hole lab | P1 |
| ch1-7-1 | Hướng dẫn bài tập | guided FBD + equation steps | P1 |
| ch1-7-2 | Bài tập | numeric checker set | P1 |
| ch1-7-3 | Câu hỏi ôn tập | micro quiz links to sims | P2 |

## Chapter 2 Động Học

| Route | Topic | Proposed Interaction | Priority |
|---|---|---|---|
| ch2-1-1 | Phương pháp véc tơ | preserve/extend path vectors | P1 |
| ch2-1-2 | Tọa độ Đề các | `x(t), y(t), v, a` graph lab | P1 |
| ch2-1-3 | Tọa độ tự nhiên | preserve/extend `τ,n,b` | P1 |
| ch2-1-4 | Chuyển động đặc biệt | preset motion gallery | P1 |
| ch2-2-1 | Tịnh tiến | equal velocity/acceleration of body points | P2 |
| ch2-2-2 | Quay trục cố định | preserve/extend angular kinematics | P1 |
| ch2-3-1 | Truyền động khái niệm | input-output speed visual | P2 |
| ch2-3-2 | Truyền động đơn giản | extend gears with belt/pulley | P1 |
| ch2-4-1 | Bài toán hợp CĐ | moving frame scenario selector | P1 |
| ch2-4-2 | Định nghĩa chuyển động | absolute/relative/transport toggle | P1 |
| ch2-4-3 | Hợp vận tốc | preserve/extend boat/conveyor | P1 |
| ch2-4-4 | Hợp gia tốc | Coriolis + relative acceleration lab | P1 |
| ch2-5-1 | Chuyển động song phẳng model | preserve rolling visual | P1 |
| ch2-5-2 | Khảo sát vật rắn | instantaneous center finder | P1 |
| ch2-5-3 | Điểm thuộc vật rắn | velocity distribution + slider-crank | P1 |
| ch2-6-1 | Quay quanh điểm cố định | 2.5D fixed point rotation | P2 |
| ch2-6-2 | Phân tích chuyển động | Euler angle/precession visual | P2 |
| ch2-7-1 | Hướng dẫn bài tập | kinematics step checker | P1 |
| ch2-7-2 | Bài tập | numeric/graph checker set | P1 |
| ch2-7-3 | Câu hỏi ôn tập | micro quiz links to sims | P2 |

## Chapter 3 Động Lực Học

| Route | Topic | Proposed Interaction | Priority |
|---|---|---|---|
| ch3-1-1 | Vật thể | particle/body/system selector | P2 |
| ch3-1-2 | Lực | force-motion concept lab | P1 |
| ch3-1-3 | HQC quán tính | inertial vs non-inertial frame visual | P1 |
| ch3-2-1 | Định luật quán tính | zero-force motion visual | P1 |
| ch3-2-2 | F=ma | preserve/extend Newton lab | P1 |
| ch3-2-3 | Newton 3 | preserve/extend paired interaction | P1 |
| ch3-2-4 | Độc lập tác dụng lực | superposition of accelerations | P2 |
| ch3-2-5 | Giải phóng liên kết | dynamic FBD with constraints | P1 |
| ch3-3-1 | PT vi phân chất điểm | numerical integrator + graph | P1 |
| ch3-3-2 | PT vi phân cơ hệ | coupled mass/system visual | P1 |
| ch3-4-1 | Bài toán thuận | preserve/clarify forward solver | P1 |
| ch3-4-2 | Bài toán ngược | inverse dynamics from motion | P1 |
| ch3-5-1 | Khối tâm | center-of-mass theorem lab | P1 |
| ch3-5-2 | Động lượng | preserve/extend impulse plot | P1 |
| ch3-5-3 | Mô men động lượng | angular momentum conservation lab | P1 |
| ch3-5-4 | Động năng | preserve/extend work-energy | P1 |
| ch3-6-1 | Đặc điểm va chạm | collision assumption visual | P2 |
| ch3-6-2 | Định lý va chạm | preserve/extend coefficient `e` | P1 |
| ch3-6-3 | Bài toán va chạm | elastic/inelastic/oblique solver | P1 |
| ch3-7-1 | Hướng dẫn bài tập | dynamics theorem selector | P1 |
| ch3-7-2 | Bài tập | numeric checker set | P1 |
| ch3-7-3 | Câu hỏi ôn tập | micro quiz links to sims | P2 |
