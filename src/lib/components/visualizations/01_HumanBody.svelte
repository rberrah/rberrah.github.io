<script>
  export let progress = 0; // 0 -> 1 scroll progression
</script>

<div class="viz">
  <div class="body">
    <div class="particle" style={`transform: translate(${progress * 60}px, ${progress * 80}px); opacity:${1 - progress};`}></div>
    <div class="gauge">
      <div class="bar pk" style={`width:${Math.min(progress * 100, 100)}%`}>PK</div>
      <div class="bar pd" style={`width:${Math.max(0, (progress - 0.4) * 100)}%`}>PD</div>
    </div>
  </div>
  <p class="note">Silhouette SVG + particules : placeholder en attendant l’illustration détaillée.</p>
</div>

<style>
  .viz {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    position: relative;
    background: linear-gradient(180deg, #f8fafc, #eef2ff);
  }
  .body {
    position: relative;
    width: 240px;
    height: 420px;
    border: 2px dashed #cbd5e1;
    border-radius: 120px 120px 60px 60px;
    overflow: hidden;
    background: radial-gradient(circle at 50% 30%, #e0f2fe, #fff);
  }
  .particle {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 12px;
    height: 12px;
    background: #0ea5e9;
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(14, 165, 233, 0.6);
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .gauge {
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    height: 28px;
    background: #e2e8f0;
    border-radius: 14px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2px;
    padding: 2px;
  }
  .bar {
    height: 10px;
    border-radius: 10px;
    color: white;
    font-size: 0.7rem;
    line-height: 10px;
    padding-left: 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .bar.pk {
    background: linear-gradient(90deg, #2563eb, #38bdf8);
  }
  .bar.pd {
    background: linear-gradient(90deg, #a855f7, #ec4899);
    margin-top: 4px;
  }
  .note {
    position: absolute;
    bottom: 8px;
    right: 12px;
    font-size: 0.8rem;
    color: #475569;
  }
</style>
