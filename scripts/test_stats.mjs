import assert from 'node:assert/strict';
import {
  welchT, mannWhitney, pairedT, wilcoxonSignedRank, welchAnova, kruskalWallis,
  pearson, spearman, linearRegression, fisherExact2x2, describe,
  oneSampleT, mcnemar, logRank
} from '../portal/stats/engine.js';
import {
  normalQuantile, sampleSizeTwoMeans, sampleSizePairedMeans,
  sampleSizeTwoProportions, sampleSizeCorrelation
} from '../portal/stats/power-engine.js';
import {
  holmAdjust, effectSizes2x2, pairwiseWelchHolm, pairwiseMannWhitneyHolm,
  friedmanLong, pairwisePairedWilcoxonHolm
} from '../portal/stats/advanced-engine.js';

const near=(actual,expected,tolerance,label)=>{assert.ok(Number.isFinite(actual),`${label}: expected a finite number, got ${actual}`);assert.ok(Math.abs(actual-expected)<=tolerance,`${label}: ${actual} != ${expected} within ${tolerance}`);};

const control=[11.2,10.8,12.1,9.9,11.5,10.4],treatment=[8.2,9.1,7.8,8.7,9.4,8.5];
const welch=welchT(control,treatment);near(welch.t,5.906421348734698,1e-9,'Welch t statistic');near(welch.p,0.00020657150377175823,2e-8,'Welch p-value');near(welch.df,9.220994292149227,1e-9,'Welch df');
const mw=mannWhitney(control,treatment);near(mw.U,0,1e-12,'Mann-Whitney U');near(mw.p,0.0021645021645021645,1e-14,'Mann-Whitney exact p-value');assert.equal(mw.exact,true);assert.equal(mw.inference,'exact');
const mwSmall=mannWhitney([1,2,3],[4,5,6]);near(mwSmall.U,0,1e-12,'Small-sample Mann-Whitney U');near(mwSmall.p,0.1,1e-14,'Small-sample Mann-Whitney exact p-value');assert.equal(mwSmall.exact,true);
const mwTied=mannWhitney([1,2,2],[3,4,5]);assert.equal(mwTied.exact,false);assert.equal(mwTied.inference,'asymptotic');assert.ok(Number.isFinite(mwTied.p));

const before=[18.2,16.9,20.1,17.5,19.3,15.8,21.0,18.7],after=[15.1,15.7,17.4,16.2,16.8,14.9,18.3,16.5];
const paired=pairedT(before,after);near(paired.t,7.106003655931736,1e-9,'Paired t statistic');near(paired.p,0.0001926439879564317,2e-8,'Paired p-value');
const wilcoxonExact=wilcoxonSignedRank([1,2,3,4],[0,0,0,0]);near(wilcoxonExact.Wplus,10,1e-12,'Wilcoxon W+');near(wilcoxonExact.p,0.125,1e-14,'Wilcoxon exact p-value');assert.equal(wilcoxonExact.exact,true);assert.equal(wilcoxonExact.inference,'exact');
const wilcoxonTied=wilcoxonSignedRank([1,2,2,4],[0,0,0,0]);assert.equal(wilcoxonTied.exact,false);assert.equal(wilcoxonTied.inference,'asymptotic');assert.ok(Number.isFinite(wilcoxonTied.p));

const groups=[{name:'A',values:[10.1,11.2,9.8,10.7]},{name:'B',values:[12.9,13.5,11.8,14.1]},{name:'C',values:[16.0,15.2,17.1,16.4]}];
const wa=welchAnova(groups);near(wa.F,57.976306631147644,1e-8,'Welch ANOVA F');near(wa.p,0.00014546223071036424,2e-8,'Welch ANOVA p-value');
const kw=kruskalWallis(groups);near(kw.H,9.846153846153847,1e-10,'Kruskal-Wallis H');near(kw.p,0.007276706499332492,2e-8,'Kruskal-Wallis p-value');
const holm=holmAdjust([0.01,0.04,0.03]);near(holm[0],0.03,1e-15,'Holm p1');near(holm[1],0.06,1e-15,'Holm p2');near(holm[2],0.06,1e-15,'Holm p3');
const posthoc=pairwiseWelchHolm(groups);assert.equal(posthoc.length,3);posthoc.forEach(r=>{assert.ok(r.pAdjusted>=r.pRaw-1e-15);assert.ok(Number.isFinite(r.estimate));assert.equal(r.method,'welch_holm');});
const rankPosthoc=pairwiseMannWhitneyHolm(groups);assert.equal(rankPosthoc.length,3);rankPosthoc.forEach(r=>{assert.ok(r.pAdjusted>=r.pRaw-1e-15);assert.ok(Number.isFinite(r.cliffsDelta));assert.equal(r.method,'mann_whitney_holm');});

const repeatedRows=[];
for(let i=1;i<=8;i++){
  repeatedRows.push({subject:`S${i}`,condition:'A',value:0});
  repeatedRows.push({subject:`S${i}`,condition:'B',value:i});
  repeatedRows.push({subject:`S${i}`,condition:'C',value:18+2*i});
}
const friedman=friedmanLong(repeatedRows,'subject','condition','value');
assert.equal(friedman.n,8);assert.equal(friedman.k,3);assert.equal(friedman.excludedSubjects,0);near(friedman.Q,16,1e-12,'Friedman Q');near(friedman.p,0.00033546262790251185,2e-10,'Friedman p-value');near(friedman.kendallW,1,1e-12,'Kendall W');near(friedman.tieCorrection,1,1e-12,'Friedman tie correction');
const repeatedPosthoc=pairwisePairedWilcoxonHolm(repeatedRows,'subject','condition','value');
assert.equal(repeatedPosthoc.length,3);repeatedPosthoc.forEach(r=>{near(r.pRaw,0.0078125,1e-14,'Repeated Wilcoxon exact p');near(r.pAdjusted,0.0234375,1e-14,'Repeated Wilcoxon Holm p');assert.equal(r.inference,'exact');assert.equal(r.significant,true);assert.equal(r.method,'wilcoxon_paired_holm');});
const incomplete=[...repeatedRows.filter(r=>!(r.subject==='S8'&&r.condition==='C'))];
const friedmanIncomplete=friedmanLong(incomplete,'subject','condition','value');assert.equal(friedmanIncomplete.n,7);assert.equal(friedmanIncomplete.excludedSubjects,1);near(friedmanIncomplete.Q,14,1e-12,'Friedman complete-block exclusion');

const effects=effectSizes2x2([[4,2],[2,4]]);near(effects.riskDifference,1/3,1e-14,'Risk difference');near(effects.riskDifferenceCI[0],-0.1852210933587502,1e-8,'Risk difference CI lower');near(effects.riskDifferenceCI[1],0.667882412088588,1e-8,'Risk difference CI upper');near(effects.riskRatio,2,1e-14,'Risk ratio');near(effects.riskRatioCI[0],0.564393186424715,1e-8,'Risk ratio CI lower');near(effects.riskRatioCI[1],7.087257777399769,1e-8,'Risk ratio CI upper');near(effects.oddsRatio,4,1e-14,'Odds ratio');near(effects.oddsRatioCI[0],0.3627064400261749,1e-8,'Odds ratio CI lower');near(effects.oddsRatioCI[1],44.11280924277315,1e-7,'Odds ratio CI upper');assert.equal(effects.corrected,false);
const zeroEffects=effectSizes2x2([[0,10],[5,5]]);assert.equal(zeroEffects.corrected,true);assert.equal(zeroEffects.correction,'haldane_anscombe_0.5');assert.ok(Number.isFinite(zeroEffects.riskRatio));assert.ok(Number.isFinite(zeroEffects.oddsRatio));assert.ok(zeroEffects.riskDifferenceCI.every(Number.isFinite));

const x=[1,2,3,4,5,6,7,8,9,10],y=[2.2,2.8,4.1,4.8,6.2,6.5,8.1,8.6,10.1,10.7];
const pr=pearson(x,y);near(pr.r,0.9965373827758134,1e-12,'Pearson r');near(pr.p,6.263113706458101e-10,2e-9,'Pearson p-value');const sr=spearman(x,y);near(sr.rho,1,1e-12,'Spearman rho');const lr=linearRegression(x,y);near(lr.slope,0.9715151515151516,1e-12,'Linear regression slope');near(lr.intercept,1.0666666666666655,1e-12,'Linear regression intercept');near(lr.p,6.263113706455703e-10,2e-9,'Linear regression slope p-value');
const fisher=fisherExact2x2([[1,9],[11,3]]);near(fisher.odds_ratio,0.030303030303030304,1e-12,'Fisher odds ratio');near(fisher.p,0.0027594561852200836,1e-12,'Fisher exact p-value');
const d=describe([12.1,10.8,11.4,13.2,9.9,12.5,11.7,10.6]);assert.equal(d.n,8);near(d.mean,11.525,1e-12,'Descriptive mean');
const one=oneSampleT([102,98,101,105,99,103,100,104],100);near(one.t,1.7320508075688774,1e-12,'One-sample t statistic');near(one.p,0.12687036692367099,2e-8,'One-sample p-value');near(one.estimate,1.5,1e-12,'One-sample estimate');

const mcRows=[...Array.from({length:8},()=>({before:'no',after:'yes'})),{before:'yes',after:'no'},...Array.from({length:4},()=>({before:'no',after:'no'})),...Array.from({length:3},()=>({before:'yes',after:'yes'}))];
const mc=mcnemar(mcRows,'before','after');assert.equal(mc.exact,true);assert.equal(mc.b,8);assert.equal(mc.c,1);near(mc.p,0.0390625,1e-12,'Exact McNemar p-value');
const survivalRows=[{group:'A',time:3,event:1},{group:'A',time:5,event:1},{group:'A',time:7,event:0},{group:'A',time:8,event:1},{group:'A',time:11,event:0},{group:'A',time:12,event:1},{group:'B',time:4,event:1},{group:'B',time:7,event:1},{group:'B',time:9,event:1},{group:'B',time:10,event:0},{group:'B',time:13,event:0},{group:'B',time:14,event:1}];
const logrank=logRank(survivalRows,'group','time','event');near(logrank.x2,0.6006314054675235,1e-12,'Log-rank chi-square');near(logrank.p,0.43833721765635236,2e-8,'Log-rank p-value');assert.equal(logrank.events,8);

near(normalQuantile(0.975),1.9599639845400536,1e-8,'Normal 0.975 quantile');near(normalQuantile(0.8),0.8416212335729144,1e-8,'Normal 0.8 quantile');
const planMeans=sampleSizeTwoMeans({difference:5,sd:10,alpha:0.05,power:0.8,dropout:0.1});assert.equal(planMeans.basePerGroup,63);assert.equal(planMeans.perGroup,70);assert.equal(planMeans.total,140);
const planPaired=sampleSizePairedMeans({difference:5,sdDifference:10,alpha:0.05,power:0.8,dropout:0.1});assert.equal(planPaired.baseTotal,32);assert.equal(planPaired.total,36);
const planProps=sampleSizeTwoProportions({p1:0.4,p2:0.6,alpha:0.05,power:0.8,dropout:0.1});assert.equal(planProps.basePerGroup,97);assert.equal(planProps.perGroup,108);assert.equal(planProps.total,216);
const planCorr=sampleSizeCorrelation({r:0.3,alpha:0.05,power:0.8,dropout:0.1});assert.equal(planCorr.baseTotal,85);assert.equal(planCorr.total,95);

console.log('Stats engine: exact inference, repeated measures, effect sizes, Holm post-hoc and study-planning reference vectors PASS');
