import { test, expect } from '@playwright/test';

test('published news is bilingual, filterable and reachable from home', async ({page, request}) => {
  await page.goto('/?lang=fr');
  await expect(page.getByTestId('latest-news')).toContainText('DERNIÈRE ACTUALITÉ');
  await page.getByTestId('home-news-link').click();
  await expect(page.getByRole('heading', {name:'Actualités', exact:true})).toBeVisible();
  await expect(page.locator('.update').first()).toContainText('Lancement de PMx Game : cinq parcours interactifs');
  await expect(page.locator('.update').first().locator('time')).toHaveAttribute('datetime','2026-11-25');
  await page.getByRole('button',{name:'Maintenance',exact:true}).click();
  await expect(page.locator('.update')).toHaveCount(1);
  await page.locator('.language-toggle').getByRole('button',{name:'EN'}).click();
  await expect(page.getByRole('heading',{name:'News and updates'})).toBeVisible();
  await expect(page.locator('.update')).toContainText('Direct game access');
  await page.getByRole('button',{name:'All updates',exact:true}).click();
  await expect(page.locator('.update')).toHaveCount(5);
  await expect(page.locator('#pmetrics .primary-link')).toHaveAttribute('href',/\/game\/\?path=pmetrics&lang=en$/);
  await expect(page.locator('#pmetrics .primary-link')).toHaveAttribute('data-sveltekit-reload','');
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('/pharmacometrie/actualites/</loc>');
});

test('news is accessible from the resources navigation and fits mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?lang=en');
  await page.getByTestId('nav-toggle').click();
  await page.getByTestId('goal-resources').locator('summary').click();
  await page.getByTestId('nav-news').click();
  await expect(page.getByRole('heading',{name:'News and updates'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

for(const lang of ['fr','en']){
 test('News direct entry and navigation preserve language ('+lang+')',async({page})=>{
  const en=lang==='en';
  await page.goto('/actualites/?lang='+lang);
  await expect(page.getByRole('heading',{name:en?'News and updates':'Actualités',exact:true})).toBeVisible();
  await expect(page.locator('.update').first()).toContainText(en?'Introducing PMx Game: five interactive pathways':'Lancement de PMx Game : cinq parcours interactifs');
  await page.getByRole('button',{name:en?'Learning':'Pédagogie',exact:true}).click();
  await expect(page.locator('.update')).toHaveCount(4);
  await expect(page.locator('#pmetrics .primary-link')).toHaveAttribute('href',new RegExp('lang='+lang+'$'));
  await page.locator('.language-toggle').getByRole('button',{name:en?'FR':'EN'}).click();
  await expect(page.getByRole('heading',{name:en?'Actualités':'News and updates',exact:true})).toBeVisible();
  await expect(page.locator('.update')).toHaveCount(4);
 });
}
