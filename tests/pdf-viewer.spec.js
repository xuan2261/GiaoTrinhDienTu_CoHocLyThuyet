const { test, expect } = require('@playwright/test');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE_URL = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;
const MIME = {
  '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript',
  '.json': 'application/json', '.pdf': 'application/pdf', '.woff2': 'font/woff2',
};
let server;
let nestedHttpUrl;
let httpUrl;

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function startServer() {
  return new Promise(resolve => {
    server = http.createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const nestedPrefix = '/usb-copy/Giáo trình Cơ học/';
      const relative = pathname.startsWith(nestedPrefix) ? pathname.slice(nestedPrefix.length) :
        (pathname === '/' ? 'index.html' : pathname.slice(1));
      const filePath = path.resolve(ROOT, relative);
      if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath)) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    }).listen(0, '127.0.0.1', () => {
      httpUrl = `http://127.0.0.1:${server.address().port}/index.html`;
      nestedHttpUrl = `${httpUrl.replace('/index.html', '')}/usb-copy/Giáo trình Cơ học/index.html`;
      resolve();
    });
  });
}
async function openLesson(page, baseUrl) {
  await page.goto(`${baseUrl}#ch1-1-3`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.PdfViewerRenderer));
  await page.waitForSelector('#content-area [data-sim-mount-route="ch1-1-3"] svg');
}

async function openViewer(page) {
  const trigger = page.getByRole('button', { name: 'Xem bản PDF' });
  await expect(trigger).toBeVisible({ timeout: 5000 });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Giáo trình Cơ học lý thuyết - Bản PDF' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Trang 1 trên', { exact: false })).toBeVisible({ timeout: 30000 });
  return dialog;
}

test.beforeAll(startServer);
test.afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

for (const mode of [
  { name: 'file', url: () => FILE_URL },
  { name: 'http', url: () => httpUrl },
  { name: 'HTTP nested subdirectory', url: () => nestedHttpUrl },
]) {
  test.describe(`PDF viewer ${mode.name}`, () => {
    test('mở nội tuyến, điều khiển trang/zoom và tải đúng PDF', async ({ page }) => {
      const externalRequests = [];
      page.on('request', request => {
        const url = request.url();
        if (/^https?:/.test(url) && !url.startsWith('http://127.0.0.1:')) externalRequests.push(url);
      });
      await openLesson(page, mode.url());
      const runtimeBefore = await page.evaluate(() => Boolean(window.PdfTextbookRuntime));
      expect(runtimeBefore).toBe(false);

      const dialog = await openViewer(page);
      await expect(dialog.locator('.pdf-viewer-text-layer')).toBeAttached();
      await expect(dialog.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
      await dialog.getByRole('button', { name: 'Trang sau' }).click();
      await expect(dialog.getByText('Trang 2 trên', { exact: false })).toBeVisible();
      const pageInput = dialog.getByRole('spinbutton', { name: 'Đi đến trang' });
      await pageInput.evaluate(input => {
        input.value = '0';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await expect(dialog.getByText('Trang 1 trên', { exact: false })).toBeVisible();
      const next = dialog.getByRole('button', { name: 'Trang sau' });
      await Promise.all([next.click(), next.click(), next.click()]);
      await expect(dialog.getByText('Trang 4 trên', { exact: false })).toBeVisible();
      const baseTextSize = await dialog.locator('.pdf-viewer-text-layer span:not(.markedContent)').first()
        .evaluate(span => parseFloat(getComputedStyle(span).fontSize));

      const zoom = dialog.getByTestId('pdf-zoom-output');
      await expect(zoom).toHaveText('100%');
      await dialog.getByRole('button', { name: 'Phóng to' }).click();
      await expect(zoom).toHaveText('125%');
      const zoomedTextSize = await dialog.locator('.pdf-viewer-text-layer span:not(.markedContent)').first()
        .evaluate(span => parseFloat(getComputedStyle(span).fontSize));
      expect(zoomedTextSize).toBeGreaterThan(baseTextSize);
      await dialog.getByRole('button', { name: 'Vừa chiều rộng' }).click();
      const total = Number(await dialog.locator('#pdf-page-total').textContent().then(text => text.replace('/ ', '')));
      await pageInput.evaluate((input, value) => {
        input.value = String(value);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, total - 1);
      await expect(dialog.getByText(`Trang ${total - 1} trên`, { exact: false })).toBeVisible();
      await Promise.all([next.click(), next.click()]);
      await expect(dialog.getByText(`Trang ${total} trên`, { exact: false })).toBeVisible();

      const downloadPromise = page.waitForEvent('download');
      await dialog.getByRole('button', { name: 'Tải xuống bản PDF' }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('CoHocLyThuyet.pdf');
      const savedPath = await download.path();
      expect(sha256(savedPath)).toBe(sha256(path.join(ROOT, 'CoHocLyThuyet.pdf')));
      expect(externalRequests).toEqual([]);
    });

    test('đóng giữ nguyên route, DOM, scroll, simulation, storage và focus', async ({ page }) => {
      await openLesson(page, mode.url());
      const before = await page.evaluate(() => {
        localStorage.setItem('chlyt_notes', '{"guard":true}');
        window.scrollTo(0, 420);
        window.__pdfTestContent = document.getElementById('content-area');
        window.__pdfTestSim = document.querySelector('[data-sim-mount-route="ch1-1-3"] svg');
        return {
          hash: location.hash,
          notes: localStorage.getItem('chlyt_notes'),
          scroll: scrollY,
        };
      });

      const dialog = await openViewer(page);
      await expect(page.getByRole('button', { name: 'Xem bản PDF' })).not.toBeFocused();
      await dialog.getByRole('button', { name: 'Quay lại giáo trình' }).click();
      await expect(dialog).not.toBeVisible();

      const after = await page.evaluate(() => ({
        hash: location.hash,
        sameContent: document.getElementById('content-area') === window.__pdfTestContent,
        sameSim: document.querySelector('[data-sim-mount-route="ch1-1-3"] svg') === window.__pdfTestSim,
        notes: localStorage.getItem('chlyt_notes'),
        scroll: scrollY,
      }));
      expect(after.hash).toBe(before.hash);
      expect(after.sameContent).toBe(true);
      expect(after.sameSim).toBe(true);
      expect(after.notes).toBe(before.notes);
      expect(Math.abs(after.scroll - before.scroll)).toBeLessThanOrEqual(2);
      await expect(page.getByRole('button', { name: 'Xem bản PDF' })).toBeFocused();
    });

    test('Escape đóng viewer; reopen không nhân đôi dialog hoặc script', async ({ page }) => {
      await openLesson(page, mode.url());
      await openViewer(page);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await openViewer(page);
      await expect(page.locator('#pdf-viewer-dialog')).toHaveCount(1);
      await expect(page.locator('script[data-pdf-runtime]')).toHaveCount(1);
      await expect(page.locator('script[data-pdf-data]')).toHaveCount(1);
    });

    test('Browser Back đóng viewer trước khi điều hướng bài học', async ({ page }) => {
      await openLesson(page, mode.url());
      const hash = await page.evaluate(() => location.hash);
      const dialog = await openViewer(page);
      await page.goBack();
      await expect(dialog).not.toBeVisible();
      expect(await page.evaluate(() => location.hash)).toBe(hash);
      await expect(page.getByRole('button', { name: 'Xem bản PDF' })).toBeFocused();
    });
  });
}


test('viewer responsive 320px, theme-aware và không tràn shell', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openLesson(page, FILE_URL);
  const dialog = await openViewer(page);
  const overflow = await dialog.evaluate(el => el.scrollWidth > el.clientWidth);
  expect(overflow).toBe(false);
  await expect(page.getByRole('button', { name: 'Xem bản PDF' })).toHaveAttribute('aria-label', 'Xem bản PDF');
  await page.evaluate(() => window.togTheme());
  await expect(dialog).toBeVisible();
});

test('thiếu runtime hiện lỗi có đường thoát, không để trang trắng', async ({ page }) => {
  await page.route('**/pdfjs-runtime.iife.min.js', route => route.abort());
  await openLesson(page, httpUrl);
  await page.getByRole('button', { name: 'Xem bản PDF' }).click();
  const dialog = page.getByRole('dialog', { name: 'Giáo trình Cơ học lý thuyết - Bản PDF' });
  await expect(dialog.getByRole('heading', { name: 'Không thể mở bản PDF' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Thử lại' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Quay lại giáo trình', exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test('lỗi render trang đầu hiện recovery và retry hủy document cũ', async ({ page }) => {
  await openLesson(page, httpUrl);
  const normalDialog = await openViewer(page);
  await normalDialog.getByRole('button', { name: 'Quay lại giáo trình' }).click();
  await expect(normalDialog).not.toBeVisible();
  await page.evaluate(() => {
    window.__destroyedPdfTasks = 0;
    window.PdfTextbookRuntime = {
      ...window.PdfTextbookRuntime,
      openDocument: () => ({
        promise: Promise.resolve({
          numPages: 1,
          getPage: () => Promise.reject(new Error('render-page-proof')),
        }),
        destroy: async () => { window.__destroyedPdfTasks++; },
      }),
    };
  });
  await page.getByRole('button', { name: 'Xem bản PDF' }).click();
  const dialog = page.getByRole('dialog', { name: 'Giáo trình Cơ học lý thuyết - Bản PDF' });
  await expect(dialog.getByRole('heading', { name: 'Không thể mở bản PDF' })).toBeVisible();
  await expect(dialog.getByText('render-page-proof')).toBeVisible();
  await dialog.getByRole('button', { name: 'Thử lại' }).click();
  await expect.poll(() => page.evaluate(() => window.__destroyedPdfTasks)).toBe(1);
  await expect(dialog.getByRole('heading', { name: 'Không thể mở bản PDF' })).toBeVisible();
});

test('text-layer cancellation không che render mới bằng lỗi giả', async ({ page }) => {
  await openLesson(page, httpUrl);
  const dialog = await openViewer(page);
  await page.evaluate(() => {
    const Original = window.PdfTextbookRuntime.TextLayer;
    let delayNext = true;
    window.PdfTextbookRuntime = {
      ...window.PdfTextbookRuntime,
      TextLayer: class {
        constructor(options) {
          this.inner = new Original(options);
          this.delayed = delayNext;
          delayNext = false;
        }
        render() {
          if (!this.delayed) return this.inner.render();
          window.__textLayerPending = true;
          return new Promise((resolve, reject) => { this.reject = reject; });
        }
        cancel() {
          if (this.reject) {
            const error = new Error('cancelled');
            error.name = 'AbortException';
            this.reject(error);
          }
          this.inner.cancel();
        }
      },
    };
  });
  const next = dialog.getByRole('button', { name: 'Trang sau' });
  await next.click();
  await expect.poll(() => page.evaluate(() => Boolean(window.__textLayerPending))).toBe(true);
  await next.click();
  await expect(dialog.getByText('Trang 3 trên', { exact: false })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Không thể mở bản PDF' })).toHaveCount(0);
});

test('fit-width callback cũ không ghi đè zoom mới', async ({ page }) => {
  await openLesson(page, httpUrl);
  const normalDialog = await openViewer(page);
  await normalDialog.getByRole('button', { name: 'Quay lại giáo trình' }).click();
  await expect(normalDialog).not.toBeVisible();
  await page.evaluate(() => {
    const openDocument = window.PdfTextbookRuntime.openDocument;
    window.PdfTextbookRuntime = {
      ...window.PdfTextbookRuntime,
      openDocument(options) {
        const task = openDocument(options);
        return {
          destroy: () => task.destroy(),
          promise: task.promise.then(doc => new Proxy(doc, {
            get(target, property) {
              if (property === 'getPage') return pageNumber => {
                if (!window.__delayFitPage) return target.getPage(pageNumber);
                window.__delayFitPage = false;
                return new Promise(resolve => {
                  window.__resolveFitPage = () => target.getPage(pageNumber).then(resolve);
                });
              };
              const value = Reflect.get(target, property, target);
              return typeof value === 'function' ? value.bind(target) : value;
            },
          })),
        };
      },
    };
  });
  const dialog = await openViewer(page);
  await page.evaluate(() => { window.__delayFitPage = true; });
  await dialog.getByRole('button', { name: 'Vừa chiều rộng' }).click();
  await dialog.getByRole('button', { name: 'Phóng to' }).click();
  await expect(dialog.getByTestId('pdf-zoom-output')).toHaveText('125%');
  await page.evaluate(() => window.__resolveFitPage());
  await page.waitForTimeout(50);
  await expect(dialog.getByTestId('pdf-zoom-output')).toHaveText('125%');
});
