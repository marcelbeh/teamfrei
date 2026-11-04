// Desktop enhancements: local-first, no backend configuration required.
(() => {
 const css=document.createElement('style');
 css.textContent=`
 .panel{box-shadow:0 8px 24px #203b6110}.calendar td.mine:hover{outline:2px solid #246bc0;outline-offset:-2}
 .year-note{font-size:12px;color:#667c98}.chart-bars{display:grid;gap:12px;margin:16px 0}
 .chart-row{display:grid;grid-template-columns:130px 1fr 55px;align-items:center;gap:12px}
 .chart-track{height:14px;background:#e8eef8;border-radius:20px;overflow:hidden}
 .chart-fill{height:100%;background:#3579c7;border-radius:20px}
 .audit-list{display:grid;gap:8px}.audit-item{border:1px solid #dce5f1;padding:12px;border-radius:9px}
 .audit-item small{display:block;color:#65758d;margin-top:4px}
 `;
 document.head.append(css);
 const section=document.createElement('section');
 section.id='history';section.className='view';
 section.innerHTML='<div class="top"><h1>Änderungsprotokoll</h1></div><div class="panel"><p class="muted">Dokumentation der Änderungen mit ausgewähltem Profil. Keine verifizierte Identität und kein revisionssicheres Protokoll.</p><div id="auditRows" class="audit-list"></div></div>';
 document.querySelector('main').append(section);
 const nav=document.createElement('button');nav.dataset.view='history';nav.textContent='◷ Änderungsprotokoll';
 document.querySelector('nav button[data-view="settings"]').before(nav);
 nav.onclick=()=>{document.querySelectorAll('nav button,.view').forEach(e=>e.classList.remove('active'));nav.classList.add('active');section.classList.add('active');showHistory()};
 const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const showHistory=()=>{
  const entries=(data.history||[]).slice().reverse().slice(0,100);
  document.getElementById('auditRows').innerHTML=entries.length?entries.map(x=>{
   const v=x.next||x.previous||{};
   const when=x.at?new Date(x.at).toLocaleString('de-DE'):'unbekannt';
   return '<div class="audit-item"><strong>'+safe(x.by||'Unbekannt')+'</strong> · '+safe(x.action)+' · '+safe(v.from||'')+' – '+safe(v.to||'')+'<small>'+safe(when)+'</small></div>';
  }).join(''):'<p class="empty">Noch keine Änderungen dokumentiert.</p>';
 };
 const chart=document.getElementById('charts');
 chart.innerHTML='<div class="top"><h1>Frankies Urlaubscharts</h1></div><div class="panel"><div class="frankie"><span class="sloth">🦥🏆</span><div><h2>Jahresrückblick</h2><p id="chartsIntro">Nur im Dezember verfügbar.</p></div></div><div id="chartsContent"></div></div>';
 const showCharts=()=>{
  const monthNow=new Date().getMonth(),yearNow=new Date().getFullYear();
  const intro=document.getElementById('chartsIntro'),body=document.getElementById('chartsContent');
  if(monthNow!==11){intro.textContent='Frankie rückt die Pokale erst im Dezember heraus.';body.innerHTML='';return}
  intro.textContent='Urlaubstage '+yearNow+' · nur abgestimmte und in SAP bearbeitete Einträge';
  const counts=people.map(p=>{
   const dates=new Set();
   data.wishes.filter(w=>w.person===p.name&&w.kind==='vacation'&&w.status!=='planned').forEach(w=>{
    for(let d=dayOf(w.from),end=dayOf(w.to);d<=end;d.setDate(d.getDate()+1)){
     const s=iso(d.getFullYear(),d.getMonth(),d.getDate());
     if(d.getFullYear()===yearNow&&isWork(s))dates.add(s);
    }
   });
   return {name:p.name,count:dates.size};
  }).sort((a,b)=>b.count-a.count);
  const max=Math.max(1,...counts.map(x=>x.count));
  body.innerHTML='<div class="chart-bars">'+counts.map(p=>'<div class="chart-row"><b>'+safe(p.name)+'</b><div class="chart-track"><div class="chart-fill" style="width:'+(100*p.count/max)+'%"></div></div><b>'+p.count+' T.</b></div>').join('')+'</div><p class="hint">Frankies Auswertung ist humorvoll und keine Leistungsbewertung.</p>';
 };
 const originalRender=render;
 render=function(){originalRender();if(section.classList.contains('active'))showHistory();if(chart.classList.contains('active'))showCharts()};
 document.querySelector('nav button[data-view="charts"]').addEventListener('click',showCharts);
 const note=document.createElement('p');note.className='year-note';note.textContent='Wochenenden und NRW-Feiertage zählen nicht als Urlaubstage.';
 document.getElementById('fairRows').closest('.panel').append(note);
 const today=document.createElement('button');today.className='btn secondary';today.textContent='Heute';
 today.onclick=()=>{const now=new Date();year=now.getFullYear();month=now.getMonth();render()};
 document.getElementById('monthLabel').after(today);
 // Demo data are illustrative and should not be mistaken for real team absences.
 const demo=document.createElement('span');demo.className='tag';demo.textContent='Demo-Daten – vor Nutzung prüfen';
 document.querySelector('header .grow').before(demo);
})();
