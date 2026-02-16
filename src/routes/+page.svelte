<script>
  import { base } from '$app/paths';
  import { LayerCake, Svg } from 'layercake';

  const deckHref = `${base}/pharmacometrie-pratique.pptx`;

  const sections = [
    {
      id: 'pkpd1',
      label: 'PK vs PD',
      title: 'Pourquoi la pharmacométrie ?',
      lead:
        'Croiser pharmacocinétique (PK : exposition) et pharmacodynamie (PD : réponse) pour sortir du « one size fits all ».'
    },
    {
      id: 'approches',
      label: 'Méthodes',
      title: 'Trois approches complémentaires',
      lead: 'Choisir la bonne granularité entre description rapide, variabilité populationnelle ou physiologie détaillée.'
    },
    {
      id: 'modele',
      label: 'Modélisation',
      title: 'Construire un modèle PK robuste',
      lead: 'Décrire l’Absorption, la Distribution et l’Élimination avec des compartiments et des flux.'
    },
    {
      id: 'variabilite',
      label: 'Variabilité',
      title: 'Quantifier et expliquer la variabilité',
      lead: 'Séparer IIV/IOV, erreur résiduelle et covariables cliniques pour des prédictions fiables.'
    },
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      title: 'Valider ce que le modèle raconte',
      lead: 'Graphiques, VPC, bootstrap, FIM et shrinkage pour éviter les faux-amis.'
    },
    {
      id: 'pkpd2',
      label: 'PK-PD',
      title: 'Lier PK et effet clinique',
      lead: 'Effets directs ou indirects, compartiment effet, turnover et pièges sur Emax.'
    },
    {
      id: 'ia',
      label: 'IA & ML',
      title: 'Quand l’IA s’invite',
      lead: 'Random Forest pour le tri de biomarqueurs, XGBoost pour le TDM, Neural ODE pour hybrider physiologie et données.'
    },
    {
      id: 'cas',
      label: 'Cas clinique',
      title: 'Application terrain',
      lead: 'Titrer le tacrolimus chez un greffé rénal avec données anonymisées.'
    }
  ];

  const metrics = [
    { label: 'Slides', value: '74' },
    { label: 'Thèmes', value: 'PK · PD · PopPK · PBPK · IA' },
    { label: 'Focus', value: 'Diagnostics & simulation' }
  ];

  const approaches = [
    {
      name: 'NCA',
      color: '#264653',
      text: 'Non-compartimental. AUC/Cmax/Tmax, robuste mais non prédictif.'
    },
    {
      name: 'PopPK',
      color: '#e76f51',
      text: 'Top-down. Estime variabilité et permet la simulation clinique.'
    },
    {
      name: 'PBPK',
      color: '#2a9d8f',
      text: 'Bottom-up. Organes et physiologie fine, idéal pour les interactions.'
    }
  ];

  // --- PK simulator (compartimental 1C) ---
  let dose = 150;
  let volume = 25;
  let cl = 6;

  $: ke = cl / volume;
  $: timePoints = Array.from({ length: 25 }, (_, i) => i); // heures
  $: concentrations = timePoints.map((t) => ({
    t,
    c: (dose / volume) * Math.exp(-ke * t)
  }));
  $: maxC = Math.max(...concentrations.map((p) => p.c), 0.001);

  // --- Grey box vs white box ---
  let realData = [];
  $: realData = timePoints.map((t) => {
    let c = (100 / 20) * Math.exp(-(5 / 20) * t);
    if (t > 8 && t < 16) c += 1.5 * Math.sin((t - 8) * 0.55);
    return { t, c: Math.max(0, c) };
  });

  let aiMode = 'white'; // white | grey
  $: aiPrediction = timePoints.map((t) => {
    let c = (100 / 20) * Math.exp(-(5 / 20) * t);
    if (aiMode === 'grey' && t > 8 && t < 16) {
      c += 1.35 * Math.sin((t - 8) * 0.55);
    }
    return { t, c: Math.max(0, c) };
  });

  // --- VPC interactif (Layercake + d3) ---
  const vpcTimes = Array.from({ length: 13 }, (_, i) => i * 2);
  const ka = 1.1;
  const kePK = 0.14;
  const scale = 6;

  /** @param {number} t */
  const pkCurve = (t) => Math.max(0, scale * (Math.exp(-kePK * t) - Math.exp(-ka * t)));

  let residualCV = 15;
  $: vpcData = vpcTimes.map((t) => {
    const base = pkCurve(t);
    const sim50 = base;
    const sim05 = base * (1 - 0.25 - residualCV / 200);
    const sim95 = base * (1 + 0.25 + residualCV / 200);
    const obsMedian = base * (1 + 0.08 * Math.sin(t * 0.35));
    return { time: t, sim50, sim05, sim95, obsMedian };
  });

  const individualOffsets = [-0.25, -0.1, 0, 0.12, 0.28];
  $: vpcIndividuals = vpcTimes.flatMap((t, idxT) =>
    individualOffsets.map((o, idxO) => {
      const base = pkCurve(t);
      const factor = 1 + o + 0.04 * Math.sin(t * 0.55 + idxO * 0.3);
      return { time: t, c: Math.max(0, base * factor) };
    })
  );
  $: vpcMax = Math.max(...vpcData.map((d) => d.sim95)) * 1.1 || 1;

  // --- Cas clinique (anonymisé) ---
  const clinicalCase = {
    id: 'CASE-017',
    contexte: 'Greffe rénale J+45, prévention du rejet',
    molecule: 'Tacrolimus',
    regimen: '3 mg deux fois par jour per os',
    objectif: 'C0 cible 7–10 µg/L',
    patient: { age: 56, sexe: 'H', poids: 82, creat: 1.1 }
  };

  const caseSamples = [
    { t: 0, c: 11.2 },
    { t: 2, c: 9.1 },
    { t: 4, c: 7.8 },
    { t: 6, c: 6.9 },
    { t: 8, c: 6.2 },
    { t: 12, c: 5.4 }
  ];
  $: trough = caseSamples[caseSamples.length - 1].c;
  $: needReduction = trough > 10;

  let activeId = sections[0].id;

  /**
   * @param {Element} node
   * @param {string} id
   */
  function observe(node, id) {
    let currentId = id;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) activeId = currentId;
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return {
      update(/** @type {string} */ nextId) {
        currentId = nextId;
      },
      destroy() {
        observer.disconnect();
      }
    };
  }
</script>

<svelte:head>
  <title>Pharmacométrie Explain</title>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Source+Serif+4:wght@400;600;700&display=swap"
  />
</svelte:head>

<main>
  <section class="hero">
    <div class="hero__text">
      <p class="eyebrow">Pharmacométrie, pas à pas</p>
      <h1>Du compartiment au Neural ODE</h1>
      <p class="lede">
        Un résumé interactif du deck « Pharmacométrie Pratique » : comprendre, simuler et diagnostiquer les modèles
        PK/PD, puis hybrider avec l’IA.
      </p>
      <div class="cta-row">
        <a class="cta primary" href="#parcours">Explorer</a>
        <a class="cta ghost" href={deckHref} download>
          Télécharger le deck (PPTX)
        </a>
      </div>
      <div class="metrics">
        {#each metrics as m}
          <div class="metric">
            <span>{m.value}</span>
            <small>{m.label}</small>
          </div>
        {/each}
      </div>
    </div>
    <div class="hero__viz">
      <div class="bubble bubble-a"></div>
      <div class="bubble bubble-b"></div>
      <div class="card glass fade-in">
        <p class="tiny">Simulation 1C</p>
        <svg viewBox="0 0 320 140">
          <defs>
            <linearGradient id="grad-line" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stop-color="#2563eb" />
              <stop offset="100%" stop-color="#22c55e" />
            </linearGradient>
          </defs>
          <line x1="30" y1="115" x2="300" y2="115" stroke="#111" stroke-width="1" />
          <line x1="30" y1="15" x2="30" y2="115" stroke="#111" stroke-width="1" />
          <polyline
            fill="none"
            stroke="url(#grad-line)"
            stroke-width="3"
            points={concentrations.map((p) => `${30 + p.t * 11},${115 - (p.c / maxC) * 90}`).join(' ')}
          />
        </svg>
        <div class="mini-grid">
          <div><strong>Dose</strong><br />{dose} mg</div>
          <div><strong>CL</strong><br />{cl} L/h</div>
          <div><strong>V</strong><br />{volume} L</div>
        </div>
      </div>
    </div>
  </section>

  <section id="parcours" class="content">
    <aside class="rail">
      <p class="rail__title">Plan</p>
      <ol>
        {#each sections as section}
          <li class:active={activeId === section.id}>
            <a href={`#${section.id}`}>{section.label}</a>
          </li>
        {/each}
      </ol>
    </aside>

    <div class="flow">
      <article id="pkpd1" use:observe={'pkpd1'} class="panel animated">
        <p class="tag">PK & PD</p>
        <h2>Pourquoi la pharmacométrie ?</h2>
        <p class="lead">
          PK : « ce que le corps fait au médicament » — absorption, distribution, métabolisation, élimination. PD : « ce
          que le médicament fait au corps » — effet, récepteurs, homéostasie. Le fossé entre les deux explique la
          variabilité clinique.
        </p>
        <ul class="grid two">
          <li>Variabilité d’exposition : absorption, distribution, métabolisme hépatique, élimination rénale.</li>
          <li>Variabilité de réponse : sensibilité des récepteurs, feedbacks, progression de la maladie.</li>
          <li>Constat : le « one size fits all » échoue ; place aux modèles pour prévoir et personnaliser.</li>
          <li>Objectif : quantifier l’incertitude et simuler des stratégies de dose.</li>
        </ul>
      </article>

      <article id="approches" use:observe={'approches'} class="panel animated">
        <p class="tag">Panorama</p>
        <h2>Trois approches complémentaires</h2>
        <div class="cards">
          {#each approaches as a}
            <div class="card approach" style={`--accent:${a.color}`}>
              <p class="label">{a.name}</p>
              <p>{a.text}</p>
            </div>
          {/each}
        </div>
        <p class="tip">
          Choisir l’outil dépend du besoin : décrire (NCA), expliquer et simuler (PopPK), extrapoler hors domaine connu
          (PBPK).
        </p>
      </article>

      <article id="modele" use:observe={'modele'} class="panel animated">
        <p class="tag">Modélisation</p>
        <h2>Construire un modèle PK robuste</h2>
        <p class="lead">
          Décrire les flux entre compartiments avec des ODE : la pente est le débit, l’aire sous la courbe l’exposition.
        </p>
        <ul class="grid two">
          <li>Absorption : ordre 1, perfusion (ordre 0), lag time ou transit.</li>
          <li>Distribution : 1, 2 ou 3 compartiments selon les tissus accessibles.</li>
          <li>Élimination : clairance linéaire ou Michaelis-Menten (saturable).</li>
          <li>Métabolisation = élimination du parent même si le métabolite reste présent.</li>
        </ul>
      </article>

      <article id="variabilite" use:observe={'variabilite'} class="panel animated">
        <p class="tag">Variabilité</p>
        <h2>Quantifier et expliquer</h2>
        <div class="grid two">
          <div class="pill">
            <h3>Aléas aléatoires</h3>
            <p>IIV (entre individus) et IOV (entre occasions) modélisés via effets aléatoires exponentiels.</p>
            <p>Erreur résiduelle : additive, proportionnelle ou mixte — bruit analytique et erreurs d’administration.</p>
          </div>
          <div class="pill">
            <h3>Covariables</h3>
            <p>Poids (allométrie : CL × (WT/70)^0.75 ; V × (WT/70)^1), âge, sexe, créatinine, génétique.</p>
            <p>Workflow : forward (ΔOFV -3.84) puis backward (ΔOFV +6.63). Attention au shrinkage &gt; 30 %.</p>
          </div>
        </div>
      </article>

      <article id="diagnostics" use:observe={'diagnostics'} class="panel animated">
        <p class="tag">Diagnostics</p>
        <h2>Valider le modèle</h2>
        <ul class="grid two">
          <li>Obs vs PRED et IPRED : biais globaux et individuels.</li>
          <li>IWRES : nuage centré sur 0 ; en banane = mauvaise structure ; éventail = erreur mal spécifiée.</li>
          <li>VPC : crash test via simulations (médiane, 5e/95e). Si les données sortent des bandes, on révise.</li>
          <li>Bootstrap (x500–1000) : intervalle de confiance des paramètres.</li>
          <li>FIM : détecter corrélations, vérifier identifiabilité.</li>
        </ul>

        <div class="vpc">
          <div class="vpc__header">
            <div>
              <p class="tag small">VPC interactif</p>
              <h3>Monte-Carlo simplifié</h3>
              <p>Jouez sur l’erreur résiduelle pour voir l’impact sur la bande prédictive.</p>
            </div>
            <label class="slider">
              Erreur résiduelle : {residualCV} %
              <input type="range" min="5" max="35" step="1" bind:value={residualCV} />
            </label>
          </div>

          <LayerCake
            data={vpcData}
            x="time"
            y="sim50"
            yDomain={[0, vpcMax]}
            padding={{ left: 48, right: 16, top: 10, bottom: 32 }}
            let:xScale
            let:yScale
            let:width
            let:height
          >
            <Svg>
              <defs>
                <linearGradient id="band" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.7" />
                  <stop offset="100%" stop-color="#a5b4fc" stop-opacity="0.25" />
                </linearGradient>
              </defs>

              {#if vpcData.length}
                <polygon
                  fill="url(#band)"
                  stroke="none"
                  points={`${vpcData
                    .map((d) => `${xScale(d.time)},${yScale(d.sim95)}`)
                    .join(' ')} ${[...vpcData]
                    .reverse()
                    .map((d) => `${xScale(d.time)},${yScale(d.sim05)}`)
                    .join(' ')}`}
                  opacity="0.9"
                />

                <polyline
                  fill="none"
                  stroke="#ef4444"
                  stroke-width="2.5"
                  points={vpcData.map((d) => `${xScale(d.time)},${yScale(d.sim50)}`).join(' ')}
                />

                <g>
                  {#each vpcIndividuals as pt}
                    <circle cx={xScale(pt.time)} cy={yScale(pt.c)} r="3" fill="#0ea5e9" opacity="0.65" />
                  {/each}
                </g>

                <polyline
                  fill="none"
                  stroke="#111827"
                  stroke-width="2"
                  points={vpcData.map((d) => `${xScale(d.time)},${yScale(d.obsMedian)}`).join(' ')}
                />

                {#if xScale && yScale}
                  <line
                    x1={xScale.range()[0]}
                    y1={yScale.range()[0]}
                    x2={xScale.range()[1]}
                    y2={yScale.range()[0]}
                    stroke="#0f172a"
                  />
                  <line
                    x1={xScale.range()[0]}
                    y1={yScale.range()[0]}
                    x2={xScale.range()[0]}
                    y2={yScale.range()[1]}
                    stroke="#0f172a"
                  />
                  {#each xScale.ticks(6) as t}
                    <line
                      x1={xScale(t)}
                      x2={xScale(t)}
                      y1={yScale.range()[0]}
                      y2={yScale.range()[0] + 6}
                      stroke="#94a3b8"
                    />
                    <text
                      x={xScale(t)}
                      y={yScale.range()[0] + 18}
                      font-size="10"
                      text-anchor="middle"
                      fill="#475569"
                    >
                      {t} h
                    </text>
                  {/each}
                  {#each yScale.ticks(5) as t}
                    <line
                      x1={xScale.range()[0]}
                      x2={xScale.range()[0] - 6}
                      y1={yScale(t)}
                      y2={yScale(t)}
                      stroke="#94a3b8"
                    />
                    <text
                      x={xScale.range()[0] - 10}
                      y={yScale(t) + 4}
                      font-size="10"
                      text-anchor="end"
                      fill="#475569"
                    >
                      {t.toFixed(1)} µg/L
                    </text>
                  {/each}
                {/if}
              {/if}
            </Svg>
          </LayerCake>
          <p class="tip">
            Si les observations (points bleus) sortent durablement de la bande 5–95 %, le modèle est insuffisant pour
            simuler un essai clinique.
          </p>
        </div>
      </article>

      <article id="pkpd2" use:observe={'pkpd2'} class="panel animated">
        <p class="tag">PK → PD</p>
        <h2>Relier concentration et effet</h2>
        <p class="lead">
          Effets directs (même Tmax) ou indirects (décalage via compartiment effet ou turnover). Les fonctions Emax
          deviennent non linéaires : gare aux interprétations trop simples.
        </p>
        <ul class="grid two">
          <li>Compartiment effet (Schneider) pour décaler l’effet vs PK.</li>
          <li>Turnover : la molécule agit sur la production ou la dégradation de la réponse.</li>
          <li>Piège : si les données ne couvrent que 20–80 % d’Emax, on peut croire à une relation linéaire.</li>
        </ul>
      </article>

      <article id="ia" use:observe={'ia'} class="panel animated">
        <p class="tag">IA & ML</p>
        <h2>Accélérer avec l’IA</h2>
        <ul class="grid two">
          <li>Random Forest / VSURF pour cribler des dizaines de biomarqueurs avant la modélisation.</li>
          <li>XGBoost pour prédire l’AUC à partir de quelques prélèvements (TDM) sans ODE explicite.</li>
          <li>Neural ODE : garde les compartiments connus et apprend le reste (cycle entéro-hépatique, tumeurs).</li>
          <li>Clustering d’EBE : découvrir phénotypes « fast » vs « slow » métabolizers.</li>
        </ul>
        <div class="ai-box">
          <div class="toggle">
            <button class:active={aiMode === 'white'} on:click={() => (aiMode = 'white')}>Modèle classique</button>
            <button class:active={aiMode === 'grey'} on:click={() => (aiMode = 'grey')}>Neural ODE</button>
          </div>
          <svg viewBox="0 0 320 170">
            <line x1="30" y1="140" x2="300" y2="140" stroke="#1a1a1a" />
            <line x1="30" y1="20" x2="30" y2="140" stroke="#1a1a1a" />
            {#each realData as point}
              <circle cx={30 + point.t * 11} cy={140 - point.c * 10} r="2.5" fill="#457b9d" />
            {/each}
            <polyline
              fill="none"
              stroke={aiMode === 'grey' ? '#2a9d8f' : '#e76f51'}
              stroke-width="3"
              stroke-dasharray={aiMode === 'grey' ? '0' : '6 6'}
              points={aiPrediction.map((p) => `${30 + p.t * 11},${140 - p.c * 10}`).join(' ')}
            />
            <text x="45" y="32" font-size="11" fill="#457b9d">● Données patient</text>
            <text x="45" y="48" font-size="11" fill={aiMode === 'grey' ? '#2a9d8f' : '#e76f51'}>
              — Modèle {aiMode === 'grey' ? 'Neural ODE (adapté)' : 'classique (rigide)'}
            </text>
          </svg>
          <p class="tip">
            Quand la physiologie connue ne suffit plus, on hybride : la partie ODE reste interprétable, la partie apprise
            capture la complexité manquante.
          </p>
        </div>
      </article>

      <article id="cas" use:observe={'cas'} class="panel animated">
        <p class="tag">Cas clinique</p>
        <h2>Titrage du tacrolimus</h2>
        <p class="lead">
          Données anonymisées d’un patient greffé rénal. Objectif : maintenir le C0 entre 7 et 10 µg/L tout en limitant
          la toxicité.
        </p>

        <div class="case-grid">
          <div class="pill">
            <h3>Données patient</h3>
            <ul class="bullet">
              <li>ID : {clinicalCase.id} — {clinicalCase.contexte}</li>
              <li>Âge {clinicalCase.patient.age} ans · {clinicalCase.patient.poids} kg · Sexe {clinicalCase.patient.sexe}</li>
              <li>Créatinine : {clinicalCase.patient.creat} mg/dL</li>
              <li>Médicament : {clinicalCase.molecule}</li>
              <li>Régimen : {clinicalCase.regimen}</li>
              <li>Objectif : {clinicalCase.objectif}</li>
            </ul>
          </div>

          <div class="pill chart-box">
            <h3>Courbe individuelle</h3>
            <svg viewBox="0 0 320 180">
              <line x1="40" y1="150" x2="300" y2="150" stroke="#0f172a" />
              <line x1="40" y1="20" x2="40" y2="150" stroke="#0f172a" />
              <polyline
                fill="none"
                stroke="#2563eb"
                stroke-width="3"
                points={caseSamples.map((p) => `${40 + p.t * 18},${150 - p.c * 10}`).join(' ')}
              />
              {#each caseSamples as p}
                <circle cx={40 + p.t * 18} cy={150 - p.c * 10} r="3.5" fill="#1d4ed8" />
              {/each}
              <line x1="40" x2="300" y1={150 - 7 * 10} y2={150 - 7 * 10} stroke="#22c55e" stroke-dasharray="4 4" />
              <line x1="40" x2="300" y1={150 - 10 * 10} y2={150 - 10 * 10} stroke="#22c55e" stroke-dasharray="4 4" />
              <text x="45" y={150 - 7 * 10 - 6} font-size="10" fill="#16a34a">Cible 7–10 µg/L</text>
            </svg>
          </div>
        </div>

        <div class="pill recommendations">
          <h3>Interprétation rapide</h3>
          <ul class="bullet">
            <li>C0 actuel : {trough.toFixed(1)} µg/L {needReduction ? '(au-dessus de la cible)' : '(dans la cible)'}.</li>
            <li>Profil absorption : pic précoce 2 h puis décroissance mono-exponentielle.</li>
            <li>Covariables pertinentes : poids, créatinine, délai post-greffe, co-médications (non listées ici).</li>
            <li>Action proposée : {needReduction ? 'réduire' : 'maintenir'} de 10–15 % et recontrôler à J+3.</li>
          </ul>
        </div>
      </article>
    </div>
  </section>

  <section class="simu panel animated">
    <div>
      <p class="tag">Mini simulateur</p>
      <h2>Ajuster la dose en 1 clic</h2>
      <p>Jouez sur la dose, le volume et la clairance pour visualiser l’impact sur l’exposition.</p>
      <div class="controls">
        <label>Dose {dose} mg<input type="range" min="25" max="400" step="5" bind:value={dose} /></label>
        <label>Volume {volume} L<input type="range" min="10" max="80" step="1" bind:value={volume} /></label>
        <label>Clairance {cl} L/h<input type="range" min="1" max="20" step="0.5" bind:value={cl} /></label>
      </div>
    </div>
    <div class="chart-box">
      <svg viewBox="0 0 360 200">
        <line x1="40" y1="170" x2="330" y2="170" stroke="#111" />
        <line x1="40" y1="20" x2="40" y2="170" stroke="#111" />
        <polyline
          fill="none"
          stroke="#e76f51"
          stroke-width="3"
          points={concentrations.map((p) => `${40 + p.t * 12},${170 - (p.c / maxC) * 130}`).join(' ')}
        />
      </svg>
    </div>
  </section>

  <section class="resources panel animated">
    <div>
      <p class="tag">Ressources</p>
      <h2>Aller plus loin</h2>
      <ul>
        <li><a href={deckHref} download>Télécharger le deck complet (PPTX, 74 slides)</a></li>
        <li>Tests recommandés : `npm run check` puis `npm run build`.</li>
        <li>Déployer sur GitHub Pages : adapter-static + `BASE_PATH=/pharmacometrie-explain` dans le workflow.</li>
      </ul>
    </div>
    <div class="pill">
      <h3>Idées de prochaines étapes</h3>
      <ul>
        <li>Ajouter des VPC par sous-groupe (poids, fonction rénale).</li>
        <li>Brancher un mode « résumé étudiant » en 10 diapositives clés.</li>
        <li>Importer un jeu de données CSV pour générer le VPC en direct.</li>
      </ul>
    </div>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
    background: radial-gradient(circle at 20% 20%, #eef4ff 0, #f8f9ff 35%, #ffffff 70%);
    color: #0f172a;
  }
  :global(a) {
    color: inherit;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 20px 96px;
  }

  .hero {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 32px;
    align-items: center;
    margin-bottom: 56px;
    position: relative;
    overflow: hidden;
  }
  .hero::after {
    content: '';
    position: absolute;
    inset: -30% 10% auto auto;
    width: 360px;
    height: 360px;
    background: radial-gradient(circle, #2563eb33, transparent 60%);
    filter: blur(40px);
    z-index: 0;
  }
  .hero__text {
    position: relative;
    z-index: 1;
  }
  .hero__text h1 {
    font-size: clamp(2.2rem, 3vw, 3.2rem);
    margin: 8px 0 16px;
  }
  .hero__text .lede {
    font-size: 1.05rem;
    line-height: 1.6;
    color: #334155;
  }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    color: #2563eb;
    margin: 0;
  }
  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 20px 0;
  }
  .cta {
    text-decoration: none;
    padding: 12px 18px;
    border-radius: 12px;
    font-weight: 600;
  }
  .cta.primary {
    background: linear-gradient(120deg, #2563eb, #10b981);
    color: white;
    box-shadow: 0 10px 30px rgba(37, 99, 235, 0.2);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .cta.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 38px rgba(37, 99, 235, 0.25);
  }
  .cta.ghost {
    border: 1px solid #cbd5e1;
    color: #0f172a;
    background: white;
  }
  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .metric {
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }
  .metric span {
    display: block;
    font-weight: 700;
    font-size: 1.1rem;
  }
  .metric small {
    color: #475569;
  }

  .hero__viz {
    position: relative;
    min-height: 280px;
    z-index: 1;
  }
  .bubble {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.55;
    animation: float 12s ease-in-out infinite alternate;
  }
  .bubble-a {
    width: 160px;
    height: 160px;
    background: #2563eb;
    top: -20px;
    right: 30px;
  }
  .bubble-b {
    width: 120px;
    height: 120px;
    background: #22c55e;
    bottom: -10px;
    left: 20px;
    animation-duration: 14s;
  }
  .card.glass {
    position: relative;
    padding: 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(10px);
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
    z-index: 1;
  }
  .card.glass .tiny {
    margin: 0 0 6px;
    color: #475569;
    font-size: 0.9rem;
  }
  .mini-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    font-size: 0.9rem;
  }
  .mini-grid strong {
    font-size: 0.95rem;
  }

  .content {
    display: grid;
    grid-template-columns: 230px 1fr;
    gap: 24px;
  }
  @media (max-width: 900px) {
    .content {
      grid-template-columns: 1fr;
    }
    .rail {
      position: static;
      top: auto;
    }
  }

  .rail {
    position: sticky;
    top: 24px;
    align-self: start;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: white;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  }
  .rail__title {
    margin: 0 0 8px;
    font-weight: 700;
    color: #0f172a;
  }
  .rail ol {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 6px;
  }
  .rail li {
    border-radius: 10px;
  }
  .rail li a {
    display: block;
    padding: 8px 10px;
    text-decoration: none;
    color: #0f172a;
    border-radius: 10px;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .rail li.active a {
    background: #2563eb10;
    color: #2563eb;
    font-weight: 700;
  }

  .flow {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .panel {
    padding: 28px;
    border-radius: 16px;
    background: white;
    border: 1px solid #e2e8f0;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  }
  .tag {
    font-size: 0.85rem;
    font-weight: 700;
    color: #2563eb;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 6px;
  }
  .tag.small {
    font-size: 0.75rem;
  }
  .lead {
    font-size: 1.05rem;
    color: #334155;
    line-height: 1.6;
  }
  .grid.two {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
    padding: 0;
    margin: 16px 0 0;
    list-style: disc inside;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin: 16px 0;
  }
  .card.approach {
    padding: 16px;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, #ffffff) 0, #fff 80%);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card.approach:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  }
  .card.approach .label {
    font-weight: 700;
    color: var(--accent);
    margin: 0 0 6px;
  }

  .tip {
    background: #f8fafc;
    border-left: 4px solid #2563eb;
    padding: 12px 14px;
    border-radius: 10px;
    color: #334155;
  }

  .pill {
    border: 1px solid #e2e8f0;
    padding: 16px;
    border-radius: 14px;
    background: #f8fafc;
  }
  .pill h3 {
    margin-top: 0;
  }

  .ai-box {
    margin-top: 18px;
    padding: 16px;
    border-radius: 14px;
    background: #f9fafb;
    border: 1px solid #e2e8f0;
  }
  .toggle {
    display: inline-flex;
    gap: 8px;
    margin-bottom: 10px;
  }
  .toggle button {
    border: 1px solid #cbd5e1;
    background: white;
    padding: 8px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  .toggle button.active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }

  .vpc {
    margin-top: 18px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 16px;
    background: linear-gradient(180deg, #ffffff, #f8fbff);
    box-shadow: inset 0 1px 0 #ffffff;
  }
  .vpc__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }
  .slider {
    font-weight: 600;
    color: #0f172a;
  }
  .vpc input[type='range'] {
    width: 180px;
    accent-color: #2563eb;
    vertical-align: middle;
    margin-left: 8px;
  }

  .simu {
    margin-top: 36px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    align-items: center;
  }
  .controls {
    display: grid;
    gap: 10px;
  }
  .controls label {
    font-weight: 600;
    display: block;
  }
  input[type='range'] {
    width: 100%;
    accent-color: #2563eb;
  }
  .chart-box {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: white;
    padding: 10px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  }

  .resources {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .resources ul {
    padding-left: 16px;
    color: #334155;
  }
  .resources a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }

  .case-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
    margin: 12px 0;
  }
  .bullet {
    padding-left: 16px;
    color: #334155;
  }
  .recommendations {
    margin-top: 12px;
  }

  .animated {
    animation: fadeUp 0.75s ease both;
  }
  .fade-in {
    animation: fadeIn 1s ease both;
  }
  @keyframes float {
    from {
      transform: translateY(0px);
    }
    to {
      transform: translateY(-12px);
    }
  }
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
