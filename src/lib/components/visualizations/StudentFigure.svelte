<script>
  export let chapterSlug = '';
  export let stepTitle = '';

  $: title = stepTitle || 'Concept map';

  const palettes = {
    pk: '#b85c38',
    pd: '#2f7d74',
    blue: '#4f6f8f',
    green: '#384b34',
    purple: '#715c8c',
    red: '#9b3d45',
    gold: '#9a7a20'
  };
</script>

<section class="student-figure" aria-label={`Student illustration: ${title}`}>
  {#if chapterSlug === 'pourquoi-pharmacometrie'}
    <header>
      <p>PK/PD big picture</p>
      <h3>Dose becomes exposure, exposure becomes effect</h3>
    </header>
    <div class="flow">
      <div class="brick-stack" aria-hidden="true">
        <span class="brick pk">Dose</span>
        <span class="brick pk">Dose</span>
        <span class="brick pk">Dose</span>
      </div>
      <span class="connector">-></span>
      <div class="station">
        <strong>PK</strong>
        <span>Absorb, distribute, clear</span>
      </div>
      <span class="connector">-></span>
      <div class="station pd">
        <strong>PD</strong>
        <span>Benefit or toxicity</span>
      </div>
    </div>
    <p class="caption">A model is the instruction sheet that links the blocks to the final response.</p>

  {:else if chapterSlug === 'trois-approches'}
    <header>
      <p>Choosing the right map</p>
      <h3>Same data, three questions</h3>
    </header>
    <div class="three">
      <div><strong>NCA</strong><span>Measure the finished build</span><em>descriptive</em></div>
      <div><strong>PopPK</strong><span>Learn the class rulebook</span><em>variability</em></div>
      <div><strong>PBPK</strong><span>Draw the full building plan</span><em>physiology</em></div>
    </div>
    <p class="caption">Start from the question; the method follows.</p>

  {:else if chapterSlug === 'clairance-volume-demi-vie'}
    <header>
      <p>One-compartment intuition</p>
      <h3>Volume dilutes, clearance removes</h3>
    </header>
    <div class="tank">
      <div class="vessel">
        <div class="level"></div>
        <span>V</span>
      </div>
      <div class="drain">
        <span>CL</span>
        <div class="pipe"></div>
        <div class="drops"><i></i><i></i><i></i></div>
      </div>
    </div>
    <div class="formula">t1/2 = 0.693 x V / CL</div>
    <p class="caption">Half-life changes when the room size or cleanup speed changes.</p>

  {:else if chapterSlug === 'absorption-orale'}
    <header>
      <p>Oral absorption</p>
      <h3>The curve rises because blocks must enter first</h3>
    </header>
    <div class="route">
      <div class="depot">Gut depot<br /><strong>Ka</strong></div>
      <span class="connector">-></span>
      <div class="station">Plasma<br /><strong>concentration</strong></div>
      <span class="connector">-></span>
      <div class="station clear">Elimination<br /><strong>CL</strong></div>
    </div>
    <div class="mini-curve"><span></span></div>
    <p class="caption">Tlag delays the start; Ka controls the entry speed.</p>

  {:else if chapterSlug === 'variabilite-iiv-iov'}
    <header>
      <p>Variability layers</p>
      <h3>Different builders, different days, imperfect photos</h3>
    </header>
    <div class="builders">
      <div><strong>IIV</strong><span>Student A != Student B</span></div>
      <div><strong>IOV</strong><span>Monday != Friday</span></div>
      <div><strong>Error</strong><span>Blurry measurement</span></div>
    </div>
    <p class="caption">Do not call every mismatch noise.</p>

  {:else if chapterSlug === 'allometrie'}
    <header>
      <p>Covariates</p>
      <h3>Measured features explain part of variability</h3>
    </header>
    <div class="scale">
      <div class="person small">20 kg</div>
      <div class="curve"></div>
      <div class="person medium">70 kg</div>
      <div class="curve high"></div>
      <div class="person large">120 kg</div>
    </div>
    <div class="formula">CL = CL70 x (WT / 70)^0.75</div>
    <p class="caption">Centering keeps the typical parameter interpretable.</p>

  {:else if chapterSlug === 'validation-vpc'}
    <header>
      <p>Diagnostics</p>
      <h3>Can the model reproduce the class?</h3>
    </header>
    <div class="vpc">
      <div class="band"></div>
      <span class="obs a"></span><span class="obs b"></span><span class="obs c"></span><span class="obs d"></span>
      <span class="axis x"></span><span class="axis y"></span>
    </div>
    <p class="caption">A VPC compares observed data with many simulated worlds.</p>

  {:else if chapterSlug === 'pkpd'}
    <header>
      <p>Concentration to effect</p>
      <h3>More blocks help until the target saturates</h3>
    </header>
    <div class="emax">
      <div class="curve-line"></div>
      <div class="plateau">Emax</div>
      <div class="ec50">EC50</div>
    </div>
    <p class="caption">Turnover models add biology when the effect is delayed.</p>

  {:else if chapterSlug === 'outils-estimation'}
    <header>
      <p>Estimation workflow</p>
      <h3>Data plus model plus diagnostics</h3>
    </header>
    <div class="pipeline">
      <div>Data table</div><span>-></span><div>Model</div><span>-></span><div>Estimate</div><span>-></span><div>Diagnose</div>
    </div>
    <p class="caption">Software searches; the modeler interprets.</p>

  {:else if chapterSlug === 'bayes-ebes'}
    <header>
      <p>Bayesian update</p>
      <h3>Population knowledge meets patient data</h3>
    </header>
    <div class="bayes">
      <div class="bell prior">Prior</div>
      <span>+</span>
      <div class="dot">sample</div>
      <span>-></span>
      <div class="bell post">Posterior</div>
    </div>
    <p class="caption">Sparse data pull estimates toward the population: shrinkage matters.</p>

  {:else if chapterSlug === 'neural-ode'}
    <header>
      <p>Grey-box modeling</p>
      <h3>Mechanism first, flexible correction second</h3>
    </header>
    <div class="greybox">
      <div>ODE<br /><strong>known PK</strong></div>
      <span>+</span>
      <div>NN<br /><strong>missing pattern</strong></div>
      <span>-></span>
      <div>Checked<br /><strong>prediction</strong></div>
    </div>
    <p class="caption">The neural part should not erase pharmacology.</p>

  {:else if chapterSlug === 'tdm'}
    <header>
      <p>TDM cycle</p>
      <h3>Measure, update, simulate, decide</h3>
    </header>
    <div class="cycle">
      <div>Measure</div>
      <div>Bayes update</div>
      <div>Predict</div>
      <div>Clinical decision</div>
    </div>
    <p class="caption">The model supports reasoning; it is not a prescription.</p>

  {:else}
    <header>
      <p>Concept map</p>
      <h3>{title}</h3>
    </header>
    <div class="station">Add a dedicated illustration for this chapter.</div>
  {/if}
</section>

<style>
  .student-figure {
    --pk: #b85c38;
    --pd: #2f7d74;
    --blue: #4f6f8f;
    --green: #384b34;
    --purple: #715c8c;
    --gold: #9a7a20;
    display: grid;
    gap: var(--space-5);
    min-height: 430px;
    align-content: center;
  }

  header p {
    margin: 0 0 4px;
    color: var(--accent-pk);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
  }

  h3 {
    margin: 0;
    font-size: var(--text-xl);
    line-height: 1.15;
  }

  .caption {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .flow, .route, .pipeline, .bayes, .greybox {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .connector, .pipeline span, .bayes span, .greybox span {
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-weight: 800;
  }

  .brick-stack {
    display: grid;
    gap: 5px;
  }

  .brick, .station, .depot, .pipeline div, .greybox div, .cycle div {
    border-radius: 8px;
    padding: var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    box-shadow: inset 0 8px 0 rgba(255,255,255,0.22);
    text-align: center;
  }

  .brick {
    display: block;
    min-width: 86px;
    color: #fff;
    background: var(--pk);
    font-weight: 800;
  }

  .station {
    min-width: 130px;
    display: grid;
    gap: 4px;
  }

  .station strong, .depot strong {
    color: var(--pk);
  }

  .station.pd strong {
    color: var(--pd);
  }

  .three, .builders {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .three div, .builders div {
    display: grid;
    gap: var(--space-2);
    min-height: 150px;
    align-content: center;
    padding: var(--space-4);
    border: 1px solid var(--border-subtle);
    border-top: 5px solid var(--pk);
    border-radius: 8px;
    background: var(--bg-primary);
  }

  .three div:nth-child(2), .builders div:nth-child(2) { border-top-color: var(--blue); }
  .three div:nth-child(3), .builders div:nth-child(3) { border-top-color: var(--pd); }
  .three span, .builders span { color: var(--text-secondary); font-size: var(--text-sm); }
  .three em { color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-xs); font-style: normal; }

  .tank {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: var(--space-8);
  }

  .vessel {
    width: 150px;
    height: 220px;
    border: 4px solid var(--blue);
    border-top: 0;
    border-radius: 0 0 18px 18px;
    position: relative;
    overflow: hidden;
    background: #fff;
  }

  .vessel .level {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 58%;
    background: linear-gradient(180deg, rgba(79,111,143,0.25), rgba(79,111,143,0.72));
  }

  .vessel span {
    position: absolute;
    inset: auto 0 12px;
    text-align: center;
    font-weight: 900;
    color: var(--blue);
  }

  .drain {
    display: grid;
    gap: var(--space-2);
    justify-items: center;
    color: var(--green);
    font-weight: 900;
  }

  .pipe {
    width: 90px;
    height: 16px;
    background: var(--green);
    border-radius: 10px;
  }

  .drops {
    display: flex;
    gap: 8px;
  }

  .drops i {
    width: 9px;
    height: 18px;
    border-radius: 9px;
    background: var(--green);
    opacity: 0.75;
  }

  .formula {
    justify-self: center;
    padding: var(--space-2) var(--space-4);
    border-radius: 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .depot {
    background: #fff7ed;
    border-color: rgba(184,92,56,0.35);
  }

  .clear strong {
    color: var(--green);
  }

  .mini-curve, .emax, .vpc {
    height: 180px;
    position: relative;
    border-left: 2px solid var(--border-strong);
    border-bottom: 2px solid var(--border-strong);
    background:
      linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px);
    background-size: 42px 42px;
  }

  .mini-curve span {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 24px;
    height: 120px;
    border-top: 5px solid var(--pk);
    border-radius: 100% 45% 0 0;
    transform: skewX(-12deg);
  }

  .scale {
    display: grid;
    grid-template-columns: 1fr 70px 1.2fr 70px 1.4fr;
    align-items: end;
    gap: var(--space-2);
  }

  .person {
    border-radius: 8px 8px 0 0;
    background: var(--blue);
    color: #fff;
    display: grid;
    place-items: center;
    font-weight: 800;
  }

  .small { height: 76px; }
  .medium { height: 128px; }
  .large { height: 168px; }
  .curve {
    height: 70px;
    border-top: 5px solid var(--gold);
    border-radius: 100% 0 0 0;
  }
  .curve.high { height: 112px; }

  .vpc .band {
    position: absolute;
    left: 12%;
    right: 8%;
    top: 42%;
    height: 54px;
    border-radius: 999px;
    background: rgba(79,111,143,0.22);
    border: 2px solid rgba(79,111,143,0.55);
  }

  .obs {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--pk);
  }
  .obs.a { left: 18%; top: 54%; }
  .obs.b { left: 40%; top: 45%; }
  .obs.c { left: 62%; top: 57%; }
  .obs.d { left: 78%; top: 36%; }

  .emax .curve-line {
    position: absolute;
    left: 12%;
    right: 8%;
    bottom: 28px;
    height: 112px;
    border-top: 6px solid var(--pd);
    border-radius: 100% 0 0 0;
  }
  .plateau, .ec50 {
    position: absolute;
    padding: 4px 8px;
    border-radius: 6px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
  .plateau { right: 12%; top: 18%; }
  .ec50 { left: 42%; bottom: 16%; }

  .bell {
    width: 120px;
    height: 88px;
    display: grid;
    place-items: center;
    background: radial-gradient(ellipse at center bottom, rgba(79,111,143,0.35), transparent 65%);
    border-bottom: 4px solid var(--blue);
    font-weight: 800;
  }
  .post {
    background: radial-gradient(ellipse at center bottom, rgba(47,125,116,0.35), transparent 65%);
    border-bottom-color: var(--pd);
  }
  .dot {
    width: 74px;
    height: 74px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--pk);
    color: #fff;
    font-weight: 800;
  }

  .cycle {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4);
    position: relative;
  }
  .cycle div {
    min-height: 86px;
    display: grid;
    place-items: center;
    font-weight: 800;
  }

  @media (max-width: 640px) {
    .three, .builders, .cycle {
      grid-template-columns: 1fr;
    }

    .scale {
      grid-template-columns: 1fr;
      align-items: stretch;
    }

    .curve {
      display: none;
    }
  }
</style>
