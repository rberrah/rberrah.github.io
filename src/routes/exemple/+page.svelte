<script>
  import { base } from '$app/paths';
  import OralAbsorption from '$lib/components/visualizations/OralAbsorptionExplorer.svelte';
  import WarfarinFit from '$lib/components/visualizations/60_WarfarinFit.svelte';
  import VPC from '$lib/components/visualizations/17_VPCCrashTest.svelte';
  import NPDE from '$lib/components/visualizations/52_NPDE.svelte';
  import PopDistrib from '$lib/components/visualizations/03_PopulationDistrib.svelte';
  import ModelSelection from '$lib/components/visualizations/59_ModelSelection.svelte';

  const compare = [
    { id: 'r01', desc: '1 compartiment, sans Tlag', aic: 899.6, bic: 927.8, ll: -441.8, best: false },
    { id: 'r02', desc: '1 compartiment + Tlag', aic: 781.8, bic: 817.1, ll: -380.9, best: true },
    { id: 'r03', desc: '2 compartiments + Tlag', aic: 817.1, bic: 859.4, ll: -396.5, best: false }
  ];

  const structural = `# Modèle structural PK — 1 compartiment, absorption orale (nlmixr2)
pk_1cmt <- function() {
  ini({
    tka <- log(1.0)   # constante d'absorption Ka (log)
    tcl <- log(0.13)  # clairance CL (log)
    tv  <- log(8.0)   # volume V (log)
    eta.cl ~ 0.1      # variabilité inter-individuelle sur CL
    eta.v  ~ 0.1
    add.err <- 0.7    # erreur résiduelle additive
  })
  model({
    ka <- exp(tka)
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv  + eta.v)
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (cl / v) * centr
    cp = centr / v
    cp ~ add(add.err)
  })
}
fit_r01 <- nlmixr(pk_1cmt, dat_pk, est = "saem")`;

  const tlag = `# Ajout d'un temps de latence Tlag (retard avant absorption)
  model({
    ka  <- exp(tka)
    tlag <- exp(tlag_l)
    cl  <- exp(tcl + eta.cl)
    v   <- exp(tv  + eta.v)
    lag(depot) = tlag           # <-- décale le début de l'absorption
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (cl / v) * centr
    cp = centr / v
    cp ~ add(add.err)
  })`;

  const errcov = `# Erreur combinée (additive + proportionnelle) et covariable poids
  ini({ ... ; add.err <- 0.3 ; prop.err <- 0.1 ; cl.wt <- 0.75 })
  model({
    cl <- exp(tcl + cl.wt * log(WT/70) + eta.cl)  # allométrie centrée à 70 kg
    v  <- exp(tv  +  1.0  * log(WT/70) + eta.v)
    ...
    cp ~ add(add.err) + prop(prop.err)            # erreur combinée
  })`;
</script>

<section class="hero">
  <p class="eyebrow">Cas pratique</p>
  <h1>Warfarine — un modèle PopPK/PD, de la donnée aux diagnostics</h1>
  <p class="lede">
    Un fil rouge complet : à partir d'un vrai jeu de données warfarine, on suit <strong>toute la démarche</strong> de
    modélisation de population avec <strong>nlmixr2 / rxode2</strong> (R) — explorer, construire, estimer,
    <strong>diagnostiquer</strong>, comparer — comme dans un projet réel. Le code est fourni.
  </p>
  <p class="warn">⚠️ Support d'enseignement uniquement — aucune recommandation posologique clinique.</p>
  <p class="steps-map">
    Données → exploration → modèle structural → modèle statistique → estimation (SAEM) → <strong>diagnostics (GoF)</strong> → comparaison → covariables/PK-PD
  </p>
</section>

<section>
  <h2>1 · Le jeu de données</h2>
  <p>Format « long » de population, une ligne par événement (dose ou observation). Colonnes typiques :</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Colonne</th><th>Signification</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>identifiant patient</td></tr>
        <tr><td><code>time</code></td><td>temps (h)</td></tr>
        <tr><td><code>amt</code></td><td>dose administrée (mg) — ligne d'administration</td></tr>
        <tr><td><code>dv</code></td><td>observation (concentration PK ou effet PD)</td></tr>
        <tr><td><code>dvid</code></td><td>type d'observation : 1 = PK, 2 = PD</td></tr>
        <tr><td><code>wt, sex, age</code></td><td>covariables (poids, sexe, âge)</td></tr>
      </tbody>
    </table>
  </div>
  <p class="note">Jeu de données warfarine classique, inspiré de l'exemple <a href="https://monolixsuite.slp-software.com/monolix/2024R1/warfarin-data-set" target="_blank" rel="noopener noreferrer">Monolix ↗</a> (dose orale unique, PK puis PD). Un <code>evid</code> distingue les lignes de dose des observations ; les covariables sont propagées sur tout le patient.</p>
</section>

<section>
  <h2>2 · Explorer les données</h2>
  <p>Avant tout modèle, on <strong>regarde</strong>. Ci-dessous, les <strong>251 vraies observations</strong> (32 sujets) du jeu de données : forme (montée puis descente), dispersion entre patients, points extrêmes. Ajustez le modèle à 1 compartiment pour qu'il traverse le nuage réel.</p>
  <div class="viz"><WarfarinFit initialMode="time" /></div>
  <p class="cap">Chaque point est une concentration mesurée réelle. La dispersion du faisceau annonce la <strong>variabilité inter-individuelle</strong> ; le curseur <strong>RMSE</strong> chiffre l'écart entre la courbe typique et les données.</p>
</section>

<section>
  <h2>3 · Modèle structural (le squelette)</h2>
  <p>On commence par le plus simple : un compartiment, absorption orale d'ordre 1. C'est la partie déterministe — le patient « typique ».</p>
  <pre class="code"><code>{structural}</code></pre>
</section>

<section>
  <h2>4 · Absorption : temps de latence (Tlag)</h2>
  <p>Les profils warfarine montrent un délai avant la montée : on ajoute un <strong>Tlag</strong>. Manipulez Ka et Tlag (et comparez aux compartiments de transit) :</p>
  <div class="viz"><OralAbsorption /></div>
  <pre class="code"><code>{tlag}</code></pre>
</section>

<section>
  <h2>5 · Modèle statistique + estimation</h2>
  <p>On ajoute la <strong>variabilité inter-individuelle</strong> (η sur CL, V, log-normale) et un <strong>modèle d'erreur résiduelle</strong>. Les paramètres sont estimés par l'algorithme <strong>SAEM</strong> (maximum de vraisemblance), qui alterne simulation des effets individuels et mise à jour des paramètres de population.</p>
  <pre class="code"><code>{errcov}</code></pre>
  <p class="note">Le choix additive → combinée se juge ensuite sur le graphique <code>|IWRES| vs PRED</code> (voir diagnostics).</p>
</section>

<section>
  <h2>6 · Diagnostics — les graphiques de qualité d'ajustement</h2>
  <p>C'est l'étape clé : le modèle est-il fiable ? On <strong>croise plusieurs graphiques</strong>, chacun révélant un défaut différent. (Détails dans le parcours <a href={`${base}/chapitres/valid-diagnostics`}>Validation</a>.)</p>

  <div class="diag">
    <h3>a · Observations vs prédictions (données réelles)</h3>
    <div class="viz"><WarfarinFit initialMode="gof" /></div>
    <p class="cap">Chaque point : une <strong>vraie observation</strong> warfarine placée en (prédiction du modèle, valeur mesurée). Un bon modèle aligne le nuage sur la <strong>diagonale</strong>. Ajustez CL/V/Ka/Tlag : le nuage se resserre autour de la diagonale quand l'ajustement s'améliore.</p>
  </div>

  <div class="diag">
    <h3>b · VPC — le test prédictif visuel</h3>
    <div class="viz"><VPC /></div>
    <p class="cap">Les percentiles <strong>observés</strong> doivent tomber dans les <strong>bandes simulées</strong>. Médiane hors bande = défaut de structure ; extrêmes trop serrés = variabilité sous-estimée. <em>(Schéma interactif : la VPC/NPDE se construit par simulation du modèle ajusté — les valeurs réelles sont dans le notebook.)</em></p>
  </div>

  <div class="diag">
    <h3>c · NPDE — résidus par simulation</h3>
    <div class="viz"><NPDE /></div>
    <p class="cap">Si le modèle est correct, les <strong>NPDE</strong> suivent une loi normale standard N(0,1). Un décalage de moyenne ou un étalement trahit une mauvaise spécification (souvent une covariable manquante).</p>
  </div>

  <div class="diag">
    <h3>d · Distribution des effets aléatoires (η)</h3>
    <div class="viz"><PopDistrib /></div>
    <p class="cap">La distribution des <strong>η</strong> doit être centrée sur 0 et à peu près symétrique. Une bosse à part suggère une sous-population (phénotype) non modélisée ; tracer <strong>η vs covariables</strong> révèle les covariables manquantes.</p>
  </div>
</section>

<section>
  <h2>7 · Comparer les modèles (diagnostics numériques)</h2>
  <p>Les graphiques disent <em>comment</em> un modèle se trompe ; les nombres disent <em>lequel</em> choisir. On compare l'<strong>OFV</strong> (−2 log L), et via le test du <strong>χ²</strong> (modèles emboîtés) ou l'<strong>AIC/BIC</strong> (pénalisés). Détails : <a href={`${base}/chapitres/valid-objective`}>Diagnostics numériques</a>.</p>
  <div class="viz"><ModelSelection /></div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Modèle</th><th>Structure</th><th>AIC</th><th>BIC</th><th>logLik</th></tr></thead>
      <tbody>
        {#each compare as m}
          <tr class:best={m.best}>
            <td><code>{m.id}</code></td><td>{m.desc}</td>
            <td>{m.aic.toFixed(1)}</td><td>{m.bic.toFixed(1)}</td><td>{m.ll.toFixed(1)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="note">Ajouter le Tlag (<code>r01</code>→<code>r02</code>) fait chuter l'AIC de ~118 points : largement significatif. Passer à 2 compartiments (<code>r03</code>) <em>dégrade</em> l'AIC : plus complexe n'est pas meilleur. L'AIC/BIC guide, mais ne remplace pas les diagnostics graphiques.</p>
</section>

<section>
  <h2>8 · Covariables & PK/PD</h2>
  <p>La suite du notebook enchaîne : <strong>covariables</strong> (poids sur CL/V par allométrie, cf. le code section 5), puis la partie <strong>PK/PD</strong> — l'effet (INR / activité) est relié à la concentration, souvent avec un <em>retard</em> (turnover des facteurs de coagulation).</p>
  <p>Ces étapes reprennent, sur un cas réel, les chapitres du cours : <a href={`${base}/chapitres/variabilite-iiv-iov`}>variabilité</a>, <a href={`${base}/chapitres/allometrie`}>covariables</a>, <a href={`${base}/chapitres/valid-diagnostics`}>diagnostics</a>, <a href={`${base}/chapitres/validation-vpc`}>VPC</a>, <a href={`${base}/chapitres/pkpd`}>PK/PD</a>.</p>
</section>

<section>
  <h2>9 · Télécharger le matériel</h2>
  <ul class="dl">
    <li><a href={`${base}/downloads/warfarin/example_warfarin.Rmd`} download>example_warfarin.Rmd</a> — notebook R complet (nlmixr2)</li>
    <li><a href={`${base}/downloads/warfarin/warfarin_pkpd_nlmixr2_EN.ipynb`} download>warfarin_pkpd_nlmixr2_EN.ipynb</a> — version PK/PD (Jupyter)</li>
    <li><a href={`${base}/downloads/warfarin/warfarin_monolix_nlmixr2.ipynb`} download>warfarin_monolix_nlmixr2.ipynb</a> — comparaison Monolix ↔ nlmixr2</li>
    <li><a href={`${base}/downloads/warfarin/warfarin_data.csv`} download>warfarin_data.csv</a> — jeu de données</li>
  </ul>
  <p class="note">Pré-requis R : <code>nlmixr2</code>, <code>rxode2</code>, <code>nlmixr2data</code>, <code>ggplot2</code>, <code>dplyr</code>.</p>
</section>

<style>
  .hero { max-width: 820px; margin-bottom: var(--space-10); }
  .eyebrow { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-pk); }
  h1 { font-size: var(--text-3xl); margin: var(--space-2) 0 var(--space-4); }
  .lede { font-size: var(--text-lg); color: var(--text-secondary); }
  .warn { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent-pk); margin-top: var(--space-4); }
  .steps-map { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-4); padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius); line-height: 1.7; }
  .steps-map strong { color: var(--accent-pd); }
  section { max-width: 820px; margin: 0 auto var(--space-10); }
  h2 { font-size: var(--text-xl); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2); margin-bottom: var(--space-4); }
  h3 { font-size: var(--text-base); margin: var(--space-6) 0 var(--space-2); color: var(--text-primary); }
  p { color: var(--text-secondary); line-height: var(--line-height-body); }
  .note { font-size: var(--text-sm); color: var(--text-muted); border-left: 3px solid var(--border-strong); padding-left: var(--space-3); }
  .cap { font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-2); }
  .code { background: #1a1f2b; color: #e6edf3; border-radius: var(--radius); padding: var(--space-4); overflow-x: auto; font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.55; }
  .code code { white-space: pre; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); margin: var(--space-2) 0; }
  th, td { text-align: left; padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--border-subtle); }
  th { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
  td code, p code { font-family: var(--font-mono); font-size: 0.9em; background: var(--bg-secondary); padding: 0.05em 0.35em; border-radius: 4px; }
  tr.best { background: color-mix(in srgb, var(--accent-pd) 12%, transparent); }
  tr.best td:first-child code { color: var(--accent-pd); }
  .viz { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: var(--space-5); margin: var(--space-4) 0; }
  .diag { margin-bottom: var(--space-8); }
  .dl { list-style: none; padding: 0; display: grid; gap: var(--space-2); }
  .dl a { color: var(--accent-pk); font-family: var(--font-mono); font-size: var(--text-sm); }
  a { color: var(--accent-pk); }
</style>
