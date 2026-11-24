// Source lock: do not activate a clinical/population model without the supplementary table.
export const WOILLARD_MPA=Object.freeze({
 doi:'10.1016/j.phrs.2015.07.012',pmid:'26192348',
 source:'Woillard et al., Pharmacological Research 99 (2015), 308–315',
 structuralModel:'1C, two parallel gamma inputs, first-order elimination',
 // Published schedule is 0.33 h (20 min), 1 h, 3 h, 6 h.
 samplingHours:Object.freeze([1/3,1,3,6]),
 designProfiles:37,validationProfiles:19,
 referenceAssay:'LC-MS/MS',
 methods:Object.freeze(['ITS','Pmetrics']),
 validationRelativeRmsePct:Object.freeze({ITS:18.92,Pmetrics:18.80}),
 parameterTable:'Supplementary Table 1',
 populationParameters:null,variability:null,residualError:null,
 status:'blocked-missing-supplement',
 // Separate from the fictional 1C MAP demo. No published model is enabled.
 enabled:false
});
