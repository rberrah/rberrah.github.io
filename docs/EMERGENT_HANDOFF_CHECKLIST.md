# Emergent handoff checklist

Before handing this repository to Emergent, verify:

- [ ] Emergent reads `docs/EMERGENT_CONTEXT.md`.
- [ ] Emergent reads `docs/COURSE_BLUEPRINT.md`.
- [ ] Emergent uses `docs/EMERGENT_PROMPT.md` as the working prompt.
- [ ] Emergent preserves SvelteKit.
- [ ] Emergent preserves static GitHub Pages deployment.
- [ ] Emergent does not add backend, database, authentication, or API calls.
- [ ] Emergent does not embed generated notebook HTML.
- [ ] Emergent converts `course_source/` material into Markdown chapters and Svelte components.
- [ ] Emergent checks the slide catalog against `course_source/slides/pharmacometrie_pratique_grenoble.pptx`.
- [ ] Emergent runs `npm run check`, `npm run validate`, and `npm run build`.

Recommended first Emergent request:

```text
Read docs/EMERGENT_CONTEXT.md, docs/COURSE_BLUEPRINT.md, and docs/EMERGENT_PROMPT.md.
Audit the repository.
Do not rebuild from scratch.
Implement phase 1 only.
```
