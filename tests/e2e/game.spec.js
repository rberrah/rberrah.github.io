// @ts-nocheck
import { test, expect } from '@playwright/test';
const origin = process.env.PORTAL_E2E_URL || 'http://127.0.0.1:4181';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => new URL(route.request().url()).origin === origin
    ? route.continue() : route.abort());
});

test('unlisted /game/ loads a working educational simulator with no menu link', async ({ page }) => {
  const errors=[];
  page.on('pageerror', e => errors.push(e.message));
  const response=await page.goto(origin+'/game/');
  expect(response.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow,noarchive');
  await expect(page.locator('#diagram [data-node="central"]')).toHaveCount(1);
  await expect(page.locator('#diagram [data-node="p1"]')).toHaveCount(0);
  const before=await page.locator('#auc').textContent();
  await page.getByRole('button',{name:'2C',exact:true}).click();
  await expect(page.locator('#diagram [data-node="p1"]')).toHaveCount(1);
  await page.getByRole('button',{name:'3C',exact:true}).click();
  await expect(page.locator('#diagram [data-node="p2"]')).toHaveCount(1);
  await page.getByRole('button',{name:'− Compartiment'}).click();
  await expect(page.locator('#diagram [data-node="p2"]')).toHaveCount(0);
  const cl=page.getByLabel('CL en L par heure');
  await cl.evaluate(el=>{el.value='12';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('#auc')).not.toHaveText(before);
  await page.getByRole('button',{name:'IV bolus'}).click();
  await expect(page.locator('[data-oral]:visible')).toHaveCount(0);
  await page.locator('#time').evaluate(el=>{el.value='10';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('#clock')).toContainText('10,0 h');
  await page.getByRole('button',{name:'Défi : courbe cachée'}).click();
  await expect(page.locator('#mission-text')).toContainText('Score');
  await expect(page.locator('#legend-ref')).toBeVisible();
  await expect(page.locator('#chart path[stroke="#e8bd83"]')).toHaveCount(1);
  expect(errors).toEqual([]);
  await page.goto(origin+'/');
  await expect(page.locator('a[href^="/game"]')).toHaveCount(0);
});

test('diagram interaction and responsive layout work without external requests',async ({page})=>{
  await page.setViewportSize({width:360,height:760});
  await page.goto(origin+'/game/');
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
  // The mobile settings panel is taller than the viewport: mouse.move() does
  // not scroll automatically, unlike locator.click(). Expose the SVG first.
  await page.locator('#diagram').scrollIntoViewIfNeeded();
  const node=page.locator('[data-node="central"]');
  const oldX=Number(await node.locator('rect').getAttribute('x'));
  const box=await node.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+25,box.y+box.height/2+15,{steps:5});
  await page.mouse.up();
  const newX=Number(await page.locator('[data-node="central"] rect').getAttribute('x'));
  expect(newX).toBeGreaterThan(oldX);
  await page.getByRole('button',{name:'▶ Lecture'}).click();
  await expect(page.getByRole('button',{name:'Ⅱ Pause'})).toBeVisible();
  await page.getByRole('button',{name:'Ⅱ Pause'}).click();
  await expect(page.getByRole('button',{name:'▶ Lecture'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
});
