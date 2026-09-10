// Regression equations supplied in Feedback/ana260907. No article PDF is included.
export const samtaniRaw = `[LONGITUDINAL]
input = {Tk01, ka2, F1, V, Cl, CLCR, SEX, BMI, INSJ, AGE, IVOL, NEEDLE}
CLCR={use=regressor}
SEX={use=regressor}
BMI={use=regressor}
INSJ={use=regressor}
AGE={use=regressor}
IVOL={use=regressor}
NEEDLE={use=regressor}
EQUATION:
Cl_cov = Cl * (CLCR/110)^0.376
V_cov = V * (0.726^SEX) * (BMI/26.8)^0.889
ka2_cov = ka2 * 0.765^SEX * 1.23^INSJ * (AGE/42)^0.311 * IVOL^(-0.359)
F1_cov = F1 * 0.781^SEX * 1.37^INSJ * 1.54^NEEDLE * (BMI/26.8)^0.642 * IVOL^(-0.288)
Tlag=Tk01
PK:
depot(target=Ad,p=1-F1_cov,Tlag=Tk01)
depot(target=Ac,p=F1_cov,Tk0=Tk01)
EQUATION:
odeType=stiff
ddt_Ad=-ka2_cov*Ad
ddt_Ac=ka2_cov*Ad-(Cl_cov/V_cov)*Ac
Cc=Ac/V_cov
OUTPUT:
output={Cc}
table={Cl_cov,V_cov,ka2_cov,F1_cov}
`;

export const tjollynRaw = `[LONGITUDINAL]
input={Ka1max,kamt150,Ka3max,kamt350,Cl,V,F,
SEX,INSJ,CLCR,BMI,IVOL,
beta_INSJ,beta_SEX,beta_IVOL,beta_CLCR,beta_BMI,fHill}
SEX={use=regressor}
INSJ={use=regressor}
CLCR={use=regressor}
BMI={use=regressor}
IVOL={use=regressor}
PK:
depot(target=A1,p=1-F)
depot(target=A3,p=F)
EQUATION:
odeType=stiff
Kasw=Ka1max*beta_INSJ^INSJ*beta_SEX^SEX*(IVOL/1.75)^beta_IVOL
Karp=Ka3max*(IVOL/1.75)^beta_IVOL
kamt1_50=kamt150^fHill*(IVOL/1.75)^beta_IVOL
kamt3_50=kamt350*(IVOL/1.75)^beta_IVOL
Kaslow=Kasw*A1^fHill/(A1^fHill+kamt1_50)
Karapid=Karp*A3/(A3+kamt3_50)
Cl_cov=Cl*(CLCR/115)^beta_CLCR
V_cov=V*(BMI/26.15)^beta_BMI
k=Cl_cov/V_cov
ddt_A1=-Kaslow
ddt_A3=-Karapid
ddt_A2=Kaslow+Karapid-k*A2
Cc2=A2/V_cov
OUTPUT:
output={Cc2}
`;

export const hints = values => Object.entries(values).map(([name,value])=>`; ${name}_pop = ${value}`).join('\n')+'\n';

// Samtani 2009, Table III p.595: https://doi.org/10.2165/11316870-000000000-00000
export const samtaniValues = {Tk01:319, ka2:0.000488, F1:0.168, V:391, Cl:4.95};
// T'jollyn 2024, Table 2 p.495: https://doi.org/10.1007/s13318-024-00899-z
// Amounts mg, rates mg/h (published 90.4 and 149 microgram/h), volumes L, time h.
// Multipliers in this code, NOT the changes -0.254/-0.206 printed in the table.
export const tjollynValues = {Ka1max:0.0904,kamt150:120,Ka3max:0.149,kamt350:23.8,Cl:3.9,V:1960,F:0.209,
  beta_INSJ:0.746,beta_SEX:0.794,beta_IVOL:0.890,beta_CLCR:0.281,beta_BMI:1.18,fHill:1.44};

export const suppliedModels = [
  {id:'samtani', code:hints(samtaniValues)+samtaniRaw, raw:samtaniRaw, nodes:2, edges:2, covariates:12},
  {id:'tjollyn', code:hints(tjollynValues)+tjollynRaw, raw:tjollynRaw, nodes:3, edges:3, covariates:8}
];

// Small reproductions of the PK blocks in the authors' online examples.
export const externalModels = [
  {id:'monolix-piecewise', format:'mlxtran', source:'https://monolixsuite.slp-software.com/simulx/2024R1/piecewise-macros',
    code:`; V=30
; k=0.2
[LONGITUDINAL]
input={V,k}
PK:
compartment(cmt=1,amount=Ac,concentration=Cc,volume=V)
iv(cmt=1,type=1)
elimination(cmt=1,k)
`, nodes:1, edges:1},
  {id:'nonmem-advan2', format:'nonmem', source:'https://pkpd-info.com/NONMEM/Model_templates.php',
    code:`$PROBLEM Oral example
$INPUT ID TIME AMT EVID MDV DV
$SUBROUTINES ADVAN2 TRANS2
$PK
TVKA=THETA(3)
KA=TVKA
TVCL=THETA(4)
CL=TVCL*EXP(ETA(1))
TVV=THETA(5)
V=TVV*EXP(ETA(2))
S2=V
$THETA
(0,0.5)
(0,0.1)
(0,4)
(0,30)
(0,200)
`, nodes:2, edges:2},
  {id:'mrgsolve-conditional', format:'mrgsolve', source:'https://mrgsolve.org/blog/posts/2017-complete-example.html',
    code:`$PARAM TVCL=1.23, TVV=35.7, TVKA=1.3
F1=0.82, ALAG=1.21, WT=70, SEX=0
$MAIN
double CL=TVCL*pow(WT/70,0.75)*exp(ECL);
double V=TVV*(WT/70)*exp(EV);
double KA=TVKA*exp(EKA);
if(SEX==1) V=V*0.8;
F_GUT=F1;
ALAG_GUT=ALAG;
$PKMODEL cmt="GUT CENT", depot=TRUE
$OMEGA @labels ECL EV EKA
0.015 0.2 0.5
`, error:'unsupportedEquation'}
];
