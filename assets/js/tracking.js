(function(){
  const cfg = window.HV_CONFIG || {};
  const consentDefaults = { necessary:true, analytics:false, marketing:false };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  window.gtag('consent','default',{
    analytics_storage:'denied',
    ad_storage:'denied',
    ad_user_data:'denied',
    ad_personalization:'denied',
    wait_for_update:500
  });

  window.HV_CONSENT = window.HV_CONSENT || consentDefaults;

  const loaded = { google:false, gtm:false, meta:false };

  function addScript(src,id){
    if(id && document.getElementById(id)) return;
    const s=document.createElement('script');
    s.async=true;
    s.src=src;
    if(id) s.id=id;
    document.head.appendChild(s);
  }

  function loadGoogle(){
    if(loaded.google) return;
    const id=cfg.ga4MeasurementId||cfg.googleAdsId;
    if(!id) return;
    loaded.google=true;
    addScript('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id),'hv-google-tag');
    window.gtag('js',new Date());
    if(cfg.ga4MeasurementId) window.gtag('config',cfg.ga4MeasurementId);
    if(cfg.googleAdsId) window.gtag('config',cfg.googleAdsId);
  }

  function loadGtm(){
    if(loaded.gtm || !cfg.gtmId) return;
    loaded.gtm=true;
    window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    addScript('https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(cfg.gtmId),'hv-gtm');
  }

  function loadMeta(){
    if(loaded.meta || !cfg.metaPixelId) return;
    loaded.meta=true;
    if(!window.fbq){
      const fbq=function(){ fbq.callMethod ? fbq.callMethod.apply(fbq,arguments) : fbq.queue.push(arguments); };
      fbq.push=fbq; fbq.loaded=true; fbq.version='2.0'; fbq.queue=[];
      window.fbq=fbq;
    }
    addScript('https://connect.facebook.net/en_US/fbevents.js','hv-meta-pixel');
    window.fbq('init',cfg.metaPixelId);
    window.fbq('track','PageView');
  }

  window.hvApplyConsent = function(consent){
    const normalized={
      necessary:true,
      analytics:!!(consent&&consent.analytics),
      marketing:!!(consent&&consent.marketing)
    };
    window.HV_CONSENT=normalized;

    window.gtag('consent','update',{
      analytics_storage:normalized.analytics?'granted':'denied',
      ad_storage:normalized.marketing?'granted':'denied',
      ad_user_data:normalized.marketing?'granted':'denied',
      ad_personalization:normalized.marketing?'granted':'denied'
    });

    if(normalized.analytics || normalized.marketing){
      loadGoogle();
      loadGtm();
    }
    if(normalized.marketing) loadMeta();
  };

  window.hvTrack = function(eventName, params){
    const consent=window.HV_CONSENT||consentDefaults;
    if(!consent.analytics && !consent.marketing) return;

    const payload=params||{};
    window.dataLayer.push({event:eventName,...payload});

    if(consent.analytics && typeof window.gtag==='function'){
      window.gtag('event',eventName,payload);
    }

    if(consent.marketing && eventName==='generate_lead'){
      if(typeof window.fbq==='function') window.fbq('track','Lead',payload);
      if(cfg.googleAdsId && cfg.googleAdsConversionLabel && typeof window.gtag==='function'){
        window.gtag('event','conversion',{
          send_to:cfg.googleAdsId+'/'+cfg.googleAdsConversionLabel
        });
      }
    }
  };
})();
