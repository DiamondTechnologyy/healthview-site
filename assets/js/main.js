(function(){
  const cfg = window.HV_CONFIG || {};
  const year = document.getElementById('year'); if(year) year.textContent = new Date().getFullYear();
  const header=document.querySelector('.site-header');
  const menu=document.querySelector('.menu-button');
  if(header && menu){
    menu.addEventListener('click',()=>{
      const open=header.classList.toggle('is-open');
      menu.setAttribute('aria-expanded',String(open));
    });
    header.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{header.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}));
  }


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
  document.querySelectorAll('.js-cta').forEach(a=>a.addEventListener('click',()=>{ window.hvTrack&&window.hvTrack('cta_click',{cta:a.dataset.cta||'unknown'}); window.hvTrack&&window.hvTrack('demo_request',{cta:a.dataset.cta||'unknown'}); }));

  document.querySelectorAll('a[href$="health-view-profissionais.pdf"]').forEach(a=>a.addEventListener('click',()=>window.hvTrack&&window.hvTrack('presentation_download',{location:'landing'})));

  const form=document.getElementById('lead-form');
  if(form){
    form.addEventListener('submit',async(e)=>{
      e.preventDefault();
      const status=document.getElementById('form-status');
      if(!form.reportValidity()) return;
      const data=Object.fromEntries(new FormData(form).entries());
      window.hvTrack&&window.hvTrack('generate_lead',{interest:data.interesse||''});
      if(cfg.formEndpoint){
        try{
          status.textContent='Enviando...';
          const r=await fetch(cfg.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
          if(!r.ok) throw new Error('Falha no envio');
          location.href=cfg.successUrl||'obrigado.html';
        }catch(err){ status.textContent='Não foi possível enviar agora. Use o WhatsApp para falar conosco.'; }
      } else {
        status.textContent='Formulário em modo de configuração. Defina o endpoint em assets/js/config.js.';
      }
    });
  }
})();
