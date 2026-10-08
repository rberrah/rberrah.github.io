<script>
  import { base } from '$app/paths';
  import { ArrowRight } from '@lucide/svelte';
  export let laboratory;
  export let en = false;
  export let lang = 'fr';
  $: id = laboratory.id;
</script>

<a class="laboratory-card" class:compact={laboratory.group !== 'fundamental'} data-testid={`laboratory-link-${id}`} href={`${base}/laboratoires/?lang=${lang}&lab=${id}`}>
  <div class={`journey ${id}`} aria-hidden="true">
    {#if id === 'distribution'}
      <span class="node source">Central</span><i class="track forward"></i><i class="track return"></i><span class="node target">{en ? 'Tissue' : 'Tissu'}</span><i class="track exit"></i><span class="collector">OUT</span>
    {:else if id === 'accumulation'}
      <span class="doses"><i></i><i></i><i></i><i></i></span><i class="track input"></i><span class="node target">Central</span><i class="track exit"></i><span class="collector">OUT</span>
    {:else if id === 'absorption'}
      <span class="node source">{en ? 'Depot' : 'Depot'}</span><i class="track input"></i><span class="node target">Central</span><i class="track loss"></i><span class="collector loss-label">{en ? 'Loss' : 'Perte'}</span><i class="track exit"></i><span class="collector out-label">OUT</span>
    {:else if id === 'infusion'}
      <span class="bag"><i></i></span><i class="track input"></i><span class="node target">Central</span><i class="track exit"></i><span class="collector">OUT</span>
    {:else if id === 'parent-metabolite'}
      <span class="node source">Parent</span><i class="track input"></i><span class="node target">{en ? 'Metabolite' : 'Metabolite'}</span><i class="track exit"></i><span class="collector">OUT</span>
    {:else if id === 'long-acting'}
      <span class="node source">{en ? 'LA depot' : 'Depot LP'}</span><i class="track slow input"></i><span class="node target">Central</span><i class="track exit"></i><span class="collector">OUT</span>
    {:else if id === 'saturable'}
      <span class="node source">Central</span><i class="track input"></i><span class="gate">Vmax</span><span class="node target">OUT</span>
    {:else if id === 'enterohepatic'}
      <span class="cycle-node plasma">Plasma</span><span class="cycle-node bile">Bile</span><span class="cycle-node gut">{en ? 'Gut' : 'Intestin'}</span><i class="cycle-line top"></i><i class="cycle-line down"></i><i class="cycle-line back"></i>
    {:else if id === 'tmdd'}
      <span class="mini-node free">{en ? 'Free drug' : 'Libre'}</span><span class="mini-node target-mini">{en ? 'Target' : 'Cible'}</span><span class="mini-node complex">Complex</span><i class="bind left"></i><i class="bind right"></i><i class="bind internal"></i><span class="collector internal-label">IN</span>
    {:else if id === 'pd-general'}
      <span class="node source">Plasma</span><i class="track signal input"></i><span class="node target">{en ? 'Target' : 'Cible'}</span><i class="track exit"></i><span class="collector">{en ? 'Response' : 'Reponse'}</span>
    {:else if id === 'pd-oncology'}
      <span class="node source">{en ? 'Drug' : 'Medicament'}</span><i class="track signal input"></i><span class="node target">{en ? 'Tumor' : 'Tumeur'}</span><i class="tumor-reference"></i><span class="collector">{en ? 'Without treatment' : 'Sans traitement'}</span>
    {:else if id === 'pd-infectiology'}
      <span class="node source">{en ? 'Antibiotic' : 'Antibiotique'}</span><i class="track signal input"></i><span class="gate">{en ? 'MIC' : 'CMI'}</span><span class="node target">{en ? 'Bacteria' : 'Bacteries'}</span>
    {:else if id === 'covariate-volume'}
      <span class="weight-icon">70 kg</span><i class="track signal input"></i><span class="volume-tank"><i></i></span><span class="collector">V(WT)</span>
    {:else if id === 'covariate-clearance'}
      <span class="gfr-icon">90<small>{en ? 'GFR' : 'DFG'}</small></span><i class="track signal input"></i><span class="kidney-icon"></span><i class="track exit"></i><span class="collector">CL({en ? 'GFR' : 'DFG'})</span>
    {:else}
      <span class="node source">Plasma</span><i class="track signal input"></i><span class="node target">{en ? 'Effect site' : "Site d'effet"}</span><i class="track exit"></i><span class="collector">OUT</span>
    {/if}
    <b class="particle p1"></b><b class="particle p2"></b><b class="particle p3"></b>
  </div>
  <div class="card-meta"><span>{laboratory.number}</span><small>{en ? laboratory.route.en : laboratory.route.fr}</small></div>
  <h2>{en ? laboratory.en.title : laboratory.fr.title}</h2><p>{en ? laboratory.en.text : laboratory.fr.text}</p>
  <strong>{en ? 'Open laboratory' : 'Ouvrir le laboratoire'}<ArrowRight size={17}/></strong>
</a>

<style>
  .laboratory-card { display:grid; grid-template-rows:145px auto auto 1fr auto; min-width:0; padding:18px; color:var(--text-primary); background:var(--bg-primary); text-decoration:none; }
  .laboratory-card.compact { grid-template-rows:120px auto auto 1fr auto; padding:16px; }
  .laboratory-card:hover, .laboratory-card:focus-visible { background:var(--bg-secondary); }.laboratory-card:focus-visible { outline:3px solid var(--accent-pk); outline-offset:3px; }
  h2 { margin:9px 0 5px; font-size:18px; } p { margin:0 0 15px; color:var(--text-secondary); font-size:12px; line-height:1.45; }
  strong { display:flex; align-items:center; gap:6px; color:var(--accent-pk); font-size:12px; }.card-meta { display:flex; justify-content:space-between; margin-top:11px; color:var(--text-secondary); font-size:10px; }.card-meta span { font-family:var(--font-mono); }
  .journey { position:relative; min-height:120px; overflow:hidden; background:#edf6f7; border-bottom:3px solid #087b83; color:#294651; }
  .laboratory-card:not(.compact) .journey { min-height:145px; }
  .node { position:absolute; top:34px; display:grid; place-items:center; width:90px; height:52px; border:2px solid #60848f; background:#fff; font-size:10px; font-weight:700; }.node.source { left:6%; }.node.target { right:7%; }.collector { position:absolute; right:10%; bottom:7px; font:600 9px var(--font-mono); color:#725d7a; }
  .track { position:absolute; display:block; height:4px; background:#9ec7cf; transform-origin:left center; }.track:after, .cycle-line:after, .bind:after { content:''; position:absolute; right:-1px; top:-4px; border-left:8px solid #4b8490; border-top:6px solid transparent; border-bottom:6px solid transparent; }
  .input { left:31%; right:32%; top:59px; }.forward { left:31%; right:32%; top:48px; }.return { left:31%; right:32%; top:76px; transform:rotate(180deg); transform-origin:center; }
  .exit { width:4px; height:32px; right:18%; top:84px; background:#b7a6bc; }.exit:after { top:auto; right:-4px; bottom:-2px; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #725d7a; border-bottom:0; }
  .particle { position:absolute; width:8px; height:8px; border-radius:50%; background:#168d71; border:1px solid #fff; box-shadow:0 0 0 1px #34707a; }.p1 { left:22%; top:54px; }.p2 { left:50%; top:52px; }.p3 { right:15%; top:94px; }
  .doses { position:absolute; left:5%; top:39px; display:flex; gap:4px; }.doses i { width:9px; height:28px; border:1px solid #6e8991; background:#fff; }.doses i:nth-child(-n+3) { background:#d86b3b; }
  .accumulation .target { right:12%; }.accumulation .input { left:24%; right:40%; }.accumulation .exit { right:29%; }
  .loss { width:4px; height:31px; left:17%; top:84px; background:#c68a95; }.loss:after { top:auto; right:-4px; bottom:-2px; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #a65364; border-bottom:0; }.loss-label { left:10%; right:auto; color:#a65364; }.out-label { right:10%; }
  .bag { position:absolute; left:8%; top:26px; width:68px; height:71px; border:2px solid #60848f; background:#fff; }.bag i { position:absolute; left:7px; right:7px; bottom:7px; height:43px; background:#b8ded4; }
  .parent-metabolite .target { border-color:#c97532; }.parent-metabolite .p2 { background:#c97532; }.long-acting .source { border-color:#c97532; }.slow { background:repeating-linear-gradient(90deg,#9ec7cf 0 7px,transparent 7px 12px); }
  .gate { position:absolute; left:50%; top:41px; transform:translateX(-50%); display:grid; place-items:center; width:42px; height:34px; border:2px solid #a26c2a; background:#fff5dc; font:600 9px var(--font-mono); }.saturable .input { left:32%; right:31%; }.saturable .p3 { right:11%; top:55px; }
  .cycle-node { position:absolute; display:grid; place-items:center; width:66px; height:32px; border:2px solid #60848f; background:#fff; font-size:9px; font-weight:700; }.plasma { left:8%; top:20px; }.bile { right:8%; top:20px; border-color:#d29a31; }.gut { right:8%; bottom:15px; border-color:#c97532; }.cycle-line { position:absolute; display:block; height:3px; background:#9ec7cf; }.cycle-line.top { left:32%; right:32%; top:37px; }.cycle-line.down { width:3px; height:31px; right:20%; top:55px; }.cycle-line.down:after { top:auto; right:-4px; bottom:-2px; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #4b8490; border-bottom:0; }.cycle-line.back { left:27%; right:31%; bottom:30px; transform:rotate(180deg); transform-origin:center; }.enterohepatic .p1 { left:45%; top:33px; }.enterohepatic .p2 { right:18%; top:75px; background:#d29a31; }.enterohepatic .p3 { left:45%; top:91px; background:#c97532; }
  .mini-node { position:absolute; display:grid; place-items:center; width:64px; height:30px; border:2px solid #60848f; background:#fff; font-size:8px; font-weight:700; }.free { left:6%; top:15px; }.target-mini { right:6%; top:15px; border-color:#36a36e; }.complex { left:50%; top:66px; transform:translateX(-50%); border-color:#8c4c89; }.bind { position:absolute; display:block; height:3px; background:#9ec7cf; transform-origin:left center; }.bind.left { left:28%; width:25%; top:49px; transform:rotate(24deg); }.bind.right { right:28%; width:25%; top:49px; transform:rotate(156deg); }.bind.internal { left:50%; width:32px; top:97px; transform:rotate(90deg); }.internal-label { right:auto; left:48%; bottom:2px; }.tmdd .p1 { left:26%; top:42px; }.tmdd .p2 { right:26%; top:43px; background:#36a36e; }.tmdd .p3 { left:49%; top:83px; background:#8c4c89; }
  .signal { background:repeating-linear-gradient(90deg,#d26b3a 0 6px,transparent 6px 11px); }.effect-site .target { border-style:dashed; border-color:#d26b3a; }.effect-site .p2 { background:#fff; border-color:#d26b3a; box-shadow:0 0 0 1px #d26b3a; }
  .pd-general .target, .pd-oncology .target, .pd-infectiology .target { border-style:dashed; border-color:#d26b3a; }.pd-general .collector { color:#b2572e; }.pd-oncology .target { border-style:solid; }.pd-oncology .tumor-reference { position:absolute; right:7%; bottom:25px; width:90px; border-top:3px dashed #65767b; }.pd-oncology .collector { right:7%; color:#65767b; }.pd-infectiology .gate { z-index:1; }.pd-infectiology .p3 { right:11%; top:55px; background:#b2572e; }
  .weight-icon { position:absolute; left:7%; top:34px; display:grid; place-items:center; width:72px; height:44px; border-bottom:5px solid #c97532; color:#7c3f29; font:700 10px var(--font-mono); }.volume-tank { position:absolute; right:12%; top:20px; width:82px; height:78px; border:2px solid #147ea5; }.volume-tank i { position:absolute; inset:auto 5px 5px; height:38%; background:#8ccbd5; }.covariate-volume .collector { right:15%; color:#147ea5; }
  .gfr-icon { position:absolute; left:8%; top:29px; display:grid; place-items:center; width:58px; height:58px; border:3px solid #c97532; border-radius:50%; color:#7c3f29; font:700 14px var(--font-mono); }.gfr-icon small { font-size:7px; }.kidney-icon { position:absolute; right:15%; top:25px; width:58px; height:70px; border:3px solid #b2572e; border-radius:55% 45% 55% 45%; background:#d9857355; transform:rotate(12deg); }.covariate-clearance .collector { right:11%; color:#7c3f29; }.covariate-clearance .exit { right:24%; }
  @media(max-width:720px) { .laboratory-card, .laboratory-card.compact { grid-template-rows:120px auto auto 1fr auto; padding:14px; } .journey, .laboratory-card:not(.compact) .journey { min-height:120px; } }
</style>
