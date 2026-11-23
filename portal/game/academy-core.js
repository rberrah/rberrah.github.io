// PMx Game Academy: authored, deterministic and scientifically bounded quests.
// Dataset is synthetic: the generating configuration is NEVER a patient estimate.
import { DEFAULTS, simulate, atTime } from './engine.js';

export const QUESTS = Object.freeze([
  {
    id:'voyage', chapter:'Prologue', title:'Le premier voyage', tag:'Tutoriel',
    summary:'Observez les entrées, les échanges réversibles et la sortie.',
    config:{model:2,route:'oral',dose:100,cl:5,vc:25,q1:7,vp1:35,ka:1.3,horizon:24},
    scale:'linear', focus:'gut', xp:40,
    question:'Le médicament a déjà atteint le sang. Quel échange peut encore se produire dans ce modèle ?',
    options:[
      'Un retour depuis les tissus vers l’intestin',
      'Un retour depuis les tissus vers la circulation',
      'Un retour depuis la quantité déjà éliminée'
    ],
    answer:1,
    hint:'Suivez les flèches dans les deux sens entre la circulation et les tissus. Distinguez une voie réversible d’une sortie définitive.',
    explanation:'Après la prise orale, la fraction biodisponible rejoint le dépôt d’absorption, puis le compartiment central. Les échanges périphériques sont réversibles, tandis que l’élimination est modélisée depuis le central. Ces compartiments ne sont pas des organes anatomiques.',
    learning:'Observer la concentration et les quantités, sans confondre schéma physiologique et modèle PK.'
  },
  {
    id:'mono',chapter:'Chapitre I · Lire',title:'La ligne qui se redresse',tag:'Échelle semi-log',
    summary:'Découvrez ce que révèle l’échelle semi-logarithmique.',
    config:{model:1,route:'iv',dose:100,cl:4,vc:20,horizon:24},
    scale:'linear',focus:'blood',xp:70,
    question:'Après un bolus IV, toute la décroissance observée forme une droite en semi-log. Quelle hypothèse tester en premier ?',
    options:['1 compartiment, élimination du premier ordre','3 compartiments obligatoires','Absorption avec temps de latence'],
    answer:0,
    hint:'Passez de « Linéaire » à « Semi-log » et examinez la pente pendant tout le suivi.',
    explanation:'Dans ce scénario IV 1C linéaire, C(t) est une exponentielle. Son logarithme est affine en fonction du temps. Une droite est compatible avec 1C sur la fenêtre observée ; elle ne prouve pas l’absence d’une phase rapide non échantillonnée.',
    learning:'Une courbe exponentielle sur l’échelle normale apparaît droite en semi-log.'
  },
  {
    id:'bi',chapter:'Chapitre I · Lire',title:'L’empreinte des deux pentes',tag:'Distribution',
    summary:'Détectez une phase rapide puis une phase lente.',
    config:{model:2,route:'iv',dose:100,vc:15,cl:4,q1:12,vp1:45,horizon:36},
    scale:'log',focus:'tissue',xp:80,
    question:'La pente d’une courbe IV change nettement entre le début et la fin du suivi. Quelle hypothèse mérite d’être comparée ?',
    options:['Une unique exponentielle du début à la fin','Une disposition multiexponentielle compatible avec 2C','Une augmentation de dose au cours du temps'],
    answer:1,
    hint:'Comparez la pente près de t = 0 et celle de la queue de la courbe.',
    explanation:'Le modèle 2C produit une somme d’exponentielles : la contribution rapide s’atténue, puis domine une composante plus lente. Le changement de pente ne signifie pas que l’élimination était absente au début. Il ne suffit pas, seul, à valider le modèle.',
    learning:'Observer les composantes rapide et terminale sur une même courbe.'
  },
  {
    id:'lag',chapter:'Chapitre II · Absorber',title:'Le départ retardé',tag:'Absorption retardée',
    summary:'Repérez le délai d’apparition plasmatique.',
    config:{model:1,route:'oral',dose:100,f:0.9,ka:1.5,lag:2,vc:20,cl:4,horizon:24},
    scale:'linear',focus:'gut',xp:80,answerMode:'number',answerValue:2,tolerance:0.25,
    question:'Avant que la concentration apparaisse dans le sang, combien d’heures s’écoulent environ ? Répondez en heures.',
    options:['Un temps de latence de l’absorption (Tlag)','Une augmentation du volume central uniquement','Une deuxième phase d’élimination'],
    answer:0,
    hint:'Le premier échantillon non nul apparaît après une période de concentration quasi nulle ; zoomez sur le début de la courbe.',
    explanation:'Un Tlag de 2 h retarde le début de l’entrée systémique dans cette simulation. Un Ka faible peut ralentir la montée mais n’impose pas un intervalle exactement nul. Dans des observations réelles, une limite de quantification ou un plan de prélèvement lacunaire peut imiter ce signal.',
    learning:'Différencier retard d’apparition et vitesse d’absorption.'
  },
  {
    id:'slope',chapter:'Chapitre II · Mesurer',title:'Le secret de la pente',tag:'Pente et demi-vie',
    summary:'Déduisez k à partir de deux points.',
    config:{model:1,route:'iv',dose:100,cl:5,vc:20,horizon:24},
    scale:'log',focus:'blood',xp:90,answerMode:'number',answerValue:0.25,tolerance:0.025, markers:[2,6],
    question:'Mesurez C(2 h) et C(6 h), puis estimez la constante positive de décroissance k = −Δln(C)/Δt, en h⁻¹.',
    options:['0,05 h⁻¹','0,25 h⁻¹','1,00 h⁻¹'],
    answer:1,
    hint:'Mesurez les concentrations, calculez leur logarithme naturel, puis divisez la différence par l’intervalle de 4 h.',
    explanation:'k ≈ 1/4 = 0,25 h⁻¹ et t½ = ln(2)/k ≈ 2,77 h. Dans ce cas 1C IV, k = CL/Vc. Pour un modèle multicompartmental, la pente terminale ne correspond pas nécessairement à CL/Vc.',
    learning:'Lire une pente logarithmique, puis estimer une demi-vie.'
  },
  {
    id:'three',chapter:'Chapitre III · Enquêter',title:'Trois compartiments ?',tag:'Identifiabilité',
    summary:'Évitez les conclusions excessives.',
    config:{model:3,route:'iv',dose:100,vc:12,cl:5,q1:13,vp1:22,q2:2,vp2:85,horizon:72},
    scale:'log',focus:'tissue',xp:90,
    question:'Sur ce profil IV prolongé, plusieurs phases semblent visibles. Que pouvez-vous conclure avant d’ajuster les modèles ?',
    options:['Trois compartiments anatomiques sont démontrés','Le modèle 3C est plausible mais doit être comparé et ses paramètres estimables','Trois pentes impliquent nécessairement trois voies métaboliques'],
    answer:1,
    hint:'Une forme de courbe et une structure mécanistique prouvée ne sont pas équivalentes.',
    explanation:'Une disposition multiexponentielle peut justifier de comparer 2C et 3C, mais les pentes visibles dépendent des paramètres, de la fenêtre, de l’erreur et des prélèvements. Il faut comparer des ajustements, examiner précision et identifiabilité ; les compartiments ne sont pas des organes prouvés.',
    learning:'Distinguer compatibilité descriptive et identification de structure.'
  },
  {
    id:'samples',chapter:'Chapitre III · Enquêter',title:'La chasse aux prélèvements',tag:'Plan de prélèvement',
    summary:'Choisissez des temps informatifs.',
    config:{model:2,route:'iv',dose:100,vc:15,cl:4,q1:12,vp1:45,horizon:36},
    scale:'log',focus:'blood',xp:90, sampleTimes:[0.25,0.75,2,8,24],
    question:'Vous suspectez deux phases après un bolus IV. Quel plan permettrait de mieux examiner chacune ?',
    options:['1 h, 1,5 h, 2 h, 2,5 h, 3 h','24 h, 25 h, 26 h, 27 h, 28 h','0,25 h, 0,75 h, 2 h, 8 h, 24 h'],
    answer:2,
    hint:'Il faut couvrir l’intervalle initial et une partie tardive où la pente change.',
    explanation:'Échantillonner tôt et tard rend mieux observables les composantes cinétiques. Cela ne garantit pas que tous les paramètres seront identifiables : le bruit, la quantification et la conception du protocole importent aussi.',
    learning:'Voir pourquoi une fenêtre courte peut masquer des phases.'
  },
  {
    id:'flip',chapter:'Chapitre IV · Douter',title:'Le piège de la demi-vie',tag:'Interprétation critique',
    summary:'La courbe orale raconte-t-elle toujours la clairance ?',
    config:{model:1,route:'oral',dose:100,vc:20,cl:5,ka:0.12,f:0.9,horizon:72},
    scale:'log',focus:'gut',xp:100,
    question:'La pente terminale est moins raide après prise orale qu’après bolus IV. Peut-on utiliser directement la pente orale pour calculer la clairance ?',
    options:['La clairance est nécessairement réduite de moitié par la voie orale','La pente orale peut refléter une absorption lente : elle ne permet pas, seule, d’estimer CL','La biodisponibilité détermine automatiquement la constante d’élimination'], 
    answer:1,
    hint:'Pour estimer une clairance, demandez-vous si la phase terminale reflète bien l’élimination et quelles données complémentaires permettraient de le vérifier.',
    explanation:'Comme Ka < CL/Vc, l’absorption est limitante et la pente terminale tend vers −Ka (flip-flop). Une courbe orale seule ne permet pas toujours de distinguer les constantes d’absorption et d’élimination sans information supplémentaire, comme une référence IV.',
    learning:'Interpréter une pente terminale orale sans en déduire abusivement CL.'
  },
  {
    id:'boss',chapter:'Final · Diagnostic',title:'Le dossier inconnu',tag:'Mission finale',
    summary:'Croisez forme, échelle et voie d’administration.',
    config:{model:2,route:'iv',dose:120,vc:16,cl:5,q1:14,vp1:54,horizon:36},
    scale:'linear',focus:'blood',xp:120,
    question:'La concentration initiale est positive et la pente semi-log ralentit ensuite. Quel modèle candidat examiner en priorité ?',
    options:['Oral 1C avec Tlag','IV bolus 2C linéaire, à confirmer par ajustement','IV bolus 1C monoexponentiel certain'],
    answer:1,
    hint:'C(0) oriente vers un bolus IV ; en semi-log la courbure suggère plusieurs exponentielles.',
    explanation:'Ce profil est compatible avec un bolus IV suivi d’une disposition multiexponentielle. Un modèle 2C est un candidat parcimonieux dans cet exercice synthétique ; dans des données réelles, une sélection de modèle et des diagnostics restent indispensables.',
    learning:'Combiner plusieurs indices, sans transformer une hypothèse en certitude.'
  }
]);

export function profileFor(quest) {
  return simulate({...DEFAULTS, ...quest.config, doses:1});
}
export function logSlope(result, a, b) {
  const ca=atTime(result,a).c, cb=atTime(result,b).c;
  if(!(ca>0 && cb>0 && b>a)) throw new RangeError('Need positive concentrations at increasing times');
  return (Math.log(cb)-Math.log(ca))/(b-a);
}
export function validateProgress(value) {
  if(!value || typeof value!=='object')return {completed:[],xp:0};
  const ids = new Set(QUESTS.map(q=>q.id));
  const completed = Array.isArray(value.completed)
    ? [...new Set(value.completed.filter(id=>typeof id==='string' && ids.has(id)))]
    : [];
  const xp = completed.reduce((sum,id)=>sum+QUESTS.find(q=>q.id===id).xp,0);
  return {completed,xp};
}
export function unlockedIndex(completed) {
  const found = new Set(completed);
  const first = QUESTS.findIndex(q=>!found.has(q.id));
  return first<0 ? QUESTS.length-1 : first;
}
export function grade(quest, choice) {
  const correct=quest.answerMode==='number'
    ? Number.isFinite(Number(choice)) && choice!=='' && Math.abs(Number(choice)-quest.answerValue)<=quest.tolerance
    : choice===quest.answer;
  return {correct, explanation:quest.explanation};
}
