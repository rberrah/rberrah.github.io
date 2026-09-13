<script>
  import Laboratory from '$lib/components/Laboratory.svelte';
  import { language } from '$lib/stores/language';
</script>
<svelte:head><title>{$language === 'en' ? 'PK laboratories' : 'Laboratoires PK'} | Pharmacometrie Pratique</title></svelte:head>
<Laboratory />
