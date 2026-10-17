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
| `@sveltejs/adapter-static` -> `@sveltejs/kit` -> `cookie` | Low | Removed by the qualified SvelteKit 3 / adapter-static 4 migration. | Closed; the committed lockfile reports 0 known npm vulnerabilities. |
| `gray-matter` -> `js-yaml` 3 -> `argparse` -> `sprintf-js` | Moderate | Removed on 2026-10-16. PMx now parses its bounded `---` YAML front matter with the already-pinned `js-yaml` 4.x dependency. | Closed; the obsolete dependency chain and `eval` warning are no longer required by PMx. |
| `katex` | Low | Removed on 2026-10-16 by upgrading to KaTeX 0.19.0 after the full PMx qualification passed on the compatibility branch. | Closed; keep browser rendering tests in the release gate. |

The SvelteKit 3 migration is now implemented with adapter-static 4, Vite 8 and TypeScript 6. The committed lockfile reports **0 known npm vulnerabilities**, and PMx qualification now fails on advisories at **low** severity or above. Run `npm audit --audit-level=low` whenever the lockfile changes and before each release; do not use `npm audit fix --force` or `--legacy-peer-deps` to bypass framework compatibility checks.

The PMx qualification workflow runs `npm audit --audit-level=moderate`; any new moderate, high or critical advisory therefore blocks pull requests and `main` qualification. The only accepted residual advisories are explicitly documented low-severity findings.

## `punycode` warning

The installed tree contains `punycode.js@2.3.1` only through
`markdown-it@14.3.2`. This is the maintained userland package, not Node's
deprecated built-in `punycode` module. `npm ls punycode` returns no package.
If CI emits Node deprecation code `DEP0040` again, capture that job's stack or
run it with `NODE_OPTIONS=--trace-deprecation`; the current dependency tree does
not identify a remaining direct import of the built-in module.
