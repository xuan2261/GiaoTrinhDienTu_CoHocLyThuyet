const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CH1_FIXTURE = `file:///${path.join(ROOT, 'tests/fixtures/sim2-ch1.html').replace(/\\/g, '/')}`;

// W1 regression: kéo lực về gốc KHÔNG được sinh "NaN" trong readout (acos(0/0)).
test('ch1-2-3: kéo handle lực về gốc — readout không có NaN', async ({ page }) => {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  await page.goto(CH1_FIXTURE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { window.__sim = window.SIM_MAP['ch1-2-3'](document.getElementById('host')); });

  // Kéo 1 handle (đầu véc tơ) về gần gốc toạ độ (góc dưới-trái khung world)
  const handle = page.locator('#host .sim2-handle').first();
  const box = await handle.boundingBox();
  const host = await page.locator('#host').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  // gốc world ở mép trái-dưới vùng vẽ → kéo con trỏ ra ngoài góc đó
  await page.mouse.move(host.x + 2, host.y + host.height - 2, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(100);

  const readoutText = await page.locator('#host .sim2-readout-live').innerText();
  expect(readoutText).not.toContain('NaN');

  await page.evaluate(() => window.__sim.dispose());
  expect(errors).toEqual([]);
});

// W2 regression: factory ném giữa mount → shell mồ côi được gỡ sạch, remount lại được.
test('shell mồ côi được gỡ khi factory throw giữa mount (chống rò RAF/DOM)', async ({ page }) => {
  await page.goto(CH1_FIXTURE, { waitUntil: 'domcontentloaded' });

  // Mô phỏng logic catch của loader: dựng shell rồi throw, sau đó dọn qua __sim2Dispose.
  const result = await page.evaluate(() => {
    const host = document.getElementById('host');
    // factory dựng shell một phần rồi ném
    const badFactory = (container) => {
      const shell = window.Sim2Shell.createSimShell({
        container, worldBox: { minX: 0, minY: 0, maxX: 4, maxY: 4 }
      });
      shell.onFrame(() => {}); // bật RAF
      throw new Error('boom giữa mount');
    };
    try { badFactory(host); } catch (e) { /* mong đợi */ }

    // loader-style cleanup: tìm shell mồ côi + gỡ
    const orphan = host.querySelector('.sim2-root');
    const hadOrphan = !!orphan;
    if (orphan && typeof orphan.__sim2Dispose === 'function') orphan.__sim2Dispose();

    return {
      hadOrphan,
      rootAfterCleanup: host.querySelectorAll('.sim2-root').length,
      svgAfterCleanup: host.querySelectorAll('svg').length
    };
  });

  expect(result.hadOrphan, 'shell phải đã dựng một phần (có .sim2-root)').toBe(true);
  expect(result.rootAfterCleanup, 'sau cleanup không còn .sim2-root mồ côi').toBe(0);
  expect(result.svgAfterCleanup, 'sau cleanup không còn svg rò').toBe(0);

  // Remount sim thật vẫn OK sau khi đã dọn mồ côi
  await page.evaluate(() => { window.__sim = window.SIM_MAP['ch1-2-3'](document.getElementById('host')); });
  await expect(page.locator('#host svg.sim2-svg')).toHaveCount(1);
  await page.evaluate(() => window.__sim.dispose());
  await expect(page.locator('#host .sim2-root')).toHaveCount(0);
});
