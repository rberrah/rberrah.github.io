import { atTime } from './engine.js';
import { logSlope } from './academy-core.js';

export const fmt=(v,n=2)=>Number(v).toLocaleString('fr-FR',{minimumFractionDigits:n,maximumFractionDigits:n});
export function geometry(result,scale){
  const upper=Math.max(0.2,result.peak*1.16);
  const positive=result.points.filter(p=>p.c>1e-12);
  const minimum=positive.length?positive.reduce((m,p)=>Math.min(m,p.c),Infinity):0.001;
  const yHi=scale==='log'?10**Math.ceil(Math.log10(upper)):upper;
  const yLo=scale==='log'?10**Math.max(-7,Math.floor(Math.log10(minimum))-1):0;
  const x=t=>65+645*t/result.config.horizon;
  const y=c=>scale==='log'?27+260*(Math.log(yHi)-Math.log(Math.max(yLo,c)))/(Math.log(yHi)-Math.log(yLo))
    : 27+260*(1-c/yHi);
  return {x,y,yHi,yLo};
}
function marker(result,t,g,color='#ffcd96',radius=5){
  const c=atTime(result,t).c;
  return '<circle cx="'+g.x(t).toFixed(2)+'" cy="'+g.y(c).toFixed(2)+'" r="'+radius+'" fill="'+color+'" stroke="#0e3037" stroke-width="1.5"/>';
}
export function renderCurve(svg,result,quest,scale,solved,probes){
  const g=geometry(result,scale);
  let s='<rect x="65" y="27" width="645" height="260" rx="6" fill="#0b232b"/>';
  const ticks=[];
  if(scale==='log'){
    for(let e=Math.ceil(Math.log10(g.yLo));e<=Math.floor(Math.log10(g.yHi));e++)ticks.push(10**e);
  }else for(let i=0;i<=4;i++)ticks.push(g.yHi*i/4);
  ticks.slice(0,9).forEach(t=>{
    const y=g.y(t);
    const text=scale==='log'&&t<0.01?t.toExponential(0):fmt(t,t<1?2:1);
    s+='<line x1="65" x2="710" y1="'+y+'" y2="'+y+'" stroke="#2e4e55" stroke-dasharray="3 6"/>'+
      '<text x="56" y="'+(y+4)+'" fill="#a6c9c4" font-size="13" text-anchor="end">'+text+'</text>';
  });
  for(let i=0;i<=4;i++){
    const x=65+645*i/4;
    s+='<line x1="'+x+'" x2="'+x+'" y1="27" y2="287" stroke="#294b52" stroke-dasharray="2 8"/>'+
      '<text x="'+x+'" y="315" text-anchor="middle" font-size="13" fill="#b8cdc7">'+fmt(result.config.horizon*i/4,0)+' h</text>';
  }
  const step=Math.max(1,Math.ceil(result.points.length/520));let points=[];
  for(let i=0;i<result.points.length;i+=step){
    const p=result.points[i];
    if(scale==='log'&&p.c<=0){
      if(points.length>1)s+='<polyline points="'+points.join(' ')+'" fill="none" stroke="#8af2d4" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
      points=[];continue;
    }
    points.push(g.x(p.t).toFixed(2)+','+g.y(p.c).toFixed(2));
  }
  const last=result.points.at(-1);
  if((scale!=='log'||last.c>0))points.push(g.x(last.t).toFixed(2)+','+g.y(last.c).toFixed(2));
  if(points.length>1)s+='<polyline points="'+points.join(' ')+'" fill="none" stroke="#8af2d4" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
  if(quest.id==='lag'){
    const x=g.x(2);
    s+='<line x1="'+x+'" x2="'+x+'" y1="27" y2="287" stroke="#e8bc83" stroke-dasharray="5 5" stroke-width="2"/>';
    if(solved)s+='<text x="'+(x+7)+'" y="50" fill="#f4d2a0" font-size="14">Tlag : 2 h</text>';
  }
  let times=quest.markers||[];
  if(quest.id==='samples')times=solved?quest.sampleTimes:[1,1.5,2,2.5,3];
  times.forEach(t=>{
    s+=marker(result,t,g);
    if(quest.id==='slope'){
      const p=atTime(result,t);
      s+='<text x="'+(g.x(t)+8)+'" y="'+(g.y(p.c)-10)+'" fill="#ffdeb5" font-size="12">'+fmt(t,0)+'h · '+fmt(p.c,2)+'</text>';
    }
  });
  probes.forEach((t,i)=>{
    if(scale==='log'&&atTime(result,t).c<=0)return;
    s+=marker(result,t,g,i===0?'#ffb58a':'#be9cfa',7);
  });
  if(probes.length===2){
    const [a,b]=probes,ca=atTime(result,a).c,cb=atTime(result,b).c;
    if(ca>0&&cb>0)s+='<line x1="'+g.x(a)+'" y1="'+g.y(ca)+'" x2="'+g.x(b)+'" y2="'+g.y(cb)+'" stroke="#efbb8b" stroke-width="2" stroke-dasharray="5 4"/>';
  }
  s+='<rect x="65" y="27" width="645" height="260" rx="6" fill="none" stroke="#54777c"/>';
  svg.innerHTML=s;
}
export function probeTime(svg,evt,horizon){
  const matrix=svg.getScreenCTM();
  if(!matrix)return null;
  const point=svg.createSVGPoint();point.x=evt.clientX;point.y=evt.clientY;
  const p=point.matrixTransform(matrix.inverse());
  if(p.x<65||p.x>710||p.y<27||p.y>287)return null;
  return Math.max(0,Math.min(horizon,Math.round((p.x-65)/645*horizon*4)/4));
}
function particleDots(amount,total,cx,cy,fill,seed){
  const count=Math.max(0,Math.min(12,Math.round(12*Math.sqrt(Math.max(0,amount)/Math.max(1,total)))));
  let dots='';
  for(let n=0;n<count;n++){
    const angle=n*2.39996323+seed;
    const radius=22*Math.sqrt((n+.5)/Math.max(1,count));
    const x=cx+Math.cos(angle)*radius, y=cy+Math.sin(angle)*radius*.66;
    dots+='<circle cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="3.9" fill="'+fill+'" opacity=".95"/>';
  }
  return dots;
}
export function renderPhysiology(svg,result,t,quest){
  const p=atTime(result,t);
  const total=Math.max(1,quest.config.dose*(quest.config.route==='oral'?(quest.config.f??0.8):1));
  const amounts={gut:p.gut,blood:p.central,tissue:p.p1+p.p2,exit:p.eliminated};
  // A visual explanation of flux topology, NOT a PBPK map: there is no liver/renal CL split.
  const stage=(key,x,y,label,sub,fill,accent)=>{
    const amount=Math.max(0,amounts[key]);
    const fraction=Math.min(1,amount/total);
    const width=key==='exit'?226:224, height=key==='exit'?90:183;
    const bar=width-36;
    const caption=key==='exit'?'Cumul éliminé':fmt(amount,1)+' mg';
    return '<g data-stage="'+key+'"><rect x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'" rx="19" fill="'+fill+'" stroke="'+accent+'" stroke-width="2"/>'+
      '<rect x="'+(x+13)+'" y="'+(y+12)+'" width="43" height="28" rx="12" fill="'+accent+'" opacity=".23"/>'+
      '<text x="'+(x+34)+'" y="'+(y+31)+'" text-anchor="middle" font-size="14" fill="'+accent+'" font-weight="800">'+(key==='gut'?'01':key==='blood'?'02':key==='tissue'?'03':'04')+'</text>'+
      '<text x="'+(x+68)+'" y="'+(y+34)+'" font-weight="800" font-size="19" fill="#f0fcf7">'+label+'</text>'+
      '<text x="'+(x+20)+'" y="'+(y+height-49)+'" font-size="14" fill="#bcd5ce">'+sub+'</text>'+
      '<text x="'+(x+20)+'" y="'+(y+height-29)+'" font-weight="850" font-size="18" fill="'+accent+'">'+caption+'</text>'+
      '<rect x="'+(x+18)+'" y="'+(y+height-16)+'" width="'+bar+'" height="7" rx="3" fill="#365356"/>'+
      '<rect x="'+(x+18)+'" y="'+(y+height-16)+'" width="'+(bar*fraction).toFixed(2)+'" height="7" rx="3" fill="'+accent+'"/></g>';
  };
  const defs='<defs><marker id="phys-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">'+
    '<path d="M0 0 L8 4 L0 8" fill="none" stroke="#c7e8dd" stroke-width="2"/></marker>'+
    '<marker id="phys-back" markerWidth="9" markerHeight="9" refX="1" refY="4" orient="auto-start-reverse">'+
    '<path d="M8 0 L0 4 L8 8" fill="none" stroke="#c7e8dd" stroke-width="2"/></marker></defs>';
  let diagram=defs+
    '<text x="410" y="24" text-anchor="middle" font-size="15" font-weight="750" fill="#9ccbc6">'+
    (quest.config.route==='oral'?'Dose orale : entrée digestive':'Dose IV : entrée centrale')+' · animation des quantités</text>';
  if(quest.config.route==='oral'){
    diagram+=stage('gut',14,65,'INTESTIN','Dépôt absorbable','#272d46','#dfb7f4');
    diagram+='<g aria-label="Absorption vers le sang"><path d="M239 157 H291" fill="none" stroke="#d3b0ec" stroke-width="4" marker-end="url(#phys-arrow)"/>'+
      '<text x="264" y="142" font-size="13" fill="#e8ccf4" text-anchor="middle" font-weight="700">Ka</text></g>';
  }else{
    diagram+='<g data-stage="iv-dose"><rect x="14" y="102" width="226" height="105" rx="16" fill="#173b41" stroke="#6fbaba"/>'+
      '<text x="127" y="144" fill="#edfffa" text-anchor="middle" font-size="20" font-weight="800">BOLUS IV</text>'+
      '<text x="127" y="177" fill="#a4dad1" text-anchor="middle" font-size="15">Entrée directe</text></g>'+
      '<path d="M239 157 H291" fill="none" stroke="#c7e8dd" stroke-width="4" marker-end="url(#phys-arrow)"/>';
  }
  diagram+=stage('blood',298,65,'SANG','Circulation centrale','#163d42','#8eead3');
  diagram+=stage('tissue',572,65,'TISSUS','Échanges réversibles','#2c353d','#ecc88f');
  diagram+='<path d="M523 147 H561" stroke="#bcebdc" stroke-width="3.8" fill="none" marker-end="url(#phys-arrow)"/>'+
    '<path d="M561 173 H523" stroke="#bcebdc" stroke-width="3.8" fill="none" marker-end="url(#phys-arrow)"/>'+
    '<text x="542" y="131" fill="#b7d9d6" font-size="13" font-weight="750" text-anchor="middle">Q</text>';
  diagram+=stage('exit',297,292,'ÉLIMINATION','Sortie via CL','#3a332f','#f0c29e');
  diagram+='<path d="M411 250 V280" stroke="#f0c29e" stroke-width="4" fill="none" marker-end="url(#phys-arrow)"/>'+
    '<text x="437" y="277" font-size="13" font-weight="700" fill="#f0c29e">CL</text>';
  // Organ illustrations: stomach, blood drop/heart, muscle fibres, liver + kidney silhouettes.
  if(quest.config.route==='oral')
    diagram+='<g aria-hidden="true" transform="translate(90 104)"><path d="M15 0 V23 C-8 17 -8 46 6 61 C20 80 53 73 55 47 C57 29 46 25 35 28 V6" fill="#a16fc8" stroke="#e4c5f8" stroke-width="3"/>'+
      '<path d="M31 11 V38" stroke="#e4c5f8" stroke-width="4"/>'+
      particleDots(p.gut,total,27,47,'#f5d2fc',2)+'</g>';
  diagram+='<g aria-hidden="true" transform="translate(373 101)"><path d="M30 16 C14 -5 -11 20 4 40 L30 68 L56 40 C71 20 46 -5 30 16Z" fill="#48a99c" stroke="#a5ffe4" stroke-width="3"/>'+
    '<path d="M9 37 H22 L29 23 L35 46 L43 36 H54" fill="none" stroke="#d9fff3" stroke-width="2.8"/>'+
    particleDots(p.central,total,31,47,'#bffff0',3)+'</g>';
  diagram+='<g aria-hidden="true" transform="translate(658 110)">'+
    '<rect x="0" y="8" width="42" height="57" rx="13" fill="#ad8f67" stroke="#f4d9ac" stroke-width="3"/>'+
    '<path d="M11 13 V56 M23 13 V56 M35 13 V56" stroke="#f3d8ab" stroke-width="4" stroke-linecap="round"/>'+
    particleDots(p.p1+p.p2,total,22,38,'#ffe6b4',4)+'</g>';
  diagram+='<g aria-hidden="true" transform="translate(445 305)">'+
    '<path d="M0 3 Q23 -4 37 12 L33 35 Q17 42 0 23Z" fill="#c89972" stroke="#f6d1ac" stroke-width="2"/>'+
    '<path d="M43 4 Q60 1 56 22 Q49 35 40 20Z" fill="#d69a87" stroke="#f6c3b2" stroke-width="2"/></g>';
  diagram+='<text x="23" y="402" font-size="13" fill="#a8c7be">Illustration simplifiée : les compartiments ne correspondent pas à des organes ; CL n’est pas répartie entre foie et reins.</text>';
  svg.innerHTML=diagram;
  return {gut:p.gut,central:p.central,tissue:p.p1+p.p2,eliminated:p.eliminated};
}
export function probeSummary(result,probes){
  if(probes.length===0)return 'Cliquez deux fois sur la courbe pour mesurer une pente.';
  const a=probes[0],ca=atTime(result,a).c;
  if(probes.length===1)return 't = '+fmt(a,2)+' h · C = '+fmt(ca,3)+' mg/L. Sélectionnez un second point.';
  const b=probes[1],cb=atTime(result,b).c;
  if(a===b)return 'Choisissez deux instants différents.';
  if(ca<=0||cb<=0)return 'Impossible de calculer ln(C) si C = 0.';
  const slope=logSlope(result,Math.min(a,b),Math.max(a,b));
  return 'Δln(C)/Δt = '+fmt(slope,3)+' h⁻¹ entre '+fmt(Math.min(a,b),2)+' h et '+fmt(Math.max(a,b),2)+' h.'+
    (slope<0?' Demi-vie apparente locale : '+fmt(Math.log(2)/Math.abs(slope),2)+' h.':'');
}
