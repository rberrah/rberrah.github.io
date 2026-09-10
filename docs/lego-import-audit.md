# Lego code import audit

## Scope

The diagram represents a deterministic population PK structure, not a complete
statistical estimation project. Import does not preserve IIV, IOV, residual error,
observation transformations, dose schedules, or time-varying covariate histories.
Native mrgsolve use in the TDM/PD engines is independent of diagram import.

Missing scalar parameters are initialized to **1** and listed in an import
warning. These are placeholders, not published estimates. Derived quantities
follow the equations: for example, F=1 gives a complementary fraction of 0, and
a categorical multiplier of 1 gives a log coefficient of 0. Replace placeholders
before interpreting a simulation; enter publication values explicitly rather
than identifying an article from variable names.

Expressions are parsed with jsep, never evaluated as JavaScript or C++. Alias
resolution, mass-balance matching and covariate decomposition are bounded.
Conditional assignments used in PK, unknown identifiers in native code, and
unsupported sums of covariate contributions are rejected. The prior diagram
remains unchanged when parsing fails. Comments and DESCRIPTION text are not
model equations.

## Supplied MLXTRAN Examples

| Example | Parser result | Checks |
| --- | --- | --- |
| Samtani PP1 | Recognized | 2 states, 2 transfers, 12 covariate effects; complementary fractions and Tk0=Tlag |
| T'jollyn PP6 | Recognized | 3 states, 3 transfers, 8 effects; Hill slow absorption and Michaelis-Menten rapid absorption |
| Magnusson PP3 | Recognized | Same structural equations as the supplied PP6 file; missing values remain placeholders |
| Korell oral | Explicitly unsupported | Sum of covariate contributions to clearance cannot be encoded as independent multiplicative Lego effects |
| separado ORAL+LAI | Explicitly unsupported | Includes that clearance sum, multiple administration IDs and a summed concentration output |

PP6 equivalence is checked independently over 32 covariate combinations and
four depot amounts. In the original denominator,
`kamt150^Hill * (IVOL/1.75)^beta_IVOL` becomes Lego
`Km^Hill`, where `Km = kamt150 * (IVOL/1.75)^(beta_IVOL/Hill)`.
The imported Km coefficient therefore depends on the imported Hill value.
Changing Hill afterward requires recomputing that coefficient or reimporting.

The four additional Korell 2017 NONMEM control streams are **not** supported
as full Lego imports. They contain conditional parameter definitions, mixture
subpopulations, occasion effects, and/or ADVAN5/ADVAN7 structures. Their rejection
is tested locally; it is not reported as a successful translation. Publisher
supplements and article PDFs remain outside git.

## Article Cross-Check

- [Samtani 2009](https://doi.org/10.2165/11316870-000000000-00000), Table III,
  p.595: CL=4.95 L/h, V=391 L, ka=0.000488/h, duration=319 h, fast fraction=0.168.
  The supplied MLXTRAN has CLCR reference 110 and BMI exponent +0.642 on the fast
  fraction; the article footnote gives 110.6 and -0.642. The supplied file is not
  changed by the importer. A separate local `valeurs article` example records
  these corrections. The newer NONMEM supplement uses BMI reference 26.787
  rather than the article's rounded 26.8.
- [T'jollyn 2024 Part II](https://doi.org/10.1007/s13318-024-00899-z), Table 2,
  p.495: CL=3.9 L/h, V=1960 L, slow rate=90.4 microgram/h, rapid rate=149
  microgram/h, Km=120 and 23.8 mg, Hill=1.44, rapid fraction=0.209. Tests convert
  rates to 0.0904 and 0.149 mg/h. The table's site/sex effects correspond to
  multipliers 0.746/0.794 in the supplied exponent form, not -0.254/-0.206.
  The Results paragraph instead mentions 164 microgram/h and 21.4 mg; the
  example explicitly follows Table 2. V=156 L is an alternative subgroup in
  the paper, not the default used here. This is not a validation of the complete
  published statistical model.

## Other Languages And Library

Primary-source examples checked:

- [Monolix piecewise macros](https://monolixsuite.slp-software.com/simulx/2024R1/piecewise-macros): simple IV compartments and elimination.
- [NONMEM author's templates](https://pkpd-info.com/NONMEM/Model_templates.php): ADVAN2/TRANS2 population values and oral absorption.
- [mrgsolve complete example](https://mrgsolve.org/blog/posts/2017-complete-example.html): explicit rejection of unsupported conditional volume and bioavailability, not silent removal.

All **46** native catalog models were passed through the parser on 2026-09-10.
Four population structures are recognized: `amik_burdet`, `genta_franck`,
`levo_gergs`, `linez_buerger`. The other 42 are explicitly rejected, generally
because their conditional expressions, numerical bounds or nonlinear covariate
forms are not representable by the current simple Lego blocks. This audit must
not be described as support for all 46 models. In particular, no physiological
bounds are silently discarded to increase the acceptance count.

## Reproduction And Checks

```text
npm run test:mlxtran
node scripts/audit_lego_external_browser.mjs
node scripts/audit_lego_roundtrip.mjs
Rscript tdm-engine/tests/lego_external_exports.R
Rscript tdm-engine/tests/lego_native_exports.R
Rscript tdm-engine/tests/lego_mlxtran_exports.R
```

Set `LEGO_AUDIT_URL` to the local preview URL for browser checks. Artifacts go
to ignored `test-results/`; only synthetic model data are used.

Passed on 2026-09-10:

- Numeric unit tests, local-file parser checks and the 46-model catalog audit.
- 24 external-example browser round trips and 162 preset round trips.
- 24 external-example native mrgsolve simulations, including comparisons with
  the four accepted native library models at reference/comparison covariates,
  and an independent analytical solution for Samtani.
- 54 preset reimported native mrgsolve simulations at reference/comparison
  covariates, including effect-compartment and turnover presets.
- 18 native Simulx executions of exported preset MLXTRAN compared with mrgsolve.

NONMEM was checked structurally and by reimporting into mrgsolve; native NONMEM
estimation/execution was not tested. The original supplied PP6 equations were
checked by independent flux calculations, not by fitting clinical data. None of
these tests constitutes clinical validation or validates the 42 rejected models.
