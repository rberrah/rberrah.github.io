<script>
  import chapters from '$lib/content/chapters';
  import Scrolly from '$lib/components/Scrolly.svelte';
  import Quiz from '$lib/components/ui/Quiz.svelte';
  import SlideImage from '$lib/components/SlideImage.svelte';
  import MathBlock from '$lib/components/MathBlock.svelte';
  import { onMount } from 'svelte';
  import { error } from '@sveltejs/kit';

  export const prerender = true;

  export let params;
  /** @type {import('$lib/content/chapters').Chapter | undefined} */
  let chapter = chapters.find((c) => c.slug === params.slug);
  let stepIndex = 0;
  $: currentViz = chapter?.steps?.[stepIndex]?.viz;

  /** @type {Record<string, any>} */
  let vizComponents = {};
  onMount(async () => {
    vizComponents = {
      '01_HumanBody': (await import('$lib/components/visualizations/01_HumanBody.svelte')).default,
      '02_BucketSim': (await import('$lib/components/visualizations/02_BucketSim.svelte')).default,
      '03_PopulationDistrib': (await import('$lib/components/visualizations/03_PopulationDistrib.svelte')).default,
      '04_ThreeApproaches': (await import('$lib/components/visualizations/04_ThreeApproaches.svelte')).default,
      '05_BayesianFit': (await import('$lib/components/visualizations/05_BayesianFit.svelte')).default,
      '06_DecisionTree': (await import('$lib/components/visualizations/06_DecisionTree.svelte')).default,
      '07_NeuralODE': (await import('$lib/components/visualizations/07_NeuralODE.svelte')).default,
      '08_AUCTrap': (await import('$lib/components/visualizations/08_AUCTrap.svelte')).default,
      '09_PK1C': (await import('$lib/components/visualizations/09_PK1C.svelte')).default,
      '10_PK2C': (await import('$lib/components/visualizations/10_PK2C.svelte')).default,
      '11_ADEChooser': (await import('$lib/components/visualizations/11_ADEChooser.svelte')).default,
      '12_VariabilitySandbox': (await import('$lib/components/visualizations/12_VariabilitySandbox.svelte')).default,
      '13_ResidualError': (await import('$lib/components/visualizations/13_ResidualError.svelte')).default,
      '14_AllometryCentering': (await import('$lib/components/visualizations/14_AllometryCentering.svelte')).default,
      '15_OFVGame': (await import('$lib/components/visualizations/15_OFVGame.svelte')).default,
      '16_SAEMCycle': (await import('$lib/components/visualizations/16_SAEMCycle.svelte')).default,
      '17_VPCCrashTest': (await import('$lib/components/visualizations/17_VPCCrashTest.svelte')).default,
      '18_BayesianShrinkage': (await import('$lib/components/visualizations/18_BayesianShrinkage.svelte')).default,
      '19_VSURF': (await import('$lib/components/visualizations/19_VSURF.svelte')).default,
      '20_NeuralBox': (await import('$lib/components/visualizations/20_NeuralBox.svelte')).default
    };
  });

  if (!chapter) {
    throw error(404, 'Chapitre introuvable');
  }
</script>

<svelte:head>
  <title>{chapter.title} | Pharmaco Explain</title>
</svelte:head>

<article class="page">
  <h1>{chapter.title}</h1>
  <p class="summary">{chapter.summary}</p>

  {#if chapter.slides?.length}
    <div class="slides">
      {#each chapter.slides as s}
        <SlideImage n={s} alt={`Slide ${s}`} caption={`Slide ${s}`} />
      {/each}
    </div>
  {/if}

  <Scrolly
    steps={chapter.steps.map((s, i) => ({ id: String(i), title: s.title, content: s.body }))}
    on:enter={(e) => (stepIndex = Number(e.detail.id))}
  >
    <svelte:fragment slot="viz">
      {#if currentViz}
        {#if vizComponents && vizComponents[currentViz]}
          <svelte:component this={vizComponents[currentViz]} />
        {:else}
          <p>Chargement…</p>
        {/if}
      {/if}
    </svelte:fragment>
  </Scrolly>

  <div class="quiz">
    <Quiz title="Mini-quiz" questions={chapter.quiz} />
  </div>

  {#if chapter.formulas?.length}
    <div class="maths">
      {#each chapter.formulas as f}
        <MathBlock tex={f} />
      {/each}
    </div>
  {/if}
</article>

<style>
  .page {
    display: grid;
    gap: 16px;
  }
  .summary {
    color: #334155;
  }
  .slides {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 10px;
  }
  .quiz {
    margin-top: 16px;
  }
  .maths {
    display: grid;
    gap: 8px;
  }
</style>
