<script>
  import { language } from '$lib/stores/language';
  import { ui } from '$lib/i18n/translations';

  $: copy = ui($language);
</script>

<h1>{copy.pages.aboutTitle}</h1>
<p>{copy.pages.aboutText}</p>
<ul>
  {#each copy.pages.aboutItems as item}
    <li>{item}</li>
  {/each}
 </ul>

<style>
  ul {
    color: #334155;
  }
</style>
