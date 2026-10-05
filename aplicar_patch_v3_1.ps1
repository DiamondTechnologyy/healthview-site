
$ErrorActionPreference = "Stop"

$Root = "C:\xampp\htdocs\Health_View_Landing"

if (!(Test-Path $Root)) {
    throw "Pasta não encontrada: $Root"
}

Write-Host "Aplicando patch V3.1 em $Root..." -ForegroundColor Cyan

$index   = Join-Path $Root "index.html"
$main    = Join-Path $Root "assets\js\main.js"
$cookies = Join-Path $Root "assets\js\cookies.js"
$site    = Join-Path $Root "assets\css\site.css"

# Backup
$backup = Join-Path $Root ("_backup_patch_v3_1_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
New-Item -ItemType Directory -Path $backup | Out-Null
foreach ($f in @($index,$main,$cookies,$site)) {
    if (Test-Path $f) {
        Copy-Item $f -Destination $backup -Force
    }
}

# ------------------------------------------------------------
# 1) WHATSAPP: ícone convencional em SVG inline
# ------------------------------------------------------------
$html = Get-Content $index -Raw -Encoding UTF8

$waSvg = @'
<a class="whatsapp-float js-whatsapp" data-location="floating" href="#contato" aria-label="Falar no WhatsApp">
  <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M16.04 3C8.86 3 3.03 8.74 3.03 15.82c0 2.49.74 4.92 2.13 6.99L3 29l6.38-2.08a13.14 13.14 0 0 0 6.65 1.82h.01c7.18 0 13.01-5.74 13.01-12.82C29.05 8.74 23.22 3 16.04 3Zm0 23.58h-.01a10.99 10.99 0 0 1-5.6-1.53l-.4-.24-3.79 1.23 1.24-3.64-.26-.41a10.53 10.53 0 0 1-1.64-5.67c0-5.84 4.81-10.59 10.72-10.59s10.72 4.75 10.72 10.59-4.81 10.26-10.98 10.26Zm5.89-7.71c-.32-.16-1.89-.92-2.18-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.55-.95-.84-1.59-1.87-1.78-2.19-.18-.31-.02-.48.14-.64.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.69-.97-2.31-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.06-1.1 2.58s1.13 2.99 1.29 3.2c.16.21 2.22 3.34 5.38 4.69.75.32 1.34.51 1.79.65.75.24 1.44.21 1.98.13.6-.09 1.89-.76 2.16-1.5.27-.73.27-1.36.19-1.49-.08-.13-.29-.21-.61-.37Z"/>
  </svg>
</a>
'@

$html = [regex]::Replace(
    $html,
    '<a class="whatsapp-float js-whatsapp"[\s\S]*?</a>',
    [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $waSvg },
    1
)

Set-Content -Path $index -Value $html -Encoding UTF8

# ------------------------------------------------------------
# 2) TELEFONE: máscara (99) 99999-9999
# ------------------------------------------------------------
$mainContent = Get-Content $main -Raw -Encoding UTF8

$maskBlock = @'

  // Máscara de WhatsApp/telefone brasileiro
  const phoneInput = document.getElementById('lead-phone');
  if(phoneInput){
    const maskPhone = (value) => {
      const digits = String(value || '').replace(/\D/g,'').slice(0,11);
      if(!digits) return '';
      if(digits.length <= 2) return `(${digits}`;
      if(digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    };

    phoneInput.value = maskPhone(phoneInput.value);

    phoneInput.addEventListener('input', (e) => {
      e.target.value = maskPhone(e.target.value);
      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    });
  }

'@

if ($mainContent -notmatch 'Máscara de WhatsApp/telefone brasileiro') {
    $marker = "  const form=document.getElementById('lead-form');"
    if ($mainContent.Contains($marker)) {
        $mainContent = $mainContent.Replace($marker, $maskBlock + "`r`n" + $marker)
    } else {
        throw "Não encontrei o marcador do formulário em assets/js/main.js"
    }
}
Set-Content -Path $main -Value $mainContent -Encoding UTF8

# ------------------------------------------------------------
# 3) COOKIES
# ------------------------------------------------------------
$cookiesContent = @'
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
'@

Set-Content -Path $cookies -Value $cookiesContent -Encoding UTF8

# Garante carregamento do cookies.js
$html = Get-Content $index -Raw -Encoding UTF8
if ($html -notmatch 'assets/js/cookies\.js') {
    $needle = '<script defer src="assets/js/main.js"></script>'
    $replacement = '<script defer src="assets/js/cookies.js"></script>' + "`r`n  " + $needle
    if ($html.Contains($needle)) {
        $html = $html.Replace($needle, $replacement)
    } else {
        throw "Não encontrei a inclusão de assets/js/main.js no index.html"
    }
}
Set-Content -Path $index -Value $html -Encoding UTF8

# ------------------------------------------------------------
# 4) CSS
# ------------------------------------------------------------
$css = Get-Content $site -Raw -Encoding UTF8

# Remove versão antiga simples do botão, se ainda existir
$oldWa = '.whatsapp-float{position:fixed;right:22px;bottom:22px;z-index:950;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:#0eaf73;color:#fff;font-size:12px;font-weight:700;box-shadow:0 14px 30px rgba(14,175,115,.25)}'
$css = $css.Replace($oldWa, '')

$cssBlock = @'

/* PATCH V3.1 — WhatsApp + cookies */
.whatsapp-float{
  position:fixed;
  right:22px;
  bottom:22px;
  z-index:950;
  width:58px;
  height:58px;
  border-radius:50%;
  display:grid;
  place-items:center;
  background:#25D366;
  color:#fff;
  box-shadow:0 8px 24px rgba(0,0,0,.22);
  transition:transform .2s ease, box-shadow .2s ease;
}
.whatsapp-float:hover{
  transform:translateY(-2px) scale(1.02);
  box-shadow:0 10px 28px rgba(0,0,0,.26);
}
.whatsapp-float svg{
  width:34px;
  height:34px;
  display:block;
}

.cookie-banner{
  position:fixed;
  left:18px;
  right:18px;
  bottom:18px;
  z-index:3000;
}
.cookie-banner__content{
  width:min(1180px,100%);
  margin:0 auto;
  background:#fff;
  border:1px solid #dbe3ec;
  box-shadow:0 18px 50px rgba(6,22,59,.18);
  border-radius:10px;
  padding:20px 22px;
  display:flex;
  gap:28px;
  align-items:center;
  justify-content:space-between;
}
.cookie-banner__text{
  max-width:760px;
}
.cookie-banner__text strong{
  display:block;
  color:var(--navy);
  font-size:16px;
  margin-bottom:4px;
}
.cookie-banner__text p{
  margin:0;
  color:#64758c;
  font-size:13px;
  line-height:1.55;
}
.cookie-banner__text a{
  display:inline-block;
  margin-top:6px;
  font-size:12px;
  color:var(--navy);
  text-decoration:underline;
}
.cookie-banner__actions{
  display:flex;
  flex-wrap:wrap;
  justify-content:flex-end;
  align-items:center;
  gap:10px;
}
.cookie-btn{
  min-height:42px;
  padding:0 15px;
  white-space:nowrap;
}
.cookie-btn--secondary{
  background:#fff;
  border-color:#cfd9e4;
  color:var(--navy);
}
.cookie-link-btn{
  background:transparent;
  border:0;
  color:var(--navy);
  cursor:pointer;
  font:inherit;
  font-size:13px;
  text-decoration:underline;
}

.cookie-modal{
  position:fixed;
  inset:0;
  z-index:3100;
  display:grid;
  place-items:center;
  padding:18px;
}
.cookie-modal__backdrop{
  position:absolute;
  inset:0;
  background:rgba(4,15,39,.58);
}
.cookie-modal__dialog{
  position:relative;
  z-index:1;
  width:min(620px,100%);
  max-height:calc(100vh - 36px);
  overflow:auto;
  background:#fff;
  border-radius:10px;
  padding:28px;
  box-shadow:0 24px 70px rgba(0,0,0,.28);
}
.cookie-modal__close{
  position:absolute;
  top:12px;
  right:14px;
  width:36px;
  height:36px;
  border:0;
  background:transparent;
  color:#6e7d91;
  font-size:28px;
  cursor:pointer;
}
.cookie-eyebrow{
  font-size:10px;
  letter-spacing:.14em;
  font-weight:600;
  color:var(--teal);
}
.cookie-modal h2{
  margin:8px 0 8px;
  font-size:28px;
}
.cookie-modal__intro{
  margin:0 0 20px;
  color:#6b7b91;
  font-size:14px;
}
.cookie-option{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:18px;
  padding:17px 0;
  border-top:1px solid var(--line);
}
.cookie-option strong{
  display:block;
  color:var(--navy);
  font-size:14px;
  margin-bottom:4px;
}
.cookie-option small{
  display:block;
  color:#728198;
  font-size:12px;
  line-height:1.45;
}
.cookie-option input{
  width:20px;
  height:20px;
  accent-color:#0e95a5;
}
.cookie-option--locked{
  opacity:.75;
}
.cookie-modal__actions{
  display:flex;
  justify-content:flex-end;
  flex-wrap:wrap;
  gap:10px;
  padding-top:18px;
  border-top:1px solid var(--line);
}

@media(max-width:760px){
  .cookie-banner{
    left:10px;
    right:10px;
    bottom:10px;
  }
  .cookie-banner__content{
    display:block;
    padding:17px;
  }
  .cookie-banner__actions{
    margin-top:14px;
    justify-content:flex-start;
  }
  .cookie-btn{
    flex:1 1 auto;
  }
  .cookie-modal__dialog{
    padding:23px 18px;
  }
  .whatsapp-float{
    width:56px;
    height:56px;
    right:16px;
    bottom:16px;
  }
}
'@

# Remove qualquer bloco V3/V3.1 anterior para não duplicar
$css = [regex]::Replace($css, '(?s)/\* PATCH V3(?:\.1)? — WhatsApp \+ cookies \*/.*?(?=\z)', '')
$css = $css.TrimEnd() + "`r`n" + $cssBlock

Set-Content -Path $site -Value $css -Encoding UTF8

Write-Host ""
Write-Host "PATCH V3.1 APLICADO COM SUCESSO." -ForegroundColor Green
Write-Host "Abra o index.html e pressione Ctrl+F5." -ForegroundColor Yellow
Write-Host ""
Write-Host "Se o banner não aparecer, abra o Console do navegador e rode:" -ForegroundColor Yellow
Write-Host "localStorage.removeItem('hv_cookie_consent_v2'); location.reload();" -ForegroundColor White
