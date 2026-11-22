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
  await expect(page.locator('#academy-mode')).toBeVisible();
  await page.getByRole('button',{name:/Atelier libre · Construire/}).click();
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
  await page.getByRole('button',{name:/Atelier libre · Construire/}).click();
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


test('campaign teaches linear/semi-log, numerical Tlag and slope, then unlocks nine quests',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/game/');
  await expect(page.locator('#academy-mode')).toBeVisible();
  await expect(page.locator('#lab-mode')).toBeHidden();
  await expect(page.locator('#quest-count')).toHaveText('0/9');
  await expect(page.locator('#quest-list button[disabled]')).toHaveCount(8);
  await expect(page.locator('#body-figure')).toContainText('INTESTIN');
  await expect(page.locator('#tutorial-step')).toContainText('1 / 3');
  await page.locator('#tutorial-next').click();
  await expect(page.locator('#tutorial-step')).toContainText('2 / 3');
  await page.locator('#tutorial-next').click();
  await expect(page.locator('#academy-log')).toHaveAttribute('aria-pressed','true');
  await page.locator('#tutorial-next').click();
  await expect(page.locator('#academy-question')).toBeVisible();
  await page.locator('input[name="quest-option"][value="1"]').check();
  await page.locator('#academy-verify').click();
  await expect(page.locator('#quest-count')).toHaveText('1/9');
  await expect(page.locator('#quest-xp')).toHaveText('40 XP');
  await page.locator('#academy-next').click();
  await expect(page.locator('#academy-title')).toHaveText('La ligne qui se redresse');
  await page.locator('#academy-linear').click();
  await expect(page.locator('#academy-linear')).toHaveAttribute('aria-pressed','true');
  await page.locator('#academy-log').click();
  await expect(page.locator('#academy-chart polyline').first()).toBeVisible();
  const chart=page.locator('#academy-chart');
  const bounds=await chart.boundingBox();
  await chart.click({position:{x:bounds.width*0.4,y:bounds.height*.45}});
  await chart.click({position:{x:bounds.width*.7,y:bounds.height*.65}});
  await expect(page.locator('#academy-probe')).toContainText('Δln(C)/Δt');
  await page.locator('input[name="quest-option"][value="0"]').check();
  await page.locator('#academy-verify').click();
  await page.locator('#academy-next').click();
  await expect(page.locator('#academy-title')).toHaveText('L’empreinte des deux pentes');
  await page.locator('input[name="quest-option"][value="1"]').check();
  await page.locator('#academy-verify').click();
  await page.locator('#academy-next').click();
  await expect(page.locator('#academy-title')).toHaveText('Le départ retardé');
  await expect(page.locator('#academy-answers input[type="number"]')).toBeVisible();
  await page.locator('#academy-number').fill('1');
  await page.locator('#academy-verify').click();
  await expect(page.locator('#academy-feedback')).toContainText('réessayez');
  await page.locator('#academy-number').fill('2');
  await page.locator('#academy-verify').click();
  await expect(page.locator('#academy-feedback')).toContainText('Tlag');
  await page.locator('#academy-next').click();
  await expect(page.locator('#academy-title')).toHaveText('Le secret de la pente');
  await page.locator('#academy-number').fill('0.25');
  await page.locator('#academy-verify').click();
  await expect(page.locator('#academy-feedback')).toContainText('2,77 h');
  for(const correct of [1,2,0,1]){
    await page.locator('#academy-next').click();
    await page.locator('input[name="quest-option"][value="'+correct+'"]').check();
    await page.locator('#academy-verify').click();
  }
  await expect(page.locator('#quest-count')).toHaveText('9/9');
  await expect(page.locator('#quest-xp')).toHaveText('760 XP');
  await expect(page.locator('#academy-feedback')).toContainText('Détective PK');
  await page.reload();
  await expect(page.locator('#quest-count')).toHaveText('9/9');
  await expect(page.locator('#academy-title')).toHaveText('Le dossier inconnu');
  await page.locator('#academy-explore').click();
  await expect(page.locator('#lab-mode')).toBeVisible();
  await expect(page.locator('#mission-text')).toContainText('Score');
  expect(errors).toEqual([]);
});

test('campaign renders at narrow width without horizontal scrolling, with locally saved progress only',async({page})=>{
  await page.setViewportSize({width:360,height:740});
  await page.goto(origin+'/game/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.locator('#academy-chart')).toBeVisible();
  await expect(page.locator('#quest-list button')).toHaveCount(9);
  await expect(page.locator('script[data-portal-analytics]')).toHaveCount(0);
  await page.locator('#academy-time').evaluate(el=>{el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('#academy-clock')).toHaveText('5,0 h');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
