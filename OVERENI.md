# Ověření aktualizace — 29. 9. 2026

Prošly všechny níže uvedené testy v lokálním prostředí. Žádný test nezapisoval do produkčního Firebase.

- 19 regresních kontrol oprávnění správce, konceptů, verzí termínů, dat a LIVE v Firestore emulátoru.
- 24 kontrol nových pravidel reakcí: anonymní/nepřihlášený přístup, soukromí jednotlivých voleb, nemožnost měnit cizí hlas, zákaz samostatného přepsání součtu nebo hlasu, přesné změny součtů, třísekundový limit i při smazání a opětovném vložení, zákaz hlasovat po začátku nebo na zrušený/privátní stream, možnost odebrat hlas i po zrušení nebo smazání streamu.
- 4 automatické testy kalendáře: stabilní UID a verze, UTC časy, zrušení, skrytí konceptů, escapování a UTF-8 skládání řádků, dekódování Firestore, GET/HEAD/304/405 a 503 při chybě zdroje bez vydávání prázdného kalendáře za úspěch.
- Kontrola syntaxe všech JS a CJS souborů.
- Edge proti emulátorům Auth a Firestore: dvě nezávislé návštěvnické relace, vznik anonymního účtu až při první reakci, sdílené součty a oddělená vlastní volba, stejné součty v administraci, obnovení volby po reloadu, odebrání jedné i všech vlastních reakcí.
- Předvolby všech tří her, uložení budoucího streamu, filtry Dnes/Budoucí/Koncepty, opakování z 18. 10. na 25. 10. zachovalo čas 19:00 až 23:00 Praha přes změnu letního času.
- Skutečný lokální HTTP ICS endpoint vrátil 200 a text/calendar, obsahoval publikované termíny a neobsahoval koncept.
- LIVE přepnutí v administraci se projevilo na veřejném webu; při expiraci zhaslo zvýraznění a vrátil se běžný stav.
- Vizuální kontrola desktopu 1440 px, mobilu 390 px a dialogu kalendáře; administrace bez horizontálního přetékání také na 320 px. Reduced-motion vypíná LIVE puls i světlo pod kurzorem.
- Lokální server posílal bezpečnostní hlavičky odpovídající Vercelu (pouze s přidanými adresami lokálních emulátorů). V běžných prohlížečových tocích žádné neošetřené chyby aplikace.

Předchozí testovací pokusy při vypnutém emulátoru selhaly kvůli nedostupnému serveru; po spuštění byly zopakovány úspěšně. Jedna příprava testovacího DST záznamu obsahovala nepovolené undefined; opravena a test opakován úspěšně. Nešlo o chybu produkčního formuláře.

Zbývá ověření po nasazení: Anonymous provider, nová pravidla a nové API na skutečném Vercelu, následná synchronizace v konkrétní kalendářové aplikaci. Ta nebyla simulována jako hotová. Produkční Google přihlášení už uživatel ověřil při předchozím nasazení; v této verzi se jeho mechanismus nemění.
