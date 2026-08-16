const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;
const STATIC_SOURCE = 'images/ch1/hinh-1-06.png';
const GIF_SOURCE = 'assets/gifs/ch1/hinh-1-06.gif';
const EXPECTED_BASENAMES = {
  ch1: ['hinh-1-06', 'hinh-1-09', 'hinh-1-28b', 'hinh-1-34', 'hinh-1-35', 'hinh-1-minh-hoa-02'],
  ch2: ['hinh-2-07', 'hinh-2-09', 'hinh-2-15', 'hinh-2-16', 'hinh-2-22', 'hinh-2-26', 'hinh-2-34'],
  ch3: ['hinh-3-06', 'hinh-3-10', 'hinh-3-11', 'hinh-3-17', 'hinh-3-20', 'hinh-3-21', 'hinh-3-22']
};
const EXPECTED_MANIFEST = Object.fromEntries(
  Object.entries(EXPECTED_BASENAMES).flatMap(([chapter, basenames]) =>
    basenames.map(basename => [
      `images/${chapter}/${basename}.png`,
      `assets/gifs/${chapter}/${basename}.gif`
    ])
  )
);

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
      mapped: window.GifFigures.manifest['images/ch1/hinh-1-06.png'],
      unmapped: window.GifFigures.transform('<img src="images/ch1/hinh-1-01.png" alt="Mô men">')
    }));
    expect(contract).toEqual({
      manifest: EXPECTED_MANIFEST,
      mapped: GIF_SOURCE,
      unmapped: '<img src="images/ch1/hinh-1-01.png" alt="Mô men">'
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
