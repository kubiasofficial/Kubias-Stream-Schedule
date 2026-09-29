import {firebaseConfig} from '../public/firebase-config.js';
import {calendar,fromFirestore} from '../lib/calendar.js';
import {createHash} from 'node:crypto';
export default async function handler(req,res){
 if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');res.statusCode=405;return res.end();}
 try {
  if(!firebaseConfig?.projectId)throw Error('Missing configuration');
  // Only public Firestore reads, no service account and no admin credentials.
  const upstream=await fetch('https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(firebaseConfig.projectId)+'/databases/(default)/documents:runQuery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({structuredQuery:{from:[{collectionId:'streams'}],where:{fieldFilter:{field:{fieldPath:'visibility'},op:'EQUAL',value:{stringValue:'published'}}}}}),signal:AbortSignal.timeout(8000)});
  if(!upstream.ok)throw Error('Calendar source unavailable');
  const rows=await upstream.json();if(!Array.isArray(rows)||rows.some(r=>r.error))throw Error('Invalid source');
  const body=calendar(rows.filter(r=>r.document).map(r=>fromFirestore(r.document)));
  const etag='"'+createHash('sha256').update(body).digest('hex')+'"';
  res.setHeader('Content-Type','text/calendar; charset=utf-8');res.setHeader('Content-Disposition','inline; filename="kubias-program.ics"');res.setHeader('Cache-Control','public, max-age=60, s-maxage=300');res.setHeader('ETag',etag);
  if(req.headers['if-none-match']===etag){res.statusCode=304;return res.end();}
  res.statusCode=200;res.end(req.method==='HEAD'?undefined:body);
 }catch{res.statusCode=503;res.setHeader('Cache-Control','no-store');res.setHeader('Retry-After','60');res.setHeader('Content-Type','text/plain; charset=utf-8');res.end(req.method==='HEAD'?undefined:'Kalendář je dočasně nedostupný. Zkuste to později.');}
}
