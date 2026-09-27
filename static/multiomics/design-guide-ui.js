(() => {
  if (!window.location.pathname.includes('/multiomics/tool')) return;

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'fr';

  function selectContaining(value) {
    const option = [...document.querySelectorAll('select option')].find((item) => item.value === value);
    return option?.parentElement instanceof HTMLSelectElement ? option.parentElement : null;
  }

  function designExplanation(language, design) {
    const fr = {
      independent: ['Unités indépendantes', 'Chaque sujet, animal ou culture appartient à une seule unité biologique indépendante. Exemple : groupe contrôle versus groupe traité avec des individus différents.'],
      paired: ['Échantillons appariés', 'Deux mesures sont reliées volontairement. Exemple : avant/après chez le même sujet, ou deux tissus appariés provenant du même individu.'],
      crossover: ['Crossover', 'Le même sujet reçoit plusieurs conditions selon un ordre défini. La période et la séquence doivent être modélisées ; cette route reste bloquée tant que ces informations ne sont pas explicites.'],
      repeated: ['Mesures répétées', 'Le même sujet est mesuré plusieurs fois. Les observations ne sont donc pas indépendantes et le modèle doit conserver le lien entre les visites.']
    };
    const en = {
      independent: ['Independent units', 'Each participant, animal or culture is one independent biological unit. Example: control versus treated groups made of different individuals.'],
      paired: ['Paired samples', 'Two observations are deliberately linked. Example: before/after in the same subject, or matched tissues from the same individual.'],
      crossover: ['Crossover', 'The same subject receives several conditions in a defined order. Period and sequence must be modelled; this route remains blocked until these data are explicit.'],
      repeated: ['Repeated measurements', 'The same subject is measured several times. Observations are therefore not independent and the model must preserve the link between visits.']
    };
    return (language === 'en' ? en : fr)[design] || (language === 'en' ? en.independent : fr.independent);
  }

  function overlapExplanation(language, overlap) {
    const fr = {
      same_specimen: 'Même prélèvement : les différentes omiques viennent du même tube/prélèvement biologique. C’est la situation la plus directement intégrable.',
      same_subject: 'Même sujet, prélèvements différents : les omiques sont reliées au niveau du sujet, mais pas au niveau du même prélèvement physique.',
      partial: 'Partiellement apparié : certains sujets possèdent toutes les omiques, d’autres seulement une partie. L’outil utilise les sujets réellement communs pour les analyses qui l’exigent.',
      unpaired: 'Non apparié : les couches ne portent pas sur les mêmes sujets. Certaines intégrations sujet-à-sujet ne sont alors pas interprétables.',
      unknown: 'Inconnu : vérifiez ce point avant l’interprétation, car il détermine quelles relations entre omiques sont défendables.'
    };
    const en = {
      same_specimen: 'Same specimen: the omics were measured from the same physical biological specimen. This is the most direct setting for integration.',
      same_subject: 'Same subject, different specimens: omics are linked at subject level but not from the exact same physical specimen.',
      partial: 'Partially matched: some subjects have all omics and others only some. Analyses that need matching use the subjects actually shared.',
      unpaired: 'Unpaired: layers do not contain the same subjects. Some subject-level integrations cannot then be interpreted.',
      unknown: 'Unknown: resolve this before interpretation because it determines which cross-omics relationships are defensible.'
    };
    return (language === 'en' ? en : fr)[overlap] || '';
  }

  function outcomeExplanation(language, type) {
    const fr = {
      none: 'Aucun critère cible : l’analyse reste exploratoire ou centrée sur les groupes/temps.',
      binary: 'Oui/non : deux états seulement, par exemple répondeur/non-répondeur.',
      multiclass: 'Plusieurs catégories : au moins trois classes distinctes, sans supposer qu’elles soient numériques.',
      continuous: 'Continu : une valeur numérique mesurée sur une échelle, par exemple concentration ou score.',
      survival: 'Temps jusqu’à événement : il faut une durée de suivi ET l’indication qu’un événement a été observé ou censuré.',
      count: 'Comptage : nombre d’événements, par exemple nombre de crises ou de complications.'
    };
    const en = {
      none: 'No target endpoint: analysis remains exploratory or focused on groups/time.',
      binary: 'Yes/no: exactly two states, for example responder/non-responder.',
      multiclass: 'Several categories: at least three distinct classes without assuming a numeric scale.',
      continuous: 'Continuous: a numeric measurement such as a concentration or score.',
      survival: 'Time to event: requires both follow-up time AND whether the event was observed or censored.',
      count: 'Count: number of events, for example number of attacks or complications.'
    };
    return (language === 'en' ? en : fr)[type] || '';
  }

  function render() {
    const design = selectContaining('crossover');
    if (!design) return;
    const panel = design.closest('section.panel');
    if (!panel) return;
    const overlap = selectContaining('same_specimen');
    const outcome = selectContaining('survival');
    const techRep = selectContaining('unknown');

    let guide = document.querySelector('[data-testid="multiomics-design-guide"]');
    if (!guide) {
      guide = document.createElement('aside');
      guide.className = 'licence-design-guide';
      guide.dataset.testid = 'multiomics-design-guide';
      const grid = panel.querySelector('.form-grid');
      if (grid) grid.insertAdjacentElement('afterend', guide);
      else panel.appendChild(guide);
    }

    const language = lang();
    const designValue = design.value || 'independent';
    const overlapValue = overlap?.value || 'unknown';
    const outcomeValue = outcome?.value || 'none';
    const state = `${language}|${designValue}|${overlapValue}|${outcomeValue}`;
    if (guide.dataset.state === state) return;

    const [designTitle, designText] = designExplanation(language, designValue);
    const overlapText = overlapExplanation(language, overlapValue);
    const outcomeText = outcomeExplanation(language, outcomeValue);

    guide.innerHTML = `
      <div class="licence-design-head"><span>${language === 'en' ? 'Meaning of your choices' : 'Ce que signifient vos choix'}</span><h3>${language === 'en' ? 'Translate the study design into plain language' : 'Traduire le plan d’étude en langage simple'}</h3></div>
      <div class="licence-design-grid">
        <article><strong>${designTitle}</strong><p>${designText}</p></article>
        <article><strong>${language === 'en' ? 'How omics overlap' : 'Comment les omiques se recouvrent'}</strong><p>${overlapText}</p></article>
        <article><strong>${language === 'en' ? 'Endpoint type' : 'Type de critère étudié'}</strong><p>${outcomeText}</p></article>
      </div>
      <div class="licence-replicate-warning"><b>${language === 'en' ? 'Important: a technical replicate is not a new biological subject.' : 'Important : un réplicat technique n’est pas un nouveau sujet biologique.'}</b><span>${language === 'en' ? 'Repeating the measurement of the same specimen improves measurement precision but does not increase the biological sample size. The tool links technical replicates through the same sample_id.' : 'Répéter la mesure du même prélèvement améliore la précision technique mais n’augmente pas l’effectif biologique. L’outil relie les répétitions techniques par le même sample_id.'}</span></div>
    `;
    guide.dataset.state = state;
  }

  function installStyle() {
    if (document.getElementById('multiomics-design-guide-style')) return;
    const style = document.createElement('style');
    style.id = 'multiomics-design-guide-style';
    style.textContent = `
      .licence-design-guide{margin:16px 0;padding:15px;border:1px solid var(--border-subtle,#d4d4d4);border-radius:11px;background:var(--bg-secondary,#f7f7f7)}.licence-design-head>span{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-secondary,#666)}.licence-design-head h3{margin:3px 0 11px;font-size:1.03rem}.licence-design-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.licence-design-grid article{padding:11px;border:1px solid var(--border-subtle,#ddd);border-radius:9px;background:var(--bg-primary,#fff)}.licence-design-grid strong,.licence-design-grid p{display:block}.licence-design-grid p{margin:5px 0 0;font-size:.87rem;line-height:1.42;color:var(--text-secondary,#555)}.licence-replicate-warning{display:grid;grid-template-columns:minmax(220px,.7fr) 1.3fr;gap:12px;margin-top:10px;padding:11px;border:1px solid var(--border-subtle,#ddd);border-radius:9px}.licence-replicate-warning span{font-size:.87rem;line-height:1.42;color:var(--text-secondary,#555)}
      @media(max-width:850px){.licence-design-grid{grid-template-columns:1fr}.licence-replicate-warning{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  let queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      installStyle();
      render();
    });
  }

  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['lang'] });
  document.addEventListener('change', refresh);
  document.addEventListener('DOMContentLoaded', refresh, { once:true });
  refresh();
})();
