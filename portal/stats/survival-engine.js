import { normalCDF, chiSquareSF } from './engine.js';

const Z975=1.959963984540054;

function finiteNumber(value){
  if(typeof value==='number')return Number.isFinite(value)?value:NaN;
  const text=String(value??'').trim();
  if(!text)return NaN;
  const x=Number(text.replace(',','.'));
  return Number.isFinite(x)?x:NaN;
}
function expSafe(x){if(x>709)return Infinity;if(x<-745)return 0;return Math.exp(x);}

export function cleanSurvivalRows(rows,groupKey,timeKey,eventKey){
  return rows.map((r,index)=>({
    originalIndex:index,
    group:String(r[groupKey]??'').trim(),
    time:finiteNumber(r[timeKey]),
    event:finiteNumber(r[eventKey])
  })).filter(r=>r.group&&Number.isFinite(r.time)&&r.time>=0&&(r.event===0||r.event===1));
}

export function kaplanMeierSummary(rows,groupKey,timeKey,eventKey){
  const clean=cleanSurvivalRows(rows,groupKey,timeKey,eventKey);
  const groups=[...new Set(clean.map(r=>r.group))];
  if(groups.length<1)throw new Error('SURVIVAL_NO_GROUPS');
  const maxTime=Math.max(...clean.map(r=>r.time),0);
  const riskTimes=[0,maxTime*.25,maxTime*.5,maxTime*.75,maxTime];
  const summaries=groups.map(group=>{
    const dat=clean.filter(r=>r.group===group).sort((a,b)=>a.time-b.time);
    let atRisk=dat.length,survival=1,greenwood=0,median=null;
    const steps=[];
    const times=[...new Set(dat.map(r=>r.time))].sort((a,b)=>a-b);
    for(const time of times){
      const d=dat.filter(r=>r.time===time&&r.event===1).length;
      const censored=dat.filter(r=>r.time===time&&r.event===0).length;
      if(d>0&&atRisk>0){
        survival*=1-d/atRisk;
        if(atRisk>d)greenwood+=d/(atRisk*(atRisk-d));
        if(median===null&&survival<=.5)median=time;
      }
      const se=survival>0?survival*Math.sqrt(Math.max(0,greenwood)):0;
      steps.push({time,atRisk,events:d,censored,survival,se});
      atRisk-=d+censored;
    }
    const survivalAt=riskTimes.map(time=>{
      const prior=steps.filter(s=>s.time<=time);
      return prior.length?prior.at(-1).survival:1;
    });
    const atRiskAt=riskTimes.map(time=>dat.filter(r=>r.time>=time).length);
    return {
      group,n:dat.length,events:dat.reduce((s,r)=>s+r.event,0),
      censored:dat.reduce((s,r)=>s+(r.event===0?1:0),0),
      median,steps,survivalAt,atRiskAt
    };
  });
  return {groups:summaries,riskTimes,maxTime,n:clean.length,events:clean.reduce((s,r)=>s+r.event,0)};
}

function coxState(dat,beta){
  const eventTimes=[...new Set(dat.filter(r=>r.event===1).map(r=>r.time))].sort((a,b)=>a-b);
  let logLik=0,score=0,information=0;
  for(const time of eventTimes){
    const risk=dat.filter(r=>r.time>=time);
    const events=dat.filter(r=>r.time===time&&r.event===1);
    const d=events.length;if(!d||!risk.length)continue;
    const maxEta=Math.max(...risk.map(r=>beta*r.x));
    let s0=0,s1=0,s2=0;
    for(const r of risk){
      const w=Math.exp(beta*r.x-maxEta);
      s0+=w;s1+=w*r.x;s2+=w*r.x*r.x;
    }
    const eventX=events.reduce((s,r)=>s+r.x,0);
    logLik+=beta*eventX-d*(maxEta+Math.log(s0));
    const mean=s1/s0;
    score+=eventX-d*mean;
    information+=d*(s2/s0-mean*mean);
  }
  return {logLik,score,information};
}

/**
 * Cox proportional-hazards model for the same two-group contrast as log-rank.
 * x=1 is the explicitly selected group of interest and x=0 the reference.
 * Ties are handled by the Breslow approximation.
 */
export function coxBinaryGroup(rows,groupKey,timeKey,eventKey,groupOfInterest,{maxIter=100,tolerance=1e-9}={}){
  const clean=cleanSurvivalRows(rows,groupKey,timeKey,eventKey);
  const groups=[...new Set(clean.map(r=>r.group))];
  if(groups.length!==2)throw new Error('SURVIVAL_TWO_GROUPS');
  const exposed=groups.includes(String(groupOfInterest))?String(groupOfInterest):groups[0];
  const reference=groups.find(g=>g!==exposed);
  const dat=clean.map(r=>({...r,x:r.group===exposed?1:0}));
  const eventsByGroup=Object.fromEntries(groups.map(g=>[g,dat.filter(r=>r.group===g&&r.event===1).length]));
  if(dat.length<4||dat.reduce((s,r)=>s+r.event,0)<2)throw new Error('N_TOO_SMALL');

  let beta=0,converged=false,singular=false,iterations=0;
  let current=coxState(dat,beta);
  for(let iter=1;iter<=maxIter;iter++){
    iterations=iter;
    if(!(current.information>1e-12)){singular=true;break;}
    const delta=current.score/current.information;
    let step=1,nextBeta=beta+delta,next=coxState(dat,nextBeta);
    while((!Number.isFinite(next.logLik)||next.logLik<current.logLik-1e-10)&&step>1/1048576){
      step/=2;nextBeta=beta+step*delta;next=coxState(dat,nextBeta);
    }
    if(!Number.isFinite(next.logLik)){singular=true;break;}
    beta=nextBeta;current=next;
    if(Math.abs(step*delta)<tolerance){converged=true;break;}
  }
  const final=coxState(dat,beta);
  const se=final.information>0?1/Math.sqrt(final.information):NaN;
  const z=se>0?beta/se:NaN;
  const p=Number.isFinite(z)?Math.min(1,2*(1-normalCDF(Math.abs(z)))):NaN;
  const ci=Number.isFinite(se)?[beta-Z975*se,beta+Z975*se]:[NaN,NaN];
  const hr=expSafe(beta),hrCI=[expSafe(ci[0]),expSafe(ci[1])];
  const nullState=coxState(dat,0);
  const likelihoodRatio=Math.max(0,2*(final.logLik-nullState.logLik));
  const pLikelihoodRatio=chiSquareSF(likelihoodRatio,1);
  const separationLikely=!converged||singular||Math.abs(beta)>20||eventsByGroup[exposed]===0||eventsByGroup[reference]===0;

  return {
    test:'cox_ph_binary',n:dat.length,events:dat.reduce((s,r)=>s+r.event,0),
    groups,groupOfInterest:exposed,reference,eventsByGroup,
    beta,se,z,p,ci,hr,hrCI,logLik:final.logLik,logLikNull:nullState.logLik,
    likelihoodRatio,pLikelihoodRatio,converged,iterations,singular,separationLikely,
    ties:'breslow'
  };
}
