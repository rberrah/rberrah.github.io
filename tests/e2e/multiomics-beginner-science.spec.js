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


test('Three-omics beginner demo never requires R or Reactome service',async({page})=>{
  let external=0;
  page.on('request',request=>{
    if(/127\\.0\\.0\\.1:8787\\/run|reactome\\.org\\/AnalysisService/.test(request.url()))external++;
  });
  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-quick-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({timeout:30000});
  await expect(page.getByTestId('multiomics-analysis-mode')).toContainText(/multi|omiques/i);
  expect(external).toBe(0);
});

test('Beginner one-click demo instructions meet WCAG AA 4.5:1 text contrast',async({page})=>{
  await page.goto('/multiomics/tool?lang=fr');
  const ratios=await page.evaluate(()=>{
    const surface=document.querySelector('.quick-start');
    if(!surface)throw new Error('Beginner intro panel missing');
    const background=getComputedStyle(surface).backgroundColor;
    const parse=(value)=>{
      const parts=value.match(/[\d.]+/g)?.slice(0,3).map(Number);
      if(!parts||parts.length<3)throw new Error('Cannot evaluate intro contrast: '+value);
      return parts;
    };
    const luminance=(value)=>{
      const components=parse(value).map(n=>{
        const srgb=n/255;
        return srgb<=0.04045?srgb/12.92:((srgb+0.055)/1.055)**2.4;
      });
      return components[0]*0.2126+components[1]*0.7152+components[2]*0.0722;
    };
    const bg=luminance(background);
    return ['strong','span','small'].map(selector=>{
      const node=surface.querySelector('.quick-start-copy '+selector);
      if(!node)throw new Error('Missing beginner instructions: '+selector);
      const fg=luminance(getComputedStyle(node).color);
      return {selector,ratio:(Math.max(bg,fg)+0.05)/(Math.min(bg,fg)+0.05)};
    });
  });
  for(const item of ratios)
    expect(item.ratio,'Low-contrast beginner text: '+item.selector).toBeGreaterThanOrEqual(4.5);
});

test('Beginner-facing DIABLO/MOFA explanations define terms and avoid biomarker certification',async({page})=>{
  await page.route('http://127.0.0.1:8787/health',async route=>{
    await route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({status:'ok',engine:'PMx reference',
        packages:{mixOmics:true,MOFA2:true},
        capabilities:{mofa2_orientation_contract:'mofa2-feature-rows-sample-columns-v2'}})});
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
            summary:{inputAudit:{nSharedSubjects:48},matrixOrientation:'feature_rows_subject_columns_for_MOFA2',subjectIdentityPreserved:true,implementationContract:'mofa2-feature-rows-sample-columns-v2'}}
        }})});
  });
  await page.goto('/multiomics/tool?lang=fr');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({timeout:20000});
  await page.getByTestId('multiomics-run-options').locator('summary').first().click();
  await page.getByLabel(/Mode backend R|R backend mode/).selectOption('auto');
  await page.getByTestId('multiomics-run').click();
  await page.getByTestId('multiomics-quality-details').locator('summary').first().click();
  await expect(page.getByTestId('reference-backend-results')).toBeVisible({timeout:20000});
  const stability=page.getByTestId('diablo-signature-stability');
  await expect(stability).toBeVisible();
  await stability.locator('summary').click();
  await expect(stability).toContainText('Jaccard : de 0');
  await expect(stability).toContainText('ne valide pas un biomarqueur');
  const mofa=page.getByTestId('mofa2-input-audit');
  await expect(mofa).toContainText('facteur latent');
  await expect(mofa).toContainText('effet de lot');
});
