// Publish the single source portal/game at the canonical PMx Explain URL.
// Keep the historical /game/ entry point as a compatibility alias.
// The assembled distribution, never the legacy Svelte route, owns this route.
import {cp,rm,mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
const target=process.argv[2]||'dist';
const source='portal/game',canonical=join(target,'pharmacometrie','game');
await stat(join(source,'index.html'));
await stat(join(target,'pharmacometrie','index.html'));
await rm(canonical,{recursive:true,force:true});
await mkdir(canonical,{recursive:true});
await cp(source,canonical,{recursive:true});
const a=await readFile(join(source,'index.html'),'utf8');
const b=await readFile(join(canonical,'index.html'),'utf8');
if(a!==b)throw new Error('Canonical game differs from portal/game source');
// Keep historical bookmarks usable without publishing two copies of the game.
const legacy=join(target,'game');
await rm(legacy,{recursive:true,force:true});
await mkdir(legacy,{recursive:true});
await writeFile(join(legacy,'index.html'),`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><link rel="canonical" href="/pharmacometrie/game/"><meta http-equiv="refresh" content="0;url=/pharmacometrie/game/"><title>PMx Game</title></head><body><p><a href="/pharmacometrie/game/">PMx Game</a></p><script>location.replace('/pharmacometrie/game/'+location.search+location.hash)</script></body></html>`);
console.log('Mounted the unique PMx Game at /pharmacometrie/game/; /game/ redirects without a duplicate');
