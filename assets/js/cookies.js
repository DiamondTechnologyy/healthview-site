(function(){
  const STORAGE_KEY = 'hv_cookie_consent_v2';

  const defaultConsent = {
    necessary: true,
    analytics: false,
    marketing: false
  };

  function getConsent(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? {...defaultConsent, ...JSON.parse(raw)} : null;
    }catch(e){
      return null;
    }
  }

  function applyConsent(consent){
    window.HV_COOKIE_CONSENT = consent;
    window.dispatchEvent(new CustomEvent('hv:consent-updated', { detail: consent }));
  }

  function closeAll(){
    document.getElementById('hv-cookie-banner')?.remove();
    document.getElementById('hv-cookie-modal')?.remove();
  }

  function saveConsent(consent){
    const finalConsent = {...defaultConsent, ...consent};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalConsent));
    applyConsent(finalConsent);
    closeAll();
  }

  function openPreferences(){
    document.getElementById('hv-cookie-modal')?.remove();

    const current = getConsent() || defaultConsent;
    const modal = document.createElement('div');
    modal.id = 'hv-cookie-modal';
    modal.className = 'cookie-modal';
    modal.innerHTML = `
      <div class="cookie-modal__backdrop" data-cookie-close></div>
      <div class="cookie-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
        <button class="cookie-modal__close" type="button" aria-label="Fechar" data-cookie-close>×</button>
        <span class="cookie-eyebrow">PRIVACIDADE</span>
        <h2 id="cookie-title">Preferências de cookies</h2>
        <p class="cookie-modal__intro">Você escolhe quais tecnologias opcionais podem ser utilizadas neste site.</p>

        <label class="cookie-option cookie-option--locked">
          <span>
            <strong>Necessários</strong>
            <small>Essenciais para o funcionamento do site e não podem ser desativados.</small>
          </span>
          <input type="checkbox" checked disabled>
        </label>

        <label class="cookie-option">
          <span>
            <strong>Analytics</strong>
            <small>Ajuda a entender o uso do site e melhorar a experiência.</small>
          </span>
          <input id="cookie-analytics" type="checkbox" ${current.analytics ? 'checked' : ''}>
        </label>

        <label class="cookie-option">
          <span>
            <strong>Marketing</strong>
            <small>Permite mensurar campanhas e conversões de mídia.</small>
          </span>
          <input id="cookie-marketing" type="checkbox" ${current.marketing ? 'checked' : ''}>
        </label>

        <div class="cookie-modal__actions">
          <button type="button" class="btn cookie-btn cookie-btn--secondary" data-cookie-reject>Recusar não essenciais</button>
          <button type="button" class="btn btn-primary cookie-btn" data-cookie-save>Salvar preferências</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('[data-cookie-close]').forEach(el => el.addEventListener('click', () => modal.remove()));
    modal.querySelector('[data-cookie-reject]').addEventListener('click', () => saveConsent({analytics:false, marketing:false}));
    modal.querySelector('[data-cookie-save]').addEventListener('click', () => {
      saveConsent({
        analytics: !!modal.querySelector('#cookie-analytics')?.checked,
        marketing: !!modal.querySelector('#cookie-marketing')?.checked
      });
    });
  }

  function showBanner(){
    if(document.getElementById('hv-cookie-banner')) return;

    const banner = document.createElement('section');
    banner.id = 'hv-cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('aria-label','Preferências de cookies');
    banner.innerHTML = `
      <div class="cookie-banner__content">
        <div class="cookie-banner__text">
          <strong>Sua privacidade importa.</strong>
          <p>Usamos tecnologias necessárias para o funcionamento do site. Com sua autorização, também podemos usar cookies de analytics e marketing para medir a experiência e as campanhas.</p>
          <a href="privacidade.html">Política de Privacidade</a>
        </div>
        <div class="cookie-banner__actions">
          <button type="button" class="cookie-link-btn" data-cookie-preferences>Preferências</button>
          <button type="button" class="btn cookie-btn cookie-btn--secondary" data-cookie-reject>Recusar não essenciais</button>
          <button type="button" class="btn btn-primary cookie-btn" data-cookie-accept>Aceitar todos</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    banner.querySelector('[data-cookie-preferences]').addEventListener('click', openPreferences);
    banner.querySelector('[data-cookie-reject]').addEventListener('click', () => saveConsent({analytics:false, marketing:false}));
    banner.querySelector('[data-cookie-accept]').addEventListener('click', () => saveConsent({analytics:true, marketing:true}));
  }

  function init(){
    const existing = getConsent();
    if(existing){
      applyConsent(existing);
    } else {
      showBanner();
    }

    document.querySelectorAll('[data-cookie-preferences-link]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openPreferences();
      });
    });
  }

  window.HV_COOKIES = {
    openPreferences,
    getConsent,
    clear(){
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
