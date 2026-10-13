// @ts-nocheck
import { test, expect } from '@playwright/test';

for(const width of [1280,390])for(const lang of ['fr','en']) {
  test('Beginner omics PopPK case '+lang+' '+width,async({page})=>{
    await page.setViewportSize({width,height:950});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/domaines/cas-pratique/?lang='+lang);
    await expect(page.getByTestId('omics-pop-pk-case')).toBeVisible();
    await expect(page.getByTestId('omics-baseline-mape')).toContainText('%');
    await expect(page.getByTestId('omics-signature-mape')).toContainText('%');
    const before=await page.getByTestId('omics-baseline-mape').innerText();
    await page.getByTestId('omics-pop-pk-beta').fill('0');
    await expect(page.getByTestId('omics-pop-pk-interpretation')).toBeVisible();
    await expect(page.getByTestId('omics-pop-pk-beta')).toHaveValue('0');
    await expect(page.getByTestId('omics-baseline-mape')).not.toHaveText(before);
    await expect(page.getByTestId('omics-pop-pk-case')).toContainText(
      lang==='fr'?'entièrement synthétiques':'entirely synthetic');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    expect(errors).toEqual([]);
  });
}
