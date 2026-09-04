<script>
  import { base } from '$app/paths';
  import WarfarinFit from '$lib/components/visualizations/60_WarfarinFit.svelte';
  import ResidualError from '$lib/components/visualizations/61_ResidualError.svelte';
  import VPC from '$lib/components/visualizations/17_VPCCrashTest.svelte';
  import NPDE from '$lib/components/visualizations/52_NPDE.svelte';
  import ModelSelection from '$lib/components/visualizations/59_ModelSelection.svelte';
  import { language } from '$lib/stores/language';

  const compare = [
    { id: 'r01', desc: '1 compartiment, sans Tlag', aic: 899.6, bic: 927.8, ll: -441.8, best: false },
    { id: 'r02', desc: '1 compartiment + Tlag', aic: 781.8, bic: 817.1, ll: -380.9, best: true },
    { id: 'r03', desc: '2 compartiments + Tlag', aic: 817.1, bic: 859.4, ll: -396.5, best: false }
  ];

  /** @param {{id:string, desc:string}} model */
  const compareDescription = (model) => $language === 'en'
    ? (/** @type {Record<string, string>} */ ({ r01: '1 compartment, no Tlag', r02: '1 compartment + Tlag', r03: '2 compartments + Tlag' })[model.id] ?? model.desc)
    : model.desc;

  const structural = `# Modèle structural PK — 1 compartiment, absorption orale + Tlag (nlmixr2)
pk_1cmt <- function() {
  ini({
    tka  <- log(0.9)   # constante d'absorption Ka
    tcl  <- log(0.135) # clairance CL
    tv   <- log(8.0)   # volume V
    tlag <- log(0.8)   # temps de latence
    eta.cl ~ 0.1       # variabilité inter-individuelle sur CL
    eta.v  ~ 0.1
    add.err <- 0.7     # erreur résiduelle
  })
  model({
    ka <- exp(tka); cl <- exp(tcl + eta.cl); v <- exp(tv + eta.v)
    lag(depot) = exp(tlag)               # retard avant absorption
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (cl / v) * centr
    cp = centr / v
    cp ~ add(add.err)
  })
}
fit <- nlmixr(pk_1cmt, dat_pk, est = "saem")`;

  const structuralEn = `# Structural PK model — 1 compartment, oral absorption + Tlag (nlmixr2)
pk_1cmt <- function() {
  ini({
    tka  <- log(0.9)   # absorption rate constant Ka
    tcl  <- log(0.135) # clearance CL
    tv   <- log(8.0)   # volume V
    tlag <- log(0.8)   # lag time
    eta.cl ~ 0.1       # interindividual variability on CL
    eta.v  ~ 0.1
    add.err <- 0.7     # residual error
  })
  model({
    ka <- exp(tka); cl <- exp(tcl + eta.cl); v <- exp(tv + eta.v)
    lag(depot) = exp(tlag)
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (cl / v) * centr
    cp = centr / v
    cp ~ add(add.err)
  })
}
fit <- nlmixr(pk_1cmt, dat_pk, est = "saem")`;

  const errmodel = `# Modèle d'erreur résiduelle : trois choix
cp ~ add(add.err)                    # additive     : bruit de largeur constante
cp ~ prop(prop.err)                  # proportionnelle : %CV constant
cp ~ add(add.err) + prop(prop.err)   # combinée     : plancher additif + pourcentage`;

  const errmodelEn = `# Residual error model: three options
cp ~ add(add.err)                    # additive: constant-width noise
cp ~ prop(prop.err)                  # proportional: constant %CV
cp ~ add(add.err) + prop(prop.err)   # combined: additive floor + percentage`;

  const errcov = `# Covariable poids (allométrie centrée à 70 kg) + erreur combinée
  model({
    cl <- exp(tcl + 0.75 * log(WT/70) + eta.cl)  # exposant allométrique 0,75
    v  <- exp(tv  + 1.00 * log(WT/70) + eta.v)
    ...
    cp ~ add(add.err) + prop(prop.err)
  })`;

  const errcovEn = `# Weight covariate (allometry centered at 70 kg) + combined error
  model({
    cl <- exp(tcl + 0.75 * log(WT/70) + eta.cl)  # allometric exponent 0.75
    v  <- exp(tv  + 1.00 * log(WT/70) + eta.v)
    ...
    cp ~ add(add.err) + prop(prop.err)
  })`;
</script>

<section class="hero">
  <p class="eyebrow">{$language === 'en' ? 'Case study' : 'Cas pratique'}</p>
  <h1>{$language === 'en' ? 'Warfarin — a PopPK model, from data to diagnostics' : 'Warfarine — un modèle PopPK, de la donnée aux diagnostics'}</h1>
  {#if $language === 'en'}
    <p class="lede">A complete workflow using a <strong>real warfarin dataset</strong> (251 observations, 32 subjects): explore, fit manually, choose an error model, estimate with <strong>nlmixr2</strong> (R), <strong>diagnose</strong>, and compare, as in a real project.</p>
    <p class="warn">Teaching material only — no clinical dosage recommendation.</p>
    <p class="steps-map">Data → exploration → structural model → <strong>residual error</strong> → statistical model → estimation (SAEM) → <strong>diagnostics</strong> → comparison</p>
  {:else}
    <p class="lede">Un fil rouge complet sur un <strong>vrai jeu de données warfarine</strong> (251 observations, 32 sujets) : explorer, ajuster à la main, choisir un modèle d'erreur, estimer avec <strong>nlmixr2</strong> (R), <strong>diagnostiquer</strong> et comparer — comme dans un projet réel.</p>
    <p class="warn">Support d'enseignement uniquement — aucune recommandation posologique clinique.</p>
    <p class="steps-map">Données → exploration → modèle structural → <strong>erreur résiduelle</strong> → modèle statistique → estimation (SAEM) → <strong>diagnostics</strong> → comparaison</p>
  {/if}
</section>

<section>
  <h2>{$language === 'en' ? '1 · Dataset' : '1 · Le jeu de données'}</h2>
  <p>{$language === 'en' ? 'Population data in long format, with one row per event (dose or observation). Typical columns:' : 'Format « long » de population, une ligne par événement (dose ou observation). Colonnes typiques :'}</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>{$language === 'en' ? 'Column' : 'Colonne'}</th><th>{$language === 'en' ? 'Meaning' : 'Signification'}</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>{$language === 'en' ? 'patient identifier' : 'identifiant patient'}</td></tr>
        <tr><td><code>time</code></td><td>{$language === 'en' ? 'time (h)' : 'temps (h)'}</td></tr>
        <tr><td><code>amt</code></td><td>{$language === 'en' ? 'administered dose (mg)' : 'dose administrée (mg)'}</td></tr>
        <tr><td><code>dv</code></td><td>{$language === 'en' ? 'observation (PK concentration or PD effect)' : 'observation (concentration PK ou effet PD)'}</td></tr>
        <tr><td><code>dvid</code></td><td>{$language === 'en' ? 'type: 1 = PK, 2 = PD' : 'type : 1 = PK, 2 = PD'}</td></tr>
        <tr><td><code>wt, sex, age</code></td><td>{$language === 'en' ? 'covariates' : 'covariables'}</td></tr>
      </tbody>
    </table>
  </div>
  <p class="note">{$language === 'en' ? 'Classic dataset based on the' : "Jeu de données classique, inspiré de l'exemple"} <a href="https://monolixsuite.slp-software.com/monolix/2024R1/warfarin-data-set" target="_blank" rel="noopener noreferrer">Monolix ↗</a> {$language === 'en' ? 'example (single oral dose, PK then PD).' : '(dose orale unique, PK puis PD).'}</p>
</section>

<section>
  <h2>{$language === 'en' ? '2 · Explore the data and fit the model' : '2 · Explorer les données et ajuster le modèle'}</h2>
  {#if $language === 'en'}
    <p>Start by <strong>looking</strong> at the <strong>251 real observations</strong> below. Then manually fit a one-compartment model (absorption <strong>Ka</strong>, lag <strong>Tlag</strong>, clearance <strong>CL</strong>, volume <strong>V</strong>) so the curve crosses the point cloud; <strong>RMSE</strong> quantifies the difference. Switch to <em>Observed vs predicted</em> to inspect the same fit differently.</p>
  {:else}
    <p>Avant tout, on <strong>regarde</strong> : les <strong>251 vraies observations</strong> ci-dessous. Puis on ajuste à la main un modèle 1 compartiment (absorption <strong>Ka</strong>, latence <strong>Tlag</strong>, clairance <strong>CL</strong>, volume <strong>V</strong>) pour que la courbe traverse le nuage — le <strong>RMSE</strong> chiffre l'écart. Basculez en <em>Obs vs préd</em> pour voir le même ajustement autrement.</p>
  {/if}
  <div class="viz"><WarfarinFit initialMode="time" /></div>
  <p class="cap">{$language === 'en' ? 'Each point is a real measured concentration. The spread indicates the' : 'Chaque point est une concentration réelle mesurée. La dispersion du faisceau annonce la'} <strong>{$language === 'en' ? 'interindividual variability' : 'variabilité inter-individuelle'}</strong> {$language === 'en' ? 'that must be modeled (chapter' : 'à modéliser (chapitre'} <a href={`${base}/chapitres/variabilite-iiv-iov`}>{$language === 'en' ? 'variability' : 'variabilité'}</a>).</p>
</section>

<section>
  <h2>{$language === 'en' ? '3 · Structural model (code)' : '3 · Le modèle structural (le code)'}</h2>
  <p>{$language === 'en' ? 'The deterministic structure corresponding to the fit above: one compartment, first-order oral absorption, and lag time.' : "Le squelette déterministe correspondant à l'ajustement ci-dessus : un compartiment, absorption orale d'ordre 1, temps de latence."}</p>
  <pre class="code"><code>{$language === 'en' ? structuralEn : structural}</code></pre>
</section>

<section>
  <h2>{$language === 'en' ? '4 · Residual error' : "4 · L'erreur résiduelle"}</h2>
  {#if $language === 'en'}
    <p>The prediction never crosses every point exactly: <strong>residual noise</strong> remains from assays, timing, and unmodeled sources. Its shape matters. Around the curve, the ±1.96·SD band should contain approximately <strong>95%</strong> of real points. Test the three error models:</p>
  {:else}
    <p>La prédiction ne passe jamais exactement par les points : il reste un <strong>bruit résiduel</strong> (dosage, temps, non-modélisé). Sa forme compte. Autour de la courbe, la bande à ±1,96·SD doit contenir ≈ <strong>95 %</strong> des vrais points — testez les trois modèles d'erreur :</p>
  {/if}
  <div class="viz"><ResidualError /></div>
  {#if $language === 'en'}
    <p class="cap"><strong>Additive</strong>: constant width, useful at low concentration. <strong>Proportional</strong>: widens with the prediction, useful at high concentration. <strong>Combined</strong>: both, often the best compromise. See <a href={`${base}/chapitres/erreur-residuelle`}>Residual error</a>.</p>
  {:else}
    <p class="cap"><strong>Additive</strong> : largeur constante (bien à basse concentration). <strong>Proportionnelle</strong> : s'élargit avec la prédiction (bien à haute). <strong>Combinée</strong> : les deux — souvent le meilleur compromis. Détails : chapitre <a href={`${base}/chapitres/erreur-residuelle`}>L'erreur résiduelle</a>.</p>
  {/if}
  <pre class="code"><code>{$language === 'en' ? errmodelEn : errmodel}</code></pre>
</section>

<section>
  <h2>{$language === 'en' ? '5 · Statistical model + estimation (SAEM)' : '5 · Modèle statistique + estimation (SAEM)'}</h2>
  {#if $language === 'en'}
    <p>Add <strong>interindividual variability</strong> (log-normal η on CL and V) and, when useful, a <strong>covariate</strong> (allometric weight effect on CL/V). <strong>SAEM</strong> estimates the parameters by maximum likelihood, alternating simulation of individual effects and population-parameter updates.</p>
  {:else}
    <p>On ajoute la <strong>variabilité inter-individuelle</strong> (η sur CL, V, log-normale) et, si utile, une <strong>covariable</strong> (poids sur CL/V par allométrie). Les paramètres sont estimés par <strong>SAEM</strong> (maximum de vraisemblance), qui alterne simulation des effets individuels et mise à jour des paramètres de population.</p>
  {/if}
  <pre class="code"><code>{$language === 'en' ? errcovEn : errcov}</code></pre>
</section>

<section>
  <h2>{$language === 'en' ? '6 · Diagnostics — goodness-of-fit plots' : "6 · Diagnostics — les graphiques de qualité d'ajustement"}</h2>
  <p>{$language === 'en' ? 'Is the model reliable? Use' : 'Le modèle est-il fiable ? On'} <strong>{$language === 'en' ? 'several complementary plots' : 'croise plusieurs graphiques'}</strong>{$language === 'en' ? ', each revealing a different issue. See the complete' : ', chacun révélant un défaut différent. (Panorama complet : parcours'} <a href={`${base}/chapitres/valid-diagnostics`}>{$language === 'en' ? 'Validation track' : 'Validation'}</a>{$language === 'en' ? '.' : '.)'}</p>

  <div class="diag">
    <h3>{$language === 'en' ? 'a · Observations vs predictions (real data)' : 'a · Observations vs prédictions (données réelles)'}</h3>
    <div class="viz"><WarfarinFit initialMode="gof" /></div>
    {#if $language === 'en'}<p class="cap">Each point is a <strong>real observation</strong> plotted as prediction versus measured value. A good model aligns the cloud with the <strong>diagonal</strong>; adjust CL/V/Ka/Tlag and observe the cloud tighten.</p>{:else}<p class="cap">Chaque point : une <strong>vraie observation</strong> placée en (prédiction, valeur mesurée). Un bon modèle aligne le nuage sur la <strong>diagonale</strong> ; ajustez CL/V/Ka/Tlag et voyez le nuage se resserrer.</p>{/if}
  </div>

  <div class="diag">
    <h3>{$language === 'en' ? 'b · VPC — visual predictive check' : 'b · VPC — le test prédictif visuel'}</h3>
    <div class="viz"><VPC /></div>
    {#if $language === 'en'}<p class="cap"><strong>Observed</strong> percentiles should lie within <strong>simulated bands</strong>. A median outside the band indicates structural misspecification; overly narrow extremes indicate underestimated variability. <em>(Interactive diagram: the VPC is built by simulating the fitted model; real values are in the notebook.)</em></p>{:else}<p class="cap">Les percentiles <strong>observés</strong> doivent tomber dans les <strong>bandes simulées</strong>. Médiane hors bande = défaut de structure ; extrêmes trop serrés = variabilité sous-estimée. <em>(Schéma interactif : la VPC se construit par simulation du modèle ajusté — les valeurs réelles sont dans le notebook.)</em></p>{/if}
  </div>

  <div class="diag">
    <h3>{$language === 'en' ? 'c · NPDE — simulation-based residuals' : 'c · NPDE — résidus par simulation'}</h3>
    <div class="viz"><NPDE /></div>
    {#if $language === 'en'}<p class="cap">With a correct model, <strong>NPDE</strong> follow a standard normal distribution N(0,1). A shifted mean or incorrect spread indicates misspecification, often a missing covariate. <em>(Illustrative diagram.)</em></p>{:else}<p class="cap">Si le modèle est correct, les <strong>NPDE</strong> suivent une loi normale standard N(0,1). Un décalage de moyenne ou un étalement trahit une mauvaise spécification (souvent une covariable manquante). <em>(Schéma illustratif.)</em></p>{/if}
  </div>
</section>

<section>
  <h2>{$language === 'en' ? '7 · Compare models (numerical diagnostics)' : '7 · Comparer les modèles (diagnostics numériques)'}</h2>
  {#if $language === 'en'}<p>Plots show <em>how</em> a model is wrong; numbers help decide <em>which</em> model to select. Compare <strong>OFV</strong> (−2 log L) using the <strong>χ²</strong> test for nested models or penalized <strong>AIC/BIC</strong>. See <a href={`${base}/chapitres/valid-objective`}>Numerical diagnostics</a>.</p>{:else}<p>Les graphiques disent <em>comment</em> un modèle se trompe ; les nombres disent <em>lequel</em> choisir. On compare l'<strong>OFV</strong> (−2 log L) via le test du <strong>χ²</strong> (modèles emboîtés) ou l'<strong>AIC/BIC</strong> (pénalisés). Détails : <a href={`${base}/chapitres/valid-objective`}>Diagnostics numériques</a>.</p>{/if}
  <div class="viz"><ModelSelection /></div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>{$language === 'en' ? 'Model' : 'Modèle'}</th><th>Structure</th><th>AIC</th><th>BIC</th><th>logLik</th></tr></thead>
      <tbody>
        {#each compare as m}
          <tr class:best={m.best}>
            <td><code>{m.id}</code></td><td>{compareDescription(m)}</td>
            <td>{m.aic.toFixed(1)}</td><td>{m.bic.toFixed(1)}</td><td>{m.ll.toFixed(1)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if $language === 'en'}<p class="note">Adding Tlag (<code>r01</code>→<code>r02</code>) lowers AIC by about 118 points, a substantial improvement. Moving to two compartments (<code>r03</code>) <em>worsens</em> AIC: more complex is not necessarily better.</p>{:else}<p class="note">Ajouter le Tlag (<code>r01</code>→<code>r02</code>) fait chuter l'AIC de ~118 points : largement significatif. Passer à 2 compartiments (<code>r03</code>) <em>dégrade</em> l'AIC : plus complexe n'est pas meilleur.</p>{/if}
</section>

<section>
  <h2>{$language === 'en' ? '8 · Summary and next steps' : '8 · Bilan & pour aller plus loin'}</h2>
  {#if $language === 'en'}
    <p>In eight steps, we built a complete PopPK model on real data: exploration → structural model (+ Tlag) → residual error → variability/covariates → estimation → diagnostics → comparison. The <strong>natural next step</strong> is <strong>PK/PD</strong>: linking effect (INR/activity) to concentration, often with a delay from coagulation-factor turnover, and individualizing dose.</p>
    <p>Related chapters: <a href={`${base}/chapitres/erreur-residuelle`}>residual error</a> · <a href={`${base}/chapitres/allometrie`}>covariates</a> · <a href={`${base}/chapitres/valid-diagnostics`}>diagnostics</a> · <a href={`${base}/chapitres/valid-objective`}>OFV/AIC/BIC</a> · <a href={`${base}/chapitres/pkpd`}>PK/PD</a>.</p>
  {:else}
    <p>En huit étapes, on a construit un modèle PopPK complet sur données réelles : exploration → structural (+ Tlag) → erreur résiduelle → variabilité/covariables → estimation → diagnostics → comparaison. La <strong>suite naturelle</strong> est la partie <strong>PK/PD</strong> — relier l'effet (INR / activité) à la concentration, souvent avec un <em>retard</em> (turnover des facteurs de coagulation) — et l'individualisation de dose.</p>
    <p>Chapitres liés : <a href={`${base}/chapitres/erreur-residuelle`}>erreur résiduelle</a> · <a href={`${base}/chapitres/allometrie`}>covariables</a> · <a href={`${base}/chapitres/valid-diagnostics`}>diagnostics</a> · <a href={`${base}/chapitres/valid-objective`}>OFV/AIC/BIC</a> · <a href={`${base}/chapitres/pkpd`}>PK/PD</a>.</p>
  {/if}
</section>

<section>
  <h2>{$language === 'en' ? '9 · Download materials' : '9 · Télécharger le matériel'}</h2>
  <ul class="dl">
    <li><a href={`${base}/downloads/warfarin/example_warfarin.Rmd`} download>example_warfarin.Rmd</a> — {$language === 'en' ? 'complete R notebook (nlmixr2)' : 'notebook R complet (nlmixr2)'}</li>
    <li><a href={`${base}/downloads/warfarin/warfarin_pkpd_nlmixr2_EN.ipynb`} download>warfarin_pkpd_nlmixr2_EN.ipynb</a> — {$language === 'en' ? 'PK/PD version (Jupyter)' : 'version PK/PD (Jupyter)'}</li>
    <li><a href={`${base}/downloads/warfarin/warfarin_monolix_nlmixr2.ipynb`} download>warfarin_monolix_nlmixr2.ipynb</a> — {$language === 'en' ? 'Monolix vs nlmixr2 comparison' : 'comparaison Monolix ↔ nlmixr2'}</li>
    <li><a href={`${base}/downloads/warfarin/warfarin_data.csv`} download>warfarin_data.csv</a> — {$language === 'en' ? 'dataset' : 'jeu de données'}</li>
  </ul>
  <p class="note">{$language === 'en' ? 'R requirements' : 'Pré-requis R'}: <code>nlmixr2</code>, <code>rxode2</code>, <code>nlmixr2data</code>, <code>ggplot2</code>, <code>dplyr</code>.</p>
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
