const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../simulation-test-utils');

const TARGETS = [
  { url: '/index.html',                          name: 'home',       hasMath: false },
  { url: '/chapters/ch1/muc-III-2.html',         name: 'ch1-vec-T',  hasMath: true  },
  { url: '/chapters/ch1/muc-III-3.html',         name: 'ch1-vec-R',  hasMath: true  },
  { url: '/chapters/ch1/muc-IV-3.html',          name: 'ch1-iv-3',   hasMath: true  },
  { url: '/chapters/ch2/muc-V-3.html',           name: 'ch2-v-3',    hasMath: true  },
  { url: '/chapters/ch2/muc-II-2.html',          name: 'ch2-mixed',  hasMath: true  },
  { url: '/chapters/ch3/muc-V-4.html',           name: 'ch3-vec-v',  hasMath: true  },
  { url: '/chapters/ch3/muc-VII-1.html',         name: 'ch3-vec-N',  hasMath: true  },
  { url: '/chapters/ch3/muc-VII-2.html',         name: 'ch3-vec-F',  hasMath: true  },
];

const DELETED_IMAGES = [
  'hinh-037.png', 'hinh-039.png', 'hinh-136.png',
  'hinh-240.png', 'hinh-241.png', 'hinh-266.png',
  'hinh-283.png', 'hinh-289.png',
];

let server;
let baseURL;

test.beforeAll(async () => {
  const handle = await startStaticServer();
  server = handle.server;
  baseURL = `http://127.0.0.1:${handle.port}`;
});

test.afterAll(async () => {
  if (server) await new Promise((r) => server.close(r));
});

for (const { url, name, hasMath } of TARGETS) {
  test(`@phase07-smoke ${name} (${url})`, async ({ page }) => {
    await page.goto(`${baseURL}${url}`);
    await page.waitForLoadState('domcontentloaded');

    for (const deleted of DELETED_IMAGES) {
      const present = await page.evaluate(
        (src) => !!document.querySelector(`img[src*="${src}"]`),
        deleted,
      );
      expect(present, `${deleted} should NOT appear in ${url}`).toBe(false);
    }

    if (hasMath) {
      await page.waitForFunction(
        () => !!(document.querySelector('.katex')
              || document.querySelector('math')
              || document.querySelector('.math-tex')),
        { timeout: 8000 },
      ).catch(() => {});
      const ok = await page.evaluate(
        () => !!(document.querySelector('.katex')
              || document.querySelector('math')
              || document.querySelector('.math-tex')),
      );
      expect(ok, `${url} should have math rendering`).toBe(true);
    }

    const genericAlts = await page.evaluate(() => {
      const re = /^Hình minh họa chương [123]$/;
      return Array.from(document.querySelectorAll('img'))
        .filter((img) => re.test((img.alt || '').trim()))
        .map((img) => img.src);
    });
    expect(genericAlts, `${url} has generic alt`).toEqual([]);

    const oldDivs = await page.locator('div.figure-container').count();
    expect(oldDivs, `${url} still has <div class="figure-container">`).toBe(0);
  });
}
