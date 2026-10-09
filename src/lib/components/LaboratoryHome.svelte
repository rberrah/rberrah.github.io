<script>
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  import { BookOpen, FlaskConical } from '@lucide/svelte';
  import LaboratoryCard from './LaboratoryCard.svelte';

  const pharmacodynamics = [
    { id: 'pd-general', number: '12', group: 'pd', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'From concentration to response', text: 'Plasma exposure, target engagement and delayed biological response.' }, fr: { title: 'De la concentration à la réponse', text: "Exposition plasmatique, engagement de la cible et réponse biologique retardée." } },
    { id: 'pd-infectiology', number: '13', group: 'pd', route: { en: 'Repeated IV boluses', fr: 'Bolus IV répétés' }, en: { title: 'Antibiotic, MIC and bacterial response', text: 'Repeated exposure, MIC threshold, time above MIC and predicted bacterial burden.' }, fr: { title: 'Antibiotique, CMI et réponse bactérienne', text: 'Exposition répétée, seuil de CMI, temps au-dessus de la CMI et charge bactérienne prédite.' } },
    { id: 'pd-oncology', number: '14', group: 'pd', route: { en: 'Repeated IV boluses', fr: 'Bolus IV repetes' }, en: { title: 'Tumor growth inhibition', text: 'Sensitive and resistant cell populations compared with untreated tumor growth.' }, fr: { title: 'Inhibition de la croissance tumorale', text: 'Populations cellulaires sensibles et resistantes comparees a la croissance sans traitement.' } }
  ];
  const covariates = [
    { id: 'covariate-volume', number: '05', group: 'pd', route: { en: 'Oral input', fr: 'Entree orale' }, en: { title: 'Body weight and distribution volume', text: 'A fluid reservoir changes size with weight and alters concentration after the same dose.' }, fr: { title: 'Poids et volume de distribution', text: 'Un reservoir liquidien change de taille avec le poids et modifie la concentration a dose identique.' } },
    { id: 'covariate-clearance', number: '06', group: 'pd', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'GFR and renal clearance', text: 'A renal function covariate changes one defined component of total clearance.' }, fr: { title: 'DFG et clairance renale', text: 'Une covariable de fonction renale modifie une composante definie de la clairance totale.' } }
  ];
  const advanced = [
    { id: 'parent-metabolite', number: '07', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Parent and metabolite', text: 'Transformation, parallel elimination and delayed metabolite exposure.' }, fr: { title: 'Parent et métabolite', text: 'Transformation, éliminations parallèles et exposition retardée du métabolite.' } },
    { id: 'long-acting', number: '08', group: 'advanced', route: { en: 'Long-acting depot', fr: 'Dépôt longue action' }, en: { title: 'Long-acting depot', text: 'Slow release, delayed peaks, repeated injections and flip-flop kinetics.' }, fr: { title: 'Dépôt longue action', text: 'Libération lente, pics retardés, injections répétées et cinétique flip-flop.' } },
    { id: 'saturable', number: '09', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Saturable elimination', text: 'A finite elimination capacity progressively reaches Vmax.' }, fr: { title: 'Élimination saturable', text: "Une capacité d’élimination finie atteint progressivement Vmax." } },
    { id: 'enterohepatic', number: '10', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Enterohepatic cycling', text: 'Plasma, bile, gut, reabsorption and secondary exposure.' }, fr: { title: 'Cycle entérohépatique', text: 'Plasma, bile, intestin, réabsorption et exposition secondaire.' } },
    { id: 'effect-site', number: '11', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Effect-site equilibration', text: 'Plasma exposure, delayed biophase and pharmacodynamic response.' }, fr: { title: "Équilibration au site d’effet", text: 'Exposition plasmatique, biophase retardée et réponse pharmacodynamique.' } }
  ];
  const targetMediated = [
    { id: 'tmdd', number: '15', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Target-mediated disposition', text: 'Binding, target saturation, dissociation and complex internalization.' }, fr: { title: 'Disposition médiée par la cible', text: 'Liaison, saturation de la cible, dissociation et internalisation du complexe.' } }
  ];
  const fundamentals = [
    { id: 'distribution', number: '01', group: 'fundamental', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Two-compartment distribution', text: 'Follow molecules as they leave the central compartment, enter peripheral tissues, return and are eliminated.' }, fr: { title: 'Distribution à deux compartiments', text: 'Suivre les molécules qui quittent le compartiment central, gagnent les tissus, reviennent puis sont éliminées.' } },
    { id: 'accumulation', number: '02', group: 'fundamental', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Repeated doses and accumulation', text: 'Watch successive molecular cohorts overlap, accumulate and wash out after the final administration.' }, fr: { title: 'Doses répétées et accumulation', text: 'Observer les cohortes moléculaires successives se superposer, s’accumuler puis disparaître après la dernière dose.' } },
    { id: 'absorption', number: '03', group: 'fundamental', route: { en: 'Oral', fr: 'Orale' }, en: { title: 'Oral absorption and bioavailability', text: 'Track a dose from the oral depot to blood while separating systemic entry from presystemic loss.' }, fr: { title: 'Absorption orale et biodisponibilité', text: 'Suivre une dose du dépôt oral vers le sang en séparant l’entrée systémique de la perte présystémique.' } },
    { id: 'infusion', number: '04', group: 'fundamental', route: { en: 'IV infusion', fr: 'Perfusion IV' }, en: { title: 'Infusion and washout', text: 'See molecules enter continuously from the infusion bag, then continue toward elimination after the pump stops.' }, fr: { title: 'Perfusion et décroissance', text: 'Voir les molécules entrer continuellement depuis la poche, puis poursuivre vers l’élimination après l’arrêt.' } }
  ];
  $: en = $language === 'en';
  $: lang = en ? 'en' : 'fr';
</script>

<section class="lab-home" data-testid="laboratory-home">
  <header class="heading">
    <div><p class="eyebrow"><FlaskConical size={15}/>{en ? 'Virtual laboratories' : 'Laboratoires virtuels'}</p><h1>{en ? 'Choose a molecular journey' : 'Choisir un parcours moléculaire'}</h1></div>
    <p>{en ? 'These experiments are reserved for mechanisms whose sequence and movement are easier to understand by watching them unfold.' : 'Ces expériences sont réservées aux mécanismes dont la séquence et les déplacements se comprennent mieux en les observant.'}</p>
  </header>

  <section class="catalogue-section">
    <div class="section-heading"><div><p class="eyebrow">{en ? 'Fundamentals' : 'Fondamentaux'}</p><h2>{en ? 'Inputs, distribution and accumulation' : 'Entrées, distribution et accumulation'}</h2></div><span>01—04</span></div>
    <div class="laboratory-grid fundamental-grid">{#each fundamentals as laboratory}<LaboratoryCard {laboratory} {en} {lang}/>{/each}</div>
  </section>

  <section class="catalogue-section">
    <div class="section-heading"><div><p class="eyebrow">{en ? 'Covariate journeys' : 'Parcours covariables'}</p><h2>{en ? 'From patient characteristic to model parameter' : 'De la caractéristique patient au paramètre du modèle'}</h2></div><span>05—06</span></div>
    <div class="laboratory-grid fundamental-grid">{#each covariates as laboratory}<LaboratoryCard {laboratory} {en} {lang}/>{/each}</div>
  </section>

  <section class="catalogue-section">
    <div class="section-heading"><div><p class="eyebrow">{en ? 'Progressive mechanisms' : 'Mécanismes progressifs'}</p><h2>{en ? 'Transformation, saturation and delayed response' : 'Transformation, saturation et réponse retardée'}</h2></div><span>07—11</span></div>
    <div class="laboratory-grid advanced-grid">{#each advanced as laboratory}<LaboratoryCard {laboratory} {en} {lang}/>{/each}</div>
  </section>

  <section class="catalogue-section">
    <div class="section-heading"><div><p class="eyebrow">{en ? 'Pharmacodynamic journeys' : 'Parcours pharmacodynamiques'}</p><h2>{en ? 'From exposure to biological response' : "De l'exposition à la réponse biologique"}</h2></div><span>12—14</span></div>
    <div class="laboratory-grid advanced-grid">{#each pharmacodynamics as laboratory}<LaboratoryCard {laboratory} {en} {lang}/>{/each}</div>
  </section>

  <section class="catalogue-section">
    <div class="section-heading"><div><p class="eyebrow">{en ? 'Advanced target mechanism' : 'Mecanisme de cible avance'}</p><h2>{en ? 'Binding, saturation and internalization' : 'Liaison, saturation et internalisation'}</h2></div><span>15</span></div>
    <div class="laboratory-grid single-grid">{#each targetMediated as laboratory}<LaboratoryCard {laboratory} {en} {lang}/>{/each}</div>
  </section>

  <section class="course-animations">
    <div><p class="eyebrow"><BookOpen size={15}/>{en ? 'Concept animations' : 'Animations de cours'}</p><h2>{en ? 'No molecular journey is needed here' : "Ici, aucun parcours moleculaire n'est necessaire"}</h2></div>
    <p>{en ? 'Population variability and Bayesian updating remain interactive course figures: their purpose is to compare curves and distributions, not to reproduce a video-like pathway.' : 'La variabilité populationnelle et la mise à jour bayésienne restent des figures interactives de cours : leur objectif est de comparer des courbes et des distributions, pas de reproduire un trajet vidéo.'}</p>
    <nav aria-label={en ? 'Related course animations' : 'Animations de cours associées'}><a href={`${base}/chapitres/variabilite-iiv-iov/`}>{en ? 'Population variability' : 'Variabilité populationnelle'}</a><a href={`${base}/chapitres/math-bayes/`}>{en ? 'Bayesian updating' : 'Mise à jour bayésienne'}</a></nav>
  </section>
</section>

<style>
  .lab-home { letter-spacing:0; }
  .heading { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr); gap:36px; align-items:end; padding:8px 0 28px; border-bottom:1px solid var(--border-strong); }
  .heading h1 { margin:7px 0 0; font-size:34px; }.heading > p { margin:0 0 4px; color:var(--text-secondary); line-height:1.6; font-size:14px; }
  .eyebrow { display:flex; align-items:center; gap:7px; margin:0; color:var(--text-secondary); font-size:11px; text-transform:uppercase; }
  .catalogue-section { margin-top:38px; }.heading + .catalogue-section { margin-top:24px; }
  .section-heading { display:flex; align-items:end; justify-content:space-between; gap:20px; margin-bottom:12px; }.section-heading h2 { margin:5px 0 0; font-size:21px; }.section-heading > span { color:var(--text-muted); font:12px var(--font-mono); }
  .laboratory-grid { display:grid; gap:1px; border:1px solid var(--border-strong); background:var(--border-strong); }.advanced-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }.single-grid { grid-template-columns:minmax(0,1fr); max-width:calc((100% - 2px)/3); }.fundamental-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .course-animations { display:grid; grid-template-columns:minmax(220px,.8fr) minmax(280px,1.2fr); gap:20px 38px; align-items:start; margin-top:38px; padding:26px 0; border-top:1px solid var(--border-strong); }
  .course-animations h2 { margin:7px 0 0; font-size:20px; }.course-animations > p { margin:0; color:var(--text-secondary); font-size:13px; line-height:1.6; }.course-animations nav { grid-column:1/-1; display:flex; flex-wrap:wrap; gap:10px; }.course-animations nav a { display:inline-flex; align-items:center; padding:9px 11px; border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); text-decoration:none; font-size:12px; }
  @media(max-width:960px) { .advanced-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
  @media(max-width:720px) { .heading { grid-template-columns:1fr; gap:14px; }.heading h1 { font-size:28px; }.advanced-grid, .fundamental-grid, .single-grid { grid-template-columns:1fr; max-width:none; }.course-animations { grid-template-columns:1fr; }.course-animations nav { grid-column:1; } }
</style>
