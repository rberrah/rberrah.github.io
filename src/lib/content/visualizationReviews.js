// Scientific review provenance for interpretive visualizations.
// Run npm run review:seal only after reviewing the current source.
/** @type {Record<string, { status: string, reviewed_on: string, review_type: string, reviewed_hash: string }>} */
export const visualizationReviews = {
  "07_NeuralODE": {
    "status": "reviewed",
    "reviewed_on": "2026-10-09",
    "review_type": "author",
    "reviewed_hash": "808cc4e65ed4eb2625659c5af39367da24177b1c12f26c1a8a184991eb9952e3"
  },
  "14_AllometryCentering": {
    "status": "reviewed",
    "reviewed_on": "2026-10-10",
    "review_type": "author",
    "reviewed_hash": "1a4d4eb7494e81426de1eff7c4b5a3b7ed1f968f8a70ef2c69ad9d372e16d08e"
  },
  "15_OFVGame": {
    "status": "reviewed",
    "reviewed_on": "2026-10-10",
    "review_type": "author",
    "reviewed_hash": "43348b66ac9afd1cf3c4a539c3fa9022dc365480003f0f0110ef2bfee01e0b68"
  },
  "17_VPCCrashTest": {
    "status": "reviewed",
    "reviewed_on": "2026-10-09",
    "review_type": "author",
    "reviewed_hash": "9cebe39ae7722fd3c7a82ea7e594918730e1f314ef8f1a3e06ae36a0756e144b"
  },
  "18_BayesianShrinkage": {
    "status": "reviewed",
    "reviewed_on": "2026-10-10",
    "review_type": "author",
    "reviewed_hash": "3b2ba5f3f108b8fce5bbed588d78e09d9eb8c7c3daf9a24df29e5f9e88b27925"
  },
  "42_VarImportance": {
    "status": "reviewed",
    "reviewed_on": "2026-10-09",
    "review_type": "author",
    "reviewed_hash": "f68c417e8031a28cd15acd263a71547e277bee647b19742f149e69bb5f8b71e2"
  },
  "50_GOFPlots": {
    "status": "reviewed",
    "reviewed_on": "2026-10-09",
    "review_type": "author",
    "reviewed_hash": "b19c07de9149527573e08f022d6c8c6139c395974adb5da6ae30056a1d731084"
  },
  "52_NPDE": {
    "status": "reviewed",
    "reviewed_on": "2026-10-09",
    "review_type": "author",
    "reviewed_hash": "ec7bee0d0d76e31abbd878ececb322208c122a5373b8a649d7da8d909b27e3a0"
  },
  "54_TMDD": {
    "status": "reviewed",
    "reviewed_on": "2026-10-10",
    "review_type": "author",
    "reviewed_hash": "66bacf283697462348521c82ec3d699f23d9069c2284606f37da744a10adc5f6"
  },
  "58_OptimalDesign": {
    "status": "reviewed",
    "reviewed_on": "2026-10-10",
    "review_type": "author",
    "reviewed_hash": "f827c9c17c077075d11a5569cc3c9250a5d73cccf1a53369051a166066504792"
  },
  "59_ModelSelection": {
    "status": "reviewed",
    "reviewed_on": "2026-10-10",
    "review_type": "author",
    "reviewed_hash": "36e497cf2640d894b11a49c610ec11c73889e8471610008e0fcb38b17650bfbd"
  },
  "60_WarfarinFit": {
    "status": "reviewed",
    "reviewed_on": "2026-10-10",
    "review_type": "author",
    "reviewed_hash": "bb3ee93d7124e209e0ef45bab15c3086ab7b9564d45165096e27505245819688"
  },
  "61_ResidualError": {
    "status": "reviewed",
    "reviewed_on": "2026-10-10",
    "review_type": "author",
    "reviewed_hash": "7b57398970406a13cb004316349321bc35ca117aba49157634f37fc72ab74b8b"
  },
  "63_ClusterPCA": {
    "status": "reviewed",
    "reviewed_on": "2026-10-09",
    "review_type": "author",
    "reviewed_hash": "84173bbf9a0e61e23060b5de12082f6eeac5895bd0cea0274e1626cb9df7d8df"
  },
  "64_RMT": {
    "status": "reviewed",
    "reviewed_on": "2026-10-09",
    "review_type": "author",
    "reviewed_hash": "6325d930aed0d0155bd0c5e82bd47a328b39b8e6b10d3291211ce58a60143073"
  },
  "67_SAEMConvergence": {
    "status": "reviewed",
    "reviewed_on": "2026-10-10",
    "review_type": "author",
    "reviewed_hash": "532546538053f5c005dd2b87382b040ec98622f672bd00a9e72c00860a2a1913"
  },
  "CovariateEffects": {
    "status": "reviewed",
    "reviewed_on": "2026-10-09",
    "review_type": "author",
    "reviewed_hash": "adfd7e55a6cbcd009e8088ae706f1d05d82131eafbc22c634a9e0a23c7b1883b"
  }
};

/** @param {string} stem */
export function visualizationReview(stem) {
  return visualizationReviews[stem] ?? { status: 'pending', reviewed_on: '', review_type: '', reviewed_hash: '' };
}
