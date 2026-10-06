import { error } from '@sveltejs/kit';
import { tracks } from '$lib/content/tracks';

export const prerender = true;
export const entries = () => tracks.map(track => ({ id: track.id }));
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  const track = tracks.find(item => item.id === params.id);
  if (!track) error(404, 'Unknown learning track');
  return { track };
}
