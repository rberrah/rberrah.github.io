<script>
  import PK1C from '$lib/components/visualizations/09_PK1C.svelte';
  import VPCCrashTest from '$lib/components/visualizations/17_VPCCrashTest.svelte';
  import ADEChooser from '$lib/components/visualizations/11_ADEChooser.svelte';
  import VariabilitySandbox from '$lib/components/visualizations/12_VariabilitySandbox.svelte';
  import BayesianShrinkage from '$lib/components/visualizations/18_BayesianShrinkage.svelte';
</script>

<h1>Playground PK/PD</h1>
<p>Simule librement les paramètres et observe l’impact.</p>

<div class="grid">
  <section class="card"><PK1C /></section>
  <section class="card"><ADEChooser /></section>
  <section class="card"><VPCCrashTest /></section>
  <section class="card"><VariabilitySandbox /></section>
  <section class="card"><BayesianShrinkage /></section>
</div>

<style>
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
