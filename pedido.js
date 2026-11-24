/* Pedidos RHAqui: número do pedido, envio da ficha por e-mail e WhatsApp curto. */
(function(){
  var URL='https://script.google.com/macros/s/AKfycbwekRUizk6ZlSWw73VJfRgfAoAP_Y8dwzQk9-iytSlTjWriidGmPwZMHlnL7JBxHceQtA/exec';
  function p2(n){return (n<10?'0':'')+n}
  function codigo(){var d=new Date();return 'RHA-'+p2(d.getDate())+p2(d.getMonth()+1)+'-'+(1000+Math.floor(Math.random()*9000))}
  window.RHAquiPedido={
    /* o: {servico, wa, empresa, nome, telefone, cidade, linhas[], hp} */
    enviar:function(o){
      var c=codigo();
      var ficha=['Número do pedido: #'+c,'Serviço: '+o.servico].concat(o.linhas||[]);
      var resumo=o.resumo||o.servico,quem=o.empresa||o.nome||'';
      var assunto='#'+c+' | '+(quem?quem+' | ':'')+resumo;
      var corpo=JSON.stringify({codigo:c,servico:o.servico,resumo:resumo,assunto:assunto,empresa:o.empresa||'',nome:o.nome||'',telefone:o.telefone||'',
        linhas:o.linhas||[],whatsapp:o.wa||'',pagina:location.pathname,hp:o.hp||''});
      var envio=fetch(URL,{method:'POST',body:corpo,headers:{'Content-Type':'text/plain;charset=utf-8'},keepalive:true,redirect:'follow'})
        .then(function(r){return r.json()}).then(function(j){return !!(j&&j.ok)}).catch(function(){return false});
      var m=['Olá! Fiz o pedido #'+c+' pelo site da RHAqui.','Pedido: '+resumo];
      if(o.empresa)m.push('Empresa: '+o.empresa);
      if(o.nome)m.push('Nome: '+o.nome);
      if(o.telefone)m.push('Telefone: '+o.telefone);
      if(o.cidade)m.push('Cidade: '+o.cidade);
      m.push('A ficha completa foi enviada por e-mail com este número.');
      return {codigo:c,envio:envio,
        wa:o.wa?'https://wa.me/'+o.wa+'?text='+encodeURIComponent(m.join('\n')):'',
        mailto:'mailto:rhaqui.solucoes@gmail.com?subject='+encodeURIComponent(assunto)+'&body='+encodeURIComponent(ficha.join('\n'))};
    },
    /* Liga um botão (link) ao envio. cfg: {botao, aviso, coleta:function()->o, obrig:[ids]} */
    ligar:function(cfg){
      var b=cfg.botao,av=cfg.aviso;
      b.addEventListener('click',function(ev){
        var o=cfg.coleta(),falta=(cfg.obrig||[]).filter(function(k){return !o[k]});
        if(falta.length){ev.preventDefault();av.className='aviso-ped erro';av.textContent='Preencha seu nome e telefone para enviar o pedido.';return}
        var r=RHAquiPedido.enviar(o);
        if(r.wa){b.href=r.wa}else{ev.preventDefault()}
        av.className='aviso-ped ok';
        av.innerHTML='Pedido <b>#'+r.codigo+'</b> registrado. '+(r.wa?'Confirme o envio no WhatsApp que abriu. ':'')+'Guarde este número.';
        r.envio.then(function(ok){
          if(ok){av.innerHTML+=' A ficha chegou à nossa equipe por e-mail.';}
          else{av.className='aviso-ped erro';av.innerHTML='Pedido <b>#'+r.codigo+'</b>: não conseguimos enviar a ficha automaticamente. <a href="'+r.mailto+'">Toque aqui para enviar por e-mail</a>.';}
        });
      });
    }
  };
})();
