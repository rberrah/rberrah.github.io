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
  await expect(page.locator('#academy-feedback')).toHaveClass(/\berror\b/);
  await expect(page.locator('#academy-feedback')).toContainText('Le premier échantillon non nul apparaît');
  await expect(page.locator('#quest-count')).toHaveText('3/9');
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
  await expect(page.locator('#pop-fit-rows')).toContainText('Disponible');
  await expect(page.locator('#pop-fit-rows')).toContainText('-224,01');
  for(const kind of ['one','lag','two']){
    await page.locator('[data-pop-model="'+kind+'"]').click();
    await expect(page.locator('#pop-iteration-label')).toContainText('170');
  }
  await expect(page.locator('#pop-fit-rows')).toContainText('-224,01');
  await page.locator('#pop-iteration').evaluate(el=>{
    el.value='3';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect(page.locator('#pop-iteration-label')).toContainText('40');
  await page.locator('input[name="pop-saem-interpretation"][value="plateau"]').check();
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

  await expect(page.locator('#pop-report')).toContainText('RAPPORT D’ANALYSE PHARMACOMÉTRIQUE');
  await expect(page.locator('#pop-report')).not.toContainText('STUDY POPULATION');
  await expect(page.locator('#pop-report')).toContainText('817,10');
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
  await expect(page.locator('#pop-report')).toContainText('817.10');
  await expect(page.locator('#pop-report')).not.toContainText('ÉTUDE EXPÉRIMENTALE');
  await page.locator('#game-lang-fr').click();
  await expect(page.locator('html')).toHaveAttribute('lang','fr');
  await expect(page.locator('.hero h1')).toContainText('Apprenez la pharmacocinétique');
  expect(errors).toEqual([]);
});


test('free exploration preserves honest progress across all five tracks',async({page})=>{
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
  await page.locator('#mode-pmetrics').click();
  await page.locator('#pmetrics-steps button').last().click();
  await expect(page.locator('#pmetrics-progress')).toHaveText('0 / 5');
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

test('Woillard double gamma illustration is bilingual and not presented as a calibrated model',async({page})=>{
 await page.goto(origin+'/pharmacometrie/game/?lang=en');
 await page.locator('#game-free-mode').check();
 await page.locator('#mode-mipd').click();
 await page.locator('#mipd-steps button').nth(1).click();
 const panel=page.locator('#mipd-woillard-structure');
 await expect(panel).toContainText('Published means: ITS and Pmetrics');
 await expect(panel).toContainText('The historical MAP-BE has not yet been reproduced');
 await expect(panel.locator('#mipd-gamma-input polyline')).toHaveCount(3);
 await expect(panel.locator('#mipd-gamma-table')).toContainText('13.51');
 await expect(panel.locator('#mipd-gamma-auc')).toContainText('35.22 mg·h/L');
 await expect(panel).toContainText('20 min, 1 h, 3 h and 6 h');
 await expect(panel.locator('#mipd-gamma-curve circle')).toHaveCount(4);
 const old=await panel.locator('#mipd-gamma-curve polyline').getAttribute('points');
 await page.locator('#mipd-gamma-fraction').fill('0.2');
 await expect(page.locator('#mipd-gamma-fraction-value')).toHaveText('20 %');
 await expect(panel.locator('#mipd-gamma-curve polyline')).not.toHaveAttribute('points',old);
 await page.locator('#mipd-gamma-reset').click();
 await expect(panel.locator('#mipd-gamma-auc')).toContainText('35.22 mg·h/L');
 await page.locator('#mipd-gamma-source').selectOption('Pmetrics');
 await expect(panel.locator('#mipd-gamma-auc')).toContainText('36.87 mg·h/L');
 await page.locator('#game-lang-fr').click();
 await expect(panel).toContainText('Moyennes publiées : ITS et Pmetrics');
});

test('Pmetrics fifth-track navigation, fixed-grid fit, and Bayesian update are bilingual',async({page})=>{
 await page.goto(origin+'/pharmacometrie/game/?lang=en');
 await page.locator('#mode-pmetrics').click();
 await expect(page.locator('#pmetrics-mode')).toBeVisible();
 await expect(page.locator('#mipd-mode')).toBeHidden();
 await expect(page.locator('#mode-mipd')).toContainText('Path 5');
 await expect(page.locator('#pmetrics-title')).toHaveText('Understand double-gamma absorption');
 await expect(page.locator('#np-input polyline')).toHaveCount(3);
 await page.locator('#game-free-mode').check();
 await page.locator('#pmetrics-steps button').nth(2).click();
 const before=await page.locator('#np-fit-status').textContent();
 await page.locator('#np-fit').click();
 await expect(page.locator('#np-fit-status')).toContainText('Iteration 20');
 await expect(page.locator('#np-fit-status')).not.toHaveText(before);
 await expect(page.locator('#np-fit-trace circle')).toHaveCount(21);
 await expect(page.locator('#pmetrics-progress')).toHaveText('0 / 5');
 await page.locator('#pmetrics-steps button').nth(3).click();
 await page.locator('#np-clear').click();
 await expect(page.locator('#np-patient circle')).toHaveCount(0);
 await page.locator('#np-standard').click();
 await expect(page.locator('#np-patient circle')).toHaveCount(4);
 await page.locator('#game-lang-fr').click();
 await expect(page.locator('#pmetrics-title')).toHaveText('Actualiser les probabilités du patient');
 await page.locator('#pmetrics-steps button').last().click();
 await page.locator('#np-go-mipd').click();
 await expect(page.locator('#mipd-mode')).toBeVisible();
});

test('course deep link opens Pmetrics directly and gamma controls can be reset',async({page})=>{
 await page.goto(origin+'/pharmacometrie/game/?lang=en&path=pmetrics');
 await expect(page.locator('#pmetrics-mode')).toBeVisible();
 await expect(page.locator('#pmetrics-title')).toHaveText('Understand double-gamma absorption');
 await page.locator('#np-gamma-reset').click();
 await expect(page.locator('#np-speed-value')).toHaveText('× 1.00');
 await page.locator('#np-gamma-example').click();
 await expect(page.locator('#np-speed-value')).toHaveText('× 0.50');
 await page.locator('#game-lang-fr').click();
 await expect(page.locator('#np-gamma-reset')).toHaveText('Moyennes publiées');
 await expect(page.locator('#np-speed-value')).toHaveText('× 0,50');
});

test('chapter Pmetrics game link bypasses the placeholder route',async({page})=>{
 await page.goto(origin+'/pharmacometrie/chapitres/absorption-orale/?lang=en');
 const gameLink=page.locator('a[href="/pharmacometrie/game/?lang=en&path=pmetrics"]').first();
 await expect(gameLink).toHaveAttribute('data-sveltekit-reload','');
 await gameLink.click();
 await expect(page.locator('#pmetrics-mode')).toBeVisible();
 await expect(page.locator('#pmetrics-title')).toHaveText('Understand double-gamma absorption');
});

for(const lang of ['fr','en']){
 test('Student: complete all five Pmetrics missions with specific feedback ('+lang+')',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/pharmacometrie/game/?lang='+lang+'&path=pmetrics');
  await expect(page.locator('#pmetrics-progress')).toHaveText('0 / 5');
  await expect(page.locator('#pmetrics-steps button').last()).toBeDisabled();
  for(const [i,answer] of [1,0,1,1,1].entries()){
   await expect(page.locator('#pmetrics-level')).toContainText((i+1)+' / 5');
   await page.locator('input[name="np-answer"][value="'+((answer+1)%3)+'"]').check();
   await page.locator('#pmetrics-validate').click();
   await expect(page.locator('#pmetrics-feedback')).toHaveClass(/error/);
   await expect(page.locator('#pmetrics-progress')).toHaveText(i+' / 5');
   await page.locator('input[name="np-answer"][value="'+answer+'"]').check();
   await page.locator('#pmetrics-validate').click();
   await expect(page.locator('#pmetrics-feedback')).not.toHaveClass(/error/);
   await expect(page.locator('#pmetrics-progress')).toHaveText((i+1)+' / 5');
   if(i<4)await page.locator('#pmetrics-next').click();
  }
  await page.reload();
  await expect(page.locator('#pmetrics-progress')).toHaveText('5 / 5');
  expect(errors).toEqual([]);
 });
 test('Teacher: free review of all five pathways on a narrow screen ('+lang+')',async({page})=>{
  test.setTimeout(90000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin+'/pharmacometrie/game/?lang='+lang);
  await page.locator('#game-free-mode').check();
  for(const [tab,section,list,count,progress] of [
    ['campaign','academy','quest-list',9,'quest-count'],
    ['advanced','advanced','advanced-list',9,'advanced-count'],
    ['population','population','population-steps',7,'population-progress'],
    ['pmetrics','pmetrics','pmetrics-steps',5,'pmetrics-progress'],
    ['mipd','mipd','mipd-steps',7,'mipd-progress']
  ]){
    await page.locator('#mode-'+tab).click();
    await expect(page.locator('#'+section+'-mode')).toBeVisible();
    for(let i=0;i<count;i++){
      await page.locator('#'+list+' button').nth(i).click();
      await expect(page.locator('#'+list+' button').nth(i)).toHaveAttribute('aria-current','step');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    }
    await expect(page.locator('#'+progress)).toHaveText(tab==='campaign'||tab==='advanced'?'0/'+count:'0 / '+count);
  }
  expect(errors).toEqual([]);
 });
}
test('SAEM interpretation is sufficient without clicking every model',async({page})=>{
 await page.goto(origin+'/pharmacometrie/game/?lang=fr');
 await page.evaluate(()=>localStorage.setItem('pmx-game-population-v4','[0,1]'));
 await page.reload();
 await page.locator('#mode-population').click();
 await expect(page.locator('#pop-fit-rows')).toContainText('-224,01');
 await page.locator('input[name="pop-saem-interpretation"][value="plateau"]').check();
 await page.locator('#population-validate').click();
 await expect(page.locator('#population-progress')).toHaveText('3 / 7');
});
test('MIPD invalid displayed doses cannot pass or crash the numerical engine',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/pharmacometrie/game/?lang=en');
 await page.locator('#game-free-mode').check();
 await page.locator('#mode-mipd').click();
 await page.locator('#mipd-steps button').nth(4).click();
 await page.locator('#mipd-dose-input').fill('1250');
 await page.locator('#mipd-dose-input').fill('2000');
 await page.locator('#mipd-validate').click();
 await expect(page.locator('#mipd-feedback')).toContainText('valid dose');
 await expect(page.locator('#mipd-progress')).toHaveText('0 / 7');
 await page.locator('#mipd-steps button').nth(5).click();
 await page.locator('#mipd-shift-dose-input').fill('2000');
 await page.locator('input[name="mipd-shift-shape"][value="shape"]').check();
 await page.locator('#mipd-validate').click();
 await expect(page.locator('#mipd-feedback')).toContainText('valid dose');
 await expect(page.locator('#mipd-progress')).toHaveText('0 / 7');
 expect(errors).toEqual([]);
});

test('language consistency of five pathways, accessibility labels and local-only storage notice',async({page})=>{
 await page.goto(origin+'/pharmacometrie/game/?lang=en');
 await expect(page.locator('#academy-mode')).toHaveAttribute('aria-label','PMx Game learning pathway');
 await expect(page.locator('#mode-pmetrics')).toHaveText('Path 4 · Pmetrics');
 await expect(page.locator('#mode-mipd')).toContainText('Path 5');
 await expect(page.locator('.footer')).toContainText('saved locally in this browser');
 await page.locator('#game-lang-fr').click();
 await expect(page.locator('#academy-mode')).toHaveAttribute('aria-label','Parcours pédagogique PMx Game');
 await expect(page.locator('#mode-pmetrics')).toHaveText('Parcours 4 · Pmetrics');
 await expect(page.locator('.footer')).toContainText('conservées localement');
});

test('Pmetrics arbitrary sampling and reproducible RUV overfit compare exactly three curves',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/pharmacometrie/game/?lang=en&path=pmetrics');
 await page.locator('#game-free-mode').check();
 await page.locator('#pmetrics-steps button').nth(3).click();
 await expect(page.locator('#np-patient polyline')).toHaveCount(3);
 await expect(page.locator('#np-patient polyline[stroke-dasharray]')).toHaveCount(1);
 await page.locator('#np-time').fill('2.25');await page.locator('#np-add').click();
 await expect(page.locator('#np-patient circle')).toHaveCount(1);
 await page.locator('#np-add').click();await expect(page.locator('#np-patient circle')).toHaveCount(1);
 await page.locator('[data-np-remove="0"]').click();await expect(page.locator('#np-patient circle')).toHaveCount(0);
 await page.locator('#np-overfit').click();
 const reference=await page.locator('#np-patient polyline').nth(1).getAttribute('points');
 const measure=await page.locator('#np-sampling-table tbody').textContent();
 await page.locator('#np-ruv-low').click();
 await expect(page.locator('#np-overfit-feedback')).toContainText('Overfitting observed');
 await expect(page.locator('#np-patient polyline').nth(1)).not.toHaveAttribute('points',reference);
 expect(await page.locator('#np-sampling-table tbody').textContent()).toBe(measure);
 await page.locator('#game-lang-fr').click();
 await expect(page.locator('#np-overfit-feedback')).toContainText('Surajustement observé');
 expect(errors).toEqual([]);
});

test('same-AUC exercise connects manual parameter exploration to MAP-BE in both languages',async({page})=>{
 await page.goto(origin+'/pharmacometrie/game/?lang=fr');
 await page.locator('#game-free-mode').check();
 await page.locator('#mode-advanced').click();
 await page.locator('#advanced-list button').last().click();
 await expect(page.locator('#adv-amb-map')).toContainText('plausibilité a priori');
 await page.locator('#game-lang-en').click();
 await expect(page.locator('#adv-amb-map')).toContainText('prior plausibility');
 await expect(page.locator('#adv-amb-map')).toContainText('without making F and CL separately identifiable');
});

for(const lang of ['fr','en']){
 test('Draw model: simulated DV and reversible graph edits ('+lang+')',async({page})=>{
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(origin+'/pharmacometrie/game/?lang='+lang);await page.locator('#mode-advanced').click();
  const en=lang==='en';
  await expect(page.locator('#adv-graph-connect')).toHaveText(en?'Connect':'Relier');
  await expect(page.locator('#adv-graph-delete')).toHaveText(en?'Delete':'Supprimer');
  await expect(page.locator('#adv-graph-dv')).toHaveAttribute('aria-label',en?'Simulated plasma concentrations over time':'Concentrations plasmatiques simulées en fonction du temps');
  await expect(page.locator('#adv-graph-dv circle')).toHaveCount(14);
  await expect(page.locator('#adv-graph-dv polyline')).toHaveCount(0);
  await page.locator('#adv-graph-log').click();await expect(page.locator('#adv-graph-dv circle')).toHaveCount(13);
  for(const id of ['gut','central','peripheral'])await page.locator('[data-add-node="'+id+'"]').click();
  await expect(page.locator('[data-graph-node="gut"]')).toHaveAttribute('aria-label',en?'Oral depot':'Dépôt oral');
  const link=async(a,b)=>{await page.locator('[data-graph-node="'+a+'"]').click();await page.locator('[data-graph-node="'+b+'"]').click();};
  await link('gut','central');await link('central','peripheral');await link('peripheral','central');
  await expect(page.locator('#adv-graph-status')).toContainText(en?'3 connection(s)':'3 transfert(s)');
  await page.locator('#adv-graph-delete').click();
  await expect(page.locator('#adv-graph-help')).toContainText(en?'Delete mode':'Mode Supprimer');
  const edge=page.locator('[data-graph-edge="central>peripheral"]');
  await expect(edge).toHaveAttribute('aria-label',en?'Central → Peripheral':'Central → Périphérique');
  await edge.focus();await page.keyboard.press('Enter');
  await expect(edge).toHaveCount(0);await expect(page.locator('[data-graph-edge="peripheral>central"]')).toHaveCount(1);
  await page.locator('[data-graph-node="peripheral"]').click();await expect(page.locator('[data-graph-node="peripheral"]')).toHaveCount(0);await expect(page.locator('[data-graph-edge="peripheral>central"]')).toHaveCount(0);await expect(page.locator('[data-graph-edge="gut>central"]')).toHaveCount(1);
  await page.locator('#game-lang-'+(en?'fr':'en')).click();
  await expect(page.locator('#adv-graph-delete')).toHaveText(en?'Supprimer':'Delete');
  await expect(page.locator('[data-graph-node="gut"]')).toHaveAttribute('aria-label',en?'Dépôt oral':'Oral depot');
  await expect(page.locator('#adv-graph-dv circle')).toHaveCount(13);
  await expect(page.locator('[data-graph-edge="gut>central"]')).toHaveCount(1);
  expect(errors).toEqual([]);
 });
}


// Audit every learner-facing screen, not just navigation or a single translated label.
// Raw strings are retained in the failure log to make each residual actionable.
const bilingualPaths=[
 ['campaign','academy','quest-list',9,'academy-hint'],
 ['advanced','advanced','advanced-list',9,'advanced-hint'],
 ['population','population','population-steps',7,'population-hint'],
 ['pmetrics','pmetrics','pmetrics-steps',5,'pmetrics-hint'],
 ['mipd','mipd','mipd-steps',7,'mipd-hint']
];
async function collectGameLanguage(page, section){
 return page.evaluate(async section=>{
  // Reveal user-accessible collapsibles, not hidden future feedback or other paths.
  const root=document.getElementById(section+'-mode');
  for(const d of root.querySelectorAll('details'))if(!d.closest('[hidden]'))d.open=true;
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const rows=[];
  function active(el){
   if(!el||el.closest('[hidden],script,style,noscript,code,pre,textarea'))return false;
   for(let x=el;x;x=x.parentElement){
    const st=getComputedStyle(x);
    if(st.display==='none'||st.visibility==='hidden')return false;
   }
   return true;
  }
  function add(el,kind,value){
   if(!active(el)||!value)return;
   const s=value.replace(/\s+/g,' ').trim();
   if(s&&/[a-zA-ZÀ-ÿ]/.test(s))rows.push({element:el.id||el.closest('[id]')?.id||el.tagName,kind,text:s});
  }
  for(const scope of [document.querySelector('header'),document.querySelector('.hero'),document.querySelector('.game-mode'),document.querySelector('.learning-mode-controls'),document.querySelector('.footer'),root]){
   if(!scope)continue;
   const walk=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
   add(scope,'aria-label',scope.getAttribute('aria-label'));
   while(walk.nextNode()){
    const n=walk.currentNode;
    if(n.nodeType===Node.TEXT_NODE)add(n.parentElement,'text',n.nodeValue);
    else for(const attr of ['aria-label','title','placeholder','alt','data-tooltip'])add(n,attr,n.getAttribute(attr));
   }
  }
  rows.push({element:'head',kind:'title',text:document.title});
  const meta=document.querySelector('meta[name="description"]');
  if(meta)rows.push({element:'head',kind:'description',text:meta.content});
  return rows;
 },section);
}
// Clear language markers rather than shared scientific terms (AUC, dose, model symbols,
// Pmetrics, Monolix, shrinkage, prior/posterior, dataset names and bibliographic labels).
function languageLeaks(rows,lang){
 const frStrong=/(?:\b(?:choisissez|vérifiez|vérifier|clairance|prélèvement|prélèvements|données|courbe|courbes|équation|équations|modèle|modèles|élimination|variabilité|ajustement|ajustements|paramètres|résidus|poids|temps|réinitialiser|défi|défis|étape|étapes|parcours|mesurées|observées|sélectionnez|recommencer)\b)/iu;
 const frGrammar=/(?<![\p{L}])(?:les|des|une|dans|avec|pour|sont|vous|votre|cette|aux|ces|sans|chez|puis|quelle|quel|deux|trois|avant|après)(?![\p{L}])/giu;
 const enStrong=/(?<![\p{L}])(?:choose|select|check|reset|restart|clearance|observed|predicted|predictions|sampling|samples|weight|weights|steady-state|steady state|half-life|dosing interval|population overview|individual fits|show|hide|unbound|simulated|fictional|pathway|workshop|learning|completed|locked|incorrect|try again)(?![\p{L}])/iu;
 const enGrammar=/(?<![\p{L}])(?:the|this|these|those|with|without|from|your|you|which|when|after|before|between|does|should|would|their|each|both)(?![\p{L}])/giu;
 return rows.filter(({text:s})=>{
  // Bibliographic titles/URLs, source identifiers, and explicitly bilingual language switch.
  if(/^https?:\/\//i.test(s)||/^(?:FR|EN|Language \/ Langue)$/.test(s))return false;
  if(/^(?:Source|Reference|Référence)?\s*:?\s*(?:O[’']Reilly|Woillard|Kaczmarek)\s+et al\./i.test(s)&&s.length<95)return false;
  return lang==='en'?(frStrong.test(s)||(s.match(frGrammar)||[]).length>=2):(enStrong.test(s)||(s.match(enGrammar)||[]).length>=2);
 });
}

for(const initial of ['fr','en']){
 test('P0 exhaustive bilingual screen audit: all 37 missions and free workshop ('+initial+')',async({page},testInfo)=>{
  test.setTimeout(180000);
  const errors=[],findings=[],coverage=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin+'/pharmacometrie/game/?lang='+initial);
  await expect(page.locator('html')).toHaveAttribute('lang',initial);
  await page.locator('#game-free-mode').check();
  const other=initial==='fr'?'en':'fr';
  async function audit(section,label,lang){
   const rows=await collectGameLanguage(page,section);
   expect(rows.length,label+' '+lang+' has rendered text').toBeGreaterThan(10);
   coverage.push({screen:label,language:lang,strings:rows.length});
   for(const finding of languageLeaks(rows,lang))findings.push({screen:label,language:lang,...finding});
  }
  async function setLang(lang){
   await page.locator('#game-lang-'+lang).click();
   await expect(page.locator('html')).toHaveAttribute('lang',lang);
  }
  for(const [tab,section,list,count,hint] of bilingualPaths){
   await page.locator('#mode-'+tab).click();
   for(let i=0;i<count;i++){
    const btn=page.locator('#'+list+' button').nth(i);
    await btn.click();await expect(btn).toHaveAttribute('aria-current','step');
    if(section==='academy'&&i===0){
     // Cover the three introductory tutorial panels as well as the question.
     for(let step=0;step<3;step++){
      if(!await page.locator('#tutorial-next').isVisible())break;
      await audit(section,tab+' tutorial '+(step+1),initial);
      await setLang(other);await audit(section,tab+' tutorial '+(step+1),other);
      await setLang(initial);await page.locator('#tutorial-next').click();
     }
    }
    if(await page.locator('#'+hint).isVisible())await page.locator('#'+hint).click();
    await audit(section,tab+' mission '+(i+1),initial);
    await setLang(other);
    await expect(btn).toHaveAttribute('aria-current','step');
    if(await page.locator('#'+hint).isVisible())await page.locator('#'+hint).click();
    await audit(section,tab+' mission '+(i+1),other);
    await setLang(initial);
    await expect(btn).toHaveAttribute('aria-current','step');
   }
  }
  await page.locator('#mode-lab').click();
  await page.locator('[data-model="3"]').click();
  await page.locator('#challenge').click();
  await audit('lab','free workshop 3C challenge',initial);
  await setLang(other);await audit('lab','free workshop 3C challenge',other);
  await setLang(initial);
  const unique=[...new Map(findings.map(f=>[JSON.stringify(f),f])).values()];
  await testInfo.attach('bilingual-coverage.json',{body:JSON.stringify(coverage,null,2),contentType:'application/json'});
  await testInfo.attach('bilingual-findings.json',{body:JSON.stringify(unique,null,2),contentType:'application/json'});
  for(const finding of unique)console.log('PMX_LOCALE_LEAK '+JSON.stringify(finding));
  expect(errors).toEqual([]);
  expect(unique,'Untranslated learner-facing strings; see PMX_LOCALE_LEAK in the workflow log').toEqual([]);
 });
}

test('game back link preserves current language', async ({page}) => {
  for(const lang of ['fr','en']){
    await page.goto(origin+'/pharmacometrie/game/?lang='+lang);
    const back=page.locator('#game-back-to-explain');
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute('href','/pharmacometrie/?lang='+lang);
    const other=lang==='fr'?'en':'fr';
    await page.locator('#game-lang-'+other).click();
    await expect(back).toHaveAttribute('href','/pharmacometrie/?lang='+other);
    await back.click();
    await expect(page).toHaveURL(origin+'/pharmacometrie/?lang='+other);
  }
});
