// @ts-nocheck
const close = (a, b) => Math.abs(a - b) <= Math.max(1e-8, Math.abs(a), Math.abs(b)) * 1e-6;
const clean = (value) => Number(Number(value).toPrecision(12));
const edgeName = (edge, nodes) => {
  const from = nodes.find((node) => node.id === edge.from)?.name ?? 'x';
  const to = edge.to === 'OUT' ? 'e' : nodes.find((node) => node.id === edge.to)?.name ?? 'x';
  return `k_${from}_${to}`;
};
const qName = (edge, nodes) => `q_${[edge.from, edge.to]
  .map((id) => nodes.find((node) => node.id === id)?.name ?? 'x').sort().join('_')}`;

/** Convert a Lego PK graph only when the browser simulator can preserve it exactly. */
export function legoSimulationConfig(spec, horizon = 24, modelCode = '') {
  const nodes = spec?.nodes ?? [];
  const edges = spec?.edges ?? [];
  if (!nodes.length || nodes.some((node) => !['depot', 'transit', 'central', 'periph'].includes(node.kind))) return null;
  const central = nodes.filter((node) => node.kind === 'central');
  const peripheral = nodes.filter((node) => node.kind === 'periph');
  const dosed = nodes.filter((node) => Number(node.dose) > 0);
  if (central.length !== 1 || peripheral.length > 2 || dosed.length !== 1 || Number(dosed[0].doseFraction ?? 100) !== 100) return null;

  const c = central[0];
  const doseNode = dosed[0];
  const vc = Number(c.vol);
  const elimination = edges.filter((edge) => edge.from === c.id && edge.to === 'OUT');
  if (!(vc > 0) || elimination.length !== 1 || elimination[0].kinetics !== 'first_order') return null;
  const eliminationEdge = elimination[0];
  const cl = clean(eliminationEdge.eliminationParameterization === 'clearance'
    ? Number(eliminationEdge.cl) : Number(eliminationEdge.k) * vc);
  if (!(cl > 0)) return null;

  const used = new Set([eliminationEdge]);
  let route = 'iv_bolus';
  let infusionDuration = 1;
  let ka = 1;
  let lag = 0;
  let absorptionMode = 'none';
  let nTransit = 3;
  let mtt = 1.5;
  let absorptionParameter = '';

  if (doseNode.id === c.id) {
    if (doseNode.inputType === 'zero_order') {
      route = 'iv_infusion';
      infusionDuration = Number(doseNode.inputDuration);
      if (!(infusionDuration > 0)) return null;
    }
  } else {
    if (!['depot', 'transit'].includes(doseNode.kind) || doseNode.inputType === 'zero_order') return null;
    route = 'oral_1st';
    const chainNodes = [doseNode];
    const chainEdges = [];
    let current = doseNode;
    while (current.id !== c.id) {
      const outgoing = edges.filter((edge) => edge.from === current.id && edge.to !== 'OUT');
      if (outgoing.length !== 1 || outgoing[0].kinetics !== 'first_order') return null;
      const edge = outgoing[0];
      const next = nodes.find((node) => node.id === edge.to);
      if (!next || (next.id !== c.id && !['depot', 'transit'].includes(next.kind)) || chainNodes.some((node) => node.id === next.id)) return null;
      chainEdges.push(edge); used.add(edge); current = next;
      if (next.id !== c.id) chainNodes.push(next);
    }
    const finalEdge = chainEdges.at(-1);
    ka = Number(finalEdge?.k);
    absorptionParameter = finalEdge ? edgeName(finalEdge, nodes) : '';
    if (!(ka > 0)) return null;
    lag = Number(doseNode.tlag ?? 0);
    if (chainNodes.length === 1) {
      absorptionMode = lag > 0 ? 'lag' : 'none';
    } else {
      if (lag > 0) return null;
      const transitRates = chainEdges.slice(0, -1).map((edge) => Number(edge.k));
      if (!transitRates.length || transitRates.some((rate) => !(rate > 0) || !close(rate, transitRates[0]))) return null;
      absorptionMode = 'transit';
      nTransit = chainNodes.length - 1;
      mtt = chainNodes.length / transitRates[0];
    }
  }

  const q = [];
  const vp = [];
  const distributionParameters = [];
  for (const p of peripheral) {
    const forward = edges.find((edge) => edge.from === c.id && edge.to === p.id);
    const backward = edges.find((edge) => edge.from === p.id && edge.to === c.id);
    if (!forward || !backward || forward.kinetics !== 'first_order' || backward.kinetics !== 'first_order' || !(Number(p.vol) > 0)) return null;
    const forwardQ = forward.transferParameterization === 'clearance' ? Number(forward.q) : Number(forward.k) * vc;
    const backwardQ = backward.transferParameterization === 'clearance' ? Number(backward.q) : Number(backward.k) * Number(p.vol);
    if (!(forwardQ > 0) || !close(forwardQ, backwardQ)) return null;
    q.push(clean(forwardQ)); vp.push(Number(p.vol)); used.add(forward); used.add(backward);
    distributionParameters.push(forward.transferParameterization === 'clearance' ? qName(forward, nodes) : edgeName(forward, nodes));
    distributionParameters.push(backward.transferParameterization === 'clearance' ? qName(backward, nodes) : edgeName(backward, nodes));
    distributionParameters.push(`v_${p.name}`);
  }
  if (edges.some((edge) => !used.has(edge))) return null;

  const variances = spec.population?.iivVariances ?? {};
  const covariances = spec.population?.iivCovariances ?? {};
  if (Object.values(covariances).some((value) => Math.abs(Number(value)) > 1e-12)) return null;
  const eliminationParameter = eliminationEdge.eliminationParameterization === 'clearance' ? `cl_${c.name}` : edgeName(eliminationEdge, nodes);
  const supported = new Set([eliminationParameter, `v_${c.name}`, absorptionParameter, ...distributionParameters].filter(Boolean));
  if (Object.entries(variances).some(([name, value]) => Number(value) > 0 && !supported.has(name))) return null;
  const omega = (name) => Math.sqrt(Math.max(0, Number(variances[name] ?? 0)));
  const distributionOmega = distributionParameters.map(omega).filter((value) => value > 0);
  if (distributionOmega.some((value) => !close(value, distributionOmega[0]))) return null;

  const residual = spec.population?.residualError ?? { type: 'combined', additive: 0.1, proportional: 0.2 };
  return {
    source: 'lego', modelCode, route, nCompartments: 1 + peripheral.length,
    dose: Number(doseNode.dose), infusionDuration, ka, lag, absorptionMode, nTransit, mtt,
    cl, vc, q1: q[0] ?? 5, vp1: vp[0] ?? 60, q2: q[1] ?? 3, vp2: vp[1] ?? 80,
    iivEnabled: Object.values(variances).some((value) => Number(value) > 0),
    omegaCL: omega(eliminationParameter), omegaVc: omega(`v_${c.name}`), omegaKa: omega(absorptionParameter), omegaQ: distributionOmega[0] ?? 0,
    iovEnabled: false, kappaCL: 0,
    resEnabled: true,
    sigmaProp: residual.type === 'additive' ? 0 : Number(residual.proportional),
    sigmaAdd: residual.type === 'proportional' ? 0 : Number(residual.additive),
    nInd: 80, seed: 7, samplingPreset: 'rich', tEnd: Math.max(1, Number(horizon) || 24)
  };
}
