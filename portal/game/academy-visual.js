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
function sparkles(amount,total,x,y,r,color,seed){
  const n=Math.min(20,Math.floor(20*Math.sqrt(amount/total)));
  let result='';
  for(let i=0;i<n;i++){
    const a=i*2.399+seed,rr=r*Math.sqrt((i+.5)/Math.max(1,n));
    result+='<circle cx="'+(x+rr*Math.cos(a)).toFixed(1)+'" cy="'+(y+rr*.8*Math.sin(a)).toFixed(1)+'" r="3.3" fill="'+color+'" opacity=".9"/>';
  }
  return result;
}
export function renderPhysiology(svg,result,t,quest){
  const p=atTime(result,t),effectiveDose=quest.config.dose*(quest.config.route==='oral'?(quest.config.f??0.8):1);
  const total=Math.max(1,effectiveDose);
  const silhouette='<defs><linearGradient id="human" x1="0" x2="1"><stop stop-color="#193943"/><stop offset=".5" stop-color="#2b525a"/><stop offset="1" stop-color="#1d404b"/></linearGradient></defs>'+
    '<g fill="url(#human)" stroke="#71949a" stroke-width="1.8">'+
    '<ellipse cx="174" cy="52" rx="38" ry="42"/>'+
    '<path d="M146 91 L143 108 Q118 108 96 133 L80 190 L65 246 Q62 264 76 266 L91 263 L116 197 L127 189 L126 257 L140 330 Q149 345 160 331 L171 261 L182 261 L195 332 Q210 342 216 331 L227 259 L225 189 L238 196 L258 266 L272 262 Q283 257 277 241 L268 187 L251 132 Q230 108 204 108 L200 91 Z"/>'+
    '</g><path d="M173 112 V243 M173 138 L146 179 M173 172 L203 188" stroke="#52b9cc" stroke-width="8" opacity=".75" stroke-linecap="round" fill="none"/>'+
    '<path d="M178 120 L167 150 M170 170 L151 201" stroke="#eb9c89" stroke-width="4" stroke-linecap="round" fill="none"/>'+
    '<path d="M140 135 Q130 152 142 163 Q157 168 162 142 Q147 130 140 135" fill="#d88d83" stroke="#ffbcb0" stroke-width="2"/>'+
    '<path d="M184 141 Q210 133 225 149 L221 166 Q198 173 183 161 Z" fill="#bc9b62" stroke="#ffd29a" stroke-width="2"/>'+
    '<path d="M156 176 Q141 185 147 198 Q157 205 145 221 Q161 231 156 240 Q192 235 194 217 Q179 205 195 191 Q180 178 187 174 Z" fill="#976d9c" stroke="#d0b2de" stroke-width="2"/>'+
    '<path d="M128 203 Q121 211 128 228 Q137 233 142 218 L140 201 Z M209 201 Q202 217 207 226 Q218 234 224 221 L220 203 Z" fill="#b88580" stroke="#ffc7bd" stroke-width="2"/>';
  const labels='<g font-size="12" font-weight="750" fill="#e2f8f1"><text x="16" y="136">SANG</text>'+
    '<path d="M64 133 H142" stroke="#8cc8d0"/><text x="260" y="152">FOIE</text><path d="M226 151 H256" stroke="#e4c396"/>'+
    '<text x="13" y="223">INTESTIN</text><path d="M77 221 H145" stroke="#cba4dd"/>'+
    '<text x="259" y="220">REINS</text><path d="M226 218 H257" stroke="#dcb0ac"/>'+
    '</g><text x="175" y="18" text-anchor="middle" fill="#9cb7b5" font-size="11">Illustration conceptuelle · non PBPK</text>'+
    '<text x="175" y="360" text-anchor="middle" fill="#a6d3cc" font-size="11">Distribution : compartiments ≠ organes</text>';
  const molecules=sparkles(p.gut,total,170,199,23,'#e0b6f4',2)+
    sparkles(p.central,total,174,146,22,'#92ffe4',5)+
    sparkles(p.p1+p.p2,total,176,302,29,'#ffe3ab',8);
  svg.innerHTML=silhouette+labels+molecules;
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
