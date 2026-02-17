<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  /** @type {{id:string, title?:string, content?:string}[]} */
  export let steps = [];
  export let threshold = Array.from({ length: 21 }, (_, i) => i / 20); // 0..1 every 5%

  const dispatch = createEventDispatcher();
  /** @type {HTMLElement[]} */
  let stepRefs = [];
  /** @type {IntersectionObserver | null} */
  let observer = null;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = /** @type {HTMLElement} */ (entry.target);
          const id = target.dataset.step;
          dispatch('progress', { id, ratio: entry.intersectionRatio });
          if (entry.isIntersecting) {
            dispatch('enter', { id, ratio: entry.intersectionRatio });
          } else {
            dispatch('exit', { id, ratio: entry.intersectionRatio });
          }
        });
      },
      { threshold }
    );

    stepRefs.forEach((el) => el && observer && observer.observe(el));
  });

  onDestroy(() => {
    if (observer) observer.disconnect();
  });
</script>

<div class="scrolly">
  <div class="scrolly__steps">
    {#each steps as step, i}
      <section
        class="step"
        bind:this={stepRefs[i]}
        data-step={step.id}
        aria-label={`Étape ${step.id}`}
      >
        <p class="step__title">{step.title || step.id}</p>
        <p class="step__body" aria-live="polite">{@html step.content}</p>
      </section>
    {/each}
  </div>
  <div class="scrolly__viz">
    <slot name="viz" />
  </div>
</div>

<style>
  .scrolly {
    display: grid;
    grid-template-columns: minmax(320px, 40%) 1fr;
    gap: 20px;
  }
  .scrolly__steps {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .step {
    padding: 16px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
  .step__title {
    margin: 0 0 6px;
    font-weight: 700;
    color: #0f172a;
  }
  .step__body {
    margin: 0;
    color: #475569;
    line-height: 1.4;
  }
  .scrolly__viz {
    position: sticky;
    top: 20px;
    min-height: 420px;
    border-radius: 16px;
    background: white;
    border: 1px solid #e2e8f0;
    box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
    overflow: hidden;
  }
</style>
