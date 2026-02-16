<script>
  export let title = 'Quiz';
  /** @type {{prompt:string, options:string[], correct:number}[]} */
  export let questions = [];
  /** @type {Record<number, number>} */
  let answers = {};

  const check = () => {
    return questions.map((q, i) => ({
      correct: answers[i] === q.correct,
      text: q.options[answers[i]] ?? ''
    }));
  };
</script>

<div class="quiz">
  <h4>{title}</h4>
  {#each questions as q, i}
    <div class="q">
      <p>{q.prompt}</p>
      {#each q.options as opt, j}
        <label>
          <input type="radio" name={`q-${i}`} value={j} bind:group={answers[i]} />
          {opt}
        </label>
      {/each}
    </div>
  {/each}
  {#if questions.length}
  <div class="result">
    {#each check() as res, k}
      <span class:ok={res.correct} class:nok={!res.correct}>Q{k + 1}: {res.correct ? '✔' : '✖'}</span>
    {/each}
  </div>
  {/if}
</div>

<style>
  .quiz {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    background: #f8fafc;
  }
  h4 {
    margin: 0 0 8px;
  }
  .q {
    margin-bottom: 8px;
  }
  label {
    display: block;
    font-size: 0.95rem;
    color: #0f172a;
  }
  .result {
    display: flex;
    gap: 6px;
    font-weight: 700;
  }
  .ok {
    color: #22c55e;
  }
  .nok {
    color: #ef4444;
  }
</style>
