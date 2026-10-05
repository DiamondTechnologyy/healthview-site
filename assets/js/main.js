(function(){
  const cfg = window.HV_CONFIG || {};

  // Fallback: garante o carregamento do gerenciador de cookies mesmo se o index.html
  // ainda não tiver a tag <script> adicionada.
  if(!document.querySelector('script[src*="assets/js/cookies.js"]')){
    const cookieScript=document.createElement('script');
    cookieScript.src='assets/js/cookies.js';
    cookieScript.defer=true;
    document.head.appendChild(cookieScript);
  }

  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();

  const header=document.querySelector('.site-header');
  const menu=document.querySelector('.menu-button');
  if(header && menu){
    menu.addEventListener('click',()=>{
      const open=header.classList.toggle('is-open');
      menu.setAttribute('aria-expanded',String(open));
    });
    header.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{
      header.classList.remove('is-open');
      menu.setAttribute('aria-expanded','false');
    }));
  }

  // Ícone convencional do WhatsApp no botão flutuante.
  const whatsappIcon=`<svg class="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.002 0C7.164 0 0 7.163 0 16c0 2.825.736 5.58 2.135 8.008L.064 31.57l7.742-2.03A15.933 15.933 0 0016.002 32C24.84 32 32 24.837 32 16S24.84 0 16.002 0zm0 29.12a13.08 13.08 0 01-6.67-1.83l-.478-.283-4.594 1.205 1.226-4.477-.312-.46A13.04 13.04 0 012.88 16c0-7.237 5.887-13.12 13.122-13.12 7.234 0 13.118 5.883 13.118 13.12 0 7.236-5.884 13.12-13.118 13.12zm7.2-9.82c-.393-.198-2.33-1.15-2.69-1.282-.36-.132-.623-.198-.886.198-.263.394-1.018 1.282-1.248 1.545-.23.263-.46.296-.854.099-.394-.198-1.662-.613-3.166-1.956-1.17-1.044-1.96-2.333-2.19-2.727-.23-.394-.024-.607.173-.804.177-.176.394-.46.59-.69.198-.23.263-.394.394-.657.132-.263.066-.493-.033-.69-.099-.198-.886-2.136-1.215-2.925-.32-.77-.646-.665-.886-.678l-.755-.013c-.263 0-.69.099-1.05.493-.36.394-1.379 1.347-1.379 3.286 0 1.94 1.412 3.812 1.609 4.075.197.263 2.778 4.24 6.73 5.945.94.406 1.674.648 2.245.83.943.3 1.802.258 2.48.156.757-.113 2.33-.953 2.658-1.873.329-.92.329-1.709.23-1.873-.098-.164-.36-.263-.755-.46z"/></svg>`;
  const floatingWhatsapp=document.querySelector('.whatsapp-float');
  if(floatingWhatsapp) floatingWhatsapp.innerHTML=whatsappIcon;

  const params = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid','fbclid'].forEach(k=>{
    document.querySelectorAll(`input[name="${k}"]`).forEach(i=>i.value=params.get(k)||'');
  });
  document.querySelectorAll('input[name="referrer"]').forEach(i=>i.value=document.referrer||'');
  document.querySelectorAll('input[name="pagina"]').forEach(i=>i.value=location.href);

  document.querySelectorAll('.js-whatsapp').forEach(a=>{
    const n=(cfg.whatsappNumber||'').replace(/\D/g,'');
    if(n && n !== '5500000000000') a.href=`https://wa.me/${n}?text=${encodeURIComponent(cfg.whatsappText||'Olá!')}`;
    a.addEventListener('click',()=>window.hvTrack&&window.hvTrack('whatsapp_click',{location:a.dataset.location||'unknown'}));
  });

  document.querySelectorAll('.js-cta').forEach(a=>a.addEventListener('click',()=>{
    window.hvTrack&&window.hvTrack('cta_click',{cta:a.dataset.cta||'unknown'});
    window.hvTrack&&window.hvTrack('demo_request',{cta:a.dataset.cta||'unknown'});
  }));

  document.querySelectorAll('a[href$="health-view-profissionais.pdf"]').forEach(a=>
    a.addEventListener('click',()=>window.hvTrack&&window.hvTrack('presentation_download',{location:'landing'}))
  );

  // Garante acesso permanente às preferências no rodapé.
  const privacyLink=document.querySelector('.site-footer a[href="privacidade.html"]');
  if(privacyLink && !document.querySelector('.js-cookie-settings')){
    const settings=document.createElement('a');
    settings.href='#';
    settings.className='js-cookie-settings';
    settings.textContent='Preferências de cookies';
    privacyLink.insertAdjacentElement('afterend',settings);
  }
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
      const start = e.target.selectionStart || e.target.value.length;
      e.target.value = maskPhone(e.target.value);
      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    });
  }



  const form=document.getElementById('lead-form');
  if(form){
    // Fallback HTML: se o JavaScript de envio falhar, o navegador ainda conhece o endpoint.
    if(cfg.formEndpoint){
      form.action=cfg.formEndpoint;
      form.method='POST';
    }

    const consent=form.querySelector('.consent input[type="checkbox"]');
    if(consent){
      consent.name='consentimento';
      consent.value='sim';
    }

    if(!form.querySelector('input[name="_subject"]')){
      const subject=document.createElement('input');
      subject.type='hidden';
      subject.name='_subject';
      subject.value='Novo lead - Health View';
      form.appendChild(subject);
    }

    form.addEventListener('submit',async(e)=>{
      e.preventDefault();
      const status=document.getElementById('form-status');
      const submit=form.querySelector('button[type="submit"]');
      if(!form.reportValidity()) return;

      const endpoint=cfg.formEndpoint||form.getAttribute('action');
      if(!endpoint){
        if(status) status.textContent='Formulário temporariamente indisponível. Use o WhatsApp para falar conosco.';
        return;
      }

      const formData=new FormData(form);
      const data=Object.fromEntries(formData.entries());

      try{
        if(status) status.textContent='Enviando...';
        if(submit){ submit.disabled=true; submit.setAttribute('aria-busy','true'); }

        const r=await fetch(endpoint,{
          method:'POST',
          body:formData,
          headers:{'Accept':'application/json'}
        });

        if(!r.ok){
          let detail='';
          try{
            const body=await r.json();
            detail=Array.isArray(body.errors)?body.errors.map(x=>x.message).filter(Boolean).join(' '):'';
          }catch(_){ }
          throw new Error(detail||'Falha no envio');
        }

        window.hvTrack&&window.hvTrack('generate_lead',{interest:data.interesse||''});
        location.href=cfg.successUrl||'obrigado.html';
      }catch(err){
        if(status) status.textContent='Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.';
      }finally{
        if(submit){ submit.disabled=false; submit.removeAttribute('aria-busy'); }
      }
    });
  }
})();



