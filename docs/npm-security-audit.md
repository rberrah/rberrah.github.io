# npm security audit - 2026-10-16

## Result

`npm audit` initially reported 14 vulnerable packages: 6 high, 6 moderate and
2 low. Running `npm audit fix` without `--force`, then removing the unused
`svelte-scroller` and `@sveltejs/adapter-auto` packages, reduced this to 8:
0 critical, 0 high, 4 moderate and 4 low.

Compatible updates removed the advisories affecting `devalue`, the direct
`js-yaml` dependency, `markdown-it`, `linkify-it`, `nanoid`, `postcss` and
`source-map-js`. The lockfile also moved SvelteKit from 2.68.0 to 2.70.3.

## Residual advisories

| Chain | Severity | Exposure in PMx Explain | Decision |
| --- | --- | --- | --- |
| `@sveltejs/adapter-static` -> `@sveltejs/kit` -> `cookie` | Low | GitHub Pages receives a static export; it does not run the SvelteKit Node cookie parser. | Keep the current SvelteKit 2 line. Reassess with a tested SvelteKit 3 and adapter-static 4 migration. |
| `gray-matter` -> `js-yaml` 3 -> `argparse` -> `sprintf-js` | Moderate | Removed on 2026-10-16. PMx now parses its bounded `---` YAML front matter with the already-pinned `js-yaml` 4.x dependency. | Closed; the obsolete dependency chain and `eval` warning are no longer required by PMx. |
| `katex` | Low | Removed on 2026-10-16 by upgrading to KaTeX 0.19.0 after the full PMx qualification passed on the compatibility branch. | Closed; keep browser rendering tests in the release gate. |

The remaining low-severity SvelteKit/cookie advisory requires an application-wide SvelteKit 3 migration. A trial reached zero npm vulnerabilities but correctly failed Svelte type checks because SvelteKit 3 removes legacy `$lib`, `$app/stores` and `$app/paths.base` APIs. That migration is tracked separately in issue #147. The static-export architecture reduces current exploitability but does not erase the upstream advisory. Run `npm audit` again whenever the lockfile changes and before each
release. Do not use `npm audit fix --force` without testing the corresponding
major framework migrations.

The PMx qualification workflow runs `npm audit --audit-level=moderate`; any new moderate, high or critical advisory therefore blocks pull requests and `main` qualification. The only accepted residual advisories are explicitly documented low-severity findings.

## `punycode` warning

The installed tree contains `punycode.js@2.3.1` only through
`markdown-it@14.3.2`. This is the maintained userland package, not Node's
deprecated built-in `punycode` module. `npm ls punycode` returns no package.
If CI emits Node deprecation code `DEP0040` again, capture that job's stack or
run it with `NODE_OPTIONS=--trace-deprecation`; the current dependency tree does
not identify a remaining direct import of the built-in module.
