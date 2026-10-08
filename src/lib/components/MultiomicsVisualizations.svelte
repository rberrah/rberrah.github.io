<script>
  // @ts-nocheck
  export let result = null;
  export let language = 'fr';

  const tr = (fr, en) => language === 'en' ? en : fr;
  let heatmapLayer = 'transcriptomics';

  $: visuals = result?.visualizations || null;
  $: heatmapLayers = visuals ? Object.keys(visuals.heatmaps || {}).filter((layer) => visuals.heatmaps[layer]?.rows?.length) : [];
  $: if (heatmapLayers.length && !heatmapLayers.includes(heatmapLayer)) heatmapLayer = heatmapLayers[0];
  $: heatmap = visuals?.heatmaps?.[heatmapLayer] || null;
  $: metabologram = visuals?.metabologram || null;
  $: central = visuals?.centralCarbon || null;

  function layerLabel(layer) {
    if (layer === 'transcriptomics') return tr('Transcriptomique', 'Transcriptomics');
    if (layer === 'proteomics') return tr('Protéomique', 'Proteomics');
    if (layer === 'metabolomics') return tr('Métabolomique', 'Metabolomics');
    return layer;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function diverging(value, limit = 3) {
    if (!Number.isFinite(value)) return 'rgb(224,224,224)';
    const x = clamp(value / limit, -1, 1);
    const white = [247, 247, 247];
    const red = [204, 62, 62];
    const blue = [53, 103, 178];
    const target = x >= 0 ? red : blue;
    const amount = Math.abs(x);
    return 'rgb(' + white.map((channel, i) => Math.round(channel + (target[i] - channel) * amount)).join(',') + ')';
  }

  function qStroke(q) {
    if (Number.isFinite(q) && q <= 0.05) return { width: 3, dash: '' };
    if (Number.isFinite(q) && q <= 0.10) return { width: 2, dash: '' };
    return { width: 1, dash: '3 2' };
  }

  function fmt(value, digits = 2) {
    return Number.isFinite(value) ? Number(value).toFixed(digits) : '—';
  }

  function shortFeature(value, max = 16) {
    const x = String(value || '');
    return x.length > max ? x.slice(0, max - 1) + '…' : x;
  }

  function polar(cx, cy, radius, angle) {
    const radians = angle * Math.PI / 180;
    return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
  }

  function donutPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
    const outerStart = polar(cx, cy, outerRadius, startAngle);
    const outerEnd = polar(cx, cy, outerRadius, endAngle);
    const innerEnd = polar(cx, cy, innerRadius, endAngle);
    const innerStart = polar(cx, cy, innerRadius, startAngle);
    const large = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    const sweep = endAngle > startAngle ? 1 : 0;
    const innerSweep = sweep ? 0 : 1;
    return [
      'M', outerStart.x, outerStart.y,
      'A', outerRadius, outerRadius, 0, large, sweep, outerEnd.x, outerEnd.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, large, innerSweep, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  }

  function ringSegments(entries, side) {
    if (!entries?.length) return [];
    const start = side === 'left' ? 90 : -90;
    const end = side === 'left' ? 270 : 90;
    const step = (end - start) / entries.length;
    return entries.map((entry, index) => {
      const a0 = start + index * step + 0.6;
      const a1 = start + (index + 1) * step - 0.6;
      return { ...entry, path: donutPath(250, 250, 112, 190, a0, a1) };
    });
  }

  $: metaboliteSegments = ringSegments(metabologram?.metabolomics || [], 'left');
  $: transcriptSegments = ringSegments(metabologram?.transcriptomics || [], 'right');

  function findCentralNode(id) {
    return central?.metabolites?.find((node) => node.id === id);
  }

  function measurementColor(measurement) {
    return measurement?.status === 'measured' ? diverging(measurement.effect, 3) : 'rgb(220,220,220)';
  }

  function measurementTitle(label, measurement) {
    if (!measurement) return label + ' · ' + tr('non mesuré / non reconnu', 'not measured / not matched');
    if (measurement.status === 'non_log2_scale') {
      return label + ' · ' + measurement.feature + ' · ' + tr('effet non affiché : échelle non log2', 'effect not shown: non-log2 scale');
    }
    return label + ' · ' + measurement.feature + ' · log2FC=' + fmt(measurement.effect) + ' · q=' + fmt(measurement.qValue, 3);
  }

  function downloadSvg(id, filename) {
    const source = document.getElementById(id);
    if (!(source instanceof SVGElement)) return;
    const copy = source.cloneNode(true);
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const xml = new XMLSerializer().serializeToString(copy);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(href);
  }
</script>

{#if visuals}
<section class="visual-panel" data-testid="multiomics-visualizations">
  <div class="visual-head">
    <div>
      <p class="eyebrow">{tr('Visualisation intégrée', 'Integrated visualization')}</p>
      <h2>{tr('Voir le signal biologique sous plusieurs angles', 'View the biological signal from several angles')}</h2>
      <p>{tr(
        'Ces figures réutilisent les résultats calculés. Elles n’ajoutent aucun test statistique et ne changent pas les q-values.',
        'These figures reuse the computed results. They add no statistical test and do not change q-values.'
      )}</p>
    </div>
  </div>

  {#if heatmapLayers.length}
    <article class="figure-card" data-testid="multiomics-heatmap">
      <div class="figure-title">
 