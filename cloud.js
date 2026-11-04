// Optional Supabase backend. Without config.js, TeamFrei remains a local demo.
// Anonymous Auth is an invisible technical session; users still select a profile.
const cfg=window.TEAMFREI_CONFIG;
if(cfg?.url&&cfg?.anonKey&&cfg?.roomId){
 const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');
 const sb=createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
 let busy=false,ready=false,queued=null;
 const status=document.createElement('span');status.style.cssText='font-size:12px;color:#d5e7ff';status.textContent='Cloud: verbinde…';document.querySelector('header .grow')?.after(status);
 const setStatus=s=>status.textContent='Cloud: '+s;
 try{
  let {data:{session},error}=await sb.auth.getSession();if(error)throw error;
  if(!session){const result=await sb.auth.signInAnonymously();if(result.error)throw result.error}
  let {data:room,error:roomErr}=await sb.from('teamfrei_state').select('document').eq('room_id',cfg.roomId).maybeSingle();
  if(roomErr)throw roomErr;
  if(!room){
   const code=prompt('Einmaliger TeamFrei-Zugangscode (vom Team erhalten):');
   if(!code)throw Error('Kein Zugangscode eingegeben');
   const joined=await sb.rpc('teamfrei_join',{p_room:cfg.roomId,p_code:code});
   if(joined.error||!joined.data)throw Error('Zugangscode ungültig');
   const result=await sb.from('teamfrei_state').select('document').eq('room_id',cfg.roomId).single();
   if(result.error)throw result.error;room=result.data;
  }
  window.teamfreiApplyRemote?.(room.document);ready=true;setStatus('verbunden');
  const push=async document=>{
   if(busy){queued=document;return}
   busy=true;
   try{
    const {error}=await sb.from('teamfrei_state').update({document,updated_at:new Date().toISOString(),updated_by:(await sb.auth.getUser()).data.user?.id}).eq('room_id',cfg.roomId);
    if(error)throw error;setStatus('gespeichert');
   }catch(e){setStatus('Fehler beim Speichern');alert('Cloud-Speicherung fehlgeschlagen: '+e.message)}
   finally{busy=false;if(queued){const next=queued;queued=null;await push(next)}}
  };
  window.teamfreiCloud={save:document=>push(structuredClone(document))};
  sb.channel('teamfrei-'+cfg.roomId).on('postgres_changes',{event:'UPDATE',schema:'public',table:'teamfrei_state',filter:'room_id=eq.'+cfg.roomId},payload=>{
   if(busy)return;window.teamfreiApplyRemote?.(payload.new.document);setStatus('aktualisiert');
  }).subscribe();
 }catch(e){setStatus('nicht verbunden');console.error(e);alert('TeamFrei-Cloud nicht verbunden: '+e.message+'\nÄnderungen werden nur lokal gespeichert.')}
}else{
 const s=document.createElement('span');s.style.cssText='font-size:12px;color:#ffe6b0';s.textContent='Demo · nur dieser Browser';document.querySelector('header .grow')?.after(s);
}
