// @ts-nocheck - browser runner types are separate from the application check.
import { test, expect } from '@playwright/test';
import { sceneLayout } from '../../src/lib/labs/particles.js';
const origin = process.env.LABS_E2E_URL || '';
test.setTimeout(90000);

async function open(page,lab) {
  await page.goto(`${origin}/laboratoires/?lang=en#lab=${lab}`);
  await expect(page.getByTestId('laboratory')).toHaveAttribute('data-ready','true',{timeout:45000});
  await expect(page.getByTestId('lab-scene')).toBeVisible();
}
async function checksum(canvas,region) {
  return canvas.evaluate((node,box)=>{
    const scale=node.width/node.clientWidth;
    const data=node.getContext('2d').getImageData(...(box ? box.map(v=>v*scale) : [0,0,node.width,node.height])).data;
    return Array.from(data).reduce((sum,value,i)=>(sum+value*(i%997+1))%1000000007,0);
  },region);
}
test.beforeEach(async({page})=>{page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));});
test.afterEach(async({page})=>{expect(page.errors).toEqual([]);});

for (const lab of ['absorption','infusion']) {
  test(`${lab}: moving input, mass balance, reference and mobile plots`,async({page})=>{
    await page.setViewportSize({width:1440,height:1100});
    await open(page,lab);
    await expect(page.getByTestId('lab-concentration')).toHaveText('0.00');
    await expect(page.getByLabel('Animate particles')).toBeChecked();
    await expect(page.getByRole('button',{name:'Next particle',exact:true})).toHaveCount(0);
    await expect(page.getByLabel('Probe',{exact:true})).not.toBeChecked();
    const scene=page.getByTestId('lab-scene');
    const g=sceneLayout(await scene.evaluate(n=>n.clientWidth),lab),c=g.rooms.central,r=g.rooms.peripheral;
    const inputPipe=[c.x+c.w+8,g.backwardY-8,r.x-c.x-c.w-16,16];
    await page.getByTestId('lab-time').fill('1');
    const first=await checksum(scene,inputPipe);
    await page.getByRole('button',{name:'Play',exact:true}).click();
    await expect.poll(async()=>Number(await page.getByTestId('lab-time').inputValue())).toBeGreaterThan(1.6);
    await page.getByRole('button',{name:'Pause',exact:true}).click();
    const moved=await checksum(scene,inputPipe); expect(moved).not.toBe(first);
    await page.waitForTimeout(150); expect(await checksum(scene,inputPipe)).toBe(moved);
    await page.getByTestId('lab-time').fill('1'); expect(await checksum(scene,inputPipe)).toBe(first);
    await page.getByLabel('Probe',{exact:true}).check();
    await expect(page.getByTestId('probe-readout')).toContainText(await page.getByTestId('lab-concentration').innerText());
    if(lab==='absorption') {
      await page.locator('#lab-f').fill('0'); await page.getByTestId('lab-time').fill('8');
      await expect(page.getByTestId('lab-concentration')).toHaveText('0.00');
      await page.getByLabel('Compare with reference').uncheck();
      await expect(page.getByTestId('lab-log-plot')).toBeVisible();
      await page.locator('#lab-f').fill('1'); await page.locator('#lab-ka').fill('0.2');
      await page.getByRole('button',{name:'Use this model as the new reference'}).click();
      await page.locator('#lab-ka').fill('0.8');
    } else {
      await page.getByRole('button',{name:'End of infusion',exact:true}).click();
      await expect(page.getByTestId('lab-time')).toHaveValue('8.0');
      const peak=Number(await page.getByTestId('lab-concentration').innerText());
      await page.getByTestId('lab-time').fill('12');
      expect(Number(await page.getByTestId('lab-concentration').innerText())).toBeLessThan(peak);
      const stopped=await checksum(scene,inputPipe);
      await page.getByTestId('lab-time').fill('16');
      expect(await checksum(scene,inputPipe)).toBe(stopped);
    }
    await page.locator('.data summary').click();
    await expect(page.locator('.data')).toContainText(lab==='absorption'?'Presystemic loss':'Infusion bag');
    await expect(page.getByRole('button',{name:'Open in TDM',exact:true})).toBeDisabled();
    for(const width of [1440,768,390,320]) {
      await page.setViewportSize({width,height:1000});
      await page.getByTestId('lab-time').fill('2');
      await scene.evaluate(n=>n.scrollIntoView({block:'center'}));
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      await page.screenshot({path:`test-results/lab-${lab}-${width}.png`});
      await page.getByTestId('lab-log-plot').scrollIntoViewIfNeeded();
      await page.screenshot({path:`test-results/lab-${lab}-plots-${width}.png`});
    }
  });
  test(`${lab}: share, teacher mode, exports and explicit Lego transfer`,async({page})=>{
    await open(page,lab);
    await page.getByLabel('Teacher mode',{exact:true}).check();
    await page.getByLabel('Hide results at opening').check();
    await page.getByRole('button',{name:'Share scenario',exact:true}).click();
    const shared=await page.getByLabel('Synthetic scenario link').inputValue();
    await page.goto(shared);
    await expect(page.getByTestId('lab-plot')).toHaveCount(0);
    await page.getByRole('button',{name:'Reveal results',exact:true}).click();
    for(const name of ['CSV','Figure']) {
      const pending=page.waitForEvent('download');await page.getByRole('button',{name,exact:true}).click();
      const download=await pending;expect(await download.failure()).toBeNull();
    }
    await page.getByRole('button',{name:'Build in PK',exact:true}).click();
    await expect(page.getByTestId('lab-transfer')).toContainText(lab==='absorption'?'Oral':'IV infusion');
    await page.getByRole('button',{name:'Apply experiment',exact:true}).click();
    await expect(page.getByRole('status').first()).toContainText('Laboratory parameters applied');
    await expect(page.locator('body')).toContainText(lab==='absorption'?'DEPOT':'CENT');
    expect(await page.locator('body').innerText()).not.toContain('NaN');
  });
}

test('new labs in French dark mode on mobile',async({page})=>{
  await page.emulateMedia({colorScheme:'dark'});
  await page.setViewportSize({width:390,height:1050});
  for(const [lab,title] of [['absorption','Absorption orale et biodisponibilité'],['infusion','Perfusion IV et décroissance après arrêt']]) {
    await page.goto(`${origin}/laboratoires/?lang=fr#lab=${lab}`);
    await expect(page.getByTestId('laboratory')).toHaveAttribute('data-ready','true',{timeout:45000});
    await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Particule suivante',exact:true})).toHaveCount(0);
    await page.getByTestId('lab-time').fill('2');
    await page.getByTestId('lab-scene').evaluate(n=>n.scrollIntoView({block:'center'}));
    await page.screenshot({path:`test-results/lab-${lab}-fr-dark.png`});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});
