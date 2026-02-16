<script>
  const stages = [
    { name: 'Thresholding', desc: 'Filtre les variables faibles', color: '#2563eb' },
    { name: 'Interpretation', desc: 'Garde les variables stables', color: '#f97316' },
    { name: 'Prediction', desc: 'Optimise le modèle final', color: '#22c55e' }
  ];
  const vars = ['Poids', 'Âge', 'CYP3A5', 'CrCl', 'Albumine', 'Fumeur'];
</script>

<div class="vsurf">
  <div class="stages">
    {#each stages as s}
      <div class="stage">
        <div class="dot" style={`background:${s.color}`}></div>
        <div>
          <strong>{s.name}</strong>
          <p>{s.desc}</p>
        </div>
      </div>
    {/each}
  </div>
  <div class="bars">
    {#each vars as v, i}
      <div class="bar">
        <span>{v}</span>
        <div class="track">
          <div class="fill" style={`width:${60 + (i % 3) * 10}%`}></div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .vsurf {
    display: grid;
    gap: 12px;
  }
  .stages {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 8px;
  }
  .stage {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    align-items: center;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px 10px;
    background: #fff;
  }
  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
  }
  .bars {
    display: grid;
    gap: 6px;
  }
  .bar {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 8px;
    align-items: center;
  }
  .track {
    height: 10px;
    background: #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: linear-gradient(90deg, #2563eb, #22c55e);
  }
</style>
