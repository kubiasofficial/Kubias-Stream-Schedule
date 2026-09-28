const assert=require('node:assert/strict');
const base='http://127.0.0.1:8080/v1/projects/demo-kubias/databases/(default)/documents';
const token=uid=>[Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({iss:'https://securetoken.google.com/demo-kubias',aud:'demo-kubias',sub:uid,user_id:uid,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,firebase:{sign_in_provider:'google.com'}})).toString('base64url'),''].join('.');
const fields=data=>Object.fromEntries(Object.entries(data).map(([k,v])=>[k,typeof v==='string'?{stringValue:v}:typeof v==='boolean'?{booleanValue:v}:{integerValue:String(v)}]));
let count=0;async function req(path,method,body,auth){return fetch(base+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},body:body?JSON.stringify(body):undefined});}
async function check(name,response,ok){const r=await response;const s=await r.text();assert.equal(r.ok,ok,name+': '+r.status+' '+s);console.log('PASS '+name);count++;}
const data={title:'WestHaven',description:'Story',category:'RedM',art:'ROLEPLAY',theme:'rp',platform:'twitch',start:Date.now()+3600000,end:Date.now()+7200000,status:'confirmed',visibility:'published',liveUntil:0,change:'',version:1};
const write=(id,d,auth)=>req(':commit','POST',{writes:[{update:{name:'projects/demo-kubias/databases/(default)/documents/streams/'+id,fields:fields(d)},updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}]}]},auth);
(async()=>{
 const reset=await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-kubias/databases/(default)/documents',{method:'DELETE'});assert.equal(reset.ok,true,'Emulator reset');
 await check('seed admin with emulator owner',req('/admins/owner','PATCH',{fields:fields({enabled:true})},'owner'),true);
 await check('anonymous cannot create',write('public',data),false);
 await check('ordinary user cannot create',write('public',data,token('visitor')),false);
 await check('cannot self grant admin',req('/admins/visitor','PATCH',{fields:fields({enabled:true})},token('visitor')),false);
 await check('admin create published',write('public',data,token('owner')),true);
 await check('public read',req('/streams/public','GET'),true);
 await check('admin create draft',write('draft',{...data,visibility:'draft'},token('owner')),true);
 await check('anonymous cannot read draft',req('/streams/draft','GET'),false);
 await check('visitor cannot read draft',req('/streams/draft','GET',null,token('visitor')),false);
 await check('admin reads draft',req('/streams/draft','GET',null,token('owner')),true);
 await check('stale version rejected',write('public',data,token('owner')),false);
 await check('admin edit',write('public',{...data,version:2,title:'Updated'},token('owner')),true);
 await check('invalid time rejected',write('bad',{...data,end:data.start-1},token('owner')),false);
 await check('unknown fields rejected',write('bad',{...data,secret:'x'},token('owner')),false);
 await check('live cancelled rejected',write('bad',{...data,status:'cancelled',liveUntil:data.end},token('owner')),false);
 await check('live max duration rejected',write('bad',{...data,end:Date.now()+12*3600000,liveUntil:Date.now()+10*3600000},token('owner')),false);
 await check('admin live accepted',write('live',{...data,liveUntil:data.end},token('owner')),true);
 await check('visitor delete rejected',req('/streams/public','DELETE',null,token('visitor')),false);
 await check('admin delete accepted',req('/streams/public','DELETE',null,token('owner')),true);
 console.log(count+' security checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
