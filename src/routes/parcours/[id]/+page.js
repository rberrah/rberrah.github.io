import { error } from '@sveltejs/kit';
import { learningTracks } from '$lib/content/tracks';

export const prerender = true;
export const entries = () => learningTracks.map(track => ({ id: track.id }));
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  const track = learningTracks.find(item => item.id === params.id);
  if (!track) error(404, 'Unknown learning track');
  return { track };
}
