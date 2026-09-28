import {connect} from './firebase-client.js';
const status=document.querySelector('#data-status');
const send=events=>window.dispatchEvent(new CustomEvent('kubias-streams',{detail:events}));
try {
 const client=await connect();
 if(client){
  send([]);status.textContent='NAČÍTÁM PROGRAM';
  const {fs,db}=client;
  fs.onSnapshot(fs.query(fs.collection(db,'streams'),fs.where('visibility','==','published'),fs.orderBy('start','desc'),fs.limit(200)),snap=>{
   const events=snap.docs.map(d=>({...d.data(),id:d.id})).filter(e=>['twitch','kick'].includes(e.platform)&&Number.isFinite(e.start)&&Number.isFinite(e.end)).map(e=>({...e,date:window.KubiasSchedule.dateKey(e.start)})).sort((a,b)=>a.start-b.start);
   send(events);status.textContent=snap.metadata.fromCache?'PROGRAM · OVĚŘUJI SPOJENÍ':'AKTUÁLNÍ PROGRAM';
  },()=>{send([]);status.textContent='PROGRAM SE NEPODAŘILO NAČÍST · OBNOV STRÁNKU';});
 } else status.textContent='OZNÁMENÝ PROGRAM';
} catch {send([]);status.textContent='PROGRAM NENÍ DOSTUPNÝ · OBNOV STRÁNKU';}
