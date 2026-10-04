(function () {
  "use strict";
  const S = window.KubiasSchedule;
  const $ = (selector) => document.querySelector(selector);
  let anchor = S.monday(new Date()), events = S.createEvents(anchor);
  let weekOffset = 0, filter = "all", selectedDay = null, heroEvent = null;
  let timer, toastTimer, lastBoundary = "";
  const labels = { going: "JDU", maybe: "MOŽNÁ", unavailable: "NEDÁM" };
  const symbols = { going: "✦", maybe: "?", unavailable: "×" };
  const days = ["Po","Út","St","Čt","Pá","So","Ne"];
  const escape = (text) => String(text).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const format = (value, options) => new Intl.DateTimeFormat("cs-CZ", { timeZone: S.zone, ...options }).format(new Date(value));
  const time = value => format(value, {hour:"2-digit",minute:"2-digit"});
  const date = value => format(value, {day:"numeric",month:"numeric"});
  function announce(message) {
    const toast = $("#toast"); toast.textContent = message; toast.classList.add("visible");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("visible"), 4200);
  }
  function state(event, now = Date.now()) {
    if (event.status === "cancelled") return { text: "Zrušeno", className: "cancelled" };
    if (event.liveUntil > now) return { text: "LIVE · potvrzeno streamerem", className: "live" };
    if (event.end <= now) return { text: "Plánovaný čas uplynul", className: "finished" };
    if (event.start <= now) return { text: "Čekáme na potvrzení", className: "tentative" };
    return event.status === "tentative" ? { text: "Předběžně", className: "tentative" } : { text: "Potvrzeno", className: "" };
  }
  function relativeDate(event) {
    const today = S.dateKey(new Date());
    if (event.date === today) return "Dnes";
    if (event.date === S.addDays(today,1)) return "Zítra";
    return format(event.start,{weekday:"long"});
  }
  function platformMarkup(key) {
    return '<span class="platform-label ' + key + '"><img class="platform-icon ' + key + '" src="assets/' + key + '.svg" alt="" width="' + (key === "kick" ? 36 : 17) + '" height="18">' + (key === "kick" ? '<span class="sr-only">Kick</span>' : S.platforms[key].name) + '</span>';
  }
  const isGenK=event=>event.art==="GENK"||/genk/i.test(event.category||"");
  function gameBranding(event) {
    if(event.theme === "rp" && isGenK(event))return '<div class="game-branding"><img class="game-logo redm-logo" src="assets/redm.svg" alt="RedM" width="198" height="60"><span class="brand-divider"></span><img class="game-logo" src="assets/Genk-RDR-Red-DC.png" alt="genK" width="150" height="70"></div>';
    if(event.theme === "rp")return '<div class="game-branding"><img class="game-logo redm-logo" src="assets/redm.svg" alt="RedM" width="198" height="60"><span class="brand-divider" aria-hidden="true"></span><img class="game-logo westhaven-logo" src="assets/westhaven.png" alt="WestHaven RP" width="100" height="100"></div>';
    if(event.theme === "sim")return '<div class="game-branding sim-branding"><img class="game-logo" src="assets/simrail.png" alt="SimRail — The Railway Simulator" width="640" height="360"></div>';
    if(event.theme === "horror")return '<div class="game-branding dbd-branding"><img class="game-logo" src="assets/dbd.png" alt="Dead by Daylight" width="640" height="360"></div>';
    return '<span class="art-word" aria-hidden="true">' + escape(event.art) + '</span>';
  }
  function renderHero() {
    heroEvent = S.nextEvent(events, Date.now());
    const event = heroEvent;
    const live=!!event && event.status!=='cancelled' && event.liveUntil>Date.now();
    $('.hero').classList.toggle('is-live',live);
    $('#live-invite').hidden=!live;
    if (!event) {
      $("#hero-title").textContent = "Další večer už brzy.";
      $("#hero-description").textContent = "Další stream zatím není vypsaný. Mrkni sem zase později.";
      $("#hero-date").textContent = "Zatím bez plánu";
      $("#viewer-zone").textContent = ""; $("#channel-note").textContent = "Twitch · kubiasofiko";
      $("#hero-game-brands").hidden = true;
      $("#hero-status").hidden = true; $(".countdown-wrap").hidden = true;
      $("#calendar-button").disabled = true;
      $("#watch-link").href = S.platforms.twitch.url;
      $("#watch-link").textContent = "Otevřít Twitch ↗";$("#watch-link").className="button primary";
      return;
    }
    const status = state(event);
    $("#hero-title").innerHTML = escape(event.title.replace(/\.$/,"")) + '<span class="accent">.</span>';
    $("#hero-description").textContent = event.description;
    const brands = $("#hero-game-brands");
    brands.hidden = event.theme !== "rp";
    brands.innerHTML = event.theme === "rp" ? '<img src="assets/redm.svg" alt="RedM" width="88" height="38"><span class="brand-divider" aria-hidden="true"></span><img class="westhaven-logo" src="assets/westhaven.png" alt="WestHaven RP" width="52" height="52"><span>DIVOKÝ ZÁPAD.<br>VLASTNÍ PŘÍBĚH.</span>' : "";
    if(event.theme==='rp'&&isGenK(event)){const logo=brands.querySelector('.westhaven-logo');logo.src='assets/Genk-RDR-Red-DC.png';logo.alt='genK';logo.className='genk-logo';logo.width=90;logo.height=42;}
    $("#hero-status").hidden = false;
    $("#hero-status").className = "badge " + status.className;
    $("#hero-status").textContent = status.text;
    $("#hero-eyebrow").textContent = live ? "PRÁVĚ VYSÍLÁME" : event.start <= Date.now() ? "PLÁNOVANÝ STREAM" : "DALŠÍ STREAM";
    $("#hero-date").innerHTML = '<span>' + escape(relativeDate(event)) + " · " + time(event.start) + '</span><span class="separator" aria-hidden="true">/</span>' + platformMarkup(event.platform);
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    $("#viewer-zone").textContent = localZone !== S.zone
      ? "Praha " + date(event.start) + " · U tebe: " + new Intl.DateTimeFormat("cs-CZ", { dateStyle: "short", timeStyle: "short" }).format(event.start)
      : date(event.start) + " · Europe/Prague";
    $("#watch-link").href = S.platforms[event.platform].url;
    $("#watch-link").className = "button primary " + event.platform + (live ? " live-watch" : "");
    $("#watch-link").innerHTML = '<img class="platform-icon ' + event.platform + '" src="assets/' + event.platform + '.svg" alt="" width="20" height="18">' + (live ? "Pojď do živého chatu" : S.platforms[event.platform].channelConfigured ? "Sledovat na Twitchi" : "Otevřít Kick") + ' <span aria-hidden="true">↗</span>';
    $("#channel-note").textContent = S.platforms[event.platform].channelConfigured ? "Twitch · kubiasofiko" : "Kick · odkaz zatím vede na platformu.";
    $("#calendar-button").disabled = false; $(".countdown-wrap").hidden = false;
    updateCountdown();
  }
  function updateCountdown() {
    if (!heroEvent) return;
    if (heroEvent.liveUntil > Date.now()) {$("#countdown").hidden=true;$("#countdown-label").textContent="PRÁVĚ VYSÍLÁME · POTVRZENO STREAMEREM";$("#countdown-readable").textContent="Vysílání ručně potvrzeno streamerem.";return;}
    const delta = heroEvent.start - Date.now();
    $("#countdown").hidden = delta <= 0;
    $("#countdown-label").textContent = delta <= 0 ? "ČEKÁME NA POTVRZENÍ ZAČÁTKU" : "STARTUJEME ZA";
    if (delta <= 0) {
      $("#countdown-readable").textContent = "Plánovaný začátek byl v " + time(heroEvent.start) + ". Vysílání není ověřené."; return;
    }
    const seconds = Math.floor(delta / 1000), hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60, remain = seconds % 60;
    if (!$("#countdown .digit-num")) $("#countdown").innerHTML = ["HODIN","MINUT","SEKUND"].map(label => '<span class="count-unit"><i class="digit-num">00</i><small>' + label + '</small></span>').join('<b>:</b>');
    [hours, minutes, remain].forEach((n,i) => {
      const digit = document.querySelectorAll("#countdown .digit-num")[i], value = String(n).padStart(2,"0");
      if(digit.textContent !== value) {digit.textContent = value; window.KubiasMotion?.digit(digit);}
    });
    $("#countdown-readable").textContent = "Plánovaný začátek " + format(heroEvent.start,{dateStyle:"full",timeStyle:"short"}) + ", čas v Praze.";
  }
  function reactionMarkup(event) {
    const counts='<p class="shared-counts" data-counts="'+event.id+'">Načítám společné reakce…</p>';
    if (event.status === "cancelled") return counts+'<p class="closed-reactions">Tenhle večer si dáváme pauzu.</p>';
    if (event.start <= Date.now()) return counts+'<p class="closed-reactions">Reakce jsou po plánovaném začátku uzavřené.</p>';
    const choice = window.KubiasReactions?.choice(event.id);
    return '<p class="shared-counts" data-counts="' + event.id + '">Načítám společné reakce…</p><p class="rsvp-label">DORAZÍŠ? <span class="muted">/ TVOJE REAKCE</span></p><div class="reaction-group" role="group" aria-label="Reakce na ' + escape(event.title) + '">' +
      Object.entries(labels).map(([key,label]) => '<button class="reaction-button" data-event="' + event.id + '" data-choice="' + key + '" ' + (!window.KubiasReactions || window.KubiasReactions.busy ? 'disabled ' : '') + 'aria-pressed="' + (choice === key) + '"><span aria-hidden="true">' + symbols[key] + '</span>' + label + '</button>').join("") + '</div><p class="reaction-feedback" aria-live="polite">' + (choice ? 'Tvoje volba: ' + labels[choice] : '') + '</p>';
  }
  function cardMarkup(event, index) {
    const status = state(event), past = event.end <= Date.now();
    return '<article class="stream-card ' + (event.status === "cancelled" ? "is-cancelled" : event.liveUntil>Date.now() ? "is-live" : past ? "is-past" : "") + '" id="stream-' + event.id + '">' +
      '<div class="card-art ' + event.theme + '"><span class="badge ' + status.className + '">' + status.text + '</span>' + gameBranding(event) + '<span class="art-number" aria-hidden="true">K / 0' + (index + 1) + '</span></div>' +
      '<div class="card-body"><div class="card-date"><span>' + escape(format(event.start,{weekday:"long"})) + " " + date(event.start) + '</span><span class="card-time">' + time(event.start) + '</span></div>' +
      '<h3>' + escape(event.title) + '</h3><p class="card-category">' + escape(event.category) + '</p><p class="card-description">' + escape(event.description) + '</p>' +
      (event.change ? '<p class="change-note">' + escape(event.change) + '</p>' : "") +
      '<div class="card-platform-row"><a href="' + S.platforms[event.platform].url + '" target="_blank" rel="noopener noreferrer" aria-label="' + (S.platforms[event.platform].channelConfigured ? 'Sledovat kubiasofiko na Twitchi' : 'Otevřít platformu Kick') + '">' + platformMarkup(event.platform) + '<span class="platform-arrow" aria-hidden="true">↗</span></a>' +
      (event.status !== "cancelled" ? '<button class="calendar-small" data-calendar="' + event.id + '">＋ Do kalendáře</button>' : "") + '</div>' + reactionMarkup(event) + '</div></article>';
  }
  function renderSchedule() {
    const start = S.addDays(anchor, weekOffset * 7), end = S.addDays(start, 7);
    const inWeek = events.filter(e => e.date >= start && e.date < end);
    const filtered = inWeek.filter(e => (filter === "all" || e.platform === filter) && (!selectedDay || e.date === selectedDay));
    $("#week-range").textContent = date(S.pragueTime(start,12)) + " – " + date(S.pragueTime(S.addDays(start,6),12));
    $("#schedule-title").innerHTML = (weekOffset === 0 ? "Tenhle týden" : weekOffset < 0 ? "Minulý týden" : "Příští týden") + ' <span class="accent">společně.</span>';
    $("#prev-week").disabled = weekOffset <= -1; $("#next-week").disabled = weekOffset >= 2;
    if (weekOffset === 2) $("#schedule-title").innerHTML = 'Výhled na <span class="accent">další týden.</span>';
    $("#current-week").disabled = weekOffset === 0 && selectedDay === null;
    $("#timezone-offset").textContent = new Intl.DateTimeFormat("cs-CZ",{timeZone:S.zone,timeZoneName:"shortOffset"}).formatToParts(S.pragueTime(start,12)).find(p=>p.type==="timeZoneName")?.value || "";
    $("#week-days").innerHTML = days.map((label,i) => {
      const key = S.addDays(start,i), hasEvent = inWeek.some(e=>e.date===key && e.status!=="cancelled" && (filter==="all" || e.platform===filter));
      const today = key === S.dateKey(new Date());
      return '<button class="day-button ' + (today?"today ":"") + (selectedDay===key?"active":"") + '" data-day="' + key + '" aria-pressed="' + (selectedDay===key) + '" aria-label="' + escape(format(S.pragueTime(key,12),{weekday:"long",day:"numeric",month:"long"})) + (hasEvent?", naplánovaný stream":", bez streamu") + '"><span class="day-name">' + (today?"Dnes":label) + '</span><span class="day-number">' + Number(key.slice(-2)) + '</span>' + (hasEvent?'<span class="day-marker" aria-hidden="true"></span>':"") + '</button>';
    }).join("");
    $("#clear-day").hidden = !selectedDay;
    const count = filtered.filter(e=>e.status!=="cancelled").length;
    $("#results-summary").textContent = count + (count===1?" stream":count>=2 && count<=4?" streamy":" streamů") + (selectedDay ? " ve vybraném dni" : " v rozpisu") + " · čas v Praze";
    $("#stream-grid").innerHTML = filtered.length ? filtered.map(cardMarkup).join("") :
      '<div class="empty-state"><span class="eyebrow muted">CHVÍLE NA ODDECH</span><h3>Tady zatím není nic v plánu.</h3><p>' + (selectedDay?"Zkus jiný den nebo si prohlédni celý týden.":filter!=="all"?"Na této platformě teď žádný stream není.":"Program pro tento týden ještě není vypsaný.") + '</p><button class="button secondary" data-reset-view>Zobrazit aktuální program</button></div>';
    window.KubiasMotion?.cards();
    watchReactions();
    document.querySelectorAll("[data-filter]").forEach(button=>{
      const active = button.dataset.filter===filter; button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));
    });
  }
  function downloadCalendar(event) {
    if (!event || event.status === "cancelled") return;
    const stamp = ms => new Date(ms).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
    const icalEscape = value => String(value).replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
    const fold = line => {
      const result = []; let current = "", bytes = 0;
      for (const char of line) {
        const size = new TextEncoder().encode(char).length;
        if (bytes + size > 73) {result.push(current);current=" ";bytes=1;}
        current += char; bytes += size;
      }
      result.push(current); return result.join("\r\n");
    };
    const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Kubias//Schedule//CS","CALSCALE:GREGORIAN","BEGIN:VEVENT",
      "UID:" + event.id + "@kubias.schedule","DTSTAMP:"+stamp(Date.now()),"DTSTART:"+stamp(event.start),"DTEND:"+stamp(event.end),
      "SUMMARY:"+icalEscape("Kubias — "+event.title),"DESCRIPTION:"+icalEscape(""+event.description),
      "URL:"+S.platforms[event.platform].url,"STATUS:"+(event.status==="tentative"?"TENTATIVE":"CONFIRMED"),"END:VEVENT","END:VCALENDAR"];
    const url = URL.createObjectURL(new Blob([lines.map(fold).join("\r\n")+"\r\n"],{type:"text/calendar;charset=utf-8"}));
    const a = document.createElement("a"); a.href=url;a.download="kubias-"+event.date+".ics";document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);announce("Událost je připravená pro kalendář.");
  }
  document.addEventListener("click", async event => {
    const reaction = event.target.closest("[data-choice]");
    if (reaction) {
      const stream = events.find(e=>e.id===reaction.dataset.event);
      if (!stream || stream.status==="cancelled" || stream.start<=Date.now()) { renderSchedule(); announce("Reakce na tento stream už jsou uzavřené."); return; }
      try {announce(await window.KubiasReactions.toggle(stream.id,reaction.dataset.choice));window.KubiasMotion?.reaction(reaction);}catch(error){announce(error.message);} 
    }

    const platform = event.target.closest("[data-filter]");
    if (platform) {filter=platform.dataset.filter;renderSchedule();}
    const day = event.target.closest("[data-day]");
    if (day) {selectedDay=selectedDay===day.dataset.day?null:day.dataset.day;renderSchedule();document.querySelector('[data-day="'+day.dataset.day+'"]')?.focus({preventScroll:true});}
    const calendar = event.target.closest("[data-calendar]");
    if (calendar) downloadCalendar(events.find(e=>e.id===calendar.dataset.calendar));
    if (event.target.closest("[data-reset-view]")) {weekOffset=0;filter="all";selectedDay=null;renderSchedule();$("#schedule-title").setAttribute("tabindex","-1");$("#schedule-title").focus();}
    if (event.target.closest("[data-open-info]")) $("#info-dialog").showModal();
  });
  $("#prev-week").addEventListener("click",()=>{weekOffset=Math.max(-1,weekOffset-1);selectedDay=null;renderSchedule();});
  $("#next-week").addEventListener("click",()=>{weekOffset=Math.min(2,weekOffset+1);selectedDay=null;renderSchedule();});
  $("#current-week").addEventListener("click",()=>{weekOffset=0;selectedDay=null;renderSchedule();});
  $("#clear-day").addEventListener("click",()=>{selectedDay=null;renderSchedule();});
  $("#calendar-button").addEventListener("click",()=>downloadCalendar(heroEvent));
  $("#close-info").addEventListener("click",()=>$("#info-dialog").close());
  $("#info-dialog").addEventListener("click", event => { if(event.target===$("#info-dialog")) {const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) event.target.close();} });
  $("#clear-reactions").addEventListener("click",async()=>{
    const button=$("#clear-reactions");button.disabled=true;button.textContent="Odebírám reakce…";
    try{announce(await window.KubiasReactions.clear());}catch(error){announce(error.message);}finally{button.disabled=false;button.textContent="Odebrat moje reakce";}
  });
  function updateReactions(){
    const R=window.KubiasReactions;
    document.querySelectorAll('[data-counts]').forEach(el=>{const t=R?.counts(el.dataset.counts);el.textContent=t ? t.going+' dorazí · '+t.maybe+' možná · '+t.unavailable+' nedorazí' : t===null?'Počty reakcí nejsou dostupné.':'Načítám společné reakce…';});
    document.querySelectorAll('[data-choice]').forEach(b=>{b.disabled=!R||R.busy;b.setAttribute('aria-pressed',String(R?.choice(b.dataset.event)===b.dataset.choice));});
    document.querySelectorAll('.reaction-group').forEach(group=>{const id=group.querySelector('[data-event]')?.dataset.event,choice=R?.choice(id);group.nextElementSibling.textContent=choice?'Tvoje volba: '+labels[choice]:'';});
  }
  function watchReactions(){window.KubiasReactions?.watch([...document.querySelectorAll('[data-counts]')].map(el=>el.dataset.counts));updateReactions();}
  window.addEventListener('kubias-reactions',updateReactions);
  window.addEventListener('kubias-reactions-ready',watchReactions);
  function tick() {
    const now = Date.now(), currentAnchor=S.monday(new Date());
    if(currentAnchor!==anchor){anchor=currentAnchor;weekOffset=0;selectedDay=null;}
    const boundary = S.dateKey(new Date())+"|"+events.map(e=>e.liveUntil>now?"live":e.start>now?"future":e.end>now?"waiting":"past").join();
    if(boundary!==lastBoundary){lastBoundary=boundary;renderHero();renderSchedule();}
    updateCountdown();
  }
  function startClock(){clearInterval(timer);tick();if(!document.hidden)timer=setInterval(tick,1000);}
  document.addEventListener("visibilitychange",()=>{if(document.hidden)clearInterval(timer);else startClock();});
  window.addEventListener("kubias-streams", e => {events=e.detail;lastBoundary="";tick();});
  startClock();
})();
