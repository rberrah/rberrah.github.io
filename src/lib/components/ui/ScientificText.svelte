<script lang="ts">
  let { text = '' }: { text?: string } = $props();
</script>

{#each text.split('×') as part, i}{#if i}<span class="multiplication">×</span>{/if}{part}{/each}

<style>
  /* Keep this operator out of web-font subsets and heading ligatures. */
  .multiplication { font-family: Arial, 'Cambria Math', sans-serif; font-style: normal; font-weight: 400; font-variant: normal; }
</style>
