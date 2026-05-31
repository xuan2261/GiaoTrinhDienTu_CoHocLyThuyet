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
    await page.locator('#host .sim2-reset').click();
    expect(await page.evaluate(() => window.__calls.reset)).toBe(1);

    // setValue cập nhật output NHƯNG KHÔNG bắn onInput (chống vòng lặp drag↔slider)
    const before = await page.evaluate(() => window.__calls.input.length);
    await page.evaluate(() => window.__c.setValue('F', 20));
    expect(await page.locator('#host .sim2-output').first().innerText()).toContain('20');
    expect(await page.evaluate(() => window.__calls.input.length)).toBe(before);

    // setPlaying cập nhật nhãn nút mà không gọi callback
    await page.evaluate(() => window.__c.setPlaying(true));
    expect(await page.locator('#host .sim2-playpause').innerText()).toContain('⏸');
    expect(await page.evaluate(() => window.__calls.play)).toBe(1);

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
      window.__p.setReadout([{ label: '|F|:', value: '100 N' }, { label: 'α:', value: '30°' }]);
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

    // setReadout cập nhật lại
    await page.evaluate(() => window.__p.setReadout([{ label: '|F|:', value: '42 N' }]));
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
