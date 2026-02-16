<script>
  import PK1C from '$lib/components/visualizations/09_PK1C.svelte';
  import ADEChooser from '$lib/components/visualizations/11_ADEChooser.svelte';
  import VariabilitySandbox from '$lib/components/visualizations/12_VariabilitySandbox.svelte';
  import AUCTrap from '$lib/components/visualizations/08_AUCTrap.svelte';
  import VPCCrashTest from '$lib/components/visualizations/17_VPCCrashTest.svelte';
  import BayesianShrinkage from '$lib/components/visualizations/18_BayesianShrinkage.svelte';
</script>

<h1>QA visualisations</h1>
<p>Page interne pour vérifier rapidement les modules avec presets.</p>

<div class="grid">
  <section class="card">
    <h3>AUC trapèzes</h3>
    <AUCTrap />
  </section>
  <section class="card">
    <h3>PK 1C</h3>
    <PK1C />
  </section>
  <section class="card">
    <h3>Absorption</h3>
    <ADEChooser />
  </section>
  <section class="card">
    <h3>Variabilité</h3>
    <VariabilitySandbox />
  </section>
  <section class="card">
    <h3>VPC</h3>
    <VPCCrashTest />
  </section>
  <section class="card">
    <h3>Bayésien</h3>
    <BayesianShrinkage />
  </section>
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
    padding: 10px;
    background: #fff;
  }
</style>
