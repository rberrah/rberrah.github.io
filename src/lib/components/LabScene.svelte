<script>
  // @ts-nocheck - canvas interactions share the tested geometry in particles.js.
  import { onMount, createEventDispatcher } from 'svelte';
  import { Crosshair, LocateFixed, SkipForward, Pipette, Play, Pause } from '@lucide/svelte';
  import { particleJourneys, particlePosition, particleVisit, sceneLayout } from '$lib/labs/particles.js';
  import { schedule } from '$lib/labs/model.js';
  export let lab;
  export let p;
  export let state;
  export let time = 0;
  export let en = false;
  export let reduced = false;
  export let playing = false;
  let canvas, stage, width = 700, mounted = false;
  let tracked = 0, tracking = true, trails = true, probeEnabled = true, doseColors = true;
  let probe = null, dragging = false;
  const dispatch = createEventDispatcher();
  const colors = ['#147ea5', '#de6636', '#7354b0', '#168d71', '#b83b66'];
  $: journeys = particleJourneys(lab, p);
  $: doses = schedule(lab, p);
  $: g = sceneLayout(width, lab);
  $: if (journeys) { tracked = journeys.find(item => item.visits.some(visit => visit.room === 'peripheral'))?.id ?? 0; probe = null; }
  $: roomNames = { central: 'Central', peripheral: en ? 'Peripheral' : 'Périphérique', eliminated: en ? 'Eliminated' : 'Éliminé' };
  $: selected = journeys[tracked];
  $: selectedVisit = selected ? particleVisit(selected, time) : -1;
  $: selectedRoom = selectedVisit < 0 ? (en ? 'Not administered' : 'Non administrée') : roomNames[selected.visits[selectedVisit].room];
  $: nextDose = doses.find(dose => dose.time > time + 1e-8 && dose.time <= p.end);
  $: given = doses.filter(dose => dose.time <= time).length;
  $: probePoint = probe ? { x: probe.x * width, y: probe.y * g.height } : { x: g.rooms.central.x + g.rooms.central.w * .58, y: g.rooms.central.y + g.rooms.central.h * .45 };
  $: probeRoom = ['central', ...(lab === 'distribution' ? ['peripheral'] : [])].find(key => inside(probePoint, g.rooms[key]));
  $: probeValue = probeRoom === 'central' ? state.c : probeRoom === 'peripheral' ? state.cp : null;
  $: massParts = [['central', state.central, '#147ea5'], ...(lab === 'distribution' ? [['peripheral', state.peripheral, '#168d71']] : []), ['eliminated', state.eliminated, '#7d6f84']];

  function inside(point, room) { return point.x >= room.x && point.x <= room.x + room.w && point.y >= room.y && point.y <= room.y + room.h; }
  function nextParticle() {
    const available = journeys.filter(item => item.born <= time);
    tracked = available[(available.findIndex(item => item.id === tracked) + 1) % available.length]?.id ?? 0;
    tracking = true;
  }
  function chooseParticle(event) {
    const rect = canvas.getBoundingClientRect(), point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    let closest = null, distance = 24;
    for (const item of journeys) {
      const pos = particlePosition(item, time, g, reduced); if (!pos) continue;
      const d = Math.hypot(pos.x - point.x, pos.y - point.y);
      if (d < distance) { closest = item; distance = d; }
    }
    if (closest) { tracked = closest.id; tracking = true; }
  }
  function placeProbe(room) {
    if (!g.rooms[room]) return;
    const r = g.rooms[room]; probe = { x: (r.x + r.w * .58) / width, y: (r.y + r.h * .45) / g.height };
  }
  function dragProbe(event) {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    probe = { x: Math.max(16, Math.min(width - 16, event.clientX - rect.left)) / width, y: Math.max(16, Math.min(g.height - 16, event.clientY - rect.top)) / g.height };
  }
  function probeKey(event) {
    const steps = { ArrowLeft: [-10,0], ArrowRight: [10,0], ArrowUp: [0,-10], ArrowDown: [0,10] };
    if (steps[event.key]) {
      event.preventDefault(); const [x,y] = steps[event.key];
      probe = { x: Math.max(16, Math.min(width - 16, probePoint.x + x)) / width, y: Math.max(16, Math.min(g.height - 16, probePoint.y + y)) / g.height };
    }
  }
  function draw() {
    if (!canvas || !mounted || width < 100) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== g.height * ratio) {
      canvas.width = Math.round(width * ratio); canvas.height = g.height * ratio;
    }
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#f0f7fa'; ctx.fillRect(0, 0, width, g.height);
    const clock = reduced ? 0 : time;
    const label = (text, x, y, size = 13, color = '#294651', max = width) => {
      ctx.fillStyle = color; ctx.font = `500 ${size}px Inter, sans-serif`; ctx.textAlign = 'center';
      while (ctx.measureText(text).width > max && size > 8) ctx.font = `500 ${--size}px Inter, sans-serif`;
      ctx.fillText(text, x, y);
    };
    const line = (x1,y1,x2,y2,color,thickness=1) => {
      ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    };
    const ball = (x,y,color,r=4.5,selected=false) => {
      if (selected) { ctx.fillStyle = '#fff9cb'; ctx.beginPath(); ctx.arc(x,y,r+5,0,Math.PI*2); ctx.fill(); ctx.strokeStyle = '#6c5100'; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = selected ? '#71500b' : '#ffffffbb'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#ffffffd0'; ctx.beginPath(); ctx.arc(x-r*.3,y-r*.35,r*.27,0,Math.PI*2); ctx.fill();
    };
    const vessel = (key, title, volume) => {
      const r = g.rooms[key];
      const concentration = key === 'central' ? state.c : state.cp;
      label(title, r.x+r.w/2, r.y-27, 16, '#254b56', r.w+8);
      label(`${Number(volume.toPrecision(4))} L`, r.x+r.w/2, r.y-9, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(r.x,r.y,r.w,r.h);
      ctx.save(); ctx.beginPath(); ctx.rect(r.x+3,r.y+3,r.w-6,r.h-6); ctx.clip();
      ctx.fillStyle = `rgba(35,160,186,${.06 + .18 * Math.min(1, concentration / (p.dose / p.vc))})`;
      ctx.beginPath(); ctx.moveTo(r.x,r.y+12);
      for (let x=0; x<=r.w+4; x+=4) ctx.lineTo(r.x+x,r.y+12+2*Math.sin(x*.045+clock*3));
      ctx.lineTo(r.x+r.w,r.y+r.h); ctx.lineTo(r.x,r.y+r.h); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.strokeStyle = '#688b99'; ctx.lineWidth = 3; ctx.strokeRect(r.x,r.y,r.w,r.h);
      line(r.x-3,r.y,r.x+r.w+3,r.y,'#456b7a',4);
      line(r.x+7,r.y+18,r.x+7,r.y+r.h-12,'#ffffff',3);
      for (let i=1;i<=4;i++) line(r.x+r.w-9,r.y+r.h*i/5,r.x+r.w-2,r.y+r.h*i/5,'#90aeb8');
    };
    const pipe = (x1,y1,x2,y2,rate,reverse=false) => {
      line(x1,y1,x2,y2,'#6d8d99',22); line(x1,y1,x2,y2,'#d9edf3',17);
      line(x1,y1-4,x2,y2-4,'#f7fcfe',2);
      const cx=(x1+x2)/2, cy=(y1+y2)/2;
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(Math.atan2(y2-y1,x2-x1)+(reverse?Math.PI:0));
      ctx.strokeStyle = rate > 0 ? '#39738a' : '#9baeb6'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(-5,-5); ctx.lineTo(1,0); ctx.lineTo(-5,5); ctx.stroke(); ctx.restore();
    };
    const c=g.rooms.central, r=g.rooms.peripheral, e=g.rooms.eliminated;
    vessel('central','Central',p.vc);
    if (lab === 'distribution') {
      vessel('peripheral',en?'Peripheral':'Périphérique',p.vp);
      pipe(c.x+c.w-4,g.forwardY,r.x+4,g.forwardY,state.forward);
      pipe(c.x+c.w-4,g.backwardY,r.x+4,g.backwardY,state.backward,true);
      label(`Q ${Number(p.q.toPrecision(3))}`,g.gapCenter,142,12,'#294651',r.x-c.x-c.w-4);
      label('L/h',g.gapCenter,157,10);
      label(state.forward.toFixed(1),g.gapCenter,g.forwardY+30,12,'#147ea5');
      label('mg/h',g.gapCenter,g.forwardY+44,10);
      label(state.backward.toFixed(1),g.gapCenter,g.backwardY+30,12,'#168d71');
      label('mg/h',g.gapCenter,g.backwardY+44,10);
    } else {
      label(en?'Administrations':'Administrations',r.x+r.w/2,r.y-27,15,'#294651',r.w+8);
      label(`${given} / ${doses.length}`,r.x+r.w/2,r.y-9,12);
      const columns = g.narrow ? 3 : 5;
      doses.forEach((dose,i)=>{
        const x=r.x+(i%columns+.5)*r.w/columns, y=r.y+12+Math.floor(i/columns)*27;
        ctx.fillStyle = i < given ? (doseColors?colors[i%colors.length]:'#147ea5') : '#ffffff';
        ctx.strokeStyle = '#6f8d97'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.roundRect(x-6,y,12,17,3); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#6f8d97'; ctx.fillRect(x-4,y-4,8,4);
      });
      label(nextDose?`${nextDose.time-time < 1 ? (nextDose.time-time).toFixed(1) : (nextDose.time-time).toFixed(0)} h`: (en?'Completed':'Terminé'),r.x+r.w/2,c.y+c.h+26,18,'#147ea5',r.w);
      label(nextDose?(en?'until next bolus':'avant le prochain bolus'):'',r.x+r.w/2,c.y+c.h+43,11,'#294651',r.w+10);
    }
    // Syringe and piston mark the dose event; the numerical IV bolus is instantaneous.
    const syringeX = c.x + 9, syringeY = 22;
    const sinceDose = time - doses[Math.max(0,given-1)].time;
    const piston = Math.min(1, sinceDose / .6);
    ctx.fillStyle='#ffffff'; ctx.fillRect(syringeX,syringeY,18,42); ctx.strokeStyle='#628592'; ctx.lineWidth=2; ctx.strokeRect(syringeX,syringeY,18,42);
    ctx.fillStyle='#45aac0'; ctx.fillRect(syringeX+3,syringeY+5+piston*28,12,32-piston*28);
    line(syringeX+9,syringeY-12+piston*28,syringeX+9,syringeY+5+piston*28,'#4c7281',3);
    line(syringeX-2,syringeY-12+piston*28,syringeX+20,syringeY-12+piston*28,'#4c7281',3);
    line(syringeX+9,syringeY+42,syringeX+9,c.y+18,'#819fa9',2);
    label('IV',c.x+c.w*.67,35,13,'#147ea5',c.w-35);
    label(`${doses[Math.max(0,given-1)].amount} mg`,c.x+c.w*.67,54,13,'#294651',c.w-35);
    label(`${time.toFixed(1)} h`,width-50,29,17);

    ctx.fillStyle='#e9e8ef'; ctx.fillRect(e.x,e.y,e.w,e.h);
    ctx.strokeStyle='#918a9d'; ctx.lineWidth=2; ctx.strokeRect(e.x,e.y,e.w,e.h);
    pipe(g.drainX,c.y+c.h-5,g.drainX,e.y+8,state.eliminationRate);
    const drainTextX = Math.min(width-75,g.drainX+90), drainTextY = (c.y+c.h+e.y)/2;
    label(`CL ${Number(p.cl.toPrecision(3))} L/h`,drainTextX,drainTextY-6,13);
    label(`${state.eliminationRate.toFixed(1)} mg/h`,drainTextX,drainTextY+12,12,'#7a557f');
    label(`${en?'Eliminated':'Éliminé'} : ${state.eliminated.toFixed(1)} mg`,e.x+e.w*.72,e.y-13,13,'#6a5674',e.w*.52);

    const colorFor = item => tracking && item.id===tracked ? '#efb827' : lab==='accumulation' && doseColors ? colors[item.dose%colors.length] : '#147ea5';
    const positioned = journeys.map(item=>({item,pos:particlePosition(item,time,g,reduced)})).filter(item=>item.pos);
    // One selected trajectory plus short local motion trails keeps busy scenes legible.
    if (tracking && trails && selected && !reduced) {
      ctx.strokeStyle='#cc9409'; ctx.lineWidth=2; ctx.beginPath(); let started=false;
      for(let i=30;i>=0;i--) {
        const point=particlePosition(selected,Math.max(selected.born,time-i*.035),g,false);
        if(point) { if(!started)ctx.moveTo(point.x,point.y);else ctx.lineTo(point.x,point.y);started=true; }
      }
      ctx.stroke();
    }
    for (const {item,pos} of positioned.filter(({item})=>!tracking||item.id!==tracked)) {
      if (!reduced && pos.room!=='eliminated') {
        const before=particlePosition(item,Math.max(item.born,time-.035),g,false);
        if(before)line(before.x,before.y,pos.x,pos.y,'#147ea52b',3);
      }
      ball(pos.x,pos.y,pos.room==='eliminated' && !(lab==='accumulation'&&doseColors)?'#918998':colorFor(item),g.narrow?3.6:4.6);
    }
    const tracer = positioned.find(({item})=>tracking&&item.id===tracked);
    if(tracer)ball(tracer.pos.x,tracer.pos.y,'#efb827',g.narrow?5:6,true);
  }
  $: if (mounted) { g; state; time; en; reduced; journeys; tracked; tracking; trails; doseColors; draw(); }
  onMount(()=>{mounted=true;draw();});
</script>

<div class="scene-tools">
  <label><input type="checkbox" bind:checked={tracking}/><LocateFixed size={17}/>{en?'Follow a particle':'Suivre une particule'}</label>
  <button type="button" class="tool" on:click={nextParticle} title={en?'Next particle':'Particule suivante'} aria-label={en?'Next particle':'Particule suivante'}><SkipForward size={18}/></button>
  <label><input type="checkbox" bind:checked={probeEnabled}/><Pipette size={17}/>{en?'Probe':'Sonde'}</label>
  {#if lab==='accumulation'}<label><input type="checkbox" bind:checked={doseColors}/>{en?'Color by dose':'Couleur par dose'}</label>{/if}
</div>
<div class="scene" bind:clientWidth={width} bind:this={stage}>
  <canvas bind:this={canvas} style:height={`${g.height}px`} data-testid="lab-scene" role="button" tabindex="0" on:click={chooseParticle} on:keydown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();nextParticle();}}} aria-label={en?'Select a particle to follow':'Sélectionner une particule à suivre'}></canvas>
  <button class="scene-play" title={playing?(en?'Pause animation':"Suspendre l'animation"):(en?'Start animation':"Lancer l'animation")} aria-label={playing?(en?'Pause animation':"Suspendre l'animation"):(en?'Start animation':"Lancer l'animation")} on:click={()=>dispatch('play')}>{#if playing}<Pause size={22}/>{:else}<Play size={22}/>{/if}</button>
  {#if probeEnabled}
    <button class="probe" style:left={`${probePoint.x}px`} style:top={`${probePoint.y}px`} title={en?'Move concentration probe':'Déplacer la sonde de concentration'} aria-label={en?'Move concentration probe':'Déplacer la sonde de concentration'} on:pointerdown={event=>{dragging=true;event.currentTarget.setPointerCapture(event.pointerId);}} on:pointermove={dragProbe} on:pointerup={()=>dragging=false} on:pointercancel={()=>dragging=false} on:lostpointercapture={()=>dragging=false} on:keydown={probeKey}><Crosshair size={24}/></button>
  {/if}
</div>
<div class="instruments">
  {#if tracking}<div class="tracker" data-testid="particle-readout"><span class="tracer-dot"></span><span>{en?'Particle':'Particule'} {tracked+1}<small>{en?'Dose':'Dose'} {selected?.dose+1} · {selectedRoom}</small></span><label class="trail"><input type="checkbox" bind:checked={trails}/>{en?'Trail':'Trajectoire'}</label></div>{/if}
  {#if probeEnabled}<div class="probe-reading" data-testid="probe-readout"><select aria-label={en?'Probe location':'Emplacement de la sonde'} value={probeRoom??''} on:change={event=>placeProbe(event.currentTarget.value)}><option value="" disabled>{en?'Outside compartment':'Hors compartiment'}</option><option value="central">Central</option>{#if lab==='distribution'}<option value="peripheral">{en?'Peripheral':'Périphérique'}</option>{/if}</select><strong>{probeValue===null?'--':probeValue.toFixed(2)} <small>mg/L</small></strong></div>{/if}
  {#if lab==='accumulation'}<button class="dose-action" disabled={!nextDose} on:click={()=>dispatch('seek',nextDose.time)}><SkipForward size={17}/>{en?'Next dose':'Dose suivante'}</button>{/if}
</div>
<div class="mass-balance" aria-label={en?'Calculated mass balance':'Bilan de masse calculé'}>
  <div class="mass-bar">{#each massParts as [room,amount,color]}<span style:width={`${100*amount/Math.max(1,state.administered)}%`} style:background={color}></span>{/each}</div>
  <div class="mass-values">{#each massParts as [room,amount,color]}<span><i style:background={color}></i>{roomNames[room]} <b>{(100*amount/Math.max(1,state.administered)).toFixed(0)} %</b></span>{/each}</div>
</div>

<style>
  .scene { position:relative; min-width:0; width:100%; background:#f0f7fa; }
  canvas { width:100%; display:block; cursor:crosshair; scroll-margin-top:80px; }
  .scene-tools { display:flex; gap:12px; align-items:center; flex-wrap:wrap; padding:8px 0 12px; }
  .scene-tools label, .trail { display:inline-flex; gap:5px; align-items:center; font-size:12px; }
  input { accent-color:#147ea5; }
  button, select { font:inherit; color:var(--text-primary); border:1px solid var(--border-strong); background:var(--bg-tertiary); border-radius:4px; }
  button { cursor:pointer; } button:disabled { opacity:.5; cursor:default; }
  .tool { width:32px; height:32px; display:grid; place-items:center; }
  .scene-play { position:absolute; right:28px; top:43px; display:grid; place-items:center; width:40px; height:40px; background:#147ea5; color:#fff; border-color:#12627e; border-radius:50%; }
  .probe { position:absolute; transform:translate(-50%,-50%); width:34px; height:34px; padding:4px; background:#fff; color:#212d35; border:2px solid #334854; border-radius:50%; display:grid; place-items:center; cursor:grab; touch-action:none; box-shadow:0 2px 5px #1c394733; }
  .probe:active { cursor:grabbing; }
  button:focus-visible, canvas:focus-visible, select:focus-visible, input:focus-visible { outline:3px solid #147ea5; outline-offset:3px; }
  .instruments { display:flex; gap:12px 20px; align-items:center; justify-content:space-between; flex-wrap:wrap; padding:12px 0; min-height:48px; border-bottom:1px solid var(--border-subtle); }
  .tracker { display:flex; align-items:center; gap:8px; font-size:13px; min-width:0; }
  .tracker small { display:block; font-size:11px; color:var(--text-secondary); min-width:125px; }
  .tracer-dot { width:12px; height:12px; background:#efb827; border:1px solid #71500b; border-radius:50%; flex-shrink:0; }
  .trail { margin-left:8px; }
  .probe-reading { display:flex; align-items:center; gap:10px; min-width:0; }
  .probe-reading select { min-width:0; max-width:175px; padding:6px; font-size:12px; }
  .probe-reading strong { font-size:18px; font-variant-numeric:tabular-nums; white-space:nowrap; }
  .probe-reading small { font-size:11px; font-weight:400; }
  .dose-action { display:flex; gap:6px; align-items:center; padding:8px; font-size:12px; }
  .mass-balance { padding:12px 0 4px; }
  .mass-bar { display:flex; height:7px; width:100%; background:#e5e9ed; overflow:hidden; }
  .mass-values { display:flex; flex-wrap:wrap; gap:8px 18px; margin-top:8px; font-size:11px; }
  .mass-values i { display:inline-block; width:7px; height:7px; margin-right:5px; }
  .mass-values b { margin-left:5px; font-weight:600; font-variant-numeric:tabular-nums; }
  @media(max-width:400px) { .scene-tools { gap:8px; } .scene-tools label { font-size:11px; } .tracker { flex-wrap:wrap; } .probe-reading select { max-width:135px; } .probe-reading strong { font-size:16px; } }
</style>
