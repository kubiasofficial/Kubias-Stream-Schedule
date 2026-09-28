# Kubias Stream Schedule — fáze 1: analýza a návrh

Datum: 28. 9. 2026  
Stav: návrh ke schválení, upravený na výhradně bezplatné nástroje a tarify; implementace nebyla zahájena.  
Pracovní složka: C:\Users\PC\Desktop\My studios\Kubias-Stream-Schedule

**Doporučení:** malý web v Astro + TypeScript na Cloudflare Workers, data v D1, jeden správce přes Cloudflare Access Free. Veřejná adresa na bezplatné subdoméně workers.dev. Veřejně výrazná karta dalšího streamu, týdenní seznam a reakce bez účtu. V1 bude mít ručně potvrzovaný LIVE stav; automatické ověřování Twitche může následovat jako první rozšíření.

Tento dokument je textový návrh. Neobsahuje produkční kód, založený aplikační projekt ani instalované závislosti. Číselné limity služeb byly ověřovány proti jejich dokumentaci; před nasazením je nutné znovu zkontrolovat aktuální tarif. Ukázkové hry a časy jsou ilustrace, nikoli skutečný rozpis.

**Závazný rozpočtový požadavek:** vývojové nástroje, knihovny, grafické podklady, hosting, databáze, přihlášení a provoz V1 pouze zdarma. Bez placených tarifů, časově omezených trialů, placených API, zakoupené domény nebo automatického přechodu na účtovanou spotřebu. Při vyčerpání free kvót má přednost dočasné omezení funkcí před vznikem nákladů. Toto pravidlo platí i pro případná rozšíření, dokud uživatel nerozhodne jinak.

## 1. Analýza produktu

Cílem je rychle a důvěryhodně odpovědět „kdy, co a kde“, teprve potom nabídnout interakci. Hlavní metrikou úspěchu není čas strávený na webu, ale to, že návštěvník během 2–3 sekund pochopí další vysílání.

| Uživatel | Potřeba | Návrhový důsledek |
| --- | --- | --- |
| Divák z telefonu / Discordu | Rychlé zjištění času, jeden tap na JDU | Informace nad přehybem, bez přihlášení, bez úvodního modalu |
| Divák z desktopu | Další stream a přehled týdne | Stejná hierarchie, širší rozvržení, žádná kalendářová mřížka |
| Streamer na telefonu | Změnit dnešní plán během půl minuty | Rychlé akce, předvyplněný formulář, bezpečné potvrzení |

**Předpoklady:** jeden správce, české publikum, několik streamů týdně, běžně stovky návštěv denně, občas raid v řádu tisíců. Web může podporovat monetizovanou značku, proto nespoléhám na tarif určený výhradně nekomerčním projektům. Program se zadává v Europe/Prague. Ve V1 má událost jednu hlavní vysílací platformu.

Rizika a slepá místa:

- Odpočet není důkaz vysílání. Falešné LIVE po odbití 19:00 by ničilo důvěru.
- Reakce bez účtu nejsou ověření lidé ani předpověď počtu diváků. Garantujeme jeden hlas na rozpoznaný prohlížeč a událost, ne na člověka.
- Automatická kontrola kanálu nepozná spolehlivě, ke které naplánované události vysílání patří.
- Správce může zapomenout ukončit ruční LIVE; návrh obsahuje omezení jeho platnosti.
- „Volno“ nesmí znamenat jen „ještě jsem nic nezadal“. Použijeme „Zatím bez plánu“.
- Změna programu je důležitější než dekorace. Návštěvník musí vidět původní i nový čas.
- Bez návštěvy webu se divák o změně nedozví. Push, e-mail ani automatické zprávy na Discord nejsou součástí V1.

## 2. Informační architektura

| Cesta | Přístup a obsah |
| --- | --- |
| / | Veřejný rozpis, další/LIVE stream, tento týden, stručné odkazy |
| /?week=YYYY-MM-DD | Stejná stránka pro vybraný týden; parametr vždy pondělí v Praze |
| /#stream-ID | Odkaz na konkrétní kartu; při přesunu zůstává ID stejné |
| /soukromi | Provozovatel, kontakt, cookies, údaje, retence a odebrání vlastních reakcí |
| /admin | Chráněný přehled a rychlé akce; bez odkazu z veřejné části |
| /admin/streams/new | Vytvoření události |
| /admin/streams/ID | Editace, reakce v součtech, historie změn |
| /api/public/schedule | Veřejné publikované údaje a součty; bez identity návštěvníka |
| /api/me/* | Vlastní reakce, token a výmaz; nikdy společně cachované |
| /api/admin/* | Všechny správcovské operace s ověřením oprávnění |

Úvodní navigace: značka KUBIAS a případně jeden malý odkaz na Discord. Sociální sítě patří do patičky; skutečné URL dodá správce. Na mobilu žádné hamburgerové menu pro dvě položky.

Pořadí obsahu: značka → významná změna aktuálního programu → hlavní karta → týden → patička. Oznámení změny nesmí odsunout datum a CTA hluboko dolů; maximálně dva stručné řádky. Rozpis bude zatím na /; při vzniku větší homepage ho lze přesunout na /rozpis s přesměrováním.

Výchozí je tento týden. V1 dovolí předchozí a čtyři následující týdny, s tlačítkem „Tento týden“. Hlavní karta stále ukazuje nejbližší relevantní vysílání bez ohledu na prohlížený týden. Žádné nekonečné listování prázdným kalendářem.

## 3. Mobile-first UX

Základní šířka 360–430 px; ověřit i 320 px a 200% zvětšení textu. Hlavní informace nepotřebuje obrázek ani stažení interaktivního JavaScriptu.

### Veřejná obrazovka

```text
[KUBIAS / drobný havran]           [Discord]

Změna: dnešní začátek 20:00, původně 19:00

DALŠÍ STREAM                 [Potvrzeno]
Komunitní večer
DNES • 20:00                 [Twitch]
28. 9. • čas v Praze
Za 2 hodiny a 14 minut
02 : 14 : 37

[Sledovat na Twitchi — celá šířka]

Dorazíš?                  42 lidí plánuje přijít
[JDU 42]  [MOŽNÁ 8]  [NEDÁM 3]

TENTO TÝDEN          [Předchozí] [Další]
28. 9. – 4. 10.

PO 28. 9.   20:00
Komunitní večer                  [Twitch]
[Změna času]  Původně 19:00
Krátký popisek…
[JDU] [MOŽNÁ] [NEDÁM]

ÚT 29. 9.   Zatím bez plánu

ST 30. 9.   18:00
Simulátorový večer               [Kick]
[Předběžně]
…

kubiasArmy · Twitch · Kick · Soukromí
```

Hero a odpovídající týdenní karta sdílejí stav reakce. Tap v jedné aktualizuje obě. Dvě události v jednom dni jsou dvě karty pod jedním datem, časově seřazené. Překryv časů vyvolá upozornění v adminu, nikoli automatický zákaz.

Na úzkém telefonu se reakce mohou zalomit; žádný vodorovný posuv celé stránky. Doporučená dotyková plocha nejméně 44 × 44 px. CTA odkazuje přímo na HTTPS adresu kanálu, bez vloženého přehrávače a bez závislosti na deep linku aplikace.

### Administrace na telefonu

```text
ROZPIS                            [+ Stream]

DNES • 19:00 • Twitch
Komunitní večer
42 JDU / 8 MOŽNÁ / 3 NEDÁM

[+ 1 hodina] [Zrušit]
[Jsem LIVE]  [Upravit]

DALŠÍ DNY
…

[Odhlásit]
```

„+ 1 hodina“ otevře spodní panel „Dnes 19:00 → dnes 20:00“, druhý tap potvrdí. Zrušení obdobně ukáže název a datum; důvod je volitelný. Tlačítko LIVE uvede platformu a platnost potvrzení.

```text
UPRAVIT STREAM

Název             [Komunitní večer        ]
Datum             [28. 9. 2026            ]
Začátek v Praze   [19:00                  ]
Předpokládaný konec[23:00                  ]
Platforma         [Twitch               v]
Hra / kategorie   [Volný text             ]
Popis             [max. 280 znaků         ]
Stav              [Potvrzeno            v]
Vizuál            [Bez obrázku          v]

Náhled: Pondělí 28. září, 19:00–23:00
[Uložit — přichycené nad spodním okrajem]
```

Chyba u konkrétního pole, fokus na první chybu, rozepsaná data se po síťové chybě neztratí. Uložení se potvrzuje až po odpovědi serveru. Navigace z rozpracovaného formuláře upozorní na neuložené změny.

### Hraniční a chybové stavy

| Situace | Veřejné chování |
| --- | --- |
| Žádná budoucí událost | „Další stream zatím není vypsaný.“ Odkaz na kanál a Discord, bez falešného odpočtu |
| Předběžný stream | Viditelný štítek, „Plánovaný začátek“, reakce jsou povolené |
| Nastal plánovaný čas | „Plánovaný začátek byl v 19:00. Čekáme na potvrzení.“ Nikdy automatické LIVE |
| Potvrzené zpoždění | Poznámka správce nebo nový čas; při novém čase historie změny |
| Přesun | Nový čas a „Původně…“. Na původním dni malá stopa s odkazem na nové místo |
| Zrušení | Karta zůstane viditelná v týdnu s důvodem; hero vybere další stream, oznámení upozorní na zrušení |
| Půlnoc | Přepočítat dnes/zítra i hranici týdne; běžící stream zůstane v hero |
| Stream přes půlnoc | V týdnu zařazen pod den začátku; text „do úterý 01:00“ |
| Dlouhé vysílání | Platné LIVE má přednost před plánovaným koncem |
| Vypršelé ruční LIVE | „Stav vysílání není ověřený“, CTA dál funguje; žádné tvrzení „dokončeno“ |
| API/síť selže | Zachovat poslední známý rozpis s časem aktualizace; neukázat nuly místo neznámých počtů |
| První načtení selže | Srozumitelná chyba, „Zkusit znovu“, statický odkaz na kanál |
| Načítání jiného týdne | Ponechat předchozí obsah, označit načítání; žádné přeskakování výšky |
| Zablokované cookies | Čtení bez omezení; reakce vysvětlí potřebu technické cookie a možnost otevřít běžný prohlížeč |

Odpočet počítá rozdíl cílového timestampu a aktuálního času, neodečítá slepě jednu sekundu z proměnné. Po návratu na kartu se synchronizuje se serverem; běh na pozadí je pozastaven. Serverový čas a stáří cache se zohlední při odhadu časového posunu zařízení. Při velké nejistotě zobrazit pevný čas místo nepřesného odpočtu.

Výchozí časy i hranice týdnů jsou vždy Europe/Prague a označené „Časy v Praze“. Pro jiné pásmo prohlížeče se doplní druhý řádek „U tebe: …“, včetně jiného data, je-li potřeba. Primární rozpis se tím nepřeskupuje a nevzniká jiný týden pro každého diváka.

## 4. Desktop UX

Maximální šířka obsahu přibližně 1120 px. Od cca 960 px lze mít vlevo hero kolem 40 % šířky a vpravo týdenní seznam; při nedostatku místa zůstává jedna kolona. DOM pořadí stále hero → týden, takže klávesnice a čtečky zachovávají smysl.

```text
KUBIAS                                      Discord

[Další stream / LIVE        ]  [Tento týden         < >]
[Název                     ]  [PO 20:00 • název       ]
[Dnes 20:00 • Twitch        ]  [ÚT zatím bez plánu    ]
[Odpočet                   ]  [ST 18:00 • název       ]
[Sledovat]                 ]  […                     ]
[Reakce                    ]  [                      ]
```

Žádná sedmisloupcová tabulka, další dashboardové panely nebo velký banner vytlačující čas. U dlouhého seznamu může hero zůstat mírně přichycené, jen pokud nebrání zoomu a klávesové navigaci.

## 5. Design direction a design system

Identita: temná, klidná, ostrá typografie; fialová zdůrazňuje akce, červená skutečné vysílání nebo zrušení. Gothic charakter tvoří drobný motiv a kompozice, ne špatně čitelné písmo.

### Paleta a kontrast

Poměry níže jsou vypočítané WCAG metodou relativního jasu pro plné barvy bez průhlednosti; ověření hotového UI musí zahrnout i hover, disabled, fotografie a focus.

| Token / použití | Barva | Pozadí / protějšek | Kontrast |
| --- | --- | --- | --- |
| background | #0D0B12 | Základ stránky | — |
| surface | #17141D | Karty | — |
| text-primary | #F4F1F8 | surface | 16,27 : 1 |
| text-secondary | #B9B1C5 | surface | 8,80 : 1 |
| accent / focus | #A78BFA | surface | 6,69 : 1 |
| primary-button | #6D28D9 | Bílý text #FFFFFF | 7,10 : 1 |
| danger / live-text | #FCA5A5 | surface | 9,59 : 1 |
| success-text | #86EFAC | surface | 12,96 : 1 |
| tentative-text | #FCD34D | surface | 12,62 : 1 |
| control-border | #80758C | surface | 4,19 : 1 |
| decorative-border | #302938 | Pouze dekorativní oddělovač | Nepoužívat jako jedinou hranici ovladače |
| dark-red-decoration | #451923 | Jen dekorace, bez významu či textu | — |

Cíl WCAG 2.2 AA: běžný text nejméně 4,5 : 1, velký text 3 : 1, nezbytné netextové indikátory 3 : 1. Barva není jediným nositelem stavu; vždy text a případně ikona. [W3C: kontrast textu](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C: netextový kontrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Typografie: jeden lokálně hostovaný variabilní sans-serif font s českou diakritikou, výchozí kandidát Barlow po kontrole licence a konkrétního řezu. Body 16 px / 1,5; meta 14 px; nadpis hero 28–36 px; hlavní čas 36–48 px, tabulární číslice. KUBIAS může mít širší prostrkání; dlouhé nadpisy se zalamují.

Tokeny: spacing 4/8/12/16/24/32/48 px; radius 8 px ovladače, 16 px karty; mobilní okraj 16 px; focus 2 px s odsazením 3 px. Povrchy oddělit jemným okrajem, ne velkými neonovými stíny.

Pohyb: 120–180 ms pro změnu barvy/opacity, maximálně nepatrný posun; žádný parallax nebo opakující se pulzování. prefers-reduced-motion vypne prostorové animace. Countdown není aria-live každou sekundu; čtečka dostane pevné datum a diskrétní oznámení změny stavu.

Ikony: jedna konzistentní SVG sada a platforma vždy i slovem. Dekorativní SVG skryté před čtečkou. Havran zatím drobná abstraktní silueta / místo rezervované pro budoucí originální SVG; finální asset vznikne jako jednoduché vlastní SVG nebo z bezplatného zdroje s licencí dovolující použití pro značku. Žádná placená zakázka, stock grafika nebo generovací API. Fonty a ikonová sada musí být rovněž bezplatné i pro komerční použití; licence se uloží s projektem. V této fázi žádný asset nevytvářím. Nepřebírat cizí logo bez licence.

Co ne: video pozadí, autoplay, vložený stream/chat, gotické body písmo, RGB duhy, mlha přes text, logo v každé kartě, herní screenshot jako hlavní identita.

## 6. Komponenty

| Komponenta | Odpovědnost a stavy |
| --- | --- |
| BrandHeader / Footer | Značka, ověřené sociální odkazy, soukromí |
| NextStreamCard | Nadcházející / předběžný / čeká na potvrzení / LIVE / neověřený / prázdný |
| Countdown | Výpočet času, pozastavení na pozadí, pevný čas jako fallback |
| PlatformLink | Bezpečný URL cíl, platforma textem, primární a menší varianta |
| StatusBadge | Potvrzeno, předběžně, zrušeno, LIVE, ukončeno, stav neověřen |
| ChangeNotice | Původní → nový čas/platforma, datum změny, případný důvod |
| WeekNavigator / DayGroup | Rozsah dat, zpět/další/dnes; streamovací i prázdný den |
| StreamCard | Metadata, popis, obrázek z katalogu nebo bez obrázku, reakce |
| ReactionGroup | Nevybráno / vybráno / ukládá se / chyba / limit / uzavřeno |
| DataFreshness | Poslední aktualizace, offline a opakování načtení |
| AdminStreamList / QuickActions | Mobilní správa, posun, zrušení, LIVE a konec |
| StreamForm | Validace, náhled data, konflikt verze, odesílání a chyba |
| ConfirmSheet | Shrnutí přesunu, zrušení a odstranění; fokus a Escape |
| ReactionSummary / ChangeHistory | Jen agregované počty a editace programu; žádné IP ani seznam diváků |

Komponenty nejsou nezávislé SPA aplikace. Sdílená logika času, stavu a reakcí je na jednom místě. Server stanovuje platnost operací, klient pouze prezentuje a rychle reaguje.

## 7. Datový model

D1 / SQLite, cizí klíče a kontrolní omezení. Níže je pseudo-schématický návrh, nikoli migrační kód. ID jsou náhodné UUID, časy UTC epoch v milisekundách, text je prostý text.

### Tabulky V1

**channels**

- id: UUID, primární klíč.
- platform_key: string, např. twitch / kick; display_name: string.
- channel_url: HTTPS URL; provider_channel_id: nullable string.
- enabled: boolean; created_at, updated_at: timestamp.
- URL se validuje podle povolených domén. Jeden kanál lze sdílet více událostmi; použitý kanál nelze smazat, pouze deaktivovat.
- Přidání kanálu existující platformy jde přes jednoduché nastavení adminu. Nový typ platformy může využít obecnou textovou ikonu, ale bezpečný seznam domén a případný LIVE adaptér vyžadují malou technickou změnu.

**streams**

- id: UUID, PK; title: string 1–100 znaků.
- category: nullable string, max. 80; description: nullable string, max. 280.
- starts_at, planned_ends_at: timestamp; time_zone: IANA string, default Europe/Prague.
- channel_id: FK channels; image_key: nullable klíč schváleného lokálního katalogu.
- publication: draft | published; plan_status: tentative | confirmed | cancelled.
- actual_started_at, actual_ended_at: nullable timestamp.
- live_confirmed_until: nullable timestamp; status_note: nullable krátký text.
- schedule_revision: integer; version: integer pro souběžné editace.
- created_at, updated_at, deleted_at: timestamps, poslední nullable.
- CHECK: plánovaný konec po začátku; skutečný konec po skutečném začátku; povolené enum hodnoty. Výchozí délka 4 hodiny, v adminu upravitelná.

**stream_changes**

- id: UUID, PK; stream_id: FK; changed_at: timestamp; admin_subject: string.
- change_type: created | edited | rescheduled | platform_changed | cancelled | restored | deleted | live_started | live_ended.
- before_public, after_public: malé JSON snapshoty relevantních polí, nikoli celé libovolné requesty.
- public_note: nullable string; is_public: boolean.
- Historie podstatných změn se zapisuje atomicky s událostí. Původní slot po přesunu se odvozuje z historie, nevytváří další stream.

**reactions**

- stream_id: FK; voter_key: event-specific HMAC ze serverem vydané identity.
- choice: going | maybe | unavailable.
- schedule_revision: integer, verze při poslední volbě.
- created_at, updated_at, expires_at: timestamp.
- Složený PK (stream_id, voter_key): jediná aktivní reakce na rozpoznanou identitu a stream.
- Odebrání = smazání řádku; opakované odebrání je úspěšné a nic dalšího neodečítá.

**reaction_totals**

- stream_id: PK/FK; going_count, maybe_count, unavailable_count: nezáporná integer.
- updated_at: timestamp.
- Malá odvozená tabulka ušetří opakované skenování hlasů. Změny totals zajistí databázové triggery při INSERT/UPDATE/DELETE reactions v téže transakci.
- Opakovaný PUT stejné volby nezvýší počet. Archivace reakcí nejprve uloží výsledné součty do události / archivního záznamu; teprve pak maže identity. Archivní součty se již nepočítají z vymazané tabulky.

**admin_users**

- subject: PK, stabilní identifikátor ověřené identity; enabled: boolean; created_at.
- V1 jeden povolený účet. Žádná registrace, hesla, role editor/moderátor ani správa týmu v UI.

**abuse_buckets**

- bucket_key: PK, pseudonymní klíč síťové skupiny + časové okno.
- issued_count: integer; expires_at: timestamp.
- Slouží jen k přísnějšímu hodinovému limitu vydávání nových anonymních tokenů. Atomický podmíněný zápis; žádné surové IP ani vazba na konkrétní reakci.

**Archivní součty:** ve streams doplnit archived_going_count, archived_maybe_count, archived_unavailable_count jako nullable integer a reactions_archived_at. Nevytvářet obecný analytický sklad.

### Indexy a integrita

- streams(publication, deleted_at, starts_at) pro rozpis a nejbližší událost.
- stream_changes(stream_id, changed_at), a index podle changed_at pro oznámení změn.
- reactions PK zajistí deduplikaci; expires_at pro denní úklid.
- abuse_buckets(expires_at) pro úklid.
- FK neumožní osiřelé reakce; mazání událostí je běžně soft delete.
- Zápis reakce zkontroluje v atomickém kroku publikaci, nezrušení a otevřené RSVP, aby souběžné zrušení/začátek nepřijaly nepovolený hlas.
- Editace adminu používá očekávanou version; konflikt vrátí 409 a nabídne nové načtení, nikoli přepsání novější změny.

### Stavy a přechody

„Přesunuto“ je historie/štítek, protože stream může být zároveň přesunutý a potvrzený. „LIVE“ je stav vysílání oddělený od potvrzení plánu.

```text
draft → published(tentative ↔ confirmed)
published → cancelled
cancelled → tentative/confirmed pouze výslovným obnovením

čeká na začátek → čeká na potvrzení (odvozeno časem)
published + ruční start → LIVE do live_confirmed_until
LIVE + ruční konec → dokončeno
vypršel důkaz LIVE → neověřeno, nikoli automaticky dokončeno
```

Po plánovaném konci bez důkazu vysílání se karta přesune do minulých položek jako „Plánovaný čas uplynul“. To není tvrzení, že stream proběhl. Dokončeno vyžaduje skutečný zaznamenaný konec. Zrušení běžícího vysílání admin řeší akcí „Ukončit stream“; zrušené události nemají aktivní LIVE potvrzení.

RSVP je otevřené pro zveřejněný nezrušený stream do začátku; při explicitním posunutí času se znovu otevře. Po přesunu i změně platformy se zachová ID a reakce; UI upozorní „Program se změnil, svou reakci můžeš upravit“. Nejde o potvrzené rezervace.

### Časy, retence a rozšíření

Lokální datum/čas z adminu se převádí do UTC v Europe/Prague. Neexistující čas při jarním posunu se odmítne, dvojznačný podzimní čas vyžaduje volbu offsetu. Nikdy pevné UTC+1. Rozsah týdne je pondělí 00:00 až další pondělí 00:00 v Praze, tedy ne vždy přesně 168 hodin.

Program a jeho veřejné změny uchovat 12 měsíců; poté nabídnout export a odstranit při pravidelném úklidu. Soft-deleted streamy držet 30 dní pro obnovu. Reakční identity smazat 7 dní po skutečném konci, nebo po plánovaném konci/zrušení, pokud skutečný konec není známý. Počty bez identity mohou zůstat 12 měsíců. Bezpečnostní buckety maximálně 48 hodin, aplikační provozní logy cílově 7 dní; poskytovatelské logy řeší zvláštní retenční politika.

Hlasování o programu nyní nemá žádné tabulky ani prázdná pole. Později přibudou polls, poll_options a poll_votes s unikátností (poll_id, voter_key). Použije se stejný vydavatel identity a ochrana zápisů, ale jiný HMAC namespace; reakce a hlasování se nesměšují.

## 8. Technická architektura

### Doporučená varianta a alternativy

**Astro + TypeScript + Cloudflare Workers Free + D1 Free + Cloudflare Access Free.** Astro vrátí rychlé HTML, drobné klientské moduly obslouží countdown, reakce a admin. D1 je pro desítky událostí a jednoduché vztahy přehlednější než dokumentový model. Hosting, databáze i ochrana adminu jsou u jednoho poskytovatele. Nevýhoda: závislost na Cloudflare bindings a prvotní nastavení Access; standardní SQL a oddělená aplikační logika usnadní případný přesun. Nasazení Astro na Cloudflare podporuje oficiální adaptér. [Astro: Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/).

**Vercel + Firebase:** technicky použitelná alternativa, zejména pokud už ji správce zná. Firestore Standard má bezplatnou kvótu 50 000 čtení a 20 000 zápisů dokumentů denně; realtime posluchače mohou zvýšit spotřebu. Vercel Hobby je pro osobní nekomerční použití, Pro začíná na 20 USD měsíčně; monetizovaný streamer by měl způsobilost Hobby výslovně ověřit. Proto tuto kombinaci nevolím jako výchozí nízkonákladové řešení. [Firebase: ceny](https://firebase.google.com/pricing), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel: ceny](https://vercel.com/pricing).

**Supabase:** SQL a integrované přihlašování jsou dobré pro větší komunitní aplikaci. Pro jediného admina a jednoduchý rozpis nepřidává dost hodnoty oproti jednomu poskytovateli; do V1 ho nezahrnujeme a případná změna musí splnit stejný požadavek výhradně bezplatného provozu.

### Hranice klient/server a cache

```text
Prohlížeč → HTML / veřejný JSON → krátká sdílená cache → Worker → D1
Prohlížeč → vlastní reakce      → Worker, validace a limity → D1
Správce   → Cloudflare Access  → ověření JWT + admin_users → D1
```

Veřejná stránka je serverově renderovaná, takže čas a název vidí i návštěvník bez JS. Žádný Firebase SDK, React runtime ani trvalé spojení jen kvůli několika tlačítkům.

- Veřejný program: sdílená cache 15 sekund; počty reakcí až 30 sekund. Cache klíče normalizované na povolené týdny, žádný libovolný cache-busting parametr.
- Klient obnovuje viditelnou stránku po 60 sekundách s malým náhodným rozptylem, na pozadí ne. Automatické obnovování je omezené na 10 minut bez interakce; potom se zobrazí čas poslední aktualizace a tlačítko „Obnovit rozpis“. V neaktivním režimu se nesmí zobrazovat staré LIVE jako ověřené. Tap na obnovení nebo návrat na kartu znovu ověří stav; opakované rychlé přepínání se sloučí do nejvýše jednoho požadavku za 15 sekund. Po chybě exponenciálně zpomalit. Countdown běží lokálně a sám nevolá server.
- Během aktivního automatického obnovování se běžná změna programu projeví do přibližně 75 sekund plus síť; počty ostatních do 90 sekund. Po jeho pozastavení nebo při vyčerpání kvóty tato prodleva neplatí; návštěvník vidí stáří dat a možnost obnovy. Vlastní zápis vrací aktuální volbu a součet hned. Klient krátce nepřepisuje novější vlastní výsledek starší cachovanou odpovědí.
- Admin po zápisu dostane čerstvá data bez cache. Lokální invalidace je optimalizace, nikoli příslib okamžitého globálního promazání.
- /api/me/*, /api/admin/* a všechny odpovědi s tokeny jsou private, no-store. Veřejný cache obsah nesmí obsahovat Set-Cookie ani konkrétní vlastní reakci.
- Cache API Cloudflare je lokální pro datacentrum; neřeší globální zámek a zásahy do něj nelze zaměňovat za celosvětové promazání. Přístup přes Access omezit jen na admin cesty, veřejné cesty neschovávat za něj. [Cloudflare: chování cache](https://developers.cloudflare.com/workers/reference/how-the-cache-works/).
- Při chybě D1 lze krátce vrátit uložený snapshot s upozorněním a stářím; po vypršení cache nebo vyčerpání Worker kvóty nemusí fungovat ani tento fallback. Statická chybová stránka a odkaz na kanál zůstávají provozní záloha, nikoli garantovaná plná dostupnost.

### Náklady a špičky

| Položka | Aktuální podklad / návrh |
| --- | --- |
| Workers Free | 100 000 dynamických požadavků denně; CPU limit 10 ms na běh |
| Statické soubory | Obsloužené přímo jako assets jsou bezplatné; SSR a API jsou dynamické |
| D1 Free | 5 mil. čtených řádků/den, 100 000 zapsaných řádků/den, 5 GB celkem |
| D1 Free na databázi | Max. 500 MB; pro tento web dostatečné |
| Access Free | Bezplatné přihlášení jediného správce; při nastavení ověřit, že je aktivní výhradně Free |
| Adresa webu | Bezplatná adresa <worker>.<account>.workers.dev; vlastní doména se nekupuje |
| Vývoj a nasazení | Lokální bezplatné nástroje, Git a Wrangler; žádná nutná placená CI služba |
| Grafika a fonty | Vlastní SVG / bezplatně licencované podklady; žádné předplatné |
| Monitoring a zálohy | Vestavěné free přehledy a export na stávající lokální úložiště správce |

[Workers: ceny a limity](https://developers.cloudflare.com/workers/platform/pricing/), [D1: ceny](https://developers.cloudflare.com/d1/platform/pricing/), [D1: technické limity](https://developers.cloudflare.com/d1/platform/limits/), [Cloudflare Access: tarify](https://www.cloudflare.com/plans/zero-trust-services/).

Rozpočet na nástroje a infrastrukturu V1 je 0 Kč. Placená rezerva se ruší; žádné placené plány ani placené doplňky neaktivovat. Free CPU limit je potřeba změřit i při ověřování přihlášení; pokud se nevejdeme, optimalizovat nebo přehodnotit bezplatnou variantu, nikoli automaticky přejít na placenou. Bezplatnost je podmíněná platnými podmínkami poskytovatele, ne slib jejich neměnnosti.

V1 poběží na adrese typu kubias-rozpis.<account>.workers.dev; konkrétní dostupný název se zvolí při nasazení. Nákup domény není potřeba. Použít hostname/path ochranu Access pouze pro admin a jeho API; globální ochrana celého veřejného Workeru by zbytečně vyžadovala přihlášení diváků. [Cloudflare: workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/), [Cloudflare: Access pro Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/).

Modelový raid: 5 000 návštěvníků, každý HTML + čtyři obnovení = přibližně 25 000 dynamických požadavků. Při 20 % reagujících přibližně dalších 3 000 pro vydání cookie, ověření a zápis; personalizované načítání a opakování jsou navíc. Databázi chrání cache, ale volání Workeru se u běžného Cache API stále počítá. Neomezený minutový polling pro 5 000 lidí po dobu hodiny by udělal 300 000 volání. Proto se v tomto návrhu po 10 minutách bez interakce zastaví: nejvýše přibližně 50 000 automatických obnov za tento úsek plus úvodní načtení a další operace. Ani tato úspora nezaručuje zvládnutí každého raidu v denní kvótě.

Reakce stojí více než jeden DB zápis kvůli indexům a součtům. Před spuštěním měřit skutečné rows_read/rows_written; tabulku neprocházet celou pro každou kartu. Překročení Free limitů může znamenat nedostupné dotazy, nikoli automaticky bezplatné škálování. Workers Paid není v rozsahu a nebude aktivován. [D1: účtování a překročení](https://developers.cloudflare.com/d1/platform/pricing/).

Ochrana bezplatného provozu: konzervativní rate limiting, omezené automatické obnovování, limity těla a rozsahu dotazů, CPU strop, vestavěný přehled spotřeby a přepínač vypnutí reakcí. Před velkým raidem lze obnovování zpomalit a reakce dočasně vypnout. Po vyčerpání Free kvóty mohou selhat i načítání rozpisu a admin; na již otevřené stránce zůstane poslední známý obsah s upozorněním. Nedostupnost nepřepíná tarif. Denní Worker kvóta se obnovuje o půlnoci UTC; zaplněnou databázi je naopak nutné promazat podle retence. Žádná garance dostupnosti za všech okolností. [Cloudflare: Workers limity](https://developers.cloudflare.com/workers/platform/limits/).

### Struktura, provoz a ověřování

Navrhovaná struktura budoucího repozitáře:

```text
src/pages/               veřejné routy, admin, API
src/components/          veřejné a admin komponenty
src/lib/domain/          čas, stavy, pravidla reakcí
src/lib/server/          DB, autorizace, tokeny, validace
src/styles/              tokeny a základní styly
public/                  lokální fonty a schválené obrázky
migrations/              verzované SQL migrace
tests/                   doménové, integrační a E2E testy
docs/                    provozní postup a rozhodnutí
```

Jeden repozitář a jedna aplikace, žádný monorepo, kontejnerový cluster ani vlastní CMS. Sestavení a testy lokálně bez licenčních poplatků, nasazení přes bezplatný Wrangler z počítače správce; placené CI minuty nejsou podmínkou. Grafické úpravy lze udělat bezplatným SVG editorem, testy bezplatnými open-source nástroji. Dev lokálně s Wrangler a lokální D1, oddělená testovací DB pro preview; nikdy produkční přihlašovací bypass v internetovém prostředí. Produkce samostatná DB a secrets, migrace před přepnutím kompatibilní verze, rollback aplikace a samostatný postup obnovy DB. Preview chráněné a noindex.

Secrets do šifrovaného úložiště poskytovatele, lokálně ignorovaný soubor; dokumentace obsahuje jen názvy proměnných. Tokeny API, HMAC klíče a deployment token nikdy do klientského bundlu ani logů.

Zálohy: D1 Time Travel poskytuje 7 dní obnovy na Free. Navíc týdenní export samotného programu a nastavení bez reakcí na stávající lokální soukromé úložiště správce bez předplatného, retence čtyři kopie; před rizikovou migrací úplná chráněná záloha s omezenou retencí. Obnovu jednou vyzkoušet. Cíl obnovy do jednoho dne, nikoli placené SLA. [D1: limity obnovy](https://developers.cloudflare.com/d1/platform/limits/).

Logy: request ID, typ operace, HTTP status, latence a technický kód chyby; ne těla reakcí, cookies, IP nebo tajné údaje. Sledovat 5xx, 429, spotřebu DB/Worker a selhání úklidu. Bez návštěvnických trackerů. Dodavatelské bezpečnostní logy mohou mít jinou retenci než naše aplikační logy; musí být uvedené v privacy informaci.

Testy úměrné riziku: jednotkové pro výběr hero, stavy, půlnoc a DST; integrační pro autorizaci, unikátní reakce, atomické součty a souběh; několik E2E cest pro mobilní admin a reakce. Ruční ověření klávesnice, čtečky, kontrastu, pomalé sítě a skutečných in-app prohlížečů. Bez rozsáhlých snapshot testů čistě dekorativních komponent.

## 9. Anonymní reakce

### Identita a zápis

Veřejně jde o reakci bez účtu; právně je bezpečnější mluvit o pseudonymním mechanismu. Náhodný identifikátor neobsahuje jméno, ale stále umožňuje rozpoznání prohlížeče.

1. Při běžném čtení aplikace nevydává identifikační cookie.
2. První tap na reakci vyžádá serverový token: kryptograficky náhodné ID alespoň 128 bitů, expirace a HMAC podpis. Server ho nastaví jako __Host-rsvp s Secure, HttpOnly, SameSite=Lax, Path=/, bez Domain.
3. Klient navazujícím požadavkem ověří, že prohlížeč cookie skutečně vrátil. Teprve potom odešle hlas. Pokud cookie není dostupná, nevydává při každém tapu nové identity.
4. Cookie má 30 dní; při aktivním používání se může prodloužit se stejným ID. Expiraci kontroluje i server. Hodnota se neukládá do localStorage.
5. Pro stream se odvodí voter_key = HMAC(server_secret, namespace + stream_id + random_id). DB neuchovává samotný cookie token ani společné návštěvnické ID.
6. PUT pošle požadovanou volbu; server ověří token, Origin, data a stav streamu. Unique klíč zajistí jediný záznam. DELETE reakci odstraní.
7. Při změně a odebrání se součty mění atomicky s řádkem. Síťový retry PUT stejné volby nezaloží druhý hlas.

Více současných tapů na zařízení se serializuje po události; starší odpověď nepřepíše pozdější úmysl. Při timeoutu může být zápis již hotový: stav označit jako neověřený, načíst vlastní reakci a poté případně zopakovat idempotentní požadavek.

### Základní ochrana

- Platný podepsaný token nelze vyrobit jen volbou libovolného UUID.
- Návrhové počáteční limity: 10 změn/minutu/token, 60 zápisů/minutu/síťová skupina, nejvýše 10 nových tokenů/hodinu/síťová skupina. Čísla jsou naše výchozí konfigurace, nikoli limity dodavatele.
- Síťový klíč je HMAC tajným denním klíčem z důvěryhodně předané IP; u IPv6 agregace na /64. Žádný prostý hash IP s veřejnou solí a žádný fingerprint.
- Minutové limity přes Worker Rate Limiting binding, hodinové vydávání přes malý atomický D1 bucket. Při selhání ochrany zápis odmítnout, nikoli obejít.
- Binding je přibližný a lokální podle Cloudflare lokace, není globální účetní garance. Hodinový DB limit ztíží hromadné obnovování cookies; distribuované proxy nevyřeší. [Cloudflare: Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
- Při limitu 429 + Retry-After a srozumitelná zpráva. Sdílená školní, domácí nebo mobilní IP může omezit legitimní lidi; omezuje se zápis, nikoli čtení.
- CAPTCHA/Turnstile se v běžné V1 nenačítá. Přidat jen při prokázaném zneužívání; nejprve zkontrolovat dopad na soukromí a in-app prohlížeče.

To nebrání motivovanému člověku s více zařízeními, IP nebo prohlížeči. Pro orientační RSVP je tento kompromis přijatelný; pro soutěž o cenu nebo závazné hlasování by nebyl.

### Soukromí a cookie banner

Aplikace ukládá jen podepsanou technickou cookie, event-specific klíč, volbu a časy. Bez e-mailu, jména, veřejného seznamu účastníků, reklamních cookies a embedded přehrávačů. Vlastní reakce se načítají soukromým endpointem; sdílené odpovědi obsahují pouze agregáty.

Smazáním cookies nebo přechodem do jiného in-app prohlížeče vznikne nová identita. Původní reakce může zůstat a nelze ji bezpečně přiřadit zpět. To otevřeně popsat v Soukromí; nedělat fingerprint ani obnovu identity přes IP. In-app prohlížeč může cookie zahodit dřív než za 30 dní.

Retence: cookie 30 dní, individuální reakce do 7 dní po ukončení/plánovaném konci či zrušení, bezpečnostní buckety nejvýše 48 hodin. „Smazat moje reakce“ odvodí klíče pro uchovávané události, odstraní nalezené záznamy i cookie; po ztrátě tokenu nelze spolehlivě určit, které patřily konkrétnímu člověku. Výmaz se musí zohlednit i při případné obnově zálohy.

**Výchozí návrh bez celoplošné cookie lišty je podmíněný:** cookie vzniká až při výslovně vyžádané reakci a slouží jejímu uchování a změně. ÚOOÚ uvádí, že pro čistě technické nezbytné cookies není cookie lišta nutná, informační povinnost však zůstává. Nelze z toho automaticky dovodit, že každá 30denní RSVP cookie je nezbytná. [ÚOOÚ: cookies](https://uoou.gov.cz/verejnost/qa-otazky-a-odpovedi/cookies).

Nejsem právník. Před spuštěním právně ověřit nezbytnost a délku RSVP cookie, právní základ pseudonymního zpracování a oprávněný zájem na ochraně proti zneužití. Pokud nezbytnost neobstojí, nabídnout úzký dobrovolný souhlas přímo při první reakci; odmítnutí nesmí omezit čtení rozpisu. Vynechání analytiky samo o sobě nestačí k právnímu závěru.

Stránka Soukromí uvede skutečného provozovatele, kontakt, účely, právní základy, poskytovatele, dobu uchování, práva a kontakt na ÚOOÚ. Umístění DB v Evropě samo nezaručuje výhradně evropské zpracování; posoudit smlouvy a mezinárodní přenosy poskytovatele.

### Optimistic UI

Po tapu se tlačítko ihned vybere a počet orientačně upraví, doplní se „Ukládám…“. Až odpověď potvrdí uložení, hláška zmizí. Při jednoznačném odmítnutí se UI vrátí k potvrzenému stavu a nabídne opakování; při timeoutu nejdřív ověří stav. Offline kliknutí se netváří jako uložené a neodesílá se skrytě po hodinách. Opětovný tap na vlastní vybranou reakci ji odebere.

## 10. Admin autentizace a autorizace

**Doporučení:** jeden účet přes Cloudflare Access a existujícího poskytovatele identity, výchozí Google účet s aktivní passkey nebo 2FA. Výhoda je žádné vlastní heslo, resetovací formulář ani databáze hesel. Cena za to: prvotní nastavení Access, závislost na poskytovateli a pro přihlášení z telefonu někdy nutnost otevřít systémový prohlížeč.

- Access chrání /admin i všechny /api/admin/* cesty. Přesné root cesty a podcesty otestovat, nespoléhat na nepřesný wildcard.
- Worker nezávisle validuje podpis Access JWT, issuer, audience a expiraci; samotná přítomnost hlavičky není důkaz.
- Z ověřeného subject načte enabled admin_users. Serverové funkce zapisující program vždy vyžadují ověřený admin kontext.
- D1 není veřejně přístupná klientům; žádný veřejný DB klíč ani anonymní přímý zápis. Autorizace žije v serverové datové vrstvě, protože zde nepočítáme s PostgreSQL RLS.
- Produkční workers.dev adresa je v tomto návrhu hlavní a její admin cesty musí chránit Access. Další hostname a preview nesmí ochranu obejít; buď je zakázat, nebo stejně chránit. Chybějící JWT znamená odmítnutí.
- Ověřování JWT musí zahrnout správnou aplikaci, nikoli libovolný token z jiné Access aplikace. [Cloudflare: validace Access JWT](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).

Session výchozí 8 hodin, po expiraci nové ověření. Odhlášení ukončí Access session; při kompromitaci deaktivovat admin_users a odvolat sessions u poskytovatele. Záložní kódy a druhý přihlašovací prostředek uloží správce bezpečně mimo aplikaci. Žádná veřejná nouzová URL obcházející přihlášení.

Brute force řeší poskytovatel identity, Access politika a omezení požadavků. Samotný allowlist e-mailu nevynucuje 2FA: správce musí mít 2FA/passkey skutečně zapnuté; při rozšíření týmu vyžadovat tuto úroveň přes podporovanou IdP politiku.

Mutace mají CSRF token a kontrolu Origin / Fetch Metadata, nejsou dostupné přes GET. Ověření identity neřeší CSRF samo. Všechny vstupy mají serverové délkové a typové limity.

Mobilní pravidla:

- Posun a zrušení na dva tapy včetně jasného shrnutí; ukládání nelze potvrdit dvakrát.
- Trvalé odstranění není běžná cesta. V1 „Odstranit“ skryje událost do 30denního koše; zveřejněný stream je obvykle lepší zrušit, aby diváci viděli změnu.
- Duplikace patří do V1: zkopíruje obsah, nastaví nové datum a draft, ale nikdy reakce, historii ani LIVE.
- Opakující se šablony a automatické generování událostí až V2.
- Formulář ukáže den v týdnu, celý datum a pásmo. Čas v minulosti, mimo obvyklé večerní hodiny, přes půlnoc, přes 24 hodin délky nebo více než 90 dní dopředu vyžaduje vědomé potvrzení.
- Neplatný kalendářní čas se odmítne. Překryv s jiným streamem jen varuje, protože může být záměrný.
- U změny platformy je v potvrzení původní i nová platforma a cíl tlačítka.

## 11. Twitch / Kick / LIVE logika

### Doporučení pro V1

**Ruční potvrzení LIVE v adminu, bez závislosti na externím API.** Jedno kliknutí na „Jsem LIVE na Twitchi“ změní hero, „Ukončit“ zapíše konec. Je to nejmenší řešení, které funguje pro obě platformy stejně. Nevýhoda je povinnost dvou krátkých úkonů; pokud se ukáže, že na ně správce zapomíná, automatizace je první kandidát na V1.1.

Ruční potvrzení platí nejvýše 8 hodin; lze jej obnovit. Po vypršení se změní na neověřený stav. Dlouhý stream nepřestane být LIVE jen proto, že překročil planned_ends_at. Pro maraton musí správce potvrzení prodloužit. U ručního stavu může detail uvádět „Potvrzeno streamerem v 19:04“.

### Výběr hlavní karty

1. Platné LIVE potvrzení publikované nezrušené události.
2. Pokud LIVE není: událost, jejíž plánované vysílání právě spadá do časového okna, s textem „Čekáme na potvrzení“.
3. Jinak nejbližší budoucí publikovaná nezrušená událost; předběžná zůstává viditelně předběžná.
4. Pokud žádná není: prázdný stav.

V1 povoluje jen jednu aktivní LIVE událost; spuštění druhé vyžádá ukončení původní. Při více právě plánovaných událostech vybere hero tu s nejbližším začátkem vůči aktuálnímu času, druhá zůstává v seznamu. Staré nepotvrzené vysílání po plánovaném konci neblokuje budoucí kartu.

### Porovnání možností

| Způsob | Přínos | Nevýhoda / rozhodnutí |
| --- | --- | --- |
| Odvození z času | Bez klíčů a obsluhy | Neříká, zda běží přenos; použít jen pro „čekáme“ |
| Ruční start/konec | Stejné chování pro všechny platformy | Správce musí kliknout; doporučeno V1 |
| Twitch Helix polling | Automatická kontrola veřejného kanálu | Tokeny, plánovač, chyby a přiřazení k události; V1.1 |
| Twitch EventSub | Události start/konec bez častého dotazování | Webhook podpisy, opakování, výpadky a obnova subscriptions; V2 |
| Kick API / události | Oficiální možnost automatizace | Ověřit konkrétní oprávnění a kontrakt endpointu; V2 podle používání Kicku |

Twitch Get Streams přijímá app access token nebo user access token. Pro veřejnou kontrolu vlastního kanálu doporučuji serverový app token a filtr konkrétního broadcaster ID. Tajný klíč, token i jeho obnova zůstávají na serveru. [Twitch: Get Streams](https://dev.twitch.tv/docs/api/reference/#get-streams).

Případná V1.1: jeden serverový běh každou minutu kolem naplánovaného vysílání a po celou dobu zjištěného LIVE; mimo tato okna méně často. Výsledek sdílí všichni návštěvníci. Ne jeden dotaz na Twitch za každého diváka. Dva po sobě jdoucí úspěšné offline výsledky mohou potvrdit konec dříve pozorovaného streamu; timeout nebo 5xx nikoli.

Twitch používá bodové limity a vrací Ratelimit-Limit, Remaining a Reset; při 429 respektovat reset a použít backoff. Nezakódovat navždy jedno číslo kvóty. [Twitch: rate limits](https://dev.twitch.tv/docs/api/guide/#twitch-rate-limits).

**Kick má oficiální API i událost livestream.status.updated.** Aktuální dokumentace livestreamů odkazuje na /public/v2/livestreams. Není správné předpokládat, že existuje jen neoficiální scraping nebo navždy platí stará cesta v1. Z dokumentace samotné nelze odvodit spolehlivost v reálném provozu ani slíbit SLA; před integrací ověřit token/scopes, aktuální OpenAPI a chování 429. [Kick: livestreams](https://github.com/KickEngineering/KickDevDocs/blob/main/apis/livestreams.md), [Kick: události](https://github.com/KickEngineering/KickDevDocs/blob/main/events/event-types.md).

U budoucích webhooků ověřit podpis nad původním tělem, timestamp a ochranu před replay, deduplikovat ID událostí a mít záložní polling. To není práce pro V1.

### Přiřazení a konflikty

Budoucí automatika oddělí channel_presence od streamu: channel_id, live/offline/unknown, checked_at, source a případné provider_stream_id. LIVE kanálu se přiřadí jen k jediné časově odpovídající události; při nejednoznačnosti zobrazí „Kubias je LIVE“ bez tvrzení, že běží konkrétní plánovaná hra, a admin přiřazení opraví.

Výpadek API → poslední výsledek krátce se stářím, po cca 3 minutách unknown. Unknown neznamená offline ani dokončeno. Ruční oprava s omezenou platností má přednost před automatikou.

Změna Twitch → Kick je ve V1 změna channel_id stejné události, s historií a přepnutím CTA. Pokud událost byla LIVE, zneplatní se potvrzení pro starý kanál a správce potvrdí nový. V budoucnu se nesmí přenést cached Twitch LIVE na Kick.

Skutečný multistream V1 neumí plně reprezentovat: správce zvolí primární platformu a druhou může uvést v popisu; veřejné hlavní CTA je jen jedno. V2 přidá stream_channels s příznakem is_primary, samostatné stavy kanálů a dvě tlačítka. Nevytvářet dvě stejné události s rozdělenými RSVP kvůli jednomu multistreamu.

## 12. Definice MVP / V1

**Součástí:** český veřejný rozpis, hero a countdown, aktuální / předchozí / čtyři další týdny, více streamů denně, všechny navržené plánovací a ruční vysílací stavy, historie významných změn, Twitch/Kick CTA, anonymní RSVP ve třech volbách s odstraněním a veřejnými počty, mobilní admin, duplikace, koš, privacy stránka, základní ochrany, provozní dokumentace.

Volitelný obrázek je výběr ze schváleného lokálního katalogu; hra může mít jen textovou ikonu. Upload, objektové úložiště a editor obrázků nejsou součástí V1.

### Kritéria „hotovo“

1. Na telefonu jsou další čas, název a platforma pochopitelné během 2–3 sekund při krátkém uživatelském ověření; čas/CTA se neztratí pod dekorací.
2. Změna programu se zadá z telefonu bez kódu a redeploy; veřejný rozpis ji za normálního provozu a aktivního obnovování zobrazí do 75 sekund. Po 10 minutách nečinnosti správně přejde na ruční obnovu a označí stáří dat.
3. JDU → MOŽNÁ znamená součty −1/+1, opakovaný požadavek nepřidá hlas a odebrání funguje. Totéž při souběhu požadavků.
4. Neověřený návštěvník nezmění program ani přímým voláním API, alternativním hostname nebo podvrženou hlavičkou.
5. Časový limit nikdy sám nerozsvítí LIVE; vypršení ručního potvrzení netvrdí dokončení.
6. Funguje přesun mezi týdny, zrušení, změna platformy, půlnoc, přechody letního času, dlouhé LIVE a prázdný program.
7. Po síťové chybě je zřejmé, zda byla reakce či editace uložena; systém nevydává neověřený výsledek za úspěch.
8. In-app prohlížeče Twitch/Discord na skutečném Androidu a iOS umožní čtení; reakce buď funguje, nebo vysvětlí konkrétní omezení cookie.
9. WCAG 2.2 AA v relevantních částech, klávesnice, čitelné focus stavy, reduced motion, bez vodorovného přetékání při 320 px.
10. Výkonnostní cíl: LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms při vhodném měření; před spuštěním laboratorní mobilní kontrola, po spuštění reprezentativní provozní ověření. Počáteční veřejný JS rozpočet cílově do 40 kB gzip, bez povinného Reactu.
11. Testovací raid ověří limity i chování 429/503; změřená spotřeba odpovídá Free tarifu. Všechny používané nástroje a podklady mají bezplatné oprávnění k danému použití, žádná povinná služba není trial ani placená. Free není slib neomezené dostupnosti.
12. Existuje ověřený export/obnova, plán retence, postup při ztrátě admin účtu a při napadení; všechny skutečné odkazy a privacy údaje jsou doplněné.

Bez přístupu k reálnému zařízení se bod 8 nesmí označit za splněný jen na základě emulace. Automatizovaný audit sám nedokládá úplnou přístupnost.

## 13. V2 a dále

| Rozšíření | Co připravit už nyní | Co nyní nedělat |
| --- | --- | --- |
| Automatické LIVE | Oddělit plán od vysílacího stavu, kanál od události | EventSub infrastrukturu a provider tabulky |
| Komunitní hlasování | Stabilní stream ID, znovupoužitelná pseudonymní identita | Prázdné poll tabulky a univerzální hlasovací engine |
| Multistream | Samostatná tabulka channels | Souběžné CTA a složité párování |
| Větší web Kubias | Sdílené tokeny, přehledné routy a komponenty | Klipy, profily, členskou sekci, CMS |
| Opakování programu | Duplikace jedné události | RRULE editor a generátor sérií |
| Statistiky reakcí | Aktuální a konečné součty | Historii každého kliknutí a analytický dashboard |
| Kalendář / upozornění | Stabilní ID a UTC | ICS, push, e-maily a Discord bota |
| Vlastní obrázky | image_key | Upload a moderaci médií |
| Více adminů | Serverové subject a audit změn | Role a správu týmu v UI |

Toto jsou možnosti, nikoli příslib implementace. Přidávat až podle skutečného používání webu.

## 14. Bezpečnostní a privacy rizika

| Hrozba | Opatření | Zbývající omezení |
| --- | --- | --- |
| Mnoho hlasů od jednoho člověka | Podepsaná identita, unique klíč, limit vydávání a zápisů | Více zařízení / proxy obejde personální deduplikaci |
| Dvojklik a opakování požadavku | Idempotentní PUT/DELETE, transakce a triggery | Při výpadku potřebuje UI ověřit stav |
| Brute force / převzetí admina | Access, passkey/2FA, allowlist subject, revokace | Zabezpečení účtu a recovery prostředků správce |
| Obejití skryté URL | Kontrola JWT a role při každé serverové mutaci | Neodkazovaná cesta je jen UX rozhodnutí |
| CSRF | Origin, CSRF token u admina, SameSite, žádné GET mutace | Nutnost otestovat skutečné cross-site požadavky |
| XSS v názvu či popisu | Pouze prostý text, escapování, CSP, žádné raw HTML | Budoucí rich text by vyžadoval nový návrh |
| SQL injection | Parametrizované dotazy, omezené enum/typy/délky | Bezpečnost závisí i na každém novém endpointu |
| Nebezpečná URL / SSRF | Allowlist HTTPS domén, žádné serverové fetch libovolných obrázků | Nová platforma vyžaduje kontrolu pravidel |
| Únik secretů | Serverové secrets, minimální oprávnění, redakce logů | Po úniku nutná rotace a revokace |
| Únik reakcí z cache | Jen agregované veřejné odpovědi, me/admin no-store | Prověřit i chybové odpovědi a hlavičky |
| Útok na náklady | Limity, cache, krátké dotazy, vypnutí reakcí, monitoring | DDoS ochrana není záruka nulové faktury |
| Ztráta programu | Time Travel, export, ověřená obnova | Free poskytuje omezené období obnovy |
| Přehnaná identifikace | Bez fingerprintu, krátká retence síťových HMAC | Pseudonymizace není totéž co anonymizace |
| Nechtěné sledování | Bez reklam, embedů a analytických SDK | Hosting zpracovává provozní metadata |

Další minimum: HTTPS, HSTS po ověření domény, CSP s frame-ancestors 'none', vhodná Referrer-Policy, bezpečná serializace serverových dat, limity velikosti requestu a pravidelné aktualizace závislostí. Není potřeba vlastní bezpečnostní framework nebo komplexní systém rolí.

## 15. Zbytečné komplikace

- Vynechat realtime databázové subscribery a WebSockety: vteřinově přesné počty nejsou produktová potřeba.
- Neinstalovat velký klientský framework kvůli odpočtu a třem tlačítkům.
- Nevytvářet účty diváků, profily, komentáře ani chat.
- Hlasování o programu odložit celé; nejlevnější migrace je několik nových tabulek, ne dnešní abstraktní engine.
- Ruční LIVE V1 místo dvou OAuth integrací a webhook infrastruktury.
- Nevyrábět automatické opakování, lokalizaci do dalších jazyků ani přepínání tématu.
- Nepřidávat CAPTCHA každému návštěvníkovi a neurčovat identitu fingerprintem.
- Žádné grafy historie hlasů, složitý image pipeline nebo úplný CMS.
- Neřešit definitivní havraní logo před ověřením použitelnosti rozpisu.

Součty reakcí, audit významných změn, serverová autorizace a obnova dat mezi zbytečné komplikace nepatří: řeší přímo funkční a bezpečnostní požadavky.

## 16. Kde se odchyluji od původní představy

| Původní představa | Doporučení a důvod |
| --- | --- |
| Vercel + Firebase | Cloudflare + Astro + D1: nižší očekávané minimum nákladů a jednoduché SQL vazby; kompromisem je jiné prostředí |
| Přesunuto jako stav | Historie + štítek: může současně platit potvrzeno nebo LIVE |
| Dokončeno z času | Oddělit „plánovaný čas uplynul“ od skutečně ukončeného vysílání |
| Automatické LIVE hned | Ruční start/konec pro obě platformy, automatizace po ověření potřeby |
| Jedna reakce na člověka bez účtu | Jedna reakce na rozpoznaný prohlížeč; otevřeně přiznaný limit |
| Možná připravit poll model | Jen znovupoužitelná identita a stabilní ID, žádné poll tabulky |
| Vše živě | Odpočet lokálně, program/počty krátce cachované a obnovované |
| Obrázek pro každý stream | Volitelný katalog nebo žádný obrázek, značka nestojí na hře |
| Více platforem současně | V1 jedna primární na událost; plný multistream až po výslovné prioritizaci |

Nejvýznamnější kompromis je ruční LIVE. Pokud je pro tebe nepřijatelné před a po streamu kliknout v adminu, má smysl automatický Twitch přidat už do V1; dokumentovaný základ ho neblokuje.

## 17. Doporučené MVP a pořadí implementace

Výsledkem má být jeden rychlý rozpis značky KUBIAS, ve kterém dominuje další stream. Přesuny jsou viditelné, reakce nepotřebují účet a všechny běžné změny zvládne správce na telefonu. Rozpočet zůstává 0 Kč za nástroje a infrastrukturu. Počítáme s konkrétními free limity a případným dočasným omezením funkcí, bez placeného navýšení.

**Následující kroky jsou pouze plán po schválení této fáze.**

| Krok | Práce | Ověřitelné dokončení |
| --- | --- | --- |
| 1 | Upřesnit doménu, kanály, správce a volbu stacku | Zapsané rozhodnutí, skutečné URL a rozsah V1 |
| 2 | Založit malý projekt, dev prostředí a statický mobilní návrh | Stránka funguje na 320/390 px i desktopu; žádné produkční napojení |
| 3 | Zavést model, migrace a pravidla času/stavů | Testy DST, přesunů, hero a přechodů procházejí |
| 4 | Zprovoznit Access a serverovou autorizaci | Neautorizované přímé API volání i alternativní hostname odmítnuty |
| 5 | Mobilní CRUD, duplikace, koš a historie | Správce vytvoří, posune a zruší stream z telefonu |
| 6 | Veřejný rozpis, cache, countdown a chybové stavy | Změna se zobrazí ve stanoveném intervalu, správně funguje pozadí/půlnoc |
| 7 | RSVP, limity, optimistic UI a výmaz | Změna/odebrání/souběh/timeout nevytváří dvojí hlas |
| 8 | Ruční LIVE a změna platformy | Start, konec, vypršení a přesun platformy mají správné CTA i stavy |
| 9 | Přístupnost, výkon, reálné mobilní prohlížeče a zátěž | Splněné kontrolovatelné body kapitoly 12, známé limity zapsané |
| 10 | Privacy údaje, zálohy, obnova a provozní návod | Ověřená obnova a účetní/bezpečnostní nastavení |
| 11 | Finální kontrola na chráněném preview a produkční nasazení | Schválený obsah, funkční doména a smoke test veřejné i admin cesty |

Každý krok zanechá malý ověřitelný výsledek. Není třeba budovat všechny budoucí funkce, než vznikne první použitelný rozpis.

## 18. Otevřené otázky

Tyto informace neblokují dokončení návrhu, ale potřebujeme je před příslušným implementačním nebo publikačním krokem.

| Rozhodnutí / údaj od tebe | Doporučený default | Kdy potřeba |
| --- | --- | --- |
| Název bezplatné adresy webu | kubias-rozpis.<account>.workers.dev podle dostupnosti; rozpis na / | Při nasazení, neblokuje vývoj |
| Přesné kanály Twitch/Kick a Discord invite | Twitch hlavní; Kick lze volit u události; nehádat handle podle názvů značky | Před napojením skutečných CTA |
| Přihlašovací účet správce | Jeden Google účet s passkey/2FA, bez posílání hesla či recovery kódů do chatu | Před nastavením Access |
| Přijatelnost ručního LIVE | V1 ručně; pokud dva úkony zatěžují provoz, přidat Twitch automatiku do V1 | Při schválení rozsahu |
| Skutečný multistream při spuštění | Jedna primární platforma; pokud má být dvojí CTA hned, upravit rozsah V1 | Při schválení rozsahu |
| Identifikace provozovatele a kontaktní e-mail | Jen údaje nutné pro informační povinnost; dodáš skutečné | Před zveřejněním |

Rozpočet už není otevřená otázka: uživatel stanovil pouze bezplatné nástroje a provoz. Ostatní rozhodnutí beru jako návrhové defaulty, ne jako další dotazník: čeština a přátelské tykání; tři reakce včetně odebrání; orientační počty na prohlížeč; bez analytiky; 30denní technická cookie s právním ověřením; originální havran až později. Schválení návrhu potvrdí tyto defaulty, pokud neurčíš změnu.

---

**Konec fáze 1.** Byla vytvořena pouze složka a tento návrhový dokument. Žádná aplikace, scaffolding, závislosti ani produkční kód. Podle přiloženého zadání nyní následují tvoje úpravy nebo výslovné „schvaluji / pokračuj“; teprve poté může začít implementace.
