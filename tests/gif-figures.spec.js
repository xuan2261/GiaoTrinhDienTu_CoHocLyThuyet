const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;
const STATIC_SOURCE = 'images/ch1/hinh-026.png';
const GIF_SOURCE = 'assets/gifs/ch1/hinh-1-06.gif';
const EXPECTED_MANIFEST = {
  'images/ch1/hinh-026.png': 'assets/gifs/ch1/hinh-1-06.gif',
  'images/ch1/hinh-033.png': 'assets/gifs/ch1/hinh-1-09.gif',
  'images/ch1/hinh-118.png': 'assets/gifs/ch1/hinh-1-28b.gif',
  'images/ch1/hinh-136.png': 'assets/gifs/ch1/hinh-1-34.gif',
  'images/ch1/hinh-138.png': 'assets/gifs/ch1/hinh-1-35.gif',
  'images/ch1/hinh-149.png': 'assets/gifs/ch1/hinh-1-minh-hoa-02.gif',
  'images/ch2/hinh-072.png': 'assets/gifs/ch2/hinh-2-07.gif',
  'images/ch2/hinh-080.png': 'assets/gifs/ch2/hinh-2-09.gif',
  'images/ch2/hinh-143.png': 'assets/gifs/ch2/hinh-2-15.gif',
  'images/ch2/hinh-147.png': 'assets/gifs/ch2/hinh-2-16.gif',
  'images/ch2/hinh-196.png': 'assets/gifs/ch2/hinh-2-22.gif',
  'images/ch2/hinh-219.png': 'assets/gifs/ch2/hinh-2-26.gif',
  'images/ch2/hinh-276.png': 'assets/gifs/ch2/hinh-2-34.gif',
  'images/ch3/hinh-101.png': 'assets/gifs/ch3/hinh-3-06.gif',
  'images/ch3/hinh-151.png': 'assets/gifs/ch3/hinh-3-10.gif',
  'images/ch3/hinh-169.png': 'assets/gifs/ch3/hinh-3-11.gif',
  'images/ch3/hinh-216.png': 'assets/gifs/ch3/hinh-3-17.gif',
  'images/ch3/hinh-225.png': 'assets/gifs/ch3/hinh-3-20.gif',
  'images/ch3/hinh-237.png': 'assets/gifs/ch3/hinh-3-21.gif',
  'images/ch3/hinh-244.png': 'assets/gifs/ch3/hinh-3-22.gif'
};

async function openMappedFigure(page) {
  await page.goto(`${INDEX}#ch1-2-2`, { waitUntil: 'domcontentloaded' });
  const image = page.locator(`img[data-static-src="${STATIC_SOURCE}"]`);
  await expect(image).toHaveCount(1);
  return image;
}

test.describe('ảnh minh họa GIF có PNG dự phòng', () => {
  test('mặc định tải GIF và chỉ đổi đúng 20 hình trong manifest', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const image = await openMappedFigure(page);

    await expect(page.locator('#gifMotionBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#gifMotionBtn')).toHaveAttribute('aria-label', 'Ảnh động minh họa');
    await expect(image).toHaveAttribute('src', GIF_SOURCE);
    await expect(image).toHaveAttribute('alt', 'Trượt lực');
    await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);

    const contract = await page.evaluate(() => ({
      manifest: { ...window.GifFigures.manifest },
      mapped: window.GifFigures.manifest['images/ch1/hinh-026.png'],
      unmapped: window.GifFigures.transform('<img src="images/ch1/hinh-002.png" alt="Mô men">')
    }));
    expect(contract).toEqual({
      manifest: EXPECTED_MANIFEST,
      mapped: GIF_SOURCE,
      unmapped: '<img src="images/ch1/hinh-002.png" alt="Mô men">'
    });
  });

  test('nút bật/tắt đổi GIF sang PNG và giữ lựa chọn sau refresh', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    let image = await openMappedFigure(page);

    await page.locator('#gifMotionBtn').click();
    await expect(page.locator('#gifMotionBtn')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.gif-motion-state')).toHaveText('Tắt');
    await expect(image).toHaveAttribute('src', STATIC_SOURCE);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('gifMotionEnabled'))).toBe('false');

    await page.reload({ waitUntil: 'domcontentloaded' });
    image = page.locator(`img[data-static-src="${STATIC_SOURCE}"]`);
    await expect(image).toHaveAttribute('src', STATIC_SOURCE);
    await expect(page.locator('#gifMotionBtn')).toHaveAttribute('aria-pressed', 'false');

    await page.locator('#gifMotionBtn').click();
    await expect(image).toHaveAttribute('src', GIF_SOURCE);
    await expect(page.locator('.gif-motion-state')).toHaveText('Bật');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('gifMotionEnabled'))).toBe('true');
  });

  test('reduced-motion mặc định giữ PNG khi chưa có lựa chọn lưu', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const image = await openMappedFigure(page);

    await expect(page.locator('#gifMotionBtn')).toHaveAttribute('aria-pressed', 'false');
    await expect(image).toHaveAttribute('src', STATIC_SOURCE);
    expect(await page.evaluate(() => localStorage.getItem('gifMotionEnabled'))).toBeNull();
  });

  test('GIF tải lỗi tự động trở về PNG và không lặp lỗi', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const image = await openMappedFigure(page);

    await image.evaluate(node => {
      node.dataset.gifSrc = 'assets/gifs/ch1/khong-ton-tai.gif';
      node.dataset.gifFailed = 'false';
      window.GifFigures.setEnabled(false, false);
      window.GifFigures.setEnabled(true, false);
    });

    await expect(image).toHaveAttribute('data-gif-failed', 'true');
    await expect(image).toHaveAttribute('src', STATIC_SOURCE);
    await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
  });
});
