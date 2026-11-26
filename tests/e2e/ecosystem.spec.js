import { test, expect } from '@playwright/test';

test('PMx ecosystem presents the shared Learn Analyze Integrate journey', async ({ page }) => {
  await page.goto('/pharmacometrie/ecosystem/?lang=en');

  await expect(page.getByTestId('ecosystem-page')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn, analyze, then integrate');
  await expect(page.getByTestId('ecosystem-platform-map')).toBeVisible();
  await expect(page.getByTestId('ecosystem-platform-map').getByRole('heading',{name:'PMx Explain'})).toBeVisible();
  await expect(page.getByTestId('ecosystem-platform-map').getByRole('link',{name:/Open MultiOmics/})).toHaveAttribute('href','https://rberrah.github.io/multiomics/?lang=en');
  await expect(page.getByTestId('ecosystem-platform-map').getByRole('link',{name:/Open Omics2PK/})).toHaveAttribute('href','https://rberrah.github.io/Omics2PK/');

  const ecosystem = page.getByTestId('goal-connections');
  await expect(ecosystem.locator('summary')).toContainText('Ecosystem');
  await ecosystem.locator('summary').click();
  await expect(page.getByTestId('nav-ecosystem')).toBeVisible();
  await expect(page.getByTestId('nav-multiomics')).toHaveAttribute('href', 'https://rberrah.github.io/multiomics/');
  await expect(page.getByTestId('nav-omics2pk')).toHaveAttribute('href', 'https://rberrah.github.io/Omics2PK/');

  const thesis = page.getByTestId('thesis-research-program');
  await expect(thesis.getByRole('heading', { level: 2 })).toHaveText('Research programme');
  await expect(thesis.locator('[data-project="pillar-a"] h3')).toHaveText('Ontology & knowledge graph');
  await expect(thesis.locator('.thesis-card')).toHaveCount(6);
  for (const [id, name] of [['a','Ontology & knowledge graph'],['c','Verification'],['d','Individualisation']]) {
    const card = thesis.locator(`[data-project="pillar-${id}"]`);
    await expect(card.locator('h3')).toHaveText(name);
    await expect(card.locator('p')).toHaveCount(1);
    await expect(card.locator('p')).toHaveText('Coming soon');
    await expect(card.locator('a')).toHaveCount(0);
  }
  await expect(thesis).not.toContainText('pharmacological twins');
  await expect(thesis).not.toContainText('causal evaluation');
  await expect(thesis.locator('[data-project="netpk"] a')).toHaveAttribute('href', 'https://rberrah.github.io/communications/netpk-peprsn-2026/');
  await expect(thesis.locator('[data-project="pillar-b"] a')).toHaveAttribute('href', 'https://rberrah.github.io/communications/autonomous-pharmacometrics-page-2026/');
  await expect(thesis.locator('[data-project="phenopass"] a')).toHaveCount(0);
  await expect(thesis.locator('[data-project="phenopass"]')).toContainText('unpublished results');
  await expect(thesis.locator('[data-project="pillar-c"] a, [data-project="pillar-d"] a')).toHaveCount(0);

  await page.locator('.language-toggle').getByRole('button', { name: 'FR', exact: true }).click();
  await expect(ecosystem.locator('summary')).toContainText('Écosystème');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Apprendre, analyser, puis intégrer');
  await expect(page.getByTestId('thesis-research-program').getByRole('heading', { level: 2 })).toHaveText('Programme de recherche');
  await expect(page.getByTestId('thesis-research-program').locator('[data-project="phenopass"]')).toContainText('résultats non publiés');
  await expect(thesis.locator('[data-project="pillar-a"] h3')).toHaveText('Ontologie et graphe de connaissances');
  for (const [id,name] of [['a','Ontologie et graphe de connaissances'],['c','Vérification'],['d','Individualisation']]) {
    const card=thesis.locator(`[data-project="pillar-${id}"]`);
    await expect(card.locator('h3')).toHaveText(name);
    await expect(card.locator('p')).toHaveText('À venir');
  }
  await expect(thesis).not.toContainText('jumeaux pharmacologiques');
  await expect(thesis.locator('[data-project="netpk"] a')).toHaveAttribute('href','https://rberrah.github.io/communications/fr/netpk-peprsn-2026/');
  await expect(page.getByTestId('ecosystem-platform-map').getByRole('link',{name:/Ouvrir MultiOmics/})).toHaveAttribute('href','https://rberrah.github.io/multiomics/?lang=fr');
  await page.locator('.language-toggle').getByRole('button',{name:'EN',exact:true}).click();
  await expect(thesis.locator('[data-project="pillar-a"] h3')).toHaveText('Ontology & knowledge graph');
});

for(const lang of ['fr','en'])test('ecosystem map and evidence labels remain readable at 320px ('+lang+')',async({page})=>{
  await page.setViewportSize({width:320,height:640});
  await page.goto('/pharmacometrie/ecosystem/?lang='+lang);
  await expect(page.getByTestId('ecosystem-platform-map')).toBeVisible();
  await expect(page.getByTestId('thesis-research-program').locator('.thesis-card')).toHaveCount(6);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.getByTestId('ecosystem-platform-map')).not.toContainText(lang==='en'?'APPRENDRE ET MODÉLISER':'LEARN AND MODEL');
});
