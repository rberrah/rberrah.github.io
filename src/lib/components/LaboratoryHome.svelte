<script>
  import { base } from '$app/paths';
  import { language } from '$lib/stores/language';
  import { ArrowRight, BookOpen, FlaskConical } from '@lucide/svelte';

  const laboratories = [
    {
      id: 'distribution', number: '01', route: { en: 'IV bolus', fr: 'Bolus IV' },
      en: { title: 'Two-compartment distribution', text: 'Follow molecules as they leave the central compartment, enter peripheral tissues, return and are eliminated.' },
      fr: { title: 'Distribution à deux compartiments', text: 'Suivre les molécules qui quittent le compartiment central, gagnent les tissus, reviennent puis sont éliminées.' }
    },
    {
      id: 'accumulation', number: '02', route: { en: 'IV bolus', fr: 'Bolus IV' },
      en: { title: 'Repeated doses and accumulation', text: 'Watch successive molecular cohorts overlap, accumulate and wash out after the final administration.' },
      fr: { title: 'Doses répétées et accumulation', text: 'Observer les cohortes moléculaires successives se superposer, s’accumuler puis disparaître après la dernière dose.' }
    },
    {
      id: 'absorption', number: '03', route: { en: 'Oral', fr: 'Orale' },
      en: { title: 'Oral absorption and bioavailability', text: 'Track a dose from the oral depot to blood while separating systemic entry from presystemic loss.' },
      fr: { title: 'Absorption orale et biodisponibilité', text: 'Suivre une dose du dépôt oral vers le sang en séparant l’entrée systémique de la perte présystémique.' }
    },
    {
      id: 'infusion', number: '04', route: { en: 'IV infusion', fr: 'Perfusion IV' },
      en: { title: 'Infusion and washout', text: 'See molecules enter continuously from the infusion bag, then continue toward elimination after the pump stops.' },
      fr: { title: 'Perfusion et décroissance', text: 'Voir les molécules entrer continuellement depuis la poche, puis poursuivre vers l’élimination après l’arrêt.' }
    }
  ];
  $: en = $language === 'en';
  $: lang = en ? 'en' : 'fr';
</script>

<section class="lab-home" data-testid="laboratory-home">
  <header class="heading">
    <div><p class="eyebrow"><FlaskConical size={15}/>{en ? 'Virtual laboratories' : 'Laboratoires virtuels'}</p><h1>{en ? 'Choose a molecular journey' : 'Choisir un parcours moléculaire'}</h1></div>
    <p>{en ? 'These experiments are reserved for mechanisms whose sequence and movement are easier to understand by watching them unfold.' : 'Ces expériences sont réservées aux mécanismes dont la séquence et les déplacements se comprennent mieux en les observant.'}</p>
  </header>

  <div class="laboratory-grid">
    {#each laboratories as laboratory}
      <a class="laboratory-card" data-testid={`laboratory-link-${laboratory.id}`} href={`${base}/laboratoires/?lang=${lang}&lab=${laboratory.id}`}>
        <div class={`journey ${laboratory.id}`} aria-hidden="true">
          {#if laboratory.id === 'distribution'}
            <span class="node source">Central</span><i class="track forward"></i><i class="track return"></i><span class="node target">{en ? 'Tissue' : 'Tissu'}</span><i class="track exit"></i><span class="collector">OUT</span><b class="particle p1"></b><b class="particle p2"></b><b class="particle p3"></b>
          {:else if laboratory.id === 'accumulation'}
            <span class="doses"><i></i><i></i><i></i><i></i></span><i class="track input"></i><span class="node source">Central</span><i class="track exit"></i><span class="collector">OUT</span><b class="particle p1"></b><b class="particle p2"></b><b class="particle p3"></b>
          {:else if laboratory.id === 'absorption'}
            <span class="node source">{en ? 'Depot' : 'Dépôt'}</span><i class="track input"></i><span class="node target">Central</span><i class="track loss"></i><span class="collector loss-label">{en ? 'Loss' : 'Perte'}</span><i class="track exit"></i><span class="collector out-label">OUT</span><b class="particle p1"></b><b class="particle p2"></b><b class="particle p3"></b>
          {:else}
            <span class="bag"><i></i></span><i class="track input"></i><span class="node target">Central</span><i class="track exit"></i><span class="collector">OUT</span><b class="particle p1"></b><b class="particle p2"></b><b class="particle p3"></b>
          {/if}
        </div>
        <div class="card-meta"><span>{laboratory.number}</span><small>{en ? laboratory.route.en : laboratory.route.fr}</small></div>
        <h2>{en ? laboratory.en.title : laboratory.fr.title}</h2><p>{en ? laboratory.en.text : laboratory.fr.text}</p>
        <strong>{en ? 'Open laboratory' : 'Ouvrir le laboratoire'}<ArrowRight size={17}/></strong>
      </a>
    {/each}
  </div>

  <section class="course-animations">
    <div><p class="eyebrow"><BookOpen size={15}/>{en ? 'Concept animations' : 'Animations de cours'}</p><h2>{en ? 'No molecular journey is needed here' : 'Ici, aucun parcours moléculaire n’est nécessaire'}</h2></div>
    <p>{en ? 'Population variability and Bayesian updating remain interactive course figures: their purpose is to compare curves and distributions, not to reproduce a video-like pathway.' : 'La variabilité populationnelle et la mise à jour bayésienne restent des figures interactives de cours : leur objectif est de comparer des courbes et des distributions, pas de reproduire un trajet vidéo.'}</p>
    <nav aria-label={en ? 'Related course animations' : 'Animations de cours associées'}><a href={`${base}/chapitres/variabilite-iiv-iov/`}>{en ? 'Population variability' : 'Variabilité populationnelle'}<ArrowRight size={16}/></a><a href={`${base}/chapitres/math-bayes/`}>{en ? 'Bayesian updating' : 'Mise à jour bayésienne'}<ArrowRight size={16}/></a></nav>
  </section>
</section>

<style>
  .lab-home { letter-spacing:0; }
  .heading { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr); gap:36px; align-items:end; padding:8px 0 28px; border-bottom:1px solid var(--border-strong); }
  .heading h1 { margin:7px 0 0; font-size:34px; } .heading > p { margin:0 0 4px; color:var(--text-secondary); line-height:1.6; font-size:14px; }
  .eyebrow { display:flex; align-items:center; gap:7px; margin:0; color:var(--text-secondary); font-size:12px; }
  .laboratory-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:var(--border-strong); margin-top:24px; border:1px solid var(--border-strong); }
  .laboratory-card { display:grid; grid-template-rows:150px auto auto 1fr auto; min-width:0; padding:20px; color:var(--text-primary); background:var(--bg-primary); text-decoration:none; }
  .laboratory-card:hover, .laboratory-card:focus-visible { background:var(--bg-secondary); } .laboratory-card:focus-visible { outline:3px solid var(--accent-pk); outline-offset:3px; }
  .laboratory-card h2 { margin:10px 0 6px; font-size:19px; } .laboratory-card p { margin:0 0 18px; color:var(--text-secondary); font-size:13px; line-height:1.5; }
  .laboratory-card > strong { display:flex; align-items:center; gap:7px; color:var(--accent-pk); font-size:13px; }
  .card-meta { display:flex; justify-content:space-between; margin-top:14px; color:var(--text-secondary); font-size:11px; } .card-meta span { font-family:var(--font-mono); }
  .journey { position:relative; min-height:150px; overflow:hidden; background:#edf6f7; border-bottom:3px solid #087b83; color:#294651; }
  .node { position:absolute; top:43px; display:grid; place-items:center; width:108px; height:62px; border:2px solid #60848f; background:#fff; font-size:12px; font-weight:700; }
  .node.source { left:8%; } .node.target { right:9%; } .collector { position:absolute; right:11%; bottom:8px; font:600 10px var(--font-mono); color:#725d7a; }
  .track { position:absolute; display:block; height:4px; background:#9ec7cf; transform-origin:left center; }
  .track:after { content:''; position:absolute; right:-1px; top:-4px; border-left:8px solid #4b8490; border-top:6px solid transparent; border-bottom:6px solid transparent; }
  .distribution .forward { left:31%; right:32%; top:58px; } .distribution .return { left:31%; right:32%; top:91px; transform:rotate(180deg); transform-origin:center; }
  .track.exit { width:4px; height:39px; right:19%; top:100px; background:#b7a6bc; } .track.exit:after { top:auto; right:-4px; bottom:-2px; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #725d7a; border-bottom:0; }
  .particle { position:absolute; width:9px; height:9px; border-radius:50%; background:#168d71; border:1px solid #fff; box-shadow:0 0 0 1px #34707a; }
  .distribution .p1 { left:23%; top:60px; } .distribution .p2 { left:49%; top:53px; } .distribution .p3 { right:17%; top:116px; }
  .doses { position:absolute; left:5%; top:48px; display:flex; gap:5px; } .doses i { width:11px; height:31px; border:1px solid #6e8991; background:#fff; } .doses i:nth-child(-n+3) { background:#d86b3b; }
  .accumulation .node.source { left:42%; } .accumulation .input { left:23%; width:19%; top:73px; } .accumulation .exit { right:18%; } .accumulation .p1 { left:47%; top:61px; } .accumulation .p2 { left:54%; top:81px; background:#d86b3b; } .accumulation .p3 { right:16%; top:118px; }
  .absorption .input, .infusion .input { left:31%; right:32%; top:73px; } .absorption .loss { width:4px; height:39px; left:20%; top:100px; background:#c68a95; } .absorption .loss:after { top:auto; right:-4px; bottom:-2px; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #a65364; border-bottom:0; } .loss-label { left:14%; right:auto; color:#a65364; } .out-label { right:14%; }
  .absorption .p1 { left:25%; top:68px; background:#c97532; } .absorption .p2 { left:52%; top:69px; } .absorption .p3 { right:15%; top:118px; }
  .bag { position:absolute; left:10%; top:36px; width:80px; height:82px; border:2px solid #60848f; background:#fff; } .bag i { position:absolute; left:8px; right:8px; bottom:8px; height:49px; background:#b8ded4; } .infusion .node.target { right:9%; } .infusion .p1 { left:25%; top:69px; } .infusion .p2 { left:52%; top:69px; } .infusion .p3 { right:15%; top:118px; }
  .course-animations { display:grid; grid-template-columns:minmax(220px,.8fr) minmax(280px,1.2fr); gap:20px 38px; align-items:start; margin-top:34px; padding:26px 0; border-top:1px solid var(--border-strong); }
  .course-animations h2 { margin:7px 0 0; font-size:20px; } .course-animations > p { margin:0; color:var(--text-secondary); font-size:13px; line-height:1.6; }
  .course-animations nav { grid-column:1/-1; display:flex; flex-wrap:wrap; gap:10px; } .course-animations nav a { display:inline-flex; align-items:center; gap:6px; padding:9px 11px; border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); text-decoration:none; font-size:12px; }
  @media(max-width:720px) { .heading { grid-template-columns:1fr; gap:14px; } .heading h1 { font-size:28px; } .laboratory-grid { grid-template-columns:1fr; } .laboratory-card { grid-template-rows:135px auto auto 1fr auto; } .journey { min-height:135px; } .course-animations { grid-template-columns:1fr; } .course-animations nav { grid-column:1; } }
  @media(max-width:360px) { .laboratory-card { padding:14px; } .node { width:92px; } }
</style>
