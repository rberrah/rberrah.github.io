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

for(const lang of ['fr','en']){
 test('Home latest update sits beside title on desktop and below on mobile ('+lang+')',async({page})=>{
  const en=lang==='en';
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/?lang='+lang);
  const hero=page.getByTestId('hero'),news=hero.getByTestId('latest-news');
  await expect(news).toBeVisible();
  await expect(news).toContainText(en?'Introducing PMx Game: five interactive pathways':'Lancement de PMx Game : cinq parcours interactifs');
  const title=await hero.locator('h1').boundingBox(),card=await news.boundingBox();
  expect(card.x).toBeGreaterThanOrEqual(title.x+title.width-1);
  await page.getByTestId('goal-resources').locator('summary').click();
  await expect(page.getByTestId('nav-news')).toHaveText(en?'What’s new':'Actualités');
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});
  const mobileTitle=await hero.locator('h1').boundingBox(),mobileCard=await news.boundingBox();
  expect(mobileCard.y).toBeGreaterThan(mobileTitle.y+mobileTitle.height);
  expect(mobileCard.x+mobileCard.width).toBeLessThanOrEqual(391);
  await news.getByTestId('home-news-link').click();
  await expect(page.getByRole('heading',{name:en?'News and updates':'Actualités',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
 });
}

for (const lang of ['fr','en']) {
 test('Home learning map and personal-site link ('+lang+')', async ({page})=>{
  const en=lang==='en';const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:900});await page.goto('/?lang='+lang);
  await expect(page.getByTestId('hero').locator('h1')).toHaveText(en?'Pharmacometrics, from theory to practice.':'La pharmacométrie, de la théorie à la pratique.');
  await expect(page.getByTestId('home-main-site')).toHaveAttribute('href','https://rberrah.github.io/');
  await expect(page.getByTestId('home-main-site')).toContainText(en?'Personal website':'Site personnel');
  const card=await page.getByTestId('latest-news').boundingBox();expect(card.width).toBeLessThanOrEqual(211);
  await expect(page.getByTestId('course-track-card')).toHaveCount(16);
  for (const layer of ['tronc','approfondissement','domaine','reference']) await expect(page.getByTestId('layer-'+layer)).toBeVisible();
  await expect(page.getByTestId('track-open-core')).toBeVisible();
  const chapters=page.getByTestId('featured-chapters');await expect(chapters.locator('details')).not.toHaveAttribute('open','');
  await chapters.locator('summary').click();await expect(chapters.getByTestId('chapter-link').first()).toBeVisible();
  await chapters.locator('summary').click();await expect(chapters.getByTestId('chapter-link').first()).toBeHidden();
  await page.locator('.language-toggle').getByRole('button',{name:en?'FR':'EN'}).click();
  await expect(page.getByTestId('hero').locator('h1')).toHaveText(en?'La pharmacométrie, de la théorie à la pratique.':'Pharmacometrics, from theory to practice.');
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.getByTestId('track-open-core').click();await expect(page).toHaveURL(/\/parcours\/core\//);
  expect(errors).toEqual([]);
 });
}
