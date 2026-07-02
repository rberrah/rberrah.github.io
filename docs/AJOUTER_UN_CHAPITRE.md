# Ajouter ou éditer un chapitre

> Le plus simple : copier `src/content/chapters/_TEMPLATE.md`, le renommer, écrire.
> Rien d'autre à configurer — la visualisation et l'URL de build sont détectées
> automatiquement.

## En 3 étapes

1. **Copier le modèle** vers un nouveau fichier numéroté :
   ```sh
   cp src/content/chapters/_TEMPLATE.md src/content/chapters/22_mon-sujet.md
   ```
   Les fichiers préfixés par `_` sont ignorés au build : `_TEMPLATE.md`
   n'apparaît jamais en ligne, et vous pouvez garder des brouillons
   (`_wip-xxx.md`) à côté des chapitres publiés.

2. **Remplir le frontmatter** (obligatoire : `id`, `slug`, `title`, `order`) :
   ```yaml
   ---
   id: "mon-sujet"
   slug: "mon-sujet"          # -> URL /chapitres/mon-sujet/
   title: "Titre lisible"
   description: "L'angle en une phrase."
   order: 22                  # ordre d'affichage croissant
   tags: ["pk"]
   slides: []                 # IDs du slide_catalog (optionnel)
   quiz:                      # checkpoint de fin (optionnel)
     - prompt: "Une question ?"
       options: ["A", "B", "C"]
       correct: 1             # index base 0
   ---
   ```

3. **Écrire le corps** en blocs `step` (une idée par step) :
   ```markdown
   <!-- step:title="Ka vs Tlag" viz="09_PK1C" -->
   Texte Markdown : intuition, équation, piège, enjeu clinique.

   $$ C_0 = \dfrac{\text{Dose}}{V}\ [\text{mg/L}] $$
   <!-- /step -->
   ```

C'est tout. **Plus besoin** d'éditer `vizMap` ni `svelte.config.js` :
- les visualisations sont enregistrées automatiquement (voir plus bas) ;
- l'URL du chapitre est ajoutée automatiquement au prerender via
  `src/routes/chapitres/[slug]/+page.js`.

## Visualisations (`viz="…"`)

Tout composant `.svelte` déposé dans `src/lib/components/visualizations/` est
disponible immédiatement. Chaque fichier accepte plusieurs noms :

| Fichier | Clés acceptées dans `viz="…"` |
|---|---|
| `09_PK1C.svelte` | `09_PK1C`, `PK1C` |
| `IVBolusExplorer.svelte` | `IVBolusExplorer`, `IVBolus` |
| `14_AllometryCentering.svelte` | `14_AllometryCentering`, `AllometryCentering` |

En cas de faute de frappe, la page de chapitre affiche la liste des clés
disponibles à la place de la figure.

Une viz posée sur un step **persiste** tant qu'un step suivant n'en déclare pas
une autre : on peut commenter longuement une même figure sur plusieurs steps.

## Encadrés pédagogiques

Pour structurer les explications, utilisez la syntaxe `:::type … :::` :

```markdown
:::pitfall
L'erreur classique à éviter.
:::

:::key
La phrase à retenir.
:::

:::clinical
Pourquoi ça compte au lit du patient.
:::
```

Types disponibles : `pitfall` (Piège), `key` (À retenir), `clinical`
(En clinique), `note` (Note), `math` (Côté maths). Le Markdown et les équations
KaTeX fonctionnent à l'intérieur.

## Équations

D�limiteurs : `$ … $` (inline), `$$ … $$` (bloc), `\( … \)`, `\[ … \]`.
Dans `\text{}`, préférer `\cdot` au caractère `·`.

## Pistes (tracks)

Par défaut **Core**. Pour la piste **IA**, ajouter le slug dans `aiSlugs` de
`src/lib/content/tracks.js`.

## Vérifier

```sh
npm run validate
npm run check
npm run build
```

L'ordre d'affichage suit `order` croissant ; le `slug` devient l'URL.

## Barème de qualité (viser le chapitre 01)

Pour chaque idée : **intuition en clair → équation commentée terme à terme →
piège → enjeu clinique**. Une figure interactive par idée quand c'est possible.
Éviter les équations en texte brut : toujours les passer en KaTeX.
