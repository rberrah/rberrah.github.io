// Local preferences and same-origin links only; no external requests.
const localized=[...document.querySelectorAll('[data-fr]')].map(node=>({node,en:node.textContent,fr:node.dataset.fr}));
let stored;try{stored=localStorage.getItem('pharmacometrie-language')}catch{}
const initial=new URLSearchParams(location.search).get('lang');
function apply(lang,write=false){
  if(lang!=='fr'&&lang!=='en')lang='en';
  document.documentElement.lang=lang;
  localized.forEach(({node,en,fr})=>{node.textContent=lang==='fr'?fr:en});
  document.querySelectorAll('a[data-localized]').forEach(a=>{const url=new URL(a.getAttribute('href'),location.origin);url.searchParams.set('lang',lang);a.setAttribute('href',url.pathname+url.search)});
  document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
  document.title=lang==='fr'?'Écosystème Explain | Apprentissage scientifique interactif':'Explain ecosystem | Interactive scientific learning';
  if(write){try{localStorage.setItem('pharmacometrie-language',lang)}catch{}const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url.pathname+url.search)}
}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.lang,true)));
apply(initial==='fr'||initial==='en'?initial:stored);
