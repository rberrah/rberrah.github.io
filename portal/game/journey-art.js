// Purpose-built, accessible pharmacokinetic journey illustration.
// The cards describe model *amounts*, not anatomy-specific organ kinetics.
const f=(v,n=1)=>Number(v).toLocaleString('fr-FR',{minimumFractionDigits:n,maximumFractionDigits:n});
const W=920;
const MODES={
  gut:{label:'ABSORPTION',subtitle:'Dépôt digestif',color:'#d5acf4',icon:'gut'},
  blood:{label:'CIRCULATION',subtitle:'Compartiment central',color:'#77e5d1',icon:'blood'},
  tissue:{label:'DISTRIBUTION',subtitle:'Échanges réversibles',color:'#f4c88e',icon:'tissue'},
  exit:{label:'ÉLIMINATION',subtitle:'Sortie depuis le central',color:'#f5a88f',icon:'exit'}
};
function organs(kind,x,y,s){
  let shapes='';
  // Original stylized organ paths, not a physiological compartment definition.
  switch(kind){
    case 'gut':
      shapes='<path d="M31 1 v15 q-21 -3 -24 19 q-3 21 18 27 q28 6 36 -20 q4 -17 -12 -24 v-17" fill="#9256bf" stroke="#e7c7fa" stroke-width="3.5"/>'+
        '<path d="M31 15 q15 4 10 20 q-2 8 -15 9" stroke="#f7dbff" stroke-width="3" fill="none"/>'+
        '<path d="M11 57 q-12 8 0 18 q12 8 26 -1 q16 -10 24 2" stroke="#d9a4f5" stroke-width="6" fill="none" stroke-linecap="round"/>';
      break;
    case 'blood':
      shapes='<path d="M35 17 C17 -5 -6 20 11 41 L35 69 L59 41 C76 20 53 -5 35 17Z" fill="#237e79" stroke="#a1ffe6" stroke-width="3.5"/>'+
        '<path d="M10 40 h15 l9 -13 l8 22 l8 -10 h13" fill="none" stroke="#e3fff5" stroke-width="3.5" stroke-linejoin="round"/>';
      break;
    case 'tissue':
      shapes='<path d="M12 2 q25 -7 45 1 q16 14 12 62 q-27 11 -57 -1 q-7 -26 0 -62Z" fill="#8b6844" stroke="#ffe0af" stroke-width="3"/>'+
        '<path d="M25 11 v46 M39 11 v46 M53 11 v46" fill="none" stroke="#f8c984" stroke-width="6" stroke-linecap="round"/>';
      break;
    case 'exit':
      shapes='<path d="M0 17 q24 -19 54 -3 q4 23 -20 37 q-24 5 -34 -13Z" fill="#b77d64" stroke="#ffd0b2" stroke-width="3"/>'+
        '<path d="M65 16 q-21 3 -16 26 q9 21 23 5 q14 -22 -7 -31Z" fill="#b67d87" stroke="#ffd0cc" stroke-width="3"/>';
  }
  return '<g aria-hidden="true" transform="translate('+x+' '+y+') scale('+s+')">'+shapes+'</g>';
}
function bubbles(amount,total,x,y,color){
  const count=Math.max(0,Math.min(8,Math.round(8*Math.sqrt(Math.max(0,amount)/Math.max(1,total)))));
  let s='';
  for(let j=0;j<count;j++){
    const ang=j*2.399963+1,rad=8+19*Math.sqrt((j+.5)/Math.max(1,count));
    s+='<circle cx="'+(x+Math.cos(ang)*rad).toFixed(1)+'" cy="'+(y+Math.sin(ang)*rad*.65).toFixed(1)+'" r="3.2" fill="'+color+'" opacity=".87"/>';
  }
  return s;
}
export function renderJourney(svg,amounts,route='oral'){
  const mobile=typeof window!=='undefined' && window.matchMedia('(max-width:650px)').matches;
  const total=Math.max(1,amounts.total);
  const active=Object.entries({gut:amounts.gut,blood:amounts.blood,tissue:amounts.tissue,exit:amounts.exit})
    .sort((a,b)=>b[1]-a[1])[0][0];
  const positions=mobile?{
    gut:[30,52,370,152], blood:[30,252,370,152], tissue:[30,452,370,152], exit:[30,660,370,152]
  }:{
    gut:[20,91,268,240],blood:[326,91,268,240],tissue:[632,91,268,240],exit:[326,385,268,120]
  };
  const dims=mobile?[430,848]:[W,534];
  svg.setAttribute('viewBox','0 0 '+dims[0]+' '+dims[1]);
  svg.setAttribute('data-layout',mobile?'portrait':'landscape');
  let image='<defs>'+
    '<filter id="journey-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity=".32"/></filter>'+
    '<marker id="journey-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#cfede4" stroke-width="2.2"/></marker>'+
    '<linearGradient id="journey-background" x2=".9" y2="1"><stop stop-color="#173e4b"/><stop offset=".6" stop-color="#0e2b35"/><stop offset="1" stop-color="#111f32"/></linearGradient>'+
    '</defs>';
  image+='<rect width="'+dims[0]+'" height="'+dims[1]+'" rx="24" fill="url(#journey-background)"/>';
  const caption=route==='oral'?'Voie orale • après une dose':'Voie IV • bolus central';
  image+='<text x="'+dims[0]/2+'" y="31" text-anchor="middle" font-size="'+(mobile?16:18)+'" font-weight="750" fill="#c7eade">'+caption+'</text>';
  // Link paths are separate from organ illustration so that flux topology is clear.
  const path=(d,color,dash='')=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="4.5" stroke-linecap="round" '+(dash?'stroke-dasharray="'+dash+'" ':'')+'marker-end="url(#journey-arrow)"/>';
  if(mobile){
    image+=path('M215 207 V238','#ddb9f1','9 7');
    image+=path('M190 408 V438','#96ead9')+path('M241 438 V408','#96ead9');
    image+='<text x="265" y="431" font-size="15" fill="#b7ded5" font-weight="750">Q</text>';
    // The long side route must start at the central, not at the tissue box.
    image+=path('M31 334 H15 V730 H28','#f5b49c');
    image+='<g transform="translate(11 640) rotate(-90)"><text font-size="14" fill="#ffceb4">CL · depuis le sang</text></g>';
  }else{
    image+=path('M292 195 H315','#ddb9f1','6 5');
    image+=path('M597 176 H623','#a5eadc')+path('M623 218 H597','#a5eadc');
    image+='<text x="610" y="159" text-anchor="middle" font-size="15" fill="#cce6df" font-weight="750">Q</text>';
    image+=path('M460 335 V373','#f5b49c');
    image+='<text x="482" y="369" font-size="15" fill="#fbd1b9" font-weight="800">CL</text>';
  }
  for(const [key,data] of Object.entries(MODES)){
    const [x,y,w,h]=positions[key],amount=Math.max(0,amounts[key]);
    const tall=h>175, selected=active===key;
    const top=y+25;
    const captionX=x+19;
    image+='<g data-stage="'+key+'" filter="url(#journey-shadow)">'+
      '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="19" fill="#163941" stroke="'+(selected?data.color:'#43646a')+'" stroke-width="'+(selected?3:1.8)+'"/>'+
      '<rect x="'+(x+12)+'" y="'+(y+12)+'" width="'+(w-24)+'" height="'+(h-24)+'" rx="12" fill="none" stroke="'+data.color+'" stroke-opacity=".10"/>'+
      '<text x="'+captionX+'" y="'+top+'" fill="'+data.color+'" font-weight="850" font-size="'+(mobile?18:16)+'" letter-spacing=".7">'+data.label+'</text>'+
      '<text x="'+captionX+'" y="'+(top+25)+'" fill="#e6f8f2" font-size="'+(mobile?17:15)+'">'+data.subtitle+'</text>';
    const isExit=key==='exit';
    const iconScale=mobile?0.85:isExit?0.78:1;
    const iconX=mobile?x+265:isExit?x+192:x+(w-74)/2;
    const iconY=mobile?y+30:isExit?y+19:y+65;
    image+=organs(data.icon,iconX,iconY,iconScale);
    if(!isExit)image+=bubbles(amount,total,iconX+32*iconScale,iconY+39*iconScale,data.color);
    const amountY=y+h-44;
    image+='<text x="'+captionX+'" y="'+amountY+'" font-weight="850" font-size="'+(mobile?24:20)+'" fill="'+data.color+'">'+f(amount,1)+' mg</text>';
    const progressX=captionX,progressY=y+h-25,progressW=w-38;
    image+='<rect x="'+progressX+'" y="'+progressY+'" width="'+progressW+'" height="9" rx="4.5" fill="#324b56"/>'+
      '<rect x="'+progressX+'" y="'+progressY+'" width="'+(progressW*Math.min(1,amount/total)).toFixed(1)+'" height="9" rx="4.5" fill="'+data.color+'"/>';
    image+='</g>';
  }
  if(mobile){
    image+='<text x="215" y="835" font-size="13" fill="#aac8c1" text-anchor="middle">Illustration PK simplifiée · compartiments ≠ organes</text>';
  }else{
    image+='<text x="20" y="523" font-size="14" fill="#abc9c1">Les quantités sont simulées : les cartes ne représentent pas des organes PBPK.</text>';
  }
  svg.innerHTML=image;
}
