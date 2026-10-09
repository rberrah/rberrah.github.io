// @ts-nocheck
import {test,expect} from '@playwright/test';

test('A new researcher can finish a one-omic demo on a phone without R or jargon-heavy setup',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  let backendCalls=0;
  page.on('request',request=>{
    if(/127\.0\.0\.1:8787\/run|reactome\.org\/AnalysisService/.test(request.url()))
      backendCalls++;
  });
  await page.goto('/multiomics/tool?lang=fr');
  const novice=page.getByTestId('multiomics-quick-start');
  await expect(novice).toBeVisible();
  await expect(novice).toContainText('Découvrir en 1 clic');
  await expect(novice).toContainText('Aucun fichier à préparer');
  await page.getByTestId('multiomics-quick-demo-rna').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('multiomics-results')).toBeVisible({timeout:30000});
  await expect(page.getByTestId('multiomics-analysis-mode')).toContainText('Omique unique');
  expect(backendCalls).toBe(0);
  const initialOverflow=await page.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(initialOverflow).toBeLessThanOrEqual(12);
});

test('Beginner-facing DIABLO/MOFA explanations define terms and avoid biomarker certification',async({page})=>{
  await page.route('http://127.0.0.1:8787/health',async route=>{
    await route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({status:'ok',engine:'PMx reference',
        packages:{mixOmics:true,MOFA2:true}})});
  });
  await page.route('http://127.0.0.1:8787/run',async route=>{
    await route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({status:'ok',engine:{name:'PMx R reference',version:'1.3.0'},
        methods:{
          diablo_heldout:{status:'ok',method:'Internal heldout DIABLO',
            summary:{meanBER:0.25,folds:[{},{},{}],
              signatureStability:{
                transcriptomics:{meanPairwiseJaccard:0.50,repeatedlySelected:['G1','G2']},
                proteomics:{meanPairwiseJaccard:0.34,repeatedlySelected:['P1']}
              }}},
          mofa2:{status:'ok',method:'MOFA2',
            summary:{inputAudit:{nSharedSubjects:48}}}
        }})});
  });
  await page.goto('/multiomics/tool?lang=fr');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({timeout:20000});
  await page.getByTestId('multiomics-run-options').locator('summary').first().click();
  await page.getByLabel(/Mode backend R|R backend mode/).selectOption('auto');
  await page.getByTestId('multiomics-run').click();
  await expect(page.getByTestId('reference-backend-results')).toBeVisible({timeout:20000});
  await page.getByTestId('multiomics-quality-details').locator('summary').first().click();
  const stability=page.getByTestId('diablo-signature-stability');
  await expect(stability).toBeVisible();
  await stability.locator('summary').click();
  await expect(stability).toContainText('Jaccard : de 0');
  await expect(stability).toContainText('ne valide pas un biomarqueur');
  const mofa=page.getByTestId('mofa2-input-audit');
  await expect(mofa).toContainText('facteur latent');
  await expect(mofa).toContainText('effet de lot');
});
