<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import chapters from '$lib/content/loadChapters';
  import SlideImage from '$lib/components/SlideImage.svelte';

  // viz mapping (ajoutez ici si besoin)
  import HumanBody from '$lib/components/visualizations/01_HumanBody.svelte';
  import BucketSim from '$lib/components/visualizations/02_BucketSim.svelte';
  import ThreeApproaches from '$lib/components/visualizations/04_ThreeApproaches.svelte';
  import PK1C from '$lib/components/visualizations/09_PK1C.svelte';
  import Variability from '$lib/components/visualizations/12_VariabilitySandbox.svelte';
  import Allometry from '$lib/components/visualizations/14_AllometryCentering.svelte';
  import VPC from '$lib/components/visualizations/17_VPCCrashTest.svelte';
  import NeuralBox from '$lib/components/visualizations/20_NeuralBox.svelte';

  /** @type {Record<string, any>} */
  const vizMap = {
    '01_HumanBody': HumanBody,
    '02_BucketSim': BucketSim,
    '04_ThreeApproaches': ThreeApproaches,
    '09_PK1C': PK1C,
    '12_VariabilitySandbox': Variability,
    '14_AllometryCentering': Allometry,
    '17_VPCCrashTest': VPC,
    '20_NeuralBox': NeuralBox
  };

  export let params;
  const chapter = chapters.find((c) => c.slug === params.slug);
  let activeIndex = 0;
  $: currentStep = chapter?.steps?.[activeIndex];

  onMount(() => {
    if (!chapter) window.location.href = `${base}/404.html`;
  });
</script>

{#if !chapter}
  <p>Chapitre introuvable.</p>
{:else}
  <header class="page-head">
    <p class="tag">{chapter.id}</p>
    <h1>{chapter.title}</h1>
    <p class="desc">{chapter.description}</p>
  </header>

  <div class="layout">
    <div class="steps">
      {#each chapter.steps as step, i}
        <article class={`step ${i === activeIndex ? 'active' : ''}`} on:mouseenter={() => (activeIndex = i)}>
          <div class="step-header">
            <span class="badge">Étape {i + 1}</span>
            <h3>{step.title}</h3>
          </div>
          <div class="step-body">{@html step.html}</div>
          {#if step.slides?.length}
            <div class="slides-row">
              {#each step.slides as sid}
                <SlideImage n={Number(sid.replace('s', ''))} alt={`Slide ${sid}`} />
              {/each}
            </div>
          {/if}
        </article>
      {/each}
    </div>

    <aside class="sticky">
      {#if currentStep?.viz && vizMap[currentStep.viz]}
        <svelte:component this={vizMap[currentStep.viz]} />
      {:else if currentStep?.slides?.length}
        <SlideImage n={Number(currentStep.slides[0].replace('s', ''))} />
      {/if}
    </aside>
  </div>
{/if}

<style>
  .page-head {
    margin-bottom: 20px;
  }
  .tag {
    font-size: 0.9rem;
    color: #2563eb;
    margin: 0;
  }
  .desc {
    color: #475569;
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(320px, 1fr) minmax(320px, 420px);
    gap: 18px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .sticky {
      position: static;
    }
  }
  .steps {
    display: grid;
    gap: 12px;
  }
  .step {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    background: #fff;
  }
  .step.active {
    border-color: #2563eb;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
  }
  .step-header {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .badge {
    background: #eef2ff;
    color: #4338ca;
    padding: 4px 6px;
    border-radius: 8px;
    font-weight: 700;
  }
  .step-body :global(p) {
    margin: 6px 0;
    color: #334155;
  }
  .slides-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
    margin-top: 8px;
  }
  .sticky {
    position: sticky;
    top: 80px;
  }
</style>
