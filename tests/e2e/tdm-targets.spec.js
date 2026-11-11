import { test, expect } from '@playwright/test';

test('TDM reference starts with molecule search, not a wall of tables', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await expect(page.getByTestId('tdm-targets-guide')).toBeVisible();
  await expect(page.getByTestId('tdm-target-search')).toBeVisible();
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(0);
  await expect(page.getByTestId('tdm-manual-entry')).toHaveCount(0);
  await expect(page.getByTestId('tdm-medicine-directory')).toBeVisible();
  await expect(page.getByTestId('tdm-medicine-family')).toHaveCount(9);
  await expect(page.getByTestId('tdm-medicine-choice').first()).toBeHidden();
  await expect(page.getByText('Cibles thérapeutiques', { exact: true })).toBeVisible();
});

test('MPA and MMF aliases show one molecule and four indication cards, with study evidence on demand', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('MPA');
  await expect(page.getByTestId('tdm-drug-group')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(4);
  const heart = page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: 'Greffe cardiaque' }) });
  await expect(heart.getByText('>36', { exact: true })).toBeVisible();
  await expect(heart.getByRole('link', { name: /Source originale/ })).toHaveAttribute('href', /pmc\.ncbi\.nlm\.nih\.gov/);
  await expect(heart.getByTestId('tdm-other-sources')).toBeHidden();
  await heart.locator('summary').click();
  await expect(heart.getByTestId('tdm-other-sources')).toBeVisible();
  await expect(heart.getByText('≈50', { exact: false })).toBeVisible();
  await search.fill('MMF');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(4);

  const kidney = page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: 'Greffe rénale', exact: true }) });
  await kidney.locator('summary').click();
  await expect(kidney.getByTestId('tdm-other-sources').getByRole('link', { name: /IATDMCT.*2021/ })).toBeVisible();
});

test('Valproate displays one primary RCP target; SFPT values and limitations are in details', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('valproate');
  const card = page.getByTestId('tdm-target-card');
  await expect(card).toHaveCount(1);
  await expect(card.getByText('40–100', { exact: true })).toBeVisible();
  await expect(card.getByRole('link', { name: /Source originale/ })).toHaveAttribute('href', /base-donnees-publique\.medicaments\.gouv\.fr/);
  await expect(card.getByTestId('tdm-other-sources')).toBeHidden();
  await card.locator('summary').click();
  await expect(card.getByTestId('tdm-other-sources')).toBeVisible();
  await expect(card.getByTestId('tdm-other-sources').locator('.alternative-head strong').filter({ hasText: /50–100/ })).toHaveCount(2);
});

test('Different transplant regimens remain distinct; supported mobile English search', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/pharmacometrie/cibles-tdm/?lang=en');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('everolimus');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(6);
  await expect(page.getByTestId('tdm-target-card').getByText('3–8', { exact: true })).toHaveCount(4);
  await search.fill('tacrolimus');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(7);
  await expect(page.getByText('Local protocol / study')).toHaveCount(6);
  await expect(page.getByRole('link', { name: /MIPD model library/ })).toBeVisible();
});

test('Only verified CHU sampling-time documents are shown, never lab request forms or assay pages', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('céfépime');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(0);
  await expect(page.getByTestId('tdm-mic-card')).toHaveCount(2);
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveCount(1);
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveAttribute('href', /DocumentNew\.aspx\?idDoc=41157/);
  await search.fill('avibactam');
  await expect(page.getByTestId('tdm-mic-card')).toHaveCount(0);
  await expect(page.getByTestId('tdm-no-target-results')).toBeVisible();
  await expect(page.getByTestId('tdm-manual-entry')).toHaveCount(1);
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveAttribute('href', /DocumentNew\.aspx\?idDoc=41157/);
  await search.fill('tacrolimus');
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveCount(0);
  await expect(page.locator('a[href*="idDoc=33210"]')).toHaveCount(0);
  await search.fill('lithium');
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveCount(0);
  await expect(page.locator('a[href*="DetailNew.aspx"]')).toHaveCount(0);
  await search.fill('no-such-molecule-xyz');
  await expect(page.getByText(/Aucune molécule trouvée/)).toBeVisible();
  await page.getByRole('button', { name: 'Effacer la recherche' }).click();
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(0);
});

test('Expanded immunosuppressant references distinguish cyclosporine C0 and C2 and sirolimus regimens', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('ciclosporine');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(6);
  await expect(page.getByTestId('tdm-target-card').getByRole('link', { name: /Source originale/ }).first()).toHaveAttribute('href', /PMC13624913/);
  await expect(page.getByText('C₂h', { exact: true })).toHaveCount(3);
  await page.getByTestId('tdm-target-search').fill('sirolimus');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByTestId('tdm-target-card').getByText('4–12', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-target-card').getByText('12–20', { exact: true })).toBeVisible();
});

test('Expanded antidepressant targets retain analyte and newer AGNP 2026 update warning', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('venlafaxine');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card').getByText('140–600', { exact: true })).toBeVisible();
  await page.getByTestId('tdm-target-card').locator('summary').click();
  await expect(page.getByTestId('tdm-target-card').getByText(/O-desméthylvenlafaxine/)).toBeVisible();
  await expect(page.getByRole('link', { name: /AGNP update/ })).toHaveAttribute('href', /42392224/);
  await search.fill('escitalopram');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card').getByText('20–40', { exact: true })).toBeVisible();
  await page.getByTestId('tdm-target-card').locator('summary').click();
  await expect(page.getByTestId('tdm-other-sources').locator('.alternative-head strong')).toContainText('15–80');
});

test('Expanded anti-infective and antiseizure targets preserve indication context and source differences', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('posaconazole');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByTestId('tdm-target-card').getByText('>0,7', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-target-card').getByText('>1', { exact: true })).toBeVisible();
  await search.fill('voriconazole');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await search.fill('lévétiracétam');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  const historicalLevetiracetam = page.getByTestId('tdm-target-card')
    .filter({ has: page.getByText('10–40', { exact: true }) });
  await expect(historicalLevetiracetam).toBeVisible();
  await historicalLevetiracetam.locator('summary').click();
  await expect(historicalLevetiracetam.getByTestId('tdm-other-sources').locator('.alternative-head strong'))
    .toContainText('12–46');
  await expect(page.getByText('6–46', { exact: true })).toBeVisible();
  await search.fill('oxcarbazepine');
  await expect(page.getByTestId('tdm-target-card').getByText('3–36', { exact: true })).toBeVisible();
});

test('CMI-aware beta-lactam targets are distinct for intermittent and continuous infusion', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('méropénème');
  await expect(page.getByTestId('tdm-mic-card')).toHaveCount(2);
  const mic = page.getByTestId('tdm-mic-input');
  await mic.fill('2');
  await expect(page.getByTestId('tdm-mic-result')).toHaveCount(2);
  await expect(page.getByTestId('tdm-mic-result').filter({ hasText: 'fCmin > 2 mg/L' })).toBeVisible();
  await expect(page.getByTestId('tdm-mic-result').filter({ hasText: 'fCss ≥ 8 mg/L' })).toBeVisible();
  await mic.fill('0,5');
  await expect(page.getByTestId('tdm-mic-result').filter({ hasText: 'fCmin > 0,5 mg/L' })).toBeVisible();
  await mic.fill('0');
  await expect(page.getByText('Saisissez une CMI positive en mg/L.')).toBeVisible();
  await expect(page.getByTestId('tdm-mic-result')).toHaveCount(0);
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveCount(1);
  await page.getByTestId('tdm-mic-card').first().locator('summary').click();
  await expect(page.getByText(/une fCmin > CMI ne constitue un substitut/i)).toBeVisible();
  await expect(page.getByTestId('tdm-mic-card').first().getByText(/ECOFF/)).toBeVisible();
  await expect(page.getByTestId('tdm-mic-card').first().getByRole('link', { name: /Source PK\/PD originale/ })).toHaveAttribute('href', /beta-lactam-antibiotic-dose-individualization-in-acutely-ill-patients/);
});

test('MIC-aware aminoglycosides, quinolones and daptomycin preserve different PK/PD indices', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('gentamicine');
  await page.getByTestId('tdm-mic-input').fill('0,5');
  await expect(page.getByTestId('tdm-mic-result')).toContainText('Cmax ≥ 4–5 mg/L');
  await search.fill('ciprofloxacine');
  await expect(page.getByTestId('tdm-mic-result')).toContainText('fAUC₀–₂₄ ≥ 40 mg·h/L');
  await search.fill('daptomycine');
  await expect(page.getByTestId('tdm-mic-result')).toContainText('AUC₀–₂₄ > 333 mg·h/L');
});

test('Vancomycin does not extrapolate the AUC 400–600 window linearly to MIC above 1', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('vancomycine');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByTestId('tdm-mic-card')).toHaveCount(1);
  await page.getByTestId('tdm-mic-input').fill('1');
  await expect(page.getByTestId('tdm-mic-result')).toContainText('AUC₀–₂₄ : 400–600 mg·h/L');
  await page.getByTestId('tdm-mic-input').fill('2');
  await expect(page.getByTestId('tdm-mic-result')).toContainText('Pas de recalcul linéaire');
  await expect(page.getByTestId('tdm-target-card').getByText('400–600', { exact: true })).toBeVisible();
});

test('TB reference concentrations are distinguished from CMI-dependent objectives and link only CHU sampling times', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('isoniazide');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card').getByText('3–6', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-mic-card')).toHaveCount(0);
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveAttribute('href', /DocumentNew[.]aspx[?]idDoc=41157/);
  await search.fill('rifampicine');
  await expect(page.getByTestId('tdm-target-card').getByText('8–24', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-target-card').getByText('C₂h (pic approximatif)', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveCount(1);
});

test('Collapsible home categories select the molecule and reveal AUC context without a full catalogue wall', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await expect(page.getByTestId('tdm-medicine-directory')).toBeVisible();
  const family = page.getByTestId('tdm-medicine-family').filter({ hasText: 'Immunosuppresseurs' });
  await family.locator('summary').click();
  await expect(family.getByRole('button', { name: 'Tacrolimus' })).toBeVisible();
  await family.getByRole('button', { name: 'Tacrolimus' }).click();
  await expect(page.getByTestId('tdm-medicine-directory')).toHaveCount(0);
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(7);
  await expect(page.getByTestId('tdm-exposure-tag')).toContainText('AUC informative, C₀ en routine');
  await expect(page.getByTestId('tdm-target-card').first().getByText('160', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-target-card').first().getByText('AUC₀–₁₂', { exact: true })).toBeVisible();
  const details = page.getByTestId('tdm-evidence-details');
  await details.locator('summary').click();
  await expect(details.getByRole('link', { name: /Marquet · 2025/ })).toHaveAttribute('href', /39357034/);
  await expect(details.getByRole('link', { name: /Woillard.*2023/ })).toHaveAttribute('href', /36508648/);
  await expect(details.getByRole('link', { name: /Prograf 1 mg/ })).toHaveAttribute('href', /61217812/);
  await expect(details.getByRole('link', { name: /Envarsus.*SmPC/ })).toHaveAttribute('href', /ema[.]europa[.]eu/);
});

test('Scientific priority and FDA label-specific liver targets keep AUC and C0 contexts separate', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('MPA');
  await expect(page.getByTestId('tdm-exposure-tag')).toContainText('AUC privilégiée');
  const evidence = page.getByTestId('tdm-evidence-details');
  await evidence.locator('summary').click();
  const tiers = evidence.getByTestId('tdm-reference-tier');
  await expect(tiers.first()).toContainText('Sociétés savantes');
  await expect(tiers.nth(1)).toContainText('RCP / SmPC');
  await expect(tiers.nth(2)).toContainText('CHU de Limoges');
  await expect(evidence.getByRole('link', { name: /CellCept.*SmPC/ })).toHaveAttribute('href', /ema[.]europa[.]eu/);
  await search.fill('évérolimus');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(6);
  await expect(page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: /Greffe hépatique.*tacrolimus réduit/ }) })).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: /Greffe hépatique.*tacrolimus réduit/ }) }).getByRole('link', { name: /Source originale/ })).toHaveAttribute('href', /dailymed[.]nlm[.]nih[.]gov/);
  await search.fill('tacrolimus');
  await expect(page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: /Greffe hépatique.*évérolimus/ }) })).toContainText('3–5');
});

test('English category navigation and regulatory links remain responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/pharmacometrie/cibles-tdm/?lang=en');
  const antibioticFamily = page.getByTestId('tdm-medicine-family').filter({ hasText: 'Antibiotics and antituberculosis' });
  await antibioticFamily.locator('summary').click();
  await antibioticFamily.getByRole('button', { name: 'Cefepime' }).click();
  await expect(page.getByTestId('tdm-mic-card')).toHaveCount(2);
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveCount(1);
});


test('ANSM teicoplanin targets are assay-specific and never mixed between HPLC and FPIA', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('Targocid');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('15–30', { exact: true })).toBeVisible();
  await expect(page.getByText('30–40', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /HPLC/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /FPIA/ })).toBeVisible();
  await expect(page.getByTestId('tdm-target-card').first().getByRole('link', { name: /Source originale/ }))
    .toHaveAttribute('href', /base-donnees-publique[.]medicaments[.]gouv[.]fr/);
});

test('Busulfan uses regimen-specific cumulative AUC, not per-dose or trough targets', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('busulfan');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('85–95', { exact: true })).toBeVisible();
  await expect(page.getByText('60–70', { exact: true })).toBeVisible();
  await expect(page.getByText('AUC cumulée', { exact: true })).toHaveCount(2);
  await expect(page.getByTestId('tdm-exposure-tag')).toContainText('AUC cumulée');
  await page.getByTestId('tdm-target-card').first().locator('summary').click();
  await expect(page.getByText(/AUC totale cumulée du conditionnement/).first()).toBeVisible();
});

test('Clozapine remains a single analyte-specific reference with updated consensus warning', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=en');
  await page.getByTestId('tdm-target-search').fill('clozaril');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('350–600', { exact: true })).toHaveCount(2);
  const historicalClozapine=page.getByTestId('tdm-target-card')
    .filter({ has: page.getByRole('heading', { name: 'Schizophrenia · clozapine monitoring' }) });
  await historicalClozapine.locator('summary').click();
  await expect(historicalClozapine.getByText(/norclozapine is distinct/i)).toBeVisible();
  await expect(historicalClozapine.getByRole('link', { name: /AGNP 2026/ }))
    .toHaveAttribute('href', /42392224/);
});

test('Expanded drugs are discoverable inside existing closed-by-default family browser', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await expect(page.getByTestId('tdm-medicine-family')).toHaveCount(9);
  for (const [family, medicine] of [
    ['Antibiotiques', 'Téicoplanine'],
    ['Autres psychotropes', 'Clozapine'],
    ['Oncologie', 'Busulfan']
  ]) {
    const section = page.getByTestId('tdm-medicine-family').filter({ hasText: family });
    await section.locator('summary').click();
    await expect(section.getByRole('button', { name: medicine })).toBeVisible();
    await section.locator('summary').click();
  }
});


test('Flucytosine pre-dose and post-dose targets keep their sampling times separate', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('ancotil');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('20–40', { exact: true })).toBeVisible();
  await expect(page.getByText('50–100', { exact: true })).toBeVisible();
  const peak = page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: /pic 2 h per os/ }) });
  await peak.locator('summary').click();
  await expect(peak.getByText(/2 h après une dose orale ou 30 min après une dose intraveineuse/)).toBeVisible();
});

test('Itraconazole does not conflate parent-only and parent-plus-metabolite troughs', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('sporanox');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('>1', { exact: true })).toBeVisible();
  await expect(page.getByText('>1,5', { exact: true })).toBeVisible();
  const combined = page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: /somme itraconazole/ }) });
  await expect(page.getByRole('heading', { name: /Histoplasmose pulmonaire/ })).toBeVisible();
  await combined.locator('summary').click();
  await expect(combined.getByText(/SOMME des deux analytes/)).toBeVisible();
  await expect(combined.getByRole('link', { name: /DOI/ })).toHaveAttribute('href', /10[.]1093\/cid\/ciw326/);
});


test('Antipsychotics expose older ranges with 2026 update warning and explicit active moieties', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('aripiprazole');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('100–350', { exact: true })).toBeVisible();
  await expect(page.getByText('150–500', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-historical-warning')).toHaveCount(2);
  const combined = page.getByTestId('tdm-target-card').filter({ has: page.getByText('150–500', { exact: true }) });
  await combined.locator('summary').click();
  await expect(combined.getByText(/déhydroaripiprazole/).first()).toBeVisible();
  await expect(combined.getByRole('link', { name: /AGNP 2026/ })).toHaveAttribute('href', /42392224/);

  await search.fill('rispéridone');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await page.getByTestId('tdm-target-card').locator('summary').click();
  await expect(page.getByText(/9-OH-rispéridone/).first()).toBeVisible();
});

test('Methotrexate safety signals are time-anchored and never rendered as a therapeutic window', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('méthotrexate');
  await expect(page.getByTestId('tdm-drug-group')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(0);
  await expect(page.getByTestId('tdm-timed-safety-section')).toBeVisible();
  await expect(page.getByTestId('tdm-timed-safety-row')).toHaveCount(4);
  await expect(page.getByTestId('tdm-timed-safety-row').first()).toContainText('H24');
  await expect(page.getByTestId('tdm-timed-safety-row').first()).toContainText('>50 µmol/L');
  await expect(page.getByText(/DÉBUT de la perfusion/)).toBeVisible();
  await expect(page.getByText(/pas des cibles thérapeutiques/)).toBeVisible();
  await expect(page.getByTestId('tdm-mic-input')).toHaveCount(0);
});

test('New antipsychotics and HD-MTX appear in the correct expandable family, without CHU sampling link inventions', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const directory = page.getByTestId('tdm-medicine-directory');
  const psychiatry = directory.getByTestId('tdm-medicine-family').filter({ hasText: 'Autres psychotropes' });
  await psychiatry.locator('summary').click();
  await expect(psychiatry.getByRole('button', { name: 'Halopéridol' })).toBeVisible();
  await psychiatry.getByRole('button', { name: 'Halopéridol' }).click();
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByTestId('tdm-agnp-2026-verified')).toBeVisible();
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveCount(0);
  await page.getByTestId('tdm-target-search').clear();
  const oncology = directory.getByTestId('tdm-medicine-family').filter({ hasText: 'Oncologie' });
  await oncology.locator('summary').click();
  await oncology.getByRole('button', { name: 'Méthotrexate (haute dose)' }).click();
  await expect(page.getByTestId('tdm-timed-safety-row')).toHaveCount(4);
});


test('Clozapine historical CHU evidence is shown without asserting present-day assay availability', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('clozapine');
  await expect(page.getByTestId('tdm-drug-group')).toHaveCount(1);
  await expect(page.getByTestId('tdm-chu-historical-assay')).toBeVisible();
  await expect(page.getByTestId('tdm-chu-historical-assay')).toContainText('historique uniquement (2010–2022)');
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveCount(0);
  await expect(page.getByTestId('tdm-chu-historical-assay')).toHaveAttribute('href', /health-data-hub[.]fr/);
});


test('Agomelatine uses 1–2 h peak, not trough, and is linked to the documented CHU name', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('Agomélatine');
  await expect(page.getByTestId('tdm-drug-group')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByText('7–300', { exact: true })).toBeVisible();
  await expect(page.getByText('Cmax à 1–2 h après prise')).toBeVisible();
  await expect(page.getByTestId('tdm-historical-warning')).toHaveCount(1);
  await page.getByTestId('tdm-target-card').locator('summary').click();
  await expect(page.getByText(/TDM de niveau 4/)).toBeVisible();
});

test('Bupropion parent and hydroxybupropion remain two distinct analytes; upper-only targets are not ranges', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('bupropion');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('10–100', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: 'Épisode dépressif majeur · hydroxybupropion' }) })).toContainText(/850–1\s*500/);
  await search.fill('tranylcypromine');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('≤50', { exact: true })).toBeVisible();
  await expect(page.getByText('60–400', { exact: true })).toBeVisible();
  await expect(page.getByText('Cmax (2–3 h après dose)', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-pk-index')).toContainText('PIC Cmax à 2–3 h');
  await expect(page.getByTestId('tdm-pk-sample')).toContainText('Pic à 2–3 h');

});


test('Antiseizure extension keeps clobazam parent and active metabolite distinct', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('clobazam');
  await expect(page.getByTestId('tdm-drug-group')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('0,03–0,3', { exact: true })).toBeVisible();
  await expect(page.getByText('0,3–3', { exact: true })).toBeVisible();
  const metabolite = page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: /N-desméthylclobazam/ }) });
  await metabolite.locator('summary').click();
  await expect(metabolite.getByText(/CYP2C19/)).toBeVisible();
});

test('Historical Norwegian AED ranges and analytes are individually discoverable', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=en');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('eslicarbazepine');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByText('3–26', { exact: true })).toBeVisible();
  await page.getByTestId('tdm-target-card').locator('summary').click();
  await expect(page.getByText(/S-licarbazepine/).first()).toBeVisible();

  await search.fill('clonazepam');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByText('13–38', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-target-card')).toContainText('ng/mL');

  await search.fill('topiramate');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByText('2–10', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-chu-sampling-link')).toHaveCount(0);
});

test('New AED molecules appear under antiseizure collapsible family, not antidepressants', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const group = page.getByTestId('tdm-medicine-family').filter({ hasText: 'Antiépileptiques' });
  await group.locator('summary').click();
  await expect(group.getByRole('button', { name: 'Brivaracétam' })).toBeVisible();
  await expect(group.getByRole('button', { name: 'Topiramate' })).toBeVisible();
  await expect(group.getByRole('button', { name: 'Lacosamide' })).toBeVisible();
});


test('CHU documentary filter shows exactly the previously verified names, not laboratory certification', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const directory = page.getByTestId('tdm-medicine-directory');
  const filter = page.getByTestId('tdm-chu-directory-filter');
  await expect(filter).not.toBeChecked();
  await filter.check();
  const families = directory.getByTestId('tdm-medicine-family');
  await expect(families).toHaveCount(7);
  await expect(directory.getByText(/sans garantie de dosage actuel/)).toBeVisible();
  const antibiotiques = families.filter({ hasText: 'Antibiotiques' });
  await expect(antibiotiques.locator('summary')).toContainText('36');
  await antibiotiques.locator('summary').click();
  await expect(antibiotiques.getByRole('button', { name: 'Amikacine' })).toBeVisible();
  await expect(antibiotiques.getByRole('button', { name: 'Téicoplanine' })).toHaveCount(0);
  await filter.uncheck();
  await expect(families).toHaveCount(9);
});


test('Beta-lactam PK/PD card separates optimal fT>MIC from practical trough and conditional dose linearity', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('cefepime');
  const pk = page.getByTestId('tdm-pk-summary');
  await expect(pk).toHaveCount(1);
  await expect(pk.getByTestId('tdm-pk-index')).toContainText('fT>CMI');
  await expect(pk.getByTestId('tdm-pk-sample')).toContainText('Cmin');
  await expect(pk.getByTestId('tdm-pk-routes')).toContainText('IV');
  await expect(pk.getByTestId('tdm-pk-admin-mode')).toContainText('prolongée ou continue');
  await expect(pk.getByTestId('tdm-pk-linearity')).toContainText('Conditionnellement');
  await pk.getByTestId('tdm-pk-details').locator('summary').click();
  await expect(pk.getByText(/La résiduelle libre peut étayer/)).toBeVisible();
  await expect(pk.getByText(/AUCτ = F × dose \/ CL/).last()).toBeVisible();
  await expect(pk.getByRole('link', {name:/ACCP.*2026/}).first()).toHaveAttribute('href', /PMC13392062/);
});

test('Vancomycin uses AUC rather than trough-only; aminoglycoside has AUC/peak and safety trough', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('vancomycine');
  await expect(page.getByTestId('tdm-pk-index')).toContainText('AUC₀–₂₄');
  await expect(page.getByTestId('tdm-pk-sample')).toContainText('AUC bayésienne');
  await page.getByTestId('tdm-pk-details').locator('summary').click();
  await expect(page.getByText(/résiduel seul déconseillée/)).toBeVisible();
  await search.fill('amikacine');
  await expect(page.getByTestId('tdm-pk-index')).toContainText('Cmax/CMI');
  await expect(page.getByTestId('tdm-pk-sample')).toContainText('Pic post-perfusion');
});

test('Vori and phenytoin show nonlinear dose/AUC and MPA shows AUC preferred over C0', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('voriconazole');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('Non : PK non linéaire');
  await expect(page.getByTestId('tdm-pk-routes')).toContainText('PO · IV');
  await expect(page.getByTestId('tdm-pk-admin-mode')).toContainText('dose de charge');
  await page.getByTestId('tdm-pk-details').locator('summary').click();
  await expect(page.getByText(/2,5 fois/)).toBeVisible();
  await search.fill('phénytoïne');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('métabolisme saturable');
  await search.fill('MPA');
  await expect(page.getByTestId('tdm-pk-index')).toContainText('AUC₀–₁₂');
  await expect(page.getByTestId('tdm-pk-sample')).toContainText('prélèvements limités');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('sous-proportionnelle');
  await search.fill('évérolimus');
  await expect(page.getByTestId('tdm-pk-index')).toContainText('C0');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('linéaire');
});

test('CHU-only molecules show unassessed PK/PD without guessed routes or dosing rules', async ({ page }) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('ibrutinib');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(0);
  await expect(page.getByTestId('tdm-manual-entry')).toHaveCount(1);
  await expect(page.getByTestId('tdm-manual-entry')).toContainText('non documentés');
  await page.getByTestId('tdm-target-search').fill('méthotrexate');
  await expect(page.getByTestId('tdm-pk-index')).toContainText('H24/H36/H42/H48');
  await expect(page.getByTestId('tdm-pk-routes')).toContainText('IV');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('À documenter');
});

test('PK/PD reference matrix is correctly localised in English', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=en');
  await page.getByTestId('tdm-target-search').fill('voriconazole');
  const pk = page.getByTestId('tdm-pk-summary');
  await expect(pk.getByText('Relevant PK/PD index')).toBeVisible();
  await expect(pk.getByText('Practical sampling')).toBeVisible();
  await expect(pk.getByText('Documented administration')).toBeVisible();
  await expect(pk.getByText('2× dose → 2× AUC?')).toBeVisible();
  await expect(pk.getByTestId('tdm-pk-linearity')).toContainText('No: nonlinear PK');
});


test('Linear PK is formulation- and context-specific: tacrolimus FDA, Neoral FDA, and sublinear MMF cohort', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('tacrolimus');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('proportionnelle');
  await page.getByTestId('tdm-pk-details').locator('summary').click();
  await expect(page.getByText(/3, 7 et 10 mg PO à jeun/)).toBeVisible();
  await expect(page.getByText(/ne garantit donc jamais ×2 AUC/)).toBeVisible();

  await search.fill('ciclosporine');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('Neoral');
  await expect(page.getByTestId('tdm-pk-admin-mode')).toContainText('microémulsion');
  await page.getByTestId('tdm-pk-details').locator('summary').click();
  await expect(page.getByText(/biodisponibilité Neoral/i).first()).toBeVisible();

  await search.fill('MPA');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('sous-proportionnelle');
  await page.getByTestId('tdm-pk-details').locator('summary').click();
  await expect(page.getByText(/0,513.*1,43/)).toBeVisible();
});


test('Gabapentin and pregabalin have opposite oral dose proportionality; digoxin needs postdistribution sampling', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('gabapentine');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('absorption orale saturable');
  await expect(page.getByTestId('tdm-pk-routes')).toContainText('PO');
  await page.getByTestId('tdm-pk-details').locator('summary').click();
  await expect(page.getByText(/≈60 % à 900 mg\/j/)).toBeVisible();

  await search.fill('prégabaline');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('sous conditions');
  await page.getByTestId('tdm-pk-details').locator('summary').click();
  await expect(page.getByText(/biodisponibilité ≥90 % indépendante de la dose/)).toBeVisible();

  await search.fill('lévétiracétam');
  await expect(page.getByTestId('tdm-pk-linearity')).toContainText('plage étudiée');

  await search.fill('digoxine');
  await expect(page.getByTestId('tdm-pk-index')).toContainText('après distribution');
  await expect(page.getByTestId('tdm-pk-sample')).toContainText('≥6 h');
  await expect(page.getByTestId('tdm-pk-admin-mode')).toContainText('biodisponibilité différente');
});


test('AGNP 2026 banner identifies old psychiatric values without claiming replacement', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search=page.getByTestId('tdm-target-search');
  await search.fill('halopéridol');
  const review=page.getByTestId('tdm-agnp-2026-pending');
  await expect(review).toBeVisible();
  await expect(review).toContainText('tableau 5 AGNP 2026');
  await expect(review.getByTestId('tdm-agnp-2026-verified')).toContainText('tableau 5 AGNP 2026');
  await expect(review.getByRole('link')).toHaveAttribute('href','https://pubmed.ncbi.nlm.nih.gov/42392224/');
  await search.fill('clonazépam');
  await expect(page.getByTestId('tdm-agnp-2026-pending')).toContainText('pas encore été vérifiées ni substituées');
  await search.fill('vancomycine');
  await expect(page.getByTestId('tdm-agnp-2026-pending')).toHaveCount(0);
  await page.goto('/pharmacometrie/cibles-tdm/?lang=en');
  await page.getByTestId('tdm-target-search').fill('haloperidol');
  await expect(page.getByTestId('tdm-agnp-2026-verified')).toContainText('original Table 5 range(s) individually checked');
});


test('Primary AGNP 2026 values coexist with older sources and sampling times are unambiguous', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search=page.getByTestId('tdm-target-search');

  await search.fill('halopéridol');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('1–5', {exact:true})).toBeVisible();
  await expect(page.getByText('1–10', {exact:true})).toBeVisible();
  await expect(page.getByText('C₁₂h (12 h après dose)', {exact:true})).toBeVisible();

  await search.fill('trazodone');
  await expect(page.getByText(/650–1.?500/).first()).toBeVisible();

  await search.fill('levomilnacipran');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByText('30–90', {exact:true})).toBeVisible();
  await expect(page.getByText('C₂₄h (24 h après dose)', {exact:true})).toBeVisible();

  await search.fill('lacosamide');
  await expect(page.getByText('1–12', {exact:true})).toBeVisible();
  await search.fill('levetiracetam');
  await expect(page.getByText('6–46', {exact:true})).toBeVisible();

  await search.fill('clozapine');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByTestId('tdm-agnp-2026-verified')).toBeVisible();
});
