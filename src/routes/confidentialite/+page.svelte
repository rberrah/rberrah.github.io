<script>
  import { onMount } from 'svelte';
  import { language } from '$lib/stores/language';
  import { isOptedOut, privacySignal, setOptOut } from '$lib/analytics';
  let optedOut = $state(true);
  let signal = $state(false);
  let ready = $state(false);
  let storageError = $state(false);
  let en = $derived($language === 'en');
  onMount(() => {
    optedOut = isOptedOut();
    signal = privacySignal();
    ready = true;
  });
  /** @param {Event & {currentTarget: HTMLInputElement}} event */
  function update(event) {
    const disabled = !event.currentTarget.checked;
    storageError = !setOptOut(disabled);
    optedOut = isOptedOut();
    event.currentTarget.checked = !optedOut;
  }
</script>

<svelte:head><title>{en ? 'Privacy' : 'Confidentialité'} | Pharmacométrie</title></svelte:head>

<section class="privacy-page">
  <h1>{en ? 'Privacy' : 'Confidentialité'}</h1>
  <p>{en
    ? 'This public educational site uses GoatCounter to measure page visits. This measurement does not cover the Shiny application.'
    : 'Ce site pédagogique public utilise GoatCounter pour mesurer les visites de pages. Cette mesure ne couvre pas l’application Shiny.'}</p>
  <h2>{en ? 'What is sent' : 'Ce qui est transmis'}</h2>
  <p>{en
    ? 'Only a public page path, a random cache-busting value and, for automated browsers, a bot flag. French and English versions are grouped. URLs with query parameters or fragments, page titles, referrers, screen dimensions, form values, patient data and model code are not sent. No clicks, simulations or downloads are tracked.'
    : 'Uniquement le chemin d’une page publique, une valeur aléatoire anti-cache et, pour les navigateurs automatisés, un indicateur de robot. Les versions française et anglaise sont regroupées. Les paramètres d’URL, fragments, titres, pages de provenance, dimensions d’écran, valeurs saisies, données patient et codes des modèles ne sont pas transmis. Les clics, simulations et téléchargements ne sont pas suivis.'}</p>
  <p>{en
    ? 'As with any network request, GoatCounter receives technical connection information, including the IP address and browser information. According to its documentation, visitor identification uses temporary in-memory processing, without analytics cookies. This does not mean that no third party processes any data.'
    : 'Comme pour toute requête réseau, GoatCounter reçoit des informations techniques de connexion, dont l’adresse IP et des informations sur le navigateur. Selon sa documentation, l’identification des visites repose sur un traitement temporaire en mémoire, sans cookies de mesure d’audience. Cela ne signifie pas qu’aucun tiers ne traite de données.'}</p>
  <p><a href="https://www.goatcounter.com/help/sessions" target="_blank" rel="noreferrer">GoatCounter: sessions</a> · <a href="https://www.goatcounter.com/privacy" target="_blank" rel="noreferrer">GoatCounter: privacy</a></p>

  <h2>{en ? 'Your preference' : 'Votre choix'}</h2>
  <label class="preference"><input type="checkbox" checked={!optedOut && !signal} disabled={!ready || signal} onchange={update} />{en ? 'Allow page audience measurement in this browser' : 'Autoriser la mesure d’audience des pages dans ce navigateur'}</label>
  <p role="status">{signal
    ? (en ? 'Disabled by your browser privacy signal (DNT or GPC).' : 'Désactivé par le signal de confidentialité du navigateur (DNT ou GPC).')
    : (optedOut ? (en ? 'Audience measurement is disabled.' : 'La mesure d’audience est désactivée.') : (en ? 'Audience measurement is enabled on the public site.' : 'La mesure d’audience est activée sur le site public.'))}</p>
  {#if storageError}<p role="alert">{en ? 'The browser could not save this preference.' : 'Le navigateur ne peut pas enregistrer ce choix.'}</p>{/if}
  <p>{en
    ? 'Opting out stores only the preference skipgc in this browser, shared by the portal and course. It takes effect for subsequent page views and does not erase earlier aggregate statistics. Local previews and embedded frames do not send audience measurements.'
    : 'La désactivation enregistre uniquement la préférence skipgc dans ce navigateur, commune au portail et au cours. Elle s’applique aux prochaines visites, sans effacer les statistiques déjà recueillies. Les aperçus locaux et les pages intégrées dans une iframe n’envoient aucune mesure d’audience.'}</p>
  <h2>{en ? 'Hosting and clinical tools' : 'Hébergement et outils cliniques'}</h2>
  <p>{en
    ? 'GitHub Pages hosts the public site; Shiny is hosted separately. Their technical logs and policies are distinct from this audience measurement. GoatCounter is not loaded in Shiny and does not receive data exchanged with the R engine. Personal models and patient data are not added to the analytics or the repository.'
    : 'GitHub Pages héberge le site public ; Shiny est hébergé séparément. Leurs journaux techniques et politiques sont distincts de cette mesure d’audience. GoatCounter n’est pas chargé dans Shiny et ne reçoit pas les données échangées avec le moteur R. Les modèles personnels et les données patient ne sont pas ajoutés aux statistiques ni au dépôt.'}</p>
  <p><a href="https://rberrah.github.io/contact/" data-sveltekit-reload>Contact</a></p>
</section>

<style>
  .privacy-page { max-width: 760px; margin: 0 auto; }
  h1 { font-size: 28px; margin-bottom: 20px; }
  h2 { font-size: 20px; margin: 28px 0 12px; }
  p { line-height: 1.7; margin: 12px 0; }
  .preference { display: flex; align-items: flex-start; gap: 12px; line-height: 1.5; }
  input { flex: 0 0 auto; margin-top: 5px; }
</style>
