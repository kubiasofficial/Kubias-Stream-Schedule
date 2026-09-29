# Aktualizace: reakce, administrace, kalendář a LIVE

Připraveno 29. 9. 2026. Tato verze přidává pouze schválené body 1, 2, 5 a 7. Změny jsou lokální; produkční web, Firebase pravidla a nastavení přihlášení se samy nezměnily.

## Co přibylo

1. **Společné reakce:** součty JDU / MOŽNÁ / NEDÁM vidí návštěvníci i správce. Anonymní účet se vytvoří až první reakcí. Jedna volba na účet a stream, přepnutí i odebrání mění součet atomicky. Pravidla vynucují minimálně tři sekundy mezi zápisy účtu. Jednotlivé volby nejsou veřejně čitelné. Není to ověření jedinečné fyzické osoby: jiný prohlížeč nebo nový anonymní účet může hlasovat znovu.
2. **Administrace:** české názvy stavů, Dnes / Budoucí / Koncepty / Archiv / Vše, předvolby WestHaven, SimRail a DBD, opakování za týden jako koncept se zachováním pražského času i přes změnu letního času, přehled společných reakcí a upozornění na neuložené úpravy. Dnes obsahuje dnešní a právě probíhající termíny; Budoucí začíná zítřkem. Koncepty mohou být současně ve svém časovém přehledu.
5. **Odběr kalendáře:** stálá adresa `https://kubias-program.vercel.app/api/calendar`. Obsahuje pouze publikované události, UTC časy, stálé UID, verze změn a označení zrušení. Jednorázové tlačítko Do kalendáře zůstává.
7. **LIVE:** živý stream dostává přednost v hlavním panelu, barevné zvýraznění, jemný puls a tlačítko Pojď do živého chatu. Stav dál potvrzuje správce ručně, nejdéle na 8 hodin nebo do konce termínu. Po vypršení se zvýraznění vypne. Systémové omezení pohybu puls vypne.

## Nasazení do existujícího projektu — v tomto pořadí

### 1. Povol anonymní reakce ve Firebase

Ve stejném projektu **kubias-program** otevři **Authentication → Sign-in method → Add new provider → Anonymous → Enable → Save**.

Google ponech zapnutý pro administraci. Anonymous používají pouze návštěvnické reakce a je oddělené od účtu správce. Nepřecházej na placený tarif, nezapínej automatický placený úklid identit ani další služby.

### 2. Aktualizuj pravidla

Firestore → Rules → nahraď celý obsah souborem `firestore.rules` z této aktualizace → **Publish**. Tato verze zachovává pravidla správy streamů a přidává pravidla reakcí. Stávající dokument `admins/TVOJE_UID` a všechny termíny ponech beze změny. Nový index není potřeba.

Alternativně z kořene projektu:

```powershell
firebase.cmd deploy --only firestore:rules --project kubias-program
```

Pravidla jsou zpětně slučitelná se současnou administrací, takže je lze nahrát před webem.

### 3. Nahraj aktualizaci na GitHub

Použij stávající repozitář **kubias-program**, větev **main**. Nevytvářej nový projekt na Vercelu.

V místní složce projektu jsou už soubory aktualizované. Pro ruční nahrání je také připravený ZIP v `_release/KUBIAS-AKTUALIZACE-1-2-5-7.zip`. ZIP nejprve rozbal do prázdné složky. Na GitHub přes Add file → Upload files nahraj **jeho obsah**, ne samotný ZIP a ne nadřazenou složku. Archiv obsahuje soubory změněné touto aktualizací a dokumentaci; ostatní existující soubory v repozitáři zachovej.

V kořeni repozitáře musí být:

```text
api/calendar.js
lib/calendar.js
package.json
vercel.json
firestore.rules
firebase.json
public/...
tests/...
```

Složky `api` a `lib` patří vedle `public`, nikoli dovnitř. Vercel potřebuje API funkci pro kalendář. Žádný service-account klíč ani nové environment variables nejsou potřeba. Veřejná Firebase konfigurace už odpovídá existujícímu projektu.

Změnu potvrď **Commit changes**. Vercel zahájí nasazení automaticky. Ponech **Framework Other**, **Root Directory ./**, **Output Directory public**, bez vlastního Build Command. Po přidání package.json ponech Install Command výchozí; projekt nemá externí npm závislosti. Node 22 nebo novější.

Nenahrávej `_release`, `_backup`, debug logy, `.firebase` nebo `.vercel`. Záloha před aktualizací je uložená zvlášť v `_backup`.

### 4. Ověř ostrý web

Po stavu Ready otevři veřejný web v anonymním okně:

- U budoucího publikovaného termínu klikni JDU. Ve druhém nezávislém prohlížeči musí být stejný součet. V něm zvol MOŽNÁ a porovnej součty se správcem. Pro změnu volby vyčkej tři sekundy.
- Obnovení stránky zachová vlastní volbu. Stejným tlačítkem se odebere. Soukromí a informace → Odebrat moje reakce odstraní všechny volby tohoto anonymního účtu včetně minulých nebo smazaných termínů.
- Přes předvolbu vytvoř koncept a ověř, že veřejně vidět není; zkontroluj filtry a opakování za týden.
- Otevři `/api/calendar`. Musí vrátit nebo stáhnout ICS, ne HTML či 404. Odběr v Google Kalendáři přidej přes Jiné kalendáře → + → Z adresy URL. V Outlooku použij Přihlásit se k odběru z webu. V jiných aplikacích může fungovat tlačítko Otevřít v kalendářové aplikaci.
- LIVE ověř až při skutečném vysílání. Neměň produkční stav jen kvůli screenshotu testu.

Kalendářové aplikace si samy určují interval synchronizace, někdy několik hodin. Server cache může přidat až několik minut. Při změně použij Upravit; pro zrušení použij Zrušit stream a záznam ponech publikovaný, aby odběratelé dostali STATUS:CANCELLED. Trvalé smazání nebo skrytí události ji odstraní ze zdroje, ale chování klientů se může lišit. Kalendář nemá upozorňování přes e-mail nebo push; oznámení lze nastavit v kalendářové aplikaci.

## Data, kvóty a omezení

- Staré lokální reakce se automaticky neposílají na server. Sdílené počty začínají od nuly a návštěvník vybere svou volbu znovu.
- Hlasy jsou v `visitors/{uid}/votes/{streamId}`, součty v `streams/{streamId}/stats/reactions`. `visitors/{uid}` uchovává poslední čas zápisu pro omezení opakování.
- Odebrání reakce fyzicky smaže hlas a sníží součet. Pseudonymní účet a čas posledního zápisu zůstávají. Smazání termínu samo o sobě nemaže související reakce; vlastník je může odebrat i později. Pravidla nedovolují veřejné čtení jednotlivých hlasů.
- Třísekundová prodleva platí na účet, ne na fyzickou osobu. Pro velký provoz nebo cílené zneužívání by bylo potřeba samostatně navrhnout silnější ochranu; tato aktualizace nepřidává placené služby.
- Součty se sledují jen pro právě zobrazené karty; při změně týdne se nepotřebná spojení odpojí. Reakce i odběry spotřebovávají běžné kvóty Firestore, Firebase Auth a Vercelu. Při vyčerpání kvót funkce může dočasně přestat fungovat; žádný automatický upgrade se nenastavuje.
- Kalendář běží jako Node funkce na **Vercelu**, nikoli Firebase Functions. Používá veřejné čtení s Firestore pravidly. Samotný Firebase Hosting Spark API funkci z této verze nespustí — původní alternativní návod Firebase-only se proto na kalendářový odběr nevztahuje.

Dokumentace: [anonymní Firebase Auth](https://firebase.google.com/docs/auth/web/anonymous-auth), [atomické operace a getAfter](https://firebase.google.com/docs/firestore/manage-data/transactions), [Node funkce Vercelu](https://vercel.com/docs/functions/runtimes/node-js).

## Lokální ověření

```powershell
npm.cmd test
firebase.cmd emulators:start --only firestore,auth --project demo-kubias
```

V druhém terminálu:

```powershell
node tests/firestore-rules.cjs
node tests/reactions-rules.js
$env:KUBIAS_EMULATOR='1'
npm.cmd run dev
```

Prohlížeč otevři na http://127.0.0.1:4175. Testovací server přesměruje konfiguraci i API jen na místní demo emulátor, produkční soubory nemění. Bez KUBIAS_EMULATOR používá skutečnou konfiguraci, proto pro testovací zápisy vždy nastav tuto proměnnou. Bezpečnostní testy mažou pouze lokální demo databázi před svým spuštěním, nikoli cloud.
