/* Contagem pública de pedidos por serviço (site RHAqui).
   Lê ?acao=contagem do script "Pedidos RHAqui" e preenche:
   - <span class="cont" data-cont="Serviço A|Serviço B"></span>  → "N pedidos recebidos"
   - <ul data-cont-lista="Serviço A|Serviço B"> → lista com número por serviço
   Itens com zero ficam escondidos. */
(function(){
  var U='https://script.google.com/macros/s/AKfycbwekRUizk6ZlSWw73VJfRgfAoAP_Y8dwzQk9-iytSlTjWriidGmPwZMHlnL7JBxHceQtA/exec?acao=contagem';
  if(!window.fetch)return;
  var st=document.createElement('style');
  st.textContent='.cont{display:inline-flex;align-items:center;gap:6px;margin:6px 0 12px;padding:4px 10px;border-radius:999px;background:#E6F6F2;color:#0F766E;font-size:12.5px;font-weight:700;line-height:1.3}.cont:before{content:"";width:7px;height:7px;border-radius:50%;background:#7ED67A}.cont[hidden]{display:none}';
  document.head.appendChild(st);
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function lista(a){return String(a||'').split('|').map(function(x){return x.trim()}).filter(Boolean)}
  fetch(U).then(function(r){return r.json()}).then(function(d){
    if(!d||!d.ok||!d.itens)return;
    var m={};d.itens.forEach(function(x){m[x.servico]=(+x.total||0)});
    [].forEach.call(document.querySelectorAll('[data-cont]'),function(el){
      var n=lista(el.getAttribute('data-cont')).reduce(function(s,k){return s+(m[k]||0)},0);
      if(n>0){el.textContent=n+(n===1?' pedido recebido':' pedidos recebidos');el.hidden=false}
    });
    [].forEach.call(document.querySelectorAll('[data-cont-lista]'),function(ul){
      var it=lista(ul.getAttribute('data-cont-lista')).filter(function(k){return m[k]>0}).sort(function(a,b){return m[b]-m[a]});
      if(!it.length)return;
      ul.innerHTML=it.map(function(k){return '<li><span class="qt">'+m[k]+'</span> '+esc(k)+'</li>'}).join('');
      var box=ul.closest('[hidden]');if(box)box.hidden=false;
    });
  }).catch(function(){});
})();
