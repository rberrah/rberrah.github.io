<script>
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  import { BookOpen, FlaskConical } from '@lucide/svelte';
  import LaboratoryCard from './LaboratoryCard.svelte';

  const advanced = [
    { id: 'parent-metabolite', number: '05', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Parent and metabolite', text: 'Transformation, parallel elimination and delayed metabolite exposure.' }, fr: { title: 'Parent et métabolite', text: 'Transformation, éliminations parallèles et exposition retardée du métabolite.' } },
    { id: 'long-acting', number: '06', group: 'advanced', route: { en: 'Long-acting depot', fr: 'Dépôt longue action' }, en: { title: 'Long-acting depot', text: 'Slow release, delayed peaks, repeated injections and flip-flop kinetics.' }, fr: { title: 'Dépôt longue action', text: 'Libération lente, pics retardés, injections répétées et cinétique flip-flop.' } },
    { id: 'saturable', number: '07', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Saturable elimination', text: 'A finite elimination capacity progressively reaches Vmax.' }, fr: { title: 'Élimination saturable', text: "Une capacité d’élimination finie atteint progressivement Vmax." } },
    { id: 'enterohepatic', number: '08', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Enterohepatic cycling', text: 'Plasma, bile, gut, reabsorption and secondary exposure.' }, fr: { title: 'Cycle entérohépatique', text: 'Plasma, bile, intestin, réabsorption et exposition secondaire.' } },
    { id: 'tmdd', number: '09', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Target-mediated disposition', text: 'Binding, target saturation, dissociation and complex internalization.' }, fr: { title: 'Disposition médiée par la cible', text: 'Liaison, saturation de la cible, dissociation et internalisation du complexe.' } },
    { id: 'effect-site', number: '10', group: 'advanced', route: { en: 'IV bolus', fr: 'Bolus IV' }, en: { title: 'Effect-site equilibration', text: 'Plasma exposure, delayed biophase and pharmacodynamic response.' }, fr: { title: "Équilibration au site d’effet", text: 'Exposition plasmatique, biophase retardée et réponse pharmacodynamique.' } }
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

  <section class="catalogue-section featured">
    <div class="section-heading"><div><p class="eyebrow">{en ? 'New advanced journeys' : 'Nouveaux parcours avancés'}</p><h2>{en ? 'Transformation, saturation and delayed response' : 'Transformation, saturation et réponse retardée'}</h2></div><span>05—10</span></div>
    <div class="laboratory-grid advanced-grid">{#each advanced as laboratory}<LaboratoryCard {laboratory} {en} {lang}/>{/each}</div>
  </section>

  <section class="catalogue-section">
    <div class="section-heading"><div><p class="eyebrow">{en ? 'Fundamentals' : 'Fondamentaux'}</p><h2>{en ? 'Inputs, distribution and accumulation' : 'Entrées, distribution et accumulation'}</h2></div><span>01—04</span></div>
    <div class="laboratory-grid fundamental-grid">{#each fundamentals as laboratory}<LaboratoryCard {laboratory} {en} {lang}/>{/each}</div>
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
  .catalogue-section { margin-top:38px; }.catalogue-section.featured { margin-top:24px; }
  .section-heading { display:flex; align-items:end; justify-content:space-between; gap:20px; margin-bottom:12px; }.section-heading h2 { margin:5px 0 0; font-size:21px; }.section-heading > span { color:var(--text-muted); font:12px var(--font-mono); }
  .laboratory-grid { display:grid; gap:1px; border:1px solid var(--border-strong); background:var(--border-strong); }.advanced-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }.fundamental-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .course-animations { display:grid; grid-template-columns:minmax(220px,.8fr) minmax(280px,1.2fr); gap:20px 38px; align-items:start; margin-top:38px; padding:26px 0; border-top:1px solid var(--border-strong); }
  .course-animations h2 { margin:7px 0 0; font-size:20px; }.course-animations > p { margin:0; color:var(--text-secondary); font-size:13px; line-height:1.6; }.course-animations nav { grid-column:1/-1; display:flex; flex-wrap:wrap; gap:10px; }.course-animations nav a { display:inline-flex; align-items:center; padding:9px 11px; border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); text-decoration:none; font-size:12px; }
  @media(max-width:960px) { .advanced-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
  @media(max-width:720px) { .heading { grid-template-columns:1fr; gap:14px; }.heading h1 { font-size:28px; }.advanced-grid, .fundamental-grid { grid-template-columns:1fr; }.course-animations { grid-template-columns:1fr; }.course-animations nav { grid-column:1; } }
</style>
