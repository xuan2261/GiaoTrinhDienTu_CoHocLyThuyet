const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { renderContactSheet } = require('../sim2-visual/contact-sheet.js');

const ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = process.env.SIM3_VISUAL_OUT_DIR
  ? path.resolve(process.env.SIM3_VISUAL_OUT_DIR)
  : path.join(ROOT, 'plans/260605-sim3-visual-quality-upgrade-tdd/visuals/final');
const TARGET_ROUTES = new Set(['ch1-1-5', 'ch2-3-2', 'ch3-6-2']);

const cases = [
  { id: 'ch1-1-5', fixture: 'sim2-ch1.html', chapter: 1, section: '1.5', name: 'Thu gọn hệ lực phẳng → R + Mo', steps: 0 },
  { id: 'ch1-5-3', fixture: 'sim2-ch1.html', chapter: 1, section: '5.3', name: 'Nón ma sát trên mặt nghiêng', steps: 0 },
  { id: 'ch2-1-3', fixture: 'sim2-ch2.html', chapter: 2, section: '1.3', name: 'Tiếp/pháp tuyến + bán kính cong', steps: 0 },
  { id: 'ch2-2-2', fixture: 'sim2-ch2.html', chapter: 2, section: '2.2', name: 'Quay quanh trục cố định', steps: 8 },
  { id: 'ch2-3-2', fixture: 'sim2-ch2.html', chapter: 2, section: '3.2', name: 'Truyền động bánh răng–đai–puli', steps: 8 },
  { id: 'ch2-4-4', fixture: 'sim2-ch2.html', chapter: 2, section: '4.4', name: 'Hợp chuyển động & Coriolis', steps: 16 },
  { id: 'ch2-5-3', fixture: 'sim2-ch2.html', chapter: 2, section: '5.3', name: 'Phân bố vận tốc điểm trên vật rắn', steps: 0 },
  { id: 'ch3-1-3', fixture: 'sim2-ch3.html', chapter: 3, section: '1.3', name: 'HQC quán tính vs phi quán tính', steps: 0 },
  { id: 'ch3-5-3', fixture: 'sim2-ch3.html', chapter: 3, section: '5.3', name: 'Bảo toàn mô men động lượng', steps: 8 },
  { id: 'ch3-6-2', fixture: 'sim2-ch3.html', chapter: 3, section: '6.2', name: 'Va chạm với hệ số phục hồi e', steps: 112, phase: 'after' }
];

const records = [];

function fixtureUrl(name) {
  return `file:///${path.join(ROOT, `tests/fixtures/${name}`).replace(/\\/g, '/')}`;
}

test.describe('sim3 pilot visual capture', () => {
  test.beforeAll(() => fs.mkdirSync(OUT_DIR, { recursive: true }));
  test.afterAll(() => {
    fs.writeFileSync(path.join(OUT_DIR, 'capture-manifest.json'), JSON.stringify(records, null, 2), 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'contact-sheet.html'), renderContactSheet(records), 'utf8');
  });

  for (const cfg of cases) {
    test(`capture ${cfg.id} 3D`, async ({ page }) => {
      await page.goto(fixtureUrl(cfg.fixture), { waitUntil: 'domcontentloaded' });
      await page.addStyleTag({ path: path.join(ROOT, 'css/style.css') });
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        const h = document.getElementById('host');
        h.style.width = '960px';
        h.style.height = 'auto';
        h.style.minHeight = '560px';
        h.style.padding = '16px';
        h.style.background = '#fff';
      });
      await page.evaluate(id => { window.__sim = window.SIM_MAP[id](document.getElementById('host')); }, cfg.id);
      await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
      await expect(page.locator('#host canvas.sim3-canvas')).toBeVisible();
      await page.evaluate(n => {
        const step = document.querySelector('#host .sim2-step');
        for (let i = 0; i < n && step; i++) step.click();
      }, cfg.steps);
      if (cfg.phase === 'after') {
        await expect.poll(async () => page.evaluate(id => window.__SIM3_DEBUG__ && window.__SIM3_DEBUG__[id] && window.__SIM3_DEBUG__[id].phaseCue, cfg.id), {
          timeout: 1000
        }).toBe('after');
      }
      const file = `${cfg.id}-sim3.png`;
      await page.locator('#host').screenshot({ path: path.join(OUT_DIR, file) });
      const audit = await page.evaluate(id => {
        const host = document.getElementById('host');
        const labels = Array.from(host.querySelectorAll('.sim3-label')).filter(el => getComputedStyle(el).display !== 'none');
        const boxes = labels.map(el => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        });
        let overlaps = 0;
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j];
            if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) overlaps++;
          }
        }
        const metrics = window.__SIM3_DEBUG__ && window.__SIM3_DEBUG__[id] && window.__SIM3_DEBUG__[id].visualMetrics || {};
        return { overlaps, visibleLabelCount: labels.length, metrics };
      }, cfg.id);
      const measuredMargin = audit.metrics.projectedMarginPx;
      const safeCrop = typeof measuredMargin === 'number' ? measuredMargin >= 24 : null;
      const routeFlags = [];
      if (cfg.id === 'ch1-1-5') {
        const ratio = audit.metrics.resultantDominanceRatio;
        routeFlags.push(
          { severity: ratio >= 1.05 && ratio <= 1.25 ? 'ok' : 'high', note: `R-ratio=${Number(ratio || 0).toFixed(2)}` },
          { severity: audit.metrics.resultantCueRole === 'functional-resultant-not-decoration' ? 'ok' : 'high', note: `R-role=${audit.metrics.resultantCueRole || 'missing'}` },
          { severity: audit.metrics.resultantDecorativeRisk === 'low' ? 'ok' : 'high', note: `R-decorative=${audit.metrics.resultantDecorativeRisk || 'missing'}` }
        );
      }
      if (cfg.id === 'ch3-6-2') {
        routeFlags.push(
          { severity: audit.metrics.noGhostTrail === true ? 'ok' : 'high', note: `noGhostTrail=${audit.metrics.noGhostTrail === true}` },
          { severity: audit.metrics.ghostCount === 0 ? 'ok' : 'high', note: `ghostCount=${Number(audit.metrics.ghostCount || 0)}` },
          { severity: audit.metrics.trailDotCountMax === 0 ? 'ok' : 'high', note: `trailDots=${Number(audit.metrics.trailDotCountMax || 0)}` }
        );
      }
      if (cfg.id === 'ch2-3-2') {
        routeFlags.push(
          { severity: audit.metrics.beltLabelSemanticTarget === 'belt-span' ? 'ok' : 'high', note: `beltLabel=${audit.metrics.beltLabelSemanticTarget || 'missing'}` },
          { severity: audit.metrics.beltLabelSpanCoverage >= 0.55 ? 'ok' : 'high', note: `beltSpan=${Number(audit.metrics.beltLabelSpanCoverage || 0).toFixed(2)}` },
          { severity: audit.metrics.labelFaceCoverageMax <= 0.05 ? 'ok' : 'high', note: `faceCover=${Number(audit.metrics.labelFaceCoverageMax || 0).toFixed(2)}` }
        );
      }
      records.push({
        route: cfg.id,
        chapter: cfg.chapter,
        section: cfg.section,
        name: cfg.name,
        kind: TARGET_ROUTES.has(cfg.id) ? 'target-polish' : 'sim3',
        images: [{ label: TARGET_ROUTES.has(cfg.id) ? 'final target audit' : 'final audit', src: file }],
        flags: [
          { severity: audit.overlaps === 0 ? 'ok' : 'high', note: `overlap=${audit.overlaps}` },
          { severity: safeCrop === true ? 'ok' : 'low', note: safeCrop == null ? 'safeCrop=not-measured' : `safeCrop=${safeCrop} margin=${measuredMargin}px` },
          ...(TARGET_ROUTES.has(cfg.id) ? [
            { severity: audit.metrics.physicalMeaningCue ? 'ok' : 'high', note: `cue=${audit.metrics.physicalMeaningCue || 'missing'}` },
            { severity: audit.metrics.primarySceneFillRatio >= 0.35 ? 'ok' : 'low', note: `fill=${Number(audit.metrics.primarySceneFillRatio || 0).toFixed(2)}` },
            { severity: audit.visibleLabelCount <= 3 ? 'ok' : 'low', note: `labels=${audit.visibleLabelCount}` },
            ...routeFlags
          ] : []),
          { severity: TARGET_ROUTES.has(cfg.id) ? 'ok' : 'low', note: TARGET_ROUTES.has(cfg.id) ? 'polished-target' : 'reference' }
        ]
      });
      await page.evaluate(() => window.__sim.dispose());
    });
  }
});
