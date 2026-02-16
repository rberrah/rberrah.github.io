<script>
  import { glossary } from '$lib/stores/glossary';
  import { get } from 'svelte/store';

  const items = get(glossary);
</script>

<h1>Glossaire</h1>
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
