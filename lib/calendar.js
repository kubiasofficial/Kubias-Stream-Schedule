const stamp=ms=>new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
const escape=value=>String(value??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
function fold(line){const lines=[];let current='',bytes=0;for(const char of line){const n=Buffer.byteLength(char);if(bytes+n>73){lines.push(current);current=' ';bytes=1;}current+=char;bytes+=n;}lines.push(current);return lines.join('\r\n');}
export function calendar(events){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//KUBIAS//Program//CS','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:KUBIAS — rozpis streamů','X-WR-TIMEZONE:Europe/Prague','REFRESH-INTERVAL;VALUE=DURATION:PT1H','X-PUBLISHED-TTL:PT1H'];
 for(const e of events.filter(e=>e.visibility==='published').sort((a,b)=>a.start-b.start)){
  if(!Number.isFinite(e.start)||!Number.isFinite(e.end)||e.end<=e.start)throw Error('Invalid calendar event');
  const updated=Number.isFinite(e.updatedAt)?e.updatedAt:e.start;
  lines.push('BEGIN:VEVENT','UID:'+escape(e.id)+'@kubias.schedule','DTSTAMP:'+stamp(updated),'LAST-MODIFIED:'+stamp(updated),'SEQUENCE:'+(Number.isSafeInteger(e.version)?e.version:0),'DTSTART:'+stamp(e.start),'DTEND:'+stamp(e.end),'SUMMARY:'+escape('Kubias — '+e.title),'DESCRIPTION:'+escape(e.description+(e.change?'\n'+e.change:'')),'URL:'+(e.platform==='kick'?'https://kick.com/':'https://www.twitch.tv/kubiasofiko'),'STATUS:'+(e.status==='cancelled'?'CANCELLED':e.status==='tentative'?'TENTATIVE':'CONFIRMED'),'TRANSP:TRANSPARENT','END:VEVENT');
 }
 lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
export function fromFirestore(doc){const result={id:doc.name.split('/').at(-1)};for(const [key,v]of Object.entries(doc.fields||{}))result[key]='stringValue'in v?v.stringValue:'integerValue'in v?Number(v.integerValue):'doubleValue'in v?v.doubleValue:'timestampValue'in v?Date.parse(v.timestampValue):null;return result;}
