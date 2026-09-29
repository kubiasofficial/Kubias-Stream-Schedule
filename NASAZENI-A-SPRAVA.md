> Tento návod popisuje původní založení projektu. Pro aktuální verzi, společné reakce a odběr kalendáře pokračuj podle [AKTUALIZACE-1-2-5-7.md](AKTUALIZACE-1-2-5-7.md). Původní tvrzení o čistě lokálních reakcích a Firebase-only hostingu se na novou verzi nevztahují.

# Nasazení a správa KUBIAS

Stav: připravený statický web + Firebase administrace. Cloudové projekty dosud nejsou založené a přihlášení do skutečného účtu ještě není ověřené. Starší FAZE-1 dokument je historický návrh; tento návod popisuje implementovanou verzi.

## 1. Vytvoř bezplatný Firebase projekt

1. Otevři https://console.firebase.google.com/ a přihlas se Google účtem, kterým budeš web spravovat.
2. Vytvoř projekt (např. kubias-program, výsledné Project ID si poznamenej). Nezapínej Analytics. Zůstaň na Spark, nepřipojuj platební kartu a nepřecházej na Blaze.
3. Project settings → General → Your apps → ikona webu `</>` → registruj aplikaci KUBIAS. Hosting v tomto průvodci nemusíš zapínat.
4. Zkopíruj objekt `firebaseConfig` do `public/firebase-config.js` místo `null`. Zachovej `export const firebaseConfig = {...};`. Jde o veřejnou konfiguraci webu, nikoli tajný administrátorský klíč. Nikdy sem nevkládej service account / private key.
5. Build → Firestore Database → Create database → Standard, výchozí databáze `(default)`, region v EU (např. eur3), production mode. Region později nelze jednoduše změnit.
6. Build → Authentication → Get started → Sign-in method → Google → Enable. Vyber support email a ulož. Jiní poskytovatelé ani anonymní přihlášení nejsou potřeba.

Dokumentace: https://firebase.google.com/docs/web/setup a https://firebase.google.com/docs/auth/web/google-signin

## 2. Nahraj databázová pravidla a index

V PowerShellu otevři složku projektu:

```powershell
cd 'C:\Users\PC\Desktop\My studios\Kubias-Stream-Schedule'
firebase.cmd login
firebase.cmd deploy --only firestore --project TVOJE_PROJECT_ID
```

Firebase CLI je na tomto počítači nainstalované. Nahraď TVOJE_PROJECT_ID skutečným ID, bez uvozovek a bez závorek. Příkaz publikuje `firestore.rules` a `firestore.indexes.json`; nikoli web. Počkej, až index v Console → Firestore → Indexes přejde na Enabled. Nepoužívej testovací pravidlo `allow read, write: if true`.

Pravidla dovolují návštěvníkům číst jen publikované termíny. Zápis vyžaduje přihlášený účet s dokumentem `admins/UID` a `enabled: true`. Roli správce nelze přidělit z webu. Souběžné úpravy kontroluje verze dokumentu.

## 3. Nasaď web na nový Vercel

Vercel Hobby je zdarma pro osobní nekomerční použití. Pokud web podporuje monetizované podnikání, neposouvej projekt na placený tarif jen kvůli tomuto návodu; použij bezplatnou alternativu Firebase Hosting níže nebo nejprve ověř vhodnost použití. Podmínky: https://vercel.com/docs/plans/hobby

Nejsnazší nasazení z této složky:

```powershell
npx.cmd vercel login
npx.cmd vercel
```

Při prvním propojení vyber svůj účet, potvrď nový projekt, jméno např. `kubias-program`, adresář `./`, framework **Other**, bez buildu; výstup je **public** podle `vercel.json`. Nevytvářej nový Next.js projekt. Žádné environment variables nepotřebujeme. Vercel má hostovat pouze obsah `public`, ne celý kořen s dokumentací.

Po kontrole preview:

```powershell
npx.cmd vercel --prod
```

Použij přidělenou stabilní produkční adresu, např. `kubias-program.vercel.app` (skutečný název může být jiný). V Firebase → Authentication → Settings → Authorized domains přidej tuto doménu **bez https:// a bez cesty**. Při vlastní doméně přidej i ji. Pro lokální přihlášení přidej `localhost`, pokud ho budeš používat. Každá preview doména potřebuje vlastní autorizaci; jednodušší je admin testovat na stabilní doméně.

Alternativou je import GitHub repozitáře ve Vercel dashboardu: Framework Other, Root Directory kořen projektu, Output Directory public, žádný Build Command. Další změny souborů vyžadují nové nasazení; termíny spravované z webu nikoli.

## 4. Přidej sám sobě roli správce

1. Otevři `https://TVOJE-DOMENA/admin/`.
2. Klikni Přihlásit přes Google a použij svůj účet. Povol přihlašovací popup.
3. Poprvé web správně oznámí, že nemáš roli. Zkopíruj celé UID z řádku pod přihlášením. Stejné UID najdeš v Firebase → Authentication → Users.
4. Firebase → Firestore Database → Data → Start collection: `admins`.
5. Document ID: přesně tvé UID. Pole: `enabled`, typ **boolean**, hodnota **true**. Ulož. Nevkládej zde email místo UID, ani textový řetězec "true".
6. Obnov `/admin/`. Zobrazí se formulář a termíny.
7. Klikni **Importovat WestHaven 28. 9. 2026**. Událost má začátek 18:30 Praha, Twitch kubiasofiko, příběh Ezekiela Crowea a orientační konec 22:30. Import nevytváří duplicity ani nepřepíše již existující záznam.
8. Otevři hlavní stránku v anonymním okně a ověř zveřejněný termín.

Dokud konfigurace není vyplněná, hlavní stránka používá jediný oznámený termín ze souboru. Po připojení Firebase rozhoduje výhradně databáze: pokud je prázdná, program je prázdný. Proto proveď import nebo vytvoř termín ručně. Při chybě databáze se zobrazí chyba a prázdný program, nikoli falešně aktuální náhradní data.

## 5. Každodenní správa přímo z webu

- **Nový termín**: vyplň název, popis, začátek a konec v Praze, hru a stav. Viditelnost Koncept je soukromá; Publikováno zobrazí termín všem. Ulož.
- **Upravit**: mění obsah a čas. Uložení vypne LIVE. Při souběžné úpravě ve druhém panelu web odmítne přepsat novější verzi; otevři termín znovu.
- **Duplikovat do konceptu**: připraví kopii ve formuláři; změň datum a ulož jako nový termín.
- **Posunout o hodinu**: posune začátek i konec a doplní poznámku. Jiný posun proveď přes Upravit.
- **Zrušit stream**: ponechá veřejně viditelnou informaci o zrušení. Pro zrušené vysílání je to vhodnější než smazání.
- **Zapnout LIVE**: zapni až když skutečně vysíláš. Vypne se nejpozději za 8 hodin nebo v plánovaném konci. Pro delší stream nejprve uprav konec. Stav není napojený na Twitch API.
- **Smazat termín**: po potvrzení nevratně odstraní záznam. Pravidelně stahuj JSON zálohu. Automatický import zálohy zatím není součástí administrace.
- **Odhlásit**: zejména na sdíleném počítači. Přihlášení se ukládá jen na dobu relace prohlížeče. Odebráním `admins/UID` v Console odebereš oprávnění bez změny webu.

## 6. Co ověřit po propojení

V anonymním okně není přístup ke správě. Běžný Google účet bez role také nesmí zapisovat. Vytvoř zkušební koncept a ověř, že veřejně není vidět. Publikuj ho, posuň, zruš a nakonec smaž. Zkus LIVE na novém aktuálním termínu a vypni ho. Ověř na mobilu. Stažený ICS kalendář je jednorázová kopie, změny se do něj nedoručují automaticky.

Přihlášení `unauthorized-domain`: přidej správnou doménu v Auth. Chyba oprávnění: ověř přihlášené UID, boolean enabled a publikovaná pravidla. Chybějící program: ověř import, viditelnost Publikováno, dokončený index a správné Project ID. Chyba po vyčerpání bezplatné kvóty: vyčkej na obnovu kvóty, neaktivuj placený tarif automaticky. Limity sleduj v Firebase → Usage: https://firebase.google.com/docs/firestore/quotas

## Bezplatná alternativa: Firebase Hosting

Stejné soubory lze hostovat ve Firebase Spark bez Vercelu. Připravený firebase.json obsahuje hosting i bezpečnostní hlavičky:

```powershell
firebase.cmd deploy --only hosting,firestore --project TVOJE_PROJECT_ID
```

Použij přidělenou adresu PROJECT_ID.web.app a ověř ji v Auth Authorized domains. Stejná administrace i postup UID platí dál. Nepoužíváme Functions, Storage, placené API ani analytiku. Bezplatné služby mají kvóty, nejde o neomezený hosting: https://firebase.google.com/pricing

## Aktuální rozsah

Termíny a admin jsou sdílené přes Firestore. Reakce JDU/MOŽNÁ/NEDÁM jsou jen osobní localStorage, neodesílají se streamerovi a expirují po 30 dnech při další návštěvě. Nejsou zde společné počty ani notifikace. Veřejný dotaz načítá nejvýše 200 nejnovějších publikovaných termínů; staré nepotřebné termíny může správce odstranit. Rozpis nabízí minulý týden a dva následující. Kick nemá dodaný profil, proto administrace nabízí jen skutečný Twitch. Loga a animace včetně jemného světla pod myší zůstávají; omezený pohyb v systému animace vypne.
