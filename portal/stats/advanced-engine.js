import { mannWhitney, welchT, wilcoxonSignedRank, chiSquareSF } from './engine.js';
import { normalQuantile } from './power-engine.js';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export function holmAdjust(pValues) {
  const p = pValues.map(Number);
  if (p.some(v => !Number.isFinite(v) || v < 0 || v > 1)) throw new Error('INVALID_P_VALUE');
  const m = p.length;
  const order = p.map((value,index)=>({value,index})).sort((a,b)=>a.value-b.value);
  const adjusted = Array(m).fill(NaN);
  let running = 0;
  order.forEach((item,rank) => {
    running = Math.max(running, (m-rank) * item.value);
    adjusted[item.index] = Math.min(1, running);
  });
  return adjusted;
}

export function wilsonInterval(events, total, alpha=0.05) {
  const x=Number(events), n=Number(total);
  if (!Number.isFinite(x) || !Number.isFinite(n) || n<=0 || x<0 || x>n) throw new Error('INVALID_BINOMIAL');
  const z=normalQuantile(1-alpha/2), p=x/n, z2=z*z;
  const den=1+z2/n;
  const centre=(p+z2/(2*n))/den;
  const half=z*Math.sqrt(p*(1-p)/n+z2/(4*n*n))/den;
  return [clamp(centre-half,0,1),clamp(centre+half,0,1)];
}

/**
 * Effect estimates for a 2x2 table laid out as:
 *            event  non-event
 * group 1      a        b
 * group 2      c        d
 *
 * RD uses the observed risks and a Newcombe-Wilson hybrid CI.
 * RR and OR use log-Wald CIs. If any cell is zero, 0.5 is added to
 * all four cells for RR/OR only (Haldane-Anscombe correction).
 */
export function effectSizes2x2(table, alpha=0.05) {
  if (!Array.isArray(table) || table.length!==2 || table.some(r=>!Array.isArray(r)||r.length!==2)) throw new Error('NOT_2X2');
  const raw=table.flat().map(Number);
  if (raw.some(v=>!Number.isFinite(v)||v<0)) throw new Error('INVALID_TABLE');
  const [a,b,c,d]=raw;
  const n1=a+b,n2=c+d;
  if (n1<=0||n2<=0) throw new Error('EMPTY_GROUP');
  const p1=a/n1,p2=c/n2,rd=p1-p2;
  const [l1,u1]=wilsonInterval(a,n1,alpha),[l2,u2]=wilsonInterval(c,n2,alpha);
  const rdCI=[
    clamp(rd-Math.sqrt((p1-l1)**2+(u2-p2)**2),-1,1),
    clamp(rd+Math.sqrt((u1-p1)**2+(p2-l2)**2),-1,1)
  ];

  const corrected=raw.some(v=>v===0);
  const aa=a+(corrected?0.5:0),bb=b+(corrected?0.5:0),cc=c+(corrected?0.5:0),dd=d+(corrected?0.5:0);
  const nn1=aa+bb,nn2=cc+dd,z=normalQuantile(1-alpha/2);
  const rr=(aa/nn1)/(cc/nn2);
  const seLogRR=Math.sqrt(1/aa-1/nn1+1/cc-1/nn2);
  const rrCI=[Math.exp(Math.log(rr)-z*seLogRR),Math.exp(Math.log(rr)+z*seLogRR)];
  const oddsRatio=(aa*dd)/(bb*cc);
  const seLogOR=Math.sqrt(1/aa+1/bb+1/cc+1/dd);
  const orCI=[Math.exp(Math.log(oddsRatio)-z*seLogOR),Math.exp(Math.log(oddsRatio)+z*seLogOR)];

  return {
    risk1:p1,risk2:p2,
    riskDifference:rd,riskDifferenceCI:rdCI,
    riskRatio:rr,riskRatioCI:rrCI,
    oddsRatio,oddsRatioCI:orCI,
    corrected,correction:corrected?'haldane_anscombe_0.5':null,
    alpha
  };
}

function cleanGroup(g) {
  return {name:String(g.name),values:(g.values||[]).map(Number).filter(Number.isFinite)};
}

export function pairwiseWelchHolm(groups, alpha=0.05) {
  const clean=groups.map(cleanGroup).filter(g=>g.values.length>=2);
  if (clean.length<2) throw new Error('GROUPS_TOO_FEW');
  const rows=[];
  for(let i=0;i<clean.length-1;i++){
    for(let j=i+1;j<clean.length;j++){
      const r=welchT(clean[i].values,clean[j].values);
      rows.push({group1:clean[i].name,group2:clean[j].name,estimate:r.estimate,ci:r.ci,t:r.t,df:r.df,pRaw:r.p,hedgesG:r.hedges_g});
    }
  }
  const adjusted=holmAdjust(rows.map(r=>r.pRaw));
  return rows.map((r,i)=>({...r,pAdjusted:adjusted[i],significant:adjusted[i]<alpha,method:'welch_holm'}));
}

export function pairwiseMannWhitneyHolm(groups, alpha=0.05) {
  const clean=groups.map(cleanGroup).filter(g=>g.values.length>=1);
  if (clean.length<2) throw new Error('GROUPS_TOO_FEW');
  const rows=[];
  for(let i=0;i<clean.length-1;i++){
    for(let j=i+1;j<clean.length;j++){
      const r=mannWhitney(clean[i].values,clean[j].values);
      rows.push({group1:clean[i].name,group2:clean[j].name,U:r.U,pRaw:r.p,cliffsDelta:r.cliffs_delta,inference:r.inference});
    }
  }
  const adjusted=holmAdjust(rows.map(r=>r.pRaw));
  return rows.map((r,i)=>({...r,pAdjusted:adjusted[i],significant:adjusted[i]<alpha,method:'mann_whitney_holm'}));
}

function averageRanksWithTies(values) {
  const indexed=values.map((value,index)=>({value,index})).sort((a,b)=>a.value-b.value);
  const ranks=Array(values.length).fill(NaN);
  const ties=[];
  let i=0;
  while(i<indexed.length){
    let j=i+1;
    while(j<indexed.length && indexed[j].value===indexed[i].value) j++;
    const avg=(i+1+j)/2;
    for(let m=i;m<j;m++) ranks[indexed[m].index]=avg;
    if(j-i>1) ties.push(j-i);
    i=j;
  }
  return {ranks,ties};
}

function prepareRepeated(rows, subjectKey, conditionKey, valueKey) {
  const conditions=[];
  const conditionSeen=new Set();
  const subjects=[];
  const subjectSeen=new Set();
  const matrix=new Map();
  for(const row of rows||[]){
    const subject=String(row?.[subjectKey]??'').trim();
    const condition=String(row?.[conditionKey]??'').trim();
    if(!subject||!condition) continue;
    if(!conditionSeen.has(condition)){conditionSeen.add(condition);conditions.push(condition);}
    if(!subjectSeen.has(subject)){subjectSeen.add(subject);subjects.push(subject);matrix.set(subject,new Map());}
    const value=Number(row?.[valueKey]);
    if(!Number.isFinite(value)) continue;
    const subjectMap=matrix.get(subject);
    if(subjectMap.has(condition)) throw new Error('DUPLICATE_REPEATED_CELL');
    subjectMap.set(condition,value);
  }
  if(conditions.length<3) throw new Error('CONDITIONS_TOO_FEW');
  const completeSubjects=subjects.filter(subject=>conditions.every(condition=>matrix.get(subject)?.has(condition)));
  if(completeSubjects.length<2) throw new Error('N_TOO_SMALL');
  return {
    conditions,subjects,completeSubjects,matrix,
    excludedSubjects:subjects.length-completeSubjects.length
  };
}

/**
 * Friedman rank test for a complete repeated-measures/block design stored in
 * long format (subject, condition, value). Incomplete subjects are excluded
 * from the global test so every condition is evaluated on the same blocks.
 * Ties are assigned average within-subject ranks and the chi-square statistic
 * is corrected for within-block ties. Kendall's W is Q / [n(k-1)].
 */
export function friedmanLong(rows, subjectKey, conditionKey, valueKey) {
  const prepared=prepareRepeated(rows,subjectKey,conditionKey,valueKey);
  const {conditions,subjects,completeSubjects,matrix,excludedSubjects}=prepared;
  const n=completeSubjects.length,k=conditions.length;
  const rankSums=Array(k).fill(0);
  let tieTerm=0;
  for(const subject of completeSubjects){
    const vals=conditions.map(condition=>matrix.get(subject).get(condition));
    const rr=averageRanksWithTies(vals);
    rr.ranks.forEach((rank,j)=>rankSums[j]+=rank);
    tieTerm+=rr.ties.reduce((sum,t)=>sum+t**3-t,0);
  }
  const qRaw=12/(n*k*(k+1))*rankSums.reduce((sum,r)=>sum+r*r,0)-3*n*(k+1);
  const denominator=n*k*(k*k-1);
  const tieCorrection=denominator>0 ? 1-tieTerm/denominator : 1;
  const Q=tieCorrection>1e-12 ? Math.max(0,qRaw/tieCorrection) : 0;
  const df=k-1;
  const p=tieCorrection>1e-12 ? chiSquareSF(Q,df) : 1;
  const kendallW=clamp(n>0&&df>0?Q/(n*df):0,0,1);
  return {
    test:'friedman',n,k,Q,qRaw,df,p,kendallW,tieCorrection,
    rankSums,conditions,totalSubjects:subjects.length,excludedSubjects,
    completeSubjects
  };
}

export function pairwisePairedWilcoxonHolm(rows, subjectKey, conditionKey, valueKey, alpha=0.05) {
  const prepared=prepareRepeated(rows,subjectKey,conditionKey,valueKey);
  const {conditions,completeSubjects,matrix,excludedSubjects}=prepared;
  const comparisons=[];
  for(let i=0;i<conditions.length-1;i++){
    for(let j=i+1;j<conditions.length;j++){
      const a=completeSubjects.map(subject=>matrix.get(subject).get(conditions[i]));
      const b=completeSubjects.map(subject=>matrix.get(subject).get(conditions[j]));
      let r;
      try{
        r=wilcoxonSignedRank(a,b);
      }catch(error){
        if(String(error?.message||error).includes('N_TOO_SMALL')){
          const allEqual=a.every((v,idx)=>Math.abs(v-b[idx])<=1e-12);
          if(!allEqual) throw error;
          r={Wplus:0,p:1,median_difference:0,rank_biserial:0,inference:'degenerate',exact:true,n:0};
        }else throw error;
      }
      comparisons.push({
        condition1:conditions[i],condition2:conditions[j],n:completeSubjects.length,
        Wplus:r.Wplus,pRaw:r.p,medianDifference:r.median_difference,
        rankBiserial:r.rank_biserial,inference:r.inference,
        excludedSubjects
      });
    }
  }
  const adjusted=holmAdjust(comparisons.map(r=>r.pRaw));
  return comparisons.map((r,i)=>({...r,pAdjusted:adjusted[i],significant:adjusted[i]<alpha,method:'wilcoxon_paired_holm'}));
}
