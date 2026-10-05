(function(){
  const STORAGE_KEY='hv_cookie_consent_v1';

  function readConsent(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw) return null;
      const parsed=JSON.parse(raw);
      return {
        necessary:true,
        analytics:!!parsed.analytics,
        marketing:!!parsed.marketing,
        updatedAt:parsed.updatedAt||null
      };
    }catch(_){ return null; }
  }

  function saveConsent(consent){
    const value={
      necessary:true,
      analytics:!!consent.analytics,
      marketing:!!consent.marketing,
      updatedAt:new Date().toISOString()
    };
    try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(value)); }catch(_){ }
    return value;
  }

  function clearNonEssentialCookies(){
    const names=document.cookie.split(';').map(v=>v.split('=')[0].trim()).filter(Boolean);
    const removable=names.filter(n=>['_ga','_gid','_gat','_gcl_au','_fbp','_fbc'].includes(n)||n.startsWith('_ga_'));
    const host=location.hostname;
    removable.forEach(name=>{
      document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`;
      if(host.includes('.')) document.cookie=`${name}=; Max-Age=0; path=/; domain=.${host}; SameSite=Lax`;
    });
  }

  function apply(consent){
    if(!consent.analytics && !consent.marketing) clearNonEssentialCookies();
    if(typeof window.hvApplyConsent==='function') window.hvApplyConsent(consent);
  }

  function buildUi(){
    const banner=document.createElement('section');
    banner.className='cookie-banner';
    banner.id='cookie-banner';
    banner.setAttribute('role','dialog');
    banner.setAttribute('aria-label','Preferências de cookies');
    banner.innerHTML=`
      <div class="cookie-banner-copy">
        <strong>Sua privacidade importa</strong>
        <p>Usamos recursos essenciais para o site funcionar. Com sua permissão, também podemos usar cookies de análise e marketing para medir campanhas e melhorar sua experiência. <a href="privacidade.html">Saiba mais</a>.</p>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" class="cookie-btn cookie-btn-secondary" data-cookie-action="preferences">Preferências</button>
        <button type="button" class="cookie-btn cookie-btn-secondary" data-cookie-action="reject">Recusar não essenciais</button>
        <button type="button" class="cookie-btn cookie-btn-primary" data-cookie-action="accept">Aceitar todos</button>
      </div>`;

    const overlay=document.createElement('div');
    overlay.className='cookie-modal-overlay';
    overlay.id='cookie-modal-overlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML=`
      <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <div class="cookie-modal-head">
          <div><span>PRIVACIDADE</span><h2 id="cookie-modal-title">Preferências de cookies</h2></div>
          <button type="button" class="cookie-modal-close" data-cookie-action="close" aria-label="Fechar">×</button>
        </div>
        <p class="cookie-modal-intro">Escolha quais categorias opcionais podem ser utilizadas. Os recursos essenciais permanecem ativos porque são necessários para o funcionamento e para registrar sua preferência.</p>
        <div class="cookie-option">
          <div><strong>Essenciais</strong><span>Necessários para funcionamento básico e registro da sua escolha.</span></div>
          <input type="checkbox" checked disabled aria-label="Cookies essenciais sempre ativos">
        </div>
        <div class="cookie-option">
          <div><strong>Análise</strong><span>Permitem medir visitas e desempenho quando ferramentas como GA4 forem habilitadas.</span></div>
          <input id="cookie-analytics" type="checkbox" aria-label="Permitir cookies de análise">
        </div>
        <div class="cookie-option">
          <div><strong>Marketing</strong><span>Permitem mensurar campanhas e conversões quando Google Ads ou Meta Pixel forem habilitados.</span></div>
          <input id="cookie-marketing" type="checkbox" aria-label="Permitir cookies de marketing">
        </div>
        <div class="cookie-modal-actions">
          <button type="button" class="cookie-btn cookie-btn-secondary" data-cookie-action="reject">Recusar não essenciais</button>
          <button type="button" class="cookie-btn cookie-btn-primary" data-cookie-action="save">Salvar preferências</button>
        </div>
      </div>`;

    document.body.appendChild(banner);
    document.body.appendChild(overlay);
    return {banner,overlay};
  }

  function init(){
    const {banner,overlay}=buildUi();
    const analytics=overlay.querySelector('#cookie-analytics');
    const marketing=overlay.querySelector('#cookie-marketing');
    let current=readConsent();

    function showBanner(){ banner.classList.add('is-visible'); document.body.classList.add('cookie-banner-visible'); }
    function hideBanner(){ banner.classList.remove('is-visible'); document.body.classList.remove('cookie-banner-visible'); }
    function openPreferences(){
      const selected=readConsent()||{analytics:false,marketing:false};
      analytics.checked=!!selected.analytics;
      marketing.checked=!!selected.marketing;
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden','false');
      document.body.classList.add('cookie-modal-open');
      setTimeout(()=>overlay.querySelector('.cookie-modal-close')?.focus(),0);
    }
    function closePreferences(){
      overlay.classList.remove('is-visible');
      overlay.setAttribute('aria-hidden','true');
      document.body.classList.remove('cookie-modal-open');
    }
    function commit(next){
      const previous=readConsent();
      const saved=saveConsent(next);
      hideBanner();
      closePreferences();
      const revoked=previous && ((previous.analytics&&!saved.analytics)||(previous.marketing&&!saved.marketing));
      if(revoked){
        clearNonEssentialCookies();
        location.reload();
        return;
      }
      current=saved;
      apply(saved);
    }

    document.addEventListener('click',e=>{
      const trigger=e.target.closest('[data-cookie-action],.js-cookie-settings');
      if(!trigger) return;
      if(trigger.classList.contains('js-cookie-settings')){
        e.preventDefault();
        openPreferences();
        return;
      }
      const action=trigger.dataset.cookieAction;
      if(action==='accept') commit({analytics:true,marketing:true});
      if(action==='reject') commit({analytics:false,marketing:false});
      if(action==='preferences') openPreferences();
      if(action==='close') closePreferences();
      if(action==='save') commit({analytics:analytics.checked,marketing:marketing.checked});
    });

    overlay.addEventListener('click',e=>{ if(e.target===overlay) closePreferences(); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape' && overlay.classList.contains('is-visible')) closePreferences(); });

    if(current){
      apply(current);
      hideBanner();
    }else{
      showBanner();
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
