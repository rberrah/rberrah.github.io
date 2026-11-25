// Woillard et al. 2015, supplied Supplemental Table 1.
// The original table provides arithmetic means and between-subject CVs only.
// Full ITS MAP-BE and Pmetrics remain disabled pending prior/RUV details.
const its=Object.freeze({c0:.17,a1:13.51,b1:26.15,a2:18.97,b2:16.08,r:.47,faiv:1.66,alpha:1.12});
const pmetrics=Object.freeze({c0:.16,a1:21.95,b1:18.94,a2:21.23,b2:25.52,r:.44,faiv:2.88,alpha:1.63});
export const WOILLARD_MPA=Object.freeze({
 doi:'10.1016/j.phrs.2015.07.012',pmid:'26192348',
 source:'Woillard et al., Pharmacological Research 99 (2015), 308–315',
 structuralModel:'1C, two parallel gamma inputs, first-order elimination',
 samplingHours:Object.freeze([1/3,1,3,6]),
 designProfiles:37,validationProfiles:19,referenceAssay:'LC-MS/MS',
 methods:Object.freeze(['ITS','Pmetrics']),
 validationRelativeRmsePct:Object.freeze({ITS:18.92,Pmetrics:18.80}),
 parameterTable:'Supplemental Table 1',
 populationParameters:Object.freeze({ITS:its,Pmetrics:pmetrics}),
 variability:Object.freeze({
  ITS:Object.freeze({c0:70,a1:67.2,b1:60.8,a2:62.8,b2:60.8,r:57.4,faiv:56,alpha:50}),
  Pmetrics:Object.freeze({c0:75,a1:69.2,b1:83.9,a2:67.1,b2:66,r:50,faiv:66.3,alpha:70.5})
 }),
 // The supplement calls b "scales" without units, and FAIV a unit-dose coefficient.
 // The related modeling publications use b as rate (h^-1), C0 as constant offset,
 // and FAIV/C0 referenced to 100 mg. These conventions are explicit assumptions
 // until confirmed against the historical 2015 implementation.
 referenceDoseAssumptionMg:100,rateConvention:'rate-per-hour',baselineConvention:'constant-offset',
 conventionSource:'10.1111/bcp.16374',
 residualError:null,priorCovariance:null,pmetricsSupport:null,
 status:'published-means-transcribed-conventions-provisional',
 enabled:false
});
