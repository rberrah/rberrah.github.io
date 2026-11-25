import {isFree,firstIncomplete,canVisit,normalizeCompleted} from './learning-mode.js';
import {gammaDensity,referenceGammaConcentration} from './double-gamma.js';
import {WOILLARD_MPA} from './woillard-mpa-source.js';
import {SUPPORTS,TIMES,SYNTHETIC_PROFILES,PATIENT,INITIAL,prediction,fitFixedGrid,updateWeights,summarize} from './pmetrics-course-core.js';
const $=id=>document.getElementById(id);
const tr=(fr,en)=>document.documentElement.lang==='en'?en:fr;
const fmt=(v,d=2)=>Number(v).toLocaleString(document.documentElement.lang==='en'?'en-US':'fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const link=(slug,label)=>'<a href="/pharmacometrie/chapitres/'+slug+'/?lang='+document.documentElement.lang+'" target="_blank" rel="noopener">'+label+'</a>';
const STEPS=[
 {title:['Comprendre la double gamma','Understand double-gamma absorption'],desc:['Une structure PK, deux entrées parallèles.','One PK structure, two parallel inputs.'],question:['Que représentent les deux gammas ?','What do the two gamma functions represent?'],choices:[['Deux compartiments de distribution','Two distribution compartments'],['Deux entrées dans un seul compartiment','Two inputs into one compartment'],['Deux populations de patients','Two patient populations']],answer:1,hint:['Observez les débits d’entrée et leur somme.','Look at the input rates and their sum.'],explain:['Le modèle structural possède un seul compartiment central. Les deux entrées sont empiriques ; elles ne prouvent pas un mécanisme biologique.','The structural model has one central compartment. The two inputs are empirical; they do not prove a biological mechanism.']},
 {title:['Construire une distribution discrète','Build a discrete distribution'],desc:['Passer des paramètres moyens aux vecteurs pondérés.','Move from mean parameters to weighted vectors.'],question:['Que représente un point de support ?','What is a support point?'],choices:[['Un vecteur complet de paramètres et une probabilité','A full parameter vector and a probability'],['Un patient réel','An actual patient'],['Une covariable significative','A significant covariate']],answer:0,hint:['La distribution est jointe, pas un histogramme par paramètre.','The distribution is joint, not one histogram per parameter.'],explain:['Chaque point conserve les relations entre les paramètres. Les poids s’additionnent à 1. Les bornes ab() sont des limites de recherche, pas des probabilités.','Each point preserves relationships between parameters. Weights sum to 1. The ab() bounds are search limits, not probabilities.']},
 {title:['Estimer les poids','Estimate the weights'],desc:['Maximiser la vraisemblance des profils simulés.','Maximize the likelihood of simulated profiles.'],question:['Une augmentation de la vraisemblance suffit-elle à qualifier le modèle ?','Does a higher likelihood establish model adequacy?'],choices:[['Oui, le modèle est validé','Yes, the model is validated'],['Non, il faut aussi diagnostics, stabilité et validation','No, diagnostics, stability and validation are also needed'],['Oui, si tous les points ont le même poids','Yes, if all points have equal weights']],answer:1,hint:['L’ajustement des données de développement ne garantit pas la prédiction externe.','Fit to development data does not guarantee external prediction.'],explain:['L’atelier estime réellement les poids sur une grille fixe. NPAG adapte aussi la grille ; ce calcul n’est pas une exécution de Pmetrics.','The workshop actually estimates weights on a fixed grid. NPAG also adapts the grid; this calculation is not a Pmetrics run.']},
 {title:['Actualiser les probabilités du patient','Update patient probabilities'],desc:['Passer du prior de population au posterior avec quatre concentrations fictives.','Move from a population prior to the posterior using four fictional concentrations.'],question:['Que change l’actualisation bayésienne sur cette grille ?','What does Bayesian updating change on this grid?'],choices:[['La position de chaque point de support','The location of every support point'],['Les probabilités des points de support','The probabilities of the support points'],['Le modèle structural lui-même','The structural model itself']],answer:1,hint:['Les vecteurs sont fixés avant les prélèvements.','The vectors are fixed before sampling.'],explain:['Les probabilités deviennent proportionnelles au produit du poids a priori et de la vraisemblance individuelle. Le point MAP et la moyenne postérieure sont des résumés distincts.','Probabilities become proportional to the product of prior weight and individual likelihood. The MAP point and posterior mean are different summaries.']},
 {title:['Comparer ITS et Pmetrics','Compare ITS and Pmetrics'],desc:['Relier les résultats publiés à l’individualisation.','Connect the published findings to individualization.'],question:['Que montrent les résultats de Woillard 2015 ?','What do Woillard’s 2015 results show?'],choices:[['Une supériorité universelle de Pmetrics','Universal superiority of Pmetrics'],['Des paramètres différents mais une précision d’AUC proche dans la validation étudiée','Different parameters but similar AUC precision in the reported validation'],['Les moyennes et CV suffisent à reconstruire tous les supports','Means and CVs suffice to reconstruct every support point']],answer:1,hint:['Comparez les RMSE et le nombre de profils de validation.','Compare RMSE values and the number of validation profiles.'],explain:['Les deux méthodes sont complémentaires. Les points et poids originaux ne sont pas publiés dans le supplément fourni ; une reconstitution de la distribution serait injustifiée.','The methods are complementary. The original support points and weights are absent from the supplied supplement; reconstructing that distribution would be unjustified.']}
];
const KEY='pmx-game-pmetrics-v1';
let done=[];try{done=normalizeCompleted(JSON.parse(localStorage.getItem(KEY)||'[]'),STEPS.length);}catch{}
let index=firstIncomplete(done,STEPS.length),fraction=.44,speed=.5,cycle=0,sampleCount=0,ruv=.18,fit=null;
function fitted(){return fit??=fitFixedGrid(20);}
function bars(w,post=false){return '<div class="np-support-bars">'+w.map((v,i)=>'<div class="np-support-row"><strong>'+SUPPORTS[i].id+'</strong><div class="np-support-track"><div class="np-support-fill '+(post?'posterior':'')+'" style="width:'+(v*100)+'%"></div></div><span>'+fmt(v*100,1)+' %</span></div>').join('')+'</div>';}
function note(fr,en){return '<p class="career-note">'+tr(fr,en)+'</p>';}
function plot(id,series,highLabel,points=[],maxT=12){
 const high=Math.max(.01,...series.flatMap(x=>x.values.map(q=>q.c)),...points.map(q=>q.value))*1.1;
 const x=t=>48+t/maxT*650,y=c=>240-c/high*200;
 let s='<rect x="48" y="40" width="650" height="200" rx="8" fill="#0b2630"/>';
 for(let i=0;i<=4;i++){const v=i*high/4,t=i*maxT/4;s+='<path d="M48 '+y(v)+' H698" stroke="#42646a" stroke-dasharray="4 5"/><text x="42" y="'+(y(v)+4)+'" fill="#c3d8d0" font-size="11" text-anchor="end">'+fmt(v,1)+'</text><text x="'+x(t)+'" y="258" fill="#c3d8d0" font-size="11" text-anchor="middle">'+fmt(t,1)+'</text>';}
 for(const line of series)s+='<polyline points="'+line.values.map(q=>x(q.t).toFixed(1)+','+y(q.c).toFixed(1)).join(' ')+'" stroke="'+line.color+'" stroke-width="'+(line.width||2)+'" fill="none"/>';
 for(const p of points)s+='<circle cx="'+x(p.t)+'" cy="'+y(p.value)+'" r="4.5" fill="#f8c48f"/>';
 $(id).innerHTML=s+'<text x="48" y="25" fill="#d3e8e0" font-size="13">'+highLabel+'</text><text x="375" y="280" text-anchor="middle" fill="#d3e8e0" font-size="12">'+tr('Temps (h)','Time (h)')+'</text>';
}
function legend(items){return '<p class="career-chart-key">'+items.map(([color,fr,en])=>'<span><i style="background:'+color+'"></i>'+tr(fr,en)+'</span>').join('')+'</p>';}
function slider(id,fr,en,min,max,step,value,output){return '<div class="np-slider"><label for="'+id+'">'+tr(fr,en)+'</label><output id="'+output+'" for="'+id+'"></output><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'"></div>';}
function svg(id){return '<svg id="'+id+'" viewBox="0 0 730 285" class="career-chart" role="img" aria-label="'+tr('Graphique interactif','Interactive plot')+'"></svg>';}
function stage(){
 const p=WOILLARD_MPA.populationParameters.Pmetrics;
 if(index===0){
  return note('Le MPA peut présenter une entrée précoce et une entrée retardée. Une gamma décrit un débit d’absorption ; la concentration résulte de ce débit et de l’élimination. Pour les paramètres b, la convention taux reste à confirmer pour le code historique.','MPA may show early and delayed inputs. A gamma function describes an absorption rate; concentration results from input and elimination. The rate convention for b still needs confirmation against the historical code.')+
  '<div class="np-slider-grid">'+slider('np-fraction','Part de la première absorption (r)','Fraction of first absorption (r)',0,1,.01,fraction,'np-frac-value')+slider('np-speed','Vitesse de la deuxième absorption (× b₂)','Rate of second absorption (× b₂)',.2,2,.05,speed,'np-speed-value')+'</div>'+
  '<div class="np-controls"><button id="np-gamma-reset" type="button" class="career-action">'+tr('Moyennes publiées','Published means')+'</button><button id="np-gamma-example" type="button" class="career-action">'+tr('Exemple : deuxième entrée retardée','Example: delayed second input')+'</button></div><div class="career-metrics" id="np-mat"></div>'+
  '<h3>'+tr('Débits d’absorption pondérés','Weighted absorption rates')+'</h3>'+svg('np-input')+legend([['#78b8e7','Première gamma','First gamma'],['#e2ad70','Deuxième gamma','Second gamma'],['#87dfc3','Somme','Sum']])+
  '<h3>'+tr('Profil de concentration résultant','Resulting concentration profile')+'</h3>'+svg('np-conc')+
  note('Diminuez b₂ : la deuxième entrée devient plus tardive. Le temps moyen d’absorption (MAT) vaut a/b. Le bouton des moyennes publiées rétablit r = 0,44 et b₂ = 25,52. Les modifications sont des scénarios pédagogiques ; aucun profil réel.','Reduce b₂: the second input occurs later. Mean absorption time (MAT) is a/b. The published-means button restores r = 0.44 and b₂ = 25.52. Modified values are teaching scenarios; no actual patient profile.')+
  '<p>'+link('absorption-orale',tr('Cours : absorption et double gamma','Lesson: absorption and double gamma'))+'</p>';
 }
 if(index===1)return note('NPAG recherche une distribution jointe de vecteurs de paramètres. Les cinq points ci-dessous sont construits pour cet exercice à partir de variations autour des moyennes publiées ; ils ne sont pas les points de Woillard.','NPAG searches for a joint distribution of parameter vectors. The five points below are teaching examples constructed by varying the published means; they are not Woillard’s points.')+
 '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>Point</th><th>r</th><th>b₂</th><th>α</th><th>FAIV</th><th>'+tr('Poids initial','Initial weight')+'</th></tr></thead><tbody>'+SUPPORTS.map((s,i)=>'<tr><td>'+s.id+'</td><td>'+fmt(s.parameters.r)+'</td><td>'+fmt(s.parameters.b2)+'</td><td>'+fmt(s.parameters.alpha)+'</td><td>'+fmt(s.parameters.faiv)+'</td><td>'+fmt(INITIAL[i]*100,0)+' %</td></tr>').join('')+'</tbody></table></div>'+
 note('Les autres paramètres du vecteur sont fixés aux moyennes Pmetrics. ab(min,max) fixe les bornes de recherche, et non les poids.','The remaining vector parameters are fixed to Pmetrics means. ab(min,max) defines search bounds, not weights.')+'<p>'+link('pmetrics-nonparametric',tr('Cours Pmetrics : points de support et bornes','Pmetrics lesson: support points and bounds'))+'</p>';
 if(index===2)return note('Douze profils synthétiques à quatre temps sont ajustés avec cinq supports fixes. L’algorithme EM actualise les poids à partir des vraisemblances individuelles. Il ne déplace pas les points, contrairement à une recherche NPAG complète.','Twelve synthetic four-sample profiles are fitted using five fixed supports. EM updates the weights from individual likelihoods. It does not move points, unlike a full NPAG search.')+
 '<div class="np-controls"><button id="np-cycle" class="career-action">'+tr('Une itération','One iteration')+'</button><button id="np-fit" class="career-action">'+tr('Estimer les poids (20 itérations)','Fit weights (20 iterations)')+'</button><button id="np-fit-reset" class="career-action">'+tr('Réinitialiser','Reset')+'</button></div><p id="np-fit-status" class="career-note"></p><div id="np-fit-bars"></div>'+
 '<p>'+link('pmetrics-nonparametric',tr('Cours : ajustement NPAG et diagnostics','Lesson: NPAG fitting and diagnostics'))+'</p>';
 if(index===3)return note('Les poids populationnels estimés servent de prior. Choisissez combien de prélèvements utiliser et l’erreur résiduelle de démonstration. Les positions des supports ne changent pas.','Fitted population weights act as the prior. Choose the number of samples and the demonstration residual error. Support locations do not change.')+
 '<div class="np-slider-grid">'+slider('np-samples','Nombre de prélèvements','Number of samples',0,4,1,sampleCount,'np-samples-value')+slider('np-ruv','Erreur résiduelle proportionnelle (RUV)','Proportional residual error (RUV)',.08,.40,.01,ruv,'np-ruv-value')+'</div><div id="np-sampling-table" class="career-table-wrap"></div>'+
 '<div class="archive-gof-grid"><div><h4>'+tr('Distribution a priori','Prior distribution')+'</h4><div id="np-prior"></div></div><div><h4>'+tr('Distribution a posteriori','Posterior distribution')+'</h4><div id="np-post"></div></div></div>'+svg('np-patient')+
 legend([['#a0bbcc','Prédiction moyenne a priori','Prior mean prediction'],['#87dfc3','Prédiction moyenne a posteriori','Posterior mean prediction'],['#b7a1e8','Point MAP discret','Discrete MAP point'],['#f8c48f','Prélèvements retenus','Selected samples']])+note('À zéro prélèvement, le posterior est identique au prior. L’erreur proportionnelle est combinée ici à un terme additif de 0,15 mg/L (exercice uniquement).','With zero samples, the posterior equals the prior. Proportional error is combined with a 0.15 mg/L additive term (exercise only).')+'<p id="np-auc" class="career-note"></p><p>'+link('bayes-ebes',tr('Cours : Bayes et estimation individuelle','Lesson: Bayes and individual estimation'))+'</p>';
 return '<div class="career-table-wrap"><table class="career-table"><thead><tr><th>'+tr('Méthode','Method')+'</th><th>'+tr('RMSE relative AUC','Relative AUC RMSE')+'</th></tr></thead><tbody><tr><td>ITS</td><td>'+fmt(18.92)+' %</td></tr><tr><td>Pmetrics</td><td>'+fmt(18.80)+' %</td></tr></tbody></table></div>'+
 note('Woillard 2015 : 37 profils de développement, 19 de validation ; prélèvements à 20 min, 1 h, 3 h et 6 h. Les résultats sont publiés, mais ne sont pas ceux de cet atelier synthétique.','Woillard 2015: 37 development profiles, 19 validation profiles; samples at 20 min, 1 h, 3 h and 6 h. These are published findings, not the results of this synthetic workshop.')+
 '<p><a href="https://doi.org/10.1016/j.phrs.2015.07.012" target="_blank" rel="noopener">Woillard et al. (2015)</a> · '+link('pmetrics-nonparametric','Pmetrics')+'</p>'+
 '<button id="np-go-mipd" class="career-action">'+tr('Poursuivre vers le MIPD','Continue to MIPD')+'</button>';
}
function drawGamma(){
 const base=WOILLARD_MPA.populationParameters.Pmetrics,p={...base,r:fraction,b2:base.b2*speed},times=Array.from({length:121},(_,i)=>i/10);
 const a=times.map(t=>({t,c:p.r*gammaDensity(t,p.a1,p.b1)})),b=times.map(t=>({t,c:(1-p.r)*gammaDensity(t,p.a2,p.b2)})),sum=a.map((v,i)=>({t:v.t,c:v.c+b[i].c}));
 plot('np-input',[{values:a,color:'#78b8e7'},{values:b,color:'#e2ad70'},{values:sum,color:'#87dfc3',width:3}],tr('Fraction absorbée par heure','Fraction absorbed per hour'));
 plot('np-conc',[{values:times.map(t=>({t,c:referenceGammaConcentration(t,p,1000)})),color:'#87dfc3'}],'MPA (mg/L)');
 $('np-frac-value').textContent=fmt(fraction*100,0)+' %';$('np-speed-value').textContent='× '+fmt(speed);
 $('np-mat').innerHTML='<div><span>MAT₁</span><strong>'+fmt(p.a1/p.b1)+' h</strong></div><div><span>MAT₂</span><strong>'+fmt(p.a2/p.b2)+' h</strong></div>';
}
function drawFit(){
 const row=fitted()[cycle];
 $('np-fit-status').textContent=tr('Itération ','Iteration ')+cycle+' · −2LL = '+fmt(-2*row.ll);
 $('np-fit-bars').innerHTML=bars(row.weights);
}
function drawPatient(){
 const prior=fitted().at(-1).weights,obs=PATIENT.slice(0,sampleCount),post=updateWeights(prior,obs,ruv).weights,summary=summarize(post),times=Array.from({length:61},(_,i)=>i/5);
 $('np-prior').innerHTML=bars(prior);$('np-post').innerHTML=bars(post,true);
 $('np-samples-value').textContent=sampleCount+' / 4';$('np-ruv-value').textContent=fmt(ruv*100,0)+' %';
 $('np-sampling-table').innerHTML='<table class="career-table"><thead><tr><th>'+tr('Temps','Time')+'</th><th>'+tr('Concentration fictive (mg/L)','Fictional concentration (mg/L)')+'</th><th>'+tr('Utilisée','Included')+'</th></tr></thead><tbody>'+PATIENT.map((p,i)=>'<tr><td>'+fmt(p.t)+' h</td><td>'+(i<sampleCount?fmt(p.value):'—')+'</td><td>'+(i<sampleCount?tr('Oui','Yes'):tr('Non','No'))+'</td></tr>').join('')+'</tbody></table>';
 plot('np-patient',[{values:times.map(t=>({t,c:prior.reduce((s,w,i)=>s+w*prediction(i,t),0)})),color:'#a0bbcc'},{values:times.map(t=>({t,c:post.reduce((s,w,i)=>s+w*prediction(i,t),0)})),color:'#87dfc3',width:3},{values:times.map(t=>({t,c:prediction(summary.map,t)})),color:'#b7a1e8'}],'MPA (mg/L)',obs);
 $('np-auc').textContent=tr('AUC moyenne postérieure : ','Posterior mean AUC: ')+fmt(summary.aucMean)+' mg·h/L · '+tr('AUC du point MAP : ','MAP-point AUC: ')+fmt(summary.aucMap)+' mg·h/L';
}
function nav(){
 $('pmetrics-progress').textContent=done.length+' / '+STEPS.length;
 $('pmetrics-steps').replaceChildren(...STEPS.map((s,i)=>{const b=document.createElement('button');b.type='button';b.disabled=!canVisit(i,done,STEPS.length,isFree());if(i===index)b.setAttribute('aria-current','step');const n=document.createElement('span');n.className='career-step-num';n.textContent=done.includes(i)?'✓':String(i+1);const title=document.createElement('span');title.textContent=tr(...s.title);b.append(n,title);b.onclick=()=>select(i);return b;}));
 $('pmetrics-next').hidden=index===STEPS.length-1||(!done.includes(index)&&!isFree());
}
function render(){
 const s=STEPS[index];
 $('pmetrics-chapter').textContent='Pmetrics · MPA';$('pmetrics-level').textContent=tr('Étape ','Step ')+(index+1)+' / '+STEPS.length;
 $('pmetrics-title').textContent=tr(...s.title);$('pmetrics-description').textContent=tr(...s.desc);
 $('pmetrics-feedback').hidden=true;$('pmetrics-hint-text').hidden=true;$('pmetrics-hint-text').textContent=tr(...s.hint);
 $('pmetrics-workspace').innerHTML=stage()+'<section class="np-question"><h3>'+tr(...s.question)+'</h3><div class="career-choices" role="radiogroup">'+s.choices.map((q,i)=>'<label><input type="radio" name="np-answer" value="'+i+'"><span>'+tr(...q)+'</span></label>').join('')+'</div></section>';
 if(index===0){$('np-fraction').oninput=e=>{fraction=+e.target.value;drawGamma();};$('np-speed').oninput=e=>{speed=+e.target.value;drawGamma();};const restore=(s)=>{fraction=.44;speed=s;$('np-fraction').value=String(fraction);$('np-speed').value=String(speed);drawGamma();};$('np-gamma-reset').onclick=()=>restore(1);$('np-gamma-example').onclick=()=>restore(.5);drawGamma();}
 if(index===2){$('np-cycle').onclick=()=>{cycle=Math.min(20,cycle+1);drawFit();};$('np-fit').onclick=()=>{cycle=20;drawFit();};$('np-fit-reset').onclick=()=>{cycle=0;drawFit();};drawFit();}
 if(index===3){$('np-samples').oninput=e=>{sampleCount=+e.target.value;drawPatient();};$('np-ruv').oninput=e=>{ruv=+e.target.value;drawPatient();};drawPatient();}
 if(index===4)$('np-go-mipd').onclick=()=>$('mode-mipd').click();
 $('pmetrics-validate').disabled=false;
 nav();
}
function select(i){if(canVisit(i,done,STEPS.length,isFree())){index=i;render();}}
$('pmetrics-validate').onclick=()=>{
 const answer=$('pmetrics-workspace').querySelector('input[name=np-answer]:checked'),el=$('pmetrics-feedback');
 if(!answer){el.hidden=false;el.classList.remove('success','error');el.textContent=tr('Choisissez une réponse avant de valider.','Select an answer before checking.');$('pmetrics-workspace').querySelector('input[name=np-answer]')?.focus();return;}
 const correct=Number(answer.value)===STEPS[index].answer;
 el.hidden=false;el.classList.toggle('error',!correct);el.classList.toggle('success',correct);el.textContent=correct?tr(...STEPS[index].explain):tr('Réessayez : ','Try again: ')+tr(...STEPS[index].hint);
 if(correct){done=normalizeCompleted([...done,index],STEPS.length);try{localStorage.setItem(KEY,JSON.stringify(done));}catch{}nav();}
};
$('pmetrics-hint').onclick=()=>$('pmetrics-hint-text').hidden=false;
$('pmetrics-next').onclick=()=>select(isFree()?Math.min(index+1,STEPS.length-1):firstIncomplete(done,STEPS.length));
$('pmetrics-reset').onclick=()=>{if(!confirm(tr('Réinitialiser le parcours Pmetrics ?','Reset the Pmetrics pathway?')))return;done=[];try{localStorage.removeItem(KEY);}catch{}index=0;fraction=.44;speed=.5;cycle=0;sampleCount=0;ruv=.18;render();};
$('mode-pmetrics').addEventListener('click',render);
window.addEventListener('pmx-game-learning-mode',()=>{if(!canVisit(index,done,STEPS.length,isFree()))index=firstIncomplete(done,STEPS.length);if(!$('pmetrics-mode').hidden)render();});
window.addEventListener('pmx-game-language-change',()=>{if(!$('pmetrics-mode').hidden)render();});
nav();
if(new URLSearchParams(location.search).get('path')==='pmetrics')$('mode-pmetrics').click();
