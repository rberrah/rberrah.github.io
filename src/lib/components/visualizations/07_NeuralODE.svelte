<script>
  export let noise = 0.3;
</script>

<div class="neural">
  <div class="equation">
    C(t) = e<sup>-k t</sup> + <span class="blur">ϵ(t)</span>
    <span class="arrow">→</span>
    <span class="clean">f<sub>NN</sub>(t)</span>
  </div>
  <div class="network">
    {#each Array(4) as _, i}
      <div class="layer" style={`animation-delay:${i * 0.2}s`}>
        {#each Array(4) as __, j}
          <span
            class="node"
            style={`animation-delay:${(i + j) * 0.15}s; animation-duration:${1 + noise}s`}
          ></span>
        {/each}
      </div>
    {/each}
  </div>
  <p class="legend">Le réseau apprend la partie manquante de l’équation (grey box).</p>
</div>

<style>
  .neural {
    display: grid;
    gap: 10px;
    place-items: center;
    text-align: center;
  }
  .equation {
    font-weight: 700;
    font-size: 1.1rem;
    color: #0f172a;
  }
  .blur {
    color: #f97316;
    filter: blur(1px);
    display: inline-block;
  }
  .clean {
    color: #2563eb;
  }
  .arrow {
    margin: 0 10px;
    color: #0f172a;
  }
  .network {
    display: flex;
    gap: 12px;
    background: #0f172a;
    padding: 12px 16px;
    border-radius: 14px;
  }
  .layer {
    display: grid;
    gap: 6px;
    animation: pulse 2.4s ease-in-out infinite;
  }
  .node {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #22c55e;
    animation: glow 1.6s ease-in-out infinite;
  }
  .legend {
    color: #475569;
  }
  @keyframes glow {
    0% {
      opacity: 0.4;
      transform: scale(0.9);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
    100% {
      opacity: 0.4;
      transform: scale(0.9);
    }
  }
  @keyframes pulse {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
    100% {
      transform: translateY(0);
    }
  }
</style>
