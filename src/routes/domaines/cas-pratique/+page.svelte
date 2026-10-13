<script>
  // @ts-nocheck
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  import { simulateOmicsPopPK } from '$lib/cross-domains/omic-pop-pk-synthetic.js';
  import { ArrowLeft, BookOpen, FlaskConical } from '@lucide/svelte';

  let beta = 0.35;
  $: english = $language === 'en';
  $: result = simulateOmicsPopPK({beta:Number(beta),seed:20261013});
  const t=(fr,en)=>english?en:fr;
  const num=(x,d=1)=>new Intl.NumberFormat(english?'en-US':'fr-FR',
    {minimumFractionDigits:d,maximumFractionDigits:d}).format(x);
</script>

<svelte:head>
  <title>{t('Cas pratique — des omiques à la PopPK','Case study — from omics to PopPK')} | PMx Explain</title>
  <meta name="description" content={t(
    'Démonstration synthétique et déterministe : comparer un modèle PopPK de base et une covariable omique chez des sujets virtuels tenus à l’écart.',
    'Deterministic synthetic exercise: compare baseline PopPK and an omics covariate on held-out virtual subjects.'
  )}/>
</svelte:head>

<main class="case" data-testid="omics-pop-pk-case">
  <a class="back" href={`${base}/domaines/`}><ArrowLeft size={16}/> {t('Retour aux cours interdisciplinaires','Back to interdisciplinary lessons')}</a>
  <header>
    <span class="eyebrow"><BookOpen size={16}/> {t('CAS PRATIQUE · DÉBUTANT','CASE STUDY · BEGINNER')}</span>
    <h1>{t('Des omiques à un modèle PopPK','From omics to a PopPK model')}</h1>
    <p class="lead">{t(
      'Une signature biologique mesurée avant traitement permet-elle de mieux prédire l’exposition ? Compare les mêmes patients virtuels avec et sans cette information.',
      'Can a molecular signature measured before treatment improve exposure prediction? Compare identical virtual subjects with and without this information.'
    )}</p>
    <p class="disclaimer" role="note">{t(
      'Il s’agit de données entièrement synthétiques, avec un mécanisme fixé artificiellement et connu. Aucun médicament, patient ou modèle clinique réel n’est utilisé. Une meilleure performance ici ne démontre aucun bénéfice clinique.',
      'These data are entirely synthetic, with an artificially planted and known mechanism. No real drug, patient or clinical model is used. Improvement here does not establish clinical benefit.'
    )}</p>
  </header>

  <section class="steps" aria-labelledby="steps-title">
    <h2 id="steps-title">{t('Comment se déroule cette étude ?','How does this study work?')}</h2>
    <div class="step-grid">
      <article><span>01</span><strong>{t('Mesurer','Measure')}</strong><p>{t('Une signature omique avant la dose, puis une AUC observée.','A pre-dose omics signature and an observed AUC.')}</p></article>
      <article><span>02</span><strong>{t('Apprendre','Train')}</strong><p>{t('80 sujets virtuels : apprendre l’échelle et le coefficient de la signature.','80 virtual subjects: learn signature scaling and its coefficient.')}</p></article>
      <article><span>03</span><strong>{t('Comparer','Compare')}</strong><p>{t('40 autres sujets : prédire avec ou sans cette covariable.','40 different subjects: predict with or without the covariate.')}</p></article>
      <article><span>04</span><strong>{t('Interpréter','Interpret')}</strong><p>{t('Comparer les erreurs, sans chercher le meilleur réglage sur les tests.','Compare errors without tuning on the held-out subjects.')}</p></article>
    </div>
  </section>

  <section class="experiment" aria-labelledby="experiment-title" data-testid="omics-pop-pk-demo">
    <span class="eyebrow"><FlaskConical size={16}/> {t('DÉMONSTRATION REPRODUCTIBLE','REPRODUCIBLE DEMONSTRATION')}</span>
    <h2 id="experiment-title">{t('Force de l’effet biologique simulé','Simulated strength of the molecular effect')}</h2>
    <p>{t(
      'Le curseur règle l’effet que le générateur de données ajoute artificiellement. Il ne règle pas directement le coefficient estimé par le modèle : celui-ci est appris à partir des 80 sujets d’entraînement.',
      'The slider controls the effect planted by the data generator. It does not directly set the model coefficient: that coefficient is learned from 80 training subjects.'
    )}</p>
    <label for="planted-beta"><strong>{t('Effet artificiel de la signature','Planted signature effect')}</strong><output>{num(beta,2)}</output></label>
    <input id="planted-beta" type="range" min="0" max="0.65" step="0.05" bind:value={beta} data-testid="omics-pop-pk-beta"/>
    <p class="hint">{t(
      'Essaye 0 : la signature ne contient alors aucun signal véritable. Un modèle plus complexe ne devrait pas être privilégié automatiquement.',
      'Try 0: the signature contains no true signal. A more complex model should not automatically be preferred.'
    )}</p>
    <h3>{t('Résultats sur 40 sujets non utilisés pour l’apprentissage','Results on 40 subjects excluded from training')}</h3>
    <div class="scores">
      <article>
        <span>{t('Modèle sans omiques','Model without omics')}</span>
        <strong data-testid="omics-baseline-mape">{num(result.comparator.meanAbsolutePercentageError)} %</strong>
        <small>{t('Erreur absolue moyenne en %','Mean absolute percentage error')}</small>
        <p>P20 : {num(result.comparator.within20Percent,0)} %</p>
      </article>
      <article>
        <span>{t('Modèle avec signature','Model with signature')}</span>
        <strong data-testid="omics-signature-mape">{num(result.signatureModel.meanAbsolutePercentageError)} %</strong>
        <small>{t('Erreur absolue moyenne en %','Mean absolute percentage error')}</small>
        <p>P20 : {num(result.signatureModel.within20Percent,0)} %</p>
      </article>
    </div>
    <p class="interpretation" data-testid="omics-pop-pk-interpretation" role="status">
      {#if result.signatureModel.meanAbsolutePercentageError < result.comparator.meanAbsolutePercentageError}
        {t('Dans cette simulation, l’ajout de la signature réduit l’erreur sur les sujets de test. Cela ne prouve pas que la même méthode améliorera une vraie cohorte.',
        'In this simulation, adding the signature reduces error on held-out subjects. This does not prove the same approach will improve a real cohort.')}
      {:else}
        {t('Dans cette simulation, la signature ne réduit pas l’erreur sur les sujets de test. Ajouter une covariable ne garantit pas une meilleure prédiction.',
        'In this simulation, the signature does not reduce error on held-out subjects. Adding a covariate does not guarantee better prediction.')}
      {/if}
    </p>
    <details>
      <summary>{t('Voir les équations et le plan de calcul','See the equations and analysis plan')}</summary>
      <p>{t(
        'Vérité artificielle : AUC = 200 × exp(−β × S) avec une erreur log-normale, où S est une signature générée. Pour l’entraînement, on centre et standardise la signature en utilisant seulement les 80 sujets d’apprentissage. Le comparateur estime une exposition moyenne en échelle logarithmique ; l’autre modèle y ajoute une pente estimée par moindres carrés. Les 40 sujets de test ne servent à aucune estimation.',
        'Planted truth: AUC = 200 × exp(−β × S) with log-normal noise, where S is a generated signature. Within training, the signature is centered and scaled using only the 80 training subjects. The comparator estimates a log-scale average exposure; the other model adds a least-squares covariate slope. The 40 test subjects are not used for estimation.'
      )}</p>
      <p>{t(
        'Ce cours illustre uniquement une covariable sur l’exposition, dans des conditions simplifiées correspondant à une clairance apparente. Il ne réalise pas un ajustement NLME/SAEM, ne distingue pas F de CL et ne prédit aucune dose clinique.',
        'This example only illustrates an exposure covariate in simplified conditions corresponding to apparent clearance. It does not fit an NLME/SAEM model, cannot separate F from CL and does not predict a clinical dose.'
      )}</p>
      <p><strong>{t('Reproductibilité :','Reproducibility:')}</strong> {t(
        'graine fixe 20261013 ; 80/40 sujets ; bruit fixé ; code source et tests unitaires dans le dépôt.',
        'fixed seed 20261013; 80/40 subjects; fixed noise; source code and unit tests in the repository.'
      )}</p>
    </details>
  </section>

  <section class="transfer" aria-labelledby="transfer-title">
    <h2 id="transfer-title">{t('Pour passer de la démonstration à une vraie étude','For a real research study')}</h2>
    <ol>
      <li>{t('Préspécifier la question, la fenêtre de mesure et le marqueur candidat.','Pre-specify the question, sampling window and candidate marker.')}</li>
      <li>{t('Contrôler l’appariement patient, échantillon et mesure ; examiner batch et données manquantes.','Validate subject, specimen and assay matching; assess batch and missingness.')}</li>
      <li>{t('Sélectionner les gènes, normaliser et estimer le modèle dans l’entraînement uniquement.','Select genes, normalize and fit only within training data.')}</li>
      <li>{t('Tester le gain par rapport à un modèle clinique standard sur des patients indépendants.','Test added value over a clinical baseline on independent patients.')}</li>
      <li>{t('Fournir incertitude, code, versions, provenance et limites dans le manuscrit.','Report uncertainty, code, versions, provenance and limitations in the paper.')}</li>
    </ol>
    <div class="links">
      <a class="btn btn-primary" href={`${base}/multiomics/`}>{t('Découvrir MultiOmics','Explore MultiOmics')}</a>
      <a class="btn btn-outline" href={`${base}/domaines/`}>{t('Revenir aux quatre cours','Back to the four lessons')}</a>
    </div>
  </section>
</main>

<style>
  .case{max-width:1060px;margin:0 auto}
  .back{display:inline-flex;gap:8px;align-items:center;margin-bottom:25px}
  .eyebrow{display:inline-flex;gap:7px;align-items:center;color:var(--accent-pk);font-weight:700;font-size:.82rem;letter-spacing:.04em}
  header{max-width:830px;margin-bottom:50px}
  h1{font-size:clamp(2rem,4vw,3rem);line-height:1.15;margin:12px 0 20px}
  h2{font-size:clamp(1.35rem,2vw,1.8rem)}
  h3{font-size:1.14rem;margin-top:28px}
  p,li{line-height:1.7}
  .lead{font-size:1.11rem;color:var(--text-secondary)}
  .disclaimer{border-left:3px solid var(--border-strong);padding:14px 18px;background:var(--bg-secondary)}
  .steps,.experiment,.transfer{margin:32px 0}
  .step-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:20px}
  .step-grid article{border:1px solid var(--border-strong);border-radius:9px;padding:17px;display:grid;align-content:start;gap:9px}
  .step-grid article span{font-size:.8rem;font-weight:700;color:var(--accent-pk)}
  .step-grid article p{font-size:.88rem;color:var(--text-secondary);margin:0}
  .experiment{padding:26px;border:1px solid var(--border-strong);background:var(--bg-secondary);border-radius:10px}
  .experiment>p{max-width:85ch}
  label{display:flex;justify-content:space-between;gap:12px;max-width:700px;margin-top:24px}
  input[type=range]{display:block;width:100%;max-width:700px;margin:14px 0;accent-color:var(--accent-pk)}
  input:focus-visible,summary:focus-visible{outline:3px solid var(--focus-ring);outline-offset:3px}
  output{font-variant-numeric:tabular-nums;font-weight:700}
  .hint{color:var(--text-secondary);font-size:.93rem}
  .scores{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
  .scores article{border:1px solid var(--border-strong);background:var(--bg-primary);border-radius:8px;display:grid;gap:7px;padding:20px}
  .scores strong{font-size:clamp(1.7rem,2.5vw,2.2rem);font-variant-numeric:tabular-nums}
  .scores small{color:var(--text-secondary)}
  .scores p{margin:4px 0 0}
  .interpretation{font-weight:600;max-width:90ch}
  details{margin-top:20px;border-top:1px solid var(--border-strong);padding-top:13px}
  summary{cursor:pointer;font-weight:700}
  .transfer{border-top:1px solid var(--border-strong);padding-top:25px}
  .transfer li{margin-bottom:9px}
  .links{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
  @media(max-width:850px){.step-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:520px){.step-grid,.scores{grid-template-columns:1fr}.experiment{padding:18px}}
</style>
