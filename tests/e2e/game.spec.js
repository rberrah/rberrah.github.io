// @ts-nocheck
import { test, expect } from '@playwright/test';
const origin = process.env.PORTAL_E2E_URL || 'http://127.0.0.1:4181';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => new URL(route.request().url()).origin === origin
    ? route.continue() : route.abort());
});

test('canonical /pharmacometrie/game/ loads full educational simulator with official links', async ({ page }) => {
  const errors=[];
  page.on('pageerror', e => errors.push(e.message));
  const response=await page.goto(origin+'/pharmacometrie/game/');
  expect(response.status()).toBe(200);
  await expect(page.locator('#academy-mode')).toBeVisible();
  await page.getByRole('button',{name:/Atelier libre · Construire/}).click();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://rberrah.github.io/pharmacometrie/game/');
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
  await expect(page.locator('a[href^="/pharmacometrie/game/"]')).not.toHaveCount(0);
  await page.goto(origin+'/pharmacometrie/');
  await expect(page.getByTestId('game-feature-open')).toHaveAttribute('href',/\/pharmacometrie\/game\/\?lang=/);
  await page.goto(origin+'/pharmacometrie/chapitres/');
  await expect(page.getByTestId('game-learn-open')).toBeVisible();
});

test('PMx navigation loads the assembled full game, preserving FR/EN instead of SvelteKit placeholder', async ({page})=>{
  for(const lang of ['fr','en']){
    await page.goto(origin+'/pharmacometrie/?lang='+lang);
    await page.getByTestId('cta-game').click();
    await expect(page).toHaveURL(new RegExp('/pharmacometrie/game/\\?lang='+lang+'$'));
    await expect(page.locator('#academy-mode')).toBeVisible();
    await expect(page.locator('#game-lang-'+lang)).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('html')).toHaveAttribute('lang',lang);
    await expect(page.locator('main')).not.toContainText('Cette page est remplacée lors de la publication');
  }
  await page.goto(origin+'/pharmacometrie/?lang=en');
  await page.getByTestId('goal-learn').locator('summary').click();
  await page.getByTestId('nav-game').click();
  await expect(page).toHaveURL(/\/pharmacometrie\/game\/\?lang=en$/);
  await expect(page.locator('#academy-mode')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.goto(origin+'/pharmacometrie/chapitres/?lang=en');
  await page.getByTestId('game-learn-open').click();
  await expect(page.locator('#academy-mode')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
});

test('diagram interaction and responsive layout work without external requests',async ({page})=>{
  await page.setViewportSize({width:360,height:760});
  await page.goto(origin+'/pharmacometrie/game/');
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
  await page.goto(origin+'/pharmacometrie/game/');
  await expect(page.locator('#academy-mode')).toBeVisible();
  await expect(page.locator('#lab-mode')).toBeHidden();
  await expect(page.locator('#quest-count')).toHaveText('0/9');
  await expect(page.locator('#quest-list button[disabled]')).toHaveCount(8);
  await expect(page.locator('#body-figure')).toContainText('ABSORPTION');
  await expect(page.locator('#body-figure [data-stage]')).toHaveCount(4);
  await expect(page.locator('#academy-answers input:checked')).toHaveCount(0);
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
  await expect(page.locator('#academy-number')).toHaveAttribute('placeholder','Votre estimation');
  await expect(page.locator('#academy-chart')).not.toContainText('Tlag : 2 h');
  await page.locator('#academy-number').fill('1');
  await page.locator('#academy-verify').click();
  await expect(page.locator('#academy-feedback')).toContainText(/réessayez/i);
  await page.locator('#academy-number').fill('2');
  await page.locator('#academy-verify').click();
  await expect(page.locator('#academy-feedback')).toContainText('Tlag');
  await page.locator('#academy-next').click();
  await expect(page.locator('#academy-title')).toHaveText('Le secret de la pente');
  await page.locator('#academy-number').fill('0.25');
  await page.locator('#academy-verify').click();
  await expect(page.locator('#academy-feedback')).toContainText('2,77 h');
  for(const correct of [1,2,1,1]){
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
  await page.goto(origin+'/pharmacometrie/game/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.locator('#academy-chart')).toBeVisible();
  await expect(page.locator('#quest-list button')).toHaveCount(9);
  await expect(page.locator('script[data-portal-analytics]')).toHaveCount(0);
  await page.locator('#academy-time').evaluate(el=>{el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('#academy-clock')).toHaveText('5,0 h');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});


test('advanced curriculum requires drawing 2C, full ODE assembly and three dose optimizations', async ({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/pharmacometrie/game/');
  await page.locator('#mode-advanced').click();
  await expect(page.locator('#advanced-mode')).toBeVisible();
  await expect(page.locator('#academy-mode')).toBeHidden();
  await expect(page.locator('#advanced-count')).toHaveText('0/9');
  await expect(page.locator('#advanced-list button[disabled]')).toHaveCount(8);

  // Try a plausible but unnecessary compartment: it must be removable.
  await page.locator('[data-add-node="p2"]').click();
  await page.getByRole('button',{name:'Retirer 2e périphérique'}).click();
  for(const id of ['gut','central','peripheral','exit']){
    await page.locator('[data-add-node="'+id+'"]').click();
  }
  for(const [a,b] of [['gut','central'],['central','peripheral'],['peripheral','central'],['central','exit']]){
    await page.locator('[data-graph-node="'+a+'"]').click();
    await page.locator('[data-graph-node="'+b+'"]').click();
  }
  await expect(page.locator('#adv-graph-edges button')).toHaveCount(4);
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-count')).toHaveText('1/9');
  await expect(page.locator('#advanced-feedback')).toContainText('Défi validé');
  await page.locator('#advanced-next').click();

  for(const [state,token] of [
    ['gut','gut_out'],['central','gut_in'],['central','elimination'],
    ['central','tissue_out'],['peripheral','tissue_in'],['eliminated','elim_accum']
  ])await page.locator('[data-ode-state="'+state+'"][data-term="'+token+'"]').click();
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-count')).toHaveText('2/9');
  await expect(page.locator('#advanced-feedback')).toContainText('conservent la masse');
  await page.locator('#advanced-next').click();

  await expect(page.locator('#advanced-title')).toHaveText('Mission CMI');
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-feedback')).toContainText('Objectif du jeu non atteint');
  await page.locator('#adv-mic-dose').evaluate(el=>{
    el.value='200';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect(page.locator('#adv-mic-ft')).toContainText('76,6 %');
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-count')).toHaveText('3/9');
  await page.locator('#advanced-next').click();

  await page.locator('#adv-linear-dose').evaluate(el=>{
    el.value='300';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.locator('#adv-mm-dose').evaluate(el=>{
    el.value='230';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect(page.locator('#adv-linear-auc')).toContainText('60,0');
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-count')).toHaveText('4/9');
  await page.locator('#advanced-next').click();

  await expect(page.locator('#adv-ddi-auc-ratio')).toContainText('×2,00');
  await expect(page.locator('#adv-ddi-c0-ratio')).toHaveText('À interpréter');
  await expect(page.locator('#adv-ddi-c0-before')).not.toHaveText('');
  await expect(page.locator('#adv-ddi-c0-after')).not.toHaveText('');
  await page.locator('input[name="ddi-comparison"][value="auc"]').check();
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-feedback')).toContainText('variations relatives');
  await expect(page.locator('#advanced-count')).toHaveText('4/9');
  await page.locator('input[name="ddi-comparison"][value="trough"]').check();
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-count')).toHaveText('5/9');
  await expect(page.locator('#adv-ddi-c0-ratio')).toContainText('×3,93');

  await page.locator('#advanced-next').click();
  await expect(page.locator('#advanced-title')).toHaveText('Le premier jour du traitement');
  await page.locator('#adv-load-dose').evaluate(el=>{el.value='60';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#adv-maint-dose').evaluate(el=>{el.value='108';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('#adv-load-average')).toContainText('3,00 mg/L');
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-count')).toHaveText('6/9');

  await page.locator('#advanced-next').click();
  await expect(page.locator('#advanced-title')).toHaveText('Le temps d’atteindre un plateau');
  await page.locator('#adv-acc-doses').evaluate(el=>{el.value='6';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('#adv-acc-pct')).toContainText('93,3 %');
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-count')).toHaveText('7/9');

  await page.locator('#advanced-next').click();
  await expect(page.locator('#advanced-title')).toHaveText('Une même dose quotidienne');
  await page.locator('#adv-frac-tau').selectOption('6');
  await expect(page.locator('#adv-frac-ratio')).toContainText('×3,32');
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-count')).toHaveText('8/9');

  await page.locator('#advanced-next').click();
  await expect(page.locator('#advanced-title')).toHaveText('Deux patients, une seule AUC');
  await page.locator('#adv-amb-f-slider').evaluate(el=>{el.value='0.4';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#adv-amb-cl-slider').evaluate(el=>{el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('#adv-amb-b')).toContainText('20,0 mg·h/L');
  await page.locator('#advanced-check').click();
  await expect(page.locator('#advanced-count')).toHaveText('9/9');
  await expect(page.locator('#advanced-xp')).toHaveText('1050 XP');
  await page.reload();
  await page.locator('#mode-advanced').click();
  await expect(page.locator('#advanced-count')).toHaveText('9/9');
  await expect(page.locator('#advanced-title')).toHaveText('Deux patients, une seule AUC');
  expect(errors).toEqual([]);
});

test('advanced model editor and physiology remain readable on mobile without page overflow',async({page})=>{
  await page.setViewportSize({width:360,height:760});
  await page.goto(origin+'/pharmacometrie/game/');
  await expect(page.locator('#body-figure')).toHaveAttribute('viewBox','0 0 430 848');
  await expect(page.locator('.body-legend span')).toHaveCount(4);
  await page.locator('#mode-advanced').click();
  await expect(page.locator('#adv-graph-svg')).toBeVisible();
  await page.locator('[data-add-node="central"]').click();
  await expect(page.locator('[data-graph-node="central"]')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});


test('population pharmacometrician route runs from mapping through archived generalized-SAEM to justified report',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/pharmacometrie/game/');
  await page.locator('#mode-population').click();
  await expect(page.locator('#population-mode')).toBeVisible();
  await expect(page.locator('#academy-mode')).toBeHidden();
  await expect(page.locator('#population-progress')).toHaveText('0 / 7');
  await expect(page.locator('a[href="/pharmacometrie/downloads/warfarin/warfarin_data.csv"]')).toHaveCount(1);
  for(const [key,value] of Object.entries({id:'id',time:'time',dose:'amt',concentration:'dv',event:'dvid'})){
    await page.locator('[data-pk-map="'+key+'"]').selectOption(value);
  }
  await page.locator('#population-validate').click();
  await expect(page.locator('#population-progress')).toHaveText('1 / 7');
  await page.locator('#population-next').click();

  // Irregular measured sampling is plotted as discrete observations, not 32 misleading polylines.
  expect(await page.locator('#pop-spaghetti circle').count()).toBeGreaterThan(250);
  expect(await page.locator('#pop-spaghetti polyline').count()).toBeLessThanOrEqual(2);
  await expect(page.locator('#pop-overview-legend')).toContainText('IQR');

  await page.locator('#pop-log').click();
  await expect(page.locator('#pop-log')).toHaveAttribute('aria-pressed','true');
  await page.locator('#pop-subject').selectOption('3');
  await page.locator('input[name="pop-choice"][value="simple"]').check();
  await page.locator('#population-validate').click();
  await expect(page.locator('#population-progress')).toHaveText('2 / 7');
  await page.locator('#population-next').click();

  await expect(page.locator('#pop-bic')).toHaveCount(0);
  await expect(page.locator('#pop-trace')).toBeVisible();
  await expect(page.locator('#pop-fit-rows')).toContainText('À examiner');
  for(const kind of ['one','lag','two']){
    await page.locator('[data-pop-model="'+kind+'"]').click();
    await expect(page.locator('#pop-iteration-label')).toContainText('170');
  }
  await expect(page.locator('#pop-fit-rows')).toContainText('-224,01');
  await page.locator('#pop-iteration').evaluate(el=>{
    el.value='3';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect(page.locator('#pop-iteration-label')).toContainText('40');
  await page.locator('#population-validate').click();
  await expect(page.locator('#population-progress')).toHaveText('3 / 7');
  await page.locator('#population-next').click();

  await page.locator('#population-workspace details').evaluateAll(nodes=>nodes.forEach(el=>el.open=true));
  await expect(page.locator('#pop-vpc')).toBeVisible();
  await expect(page.locator('#pop-variability-metrics')).toContainText('IIV CL');
  await expect(page.locator('#pop-ruv-metrics')).toContainText('σlog');
  await expect(page.locator('#pop-iiv-density polyline')).toHaveCount(2);
  await expect(page.locator('#pop-ruv-shape polygon')).toHaveCount(1);
  await expect(page.locator('#pop-ruv-shape polyline')).toHaveCount(3);
  await expect(page.locator('.career-plot-grid')).toHaveCount(3);
  const scientificPlots=await page.evaluate(async()=>{
    const lib=await import('/pharmacometrie/game/population-course.js');
    const i=lib.iivPlotData([-.4,-.15,-.1,.04,.08,.19,.23],.3);
    const ru=lib.ruvPlotData(.1221);
    return {n:i.n,monotonic:ru.every((v,j)=>j===0||v.pred>=ru[j-1].pred),
      atTen:ru.find(p=>Math.abs(p.pred-10)<1e-8),
      gaussianIntegral:i.values.slice(1).reduce((a,p,j)=>a+
        (p.population+i.values[j].population)/2*(p.x-i.values[j].x),0)};
  });
  expect(scientificPlots.n).toBe(7);
  expect(scientificPlots.monotonic).toBe(true);
  expect(scientificPlots.atTen.lo).toBeCloseTo(10*Math.exp(-1.6448536269514722*.1221),7);
  expect(scientificPlots.atTen.hi).toBeCloseTo(10*Math.exp(1.6448536269514722*.1221),7);
  expect(scientificPlots.gaussianIntegral).toBeGreaterThan(.98);

  for(const id of ['pop-gof-pred','pop-gof-ipred','pop-resid-time','pop-resid-pred','pop-resid-hist','pop-resid-qq','pop-eta-weight','pop-eta-hist','pop-iiv-density','pop-ruv-shape'])await expect(page.locator('#'+id)).toBeVisible();
  await page.locator('#pop-diagnostic-model').selectOption('two');
  for(const [k,value] of Object.entries({gof:'trends',residual:'patterns',iiv:'careful',ruv:'form',vpc:'bands',stability:'uncertainty'}))
    await page.locator('input[name="pop-diagnostic-'+k+'"][value="'+value+'"]').check();
  await page.locator('#population-validate').click();
  await expect(page.locator('#population-progress')).toHaveText('4 / 7');
  await page.locator('#population-next').click();

  await expect(page.locator('#population-workspace')).toContainText('0,23');
  await page.locator('input[name="pop-choice"][value="lag-proved"]').check();
  await page.locator('#population-validate').click();
  await expect(page.locator('#population-feedback')).toContainText('petite différence');
  await page.locator('input[name="pop-choice"][value="equivocal"]').check();
  await page.locator('#population-validate').click();
  await expect(page.locator('#population-progress')).toHaveText('5 / 7');
  await page.locator('#population-next').click();

  await expect(page.locator('#pop-pd-chart')).toBeVisible();
  await page.locator('input[name="pop-choice"][value="delay"]').check();
  await page.locator('#population-validate').click();
  await page.locator('#population-next').click();

  await expect(page.locator('#pop-report')).toContainText('PHARMACOMETRIC ANALYSIS REPORT');
  await page.locator('input[name="pop-conclusion"][value="conditional"]').check();
  await page.locator('#population-validate').click();
  await expect(page.locator('#population-progress')).toHaveText('7 / 7');
  await page.reload();
  await page.locator('#mode-population').click();
  await expect(page.locator('#population-progress')).toHaveText('7 / 7');
  expect(errors).toEqual([]);
});

test('MPA heart-transplant path evaluates AUC, Bayesian sensitivity, free dose and CL change',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/pharmacometrie/game/');
  await page.locator('#mode-mipd').click();
  await expect(page.locator('#mipd-progress')).toHaveText('0 / 7');
  await expect(page.locator('a[href^="/pharmacometrie/cibles-tdm/?drug=mpa"]')).toBeVisible();
  await page.locator('input[name="mipd-choice"][value="auc"]').check();
  await page.locator('#mipd-validate').click();
  await page.locator('#mipd-next').click();

  await expect(page.locator('#mipd-workspace')).toContainText('0,5 h');
  await page.locator('input[name="mipd-sampling"][value="three"]').check();
  await page.locator('#mipd-validate').click();
  await page.locator('#mipd-next').click();

  await expect(page.locator('#mipd-post-chart')).toBeVisible();
  await expect(page.locator('#mipd-post-v')).toBeVisible();
  await expect(page.locator('.career-chart-key')).toContainText('Prior fixe');
  await page.locator('[data-mipd-post="1"]').click();
  await page.locator('[data-mipd-post="3"]').click();
  await expect(page.locator('#mipd-post-metrics')).toContainText('CL/F');
  await page.locator('input[name="mipd-choice"][value="likelihood"]').check();
  await page.locator('#mipd-validate').click();
  await expect(page.locator('#mipd-progress')).toHaveText('3 / 7');
  await page.locator('#mipd-next').click();

  await expect(page.locator('#mipd-sensitive-cl polyline')).toHaveCount(3);
  await expect(page.locator('#mipd-sensitive-v polyline')).toHaveCount(3);
  for(const [id,value] of [['mipd-iiv','1.75'],['mipd-ruv','25'],['mipd-prior-weight','0.2']]){
    await page.locator('#'+id).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  }
  await expect(page.locator('#mipd-ruv-value')).toHaveText('25 %');
  await expect(page.locator('#mipd-sensitive-cl polyline')).toHaveCount(3);
  await expect(page.locator('#mipd-sensitivity-metrics')).toContainText('MAP CL/F');
  await page.locator('input[name="mipd-sensitivity-answer"][value="balance"]').check();
  await page.locator('#mipd-validate').click();
  await expect(page.locator('#mipd-progress')).toHaveText('4 / 7');
  await page.locator('#mipd-next').click();

  await expect(page.locator('#mipd-dose-chart')).toBeVisible();
  await expect(page.locator('#mipd-dose-input')).toHaveValue('1000');
  await expect(page.locator('#mipd-workspace')).not.toContainText('toxic trough');
  await page.locator('#mipd-dose-input').fill('1250');
  await expect(page.locator('#mipd-dose-metrics')).toContainText('AUC');
  await expect(page.locator('#mipd-dose-auc svg')).toBeVisible();
  await expect(page.locator('.career-auc-caption')).toContainText('P5–P95');
  await page.locator('#mipd-validate').click();
  await expect(page.locator('#mipd-progress')).toHaveText('5 / 7');
  await page.locator('#mipd-next').click();

  await expect(page.locator('#mipd-shift-chart')).toBeVisible();
  await page.locator('#mipd-shift-dose-input').fill('750');
  await page.locator('input[name="mipd-shift-shape"][value="shape"]').check();
  await page.locator('#mipd-validate').click();
  await expect(page.locator('#mipd-progress')).toHaveText('6 / 7');
  await page.locator('#mipd-next').click();

  await expect(page.locator('#mipd-report')).toContainText('GREFFE CARDIAQUE');
  await expect(page.locator('#mipd-report')).toContainText('AUC0');
  await page.locator('input[name="mipd-report-interpretation"][value="conditional"]').check();
  await page.locator('#mipd-validate').click();
  await expect(page.locator('#mipd-progress')).toHaveText('7 / 7');
  await page.reload();
  await page.locator('#mode-mipd').click();
  await expect(page.locator('#mipd-progress')).toHaveText('7 / 7');
  expect(errors).toEqual([]);
});

test('valid MAP reasoning does not depend on clicking every optional view or slider',async({page})=>{
  await page.goto(origin+'/pharmacometrie/game/');
  await page.evaluate(()=>localStorage.setItem('pmx-game-mipd-mpa-v3','[0,1]'));
  await page.reload();await page.locator('#mode-mipd').click();
  await expect(page.locator('#mipd-post-chart')).toBeVisible();
  await page.locator('input[name="mipd-choice"][value="likelihood"]').check();
  await page.locator('#mipd-validate').click();
  await expect(page.locator('#mipd-progress')).toHaveText('3 / 7');
  await page.locator('#mipd-next').click();
  await expect(page.locator('#mipd-sensitive-cl polyline')).toHaveCount(3);
  await page.locator('input[name="mipd-sensitivity-answer"][value="balance"]').check();
  await page.locator('#mipd-validate').click();
  await expect(page.locator('#mipd-progress')).toHaveText('4 / 7');
  await page.locator('#mipd-next').click();
  await expect(page.locator('#mipd-dose-auc svg')).toBeVisible();
  // The default dose already meets the sourced lower AUC reference: don't mark a correct answer false.
  await page.locator('#mipd-validate').click();
  await expect(page.locator('#mipd-progress')).toHaveText('5 / 7');
});

test('both clinical-workflow teaching routes fit narrow screens without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:360,height:760});
  await page.goto(origin+'/pharmacometrie/game/');
  for(const [tab,mode] of [['#mode-population','#population-mode'],['#mode-mipd','#mipd-mode']]){
    await page.locator(tab).click();
    await expect(page.locator(mode)).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});


test('IIV and RUV diagnoses are translated to English and show physically coherent plots',async({page})=>{
  await page.goto(origin+'/pharmacometrie/game/?lang=en');
  await page.evaluate(()=>localStorage.setItem('pmx-game-population-v4','[0,1,2]'));
  await page.reload();await page.locator('#mode-population').click();
  await page.locator('#population-steps button').nth(3).click();
  await page.locator('#population-workspace details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
  await expect(page.locator('#pop-ruv-shape polygon')).toHaveCount(1);
  await expect(page.locator('#pop-iiv-density polyline')).toHaveCount(2);
  await expect(page.locator('.career-density-legend')).toContainText('Smoothed EBE density');
  await expect(page.locator('#population-workspace')).toContainText('No additive or combined error model was fitted.');
  await expect(page.locator('#population-workspace')).toContainText('normalized densities');
  await expect(page.locator('#pop-ruv-shape')).toContainText('Predicted observation');
  await expect(page.locator('#population-workspace')).not.toContainText('Médiane prédite');
  await expect(page.locator('#population-workspace')).not.toContainText('Comparaison de la distribution');
});
test('game is bilingual at canonical address and legacy address redirects',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/game/?lang=en');
  await expect(page).toHaveURL(/\/pharmacometrie\/game\/\?lang=en/);
  await expect(page.locator('#mode-population')).toBeVisible();
  await expect(page.locator('#game-lang-en')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('.hero h1')).toContainText('Learn pharmacokinetics');
  await page.locator('#mode-population').click();
  await expect(page.locator('#population-title')).toContainText('Data and columns');
  await page.goto(origin+'/pharmacometrie/game/?lang=en');
  await expect(page.locator('#mode-mipd')).toContainText('Precision dosing');
  await page.locator('#mode-mipd').click();
  await expect(page.locator('#mipd-title')).toContainText('The transplant case');
  await page.evaluate(()=>localStorage.setItem('pmx-game-mipd-mpa-v3','[0,1,2,3,4,5]'));
  await page.reload();
  await page.locator('#mode-mipd').click();
  await page.locator('#mipd-steps button').nth(5).click();
  await expect(page.locator('#mipd-title')).toContainText('What if clearance changes?');
  await page.evaluate(()=>localStorage.setItem('pmx-game-mipd-mpa-v3','[0,1,2,3,4,5,6]'));
  await page.reload();
  await page.locator('#mode-mipd').click();
  await expect(page.locator('#mipd-report')).toContainText('HEART TRANSPLANT');
  await expect(page.locator('#mipd-report')).not.toContainText('Greffe cardiaque');
  await page.evaluate(()=>localStorage.setItem('pmx-game-population-v4','[0,1,2,3,4,5,6]'));
  await page.reload();
  await page.locator('#mode-population').click();
  await expect(page.locator('#pop-report')).toContainText('STUDY POPULATION');
  await expect(page.locator('#pop-report')).not.toContainText('ÉTUDE EXPÉRIMENTALE');
  await page.locator('#game-lang-fr').click();
  await expect(page.locator('html')).toHaveAttribute('lang','fr');
  await expect(page.locator('.hero h1')).toContainText('Apprenez la pharmacocinétique');
  expect(errors).toEqual([]);
});


test('free exploration preserves honest progress across all four tracks',async({page})=>{
  await page.goto(origin+'/pharmacometrie/game/?lang=en');
  await expect(page.locator('#game-free-mode')).not.toBeChecked();
  await expect(page.locator('#quest-list button').last()).toBeDisabled();
  await page.locator('#game-free-mode').check();
  await expect(page.locator('.learning-mode-controls')).toContainText('Free exploration');
  await page.locator('#quest-list button').last().click();
  await expect(page.locator('#quest-count')).toHaveText('0/9');
  await expect(page.locator('#quest-xp')).toHaveText('0 XP');
  await page.locator('#mode-advanced').click();
  await page.locator('#advanced-list button').last().click();
  await expect(page.locator('#advanced-count')).toHaveText('0/9');
  await page.locator('#mode-population').click();
  await page.locator('#population-steps button').last().click();
  await expect(page.locator('#population-progress')).toHaveText('0 / 7');
  await page.locator('#mode-mipd').click();
  await page.locator('#mipd-steps button').last().click();
  await expect(page.locator('#mipd-progress')).toHaveText('0 / 7');
  await page.locator('#game-free-mode').uncheck();
  await expect(page.locator('#mipd-steps button').last()).toBeDisabled();
  await expect(page.locator('#mipd-progress')).toHaveText('0 / 7');
});

test('out-of-order completed steps persist without falsely marking earlier steps',async({page})=>{
  await page.goto(origin+'/pharmacometrie/game/?lang=en');
  await page.evaluate(()=>localStorage.setItem('pmx-game-population-v4','[6]'));
  await page.reload();
  await page.locator('#mode-population').click();
  await expect(page.locator('#population-progress')).toHaveText('1 / 7');
  await expect(page.locator('#population-steps button').first()).toHaveAttribute('aria-current','step');
  await expect(page.locator('#population-steps button').nth(1)).toBeDisabled();
  await expect(page.locator('#population-steps button').last()).toBeEnabled();
});


test('archived warfarin evidence remains separate from simulated diagnostics and links to executed notebook',async({page})=>{
  await page.goto(origin+'/pharmacometrie/game/?lang=en');
  await page.locator('#game-free-mode').check();
  await page.locator('#mode-population').click();
  await page.locator('#population-steps button').nth(3).click();
  await expect(page.locator('#pop-real-diagnostics')).toContainText('Archived diagnostics on real observations');
  await page.locator('#pop-real-diagnostics summary').click();
  await expect(page.locator('#pop-real-diagnostics img')).toHaveCount(3);
  for(const img of await page.locator('#pop-real-diagnostics img').all()){
    await img.scrollIntoViewIfNeeded();
    await expect.poll(()=>img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  }
  await page.locator('#population-steps button').nth(4).click();
  await expect(page.locator('#pop-real-comparison')).toContainText('783.80');
  await expect(page.locator('#pop-real-comparison')).toContainText('817.10');
  await expect(page.locator('#pop-real-comparison a')).toHaveAttribute('href','/pharmacometrie/downloads/warfarin/warfarin_pkpd_nlmixr2_EN.ipynb');
  await page.locator('#mode-mipd').click();
  await page.locator('#mipd-steps button').nth(1).click();
  await expect(page.locator('#mipd-sampling-evidence')).toContainText('linear regression');
  await expect(page.locator('#mipd-sampling-evidence')).toContainText('not yet implemented');
});
