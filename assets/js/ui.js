(function(){
  const header=document.querySelector('.site-header');
  if(header){
    const onScroll=()=>header.classList.toggle('is-scrolled',window.scrollY>12);
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
  }

  const items=document.querySelectorAll('.reveal');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced || !('IntersectionObserver' in window)){
    items.forEach(el=>el.classList.add('is-in'));
    return;
  }

  document.documentElement.classList.add('has-reveal');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});

  items.forEach(el=>{
    const siblings=[...el.parentElement.children].filter(c=>c.classList.contains('reveal'));
    el.style.transitionDelay=(siblings.indexOf(el)*70)+'ms';
    io.observe(el);
  });
})();
