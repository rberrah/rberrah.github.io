import { test, expect } from '@playwright/test';

/** @param {string} code */
function snapshot(code) {
  const match = code.match(/^(?:;|\/\/) PK_LEGO_SPEC_V1:([^\r\n]+)/m);
  if (!match) throw new Error('Missing embedded Lego specification');
  return /** @type {{nodes: any[], edges: any[]}} */ (JSON.parse(decodeURIComponent(match[1])));
}

/** @param {{nodes: {id: number, name: string}[]}} spec @param {number | undefined} id */
const idName = (spec, id) => spec.nodes.find((node) => node.id === id)?.name.toLowerCase();

for (const preset of ['KOKA (Samtani)', "PP6M (T'jollyn)"]) {
  for (const format of ['mrgsolve', 'MLXTRAN', 'NONMEM']) {
    test(`${preset}: ${format} sans marqueur conserve les voies et les equations`, async ({ page }) => {
      await page.goto('/lego/');
      await page.waitForLoadState('networkidle');
      await page.locator('.toolbar').getByRole('button', { name: preset, exact: true }).click();
      await page.locator('.codehead').getByRole('tab', { name: format, exact: true }).click();
      const code = await page.locator('pre.codeblk code').innerText();
      await expect(page.locator('pre.codeblk code')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      const marker = /^(?:;|\/\/) PK_LEGO_SPEC_V1:([^\r\n]+)/m;
      const original = snapshot(code);
      const importer = page.locator('.mlxtran-import');
      await importer.locator('summary').click();
      await importer.getByRole('tab', { name: format, exact: true }).click();
      await importer.locator('textarea').fill(code.replace(marker, ''));
      await importer.getByRole('button', { name: 'Construire le sch\u00e9ma', exact: true }).click();
      await expect(importer.locator('.import-status')).toContainText('Structure reconnue');
      await expect(page.locator('.canvas .node')).toHaveCount(original.nodes.length);
      await expect(page.locator('.rate')).toHaveCount(original.edges.length);
      await expect(page.locator('.canvas')).not.toContainText('LEGO_INPUT');
      const regenerated = await page.locator('pre.codeblk code').innerText();
      const restored = snapshot(regenerated);
      for (const node of original.nodes) {
        const other = restored.nodes.find((n) => n.name.toLowerCase() === node.name.toLowerCase());
        expect(other.kind).toBe(node.kind);
        expect(other.tlag).toBe(node.tlag);
        expect(other.doseFraction).toBeCloseTo(node.doseFraction, 8);
        expect(idName(restored, other.fractionComplementOf)).toBe(idName(original, node.fractionComplementOf));
        expect(idName(restored, other.inputDurationTlagOf)).toBe(idName(original, node.inputDurationTlagOf));
      }
      await expect(page.locator('.chart .serie').first()).not.toHaveAttribute('d', '');
      await expect(page.locator('.tdm-launch')).toBeEnabled();
      if (format === 'NONMEM' && preset.startsWith('KOKA')) expect(regenerated).toContain('$INPUT ID TIME DV AMT EVID MDV CMT RATE');
    });
  }
}
