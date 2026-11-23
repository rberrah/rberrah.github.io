// Publish the single source portal/game at the canonical PMx Explain URL.
// Keep the historical /game/ entry point as a compatibility alias.
// The assembled distribution, never the legacy Svelte route, owns this route.
import {cp,rm,mkdir,readFile,stat} from 'node:fs/promises';
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
console.log('Mounted PMx Game at /pharmacometrie/game/ from portal/game');
