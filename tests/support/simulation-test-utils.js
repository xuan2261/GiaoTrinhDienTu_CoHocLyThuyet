'use strict';

const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function fixtureUrl(chapter) {
  const file = path.join(ROOT, `tests/fixtures/sim2-ch${chapter}.html`).replace(/\\/g, '/');
  return `file:///${file}`;
}

async function mountRoute(page, routeId, chapter) {
  await page.goto(fixtureUrl(chapter), { waitUntil: 'domcontentloaded' });
  await page.evaluate(id => {
    const factory = (window.SIM_MAP || {})[id];
    if (typeof factory !== 'function') throw new Error(`missing route factory: ${id}`);
    window.__SIM2_EXECUTED_ROUTE__ = id;
    window.__sim = factory(document.getElementById('host'));
  }, routeId);
}

async function readouts(page) {
  return page.$$eval('#host .sim2-readout-row', rows => {
    const values = {};
    for (const row of rows) {
      const key = row.getAttribute('data-readout-key');
      if (!key) throw new Error(`readout row missing data-readout-key: ${row.textContent}`);
      if (Object.prototype.hasOwnProperty.call(values, key)) throw new Error(`duplicate readout key: ${key}`);
      values[key] = (row.querySelector('.sim2-readout-value')?.textContent || '').trim();
    }
    return values;
  });
}

function numberFrom(value) {
  const match = String(value).replace(',', '.').match(/[-+]?\d+(?:\.\d+)?/);
  if (!match) throw new Error(`readout is not numeric: ${value}`);
  const valueNumber = Number(match[0]);
  if (!Number.isFinite(valueNumber)) throw new Error(`readout is not finite: ${value}`);
  return valueNumber;
}

function numbersFrom(value) {
  return [...String(value).replace(/,/g, ' ').matchAll(/[-+]?\d+(?:\.\d+)?/g)].map(match => Number(match[0]));
}

async function setSlider(page, id, value) {
  await page.evaluate(({ id, value }) => {
    const input = document.querySelector(`#host input[type=range][data-id="${id}"]`);
    if (!input) throw new Error(`missing slider: ${id}`);
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, { id, value });
}

async function transitionRoute(page, routeId) {
  if (routeId === 'ch3-6-2') {
    await setSlider(page, 'e', 0.2);
    await page.evaluate(() => {
      const step = document.querySelector('#host .sim2-step');
      for (let i = 0; i < 110; i += 1) step.click();
    });
    return;
  }

  const slider = page.locator('#host input[type=range]').first();
  if (await slider.count()) {
    const current = Number(await slider.inputValue());
    const min = Number(await slider.getAttribute('min'));
    const max = Number(await slider.getAttribute('max'));
    await setSlider(page, await slider.getAttribute('data-id'), current === max ? min : max);
    return;
  }

  const step = page.locator('#host .sim2-step');
  if (await step.count()) {
    await step.click();
    return;
  }

  const handle = page.locator('#host .sim2-handle').first();
  const box = await handle.boundingBox();
  if (!box) throw new Error(`route has no executable transition: ${routeId}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 48, box.y + box.height / 2 - 24, { steps: 4 });
  await page.mouse.up();
}

module.exports = { fixtureUrl, mountRoute, readouts, numberFrom, numbersFrom, setSlider, transitionRoute };
