<script>
  export let chapterSlug = '';
  export let stepTitle = '';

  /** @type {Record<string, string>} */
  const commonCaption = {
    'pourquoi-pharmacometrie': 'Follow the blocks: dose becomes concentration, then concentration becomes effect.',
    'trois-approches': 'The same data can be described, modeled as a population, or rebuilt from physiology.',
    'clairance-volume-demi-vie': 'Volume changes dilution. Clearance changes emptying speed. Half-life is their ratio.',
    'absorption-orale': 'Oral dosing is input plus output: absorption brings blocks in while clearance removes them.',
    'variabilite-iiv-iov': 'The model separates between-patient differences, within-patient changes, and measurement noise.',
    allometrie: 'Covariates turn measured patient features into interpretable parameter changes.',
    'validation-vpc': 'A VPC asks whether simulated worlds look like the observed one.',
    pkpd: 'Effect rises with concentration, then saturates when targets are filled.',
    'outils-estimation': 'Estimation is an iterative loop: data, model, algorithm, diagnostics.',
    'bayes-ebes': 'Bayesian updating moves from population expectation toward patient evidence.',
    'neural-ode': 'Grey-box modeling keeps the mechanism and learns only the missing piece.',
    tdm: 'TDM is a cycle: measure, update, predict, then decide with clinical context.'
  };

  $: caption = commonCaption[chapterSlug] ?? 'Animated concept for this chapter.';
</script>

<section class="animation-shell" aria-label={`Animated concept: ${stepTitle}`}>
  {#if chapterSlug === 'pourquoi-pharmacometrie'}
    <div class="stage pkpd-stage">
      <div class="lane">
        <div class="zone dose">Dose</div>
        <div class="zone pk">PK<br /><span>body handles drug</span></div>
        <div class="zone pd">PD<br /><span>drug creates effect</span></div>
      </div>
      <span class="moving-block b1"></span>
      <span class="moving-block b2"></span>
      <span class="moving-block b3"></span>
      <div class="effect-meter"><i></i></div>
    </div>

  {:else if chapterSlug === 'trois-approches'}
    <div class="stage approaches-stage">
      <svg viewBox="0 0 420 210" role="img" aria-label="Animated concentration curve">
        <path class="axis" d="M42 172 H390 M42 172 V28" />
        <path class="curve draw" d="M45 160 C80 62 122 48 170 76 C225 110 280 130 380 146" />
        <circle class="traveller" r="7" />
      </svg>
      <div class="method-cards">
        <div class="pulse one"><strong>NCA</strong><span>measure AUC</span></div>
        <div class="pulse two"><strong>PopPK</strong><span>learn variability</span></div>
        <div class="pulse three"><strong>PBPK</strong><span>rebuild physiology</span></div>
      </div>
    </div>

  {:else if chapterSlug === 'clairance-volume-demi-vie'}
    <div class="stage tank-stage">
      <div class="tank">
        <div class="water"></div>
        <span class="label-v">V</span>
        <span class="floating-block f1"></span>
        <span class="floating-block f2"></span>
        <span class="floating-block f3"></span>
      </div>
      <div class="tap">
        <strong>CL</strong>
        <span></span>
        <i class="drop d1"></i><i class="drop d2"></i><i class="drop d3"></i>
      </div>
      <div class="half-life">t1/2 = 0.693 x V / CL</div>
    </div>

  {:else if chapterSlug === 'absorption-orale'}
    <div class="stage oral-stage">
      <div class="gut">Gut depot<br /><strong>Ka</strong></div>
      <div class="plasma">Plasma</div>
      <div class="clearance">CL</div>
      <span class="pill p1"></span><span class="pill p2"></span><span class="pill p3"></span>
      <svg viewBox="0 0 420 150" aria-label="Animated oral concentration curve">
        <path class="axis" d="M34 124 H390 M34 124 V22" />
        <path class="curve oral-draw" d="M40 124 C88 118 100 44 155 50 C220 58 260 98 380 116" />
      </svg>
    </div>

  {:else if chapterSlug === 'variabilite-iiv-iov'}
    <div class="stage variability-stage">
      <div class="patient-row">
        <div class="person a">A</div><div class="person b">B</div><div class="person c">C</div>
      </div>
      <svg viewBox="0 0 420 220" aria-label="Animated variability curves">
        <path class="axis" d="M35 185 H390 M35 185 V28" />
        <path class="curve c1" d="M40 52 C115 78 185 130 375 172" />
        <path class="curve c2" d="M40 84 C120 100 210 144 375 182" />
        <path class="curve c3" d="M40 35 C108 60 190 96 375 150" />
        <circle class="noise n1" r="5" cx="140" cy="112" />
        <circle class="noise n2" r="5" cx="230" cy="138" />
        <circle class="noise n3" r="5" cx="318" cy="161" />
      </svg>
    </div>

  {:else if chapterSlug === 'allometrie'}
    <div class="stage allometry-stage">
      <div class="weight-bars">
        <div class="bar small"><span>20 kg</span></div>
        <div class="bar mid"><span>70 kg</span></div>
        <div class="bar big"><span>120 kg</span></div>
      </div>
      <svg viewBox="0 0 420 190" aria-label="Animated allometric curve">
        <path class="axis" d="M42 155 H390 M42 155 V28" />
        <path class="curve allometry-draw" d="M45 145 C112 120 190 82 380 42" />
      </svg>
      <div class="formula">CL = CL70 x (WT / 70)^0.75</div>
    </div>

  {:else if chapterSlug === 'validation-vpc'}
    <div class="stage vpc-stage">
      <svg viewBox="0 0 440 240" aria-label="Animated VPC">
        <path class="axis" d="M42 198 H405 M42 198 V30" />
        <path class="band upper" d="M50 96 C115 70 190 85 255 112 C310 133 360 126 398 112" />
        <path class="band lower" d="M50 152 C115 126 190 138 255 162 C310 182 360 176 398 164" />
        <path class="curve median" d="M50 124 C120 98 185 110 255 137 C320 160 358 150 398 138" />
        <circle class="obs o1" cx="82" cy="130" r="6" />
        <circle class="obs o2" cx="148" cy="103" r="6" />
        <circle class="obs o3" cx="222" cy="146" r="6" />
        <circle class="obs o4" cx="310" cy="170" r="6" />
        <circle class="obs o5" cx="374" cy="126" r="6" />
      </svg>
      <div class="badge">Observed inside simulated envelope?</div>
    </div>

  {:else if chapterSlug === 'pkpd'}
    <div class="stage emax-stage">
      <svg viewBox="0 0 430 230" aria-label="Animated Emax curve">
        <path class="axis" d="M40 188 H390 M40 188 V30" />
        <path class="plateau-line" d="M42 55 H390" />
        <path class="curve emax-draw" d="M42 184 C92 154 125 104 176 78 C238 47 300 54 390 56" />
        <line class="ec50-line" x1="170" y1="188" x2="170" y2="100" />
        <text x="182" y="104">EC50</text>
        <text x="318" y="48">Emax</text>
      </svg>
      <div class="receptor">
        <span class="slot filled"></span><span class="slot filled late"></span><span class="slot filled later"></span><span class="slot"></span>
      </div>
    </div>

  {:else if chapterSlug === 'outils-estimation'}
    <div class="stage estimation-stage">
      <div class="loop">
        <div class="node data">Data</div>
        <div class="node model">Model</div>
        <div class="node estimate">Estimate</div>
        <div class="node diagnose">Diagnose</div>
        <span class="orbit"></span>
      </div>
    </div>

  {:else if chapterSlug === 'bayes-ebes'}
    <div class="stage bayes-stage">
      <div class="distribution prior"><span>Population prior</span></div>
      <div class="sample-dot"></div>
      <div class="distribution posterior"><span>Patient posterior</span></div>
      <div class="arrow-update">update</div>
    </div>

  {:else if chapterSlug === 'neural-ode'}
    <div class="stage greybox-stage">
      <div class="box ode">Mechanistic ODE</div>
      <div class="plus">+</div>
      <div class="box nn">Neural correction</div>
      <div class="signal"></div>
      <svg viewBox="0 0 420 130" aria-label="Animated grey-box prediction">
        <path class="axis" d="M36 106 H390 M36 106 V24" />
        <path class="curve baseline" d="M40 94 C120 80 210 74 380 70" />
        <path class="curve correction" d="M40 94 C105 80 150 26 210 74 C265 115 314 78 380 70" />
      </svg>
    </div>

  {:else if chapterSlug === 'tdm'}
    <div class="stage tdm-stage">
      <div class="cycle">
        <div class="step s1">Measure</div>
        <div class="step s2">Update</div>
        <div class="step s3">Predict</div>
        <div class="step s4">Decide</div>
        <span class="cycle-dot"></span>
      </div>
    </div>
  {/if}

  <p class="caption">{caption}</p>
</section>

<style>
  .animation-shell {
    --pk: #b85c38;
    --pd: #2f7d74;
    --blue: #4f6f8f;
    --green: #384b34;
    --purple: #715c8c;
    --gold: #9a7a20;
    display: grid;
    gap: var(--space-4);
  }

  .stage {
    min-height: 430px;
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    background:
      linear-gradient(to right, rgba(26,28,29,0.045) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(26,28,29,0.045) 1px, transparent 1px),
      var(--bg-primary);
    background-size: 34px 34px;
    border: 1px solid var(--border-subtle);
    padding: var(--space-5);
  }

  .caption {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .lane {
    position: absolute;
    inset: 72px 28px auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  .zone, .node, .box, .step, .gut, .plasma, .clearance {
    min-height: 82px;
    display: grid;
    place-items: center;
    text-align: center;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-tertiary);
    font-weight: 850;
  }

  .zone span { color: var(--text-secondary); font-size: var(--text-xs); font-weight: 600; }
  .zone.dose { border-top: 5px solid var(--pk); }
  .zone.pk { border-top: 5px solid var(--blue); }
  .zone.pd { border-top: 5px solid var(--pd); }

  .moving-block, .pill {
    position: absolute;
    width: 34px;
    height: 24px;
    border-radius: 5px;
    background: var(--pk);
    box-shadow: inset 0 7px 0 rgba(255,255,255,0.25);
  }

  .moving-block {
    top: 238px;
    left: 8%;
    animation: travel 5s linear infinite;
  }
  .b2 { animation-delay: 1.1s; background: var(--blue); }
  .b3 { animation-delay: 2.2s; background: var(--pd); }

  .effect-meter {
    position: absolute;
    left: 72%;
    right: 8%;
    bottom: 68px;
    height: 22px;
    border-radius: 999px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-secondary);
    overflow: hidden;
  }
  .effect-meter i {
    display: block;
    height: 100%;
    background: var(--pd);
    animation: meter 5s ease-in-out infinite;
  }

  svg {
    width: 100%;
    height: auto;
  }
  .axis {
    fill: none;
    stroke: var(--border-strong);
    stroke-width: 2;
  }
  .curve {
    fill: none;
    stroke: var(--pk);
    stroke-width: 5;
    stroke-linecap: round;
  }
  .draw, .oral-draw, .allometry-draw, .emax-draw, .median, .baseline, .correction {
    stroke-dasharray: 620;
    stroke-dashoffset: 620;
    animation: draw 4.8s ease-in-out infinite;
  }
  .traveller {
    fill: var(--pk);
    offset-path: path("M45 160 C80 62 122 48 170 76 C225 110 280 130 380 146");
    animation: follow 4.8s ease-in-out infinite;
  }

  .method-cards, .patient-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }
  .method-cards div, .person {
    min-height: 90px;
    display: grid;
    place-items: center;
    text-align: center;
    border-radius: 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
  }
  .method-cards span { color: var(--text-secondary); font-size: var(--text-xs); }
  .pulse { animation: pulse-card 4.8s ease-in-out infinite; }
  .two { animation-delay: 1.6s; }
  .three { animation-delay: 3.2s; }

  .tank {
    position: absolute;
    left: 12%;
    bottom: 82px;
    width: 160px;
    height: 245px;
    border: 5px solid var(--blue);
    border-top: 0;
    border-radius: 0 0 18px 18px;
    background: #fff;
    overflow: hidden;
  }
  .water {
    position: absolute;
    inset: auto 0 0;
    height: 72%;
    background: linear-gradient(180deg, rgba(79,111,143,0.25), rgba(79,111,143,0.72));
    animation: water-level 5s ease-in-out infinite;
  }
  .label-v {
    position: absolute;
    inset: auto 0 16px;
    text-align: center;
    color: var(--blue);
    font-weight: 900;
  }
  .floating-block {
    position: absolute;
    width: 22px;
    height: 18px;
    border-radius: 4px;
    background: var(--pk);
    animation: bob 2.8s ease-in-out infinite;
  }
  .f1 { left: 34px; bottom: 92px; }
  .f2 { left: 82px; bottom: 132px; animation-delay: 0.6s; }
  .f3 { left: 112px; bottom: 72px; animation-delay: 1.1s; }
  .tap {
    position: absolute;
    left: 58%;
    top: 130px;
    display: grid;
    gap: var(--space-2);
    justify-items: center;
    color: var(--green);
  }
  .tap span {
    width: 116px;
    height: 18px;
    border-radius: 999px;
    background: var(--green);
  }
  .drop {
    width: 10px;
    height: 18px;
    border-radius: 999px;
    background: var(--green);
    animation: drop 1s linear infinite;
  }
  .d2 { animation-delay: 0.25s; }
  .d3 { animation-delay: 0.5s; }
  .half-life, .formula, .badge, .arrow-update {
    position: absolute;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    padding: var(--space-2) var(--space-3);
    border-radius: 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .oral-stage .gut { position: absolute; left: 7%; top: 45px; width: 120px; border-top: 5px solid var(--pk); }
  .oral-stage .plasma { position: absolute; left: 40%; top: 45px; width: 120px; border-top: 5px solid var(--blue); }
  .oral-stage .clearance { position: absolute; right: 7%; top: 45px; width: 120px; border-top: 5px solid var(--green); }
  .oral-stage svg { position: absolute; left: 5%; right: 5%; bottom: 20px; width: 90%; }
  .pill {
    top: 130px;
    left: 12%;
    animation: oral-pill 4s linear infinite;
  }
  .p2 { animation-delay: 1.2s; background: var(--blue); }
  .p3 { animation-delay: 2.4s; background: var(--green); }

  .person {
    color: #fff;
    background: var(--blue);
    font-weight: 900;
    animation: person-pop 3s ease-in-out infinite;
  }
  .person.b { animation-delay: 0.7s; background: var(--pk); }
  .person.c { animation-delay: 1.4s; background: var(--pd); }
  .variability-stage .curve {
    animation: draw 4s ease-in-out infinite;
  }
  .c2 { stroke: var(--blue); animation-delay: .35s; }
  .c3 { stroke: var(--pd); animation-delay: .7s; }
  .noise {
    fill: var(--gold);
    animation: jitter 1.4s ease-in-out infinite;
  }
  .n2 { animation-delay: 0.4s; }
  .n3 { animation-delay: 0.8s; }

  .weight-bars {
    position: absolute;
    left: 7%;
    right: 52%;
    bottom: 74px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
    align-items: end;
    height: 230px;
  }
  .bar {
    display: grid;
    align-items: end;
    justify-items: center;
    border-radius: 8px 8px 0 0;
    color: #fff;
    background: var(--blue);
    animation: grow-bar 4s ease-in-out infinite;
  }
  .bar span { padding: 6px; font-size: var(--text-xs); font-weight: 800; }
  .small { height: 36%; }
  .mid { height: 63%; animation-delay: .35s; background: var(--pk); }
  .big { height: 88%; animation-delay: .7s; background: var(--pd); }
  .allometry-stage svg { position: absolute; right: 5%; top: 86px; width: 48%; }

  .band {
    fill: none;
    stroke: rgba(79,111,143,0.38);
    stroke-width: 38;
    stroke-linecap: round;
    animation: band-pulse 3s ease-in-out infinite;
  }
  .lower { animation-delay: .4s; }
  .median { stroke: var(--blue); stroke-width: 4; }
  .obs {
    fill: var(--pk);
    animation: obs-pop 3s ease-in-out infinite;
  }
  .o2 { animation-delay: .25s; }
  .o3 { animation-delay: .5s; }
  .o4 { animation-delay: .75s; }
  .o5 { animation-delay: 1s; }

  .plateau-line {
    stroke: rgba(47,125,116,0.35);
    stroke-width: 3;
    stroke-dasharray: 7 8;
  }
  .emax-draw { stroke: var(--pd); }
  .ec50-line {
    stroke: var(--gold);
    stroke-width: 3;
    stroke-dasharray: 6 5;
    animation: ec50 3s ease-in-out infinite;
  }
  text {
    fill: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: 14px;
  }
  .receptor {
    display: flex;
    gap: 10px;
    position: absolute;
    left: 50%;
    bottom: 32px;
    transform: translateX(-50%);
  }
  .slot {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 3px solid var(--pd);
  }
  .filled {
    background: var(--pd);
    animation: fill-slot 3s ease-in-out infinite;
  }
  .late { animation-delay: .6s; }
  .later { animation-delay: 1.2s; }

  .loop {
    position: absolute;
    inset: 50px;
  }
  .node {
    position: absolute;
    width: 118px;
    height: 82px;
  }
  .data { left: 5%; top: 10%; border-top: 5px solid var(--blue); }
  .model { right: 5%; top: 10%; border-top: 5px solid var(--pk); }
  .estimate { right: 5%; bottom: 10%; border-top: 5px solid var(--purple); }
  .diagnose { left: 5%; bottom: 10%; border-top: 5px solid var(--pd); }
  .orbit {
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--pk);
    offset-path: path("M80 45 H310 V250 H80 Z");
    animation: orbit 5s linear infinite;
  }

  .distribution {
    position: absolute;
    width: 150px;
    height: 120px;
    bottom: 96px;
    display: grid;
    place-items: end center;
    padding-bottom: 12px;
    border-bottom: 5px solid var(--blue);
    background: radial-gradient(ellipse at center bottom, rgba(79,111,143,.42), transparent 65%);
    font-weight: 800;
  }
  .prior { left: 9%; }
  .posterior {
    right: 9%;
    border-bottom-color: var(--pd);
    background: radial-gradient(ellipse at center bottom, rgba(47,125,116,.42), transparent 65%);
    animation: posterior-shift 4s ease-in-out infinite;
  }
  .sample-dot {
    position: absolute;
    left: 47%;
    top: 120px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--pk);
    animation: sample-move 4s ease-in-out infinite;
  }
  .arrow-update { bottom: 56px; }

  .greybox-stage .box {
    position: absolute;
    top: 44px;
    width: 140px;
    height: 92px;
  }
  .ode { left: 8%; border-top: 5px solid var(--blue); }
  .nn { right: 8%; border-top: 5px solid var(--purple); animation: nn-glow 2s ease-in-out infinite; }
  .plus {
    position: absolute;
    top: 74px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 34px;
    color: var(--text-muted);
    font-weight: 900;
  }
  .greybox-stage svg { position: absolute; left: 6%; right: 6%; bottom: 38px; width: 88%; }
  .baseline { stroke: rgba(79,111,143,.45); stroke-width: 4; }
  .correction { stroke: var(--purple); stroke-width: 5; animation-delay: .4s; }
  .signal {
    position: absolute;
    right: 28%;
    top: 82px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--purple);
    animation: signal 1.4s ease-in-out infinite;
  }

  .cycle {
    position: absolute;
    inset: 54px;
  }
  .step {
    position: absolute;
    width: 132px;
    height: 82px;
    animation: cycle-pulse 4.8s ease-in-out infinite;
  }
  .s1 { left: 0; top: 0; border-top: 5px solid var(--blue); }
  .s2 { right: 0; top: 0; border-top: 5px solid var(--pk); animation-delay: 1.2s; }
  .s3 { right: 0; bottom: 0; border-top: 5px solid var(--purple); animation-delay: 2.4s; }
  .s4 { left: 0; bottom: 0; border-top: 5px solid var(--pd); animation-delay: 3.6s; }
  .cycle-dot {
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--pk);
    offset-path: path("M66 42 H315 V242 H66 Z");
    animation: orbit 4.8s linear infinite;
  }

  @keyframes travel {
    0% { transform: translateX(0) scale(.8); opacity: 0; }
    10% { opacity: 1; }
    48% { transform: translateX(250px) scale(1); }
    82% { transform: translateX(500px) scale(1); opacity: 1; }
    100% { transform: translateX(560px) scale(.8); opacity: 0; }
  }
  @keyframes meter { 0%,20% { width: 8%; } 70%,100% { width: 88%; } }
  @keyframes draw { 0% { stroke-dashoffset: 620; } 45%,80% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -620; } }
  @keyframes follow { 0% { offset-distance: 0%; opacity: 0; } 15%,80% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
  @keyframes pulse-card { 0%,100% { transform: translateY(0); border-color: var(--border-subtle); } 28% { transform: translateY(-8px); border-color: var(--pk); } }
  @keyframes water-level { 0%,100% { height: 72%; } 50% { height: 38%; } }
  @keyframes bob { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(7deg); } }
  @keyframes drop { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(80px); opacity: 0; } }
  @keyframes oral-pill { 0% { transform: translateX(0); opacity: 0; } 15% { opacity: 1; } 65% { transform: translateX(230px); opacity: 1; } 100% { transform: translateX(420px); opacity: 0; } }
  @keyframes person-pop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
  @keyframes jitter { 0%,100% { transform: translate(0,0); } 50% { transform: translate(9px,-8px); } }
  @keyframes grow-bar { 0%,100% { transform: scaleY(.72); transform-origin: bottom; } 50% { transform: scaleY(1); transform-origin: bottom; } }
  @keyframes band-pulse { 0%,100% { opacity: .45; } 50% { opacity: .9; } }
  @keyframes obs-pop { 0%,100% { transform: scale(.8); opacity: .75; } 45% { transform: scale(1.25); opacity: 1; } }
  @keyframes ec50 { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
  @keyframes fill-slot { 0%,25% { transform: scale(.75); opacity: .35; } 60%,100% { transform: scale(1); opacity: 1; } }
  @keyframes orbit { to { offset-distance: 100%; } }
  @keyframes posterior-shift { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-18px); } }
  @keyframes sample-move { 0% { transform: translateX(-120px); opacity: 0; } 35%,75% { opacity: 1; } 100% { transform: translateX(120px); opacity: 0; } }
  @keyframes nn-glow { 0%,100% { box-shadow: none; } 50% { box-shadow: 0 0 0 8px rgba(113,92,140,.14); } }
  @keyframes signal { 0%,100% { transform: scale(.7); opacity: .35; } 50% { transform: scale(1.4); opacity: 1; } }
  @keyframes cycle-pulse { 0%,100% { transform: scale(1); } 20% { transform: scale(1.06); } }

  @media (max-width: 640px) {
    .stage { min-height: 520px; }
    .lane, .method-cards, .patient-row {
      grid-template-columns: 1fr;
    }
    .method-cards { margin-top: 210px; }
    .moving-block { animation-name: travel-mobile; }
    .tank { left: 50%; transform: translateX(-50%); }
    .tap { display: none; }
    .oral-stage .gut, .oral-stage .plasma, .oral-stage .clearance {
      position: static;
      width: auto;
      margin-bottom: var(--space-2);
    }
    .oral-stage svg { bottom: 18px; }
    .weight-bars { right: 7%; }
    .allometry-stage svg { display: none; }
    .node, .step { width: 108px; }
  }

  @keyframes travel-mobile {
    0% { transform: translateY(0); opacity: 0; }
    20% { opacity: 1; }
    80% { transform: translateY(240px); opacity: 1; }
    100% { transform: translateY(280px); opacity: 0; }
  }
</style>
