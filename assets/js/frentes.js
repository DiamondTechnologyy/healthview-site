(function(){
  const panel=document.getElementById('frente-panel');
  const tiles=[...document.querySelectorAll('.hero-tags li')];
  if(!panel || !tiles.length) return;

  const articles=[...panel.querySelectorAll('article')];
  let open=-1;

  function set(index){
    open=index;
    tiles.forEach((li,k)=>{
      li.classList.toggle('is-open',k===index);
      li.querySelector('.frente-btn').setAttribute('aria-expanded',String(k===index));
    });
    articles.forEach((a,k)=>{ a.hidden = k!==index; });
    panel.hidden = index<0;
    if(index>=0){
      window.hvTrack && window.hvTrack('frente_open',{frente:articles[index].querySelector('h3').textContent});
      const rect=panel.getBoundingClientRect();
      if(rect.bottom>window.innerHeight) panel.scrollIntoView({block:'nearest'});
    }
  }

  tiles.forEach((li,k)=>{
    li.querySelector('.frente-btn').addEventListener('click',()=>set(open===k?-1:k));
  });
  panel.querySelector('.frente-close').addEventListener('click',()=>{
    const last=open;
    set(-1);
    if(last>=0) tiles[last].querySelector('.frente-btn').focus();
  });
})();
