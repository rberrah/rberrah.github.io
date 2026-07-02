<script>
  import { glossary } from '$lib/stores/glossary';
  import { get } from 'svelte/store';
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';

  const items = get(glossary);
  $: copy = ui($language);
</script>

<h1>{copy.pages.glossaryTitle}</h1>
<ul class="list">
  {#each items as item}
    <li>
      <strong>{item.term}</strong> — {item.def}
    </li>
  {/each}
</ul>

<style>
  .list {
    list-style: none;
    padding: 0;
  }
  li {
    padding: 6px 0;
    border-bottom: 1px solid #e2e8f0;
  }
</style>
