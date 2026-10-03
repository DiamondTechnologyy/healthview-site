(function(){
  const cfg = window.HV_CONFIG || {};
  window.dataLayer = window.dataLayer || [];
  window.hvTrack = function(eventName, params){
    window.dataLayer.push({event:eventName,...(params||{})});
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params || {});
    if (typeof window.fbq === 'function' && eventName === 'generate_lead') window.fbq('track','Lead',params||{});
  };

  if (cfg.gtmId) {
    window.dataLayer.push({'gtm.start': new Date().getTime(), event:'gtm.js'});
    const s=document.createElement('script');
    s.async=true;
    s.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(cfg.gtmId);
    document.head.appendChild(s);
  }
})();
