(function(){
  'use strict';
  if(!document.querySelector('.app')||document.getElementById('scanOpen'))return;
  var open=document.createElement('button');
  open.id='scanOpen';open.textContent='📷 ZelConta Scan — fotografar comprovante';
  open.style.cssText='display:block;width:100%;padding:13px;margin:12px 0;border:1px solid var(--pri);border-radius:12px;background:var(--surf);color:var(--pri);font-weight:700';
  document.getElementById('sum').insertAdjacentElement('afterend',open);
  var box=document.createElement('div');box.className='ov';box.style.zIndex=30;
  box.innerHTML='<div class="sheet" role="dialog" aria-modal="true">'+
   '<h3>📷 ZelConta Scan</h3><p class="hint">Fotografe a nota e confira os dados. A foto não será salva.</p>'+
   '<label>Fotografia</label><input id="scanFile" type="file" accept="image/*" capture="environment">'+
   '<p class="hint" id="scanStatus" aria-live="polite"></p>'+
   '<label>Estabelecimento</label><input id="scanPlace" maxlength="100" placeholder="Ex.: Posto Petrobras Cuiabá">'+
   '<label>Valor total (R$)</label><input id="scanAmount" inputmode="decimal" placeholder="0,00">'+
   '<label>Categoria</label><select id="scanCategory"></select>'+
   '<label>Data</label><input id="scanDate" type="date">'+
   '<div class="acts"><button id="scanClose">Cancelar</button><button id="scanConfirm" class="ok">Confirmar lançamento</button></div></div>';
  document.body.appendChild(box);
  function el(id){return document.getElementById(id);}
  function msg(s){el('scanStatus').textContent=s;}
  function date(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function cats(){
    var names=(store.goals||[]).map(function(g){return g.name;});
    ['Combustível','Mercado','Restaurante','Farmácia','Outros'].forEach(function(n){if(!names.includes(n))names.push(n);});
    el('scanCategory').replaceChildren();
    names.forEach(function(n){el('scanCategory').add(new Option(n,n));});
  }
  var generation=0,busy=false;
  function close(){generation++;busy=false;el('scanFile').value='';box.classList.remove('show');}
  open.onclick=function(){
    if(!uid){alert('Faça login antes de registrar despesas.');return;}
    cats();el('scanPlace').value='';el('scanAmount').value='';el('scanDate').value=date();
    msg('Escolha uma foto. A leitura é feita no celular.');box.classList.add('show');
  };
  el('scanClose').onclick=close;
  box.onclick=function(e){if(e.target===box)close();};
  var loading=null;
  function ocr(){
    if(window.Tesseract)return Promise.resolve();
    if(loading)return loading;
    loading=new Promise(function(resolve,reject){
      var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      s.onload=resolve;s.onerror=function(){reject(Error('Sem conexão com o leitor.'));};document.head.appendChild(s);
    }).catch(function(e){loading=null;throw e;});return loading;
  }
  function numbers(line){
    return (line.match(/(?:R\$\s*)?\d[\d.\s]*[,\.]\d{2}\b/g)||[]).map(function(s){
      s=s.replace(/R\$\s*|\s/g,'');
      if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');
      else s=s.replace(/,/g,'');return Number(s);
    }).filter(function(n){return Number.isFinite(n)&&n>0&&n<10000000;});
  }
  function extract(text){
    var lines=text.split(/\r?\n/).map(function(s){return s.trim();}).filter(Boolean),v=null,best=-100;
    lines.forEach(function(s,i){
      var ns=numbers(s);if(!ns.length)return;
      var rank=/TOTAL|VALOR\s*(PAGO|A\s*PAGAR)/i.test(s)?20:0;
      if(/SUBTOTAL|TROCO|DESCONTO|IMPOSTO|TRIBUTO|QUANTIDADE/i.test(s))rank-=30;
      rank+=i/Math.max(lines.length,1);
      if(rank>best){best=rank;v=Math.max.apply(null,ns);}
    });
    var good=lines.filter(function(s){return /[A-ZÀ-Ú]{3}/i.test(s)&&!/(CNPJ|CPF|NFC|DOCUMENTO|CONSUMIDOR|ENDEREÇO|EMISSÃO|TOTAL|VALOR|TRIBUTO|DESCONTO|CHAVE|DATA|HORA|ITEM)/i.test(s)&&!/^\d/.test(s);});
    var name=good.find(function(s){return /POSTO|PETROBRAS|IPIRANGA|SHELL|MERCADO|ATACAD|RESTAURANTE|LANCHONETE|FARM[ÁA]CIA|DROGARIA/i.test(s);})||good[0]||'';
    var t=text.toUpperCase();
    var cat=/POSTO|COMBUST|GASOLINA|ETANOL|PETROBRAS|IPIRANGA|SHELL/.test(t)?'Combustível':
      /MERCADO|ATACAD|HORTIFRUTI/.test(t)?'Mercado':
      /RESTAURANTE|LANCHONETE|PIZZARIA/.test(t)?'Restaurante':
      /FARM[ÁA]CIA|DROGARIA/.test(t)?'Farmácia':'Outros';
    return {v:v,name:name.slice(0,100),cat:cat};
  }
  el('scanFile').onchange=async function(){
    var file=this.files&&this.files[0];if(!file||busy)return;
    if(!file.type.startsWith('image/')){msg('Escolha uma fotografia.');return;}
    var current=++generation,worker=null;busy=true;msg('Lendo a foto… Na primeira leitura, precisa de internet.');
    try{
      await ocr();worker=await window.Tesseract.createWorker('por');
      var result=await worker.recognize(file);
      if(current!==generation)return;
      var a=extract(result.data.text||'');el('scanPlace').value=a.name;
      if(a.v!==null)el('scanAmount').value=a.v.toFixed(2).replace('.',',');
      el('scanCategory').value=a.cat;msg('Revise os dados antes de confirmar.');
    }catch(e){if(current===generation)msg('Não foi possível ler. Preencha os campos manualmente.');}
    finally{if(worker)try{await worker.terminate();}catch(e){}el('scanFile').value='';busy=false;}
  };
  el('scanConfirm').onclick=function(){
    if(busy){msg('Aguarde o fim da leitura.');return;}
    var name=el('scanPlace').value.trim();
    var value=Number(el('scanAmount').value.trim().replace(/\./g,'').replace(',','.'));
    var cat=el('scanCategory').value,d=el('scanDate').value;
    if(!name||!Number.isFinite(value)||value<=0||value>1000000||!/^\d{4}-\d\d-\d\d$/.test(d)){
      msg('Informe estabelecimento, valor e data válidos.');return;
    }
    var g=store.goals.find(function(x){return x.name===cat;});
    if(!g){g={id:'g'+Date.now()+Math.random(),name:cat,meta:0};store.goals.push(g);}
    store.spends.push({id:'s'+Date.now()+Math.random(),g:g.id,d:d,v:value,o:name});
    persist();render();close();alert('Despesa registrada no ZelConta.');
  };
})();
