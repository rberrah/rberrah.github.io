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
        <div>
          <span class="figure-number">01</span>
          <div>
            <h3>{tr('Heatmap des variables principales', 'Heatmap of leading features')}</h3>
            <p>{tr(
              'Chaque ligne est centrée-réduite séparément : la couleur montre une valeur relative au profil moyen de cette variable, pas un fold change.',
              'Each row is standardized separately: color shows a value relative to that feature’s mean profile, not a fold change.'
            )}</p>
          </div>
        </div>
        <div class="figure-actions">
          <select bind:value={heatmapLayer} aria-label={tr('Couche de la heatmap', 'Heatmap layer')}>
            {#each heatmapLayers as layer}
              <option value={layer}>{layerLabel(layer)}</option>
            {/each}
          </select>
          <button type="button" on:click={() => downloadSvg('pmx-omics-heatmap-svg', 'multiomics_heatmap.svg')}>SVG</button>
        </div>
      </div>

      {#if heatmap?.rows?.length}
        {@const cellW = 23}
        {@const rowH = 21}
        {@const left = 185}
        {@const top = 118}
        {@const width = Math.max(760, left + heatmap.samples.length * cellW + 35)}
        {@const height = top + heatmap.rows.length * rowH + 55}
        <div class="svg-scroll">
          <svg id="pmx-omics-heatmap-svg" viewBox={'0 0 ' + width + ' ' + height} role="img" aria-label={tr('Heatmap multi-omique', 'Multi-omics heatmap')}>
            <rect width={width} height={height} fill="white"/>
            <text x="12" y="24" class="svg-heading">{layerLabel(heatmapLayer)} · z-score</text>
            <text x="12" y="43" class="svg-note">{heatmap.selectionRule}</text>

            {#each heatmap.samples as sample, column}
              <text
                x={left + column * cellW + cellW / 2}
                y={top - 9}
                transform={'rotate(-58 ' + (left + column * cellW + cellW / 2) + ' ' + (top - 9) + ')'}
                text-anchor="start"
                class="sample-label"
              >{sample.sampleId}</text>
              <text x={left + column * cellW + cellW / 2} y={top - 2} text-anchor="middle" class="condition-mark">
                {sample.condition ? sample.condition.slice(0, 1) : '·'}
              </text>
            {/each}

            {#each heatmap.rows as row, rowIndex}
              <text x={left - 9} y={top + rowIndex * rowH + 15} text-anchor="end" class="feature-label">{shortFeature(row.feature, 24)}</text>
              {#each row.z as value, column}
                <rect
                  x={left + column * cellW}
                  y={top + rowIndex * rowH}
                  width={cellW - 1}
                  height={rowH - 1}
                  fill={diverging(value, 2.5)}
                >
                  <title>{row.feature} · {heatmap.samples[column].sampleId} · z={fmt(value)} · {tr('effet', 'effect')}={fmt(row.effect)} · q={fmt(row.qValue, 3)}</title>
                </rect>
              {/each}
            {/each}

            <text x={left} y={height - 18} class="svg-note">−2.5</text>
            {#each [-2.5,-2,-1.5,-1,-0.5,0,0.5,1,1.5,2,2.5] as value, i}
              <rect x={left + 32 + i * 16} y={height - 31} width="16" height="13" fill={diverging(value, 2.5)}/>
            {/each}
            <text x={left + 218} y={height - 18} class="svg-note">+2.5 z</text>
          </svg>
        </div>
        <p class="method-note">{heatmap.method} {heatmap.samplesCapped ? tr('Seuls les 48 premiers échantillons ordonnés sont affichés.', 'Only the first 48 ordered samples are displayed.') : ''}</p>
      {/if}
    </article>
  {/if}

  <article class="figure-card" data-testid="multiomics-metabologram">
    <div class="figure-title">
      <div>
        <span class="figure-number">02</span>
        <div>
          <h3>{tr('Metabologramme transcriptome ↔ métabolome', 'Transcriptome ↔ metabolome metabologram')}</h3>
          <p>{tr(
            'À gauche : métabolites. À droite : transcrits. Le centre résume seulement la moyenne descriptive des log2FC affichés.',
            'Left: metabolites. Right: transcripts. The center is only the descriptive mean of the displayed log2FC values.'
          )}</p>
        </div>
      </div>
      <button type="button" on:click={() => downloadSvg('pmx-metabologram-svg', 'multiomics_metabologram.svg')}>SVG</button>
    </div>

    {#if metaboliteSegments.length || transcriptSegments.length}
      <div class="metabologram-layout">
        <svg id="pmx-metabologram-svg" viewBox="0 0 500 500" role="img" aria-label={tr('Metabologramme circulaire', 'Circular metabologram')}>
          <rect width="500" height="500" fill="white"/>
          <circle cx="250" cy="250" r="194" fill="none" stroke="#cfd6dc" stroke-width="1"/>
          <line x1="250" y1="54" x2="250" y2="446" stroke="#b9c1c8" stroke-width="1.5"/>

          {#each metaboliteSegments as segment}
            {@const stroke = qStroke(segment.qValue)}
            <path d={segment.path} fill={diverging(segment.effect)} stroke="#263238" stroke-width={stroke.width} stroke-dasharray={stroke.dash}>
              <title>{segment.feature} · log2FC={fmt(segment.effect)} · q={fmt(segment.qValue, 3)}</title>
            </path>
          {/each}
          {#each transcriptSegments as segment}
            {@const stroke = qStroke(segment.qValue)}
            <path d={segment.path} fill={diverging(segment.effect)} stroke="#263238" stroke-width={stroke.width} stroke-dasharray={stroke.dash}>
              <ti