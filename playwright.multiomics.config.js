import { defineConfig } from '@playwright/test';
import pmxConfig from './playwright.pmx.config.js';

export default defineConfig({
  ...pmxConfig,
  testIgnore: undefined,
  testMatch: ['multiomics*.spec.js', 'cross-domain-omics-pkpd.spec.js']
});
