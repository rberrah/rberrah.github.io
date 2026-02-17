<script>
  import PopPKPlayground from '$lib/components/visualizations/21_PopPKPlayground.svelte';
  import PK1C from '$lib/components/visualizations/09_PK1C.svelte';
  import VPCCrashTest from '$lib/components/visualizations/17_VPCCrashTest.svelte';
  import ADEChooser from '$lib/components/visualizations/11_ADEChooser.svelte';
  import VariabilitySandbox from '$lib/components/visualizations/12_VariabilitySandbox.svelte';
</script>

<h1>Playground PopPK / PKPD</h1>
<p>Simule en direct : nombre de compartiments, voie d’administration, IIV/IOV, erreur résiduelle, sampling, et export CSV.</p>

<PopPKPlayground />

<h2>Autres modules rapides</h2>
<div class="grid">
  <section class="card"><PK1C /></section>
  <section class="card"><ADEChooser /></section>
  <section class="card"><VPCCrashTest /></section>
  <section class="card"><VariabilitySandbox /></section>
</div>

<style>
  h1 {
    margin-bottom: 4px;
  }
  p {
    margin-bottom: 12px;
  }
  h2 {
    margin: 18px 0 8px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 12px;
  }
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    padding: 12px;
  }
</style>
