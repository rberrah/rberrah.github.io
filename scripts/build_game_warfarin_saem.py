#!/usr/bin/env python3
"""Reproduce PMx Game's archived synthetic warfarin-like SAEM example.

Requires numpy and scipy. DOES NOT fit a real clinical warfarin dataset.
Generalized pedagogical SAEM: conditional Metropolis draws for log(CL) ETAs,
stochastic approximation of variance sufficient statistics, a numerical
conditional M-step for structural parameters, and 1D marginal quadrature.
Not a substitute for validated implementations in Monolix/nlmixr2.

Usage:
  OPENBLAS_NUM_THREADS=1 python scripts/build_game_warfarin_saem.py /tmp/result.json
The browser includes a compact read-only extraction in portal/game/saem-replay.js.
"""
import sys, json
import numpy as np
from scipy.optimize import minimize
from scipy.special import logsumexp
from numpy.polynomial.legendre import leggauss

SEED=20261123
rng=np.random.default_rng(SEED)
N=28
TIMES=np.array([1.5,2.5,4,6,9,12,18,24,36,48,72,96,144,168.],float)
MODELS={
 'one':{'names':['CL','V','Ka'],'initial':[.25,12,.7],
        'bounds':[(.05,.7),(5,22),(.15,3)]},
 'lag':{'names':['CL','V','Ka','Tlag'],'initial':[.25,12,.7,.3],
        'bounds':[(.05,.7),(5,22),(.15,3),(0,1.3)]},
 'two':{'names':['CL','Vc','Ka','Q','Vp'],'initial':[.25,8,.7,.25,6],
        'bounds':[(.05,.7),(3,22),(.15,3),(.05,1.5),(2,40)]}
}

def concentration(time,dose,pars,eta,kind):
    """Analytic oral 1C/2C in mg/L; lognormal IIV solely on CL."""
    time=np.asarray(time,dtype=float)
    t=np.maximum(0,time-(pars[3] if kind=='lag' else 0.))
    cl=pars[0]*np.exp(eta);v=pars[1];ka=pars[2]
    if kind=='two':
        q,vp=pars[3],pars[4]
        k10=cl/v;k12=q/v;k21=q/vp;sm=k10+k12+k21
        disc=np.sqrt(np.maximum(1e-15,sm*sm-4*k10*k21))
        alpha=(sm+disc)/2;beta=(sm-disc)/2
        a=(alpha-k21)/(alpha-beta)
        b=(k21-beta)/(alpha-beta)
        def conv(k):
            d=ka-k
            return np.exp(-k*t)*(-np.expm1(-d*t))/np.where(np.abs(d)<1e-8,1.,d)
        y=dose*ka/v*(a*conv(alpha)+b*conv(beta))
    else:
        k=cl/v;d=ka-k
        y=dose*ka/v*np.exp(-k*t)*(-np.expm1(-d*t))/np.where(np.abs(d)<1e-8,1.,d)
    return np.maximum(y,1e-8)

# All data entirely synthetic. One oral 1C + lag generator. This choice
# is deliberately hidden from the game until the epistemic analysis ends.
WTS=rng.uniform(55,95,N)
DOSES=WTS*1.5
TRUE=[.19,9.5,1.05,.72]
E_TRUE=rng.normal(0,.26,N)
TIME_ROWS=[];OBS=[]
for i in range(N):
    times=TIMES[(np.arange(len(TIMES))+i)%5!=0]
    times=times[(times>6)|(rng.random(len(times))<.68)]
    y=concentration(times,DOSES[i],TRUE,E_TRUE[i],'lag')
    y*=np.exp(rng.normal(0,.11,len(times)))
    TIME_ROWS.extend((i,float(t)) for t in times)
    OBS.extend(float(v) for v in y)
SUBJECT=np.array([x[0] for x in TIME_ROWS],int)
TIME=np.array([x[1] for x in TIME_ROWS])
OBS=np.array(OBS)
LOGOBS=np.log(OBS)
DOSE_OBS=DOSES[SUBJECT]

def predict(kind,params,eta):
    return np.log(concentration(TIME,DOSE_OBS,params,eta[SUBJECT],kind))

def complete(kind,params,eta,sigma):
    return .5*np.sum(((LOGOBS-predict(kind,params,eta))/sigma)**2)

def fit(kind,seed):
    local=np.random.default_rng(seed)
    spec=MODELS[kind];theta=np.array(spec['initial'],float)
    eta=np.zeros(N);omega=.3;sigma=.18
    sufficient_eta2=omega**2;sufficient_sse=sigma**2
    trace=[];accept=0
    for k in range(170):
        for _ in range(5):
            candidate=eta+local.normal(0,.065,N)
            old=LOGOBS-predict(kind,theta,eta)
            new=LOGOBS-predict(kind,theta,candidate)
            oldll=np.bincount(SUBJECT,weights=old*old,minlength=N)/(2*sigma*sigma)+eta**2/(2*omega*omega)
            newll=np.bincount(SUBJECT,weights=new*new,minlength=N)/(2*sigma*sigma)+candidate**2/(2*omega*omega)
            keep=np.log(local.random(N)) < oldll-newll
            eta=np.where(keep,candidate,eta)
            accept+=int(keep.sum())
        gamma=1. if k<40 else (k-39)**(-.65)
        sufficient_eta2=(1-gamma)*sufficient_eta2+gamma*np.mean(eta**2)
        omega=float(np.clip(np.sqrt(max(sufficient_eta2,1e-8)),.06,.7))
        result=minimize(lambda p: complete(kind,p,eta,sigma),theta,
                        method='L-BFGS-B',bounds=spec['bounds'],
                        options={'maxiter':55,'ftol':1e-9})
        alpha=.16 if k<40 else .08
        theta=(1-alpha)*theta+alpha*result.x
        residual=LOGOBS-predict(kind,theta,eta)
        sufficient_sse=(1-gamma)*sufficient_sse+gamma*np.mean(residual**2)
        sigma=float(np.clip(np.sqrt(max(sufficient_sse,1e-9)),.055,.3))
        if k in (0,9,19,39,59,79,109,139,169):
            trace.append({'iteration':k+1,
              'theta':dict(zip(spec['names'],[round(float(v),4) for v in theta])),
              'omegaCL':round(omega,4),'sigmaLog':round(sigma,4),
              'conditionalSse':round(float(np.mean(residual**2)),4)})
    # 161-node *marginal* quadrature; a 21-node Gaussian-Hermite rule
    # gives materially biased likelihoods for this narrow posterior.
    nodes,weights=leggauss(161);nodes=nodes*1.8;weights=weights*1.8
    marginal=[]
    for i in range(N):
        mask=SUBJECT==i;t=TIME[mask];y=LOGOBS[mask];dose=DOSES[i]
        logc=np.array([np.log(concentration(t,dose,theta,x,kind)) for x in nodes])
        logy=np.sum(-.5*((y[None,:]-logc)/sigma)**2 - np.log(sigma*np.sqrt(2*np.pi)),axis=1)
        logprior=-.5*(nodes/omega)**2 - np.log(omega*np.sqrt(2*np.pi))
        marginal.append(float(logsumexp(logy+np.log(weights)+logprior)))
    neg2ll=-2*sum(marginal);npar=len(theta)+2
    bic=neg2ll+npar*np.log(len(OBS))
    eb=[]
    for i in range(N):
        sel=SUBJECT==i
        def loss(v):
            pred=np.log(concentration(TIME[sel],DOSES[i],theta,float(v[0]),kind))
            return .5*np.sum(((LOGOBS[sel]-pred)/sigma)**2)+.5*(v[0]/omega)**2
        opt=minimize(loss,[0.],method='L-BFGS-B',bounds=[(-1.7,1.7)])
        eb.append(float(opt.x[0]))
    rmse=float(np.sqrt(np.mean((np.exp(predict(kind,theta,np.array(eb)))-OBS)**2)))
    # Quantile overlay, NOT a simulation-based confidence band.
    vr=np.random.default_rng(seed+5000);vpc=[]
    for tt in np.unique(TIME):
        indices=np.where(TIME==tt)[0]
        if len(indices)<5:continue
        ids=SUBJECT[indices];observed=OBS[indices];dose=DOSES[ids];sim=[]
        for _ in range(120):
            latent=vr.normal(0,omega,len(ids))
            sims=concentration(np.full(len(ids),tt),dose,theta,latent,kind)
            sims*=np.exp(vr.normal(0,sigma,len(ids)))
            sim.extend(float(v) for v in sims)
        vpc.append({'t':round(float(tt),2),'n':int(len(observed)),
                    'observed':[round(float(v),3) for v in np.quantile(observed,[.1,.5,.9])],
                    'simulated':[round(float(v),3) for v in np.quantile(sim,[.1,.5,.9])]})
    return {
      'id':kind,'model':spec['names'],
      'estimates':{**dict(zip(spec['names'],[round(float(v),4) for v in theta])),
                   'omegaCL':round(omega,4),'sigmaLog':round(sigma,4)},
      'nParameters':npar,'neg2llQuadrature':round(neg2ll,2),
      'bicApprox':round(bic,2),'rmseEBE':round(rmse,3),
      'acceptance':round(accept/(170*5*N),3),'trace':trace,
      'individualPredictions':[{'id':int(i+1),'etaCL':round(eb[i],3)} for i in range(N)],
      'vpc':vpc
    }

def main():
    fits={kind:fit(kind,SEED+100+j) for j,kind in enumerate(MODELS)}
    obs=[{'id':int(i+1),'time':round(float(t),2),
          'dose':round(float(DOSES[i]),2),'conc':round(float(y),3)}
          for i,t,y in zip(SUBJECT,TIME,OBS)]
    payload={'schema':'pmx-game-recorded-mixed-effects-v1',
      'provenance':{'seed':SEED,'kind':'synthetic','nIndividuals':N,
                    'nObservations':len(OBS),'algorithm':'generalized SAEM teaching implementation'},
      'subjects':[{'id':i+1,'weight':round(float(WTS[i]),1),
                   'dose':round(float(DOSES[i]),2)} for i in range(N)],
      'observations':obs,'fits':fits}
    out=sys.argv[1] if len(sys.argv)>1 else '/tmp/pmx-game-warfarin-saem.json'
    with open(out,'w',encoding='utf8') as fd:json.dump(payload,fd,separators=(',',':'),ensure_ascii=False)
    for key,v in fits.items():print(key,v['estimates'],'BIC',v['bicApprox'])
    print('Saved',out)

if __name__=='__main__':main()
