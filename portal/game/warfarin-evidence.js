// Values extracted from executed outputs (zero-based notebook cells 10, 12, 14).
// These are archived nlmixr2 results on the experimental study, NOT Monolix output
// and NOT the 28-subject simulated replay. No fresh fit is claimed.
export const ARCHIVE_NOTEBOOK='/pharmacometrie/downloads/warfarin/warfarin_pkpd_nlmixr2_EN.ipynb';
export const ARCHIVE_COMPARISONS=Object.freeze([
  {
    "stage": "Structure",
    "cell": 10,
    "models": [
      [
        "1C",
        899.6142,
        927.8178,
        -441.8071
      ],
      [
        "1C + Tlag",
        781.8434,
        817.0979,
        -380.9217
      ],
      [
        "2C + Tlag",
        817.0512,
        859.3567,
        -396.5256
      ]
    ]
  },
  {
    "stage": "RUV",
    "cell": 12,
    "models": [
      [
        "combined1",
        781.8434,
        817.0979,
        -380.9217
      ],
      [
        "combined2",
        760.3437,
        795.5982,
        -370.1718
      ]
    ]
  },
  {
    "stage": "Covariable",
    "cell": 14,
    "models": [
      [
        "1C + Tlag, combined2",
        760.3437,
        795.5982,
        -370.1718
      ],
      [
        "1C + Tlag, combined2 + WT → V",
        745.0237,
        783.8036,
        -361.5118
      ]
    ]
  }
]);
export const ARCHIVE_GOF=Object.freeze([
  {
    "id": "dv-pred",
    "title": "DV vs PRED",
    "cell": 16,
    "output": 1
  },
  {
    "id": "dv-ipred",
    "title": "DV vs IPRED",
    "cell": 16,
    "output": 2
  },
  {
    "id": "cwres-time",
    "title": "CWRES vs time",
    "cell": 16,
    "output": 3
  }
]);
