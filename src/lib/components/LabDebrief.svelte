<script>
  export let en = false;
  export let explanation = { fr: '', en: '' };
  export let application = { question: { fr: '', en: '' }, options: [], answer: 0, feedback: { fr: '', en: '' } };
  let reasoning = '';
  let revealed = false;
  let choice = '';
  /** @param {{ en: string, fr: string }} value */
  function text(value) { return en ? value.en : value.fr; }
</script>

<section class="debrief" data-testid="laboratory-debrief">
  <div class="step"><span>04</span><div><strong>{en ? 'Explain' : 'Expliquer'}</strong><p>{en ? 'Describe the mechanism in your own words before comparing with the scientific debrief.' : 'Décrivez le mécanisme avec vos mots avant de comparer avec le débrief scientifique.'}</p></div></div>
  <textarea bind:value={reasoning} rows="3" placeholder={en ? 'My explanation...' : 'Mon explication...'} aria-label={en ? 'Your explanation' : 'Votre explication'}></textarea>
  <button type="button" disabled={!reasoning.trim()} on:click={() => revealed = true}>{en ? 'Compare my explanation' : 'Comparer mon explication'}</button>
  {#if revealed}<p class="feedback" data-testid="laboratory-explanation">{text(explanation)}</p>{/if}

  <div class="step application"><span>05</span><div><strong>{en ? 'Apply' : 'Appliquer'}</strong><p>{text(application.question)}</p></div></div>
  <select bind:value={choice} aria-label={en ? 'Application answer' : "Réponse d'application"}>
    <option value="">{en ? 'Choose' : 'Choisir'}</option>
    {#each application.options as option, index}<option value={String(index)}>{text(option)}</option>{/each}
  </select>
  {#if choice !== ''}<p class:correct={Number(choice) === application.answer} class="feedback">{Number(choice) === application.answer ? (en ? 'Correct. ' : 'Exact. ') : (en ? 'Review the mechanism. ' : 'Revoir le mécanisme. ')}{text(application.feedback)}</p>{/if}
</section>

<style>
  .debrief { display:grid; gap:10px; margin-top:22px; padding:18px 0; border-top:1px solid var(--border-strong); border-bottom:1px solid var(--border-subtle); }
  .step { display:grid; grid-template-columns:34px 1fr; gap:10px; align-items:start; }
  .step > span { color:#087b83; font:700 12px/1.4 var(--font-mono); }
  .step strong { font-size:14px; }
  .step p { margin:3px 0 0; color:var(--text-secondary); font-size:12px; line-height:1.5; }
  .application { margin-top:10px; }
  textarea, select { width:100%; box-sizing:border-box; padding:9px; color:var(--text-primary); background:var(--bg-primary); border:1px solid var(--border-strong); border-radius:4px; font:inherit; }
  button { width:max-content; min-height:36px; padding:8px 11px; color:var(--text-primary); background:var(--bg-tertiary); border:1px solid var(--border-strong); border-radius:4px; cursor:pointer; }
  button:disabled { opacity:.5; cursor:default; }
  .feedback { margin:0; padding-left:10px; border-left:3px solid var(--warning); color:var(--text-secondary); font-size:12px; line-height:1.55; }
  .feedback.correct { border-color:var(--success); }
</style>
