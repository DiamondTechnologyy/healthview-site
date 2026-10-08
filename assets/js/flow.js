(function(){
  const root=document.querySelector('.flow-panel');
  if(!root) return;

  const steps=[...root.querySelectorAll('.flow-step')];
  const scenes=[...root.querySelectorAll('.scene')];
  const DURATION=7000;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current=0, timer=null, visible=false;

  root.style.setProperty('--dur',DURATION+'ms');

  function show(index){
    current=index;
    clearTimeout(timer);

    // Remove e recoloca as classes para reiniciar as animações da etapa.
    steps.forEach(s=>s.classList.remove('is-active','is-done'));
    scenes.forEach(s=>s.classList.remove('is-active'));
    void root.offsetWidth;

    steps.forEach((s,k)=>{
      s.classList.toggle('is-active',k===index);
      s.classList.toggle('is-done',k<index);
      s.setAttribute('aria-pressed',String(k===index));
    });
    scenes[index].classList.add('is-active');

    if(visible && !reduced){
      timer=setTimeout(()=>show((current+1)%steps.length),DURATION);
    }
  }

  steps.forEach((s,k)=>s.addEventListener('click',()=>show(k)));

  if(reduced || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      visible=entry.isIntersecting;
      root.classList.toggle('is-playing',visible);
      if(visible) show(current);
      else clearTimeout(timer);
    });
  },{threshold:.35}).observe(root);
})();
