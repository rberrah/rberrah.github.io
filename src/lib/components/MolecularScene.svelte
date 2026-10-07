<script>
  // @ts-nocheck - canvas geometry is exercised by browser pixel tests.
  import { onMount, createEventDispatcher } from 'svelte';
  import { Play, Pause } from '@lucide/svelte';
  import { molecularLabs } from '$lib/labs/molecular.js';
  export let lab;
  export let p;
  export let state;
  export let time = 0;
  export let en = false;
  export let playing = false;
  export let animateParticles = true;
  let canvas, width = 700, mounted = false;
  const dispatch = createEventDispatcher();
  $: config = molecularLabs[lab];
  $: height = width < 520 ? 470 : 430;

  const pointOn = (edge, fraction, nodes) => {
    const from = nodes[edge.from], to = nodes[edge.to];
    if (!edge.curved) return { x: from.cx + (to.cx - from.cx) * fraction, y: from.cy + (to.cy - from.cy) * fraction };
    const dx = to.cx - from.cx, dy = to.cy - from.cy, length = Math.max(1, Math.hypot(dx, dy));
    const control = { x: (from.cx + to.cx) / 2 - dy / length * 52, y: (from.cy + to.cy) / 2 + dx / length * 52 };
    const one = 1 - fraction;
    return { x: one * one * from.cx + 2 * one * fraction * control.x + fraction * fraction * to.cx, y: one * one * from.cy + 2 * one * fraction * control.y + fraction * fraction * to.cy };
  };

  function draw() {
    if (!canvas || !mounted || !state || width < 100) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio); canvas.height = height * ratio;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#edf6f7'; ctx.fillRect(0, 0, width, height);
    const nodeWidth = Math.min(142, Math.max(76, width * .22)), nodeHeight = width < 520 ? 72 : 84;
    const nodes = Object.fromEntries(config.nodes.map(node => [node.id, { ...node, cx: node.x * width, cy: 42 + node.y * (height - 92), w: nodeWidth, h: nodeHeight }]));
    const label = (text, x, y, size = 12, color = '#294651', maxWidth = width) => {
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = `600 ${size}px Inter, sans-serif`;
      while (ctx.measureText(text).width > maxWidth && size > 8) ctx.font = `600 ${--size}px Inter, sans-serif`;
      ctx.fillText(text, x, y);
    };
    const line = (x1, y1, x2, y2, color, thickness = 2, dashed = false) => {
      ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.setLineDash(dashed ? [6, 5] : []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    };
    const ball = (x, y, color, radius = 4, hollow = false) => {
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = hollow ? '#edf6f7' : color; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = hollow ? 2 : 1; ctx.stroke();
      if (!hollow) { ctx.beginPath(); ctx.arc(x - radius * .28, y - radius * .3, radius * .24, 0, Math.PI * 2); ctx.fillStyle = '#ffffffcc'; ctx.fill(); }
    };
    const panel = (x, y, w, h, stroke = '#5d8996', fill = '#fff') => { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.strokeStyle = stroke; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, w, h); };
    const arrow = (x1, y1, x2, y2, color = '#5d8996', dashed = false) => {
      line(x1, y1, x2, y2, color, 3, dashed); const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.save(); ctx.translate(x2, y2); ctx.rotate(angle); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -6); ctx.lineTo(-10, 6); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    const movingSignal = (x1, y1, x2, y2, count, color, hollow = false) => {
      arrow(x1, y1, x2, y2, color, hollow);
      for (let i = 0; i < count; i++) { const phase = animateParticles ? (time * .16 + i / Math.max(1, count)) % 1 : (i + .5) / Math.max(1, count); ball(x1 + (x2 - x1) * phase, y1 + (y2 - y1) * phase, color, 4, hollow); }
    };
    const tank = (x, y, w, h, fraction, color, title, value) => {
      panel(x, y, w, h, color); const fill = Math.max(0, Math.min(1, fraction)); ctx.fillStyle = `${color}55`; ctx.fillRect(x + 4, y + h - 4 - (h - 8) * fill, w - 8, (h - 8) * fill);
      line(x + 4, y + h - 4 - (h - 8) * fill, x + w - 4, y + h - 4 - (h - 8) * fill, color, 2);
      label(title, x + w / 2, y - 12, width < 520 ? 9 : 12, '#244a55', w + 24); label(value, x + w / 2, y + h + 17, 10, '#48656c', w + 24);
    };
    const cellDish = (cx, cy, radius, amount, baseline, color, title, resistant = false) => {
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fillStyle = '#ffffffbb'; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
      const count = amount <= 1e-8 ? 0 : Math.max(1, Math.min(34, Math.round(22 * Math.sqrt(amount / Math.max(1, baseline)))));
      for (let i = 0; i < count; i++) {
        const angle = i * 2.39996 + (animateParticles ? time * (resistant ? .13 : -.11) : 0), radial = radius * .72 * Math.sqrt((i + .6) / Math.max(1, count)), x = cx + Math.cos(angle) * radial, y = cy + Math.sin(angle) * radial;
        const pulse = animateParticles ? 1 + .08 * Math.sin(time * .9 + i * 1.7) : 1;
        ctx.beginPath(); ctx.arc(x, y, (resistant ? 6 : 5.5) * pulse, 0, Math.PI * 2); ctx.fillStyle = `${color}55`; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke(); ball(x - 1, y - 1, color, 1.5);
      }
      label(title, cx, cy - radius - 15, width < 520 ? 9 : 12, '#244a55', radius * 2); label(`${amount.toFixed(1)} mm-eq`, cx, cy + radius + 18, 10, '#48656c', radius * 2);
    };
    const drawSpecialized = () => {
      const mobile = width < 520, middleY = mobile ? 215 : 205;
      if (config.scene === 'pd-general') {
        const plasmaMax = Math.max(.01, p.dose / p.v), responseFraction = (state.secondary - p.e0) / Math.max(1, p.emax), gaugeX = width * .49, gaugeY = 92, gaugeW = mobile ? 42 : 54, gaugeH = 190;
        tank(width * .055, 112, width * .23, 170, state.c / plasmaMax, '#147ea5', en ? 'Plasma' : 'Plasma', `${state.c.toFixed(2)} mg/L`);
        panel(gaugeX - gaugeW / 2, gaugeY, gaugeW, gaugeH, '#8c4c89'); const level = Math.max(0, Math.min(1, state.occupancyPct / 100)); ctx.fillStyle = '#8c4c8970'; ctx.fillRect(gaugeX - gaugeW / 2 + 4, gaugeY + gaugeH - 4 - (gaugeH - 8) * level, gaugeW - 8, (gaugeH - 8) * level);
        for (const tick of [0, .5, 1]) { line(gaugeX + gaugeW / 2 + 3, gaugeY + gaugeH * (1 - tick), gaugeX + gaugeW / 2 + 10, gaugeY + gaugeH * (1 - tick), '#8c4c89', 1); }
        label(en ? 'Target engagement' : 'Engagement cible', gaugeX, 68, mobile ? 9 : 12, '#244a55', width * .28); label(`${state.occupancyPct.toFixed(0)} %`, gaugeX, gaugeY + gaugeH + 18, 10, '#48656c', 80);
        const dialX = width * .82, dialR = mobile ? 43 : 58; ctx.beginPath(); ctx.arc(dialX, middleY, dialR, Math.PI, 0); ctx.strokeStyle = '#d8b09c'; ctx.lineWidth = 13; ctx.stroke(); ctx.beginPath(); ctx.arc(dialX, middleY, dialR, Math.PI, Math.PI + Math.PI * Math.max(0, Math.min(1, responseFraction))); ctx.strokeStyle = '#d26b3a'; ctx.stroke();
        const angle = Math.PI + Math.PI * Math.max(0, Math.min(1, responseFraction)); line(dialX, middleY, dialX + Math.cos(angle) * dialR * .78, middleY + Math.sin(angle) * dialR * .78, '#7c3f29', 3); ball(dialX, middleY, '#d26b3a', 5);
        label(en ? 'Biological response' : 'Reponse biologique', dialX, 68, mobile ? 9 : 12, '#244a55', width * .28); label(state.secondary.toFixed(1), dialX, middleY + 30, 12, '#7c3f29', 70);
        movingSignal(width * .29, middleY, gaugeX - gaugeW / 2 - 8, middleY, 4, '#8c4c89', true); movingSignal(gaugeX + gaugeW / 2 + 8, middleY, dialX - dialR - 10, middleY, 4, '#d26b3a', true);
        label(p.model === 1 ? (en ? 'Direct Emax' : 'Emax direct') : p.model === 2 ? (en ? 'Effect compartment' : "Compartiment d'effet") : (en ? 'Turnover response' : 'Reponse par turnover'), width / 2, height - 18, 11, '#48656c', width - 30);
        return true;
      }
      if (config.scene === 'oncology') {
        const radius = mobile ? 50 : 78, leftX = width * (mobile ? .25 : .32), rightX = width * (mobile ? .75 : .72);
        cellDish(leftX, middleY, radius, state.sensitive, p.tumor0, '#168d71', en ? 'Sensitive cells' : 'Cellules sensibles');
        cellDish(rightX, middleY, radius, state.resistant, p.tumor0, '#d26b3a', en ? 'Resistant cells' : 'Cellules resistantes', true);
        if (p.resistance > 1e-9) movingSignal(leftX + radius + 8, middleY, rightX - radius - 8, middleY, state.flows.conversion > 1e-6 ? 4 : 0, '#b2572e', true);
        else line(leftX + radius + 8, middleY, rightX - radius - 8, middleY, '#9aabad', 2, true);
        const conversionLabel = p.resistance > 1e-9
          ? (mobile ? (en ? 'Sensitive to resistant' : 'Sensible vers resistante') : (en ? 'Sensitive to resistant conversion' : 'Conversion sensible vers resistante'))
          : (en ? 'No sensitive-to-resistant conversion' : 'Aucune conversion sensible-resistante');
        label(conversionLabel, width / 2, mobile ? middleY + radius + 38 : middleY - 22, mobile ? 9 : 10, p.resistance > 1e-9 ? '#7c3f29' : '#60787d', mobile ? width * .78 : Math.max(80, rightX - leftX - radius));
        const dripY = 55, drugCount = Math.min(9, Math.max(1, Math.round(state.c / Math.max(.01, p.ec50) * 2))); label(`${en ? 'Exposure' : 'Exposition'} ${state.c.toFixed(2)} mg/L`, width / 2, 28, 11, '#147ea5', width - 20);
        for (let i = 0; i < drugCount; i++) { const phase = animateParticles ? (time * .2 + i / drugCount) % 1 : (i + .5) / drugCount; ball(width * (.2 + .6 * ((i * .618) % 1)), dripY + phase * 60, '#147ea5', 4); }
        label(`${state.resistantPct.toFixed(1)} % ${en ? 'resistant' : 'resistantes'}`, rightX, height - 22, 11, '#b2572e', width * .35);
        return true;
      }
      if (config.scene === 'infectiology') {
        const tubeX = width * (mobile ? .2 : .16), tubeY = 70, tubeW = mobile ? 64 : 100, tubeH = 245, scaleMax = Math.max(p.mic * 2.2, p.dose / p.v * 1.2), concentrationLevel = Math.min(1, state.c / scaleMax), micLevel = Math.min(1, p.mic / scaleMax);
        tank(tubeX - tubeW / 2, tubeY, tubeW, tubeH, concentrationLevel, '#147ea5', mobile ? (en ? 'Antibiotic' : 'Antibiotique') : (en ? 'Antibiotic concentration' : 'Concentration antibiotique'), `${state.c.toFixed(2)} mg/L`);
        const micY = tubeY + tubeH * (1 - micLevel); line(tubeX - tubeW / 2 - 8, micY, tubeX + tubeW / 2 + 8, micY, '#a26c2a', 3, true); label(en ? 'MIC' : 'CMI', tubeX, micY - 7, 10, '#7b5b32', tubeW);
        const dishX = width * .72, dishR = mobile ? 58 : 88; ctx.beginPath(); ctx.arc(dishX, middleY, dishR, 0, Math.PI * 2); ctx.fillStyle = '#fff8f2'; ctx.fill(); ctx.strokeStyle = '#b2572e'; ctx.lineWidth = 3; ctx.stroke();
        const bacteriaCount = Math.max(1, Math.min(38, Math.round(5 + state.secondary / 8 * 31)));
        for (let i = 0; i < bacteriaCount; i++) { const angle = i * 2.39996 + (animateParticles ? time * .12 : 0), radial = dishR * .72 * Math.sqrt((i + .4) / bacteriaCount), x = dishX + Math.cos(angle) * radial, y = middleY + Math.sin(angle) * radial; ctx.save(); ctx.translate(x, y); ctx.rotate(angle + (animateParticles ? time * .3 : 0)); ctx.fillStyle = i % 4 ? '#d26b3a88' : '#8c4c8988'; ctx.fillRect(-6, -2.5, 12, 5); ctx.strokeStyle = '#8b482d'; ctx.strokeRect(-6, -2.5, 12, 5); ctx.restore(); }
        movingSignal(tubeX + tubeW / 2 + 12, middleY, dishX - dishR - 10, middleY, Math.min(7, Math.max(1, Math.round(state.c / Math.max(.01, p.mic) * 2))), '#147ea5');
        label(en ? 'Bacterial culture' : 'Culture bacterienne', dishX, 56, mobile ? 9 : 12, '#244a55', dishR * 2); label(`${state.secondary.toFixed(2)} log10 CFU/mL`, dishX, middleY + dishR + 20, 10, '#7c3f29', dishR * 2);
        label(state.c >= p.mic ? (en ? 'Above MIC: net killing' : 'Au-dessus de la CMI : destruction nette') : (en ? 'Below MIC: net growth' : 'Sous la CMI : croissance nette'), width / 2, height - 18, 11, state.c >= p.mic ? '#087b83' : '#b2572e', width - 20);
        return true;
      }
      if (config.scene === 'saturable') {
        const levelMax = Math.max(.01, p.dose / p.v), tankX = width * .06, tankW = width * .3, gateX = width * .61;
        tank(tankX, 92, tankW, 220, state.c / levelMax, '#147ea5', en ? 'Drug awaiting elimination' : 'Medicament a eliminer', `${state.c.toFixed(2)} mg/L`);
        arrow(tankX + tankW + 10, middleY, gateX - 28, middleY, '#5d8996'); panel(gateX - 24, 82, 48, 238, '#a26c2a', '#fff8e8');
        const active = Math.round(6 * state.capacityPct / 100); for (let i = 0; i < 6; i++) { const y = 108 + i * 36; ctx.beginPath(); ctx.arc(gateX, y, 9, 0, Math.PI * 2); ctx.fillStyle = i < active ? '#d29a31' : '#fff'; ctx.fill(); ctx.strokeStyle = '#a26c2a'; ctx.lineWidth = 2; ctx.stroke(); }
        label(en ? 'Finite elimination sites' : "Sites d'elimination limites", gateX, 55, mobile ? 9 : 12, '#244a55', width * .3); label(`${state.capacityPct.toFixed(0)} % Vmax`, gateX, 342, 11, '#7b5b32', 120);
        const queue = Math.max(1, Math.min(12, Math.round(12 * state.capacityPct / 100))); for (let i = 0; i < queue; i++) ball(gateX - 38 - (i % 4) * 13, middleY - 22 + Math.floor(i / 4) * 20, '#147ea5', 5);
        movingSignal(gateX + 30, middleY, width * .91, middleY, active, '#81758a'); label(en ? 'Eliminated' : 'Elimine', width * .86, middleY - 28, 11, '#5e5365', width * .2);
        return true;
      }
      if (config.scene === 'tmdd') {
        const freeCount = Math.min(14, Math.max(0, Math.round(14 * state.free / Math.max(1, p.dose)))), targetTotal = Math.max(1e-9, state.target + state.complex), boundCount = Math.min(10, Math.round(10 * state.complex / targetTotal)), membraneY = 280;
        label(en ? 'Free drug' : 'Medicament libre', width * .2, 48, 12, '#147ea5', width * .3); for (let i = 0; i < freeCount; i++) ball(width * (.08 + .28 * ((i * .618) % 1)), 85 + 150 * ((i * .414 + time * .025) % 1), '#147ea5', 6);
        line(width * .43, membraneY, width * .79, membraneY, '#36a36e', 5); label(en ? 'Cell membrane and targets' : 'Membrane cellulaire et cibles', width * .61, 323, mobile ? 9 : 12, '#246a4b', width * .45);
        for (let i = 0; i < 10; i++) { const x = width * .45 + i * width * .032; line(x, membraneY, x, membraneY - 34, i < boundCount ? '#8c4c89' : '#36a36e', 3); line(x, membraneY - 34, x - 7, membraneY - 44, i < boundCount ? '#8c4c89' : '#36a36e', 2); line(x, membraneY - 34, x + 7, membraneY - 44, i < boundCount ? '#8c4c89' : '#36a36e', 2); if (i < boundCount) ball(x, membraneY - 51, '#147ea5', 6); }
        movingSignal(width * .34, 170, width * .47, 220, state.flows.bind > 1e-6 ? 4 : 0, '#8c4c89', true); const vesicleX = width * .88; ctx.beginPath(); ctx.arc(vesicleX, middleY, mobile ? 36 : 48, 0, Math.PI * 2); ctx.fillStyle = '#a24f6833'; ctx.fill(); ctx.strokeStyle = '#a24f68'; ctx.lineWidth = 3; ctx.stroke();
        const internalCount = Math.min(10, Math.round(10 * state.internalized / Math.max(1, state.administered))); for (let i = 0; i < internalCount; i++) ball(vesicleX - 20 + (i % 4) * 13, middleY - 15 + Math.floor(i / 4) * 14, '#a24f68', 4);
        arrow(width * .76, membraneY - 20, vesicleX - (mobile ? 40 : 52), middleY, '#a24f68'); label(en ? 'Internalization' : 'Internalisation', vesicleX, 105, mobile ? 9 : 12, '#7b3a4f', width * .22); label(`${state.secondary.toFixed(0)} % ${en ? 'occupied' : 'occupee'}`, width * .61, 66, 11, '#6c3f70', width * .34);
        return true;
      }
      if (config.scene === 'covariate-volume') {
        const volume = state.volume, ratioV = volume / p.vRef, tankW = Math.min(width * .48, width * .31 * Math.sqrt(ratioV)), tankH = Math.min(235, 175 * Math.sqrt(ratioV)), tankX = width * .67 - tankW / 2, tankY = 92 + (235 - tankH), concentrationMax = p.dose / p.vRef;
        label(`${p.weight.toFixed(0)} kg`, width * .16, 82, 20, '#7c3f29', width * .25); ctx.strokeStyle = '#c97532'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(width * .08, 170); ctx.lineTo(width * .24, 170); ctx.stroke(); line(width * .16, 170, width * .16, 210, '#c97532', 4); ctx.strokeRect(width * .105, 115, width * .11, 55);
        const absorptionDots = state.flows.absorption > .01 ? Math.min(6, 1 + Math.round(6 * state.flows.absorption / Math.max(.01, p.ka * p.dose))) : 0;
        movingSignal(width * .27, middleY, tankX - 18, middleY, absorptionDots, '#c97532', true); label('V = Vref (WT/WTref)^beta', width * .43, middleY - 16, mobile ? 8 : 11, '#7c3f29', width * .3);
        ctx.setLineDash([6, 5]); ctx.strokeStyle = '#7c9aa3'; ctx.lineWidth = 2; ctx.strokeRect(width * .67 - width * .31 / 2, 92 + 60, width * .31, 175); ctx.setLineDash([]);
        tank(tankX, tankY, tankW, tankH, state.c / Math.max(.01, concentrationMax), '#147ea5', en ? 'Current apparent volume' : 'Volume apparent actuel', `${volume.toFixed(1)} L | ${state.c.toFixed(2)} mg/L`);
        const moleculeCount = Math.min(16, Math.round(16 * state.central / Math.max(1, p.dose))); for (let i = 0; i < moleculeCount; i++) ball(tankX + tankW * (.12 + .76 * ((i * .618) % 1)), tankY + tankH * (.18 + .7 * ((i * .414) % 1)), '#147ea5', 4);
        label(en ? 'Dashed outline: reference volume' : 'Pointilles : volume de reference', width * .67, height - 18, 10, '#48656c', width * .5);
        return true;
      }
      return false;
    };
    if (drawSpecialized()) { label(`${time.toFixed(1)} ${config.unit === 'day' ? (en ? 'days' : 'jours') : 'h'}`, width - 55, 24, 14, '#294651', 100); return; }
    const edgeRates = config.edges.map(edge => Math.max(0, state.flows[edge.flow] ?? 0)), maxRate = Math.max(1e-9, ...edgeRates);
    for (const [index, edge] of config.edges.entries()) {
      const from = nodes[edge.from], to = nodes[edge.to], color = edge.signal ? '#d26b3a' : edge.gate ? '#a26c2a' : '#5d8996';
      if (edge.curved) {
        const p0 = pointOn(edge, 0, nodes), p1 = pointOn(edge, .5, nodes), p2 = pointOn(edge, 1, nodes);
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash(edge.dashed ? [6, 5] : []); ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.quadraticCurveTo(2 * p1.x - (p0.x + p2.x) / 2, 2 * p1.y - (p0.y + p2.y) / 2, p2.x, p2.y); ctx.stroke(); ctx.setLineDash([]);
      } else line(from.cx, from.cy, to.cx, to.cy, color, 3, edge.dashed);
      const arrow = pointOn(edge, .72, nodes), before = pointOn(edge, .69, nodes), angle = Math.atan2(arrow.y - before.y, arrow.x - before.x);
      ctx.save(); ctx.translate(arrow.x, arrow.y); ctx.rotate(angle); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill(); ctx.restore();
      const middle = pointOn(edge, .5, nodes), offset = edge.labelOffset ?? (edge.curved ? 15 : -9);
      label(edge.label, middle.x, middle.y + offset, width < 520 ? 8 : 10, '#355c67', Math.max(70, Math.hypot(to.cx - from.cx, to.cy - from.cy) * .62));
      const rate = edgeRates[index], count = rate <= 1e-10 ? 0 : Math.min(7, 2 + Math.round(4 * Math.sqrt(rate / maxRate)));
      for (let dot = 0; dot < count; dot++) {
        const phase = animateParticles ? (time * (.13 + .025 * index) + dot / count + index * .17) % 1 : (dot + .5) / Math.max(1, count);
        const position = pointOn(edge, .08 + .84 * phase, nodes);
        ball(position.x, position.y, edge.signal ? '#d26b3a' : '#147ea5', width < 520 ? 3.2 : 4.2, edge.signal);
      }
      if (edge.gate) {
        const gate = pointOn(edge, .5, nodes); ctx.save(); ctx.translate(gate.x, gate.y); ctx.rotate(angle); ctx.fillStyle = '#fff5dc'; ctx.strokeStyle = '#a26c2a'; ctx.lineWidth = 2; ctx.fillRect(-10, -16, 20, 32); ctx.strokeRect(-10, -16, 20, 32); ctx.restore();
      }
    }
    const total = Math.max(1e-9, state.administered);
    for (const node of config.nodes) {
      const box = nodes[node.id], value = state[node.value ?? node.id] ?? state.mass[node.id] ?? 0;
      const bounds = node.range?.map(limit => typeof limit === 'function' ? limit(p) : limit);
      const fraction = bounds ? Math.max(0, Math.min(1, (value - bounds[0]) / Math.max(1e-9, bounds[1] - bounds[0]))) : node.target ? Math.min(1, value / p.target0) : node.signal ? Math.min(1, (state.ce ?? 0) / Math.max(.01, state.c, state.ce ?? 0)) : Math.min(1, value / total);
      ctx.fillStyle = '#fff'; ctx.fillRect(box.cx - box.w / 2, box.cy - box.h / 2, box.w, box.h);
      ctx.fillStyle = `${node.color}${Math.round((.1 + .23 * fraction) * 255).toString(16).padStart(2, '0')}`; ctx.fillRect(box.cx - box.w / 2 + 3, box.cy - box.h / 2 + 3, box.w - 6, box.h - 6);
      ctx.strokeStyle = node.color; ctx.lineWidth = node.signal ? 2 : 3; ctx.setLineDash(node.signal ? [5, 4] : []); ctx.strokeRect(box.cx - box.w / 2, box.cy - box.h / 2, box.w, box.h); ctx.setLineDash([]);
      const text = en ? node.label.en : node.label.fr, words = text.split(' '), split = words.length > 2 ? Math.ceil(words.length / 2) : words.length;
      label(words.slice(0, split).join(' '), box.cx, box.cy - 8, width < 520 ? 9 : 12, '#244a55', box.w - 8);
      if (words.length > split) label(words.slice(split).join(' '), box.cx, box.cy + 7, width < 520 ? 9 : 12, '#244a55', box.w - 8);
      const unit = node.unit ?? (node.id === 'ce' ? 'mg/L' : lab === 'tmdd' ? 'mg-eq' : 'mg');
      label(`${Number(value.toFixed(value < 10 ? 2 : 1))} ${unit}`, box.cx, box.cy + box.h / 2 - 8, 9, '#48656c', box.w - 8);
      const dots = node.signal ? Math.min(10, Math.round(10 * fraction)) : node.target ? Math.min(14, Math.round(14 * fraction)) : Math.min(16, Math.round(16 * value / total));
      for (let i = 0; i < dots; i++) {
        const x = box.cx - box.w * .35 + box.w * .7 * ((i * .618033) % 1), y = box.cy - box.h * .34 + box.h * .16 * ((i * .414214) % 1);
        ball(x, y, node.color, width < 520 ? 2.3 : 3.1, node.signal);
      }
    }
    label(`${time.toFixed(1)} ${config.unit === 'day' ? (en ? 'days' : 'jours') : 'h'}`, width - 55, 24, 14, '#294651', 100);
    if (lab === 'effect-site') label(en ? 'Conceptual biophase: no drug mass is removed from plasma.' : 'Biophase conceptuelle : aucune masse de medicament ne quitte le plasma.', width / 2, height - 13, width < 520 ? 9 : 11, '#7b5b32', width - 20);
  }
  $: if (mounted) { config; state; time; en; animateParticles; width; draw(); }
  onMount(() => { mounted = true; draw(); });
</script>

<div class="scene-tools"><label><input type="checkbox" bind:checked={animateParticles}/><Play size={17}/>{en ? 'Animate particles' : 'Animer les particules'}</label></div>
<div class="scene" bind:clientWidth={width}>
  <canvas bind:this={canvas} style:height={`${height}px`} data-testid="molecular-scene" aria-label={en ? 'Animated molecular journey' : 'Parcours moleculaire anime'}></canvas>
  <button class="scene-play" title={playing ? (en ? 'Pause animation' : "Suspendre l'animation") : (en ? 'Start animation' : "Lancer l'animation")} aria-label={playing ? (en ? 'Pause animation' : "Suspendre l'animation") : (en ? 'Start animation' : "Lancer l'animation")} on:click={() => dispatch('play')}>{#if playing}<Pause size={22}/>{:else}<Play size={22}/>{/if}</button>
</div>
<div class="mass-balance" aria-label={en ? 'Calculated drug mass balance' : 'Bilan de masse medicamenteuse calcule'}>
  <div class="mass-bar">{#each config.mass as key}<span style:width={`${100 * (state.mass[key] ?? 0) / Math.max(1e-9, state.administered)}%`} style:background={config.nodes.find(node => node.id === key)?.color ?? '#888'}></span>{/each}</div>
  <div class="mass-values">{#each config.mass as key}<span><i style:background={config.nodes.find(node => node.id === key)?.color ?? '#888'}></i>{en ? config.nodes.find(node => node.id === key)?.label.en : config.nodes.find(node => node.id === key)?.label.fr} <b>{state.administered ? (100 * (state.mass[key] ?? 0) / state.administered).toFixed(0) : 0} %</b></span>{/each}</div>
</div>

<style>
  .scene { position:relative; width:100%; min-width:0; background:#edf6f7; }
  canvas { display:block; width:100%; }
  .scene-tools { display:flex; align-items:center; min-height:38px; padding:6px 0 10px; }
  .scene-tools label { display:inline-flex; align-items:center; gap:6px; font-size:12px; }
  input { accent-color:#147ea5; }
  .scene-play { position:absolute; top:18px; right:18px; display:grid; place-items:center; width:42px; height:42px; border:1px solid #12627e; border-radius:50%; background:#147ea5; color:#fff; cursor:pointer; }
  .scene-play:focus-visible, input:focus-visible { outline:3px solid #087b83; outline-offset:3px; }
  .mass-balance { padding:12px 0 6px; }
  .mass-bar { display:flex; height:8px; overflow:hidden; background:#e5e9ed; }
  .mass-values { display:flex; flex-wrap:wrap; gap:8px 18px; margin-top:8px; color:var(--text-secondary); font-size:11px; }
  .mass-values i { display:inline-block; width:8px; height:8px; margin-right:5px; }
  .mass-values b { margin-left:4px; color:var(--text-primary); font-variant-numeric:tabular-nums; }
</style>
