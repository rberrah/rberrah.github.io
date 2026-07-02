<script>
  // Tracé de courbe animé, réutilisable par toutes les visualisations.
  // -------------------------------------------------------------------------
  // Deux animations combinées :
  //  1. « draw-in » au montage : la courbe se dessine de gauche à droite
  //     (via stroke-dasharray / stroke-dashoffset).
  //  2. « morph » : quand les points changent (ex. l'utilisateur bouge un
  //     slider), le chemin interpole en douceur vers la nouvelle forme.
  //
  // Respecte prefers-reduced-motion : dans ce cas, aucune transition, la
  // courbe passe instantanément à sa valeur cible.
  //
  // Usage :
  //   <AnimatedPath {points} stroke="var(--accent-pk)" width={3} />
  // où `points` est un tableau [{x, y}, ...] déjà projeté en coordonnées SVG.

  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { reducedMotion } from '$lib/motion/reducedMotion';

  /** @type {{x:number, y:number}[]} */
  export let points = [];
  export let stroke = 'var(--accent-pk)';
  export let width = 3;
  export let fill = 'none';
  export let duration = 450;
  /** Longueur estimée pour l'effet de tracé (px). */
  export let drawDuration = 900;
  export let closed = false; // ferme le chemin (aires)

  // Interpole chaque coordonnée. On suppose un nombre de points stable entre
  // deux mises à jour (c'est le cas de nos courbes échantillonnées à pas fixe).
  /** @param {{x:number,y:number}[]} pts */
  const flat = (pts) => pts.flatMap((p) => [p.x, p.y]);

  const coords = tweened(flat(points), { duration, easing: cubicOut });

  $: if ($reducedMotion) {
    coords.set(flat(points), { duration: 0 });
  } else {
    coords.set(flat(points));
  }

  $: d = buildPath($coords, closed);

  /**
   * @param {number[]} arr
   * @param {boolean} close
   */
  function buildPath(arr, close) {
    if (!arr || arr.length < 4) return '';
    let s = `M ${arr[0]} ${arr[1]}`;
    for (let i = 2; i < arr.length; i += 2) s += ` L ${arr[i]} ${arr[i + 1]}`;
    if (close) s += ' Z';
    return s;
  }

  // Effet de tracé au montage.
  /** @type {SVGPathElement | undefined} */
  let pathEl;
  let dashLen = 0;
  let drawn = false;

  onMount(() => {
    if ($reducedMotion || !pathEl) {
      drawn = true;
      return;
    }
    dashLen = pathEl.getTotalLength();
    // Force un reflow puis lance l'animation CSS.
    requestAnimationFrame(() => requestAnimationFrame(() => (drawn = true)));
  });
</script>

<path
  bind:this={pathEl}
  {d}
  {fill}
  stroke={stroke}
  stroke-width={width}
  stroke-linejoin="round"
  stroke-linecap="round"
  class:drawing={!drawn && dashLen > 0}
  style={!drawn && dashLen > 0
    ? `stroke-dasharray:${dashLen}; stroke-dashoffset:${dashLen};`
    : ''}
  style:--draw-duration={`${drawDuration}ms`}
/>

<style>
  path.drawing {
    animation: draw var(--draw-duration, 900ms) cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes draw {
    to {
      stroke-dashoffset: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    path.drawing {
      animation: none;
      stroke-dashoffset: 0 !important;
    }
  }
</style>
