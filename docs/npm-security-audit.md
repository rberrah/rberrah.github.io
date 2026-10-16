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
| `gray-matter` -> `js-yaml` 3 -> `argparse` -> `sprintf-js` | Moderate | Front matter is read only from version-controlled chapter files. No patient, visitor or uploaded text is passed to this parser. | Do not apply npm's proposed downgrade to `gray-matter` 2.0.1. Replace or upgrade the parser before accepting untrusted Markdown. |
| `katex` | Low | KaTeX renders version-controlled course formulae with its default untrusted-command policy; visitor input is not rendered through this path. | Test the KaTeX 0.19 major update separately rather than forcing it into this security patch. |

These constraints reduce current exploitability but do not erase the upstream
advisories. Run `npm audit` again whenever the lockfile changes and before each
release. Do not use `npm audit fix --force` without testing the corresponding
major framework migrations.

## `punycode` warning

The installed tree contains `punycode.js@2.3.1` only through
`markdown-it@14.3.2`. This is the maintained userland package, not Node's
deprecated built-in `punycode` module. `npm ls punycode` returns no package.
If CI emits Node deprecation code `DEP0040` again, capture that job's stack or
run it with `NODE_OPTIONS=--trace-deprecation`; the current dependency tree does
not identify a remaining direct import of the built-in module.
