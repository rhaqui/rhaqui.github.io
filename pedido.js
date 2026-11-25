/* Pedidos RHAqui: número do pedido, envio da ficha por e-mail e WhatsApp curto. */
(function(){
  var URL='https://script.google.com/macros/s/AKfycbwekRUizk6ZlSWw73VJfRgfAoAP_Y8dwzQk9-iytSlTjWriidGmPwZMHlnL7JBxHceQtA/exec';
  function p2(n){return (n<10?'0':'')+n}
  function codigo(){var d=new Date();return 'RHA-'+p2(d.getDate())+p2(d.getMonth()+1)+'-'+(1000+Math.floor(Math.random()*9000))}
  var ICONE_ENVIAR='<svg viewBox="0 0 24 24"><path d="M2.5 20.5 22 12 2.5 3.5 2.5 10l13 2-13 2z"/></svg>';
  var ICONE_WA='<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.4z"/></svg>';
  function estilo(){
    if(document.getElementById('ped-css'))return;
    var st=document.createElement('style');st.id='ped-css';
    st.textContent='.ped-oculto{display:none!important}'+
      '.aviso-ped.ped-conf{display:block;background:#fff;color:#16352d;border:2px solid #0F766E;box-shadow:0 8px 22px rgba(15,58,50,.12)}'+
      '.ped-tit{display:block;font-size:16px;margin-bottom:8px;color:#0F3A32}'+
      '.ped-res{list-style:none;margin:0 0 10px;padding:0;font-size:14px}'+
      '.ped-res li{padding:6px 0;border-bottom:1px solid #E3ECE9;line-height:1.4;overflow-wrap:anywhere}'+
      '.ped-res li span{display:block;font-size:11.5px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#5b6b66}'+
      '.ped-res li.ped-l{color:#5b6b66}'+
      '.ped-ob{margin:6px 0 10px;font-size:14px;line-height:1.5}'+
      '.ped-bts{display:grid;grid-template-columns:1.4fr 1fr;gap:8px}'+
      '.ped-bts button{font:inherit;font-weight:700;font-size:15px;border-radius:999px;padding:12px 10px;cursor:pointer;border:1px solid #0F766E}'+
      '.ped-ok{background:#0F766E;color:#fff}.ped-ok:disabled{opacity:.7;cursor:wait}'+
      '.ped-corr{background:#fff;color:#0F3A32}'+
      'a.ped-wa{display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:#fff!important;text-decoration:none;font-weight:700;border-radius:999px;padding:12px 14px;margin-top:4px}'+
      'a.ped-wa svg{width:20px;height:20px;fill:#fff}';
    document.head.appendChild(st);
  }
  window.RHAquiPedido={
    /* o: {servico, wa, empresa, nome, telefone, cidade, linhas[], hp} */
    enviar:function(o){
      var c=codigo();
      if(o.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(o.email))o.email='';
      if(o.email)o.linhas=(o.linhas||[]).concat(['E-mail: '+o.email]);
      var ficha=['Número do pedido: #'+c,'Serviço: '+o.servico].concat(o.linhas||[]);
      var resumo=o.resumo||o.servico,quem=o.empresa||o.nome||'';
      var assunto='#'+c+' | '+(quem?quem+' | ':'')+resumo;
      var corpo=JSON.stringify({codigo:c,servico:o.servico,resumo:resumo,assunto:assunto,empresa:o.empresa||'',nome:o.nome||'',telefone:o.telefone||'',email:o.email||'',
        linhas:o.linhas||[],whatsapp:o.wa||'',pagina:location.pathname,hp:o.hp||'',anexos:o.anexos||[]});
      var temAnexo=!!(o.anexos&&o.anexos.length);
      var envio=fetch(URL,{method:'POST',body:corpo,headers:{'Content-Type':'text/plain;charset=utf-8'},keepalive:!temAnexo,redirect:'follow'})
        .then(function(r){return r.json()}).then(function(j){return !!(j&&j.ok)}).catch(function(){return false});
      var m=['Olá! Fiz o pedido #'+c+' pelo site da RHAqui.','Pedido: '+resumo];
      if(o.empresa)m.push('Empresa: '+o.empresa);
      if(o.nome)m.push('Nome: '+o.nome);
      if(o.telefone)m.push('Telefone: '+o.telefone);
      if(o.cidade)m.push('Cidade: '+o.cidade);
      if(temAnexo)m.push('Anexos: '+o.anexos.length+' arquivo(s), enviados junto com a ficha.');
      m.push('A ficha completa foi enviada por e-mail com este número.');
      return {codigo:c,envio:envio,
        wa:o.wa?'https://wa.me/'+o.wa+'?text='+encodeURIComponent(m.join('\n')):'',
        mailto:'mailto:rhaqui.solucoes@gmail.com?subject='+encodeURIComponent(assunto)+'&body='+encodeURIComponent(ficha.join('\n'))};
    },
    /* Liga o botão "Enviar pedido": 1) mostra o resumo na tela e pede confirmação;
       2) só depois de confirmar registra e envia a ficha; 3) mostra o número e oferece o WhatsApp (opcional).
       cfg: {botao, aviso, coleta:function()->o, obrig:[ids]} */
    ligar:function(cfg){
      var b=cfg.botao,av=cfg.aviso,form=b.closest('form')||b.parentNode;
      estilo();
      b.removeAttribute('target');b.setAttribute('href','#');b.setAttribute('role','button');
      var ic=b.querySelector('svg');if(ic)ic.outerHTML=ICONE_ENVIAR;
      function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
      function mostrarBotao(){b.classList.remove('ped-oculto')}
      form.addEventListener('input',function(){if(av.classList.contains('ped-feito')||av.classList.contains('ped-conf')){av.className='aviso-ped';av.innerHTML='';mostrarBotao()}});
      b.addEventListener('click',function(ev){
        ev.preventDefault();
        var o=cfg.coleta(),falta=(cfg.obrig||[]).filter(function(k){return !o[k]});
        if(falta.length){av.className='aviso-ped erro';av.textContent='Preencha seu nome e telefone para enviar o pedido.';return}
        if(o.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(o.email)){av.className='aviso-ped erro';av.textContent='Confira o e-mail digitado (ou deixe em branco).';return}
        var lin=['<li><span>Serviço</span>'+esc(o.servico)+'</li>'];
        if(o.resumo&&o.resumo!==o.servico)lin.push('<li><span>Pedido</span>'+esc(o.resumo)+'</li>');
        var vistos={};
        (o.linhas||[]).forEach(function(x){x=String(x);var k=x.indexOf(': ');
          if(k>0&&k<40){vistos[x.slice(0,k)]=1;lin.push('<li><span>'+esc(x.slice(0,k))+'</span>'+esc(x.slice(k+2))+'</li>')}
          else lin.push('<li class="ped-l">'+esc(x)+'</li>')});
        if(o.nome&&!vistos['Nome'])lin.push('<li><span>Nome</span>'+esc(o.nome)+'</li>');
        if(o.telefone&&!vistos['Telefone'])lin.push('<li><span>Telefone</span>'+esc(o.telefone)+'</li>');
        if(o.email&&!vistos['E-mail'])lin.push('<li><span>E-mail</span>'+esc(o.email)+'</li>');
        if(o.anexos&&o.anexos.length)lin.push('<li><span>Anexos</span>'+esc(o.anexos.map(function(a){return a.nome}).join(', '))+'</li>');
        av.className='aviso-ped ped-conf';
        av.innerHTML='<b class="ped-tit">Confira seu pedido</b><ul class="ped-res">'+lin.join('')+'</ul>'+
          '<p class="ped-ob">Está tudo certo? Ao confirmar, a ficha vai para a equipe RHAqui'+(o.email?' e uma cópia para o seu e-mail':'')+'.</p>'+
          '<div class="ped-bts"><button type="button" class="ped-ok">Confirmar e enviar</button><button type="button" class="ped-corr">Corrigir</button></div>';
        b.classList.add('ped-oculto');
        av.scrollIntoView({block:'nearest',behavior:'smooth'});
        av.querySelector('.ped-corr').onclick=function(){av.className='aviso-ped';av.innerHTML='';mostrarBotao();b.focus()};
        av.querySelector('.ped-ok').onclick=function(){
          var bt=this;bt.disabled=true;bt.textContent='Enviando...';av.querySelector('.ped-corr').disabled=true;
          var r=RHAquiPedido.enviar(o);
          r.envio.then(function(ok){
            var wa=r.wa?'<a class="ped-wa" href="'+esc(r.wa)+'" target="_blank" rel="noopener">'+ICONE_WA+' Chamar no WhatsApp</a>':'';
            if(ok){
              av.className='aviso-ped ok ped-feito';
              av.innerHTML='<b class="ped-tit">&#10003; Pedido #'+esc(r.codigo)+' enviado</b>'+
                '<p class="ped-ob">A ficha chegou à nossa equipe por e-mail'+(o.email?' e enviamos uma cópia para '+esc(o.email)+' (veja também o spam)':'')+'. Guarde este número. Vamos falar com você pelo telefone informado.</p>'+
                (wa?'<p class="ped-ob">Quer adiantar a conversa? Chame no WhatsApp (opcional):</p>'+wa:'');
            }else{
              av.className='aviso-ped erro ped-feito';
              av.innerHTML='Pedido <b>#'+esc(r.codigo)+'</b>: não conseguimos enviar a ficha automaticamente. <a href="'+esc(r.mailto)+'">Toque aqui para enviar por e-mail</a>'+(o.anexos&&o.anexos.length?' e anexe os arquivos nele':'')+'.'+(wa?'<br>'+wa:'');
            }
            av.scrollIntoView({block:'nearest',behavior:'smooth'});
          });
        };
      });
    }
  };
})();
