// Historical PMx DDI generators have been retired. The clinical-science
// owners maintain all 46 active model .cpp sources in rberrah/MIPD-Engine.
// Never regenerate PMx browser models with stale PK coefficients here.
import { readFileSync } from 'node:fs';
const pin = JSON.parse(readFileSync(new URL('../integration/mipd-release.json', import.meta.url), 'utf8'));
if (pin.repository !== 'rberrah/MIPD-Engine' || !/^[0-9a-f]{40}$/.test(pin.sha)) {
  throw new Error('Missing immutable standalone MIPD release; refusing legacy model generation.');
}
console.log('PMx historical DDI generation disabled. Update model sources via the qualified MIPD-Engine release import, then run the 46-model parity checks. Pin: ' + pin.sha);
