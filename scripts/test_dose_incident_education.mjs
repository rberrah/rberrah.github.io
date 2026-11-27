import assert from 'node:assert/strict';
import {halfLifeRule,oralPulse,steadyOral,incidentProfiles} from '../src/lib/sim/doseIncidentEducation.js';
function check(assert){
 let count=0;function ok(x,label){assert(x,label);count++}
 for(const [tau,hl,delay,expected] of [[24,7,2.4,.97],[24,7,4.8,.94],[24,7,7.92,.88],[24,7,12,.77],[24,7,18,.49],[24,7,24,.09],[12,15.6,1.2,.95],[12,15.6,2.4,.90],[12,15.6,4,.84],[12,15.6,6,.77],[12,15.6,9,.67],[12,15.6,12,.59]])ok(Math.abs(halfLifeRule(delay,tau,hl).exact-expected)<.006,"Public presentation fraction");
 for(const tau of [8,12,24])for(const hl of [1,8,24])for(const ka of [.1,Math.LN2/hl,1,3]){
   const k=Math.LN2/hl;
   for(const t of [0,.5*tau,.999*tau]){
     let sum=0;for(let i=0;i<2000;i++)sum+=oralPulse(t+i*tau,ka,k);
     ok(Math.abs(steadyOral(t,tau,ka,k)-sum)<1e-9*Math.max(1,sum),"Independent dose superposition");
   }
   for(const scenario of ['adherence','vomiting'])for(const delay of [0,.33*tau,tau]){
     const out=incidentProfiles({scenario,tau,ka,delay,popHalfLife:hl,trueHalfLife:hl});
     ok(out.points.every(p=>[p.reference,p.incident,p.corrected,p.alternative].every(x=>Number.isFinite(x)&&x>=0)),"Finite nonnegative");
     ok(out.points.every(p=>p.corrected+1e-12>=p.incident&&p.alternative+1e-12>=p.corrected),"Linear compensation");
     ok(Math.abs(out.metrics[0].reference.auc*k-1)<.001,"Steady state normalized AUC");
     ok(out.rule.rounded<=out.rule.exact+1e-12,"Floor rounding");
     if(scenario==='adherence'&&delay===0)ok(out.points.every(p=>Math.abs(p.corrected-p.reference)<1e-10),"No delay baseline");
   }
 }
 const z=incidentProfiles({scenario:'vomiting',loss:0,trialFraction:0});
 ok(z.points.every(p=>p.reference===p.incident&&p.incident===p.corrected),"Zero loss");
 ok(halfLifeRule(12,12,8).S===0,"Complete omission S=0");
 ok(halfLifeRule(0,12,8).rounded===1,"No delay rule");
 let rejected=false;try{halfLifeRule(13,12,8)}catch{rejected=true}ok(rejected,"Invalid delay");
 return count;
}
console.log(check(assert)+' dose incident educational checks passed');
