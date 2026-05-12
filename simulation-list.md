# Danh sách Mô phỏng trong Giáo trình Điện tử Cơ học lý thuyết

Tài liệu này liệt kê toàn bộ 58 mô phỏng (simulations) có trong giáo trình, được chia theo các chương: Tĩnh học, Động học và Động lực học.

## Thông tin chung
- **Vùng hiển thị (Canvas Size):** 560 x 340 pixels.
- **Công nghệ sử dụng:** HTML5 Canvas, JavaScript (Vanilla), MathJax/KaTeX cho công thức.
- **Cơ chế tương tác:** Kéo thả trực tiếp (Direct Manipulation), thanh trượt (Sliders), và nút bấm (Buttons).

---

## Chương 1: Tĩnh học (25 mô phỏng)

| Mã | Tên mô phỏng | Ý định (Mục tiêu) | Nội dung & Công thức | Kết quả cần đạt (Readouts) |
|---|---|---|---|---|
| **ch1-1-3** | Cấu tạo véc tơ lực | Nhận diện điểm đặt, phương chiều và độ lớn của véc tơ lực. | $F_x = F \cos \alpha; F_y = F \sin \alpha$ | Độ lớn $F_x, F_y$, Góc $\alpha$ |
| **ch1-1-4** | Cánh tay đòn mô men | Quan sát quan hệ giữa lực, cánh tay đòn và mô men quanh điểm mốc. | $M_O = \vec{r} \times \vec{F} = F \cdot d$ | Mô men $M_O$, Cánh tay đòn $d$ |
| **ch1-1-5** | Thu gọn hệ lực phẳng | Thu gọn hệ lực phẳng thành hợp lực và mô men tương đương. | $R = \sum F; M_O = \sum (\vec{r} \times \vec{F})$ | Hợp lực $R$, Mô men $M_O$ |
| **ch1-1-6** | Mô men ngẫu lực tự do | Khảo sát ngẫu lực và mô men ngẫu lực khi đổi khoảng cách hai lực. | $M = F \cdot a$ | Mô men ngẫu lực $M$, Khoảng cách $a$ |
| **ch1-1-8** | Lực chủ động và phản lực | Chọn phản lực liên kết phù hợp với ràng buộc của vật. | Bậc tự do khóa $\rightarrow$ hướng phản lực | Phản lực, Bậc tự do |
| **ch1-2-1** | Cân bằng vật chịu hai lực | Dựng hai lực cân bằng cùng đường tác dụng và ngược chiều. | $\vec{F_1} + \vec{F_2} = 0$ | Trạng thái cân bằng, Đường tác dụng |
| **ch1-2-3** | Quy tắc hình bình hành lực | Dựng hình bình hành lực và đọc hợp lực của hai lực đồng quy. | $\vec{R} = \vec{F_1} + \vec{F_2}$ | Hợp lực $R$, Hình chiếu đường chéo |
| **ch1-2-6** | Dựng sơ đồ vật thể tự do | Dựng sơ đồ vật thể tự do sau khi giải phóng liên kết. | Thay liên kết bằng phản lực | Sơ đồ FBD, Phương trình cân bằng |
| **ch1-3-1** | Phản lực pháp tuyến tựa trơn | Xác định phản lực pháp tuyến tại liên kết tựa. | $N$ vuông góc tiếp tuyến | Độ lớn $N$, Góc $\alpha$ |
| **ch1-3-2** | Lực căng dây mềm | Xác định lực căng dây theo điều kiện dây chỉ chịu kéo. | $T$ dọc theo dây mềm | Lực căng $T$, Hướng dây |
| **ch1-3-3** | Thành phần phản lực bản lề | Phân biệt phản lực bản lề và các thành phần phản lực tương ứng. | $A: A_x, A_y$ | $R_x, R_y$, Loại liên kết |
| **ch1-3-4** | Gối di động và gối cố định | Dựng phản lực gối di động và gối cố định theo phương ràng buộc. | Di động: $N$; Cố định: $A_x, A_y$ | Phản lực $R$, Chế độ ràng buộc |
| **ch1-3-6** | Phản lực tại ngàm | Quan sát phản lực và mô men ngàm khi tải thay đổi vị trí. | Ngàm: $R_x, R_y, M_A$ | Mô men $M_A$, Phản lực $R_x, R_y$ |
| **ch1-3-7** | Thanh hai lực theo trục | Kiểm tra điều kiện thanh hai lực cùng phương và ngược chiều. | $N$ dọc trục thanh | Lực dọc $N$, Đường trục |
| **ch1-4-1** | Hợp lực không gian | Tổng hợp véc tơ chính của hệ lực không gian. | $\vec{R} = \sum F_x \mathbf{i} + \sum F_y \mathbf{j} + \sum F_z \mathbf{k}$ | $R_{xyz}$, Hình chiếu không gian |
| **ch1-4-2** | Hình chiếu mô men không gian | Tính mô men chính của hệ lực không gian quanh điểm hoặc trục. | $M_{axis} = \vec{M_O} \cdot \vec{e}$ | Mô men trục, $M_O$ |
| **ch1-4-4** | Bảng cân bằng không gian | Kiểm tra điều kiện cân bằng của hệ lực không gian. | $\sum F = 0; \sum M = 0$ (6 phương trình) | Tổng lực $\sum F$, Tổng mô men $\sum M$ |
| **ch1-5-1** | Phân tích lực tiếp xúc | Phân rã lực tiếp xúc thành phản lực pháp tuyến và lực ma sát. | $\vec{R} = \vec{N} + \vec{F}_{ms}$ | $N, F_{ms}$, Hệ số $\mu$ |
| **ch1-5-2** | Ma sát tĩnh - trượt - lăn | So sánh trạng thái ma sát nghỉ, trượt và lăn. | $F_{ms} \leq \mu N$ | $F_{ms}$, Chế độ ma sát |
| **ch1-5-3** | Nón ma sát mặt nghiêng | Khảo sát nón ma sát và điều kiện trượt trên mặt nghiêng. | $\tan \alpha \leq \mu$ | Góc $\alpha$, Trạng thái trượt |
| **ch1-5-4** | Nêm tự hãm | Kiểm tra điều kiện tự hãm của cơ cấu nêm hoặc vít. | $\alpha \leq \phi = \arctan \mu$ | Góc ma sát $\phi$, Góc nêm $\alpha$ |
| **ch1-6-2** | Trọng tâm hình ghép | Tính trọng tâm hình ghép bằng trung bình trọng số diện tích. | $x_C = \frac{\sum A_i x_i}{\sum A_i}$ | Tọa độ trọng tâm $C$ |
| **ch1-6-3** | Trọng tâm có phần khoét | Xác định trọng tâm khi có đối xứng hoặc phần khoét. | Diện tích âm cho phần khoét | Vị trí trọng tâm $C$ |
| **ch1-7-1** | Chuỗi giải tĩnh học | Thực hành quy trình giải bài tập tĩnh học theo từng bước. | Sơ đồ $\rightarrow$ Phương trình $\rightarrow$ Nghiệm | Bước giải, Sai lệch |
| **ch1-7-2** | Kiểm tra số liệu tĩnh học | Đối chiếu kết quả số trong bài tập tĩnh học. | Kiểm tra cân bằng hệ | Sai số tính toán |

---

## Chương 2: Động học (15 mô phỏng)

| Mã | Tên mô phỏng | Ý định (Mục tiêu) | Nội dung & Công thức | Kết quả cần đạt (Readouts) |
|---|---|---|---|---|
| **ch2-1-1** | Quỹ đạo chất điểm | Khảo sát quỹ đạo chất điểm cùng véc tơ vận tốc và gia tốc. | $v = \frac{dr}{dt}; a = \frac{dv}{dt}$ | Vận tốc $v$, Tốc độ $s$ |
| **ch2-1-2** | Đồ thị động học | Đồng bộ chuyển động với đồ thị tọa độ, vận tốc và gia tốc. | $v = \frac{dx}{dt}; a = \frac{dv}{dt}$ | $x(t), v(t), a(t)$ |
| **ch2-1-3** | Tọa độ tự nhiên | Phân tích tọa độ tự nhiên với tiếp tuyến, pháp tuyến và bán kính cong. | $a = a_t \tau + a_n n; a_n = \frac{v^2}{\rho}$ | Gia tốc tiếp $a_t$, Gia tốc pháp $a_n$ |
| **ch2-1-4** | Các dạng chuyển động | So sánh các dạng chuyển động đặc biệt (thẳng, tròn, parabol). | Chuyển động đều, biến đổi | Tọa độ $x$, Vận tốc $v$ |
| **ch2-2-2** | Quay quanh trục cố định | Khảo sát chuyển động quay quanh trục cố định. | $\phi = \omega_0 t + \frac{1}{2}\epsilon t^2$ | Góc quay $\phi$, Vận tốc góc $\omega$ |
| **ch2-3-2** | Truyền động bánh răng | Quan sát truyền động bánh răng, đai và puli theo tỉ số tốc độ. | $\omega_1 r_1 = \omega_2 r_2$ | $\omega_2$, Vận tốc dài $v$ |
| **ch2-4-1** | Hợp chuyển động | Thiết lập bài toán hợp chuyển động trong hệ quy chiếu động. | $\vec{v_a} = \vec{v_e} + \vec{v_r}$ | Vận tốc tuyệt đối $v_a$ |
| **ch2-4-2** | Ba loại vận tốc | Phân biệt chuyển động tuyệt đối, tương đối và kéo theo. | $v_a, v_r, v_e$ | Tên loại vận tốc, Giá trị |
| **ch2-4-3** | Tam giác vận tốc | Dựng tam giác vận tốc trong bài toán hợp vận tốc. | $\vec{v_a} = \vec{v_e} + \vec{v_r}$ | $v_a$, Góc pha $\phi$ |
| **ch2-4-4** | Gia tốc Coriolis | Hiển thị gia tốc Coriolis khi có quay và chuyển động tương đối. | $a_c = 2 \vec{\omega} \times \vec{v_r}$ | Gia tốc $a_c$, Gia tốc kéo theo $a_e$ |
| **ch2-5-1** | Chuyển động phẳng | Khảo sát chuyển động song phẳng của vật rắn. | $v_B = v_A + \omega \times AB$ | Vận tốc $v_A, v_B$ |
| **ch2-5-2** | Tâm vận tốc tức thời | Xác định tâm vận tốc tức thời của vật rắn phẳng. | $v_P = \omega \times r_{P/IC}$ | Tọa độ $IC_x, IC_y$ |
| **ch2-5-3** | Phân bố vận tốc | Phân bố vận tốc của điểm thuộc vật rắn chuyển động phẳng. | $v_B = v_A + \omega \times AB$ | Phân bố vận tốc $v$ |
| **ch2-7-1** | Giải bài động học | Thực hành giải bài tập động học theo các bước gợi ý. | Đồ thị $\rightarrow$ Phân tích $\rightarrow$ Kết quả | Kết quả, Kiểm tra |
| **ch2-7-2** | Kiểm tra số liệu động học | Đối chiếu kết quả số trong bài tập động học. | Kiểm tra tính nhất quán $x, v, a$ | Sai số, Trạng thái |

---

## Chương 3: Động lực học (18 mô phỏng)

| Mã | Tên mô phỏng | Ý định (Mục tiêu) | Nội dung & Công thức | Kết quả cần đạt (Readouts) |
|---|---|---|---|---|
| **ch3-1-2** | Lực tổng và gia tốc | Liên hệ lực tác dụng với chuyển động của chất điểm. | $F = ma$ | Gia tốc $a$, Vận tốc $v$ |
| **ch3-1-3** | Hệ quy chiếu quán tính | So sánh hệ quy chiếu quán tính và phi quán tính. | $F^* = -ma$ (Lực quán tính) | Gia tốc $a$, Vận tốc $v$ |
| **ch3-2-1** | Định luật quán tính | Minh họa định luật quán tính khi tổng lực bằng không. | $F=0 \rightarrow v=const$ | Trạng thái chuyển động |
| **ch3-2-2** | Định luật Newton II | Kiểm chứng định luật II Newton $F = m \cdot a$. | $F = ma$ | Gia tốc $a$, Lực $F$ |
| **ch3-2-3** | Định luật Newton III | Quan sát cặp lực tác dụng và phản tác dụng. | $F_{AB} = -F_{BA}$ | Gia tốc $a_1, a_2$ |
| **ch3-2-5** | Sơ đồ FBD động lực | Dựng dynamic FBD cho bài toán có liên kết. | $F + F^* = 0$ | Lực quán tính, Phản lực |
| **ch3-3-1** | Giải phương trình vi phân | Giải phương trình vi phân chuyển động của chất điểm (Lò xo). | $x'' + \frac{k}{m}x = 0$ | Động năng $T$, Thế năng $V$ |
| **ch3-3-2** | Cơ hệ hai khối | Khảo sát phương trình vi phân chuyển động của cơ hệ. | $x_1'' = \frac{k(x_2-x_1)}{m_1}$ | Tọa độ $x_1, x_2$ |
| **ch3-4-1** | Cân bằng D’Alembert | Áp dụng nguyên lý D'Alembert đưa bài toán động về tĩnh. | $F + F^* = 0$ | Lực quán tính $F^*$ |
| **ch3-4-2** | Bài toán ngược động lực | Giải bài toán ngược: biết chuyển động suy ra lực. | $a \rightarrow F$ | Lực $F$ cần thiết |
| **ch3-5-1** | Định lý chuyển động khối tâm | Áp dụng định lý chuyển động khối tâm cho hệ vật. | $m \cdot a_{CM} = \sum F_{ext}$ | Gia tốc khối tâm $a_{CM}$ |
| **ch3-5-2** | Xung lượng - Động lượng | Áp dụng định lý động lượng và xung lượng. | $\vec{J} = \Delta \vec{p}$ | Biến thiên động lượng $\Delta p$ |
| **ch3-5-3** | Mô men động lượng | Khảo sát mô men động lượng và bảo toàn mô men động lượng. | $L = I \omega$ | Mô men động lượng $L$, $\omega$ |
| **ch3-5-4** | Định lý động năng | Kiểm chứng định lý động năng trong chuyển động có lực. | $A = \Delta T$ | Động năng $T$, Thế năng $V$ |
| **ch3-6-2** | Va chạm 2D | Mô phỏng va chạm với hệ số phục hồi $e$. | $\sum p = const$ | Động lượng trước/sau |
| **ch3-6-3** | Giải bài va chạm | Giải bài toán va chạm đàn hồi, mềm hoặc xiên. | Bảo toàn $p$ và hệ số $e$ | Vận tốc sau va chạm |
| **ch3-7-1** | Chọn định lý động lực | Chọn định lý động lực học phù hợp cho bài tập. | $I/M, W/E, L$ | Định lý đã chọn |
| **ch3-7-2** | Kiểm tra số động lực | Đối chiếu kết quả số trong bài tập động lực học. | Kiểm chứng các định lý | Sai số, Điểm số |
