(() => {
  'use strict';

  const state = { lang: 'fr', mode: 'independent2', manualMethod: false, lastResult: null };
  const $ = (id) => document.getElementById(id);
  const T = (fr, en) => state.lang === 'en' ? en : fr;

  const METHODS = {
    independent2: [
      ['welch', 'Test t de Welch', "Welch's t-test"],
      ['mannwhitney', 'Mann–Whitney', 'Mann–Whitney U']
    ],
    paired2: [
      ['pairedt', 'Test t apparié', 'Paired t-test'],
      ['wilcoxon', 'Wilcoxon signé-rang', 'Wilcoxon signed-rank']
    ],
    groups3: [
      ['anova', 'ANOVA à un facteur', 'One-way ANOVA'],
      ['kruskal', 'Kruskal–Wallis', 'Kruskal–Wallis']
    ],
    categorical: [
      ['auto', 'Automatique selon les effectifs attendus', 'Automatic from expected counts'],
      ['chisq', 'Chi-deux d’indépendance', 'Chi-square test of independence'],
      ['fisher', 'Fisher exact (2×2)', "Fisher's exact test (2×2)"]
    ],
    correlation: [
      ['pearson', 'Corrélation de Pearson', 'Pearson correlation'],
      ['spearman', 'Corrélation de Spearman', 'Spearman correlation']
    ],
    regression: [['linear', 'Régression linéaire simple', 'Simple linear regression']]
  };

  const DEMOS = {
    independent2: {
      a: '12.1\n11.8\n13.2\n12.7\n14.0\n11.9\n13.5\n12.9\n13.7\n12.4',
      b: '10.1\n9.8\n11.2\n10.4\n9.9\n10.8\n10.5\n9.7\n11.0\n10.2'
    },
    paired2: {
      a: '128\n142\n135\n151\n139\n146\n132\n155\n149\n137',
      b: '121\n136\n132\n143\n135\n139\n130\n147\n145\n134'
    },
    groups3: { text: 'Contrôle: 8.1 7.9 8.4 8.0 8.2 7.8\nDose faible: 9.0 9.4 8.8 9.2 9.1 9.5\nDose forte: 10.3 10.7 10.1 10.5 10.8 10.4' },
    categorical: { text: '42 18\n27 33' },
    correlation: {
      a: '2\n4\n5\n7\n8\n10\n12\n13\n15\n17\n18\n20',
      b: '4.1\n5.2\n6.8\n8.0\n9.3\n10.1\n12.7\n13.0\n14.9\n16.3\n17.1\n18.8'
    },
    regression: {
      a: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
      b: '3.2\n5.1\n6.7\n9.0\n10.8\n13.4\n14.1\n16.7\n19.2\n20.1'
    }
  };

  function esc(value) {
    return String(value).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function applyStaticTranslations() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-fr][data-en]').forEach((el) => {
      el.textContent = state.lang === 'en' ? el.dataset.en : el.dataset.fr;
    });
    $('langFr').classList.toggle('active', state.lang === 'fr');
    $('langEn').classList.toggle('active', state.lang === 'en');
    $('langFr').setAttribute('aria-pressed', String(state.lang === 'fr'));
    $('langEn').setAttribute('aria-pressed', String(state.lang === 'en'));
  }

  function help(fr, en) {
    return `<span class="help-wrap"><button class="help-button" type="button" aria-label="${esc(T('Aide', 'Help'))}">?</button><span class="help-tip">${esc(T(fr, en))}</span></span>`;
  }

  function configValue() {
    const el = $('shapeQuestion');
    return el ? el.value : 'no';
  }

  function recommendedMethod() {
    const q = configValue();
    if (state.mode === 'independent2') return q === 'yes' ? 'mannwhitney' : 'welch';
    if (state.mode === 'paired2') return q === 'yes' ? 'wilcoxon' : 'pairedt';
    if (state.mode === 'groups3') return q === 'yes' ? 'kruskal' : 'anova';
    if (state.mode === 'correlation') return q === 'yes' ? 'spearman' : 'pearson';
    if (state.mode === 'categorical') return 'auto';
    return 'linear';
  }

  function renderConfig() {
    const area = $('configArea');
    if (['independent2', 'paired2', 'groups3'].includes(state.mode)) {
      area.innerHTML = `<div class="field"><label for="shapeQuestion">${esc(T('Les données sont-elles très asymétriques ou dominées par des valeurs extrêmes ?', 'Are the data strongly skewed or dominated by extreme values?'))} ${help('Cette question guide le choix entre une méthode basée sur les moyennes et une méthode basée sur les rangs. Un test automatique de normalité ne doit pas, à lui seul, décider de la méthode.', 'This guides the choice between a mean-based method and a rank-based method. An automatic normality test should not, by itself, decide the method.')}</label><select id="shapeQuestion"><option value="no">${esc(T('Non / pas particulièrement', 'No / not particularly'))}</option><option value="yes">${esc(T('Oui', 'Yes'))}</option><option value="unsure">${esc(T('Je ne sais pas', 'Not sure'))}</option></select><small>${esc(T('Si vous hésitez, l’outil conserve la méthode paramétrique robuste par défaut et affiche une limite.', 'If unsure, the tool keeps the robust parametric default and displays a limitation.'))}</small></div>`;
    } else if (state.mode === 'correlation') {
      area.innerHTML = `<div class="field"><label for="shapeQuestion">${esc(T('La relation attendue est-elle approximativement linéaire, sans valeur extrême majeure ?', 'Is the expected relationship approximately linear, without major extreme values?'))} ${help('Pearson mesure surtout une relation linéaire. Spearman utilise les rangs et convient mieux à une relation monotone non linéaire ou à des données influencées par des valeurs extrêmes.', 'Pearson mainly measures linear association. Spearman uses ranks and is more suitable for monotonic non-linear relationships or data affected by extreme values.')}</label><select id="shapeQuestion"><option value="no">${esc(T('Oui', 'Yes'))}</option><option value="yes">${esc(T('Non', 'No'))}</option><option value="unsure">${esc(T('Je ne sais pas', 'Not sure'))}</option></select></div>`;
    } else if (state.mode === 'categorical') {
      area.innerHTML = `<p class="small">${esc(T('Pour un tableau 2×2, l’outil utilisera Fisher exact si les effectifs attendus sont faibles ; sinon le chi-deux. Pour un tableau plus grand, le chi-deux est utilisé.', 'For a 2×2 table, Fisher’s exact test is used when expected counts are small; otherwise chi-square is used. For larger tables, chi-square is used.'))}</p>`;
    } else {
      area.innerHTML = `<p class="small">${esc(T('La régression linéaire simple estime une pente entre une variable X et une variable Y. L’indépendance, la linéarité et le comportement des résidus restent à examiner.', 'Simple linear regression estimates a slope between X and Y. Independence, linearity and residual behaviour still need to be assessed.'))}</p>`;
    }
    const q = $('shapeQuestion');
    if (q) q.addEventListener('change', () => { state.manualMethod = false; updateMethodOptions(false); updateRecommendation(); });
  }

  function updateMethodOptions(preserve = false) {
    const select = $('methodOverride');
    const previous = preserve ? select.value : null;
    const rec = recommendedMethod();
    select.innerHTML = METHODS[state.mode].map(([value, fr, en]) => `<option value="${value}">${esc(T(fr, en))}</option>`).join('');
    if (previous && METHODS[state.mode].some((m) => m[0] === previous)) select.value = previous;
    else select.value = rec;
  }

  function methodLabel(code) {
    const found = METHODS[state.mode].find((m) => m[0] === code);
    return found ? T(found[1], found[2]) : code;
  }

  function updateRecommendation() {
    const rec = recommendedMethod();
    let why = '';
    const q = configValue();
    if (state.mode === 'independent2') why = q === 'yes'
      ? T('Les rangs sont moins sensibles aux fortes asymétries et aux valeurs extrêmes.', 'Ranks are less sensitive to strong skewness and extreme values.')
      : T('Welch compare les moyennes sans imposer l’égalité des variances et constitue un bon choix par défaut.', 'Welch compares means without requiring equal variances and is a strong default choice.');
    if (state.mode === 'paired2') why = q === 'yes'
      ? T('Wilcoxon travaille sur les rangs des différences appariées.', 'Wilcoxon works on ranks of paired differences.')
      : T('Le test t apparié travaille directement sur les différences au sein de chaque paire.', 'The paired t-test works directly on within-pair differences.');
    if (state.mode === 'groups3') why = q === 'yes'
      ? T('Kruskal–Wallis compare les distributions via les rangs.', 'Kruskal–Wallis compares distributions using ranks.')
      : T('L’ANOVA compare les moyennes de plusieurs groupes en une seule analyse globale.', 'ANOVA compares means across several groups in one global analysis.');
    if (state.mode === 'categorical') why = T('Le choix final dépendra des effectifs attendus calculés à partir du tableau.', 'The final choice depends on expected counts calculated from the table.');
    if (state.mode === 'correlation') why = q === 'yes'
      ? T('Spearman est basé sur les rangs et demande surtout une relation monotone.', 'Spearman is rank-based and mainly requires a monotonic relationship.')
      : T('Pearson résume l’intensité d’une relation linéaire.', 'Pearson summarizes the strength of a linear relationship.');
    if (state.mode === 'regression') why = T('La pente quantifie la variation moyenne de Y associée à une unité supplémentaire de X.', 'The slope quantifies the average change in Y associated with one additional unit of X.');
    $('recommendation').innerHTML = `<strong>${esc(T('Méthode proposée : ', 'Proposed method: '))}${esc(methodLabel(rec))}</strong><span>${esc(why)}</span>`;
  }

  function vectorFields(labelAFr, labelAEn, labelBFr, labelBEn) {
    return `<div class="input-grid"><div class="field"><label for="dataA">${esc(T(labelAFr, labelAEn))}</label><textarea id="dataA" placeholder="12.4\n13.1\n11.8"></textarea><small>${esc(T('Une valeur par ligne, ou séparée par espaces / points-virgules.', 'One value per line, or separated by spaces / semicolons.'))}</small></div><div class="field"><label for="dataB">${esc(T(labelBFr, labelBEn))}</label><textarea id="dataB" placeholder="10.2\n9.9\n11.0"></textarea><small>${esc(T('Les valeurs manquantes doivent être retirées ou traitées avant l’analyse.', 'Missing values should be removed or handled before analysis.'))}</small></div></div>`;
  }

  function renderDataArea() {
    const area = $('dataArea');
    if (state.mode === 'independent2') {
      area.innerHTML = vectorFields('Groupe 1', 'Group 1', 'Groupe 2', 'Group 2');
      $('dataHint').textContent = T('Deux groupes différents ; les lignes n’ont pas besoin de correspondre entre elles.', 'Two distinct groups; rows do not need to match each other.');
    } else if (state.mode === 'paired2') {
      area.innerHTML = vectorFields('Mesure 1 / avant', 'Measurement 1 / before', 'Mesure 2 / après', 'Measurement 2 / after');
      $('dataHint').textContent = T('Chaque ligne de gauche doit correspondre à la même unité que la ligne de droite.', 'Each row on the left must correspond to the same unit as the row on the right.');
    } else if (state.mode === 'groups3') {
      area.innerHTML = `<div class="field"><label for="groupData">${esc(T('Groupes et valeurs', 'Groups and values'))} ${help('Écrivez une ligne par groupe : nom du groupe, deux-points, puis les valeurs.', 'Enter one line per group: group name, colon, then the values.')}</label><textarea id="groupData" class="matrix-input" placeholder="Contrôle: 8.1 7.9 8.4\nTraitement A: 9.0 9.4 8.8\nTraitement B: 10.3 10.7 10.1"></textarea><small>${esc(T('Format : Groupe: valeur valeur valeur', 'Format: Group: value value value'))}</small></div>`;
      $('dataHint').textContent = T('Une ligne par groupe indépendant.', 'One line per independent group.');
    } else if (state.mode === 'categorical') {
      area.innerHTML = `<div class="field"><label for="matrixData">${esc(T('Tableau d’effectifs', 'Count table'))} ${help('Chaque ligne représente une modalité de la première variable ; chaque colonne une modalité de la seconde. Entrez des effectifs entiers, pas des pourcentages.', 'Each row is a category of the first variable; each column is a category of the second. Enter integer counts, not percentages.')}</label><textarea id="matrixData" class="matrix-input" placeholder="42 18\n27 33"></textarea><small>${esc(T('Exemple 2×2 : une ligne par groupe, deux colonnes pour oui / non.', '2×2 example: one row per group, two columns for yes / no.'))}</small></div>`;
      $('dataHint').textContent = T('Saisissez un tableau de contingence avec des effectifs.', 'Enter a contingency table of counts.');
    } else if (state.mode === 'correlation') {
      area.innerHTML = vectorFields('Variable X', 'Variable X', 'Variable Y', 'Variable Y');
      $('dataHint').textContent = T('Chaque ligne X doit correspondre à la même observation que la ligne Y.', 'Each X row must correspond to the same observation as the Y row.');
    } else {
      area.innerHTML = vectorFields('Variable explicative X', 'Predictor X', 'Variable à expliquer Y', 'Outcome Y');
      $('dataHint').textContent = T('Chaque ligne correspond à une observation X–Y.', 'Each row corresponds to one X–Y observation.');
    }
  }

  function setMode(mode) {
    state.mode = mode;
    state.manualMethod = false;
    state.lastResult = null;
    document.querySelectorAll('.mode-card').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    renderConfig();
    updateMethodOptions(false);
    updateRecommendation();
    renderDataArea();
    resetResult();
  }

  function resetResult() {
    $('resultArea').className = 'result-placeholder';
    $('resultArea').innerHTML = `<div><strong>${esc(T('Le résultat apparaîtra ici.', 'Your result will appear here.'))}</strong><span>${esc(T('Vous verrez l’estimation principale, l’intervalle de confiance, la p-value, la taille d’effet, les hypothèses et une interprétation en langage courant.', 'You will see the main estimate, confidence interval, p-value, effect size, assumptions and a plain-language interpretation.'))}</span></div>`;
  }

  function parseVector(text) {
    const trimmed = text.trim();
    if (!trimmed) return [];
    const values = [];
    const rough = trimmed.split(/[\s;]+/).filter(Boolean);
    for (const token of rough) {
      if (/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(token)) {
        const n = Number(token.replace(',', '.'));
        if (Number.isFinite(n)) values.push(n);
      } else if (token.includes(',')) {
        for (const bit of token.split(',')) {
          const n = Number(bit);
          if (Number.isFinite(n)) values.push(n);
        }
      } else {
        throw new Error(T(`Valeur non numérique : ${token}`, `Non-numeric value: ${token}`));
      }
    }
    return values;
  }

  function parseGroups(text) {
    const groups = [];
    for (const line of text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)) {
      const idx = line.indexOf(':');
      if (idx < 1) throw new Error(T('Chaque ligne doit contenir « Nom du groupe: valeurs ».', 'Each line must contain “Group name: values”.'));
      const label = line.slice(0, idx).trim();
      const values = parseVector(line.slice(idx + 1));
      if (values.length < 2) throw new Error(T(`Le groupe « ${label} » doit contenir au moins 2 valeurs.`, `Group “${label}” must contain at least 2 values.`));
      groups.push({ label, values });
    }
    if (groups.length < 3) throw new Error(T('Entrez au moins 3 groupes.', 'Enter at least 3 groups.'));
    return groups;
  }

  function parseMatrix(text) {
    const rows = text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).map((line) => {
      const bits = line.split(/[\s;,]+/).filter(Boolean);
      return bits.map((x) => {
        const n = Number(x);
        if (!Number.isInteger(n) || n < 0) throw new Error(T('Le tableau doit contenir uniquement des effectifs entiers positifs ou nuls.', 'The table must contain only non-negative integer counts.'));
        return n;
      });
    });
    if (rows.length < 2 || rows[0].length < 2) throw new Error(T('Le tableau doit avoir au moins 2 lignes et 2 colonnes.', 'The table must have at least 2 rows and 2 columns.'));
    const cols = rows[0].length;
    if (rows.some((r) => r.length !== cols)) throw new Error(T('Toutes les lignes doivent avoir le même nombre de colonnes.', 'All rows must have the same number of columns.'));
    if (rows.flat().reduce((a, b) => a + b, 0) === 0) throw new Error(T('Le tableau est vide.', 'The table is empty.'));
    return rows;
  }

  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const mean = (a) => sum(a) / a.length;
  function variance(a) { const m = mean(a); return a.length > 1 ? sum(a.map((x) => (x - m) ** 2)) / (a.length - 1) : NaN; }
  const sd = (a) => Math.sqrt(variance(a));
  function median(a) { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
  function quantile(a, p) { const s = [...a].sort((x, y) => x - y); if (s.length === 1) return s[0]; const h = (s.length - 1) * p; const lo = Math.floor(h); const hi = Math.ceil(h); return s[lo] + (s[hi] - s[lo]) * (h - lo); }
  function describe(a) { return { n: a.length, mean: mean(a), sd: sd(a), median: median(a), q1: quantile(a, .25), q3: quantile(a, .75), min: Math.min(...a), max: Math.max(...a) }; }

  function ranks(values) {
    const indexed = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const out = Array(values.length);
    let tieSum = 0;
    for (let i = 0; i < indexed.length;) {
      let j = i + 1;
      while (j < indexed.length && indexed[j].v === indexed[i].v) j++;
      const rank = ((i + 1) + j) / 2;
      for (let k = i; k < j; k++) out[indexed[k].i] = rank;
      const t = j - i;
      if (t > 1) tieSum += t ** 3 - t;
      i = j;
    }
    return { ranks: out, tieSum };
  }

  function erf(x) {
    const sign = x < 0 ? -1 : 1; x = Math.abs(x);
    const a1=.254829592,a2=-.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=.3275911;
    const t=1/(1+p*x); const y=1-(((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t)*Math.exp(-x*x); return sign*y;
  }
  const normalCDF = (z) => .5 * (1 + erf(z / Math.SQRT2));

  function logGamma(z) {
    const p=[.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.6150291621406,12.507343278686905,-.13857109526572012,9.984369578019571e-6,1.5056327351493116e-7];
    if (z < .5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI*z)) - logGamma(1-z);
    z -= 1; let x=p[0]; for(let i=1;i<p.length;i++) x += p[i]/(z+i); const t=z+7.5;
    return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);
  }

  function betaCF(a,b,x) {
    const MAX=200, EPS=3e-12, FPMIN=1e-300; let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;
    if(Math.abs(d)<FPMIN)d=FPMIN; d=1/d; let h=d;
    for(let m=1;m<=MAX;m++){
      const m2=2*m; let aa=m*(b-m)*x/((qam+m2)*(a+m2)); d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;d=1/d;h*=d*c;
      aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<EPS)break;
    } return h;
  }
  function regBeta(x,a,b){ if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log(1-x));return x<(a+1)/(a+b+2)?bt*betaCF(a,b,x)/a:1-bt*betaCF(b,a,1-x)/b; }
  function tCDF(t,df){ if(!Number.isFinite(t))return t>0?1:0;const x=df/(df+t*t);const ib=regBeta(x,df/2,.5);return t>=0?1-.5*ib:.5*ib; }
  function tCritical(df){ let lo=0,hi=20;for(let i=0;i<80;i++){const mid=(lo+hi)/2;if(tCDF(mid,df)<.975)lo=mid;else hi=mid;}return (lo+hi)/2; }
  function fCDF(x,d1,d2){ if(x<=0)return 0; return regBeta((d1*x)/(d1*x+d2),d1/2,d2/2); }

  function gammaP(a,x){
    if(x<=0)return 0; const EPS=1e-14, ITMAX=300, FPMIN=1e-300;
    if(x<a+1){ let ap=a,sumv=1/a,del=sumv; for(let n=1;n<=ITMAX;n++){ap++;del*=x/ap;sumv+=del;if(Math.abs(del)<Math.abs(sumv)*EPS)break;} return sumv*Math.exp(-x+a*Math.log(x)-logGamma(a)); }
    let b=x+1-a,c=1/FPMIN,d=1/b,h=d; for(let i=1;i<=ITMAX;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<FPMIN)d=FPMIN;c=b+an/c;if(Math.abs(c)<FPMIN)c=FPMIN;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<EPS)break;} return 1-Math.exp(-x+a*Math.log(x)-logGamma(a))*h;
  }
  const chiSquarePValue = (x,df) => Math.max(0,Math.min(1,1-gammaP(df/2,x/2)));

  function logChoose(n,k){ if(k<0||k>n)return -Infinity;return logGamma(n+1)-logGamma(k+1)-logGamma(n-k+1); }
  function fisherExact2x2(m){
    const [[a,b],[c,d]]=m;const r1=a+b,r2=c+d,c1=a+c,n=r1+r2;
    const minA=Math.max(0,c1-r2),maxA=Math.min(r1,c1);const logP=(x)=>logChoose(c1,x)+logChoose(n-c1,r1-x)-logChoose(n,r1);const obs=logP(a);let p=0;
    for(let x=minA;x<=maxA;x++){const lp=logP(x);if(lp<=obs+1e-12)p+=Math.exp(lp);}return Math.min(1,p);
  }

  function fmt(x,d=3){ if(!Number.isFinite(x))return '—'; const ax=Math.abs(x); if(ax!==0&&(ax>=10000||ax<.001))return x.toExponential(2); return x.toLocaleString(state.lang==='en'?'en-GB':'fr-FR',{maximumFractionDigits:d}); }
  function fmtP(p){ if(!Number.isFinite(p))return '—'; if(p<.001)return '< 0.001'; return '= '+p.toLocaleString(state.lang==='en'?'en-GB':'fr-FR',{minimumFractionDigits:3,maximumFractionDigits:3}); }
  function ciText(lo,hi){ return `[${fmt(lo)} ; ${fmt(hi)}]`; }
  function evidenceText(p){ return p<.05 ? T('Les données apportent une évidence statistique contre l’hypothèse nulle au seuil de 5 %.', 'The data provide statistical evidence against the null hypothesis at the 5% level.') : T('Les données ne fournissent pas d’évidence statistique suffisante contre l’hypothèse nulle au seuil de 5 %.', 'The data do not provide sufficient statistical evidence against the null hypothesis at the 5% level.'); }

  function descTable(rows){
    return `<div class="table-scroll"><table class="desc-table"><thead><tr><th>${esc(T('Série','Series'))}</th><th>n</th><th>${esc(T('Moyenne','Mean'))}</th><th>SD</th><th>${esc(T('Médiane','Median'))}</th><th>Q1–Q3</th><th>Min–Max</th></tr></thead><tbody>${rows.map(({label,d})=>`<tr><td>${esc(label)}</td><td>${d.n}</td><td>${fmt(d.mean)}</td><td>${fmt(d.sd)}</td><td>${fmt(d.median)}</td><td>${fmt(d.q1)}–${fmt(d.q3)}</td><td>${fmt(d.min)}–${fmt(d.max)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function validateTwo(a,b,paired=false){
    if(a.length<2||b.length<2)throw new Error(T('Chaque série doit contenir au moins 2 valeurs.', 'Each series must contain at least 2 values.'));
    if(paired&&a.length!==b.length)throw new Error(T('Pour une analyse appariée, les deux séries doivent avoir exactement le même nombre de valeurs.', 'For a paired analysis, both series must have exactly the same number of values.'));
  }

  function calcWelch(a,b){
    validateTwo(a,b); const n1=a.length,n2=b.length,m1=mean(a),m2=mean(b),v1=variance(a),v2=variance(b),diff=m1-m2;
    const se=Math.sqrt(v1/n1+v2/n2); if(se===0)throw new Error(T('La variance est nulle : le test t ne peut pas être calculé.', 'Variance is zero: the t-test cannot be computed.'));
    const df=(v1/n1+v2/n2)**2/((v1/n1)**2/(n1-1)+(v2/n2)**2/(n2-1)); const t=diff/se; const p=2*(1-tCDF(Math.abs(t),df)); const crit=tCritical(df); const lo=diff-crit*se,hi=diff+crit*se;
    const sp=Math.sqrt(((n1-1)*v1+(n2-1)*v2)/(n1+n2-2)); const d=sp?diff/sp:NaN; const J=1-3/(4*(n1+n2-2)-1); const g=J*d;
    return resultBase('welch',p,T(`La différence moyenne estimée (groupe 1 − groupe 2) est ${fmt(diff)} unités, IC95 % ${ciText(lo,hi)}.`, `The estimated mean difference (group 1 − group 2) is ${fmt(diff)} units, 95% CI ${ciText(lo,hi)}.`),[
      [T('Différence moyenne','Mean difference'),fmt(diff)],[T('IC95 %','95% CI'),ciText(lo,hi)],['p',fmtP(p)],['t',fmt(t)],['df',fmt(df,2)],[T('Hedges g','Hedges g'),fmt(g)]
    ],[
      ['ok',T('Welch n’impose pas l’égalité des variances entre les groupes.','Welch does not require equal variances across groups.')],
      [configValue()==='yes'?'warn':'ok',T('La méthode suppose que la moyenne est une cible pertinente et que les données ne sont pas dominées par quelques valeurs extrêmes.','The method assumes the mean is a meaningful target and data are not dominated by a few extreme values.')],
      ['warn',T('L’indépendance des observations vient du plan d’étude et ne peut pas être vérifiée par ce calcul.','Independence comes from study design and cannot be verified by this calculation.')]
    ],descTable([{label:T('Groupe 1','Group 1'),d:describe(a)},{label:T('Groupe 2','Group 2'),d:describe(b)}]),`t(${fmt(df,2)}) = ${fmt(t)}, p ${fmtP(p)}, Hedges g = ${fmt(g)}`);
  }

  function calcMannWhitney(a,b){
    validateTwo(a,b); const n1=a.length,n2=b.length,all=[...a,...b],rr=ranks(all),r1=sum(rr.ranks.slice(0,n1)),u1=r1-n1*(n1+1)/2,mu=n1*n2/2,N=n1+n2;
    const varU=n1*n2/12*((N+1)-rr.tieSum/(N*(N-1))); if(varU<=0)throw new Error(T('Impossible de calculer la variance du test.', 'Unable to compute the test variance.'));
    const z=(Math.abs(u1-mu)-.5)/Math.sqrt(varU); const p=2*(1-normalCDF(Math.max(0,z))); const rbc=2*u1/(n1*n2)-1; const diffs=[];for(const x of a)for(const y of b)diffs.push(x-y);const hl=median(diffs);
    return resultBase('mannwhitney',p,T(`Le décalage de localisation estimé par la médiane de toutes les différences deux-à-deux est ${fmt(hl)}.`, `The location shift estimated by the median of all pairwise differences is ${fmt(hl)}.`),[
      [T('Décalage (Hodges–Lehmann)','Shift (Hodges–Lehmann)'),fmt(hl)],['U',fmt(u1,1)],['z',fmt(z)],['p',fmtP(p)],[T('Corrélation bisérielle de rang','Rank-biserial correlation'),fmt(rbc)]
    ],[
      ['ok',T('Le calcul utilise les rangs et est moins sensible aux valeurs extrêmes que le test t.','The calculation uses ranks and is less sensitive to extreme values than the t-test.')],
      ['warn',T('Le test ne doit pas être interprété automatiquement comme un test de médianes si les formes des distributions diffèrent fortement.','The test should not automatically be interpreted as a test of medians when distribution shapes differ strongly.')],
      ['warn',T('L’indépendance des observations reste une hypothèse du plan d’étude.','Independence remains a study-design assumption.')]
    ],descTable([{label:T('Groupe 1','Group 1'),d:describe(a)},{label:T('Groupe 2','Group 2'),d:describe(b)}]),`U = ${fmt(u1,1)}, z ≈ ${fmt(z)}, p ${fmtP(p)}, rank-biserial r = ${fmt(rbc)}`);
  }

  function calcPairedT(a,b){
    validateTwo(a,b,true); const dif=a.map((x,i)=>x-b[i]),n=dif.length,m=mean(dif),s=sd(dif),se=s/Math.sqrt(n);if(se===0)throw new Error(T('Toutes les différences sont identiques : le test t apparié n’est pas défini.', 'All paired differences are identical: the paired t-test is not defined.'));
    const t=m/se,df=n-1,p=2*(1-tCDF(Math.abs(t),df)),crit=tCritical(df),lo=m-crit*se,hi=m+crit*se,dz=m/s;
    return resultBase('pairedt',p,T(`La différence moyenne appariée (mesure 1 − mesure 2) est ${fmt(m)}, IC95 % ${ciText(lo,hi)}.`, `The paired mean difference (measurement 1 − measurement 2) is ${fmt(m)}, 95% CI ${ciText(lo,hi)}.`),[
      [T('Différence moyenne','Mean difference'),fmt(m)],[T('IC95 %','95% CI'),ciText(lo,hi)],['t',fmt(t)],['df',String(df)],['p',fmtP(p)],['Cohen dz',fmt(dz)]
    ],[
      ['ok',T('L’analyse porte sur les différences au sein des paires, pas sur les deux séries séparément.','The analysis concerns within-pair differences, not the two series separately.')],
      [configValue()==='yes'?'warn':'ok',T('Les différences ne doivent pas être dominées par de fortes asymétries ou quelques valeurs extrêmes pour l’inférence t classique.','Differences should not be dominated by strong skewness or a few extreme values for classical t inference.')],
      ['warn',T('Les paires doivent être indépendantes les unes des autres.','Pairs must be independent of one another.')]
    ],descTable([{label:T('Mesure 1','Measurement 1'),d:describe(a)},{label:T('Mesure 2','Measurement 2'),d:describe(b)},{label:T('Différences','Differences'),d:describe(dif)}]),`t(${df}) = ${fmt(t)}, p ${fmtP(p)}, Cohen dz = ${fmt(dz)}`);
  }

  function calcWilcoxon(a,b){
    validateTwo(a,b,true); const dif=a.map((x,i)=>x-b[i]).filter((x)=>x!==0); if(dif.length<2)throw new Error(T('Pas assez de différences non nulles pour Wilcoxon.', 'Not enough non-zero differences for Wilcoxon.'));
    const abs=dif.map(Math.abs),rr=ranks(abs);let wp=0,wm=0;dif.forEach((d,i)=>{if(d>0)wp+=rr.ranks[i];else wm+=rr.ranks[i];});const n=dif.length,mu=n*(n+1)/4,varW=n*(n+1)*(2*n+1)/24-rr.tieSum/48;
    const z=(Math.abs(wp-mu)-.5)/Math.sqrt(varW),p=2*(1-normalCDF(Math.max(0,z))),total=n*(n+1)/2,rbc=(wp-wm)/total,hl=median(dif);
    return resultBase('wilcoxon',p,T(`La médiane des différences appariées observées est ${fmt(hl)}.`, `The median of the observed paired differences is ${fmt(hl)}.`),[
      [T('Médiane des différences','Median difference'),fmt(hl)],['W+',fmt(wp,1)],['W−',fmt(wm,1)],['z',fmt(z)],['p',fmtP(p)],[T('Effet bisériel de rang','Rank-biserial effect'),fmt(rbc)]
    ],[
      ['ok',T('Les différences nulles sont retirées puis les différences absolues sont classées par rang.','Zero differences are removed and absolute differences are ranked.')],
      ['warn',T('L’interprétation comme décalage de localisation suppose une distribution des différences raisonnablement symétrique.','Interpretation as a location shift assumes a reasonably symmetric distribution of differences.')],
      ['warn',T('Les paires doivent être indépendantes les unes des autres.','Pairs must be independent of one another.')]
    ],descTable([{label:T('Mesure 1','Measurement 1'),d:describe(a)},{label:T('Mesure 2','Measurement 2'),d:describe(b)}]),`W+ = ${fmt(wp,1)}, z ≈ ${fmt(z)}, p ${fmtP(p)}, rank-biserial r = ${fmt(rbc)}`);
  }

  function calcAnova(groups){
    const k=groups.length,N=sum(groups.map(g=>g.values.length));if(N<=k)throw new Error(T('Pas assez de données pour l’ANOVA.', 'Not enough data for ANOVA.'));
    const grand=sum(groups.map(g=>sum(g.values)))/N;let ssb=0,ssw=0;for(const g of groups){const m=mean(g.values);ssb+=g.values.length*(m-grand)**2;ssw+=sum(g.values.map(x=>(x-m)**2));}
    const df1=k-1,df2=N-k,msb=ssb/df1,msw=ssw/df2;if(msw===0)throw new Error(T('La variance intra-groupe est nulle.', 'Within-group variance is zero.'));const F=msb/msw,p=1-fCDF(F,df1,df2),eta2=ssb/(ssb+ssw);
    return resultBase('anova',p,T(`L’ANOVA teste une différence globale entre ${k} moyennes de groupes. ${evidenceText(p)}`, `ANOVA tests a global difference across ${k} group means. ${evidenceText(p)}`),[
      ['F',fmt(F)],['df',`${df1}, ${df2}`],['p',fmtP(p)],['η²',fmt(eta2)],[T('Moyenne globale','Grand mean'),fmt(grand)]
    ],[
      [configValue()==='yes'?'warn':'ok',T('L’ANOVA classique suppose des résidus approximativement normaux et des variances comparables ; elle est souvent robuste avec des groupes équilibrés.','Classical ANOVA assumes approximately normal residuals and comparable variances; it is often robust with balanced groups.')],
      ['warn',T('Un résultat global ne dit pas quels groupes diffèrent. Des comparaisons post-hoc corrigées seraient nécessaires.','A global result does not identify which groups differ. Corrected post-hoc comparisons would be needed.')],
      ['warn',T('Les observations doivent être indépendantes.','Observations must be independent.')]
    ],descTable(groups.map(g=>({label:g.label,d:describe(g.values)}))),`F(${df1}, ${df2}) = ${fmt(F)}, p ${fmtP(p)}, η² = ${fmt(eta2)}`);
  }

  function calcKruskal(groups){
    const k=groups.length,all=groups.flatMap(g=>g.values),N=all.length,rr=ranks(all);let cursor=0,Hsum=0;for(const g of groups){const R=sum(rr.ranks.slice(cursor,cursor+g.values.length));Hsum+=R*R/g.values.length;cursor+=g.values.length;}let H=12/(N*(N+1))*Hsum-3*(N+1);const C=1-rr.tieSum/(N**3-N);if(C>0)H/=C;const df=k-1,p=chiSquarePValue(H,df),eps=Math.max(0,(H-k+1)/(N-k));
    return resultBase('kruskal',p,T(`Kruskal–Wallis teste une différence globale de rangs entre ${k} groupes. ${evidenceText(p)}`, `Kruskal–Wallis tests a global rank difference across ${k} groups. ${evidenceText(p)}`),[
      ['H',fmt(H)],['df',String(df)],['p',fmtP(p)],['ε²',fmt(eps)]
    ],[
      ['ok',T('La méthode utilise les rangs et ne requiert pas la normalité des valeurs brutes.','The method uses ranks and does not require normal raw values.')],
      ['warn',T('Si les formes des distributions diffèrent fortement, le test ne se résume pas à une comparaison de médianes.','If distribution shapes differ strongly, the test is not simply a comparison of medians.')],
      ['warn',T('Un résultat global ne localise pas les différences ; des comparaisons post-hoc corrigées sont nécessaires.','A global result does not locate differences; corrected post-hoc comparisons are needed.')]
    ],descTable(groups.map(g=>({label:g.label,d:describe(g.values)}))),`H(${df}) = ${fmt(H)}, p ${fmtP(p)}, ε² = ${fmt(eps)}`);
  }

  function contingencyStats(m){
    const r=m.length,c=m[0].length,row=m.map(sum),col=Array(c).fill(0);for(let j=0;j<c;j++)col[j]=sum(m.map(x=>x[j]));const N=sum(row),expected=m.map((line,i)=>line.map((_,j)=>row[i]*col[j]/N));let chi=0;for(let i=0;i<r;i++)for(let j=0;j<c;j++){const e=expected[i][j];if(e===0)throw new Error(T('Une ligne ou colonne a un total nul.', 'A row or column has a zero total.'));chi+=(m[i][j]-e)**2/e;}const df=(r-1)*(c-1),p=chiSquarePValue(chi,df),v=Math.sqrt(chi/(N*Math.min(r-1,c-1)));return {r,c,row,col,N,expected,chi,df,p,v,minExpected:Math.min(...expected.flat())};
  }

  function calcCategorical(m,requested){
    const s=contingencyStats(m);let method=requested;if(method==='auto')method=(s.r===2&&s.c===2&&s.minExpected<5)?'fisher':'chisq';if(method==='fisher'&&(s.r!==2||s.c!==2))throw new Error(T('Fisher exact est disponible ici uniquement pour un tableau 2×2.', 'Fisher exact is available here only for a 2×2 table.'));
    let p=s.p, metrics=[]; if(method==='fisher')p=fisherExact2x2(m);metrics=[[method==='fisher'?T('p exact','Exact p'):'χ²',method==='fisher'?fmtP(p):fmt(s.chi)],...(method==='fisher'?[]:[['df',String(s.df)],['p',fmtP(p)]]),["Cramér V",fmt(s.v)],[T('Effectif total','Total N'),String(s.N)],[T('Plus petit effectif attendu','Smallest expected count'),fmt(s.minExpected,2)]];
    let extra='';let tech=method==='fisher'?`Fisher exact, p ${fmtP(p)}`:`χ²(${s.df}) = ${fmt(s.chi)}, p ${fmtP(p)}, Cramér V = ${fmt(s.v)}`;
    if(s.r===2&&s.c===2){let [[a,b],[c,d]]=m;let aa=a,bb=b,cc=c,dd=d;if([a,b,c,d].some(x=>x===0)){aa+=.5;bb+=.5;cc+=.5;dd+=.5;}const or=aa*dd/(bb*cc),seOR=Math.sqrt(1/aa+1/bb+1/cc+1/dd),orLo=Math.exp(Math.log(or)-1.96*seOR),orHi=Math.exp(Math.log(or)+1.96*seOR);const risk1=aa/(aa+bb),risk2=cc/(cc+dd),rr=risk1/risk2;const seRR=Math.sqrt(Math.max(0,1/aa-1/(aa+bb)+1/cc-1/(cc+dd))),rrLo=Math.exp(Math.log(rr)-1.96*seRR),rrHi=Math.exp(Math.log(rr)+1.96*seRR);metrics.push([T('Odds ratio','Odds ratio'),`${fmt(or)} ${ciText(orLo,orHi)}`],[T('Risque relatif','Risk ratio'),`${fmt(rr)} ${ciText(rrLo,rrHi)}`]);extra=`<p>${esc(T('Dans ce tableau 2×2, l’odds ratio compare les cotes de la première colonne entre la première et la seconde ligne. Le risque relatif compare leurs proportions.', 'In this 2×2 table, the odds ratio compares the odds of the first column between the first and second row. The risk ratio compares their proportions.'))}</p>`;}
    const methodName=method==='fisher'?T('Fisher exact','Fisher exact'):T('Chi-deux d’indépendance','Chi-square test of independence');
    return { methodCode:method, methodName, p, summary:T(`${methodName}. ${evidenceText(p)}`, `${methodName}. ${evidenceText(p)}`), metrics, assumptions:[
      [s.minExpected<5&&method==='chisq'?'warn':'ok',T(`Plus petit effectif attendu : ${fmt(s.minExpected,2)}.`, `Smallest expected count: ${fmt(s.minExpected,2)}.`)],
      ['ok',T('Les cellules contiennent des effectifs, pas des pourcentages.','Cells contain counts, not percentages.')],
      ['warn',T('Chaque observation doit contribuer à une seule cellule ; les observations répétées nécessitent une autre approche.','Each observation must contribute to one cell only; repeated observations require another approach.')]
    ], details:`<div class="table-scroll"><table class="desc-table"><tbody>${m.map((row,i)=>`<tr><th>${esc(T('Ligne','Row'))} ${i+1}</th>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${extra}`, technical:tech };
  }

  function pearsonRaw(x,y){const mx=mean(x),my=mean(y);let sxx=0,syy=0,sxy=0;for(let i=0;i<x.length;i++){const dx=x[i]-mx,dy=y[i]-my;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy;}return sxy/Math.sqrt(sxx*syy);}
  function calcCorrelation(x,y,type){
    validateTwo(x,y,true);if(x.length<4)throw new Error(T('Au moins 4 paires sont requises pour cette corrélation.', 'At least 4 pairs are required for this correlation.'));let r;if(type==='spearman'){r=pearsonRaw(ranks(x).ranks,ranks(y).ranks);}else r=pearsonRaw(x,y);if(!Number.isFinite(r))throw new Error(T('Une des variables a une variance nulle.', 'One variable has zero variance.'));r=Math.max(-1,Math.min(1,r));const n=x.length,den=Math.max(1e-15,1-r*r),t=r*Math.sqrt((n-2)/den),p=2*(1-tCDF(Math.abs(t),n-2));let lo=NaN,hi=NaN;if(n>3&&Math.abs(r)<1){const z=Math.atanh(r),se=1/Math.sqrt(n-3);lo=Math.tanh(z-1.96*se);hi=Math.tanh(z+1.96*se);}const name=type==='spearman'?T('Corrélation de Spearman','Spearman correlation'):T('Corrélation de Pearson','Pearson correlation');
    return {methodCode:type,methodName:name,p,summary:T(`${name} : coefficient ${fmt(r)}. ${evidenceText(p)}`, `${name}: coefficient ${fmt(r)}. ${evidenceText(p)}`),metrics:[[type==='spearman'?'ρ':'r',fmt(r)],[T('IC95 % approx.','Approx. 95% CI'),Number.isFinite(lo)?ciText(lo,hi):'—'],['p',fmtP(p)],['n',String(n)],['t',fmt(t)]],assumptions:[
      [type==='pearson'&&configValue()==='yes'?'warn':'ok',type==='pearson'?T('Pearson décrit une association linéaire et peut être sensible aux valeurs extrêmes.','Pearson describes linear association and can be sensitive to extreme values.'):T('Spearman décrit une association monotone à partir des rangs.','Spearman describes monotonic association using ranks.')],
      ['warn',T('Une corrélation ne démontre pas une relation causale.','Correlation does not establish causality.')],['warn',T('Les paires doivent être indépendantes entre elles.','Pairs must be independent of one another.')]
    ],details:descTable([{label:'X',d:describe(x)},{label:'Y',d:describe(y)}]),technical:`${type==='spearman'?'Spearman ρ':'Pearson r'} = ${fmt(r)}, t(${n-2}) = ${fmt(t)}, p ${fmtP(p)}`};
  }

  function calcRegression(x,y){
    validateTwo(x,y,true);const n=x.length;if(n<3)throw new Error(T('Au moins 3 observations sont nécessaires.', 'At least 3 observations are required.'));const mx=mean(x),my=mean(y);let sxx=0,sxy=0,syy=0;for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy;}if(sxx===0)throw new Error(T('X a une variance nulle.', 'X has zero variance.'));const slope=sxy/sxx,intercept=my-slope*mx;const residuals=x.map((v,i)=>y[i]-(intercept+slope*v));const sse=sum(residuals.map(e=>e*e)),mse=sse/(n-2),seSlope=Math.sqrt(mse/sxx);if(seSlope===0)throw new Error(T('Aucune variance résiduelle : l’inférence classique n’est pas définie.', 'No residual variance: classical inference is not defined.'));const t=slope/seSlope,p=2*(1-tCDF(Math.abs(t),n-2)),crit=tCritical(n-2),lo=slope-crit*seSlope,hi=slope+crit*seSlope,r2=1-sse/syy;
    return {methodCode:'linear',methodName:T('Régression linéaire simple','Simple linear regression'),p,summary:T(`Pour +1 unité de X, Y varie en moyenne de ${fmt(slope)} unité(s), IC95 % ${ciText(lo,hi)}.`, `For +1 unit of X, Y changes on average by ${fmt(slope)} unit(s), 95% CI ${ciText(lo,hi)}.`),metrics:[[T('Pente β1','Slope β1'),fmt(slope)],[T('IC95 % pente','Slope 95% CI'),ciText(lo,hi)],[T('Intercept β0','Intercept β0'),fmt(intercept)],['R²',fmt(r2)],['p',fmtP(p)],['n',String(n)]],assumptions:[
      ['warn',T('La relation moyenne entre X et Y doit être approximativement linéaire.','The mean relationship between X and Y should be approximately linear.')],['warn',T('Les résidus doivent avoir une variance raisonnablement stable et être examinés graphiquement pour une analyse complète.','Residuals should have reasonably stable variance and should be inspected graphically for a complete analysis.')],['warn',T('Les observations doivent être indépendantes ; la régression simple ne corrige pas les facteurs de confusion.','Observations must be independent; simple regression does not adjust for confounding.')]
    ],details:`${descTable([{label:'X',d:describe(x)},{label:'Y',d:describe(y)}])}<p>${esc(T('Équation estimée','Estimated equation'))}: <code>Y = ${fmt(intercept)} + ${fmt(slope)} × X</code></p>`,technical:`β1 = ${fmt(slope)} ${ciText(lo,hi)}, t(${n-2}) = ${fmt(t)}, p ${fmtP(p)}, R² = ${fmt(r2)}`};
  }

  function resultBase(methodCode,p,summary,metrics,assumptions,details,technical){return{methodCode,methodName:METHODS[state.mode].find(m=>m[0]===methodCode)?.[state.lang==='en'?2:1]||methodCode,p,summary,metrics,assumptions,details,technical};}

  function currentVectors(){ return [parseVector($('dataA').value),parseVector($('dataB').value)]; }

  function runAnalysis() {
    try {
      let result; let method=$('methodOverride').value;
      if(state.mode==='independent2'){const[a,b]=currentVectors();result=method==='mannwhitney'?calcMannWhitney(a,b):calcWelch(a,b);}
      else if(state.mode==='paired2'){const[a,b]=currentVectors();result=method==='wilcoxon'?calcWilcoxon(a,b):calcPairedT(a,b);}
      else if(state.mode==='groups3'){const g=parseGroups($('groupData').value);result=method==='kruskal'?calcKruskal(g):calcAnova(g);}
      else if(state.mode==='categorical'){result=calcCategorical(parseMatrix($('matrixData').value),method);}
      else if(state.mode==='correlation'){const[a,b]=currentVectors();result=calcCorrelation(a,b,method);}
      else {const[a,b]=currentVectors();result=calcRegression(a,b);}
      state.lastResult=result;renderResult(result);
    } catch(err){ renderError(err instanceof Error?err.message:String(err)); }
  }

  function renderResult(r){
    const pNote=evidenceText(r.p); const metricHtml=r.metrics.map(([label,value])=>`<div class="metric"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('');
    const assump=r.assumptions.map(([status,text])=>`<li><span class="assumption-status ${status==='warn'?'warn':''}"></span><span>${esc(text)}</span></li>`).join('');
    const plain=`${r.methodName}\n${r.summary}\n${r.technical}\n${T('Interprétation de p','Interpretation of p')}: ${pNote}`;
    $('resultArea').className='result-area'; $('resultArea').dataset.copyText=plain;
    $('resultArea').innerHTML=`<div class="result-head"><div><p class="eyebrow">${esc(T('Résultat','Result'))}</p><h2>${esc(r.methodName)}</h2></div><span class="result-chip">${esc(T('Analyse terminée','Analysis complete'))}</span></div><div class="result-summary"><strong>${esc(r.summary)}</strong><p>${esc(pNote)}</p></div><div class="metric-grid">${metricHtml}</div><div class="result-section"><h3>${esc(T('Données résumées','Data summary'))}</h3>${r.details}</div><div class="result-section"><h3>${esc(T('Hypothèses et limites','Assumptions and limitations'))} ${help('Ces points ne sont pas des validations automatiques. Certaines hypothèses relèvent du plan expérimental ou nécessitent des diagnostics graphiques.', 'These are not automatic validations. Some assumptions come from study design or require graphical diagnostics.')}</h3><ul class="assumption-list">${assump}<li><span class="assumption-status warn"></span><span>${esc(T('Si vous réalisez de nombreux tests en parallèle, une correction des comparaisons multiples doit être envisagée.','If you run many tests in parallel, multiple-testing correction should be considered.'))}</span></li></ul></div><div class="result-section"><h3>${esc(T('À reporter','Reporting'))}</h3><p><code>${esc(r.technical)}</code></p><p class="small">${esc(T('La p-value n’est ni la probabilité que l’hypothèse nulle soit vraie, ni une mesure de l’importance clinique de l’effet.','The p-value is neither the probability that the null hypothesis is true nor a measure of the clinical importance of the effect.'))}</p></div><div class="result-actions"><button type="button" class="secondary-button" id="copyResult">${esc(T('Copier le résumé','Copy summary'))}</button><button type="button" class="secondary-button" id="printResult">${esc(T('Imprimer / PDF','Print / PDF'))}</button><span class="copy-note" id="copyStatus"></span></div>`;
    $('copyResult').addEventListener('click',copyResult); $('printResult').addEventListener('click',()=>window.print()); attachHelpClicks();
  }

  function renderError(message){ $('resultArea').className='result-area'; $('resultArea').innerHTML=`<div class="error-box"><strong>${esc(T('Analyse impossible avec ces données.','Analysis cannot be performed with these data.'))}</strong><br>${esc(message)}</div>`; }

  async function copyResult(){const text=$('resultArea').dataset.copyText||'';try{await navigator.clipboard.writeText(text);$('copyStatus').textContent=T('Résumé copié.','Summary copied.');}catch{$('copyStatus').textContent=T('Copie automatique indisponible.','Automatic copy unavailable.');}}

  function loadDemo(){const d=DEMOS[state.mode];if('a'in d){$('dataA').value=d.a;$('dataB').value=d.b;}else if(state.mode==='groups3')$('groupData').value=d.text;else $('matrixData').value=d.text;runAnalysis();}
  function clearData(){const ids=['dataA','dataB','groupData','matrixData'];ids.forEach(id=>{const e=$(id);if(e)e.value='';});state.lastResult=null;resetResult();}

  function parseCSV(text){
    const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());if(lines.length<2)throw new Error(T('Le fichier CSV ne contient pas assez de lignes.','CSV file does not contain enough rows.'));
    const first=lines[0],sep=first.includes('\t')?'\t':(first.split(';').length>first.split(',').length?';':',');const split=(line)=>line.split(sep).map(x=>x.trim().replace(/^"|"$/g,''));return lines.map(split);
  }
  function numericCell(v){const n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null;}
  function importCSV(file){
    const reader=new FileReader();reader.onload=()=>{try{const rows=parseCSV(String(reader.result));if(state.mode==='categorical')throw new Error(T('Pour les tableaux de contingence, collez directement la matrice d’effectifs dans la zone prévue.','For contingency tables, paste the count matrix directly into the input area.'));
      if(state.mode==='groups3'){const dataRows=rows.filter(r=>r.length>=2&&numericCell(r[1])!==null);const map=new Map();for(const r of dataRows){const g=r[0]||T('Groupe','Group');const v=numericCell(r[1]);if(!map.has(g))map.set(g,[]);map.get(g).push(v);}$('groupData').value=[...map.entries()].map(([g,v])=>`${g}: ${v.join(' ')}`).join('\n');}
      else{const numericRows=rows.filter(r=>r.length>=2&&numericCell(r[0])!==null&&numericCell(r[1])!==null);if(!numericRows.length)throw new Error(T('Aucune paire numérique trouvée dans les deux premières colonnes.','No numeric pairs found in the first two columns.'));$('dataA').value=numericRows.map(r=>numericCell(r[0])).join('\n');$('dataB').value=numericRows.map(r=>numericCell(r[1])).join('\n');}
    }catch(e){renderError(e instanceof Error?e.message:String(e));}};reader.readAsText(file);
  }

  function attachHelpClicks(){document.querySelectorAll('.help-button').forEach((btn)=>{if(btn.dataset.bound)return;btn.dataset.bound='1';btn.addEventListener('click',(ev)=>{ev.stopPropagation();const wrap=btn.closest('.help-wrap');document.querySelectorAll('.help-wrap.open').forEach(x=>{if(x!==wrap)x.classList.remove('open');});wrap?.classList.toggle('open');});});}

  function setLang(lang){state.lang=lang;applyStaticTranslations();const current=$('methodOverride').value;updateMethodOptions(true);if(METHODS[state.mode].some(m=>m[0]===current))$('methodOverride').value=current;updateRecommendation();if(state.lastResult)runAnalysis();attachHelpClicks();}

  document.querySelectorAll('.mode-card').forEach((button)=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
  $('methodOverride').addEventListener('change',()=>{state.manualMethod=true;});
  $('demoBtn').addEventListener('click',loadDemo); $('clearBtn').addEventListener('click',clearData); $('runBtn').addEventListener('click',runAnalysis);
  $('csvBtn').addEventListener('click',()=>$('csvInput').click()); $('csvInput').addEventListener('change',(e)=>{const f=e.target.files?.[0];if(f)importCSV(f);e.target.value='';});
  $('langFr').addEventListener('click',()=>setLang('fr')); $('langEn').addEventListener('click',()=>setLang('en'));
  document.addEventListener('click',(ev)=>{if(!(ev.target instanceof Element)||!ev.target.closest('.help-wrap'))document.querySelectorAll('.help-wrap.open').forEach(x=>x.classList.remove('open'));});

  renderConfig(); updateMethodOptions(false); updateRecommendation(); renderDataArea(); applyStaticTranslations(); attachHelpClicks();
})();