'use strict';
// Browser acceptance coverage for the 2026-10-02 audit. Requires a supported
// Playwright/Chromium environment; Node source tests do not replace this suite.
const { test, expect } = require('@playwright/test');
const path = require('node:path');
async function mount(page, route) {
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`file://${path.resolve(__dirname, `fixtures/sim2-ch${route[2]}.html`)}`);
  await page.evaluate(id=>{window.__sim=window.SIM_MAP[id](document.getElementById('host'));},route);
  return errors;
}
async function slider(page,id,value) {
  await page.locator(`#host input[data-id="${id}"]`).evaluate((n,v)=>{n.value=v;n.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
}
async function step(page,n) {
  await page.locator('#host .sim2-step').evaluate((b,count)=>{for(let i=0;i<count;i++)b.click();},n);
}
async function value(page,key) {
  return parseFloat(await page.locator(`#host [data-readout-key="${key}"] .sim2-readout-value`).textContent());
}
async function contained(page, selector) {
  return page.locator(selector).evaluateAll(nodes=>nodes.every(n=>{
    const a=n.getBoundingClientRect(),b=n.closest('.sim2-root').getBoundingClientRect();
    return a.left>=b.left && a.top>=b.top && a.right<=b.right && a.bottom<=b.bottom;
  }));
}
test('R2D-01: real controls retain physical x/v after 60 steps and beyond graph window',async({page})=>{
  const errors=await mount(page,'ch3-2-2');
  await step(page,60);expect(await value(page,'x')).toBe(1.5);expect(await value(page,'v')).toBe(3);
  await step(page,120);expect(await value(page,'t')).toBe(3);expect(await value(page,'x')).toBe(13.5);expect(await value(page,'v')).toBe(9);
  await page.locator('#host .sim2-reset').click();expect(await value(page,'x')).toBe(0);expect(await value(page,'v')).toBe(0);
  expect(errors).toEqual([]);
});
test('R2D-02: reaction arc opposes clockwise load in DOM',async({page})=>{
  await mount(page,'ch1-3-6');
  for(const [P,a] of [[20,.5],[80,5],[150,8]]) {
    await slider(page,'P',P);await slider(page,'a',a);
    expect(await value(page,'M')).toBe(P*a);
    await expect(page.locator('#host .sim2-moment-arc')).toHaveAttribute('data-dir','ccw');
  }
});
test('R2D-04: actual down/up at rope handle does not change alpha, tension or ARIA',async({page})=>{
  await mount(page,'ch1-3-2');
  const handle=page.locator('#host .sim2-handle');
  for(const alpha of [5,30,49,60,75]) {
    await slider(page,'alpha',alpha);const before=await value(page,'T');
    expect(Number(await handle.getAttribute('aria-valuenow'))).toBeCloseTo(alpha,8);
    await handle.click();
    expect(await value(page,'alpha')).toBe(alpha);expect(await value(page,'T')).toBe(before);
    expect(Number(await handle.getAttribute('aria-valuenow'))).toBeCloseTo(alpha,8);
    expect(Number(await page.locator('#host input[data-id="alpha"]').inputValue())).toBe(alpha);
  }
});
test('R2D-03/R2D-07: IC at A has zero velocity; arrows fit both handle boundaries',async({page})=>{
  await mount(page,'ch2-5-2');const handle=page.locator('#host .sim2-handle');
  await handle.focus();await page.keyboard.press('Home');
  expect(await value(page,'vA')).toBe(0);expect(await value(page,'vB')).toBe(2);
  const firstArrow=page.locator('#host svg line[marker-end]').first();
  await expect(firstArrow).toHaveAttribute('visibility','hidden');
  await page.keyboard.press('End');
  await expect(firstArrow).toHaveAttribute('visibility','visible');
  expect(await contained(page,'#host svg line[marker-end]')).toBe(true);
});
test('R2D-07: projectile at pre-touchdown and maximal gears/pulleys stay inside viewport',async({page})=>{
  await mount(page,'ch2-1-1');
  for(const [v0,alpha] of [[14,55],[20,45],[20,80],[8,20]]) {
    await slider(page,'v0',v0);await slider(page,'alpha',alpha);
    await step(page,Math.floor(60*2*v0*Math.sin(alpha*Math.PI/180)/9.81));
    expect(await contained(page,'#host svg line[marker-end]')).toBe(true);
  }
  await mount(page,'ch2-3-2');await slider(page,'r1',2.5);await slider(page,'r2',2.5);
  expect(await contained(page,'#host .sim2-transmission-gear, #host .sim2-transmission-pulley')).toBe(true);
});
