// @ts-nocheck
import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';

function unzipStore(bytes){
  const archive=Buffer.from(bytes),result={};
  let offset=0;
  while(offset+30<=archive.length&&archive.readUInt32LE(offset)===0x04034b50){
    const method=archive.readUInt16LE(offset+8);
    const compressed=archive.readUInt32LE(offset+18);
    const n=archive.readUInt16LE(offset+26),extra=archive.readUInt16LE(offset+28);
    expect(method).toBe(0);
    const name=archive.subarray(offset+30,offset+30+n).toString('utf8');
    result[name]=archive.subarray(offset+30+n+extra,offset+30+n+extra+compressed).toString('utf8');
    offset+=30+n+extra+compressed;
  }
  expect(archive.readUInt32LE(offset)).toBe(0x02014b50);
  return result;
}
for(const [demo,expected] of [
  ['multiomics-quick-demo-rna',['transcriptomics']],
  ['multiomics-quick-demo-protein',['proteomics']],
  ['multiomics-quick-demo-metabolite',['metabolomics']],
  ['multiomics-quick-demo',['transcriptomics','proteomics','metabolomics']]
]){
  test('Scientific ZIP includes complete data and original sources: '+demo,async({page})=>{
    test.setTimeout(70_000);
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/multiomics/tool?lang=fr');
    await expect.poll(()=>page.evaluate(()=>
      document.documentElement.dataset.pmxMultiomicsHydrated),{timeout:12000}).toBe('true');
    await page.getByTestId(demo).click();
    await expect(page.getByTestId('multiomics-results')).toBeVisible({timeout:30000});
    const [download]=await Promise.all([
      page.waitForEvent('download',{timeout:30000}),
      page.getByTestId('multiomics-research-bundle-download').click()
    ]);
    expect(download.suggestedFilename()).toBe('multiomics_dossier_recherche_v1.zip');
    const contents=unzipStore(await fs.readFile(await download.path()));
    const manifest=JSON.parse(contents['provenance/manifest.json']);
    const project=JSON.parse(contents['source/projet_reproductible.json']);
    const analysis=JSON.parse(contents['provenance/analysis_complete.json']);
    const audit=JSON.parse(contents['methods/methods_audit.json']);
    expect(manifest.confirmatory_certification).toBe(false);
    expect(manifest.sensitive_research_data).toBe(true);
    expect(audit.scientific_certification).toBe(false);
    expect(audit.clinical_validation).toBe(false);
    expect(project.archivedResult).toBeNull();
    expect(project.inputs.metadata.sha256).toMatch(/^[a-f\d]{64}$/);
    expect(Object.keys(analysis.layers).sort()).toEqual([...expected].sort());
    expect(Object.keys(manifest.browser_layer_rows).sort()).toEqual([...expected].sort());
    for(const layer of expected){
      const csv=contents['tableaux/'+layer+'.csv'];
      expect(csv).toBeTruthy();
      const lines=csv.replace(/^\uFEFF/,'').split('\r\n');
      expect(lines[0]).toContain('feature,effect');
      expect(manifest.browser_layer_rows[layer]).toBe(analysis.layers[layer].rows.length);
      // CSV has one entry per full JSON row for the provided demo datasets.
      expect(lines.length-2).toBe(analysis.layers[layer].rows.length);
    }
    expect(contents['methods/methods.md']).toContain('Méthodes exécutées');
    expect(await page.getByTestId('multiomics-research-bundle-status')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
