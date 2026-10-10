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
  let canvas, width = 700, mounted = false, dragging = '', dragOrigin = null, hovered = false, lastDirectValue, directControl, directPoint;
  const dispatch = createEventDispatcher();
  $: config = molecularLabs[lab];
  $: height = width < 520 ? 470 : 430;
  $: directControl = config && p && width ? controlGeometry() : null;
  $: directPoint = directControl ? pointFor(directControl) : null;

  const clamp = value => Math.max(0, Math.min(1, value));
  function controlGeometry() {
    if (!config || !p) return null;
    const mobile = width < 520, middleY = mobile ? 215 : 205;
    const make = (key, x1, y1, x2, y2, options = {}) => ({ key, x1, y1, x2, y2, ...config.parameters[key], ...options });
    if (config.scene === 'pd-general') return make('dose', width * .3, 282, width * .3, 112, { labelX: width * .17, labelY: 326 });
    if (config.scene === 'oncology') return make('resistance', width * .3, mobile ? 386 : 350, width * .88, mobile ? 386 : 350, { label: { en: 'Resistance emergence', fr: 'Émergence de résistance' }, labelY: mobile ? 418 : 382 });
    if (config.scene === 'infectiology') { const tubeX = width * (mobile ? .2 : .16), tubeW = mobile ? 64 : 100; return make('mic', tubeX + tubeW / 2 + 12, 315, tubeX + tubeW / 2 + 12, 70, { label: { en: 'MIC', fr: 'CMI' }, scale: 'log', track: false, labelX: tubeX, labelSide: true, radius: 14, hit: 38 }); }
    if (config.scene === 'saturable') return make('vmax', width * .61 + 38, 305, width * .61 + 38, 95, { label: { en: 'Vmax', fr: 'Vmax' }, labelX: width * .61, labelY: 359 });
    if (config.scene === 'tmdd') return make('target0', width * .42, mobile ? 386 : 350, width * .9, mobile ? 386 : 350, { label: { en: 'Target density', fr: 'Densite de cible' }, scale: 'log', labelX: width * .66, labelY: mobile ? 418 : 382 });
    if (config.scene === 'covariate-volume') return make('weight', width * .08, 170, width * .27, 170, { showLabel: false, hit: 34 });
    if (config.scene === 'covariate-clearance') return make('gfr', width * .53, mobile ? 390 : 350, width * .9, mobile ? 390 : 350, { label: { en: 'GFR', fr: 'DFG' }, labelY: mobile ? 423 : 383, maxWidth: width * .42 });
    const y = 42 + (config.nodes[0]?.y ?? .3) * (height - 92);
    if (lab === 'parent-metabolite') return make('kmet', width * .34, y, width * .66, y, { label: { en: 'kmet', fr: 'kmet' }, scale: 'log', labelY: y + 35 });
    if (lab === 'long-acting') return make('krel', width * .34, y, width * .66, y, { label: { en: 'krel', fr: 'krel' }, scale: 'log', labelY: y + 35 });
    if (lab === 'enterohepatic') return make('kreabs', width * .28, height - 52, width * .72, height - 52, { label: { en: 'kreabs', fr: 'kreabs' }, scale: 'log', labelY: height - 22 });
    if (lab === 'effect-site') return make('ke0', width * .34, y, width * .66, y, { label: { en: 'ke0', fr: 'ke0' }, scale: 'log', labelY: y + 35 });
    return null;
  }
  const fractionFor = control => control.scale === 'log'
    ? clamp(Math.log(p[control.key] / control.min) / Math.log(control.max / control.min))
    : clamp((p[control.key] - control.min) / (control.max - control.min));
  const pointFor = control => {
    const fraction = fractionFor(control);
    return { x: control.x1 + (control.x2 - control.x1) * fraction, y: control.y1 + (control.y2 - control.y1) * fraction };
  };
  const eventPoint = event => {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * width / rect.width, y: (event.clientY - rect.top) * height / rect.height };
  };
  function nearControl(point, control) {
    if (!control) return false;
    const dx = control.x2 - control.x1, dy = control.y2 - control.y1, length2 = dx * dx + dy * dy;
    const fraction = length2 ? clamp(((point.x - control.x1) * dx + (point.y - control.y1) * dy) / length2) : 0;
    const x = control.x1 + dx * fraction, y = control.y1 + dy * fraction;
    return Math.hypot(point.x - x, point.y - y) <= (control.hit ?? 25);
  }
  function setDirectValue(event, control = controlGeometry()) {
    if (!control) return;
    const point = eventPoint(event), dx = control.x2 - control.x1, dy = control.y2 - control.y1, length2 = dx * dx + dy * dy;
    // During a drag, use the pointer displacement relative to where the user
    // grabbed the handle. DOM reflow / viewport scroll must not change the
    // interpreted value while the pointer is held down.
    const delta = dragOrigin
      ? { x: (event.clientX - dragOrigin.x) * width / dragOrigin.width,
          y: (event.clientY - dragOrigin.y) * height / dragOrigin.height }
      : { x: point.x - control.x1, y: point.y - control.y1 };
    const fraction = length2
      ? clamp((dragOrigin ? dragOrigin.fraction : 0) + (delta.x * dx + delta.y * dy) / length2)
      : 0;
    const raw = control.scale === 'log' ? control.min * Math.pow(control.max / control.min, fraction) : control.min + (control.max - control.min) * fraction;
    const value = Number((Math.round(raw / control.step) * control.step).toFixed(8));
    if (value === lastDirectValue) return;
    lastDirectValue = value; dispatch('parameter', { key: control.key, value });
  }
  function pointerDown(event) {
    const control = controlGeometry(), point = eventPoint(event);
    if (!nearControl(point, control)) return;
    // A focused numeric input can cause browser scroll anchoring while the
    // simulation rerenders. This would move the canvas under the pointer and
    // turn a vertical MIC drag into a spurious change to the minimum value.
    if (document.activeElement instanceof HTMLElement && document.activeElement !== canvas) {
      document.activeElement.blur();
    }
    dragging = control.key;
    hovered = true;
    lastDirectValue = p[control.key];
    const rect = canvas.getBoundingClientRect();
    dragOrigin = { x: event.clientX, y: event.clientY,
      width: Math.max(1, rect.width), height: Math.max(1, rect.height),
      fraction: fractionFor(control) };
    canvas.setPointerCapture?.(event.pointerId);
    // A press on the existing handle is not an instruction to change value.
    // Only actual motion along the control track should update the model.
    event.preventDefault();
  }
  function pointerMove(event) {
    const control = controlGeometry();
    if (dragging) { setDirectValue(event, control); event.preventDefault(); return; }
    hovered = nearControl(eventPoint(event), control);
  }
  function pointerUp(event) {
    if (!dragging) return;
    canvas.releasePointerCapture?.(event.pointerId); dragging = ''; dragOrigin = null; lastDirectValue = undefined; hovered = nearControl(eventPoint(event), controlGeometry());
  }

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
    const drawDirectControl = () => {
      const control = controlGeometry(); if (!control) return;
      const point = pointFor(control), active = dragging === control.key || hovered, horizontal = Math.abs(control.x2 - control.x1) >= Math.abs(control.y2 - control.y1), color = active ? '#b85227' : '#c97532';
      if (control.track !== false) {
        line(control.x1, control.y1, control.x2, control.y2, '#6d8d95', active ? 5 : 4);
        if (horizontal) { line(control.x1, control.y1 - 7, control.x1, control.y1 + 7, '#6d8d95', 2); line(control.x2, control.y2 - 7, control.x2, control.y2 + 7, '#6d8d95', 2); }
        else { line(control.x1 - 7, control.y1, control.x1 + 7, control.y1, '#6d8d95', 2); line(control.x2 - 7, control.y2, control.x2 + 7, control.y2, '#6d8d95', 2); }
      }
      const radius = control.radius ?? (active ? 12 : 10);
      ctx.beginPath(); ctx.arc(point.x, point.y, active ? radius + 2 : radius, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = active ? 4 : 3; ctx.stroke();
      for (let index = -1; index <= 1; index++) { ctx.beginPath(); ctx.arc(point.x + (horizontal ? 0 : index * 4), point.y + (horizontal ? index * 4 : 0), 1.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
      if (control.showLabel === false) return;
      const value = p[control.key] < 1 ? Number(p[control.key].toFixed(3)) : Number(p[control.key].toFixed(1));
      const text = `${en ? control.label.en : control.label.fr} ${value}${control.unit ? ` ${control.unit}` : ''}`;
      label(text, control.labelX ?? (control.x1 + control.x2) / 2, control.labelSide ? point.y - 10 : (control.labelY ?? point.y + 28), width < 520 ? 8 : 10, '#5f3c2d', control.maxWidth ?? (horizontal ? Math.abs(control.x2 - control.x1) + 80 : 130));
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
        const plasmaMax = Math.max(.01, config.parameters.dose.max / p.v), responseFraction = (state.secondary - p.e0) / Math.max(1, p.emax), gaugeX = width * .49, gaugeY = 92, gaugeW = mobile ? 42 : 54, gaugeH = 190;
        tank(width * .055, 112, width * .23, 170, state.c / plasmaMax, '#147ea5', en ? 'Plasma' : 'Plasma', `${state.c.toFixed(2)} mg/L`);
        panel(gaugeX - gaugeW / 2, gaugeY, gaugeW, gaugeH, '#8c4c89'); const level = Math.max(0, Math.min(1, state.occupancyPct / 100)); ctx.fillStyle = '#8c4c8970'; ctx.fillRect(gaugeX - gaugeW / 2 + 4, gaugeY + gaugeH - 4 - (gaugeH - 8) * level, gaugeW - 8, (gaugeH - 8) * level);
        for (const tick of [0, .5, 1]) { line(gaugeX + gaugeW / 2 + 3, gaugeY + gaugeH * (1 - tick), gaugeX + gaugeW / 2 + 10, gaugeY + gaugeH * (1 - tick), '#8c4c89', 1); }
        label(en ? 'Target engagement' : 'Engagement cible', gaugeX, 68, mobile ? 9 : 12, '#244a55', width * .28); label(`${state.occupancyPct.toFixed(0)} %`, gaugeX, gaugeY + gaugeH + 18, 10, '#48656c', 80);
        const dialX = width * .82, dialR = mobile ? 43 : 58; ctx.beginPath(); ctx.arc(dialX, middleY, dialR, Math.PI, 0); ctx.strokeStyle = '#d8b09c'; ctx.lineWidth = 13; ctx.stroke(); ctx.beginPath(); ctx.arc(dialX, middleY, dialR, Math.PI, Math.PI + Math.PI * Math.max(0, Math.min(1, responseFraction))); ctx.strokeStyle = '#d26b3a'; ctx.stroke();
        const angle = Math.PI + Math.PI * Math.max(0, Math.min(1, responseFraction)); line(dialX, middleY, dialX + Math.cos(angle) * dialR * .78, middleY + Math.sin(angle) * dialR * .78, '#7c3f29', 3); ball(dialX, middleY, '#d26b3a', 5);
        label(en ? 'Biological response' : 'Réponse biologique', dialX, 68, mobile ? 9 : 12, '#244a55', width * .28); label(state.secondary.toFixed(1), dialX, middleY + 30, 12, '#7c3f29', 70);
        movingSignal(width * .29, middleY, gaugeX - gaugeW / 2 - 8, middleY, 4, '#8c4c89', true); movingSignal(gaugeX + gaugeW / 2 + 8, middleY, dialX - dialR - 10, middleY, 4, '#d26b3a', true);
        label(p.model === 1 ? (en ? 'Direct Emax' : 'Emax direct') : p.model === 2 ? (en ? 'Effect compartment' : "Compartiment d'effet") : (en ? 'Turnover response' : 'Réponse par turnover'), width / 2, height - 18, 11, '#48656c', width - 30);
        return true;
      }
      if (config.scene === 'oncology') {
        const tankX = width * .055, tankY = 112, tankW = mobile ? 62 : 92, tankH = 166, tumorX = width * .72, tumorY = 205;
        const baseRadius = mobile ? 42 : 57, sizeRadius = value => baseRadius * Math.max(.55, Math.min(1.7, 1 + .22 * Math.log(Math.max(.08, value / Math.max(1, p.tumor0))))), tumorRadius = sizeRadius(state.secondary), untreatedRadius = sizeRadius(state.untreated);
        const plasmaMax = Math.max(.01, p.dose / p.v * 1.4), effect = p.kkill * state.c / Math.max(.01, p.ec50 + state.c);
        tank(tankX, tankY, tankW, tankH, state.c / plasmaMax, '#147ea5', en ? '1-compartment PK' : 'PK a 1 compartiment', `${state.c.toFixed(2)} mg/L`);
        movingSignal(tankX + tankW + 9, tumorY, tumorX - Math.max(tumorRadius, untreatedRadius) - 12, tumorY, effect > .001 ? Math.min(7, 2 + Math.round(18 * effect)) : 0, '#147ea5');
        arrow(tankX + tankW / 2, tankY + tankH + 7, tankX + tankW / 2, tankY + tankH + 39, '#81758a');
        label(en ? 'Elimination' : 'Elimination', tankX + tankW / 2, tankY + tankH + 57, mobile ? 8 : 10, '#5e5365', tankW + 30);

        ctx.beginPath(); ctx.arc(tumorX, tumorY, untreatedRadius, 0, Math.PI * 2); ctx.strokeStyle = '#65767b'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(tumorX, tumorY, tumorRadius, 0, Math.PI * 2); ctx.fillStyle = '#ecf7f1'; ctx.fill(); ctx.strokeStyle = '#168d71'; ctx.lineWidth = 4; ctx.stroke();
        const cellCount = Math.max(8, Math.min(44, Math.round(20 * Math.sqrt(Math.max(.08, state.secondary / Math.max(1, p.tumor0)))))), resistantFraction = Math.max(0, Math.min(1, state.resistantPct / 100));
        for (let i = 0; i < cellCount; i++) {
          const angle = i * 2.39996 + (animateParticles ? time * .035 : 0), radial = tumorRadius * .72 * Math.sqrt((i + .5) / cellCount), x = tumorX + Math.cos(angle) * radial, y = tumorY + Math.sin(angle) * radial;
          const resistant = ((i * 37) % 101) / 100 < resistantFraction, color = resistant ? '#d26b3a' : '#168d71', pulse = animateParticles ? 1 + .09 * Math.sin(time * .7 + i) : 1;
          ctx.beginPath(); ctx.arc(x, y, (resistant ? 5.6 : 5) * pulse, 0, Math.PI * 2); ctx.fillStyle = `${color}66`; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
        }
        label(en ? 'Tumor under treatment' : 'Tumeur sous traitement', tumorX, 56, mobile ? 9 : 12, '#244a55', width * .42);
        label(`${state.secondary.toFixed(1)} mm`, tumorX, mobile ? 78 : 112, mobile ? 10 : 12, '#244a55', tumorRadius * 1.5);
        label(`${en ? 'Untreated outline' : 'Contour sans traitement'}: ${state.untreated.toFixed(1)} mm`, tumorX, tumorY + Math.max(tumorRadius, untreatedRadius) + 20, mobile ? 8 : 10, '#586b70', width * .45);
        const legendY = mobile ? 326 : 86; ball(tumorX - (mobile ? 55 : 70), legendY, '#168d71', 4); label(en ? 'Sensitive' : 'Sensibles', tumorX - (mobile ? 22 : 31), legendY + 4, mobile ? 8 : 9, '#246a4b', 64);
        ball(tumorX + (mobile ? 19 : 42), legendY, '#d26b3a', 4); label(`${state.resistantPct.toFixed(0)}% R`, tumorX + (mobile ? 48 : 72), legendY + 4, mobile ? 8 : 9, '#9b4828', 60);
        return true;
      }
      if (config.scene === 'infectiology') {
        const tubeX = width * (mobile ? .2 : .16), tubeY = 70, tubeW = mobile ? 64 : 100, tubeH = 245, scaleMin = config.parameters.mic.min, scaleMax = config.parameters.mic.max;
        const onScale = value => value <= 0 ? 0 : clamp(Math.log(value / scaleMin) / Math.log(scaleMax / scaleMin)), concentrationLevel = onScale(state.c), micLevel = onScale(p.mic);
        tank(tubeX - tubeW / 2, tubeY, tubeW, tubeH, concentrationLevel, '#147ea5', mobile ? (en ? 'Antibiotic' : 'Antibiotique') : (en ? 'Antibiotic concentration' : 'Concentration antibiotique'), `${state.c.toFixed(2)} mg/L`);
        ctx.strokeStyle = '#147ea5'; ctx.lineWidth = 4; ctx.strokeRect(tubeX - tubeW / 2, tubeY, tubeW, tubeH);
        const micY = tubeY + tubeH * (1 - micLevel); line(tubeX - tubeW / 2 - 9, micY, tubeX + tubeW / 2 + 17, micY, '#a26c2a', 7, true);
        const dishX = width * .72, dishR = mobile ? 62 : 88, burdenFraction = clamp((state.secondary - 2) / 6), colonyRadius = dishR * (.16 + .72 * burdenFraction);
        ctx.beginPath(); ctx.arc(dishX, middleY, dishR, 0, Math.PI * 2); ctx.fillStyle = '#fffdf8'; ctx.fill(); ctx.strokeStyle = '#9b6a55'; ctx.lineWidth = 4; ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i <= 32; i++) { const angle = i / 32 * Math.PI * 2, ripple = 1 + .05 * Math.sin(i * 2.7 + (animateParticles ? time * .4 : 0)), x = dishX + Math.cos(angle) * colonyRadius * ripple, y = middleY + Math.sin(angle) * colonyRadius * ripple; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
        ctx.closePath(); ctx.fillStyle = state.c >= p.mic ? '#8cbfa85c' : '#d9a07c75'; ctx.fill(); ctx.strokeStyle = state.c >= p.mic ? '#168d71' : '#b2572e'; ctx.lineWidth = 3; ctx.stroke();
        const bacteriaCount = Math.max(3, Math.min(44, Math.round(3 + burdenFraction * 41)));
        for (let i = 0; i < bacteriaCount; i++) {
          const angle = i * 2.39996 + (animateParticles ? time * .055 : 0), radial = colonyRadius * .72 * Math.sqrt((i + .4) / bacteriaCount), x = dishX + Math.cos(angle) * radial, y = middleY + Math.sin(angle) * radial;
          ctx.save(); ctx.translate(x, y); ctx.rotate(angle + (animateParticles ? time * .16 : 0)); ctx.strokeStyle = i % 4 ? '#a84f2d' : '#704d73'; ctx.lineWidth = mobile ? 4 : 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.stroke(); ctx.restore();
        }
        movingSignal(tubeX + tubeW / 2 + 12, middleY, dishX - dishR - 10, middleY, Math.min(7, Math.max(1, Math.round(state.c / Math.max(.01, p.mic) * 2))), '#147ea5');
        label(en ? 'Bacterial strain' : 'Souche bacterienne', dishX, 56, mobile ? 9 : 12, '#244a55', dishR * 2.2); label(`${state.secondary.toFixed(2)} log10 CFU/mL`, dishX, middleY + dishR + 20, 10, '#7c3f29', dishR * 2);
        label(state.netGrowth <= 0 ? (en ? 'Net bacterial killing' : 'Destruction bacterienne nette') : (en ? 'Net bacterial growth' : 'Croissance bacterienne nette'), width / 2, height - 18, 11, state.netGrowth <= 0 ? '#087b83' : '#b2572e', width - 20);
        return true;
      }
      if (config.scene === 'saturable') {
        const levelMax = Math.max(.01, p.dose / p.v), tankX = width * .06, tankW = width * .3, gateX = width * .61;
        tank(tankX, 92, tankW, 220, state.c / levelMax, '#147ea5', en ? 'Drug awaiting elimination' : 'Médicament à éliminer', `${state.c.toFixed(2)} mg/L`);
        arrow(tankX + tankW + 10, middleY, gateX - 28, middleY, '#5d8996'); panel(gateX - 24, 82, 48, 238, '#a26c2a', '#fff8e8');
        const active = Math.round(6 * state.capacityPct / 100); for (let i = 0; i < 6; i++) { const y = 108 + i * 36; ctx.beginPath(); ctx.arc(gateX, y, 9, 0, Math.PI * 2); ctx.fillStyle = i < active ? '#d29a31' : '#fff'; ctx.fill(); ctx.strokeStyle = '#a26c2a'; ctx.lineWidth = 2; ctx.stroke(); }
        label(en ? 'Finite elimination sites' : "Sites d'elimination limites", gateX, 55, mobile ? 9 : 12, '#244a55', width * .3); label(`${state.capacityPct.toFixed(0)} % Vmax`, gateX, 337, 11, '#7b5b32', 120);
        const queue = Math.max(1, Math.min(12, Math.round(12 * state.capacityPct / 100))); for (let i = 0; i < queue; i++) ball(gateX - 38 - (i % 4) * 13, middleY - 22 + Math.floor(i / 4) * 20, '#147ea5', 5);
        movingSignal(gateX + 30, middleY, width * .91, middleY, active, '#81758a'); label(en ? 'Eliminated' : 'Elimine', width * .86, middleY - 28, 11, '#5e5365', width * .2);
        return true;
      }
      if (config.scene === 'tmdd') {
        const freeCount = Math.min(16, Math.max(0, Math.round(16 * state.free / Math.max(1, p.dose)))), targetTotal = Math.max(1e-9, state.target + state.complex);
        const receptorCount = Math.max(5, Math.min(18, Math.round(5 + 13 * Math.log10(1 + p.target0) / Math.log10(101)))), boundCount = Math.min(receptorCount, Math.round(receptorCount * state.complex / targetTotal));
        const cellX = width * .72, cellY = 205, cellRadius = mobile ? 70 : 100, plasmaRight = cellX - cellRadius - 28;
        label(en ? 'Free drug in plasma' : 'Médicament libre dans le plasma', width * .19, 48, mobile ? 9 : 12, '#147ea5', width * .34);
        for (let i = 0; i < freeCount; i++) ball(width * (.055 + .29 * ((i * .618) % 1)), 80 + 205 * ((i * .414 + (animateParticles ? time * .018 : 0)) % 1), '#147ea5', mobile ? 4.5 : 6);
        arrow(width * .2, 294, width * .2, 326, '#81758a'); label(en ? 'Linear clearance' : 'Clairance lineaire', width * .2, 344, mobile ? 8 : 10, '#5e5365', width * .3);

        ctx.beginPath(); ctx.arc(cellX, cellY, cellRadius, 0, Math.PI * 2); ctx.fillStyle = '#e8f7ef'; ctx.fill(); ctx.strokeStyle = '#36a36e'; ctx.lineWidth = 8; ctx.stroke();
        ctx.beginPath(); ctx.arc(cellX, cellY, cellRadius * .5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff88'; ctx.fill(); ctx.strokeStyle = '#9bcab0'; ctx.lineWidth = 2; ctx.stroke();
        label(en ? 'Target-bearing cell' : 'Cellule portant la cible', cellX, 54, mobile ? 9 : 12, '#246a4b', width * .42);
        label(`${state.secondary.toFixed(0)} % ${en ? 'occupancy' : "d'occupation"}`, cellX, cellY + 5, mobile ? 10 : 13, '#6c3f70', cellRadius * 1.45);

        const receptorAngles = Array.from({ length: receptorCount }, (_, i) => Math.PI * (.57 + .86 * (receptorCount === 1 ? .5 : i / (receptorCount - 1))));
        for (const [i, angle] of receptorAngles.entries()) {
          const bound = i < boundCount, color = bound ? '#8c4c89' : '#27845a', ux = Math.cos(angle), uy = Math.sin(angle), tx = -uy, ty = ux;
          const baseX = cellX + ux * (cellRadius - 2), baseY = cellY + uy * (cellRadius - 2), tipX = cellX + ux * (cellRadius + 18), tipY = cellY + uy * (cellRadius + 18);
          line(baseX, baseY, tipX, tipY, color, 3); line(tipX, tipY, tipX + ux * 8 + tx * 7, tipY + uy * 8 + ty * 7, color, 2.5); line(tipX, tipY, tipX + ux * 8 - tx * 7, tipY + uy * 8 - ty * 7, color, 2.5);
          if (bound) ball(tipX + ux * 12, tipY + uy * 12, '#147ea5', mobile ? 4.5 : 5.5);
        }
        movingSignal(plasmaRight - width * .08, 142, cellX - cellRadius - 20, 171, state.flows.bind > 1e-6 ? 4 : 0, '#8c4c89', true);
        const internalCount = Math.min(12, Math.round(12 * state.internalized / Math.max(1, state.administered)));
        for (let i = 0; i < internalCount; i++) { const angle = i * 2.39996 + (animateParticles ? time * .04 : 0), radial = cellRadius * .38 * Math.sqrt((i + .5) / Math.max(1, internalCount)); ball(cellX + Math.cos(angle) * radial, cellY + Math.sin(angle) * radial, '#a24f68', mobile ? 3.5 : 4.5); }
        if (boundCount) arrow(cellX - cellRadius * .72, cellY - cellRadius * .46, cellX - cellRadius * .25, cellY - cellRadius * .12, '#a24f68');
        label(en ? 'Internalized complexes' : 'Complexes internalises', cellX, cellY + cellRadius + (mobile ? 63 : 25), mobile ? 8 : 10, '#7b3a4f', width * .4);
        return true;
      }
      if (config.scene === 'covariate-volume') {
        const volume = state.volume, ratioV = volume / p.vRef, tankW = Math.min(width * .48, width * .31 * Math.sqrt(ratioV)), tankH = Math.min(235, 175 * Math.sqrt(ratioV)), tankX = width * .67 - tankW / 2, tankY = 92 + (235 - tankH), concentrationMax = p.dose / p.vRef, weightPoint = pointFor(controlGeometry());
        label(`${p.weight.toFixed(0)} kg`, weightPoint.x, 82, 20, '#7c3f29', width * .25); line(weightPoint.x, 170, weightPoint.x, 210, '#c97532', 4); ctx.strokeStyle = '#c97532'; ctx.lineWidth = 4; ctx.strokeRect(weightPoint.x - width * .055, 115, width * .11, 55);
        const absorptionDots = state.flows.absorption > .01 ? Math.min(6, 1 + Math.round(6 * state.flows.absorption / Math.max(.01, p.ka * p.dose))) : 0;
        movingSignal(width * .32, middleY, tankX - 18, middleY, absorptionDots, '#c97532', true); label('V = Vref (WT/WTref)^beta', width * .43, middleY - 16, mobile ? 8 : 11, '#7c3f29', width * .3);
        ctx.setLineDash([6, 5]); ctx.strokeStyle = '#7c9aa3'; ctx.lineWidth = 2; ctx.strokeRect(width * .67 - width * .31 / 2, 92 + 60, width * .31, 175); ctx.setLineDash([]);
        tank(tankX, tankY, tankW, tankH, state.c / Math.max(.01, concentrationMax), '#147ea5', en ? 'Current apparent volume' : 'Volume apparent actuel', `${volume.toFixed(1)} L | ${state.c.toFixed(2)} mg/L`);
        const moleculeCount = Math.min(16, Math.round(16 * state.central / Math.max(1, p.dose))); for (let i = 0; i < moleculeCount; i++) ball(tankX + tankW * (.12 + .76 * ((i * .618) % 1)), tankY + tankH * (.18 + .7 * ((i * .414) % 1)), '#147ea5', 4);
        label(en ? 'Dashed outline: reference volume' : 'Pointilles : volume de reference', width * .67, height - 18, 10, '#48656c', width * .5);
        return true;
      }
      if (config.scene === 'covariate-clearance') {
        const tankX = width * .06, tankY = 105, tankW = width * .27, tankH = 175, kidneyX = width * .69, kidneyY = 180;
        const maximum = Math.max(.01, p.dose / p.v), renalFraction = state.clearance > 0 ? state.renalClearance / state.clearance : 0;
        tank(tankX, tankY, tankW, tankH, state.c / maximum, '#147ea5', en ? 'Central concentration' : 'Concentration centrale', `${state.c.toFixed(2)} mg/L`);
        movingSignal(tankX + tankW + 10, kidneyY, kidneyX - 68, kidneyY, Math.min(8, Math.max(1, Math.round(2 + 6 * renalFraction))), '#147ea5');
        ctx.save(); ctx.translate(kidneyX, kidneyY); ctx.beginPath(); ctx.moveTo(0, -70); ctx.bezierCurveTo(70, -74, 78, -12, 43, 20); ctx.bezierCurveTo(20, 43, 29, 72, -17, 72); ctx.bezierCurveTo(-72, 67, -83, 12, -49, -23); ctx.bezierCurveTo(-30, -42, -35, -65, 0, -70); ctx.closePath(); ctx.fillStyle = '#d9857355'; ctx.fill(); ctx.strokeStyle = '#b2572e'; ctx.lineWidth = 4; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-7, -45); ctx.bezierCurveTo(27, -30, 27, 20, -6, 42); ctx.strokeStyle = '#b2572e'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        label(en ? 'Renal filtration' : 'Filtration renale', kidneyX, 80, mobile ? 9 : 12, '#7c3f29', width * .32);
        label(`CL ${state.clearance.toFixed(2)} L/h`, kidneyX, kidneyY + 5, mobile ? 9 : 11, '#7c3f29', width * .25);
        arrow(kidneyX + 8, kidneyY + 77, kidneyX + 8, kidneyY + 112, '#81758a');
        label(`${(100 * renalFraction).toFixed(0)}% ${en ? 'renal CL' : 'CL renale'}`, kidneyX, kidneyY + 132, mobile ? 8 : 10, '#5e5365', width * .35);
        label(en ? 'CLrenal = CLref (GFR/GFRref)^beta' : 'CLrenale = CLref (DFG/DFGref)^beta', width * .34, mobile ? 344 : 326, mobile ? 8 : 10, '#7c3f29', width * .55);
        return true;
      }
      return false;
    };
    if (drawSpecialized()) { drawDirectControl(); label(`${time.toFixed(1)} ${config.unit === 'day' ? (en ? 'days' : 'jours') : 'h'}`, width - 55, 24, 14, '#294651', 100); return; }
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
    drawDirectControl();
    label(`${time.toFixed(1)} ${config.unit === 'day' ? (en ? 'days' : 'jours') : 'h'}`, width - 55, 24, 14, '#294651', 100);
    if (lab === 'effect-site') label(en ? 'Conceptual biophase: no drug mass is removed from plasma.' : 'Biophase conceptuelle : aucune masse de médicament ne quitte le plasma.', width / 2, height - 13, width < 520 ? 9 : 11, '#7b5b32', width - 20);
  }
  $: if (mounted) { config; p; state; time; en; animateParticles; width; dragging; hovered; draw(); }
  onMount(() => { mounted = true; draw(); });
</script>

<div class="scene-tools"><label><input type="checkbox" bind:checked={animateParticles}/><Play size={17}/>{en ? 'Animate particles' : 'Animer les particules'}</label></div>
<div class="scene" bind:clientWidth={width}>
  <canvas bind:this={canvas} style:height={`${height}px`} style:cursor={dragging ? 'grabbing' : hovered ? 'grab' : 'default'} class:interactive={!!directControl} data-testid="molecular-scene" data-scene-width={width} data-scene-height={height} data-direct-key={directControl?.key} data-control-axis={directControl ? (Math.abs(directControl.x2 - directControl.x1) >= Math.abs(directControl.y2 - directControl.y1) ? 'horizontal' : 'vertical') : undefined} data-control-x={directPoint?.x} data-control-y={directPoint?.y} aria-label={en ? 'Interactive molecular journey' : 'Parcours moléculaire interactif'} title={directControl ? `${en ? directControl.label.en : directControl.label.fr} - ${en ? 'drag to change' : 'déplacer pour modifier'}` : ''} on:pointerdown={pointerDown} on:pointermove={pointerMove} on:pointerup={pointerUp} on:pointercancel={pointerUp} on:pointerleave={() => { if (!dragging) hovered = false; }}></canvas>
  <button class="scene-play" title={playing ? (en ? 'Pause animation' : "Suspendre l'animation") : (en ? 'Start animation' : "Lancer l'animation")} aria-label={playing ? (en ? 'Pause animation' : "Suspendre l'animation") : (en ? 'Start animation' : "Lancer l'animation")} on:click={() => dispatch('play')}>{#if playing}<Pause size={22}/>{:else}<Play size={22}/>{/if}</button>
</div>
<div class="mass-balance" aria-label={en ? 'Calculated drug mass balance' : 'Bilan de masse médicamenteuse calculé'}>
  <div class="mass-bar">{#each config.mass as key}<span style:width={`${100 * (state.mass[key] ?? 0) / Math.max(1e-9, state.administered)}%`} style:background={config.nodes.find(node => node.id === key)?.color ?? '#888'}></span>{/each}</div>
  <div class="mass-values">{#each config.mass as key}<span><i style:background={config.nodes.find(node => node.id === key)?.color ?? '#888'}></i>{en ? config.nodes.find(node => node.id === key)?.label.en : config.nodes.find(node => node.id === key)?.label.fr} <b>{state.administered ? (100 * (state.mass[key] ?? 0) / state.administered).toFixed(0) : 0} %</b></span>{/each}</div>
</div>

<style>
  .scene { position:relative; width:100%; min-width:0; background:#edf6f7; }
  canvas { display:block; width:100%; }
  canvas.interactive { touch-action:none; }
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
