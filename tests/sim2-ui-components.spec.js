/**
 * P0 — Core UI components: Sim2Palette, Sim2Controls, Sim2Panel.
 * Dùng fixture sim2-ch1.html (đã nạp 3 script core mới). Browser-only (Playwright).
 * Kiểm: render đúng, callback đúng, setValue KHÔNG bắn input (chống vòng lặp drag↔slider),
 * dispose gỡ sạch node + listener (bắn event sau dispose không nổ + không gọi callback).
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE_URL = `file:///${path.join(ROOT, 'tests/fixtures/sim2-ch1.html').replace(/\\/g, '/')}`;

async function gotoFixture(page) {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
  return errors;
}

test.describe('Sim2Palette', () => {
  test('có đủ khóa bắt buộc + mọi giá trị là hex 6 ký tự', async ({ page }) => {
    const errors = await gotoFixture(page);
    const hasPalette = await page.evaluate(() => typeof window.Sim2Palette === 'object' && window.Sim2Palette !== null);
    expect(hasPalette, 'window.Sim2Palette tồn tại').toBe(true);

    const keys = await page.evaluate(() => Object.keys(window.Sim2Palette));
    for (const k of ['force', 'x', 'y', 'v', 'a', 'moment', 'coriolis', 'reaction', 'handle', 'axis', 'grid']) {
      expect(keys, `palette thiếu khóa "${k}"`).toContain(k);
    }
    const allHex = await page.evaluate(() =>
      Object.values(window.Sim2Palette).every(v => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)));
    expect(allHex, 'mọi màu palette phải là hex #rrggbb').toBe(true);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('Sim2Controls', () => {
  test('render slider + playback; onInput/onPlay/onPause/onStep/onReset đúng; setValue không bắn input; dispose sạch', async ({ page }) => {
    const errors = await gotoFixture(page);

    await page.evaluate(() => {
      window.__calls = { input: [], play: 0, pause: 0, step: 0, reset: 0 };
      const host = document.getElementById('host');
      window.__c = window.Sim2Controls.createControls(host, {
        sliders: [
          { id: 'F', label: 'F', min: 0, max: 100, step: 1, value: 50, unit: 'N', onInput: v => window.__calls.input.push(v) },
          { id: 'alpha', label: 'α', min: 0, max: 90, step: 1, value: 30, unit: '°', onInput: v => window.__calls.input.push(v) }
        ],
        playback: {
          playing: false,
          onPlay: () => window.__calls.play++,
          onPause: () => window.__calls.pause++,
          onStep: () => window.__calls.step++,
          onReset: () => window.__calls.reset++
        }
      });
    });

    // Render: 2 slider, 3 nút playback (▶/⏸ toggle + ⏭ step + ↺ reset)
    await expect(page.locator('#host .sim2-controls')).toHaveCount(1);
    await expect(page.locator('#host .sim2-controls input[type=range]')).toHaveCount(2);
    await expect(page.locator('#host .sim2-playback button')).toHaveCount(3);

    // <output> hiện value + đơn vị ban đầu
    const out0 = await page.locator('#host .sim2-output').first().innerText();
    expect(out0).toContain('50');
    expect(out0).toContain('N');

    // Kéo slider F → onInput(75), output cập nhật
    await page.evaluate(() => {
      const inp = document.querySelectorAll('#host .sim2-controls input[type=range]')[0];
      inp.value = '75';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect((await page.evaluate(() => window.__calls.input)).slice(-1)[0]).toBe(75);
    expect(await page.locator('#host .sim2-output').first().innerText()).toContain('75');

    // start paused → nút toggle hiện ▶
    expect(await page.locator('#host .sim2-playpause').innerText()).toContain('▶');

    // ▶ → onPlay, đổi sang ⏸; ⏸ → onPause, đổi lại ▶
    await page.locator('#host .sim2-playpause').click();
    expect(await page.evaluate(() => window.__calls.play)).toBe(1);
    expect(await page.locator('#host .sim2-playpause').innerText()).toContain('⏸');
    await page.locator('#host .sim2-playpause').click();
    expect(await page.evaluate(() => window.__calls.pause)).toBe(1);
    expect(await page.locator('#host .sim2-playpause').innerText()).toContain('▶');

    // ⏭ step, ↺ reset
    await page.locator('#host .sim2-step').click();
    expect(await page.evaluate(() => window.__calls.step)).toBe(1);
    await page.locator('#host .sim2-playpause').click();
    expect(await page.locator('#host .sim2-playpause').innerText()).toContain('⏸');
    await page.locator('#host .sim2-reset').click();
    expect(await page.evaluate(() => window.__calls.reset)).toBe(1);
    expect(await page.locator('#host .sim2-playpause').innerText()).toContain('▶');
    expect(await page.locator('#host .sim2-playpause').getAttribute('aria-label')).toBe('Chạy');

    // setValue cập nhật output NHƯNG KHÔNG bắn onInput (chống vòng lặp drag↔slider)
    const before = await page.evaluate(() => window.__calls.input.length);
    await page.evaluate(() => window.__c.setValue('F', 20));
    expect(await page.locator('#host .sim2-output').first().innerText()).toContain('20');
    expect(await page.evaluate(() => window.__calls.input.length)).toBe(before);

    // setPlaying cập nhật nhãn nút mà không gọi callback
    const playBeforeSet = await page.evaluate(() => window.__calls.play);
    await page.evaluate(() => window.__c.setPlaying(true));
    expect(await page.locator('#host .sim2-playpause').innerText()).toContain('⏸');
    expect(await page.evaluate(() => window.__calls.play)).toBe(playBeforeSet);

    // dispose: giữ ref node, gỡ, bắn input lên node mồ côi → KHÔNG gọi callback, KHÔNG nổ
    await page.evaluate(() => {
      window.__orphan = document.querySelectorAll('#host .sim2-controls input[type=range]')[0];
      window.__c.dispose();
    });
    await expect(page.locator('#host .sim2-controls')).toHaveCount(0);
    const after = await page.evaluate(() => {
      const n0 = window.__calls.input.length;
      window.__orphan.value = '5';
      window.__orphan.dispatchEvent(new Event('input', { bubbles: true }));
      return { n0, n1: window.__calls.input.length };
    });
    expect(after.n1, 'listener slider phải gỡ sau dispose').toBe(after.n0);

    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('Sim2Panel', () => {
  test('render formula + legend + observe; setReadout cập nhật; dispose sạch', async ({ page }) => {
    const errors = await gotoFixture(page);

    await page.evaluate(() => {
      const host = document.getElementById('host');
      window.__p = window.Sim2Panel.createPanel(host, {
        formulas: ['F_x = F\\cos\\alpha', 'F_y = F\\sin\\alpha'],
        legend: [{ color: '#e03030', label: 'F' }, { color: '#2ecc40', label: 'v' }],
        observe: 'Quan sát: kéo đầu mũi tên để đổi góc.'
      });
      window.__p.setReadout([{ key: 'force', label: '|F|:', value: '100 N' }, { key: 'alpha', label: 'α:', value: '30°' }]);
    });

    await expect(page.locator('#host .sim2-theory')).toHaveCount(1);
    await expect(page.locator('#host .sim2-formula')).toHaveCount(2);
    // formula ra text (KaTeX render hoặc fallback) — không rỗng
    expect((await page.locator('#host .sim2-formula').first().innerText()).trim().length).toBeGreaterThan(0);

    // legend 2 chip + swatch có màu
    await expect(page.locator('#host .sim2-legend-item')).toHaveCount(2);
    const swColor = await page.evaluate(() => {
      const sw = document.querySelector('#host .sim2-legend-item .sim2-swatch');
      return sw ? getComputedStyle(sw).backgroundColor : '';
    });
    expect(swColor).toMatch(/rgb/);

    // readout sống
    const rd = await page.locator('#host .sim2-readout-live').innerText();
    expect(rd).toContain('100 N');
    expect(rd).toContain('30°');
    await expect(page.locator('#host .sim2-readout-row[data-readout-key="force"]')).toContainText('100 N');
    await expect(page.locator('#host .sim2-readout-row[data-readout-key="alpha"]')).toContainText('30°');

    // setReadout cập nhật lại
    await page.evaluate(() => window.__p.setReadout([{ key: 'force', label: '|F|:', value: '42 N' }]));
    expect(await page.locator('#host .sim2-readout-live').innerText()).toContain('42 N');

    // observe
    expect(await page.locator('#host .sim2-observe').innerText()).toContain('Quan sát');

    // dispose sạch
    await page.evaluate(() => window.__p.dispose());
    await expect(page.locator('#host .sim2-theory')).toHaveCount(0);

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('Sim2Panel fallback text khi KaTeX vắng', async ({ page }) => {
    const errors = await gotoFixture(page);
    await page.evaluate(() => {
      window.__savedKatex = window.katex;
      window.katex = undefined; // ép fallback
      const host = document.getElementById('host');
      window.__p = window.Sim2Panel.createPanel(host, { formulas: ['E = mc^2'], legend: [], observe: '' });
    });
    const txt = await page.locator('#host .sim2-formula').first().innerText();
    expect(txt).toContain('mc^2');
    await page.evaluate(() => { window.__p.dispose(); window.katex = window.__savedKatex; });
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('Sim2Shell — header thẻ + depth defs', () => {
  test('meta → header + badge §mục (data-chapter); dispose gỡ sạch; không meta → không header', async ({ page }) => {
    const errors = await gotoFixture(page);

    // Có meta → dựng header + badge
    await page.evaluate(() => {
      const host = document.getElementById('host');
      window.__s = window.Sim2Shell.createSimShell({
        container: host, worldBox: { minX: 0, minY: 0, maxX: 4, maxY: 3 },
        meta: { name: 'Va chạm e', section: '6.2', chapter: 3 }
      });
    });
    await expect(page.locator('#host .sim2-card-header')).toHaveCount(1);
    expect(await page.locator('#host .sim2-card-title').innerText()).toContain('Va chạm');
    expect(await page.locator('#host .sim2-badge').innerText()).toContain('6.2');
    expect(await page.locator('#host .sim2-card-header').getAttribute('data-chapter')).toBe('3');

    // dispose → header + root gỡ sạch
    await page.evaluate(() => window.__s.dispose());
    await expect(page.locator('#host .sim2-card-header')).toHaveCount(0);
    await expect(page.locator('#host .sim2-root')).toHaveCount(0);

    // Không meta → không header (23 sim chưa retrofit an toàn)
    await page.evaluate(() => {
      const host = document.getElementById('host');
      window.__s2 = window.Sim2Shell.createSimShell({
        container: host, worldBox: { minX: 0, minY: 0, maxX: 4, maxY: 3 }
      });
    });
    await expect(page.locator('#host .sim2-card-header')).toHaveCount(0);
    await page.evaluate(() => window.__s2.dispose());

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('createSvg chèn defs chiều sâu với id riêng cho từng SVG', async ({ page }) => {
    const errors = await gotoFixture(page);
    const defs = await page.evaluate(() => {
      const svg = window.Sim2SvgRender.createSvg(200, 150);
      return {
        shadow: !!svg.querySelector(`#${svg.__sim2Ids.shadow} feDropShadow`),
        gradForce: !!svg.querySelector(`#${svg.__sim2Ids.gradients.force}`),
        marker: !!svg.__markerId
      };
    });
    expect(defs.shadow, 'filter chiều sâu tồn tại').toBe(true);
    expect(defs.gradForce, 'gradient lực tồn tại').toBe(true);
    expect(defs.marker, 'arrow marker vẫn còn (không phá vector)').toBe(true);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('Sim2Shell — deterministic clock lifecycle', () => {
  test('anchor, fixed step, pause/resume, manual step, rapid toggle, dispose', async ({ page }) => {
    await gotoFixture(page);
    const result = await page.evaluate(() => {
      const savedRaf = window.requestAnimationFrame;
      const savedCancel = window.cancelAnimationFrame;
      const callbacks = new Map();
      const cancelled = [];
      let nextId = 1;
      window.requestAnimationFrame = cb => { const id = nextId++; callbacks.set(id, cb); return id; };
      window.cancelAnimationFrame = id => { cancelled.push(id); callbacks.delete(id); };

      const host = document.getElementById('host');
      const shell = window.Sim2Shell.createSimShell({
        container: host, worldBox: { minX: 0, minY: 0, maxX: 4, maxY: 3 }
      });
      const updates = [];
      let draws = 0;
      shell.onFrame((dt, time) => updates.push({ dt, time }), () => { draws += 1; });
      shell.start();

      function fire(timestamp) {
        const entry = callbacks.entries().next().value;
        if (!entry) throw new Error('missing owned RAF callback');
        callbacks.delete(entry[0]);
        entry[1](timestamp);
      }

      const pendingAfterRapidStart = callbacks.size;
      fire(1000);
      const afterAnchor = { updates: updates.length, draws, pending: callbacks.size };
      fire(1017);
      const afterFrame = { updates: updates.length, draws, pending: callbacks.size };
      shell.stop();
      const afterStop = { updates: updates.length, draws, pending: callbacks.size };
      shell.stepOnce();
      const afterStep = { updates: updates.length, draws, pending: callbacks.size };
      shell.start(); shell.start();
      const pendingAfterResume = callbacks.size;
      fire(5000);
      const afterResumeAnchor = { updates: updates.length, draws };
      fire(5017);
      shell.dispose();
      const afterDispose = { updates: updates.length, draws, pending: callbacks.size };

      window.requestAnimationFrame = savedRaf;
      window.cancelAnimationFrame = savedCancel;
      return {
        pendingAfterRapidStart, afterAnchor, afterFrame, afterStop, afterStep,
        pendingAfterResume, afterResumeAnchor, afterDispose, cancelled: cancelled.length,
        finalTime: updates.at(-1).time
      };
    });

    expect(result.pendingAfterRapidStart).toBe(1);
    expect(result.afterAnchor).toEqual({ updates: 0, draws: 0, pending: 1 });
    expect(result.afterFrame).toEqual({ updates: 1, draws: 1, pending: 1 });
    expect(result.afterStop).toEqual({ updates: 1, draws: 1, pending: 0 });
    expect(result.afterStep).toEqual({ updates: 2, draws: 2, pending: 0 });
    expect(result.pendingAfterResume).toBe(1);
    expect(result.afterResumeAnchor).toEqual({ updates: 2, draws: 2 });
    expect(result.afterDispose).toEqual({ updates: 3, draws: 3, pending: 0 });
    expect(result.cancelled).toBeGreaterThanOrEqual(2);
    expect(result.finalTime).toBeCloseTo(3 / 60, 12);
  });
});
