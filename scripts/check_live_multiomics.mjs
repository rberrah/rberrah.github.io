// Live deployment verification (not local preview). Runs in GitHub Actions.
// An HTTP 200 can still be an unhydrated JS shell: exercise the actual UI.
import {chromium} from '@playwright/test';
const origin='https://rberrah.github.io';
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error?.message||error)));
  const presentation=await page.goto(origin+'/multiomics/',{
    waitUntil:'domcontentloaded',timeout:30000});
  if(presentation?.status()!==200)
    throw new Error('Presentation HTTP '+presentation?.status());
  await page.getByRole('heading',{level:1})
    .waitFor({state:'visible',timeout:30000});
  const tool=await page.goto(origin+'/multiomics/tool/',{
    waitUntil:'domcontentloaded',timeout:30000});
  if(tool?.status()!==200)
    throw new Error('Tool HTTP '+tool?.status());
  await page.getByTestId('multiomics-quick-demo-rna')
    .waitFor({state:'visible',timeout:30000});
  console.log('PASS: real public page loads and hydrates beginner demo');
  await page.getByTestId('multiomics-quick-demo-rna').click();
  await page.getByTestId('multiomics-results')
    .waitFor({state:'visible',timeout:30000});
  const mode=await page.getByTestId('multiomics-analysis-mode').innerText();
  if(!/Omique unique|Single.omics/i.test(mode))
    throw new Error('Public one-omic demo returned an incomprehensible analysis mode');
  console.log('PASS: public one-omic beginner demo computes results');
  if(errors.length)
    throw new Error('Public desktop JS errors: '+errors.slice(0,5).join(' | '));

  const mobile=await browser.newPage({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true});
  const mobileErrors=[];
  mobile.on('pageerror',error=>mobileErrors.push(String(error?.message||error)));
  await mobile.goto(origin+'/multiomics/tool/',{
    waitUntil:'domcontentloaded',timeout:30000});
  await mobile.getByTestId('multiomics-quick-demo-rna')
    .waitFor({state:'visible',timeout:30000});
  const overflow=await mobile.evaluate(()=>
    document.documentElement.scrollWidth-document.documentElement.clientWidth);
  if(overflow>12)
    throw new Error('Public mobile page horizontal overflow: '+overflow+'px');
  await mobile.getByTestId('multiomics-quick-demo-rna').click();
  await mobile.getByTestId('multiomics-results')
    .waitFor({state:'visible',timeout:30000});
  console.log('PASS: public mobile 390px beginner demo computes results');
  if(mobileErrors.length)
    throw new Error('Public mobile JS errors: '+mobileErrors.slice(0,5).join(' | '));
} finally {
  await browser.close();
}
