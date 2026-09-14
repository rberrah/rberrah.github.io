// Memory only: discarded on reload, never included in URLs or browser storage.
const drafts = new Map();
export const pkKinds = ['depot', 'transit', 'central', 'periph'];
/** @param {any} spec */
export const isPkDiagram = (spec) => Boolean(spec?.nodes?.length) && spec.nodes.every((/** @type {{kind:string}} */ node) => pkKinds.includes(node.kind));
/** @param {any} value */
const clone = (value) => JSON.parse(JSON.stringify(value));

/** @param {string} key */
export function readDraft(key) {
  const value = drafts.get(key);
  return value === undefined ? null : clone(value);
}

/** @param {string} key @param {any} value */
export function writeDraft(key, value) {
  if (typeof window !== 'undefined') drafts.set(key, clone(value));
}

/** @param {string} key */
export function takeDraft(key) {
  const value = readDraft(key);
  drafts.delete(key);
  return value;
}
