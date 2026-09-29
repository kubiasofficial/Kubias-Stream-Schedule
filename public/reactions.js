import {connectVisitor} from './firebase-client.js';
const empty=()=>({going:0,maybe:0,unavailable:0});
const choices=['going','maybe','unavailable'];
const totals=new Map(),listeners=new Map();
let c,ready,own={},busy=false,authTask,ownStop=()=>{},nextAllowed=0;
const notify=()=>window.dispatchEvent(new Event('kubias-reactions'));
const message=error=>['auth/operation-not-allowed','auth/admin-restricted-operation'].includes(error.code)?'Reakce zatím nejsou aktivované. Zkus to později.':error.code==='permission-denied'?'Reakci nelze uložit. Zkus obnovit stránku; stream už může být uzavřený.':error.code==='unavailable'?'Bez připojení nelze reakci uložit.':error.message||'Reakci se nepodařilo uložit.';
async function init(){c=await connectVisitor();if(!c)throw Error('Reakce vyžadují propojení s Firebase.');await c.account.authStateReady();c.auth.onAuthStateChanged(c.account,user=>{ownStop();own={};notify();if(user)ownStop=c.fs.onSnapshot(c.fs.collection(c.db,'visitors',user.uid,'votes'),snap=>{own=Object.fromEntries(snap.docs.map(d=>[d.id,d.data().choice]));notify();},()=>{own={};notify();});});return c;}
const client=()=>ready??=init();
async function identity(){await client();if(c.account.currentUser)return c.account.currentUser;if(!authTask)authTask=c.auth.signInAnonymously(c.account).finally(()=>authTask=null);return (await authTask).user;}
async function save(id,choice){
 const user=await identity(),{fs,db}=c;
 const vote=fs.doc(db,'visitors',user.uid,'votes',id),stats=fs.doc(db,'streams',id,'stats','reactions'),guard=fs.doc(db,'visitors',user.uid);
 await fs.runTransaction(db,async tx=>{
  const [v,t,g]=await Promise.all([tx.get(vote),tx.get(stats),tx.get(guard)]);
  const previous=v.exists()?v.data().choice:null;
  if(previous===choice)return;
  if(g.exists()&&Date.now()-g.data().updatedAt.toMillis()<3100)throw Error('Mezi reakcemi počkej alespoň 3 sekundy.');
  if(choice){const s=await tx.get(fs.doc(db,'streams',id));if(!s.exists()||s.data().visibility!=='published'||s.data().status==='cancelled'||s.data().start<=Date.now())throw Error('Reakce na tento stream už jsou uzavřené.');}
  const counts=t.exists()?{...t.data()}:empty();delete counts.updatedAt;
  if(previous)counts[previous]--;if(choice)counts[choice]++;
  if(choice)tx.set(vote,{choice,updatedAt:fs.serverTimestamp()});else tx.delete(vote);
  tx.set(stats,{...counts,updatedAt:fs.serverTimestamp()});tx.set(guard,{updatedAt:fs.serverTimestamp()});
 });
 nextAllowed=Date.now()+3100;
}
window.KubiasReactions={
 get busy(){return busy;},
 counts:id=>totals.get(id),choice:id=>own[id],
 async watch(ids){try{await client();const wanted=new Set(ids);for(const [id,stop]of listeners)if(!wanted.has(id)){stop();listeners.delete(id);totals.delete(id);}for(const id of wanted)if(!listeners.has(id)){listeners.set(id,c.fs.onSnapshot(c.fs.doc(c.db,'streams',id,'stats','reactions'),snap=>{totals.set(id,snap.exists()?snap.data():empty());notify();},()=>{totals.set(id,null);notify();}));}}catch{notify();}},
 async toggle(id,choice){if(busy)throw Error('Počkej na dokončení předchozí reakce.');if(!choices.includes(choice))throw Error('Neplatná reakce.');busy=true;notify();try{await save(id,own[id]===choice?null:choice);return 'Reakce uložená. Společné počty se aktualizují.';}catch(e){throw Error(message(e));}finally{busy=false;notify();}},
 async clear(){if(busy)throw Error('Počkej na dokončení předchozí reakce.');busy=true;notify();try{await client();if(!c.account.currentUser)return 'Nemáš uložené společné reakce.';const docs=await c.fs.getDocs(c.fs.collection(c.db,'visitors',c.account.currentUser.uid,'votes'));for(const d of docs.docs){await new Promise(r=>setTimeout(r,Math.max(0,nextAllowed-Date.now(),3200)));await save(d.id,null);}return 'Tvoje společné reakce byly odebrány.';}catch(e){throw Error(message(e));}finally{busy=false;notify();}}
};
window.dispatchEvent(new Event('kubias-reactions-ready'));
client().catch(()=>{});
