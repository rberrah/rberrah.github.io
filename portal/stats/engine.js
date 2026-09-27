export const EPS = 1e-12;

export function cleanNumbers(values) {
  return values.map(Number).filter(Number.isFinite);
}

export function mean(x) { return x.reduce((a,b)=>a+b,0)/x.length; }
export function variance(x) {
  if (x.length < 2) return NaN;
  const m=mean(x);
  return x.reduce((s,v)=>s+(v-m)**2,0)/(x.length-1);
}
export function sd(x) { return Math.sqrt(variance(x)); }
export function median(x) {
  const a=[...x].sort((a,b)=>a-b), n=a.length;
  return n%2 ? a[(n-1)/2] : (a[n/2-1]+a[n/2])/2;
}
export function quantile(x,q) {
  const a=[...x].sort((a,b)=>a-b);
  if(!a.length) return NaN;
  const h=(a.length-1)*q, lo=Math.floor(h), hi=Math.ceil(h);
  return lo===hi ? a[lo] : a[lo]+(h-lo)*(a[hi]-a[lo]);
}

function erf(x) {
  const sign=x<0?-1:1, ax=Math.abs(x), t=1/(1+0.3275911*ax);
  const y=1-(((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t)*Math.exp(-ax*ax);
  return sign*y;
}
export function normalCDF(x){ return 0.5*(1+erf(x/Math.SQRT2)); }

export function logGamma(z){
  const p=[0.9999999999998099,676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-0.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];
  if(z<0.5) return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);
  z-=1;
  let x=p[0];
  for(let i=1;i<p.length;i++) x+=p[i]/(z+i);
  const t=z+7.5;
  return 0.5*Math.log(2*Math.PI)+(z+0.5)*Math.log(t)-t+Math.log(x);
}

function betacf(a,b,x){
  const MAX=200, FPMIN=1e-30;
  let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;
  if(Math.abs(d)<FPMIN)d=FPMIN;
  d=1/d;
  let h=d;
  for(let m=1;m<=MAX;m++){
    const m2=2*m;
    let aa=m*(b-m)*x/((qam+m2)*(a+m2));
    d=1+aa*d; if(Math.abs(d)<FPMIN)d=FPMIN;
    c=1+aa/c; if(Math.abs(c)<FPMIN)c=FPMIN;
    d=1/d; h*=d*c;
    aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));
    d=1+aa*d; if(Math.abs(d)<FPMIN)d=FPMIN;
    c=1+aa/c; if(Math.abs(c)<FPMIN)c=FPMIN;
    d=1/d;
    const del=d*c;
    h*=del;
    if(Math.abs(del-1)<3e-10)break;
  }
  return h;
}

export function ibeta(x,a,b){
  if(x<=0)return 0;
  if(x>=1)return 1;
  const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log(1-x));
  return x<(a+1)/(a+b+2) ? bt*betacf(a,b,x)/a : 1-bt*betacf(b,a,1-x)/b;
}
export function tCDF(t,df){
  const x=df/(df+t*t), ib=ibeta(x,df/2,0.5);
  return t>=0 ? 1-0.5*ib : 0.5*ib;
}
export function tP2(t,df){ return Math.min(1,2*(1-tCDF(Math.abs(t),df))); }
export function tCritical(df,alpha=0.05){
  let lo=0,hi=20,target=1-alpha/2;
  for(let i=0;i<90;i++){
    const mid=(lo+hi)/2;
    if(tCDF(mid,df)<target)lo=mid; else hi=mid;
  }
  return (lo+hi)/2;
}

function gammaP(a,x){
  if(x<=0)return 0;
  if(x<a+1){
    let sum=1/a,del=sum,ap=a;
    for(let n=1;n<=200;n++){
      ap++; del*=x/ap; sum+=del;
      if(Math.abs(del)<Math.abs(sum)*3e-12)break;
    }
    return sum*Math.exp(-x+a*Math.log(x)-logGamma(a));
  }
  let b=x+1-a,c=1/1e-30,d=1/b,h=d;
  for(let i=1;i<=200;i++){
    const an=-i*(i-a);
    b+=2; d=an*d+b; if(Math.abs(d)<1e-30)d=1e-30;
    c=b+an/c; if(Math.abs(c)<1e-30)c=1e-30;
    d=1/d;
    const del=d*c;
    h*=del;
    if(Math.abs(del-1)<3e-12)break;
  }
  return 1-Math.exp(-x+a*Math.log(x)-logGamma(a))*h;
}
export function chiSquareSF(x,df){ return Math.max(0,Math.min(1,1-gammaP(df/2,x/2))); }
export function fCDF(x,d1,d2){
  if(x<=0)return 0;
  const z=(d1*x)/(d1*x+d2);
  return ibeta(z,d1/2,d2/2);
}

export function describe(x){
  const v=cleanNumbers(x);
  if(!v.length) throw new Error('NO_NUMERIC_DATA');
  const m=mean(v), s=sd(v), n=v.length, se=s/Math.sqrt(n), tc=n>1?tCritical(n-1):NaN;
  return {n,mean:m,sd:s,median:median(v),q1:quantile(v,.25),q3:quantile(v,.75),min:Math.min(...v),max:Math.max(...v),ci:[m-tc*se,m+tc*se]};
}

export function oneSampleT(x,mu=0){
  const v=cleanNumbers(x), n=v.length;
  if(n<2)throw new Error('N_TOO_SMALL');
  const m=mean(v),s=sd(v),se=s/Math.sqrt(n),t=(m-mu)/se,df=n-1,tc=tCritical(df);
  return {test:'one_sample_t',n,estimate:m-mu,mean:m,sd:s,t,df,p:tP2(t,df),ci:[m-mu-tc*se,m-mu+tc*se]};
}

export function welchT(a,b){
  const x=cleanNumbers(a),y=cleanNumbers(b);
  if(x.length<2||y.length<2)throw new Error('N_TOO_SMALL');
  const m1=mean(x),m2=mean(y),v1=variance(x),v2=variance(y);
  const se=Math.sqrt(v1/x.length+v2/y.length);
  const t=(m1-m2)/se;
  const df=(v1/x.length+v2/y.length)**2/((v1*v1)/(x.length*x.length*(x.length-1))+(v2*v2)/(y.length*y.length*(y.length-1)));
  const tc=tCritical(df);
  const sp=Math.sqrt(((x.length-1)*v1+(y.length-1)*v2)/(x.length+y.length-2));
  const d=(m1-m2)/sp, J=1-3/(4*(x.length+y.length)-9);
  return {test:'welch_t',n1:x.length,n2:y.length,mean1:m1,mean2:m2,estimate:m1-m2,se,t,df,p:tP2(t,df),ci:[m1-m2-tc*se,m1-m2+tc*se],hedges_g:J*d};
}

export function pairedT(a,b){
  const pairs=[];
  for(let i=0;i<Math.min(a.length,b.length);i++){
    const x=Number(a[i]),y=Number(b[i]);
    if(Number.isFinite(x)&&Number.isFinite(y))pairs.push(x-y);
  }
  if(pairs.length<2)throw new Error('N_TOO_SMALL');
  const n=pairs.length,m=mean(pairs),s=sd(pairs),se=s/Math.sqrt(n),df=n-1,t=m/se,tc=tCritical(df);
  return {test:'paired_t',n,estimate:m,t,df,p:tP2(t,df),ci:[m-tc*se,m+tc*se],dz:m/s};
}

function ranks(values){
  const indexed=values.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v);
  const r=Array(values.length),ties=[];
  let i=0;
  while(i<indexed.length){
    let j=i+1;
    while(j<indexed.length&&indexed[j].v===indexed[i].v)j++;
    const avg=(i+1+j)/2;
    for(let k=i;k<j;k++)r[indexed[k].i]=avg;
    if(j-i>1)ties.push(j-i);
    i=j;
  }
  return {ranks:r,ties};
}

function exactMannWhitneyP(n1,n2,u1){
  const N=n1+n2;
  const minRankSum=n1*(n1+1)/2;
  const maxRankSum=n1*(2*N-n1+1)/2;
  const observed=Math.round(u1+minRankSum);
  const dp=Array.from({length:n1+1},()=>new Float64Array(maxRankSum+1));
  dp[0][0]=1;
  for(let rank=1;rank<=N;rank++){
    for(let k=Math.min(n1,rank);k>=1;k--){
      for(let s=maxRankSum;s>=rank;s--) dp[k][s]+=dp[k-1][s-rank];
    }
  }
  const dist=dp[n1];
  let total=0,lower=0,upper=0;
  for(let s=minRankSum;s<=maxRankSum;s++){
    const count=dist[s];
    total+=count;
    if(s<=observed)lower+=count;
    if(s>=observed)upper+=count;
  }
  return Math.min(1,2*Math.min(lower/total,upper/total));
}

function exactWilcoxonP(n,wplus){
  const totalRank=n*(n+1)/2;
  const observed=Math.round(wplus);
  const dp=new Float64Array(totalRank+1);
  dp[0]=1;
  let reachable=0;
  for(let rank=1;rank<=n;rank++){
    reachable+=rank;
    for(let s=reachable;s>=rank;s--) dp[s]+=dp[s-rank];
  }
  const total=2**n;
  let lower=0,upper=0;
  for(let s=0;s<=totalRank;s++){
    if(s<=observed)lower+=dp[s];
    if(s>=observed)upper+=dp[s];
  }
  return Math.min(1,2*Math.min(lower/total,upper/total));
}

export function mannWhitney(a,b){
  const x=cleanNumbers(a),y=cleanNumbers(b),all=[...x,...y];
  if(!x.length||!y.length)throw new Error('N_TOO_SMALL');
  const rr=ranks(all);
  const R1=rr.ranks.slice(0,x.length).reduce((s,v)=>s+v,0);
  const U1=R1-x.length*(x.length+1)/2, U2=x.length*y.length-U1, n=all.length;
  const tieTerm=rr.ties.reduce((s,t)=>s+t**3-t,0);
  const varU=x.length*y.length/12*((n+1)-tieTerm/(n*(n-1)));
  const mu=x.length*y.length/2;
  const z=(U1-mu-Math.sign(U1-mu)*0.5)/Math.sqrt(varU);
  const exact=rr.ties.length===0 && n<=24;
  const p=exact ? exactMannWhitneyP(x.length,y.length,U1) : Math.min(1,2*(1-normalCDF(Math.abs(z))));
  return {test:'mann_whitney',n1:x.length,n2:y.length,U:Math.min(U1,U2),U1,p,z,exact,inference:exact?'exact':'asymptotic',cliffs_delta:2*U1/(x.length*y.length)-1,median1:median(x),median2:median(y)};
}

export function wilcoxonSignedRank(a,b){
  const dif=[];
  for(let i=0;i<Math.min(a.length,b.length);i++){
    const x=Number(a[i]),y=Number(b[i]);
    if(Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)>EPS)dif.push(x-y);
  }
  const n=dif.length;
  if(n<2)throw new Error('N_TOO_SMALL');
  const abs=dif.map(Math.abs),rr=ranks(abs);
  let wp=0;
  for(let i=0;i<n;i++)if(dif[i]>0)wp+=rr.ranks[i];
  const mu=n*(n+1)/4;
  const tieAdj=rr.ties.reduce((s,t)=>s+t*(t+1)*(2*t+1),0)/48;
  const varW=n*(n+1)*(2*n+1)/24-tieAdj;
  const z=(wp-mu-Math.sign(wp-mu)*0.5)/Math.sqrt(varW);
  const exact=rr.ties.length===0 && n<=25;
  const p=exact ? exactWilcoxonP(n,wp) : Math.min(1,2*(1-normalCDF(Math.abs(z))));
  return {test:'wilcoxon_signed_rank',n,Wplus:wp,z,p,exact,inference:exact?'exact':'asymptotic',median_difference:median(dif),rank_biserial:(2*wp)/(n*(n+1)/2)-1};
}

export function welchAnova(groups){
  const clean=groups.map(g=>({name:g.name,values:cleanNumbers(g.values)})).filter(g=>g.values.length>1);
  const k=clean.length;
  if(k<2)throw new Error('GROUPS_TOO_FEW');
  const stats=clean.map(g=>({name:g.name,n:g.values.length,m:mean(g.values),v:variance(g.values)}));
  if(stats.some(s=>s.v<=0))return classicalAnova(clean);
  const W=stats.reduce((s,g)=>s+g.n/g.v,0);
  const mw=stats.reduce((s,g)=>s+(g.n/g.v)*g.m,0)/W;
  const A=stats.reduce((s,g)=>s+(g.n/g.v)*(g.m-mw)**2,0)/(k-1);
  const term=stats.reduce((s,g)=>s+((1-(g.n/g.v)/W)**2)/(g.n-1),0);
  const denom=1+(2*(k-2)/(k*k-1))*term;
  const F=A/denom,df1=k-1,df2=(k*k-1)/(3*term);
  const classic=classicalAnova(clean);
  return {test:'welch_anova',k,F,df1,df2,p:1-fCDF(F,df1,df2),groups:stats,eta2:classic.eta2};
}

export function classicalAnova(groups){
  const clean=groups.map(g=>({name:g.name,values:cleanNumbers(g.values)})).filter(g=>g.values.length>0);
  const all=clean.flatMap(g=>g.values),gm=mean(all),k=clean.length;
  const ssb=clean.reduce((s,g)=>s+g.values.length*(mean(g.values)-gm)**2,0);
  const ssw=clean.reduce((s,g)=>{const m=mean(g.values);return s+g.values.reduce((q,v)=>q+(v-m)**2,0);},0);
  const df1=k-1,df2=all.length-k,F=(ssb/df1)/(ssw/df2);
  return {test:'anova',k,F,df1,df2,p:1-fCDF(F,df1,df2),eta2:ssb/(ssb+ssw),groups:clean.map(g=>({name:g.name,n:g.values.length,m:mean(g.values),v:variance(g.values)}))};
}

export function kruskalWallis(groups){
  const clean=groups.map(g=>({name:g.name,values:cleanNumbers(g.values)})).filter(g=>g.values.length>0),all=clean.flatMap(g=>g.values),rr=ranks(all),N=all.length;
  let offset=0;
  const sums=clean.map(g=>{const s=rr.ranks.slice(offset,offset+g.values.length).reduce((a,b)=>a+b,0);offset+=g.values.length;return s;});
  let H=12/(N*(N+1))*sums.reduce((s,R,i)=>s+R*R/clean[i].values.length,0)-3*(N+1);
  const tie=1-rr.ties.reduce((s,t)=>s+t**3-t,0)/(N**3-N);
  H/=tie;
  return {test:'kruskal_wallis',H,df:clean.length-1,p:chiSquareSF(H,clean.length-1),groups:clean.map(g=>({name:g.name,n:g.values.length,median:median(g.values)}))};
}

export function pearson(x,y){
  const pairs=[];
  for(let i=0;i<Math.min(x.length,y.length);i++){
    const a=Number(x[i]),b=Number(y[i]);
    if(Number.isFinite(a)&&Number.isFinite(b))pairs.push([a,b]);
  }
  const n=pairs.length;
  if(n<3)throw new Error('N_TOO_SMALL');
  const a=pairs.map(v=>v[0]),b=pairs.map(v=>v[1]),ma=mean(a),mb=mean(b);
  const sxy=pairs.reduce((s,v)=>s+(v[0]-ma)*(v[1]-mb),0),sxx=a.reduce((s,v)=>s+(v-ma)**2,0),syy=b.reduce((s,v)=>s+(v-mb)**2,0);
  const r=sxy/Math.sqrt(sxx*syy),t=r*Math.sqrt((n-2)/Math.max(EPS,1-r*r));
  const z=.5*Math.log((1+r)/(1-r)),se=1/Math.sqrt(n-3),zc=1.959963984540054;
  const ci=n>3?[Math.tanh(z-zc*se),Math.tanh(z+zc*se)]:[NaN,NaN];
  return {test:'pearson',n,r,t,df:n-2,p:tP2(t,n-2),ci};
}

export function spearman(x,y){
  const pairs=[];
  for(let i=0;i<Math.min(x.length,y.length);i++){
    const a=Number(x[i]),b=Number(y[i]);
    if(Number.isFinite(a)&&Number.isFinite(b))pairs.push([a,b]);
  }
  if(pairs.length<3)throw new Error('N_TOO_SMALL');
  const rx=ranks(pairs.map(v=>v[0])).ranks,ry=ranks(pairs.map(v=>v[1])).ranks;
  const out=pearson(rx,ry);
  return {...out,test:'spearman',rho:out.r};
}

export function linearRegression(x,y){
  const pairs=[];
  for(let i=0;i<Math.min(x.length,y.length);i++){
    const a=Number(x[i]),b=Number(y[i]);
    if(Number.isFinite(a)&&Number.isFinite(b))pairs.push([a,b]);
  }
  const n=pairs.length;
  if(n<3)throw new Error('N_TOO_SMALL');
  const xs=pairs.map(v=>v[0]),ys=pairs.map(v=>v[1]),mx=mean(xs),my=mean(ys);
  const sxx=xs.reduce((s,v)=>s+(v-mx)**2,0),sxy=pairs.reduce((s,v)=>s+(v[0]-mx)*(v[1]-my),0);
  const slope=sxy/sxx,intercept=my-slope*mx;
  const residual=pairs.map(v=>v[1]-(intercept+slope*v[0]));
  const sse=residual.reduce((s,v)=>s+v*v,0),mse=sse/(n-2),se=Math.sqrt(mse/sxx),t=slope/se,tc=tCritical(n-2),sst=ys.reduce((s,v)=>s+(v-my)**2,0);
  return {test:'linear_regression',n,slope,intercept,se,t,df:n-2,p:tP2(t,n-2),ci:[slope-tc*se,slope+tc*se],r2:1-sse/sst};
}

function contingency(rows,aKey,bKey){
  const as=[...new Set(rows.map(r=>String(r[aKey])).filter(v=>v!==''&&v!=='undefined'))],bs=[...new Set(rows.map(r=>String(r[bKey])).filter(v=>v!==''&&v!=='undefined'))];
  const table=as.map(()=>bs.map(()=>0));
  for(const r of rows){
    const i=as.indexOf(String(r[aKey])),j=bs.indexOf(String(r[bKey]));
    if(i>=0&&j>=0)table[i][j]++;
  }
  return {levelsA:as,levelsB:bs,table};
}

export function chiSquareTest(rows,aKey,bKey){
  const c=contingency(rows,aKey,bKey),R=c.table.length,C=c.table[0]?.length||0;
  if(R<2||C<2)throw new Error('GROUPS_TOO_FEW');
  const rt=c.table.map(r=>r.reduce((a,b)=>a+b,0)),ct=Array.from({length:C},(_,j)=>c.table.reduce((s,r)=>s+r[j],0)),N=rt.reduce((a,b)=>a+b,0);
  let x2=0,minExpected=Infinity;
  for(let i=0;i<R;i++)for(let j=0;j<C;j++){
    const e=rt[i]*ct[j]/N;
    minExpected=Math.min(minExpected,e);
    x2+=(c.table[i][j]-e)**2/e;
  }
  const df=(R-1)*(C-1),v=Math.sqrt(x2/(N*Math.min(R-1,C-1)));
  return {test:'chi_square',...c,N,x2,df,p:chiSquareSF(x2,df),cramers_v:v,minExpected};
}

function logChoose(n,k){return logGamma(n+1)-logGamma(k+1)-logGamma(n-k+1);}
function hypergeom(a,r1,c1,N){return Math.exp(logChoose(c1,a)+logChoose(N-c1,r1-a)-logChoose(N,r1));}

export function fisherExact2x2(table){
  if(table.length!==2||table[0].length!==2)throw new Error('NOT_2X2');
  const a=table[0][0],b=table[0][1],c=table[1][0],d=table[1][1],r1=a+b,c1=a+c,N=a+b+c+d;
  const lo=Math.max(0,r1-(N-c1)),hi=Math.min(r1,c1),pObs=hypergeom(a,r1,c1,N);
  let p=0;
  for(let x=lo;x<=hi;x++){
    const px=hypergeom(x,r1,c1,N);
    if(px<=pObs+1e-12)p+=px;
  }
  const or=(a*d)/(Math.max(EPS,b*c));
  return {test:'fisher_exact',table,N,p:Math.min(1,p),odds_ratio:or};
}

export function mcnemar(rows,beforeKey,afterKey){
  const levels=[...new Set(rows.flatMap(r=>[String(r[beforeKey]),String(r[afterKey])]).filter(v=>v!==''&&v!=='undefined'))];
  if(levels.length!==2)throw new Error('NOT_BINARY');
  let b=0,c=0,n=0;
  for(const r of rows){
    const x=String(r[beforeKey]),y=String(r[afterKey]);
    if(!levels.includes(x)||!levels.includes(y))continue;
    n++;
    if(x===levels[0]&&y===levels[1])b++;
    if(x===levels[1]&&y===levels[0])c++;
  }
  const disc=b+c;
  if(!disc)return {test:'mcnemar',n,b,c,stat:0,p:1,exact:true};
  let p;
  if(disc<25){
    const k=Math.min(b,c);
    let tail=0;
    for(let i=0;i<=k;i++)tail+=Math.exp(logChoose(disc,i)-disc*Math.log(2));
    p=Math.min(1,2*tail);
  }else{
    const stat=(Math.abs(b-c)-1)**2/disc;
    p=chiSquareSF(stat,1);
  }
  const stat=(Math.abs(b-c)-1)**2/disc;
  return {test:'mcnemar',n,b,c,stat,p,exact:disc<25};
}

export function logRank(rows,groupKey,timeKey,eventKey){
  const clean=rows.map(r=>({g:String(r[groupKey]),t:Number(r[timeKey]),e:Number(r[eventKey])})).filter(r=>r.g&&Number.isFinite(r.t)&&r.t>=0&&(r.e===0||r.e===1));
  const groups=[...new Set(clean.map(r=>r.g))];
  if(groups.length!==2)throw new Error('SURVIVAL_TWO_GROUPS');
  const eventTimes=[...new Set(clean.filter(r=>r.e===1).map(r=>r.t))].sort((a,b)=>a-b);
  let O1=0,E1=0,V=0;
  for(const t of eventTimes){
    const at=clean.filter(r=>r.t>=t),n=at.length,n1=at.filter(r=>r.g===groups[0]).length;
    const d=clean.filter(r=>r.t===t&&r.e===1).length,d1=clean.filter(r=>r.t===t&&r.e===1&&r.g===groups[0]).length;
    if(n<=1||d===0)continue;
    O1+=d1;
    E1+=d*n1/n;
    V+=n1*(n-n1)*d*(n-d)/(n*n*(n-1));
  }
  const z=(O1-E1)/Math.sqrt(Math.max(EPS,V)),x2=z*z;
  return {test:'log_rank',groups,n:clean.length,events:clean.reduce((s,r)=>s+r.e,0),x2,df:1,p:chiSquareSF(x2,1),z};
}

export function autoCategorical(rows,aKey,bKey){
  const chi=chiSquareTest(rows,aKey,bKey);
  if(chi.table.length===2&&chi.table[0].length===2&&chi.minExpected<5)
    return {...fisherExact2x2(chi.table),levelsA:chi.levelsA,levelsB:chi.levelsB,minExpected:chi.minExpected};
  return chi;
}
