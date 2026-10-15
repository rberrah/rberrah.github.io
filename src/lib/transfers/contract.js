export const TRANSFER_CONTRACT_VERSION = 3;

/** @param {{source:string,destination:string,transferredFields:string[],units?:Record<string,string>,route?:unknown,compartment?:unknown,schedule?:unknown,omittedFields?:string[],transformations?:string[],limitations?:string[]}} value */
export function makeTransferContract(value) {
  const contract = {
    version: TRANSFER_CONTRACT_VERSION,
    source: value.source,
    destination: value.destination,
    transferredFields: [...value.transferredFields],
    units: { ...(value.units ?? {}) },
    route: value.route ?? null,
    compartment: value.compartment ?? null,
    schedule: value.schedule ?? null,
    omittedFields: [...(value.omittedFields ?? [])],
    transformations: [...(value.transformations ?? [])],
    limitations: [...(value.limitations ?? [])]
  };
  if (!contract.source || !contract.destination || !contract.transferredFields.length) throw new Error('invalidTransferContract');
  return contract;
}

/** @template T @param {T} payload @param {ReturnType<typeof makeTransferContract>} contract */
export function attachTransferContract(payload, contract) {
  return { ...payload, _transferContract: contract };
}

/** Legacy version 1 payloads had no machine-readable contract. @param {any} payload */
export function readTransferPayload(payload) {
  if (!payload?._transferContract) return { payload, contract: { version: 1, source: 'legacy', destination: 'unknown' } };
  if (![1, 2, TRANSFER_CONTRACT_VERSION].includes(payload._transferContract.version)) throw new Error('unsupportedTransferContractVersion');
  const { _transferContract: contract, ...value } = payload;
  return { payload: value, contract };
}

/** @param {{route?:string,time_unit?:string,concentration_unit?:string,administration?:string,administrations?:unknown[],doseFractions?:number[],pd?:{driver?:string},spec?:{nodes?:{name?:string}[]},outputs?:string[]}} model
 * @param {{routes?:string[],timeUnits?:string[],concentrationUnits?:string[],administrations?:string[],maxAdministrations?:number,preserveDoseFractions?:boolean,requiresPkDriver?:boolean,requiredCompartments?:string[],outputs?:string[]}} support */
export function validateModelTransfer(model, support) {
  if (support.routes && !support.routes.includes(model.route ?? '')) throw new Error('routeIncompatible');
  if (support.timeUnits && !support.timeUnits.includes(model.time_unit ?? '')) throw new Error('unitIncompatible:time');
  if (support.concentrationUnits && !support.concentrationUnits.includes(model.concentration_unit ?? '')) throw new Error('unitIncompatible:concentration');
  if (support.administrations && !support.administrations.includes(model.administration ?? '')) throw new Error('administrationUnsupported');
  if (support.maxAdministrations != null && (model.administrations?.length ?? 1) > support.maxAdministrations) throw new Error('multipleAdministrationsNotRepresentable');
  if (model.doseFractions?.length && !support.preserveDoseFractions) throw new Error('doseFractionNotPreserved');
  if (model.pd && support.requiresPkDriver && !model.pd.driver) throw new Error('pdDriverMissing');
  const compartments = new Set(model.spec?.nodes?.map((node) => node.name).filter(Boolean) ?? []);
  if (support.requiredCompartments?.some((name) => !compartments.has(name))) throw new Error('compartmentMissing');
  if (model.outputs?.some((output) => !support.outputs?.includes(output))) throw new Error('outputNotRepresentable');
  return true;
}
