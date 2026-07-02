<script>
  import { base } from '$app/paths';
  import OralAbsorption from '$lib/components/visualizations/OralAbsorptionExplorer.svelte';

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
</script>

<section class="hero">
  <p class="eyebrow">Cas pratique</p>
  <h1>Warfarine — construire un modèle PopPK/PD pas à pas</h1>
  <p class="lede">
    Un fil rouge concret : à partir d'un vrai jeu de données warfarine, on construit un modèle de
    population avec <strong>nlmixr2 / rxode2</strong> (R), de la structure la plus simple jusqu'à
    la comparaison de modèles et la PK/PD. Le code est fourni ; l'objectif est <em>pédagogique</em>.
  </p>
  <p class="warn">⚠️ Support d'enseignement uniquement — aucune recommandation posologique clinique.</p>
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
  <p class="note">Un <code>evid</code> distingue les lignes de dose (1) des observations (0). Les covariables sont propagées sur toutes les lignes d'un même patient.</p>
</section>

<section>
  <h2>2 · Modèle structural (le point de départ)</h2>
  <p>On commence par le plus simple : un compartiment, absorption orale d'ordre 1, erreur additive, variabilité inter-individuelle sur CL et V.</p>
  <pre class="code"><code>{structural}</code></pre>
</section>

<section>
  <h2>3 · Ajouter un temps de latence (Tlag)</h2>
  <p>Les profils warfarine montrent un délai avant la montée : on ajoute un <strong>Tlag</strong>. Manipulez ci-dessous l'effet de Ka et Tlag (et comparez au modèle de transit) :</p>
  <div class="viz"><OralAbsorption /></div>
  <pre class="code"><code>{tlag}</code></pre>
</section>

<section>
  <h2>4 · Comparer les modèles</h2>
  <p>On ajuste plusieurs structures et on compare par l'AIC/BIC (plus bas = meilleur compromis ajustement/complexité) et la log-vraisemblance.</p>
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
  <p class="note">Ici <code>r02</code> (1 compartiment + Tlag) l'emporte nettement. Passer à 2 compartiments (<code>r03</code>) <em>dégrade</em> l'AIC : plus complexe n'est pas meilleur. Une erreur combinée (proportionnelle + additive) améliore encore <code>r02</code> — l'AIC/BIC guide, mais ne remplace pas les diagnostics.</p>
</section>

<section>
  <h2>5 · Variabilité, covariables, PK/PD</h2>
  <p>La suite du notebook enchaîne : erreur résiduelle (additive → combinée), covariables (poids sur CL/V par allométrie), diagnostics (obs vs pred, résidus), <strong>VPC</strong>, puis la partie <strong>PK/PD</strong> — l'effet (INR / activité) est relié à la concentration, souvent avec un <em>retard</em> (turnover des facteurs de coagulation).</p>
  <p>Ces étapes reprennent, sur un cas réel, les chapitres du cours : <a href={`${base}/chapitres/variabilite-iiv-iov`}>variabilité</a>, <a href={`${base}/chapitres/allometrie`}>covariables</a>, <a href={`${base}/chapitres/validation-vpc`}>diagnostics/VPC</a>, <a href={`${base}/chapitres/pkpd`}>PK/PD</a>.</p>
</section>

<section>
  <h2>6 · Télécharger le matériel</h2>
  <ul class="dl">
    <li><a href={`${base}/downloads/warfarin/example_warfarin.Rmd`} download>example_warfarin.Rmd</a> — notebook R complet (nlmixr2)</li>
    <li><a href={`${base}/downloads/warfarin/warfarin_pkpd_nlmixr2_EN.ipynb`} download>warfarin_pkpd_nlmixr2_EN.ipynb</a> — version PK/PD (Jupyter)</li>
    <li><a href={`${base}/downloads/warfarin/warfarin_monolix_nlmixr2.ipynb`} download>warfarin_monolix_nlmixr2.ipynb</a> — comparaison Monolix ↔ nlmixr2</li>
    <li><a href={`${base}/downloads/warfarin/warfarin_data.csv`} download>warfarin_data.csv</a> — jeu de données</li>
  </ul>
  <p class="note">Pré-requis R : <code>nlmixr2</code>, <code>rxode2</code>, <code>nlmixr2data</code>, <code>ggplot2</code>, <code>dplyr</code>.</p>
</section>

<style>
  .hero { max-width: 780px; margin-bottom: var(--space-10); }
  .eyebrow { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-pk); }
  h1 { font-size: var(--text-3xl); margin: var(--space-2) 0 var(--space-4); }
  .lede { font-size: var(--text-lg); color: var(--text-secondary); }
  .warn { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent-pk); margin-top: var(--space-4); }
  section { max-width: 820px; margin: 0 auto var(--space-10); }
  h2 { font-size: var(--text-xl); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2); margin-bottom: var(--space-4); }
  p { color: var(--text-secondary); line-height: var(--line-height-body); }
  .note { font-size: var(--text-sm); color: var(--text-muted); border-left: 3px solid var(--border-strong); padding-left: var(--space-3); }
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
  .dl { list-style: none; padding: 0; display: grid; gap: var(--space-2); }
  .dl a { color: var(--accent-pk); font-family: var(--font-mono); font-size: var(--text-sm); }
</style>
