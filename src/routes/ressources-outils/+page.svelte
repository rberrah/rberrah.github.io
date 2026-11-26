<script>
  import { language } from '#lib/stores/language.js';
  $: en = $language === 'en';
  const groups = [
    {fr:'Pharmacométrie et modélisation',en:'Pharmacometrics and modelling',items:[
      {name:'MonolixSuite — Monolix 2024R1',url:'https://monolixsuite.slp-software.com/monolix/2024R1',fr:'Documentation officielle : modèles, estimation SAEM, covariables et diagnostics.',en:'Official documentation: models, SAEM estimation, covariates and diagnostics.',lang:'en'},
      {name:'PMXRepo',url:'https://pmxrepo.com/',fr:'Ressources pratiques de pharmacométrie et exemples de modélisation.',en:'Practical pharmacometrics resources and modelling examples.',lang:'en'}
    ]},
    {fr:'Statistiques et apprentissage automatique',en:'Statistics and machine learning',items:[
      {name:'MLU-Explain',url:'https://mlu-explain.github.io/',fr:'Explications visuelles et interactives du machine learning : régression, classification, biais-variance et métriques.',en:'Interactive visual explanations of machine learning: regression, classification, bias–variance and metrics.',lang:'en'}
    ]},
    {fr:'Autres outils pédagogiques',en:'Other educational tools',items:[
      {name:'UNICA–UBO',url:'https://outils-pedagogique-unica-ubo.netlify.app/',fr:'Portail d’outils pédagogiques proposé en complément du cours.',en:'External educational tools suggested as a complement to the course.',lang:''}
    ]}
  ];
</script>

<svelte:head>
  <meta name="description" content={en?'Selected external learning resources for pharmacometrics, modelling and machine learning.':'Sélection de ressources pédagogiques externes en pharmacométrie, modélisation et apprentissage automatique.'}/>
</svelte:head>

<header class="intro">
  <h1>{en?'Other useful tools':'Autres outils utiles'}</h1>
  <p>{en?'Explore complementary documentation, interactive lessons and educational tools beyond PMx Explain.':'Découvrez des documentations, des cours interactifs et des outils pédagogiques complémentaires à PMx Explain.'}</p>
</header>
<div class="groups">
  {#each groups as group}
    <section>
      <h2>{en?group.en:group.fr}</h2>
      <ul>
        {#each group.items as item}
          <li>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <strong>{item.name}</strong><span aria-hidden="true">↗</span>
              <span class="description">{en?item.en:item.fr}</span>
              {#if item.lang}<small>{en?'English':'Anglais'}</small>{/if}
              <small>{en?'Opens an external site in a new tab':'Site externe, ouvert dans un nouvel onglet'}</small>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>
<p class="note">{en?'These resources are maintained independently. Listing them is not a clinical validation or an endorsement of every method.':'Ces ressources sont maintenues indépendamment. Leur présence ne constitue ni une validation clinique ni une approbation de toutes leurs méthodes.'}</p>

<style>
  .intro,.groups,.note{max-width:860px}
  .intro{margin-bottom:2rem}
  .intro p,.note{color:var(--text-secondary)}
  .groups{display:grid;gap:1.75rem}
  h2{font-size:var(--text-lg);margin-bottom:.8rem}
  ul{list-style:none;padding:0;display:grid;gap:.65rem}
  a{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.35rem .8rem;border:1px solid var(--border-subtle);border-radius:var(--radius);padding:1rem;text-decoration:none;background:var(--bg-secondary);color:var(--text-primary)}
  a:hover,a:focus-visible{border-color:var(--accent-pk)}
  a:focus-visible{outline:2px solid var(--accent-pk);outline-offset:3px}
  .description,small{grid-column:1/-1;color:var(--text-secondary)}
  .note{margin-top:1.5rem;font-size:var(--text-sm)}
</style>
