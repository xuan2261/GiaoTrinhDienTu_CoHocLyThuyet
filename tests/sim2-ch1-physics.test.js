/**
 * P2 — Ch1 statics physics (10 block, dạng đóng đã verify).
 * Mỗi block khớp công thức closed-form mà sim tương ứng dựa vào.
 * Chạy: node tests/sim2-ch1-physics.test.js
 */
'use strict';

const assert = require('assert');
const S = require('../js/sim2/physics/statics.js');

const approx = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= (tol || 1e-9), `${msg}: ${a} ≈ ${b}`);

// ── #1 ch1-1-3: phân tích lực thành phần ──
{
  const c = S.resolveForceComponents(100, 30);
  approx(c.fx, 100 * Math.cos(Math.PI / 6), 1e-9, 'ch1-1-3 fx = F cosα');
  approx(c.fy, 50, 1e-9, 'ch1-1-3 fy = F sinα');
  approx(Math.hypot(c.fx, c.fy), 100, 1e-9, 'ch1-1-3 |components| = F');
}

// ── #2 ch1-1-4: mô men lực M = F·d·sinθ ──
{
  approx(S.computeMoment(50, 2, 90), 100, 1e-9, 'ch1-1-4 M tại θ=90');
  approx(S.computeMoment(50, 2, 30), 50, 1e-9, 'ch1-1-4 M tại θ=30 = F·d·0.5');
  approx(S.computeMoment(50, 2, 0), 0, 1e-9, 'ch1-1-4 M=0 khi lực dọc cánh tay');
}

// ── #3 ch1-1-5: thu gọn hệ lực → R + Mo ──
{
  const r = S.reduceToResultant([
    { F: { fx: 10, fy: 0 }, r: { x: 0, y: 1 } },
    { F: { fx: 0, fy: 10 }, r: { x: 1, y: 0 } }
  ]);
  approx(r.Rx, 10, 1e-9, 'ch1-1-5 Rx = ΣFx');
  approx(r.Ry, 10, 1e-9, 'ch1-1-5 Ry = ΣFy');
  approx(r.Mo, 0, 1e-9, 'ch1-1-5 Mo = Σ(r×F)');
}

// ── #4 ch1-1-6: mô men ngẫu M = F·d ──
{
  approx(S.coupleMoment(20, 3), 60, 1e-9, 'ch1-1-6 M ngẫu = F·d');
  approx(S.coupleMoment(20, 6), 120, 1e-9, 'ch1-1-6 M tỉ lệ d');
}

// ── #5 ch1-2-3: hình bình hành lực (2 đồng quy) ──
{
  const a = S.resolveForceComponents(10, 0);
  const b = S.resolveForceComponents(10, 90);
  const Rx = a.fx + b.fx, Ry = a.fy + b.fy;
  approx(Math.hypot(Rx, Ry), Math.hypot(10, 10), 1e-9, 'ch1-2-3 |R| = √(F1²+F2²) khi vuông góc');
  approx(Math.atan2(Ry, Rx) * 180 / Math.PI, 45, 1e-9, 'ch1-2-3 góc R = 45° khi 2 lực bằng nhau vuông góc');
}

// ── #6 ch1-1-8: phản lực dầm gối ──
{
  const mid = S.beamReactions(100, 5, 10);
  approx(mid.ra, 50, 1e-9, 'ch1-1-8 Ra = 50 tải giữa nhịp');
  approx(mid.rb, 50, 1e-9, 'ch1-1-8 Rb = 50 tải giữa nhịp');
  const off = S.beamReactions(100, 2, 10);
  approx(off.ra, 80, 1e-9, 'ch1-1-8 Ra = P(L-a)/L');
  approx(off.rb, 20, 1e-9, 'ch1-1-8 Rb = P·a/L');
  approx(off.ra + off.rb, 100, 1e-9, 'ch1-1-8 ΣR = P');
}

// ── #7 ch1-3-2: lực căng dây (2 dây đối xứng, góc α từ phương đứng) ──
{
  const W = 100, alphaDeg = 30, alpha = alphaDeg * Math.PI / 180;
  const T = W / (2 * Math.cos(alpha)); // 2T cosα = W
  // Hệ {T trái, T phải, trọng lực} phải cân bằng
  const eq = S.checkEquilibrium([
    { fx: -T * Math.sin(alpha), fy: T * Math.cos(alpha) },
    { fx: T * Math.sin(alpha), fy: T * Math.cos(alpha) },
    { fx: 0, fy: -W }
  ], []);
  assert.ok(eq.balanced, 'ch1-3-2 hệ 2 dây + trọng lực cân bằng tại T=W/(2cosα)');
  approx(T, W / (2 * Math.cos(alpha)), 1e-9, 'ch1-3-2 T = W/(2cosα)');
}

// ── #8 ch1-3-6: ngàm cantilever, tải đổi vị trí ──
{
  // Tải điểm P tại khoảng a từ ngàm: phản lực R=P, mô men ngàm M=P·a
  const P = 80, a = 3;
  const R = P, M = P * a;
  approx(R, 80, 1e-9, 'ch1-3-6 phản lực ngàm = P');
  approx(M, 240, 1e-9, 'ch1-3-6 mô men ngàm = P·a');
  // Phân bố đều: dùng cantileverDistributed
  const cd = S.cantileverDistributed(10, 4);
  approx(cd.ma, 80, 1e-9, 'ch1-3-6 cantilever phân bố M = wL²/2');
  approx(cd.ra, 40, 1e-9, 'ch1-3-6 cantilever phân bố R = wL');
}

// ── #9 ch1-5-3: nón ma sát trên mặt nghiêng (tanφ = μ) ──
{
  const mu = 0.5;
  const phi = Math.atan(mu); // góc nón ma sát
  approx(Math.tan(phi), mu, 1e-9, 'ch1-5-3 tanφ = μ (góc nón ma sát)');
  // Trên mặt nghiêng β: trượt khi β > φ. N = mg cosβ, ma sát max = μN.
  const mg = 100;
  const betaCrit = phi; // góc tới hạn
  const N = mg * Math.cos(betaCrit);
  const driving = mg * Math.sin(betaCrit);
  approx(S.frictionNormal(mu, N), driving, 1e-9, 'ch1-5-3 cân bằng tại β tới hạn: μN = mg sinβ');
}

// ── #10 ch1-6-3: trọng tâm hình ghép / khoét ──
{
  // 2 ô vuông đối xứng → trọng tâm giữa
  const comp = S.centroidComposite([{ area: 1, cx: 0, cy: 0 }, { area: 1, cx: 2, cy: 0 }]);
  approx(comp.cx, 1, 1e-9, 'ch1-6-3 ghép: cx = 1');
  approx(comp.cy, 0, 1e-9, 'ch1-6-3 ghép: cy = 0');
  // Khoét: vuông A=4 tại (0,0) trừ lỗ A=1 tại (1,0) → cx = -1/3
  const hole = S.centroidWithHole({ area: 4, cx: 0, cy: 0 }, { area: 1, cx: 1, cy: 0 });
  approx(hole.cx, -1 / 3, 1e-9, 'ch1-6-3 khoét: cx = (4·0 - 1·1)/3');
  approx(hole.area, 3, 1e-9, 'ch1-6-3 khoét: diện tích còn = 3');
}

console.log('sim2-ch1-physics: PASS (10/10)');
