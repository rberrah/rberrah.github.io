<script>
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';

  export let title = 'Quiz';
  /** @type {{prompt:string, options:string[], correct:number}[]} */
  export let questions = [];
  /** @type {Record<number, number>} */
  let answers = {};

  // Mélange DÉTERMINISTE des options. Sans lui, la bonne réponse était presque toujours en
  // position 0 : devinable sans lire le cours. La permutation est dérivée de l'énoncé (donc
  // stable au re-rendu ET identique en SSR/hydratation) ; `answers` reste indexé sur la
  // position d'ORIGINE, si bien que le calcul du score est inchangé.
  function shuffleOrder(/** @type {string} */ prompt, /** @type {number} */ n) {
    let h = 2166136261;
    for (let k = 0; k < prompt.length; k++) { h ^= prompt.charCodeAt(k); h = Math.imul(h, 16777619); }
    let s = h >>> 0;
    const rand = () => { s += 0x6d2b79f5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return idx;
  }
  $: orders = questions.map((q) => shuffleOrder(q.prompt, q.options.length));

  function choose(/** @type {number} */ qi, /** @type {number} */ oi) {
    answers = { ...answers, [qi]: oi };
  }
  $: answeredCount = Object.keys(answers).length;
  $: score = questions.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);
  $: copy = ui($language).quiz;
</script>

<div class="quiz" data-testid="quiz-block">
  <h4>{title}</h4>
  {#each questions as q, i}
    <div class="q">
      <p class="prompt"><span class="qn">Q{i + 1}.</span> {q.prompt}</p>
      <div class="options">
        {#each orders[i] as j (j)}
          {@const opt = q.options[j]}
          {@const picked = answers[i] === j}
          {@const isCorrect = j === q.correct}
          <button
            type="button"
            class="opt"
            class:picked
            class:correct={answers[i] !== undefined && isCorrect}
            class:wrong={picked && !isCorrect}
            onclick={() => choose(i, j)}
            data-testid="quiz-option-button"
          >
            <span class="dot"></span>{opt}
            {#if answers[i] !== undefined && isCorrect}<span class="tag ok">{copy.correct}</span>{/if}
            {#if picked && !isCorrect}<span class="tag no">{copy.wrong}</span>{/if}
          </button>
        {/each}
      </div>
    </div>
  {/each}

  {#if answeredCount === questions.length && questions.length}
    <p class="score" data-testid="quiz-score" role="status" aria-live="polite">{copy.score}: {score} / {questions.length}</p>
  {/if}
</div>

<style>
  .quiz { background: var(--bg-secondary); border-left: 4px solid var(--accent-ai); padding: var(--space-6); border-radius: 0 8px 8px 0; }
  h4 { margin: 0 0 var(--space-4); font-size: var(--text-lg); }
  .q { margin-bottom: var(--space-6); }
  .q:last-of-type { margin-bottom: 0; }
  .prompt { margin: 0 0 var(--space-3); font-weight: 600; }
  .qn { font-family: var(--font-mono); color: var(--accent-ai); margin-right: 6px; }
  .options { display: grid; gap: var(--space-2); }
  .opt {
    display: flex; align-items: center; gap: var(--space-3); width: 100%; text-align: left;
    padding: var(--space-3) var(--space-4); background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle); border-radius: 6px; cursor: pointer;
    font: inherit; color: var(--text-primary); transition: all 0.15s ease;
  }
  .opt:hover { border-color: var(--border-strong); }
  .dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--border-strong); flex-shrink: 0; }
  .opt.picked .dot { background: var(--accent-ai); border-color: var(--accent-ai); }
  .opt.correct { background: var(--quiz-success-bg); border-color: var(--quiz-success-text); color: var(--quiz-success-text); }
  .opt.correct .dot { background: var(--quiz-success-text); border-color: var(--quiz-success-text); }
  .opt.wrong { background: var(--quiz-error-bg); border-color: var(--quiz-error-text); color: var(--quiz-error-text); }
  .opt.wrong .dot { background: var(--quiz-error-text); border-color: var(--quiz-error-text); }
  .tag { margin-left: auto; font-family: var(--font-mono); font-size: var(--text-xs); }
  .score { margin: var(--space-4) 0 0; font-family: var(--font-mono); font-weight: 600; }
</style>
