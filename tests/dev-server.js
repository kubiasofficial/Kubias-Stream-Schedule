import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import calendar from '../api/calendar.js';
const root=resolve(fileURLToPath(new URL('../public/',import.meta.url))),emulated=process.env.KUBIAS_EMULATOR==='1';
const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
if(emulated){const original=globalThis.fetch;globalThis.fetch=(url,opts)=>original(typeof url==='string'&&url.startsWith('https://firestore.googleapis.com/v1/projects/')?url.replace(/^https:\/\/firestore.googleapis.com\/v1\/projects\/[^/]+/,'http://127.0.0.1:8080/v1/projects/demo-kubias'):url,opts);}
createServer(async(req,res)=>{
 try{
  for(const {key,value}of config.headers[0].headers)res.setHeader(key,emulated&&key==='Content-Security-Policy'?value.replace("connect-src 'self'","connect-src 'self' http://127.0.0.1:8080 http://127.0.0.1:9099"):value);
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/api/calendar')return calendar(req,res);
  const path=resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!path.startsWith(root+sep)){res.statusCode=403;return res.end();}
  let data=await readFile(path);
  if(emulated&&pathname==='/firebase-config.js')data=Buffer.from("export const firebaseConfig={apiKey:'demo-key',projectId:'demo-kubias',authDomain:'demo-kubias.firebaseapp.com',appId:'demo-app'};");
  if(emulated&&pathname==='/firebase-client.js')data=Buffer.from(data.toString().replace('return {fs,auth,db:fs.getFirestore(instance),account:auth.getAuth(instance)};',"const db=fs.getFirestore(instance),account=auth.getAuth(instance); fs.connectFirestoreEmulator(db,'127.0.0.1',8080); auth.connectAuthEmulator(account,'http://127.0.0.1:9099'); window.KubiasTestClients??={};return window.KubiasTestClients[name]={fs,auth,db,account};"));
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'})[extname(path)]||'text/plain');res.setHeader('Cache-Control','no-store');res.end(data);
 }catch{res.statusCode=404;res.end('Not found');}
}).listen(4175,'127.0.0.1',()=>console.log('http://127.0.0.1:4175 '+(emulated?'(demo emulator only)':'')));
