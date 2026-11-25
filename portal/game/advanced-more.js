// Additional fictional, self-contained PK missions.
// These views are not patient dose calculators; objectives are pedagogical.
import {
 LOADING_CASE, loadingChallenge, repeatedBolus,
 accumulationChallenge, fractionationChallenge, ambiguityChallenge
} from './advanced-core.js';

const num=(v,n=1)=>Number(v).toLocaleString('fr-FR',{minimumFractionDigits:n,maximumFractionDigits:n});
function elem(parent,id){return parent.querySelector('#'+id);}
function lineChart(svg,series,maxT,yMax,{line=null,axisLabel='Concentration (mg/L)'}={}){
  const x0=55,y0=28,w=615,h=204;
  let s='<rect x="'+x0+'" y="'+y0+'" width="'+w+'" height="'+h+'" rx="9" fill="#0d2530"/>';
  for(let i=0;i<=4;i++){
    const y=y0+i*h/4,x=x0+i*w/4;
    s+='<path d="M'+x0+' '+y+' H'+(x0+w)+'" stroke="#294953" stroke-dasharray="3 5"/>'+
      '<text x="'+(x0-8)+'" y="'+(y+4)+'" fill="#c2d5d0" text-anchor="end" font-size="12">'+num(yMax*(1-i/4),1)+'</text>'+
      '<text x="'+x+'" y="258" text-anchor="middle" fill="#c2d5d0" font-size="12">'+num(maxT*i/4,0)+' h</text>';
  }
  if(line!==null){
    const y=y0+h*(1-line/yMax);
    s+='<path d="M'+x0+' '+y+' H'+(x0+w)+'" stroke="#e9c78c" stroke-width="2" stroke-dasharray="7 5"/>';
  }
  for(const entry of series){
    const pts=entry.points.map(p=>(x0+w*p.t/maxT).toFixed(1)+','+(y0+h*(1-p.c/yMax)).toFixed(1));
    s+='<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+entry.color+'" stroke-width="3.5" stroke-linejoin="round"/>';
  }
  s+='<text x="56" y="17" fill="#b9ded4" font-size="13">'+axisLabel+'</text>';
  svg.innerHTML=s;
}
function controls(title,body){
  return '<div class="adv-scenario"><span class="adv-scenario-label">MISSION EXPÉRIMENTALE</span><p>'+title+'</p>'+body+'</div>';
}
function setupLoading(root,completed){
  let load=40,maintenance=80;
  root.innerHTML=controls('Deux décisions différentes : obtenir <strong>3 mg/L immédiatement après un bolus IV</strong>, puis conserver <strong>Cmoy,ss = 3 mg/L</strong> sur chaque intervalle de 12 h. V = 20 L et CL = 3 L/h (molécule fictive).',
    '<p class="advanced-small">Choisissez séparément la dose initiale et chaque dose d’entretien. L’objectif initial dépend de V ; la concentration moyenne dépend de CL.</p>')+
    '<div class="advanced-control-grid">'+
    '<label>Dose initiale <strong id="adv-load-dose-label">40 mg</strong><input id="adv-load-dose" type="range" min="20" max="180" step="2" value="40"></label>'+
    '<label>Dose toutes les 12 h <strong id="adv-maint-dose-label">80 mg</strong><input id="adv-maint-dose" type="range" min="20" max="180" step="2" value="80"></label></div>'+
    '<div class="advanced-metrics"><span>C(0+) après la dose de charge<strong id="adv-load-start"></strong></span><span>Cmoy à l’état stationnaire<strong id="adv-load-average"></strong></span></div>'+
    '<svg id="adv-load-chart" class="advanced-chart" viewBox="0 0 710 270" role="img" aria-label="Accumulation et doses de charge et entretien simulées"></svg>';
  function update(){
    const r=loadingChallenge(load,maintenance);
    elem(root,'adv-load-dose-label').textContent=num(load,0)+' mg';
    elem(root,'adv-maint-dose-label').textContent=num(maintenance,0)+' mg';
    elem(root,'adv-load-start').textContent=num(r.initial,2)+' mg/L';
    elem(root,'adv-load-average').textContent=num(r.average,2)+' mg/L';
    const pts=repeatedBolus(load,maintenance),ymax=Math.max(5,...pts.map(p=>p.c))*1.12;
    lineChart(elem(root,'adv-load-chart'),[{points:pts,color:'#8aedd5'}],48,ymax,{line:3});
  }
  elem(root,'adv-load-dose').addEventListener('input',e=>{load=+e.target.value;update();});
  elem(root,'adv-maint-dose').addEventListener('input',e=>{maintenance=+e.target.value;update();});
  update();
  return {
    check(){const r=loadingChallenge(load,maintenance);return {ok:r.ok, message:r.ok?'La dose de charge règle C(0+), la dose d’entretien règle Cmoy,ss. Ce sont deux objectifs différents.':'Comparez les deux valeurs calculées aux objectifs affichés. Ajustez indépendamment les deux doses.'};},
    reveal(){root.querySelectorAll('input').forEach(el=>el.disabled=true);}
  };
}
function setupAccumulation(root,completed){
  let cl=.75,doses=3;
  root.innerHTML=controls('Un médicament fictif est administré toutes les <strong>12 h</strong>. Le nombre de doses avant le quasi-plateau dépend de l’élimination. Sélectionnez le <strong>premier nombre de doses</strong> pour lequel l’accumulation atteint au moins 90 % de sa valeur limite.',
    '<p class="advanced-small">Le pourcentage représente la fraction du niveau post-dose à l’état stationnaire atteinte après la n-ième dose, dans un modèle 1C IV linéaire. Il ne s’agit pas d’une mesure patient.</p>')+
    '<div class="advanced-control-grid"><label>Clairance du scénario <strong id="adv-acc-cl"></strong><select id="adv-acc-select">'+
      '<option value="0.75">0,75 L/h</option><option value="1">1 L/h</option><option value="2">2 L/h</option></select></label>'+
    '<label>Nombre de doses <strong id="adv-acc-n"></strong><input id="adv-acc-doses" type="range" min="1" max="12" step="1" value="3"></label></div>'+
    '<div class="advanced-metrics"><span>Part du niveau à l’équilibre<strong id="adv-acc-pct"></strong></span><span>Demi-vie d’élimination<strong id="adv-acc-half"></strong></span></div>'+
    '<svg id="adv-acc-chart" class="advanced-chart" viewBox="0 0 710 270" role="img" aria-label="Accumulation selon le nombre de doses, avec barre du seuil pédagogique à 90 pour cent"></svg>';
  function update(){
    const r=accumulationChallenge({cl,doses});
    elem(root,'adv-acc-cl').textContent=num(cl,2)+' L/h';
    elem(root,'adv-acc-n').textContent=num(doses,0)+' doses';
    elem(root,'adv-acc-pct').textContent=num(r.fraction*100,1)+' %';
    elem(root,'adv-acc-half').textContent=num(r.halfLife,1)+' h';
    const vals=Array.from({length:12},(_,i)=>accumulationChallenge({cl,doses:i+1}).fraction);
    const cells=vals.map((v,i)=>{
      const x=59+i*52,y=232-184*v;
      const focus=i+1===doses;
      return '<rect x="'+x+'" y="'+y.toFixed(1)+'" width="34" height="'+(184*v).toFixed(1)+'" rx="5" fill="'+(focus?'#a3f4d6':'#417b82')+'"/>'+
        '<text x="'+(x+17)+'" y="251" font-size="12" fill="#d0e5dc" text-anchor="middle">'+(i+1)+'</text>';
    });
    const y=232-184*.9;
    elem(root,'adv-acc-chart').innerHTML='<rect x="45" y="25" width="632" height="207" fill="#0d2530" rx="9"/>'+
      cells.join('')+'<path d="M45 '+y+' H677" stroke="#f1c88d" stroke-width="2.2" stroke-dasharray="6 4"/>'+
      '<text x="665" y="'+(y-7)+'" font-size="13" fill="#f1cf98" text-anchor="end">90 %</text>';
  }
  elem(root,'adv-acc-select').addEventListener('change',e=>{cl=+e.target.value;update();});
  elem(root,'adv-acc-doses').addEventListener('input',e=>{doses=+e.target.value;update();});
  update();
  return {
    check(){const r=accumulationChallenge({cl,doses});return {ok:r.ok,message:r.ok?'La vitesse d’élimination fixe le délai d’accumulation : comptez en demi-vies, pas en milligrammes.':'Cherchez la première barre qui franchit le seuil. Une valeur supérieure à 90 % n’est pas suffisante si une dose antérieure franchissait déjà le seuil.'};},
    reveal(){root.querySelectorAll('input,select').forEach(el=>el.disabled=true);}
  };
}
function setupFraction(root,completed){
  let tau=12;
  root.innerHTML=controls('Un traitement fictif apporte toujours <strong>240 mg par 24 h</strong>, avec F = 1, CL = 4 L/h et V = 20 L. Modifiez la fréquence des doses pour obtenir une <strong>fluctuation Cmax/Cmin inférieure à 4</strong> tout en gardant la même AUC24.',
    '<p class="advanced-small">Les profils sont des bolus IV 1C à l’état stationnaire. Le fractionnement change les pics et les creux, sans changer l’AUC24 lorsque la dose totale quotidienne est fixe et que la PK reste linéaire.</p>')+
    '<div class="advanced-control-grid"><label>Intervalle entre administrations <select id="adv-frac-tau">'+
      '<option value="6">6 h</option><option value="8">8 h</option><option value="12" selected>12 h</option><option value="24">24 h</option></select></label>'+
    '<label>Dose résultante par prise <strong id="adv-frac-dose"></strong><p class="advanced-small">Calculée pour préserver 240 mg/jour.</p></label></div>'+
    '<div class="advanced-metrics"><span>AUC24<strong id="adv-frac-auc"></strong></span><span>Rapport pic / creux<strong id="adv-frac-ratio"></strong></span></div>'+
    '<svg id="adv-frac-chart" class="advanced-chart" viewBox="0 0 710 270" role="img" aria-label="Concentrations de deux intervalles de doses différentes avec dose quotidienne identique"></svg>'+
    '<p class="advanced-small">Profil vert : votre choix. Profil orange : référence toutes les 12 h.</p>';
  function profile(x){
    const r=fractionationChallenge(x),k=.2;
    return Array.from({length:193},(_,i)=>{
      const t=24*i/192,timeWithin=t%x;
      return {t,c:r.peak*Math.exp(-k*timeWithin)};
    });
  }
  function update(){
    const r=fractionationChallenge(tau);
    elem(root,'adv-frac-dose').textContent=num(r.dose,0)+' mg';
    elem(root,'adv-frac-auc').textContent=num(r.auc24,1)+' mg·h/L';
    elem(root,'adv-frac-ratio').textContent='×'+num(r.fluctuation,2);
    const current=profile(tau),reference=profile(12),maximum=Math.max(...current.map(p=>p.c),...reference.map(p=>p.c))*1.12;
    lineChart(elem(root,'adv-frac-chart'),[
      {points:reference,color:'#eeb887'},{points:current,color:'#93eed5'}
    ],24,maximum);
  }
  elem(root,'adv-frac-tau').addEventListener('change',e=>{tau=+e.target.value;update();});
  update();
  return {
    check(){const r=fractionationChallenge(tau);return {ok:r.ok,message:r.ok?'L’AUC24 dépend de la dose totale quotidienne et de CL ; le fractionnement peut modifier sensiblement Cmax et Cmin.':'Conservez la dose totale quotidienne (elle est recalculée automatiquement), puis comparez le rapport pic/creux des différents intervalles.'};},
    reveal(){root.querySelectorAll('input,select').forEach(el=>el.disabled=true);}
  };
}
function setupAmbiguity(root,completed){
  let f=.8,cl=6;
  root.innerHTML=controls('Deux profils après une <strong>dose orale fictive de 100 mg</strong>. Chez A, F = 0,8 et CL = 4 L/h. Chez B, F et CL sont inconnus. Trouvez des paramètres <strong>différents</strong> qui donnent exactement la même AUC∞.',
    '<p class="advanced-small">Vous ne disposez ici que de la dose et de l’AUC orale. La relation AUC∞ = F × Dose / CL ne permet d’estimer que CL/F.</p>')+
    '<div class="advanced-control-grid"><label>Biodisponibilité de B <strong id="adv-amb-f"></strong><input id="adv-amb-f-slider" type="range" min="0.2" max="1" step="0.1" value="0.8"></label>'+
    '<label>Clairance de B <strong id="adv-amb-cl"></strong><input id="adv-amb-cl-slider" type="range" min="1" max="8" step="0.5" value="6"></label></div>'+
    '<div class="advanced-metrics"><span>AUC∞ de A<strong id="adv-amb-a">20,0 mg·h/L</strong></span>'+
    '<span>AUC∞ de B<strong id="adv-amb-b"></strong></span></div>'+
    '<div class="advanced-overlap"><div><span>Patient fictif A</span><div class="advanced-bar-track"><div id="adv-amb-bar-a"></div></div></div>'+
    '<div><span>Patient fictif B</span><div class="advanced-bar-track"><div id="adv-amb-bar-b"></div></div></div></div>'+
    '<p class="advanced-small">Même AUC ≠ même clairance : une baisse simultanée de F et de CL peut conserver le même rapport F/CL. Une courbe complète ou une référence IV pourrait apporter des informations supplémentaires.</p>+
    '<p class="advanced-small" id="adv-amb-map">L’estimation individuelle par MAP-BE reprend cette démarche de façon automatisée et méthodique : elle recherche les paramètres qui expliquent le mieux les concentrations mesurées tout en tenant compte de leur plausibilité a priori. Le compromis dépend de la variabilité interindividuelle (IIV) et de l’erreur résiduelle (RUV). Le prior aide à départager des solutions compatibles avec les données, sans rendre F et CL séparément identifiables à partir de la seule AUC.</p>';
  function update(){
    const r=ambiguityChallenge(f,cl);
    elem(root,'adv-amb-f').textContent=num(f,1);
    elem(root,'adv-amb-cl').textContent=num(cl,1)+' L/h';
    elem(root,'adv-amb-b').textContent=num(r.auc,1)+' mg·h/L';
    elem(root,'adv-amb-bar-a').style.width='50%';
    elem(root,'adv-amb-bar-b').style.width=Math.min(100,50*r.auc/r.baseline.auc)+'%';
  }
  elem(root,'adv-amb-f-slider').addEventListener('input',e=>{f=+e.target.value;update();});
  elem(root,'adv-amb-cl-slider').addEventListener('input',e=>{cl=+e.target.value;update();});
  update();
  return {
    check(){const r=ambiguityChallenge(f,cl);return {ok:r.ok,message:r.ok?'Bravo : une exposition orale identique peut correspondre à deux couples F et CL différents. Seul CL/F est identifiable à partir de la dose et de l’AUC.':'Recherchez une AUC identique avec F et CL toutes deux différentes des valeurs de A : ce n’est pas suffisant de conserver exactement le même couple.'};},
    reveal(){root.querySelectorAll('input').forEach(el=>el.disabled=true);}
  };
}
export function setupExtended(id,root,completed){
  if(id==='loading')return setupLoading(root,completed);
  if(id==='accumulation')return setupAccumulation(root,completed);
  if(id==='fraction')return setupFraction(root,completed);
  if(id==='ambiguity')return setupAmbiguity(root,completed);
  throw new RangeError('Unknown advanced exercise');
}
