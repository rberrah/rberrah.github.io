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

  await expect(page.locator('#pop-spaghetti polyline')).toHaveCount(32);
  await page.locator('#pop-log').click();
  await expect(page.locator('#pop-log')).toHaveAttribute('aria-pressed','true');
  await page.locator('#pop-subject').selectOption('3');
  await page.locator('input[name="pop-choice"][value="simple"]').check();
  await page.locator('#population-validate').click();
  await expect(page.locator('#population-progress')).toHaveText('2 / 7');
  await page.locator('#population-next').click();

  await expect(page.locator('#pop-bic')).toBeVisible();
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

  await page.locator('#mipd-iiv').selectOption('1.75');
  await page.locator('#mipd-ruv').selectOption('0.01');
  await page.locator('#mipd-prior-weight').selectOption('0.125');
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

test('both clinical-workflow teaching routes fit narrow screens without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:360,height:760});
  await page.goto(origin+'/pharmacometrie/game/');
  for(const [tab,mode] of [['#mode-population','#population-mode'],['#mode-mipd','#mipd-mode']]){
    await page.locator(tab).click();
    await expect(page.locator(mode)).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
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
