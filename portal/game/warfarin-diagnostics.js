// Study-grounded educational diagnostics reconstructed from published fixed-effect
// parameters and the site's actual warfarin PK/PCA observations.
// CWRES, NPDE, SAEM EBE, simulation confidence bands, and full covariance
// are NOT available from the archived fit object. Never counterfeit them.
import {SUBJECTS,OBSERVATIONS,PD_OBSERVATIONS,FINAL_FIT,populationPredict} from './saem-replay.js';
const byId=new Map(SUBJECTS.map(s=>[s.id,s]));
const pop=x=>populationPredict('final',x.t,byId.get(x.id).dose,0,byId.get(x.id).wt);
const sd=v=>Math.hypot(FINAL_FIT.addSd,FINAL_FIT.propSd*v); // illustrative combined error
const sq=x=>x*x;
export function estimateCLProxy(){
 const out=new Map();
 for(const sub of SUBJECTS){
  const obs=OBSERVATIONS.filter(o=>o.id===sub.id);
  let best={eta:0,loss:Infinity};
  for(let step=0;step<=140;step++){
   const eta=(step-70)*.015;
   let loss=sq(eta/.35); // explicitly illustrative CL-only prior width
   for(const o of obs){
    const pr=populationPredict('final',o.t,sub.dose,eta,sub.wt);
    loss+=sq((o.c-pr)/Math.max(.25,sd(pr)));
   }
   if(loss<best.loss)best={eta,loss};
  }
  out.set(sub.id,best.eta);
 }
 return out;
}
const clProxy=estimateCLProxy();
export const DIAG_ROWS=Object.freeze(OBSERVATIONS.map(o=>{
 const pred=pop(o),sub=byId.get(o.id);
 const eta=clProxy.get(o.id);
 const ipred=populationPredict('final',o.t,sub.dose,eta,sub.wt);
 return Object.freeze({...o,wt:sub.wt,pred,ipred,eta,res:o.c-pred,
   wres:(o.c-pred)/Math.max(.25,sd(pred)),
   ires:o.c-ipred,iwres:(o.c-ipred)/Math.max(.25,sd(ipred))});
}));
export const DIAGNOSTIC_OPTIONS=Object.freeze([
 {id:'gof-pred',title:'DV vs PRED',desc:'Prédictions de population reconstruites avec les effets fixes archivés et WT.'},
 {id:'gof-ipred',title:'DV vs IPRED*',desc:'*IPRED approchée : ηCL ajusté seul sur les données du sujet, sans les EBE SAEM.'},
 {id:'wres-time',title:'WRES* vs temps',desc:'*Résidu pondéré simplifié : pas un CWRES nlmixr2.'},
 {id:'wres-pred',title:'WRES* vs PRED',desc:'*Contrôle d’hétéroscédasticité sur l’erreur combinée reconstruite.'},
 {id:'iwres-hist',title:'Histogramme IWRES*',desc:'*Résidus individuels approchés, pas les IWRES calculés par nlmixr2.'},
 {id:'iwres-qq',title:'QQ-plot IWRES*',desc:'Déviation vis-à-vis d’une normale idéale sur des résidus post-hoc approchés.'},
 {id:'eta-wt',title:'ηCL* vs poids',desc:'ηCL inféré par optimisation 1D ; les vraies EBE ne sont pas archivées.'},
 {id:'individual',title:'Ajustements individuels',desc:'Observations, PRED et approximation IPRED ; sélectionner un sujet.'},
 {id:'pd-time',title:'PCA observée vs temps',desc:'232 vraies observations PCA de l’étude historique.'},
 {id:'pd-cp',title:'PCA vs concentration',desc:'PCA observée contre concentration prédite au temps PD : exploration du délai, pas estimation PD.'},
 {id:'vpc',title:'VPC illustratif',desc:'Médiane observée vs simulations exploratoires ; variance IIV hypothétique, pas VPC du fit nlmixr2.'},
 {id:'unavailable',title:'CWRES / NPDE / précision',desc:'Résultats non exportés : consulter le script R et reproduire les diagnostics.'}
]);
export function diagnosticsQuantiles(xs,probs=[.1,.5,.9]){
 const a=[...xs].filter(Number.isFinite).sort((a,b)=>a-b);
 if(!a.length)return probs.map(()=>NaN);
 return probs.map(p=>{
  const pos=(a.length-1)*p,k=Math.floor(pos),u=pos-k;
  return a[k]*(1-u)+a[Math.min(a.length-1,k+1)]*u;
 });
}
function quantileNormal(p){
 // Winitzki inverse erf approximation; sufficient for visualization of QQ.
 const x=2*p-1,ln=Math.log(Math.max(1e-12,1-x*x)),a=.147;
 return Math.sign(x)*Math.SQRT2*Math.sqrt(Math.max(0,Math.sqrt(sq(2/(Math.PI*a)+ln/2)-ln/a)-(2/(Math.PI*a)+ln/2)));
}
export function studyVPC(){
 const times=[3,6,9,12,24,36,48,72,96,120,144];
 let seed=90211;
 const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 const gauss=()=>Math.sqrt(-2*Math.log(Math.max(1e-12,rnd())))*Math.cos(2*Math.PI*rnd());
 const result=[];
 for(const t of times){
   const group=DIAG_ROWS.filter(o=>o.t===t);
   if(group.length<5)continue;
   const simulations=[];
   for(let rep=0;rep<120;rep++){
     const vals=group.map(o=>{
       const subject=byId.get(o.id),latent=gauss()*.35;
       const pred=populationPredict('final',t,subject.dose,latent,subject.wt);
       return Math.max(0,pred+sd(pred)*gauss());
     });
     simulations.push(diagnosticsQuantiles(vals,[.5])[0]);
   }
   result.push({t,n:group.length,
    obsMedian:diagnosticsQuantiles(group.map(o=>o.c),[.5])[0],
    simMedian:diagnosticsQuantiles(simulations,[.5])[0],
    lower:diagnosticsQuantiles(simulations,[.1])[0],
    upper:diagnosticsQuantiles(simulations,[.9])[0]});
 }
 return result;
}
export const VPC_DEMO=Object.freeze(studyVPC());
const fmt=(x,n=1)=>Number(x).toLocaleString('fr-FR',{maximumFractionDigits:n});
const COLORS={mint:'#93ecd0',blue:'#73afc1',peach:'#f1c192',grey:'#587f81'};
function scatterSvg(sets,{labelX='X',labelY='Y',zero=false,identity=false}={}){
 const flat=sets.flatMap(z=>z.points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
 if(!flat.length)return '<text x="30" y="50" fill="#eee">Aucun point disponible</text>';
 let xmin=Math.min(0,...flat.map(x=>x.x)),xmax=Math.max(...flat.map(x=>x.x));
 let ymin=Math.min(0,...flat.map(x=>x.y)),ymax=Math.max(...flat.map(x=>x.y));
 if(!zero&&ymin<0)ymin=Math.min(ymin*1.2,-.5);
 if(!zero&&xmin<0)xmin=Math.min(xmin*1.2,-.5);
 xmax=xmax===xmin?xmax+1:xmax*1.06;
 ymax=ymax===ymin?ymax+1:ymax*1.06;
 const x=v=>69+582*(v-xmin)/(xmax-xmin),y=v=>240-196*(v-ymin)/(ymax-ymin);
 let out='<rect x="69" y="44" width="582" height="196" rx="8" fill="#102b34"/>';
 for(let i=0;i<=4;i++){
   const xv=xmin+(xmax-xmin)*i/4,yv=ymin+(ymax-ymin)*i/4;
   out+='<line x1="'+x(xv)+'" x2="'+x(xv)+'" y1="44" y2="240" stroke="#34525a" stroke-dasharray="3 6"/>'+
    '<line x1="69" x2="651" y1="'+y(yv)+'" y2="'+y(yv)+'" stroke="#34525a" stroke-dasharray="3 6"/>'+
    '<text x="'+x(xv)+'" y="258" text-anchor="middle" fill="#c2d3cb" font-size="12">'+fmt(xv)+'</text>'+
    '<text x="60" y="'+(y(yv)+4)+'" text-anchor="end" fill="#c2d3cb" font-size="12">'+fmt(yv)+'</text>';
 }
 if(identity){
   const low=Math.max(xmin,ymin),hi=Math.min(xmax,ymax);
   if(low<hi)out+='<line x1="'+x(low)+'" y1="'+y(low)+'" x2="'+x(hi)+'" y2="'+y(hi)+'" stroke="#f3bf88" stroke-width="2" stroke-dasharray="7 6"/>';
 }
 if(zero && ymin<0 && ymax>0)out+='<line x1="69" x2="651" y1="'+y(0)+'" y2="'+y(0)+'" stroke="#e9bb8b" stroke-width="2"/>';
 for(const set of sets){
  if(set.line){
   const pts=set.points.slice().sort((a,b)=>a.x-b.x).map(p=>x(p.x).toFixed(1)+','+y(p.y).toFixed(1)).join(' ');
   out+='<polyline points="'+pts+'" fill="none" stroke="'+(set.color||COLORS.mint)+'" stroke-width="3"/>';
  }else{
   out+=set.points.map(p=>'<circle cx="'+x(p.x).toFixed(1)+'" cy="'+y(p.y).toFixed(1)+'" r="3.6" fill="'+(set.color||COLORS.mint)+'" opacity=".69"/>').join('');
  }
 }
 out+='<text x="360" y="280" text-anchor="middle" fill="#c5dcd3" font-size="13">'+labelX+'</text>'+
 '<text x="11" y="150" text-anchor="middle" fill="#c5dcd3" transform="rotate(-90 11 150)" font-size="13">'+labelY+'</text>';
 return out;
}
function histogram(values,{label='Résidus',normal=false}={}){
 const arr=values.filter(Number.isFinite),min=-4,max=4,counts=Array(16).fill(0);
 for(const val of arr){const idx=Math.min(15,Math.max(0,Math.floor((val-min)/(max-min)*16)));counts[idx]++;}
 const top=Math.max(1,...counts),base=235;
 let s='<rect x="65" y="30" width="590" height="205" fill="#102b34" rx="8"/>';
 counts.forEach((n,i)=>{
  const h=180*n/top;
  s+='<rect x="'+(73+i*35)+'" y="'+(base-h).toFixed(1)+'" width="31" height="'+h.toFixed(1)+'" rx="3" fill="#83d9c3"/>';
 });
 for(let i=0;i<=4;i++){const x=73+i*140;s+='<text x="'+x+'" y="260" fill="#c5dcd3" font-size="12">'+(-4+i*2)+'</text>';}
 return s+'<text x="360" y="284" fill="#cee8df" font-size="13" text-anchor="middle">'+label+'</text>';
}
export function drawDiagnostic(svg,key,subject=SUBJECTS[0].id){
 const all=DIAG_ROWS;
 const sc=([x,y])=>({x,y});
 let s='';
 if(key==='gof-pred')s=scatterSvg([{points:all.map(o=>sc([o.pred,o.c])),color:COLORS.mint}],{labelX:'PRED (mg/L)',labelY:'DV (mg/L)',identity:true});
 else if(key==='gof-ipred')s=scatterSvg([{points:all.map(o=>sc([o.ipred,o.c])),color:COLORS.mint}],{labelX:'IPRED* (mg/L)',labelY:'DV (mg/L)',identity:true});
 else if(key==='wres-time')s=scatterSvg([{points:all.map(o=>sc([o.t,o.wres]))}],{labelX:'Temps depuis dose (h)',labelY:'WRES*',zero:true});
 else if(key==='wres-pred')s=scatterSvg([{points:all.map(o=>sc([o.pred,o.wres]))}],{labelX:'PRED (mg/L)',labelY:'WRES*',zero:true});
 else if(key==='iwres-hist')s=histogram(all.map(o=>o.iwres),{label:'IWRES* (approximation)'});
 else if(key==='iwres-qq'){
   const vals=all.map(o=>o.iwres).filter(Number.isFinite).sort((a,b)=>a-b);
   s=scatterSvg([{points:vals.map((v,i)=>sc([quantileNormal((i+.5)/vals.length),v]))}],{labelX:'Quantiles normaux théoriques',labelY:'IWRES*',identity:true});
 }
 else if(key==='eta-wt')s=scatterSvg([{points:SUBJECTS.map(o=>sc([o.wt,clProxy.get(o.id)]))}],{labelX:'Poids (kg)',labelY:'ηCL* post-hoc',zero:true});
 else if(key==='individual'){
   const sub=byId.get(subject)||SUBJECTS[0];
   const obs=all.filter(o=>o.id===sub.id),eta=clProxy.get(sub.id),maxT=Math.max(120,...obs.map(o=>o.t));
   const t=Array.from({length:145},(_,i)=>maxT*i/144);
   s=scatterSvg([
     {points:t.map(x=>sc([x,populationPredict('final',x,sub.dose,0,sub.wt)])),color:COLORS.blue,line:true},
     {points:t.map(x=>sc([x,populationPredict('final',x,sub.dose,eta,sub.wt)])),color:COLORS.mint,line:true},
     {points:obs.map(o=>sc([o.t,o.c])),color:COLORS.peach}
   ],{labelX:'Temps (h)',labelY:'Concentration mg/L'});
 }
 else if(key==='pd-time')s=scatterSvg([{points:PD_OBSERVATIONS.map(o=>sc([o.t,o.pca]))}],{labelX:'Temps (h)',labelY:'PCA (%)'});
 else if(key==='pd-cp'){
   s=scatterSvg([{points:PD_OBSERVATIONS.map(o=>{
     const sub=byId.get(o.id);return sc([populationPredict('final',o.t,sub.dose,0,sub.wt),o.pca]);
   })}],{labelX:'Concentration prédite (mg/L)',labelY:'PCA (%)'});
 }
 else if(key==='vpc'){
   s=scatterSvg([
     {points:VPC_DEMO.map(o=>sc([o.t,o.obsMedian])),color:COLORS.peach},
     {points:VPC_DEMO.map(o=>sc([o.t,o.simMedian])),color:COLORS.mint,line:true},
     {points:VPC_DEMO.map(o=>sc([o.t,o.lower])),color:COLORS.grey,line:true},
     {points:VPC_DEMO.map(o=>sc([o.t,o.upper])),color:COLORS.grey,line:true}
   ],{labelX:'Temps (h)',labelY:'Concentration médiane (mg/L)'});
 }
 else if(key==='unavailable'){
   s='<text x="360" y="83" fill="#f0cfab" font-size="22" text-anchor="middle">Données d’ajustement non exportées</text>'+
    '<text x="360" y="120" fill="#d1e5dd" font-size="16" text-anchor="middle">CWRES, NPDE, RSE, historique SAEM, η réels</text>'+
    '<text x="360" y="153" fill="#c1d7ce" font-size="15" text-anchor="middle">nécessitent les sorties du modèle nlmixr2</text>'+
    '<text x="360" y="190" fill="#c1d7ce" font-size="15" text-anchor="middle">Ne pas les remplacer par des calculs simulés.</text>';
 }
 else throw new RangeError('Unknown diagnostic: '+key);
 svg.setAttribute('viewBox','0 0 730 300');
 svg.innerHTML=s;
 return s;
}
export function diagnosticsSummary(){
 const res=DIAG_ROWS.map(o=>o.res),sqsum=res.reduce((s,v)=>s+v*v,0);
 return {n:DIAG_ROWS.length,mae:res.reduce((s,v)=>s+Math.abs(v),0)/res.length,
  rmse:Math.sqrt(sqsum/res.length),wresMean:DIAG_ROWS.reduce((s,o)=>s+o.wres,0)/DIAG_ROWS.length,
  subjects:clProxy.size,originalPCA:PD_OBSERVATIONS.length,simulatedVPC:VPC_DEMO.length};
}
