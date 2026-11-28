import {test,expect} from '@playwright/test';
for(const lang of ['fr','en'])test('research applications are reachable without exposing private projects '+lang,async({page})=>{
  await page.goto('/ressources-outils/?lang='+lang);
  const apps=page.getByTestId('research-applications');
  await expect(apps).toBeVisible();
  await expect(apps.getByRole('link')).toHaveCount(4);
  await expect(apps.getByRole('link').first()).toHaveAttribute('href',new RegExp('/tdm/\\?lang='+lang+'$'));
  for(const [name,url] of [['TacDDI','https://tdmhub.shinyapps.io/TacDDI/'],['MissedDose','https://tdmhub.shinyapps.io/MissedDoseApp/'],['Shiny','https://tdmhub.shinyapps.io/MIPD_Engine/']]){
    const link=apps.getByRole('link',{name:new RegExp(name)});
    await expect(link).toHaveAttribute('href',url);
    await expect(link).toHaveAttribute('target','_blank');
    await expect(link).toHaveAttribute('rel','noopener noreferrer');
  }
  await expect(apps).toContainText(lang==='en'?'research software':'logiciels de recherche');
});
