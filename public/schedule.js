/* Časy programu jsou vždy v Europe/Prague. */
(function () {
  "use strict";
  const zone = "Europe/Prague";
  const parts = (value) => Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(value).filter(p => p.type !== "literal").map(p => [p.type, p.value]));
  function dateKey(value) {
    const p = parts(value); return p.year + "-" + p.month + "-" + p.day;
  }
  function addDays(key, count) {
    const d = new Date(key + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + count);
    return d.toISOString().slice(0, 10);
  }
  function monday(value) {
    const key = dateKey(value), d = new Date(key + "T12:00:00Z");
    return addDays(key, -((d.getUTCDay() + 6) % 7));
  }
  function pragueTime(key, hour, minute = 0) {
    const wall = Date.parse(key + "T" + String(hour).padStart(2,"0") + ":" + String(minute).padStart(2,"0") + ":00Z");
    let guess = wall;
    for (let i = 0; i < 3; i++) {
      const p = parts(new Date(guess));
      const observed = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
      guess += wall - observed;
    }
    return guess;
  }
  const platforms = {
    twitch: { name: "Twitch", url: "https://www.twitch.tv/kubiasofiko", channelConfigured: true },
    kick: { name: "Kick", url: "https://kick.com/", channelConfigured: false }
  };
  const seed = {id:"westhaven-2026-09-28", title:"WestHaven — Ezekiel Crowe", category:"RedM · WestHaven RP", description:"Pokračování příběhu Ezekiela Crowea na WestHaven RP.", platform:"twitch", theme:"rp", art:"ROLEPLAY", status:"confirmed", visibility:"published", start:Date.parse("2026-09-28T16:30:00Z"), end:Date.parse("2026-09-28T20:30:00Z"), liveUntil:0, change:"Konec je orientační."};
  function createEvents() {return [{...seed,date:dateKey(seed.start)}];}
  function nextEvent(events, now) {
    return events.find(e => e.status !== "cancelled" && e.liveUntil > now && e.end > now) || events.find(e => e.status !== "cancelled" && e.end > now) || null;
  }
  window.KubiasSchedule = { zone, dateKey, addDays, monday, pragueTime, platforms, seed, createEvents, nextEvent };
})();
